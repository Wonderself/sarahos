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

const mockUserDataRepository = {
  isAllowedNamespace: jest.fn(),
  get: jest.fn(),
  upsert: jest.fn(),
};

jest.mock('../../users/user-data.repository', () => ({
  userDataRepository: mockUserDataRepository,
}));

import express from 'express';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { createUserDataRouter } from './user-data.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(createUserDataRouter());
  return app;
}

const authService = new AuthService();

function userToken(): string {
  return authService.generateToken('user-1', 'viewer', { userId: 'user-1', tier: 'free' });
}

describe('UserData Routes', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp();
    jest.clearAllMocks();
  });

  describe('GET /portal/user-data/:namespace', () => {
    it('should return 401 without token', async () => {
      const res = await request(app).get('/portal/user-data/journee');
      expect(res.status).toBe(401);
    });

    it('should return 400 for unknown namespace', async () => {
      mockUserDataRepository.isAllowedNamespace.mockReturnValue(false);

      const res = await request(app)
        .get('/portal/user-data/unknown_ns')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Unknown namespace');
    });

    it('should return null data when namespace is empty', async () => {
      mockUserDataRepository.isAllowedNamespace.mockReturnValue(true);
      mockUserDataRepository.get.mockResolvedValue(null);

      const res = await request(app)
        .get('/portal/user-data/journee')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.namespace).toBe('journee');
      expect(res.body.data).toBeNull();
    });

    it('should return data when namespace has content', async () => {
      const testData = { todos: [{ id: '1', text: 'test', done: false }] };
      mockUserDataRepository.isAllowedNamespace.mockReturnValue(true);
      mockUserDataRepository.get.mockResolvedValue(testData);

      const res = await request(app)
        .get('/portal/user-data/journee')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.data).toEqual(testData);
    });
  });

  describe('PUT /portal/user-data/:namespace', () => {
    it('should return 401 without token', async () => {
      const res = await request(app)
        .put('/portal/user-data/journee')
        .send({ data: {} });
      expect(res.status).toBe(401);
    });

    it('should return 400 for unknown namespace', async () => {
      mockUserDataRepository.isAllowedNamespace.mockReturnValue(false);

      const res = await request(app)
        .put('/portal/user-data/badns')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ data: {} });

      expect(res.status).toBe(400);
    });

    it('should return 400 when body.data is missing', async () => {
      mockUserDataRepository.isAllowedNamespace.mockReturnValue(true);

      const res = await request(app)
        .put('/portal/user-data/journee')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({});

      expect(res.status).toBe(400);
      expect(res.body.error).toContain('Missing data');
    });

    it('should return 503 when DB is down', async () => {
      mockUserDataRepository.isAllowedNamespace.mockReturnValue(true);
      mockUserDataRepository.upsert.mockResolvedValue(false);

      const res = await request(app)
        .put('/portal/user-data/journee')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ data: { test: true } });

      expect(res.status).toBe(503);
    });

    it('should save data successfully', async () => {
      mockUserDataRepository.isAllowedNamespace.mockReturnValue(true);
      mockUserDataRepository.upsert.mockResolvedValue(true);

      const testData = { todos: [], mood: 5 };
      const res = await request(app)
        .put('/portal/user-data/journee')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ data: testData });

      expect(res.status).toBe(200);
      expect(res.body.saved).toBe(true);
      expect(mockUserDataRepository.upsert).toHaveBeenCalledWith('user-1', 'journee', testData);
    });

    it('should handle array data (marketplace_installed)', async () => {
      mockUserDataRepository.isAllowedNamespace.mockReturnValue(true);
      mockUserDataRepository.upsert.mockResolvedValue(true);

      const res = await request(app)
        .put('/portal/user-data/marketplace_installed')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ data: ['template-1', 'template-2'] });

      expect(res.status).toBe(200);
      expect(mockUserDataRepository.upsert).toHaveBeenCalledWith('user-1', 'marketplace_installed', ['template-1', 'template-2']);
    });
  });
});
