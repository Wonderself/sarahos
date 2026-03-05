import { logger } from '../utils/logger';
import { userRepository } from './user.repository';
import type { User, CreateUserInput, UpdateUserInput, UserFilters, AccountTier } from './user.types';
import { TIER_HIERARCHY, DEFAULT_DAILY_LIMITS } from './user.types';
import { config } from '../utils/config';

export class UserService {
  async createUser(input: CreateUserInput): Promise<User> {
    const existing = await userRepository.findByEmail(input.email);
    if (existing) {
      throw new Error('Email already registered');
    }

    const tier = input.tier ?? 'free';
    const user = await userRepository.create({
      ...input,
      tier,
      role: input.role ?? 'viewer',
    });

    if (!user) {
      throw new Error('Failed to create user — database unavailable');
    }

    // Set demo expiry if tier is demo
    if (tier === 'demo') {
      const demoExpiresAt = new Date();
      demoExpiresAt.setDate(demoExpiresAt.getDate() + (config.DEMO_DEFAULT_DAYS ?? 7));
      await userRepository.update(user.id, { demoExpiresAt });
      user.demoExpiresAt = demoExpiresAt;
    }

    logger.info('User created', { userId: user.id, email: user.email, role: user.role, tier: user.tier });
    return user;
  }

  async authenticateByApiKey(apiKey: string): Promise<User | null> {
    const user = await userRepository.findByApiKey(apiKey);
    if (!user) return null;

    if (!user.isActive) {
      logger.warn('Login attempt for deactivated user', { userId: user.id });
      return null;
    }

    // Check demo expiry
    if (user.tier === 'demo' && user.demoExpiresAt && new Date() > user.demoExpiresAt) {
      logger.warn('Login attempt with expired demo', { userId: user.id });
      return null;
    }

    await userRepository.updateLastLogin(user.id);
    return user;
  }

  async getUser(id: string): Promise<User | null> {
    return userRepository.findById(id);
  }

  async getUserByEmail(email: string): Promise<User | null> {
    return userRepository.findByEmail(email);
  }

  async listUsers(filters?: UserFilters): Promise<User[]> {
    return userRepository.findAll(filters);
  }

  async countUsers(filters?: UserFilters): Promise<number> {
    return userRepository.countAll(filters);
  }

  async updateUser(id: string, input: UpdateUserInput): Promise<User> {
    const user = await userRepository.findById(id);
    if (!user) {
      throw new Error('User not found');
    }

    // If tier changes, update daily limit to match new tier default (unless custom limit set)
    if (input.tier && input.tier !== user.tier && input.dailyApiLimit === undefined) {
      input.dailyApiLimit = DEFAULT_DAILY_LIMITS[input.tier];
    }

    // If tier changes to demo, set demo expiry
    if (input.tier === 'demo' && user.tier !== 'demo') {
      const demoExpiresAt = new Date();
      demoExpiresAt.setDate(demoExpiresAt.getDate() + (config.DEMO_DEFAULT_DAYS ?? 7));
      input.demoExpiresAt = demoExpiresAt;
    }

    const updated = await userRepository.update(id, input);
    if (!updated) {
      throw new Error('Failed to update user');
    }

    logger.info('User updated', { userId: id, changes: Object.keys(input) });
    return updated;
  }

  async deactivateUser(id: string): Promise<boolean> {
    const result = await userRepository.deactivate(id);
    if (result) {
      logger.info('User deactivated', { userId: id });
    }
    return result;
  }

  /**
   * GDPR: Permanently delete a user and all associated data.
   * Prevents deletion of system user.
   * Self-deletion is allowed via portal (isSelfService=true) but blocked for admins via admin endpoint.
   */
  async deleteUserData(userId: string, requestedBy: string, isSelfService = false): Promise<{ deleted: boolean; tablesAffected: string[] }> {
    // Safety: prevent deleting system user
    if (userId === '00000000-0000-0000-0000-000000000000') {
      throw new Error('Cannot delete system user');
    }

    // Safety: block admin self-deletion via admin endpoint (but allow self-service portal deletion)
    if (userId === requestedBy && !isSelfService) {
      const user = await userRepository.findById(requestedBy);
      if (user?.role === 'admin') {
        throw new Error('Cannot delete your own admin account via admin endpoint');
      }
    }

    const user = await userRepository.findById(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const result = await userRepository.deleteUser(userId);
    if (result.deleted) {
      logger.info('GDPR user data deleted', { userId, email: user.email, requestedBy, tablesAffected: result.tablesAffected });
    }

    return result;
  }

  async regenerateApiKey(id: string): Promise<string> {
    const newKey = await userRepository.regenerateApiKey(id);
    if (!newKey) {
      throw new Error('Failed to regenerate API key');
    }
    logger.info('API key regenerated', { userId: id });
    return newKey;
  }

  checkTierAccess(userTier: AccountTier, requiredTier: AccountTier): boolean {
    return TIER_HIERARCHY[userTier] >= TIER_HIERARCHY[requiredTier];
  }

  async checkDailyLimit(userId: string): Promise<{ allowed: boolean; used: number; limit: number }> {
    const user = await userRepository.findById(userId);
    if (!user) return { allowed: false, used: 0, limit: 0 };

    return {
      allowed: user.dailyApiCalls < user.dailyApiLimit,
      used: user.dailyApiCalls,
      limit: user.dailyApiLimit,
    };
  }

  async incrementDailyApiCalls(userId: string): Promise<number> {
    return userRepository.incrementDailyApiCalls(userId);
  }

  async resetAllDailyApiCalls(): Promise<number> {
    const count = await userRepository.resetDailyApiCalls();
    logger.info('Daily API calls reset', { usersReset: count });
    return count;
  }

  async getStats(): Promise<{ byTier: Record<string, number>; active: number; totalDailyCalls: number }> {
    return userRepository.getStats();
  }
}

export const userService = new UserService();
