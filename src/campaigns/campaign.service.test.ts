jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockDbClient = {
  isConnected: jest.fn().mockReturnValue(true),
  query: jest.fn(),
};

jest.mock('../infra', () => ({
  dbClient: mockDbClient,
}));

import { CampaignService } from './campaign.service';

describe('CampaignService', () => {
  let service: CampaignService;

  const baseCampaignRow = {
    id: 'c1', user_id: 'u1', title: 'Test Campaign', description: 'A test',
    status: 'draft', campaign_type: 'social', platforms: ['twitter', 'instagram'],
    content: {}, schedule: {}, targeting: {}, budget_credits: 0, spent_credits: 0,
    metrics: {}, approved_by: null, approved_at: null,
    created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
  };

  beforeEach(() => {
    service = new CampaignService();
    jest.clearAllMocks();
    mockDbClient.isConnected.mockReturnValue(true);
  });

  describe('create', () => {
    it('should create a campaign', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [baseCampaignRow] });

      const campaign = await service.create('u1', { title: 'Test Campaign' });
      expect(campaign).not.toBeNull();
      expect(campaign!.title).toBe('Test Campaign');
      expect(campaign!.status).toBe('draft');
    });

    it('should return null if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      const campaign = await service.create('u1', { title: 'Test' });
      expect(campaign).toBeNull();
    });
  });

  describe('getById', () => {
    it('should find campaign by ID', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [baseCampaignRow] });
      const campaign = await service.getById('c1');
      expect(campaign).not.toBeNull();
      expect(campaign!.id).toBe('c1');
    });

    it('should return null if not found', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [] });
      const campaign = await service.getById('c-nonexistent');
      expect(campaign).toBeNull();
    });
  });

  describe('listByUser', () => {
    it('should list campaigns for user', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [baseCampaignRow, { ...baseCampaignRow, id: 'c2' }] });
      const campaigns = await service.listByUser('u1');
      expect(campaigns).toHaveLength(2);
    });

    it('should filter by status', async () => {
      mockDbClient.query.mockResolvedValue({ rows: [baseCampaignRow] });
      await service.listByUser('u1', 'draft');
      expect(mockDbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $2'),
        ['u1', 'draft'],
      );
    });

    it('should return empty array if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      expect(await service.listByUser('u1')).toEqual([]);
    });
  });

  describe('submitForApproval', () => {
    it('should change status to pending_approval', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [{ ...baseCampaignRow, status: 'pending_approval' }],
      });
      const campaign = await service.submitForApproval('c1');
      expect(campaign!.status).toBe('pending_approval');
    });
  });

  describe('approve', () => {
    it('should approve a campaign', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [{
          ...baseCampaignRow, status: 'approved',
          approved_by: 'admin-1', approved_at: new Date().toISOString(),
        }],
      });
      const campaign = await service.approve('c1', 'admin-1');
      expect(campaign!.status).toBe('approved');
      expect(campaign!.approvedBy).toBe('admin-1');
    });

    it('should return null if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      expect(await service.approve('c1', 'admin')).toBeNull();
    });
  });

  describe('delete', () => {
    it('should delete a campaign', async () => {
      mockDbClient.query.mockResolvedValue({ rowCount: 1 });
      expect(await service.delete('c1')).toBe(true);
    });

    it('should return false if not found', async () => {
      mockDbClient.query.mockResolvedValue({ rowCount: 0 });
      expect(await service.delete('c-nonexistent')).toBe(false);
    });
  });

  describe('createPost', () => {
    it('should create a campaign post', async () => {
      mockDbClient.query.mockResolvedValue({
        rows: [{
          id: 'p1', campaign_id: 'c1', user_id: 'u1', platform: 'twitter',
          content: 'Hello!', media_urls: [], hashtags: ['#test'],
          scheduled_at: null, published_at: null, status: 'draft',
          external_post_id: null, metrics: {}, error_message: null,
          created_at: new Date().toISOString(), updated_at: new Date().toISOString(),
        }],
      });

      const post = await service.createPost('u1', {
        campaignId: 'c1', platform: 'twitter', content: 'Hello!', hashtags: ['#test'],
      });
      expect(post).not.toBeNull();
      expect(post!.platform).toBe('twitter');
    });
  });

  describe('getPostsByCampaign', () => {
    it('should return empty array if DB not connected', async () => {
      mockDbClient.isConnected.mockReturnValue(false);
      expect(await service.getPostsByCampaign('c1')).toEqual([]);
    });
  });
});
