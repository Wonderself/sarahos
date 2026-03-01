import { v4 as uuidv4 } from 'uuid';
import type { Request, Response, NextFunction } from 'express';
import type { AuthenticatedRequest } from './auth.types';

/**
 * Generates a unique request ID for every incoming request.
 * Sets X-Request-Id response header and attaches to req.requestId.
 */
export function requestIdMiddleware(req: Request, res: Response, next: NextFunction): void {
  const requestId = (req.headers['x-request-id'] as string) ?? uuidv4();
  res.setHeader('X-Request-Id', requestId);
  (req as AuthenticatedRequest).requestId = requestId;
  next();
}
