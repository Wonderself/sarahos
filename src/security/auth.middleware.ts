import type { Response, NextFunction } from 'express';
import { authService } from './auth.service';
import { logger } from '../utils/logger';
import type { AuthenticatedRequest, UserRole } from './auth.types';

export function verifyToken(req: AuthenticatedRequest, res: Response, next: NextFunction): void {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Missing or invalid Authorization header' });
    return;
  }

  const token = authHeader.slice(7);

  try {
    const payload = authService.verifyToken(token);
    req.user = payload;
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
