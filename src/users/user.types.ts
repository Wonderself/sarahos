import type { UserRole } from '../security/auth.types';

export type AccountTier = 'guest' | 'demo' | 'free' | 'paid';

export interface User {
  id: string;
  email: string;
  displayName: string;
  apiKey: string;
  role: UserRole;
  tier: AccountTier;
  isActive: boolean;
  dailyApiCalls: number;
  dailyApiLimit: number;
  demoExpiresAt: Date | null;
  promoCodeUsed: string | null;
  emailConfirmed: boolean;
  activeAgents: string[];
  userNumber: number;
  commissionRate: number;
  referralCode: string | null;
  referredBy: string | null;
  createdAt: Date;
  updatedAt: Date;
  lastLoginAt: Date | null;
}

export interface CreateUserInput {
  email: string;
  displayName: string;
  password?: string;
  role?: UserRole;
  tier?: AccountTier;
  apiKey?: string; // optional override (for seed data)
  activeAgents?: string[];
  referredBy?: string;
}

export interface UpdateUserInput {
  displayName?: string;
  role?: UserRole;
  tier?: AccountTier;
  isActive?: boolean;
  dailyApiLimit?: number;
  demoExpiresAt?: Date | null;
  activeAgents?: string[];
}

export interface UserFilters {
  role?: UserRole;
  tier?: AccountTier;
  isActive?: boolean;
  search?: string; // search email or displayName
}

export const TIER_HIERARCHY: Record<AccountTier, number> = {
  guest: 1,
  demo: 2,
  free: 3,
  paid: 4,
};

export const DEFAULT_DAILY_LIMITS: Record<AccountTier, number> = {
  guest: 10,
  demo: 100,
  free: 100,
  paid: 10000,
};
