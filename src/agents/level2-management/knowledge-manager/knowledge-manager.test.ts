import { KnowledgeManager } from './knowledge-manager.agent';
import { auditKnowledgeBase, analyzeGaps, assessFreshness, planIndexing, deduplicateEntries } from './knowledge-manager.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"audit":{"coverageScore":75,"qualityScore":80},"gaps":[],"recommendations":["Index more documentation"]}',
      model: 'claude-sonnet', inputTokens: 160, outputTokens: 100, totalTokens: 260,
      stopReason: 'end_turn', latencyMs: 650,
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
    store: jest.fn().mockResolvedValue({ id: 'mem-1', content: '', metadata: {}, source: '', createdAt: '' }),
    search: jest.fn().mockResolvedValue([
      { entry: { id: 'e1', content: 'KnowledgeNotFound: query="AI agent architecture"', source: 'Knowledge Manager', metadata: { type: 'knowledge_gap' }, createdAt: '' }, score: 0.8, distance: 0.2 },
      { entry: { id: 'e2', content: 'KnowledgeNotFound: query="deployment pipeline"', source: 'Knowledge Manager', metadata: { type: 'knowledge_gap' }, createdAt: '' }, score: 0.7, distance: 0.3 },
    ]),
    getCount: jest.fn().mockReturnValue(42),
    getBySource: jest.fn().mockReturnValue([]),
    cleanup: jest.fn().mockReturnValue(0),
  },
}));

jest.mock('../../../core/orchestrator/task-scheduler', () => ({
  taskScheduler: {
    enqueue: jest.fn(),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-km-1', title: 'Knowledge Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('KnowledgeManager', () => {
  let agent: KnowledgeManager;

  beforeEach(() => {
    agent = new KnowledgeManager();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Knowledge Manager');
    expect(agent.level).toBe(2);
    expect(agent.modelTier).toBe('standard');
    expect(agent.capabilities).toContain('knowledge-audit');
    expect(agent.capabilities).toContain('gap-analysis');
    expect(agent.capabilities).toContain('indexing-strategy');
  });

  it('subscribes to 4 event types', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('DataIngested', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('KnowledgeNotFound', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ContextRetrieved', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ContentGenerated', expect.any(Function), agent.id);
  });

  it('runs full audit and publishes KnowledgeAuditComplete', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'audit' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('totalEntries');
    expect(result.output).toHaveProperty('coverageScore');
    expect(result.output).toHaveProperty('qualityScore');
    expect(eventBus.publish).toHaveBeenCalledWith('KnowledgeAuditComplete', agent.id, expect.any(Object));
  });

  it('performs gap analysis and enqueues indexing tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'gap-analysis' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('queriesAnalyzed');
    expect(result.output).toHaveProperty('gaps');
    expect(result.output).toHaveProperty('llmAnalysis');
  });

  it('checks freshness of knowledge entries', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'freshness-check' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('freshnessScore');
    expect(result.output).toHaveProperty('fresh');
    expect(result.output).toHaveProperty('stale');
  });

  it('creates indexing strategy with LLM recommendations', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'indexing-strategy', contentSources: ['blog_posts', 'documentation'], targetEntries: 5000 },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('strategy');
    expect(result.output).toHaveProperty('llmRecommendations');
    expect(result.output).toHaveProperty('currentEntries', 42);
  });

  it('performs deduplication', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'deduplicate' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('uniqueCount');
    expect(result.output).toHaveProperty('savingsPercent');
  });

  it('shuts down and unsubscribes from all events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('DataIngested', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('KnowledgeNotFound', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ContextRetrieved', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ContentGenerated', agent.id);
  });
});

describe('Knowledge Manager Tools', () => {
  it('auditKnowledgeBase returns audit metrics', () => {
    const result = auditKnowledgeBase();
    expect(result).toHaveProperty('totalEntries', 42);
    expect(result).toHaveProperty('coverageScore');
    expect(result).toHaveProperty('qualityScore');
  });

  it('analyzeGaps groups queries by frequency', () => {
    const result = analyzeGaps(['AI architecture', 'AI architecture details', 'deployment pipeline']);
    expect(result.gaps.length).toBeGreaterThan(0);
    expect(result).toHaveProperty('prioritizedActions');
  });

  it('assessFreshness returns freshness metrics', () => {
    const result = assessFreshness();
    expect(result).toHaveProperty('freshnessScore');
    expect(result).toHaveProperty('fresh');
    expect(result).toHaveProperty('stale');
  });

  it('planIndexing creates strategy per source', () => {
    const result = planIndexing(['blog_posts', 'docs']);
    expect(result.strategy).toHaveLength(2);
    expect(result.strategy[0]).toHaveProperty('source', 'blog_posts');
    expect(result).toHaveProperty('estimatedEntries');
  });

  it('deduplicateEntries returns dedup result', () => {
    const result = deduplicateEntries();
    expect(result).toHaveProperty('uniqueCount');
    expect(result).toHaveProperty('savingsPercent', 0);
  });
});
