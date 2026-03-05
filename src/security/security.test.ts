jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../utils/config', () => ({
  config: {
    DASHBOARD_ORIGIN: 'http://localhost:3001',
    RATE_LIMIT_MAX: 3,
    RATE_LIMIT_WINDOW_MS: 60000,
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    API_KEYS_ADMIN: 'admin-key',
    API_KEYS_OPERATOR: '',
    API_KEYS_VIEWER: '',
    API_KEYS_SYSTEM: '',
  },
}));

import type { Request, Response, NextFunction } from 'express';
import { createRateLimitMiddleware } from './rate-limit.middleware';
import { requestLogger } from './request-logger.middleware';

describe('createRateLimitMiddleware', () => {
  const mockReq = (ip = '127.0.0.1') => ({ ip, socket: { remoteAddress: ip } }) as Request;
  const mockRes = () => {
    const res: Partial<Response> = {
      setHeader: jest.fn(),
    };
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };
  const mockNext: NextFunction = jest.fn();

  it('should allow requests under the limit', () => {
    const middleware = createRateLimitMiddleware({ maxRequests: 5, windowMs: 60000 });
    const req = mockReq('10.0.0.1');
    const res = mockRes();
    middleware(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should set rate limit headers', () => {
    const middleware = createRateLimitMiddleware({ maxRequests: 5, windowMs: 60000 });
    const req = mockReq('10.0.0.2');
    const res = mockRes();
    middleware(req, res, mockNext);
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Limit', '5');
    expect(res.setHeader).toHaveBeenCalledWith('X-RateLimit-Remaining', expect.any(String));
  });

  it('should return 429 when limit exceeded', () => {
    const middleware = createRateLimitMiddleware({ maxRequests: 2, windowMs: 60000 });
    const res1 = mockRes();
    const res2 = mockRes();
    const res3 = mockRes();

    middleware(mockReq('10.0.0.3'), res1, jest.fn());
    middleware(mockReq('10.0.0.3'), res2, jest.fn());
    middleware(mockReq('10.0.0.3'), res3, jest.fn());

    expect(res3.status).toHaveBeenCalledWith(429);
    expect(res3.json).toHaveBeenCalledWith(expect.objectContaining({ error: 'Too many requests' }));
  });

  it('should track different IPs separately', () => {
    const middleware = createRateLimitMiddleware({ maxRequests: 1, windowMs: 60000 });
    const next1 = jest.fn();
    const next2 = jest.fn();

    middleware(mockReq('10.0.0.4'), mockRes(), next1);
    middleware(mockReq('10.0.0.5'), mockRes(), next2);

    expect(next1).toHaveBeenCalled();
    expect(next2).toHaveBeenCalled();
  });

  it('should use socket.remoteAddress as fallback', () => {
    const middleware = createRateLimitMiddleware({ maxRequests: 5, windowMs: 60000 });
    const req = { ip: undefined, socket: { remoteAddress: '192.168.1.1' } } as unknown as Request;
    const res = mockRes();
    middleware(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});

describe('requestLogger', () => {
  it('should call next immediately', () => {
    const req = { method: 'GET', path: '/test', ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } } as Request;
    const res = { on: jest.fn() } as unknown as Response;
    const next = jest.fn();

    requestLogger(req, res, next);
    expect(next).toHaveBeenCalled();
  });

  it('should register a finish listener', () => {
    const req = { method: 'GET', path: '/test', ip: '127.0.0.1', socket: { remoteAddress: '127.0.0.1' } } as Request;
    const onMock = jest.fn();
    const res = { on: onMock } as unknown as Response;

    requestLogger(req, res, jest.fn());
    expect(onMock).toHaveBeenCalledWith('finish', expect.any(Function));
  });

  it('should log request info on finish', () => {
    const { logger } = jest.requireMock('../utils/logger');
    const req = { method: 'POST', path: '/api/test', ip: '10.0.0.1', socket: { remoteAddress: '10.0.0.1' } } as Request;
    let finishCb: () => void = () => {};
    const res = {
      on: (_event: string, cb: () => void) => { finishCb = cb; },
      statusCode: 200,
    } as unknown as Response;

    requestLogger(req, res, jest.fn());
    finishCb();

    expect(logger.info).toHaveBeenCalledWith('HTTP request', expect.objectContaining({
      method: 'POST',
      path: '/api/test',
      statusCode: 200,
    }));
  });
});

describe('applySecurityMiddleware', () => {
  it('should apply middleware to express app', () => {
    // Dynamic import to avoid config issues
    const { applySecurityMiddleware } = require('./security.middleware');
    const mockApp = { use: jest.fn() };
    applySecurityMiddleware(mockApp);
    // requestId + helmet + guardrails security headers + cors + requestLogger + 4 auth rate limiters + global rateLimiter = 10 calls
    expect(mockApp.use).toHaveBeenCalledTimes(10);
  });
});
