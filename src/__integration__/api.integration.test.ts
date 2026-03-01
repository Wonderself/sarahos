import request from 'supertest';
import { createTestApp, AuthService } from './setup';

describe('API Integration', () => {
  const app = createTestApp();
  const authService = new AuthService();
  const adminToken = authService.generateToken('admin', 'admin');
  const viewerToken = authService.generateToken('viewer', 'viewer');

  describe('Validation', () => {
    it('POST /approvals/:id/decide with invalid status returns 400', async () => {
      const res = await request(app)
        .post('/approvals/test-id/decide')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'MAYBE', decidedBy: 'admin' });

      expect(res.status).toBe(400);
      expect(res.body.error).toBe('Validation failed');
      expect(res.body.details).toEqual(
        expect.arrayContaining([
          expect.objectContaining({ field: 'status' }),
        ]),
      );
    });

    it('POST /approvals/:id/decide with missing decidedBy returns 400', async () => {
      const res = await request(app)
        .post('/approvals/test-id/decide')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ status: 'APPROVED' });

      expect(res.status).toBe(400);
    });

    it('POST /tasks with valid body returns 201', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({
          title: 'Test task',
          description: 'Integration test task',
          assignedBy: 'admin',
          priority: 'HIGH',
        });

      expect(res.status).toBe(201);
      expect(res.body.id).toBeDefined();
      expect(res.body.title).toBe('Test task');
    });

    it('POST /tasks with missing title returns 400', async () => {
      const res = await request(app)
        .post('/tasks')
        .set('Authorization', `Bearer ${adminToken}`)
        .send({ description: 'Missing title', assignedBy: 'admin' });

      expect(res.status).toBe(400);
    });
  });

  describe('Security Headers', () => {
    it('should include security headers from helmet', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['x-content-type-options']).toBe('nosniff');
      expect(res.headers['x-frame-options']).toBeDefined();
    });

    it('should include rate limit headers', async () => {
      const res = await request(app).get('/health');

      expect(res.headers['x-ratelimit-limit']).toBeDefined();
      expect(res.headers['x-ratelimit-remaining']).toBeDefined();
    });
  });

  describe('Protected Routes', () => {
    it('GET /agents requires auth', async () => {
      const res = await request(app).get('/agents');
      expect(res.status).toBe(401);
    });

    it('GET /agents with viewer token returns 200', async () => {
      const res = await request(app)
        .get('/agents')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
    });

    it('GET /events/recent with viewer token returns 200', async () => {
      const res = await request(app)
        .get('/events/recent')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
    });

    it('GET /tokens/usage with viewer token returns 200', async () => {
      const res = await request(app)
        .get('/tokens/usage')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
    });

    it('GET /autonomy/score with viewer token returns 200', async () => {
      const res = await request(app)
        .get('/autonomy/score')
        .set('Authorization', `Bearer ${viewerToken}`);

      expect(res.status).toBe(200);
      expect(res.body.score).toBe(20);
    });
  });
});
