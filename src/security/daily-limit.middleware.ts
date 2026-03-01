import type { Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { AuthenticatedRequest } from './auth.types';

export async function checkDailyLimit(req: AuthenticatedRequest, res: Response, next: NextFunction): Promise<void> {
  if (!req.user) {
    res.status(401).json({ error: 'Authentication required' });
    return;
  }

  // Env-key users (no userId in token) bypass daily limits
  if (!req.user.userId) {
    next();
    return;
  }

  try {
    const { userService } = await import('../users/user.service');
    const { allowed, used, limit } = await userService.checkDailyLimit(req.user.userId);

    if (!allowed) {
      logger.warn('Daily API limit reached', { userId: req.user.userId, used, limit });
      res.status(429).json({
        error: 'Daily API limit reached',
        used,
        limit,
      });
      return;
    }

    // Increment counter
    await userService.incrementDailyApiCalls(req.user.userId);
    next();
  } catch {
    // If user service fails, allow the request (graceful degradation)
    next();
  }
}
