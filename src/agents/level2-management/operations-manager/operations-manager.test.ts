import { OperationsManager } from './operations-manager.agent';
import { decomposeTask, allocateResources, generateOperationReport, assessEscalation } from './operations-manager.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        subtasks: [
          { title: 'Generate blog post', targetAgent: 'content-agent', priority: 'HIGH', payload: { taskType: 'generate' } },
          { title: 'Post to LinkedIn', targetAgent: 'social-media-agent', priority: 'MEDIUM', payload: { taskType: 'post' } },
        ],
      }),
      model: 'claude-sonnet', inputTokens: 200, outputTokens: 150, totalTokens: 350,
      stopReason: 'end_turn', latencyMs: 800,
    }),
  },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(), unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

jest.mock('../../../core/agent-registry/agent-registry', () => ({
  agentRegistry: {
    discover: jest.fn().mockReturnValue([
      { id: 'content-agent', name: 'Content Agent', level: 1, status: 'IDLE', capabilities: ['copywriting'] },
      { id: 'social-media-agent', name: 'Social Media Agent', level: 1, status: 'IDLE', capabilities: ['post-linkedin'] },
    ]),
    healthCheckAll: jest.fn().mockResolvedValue(new Map([
      ['content-agent', { agentId: 'content-agent', healthy: true, status: 'IDLE', uptime: 1000, lastActivity: null, details: {} }],
    ])),
    getCount: jest.fn().mockReturnValue(7),
  },
}));

jest.mock('../../../core/orchestrator/task-scheduler', () => ({
  taskScheduler: {
    enqueue: jest.fn(),
  },
}));

jest.mock('../../../core/human-override/human-override', () => ({
  humanOverride: {
    requestApproval: jest.fn().mockResolvedValue({ id: 'appr-1', status: 'PENDING' }),
  },
}));

jest.mock('../../../core/memory/memory-manager', () => ({
  memoryManager: {
    store: jest.fn().mockResolvedValue({ id: 'mem-1', content: '', metadata: {}, source: '', createdAt: '' }),
    search: jest.fn().mockResolvedValue([]),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-ops-1', title: 'Ops Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('OperationsManager', () => {
  let agent: OperationsManager;

  beforeEach(() => {
    agent = new OperationsManager();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Operations Manager');
    expect(agent.level).toBe(2);
    expect(agent.modelTier).toBe('standard');
    expect(agent.capabilities).toContain('task-decomposition');
    expect(agent.capabilities).toContain('escalation-handling');
  });

  it('subscribes to 5 event types', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('TaskCompleted', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('TaskFailed', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ThresholdBreached', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('EscalationToHuman', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('HealthReport', expect.any(Function), agent.id);
  });

  it('decomposes tasks and enqueues subtasks', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    const { taskScheduler } = jest.requireMock('../../../core/orchestrator/task-scheduler') as { taskScheduler: { enqueue: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'decompose', description: 'Launch a marketing campaign for SARAH OS' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('subtaskCount', 2);
    expect(taskScheduler.enqueue).toHaveBeenCalledTimes(2);
    expect(eventBus.publish).toHaveBeenCalledWith('TaskDecomposed', agent.id, expect.objectContaining({ subtaskCount: 2 }));
    expect(eventBus.publish).toHaveBeenCalledWith('SubtasksAssigned', agent.id, expect.any(Object));
  });

  it('generates operation reports', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'report', period: 'today' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('summary');
    expect(result.output).toHaveProperty('agentHealth');
    expect(eventBus.publish).toHaveBeenCalledWith('OperationReport', agent.id, expect.any(Object));
  });

  it('handles escalations and requests human approval for critical', async () => {
    const { humanOverride } = jest.requireMock('../../../core/human-override/human-override') as { humanOverride: { requestApproval: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'escalation', event: 'Container crash', source: 'monitoring-agent', severity: 'critical' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('requiresHuman', true);
    expect(humanOverride.requestApproval).toHaveBeenCalledWith(
      'INFRASTRUCTURE',
      expect.stringContaining('Escalation'),
      expect.any(String),
      agent.id,
      expect.any(Object),
    );
  });

  it('allocates resources using agent registry', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'allocate', taskIds: ['t1', 't2'] },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('assignments');
    expect(result.output).toHaveProperty('totalAgentsAvailable');
  });

  it('shuts down and unsubscribes from all events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('TaskCompleted', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('TaskFailed', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ThresholdBreached', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('EscalationToHuman', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('HealthReport', agent.id);
  });
});

describe('Operations Manager Tools', () => {
  it('decomposeTask returns stub result', () => {
    const result = decomposeTask('Complex task');
    expect(result).toHaveProperty('subtasks');
    expect(result).toHaveProperty('totalEstimatedMs');
  });

  it('allocateResources assigns tasks to agents', () => {
    const result = allocateResources(['t1', 't2'], ['a1', 'a2']);
    expect(result.assignments).toHaveLength(2);
    expect(result.assignments[0]).toHaveProperty('taskId', 't1');
  });

  it('generateOperationReport returns report structure', () => {
    const result = generateOperationReport();
    expect(result).toHaveProperty('tasksCompleted');
    expect(result).toHaveProperty('healthStatus');
  });

  it('assessEscalation returns severity assessment', () => {
    const result = assessEscalation('Container down');
    expect(result).toHaveProperty('severity');
    expect(result).toHaveProperty('requiresHuman');
  });
});
