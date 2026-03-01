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

const mockPromoService = {
  createCode: jest.fn(),
  listCodes: jest.fn(),
  deactivateCode: jest.fn(),
  findByCode: jest.fn(),
  validateCode: jest.fn(),
  redeemCode: jest.fn(),
};

jest.mock('../../users/promo.service', () => ({
  promoService: mockPromoService,
}));

import express from 'express';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { createPromoRouter } from './promo.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(createPromoRouter());
  return app;
}

const authService = new AuthService();

function adminToken(): string {
  return authService.generateToken('admin-user', 'admin', { userId: 'admin-1' });
}

function userToken(): string {
  return authService.generateToken('regular-user', 'viewer', { userId: 'user-1', tier: 'free' });
}

const samplePromo = {
  id: 'promo-1',
  code: 'WELCOME2024',
  description: 'Welcome offer',
  effectType: 'tier_upgrade',
  effectValue: 'free',
  maxUses: 100,
  currentUses: 5,
  isActive: true,
  expiresAt: null,
  createdBy: 'admin',
  createdAt: new Date(),
};

describe('Promo Routes', () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/promo-codes', () => {
    it('should create promo code as admin', async () => {
      mockPromoService.createCode.mockResolvedValue(samplePromo);

      const res = await request(app)
        .post('/admin/promo-codes')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          code: 'WELCOME2024',
          effectType: 'tier_upgrade',
          effectValue: 'free',
          maxUses: 100,
        });

      expect(res.status).toBe(201);
      expect(res.body.code).toBe('WELCOME2024');
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .post('/admin/promo-codes')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({
          code: 'HACK',
          effectType: 'tier_upgrade',
          effectValue: 'paid',
          maxUses: 1,
        });

      expect(res.status).toBe(403);
    });

    it('should reject invalid code format', async () => {
      const res = await request(app)
        .post('/admin/promo-codes')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({
          code: 'no spaces allowed!',
          effectType: 'tier_upgrade',
          effectValue: 'free',
        });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /admin/promo-codes', () => {
    it('should list codes as admin', async () => {
      mockPromoService.listCodes.mockResolvedValue([samplePromo]);

      const res = await request(app)
        .get('/admin/promo-codes')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.codes).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });
  });

  describe('DELETE /admin/promo-codes/:code', () => {
    it('should deactivate code', async () => {
      mockPromoService.deactivateCode.mockResolvedValue(true);

      const res = await request(app)
        .delete('/admin/promo-codes/WELCOME2024')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('deactivated');
    });

    it('should return 404 for unknown code', async () => {
      mockPromoService.deactivateCode.mockResolvedValue(false);

      const res = await request(app)
        .delete('/admin/promo-codes/NOPE')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /promo/redeem', () => {
    it('should redeem code for authenticated user', async () => {
      mockPromoService.redeemCode.mockResolvedValue({
        success: true,
        message: 'Promo code WELCOME2024 applied successfully',
        effect: { type: 'tier_upgrade', value: 'free' },
      });

      const res = await request(app)
        .post('/promo/redeem')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ code: 'WELCOME2024' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
    });

    it('should return 400 for failed redemption', async () => {
      mockPromoService.redeemCode.mockResolvedValue({
        success: false,
        message: 'Promo code has expired',
      });

      const res = await request(app)
        .post('/promo/redeem')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ code: 'EXPIRED' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /promo/validate/:code', () => {
    it('should validate existing code', async () => {
      mockPromoService.findByCode.mockResolvedValue(samplePromo);
      mockPromoService.validateCode.mockReturnValue({ valid: true });

      const res = await request(app)
        .get('/promo/validate/WELCOME2024')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.valid).toBe(true);
    });

    it('should return 404 for unknown code', async () => {
      mockPromoService.findByCode.mockResolvedValue(null);

      const res = await request(app)
        .get('/promo/validate/NOPE')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(404);
      expect(res.body.valid).toBe(false);
    });
  });
});
