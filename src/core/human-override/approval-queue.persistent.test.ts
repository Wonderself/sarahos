import { PersistentApprovalQueue } from './approval-queue.persistent';

jest.mock('uuid', () => {
  let counter = 0;
  return { v4: () => `approval-uuid-${++counter}` };
});

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
const mockDbIsConnected = jest.fn().mockReturnValue(true);
const mockDb = {
  query: mockQuery,
  isConnected: mockDbIsConnected,
} as any;

describe('PersistentApprovalQueue', () => {
  let queue: PersistentApprovalQueue;

  beforeEach(() => {
    jest.clearAllMocks();
    queue = new PersistentApprovalQueue();
  });

  it('should construct without persistence', () => {
    expect(queue.isPersistenceEnabled()).toBe(false);
  });

  it('should enable persistence', () => {
    queue.enablePersistence(mockDb);
    expect(queue.isPersistenceEnabled()).toBe(true);
  });

  it('should create and persist to PostgreSQL', () => {
    queue.enablePersistence(mockDb);
    const request = queue.create('FINANCIAL', 'Test approval', 'Description', 'agent-1', { amount: 100 });

    expect(request.title).toBe('Test approval');
    expect(request.status).toBe('PENDING');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO approval_queue'),
      expect.arrayContaining(['Test approval', 'FINANCIAL']),
    );
  });

  it('should decide and persist to PostgreSQL', () => {
    queue.enablePersistence(mockDb);
    const request = queue.create('STRATEGIC', 'Strategic decision', 'Desc', 'agent-2');

    const decided = queue.decide({
      requestId: request.id,
      status: 'APPROVED',
      decidedBy: 'emmanuel',
      notes: 'Approved',
    });

    expect(decided.status).toBe('APPROVED');
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('UPDATE approval_queue'),
      expect.arrayContaining(['APPROVED', 'emmanuel']),
    );
  });

  it('should create in-memory without DB', () => {
    const request = queue.create('SECURITY', 'No DB', 'Desc', 'agent-3');
    expect(request.status).toBe('PENDING');
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should handle DB errors gracefully on create', () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));
    queue.enablePersistence(mockDb);

    const request = queue.create('INFRASTRUCTURE', 'Error test', 'Desc', 'agent-4');
    expect(request.status).toBe('PENDING');
  });

  it('should sync from database', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'sync-1', override_level: 'FINANCIAL', title: 'Synced', description: 'From DB',
          requesting_agent: 'agent-5', payload: {}, status: 'PENDING', expires_at: null,
          created_at: '2026-01-01', decided_at: null, decided_by: null, decision_notes: null,
        },
      ],
      rowCount: 1,
    });
    queue.enablePersistence(mockDb);

    const synced = await queue.syncFromDatabase();
    expect(synced).toBe(1);
  });

  it('should get history from DB', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        {
          id: 'h1', override_level: 'STRATEGIC', title: 'Past', description: 'Old',
          requesting_agent: 'a1', payload: {}, status: 'APPROVED', expires_at: null,
          created_at: '2026-01-01', decided_at: '2026-01-02', decided_by: 'emmanuel', decision_notes: 'OK',
        },
      ],
      rowCount: 1,
    });
    queue.enablePersistence(mockDb);

    const history = await queue.getHistory(10);
    expect(history).toHaveLength(1);
    expect(history[0]!.status).toBe('APPROVED');
  });

  it('should fallback to in-memory history when no DB', async () => {
    queue.create('FINANCIAL', 'Test', 'Desc', 'a1');
    const history = await queue.getHistory(10);
    expect(history).toBeDefined();
  });
});
