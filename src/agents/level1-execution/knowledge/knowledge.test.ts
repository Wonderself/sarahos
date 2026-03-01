import { KnowledgeAgent } from './knowledge.agent';
import { vectorSearch, getContext, indexDocument } from './knowledge.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: 'refined search query', model: 'claude-sonnet',
      inputTokens: 30, outputTokens: 10, totalTokens: 40, stopReason: 'end_turn', latencyMs: 200,
    }),
  },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(), unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

jest.mock('../../../core/memory/memory-manager', () => ({
  memoryManager: {
    store: jest.fn().mockResolvedValue({ id: 'doc-1', content: 'test', metadata: {}, source: 'test', createdAt: '' }),
    search: jest.fn().mockResolvedValue([
      { entry: { id: 'e1', content: 'Test result', source: 'test', metadata: {}, createdAt: '' }, score: 0.85, distance: 0.15 },
    ]),
    getBySource: jest.fn().mockReturnValue([
      { id: 'e1', content: 'History entry', source: 'entity:123', createdAt: '2026-01-01', agentId: 'knowledge-agent', metadata: {} },
    ]),
    get: jest.fn(),
    cleanup: jest.fn(),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-k-1', title: 'Knowledge Task', description: 'Test knowledge', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('KnowledgeAgent', () => {
  let agent: KnowledgeAgent;

  beforeEach(() => {
    agent = new KnowledgeAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Knowledge Agent');
    expect(agent.level).toBe(1);
    expect(agent.capabilities).toContain('vector-search');
  });

  it('initializes and subscribes to ContextRequest', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('ContextRequest', expect.any(Function), agent.id);
  });

  it('executes search tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'search', query: 'customer preferences' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('totalFound');
  });

  it('executes context tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'context', topic: 'onboarding flow' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('context');
  });

  it('executes history tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'history', entityId: 'entity:123' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('entries');
  });

  it('executes index tasks and publishes DataIngested', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'index', content: 'New policy document', source: 'hr', metadata: { type: 'policy' } },
    }));
    expect(result.success).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith('DataIngested', agent.id, expect.objectContaining({ source: 'hr' }));
  });
});

describe('Knowledge Tools', () => {
  it('vectorSearch returns results', async () => {
    const result = await vectorSearch('test query');
    expect(result.totalFound).toBeGreaterThan(0);
    expect(result.results[0]?.score).toBeGreaterThan(0);
  });

  it('getContext returns assembled context', async () => {
    const result = await getContext('topic');
    expect(result.context).toBeDefined();
    expect(result.sources.length).toBeGreaterThan(0);
  });

  it('indexDocument stores and returns id', async () => {
    const result = await indexDocument('Content', { key: 'val' }, 'test');
    expect(result.success).toBe(true);
    expect(result.documentId).toBeDefined();
  });
});
