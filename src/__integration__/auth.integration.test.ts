import request from 'supertest';
import { createTestApp, AuthService } from './setup';

describe('Auth Integration', () => {
  const app = createTestApp();
  const authService = new AuthService();

  it('POST /auth/login with valid admin key returns JWT', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ apiKey: 'test-admin-key' });

    expect(res.status).toBe(200);
    expect(res.body.token).toBeDefined();
    expect(res.body.role).toBe('admin');
    expect(res.body.expiresIn).toBe('1h');
  });

  it('POST /auth/login with invalid key returns 401', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({ apiKey: 'wrong-key' });

    expect(res.status).toBe(401);
  });

  it('POST /auth/login with missing apiKey returns 400', async () => {
    const res = await request(app)
      .post('/auth/login')
      .send({});

    expect(res.status).toBe(400);
  });

  it('GET /state without token returns 401', async () => {
    const res = await request(app).get('/state');
    expect(res.status).toBe(401);
  });

  it('GET /state with valid token returns 200', async () => {
    const token = authService.generateToken('test-user', 'admin');
    const res = await request(app)
      .get('/state')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('GET /state with expired token returns 401', async () => {
    const jwt = require('jsonwebtoken');
    const token = jwt.sign({ sub: 'test', role: 'admin' }, 'integration-test-secret-at-least-16', { expiresIn: '-1s' });

    const res = await request(app)
      .get('/state')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(401);
  });

  it('GET /financial/summary with viewer role returns 403', async () => {
    const token = authService.generateToken('test-viewer', 'viewer');
    const res = await request(app)
      .get('/financial/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(403);
  });

  it('GET /financial/summary with operator role returns 200', async () => {
    const token = authService.generateToken('test-operator', 'operator');
    const res = await request(app)
      .get('/financial/summary')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
  });

  it('GET /health without token returns 200 (public)', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body.status).toBe('ok');
    expect(res.body.version).toBe('0.12.0');
  });

  it('GET /auth/me with valid token returns user info', async () => {
    const token = authService.generateToken('admin-user', 'admin');
    const res = await request(app)
      .get('/auth/me')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(200);
    expect(res.body.sub).toBe('admin-user');
    expect(res.body.role).toBe('admin');
  });

  it('GET /unknown returns 404', async () => {
    const token = authService.generateToken('test', 'admin');
    const res = await request(app)
      .get('/nonexistent')
      .set('Authorization', `Bearer ${token}`);

    expect(res.status).toBe(404);
  });
});
