import { TechnicalManager } from './technical-manager.agent';
import { assessTechDebt, analyzePerformance, optimizeTokenUsage, assessInfrastructure, auditAvatarPipeline } from './technical-manager.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"assessment":"System health is good","issues":[],"optimizations":[],"score":85}',
      model: 'claude-sonnet', inputTokens: 180, outputTokens: 120, totalTokens: 300,
      stopReason: 'end_turn', latencyMs: 750,
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
    search: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../core/llm/token-tracker', () => ({
  tokenTracker: {
    getTotalTokens: jest.fn().mockReturnValue(75000),
    getTokensByAgent: jest.fn().mockReturnValue({ 'Content Agent': 30000, 'Social Media Agent': 20000, 'Communication Agent': 15000 }),
    getTokensByModel: jest.fn().mockReturnValue({ 'claude-sonnet': 70000, 'claude-opus': 5000 }),
    getDailyAverage: jest.fn().mockReturnValue(8000),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-tm-1', title: 'Tech Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('TechnicalManager', () => {
  let agent: TechnicalManager;

  beforeEach(() => {
    agent = new TechnicalManager();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Technical Manager');
    expect(agent.level).toBe(2);
    expect(agent.modelTier).toBe('standard');
    expect(agent.capabilities).toContain('tech-debt-tracking');
    expect(agent.capabilities).toContain('token-optimization');
    expect(agent.capabilities).toContain('avatar-pipeline-monitoring');
  });

  it('subscribes to 5 event types', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('HealthReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ThresholdBreached', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('MetricLogged', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('PerformanceAlert', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ScriptExecuted', expect.any(Function), agent.id);
  });

  it('assesses tech debt and publishes TechDebtReport', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'tech-debt', systems: ['EventBus', 'MemoryManager'] },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('debtItems');
    expect(result.output).toHaveProperty('totalDebtScore');
    expect(eventBus.publish).toHaveBeenCalledWith('TechDebtReport', agent.id, expect.any(Object));
  });

  it('analyzes performance', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'performance', period: 'last_24h' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('overallScore');
    expect(result.output).toHaveProperty('analysis');
  });

  it('optimizes token usage and publishes OptimizationProposed', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'token-optimization' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('currentBurn');
    expect(result.output).toHaveProperty('projectedMonthly');
    expect(result.output).toHaveProperty('optimizations');
    expect(eventBus.publish).toHaveBeenCalledWith('OptimizationProposed', agent.id, expect.any(Object));
  });

  it('assesses infrastructure and publishes InfraUpgradeNeeded when needed', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'infra-assessment', dbSizeMb: 500, redisMemoryMb: 64 },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('status');
  });

  it('audits avatar pipeline', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'avatar-audit', cacheStats: { sarahHitRate: 0.92, emmanuelHitRate: 0.88 } },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('sarahHealth');
    expect(result.output).toHaveProperty('cacheEfficiency');
    expect(result.output).toHaveProperty('didBudgetRemaining');
  });

  it('shuts down and unsubscribes from all events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('HealthReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ThresholdBreached', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('MetricLogged', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('PerformanceAlert', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ScriptExecuted', agent.id);
  });
});

describe('Technical Manager Tools', () => {
  it('assessTechDebt returns known debt items', () => {
    const result = assessTechDebt(['EventBus', 'MemoryManager']);
    expect(result.items.length).toBeGreaterThan(0);
    expect(result.items[0]).toHaveProperty('severity');
    expect(result).toHaveProperty('totalDebtScore');
  });

  it('analyzePerformance returns score', () => {
    const result = analyzePerformance({});
    expect(result).toHaveProperty('overallScore');
    expect(result.overallScore).toBeGreaterThan(0);
  });

  it('optimizeTokenUsage returns optimization suggestions', () => {
    const result = optimizeTokenUsage();
    expect(result).toHaveProperty('currentBurn');
    expect(result).toHaveProperty('projectedMonthly');
    expect(result).toHaveProperty('optimizations');
  });

  it('assessInfrastructure returns status', () => {
    const result = assessInfrastructure([], 500, 64);
    expect(result).toHaveProperty('status', 'healthy');
  });

  it('auditAvatarPipeline returns audit', () => {
    const result = auditAvatarPipeline({});
    expect(result).toHaveProperty('sarahHealth');
    expect(result).toHaveProperty('cacheEfficiency');
  });
});
