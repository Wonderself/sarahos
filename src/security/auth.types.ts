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

/**
 * Extract authenticated user ID from request, or return null.
 * Handles both JWT-based users (userId) and API-key users (sub).
 */
export function getUserId(req: AuthenticatedRequest): string | null {
  return req.user?.userId ?? req.user?.sub ?? null;
}

/**
 * Extract authenticated user ID or throw 401.
 * Use in route handlers where userId is required.
 */
export function getUserIdOrFail(req: AuthenticatedRequest, res: import('express').Response): string | null {
  const userId = getUserId(req);
  if (!userId) {
    res.status(401).json({ error: 'User ID not found in token' });
    return null;
  }
  return userId;
}
