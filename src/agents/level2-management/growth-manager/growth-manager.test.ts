import { GrowthManager } from './growth-manager.agent';
import { analyzeEngagement, proposeCampaign, designABTest, analyzeMarket, detectOpportunity } from './growth-manager.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"analysis":"Strong engagement on LinkedIn","opportunities":[{"type":"viral","confidence":0.8}]}',
      model: 'claude-sonnet', inputTokens: 150, outputTokens: 100, totalTokens: 250,
      stopReason: 'end_turn', latencyMs: 700,
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
      { entry: { id: 'e1', content: 'EngagementReport: platform=linkedin', source: 'Growth Manager', metadata: { type: 'engagement_data' }, createdAt: '' }, score: 0.8, distance: 0.2 },
    ]),
  },
}));

jest.mock('../../../core/orchestrator/task-scheduler', () => ({
  taskScheduler: {
    enqueue: jest.fn(),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-gm-1', title: 'Growth Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('GrowthManager', () => {
  let agent: GrowthManager;

  beforeEach(() => {
    agent = new GrowthManager();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Growth Manager');
    expect(agent.level).toBe(2);
    expect(agent.modelTier).toBe('standard');
    expect(agent.capabilities).toContain('engagement-analysis');
    expect(agent.capabilities).toContain('campaign-strategy');
    expect(agent.capabilities).toContain('ab-testing');
  });

  it('subscribes to 4 event types', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('EngagementReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('PostPublished', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ViralAlert', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ContentGenerated', expect.any(Function), agent.id);
  });

  it('analyzes engagement and publishes GrowthReport', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'analyze-engagement', period: 'last_7_days' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('analysis');
    expect(result.output).toHaveProperty('dataPointsAnalyzed');
    expect(eventBus.publish).toHaveBeenCalledWith('GrowthReport', agent.id, expect.any(Object));
  });

  it('proposes campaigns and enqueues content tasks', async () => {
    const { taskScheduler } = jest.requireMock('../../../core/orchestrator/task-scheduler') as { taskScheduler: { enqueue: jest.Mock } };
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'campaign', topic: 'SARAH OS launch', platforms: ['linkedin', 'x'], avatar: 'sarah' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('campaignPlan');
    expect(result.output).toHaveProperty('contentTaskEnqueued', true);
    expect(taskScheduler.enqueue).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith('GrowthReport', agent.id, expect.objectContaining({ type: 'campaign' }));
  });

  it('designs A/B tests and publishes ABTestResult', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'ab-test', hypothesis: 'Emoji in titles increase CTR', variable: 'title_format', successMetric: 'click_rate' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('testId');
    expect(result.output).toHaveProperty('hypothesis');
    expect(eventBus.publish).toHaveBeenCalledWith('ABTestResult', agent.id, expect.objectContaining({ status: 'designed' }));
  });

  it('performs market analysis and publishes MarketAnalysis', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'market-analysis', industry: 'AI SaaS', competitors: ['ChatGPT', 'Jasper'] },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('analysis');
    expect(result.output).toHaveProperty('industry', 'AI SaaS');
    expect(eventBus.publish).toHaveBeenCalledWith('MarketAnalysis', agent.id, expect.any(Object));
  });

  it('detects opportunities and publishes OpportunityDetected', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'detect-opportunities' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('signalsAnalyzed');
    expect(eventBus.publish).toHaveBeenCalledWith('OpportunityDetected', agent.id, expect.any(Object));
  });

  it('shuts down and unsubscribes from all events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('EngagementReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('PostPublished', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ViralAlert', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ContentGenerated', agent.id);
  });
});

describe('Growth Manager Tools', () => {
  it('analyzeEngagement returns stub analysis', () => {
    const result = analyzeEngagement([]);
    expect(result).toHaveProperty('avgEngagementRate');
    expect(result).toHaveProperty('trendDirection');
  });

  it('proposeCampaign returns stub proposal', () => {
    const result = proposeCampaign('AI launch', ['linkedin']);
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('posts');
  });

  it('designABTest returns test structure', () => {
    const result = designABTest('Emoji improves CTR', ['control', 'emoji']);
    expect(result.testId).toContain('ab_');
    expect(result.hypothesis).toBe('Emoji improves CTR');
  });

  it('analyzeMarket returns market data', () => {
    const result = analyzeMarket('AI SaaS');
    expect(result).toHaveProperty('trends');
    expect(result).toHaveProperty('opportunities');
  });

  it('detectOpportunity returns opportunities array', () => {
    const result = detectOpportunity({});
    expect(result).toHaveProperty('opportunities');
    expect(Array.isArray(result.opportunities)).toBe(true);
  });
});
