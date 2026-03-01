import { PersistentEventBus } from './event-bus.persistent';

jest.mock('uuid', () => ({ v4: () => 'persistent-event-uuid' }));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
const mockDbIsConnected = jest.fn().mockReturnValue(true);
const mockDb = {
  query: mockQuery,
  isConnected: mockDbIsConnected,
} as any;

const mockPublish = jest.fn().mockResolvedValue(1);
const mockRedisIsConnected = jest.fn().mockReturnValue(true);
const mockRedis = {
  publish: mockPublish,
  isConnected: mockRedisIsConnected,
} as any;

describe('PersistentEventBus', () => {
  let bus: PersistentEventBus;

  beforeEach(() => {
    jest.clearAllMocks();
    bus = new PersistentEventBus();
  });

  it('should construct without persistence', () => {
    expect(bus.isPersistenceEnabled()).toBe(false);
  });

  it('should enable persistence with DB and Redis', () => {
    bus.enablePersistence(mockDb, mockRedis);
    expect(bus.isPersistenceEnabled()).toBe(true);
  });

  it('should publish and persist to PostgreSQL', async () => {
    bus.enablePersistence(mockDb, mockRedis);
    const event = await bus.publish('TaskCreated', 'test-agent', { key: 'value' });

    expect(event.type).toBe('TaskCreated');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO events'),
      expect.arrayContaining(['persistent-event-uuid', 'TaskCreated', 'test-agent']),
    );
  });

  it('should publish to Redis Pub/Sub', async () => {
    bus.enablePersistence(mockDb, mockRedis);
    await bus.publish('TaskCompleted', 'agent-1', { result: 'ok' });

    expect(mockPublish).toHaveBeenCalledWith(
      'sarah:events',
      expect.stringContaining('TaskCompleted'),
    );
  });

  it('should work in-memory when persistence not enabled', async () => {
    const event = await bus.publish('TaskFailed', 'agent-2', {});
    expect(event.type).toBe('TaskFailed');
    expect(mockQuery).not.toHaveBeenCalled();
    expect(mockPublish).not.toHaveBeenCalled();
  });

  it('should handle DB errors gracefully', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));
    bus.enablePersistence(mockDb, mockRedis);

    // Should not throw — graceful degradation
    const event = await bus.publish('TaskCreated', 'agent-3', {});
    expect(event.type).toBe('TaskCreated');
  });

  it('should handle Redis errors gracefully', async () => {
    mockPublish.mockRejectedValueOnce(new Error('Redis error'));
    bus.enablePersistence(mockDb, mockRedis);

    const event = await bus.publish('TaskCreated', 'agent-4', {});
    expect(event.type).toBe('TaskCreated');
  });

  it('should get persisted events from DB', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'e1', event_type: 'TaskCreated', source_agent: 'a1', target_agent: null, payload: {}, created_at: '2026-01-01' },
      ],
      rowCount: 1,
    });
    bus.enablePersistence(mockDb, mockRedis);

    const events = await bus.getPersistedEvents('TaskCreated', 10);
    expect(events).toHaveLength(1);
    expect(events[0]!.type).toBe('TaskCreated');
  });

  it('should fallback to in-memory for getPersistedEvents when no DB', async () => {
    await bus.publish('MetricLogged', 'agent-5', {});
    const events = await bus.getPersistedEvents('MetricLogged', 10);
    expect(events).toHaveLength(1);
  });

  it('should get event stats from DB', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { event_type: 'TaskCreated', count: 42 },
        { event_type: 'TaskCompleted', count: 38 },
      ],
      rowCount: 2,
    });
    bus.enablePersistence(mockDb, mockRedis);

    const stats = await bus.getEventStats();
    expect(stats['TaskCreated']).toBe(42);
    expect(stats['TaskCompleted']).toBe(38);
  });
});
