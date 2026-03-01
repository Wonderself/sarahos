import { SelfImprovementAgent } from './self-improvement.agent';
import { identifyOptimizations, proposeCodeImprovement, runImprovementCycle, calculateMetricsDelta } from './self-improvement.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"improvements":[{"area":"latency","description":"Optimize LLM routing","gain":"15%"}],"metrics":{"latencyImprovement":15}}',
      model: 'claude-opus', inputTokens: 280, outputTokens: 180, totalTokens: 460,
      stopReason: 'end_turn', latencyMs: 1100,
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
      { entry: { id: 'e1', content: 'TechDebtReport: score=45 items=[]', source: 'Self-Improvement Agent', metadata: {}, createdAt: '' }, score: 0.8, distance: 0.2 },
    ]),
  },
}));

jest.mock('../../../core/state/state-manager', () => ({
  stateManager: {
    getState: jest.fn().mockReturnValue({
      current_phase: 4, autonomy_score: 30, active_agents: [],
      disabled_agents: [], tasks_in_progress: [], blocked_tasks: [],
      known_bugs: [], unfinished_systems: [], security_risk_vectors: [],
      api_token_burn_rate: { daily_average: 8000, by_agent: {}, budget_remaining: 9000000 },
      avatar_system: { founder_avatars: { sarah: { status: 'active', sessions_today: 0 }, emmanuel: { status: 'active', sessions_today: 0 } }, client_avatars_deployed: 0, cache_hit_rate_by_preset: {}, did_api_usage_today: 0, tts_api_usage_today: 0 },
      infrastructure: { docker_containers: {}, database_size_mb: 500, redis_memory_mb: 64, uptime_hours: 100 },
      last_self_improvement_cycle: null, timestamp: '',
    }),
    update: jest.fn().mockResolvedValue({}),
    save: jest.fn().mockResolvedValue(undefined),
    load: jest.fn().mockResolvedValue({}),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-si-1', title: 'Improvement Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'chief-orchestration', correlationId: 'corr-1', ...overrides,
  };
}

describe('SelfImprovementAgent', () => {
  let agent: SelfImprovementAgent;

  beforeEach(() => {
    agent = new SelfImprovementAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Self-Improvement Agent');
    expect(agent.level).toBe(3);
    expect(agent.modelTier).toBe('advanced');
    expect(agent.capabilities).toContain('performance-optimization');
    expect(agent.capabilities).toContain('code-improvement');
    expect(agent.capabilities).toContain('system-evolution');
  });

  it('subscribes to 5 event types', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('TechDebtReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('PerformanceAlert', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('OptimizationProposed', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('OperationReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('KnowledgeAuditComplete', expect.any(Function), agent.id);
  });

  it('identifies optimizations and publishes OptimizationProposed', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'optimize' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('optimizations');
    expect(result.output).toHaveProperty('llmAnalysis');
    expect(eventBus.publish).toHaveBeenCalledWith('OptimizationProposed', agent.id, expect.any(Object));
  });

  it('proposes code improvements and publishes CodeSubmitted', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'code-review', issues: ['high latency in LLM router', 'memory leak in event bus'] },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('improvements');
    expect(result.output).toHaveProperty('llmProposals');
    expect(eventBus.publish).toHaveBeenCalledWith('CodeSubmitted', agent.id, expect.any(Object));
  });

  it('runs improvement cycle and updates stateManager', async () => {
    const { stateManager } = jest.requireMock('../../../core/state/state-manager') as { stateManager: { update: jest.Mock } };
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'improvement-cycle' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('cycle');
    expect(stateManager.update).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith('AutomationCreated', agent.id, expect.any(Object));
  });

  it('calculates metrics delta in metrics review', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'metrics-review' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('delta');
    expect(result.output['delta']).toHaveProperty('overallImprovementScore');
  });

  it('shuts down and unsubscribes from all events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('TechDebtReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('PerformanceAlert', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('OptimizationProposed', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('OperationReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('KnowledgeAuditComplete', agent.id);
  });
});

describe('Self-Improvement Tools', () => {
  it('identifyOptimizations returns plan', () => {
    const result = identifyOptimizations({}, {});
    expect(result).toHaveProperty('opportunities');
    expect(result).toHaveProperty('totalEstimatedGain', 0);
  });

  it('proposeCodeImprovement returns empty array (stub)', () => {
    const result = proposeCodeImprovement([], {});
    expect(result).toEqual([]);
  });

  it('runImprovementCycle returns cycle result', () => {
    const result = runImprovementCycle(null, {});
    expect(result).toHaveProperty('cycleId');
    expect(result).toHaveProperty('improvementsApplied', 0);
  });

  it('calculateMetricsDelta returns delta', () => {
    const result = calculateMetricsDelta({}, {});
    expect(result).toHaveProperty('overallImprovementScore', 0);
    expect(result).toHaveProperty('latencyDelta', 0);
  });
});
