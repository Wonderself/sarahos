import type { Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { logger } from '../utils/logger';
import type { AuthenticatedRequest, UserRole } from './auth.types';

/**
 * Check if a user is still active (Redis cache with DB fallback).
 * Fail-closed: returns false if both Redis and DB are unavailable (prevents deactivated users from accessing API).
 */
async function checkUserActive(userId: string): Promise<boolean> {
  // Try Redis cache first (60s TTL)
  try {
    const { redisClient } = await import('../infra/redis/redis-client');
    if (redisClient.isConnected()) {
      const cached = await redisClient.get(`user:active:${userId}`);
      if (cached !== null) return cached === '1';
    }
  } catch { /* fallback to DB */ }

  // Fallback to DB
  try {
    const { dbClient } = await import('../infra');
    if (dbClient.isConnected()) {
      const result = await dbClient.query(
        'SELECT is_active FROM users WHERE id = $1',
        [userId],
      );
      const isActive = result.rows[0]?.['is_active'] === true;

      // Cache in Redis for 60 seconds
      try {
        const { redisClient } = await import('../infra/redis/redis-client');
        if (redisClient.isConnected()) {
          await redisClient.set(`user:active:${userId}`, isActive ? '1' : '0', 60);
        }
      } catch { /* best effort */ }

      return isActive;
    }
  } catch { /* if DB fails, deny access */ }

  // Fail-closed: deny access if infrastructure is down (security-first)
  logger.warn('checkUserActive: both Redis and DB unavailable, denying access', { userId });
  return false;
}

export async function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;

    // Check if user is still active (prevents deactivated users from accessing API)
    const userId = payload.userId ?? payload.sub;
    if (userId && /^[0-9a-f]{8}-/.test(userId)) {
      const isActive = await checkUserActive(userId);
      if (!isActive) {
        res.status(401).json({ error: 'Account deactivated' });
        return;
      }

      // Check if password was changed after this JWT was issued (revokes stolen tokens)
      try {
        const { redisClient } = await import('../infra/redis/redis-client');
        if (redisClient.isConnected()) {
          const pwdChanged = await redisClient.get(`user:pwd_changed:${userId}`);
          if (pwdChanged && payload.iat && Number(pwdChanged) > payload.iat) {
            res.status(401).json({ error: 'Session invalidated — password changed' });
            return;
          }
        }
      } catch { /* if Redis unavailable, skip check — JWT will expire naturally */ }

      // Check demo account expiry (prevents expired demo users from using valid JWTs)
      if (payload.tier === 'demo') {
        try {
          const { redisClient } = await import('../infra/redis/redis-client');
          let demoExpiry: string | null = null;
          if (redisClient.isConnected()) {
            demoExpiry = await redisClient.get(`user:demo_expires:${userId}`);
          }
          if (!demoExpiry) {
            // Cache miss — check DB
            const { dbClient: db } = await import('../infra');
            if (db.isConnected()) {
              const result = await db.query('SELECT demo_expires_at FROM users WHERE id = $1', [userId]);
              const expiresAt = result.rows[0]?.['demo_expires_at'] as string | null;
              if (expiresAt) {
                demoExpiry = new Date(expiresAt).toISOString();
                try {
                  const { redisClient: rc } = await import('../infra/redis/redis-client');
                  if (rc.isConnected()) await rc.set(`user:demo_expires:${userId}`, demoExpiry, 60);
                } catch { /* best effort */ }
              }
            }
          }
          if (demoExpiry && new Date(demoExpiry) < new Date()) {
            res.status(401).json({ error: 'Demo account expired' });
            return;
          }
        } catch { /* if check fails, allow through — demo will be caught by cron */ }
      }
    }

    next();
  } catch (error) {
    logger.debug('Token verification failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    res.status(401).json({ error: 'Invalid or expired token' });
  }
}

export function requireRole(...roles: UserRole[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Admin always has access
    if (req.user.role === 'admin') {
      next();
      return;
    }

    if (!roles.includes(req.user.role)) {
      logger.warn('Access denied — insufficient role', {
        userId: req.user.sub,
        userRole: req.user.role,
        requiredRoles: roles,
      });
      res.status(403).json({ error: 'Insufficient permissions' });
      return;
    }

    next();
  };
}
