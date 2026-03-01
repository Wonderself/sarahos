import jwt from 'jsonwebtoken';

jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../utils/config', () => ({
  config: {
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    API_KEYS_ADMIN: 'admin-key-123',
    API_KEYS_OPERATOR: 'operator-key-456',
    API_KEYS_VIEWER: 'viewer-key-789',
    API_KEYS_SYSTEM: 'system-key-000',
  },
}));

import { AuthService } from './auth.service';
import { verifyToken, requireRole } from './auth.middleware';
import type { AuthenticatedRequest } from './auth.types';
import type { Response, NextFunction } from 'express';

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(() => {
    service = new AuthService();
  });

  it('should generate a valid JWT token', () => {
    const token = service.generateToken('user-1', 'admin');
    expect(typeof token).toBe('string');
    expect(token.split('.')).toHaveLength(3);
  });

  it('should verify a valid token', () => {
    const token = service.generateToken('user-1', 'operator');
    const payload = service.verifyToken(token);
    expect(payload.sub).toBe('user-1');
    expect(payload.role).toBe('operator');
  });

  it('should throw on invalid token', () => {
    expect(() => service.verifyToken('invalid-token')).toThrow();
  });

  it('should throw on expired token', () => {
    const token = jwt.sign({ sub: 'user-1', role: 'admin' }, 'test-secret-at-least-16-chars', {
      expiresIn: '-1s',
    });
    expect(() => service.verifyToken(token)).toThrow();
  });

  it('should login with valid admin API key', () => {
    const result = service.login('admin-key-123');
    expect(result).not.toBeNull();
    expect(result!.role).toBe('admin');
    expect(result!.token).toBeDefined();
    expect(result!.expiresIn).toBe('1h');
  });

  it('should login with valid operator API key', () => {
    const result = service.login('operator-key-456');
    expect(result).not.toBeNull();
    expect(result!.role).toBe('operator');
  });

  it('should login with valid viewer API key', () => {
    const result = service.login('viewer-key-789');
    expect(result).not.toBeNull();
    expect(result!.role).toBe('viewer');
  });

  it('should return null for invalid API key', () => {
    const result = service.login('wrong-key');
    expect(result).toBeNull();
  });

  it('should calculate role hierarchy', () => {
    expect(service.getRoleHierarchy('viewer')).toBe(1);
    expect(service.getRoleHierarchy('operator')).toBe(2);
    expect(service.getRoleHierarchy('system')).toBe(3);
    expect(service.getRoleHierarchy('admin')).toBe(4);
  });

  it('should check minimum role correctly', () => {
    expect(service.hasMinRole('admin', 'viewer')).toBe(true);
    expect(service.hasMinRole('viewer', 'admin')).toBe(false);
    expect(service.hasMinRole('operator', 'operator')).toBe(true);
  });
});

describe('verifyToken middleware', () => {
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };
  const mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no Authorization header', () => {
    const req = { headers: {} } as AuthenticatedRequest;
    const res = mockRes();
    verifyToken(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
    expect(mockNext).not.toHaveBeenCalled();
  });

  it('should return 401 if Authorization header is not Bearer', () => {
    const req = { headers: { authorization: 'Basic abc' } } as AuthenticatedRequest;
    const res = mockRes();
    verifyToken(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 401 for invalid token', () => {
    const req = { headers: { authorization: 'Bearer invalid-token' } } as AuthenticatedRequest;
    const res = mockRes();
    verifyToken(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should call next and attach user for valid token', () => {
    const service = new AuthService();
    const token = service.generateToken('user-1', 'admin');
    const req = { headers: { authorization: `Bearer ${token}` } } as AuthenticatedRequest;
    const res = mockRes();
    verifyToken(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
    expect(req.user).toBeDefined();
    expect(req.user!.sub).toBe('user-1');
    expect(req.user!.role).toBe('admin');
  });
});

describe('requireRole middleware', () => {
  const mockRes = () => {
    const res: Partial<Response> = {};
    res.status = jest.fn().mockReturnValue(res);
    res.json = jest.fn().mockReturnValue(res);
    return res as Response;
  };
  const mockNext: NextFunction = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should return 401 if no user on request', () => {
    const req = {} as AuthenticatedRequest;
    const res = mockRes();
    requireRole('operator')(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(401);
  });

  it('should return 403 if user role is insufficient', () => {
    const req = { user: { sub: 'u1', role: 'viewer', iat: 0, exp: 0 } } as AuthenticatedRequest;
    const res = mockRes();
    requireRole('operator')(req, res, mockNext);
    expect(res.status).toHaveBeenCalledWith(403);
  });

  it('should call next if user has required role', () => {
    const req = { user: { sub: 'u1', role: 'operator', iat: 0, exp: 0 } } as AuthenticatedRequest;
    const res = mockRes();
    requireRole('operator')(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });

  it('should always allow admin', () => {
    const req = { user: { sub: 'u1', role: 'admin', iat: 0, exp: 0 } } as AuthenticatedRequest;
    const res = mockRes();
    requireRole('operator')(req, res, mockNext);
    expect(mockNext).toHaveBeenCalled();
  });
});
