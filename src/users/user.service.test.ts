jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../utils/config', () => ({
  config: {
    DEMO_DEFAULT_DAYS: 7,
    GUEST_DAILY_LIMIT: 10,
    FREE_DAILY_LIMIT: 100,
    PAID_DAILY_LIMIT: 10000,
  },
}));

jest.mock('./user.repository', () => {
  const mockUser = {
    id: 'user-1',
    email: 'test@example.com',
    displayName: 'Test User',
    apiKey: 'test-key-123',
    role: 'viewer' as const,
    tier: 'free' as const,
    isActive: true,
    dailyApiCalls: 0,
    dailyApiLimit: 100,
    demoExpiresAt: null,
    promoCodeUsed: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    lastLoginAt: null,
  };

  return {
    userRepository: {
      create: jest.fn().mockResolvedValue({ ...mockUser }),
      findByApiKey: jest.fn().mockResolvedValue(null),
      findById: jest.fn().mockResolvedValue(null),
      findByEmail: jest.fn().mockResolvedValue(null),
      findAll: jest.fn().mockResolvedValue([]),
      update: jest.fn().mockResolvedValue({ ...mockUser }),
      deactivate: jest.fn().mockResolvedValue(true),
      regenerateApiKey: jest.fn().mockResolvedValue('new-key-456'),
      incrementDailyApiCalls: jest.fn().mockResolvedValue(1),
      resetDailyApiCalls: jest.fn().mockResolvedValue(5),
      updateLastLogin: jest.fn().mockResolvedValue(undefined),
      getStats: jest.fn().mockResolvedValue({ byTier: { free: 3 }, active: 3, totalDailyCalls: 50 }),
    },
  };
});

import { UserService } from './user.service';
import { userRepository } from './user.repository';
import { TIER_HIERARCHY } from './user.types';

describe('UserService', () => {
  let service: UserService;

  beforeEach(() => {
    jest.clearAllMocks();
    service = new UserService();
  });

  describe('createUser', () => {
    it('should create a paid-tier user (free access model)', async () => {
      const user = await service.createUser({ email: 'new@test.com', displayName: 'New User' });
      expect(user).toBeDefined();
      expect(user.email).toBe('test@example.com');
      expect(userRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({ email: 'new@test.com', tier: 'paid', role: 'viewer' }),
      );
    });

    it('should reject duplicate email', async () => {
      (userRepository.findByEmail as jest.Mock).mockResolvedValueOnce({ id: 'existing' });
      await expect(service.createUser({ email: 'dup@test.com', displayName: 'Dup' })).rejects.toThrow(
        'Email already registered',
      );
    });

    it('should set demo expiry for demo tier', async () => {
      const demoUser = {
        id: 'user-2',
        email: 'demo@test.com',
        displayName: 'Demo',
        apiKey: 'demo-key',
        role: 'viewer' as const,
        tier: 'demo' as const,
        isActive: true,
        dailyApiCalls: 0,
        dailyApiLimit: 100,
        demoExpiresAt: null,
        promoCodeUsed: null,
        createdAt: new Date(),
        updatedAt: new Date(),
        lastLoginAt: null,
      };
      (userRepository.create as jest.Mock).mockResolvedValueOnce(demoUser);
      (userRepository.update as jest.Mock).mockResolvedValueOnce(demoUser);

      const user = await service.createUser({ email: 'demo@test.com', displayName: 'Demo', tier: 'demo' });
      expect(user).toBeDefined();
      expect(userRepository.update).toHaveBeenCalledWith('user-2', expect.objectContaining({ demoExpiresAt: expect.any(Date) }));
    });

    it('should throw if DB unavailable', async () => {
      (userRepository.create as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.createUser({ email: 'fail@test.com', displayName: 'Fail' })).rejects.toThrow(
        'database unavailable',
      );
    });
  });

  describe('authenticateByApiKey', () => {
    it('should return user for valid key', async () => {
      const user = { id: 'user-1', isActive: true, tier: 'free', demoExpiresAt: null };
      (userRepository.findByApiKey as jest.Mock).mockResolvedValueOnce(user);

      const result = await service.authenticateByApiKey('valid-key');
      expect(result).toEqual(user);
      expect(userRepository.updateLastLogin).toHaveBeenCalledWith('user-1');
    });

    it('should return null for unknown key', async () => {
      const result = await service.authenticateByApiKey('unknown');
      expect(result).toBeNull();
    });

    it('should reject deactivated user', async () => {
      (userRepository.findByApiKey as jest.Mock).mockResolvedValueOnce({ id: 'user-1', isActive: false });
      const result = await service.authenticateByApiKey('deactivated-key');
      expect(result).toBeNull();
    });

    it('should reject expired demo', async () => {
      const expired = new Date();
      expired.setDate(expired.getDate() - 1);
      (userRepository.findByApiKey as jest.Mock).mockResolvedValueOnce({
        id: 'user-1',
        isActive: true,
        tier: 'demo',
        demoExpiresAt: expired,
      });
      const result = await service.authenticateByApiKey('expired-demo-key');
      expect(result).toBeNull();
    });
  });

  describe('checkTierAccess', () => {
    it('should allow paid to access all tiers', () => {
      expect(service.checkTierAccess('paid', 'guest')).toBe(true);
      expect(service.checkTierAccess('paid', 'demo')).toBe(true);
      expect(service.checkTierAccess('paid', 'free')).toBe(true);
      expect(service.checkTierAccess('paid', 'paid')).toBe(true);
    });

    it('should restrict guest from higher tiers', () => {
      expect(service.checkTierAccess('guest', 'guest')).toBe(true);
      expect(service.checkTierAccess('guest', 'demo')).toBe(false);
      expect(service.checkTierAccess('guest', 'free')).toBe(false);
      expect(service.checkTierAccess('guest', 'paid')).toBe(false);
    });
  });

  describe('checkDailyLimit', () => {
    it('should allow when under limit', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValueOnce({ dailyApiCalls: 5, dailyApiLimit: 100 });
      const result = await service.checkDailyLimit('user-1');
      expect(result).toEqual({ allowed: true, used: 5, limit: 100 });
    });

    it('should deny when at limit', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValueOnce({ dailyApiCalls: 100, dailyApiLimit: 100 });
      const result = await service.checkDailyLimit('user-1');
      expect(result).toEqual({ allowed: false, used: 100, limit: 100 });
    });
  });

  describe('tier hierarchy', () => {
    it('should have correct order', () => {
      expect(TIER_HIERARCHY.guest).toBeLessThan(TIER_HIERARCHY.demo);
      expect(TIER_HIERARCHY.demo).toBeLessThan(TIER_HIERARCHY.free);
      expect(TIER_HIERARCHY.free).toBeLessThan(TIER_HIERARCHY.paid);
    });
  });

  describe('updateUser', () => {
    it('should update daily limit when tier changes', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValueOnce({ id: 'user-1', tier: 'free' });
      await service.updateUser('user-1', { tier: 'paid' });
      expect(userRepository.update).toHaveBeenCalledWith('user-1', expect.objectContaining({ tier: 'paid', dailyApiLimit: 10000 }));
    });

    it('should throw for non-existent user', async () => {
      (userRepository.findById as jest.Mock).mockResolvedValueOnce(null);
      await expect(service.updateUser('no-such', { tier: 'paid' })).rejects.toThrow('User not found');
    });
  });
});
