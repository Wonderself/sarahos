import { EventBus } from './event-bus';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe('EventBus', () => {
  let bus: EventBus;

  beforeEach(() => {
    bus = new EventBus();
  });

  it('publishes events to subscribers', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    bus.subscribe('TaskCreated', handler, 'test-agent');

    await bus.publish('TaskCreated', 'orchestrator', { taskId: 'TASK-001' });

    expect(handler).toHaveBeenCalledTimes(1);
    expect(handler).toHaveBeenCalledWith(
      expect.objectContaining({
        type: 'TaskCreated',
        sourceAgent: 'orchestrator',
        payload: { taskId: 'TASK-001' },
      })
    );
  });

  it('does not call unsubscribed handlers', async () => {
    const handler = jest.fn().mockResolvedValue(undefined);
    const unsub = bus.subscribe('TaskCreated', handler, 'test-agent');

    unsub();
    await bus.publish('TaskCreated', 'orchestrator', {});

    expect(handler).not.toHaveBeenCalled();
  });

  it('handles handler errors gracefully', async () => {
    const failHandler = jest.fn().mockRejectedValue(new Error('boom'));
    const goodHandler = jest.fn().mockResolvedValue(undefined);

    bus.subscribe('TaskFailed', failHandler, 'bad-agent');
    bus.subscribe('TaskFailed', goodHandler, 'good-agent');

    await bus.publish('TaskFailed', 'source', {});

    expect(failHandler).toHaveBeenCalledTimes(1);
    expect(goodHandler).toHaveBeenCalledTimes(1);
  });

  it('tracks recent events', async () => {
    await bus.publish('TaskCreated', 'a', { n: 1 });
    await bus.publish('TaskCompleted', 'b', { n: 2 });

    const events = bus.getRecentEvents();
    expect(events).toHaveLength(2);
    expect(events[0]?.type).toBe('TaskCreated');
    expect(events[1]?.type).toBe('TaskCompleted');
  });

  it('lists subscribers for event type', () => {
    bus.subscribe('MetricLogged', jest.fn(), 'monitoring');
    bus.subscribe('MetricLogged', jest.fn(), 'dashboard');

    expect(bus.getSubscribers('MetricLogged')).toEqual(['monitoring', 'dashboard']);
  });
});
