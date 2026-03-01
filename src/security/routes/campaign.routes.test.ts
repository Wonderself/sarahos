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

const mockCampaignService = {
  create: jest.fn(),
  getById: jest.fn(),
  listByUser: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
  submitForApproval: jest.fn(),
  approve: jest.fn(),
  createPost: jest.fn(),
  getPostsByCampaign: jest.fn(),
};

jest.mock('../../campaigns/campaign.service', () => ({
  campaignService: mockCampaignService,
}));

import express from 'express';
import request from 'supertest';
import { AuthService } from '../auth.service';
import { createCampaignRouter } from './campaign.routes';

function buildApp() {
  const app = express();
  app.use(express.json());
  app.use(createCampaignRouter());
  return app;
}

const authService = new AuthService();

function userToken(): string {
  return authService.generateToken('user-1', 'viewer', { userId: 'user-1', tier: 'free' });
}

function adminToken(): string {
  return authService.generateToken('admin-user', 'admin', { userId: 'admin-1' });
}

function operatorToken(): string {
  return authService.generateToken('op-user', 'operator', { userId: 'op-1' });
}

describe('Campaign Routes', () => {
  let app: ReturnType<typeof buildApp>;

  beforeEach(() => {
    app = buildApp();
    jest.clearAllMocks();
  });

  describe('POST /campaigns', () => {
    it('should create a campaign', async () => {
      mockCampaignService.create.mockResolvedValue({ id: 'c1', title: 'My Campaign', status: 'draft' });

      const res = await request(app)
        .post('/campaigns')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ title: 'My Campaign' });

      expect(res.status).toBe(201);
      expect(res.body.campaign.title).toBe('My Campaign');
    });

    it('should reject missing title', async () => {
      const res = await request(app)
        .post('/campaigns')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({});

      expect(res.status).toBe(400);
    });
  });

  describe('GET /campaigns', () => {
    it('should list user campaigns', async () => {
      mockCampaignService.listByUser.mockResolvedValue([
        { id: 'c1', title: 'Campaign 1' },
        { id: 'c2', title: 'Campaign 2' },
      ]);

      const res = await request(app)
        .get('/campaigns')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.campaigns).toHaveLength(2);
    });
  });

  describe('GET /campaigns/:id', () => {
    it('should return campaign details for owner', async () => {
      mockCampaignService.getById.mockResolvedValue({ id: 'c1', userId: 'user-1', title: 'Mine' });

      const res = await request(app)
        .get('/campaigns/c1')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.campaign.title).toBe('Mine');
    });

    it('should return 404 for non-existent campaign', async () => {
      mockCampaignService.getById.mockResolvedValue(null);

      const res = await request(app)
        .get('/campaigns/c-nonexistent')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(404);
    });

    it('should deny access to other users campaign', async () => {
      mockCampaignService.getById.mockResolvedValue({ id: 'c1', userId: 'other-user', title: 'Not Mine' });

      const res = await request(app)
        .get('/campaigns/c1')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(403);
    });

    it('should allow admin to view any campaign', async () => {
      mockCampaignService.getById.mockResolvedValue({ id: 'c1', userId: 'other-user', title: 'Other' });

      const res = await request(app)
        .get('/campaigns/c1')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });
  });

  describe('POST /campaigns/:id/submit', () => {
    it('should submit campaign for approval', async () => {
      mockCampaignService.getById.mockResolvedValue({ id: 'c1', userId: 'user-1' });
      mockCampaignService.submitForApproval.mockResolvedValue({ id: 'c1', status: 'pending_approval' });

      const res = await request(app)
        .post('/campaigns/c1/submit')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.campaign.status).toBe('pending_approval');
    });
  });

  describe('POST /campaigns/:id/approve', () => {
    it('should allow admin to approve', async () => {
      mockCampaignService.approve.mockResolvedValue({ id: 'c1', status: 'approved' });

      const res = await request(app)
        .post('/campaigns/c1/approve')
        .set('Authorization', `Bearer ${adminToken()}`);

      expect(res.status).toBe(200);
    });

    it('should allow operator to approve', async () => {
      mockCampaignService.approve.mockResolvedValue({ id: 'c1', status: 'approved' });

      const res = await request(app)
        .post('/campaigns/c1/approve')
        .set('Authorization', `Bearer ${operatorToken()}`);

      expect(res.status).toBe(200);
    });

    it('should deny viewer from approving', async () => {
      const res = await request(app)
        .post('/campaigns/c1/approve')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(403);
    });
  });

  describe('POST /campaigns/:id/posts', () => {
    it('should create a post', async () => {
      mockCampaignService.createPost.mockResolvedValue({
        id: 'p1', platform: 'twitter', content: 'Hello!',
      });

      const res = await request(app)
        .post('/campaigns/c1/posts')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ platform: 'twitter', content: 'Hello!' });

      expect(res.status).toBe(201);
      expect(res.body.post.platform).toBe('twitter');
    });

    it('should reject missing content', async () => {
      const res = await request(app)
        .post('/campaigns/c1/posts')
        .set('Authorization', `Bearer ${userToken()}`)
        .send({ platform: 'twitter' });

      expect(res.status).toBe(400);
    });
  });

  describe('GET /campaigns/:id/posts', () => {
    it('should list posts for a campaign', async () => {
      mockCampaignService.getPostsByCampaign.mockResolvedValue([{ id: 'p1' }, { id: 'p2' }]);

      const res = await request(app)
        .get('/campaigns/c1/posts')
        .set('Authorization', `Bearer ${userToken()}`);

      expect(res.status).toBe(200);
      expect(res.body.posts).toHaveLength(2);
    });
  });
});
