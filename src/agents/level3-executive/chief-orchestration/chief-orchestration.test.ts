import { ChiefOrchestrationAgent } from './chief-orchestration.agent';
import { issueDirective, resolveConflict, generateExecutiveReview, buildGlobalStateSnapshot, assessMissionAlignment } from './chief-orchestration.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"systemStatus":"healthy","directives":[],"healthScore":85,"missionProgress":40}',
      model: 'claude-opus', inputTokens: 300, outputTokens: 200, totalTokens: 500,
      stopReason: 'end_turn', latencyMs: 1200,
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

jest.mock('../../../core/orchestrator/task-scheduler', () => ({
  taskScheduler: {
    enqueue: jest.fn(),
  },
}));

jest.mock('../../../core/human-override/human-override', () => ({
  humanOverride: {
    requestApproval: jest.fn().mockResolvedValue({ id: 'appr-1', status: 'PENDING' }),
    getPendingApprovals: jest.fn().mockReturnValue([]),
  },
}));

jest.mock('../../../core/agent-registry/agent-registry', () => ({
  agentRegistry: {
    discover: jest.fn().mockReturnValue([]),
    healthCheckAll: jest.fn().mockResolvedValue(new Map([
      ['ops-mgr', { agentId: 'ops-mgr', healthy: true, status: 'IDLE', uptime: 1000, lastActivity: null, details: {} }],
    ])),
    getAllEntries: jest.fn().mockReturnValue([
      { id: 'ops-mgr', name: 'Operations Manager', level: 2, status: 'IDLE', capabilities: [] },
    ]),
    getCount: jest.fn().mockReturnValue(11),
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
    id: 'task-chief-1', title: 'Chief Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('ChiefOrchestrationAgent', () => {
  let agent: ChiefOrchestrationAgent;

  beforeEach(() => {
    agent = new ChiefOrchestrationAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Chief Orchestration Agent');
    expect(agent.level).toBe(3);
    expect(agent.modelTier).toBe('advanced');
    expect(agent.capabilities).toContain('system-wide-coordination');
    expect(agent.capabilities).toContain('directive-issuance');
    expect(agent.capabilities).toContain('conflict-resolution');
  });

  it('subscribes to 6 event types', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('OperationReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('GrowthReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('TechDebtReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('KnowledgeAuditComplete', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('PerformanceAlert', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('InfraUpgradeNeeded', expect.any(Function), agent.id);
  });

  it('performs executive review and publishes GlobalStateUpdate', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'executive-review' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('systemStatus');
    expect(result.output).toHaveProperty('healthScore');
    expect(result.output).toHaveProperty('llmSynthesis');
    expect(eventBus.publish).toHaveBeenCalledWith('GlobalStateUpdate', agent.id, expect.any(Object));
  });

  it('issues directives and publishes DirectiveIssued', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'issue-directive', target: 'operations-manager', action: 'Optimize task queue', priority: 'HIGH', rationale: 'Queue latency increasing' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('directives');
    expect(eventBus.publish).toHaveBeenCalledWith('DirectiveIssued', agent.id, expect.any(Object));
  });

  it('requests STRATEGIC approval for critical directives', async () => {
    const { humanOverride } = jest.requireMock('../../../core/human-override/human-override') as { humanOverride: { requestApproval: jest.Mock } };
    await agent.initialize();
    await agent.execute(makeTask({
      payload: { taskType: 'issue-directive', target: 'operations-manager', action: 'Emergency shutdown', priority: 'CRITICAL' },
    }));
    expect(humanOverride.requestApproval).toHaveBeenCalledWith(
      'STRATEGIC',
      expect.stringContaining('Critical Directive'),
      expect.any(String),
      agent.id,
      expect.any(Object),
    );
  });

  it('resolves conflicts between agents', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'resolve-conflict', agents: ['growth-manager', 'technical-manager'], conflictDescription: 'Resource contention on token budget' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('conflictId');
    expect(result.output).toHaveProperty('llmResolution');
    expect(eventBus.publish).toHaveBeenCalledWith('DirectiveIssued', agent.id, expect.objectContaining({ target: 'growth-manager' }));
    expect(eventBus.publish).toHaveBeenCalledWith('DirectiveIssued', agent.id, expect.objectContaining({ target: 'technical-manager' }));
  });

  it('updates global state via stateManager', async () => {
    const { stateManager } = jest.requireMock('../../../core/state/state-manager') as { stateManager: { update: jest.Mock } };
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'update-global-state' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('snapshot');
    expect(stateManager.update).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith('GlobalStateUpdate', agent.id, expect.any(Object));
  });

  it('performs mission check with agent health', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'mission-check' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('totalAgents');
    expect(result.output).toHaveProperty('healthyAgents');
    expect(result.output).toHaveProperty('alignment');
  });

  it('shuts down and unsubscribes from all events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('OperationReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('GrowthReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('TechDebtReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('KnowledgeAuditComplete', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('PerformanceAlert', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('InfraUpgradeNeeded', agent.id);
  });
});

describe('Chief Orchestration Tools', () => {
  it('issueDirective returns directive result', () => {
    const result = issueDirective('ops-mgr', 'optimize', 'HIGH', 'latency');
    expect(result.directives).toHaveLength(1);
    expect(result.directives[0]).toHaveProperty('target', 'ops-mgr');
    expect(result).toHaveProperty('issuedAt');
  });

  it('resolveConflict returns conflict resolution', () => {
    const result = resolveConflict(['agent-a', 'agent-b'], 'resource contention');
    expect(result).toHaveProperty('conflictId');
    expect(result.agents).toEqual(['agent-a', 'agent-b']);
  });

  it('generateExecutiveReview returns review metrics', () => {
    const result = generateExecutiveReview();
    expect(result).toHaveProperty('systemStatus', 'healthy');
    expect(result).toHaveProperty('healthScore');
  });

  it('buildGlobalStateSnapshot returns snapshot', () => {
    const result = buildGlobalStateSnapshot();
    expect(result).toHaveProperty('healthScore');
    expect(result).toHaveProperty('autonomyScore');
    expect(result).toHaveProperty('activeAgents');
  });

  it('assessMissionAlignment returns alignment', () => {
    const result = assessMissionAlignment([]);
    expect(result).toHaveProperty('overallAlignment');
    expect(result).toHaveProperty('alignedAgents');
  });
});
