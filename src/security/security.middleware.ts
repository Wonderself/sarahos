import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../utils/config';
import { SECURITY_HEADERS } from '../core/guardrails/security-hardening';
import { createRateLimitMiddleware } from './rate-limit.middleware';
import { requestLogger } from './request-logger.middleware';
import { requestIdMiddleware } from './request-id.middleware';

export function applySecurityMiddleware(app: Express): void {
  // Request ID (must be first)
  app.use(requestIdMiddleware);

  // Security headers
  app.use(helmet({
    contentSecurityPolicy: false, // API server, not serving HTML
  }));

  // Guardrails: Additional security headers
  app.use((_req, res, next) => {
    for (const [key, value] of Object.entries(SECURITY_HEADERS)) {
      res.setHeader(key, String(value));
    }
    next();
  });

  // CORS
  app.use(cors({
    origin: config.DASHBOARD_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  }));

  // Request logging
  app.use(requestLogger);

  // Strict rate limiting on auth endpoints (brute-force protection)
  const authLimiter = createRateLimitMiddleware({ maxRequests: 5, windowMs: 60_000 });
  app.use('/auth/login', authLimiter);
  app.use('/auth/register', createRateLimitMiddleware({ maxRequests: 3, windowMs: 60_000 }));
  app.use('/auth/forgot-password', createRateLimitMiddleware({ maxRequests: 3, windowMs: 60_000 }));
  app.use('/auth/reset-password', createRateLimitMiddleware({ maxRequests: 3, windowMs: 60_000 }));

  // Global rate limiting
  app.use(createRateLimitMiddleware({
    maxRequests: config.RATE_LIMIT_MAX,
    windowMs: config.RATE_LIMIT_WINDOW_MS,
  }));
}
