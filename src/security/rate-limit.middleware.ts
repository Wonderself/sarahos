import type { Request, Response, NextFunction } from 'express';
import { RateLimiter } from '../utils/rate-limiter';

export interface RateLimitConfig {
  maxRequests: number;
  windowMs: number;
}

export function createRateLimitMiddleware(options: RateLimitConfig) {
  const limiter = new RateLimiter({
    maxRequests: options.maxRequests,
    windowMs: options.windowMs,
  });

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip ?? req.socket.remoteAddress ?? 'unknown';

    res.setHeader('X-RateLimit-Limit', String(options.maxRequests));
    res.setHeader('X-RateLimit-Remaining', String(limiter.getRemainingRequests(key)));

    const resetTime = limiter.getResetTime(key);
    if (resetTime > 0) {
      res.setHeader('X-RateLimit-Reset', String(Math.ceil(resetTime / 1000)));
    }

    if (!limiter.record(key)) {
      res.status(429).json({
        error: 'Too many requests',
        retryAfterMs: limiter.getResetTime(key),
      });
      return;
    }

    next();
  };
}
