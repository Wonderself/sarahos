import type { Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import { config } from '../utils/config';
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

  // CORS
  app.use(cors({
    origin: config.DASHBOARD_ORIGIN,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
  }));

  // Request logging
  app.use(requestLogger);

  // Global rate limiting
  app.use(createRateLimitMiddleware({
    maxRequests: config.RATE_LIMIT_MAX,
    windowMs: config.RATE_LIMIT_WINDOW_MS,
  }));
}
