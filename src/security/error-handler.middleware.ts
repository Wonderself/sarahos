import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { AuthenticatedRequest } from './auth.types';

export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;
  const requestId = authReq.requestId;

  logger.error('Unhandled error', {
    message: err.message,
    requestId,
    method: req.method,
    path: req.path,
    userId: authReq.user?.userId,
    stack: process.env['NODE_ENV'] === 'development' ? err.stack : undefined,
  });

  res.status(500).json({
    error: 'Internal server error',
    requestId,
    message: process.env['NODE_ENV'] === 'development' ? err.message : undefined,
  });
}
