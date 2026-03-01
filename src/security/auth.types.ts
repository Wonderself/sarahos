import type { Request } from 'express';
import type { AccountTier } from '../users/user.types';

export type UserRole = 'admin' | 'operator' | 'viewer' | 'system';

export interface TokenPayload {
  sub: string;
  role: UserRole;
  iat: number;
  exp: number;
  userId?: string;
  tier?: AccountTier;
}

export interface AuthenticatedRequest extends Request {
  user?: TokenPayload;
  requestId?: string;
}

export interface LoginResponse {
  token: string;
  expiresIn: string;
  role: UserRole;
  userId?: string;
  tier?: AccountTier;
}
