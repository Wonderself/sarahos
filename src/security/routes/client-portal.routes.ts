import { Router } from 'express';
import { verifyToken } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import type { AuthenticatedRequest } from '../auth.types';

export function createClientPortalRouter(): Router {
  const router = Router();

  /**
   * GET /portal/profile — Get current user's profile
   */
  router.get('/portal/profile', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) {
      // Env-key user (no user account)
      res.json({
        profile: {
          sub: authReq.user?.sub,
          role: authReq.user?.role,
          tier: authReq.user?.tier ?? 'paid',
          accountType: 'api_key',
        },
      });
      return;
    }

    const { userService } = await import('../../users/user.service');
    const user = await userService.getUser(userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    // Strip sensitive fields
    res.json({
      profile: {
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        tier: user.tier,
        isActive: user.isActive,
        dailyApiCalls: user.dailyApiCalls,
        dailyApiLimit: user.dailyApiLimit,
        demoExpiresAt: user.demoExpiresAt,
        activeAgents: user.activeAgents,
        userNumber: user.userNumber,
        commissionRate: user.commissionRate,
        referralCode: user.referralCode,
        agentMode: (user as any).agentMode ?? (user as any).agent_mode ?? 'pro',
        createdAt: user.createdAt,
        lastLoginAt: user.lastLoginAt,
      },
    });
  }));

  /**
   * GET /portal/dashboard — Aggregated client dashboard data
   */
  router.get('/portal/dashboard', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const [walletMod, notifMod, campaignMod, usageMod] = await Promise.all([
      import('../../billing/wallet.service'),
      import('../../notifications/notification.service'),
      import('../../campaigns/campaign.service'),
      import('../../billing/wallet.service'),
    ]);

    const [wallet, unreadCount, campaigns, usage] = await Promise.all([
      walletMod.walletService.getOrCreateWallet(userId),
      notifMod.notificationService.getUnreadCount(userId),
      campaignMod.campaignService.listByUser(userId),
      usageMod.walletService.getUsageSummary(userId),
    ]);

    res.json({
      dashboard: {
        wallet: wallet ? {
          balance: wallet.balanceCredits,
          totalDeposited: wallet.totalDeposited,
          totalSpent: wallet.totalSpent,
          currency: wallet.currency,
        } : null,
        notifications: { unreadCount },
        campaigns: {
          total: campaigns.length,
          active: campaigns.filter((c) => c.status === 'active').length,
          pending: campaigns.filter((c) => c.status === 'pending_approval').length,
          draft: campaigns.filter((c) => c.status === 'draft').length,
        },
        usage: {
          totalRequests: usage.totalRequests,
          totalBilledCredits: usage.totalBilledCredits,
          byModel: usage.byModel,
        },
      },
    });
  }));

  /**
   * PATCH /portal/active-agents — Update active agents
   */
  router.patch('/portal/active-agents', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { activeAgents } = req.body as { activeAgents?: string[] };
    if (!Array.isArray(activeAgents) || activeAgents.length === 0) {
      res.status(400).json({ error: 'activeAgents must be a non-empty array' });
      return;
    }

    const { userRepository } = await import('../../users/user.repository');
    const user = await userRepository.updateActiveAgents(userId, activeAgents);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }

    res.json({ activeAgents: user.activeAgents });
  }));

  /**
   * GET /portal/referrals — Get user's referral data
   */
  router.get('/portal/referrals', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { dbClient } = await import('../../infra');
    if (!dbClient.isConnected()) { res.json({ referrals: [] }); return; }

    const result = await dbClient.query(
      `SELECT r.*, u.display_name as referred_name, u.email as referred_email, u.created_at as referred_since
       FROM referrals r JOIN users u ON r.referred_id = u.id
       WHERE r.referrer_id = $1 ORDER BY r.created_at DESC`,
      [userId],
    );

    res.json({
      referrals: result.rows.map((row) => ({
        id: row['id'],
        referredName: row['referred_name'],
        referredEmail: (row['referred_email'] as string).replace(/(.{2}).*(@.*)/, '$1***$2'),
        status: row['status'],
        month1Spend: row['month1_spend'],
        month2Spend: row['month2_spend'],
        rewardCredited: row['reward_credited'],
        createdAt: row['created_at'],
      })),
    });
  }));

  /**
   * GET /portal/wallet — Shortcut to wallet info
   */
  router.get('/portal/wallet', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { walletService } = await import('../../billing/wallet.service');
    const wallet = await walletService.getOrCreateWallet(userId);
    const transactions = await walletService.getTransactions(userId, 10);
    res.json({ wallet, recentTransactions: transactions });
  }));

  /**
   * GET /portal/usage — Shortcut to usage stats
   */
  router.get('/portal/usage', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { walletService } = await import('../../billing/wallet.service');
    const summary = await walletService.getUsageSummary(userId);
    res.json({ usage: summary });
  }));

  // ── User Preferences ──

  router.get('/portal/preferences', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const prefs = await userPreferencesRepository.getByUserId(userId);
    res.json({ preferences: prefs });
  }));

  router.patch('/portal/preferences', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const prefs = await userPreferencesRepository.update(userId, req.body);
    res.json({ preferences: prefs });
  }));

  router.get('/portal/company-profile', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const profile = await userPreferencesRepository.getCompanyProfile(userId);
    res.json({ companyProfile: profile });
  }));

  router.post('/portal/company-profile', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const prefs = await userPreferencesRepository.updateCompanyProfile(userId, req.body);
    res.json({ companyProfile: prefs?.companyProfile ?? {} });
  }));

  router.get('/portal/gamification', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const data = await userPreferencesRepository.getGamification(userId);
    res.json({ gamification: data });
  }));

  router.post('/portal/gamification', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const prefs = await userPreferencesRepository.updateGamification(userId, req.body);
    res.json({ gamification: prefs?.gamificationData ?? {} });
  }));

  // ── Activity Log ──

  router.get('/portal/activity', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const limit = Number(req.query['limit'] ?? 50);
    const offset = Number(req.query['offset'] ?? 0);

    const { dbClient } = await import('../../infra');
    if (!dbClient.isConnected()) { res.json({ activities: [] }); return; }

    const result = await dbClient.query(
      'SELECT * FROM activity_log WHERE user_id = $1 ORDER BY created_at DESC LIMIT $2 OFFSET $3',
      [userId, limit, offset],
    );
    res.json({ activities: result.rows });
  }));

  // ── Sessions ──

  router.get('/portal/sessions', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { dbClient } = await import('../../infra');
    if (!dbClient.isConnected()) { res.json({ sessions: [] }); return; }

    const result = await dbClient.query(
      'SELECT id, ip_address, user_agent, is_active, created_at, last_active_at, expires_at FROM user_sessions WHERE user_id = $1 AND is_active = TRUE ORDER BY last_active_at DESC',
      [userId],
    );
    res.json({ sessions: result.rows });
  }));

  router.delete('/portal/sessions/:jti', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { dbClient } = await import('../../infra');
    if (!dbClient.isConnected()) { res.status(500).json({ error: 'DB not connected' }); return; }

    await dbClient.query(
      'UPDATE user_sessions SET is_active = FALSE WHERE user_id = $1 AND jti = $2',
      [userId, req.params['jti']],
    );
    res.json({ message: 'Session revoked' });
  }));

  // DELETE /portal/account — GDPR self-service account deletion
  router.delete('/portal/account', verifyToken, asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = authReq.user?.userId ?? authReq.user?.sub;
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const { userService } = await import('../../users/user.service');
    try {
      await userService.deleteUserData(String(userId), String(userId), true /* isSelfService */);
      res.json({ status: 'deleted', message: 'Votre compte et toutes vos donnees ont ete supprimes definitivement.' });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        res.status(400).json({ error: error.message });
        return;
      }
      throw error;
    }
  }));

  return router;
}
