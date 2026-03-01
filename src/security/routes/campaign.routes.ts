import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { validateBody, validateQuery } from '../validation.middleware';
import { asyncHandler } from '../async-handler';
import {
  createCampaignSchema,
  updateCampaignSchema,
  campaignQuerySchema,
  createPostSchema,
} from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';

export function createCampaignRouter(): Router {
  const router = Router();

  /**
   * POST /campaigns — Create a new campaign
   */
  router.post('/campaigns', verifyToken, validateBody(createCampaignSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { campaignService } = await import('../../campaigns/campaign.service');
    const campaign = await campaignService.create(userId, req.body);
    if (!campaign) { res.status(500).json({ error: 'Failed to create campaign' }); return; }
    res.status(201).json({ campaign });
  }));

  /**
   * GET /campaigns — List user's campaigns
   */
  router.get('/campaigns', verifyToken, validateQuery(campaignQuerySchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { campaignService } = await import('../../campaigns/campaign.service');
    const status = req.query['status'] as string | undefined;
    const campaigns = await campaignService.listByUser(userId, status);
    res.json({ campaigns });
  }));

  /**
   * GET /campaigns/:id — Get campaign details
   */
  router.get('/campaigns/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const campaignId = req.params['id'] as string;

    const { campaignService } = await import('../../campaigns/campaign.service');
    const campaign = await campaignService.getById(campaignId);
    if (!campaign) { res.status(404).json({ error: 'Campaign not found' }); return; }

    // Ensure user owns the campaign or is admin
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (campaign.userId !== userId && authReq.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    res.json({ campaign });
  }));

  /**
   * PATCH /campaigns/:id — Update a campaign
   */
  router.patch('/campaigns/:id', verifyToken, validateBody(updateCampaignSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const campaignId = req.params['id'] as string;

    const { campaignService } = await import('../../campaigns/campaign.service');
    const existing = await campaignService.getById(campaignId);
    if (!existing) { res.status(404).json({ error: 'Campaign not found' }); return; }

    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (existing.userId !== userId && authReq.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    const campaign = await campaignService.update(campaignId, req.body);
    res.json({ campaign });
  }));

  /**
   * DELETE /campaigns/:id — Delete a campaign
   */
  router.delete('/campaigns/:id', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const campaignId = req.params['id'] as string;

    const { campaignService } = await import('../../campaigns/campaign.service');
    const existing = await campaignService.getById(campaignId);
    if (!existing) { res.status(404).json({ error: 'Campaign not found' }); return; }

    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (existing.userId !== userId && authReq.user?.role !== 'admin') {
      res.status(403).json({ error: 'Access denied' });
      return;
    }

    await campaignService.delete(campaignId);
    res.json({ message: 'Campaign deleted' });
  }));

  /**
   * POST /campaigns/:id/submit — Submit campaign for approval
   */
  router.post('/campaigns/:id/submit', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const campaignId = req.params['id'] as string;

    const { campaignService } = await import('../../campaigns/campaign.service');
    const existing = await campaignService.getById(campaignId);
    if (!existing) { res.status(404).json({ error: 'Campaign not found' }); return; }

    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (existing.userId !== userId) {
      res.status(403).json({ error: 'Only campaign owner can submit for approval' });
      return;
    }

    const campaign = await campaignService.submitForApproval(campaignId);
    res.json({ campaign, message: 'Campaign submitted for approval' });
  }));

  /**
   * POST /campaigns/:id/approve — Approve a campaign (admin/operator only)
   */
  router.post('/campaigns/:id/approve', verifyToken, requireRole('admin', 'operator'), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const campaignId = req.params['id'] as string;
    const approvedBy = authReq.user?.userId ?? authReq.user?.sub ?? 'system';

    const { campaignService } = await import('../../campaigns/campaign.service');
    const campaign = await campaignService.approve(campaignId, approvedBy);
    if (!campaign) { res.status(404).json({ error: 'Campaign not found' }); return; }
    res.json({ campaign, message: 'Campaign approved' });
  }));

  // ── Posts ──

  /**
   * POST /campaigns/:id/posts — Create a post for a campaign
   */
  router.post('/campaigns/:id/posts', verifyToken, validateBody(createPostSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const campaignId = req.params['id'] as string;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { campaignService } = await import('../../campaigns/campaign.service');
    const post = await campaignService.createPost(userId, { ...req.body, campaignId });
    if (!post) { res.status(500).json({ error: 'Failed to create post' }); return; }
    res.status(201).json({ post });
  }));

  /**
   * GET /campaigns/:id/posts — List posts for a campaign
   */
  router.get('/campaigns/:id/posts', verifyToken, asyncHandler(async (req, res) => {
    const campaignId = req.params['id'] as string;
    const { campaignService } = await import('../../campaigns/campaign.service');
    const posts = await campaignService.getPostsByCampaign(campaignId);
    res.json({ posts });
  }));

  return router;
}
