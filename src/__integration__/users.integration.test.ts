import { createTestApp, AuthService } from './setup';
import request from 'supertest';

const app = createTestApp();
const authService = new AuthService();

function adminToken(): string {
  return authService.generateToken('admin-user', 'admin', { userId: 'admin-1' });
}

function viewerToken(): string {
  return authService.generateToken('viewer-user', 'viewer', { userId: 'viewer-1', tier: 'free' });
}

// eslint-disable-next-line @typescript-eslint/no-require-imports
const { userService } = require('../users/user.service');

const sampleUser = {
  id: 'a0000000-0000-4000-8000-000000000001',
  email: 'test@example.com',
  displayName: 'Test User',
  apiKey: 'key-xyz',
  role: 'viewer',
  tier: 'free',
  isActive: true,
  dailyApiCalls: 0,
  dailyApiLimit: 100,
  demoExpiresAt: null,
  promoCodeUsed: null,
  createdAt: new Date('2024-01-01'),
  updatedAt: new Date('2024-01-01'),
  lastLoginAt: null,
};

describe('Admin User Management (integration)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('POST /admin/users — admin can create user', async () => {
    userService.createUser.mockResolvedValue(sampleUser);

    const res = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ email: 'test@example.com', displayName: 'Test User' });

    expect(res.status).toBe(201);
    expect(res.body.email).toBe('test@example.com');
  });

  it('POST /admin/users — viewer gets 403', async () => {
    const res = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${viewerToken()}`)
      .send({ email: 'test@example.com', displayName: 'Test' });

    expect(res.status).toBe(403);
  });

  it('GET /admin/users — admin can list users', async () => {
    userService.listUsers.mockResolvedValue([sampleUser]);

    const res = await request(app)
      .get('/admin/users')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.users).toHaveLength(1);
    // apiKey stripped
    expect(res.body.users[0].apiKey).toBeUndefined();
  });

  it('GET /admin/users/:id — returns 404 for unknown', async () => {
    userService.getUser.mockResolvedValue(null);

    const res = await request(app)
      .get('/admin/users/b0000000-0000-4000-8000-000000000099')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(404);
  });

  it('GET /admin/users/:id — returns user details', async () => {
    userService.getUser.mockResolvedValue(sampleUser);

    const res = await request(app)
      .get('/admin/users/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.id).toBe('a0000000-0000-4000-8000-000000000001');
  });

  it('PATCH /admin/users/:id — admin can update tier', async () => {
    userService.updateUser.mockResolvedValue({ ...sampleUser, tier: 'paid' });

    const res = await request(app)
      .patch('/admin/users/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ tier: 'paid' });

    expect(res.status).toBe(200);
    expect(res.body.tier).toBe('paid');
  });

  it('DELETE /admin/users/:id — admin can deactivate', async () => {
    userService.deactivateUser.mockResolvedValue(true);

    const res = await request(app)
      .delete('/admin/users/a0000000-0000-4000-8000-000000000001')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.status).toBe('deactivated');
  });

  it('POST /admin/users/:id/reset-key — admin can regenerate key', async () => {
    userService.regenerateApiKey.mockResolvedValue('new-key-123');

    const res = await request(app)
      .post('/admin/users/a0000000-0000-4000-8000-000000000001/reset-key')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.apiKey).toBe('new-key-123');
  });

  it('GET /admin/stats — returns user statistics', async () => {
    userService.getStats.mockResolvedValue({
      byTier: { guest: 1, free: 5, paid: 2 },
      active: 8,
      totalDailyCalls: 42,
    });

    const res = await request(app)
      .get('/admin/stats')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.status).toBe(200);
    expect(res.body.active).toBe(8);
  });

  it('POST /admin/users — returns 409 on duplicate email', async () => {
    userService.createUser.mockRejectedValue(new Error('Email already registered'));

    const res = await request(app)
      .post('/admin/users')
      .set('Authorization', `Bearer ${adminToken()}`)
      .send({ email: 'dupe@example.com', displayName: 'Dupe' });

    expect(res.status).toBe(409);
  });

  it('request includes X-Request-Id header', async () => {
    userService.getStats.mockResolvedValue({ byTier: {}, active: 0, totalDailyCalls: 0 });

    const res = await request(app)
      .get('/admin/stats')
      .set('Authorization', `Bearer ${adminToken()}`);

    expect(res.headers['x-request-id']).toBeDefined();
  });
});
