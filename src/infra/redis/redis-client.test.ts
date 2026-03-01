import { RedisClient } from './redis-client';

// Mock ioredis
const mockPublish = jest.fn().mockResolvedValue(1);
const mockSubscribe = jest.fn().mockResolvedValue(undefined);
const mockUnsubscribe = jest.fn().mockResolvedValue(undefined);
const mockGet = jest.fn().mockResolvedValue('value');
const mockSet = jest.fn().mockResolvedValue('OK');
const mockDel = jest.fn().mockResolvedValue(1);
const mockPing = jest.fn().mockResolvedValue('PONG');
const mockDisconnect = jest.fn();
const mockOn = jest.fn();
const mockRedisConnect = jest.fn().mockResolvedValue(undefined);

jest.mock('ioredis', () => {
  return jest.fn().mockImplementation(() => ({
    connect: mockRedisConnect,
    publish: mockPublish,
    subscribe: mockSubscribe,
    unsubscribe: mockUnsubscribe,
    get: mockGet,
    set: mockSet,
    del: mockDel,
    ping: mockPing,
    disconnect: mockDisconnect,
    on: mockOn,
  }));
});

jest.mock('../../utils/config', () => ({
  getRedisUrl: () => 'redis://localhost:6379',
}));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

describe('RedisClient', () => {
  let client: RedisClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new RedisClient();
  });

  it('should start disconnected', () => {
    expect(client.isConnected()).toBe(false);
  });

  it('should connect successfully', async () => {
    await client.connect();
    expect(client.isConnected()).toBe(true);
    expect(mockRedisConnect).toHaveBeenCalledTimes(2); // client + subscriber
  });

  it('should publish messages when connected', async () => {
    await client.connect();
    const result = await client.publish('test-channel', 'hello');
    expect(result).toBe(1);
    expect(mockPublish).toHaveBeenCalledWith('test-channel', 'hello');
  });

  it('should throw when publishing without connection', async () => {
    await expect(client.publish('ch', 'msg')).rejects.toThrow('RedisClient not connected');
  });

  it('should subscribe to channels', async () => {
    await client.connect();
    const handler = jest.fn();
    await client.subscribe('events', handler);
    expect(mockSubscribe).toHaveBeenCalledWith('events');
  });

  it('should get/set/del keys', async () => {
    await client.connect();

    await client.set('key1', 'val1');
    expect(mockSet).toHaveBeenCalledWith('key1', 'val1');

    const val = await client.get('key1');
    expect(val).toBe('value');

    const deleted = await client.del('key1');
    expect(deleted).toBe(1);
  });

  it('should set with TTL', async () => {
    await client.connect();
    await client.set('key1', 'val1', 60);
    expect(mockSet).toHaveBeenCalledWith('key1', 'val1', 'EX', 60);
  });

  it('should disconnect properly', async () => {
    await client.connect();
    await client.disconnect();
    expect(client.isConnected()).toBe(false);
    expect(mockDisconnect).toHaveBeenCalledTimes(2);
  });

  it('should handle health check when connected', async () => {
    await client.connect();
    const health = await client.healthCheck();
    expect(health.connected).toBe(true);
    expect(health.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should handle health check when disconnected', async () => {
    const health = await client.healthCheck();
    expect(health.connected).toBe(false);
    expect(health.latencyMs).toBe(-1);
  });
});
