import { TaskExecutionAgent } from './task-execution.agent';
import { updateCRM, migrateFile, runScript, transformData } from './task-execution.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"action":"completed","result":"ok"}',
      model: 'claude-sonnet', inputTokens: 50, outputTokens: 30, totalTokens: 80,
      stopReason: 'end_turn', latencyMs: 300,
    }),
  },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(), unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-exec-1', title: 'Exec Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'ops-manager', correlationId: 'corr-1', ...overrides,
  };
}

describe('TaskExecutionAgent', () => {
  let agent: TaskExecutionAgent;

  beforeEach(() => {
    agent = new TaskExecutionAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Task Execution Agent');
    expect(agent.level).toBe(1);
    expect(agent.capabilities).toContain('crm');
    expect(agent.capabilities).toContain('script-execution');
  });

  it('initializes and subscribes to TaskAssigned', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('TaskAssigned', expect.any(Function), agent.id);
  });

  it('executes CRM tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'crm', entity: 'contact', entityId: 'c-123', fields: { name: 'John' } },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('action', 'crm_update');
  });

  it('executes file migration tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'file', source: '/data/old.csv', destination: '/data/new.csv' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('action', 'file_migration');
  });

  it('executes script tasks and publishes ScriptExecuted', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'script', scriptPath: '/scripts/cleanup.py', args: ['--dry-run'] },
    }));
    expect(result.success).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith('ScriptExecuted', agent.id, expect.objectContaining({ scriptPath: '/scripts/cleanup.py' }));
  });

  it('executes data transform tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'data', input: { a: 1 }, format: 'json' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('action', 'data_transform');
  });

  it('handles general tasks via LLM', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'general' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('action', 'general_execution');
  });
});

describe('Task Execution Tools', () => {
  it('updateCRM returns success', async () => {
    const result = await updateCRM('contact', 'c-1', { name: 'Test' });
    expect(result.success).toBe(true);
    expect(result.updatedFields).toContain('name');
  });

  it('migrateFile returns success', async () => {
    const result = await migrateFile('/src', '/dst');
    expect(result.success).toBe(true);
  });

  it('runScript returns exit code 0', async () => {
    const result = await runScript('/test.sh');
    expect(result.exitCode).toBe(0);
  });

  it('transformData returns processed records', async () => {
    const result = await transformData({ a: 1 }, 'json');
    expect(result.recordsProcessed).toBe(1);
  });
});
