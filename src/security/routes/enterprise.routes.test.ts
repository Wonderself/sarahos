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
  },
}));

jest.mock('../../utils/audit-logger', () => ({
  auditLog: jest.fn(),
}));

const mockDbClient = {
  isConnected: jest.fn().mockReturnValue(true),
  query: jest.fn(),
};

jest.mock('../../infra/database/db-client', () => ({
  dbClient: mockDbClient,
}));

import express from 'express';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { createEnterpriseRouter } from './enterprise.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(createEnterpriseRouter());
  return app;
}

const authService = new AuthService();

function adminToken(): string {
  return authService.generateToken('admin-user', 'admin', { userId: 'admin-1' });
}

function viewerToken(): string {
  return authService.generateToken('viewer-user', 'viewer', { userId: 'viewer-1' });
}

const sampleQuote = {
  id: 'a0000000-0000-4000-8000-000000000001',
  company_name: 'Acme Corp',
  contact_name: 'Jean Dupont',
  email: 'jean@acme.fr',
  phone: '+33612345678',
  industry: 'Tech',
  estimated_users: 50,
  needs: 'White-label SaaS deployment',
  budget_range: '500-2000 EUR/mois',
  status: 'new',
  admin_notes: null,
  created_at: new Date('2026-03-01'),
  updated_at: new Date('2026-03-01'),
};

describe('Enterprise Routes', () => {
  const app = buildApp();

  beforeEach(() => {
    jest.clearAllMocks();
    mockDbClient.isConnected.mockReturnValue(true);
  });

  describe('POST /enterprise/quote', () => {
    it('should create a quote without authentication', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [{ id: sampleQuote.id, company_name: 'Acme Corp', contact_name: 'Jean Dupont', email: 'jean@acme.fr', created_at: new Date() }] })
        .mockResolvedValueOnce({ rows: [] }); // notification insert

      const res = await request(app)
        .post('/enterprise/quote')
        .send({
          companyName: 'Acme Corp',
          contactName: 'Jean Dupont',
          email: 'jean@acme.fr',
          phone: '+33612345678',
          industry: 'Tech',
          estimatedUsers: 50,
          needs: 'White-label SaaS deployment',
          budgetRange: '500-2000 EUR/mois',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.quoteId).toBe(sampleQuote.id);
      expect(mockDbClient.query).toHaveBeenCalledTimes(2);
    });

    it('should accept minimal required fields only', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [{ id: 'q-123', company_name: 'Test', contact_name: 'Test', email: 'a@b.com', created_at: new Date() }] })
        .mockResolvedValueOnce({ rows: [] });

      const res = await request(app)
        .post('/enterprise/quote')
        .send({
          companyName: 'Test',
          contactName: 'Test',
          email: 'a@b.com',
        });

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
    });

    it('should reject invalid email', async () => {
      const res = await request(app)
        .post('/enterprise/quote')
        .send({
          companyName: 'Test',
          contactName: 'Test',
          email: 'not-an-email',
        });

      expect(res.status).toBe(400);
    });

    it('should reject missing required fields', async () => {
      const res = await request(app)
        .post('/enterprise/quote')
        .send({ companyName: 'Test' });

      expect(res.status).toBe(400);
    });

    it('should return 503 when database is unavailable', async () => {
      mockDbClient.isConnected.mockReturnValue(false);

      const res = await request(app)
        .post('/enterprise/quote')
        .send({
          companyName: 'Test',
          contactName: 'Test',
          email: 'a@b.com',
        });

      expect(res.status).toBe(503);
    });
  });

  describe('GET /enterprise/quotes', () => {
    it('should list quotes as admin', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [sampleQuote] })
        .mockResolvedValueOnce({ rows: [{ count: '1' }] });

      const res = await request(app)
        .get('/enterprise/quotes')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.quotes).toHaveLength(1);
      expect(res.body.total).toBe(1);
    });

    it('should filter by status', async () => {
      mockDbClient.query
        .mockResolvedValueOnce({ rows: [] })
        .mockResolvedValueOnce({ rows: [{ count: '0' }] });

      const res = await request(app)
        .get('/enterprise/quotes?status=contacted')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('WHERE status = $1'),
        expect.arrayContaining(['contacted']),
      );
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .get('/enterprise/quotes')
        .set('Authorization', `Bearer ${viewerToken()}`);

      expect(res.status).toBe(403);
    });

    it('should reject unauthenticated', async () => {
      const res = await request(app)
        .get('/enterprise/quotes');

      expect(res.status).toBe(401);
    });
  });

  describe('PATCH /enterprise/quotes/:id', () => {
    it('should update quote status as admin', async () => {
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ ...sampleQuote, status: 'contacted' }],
        rowCount: 1,
      });

      const res = await request(app)
        .patch(`/enterprise/quotes/${sampleQuote.id}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'contacted' });

      expect(res.status).toBe(200);
      expect(res.body.status).toBe('contacted');
    });

    it('should update admin notes', async () => {
      mockDbClient.query.mockResolvedValueOnce({
        rows: [{ ...sampleQuote, admin_notes: 'Called them' }],
        rowCount: 1,
      });

      const res = await request(app)
        .patch(`/enterprise/quotes/${sampleQuote.id}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ adminNotes: 'Called them' });

      expect(res.status).toBe(200);
    });

    it('should return 404 for unknown quote', async () => {
      mockDbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });

      const res = await request(app)
        .patch('/enterprise/quotes/b0000000-0000-4000-8000-000000000099')
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({ status: 'contacted' });

      expect(res.status).toBe(404);
    });

    it('should reject empty update', async () => {
      const res = await request(app)
        .patch(`/enterprise/quotes/${sampleQuote.id}`)
        .set('Authorization', `Bearer ${adminToken()}`)
        .send({});

      expect(res.status).toBe(400);
    });

    it('should reject non-admin', async () => {
      const res = await request(app)
        .patch(`/enterprise/quotes/${sampleQuote.id}`)
        .set('Authorization', `Bearer ${viewerToken()}`)
        .send({ status: 'contacted' });

      expect(res.status).toBe(403);
    });
  });
});
