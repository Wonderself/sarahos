jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../utils/config', () => ({
  config: {
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    DEMO_DEFAULT_DAYS: 7,
  },
}));

const mockDbClient = {
  isConnected: jest.fn().mockReturnValue(true),
  query: jest.fn(),
};

jest.mock('../infra', () => ({
  dbClient: mockDbClient,
}));

jest.mock('./user.service', () => ({
  userService: {
    getUser: jest.fn(),
    updateUser: jest.fn(),
  },
}));

import { PromoService } from './promo.service';
import type { PromoCode } from './promo.types';

describe('PromoService', () => {
  let service: PromoService;

  beforeEach(() => {
    service = new PromoService();
    jest.clearAllMocks();
    mockDbClient.isConnected.mockReturnValue(true);
  });

  describe('validateCode', () => {
    const basePromo: PromoCode = {
      id: 'promo-1',
      code: 'TEST2024',
      description: 'Test promo',
      effectType: 'tier_upgrade',
      effectValue: 'free',
      maxUses: 10,
      currentUses: 0,
      isActive: true,
      expiresAt: null,
      createdBy: 'admin',
      createdAt: new Date(),
    };

    it('should validate active code', () => {
      expect(service.validateCode(basePromo)).toEqual({ valid: true });
    });

    it('should reject inactive code', () => {
      const result = service.validateCode({ ...basePromo, isActive: false });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('no longer active');
    });

    it('should reject expired code', () => {
      const expired = new Date();
      expired.setDate(expired.getDate() - 1);
      const result = service.validateCode({ ...basePromo, expiresAt: expired });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('expired');
    });

    it('should reject maxed out code', () => {
      const result = service.validateCode({ ...basePromo, currentUses: 10 });
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('maximum uses');
    });

    it('should accept code with future expiry', () => {
      const future = new Date();
      future.setDate(future.getDate() + 30);
      expect(service.validateCode({ ...basePromo, expiresAt: future })).toEqual({ valid: true });
    });
  });

  describe('createCode', () => {
    it('should create a promo code', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [{
          id: 'promo-1', code: 'WELCOME', description: '', effect_type: 'tier_upgrade',
          effect_value: 'free', max_uses: 100, current_uses: 0, is_active: true,
          expires_at: null, created_by: 'admin', created_at: new Date().toISOString(),
        }],
      });

      const result = await service.createCode({
        code: 'WELCOME',
        effectType: 'tier_upgrade',
        effectValue: 'free',
        maxUses: 100,
        createdBy: 'admin',
      });

      expect(result).not.toBeNull();
      expect(result!.code).toBe('WELCOME');
      expect(mockDbClient.query).toHaveBeenCalledTimes(1);
    });

    it('should return null if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await service.createCode({
        code: 'TEST', effectType: 'tier_upgrade', effectValue: 'free', createdBy: 'admin',
      });
      expect(result).toBeNull();
    });
  });

  describe('findByCode', () => {
    it('should find code case-insensitively', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [{
          id: 'p1', code: 'WELCOME', description: '', effect_type: 'tier_upgrade',
          effect_value: 'free', max_uses: 100, current_uses: 5, is_active: true,
          expires_at: null, created_by: 'admin', created_at: new Date().toISOString(),
        }],
      });

      const result = await service.findByCode('welcome');
      expect(result).not.toBeNull();
      expect(mockDbClient.query).toHaveBeenCalledWith(expect.any(String), ['WELCOME']);
    });

    it('should return null if not found', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });
      const result = await service.findByCode('NOPE');
      expect(result).toBeNull();
    });
  });

  describe('listCodes', () => {
    it('should return empty array if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const result = await service.listCodes();
      expect(result).toEqual([]);
    });
  });

  describe('redeemCode', () => {
    it('should return error for unknown code', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });
      const result = await service.redeemCode('UNKNOWN', 'user-1');
      expect(result.success).toBe(false);
      expect(result.message).toContain('not found');
    });
  });
});
