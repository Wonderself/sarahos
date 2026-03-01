import { StrategyAgent } from './strategy.agent';
import { formulateStrategy, performSWOT, evaluatePivot, buildGrowthRoadmap } from './strategy.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"strategy":{"name":"Enterprise Expansion","horizon":"6_months"},"swot":{"overallScore":70},"pivotRecommended":false}',
      model: 'claude-opus', inputTokens: 350, outputTokens: 250, totalTokens: 600,
      stopReason: 'end_turn', latencyMs: 1500,
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
      { entry: { id: 'e1', content: 'GrowthReport: engagement=5.2%', source: 'Strategy Agent', metadata: {}, createdAt: '' }, score: 0.8, distance: 0.2 },
    ]),
  },
}));

jest.mock('../../../core/human-override/human-override', () => ({
  humanOverride: {
    requestApproval: jest.fn().mockResolvedValue({ id: 'appr-1', status: 'PENDING' }),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-strat-1', title: 'Strategy Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'chief-orchestration', correlationId: 'corr-1', ...overrides,
  };
}

describe('StrategyAgent', () => {
  let agent: StrategyAgent;

  beforeEach(() => {
    agent = new StrategyAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Strategy Agent');
    expect(agent.level).toBe(3);
    expect(agent.modelTier).toBe('advanced');
    expect(agent.capabilities).toContain('market-strategy');
    expect(agent.capabilities).toContain('pivot-recommendation');
    expect(agent.capabilities).toContain('growth-roadmap');
  });

  it('subscribes to 5 event types', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('GrowthReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('MarketAnalysis', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('OpportunityDetected', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ABTestResult', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('OperationReport', expect.any(Function), agent.id);
  });

  it('formulates strategy and publishes StrategyProposal', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'formulate-strategy' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('strategy');
    expect(result.output).toHaveProperty('llmAnalysis');
    expect(eventBus.publish).toHaveBeenCalledWith('StrategyProposal', agent.id, expect.any(Object));
  });

  it('analyzes pivot and requests STRATEGIC approval', async () => {
    const { humanOverride } = jest.requireMock('../../../core/human-override/human-override') as { humanOverride: { requestApproval: jest.Mock } };
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'pivot-analysis' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('pivotAssessment');
    expect(eventBus.publish).toHaveBeenCalledWith('PivotRecommendation', agent.id, expect.any(Object));
    expect(humanOverride.requestApproval).toHaveBeenCalledWith(
      'STRATEGIC',
      expect.stringContaining('Pivot'),
      expect.any(String),
      agent.id,
      expect.any(Object),
    );
  });

  it('builds growth plans with milestones', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'growth-plan', horizon: '12_months', targets: { revenue: 100000 }, budget: '50000 EUR' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('horizon', '12_months');
    expect(result.output).toHaveProperty('roadmap');
    expect(result.output).toHaveProperty('llmPlan');
    expect(eventBus.publish).toHaveBeenCalledWith('StrategyProposal', agent.id, expect.any(Object));
  });

  it('performs competitive review with SWOT', async () => {
    const { memoryManager } = jest.requireMock('../../../core/memory/memory-manager') as { memoryManager: { store: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'competitive-review' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('swot');
    expect(result.output).toHaveProperty('dataSourcesAnalyzed');
    expect(memoryManager.store).toHaveBeenCalledWith(expect.objectContaining({
      content: expect.stringContaining('CompetitiveReview'),
    }));
  });

  it('shuts down and unsubscribes from all events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('GrowthReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('MarketAnalysis', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('OpportunityDetected', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ABTestResult', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('OperationReport', agent.id);
  });
});

describe('Strategy Tools', () => {
  it('formulateStrategy returns stub proposal', () => {
    const result = formulateStrategy({}, {});
    expect(result).toHaveProperty('horizon', '6_months');
    expect(result).toHaveProperty('objectives');
  });

  it('performSWOT returns analysis', () => {
    const result = performSWOT({});
    expect(result).toHaveProperty('overallScore', 50);
    expect(result).toHaveProperty('strengths');
    expect(result).toHaveProperty('weaknesses');
  });

  it('evaluatePivot returns recommendation', () => {
    const result = evaluatePivot({}, {});
    expect(result).toHaveProperty('recommended', false);
    expect(result).toHaveProperty('confidence');
  });

  it('buildGrowthRoadmap returns milestones', () => {
    const result = buildGrowthRoadmap('6_months', {});
    expect(result).toHaveProperty('totalDurationMonths', 6);
    expect(result).toHaveProperty('milestones');
  });
});
