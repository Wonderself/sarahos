import type { Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { AuthenticatedRequest } from './auth.types';
import type { AccountTier } from '../users/user.types';
import { TIER_HIERARCHY } from '../users/user.types';

export function requireTier(...requiredTiers: AccountTier[]) {
  const minRequired = Math.min(...requiredTiers.map((t) => TIER_HIERARCHY[t]));

  return (req: AuthenticatedRequest, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({ error: 'Authentication required' });
      return;
    }

    // Env-key users (no tier in token) bypass tier checks — treated as "paid"
    if (!req.user.tier) {
      next();
      return;
    }

    const userTierLevel = TIER_HIERARCHY[req.user.tier];
    if (userTierLevel >= minRequired) {
      next();
      return;
    }

    logger.warn('Tier access denied', {
      userId: req.user.userId,
      currentTier: req.user.tier,
      requiredTiers,
    });

    res.status(403).json({
      error: 'Tier upgrade required',
      currentTier: req.user.tier,
      requiredTiers,
    });
  };
}
