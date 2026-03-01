jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/config', () => ({
  config: {
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    API_KEYS_ADMIN: 'admin-key',
    API_KEYS_OPERATOR: '',
    API_KEYS_VIEWER: '',
    API_KEYS_SYSTEM: '',
  },
}));

const mockWalletService = {
  getOrCreateWallet: jest.fn(),
  deposit: jest.fn(),
  getTransactions: jest.fn(),
  getUsageSummary: jest.fn(),
  getPlatformStats: jest.fn(),
};

jest.mock('../../billing/wallet.service', () => ({
  walletService: mockWalletService,
}));

const mockLlmProxyService = {
  processRequest: jest.fn(),
};

jest.mock('../../billing/llm-proxy.service', () => ({
  llmProxyService: mockLlmProxyService,
}));

jest.mock('../../billing', () => ({
  TOKEN_PRICING: [{ model: 'test', provider: 'test', inputCostPerMillion: 100, outputCostPerMillion: 500, marginPercent: 20 }],
  MICRO_CREDITS_PER_CREDIT: 1000000,
}));

import express from 'express';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { createBillingRouter } from './billing.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(createBillingRouter());
  return app;
}

const authService = new AuthService();

function userToken(): string {
  return authService.generateToken('user-1', 'viewer', { userId: 'user-1', tier: 'free' });
}

function adminToken(): string {
  return authService.generateToken('admin-user', 'admin', { userId: 'admin-1' });
}

describe('Billing Routes', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp();
    jest.clearAllMocks();
  });

  describe('GET /billing/wallet', () => {
    it('should return wallet for authenticated user', async () => {
      mockWalletService.getOrCreateWallet.mockResolvedValue({ id: 'w1', balanceCredits: 5000 });

      const res = await request(app)
        .get('/billing/wallet')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.wallet).toBeDefined();
    });

    it('should reject unauthenticated request', async () => {
      const res = await request(app).get('/billing/wallet');
      expect(res.status).toBe(401);
    });
  });

  describe('POST /billing/deposit', () => {
    it('should accept valid deposit', async () => {
      mockWalletService.deposit.mockResolvedValue({ id: 'tx1', amount: 5000 });

      const res = await request(app)
        .post('/billing/deposit')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ userId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11', amount: 5000, description: 'Top-up', referenceType: 'manual' });

      expect(res.status).toBe(201);
      expect(res.body.transaction).toBeDefined();
    });

    it('should reject invalid deposit body', async () => {
      const res = await request(app)
        .post('/billing/deposit')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ amount: -100 });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /billing/transactions', () => {
    it('should return transaction history', async () => {
      mockWalletService.getTransactions.mockResolvedValue([]);

      const res = await request(app)
        .get('/billing/transactions')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.transactions).toEqual([]);
    });
  });

  describe('GET /billing/usage', () => {
    it('should return usage summary', async () => {
      mockWalletService.getUsageSummary.mockResolvedValue({
        totalRequests: 10, totalInputTokens: 1000, totalOutputTokens: 500,
        totalCostCredits: 200, totalBilledCredits: 240, totalMarginCredits: 40, byModel: {},
      });

      const res = await request(app)
        .get('/billing/usage')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.usage.totalRequests).toBe(10);
    });
  });

  describe('GET /billing/pricing', () => {
    it('should return pricing info', async () => {
      const res = await request(app)
        .get('/billing/pricing')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.pricing).toBeDefined();
    });
  });

  describe('POST /billing/llm', () => {
    it('should proxy LLM request', async () => {
      mockLlmProxyService.processRequest.mockResolvedValue({
        content: 'Hello!', model: 'test', inputTokens: 10, outputTokens: 5,
        totalTokens: 15, costCredits: 100, billedCredits: 120, durationMs: 50,
      });

      const res = await request(app)
        .post('/billing/llm')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });

      expect(res.status).toBe(200);
      expect(res.body.content).toBe('Hello!');
    });

    it('should return 402 for insufficient balance', async () => {
      mockLlmProxyService.processRequest.mockResolvedValue({
        error: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE',
      });

      const res = await request(app)
        .post('/billing/llm')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ model: 'test', messages: [{ role: 'user', content: 'Hi' }] });

      expect(res.status).toBe(402);
    });
  });

  describe('GET /billing/admin/stats', () => {
    it('should return platform stats for admin', async () => {
      mockWalletService.getPlatformStats.mockResolvedValue({
        totalRevenue: 10000, totalMargin: 2000, totalRequests: 50,
        activeWallets: 5, totalBalance: 50000,
      });

      const res = await request(app)
        .get('/billing/admin/stats')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.stats.totalRevenue).toBe(10000);
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .get('/billing/admin/stats')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(403);
    });
  });
});
