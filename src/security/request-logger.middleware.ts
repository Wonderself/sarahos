import type { Request, Response, NextFunction } from 'express';
import { logger } from '../utils/logger';
import type { AuthenticatedRequest } from './auth.types';

export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();

  res.on('finish', () => {
    const durationMs = Date.now() - start;
    const authReq = req as AuthenticatedRequest;

    logger.info('HTTP request', {
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      durationMs,
      ip: req.ip ?? req.socket.remoteAddress,
      userId: authReq.user?.sub,
    });
  });

  next();
}
