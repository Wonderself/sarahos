import { PersistentMemoryManager } from './memory-manager.persistent';

jest.mock('uuid', () => ({ v4: () => 'mem-uuid-1' }));

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('./embedding.service', () => ({
  embeddingService: {
    generate: jest.fn().mockResolvedValue({ values: [0.1, 0.2, 0.3], model: 'test', dimensions: 3 }),
  },
}));

const mockQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
const mockDbIsConnected = jest.fn().mockReturnValue(true);
const mockDb = {
  query: mockQuery,
  isConnected: mockDbIsConnected,
} as any;

describe('PersistentMemoryManager', () => {
  let manager: PersistentMemoryManager;

  beforeEach(() => {
    jest.clearAllMocks();
    manager = new PersistentMemoryManager();
  });

  it('should construct without persistence', () => {
    expect(manager.isPersistenceEnabled()).toBe(false);
  });

  it('should enable persistence', () => {
    manager.enablePersistence(mockDb);
    expect(manager.isPersistenceEnabled()).toBe(true);
  });

  it('should store and persist to PostgreSQL', async () => {
    manager.enablePersistence(mockDb);
    const entry = await manager.store({
      content: 'Test memory content',
      source: 'test',
      agentId: 'agent-1',
    });

    expect(entry.content).toBe('Test memory content');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO memory_embeddings'),
      expect.arrayContaining(['Test memory content', 'test']),
    );
  });

  it('should store in-memory when no DB', async () => {
    const entry = await manager.store({
      content: 'In-memory only',
      source: 'test',
    });

    expect(entry.content).toBe('In-memory only');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should handle DB errors gracefully on store', async () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));
    manager.enablePersistence(mockDb);

    const entry = await manager.store({
      content: 'Still works',
      source: 'test',
    });
    expect(entry.content).toBe('Still works');
  });

  it('should search from DB when connected', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'm1', content: 'Found', metadata: {}, source: 'test', agent_id: null, expires_at: null, created_at: '2026-01-01', score: 0.8 },
      ],
      rowCount: 1,
    });
    manager.enablePersistence(mockDb);

    const results = await manager.search({ query: 'Found', topK: 5, minScore: 0.3 });
    expect(results).toHaveLength(1);
    expect(results[0]!.entry.content).toBe('Found');
  });

  it('should fallback to in-memory search when DB fails', async () => {
    mockQuery.mockRejectedValueOnce(new Error('Search error'));
    manager.enablePersistence(mockDb);

    await manager.store({ content: 'in memory test', source: 'test' });
    const results = await manager.search({ query: 'in memory test', topK: 5, minScore: 0.3 });
    // Falls back to super.search() which uses cosine similarity or text search
    expect(results).toBeDefined();
  });

  it('should delete from both in-memory and DB', async () => {
    manager.enablePersistence(mockDb);
    const entry = await manager.store({ content: 'Delete me', source: 'test' });

    const deleted = manager.delete(entry.id);
    expect(deleted).toBe(true);
    expect(mockQuery).toHaveBeenCalledWith(
      'DELETE FROM memory_embeddings WHERE id = $1',
      [entry.id],
    );
  });

  it('should sync from database', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { id: 'sync-1', content: 'Synced content', metadata: {}, source: 'db', agent_id: null, expires_at: null, created_at: '2026-01-01' },
      ],
      rowCount: 1,
    });
    manager.enablePersistence(mockDb);

    const synced = await manager.syncFromDatabase();
    expect(synced).toBe(1);
  });

  it('should get persisted count from DB', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ count: 42 }],
      rowCount: 1,
    });
    manager.enablePersistence(mockDb);

    const count = await manager.getPersistedCount();
    expect(count).toBe(42);
  });

  it('should return in-memory count when no DB', async () => {
    await manager.store({ content: 'one', source: 'test' });
    const count = await manager.getPersistedCount();
    expect(count).toBe(1);
  });
});
