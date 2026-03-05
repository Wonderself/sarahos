import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import { AppError, ValidationError } from '../utils/app-error';
import type { AuthenticatedRequest } from './auth.types';

export function globalErrorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const authReq = req as AuthenticatedRequest;
  const requestId = authReq.requestId;

  // Known operational errors — return appropriate status code
  if (err instanceof AppError && err.isOperational) {
    logger.warn('Operational error', {
      message: err.message,
      code: err.code,
      statusCode: err.statusCode,
      requestId,
      method: req.method,
      path: req.path,
      userId: authReq.user?.userId,
    });

    res.status(err.statusCode).json({
      error: err.message,
      code: err.code,
      requestId,
      ...(err instanceof ValidationError && err.details ? { details: err.details } : {}),
    });
    return;
  }

  // Unexpected errors — log full stack, return 500
  logger.error('Unexpected error', {
    message: err.message,
    requestId,
    method: req.method,
    path: req.path,
    userId: authReq.user?.userId,
    stack: process.env['NODE_ENV'] === 'development' ? err.stack : undefined,
  });

  res.status(500).json({
    error: 'Internal server error',
    code: 'INTERNAL_ERROR',
    requestId,
    message: process.env['NODE_ENV'] === 'development' ? err.message : undefined,
  });
}
