jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockDbClient = {
  isConnected: jest.fn().mockReturnValue(true),
  query: jest.fn(),
};

jest.mock('../../infra', () => ({
  dbClient: mockDbClient,
}));

import { CronService } from './cron.service';

interface CronServicePrivate {
  resetDailyApiCalls: () => Promise<void>;
  expireDemoAccounts: () => Promise<void>;
  cleanupStaleData: () => Promise<void>;
}

describe('CronService', () => {
  let service: CronService;

  beforeEach(() => {
    service = new CronService();
    jest.clearAllMocks();
    jest.useFakeTimers();
    mockDbClient.isConnected.mockReturnValue(true);
  });

  afterEach(() => {
    service.stop();
    jest.useRealTimers();
  });

  describe('start/stop', () => {
    it('should start without errors', () => {
      expect(() => service.start()).not.toThrow();
    });

    it('should not start twice', () => {
      service.start();
      service.start(); // Should be no-op
    });

    it('should stop cleanly', () => {
      service.start();
      expect(() => service.stop()).not.toThrow();
    });
  });

  describe('resetDailyApiCalls', () => {
    it('should reset daily API calls when last run >23h ago', async () => {
      // Mock: last run was 25 hours ago
      const lastRun = new Date(Date.now() - 25 * 60 * 60 * 1000).toISOString();
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [{ started_at: lastRun }] }) // last run check
        .mockResolvedValueOnce({ rowCount: 5 }); // UPDATE

      // Access private method via prototype
      await (service as unknown as CronServicePrivate).resetDailyApiCalls();
      expect(mockDbClient.query).toHaveBeenCalledTimes(2);
    });

    it('should skip if last run was recent', async () => {
      const lastRun = new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString();
      mockDbClient.query.mockResolvedValueOnce({ rows: [{ created_at: lastRun }] });

      await (service as unknown as CronServicePrivate).resetDailyApiCalls();
      expect(mockDbClient.query).toHaveBeenCalledTimes(1); // Only the check query
    });

    it('should skip if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      await (service as unknown as CronServicePrivate).resetDailyApiCalls();
      expect(mockDbClient.query).not.toHaveBeenCalled();
    });
  });

  describe('expireDemoAccounts', () => {
    it('should deactivate expired demo accounts', async () => {
      mockDbClient.query.mockResolvedValue({ rowCount: 3 });
      await (service as unknown as CronServicePrivate).expireDemoAccounts();
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('demo_expires_at'),
      );
    });
  });

  describe('cleanupStaleData', () => {
    it('should delete old cron history and read notifications', async () => {
      mockDbClient.query.mockResolvedValue({});
      await (service as unknown as CronServicePrivate).cleanupStaleData();
      expect(mockDbClient.query).toHaveBeenCalledTimes(2);
    });
  });
});
