import { ImprovementScheduler } from './improvement-scheduler';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockState = {
  avatar_system: {
    pipeline_latency_avg_ms: 300,
    active_conversations: 0,
    asr_requests_today: 0,
    tts_api_usage_today: 0,
    did_api_usage_today: 0,
    active_calls: 0,
  },
  infrastructure: { uptime_hours: 100 },
  tasks_in_progress: [] as string[],
  last_self_improvement_cycle: null as string | null,
};

jest.mock('../state/state-manager', () => ({
  stateManager: {
    getState: () => mockState,
    update: jest.fn().mockImplementation(async (cb: (s: typeof mockState) => void) => {
      cb(mockState);
    }),
  },
}));

jest.mock('../agent-registry/agent-registry', () => ({
  agentRegistry: {
    getAllEntries: jest.fn().mockReturnValue([
      { id: 'a1', name: 'Agent1', status: 'IDLE' },
      { id: 'a2', name: 'Agent2', status: 'IDLE' },
      { id: 'a3', name: 'Agent3', status: 'IDLE' },
    ]),
  },
}));

jest.mock('../llm/token-tracker', () => ({
  tokenTracker: {
    getDailyAverage: jest.fn().mockReturnValue(50000),
  },
}));

jest.mock('../orchestrator/task-scheduler', () => ({
  taskScheduler: {
    enqueue: jest.fn(),
  },
}));

describe('ImprovementScheduler', () => {
  let scheduler: ImprovementScheduler;

  beforeEach(() => {
    jest.clearAllMocks();
    mockState.avatar_system.pipeline_latency_avg_ms = 300;
    mockState.infrastructure.uptime_hours = 100;
    mockState.tasks_in_progress = [];
    mockState.last_self_improvement_cycle = null;
    scheduler = new ImprovementScheduler();
  });

  it('should collect system metrics', () => {
    const metrics = scheduler.collectSystemMetrics();
    expect(metrics.pipelineLatencyAvgMs).toBe(300);
    expect(metrics.agentErrorRate).toBe(0);
    expect(metrics.tokenBurnDaily).toBe(50000);
    expect(metrics.uptimeHours).toBe(100);
  });

  it('should calculate high health score for good metrics', () => {
    const score = scheduler.calculateHealthScore({
      pipelineLatencyAvgMs: 200,
      agentErrorRate: 0,
      tokenBurnDaily: 50000,
      uptimeHours: 100,
      activeConversations: 0,
      pendingTasks: 0,
    });
    expect(score).toBe(100);
  });

  it('should penalize high latency', () => {
    const score = scheduler.calculateHealthScore({
      pipelineLatencyAvgMs: 1500,
      agentErrorRate: 0,
      tokenBurnDaily: 50000,
      uptimeHours: 100,
      activeConversations: 0,
      pendingTasks: 0,
    });
    expect(score).toBe(90); // -10 for 1000ms above 500
  });

  it('should penalize agent errors', () => {
    const score = scheduler.calculateHealthScore({
      pipelineLatencyAvgMs: 200,
      agentErrorRate: 0.5,
      tokenBurnDaily: 50000,
      uptimeHours: 100,
      activeConversations: 0,
      pendingTasks: 0,
    });
    expect(score).toBe(88); // -12 for 50% error rate
  });

  it('should calculate low health score for bad metrics', () => {
    const score = scheduler.calculateHealthScore({
      pipelineLatencyAvgMs: 5000,
      agentErrorRate: 0.8,
      tokenBurnDaily: 500000,
      uptimeHours: 0,
      activeConversations: 0,
      pendingTasks: 5,
    });
    expect(score).toBeLessThan(50);
  });

  it('should run a cycle and not enqueue if score is OK', async () => {
    const { taskScheduler } = jest.requireMock('../orchestrator/task-scheduler');
    const record = await scheduler.runCycle();

    expect(record.healthScore).toBe(100);
    expect(record.action).toBe('metrics-review');
    expect(taskScheduler.enqueue).not.toHaveBeenCalled();
  });

  it('should enqueue optimization when score is low', async () => {
    mockState.avatar_system.pipeline_latency_avg_ms = 5000;
    mockState.tasks_in_progress = ['t1', 't2', 't3', 't4', 't5'];

    const { taskScheduler } = jest.requireMock('../orchestrator/task-scheduler');
    const record = await scheduler.runCycle();

    expect(record.healthScore).toBeLessThan(70);
    expect(record.action).toBe('optimize');
    expect(taskScheduler.enqueue).toHaveBeenCalledWith(
      expect.objectContaining({ title: expect.stringContaining('optimization'), priority: 'HIGH' }),
    );
  });

  it('should update state with cycle timestamp', async () => {
    await scheduler.runCycle();
    expect(mockState.last_self_improvement_cycle).not.toBeNull();
  });

  it('should track improvement history', async () => {
    await scheduler.runCycle();
    await scheduler.runCycle();

    const history = scheduler.getImprovementHistory();
    expect(history).toHaveLength(2);
  });

  it('should return last cycle', async () => {
    expect(scheduler.getLastCycle()).toBeNull();
    await scheduler.runCycle();
    expect(scheduler.getLastCycle()).not.toBeNull();
  });
});
