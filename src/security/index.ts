export { AuthService, authService } from './auth.service';
export { verifyToken, requireRole } from './auth.middleware';
export { applySecurityMiddleware } from './security.middleware';
export { validateBody, validateQuery } from './validation.middleware';
export { globalErrorHandler } from './error-handler.middleware';
export { registerAllRoutes } from './routes';
export type { UserRole, TokenPayload, AuthenticatedRequest, LoginResponse } from './auth.types';
