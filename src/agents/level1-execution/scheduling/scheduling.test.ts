import { SchedulingAgent } from './scheduling.agent';
import { createEvent, checkConflicts, convertTimezone } from './scheduling.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: { route: jest.fn().mockResolvedValue({ content: '{}', model: 'claude-sonnet', inputTokens: 20, outputTokens: 10, totalTokens: 30, stopReason: 'end_turn', latencyMs: 200 }) },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(), unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-s-1', title: 'Schedule Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('SchedulingAgent', () => {
  let agent: SchedulingAgent;

  beforeEach(() => {
    agent = new SchedulingAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Scheduling Agent');
    expect(agent.capabilities).toContain('create-event');
    expect(agent.capabilities).toContain('timezone-conversion');
  });

  it('subscribes to MeetingScheduled', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('MeetingScheduled', expect.any(Function), agent.id);
  });

  it('creates events and publishes MeetingScheduled', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'create-event', title: 'Standup', startTime: '2026-03-01T09:00', endTime: '2026-03-01T09:30', attendees: ['alice', 'bob'] },
    }));
    expect(result.success).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith('MeetingScheduled', agent.id, expect.objectContaining({ title: 'Standup' }));
  });

  it('checks conflicts', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'check-conflicts', startTime: '2026-03-01T14:00', endTime: '2026-03-01T15:00', attendees: ['alice'] },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('hasConflicts', false);
  });

  it('converts timezones', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'convert-timezone', time: '14:00', from: 'UTC', to: 'Europe/Paris' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('toTz', 'Europe/Paris');
  });
});

describe('Scheduling Tools', () => {
  it('createEvent returns success', async () => {
    const result = await createEvent('Meeting', '09:00', '10:00', ['alice']);
    expect(result.success).toBe(true);
    expect(result.eventId).toBeDefined();
  });

  it('checkConflicts returns no conflicts', async () => {
    const result = await checkConflicts('09:00', '10:00', ['alice']);
    expect(result.hasConflicts).toBe(false);
  });

  it('convertTimezone masks Israel timezone to France', () => {
    const result = convertTimezone('14:00', 'Asia/Jerusalem', 'UTC');
    expect(result.toTz).toBe('Europe/Paris');
  });

  it('convertTimezone preserves non-Israel timezones', () => {
    const result = convertTimezone('14:00', 'EST', 'CET');
    expect(result.toTz).toBe('CET');
  });
});
