import { MonitoringAgent } from './monitoring.agent';
import { checkLatency, logError, reportTokenUsage, checkContainerHealth, checkAvatarCache, classifyLatency } from './monitoring.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: 'Recommendation: Scale up the API service to reduce latency.',
      model: 'claude-sonnet', inputTokens: 100, outputTokens: 50, totalTokens: 150,
      stopReason: 'end_turn', latencyMs: 500,
    }),
  },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(), unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

jest.mock('../../../core/llm/token-tracker', () => ({
  tokenTracker: {
    getTotalTokens: jest.fn().mockReturnValue(50000),
    getTokensByAgent: jest.fn().mockReturnValue({ 'Content Agent': 20000, 'Social Media Agent': 15000 }),
    getTokensByModel: jest.fn().mockReturnValue({ 'claude-sonnet': 45000, 'claude-opus': 5000 }),
    getDailyAverage: jest.fn().mockReturnValue(5000),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-m-1', title: 'Monitor Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('MonitoringAgent', () => {
  let agent: MonitoringAgent;

  beforeEach(() => {
    agent = new MonitoringAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Monitoring Agent');
    expect(agent.capabilities).toContain('check-latency');
    expect(agent.capabilities).toContain('token-report');
    expect(agent.capabilities).toContain('container-health');
    expect(agent.capabilities).toContain('avatar-cache');
  });

  it('subscribes to TaskFailed and ThresholdBreached', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('TaskFailed', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('ThresholdBreached', expect.any(Function), agent.id);
  });

  it('runs a full health check and publishes HealthReport', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'health-check' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('status');
    expect(result.output).toHaveProperty('latency');
    expect(result.output).toHaveProperty('containers');
    expect(result.output).toHaveProperty('avatarCache');
    expect(result.output).toHaveProperty('tokenReport');
    expect(eventBus.publish).toHaveBeenCalledWith('HealthReport', agent.id, expect.any(Object));
  });

  it('checks latency and publishes MetricLogged', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'latency', service: 'llm-router' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('latencyMs');
    expect(eventBus.publish).toHaveBeenCalledWith('MetricLogged', agent.id, expect.objectContaining({ metric: 'latency' }));
  });

  it('generates token usage report', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'token-report' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('totalTokens', 50000);
    expect(result.output).toHaveProperty('byAgent');
    expect(result.output).toHaveProperty('dailyAverage', 5000);
    expect(eventBus.publish).toHaveBeenCalledWith('MetricLogged', agent.id, expect.objectContaining({ metric: 'token-usage' }));
  });

  it('checks container health', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'container-health' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('containers');
    expect(eventBus.publish).toHaveBeenCalledWith('MetricLogged', agent.id, expect.objectContaining({ metric: 'container-health' }));
  });

  it('checks avatar cache stats', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'avatar-cache' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('sarahHitRate');
    expect(result.output).toHaveProperty('emmanuelHitRate');
    expect(result.output).toHaveProperty('didUsageToday');
    expect(eventBus.publish).toHaveBeenCalledWith('MetricLogged', agent.id, expect.objectContaining({ metric: 'avatar-cache' }));
  });

  it('logs errors and publishes MetricLogged', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'log-error', error: 'Connection timeout', context: { service: 'postgres', critical: true } },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('errorId');
    expect(result.output).toHaveProperty('severity');
    expect(eventBus.publish).toHaveBeenCalledWith('MetricLogged', agent.id, expect.objectContaining({ metric: 'error' }));
  });
});

describe('Monitoring Tools', () => {
  it('checkLatency returns latency with status', async () => {
    const result = await checkLatency('test-service');
    expect(result).toHaveProperty('service', 'test-service');
    expect(result).toHaveProperty('latencyMs');
    expect(result).toHaveProperty('status');
  });

  it('classifyLatency correctly classifies thresholds', () => {
    expect(classifyLatency(100)).toBe('ok');
    expect(classifyLatency(3000)).toBe('warn');
    expect(classifyLatency(6000)).toBe('critical');
  });

  it('logError returns entry with errorId', async () => {
    const result = await logError('Test error', { service: 'test' });
    expect(result.logged).toBe(true);
    expect(result.errorId).toContain('err_');
  });

  it('reportTokenUsage returns usage stats from tracker', () => {
    const result = reportTokenUsage();
    expect(result.totalTokens).toBe(50000);
    expect(result.byAgent).toHaveProperty('Content Agent');
    expect(result.dailyAverage).toBe(5000);
  });

  it('checkContainerHealth returns container list', async () => {
    const result = await checkContainerHealth();
    expect(result.length).toBeGreaterThan(0);
    expect(result[0]).toHaveProperty('name');
    expect(result[0]).toHaveProperty('status');
    expect(result[0]).toHaveProperty('cpuPercent');
  });

  it('checkAvatarCache returns hit rates', async () => {
    const result = await checkAvatarCache();
    expect(result.sarahHitRate).toBeGreaterThan(0);
    expect(result.emmanuelHitRate).toBeGreaterThan(0);
    expect(result).toHaveProperty('didUsageToday');
  });
});
