import type { Request, Response, NextFunction } from 'express';

/**
 * Wraps an async Express route handler to catch promise rejections
 * and forward them to next() for the global error handler.
 */
export function asyncHandler(
  fn: (req: Request, res: Response, next: NextFunction) => Promise<void>,
): (req: Request, res: Response, next: NextFunction) => void {
  return (req, res, next) => {
    fn(req, res, next).catch(next);
  };
}
