import { AutonomyExpansionAgent } from './autonomy-expansion.agent';
import { assessAutonomy, identifyBlockers, designAutomation, proposeCapability, draftAutonomyUpgrade } from './autonomy-expansion.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"autonomyScore":35,"blockers":[],"automations":[],"nextMilestone":{"targetScore":40}}',
      model: 'claude-opus', inputTokens: 300, outputTokens: 200, totalTokens: 500,
      stopReason: 'end_turn', latencyMs: 1300,
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
      { entry: { id: 'e1', content: 'ApprovalRequested: level=STRATEGIC title="Pivot"', source: 'Autonomy Expansion Agent', metadata: {}, createdAt: '' }, score: 0.8, distance: 0.2 },
    ]),
  },
}));

jest.mock('../../../core/human-override/human-override', () => ({
  humanOverride: {
    requestApproval: jest.fn().mockResolvedValue({ id: 'appr-1', status: 'PENDING' }),
    getPendingApprovals: jest.fn().mockReturnValue([
      { id: 'appr-1', overrideLevel: 'STRATEGIC', title: 'Test', status: 'PENDING' },
    ]),
  },
}));

jest.mock('../../../core/agent-registry/agent-registry', () => ({
  agentRegistry: {
    getAllEntries: jest.fn().mockReturnValue([
      { id: 'comm-agent', name: 'Communication Agent', level: 1, status: 'IDLE', capabilities: ['send-email', 'translate'] },
      { id: 'ops-mgr', name: 'Operations Manager', level: 2, status: 'IDLE', capabilities: ['task-decomposition'] },
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
    id: 'task-ae-1', title: 'Autonomy Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'chief-orchestration', correlationId: 'corr-1', ...overrides,
  };
}

describe('AutonomyExpansionAgent', () => {
  let agent: AutonomyExpansionAgent;

  beforeEach(() => {
    agent = new AutonomyExpansionAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Autonomy Expansion Agent');
    expect(agent.level).toBe(3);
    expect(agent.modelTier).toBe('advanced');
    expect(agent.capabilities).toContain('autonomy-assessment');
    expect(agent.capabilities).toContain('blocker-identification');
    expect(agent.capabilities).toContain('human-dependency-reduction');
  });

  it('subscribes to 6 event types', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('ApprovalRequested', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ApprovalGranted', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ApprovalDenied', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('TechDebtReport', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('EmbeddingsDeprecated', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('GlobalStateUpdate', expect.any(Function), agent.id);
  });

  it('assesses autonomy score from current state', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'assess-autonomy' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('assessment');
    expect(result.output).toHaveProperty('pendingApprovals', 1);
    expect(result.output).toHaveProperty('llmAnalysis');
  });

  it('identifies blockers and publishes AutonomyBlockerFound', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'find-blockers' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('blockers');
    expect(result.output).toHaveProperty('llmAnalysis');
    expect(eventBus.publish).toHaveBeenCalledWith('AutonomyBlockerFound', agent.id, expect.any(Object));
  });

  it('designs automation and publishes AutomationCreated', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'design-automation', process: 'content approval', currentState: 'manual' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('automation');
    expect(result.output).toHaveProperty('process', 'content approval');
    expect(eventBus.publish).toHaveBeenCalledWith('AutomationCreated', agent.id, expect.any(Object));
  });

  it('requests STRATEGIC approval when automation replaces approval process', async () => {
    const { humanOverride } = jest.requireMock('../../../core/human-override/human-override') as { humanOverride: { requestApproval: jest.Mock } };
    await agent.initialize();
    await agent.execute(makeTask({
      payload: { taskType: 'design-automation', process: 'financial review', currentState: 'needs-approval', replacesApproval: true },
    }));
    expect(humanOverride.requestApproval).toHaveBeenCalledWith(
      'STRATEGIC',
      expect.stringContaining('Automation replacing approval'),
      expect.any(String),
      agent.id,
      expect.any(Object),
    );
  });

  it('expands capabilities and publishes UpgradeDrafted', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: { taskType: 'expand-capabilities' } }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('currentCapabilityCount');
    expect(result.output).toHaveProperty('llmProposals');
    expect(eventBus.publish).toHaveBeenCalledWith('UpgradeDrafted', agent.id, expect.any(Object));
  });

  it('upgrades autonomy score via stateManager and publishes AutonomyLevelIncreased', async () => {
    const { stateManager } = jest.requireMock('../../../core/state/state-manager') as { stateManager: { update: jest.Mock } };
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    const { humanOverride } = jest.requireMock('../../../core/human-override/human-override') as { humanOverride: { requestApproval: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'upgrade-autonomy', targetScore: 35, changes: ['automated content approval'] },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('previousScore', 30);
    expect(result.output).toHaveProperty('newScore', 35);
    expect(humanOverride.requestApproval).toHaveBeenCalledWith(
      'STRATEGIC',
      expect.stringContaining('Autonomy Level Increase'),
      expect.any(String),
      agent.id,
      expect.any(Object),
    );
    expect(stateManager.update).toHaveBeenCalled();
    expect(eventBus.publish).toHaveBeenCalledWith('AutonomyLevelIncreased', agent.id, expect.any(Object));
  });

  it('shuts down and unsubscribes from all events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ApprovalRequested', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ApprovalGranted', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ApprovalDenied', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('TechDebtReport', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('EmbeddingsDeprecated', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('GlobalStateUpdate', agent.id);
  });
});

describe('Autonomy Expansion Tools', () => {
  it('assessAutonomy returns assessment with milestone', () => {
    const result = assessAutonomy(30, {});
    expect(result).toHaveProperty('currentScore', 30);
    expect(result).toHaveProperty('nextMilestone', 40);
    expect(result).toHaveProperty('distanceToMilestone', 10);
  });

  it('identifyBlockers returns empty array (stub)', () => {
    const result = identifyBlockers([], []);
    expect(result).toEqual([]);
  });

  it('designAutomation returns design structure', () => {
    const result = designAutomation('content-approval', 'manual');
    expect(result).toHaveProperty('name');
    expect(result).toHaveProperty('involvedAgents');
    expect(result).toHaveProperty('safeguards');
  });

  it('proposeCapability returns proposal', () => {
    const result = proposeCapability('real-time analytics');
    expect(result).toHaveProperty('capability');
    expect(result).toHaveProperty('impactOnScore');
  });

  it('draftAutonomyUpgrade returns upgrade with approval flag', () => {
    const result = draftAutonomyUpgrade(30, 40, ['automated reporting']);
    expect(result).toHaveProperty('fromScore', 30);
    expect(result).toHaveProperty('toScore', 40);
    expect(result).toHaveProperty('approvalRequired', true);
  });
});
