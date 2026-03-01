import { DatabaseClient } from './db-client';

// Mock pg
const mockQuery = jest.fn().mockResolvedValue({ rows: [{ result: 1 }], rowCount: 1 });
const mockRelease = jest.fn();
const mockConnect = jest.fn().mockResolvedValue({ release: mockRelease });
const mockEnd = jest.fn().mockResolvedValue(undefined);

jest.mock('pg', () => ({
  Pool: jest.fn().mockImplementation(() => ({
    query: mockQuery,
    connect: mockConnect,
    end: mockEnd,
  })),
}));

jest.mock('../../utils/config', () => ({
  getDatabaseUrl: () => 'postgresql://sarah:secret@localhost:5432/sarah_os',
}));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/retry', () => ({
  withRetry: (fn: () => Promise<unknown>) => fn(),
}));

describe('DatabaseClient', () => {
  let client: DatabaseClient;

  beforeEach(() => {
    jest.clearAllMocks();
    client = new DatabaseClient();
  });

  it('should start disconnected', () => {
    expect(client.isConnected()).toBe(false);
    expect(client.getPool()).toBeNull();
  });

  it('should connect successfully', async () => {
    await client.connect();
    expect(client.isConnected()).toBe(true);
    expect(client.getPool()).not.toBeNull();
    expect(mockConnect).toHaveBeenCalled();
    expect(mockRelease).toHaveBeenCalled();
  });

  it('should execute queries when connected', async () => {
    await client.connect();
    const result = await client.query('SELECT 1');
    expect(result.rows).toEqual([{ result: 1 }]);
    expect(mockQuery).toHaveBeenCalledWith('SELECT 1', undefined);
  });

  it('should throw when querying without connection', async () => {
    await expect(client.query('SELECT 1')).rejects.toThrow('DatabaseClient not connected');
  });

  it('should disconnect properly', async () => {
    await client.connect();
    await client.disconnect();
    expect(client.isConnected()).toBe(false);
    expect(client.getPool()).toBeNull();
    expect(mockEnd).toHaveBeenCalled();
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

  it('should warn on duplicate connect', async () => {
    await client.connect();
    await client.connect();
    // Second connect should not create a new pool
    expect(client.isConnected()).toBe(true);
  });
});
