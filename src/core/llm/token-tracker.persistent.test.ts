import { PersistentTokenTracker } from './token-tracker.persistent';
import type { TokenUsage } from './llm.types';

jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockQuery = jest.fn().mockResolvedValue({ rows: [], rowCount: 0 });
const mockDbIsConnected = jest.fn().mockReturnValue(true);
const mockDb = {
  query: mockQuery,
  isConnected: mockDbIsConnected,
} as any;

function makeUsage(agent: string, model: string, total: number): TokenUsage {
  return {
    agentId: `${agent}-id`,
    agentName: agent,
    model,
    inputTokens: Math.floor(total * 0.6),
    outputTokens: Math.floor(total * 0.4),
    totalTokens: total,
    timestamp: '2026-02-27T12:00:00.000Z',
  };
}

describe('PersistentTokenTracker', () => {
  let tracker: PersistentTokenTracker;

  beforeEach(() => {
    jest.clearAllMocks();
    tracker = new PersistentTokenTracker();
  });

  it('should construct without persistence', () => {
    expect(tracker.isPersistenceEnabled()).toBe(false);
  });

  it('should enable persistence', () => {
    tracker.enablePersistence(mockDb);
    expect(tracker.isPersistenceEnabled()).toBe(true);
  });

  it('should record and persist to PostgreSQL', () => {
    tracker.enablePersistence(mockDb);
    const usage = makeUsage('agent-1', 'claude-sonnet', 1000);
    tracker.record(usage);

    expect(tracker.getTotalTokens()).toBe(1000);
    expect(mockQuery).toHaveBeenCalledWith(
      expect.stringContaining('INSERT INTO token_usage'),
      expect.arrayContaining(['agent-1', 'claude-sonnet', 1000]),
    );
  });

  it('should record in-memory without DB', () => {
    const usage = makeUsage('agent-2', 'claude-haiku', 500);
    tracker.record(usage);
    expect(tracker.getTotalTokens()).toBe(500);
    expect(mockQuery).not.toHaveBeenCalled();
  });

  it('should handle DB errors gracefully on record', () => {
    mockQuery.mockRejectedValueOnce(new Error('DB error'));
    tracker.enablePersistence(mockDb);

    const usage = makeUsage('agent-3', 'claude-opus', 2000);
    tracker.record(usage);
    expect(tracker.getTotalTokens()).toBe(2000);
  });

  it('should get tokens by date range from DB', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [
        { date: '2026-02-27', total_tokens: 5000, agent_name: 'agent-1' },
        { date: '2026-02-26', total_tokens: 3000, agent_name: 'agent-2' },
      ],
      rowCount: 2,
    });
    tracker.enablePersistence(mockDb);

    const ranges = await tracker.getTokensByDateRange('2026-02-26', '2026-02-28');
    expect(ranges).toHaveLength(2);
    expect(ranges[0]!.totalTokens).toBe(5000);
  });

  it('should fallback to in-memory for date range', async () => {
    tracker.record(makeUsage('a1', 'm1', 100));
    const ranges = await tracker.getTokensByDateRange('2026-02-26', '2026-02-28');
    expect(ranges).toBeDefined();
  });

  it('should get cost report from DB', async () => {
    mockQuery
      .mockResolvedValueOnce({ rows: [{ total: 10000 }], rowCount: 1 })
      .mockResolvedValueOnce({ rows: [{ agent_name: 'a1', total: 6000 }, { agent_name: 'a2', total: 4000 }], rowCount: 2 })
      .mockResolvedValueOnce({ rows: [{ model: 'claude-sonnet', total: 10000 }], rowCount: 1 });

    tracker.enablePersistence(mockDb);

    const report = await tracker.getCostReport();
    expect(report.totalTokens).toBe(10000);
    expect(report.byAgent['a1']).toBe(6000);
    expect(report.estimatedCostUsd).toBeGreaterThan(0);
  });

  it('should get daily average from DB', async () => {
    mockQuery.mockResolvedValueOnce({
      rows: [{ avg_daily: 5000 }],
      rowCount: 1,
    });
    tracker.enablePersistence(mockDb);

    const avg = await tracker.getDailyAverageFromDB();
    expect(avg).toBe(5000);
  });
});
