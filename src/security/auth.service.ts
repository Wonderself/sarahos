import jwt from 'jsonwebtoken';
import type { SignOptions } from 'jsonwebtoken';
import { config } from '../utils/config';
import { logger } from '../utils/logger';
import type { UserRole, TokenPayload, LoginResponse } from './auth.types';
import type { AccountTier } from '../users/user.types';

export class AuthService {
  private readonly jwtSecret: string;
  private readonly jwtExpiresIn: string;
  private readonly apiKeyMap: Map<string, UserRole>;

  constructor() {
    this.jwtSecret = config.JWT_SECRET;
    this.jwtExpiresIn = config.JWT_EXPIRES_IN ?? '24h';
    this.apiKeyMap = this.buildApiKeyMap();
  }

  private buildApiKeyMap(): Map<string, UserRole> {
    const map = new Map<string, UserRole>();

    const adminKeys = (config.API_KEYS_ADMIN ?? '').split(',').filter(Boolean);
    const operatorKeys = (config.API_KEYS_OPERATOR ?? '').split(',').filter(Boolean);
    const viewerKeys = (config.API_KEYS_VIEWER ?? '').split(',').filter(Boolean);
    const systemKeys = (config.API_KEYS_SYSTEM ?? '').split(',').filter(Boolean);

    for (const key of adminKeys) map.set(key.trim(), 'admin');
    for (const key of operatorKeys) map.set(key.trim(), 'operator');
    for (const key of viewerKeys) map.set(key.trim(), 'viewer');
    for (const key of systemKeys) map.set(key.trim(), 'system');

    return map;
  }

  generateToken(sub: string, role: UserRole, opts?: { userId?: string; tier?: AccountTier }): string {
    const options: SignOptions = {
      expiresIn: this.jwtExpiresIn as SignOptions['expiresIn'],
    };
    const payload: Record<string, unknown> = { sub, role };
    if (opts?.userId) payload['userId'] = opts.userId;
    if (opts?.tier) payload['tier'] = opts.tier;
    return jwt.sign(payload, this.jwtSecret, options);
  }

  verifyToken(token: string): TokenPayload {
    const decoded = jwt.verify(token, this.jwtSecret) as TokenPayload;
    return decoded;
  }

  login(apiKey: string): LoginResponse | null {
    // Legacy env-key login
    const role = this.apiKeyMap.get(apiKey);
    if (role) {
      const token = this.generateToken(`apikey-${role}`, role);
      logger.info('Login successful (env key)', { role });
      return { token, expiresIn: this.jwtExpiresIn, role };
    }

    logger.warn('Login attempt with invalid API key');
    return null;
  }

  async loginWithUserDb(apiKey: string): Promise<LoginResponse | null> {
    // Lazy import to avoid circular dependency
    const { userService } = await import('../users/user.service');

    const user = await userService.authenticateByApiKey(apiKey);
    if (user) {
      const token = this.generateToken(user.email, user.role, { userId: user.id, tier: user.tier });
      logger.info('Login successful (user account)', { userId: user.id, role: user.role, tier: user.tier });
      return { token, expiresIn: this.jwtExpiresIn, role: user.role, userId: user.id, tier: user.tier };
    }

    return null;
  }

  async loginDual(apiKey: string): Promise<LoginResponse | null> {
    // Try user DB first, then fall back to env keys
    const userResult = await this.loginWithUserDb(apiKey);
    if (userResult) return userResult;

    return this.login(apiKey);
  }

  getRoleHierarchy(role: UserRole): number {
    const hierarchy: Record<UserRole, number> = {
      viewer: 1,
      operator: 2,
      system: 3,
      admin: 4,
    };
    return hierarchy[role];
  }

  hasMinRole(userRole: UserRole, requiredRole: UserRole): boolean {
    return this.getRoleHierarchy(userRole) >= this.getRoleHierarchy(requiredRole);
  }
}

export const authService = new AuthService();
