jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/config', () => ({
  config: {
    JWT_SECRET: 'test-secret-at-least-16-chars',
    JWT_EXPIRES_IN: '1h',
    API_KEYS_ADMIN: 'admin-key',
    API_KEYS_OPERATOR: '',
    API_KEYS_VIEWER: '',
    API_KEYS_SYSTEM: '',
    DEMO_DEFAULT_DAYS: 7,
  },
}));

const mockUserService = {
  createUser: jest.fn(),
  listUsers: jest.fn(),
  countUsers: jest.fn(),
  getUser: jest.fn(),
  updateUser: jest.fn(),
  deactivateUser: jest.fn(),
  regenerateApiKey: jest.fn(),
  getStats: jest.fn(),
};

jest.mock('../../users/user.service', () => ({
  userService: mockUserService,
}));

import express from 'express';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { createAdminRouter } from './admin.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(createAdminRouter());
  return app;
}

const authService = new AuthService();

function adminToken(): string {
  return authService.generateToken('admin-user', 'admin', { userId: 'admin-1' });
}

function viewerToken(): string {
  return authService.generateToken('viewer-user', 'viewer', { userId: 'viewer-1' });
}

const sampleUser = {
  id: 'a0000000-0000-4000-8000-000000000001',
  email: 'test@example.com',
  displayName: 'Test User',
  apiKey: 'key-abc-123',
  role: 'viewer',
  tier: 'free',
  isActive: true,
  dailyApiCalls: 5,
  dailyApiLimit: 100,
  demoExpiresAt: null,
  promoCodeUsed: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastLoginAt: null,
};

describe('Admin Routes', () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('POST /admin/users', () => {
    it('should create a user as admin', async () => {
      mockUserService.createUser.mockResolvedValue(sampleUser);

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ email: 'test@example.com', displayName: 'Test User' });

      expect(res.status).toBe(201);
      expect(res.body.email).toBe('test@example.com');
      expect(res.body.apiKey).toBe('key-abc-123');
    });

    it('should reject viewer creating user', async () => {
      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${viewerToken()}`)
        .send({ email: 'test@example.com', displayName: 'Test User' });

      expect(res.status).toBe(403);
    });

    it('should return 409 on duplicate email', async () => {
      mockUserService.createUser.mockRejectedValue(new Error('Email already registered'));

      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ email: 'dupe@example.com', displayName: 'Dupe' });

      expect(res.status).toBe(409);
      expect(res.body.error).toBe('Email already registered');
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/admin/users')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ email: 'not-an-email', displayName: 'Test' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /admin/users', () => {
    it('should list users as admin', async () => {
      mockUserService.listUsers.mockResolvedValue([sampleUser]);
      mockUserService.countUsers.mockResolvedValue(1);

      const res = await request(app)
        .get('/admin/users')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.users).toHaveLength(1);
      expect(res.body.total).toBe(1);
      // apiKey should be stripped from list
      expect(res.body.users[0].apiKey).toBeUndefined();
    });

    it('should pass filters to service', async () => {
      mockUserService.listUsers.mockResolvedValue([]);
      mockUserService.countUsers.mockResolvedValue(0);

      await request(app)
        .get('/admin/users?role=viewer&tier=free&active=true&search=test')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(mockUserService.listUsers).toHaveBeenCalledWith({
        role: 'viewer',
        tier: 'free',
        isActive: true,
        search: 'test',
        limit: 50,
        offset: 0,
      });
    });
  });

  describe('GET /admin/users/:id', () => {
    it('should get user by ID', async () => {
      mockUserService.getUser.mockResolvedValue(sampleUser);

      const res = await request(app)
        .get('/admin/users/a0000000-0000-4000-8000-000000000001')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.id).toBe('a0000000-0000-4000-8000-000000000001');
    });

    it('should return 404 for unknown user', async () => {
      mockUserService.getUser.mockResolvedValue(null);

      const res = await request(app)
        .get('/admin/users/b0000000-0000-4000-8000-000000000099')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('PATCH /admin/users/:id', () => {
    it('should update user tier', async () => {
      mockUserService.updateUser.mockResolvedValue({ ...sampleUser, tier: 'paid' });

      const res = await request(app)
        .patch('/admin/users/a0000000-0000-4000-8000-000000000001')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ tier: 'paid' });

      expect(res.status).toBe(200);
      expect(res.body.tier).toBe('paid');
    });

    it('should return 404 for unknown user', async () => {
      mockUserService.updateUser.mockRejectedValue(new Error('User not found'));

      const res = await request(app)
        .patch('/admin/users/b0000000-0000-4000-8000-000000000099')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ tier: 'paid' });

      expect(res.status).toBe(404);
    });
  });

  describe('DELETE /admin/users/:id', () => {
    it('should deactivate user', async () => {
      mockUserService.deactivateUser.mockResolvedValue(true);

      const res = await request(app)
        .delete('/admin/users/a0000000-0000-4000-8000-000000000001')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('deactivated');
    });

    it('should return 404 for unknown user', async () => {
      mockUserService.deactivateUser.mockResolvedValue(false);

      const res = await request(app)
        .delete('/admin/users/b0000000-0000-4000-8000-000000000099')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(404);
    });
  });

  describe('POST /admin/users/:id/reset-key', () => {
    it('should regenerate API key', async () => {
      mockUserService.regenerateApiKey.mockResolvedValue('new-key-xyz');

      const res = await request(app)
        .post('/admin/users/a0000000-0000-4000-8000-000000000001/reset-key')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.apiKey).toBe('new-key-xyz');
    });
  });

  describe('GET /admin/stats', () => {
    it('should return stats', async () => {
      mockUserService.getStats.mockResolvedValue({
        byTier: { guest: 2, demo: 1, free: 5, paid: 3 },
        active: 10,
        totalDailyCalls: 142,
      });

      const res = await request(app)
        .get('/admin/stats')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.byTier).toBeDefined();
      expect(res.body.active).toBe(10);
    });
  });
});
