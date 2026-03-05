jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockTxClient = {
  query: jest.fn(),
};

const mockDbClient = {
  isConnected: jest.fn().mockReturnValue(true),
  query: jest.fn(),
  withTransaction: jest.fn(),
};

jest.mock('../infra', () => ({
  dbClient: mockDbClient,
}));

import { WalletService } from './wallet.service';

const walletRow = (overrides: Record<string, unknown> = {}) => ({
  id: 'w1', user_id: 'u1', balance_credits: 5000000, total_deposited: 10000000,
  total_spent: 5000000, currency: 'credits', auto_topup_enabled: false,
  auto_topup_threshold: 0, auto_topup_amount: 0, stripe_customer_id: null,
  created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  ...overrides,
});

describe('WalletService', () => {
  let service: WalletService;

  beforeEach(() => {
    service = new WalletService();
    jest.clearAllMocks();
    mockDbClient.isConnected.mockReturnValue(true);
    mockDbClient.withTransaction.mockImplementation(
      async (fn: (client: typeof mockTxClient) => Promise<unknown>) => fn(mockTxClient),
    );
  });

  describe('getOrCreateWallet', () => {
    it('should return existing wallet', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [walletRow()] });

      const wallet = await service.getOrCreateWallet('u1');
      expect(wallet).not.toBeNull();
      expect(wallet!.userId).toBe('u1');
      expect(wallet!.balanceCredits).toBe(5000000);
    });

    it('should create wallet if none exists', async () => {
      // Single INSERT ... ON CONFLICT query
      mockDbClient.query.mockResolvedValueOnce({
        rows: [walletRow({ id: 'w-new', user_id: 'u2', balance_credits: 0, total_deposited: 0, total_spent: 0 })],
      });

      const wallet = await service.getOrCreateWallet('u2');
      expect(wallet).not.toBeNull();
      expect(wallet!.balanceCredits).toBe(0);
      expect(mockDbClient.query).toHaveBeenCalledTimes(1);
    });

    it('should return null if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const wallet = await service.getOrCreateWallet('u1');
      expect(wallet).toBeNull();
    });
  });

  describe('deposit', () => {
    it('should deposit credits atomically via withTransaction', async () => {
      // getOrCreateWallet → existing wallet
      mockDbClient.query.mockResolvedValueOnce({
        rows: [walletRow({ balance_credits: 1000, total_deposited: 5000, total_spent: 4000 })],
      });

      // Inside withTransaction: SELECT FOR UPDATE
      mockTxClient.query.mockResolvedValueOnce({
        rows: [walletRow({ balance_credits: 1000, total_deposited: 5000, total_spent: 4000 })],
      });
      // UPDATE wallets
      mockTxClient.query.mockResolvedValueOnce({});
      // INSERT transaction RETURNING
      mockTxClient.query.mockResolvedValueOnce({
        rows: [{
          id: 'tx1', wallet_id: 'w1', user_id: 'u1', type: 'deposit',
          amount: 5000, balance_after: 6000, description: 'Test deposit',
          reference_type: 'manual', reference_id: null, metadata: {},
          created_at: new Date().toISOString(),
        }],
      });

      const tx = await service.deposit({
        userId: 'u1', amount: 5000, description: 'Test deposit', referenceType: 'manual',
      });

      expect(tx).not.toBeNull();
      expect(tx!.amount).toBe(5000);
      expect(mockDbClient.withTransaction).toHaveBeenCalled();
    });

    it('should propagate error on transaction failure', async () => {
      // getOrCreateWallet
      mockDbClient.query.mockResolvedValueOnce({
        rows: [walletRow({ balance_credits: 1000 })],
      });

      // Inside withTransaction: SELECT FOR UPDATE succeeds
      mockTxClient.query.mockResolvedValueOnce({
        rows: [walletRow({ balance_credits: 1000 })],
      });
      // UPDATE fails
      mockTxClient.query.mockRejectedValueOnce(new Error('DB error'));

      await expect(service.deposit({
        userId: 'u1', amount: 500, description: 'Fail', referenceType: 'test',
      })).rejects.toThrow('DB error');
    });
  });

  describe('withdraw', () => {
    it('should return null for insufficient balance', async () => {
      // getWalletByUserId
      mockDbClient.query.mockResolvedValueOnce({
        rows: [walletRow({ balance_credits: 100, total_deposited: 1000, total_spent: 900 })],
      });

      // Inside withTransaction: SELECT FOR UPDATE → locked wallet with 100 balance
      mockTxClient.query.mockResolvedValueOnce({
        rows: [walletRow({ balance_credits: 100, total_deposited: 1000, total_spent: 900 })],
      });

      const tx = await service.withdraw('u1', 500, 'Over-withdrawal', 'test');
      expect(tx).toBeNull();
    });

    it('should return null if no wallet exists', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });
      const tx = await service.withdraw('u1', 500, 'No wallet', 'test');
      expect(tx).toBeNull();
    });
  });

  describe('hasBalance', () => {
    it('should return true if sufficient', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [walletRow({ balance_credits: 10000 })],
      });
      expect(await service.hasBalance('u1', 5000)).toBe(true);
    });

    it('should return false if insufficient', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [walletRow({ balance_credits: 100 })],
      });
      expect(await service.hasBalance('u1', 5000)).toBe(false);
    });

    it('should return false if no wallet', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });
      expect(await service.hasBalance('u1', 1)).toBe(false);
    });
  });

  describe('getTransactions', () => {
    it('should return empty array if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      expect(await service.getTransactions('u1')).toEqual([]);
    });
  });

  describe('getPlatformStats', () => {
    it('should return zero stats if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const stats = await service.getPlatformStats();
      expect(stats.totalRevenue).toBe(0);
      expect(stats.activeWallets).toBe(0);
    });
  });
});
