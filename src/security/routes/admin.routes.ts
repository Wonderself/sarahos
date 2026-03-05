import { Router } from 'express';
import type { Response, NextFunction } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import { validateBody, validateQuery, validateUuidParam } from '../validation.middleware';
import { createUserSchema, updateUserSchema, userQuerySchema, adminDepositSchema, adminRefundSchema } from '../validation.schemas';
import { logger } from '../../utils/logger';
import { config } from '../../utils/config';
import { auditLog } from '../../utils/audit-logger';
import type { AuthenticatedRequest } from '../auth.types';

export function createAdminRouter(): Router {
  const router = Router();

  router.use(verifyToken);

  // POST /admin/users — create user
  router.post('/admin/users', requireRole('admin'), validateBody(createUserSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const user = await userService.createUser(req.body);
      auditLog({ actor: req.user?.sub ?? 'admin', action: 'admin_create_user', resourceType: 'user', resourceId: user.id, ip: req.ip });
      res.status(201).json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        apiKey: user.apiKey,
        role: user.role,
        tier: user.tier,
        isActive: user.isActive,
        dailyApiLimit: user.dailyApiLimit,
        demoExpiresAt: user.demoExpiresAt,
        createdAt: user.createdAt,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'Email already registered') {
        res.status(409).json({ error: error.message });
        return;
      }
      next(error);
    }
  });

  // GET /admin/users — list users
  router.get('/admin/users', requireRole('admin'), validateQuery(userQuerySchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const limit = Number(req.query.limit ?? 50);
      const offset = Number(req.query.offset ?? 0);
      const filters: Record<string, unknown> = { limit, offset };
      if (req.query.role) filters.role = req.query.role;
      if (req.query.tier) filters.tier = req.query.tier;
      if (req.query.active !== undefined) filters.isActive = req.query.active === 'true';
      if (req.query.search) filters.search = req.query.search;

      const users = await userService.listUsers(filters as Parameters<typeof userService.listUsers>[0]);
      // Get total count for pagination (without limit/offset)
      const totalCount = await userService.countUsers(filters as Parameters<typeof userService.listUsers>[0]);
      // Strip apiKey from list response for security
      const sanitized = users.map((u) => ({
        id: u.id,
        email: u.email,
        displayName: u.displayName,
        role: u.role,
        tier: u.tier,
        isActive: u.isActive,
        dailyApiCalls: u.dailyApiCalls,
        dailyApiLimit: u.dailyApiLimit,
        demoExpiresAt: u.demoExpiresAt,
        createdAt: u.createdAt,
        lastLoginAt: u.lastLoginAt,
      }));
      res.json({ users: sanitized, total: totalCount, limit, offset });
    } catch (error) {
      next(error);
    }
  });

  // GET /admin/users/:id — get user details
  router.get('/admin/users/:id', requireRole('admin'), validateUuidParam('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const user = await userService.getUser(userId);
      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      // Strip apiKey from response for security (same sanitization as list)
      res.json({
        id: user.id,
        email: user.email,
        displayName: user.displayName,
        role: user.role,
        tier: user.tier,
        isActive: user.isActive,
        dailyApiCalls: user.dailyApiCalls,
        dailyApiLimit: user.dailyApiLimit,
        demoExpiresAt: user.demoExpiresAt,
        emailConfirmed: user.emailConfirmed,
        activeAgents: user.activeAgents,
        userNumber: user.userNumber,
        commissionRate: user.commissionRate,
        referralCode: user.referralCode,
        referredBy: user.referredBy,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
        lastLoginAt: user.lastLoginAt,
      });
    } catch (error) {
      next(error);
    }
  });

  // PATCH /admin/users/:id — update user
  router.patch('/admin/users/:id', requireRole('admin'), validateUuidParam('id'), validateBody(updateUserSchema), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const input = { ...req.body };
      // Convert demoExpiresAt string to Date
      if (input.demoExpiresAt) {
        input.demoExpiresAt = new Date(input.demoExpiresAt);
      }
      const user = await userService.updateUser(userId, input);
      auditLog({ actor: req.user?.sub ?? 'admin', action: 'admin_update_user', resourceType: 'user', resourceId: userId, details: input, ip: req.ip });
      // Strip sensitive fields from response (apiKey, password hash, etc.)
      res.json({
        id: user.id, email: user.email, displayName: user.displayName,
        role: user.role, tier: user.tier, isActive: user.isActive,
        dailyApiCalls: user.dailyApiCalls, dailyApiLimit: user.dailyApiLimit,
        demoExpiresAt: user.demoExpiresAt, emailConfirmed: user.emailConfirmed,
        activeAgents: user.activeAgents, userNumber: user.userNumber,
        commissionRate: user.commissionRate, tokenBudgetMultiplier: user.tokenBudgetMultiplier, referralCode: user.referralCode,
        createdAt: user.createdAt, updatedAt: user.updatedAt,
      });
    } catch (error: unknown) {
      if (error instanceof Error && error.message === 'User not found') {
        res.status(404).json({ error: error.message });
        return;
      }
      next(error);
    }
  });

  // DELETE /admin/users/:id — deactivate (soft delete)
  router.delete('/admin/users/:id', requireRole('admin'), validateUuidParam('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const result = await userService.deactivateUser(userId);
      if (!result) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      auditLog({ actor: req.user?.sub ?? 'admin', action: 'admin_deactivate_user', resourceType: 'user', resourceId: userId, ip: req.ip });
      res.json({ status: 'deactivated', userId });
    } catch (error) {
      next(error);
    }
  });

  // DELETE /admin/users/:id/gdpr — GDPR permanent data deletion
  router.delete('/admin/users/:id/gdpr', requireRole('admin'), validateUuidParam('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const requestedBy = req.user?.sub ?? req.user?.userId ?? 'admin';
      const result = await userService.deleteUserData(userId, String(requestedBy));
      auditLog({ actor: String(requestedBy), action: 'gdpr_delete_user', resourceType: 'user', resourceId: userId, ip: req.ip });
      res.json({ status: 'deleted', userId, tablesAffected: result.tablesAffected });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('not found')) {
        res.status(404).json({ error: error.message });
        return;
      }
      if (error instanceof Error && error.message.includes('Cannot delete')) {
        res.status(400).json({ error: error.message });
        return;
      }
      next(error);
    }
  });

  // POST /admin/users/:id/reset-key — regenerate API key
  router.post('/admin/users/:id/reset-key', requireRole('admin'), validateUuidParam('id'), async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const userId = req.params.id as string;
      const newKey = await userService.regenerateApiKey(userId);
      auditLog({ actor: req.user?.sub ?? 'admin', action: 'admin_reset_api_key', resourceType: 'user', resourceId: userId, ip: req.ip });
      logger.info('Admin regenerated user API key', { adminId: req.user?.userId, targetUserId: userId });
      res.json({ userId, apiKey: newKey });
    } catch (error: unknown) {
      if (error instanceof Error && error.message.includes('Failed')) {
        res.status(404).json({ error: 'User not found' });
        return;
      }
      next(error);
    }
  });

  // GET /admin/stats — aggregate user statistics
  router.get('/admin/stats', requireRole('admin'), async (_req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    try {
      const { userService } = await import('../../users/user.service');
      const stats = await userService.getStats();
      res.json(stats);
    } catch (error) {
      next(error);
    }
  });

  // ── Admin: User Detail Management (Phase 3D) ──

  router.get('/admin/users/:id/wallet', requireRole('admin'), asyncHandler(async (req, res) => {
    const userId = String(req.params['id']);
    const { walletService } = await import('../../billing/wallet.service');
    const wallet = await walletService.getOrCreateWallet(userId);
    const transactions = await walletService.getTransactions(userId, 20, 0);
    res.json({ wallet, recentTransactions: transactions });
  }));

  router.post('/admin/users/:id/deposit', requireRole('admin'), validateBody(adminDepositSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = String(req.params['id']);
    const { amount, description } = req.body;

    const { walletService } = await import('../../billing/wallet.service');
    const tx = await walletService.deposit({
      userId,
      amount: Number(amount),
      description: description || 'Admin deposit',
      referenceType: 'admin_credit',
      referenceId: authReq.user?.userId ?? 'admin',
    });
    auditLog({ actor: authReq.user?.userId ?? 'admin', action: 'admin_deposit', resourceType: 'wallet', resourceId: userId, details: { amount, description }, ip: authReq.ip });

    // Notify user of admin deposit
    try {
      const { notificationService } = await import('../../notifications/notification.service');
      const creditAmount = (Number(amount) / 1_000_000).toFixed(2);
      await notificationService.send({
        userId, channel: 'in_app', type: 'wallet_deposit',
        subject: 'Credits ajoutes a votre compte',
        body: `${creditAmount} credits ont ete ajoutes a votre portefeuille. ${description || ''}`.trim(),
      });
    } catch { /* best effort */ }

    res.status(201).json({ transaction: tx });
  }));

  router.post('/admin/users/:id/refund', requireRole('admin'), validateBody(adminRefundSchema), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = String(req.params['id']);
    const { amount, description, transactionId } = req.body;

    const { walletService } = await import('../../billing/wallet.service');
    const tx = await walletService.deposit({
      userId,
      amount: Number(amount),
      description: description || `Refund for tx ${transactionId ?? 'manual'}`,
      referenceType: 'refund',
      referenceId: transactionId ?? null,
    });
    auditLog({ actor: authReq.user?.userId ?? 'admin', action: 'admin_refund', resourceType: 'wallet', resourceId: userId, details: { amount, transactionId }, ip: authReq.ip });

    // Notify user of refund
    try {
      const { notificationService } = await import('../../notifications/notification.service');
      const creditAmount = (Number(amount) / 1_000_000).toFixed(2);
      await notificationService.send({
        userId, channel: 'in_app', type: 'wallet_refund',
        subject: 'Remboursement effectue',
        body: `${creditAmount} credits ont ete rembourses sur votre portefeuille.`,
      });
    } catch { /* best effort */ }

    res.status(201).json({ transaction: tx });
  }));

  router.get('/admin/users/:id/preferences', requireRole('admin'), asyncHandler(async (req, res) => {
    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const prefs = await userPreferencesRepository.getByUserId(String(req.params['id']));
    res.json({ preferences: prefs });
  }));

  router.patch('/admin/users/:id/preferences', requireRole('admin'), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const uid = String(req.params['id']);
    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const prefs = await userPreferencesRepository.update(uid, req.body);
    auditLog({ actor: authReq.user?.userId ?? 'admin', action: 'update_user_preferences', resourceType: 'user_preferences', resourceId: uid, details: req.body, ip: authReq.ip });
    res.json({ preferences: prefs });
  }));

  router.get('/admin/users/:id/company', requireRole('admin'), asyncHandler(async (req, res) => {
    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const profile = await userPreferencesRepository.getCompanyProfile(String(req.params['id']));
    res.json({ companyProfile: profile });
  }));

  router.patch('/admin/users/:id/company', requireRole('admin'), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const uid = String(req.params['id']);
    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const prefs = await userPreferencesRepository.updateCompanyProfile(uid, req.body);
    auditLog({ actor: authReq.user?.userId ?? 'admin', action: 'update_user_company', resourceType: 'user_preferences', resourceId: uid, details: { keys: Object.keys(req.body) }, ip: authReq.ip });
    res.json({ companyProfile: prefs?.companyProfile ?? {} });
  }));

  router.get('/admin/users/:id/usage', requireRole('admin'), asyncHandler(async (req, res) => {
    const { walletService } = await import('../../billing/wallet.service');
    const usage = await walletService.getUsageSummary(String(req.params['id']));
    res.json({ usage });
  }));

  router.post('/admin/users/:id/gamification/reset', requireRole('admin'), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const uid = String(req.params['id']);
    const { userPreferencesRepository } = await import('../../users/user-preferences.repository');
    const prefs = await userPreferencesRepository.resetGamification(uid);
    auditLog({ actor: authReq.user?.userId ?? 'admin', action: 'reset_gamification', resourceType: 'user_preferences', resourceId: uid, details: {}, ip: authReq.ip });
    res.json({ gamification: prefs?.gamificationData ?? {} });
  }));

  router.post('/admin/users/:id/notify', requireRole('admin'), asyncHandler(async (req, res) => {
    const authReq = req as AuthenticatedRequest;
    const userId = String(req.params['id']);
    const { channel, subject, body: notifBody } = req.body;

    const { dbClient: db } = await import('../../infra');
    const { v4: uuid } = await import('uuid');
    if (!db.isConnected()) { res.status(500).json({ error: 'DB not connected' }); return; }

    await db.query(
      `INSERT INTO notifications (id, user_id, channel, type, subject, body, metadata)
       VALUES ($1, $2, $3, 'admin_message', $4, $5, $6)`,
      [uuid(), userId, channel ?? 'in_app', subject ?? 'Message admin', notifBody ?? '', JSON.stringify({ sentBy: authReq.user?.userId })],
    );
    auditLog({ actor: authReq.user?.userId ?? 'admin', action: 'send_notification', resourceType: 'notification', resourceId: userId, details: { channel, subject }, ip: authReq.ip });
    res.json({ message: 'Notification sent' });
  }));

  // ── Admin: Export (CSV) ──

  router.get('/admin/export/users', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');
    if (!db.isConnected()) { res.status(500).json({ error: 'DB not connected' }); return; }

    const result = await db.query(
      `SELECT u.id, u.email, u.display_name, u.role, u.tier, u.is_active, u.daily_api_calls, u.daily_api_limit, u.commission_rate, u.referral_code, u.user_number, u.created_at, u.last_login_at,
              w.balance_credits, w.total_deposited, w.total_spent
       FROM users u LEFT JOIN wallets w ON w.user_id = u.id
       WHERE u.role != 'system' ORDER BY u.created_at DESC`,
    );

    const headers = ['id','email','display_name','role','tier','is_active','daily_api_calls','daily_api_limit','commission_rate','referral_code','user_number','created_at','last_login_at','balance_credits','total_deposited','total_spent'];
    const csvRows = [headers.join(',')];
    for (const row of result.rows) {
      const r = row as Record<string, unknown>;
      csvRows.push(headers.map(h => {
        const val = r[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="freenzy-users-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvRows.join('\n'));
  }));

  // ── POST /admin/test/anthropic — mini ping ──
  router.post('/admin/test/anthropic', requireRole('admin'), asyncHandler(async (_req, res) => {
    try {
      const Anthropic = (await import('@anthropic-ai/sdk')).default;
      const client = new Anthropic({ apiKey: process.env['ANTHROPIC_API_KEY'] });
      const msg = await client.messages.create({
        model: 'claude-haiku-4-5-20251001',
        max_tokens: 30,
        messages: [{ role: 'user', content: 'Reply with exactly: "Freenzy test OK"' }],
      });
      const reply = msg.content[0]?.type === 'text' ? msg.content[0].text : 'no text';
      res.json({ ok: true, reply, model: msg.model });
    } catch (e) { res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) }); }
  }));

  // ── POST /admin/test/tts — ElevenLabs test ──
  router.post('/admin/test/tts', requireRole('admin'), asyncHandler(async (_req, res) => {
    const key = process.env['ELEVENLABS_API_KEY'];
    if (!key) { res.status(400).json({ ok: false, error: 'ELEVENLABS_API_KEY not set' }); return; }
    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: { 'xi-api-key': key, 'Content-Type': 'application/json' },
        body: JSON.stringify({ text: 'Bonjour, je suis Sarah, votre assistante IA.', model_id: 'eleven_multilingual_v2' }),
      });
      if (!response.ok) { res.status(400).json({ ok: false, error: `ElevenLabs error: ${response.status}` }); return; }
      res.json({ ok: true, message: 'ElevenLabs TTS opérationnel ✅' });
    } catch (e) { res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) }); }
  }));

  // ── POST /admin/test/email — Resend test ──
  router.post('/admin/test/email', requireRole('admin'), asyncHandler(async (req, res) => {
    const { to } = req.body as { to?: string };
    if (!to) { res.status(400).json({ error: 'to required' }); return; }
    const key = process.env['RESEND_API_KEY'];
    if (!key) { res.status(400).json({ ok: false, error: 'RESEND_API_KEY not set' }); return; }
    try {
      const response = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
        body: JSON.stringify({
          from: 'test@freenzy.io',
          to: [to],
          subject: 'Test Freenzy.io — Diagnostics',
          html: '<p>Cet email confirme que le service email Resend est opérationnel.</p>',
        }),
      });
      const data = await response.json() as Record<string, unknown>;
      if (!response.ok) { res.status(400).json({ ok: false, error: `Resend: ${String(data.message ?? response.status)}` }); return; }
      res.json({ ok: true, message: `Email envoyé à ${to}` });
    } catch (e) { res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) }); }
  }));

  // ── POST /admin/test/sms — Twilio SMS test ──
  router.post('/admin/test/sms', requireRole('admin'), asyncHandler(async (req, res) => {
    const { to } = req.body as { to?: string };
    if (!to) { res.status(400).json({ error: 'to required' }); return; }
    const sid = process.env['TWILIO_ACCOUNT_SID'];
    const authToken = process.env['TWILIO_AUTH_TOKEN'];
    const from = process.env['TWILIO_FROM_NUMBER'];
    if (!sid || !authToken || !from) { res.status(400).json({ ok: false, error: 'Twilio credentials not configured' }); return; }
    try {
      const { default: twilio } = await import('twilio');
      const client = twilio(sid, authToken);
      const msg = await client.messages.create({ body: 'Test Freenzy.io — SMS diagnostics ✅', from, to });
      res.json({ ok: true, message: `SMS envoyé (${msg.sid.slice(0, 12)}…)` });
    } catch (e) { res.status(500).json({ ok: false, error: e instanceof Error ? e.message : String(e) }); }
  }));

  // ── POST /admin/users/:id/impersonate — 1h temp token ──
  router.post('/admin/users/:id/impersonate', requireRole('admin'), validateUuidParam('id'), asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = String(req.params['id']);
    const { userService } = await import('../../users/user.service');
    const user = await userService.getUser(userId);
    if (!user) { res.status(404).json({ error: 'User not found' }); return; }
    if (user.role === 'admin') { res.status(403).json({ error: 'Cannot impersonate admin accounts' }); return; }
    const jwtLib = await import('jsonwebtoken');
    const token = jwtLib.default.sign(
      { sub: user.email, role: user.role, userId: user.id, tier: user.tier, impersonating: true, impersonatingAdmin: req.user?.sub },
      config.JWT_SECRET,
      { expiresIn: '1h' },
    );
    auditLog({ actor: req.user?.sub ?? 'admin', action: 'admin_impersonate', resourceType: 'user', resourceId: userId, ip: req.ip });
    logger.info('Admin impersonation', { admin: req.user?.sub, targetUser: userId });
    res.json({ token, expiresIn: '1h', userId: user.id, email: user.email, displayName: user.displayName });
  }));

  // ── GET /admin/users/:id/feature-flags ──
  router.get('/admin/users/:id/feature-flags', requireRole('admin'), validateUuidParam('id'), asyncHandler(async (req, res) => {
    const userId = String(req.params['id']);
    const { dbClient: db } = await import('../../infra');
    try {
      const result = await db.query(
        `SELECT feature_name, enabled, updated_at FROM user_feature_flags WHERE user_id = $1`,
        [userId],
      );
      res.json(result.rows.map(r => ({ feature: r.feature_name, enabled: r.enabled, updatedAt: r.updated_at })));
    } catch { res.json([]); }
  }));

  // ── PATCH /admin/users/:id/feature-flags ──
  router.patch('/admin/users/:id/feature-flags', requireRole('admin'), validateUuidParam('id'), asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = String(req.params['id']);
    const { feature, enabled } = req.body as { feature: string; enabled: boolean };
    if (!feature || typeof enabled !== 'boolean') { res.status(400).json({ error: 'feature and enabled required' }); return; }
    const { dbClient: db } = await import('../../infra');
    try {
      await db.query(
        `INSERT INTO user_feature_flags (user_id, feature_name, enabled, updated_at)
         VALUES ($1, $2, $3, NOW())
         ON CONFLICT (user_id, feature_name) DO UPDATE SET enabled = $3, updated_at = NOW()`,
        [userId, feature, enabled],
      );
      auditLog({ actor: req.user?.sub ?? 'admin', action: 'admin_feature_flag', resourceType: 'user', resourceId: userId, ip: req.ip, details: { feature, enabled } });
      res.json({ success: true });
    } catch { res.status(500).json({ error: 'Failed to update feature flag' }); }
  }));

  // ── GET /admin/referrals ──
  router.get('/admin/referrals', requireRole('admin'), asyncHandler(async (req, res) => {
    const { dbClient: db } = await import('../../infra');
    if (!db.isConnected()) { res.json({ referrals: [], stats: { total: 0, active: 0, totalCommission: 0 } }); return; }
    try {
      const limit = Math.min(Number(req.query['limit'] ?? 100), 500);
      const result = await db.query(`
        SELECT
          r.id, r.created_at,
          u_ref.email AS referrer_email, u_ref.display_name AS referrer_name, u_ref.commission_rate,
          u_new.email AS referred_email, u_new.display_name AS referred_name, u_new.tier AS referred_tier,
          u_new.created_at AS referred_at,
          COALESCE(w.total_deposited, 0) AS referred_deposited
        FROM referrals r
        JOIN users u_ref ON u_ref.id = r.referrer_id
        JOIN users u_new ON u_new.id = r.referred_id
        LEFT JOIN wallets w ON w.user_id = u_new.id
        ORDER BY r.created_at DESC
        LIMIT $1
      `, [limit]);
      const statsResult = await db.query(`
        SELECT
          COUNT(*) AS total,
          COUNT(*) FILTER (WHERE u_new.is_active = true) AS active
        FROM referrals r
        JOIN users u_ref ON u_ref.id = r.referrer_id
        JOIN users u_new ON u_new.id = r.referred_id
      `);
      const s = statsResult.rows[0] as { total: string; active: string } | undefined;
      res.json({
        referrals: result.rows.map(r => ({
          id: r.id,
          referrerEmail: r.referrer_email, referrerName: r.referrer_name,
          commissionRate: Number(r.commission_rate || 0),
          referredEmail: r.referred_email, referredName: r.referred_name, referredTier: r.referred_tier,
          referredAt: r.referred_at, referredDeposited: Number(r.referred_deposited || 0),
        })),
        stats: { total: Number(s?.total || 0), active: Number(s?.active || 0) },
      });
    } catch (e) { res.json({ referrals: [], stats: { total: 0, active: 0 }, error: e instanceof Error ? e.message : String(e) }); }
  }));

  // ── GET /admin/stats/tiers ──
  router.get('/admin/stats/tiers', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');
    try {
      const result = await db.query(`SELECT tier, COUNT(*) as count FROM users WHERE role != 'system' GROUP BY tier ORDER BY count DESC`);
      res.json(result.rows.map(r => ({ tier: r.tier, count: Number(r.count || 0) })));
    } catch { res.json([]); }
  }));

  // ── GET /admin/agents/:agentId/config ──
  router.get('/admin/agents/:agentId/config', requireRole('admin'), asyncHandler(async (req, res) => {
    const agentId = String(req.params['agentId']);
    const { dbClient: db } = await import('../../infra');
    try {
      const result = await db.query(
        'SELECT agent_id, temperature, max_tokens, system_prompt, model, updated_at, updated_by FROM agent_runtime_config WHERE agent_id = $1',
        [agentId],
      );
      if (result.rows.length === 0) {
        res.json({ agentId, temperature: 0.7, max_tokens: 4096, system_prompt: null, model: 'claude-sonnet-4-6', updated_at: null, updated_by: null });
        return;
      }
      res.json(result.rows[0]);
    } catch { res.json({ agentId, temperature: 0.7, max_tokens: 4096, system_prompt: null, model: 'claude-sonnet-4-6' }); }
  }));

  // ── PATCH /admin/agents/:agentId/config ──
  router.patch('/admin/agents/:agentId/config', requireRole('admin'), asyncHandler(async (req: AuthenticatedRequest, res) => {
    const agentId = String(req.params['agentId']);
    const { temperature, max_tokens, system_prompt, model } = req.body as {
      temperature?: number; max_tokens?: number; system_prompt?: string | null; model?: string;
    };

    // Validate ranges
    if (temperature !== undefined && (temperature < 0 || temperature > 1)) {
      res.status(400).json({ error: 'temperature must be between 0 and 1' }); return;
    }
    if (max_tokens !== undefined && (max_tokens < 256 || max_tokens > 32768)) {
      res.status(400).json({ error: 'max_tokens must be between 256 and 32768' }); return;
    }
    const validModels = ['claude-haiku-4-5-20251001', 'claude-sonnet-4-6', 'claude-opus-4-6'];
    if (model && !validModels.includes(model)) {
      res.status(400).json({ error: `model must be one of: ${validModels.join(', ')}` }); return;
    }

    const { dbClient: db } = await import('../../infra');
    try {
      await db.query(
        `INSERT INTO agent_runtime_config (agent_id, temperature, max_tokens, system_prompt, model, updated_at, updated_by)
         VALUES ($1, $2, $3, $4, $5, NOW(), $6)
         ON CONFLICT (agent_id) DO UPDATE SET
           temperature = COALESCE($2, agent_runtime_config.temperature),
           max_tokens = COALESCE($3, agent_runtime_config.max_tokens),
           system_prompt = COALESCE($4, agent_runtime_config.system_prompt),
           model = COALESCE($5, agent_runtime_config.model),
           updated_at = NOW(), updated_by = $6`,
        [agentId, temperature ?? null, max_tokens ?? null, system_prompt ?? null, model ?? null, req.user?.sub ?? 'admin'],
      );
      auditLog({ actor: req.user?.sub ?? 'admin', action: 'admin_update_agent_config', resourceType: 'agent', resourceId: agentId, details: { temperature, max_tokens, model }, ip: req.ip });
      res.json({ success: true });
    } catch (e) { res.status(500).json({ error: e instanceof Error ? e.message : 'Failed to update config' }); }
  }));

  // ── GET /admin/crons — list cron jobs with last run info ──
  router.get('/admin/crons', requireRole('admin'), asyncHandler(async (_req, res) => {
    const CRON_META: Array<{ name: string; description: string; intervalLabel: string; intervalMs: number }> = [
      { name: 'reset_daily_api_calls', description: 'Réinitialise les compteurs API quotidiens', intervalLabel: '1h (vérif)', intervalMs: 3_600_000 },
      { name: 'expire_demo_accounts', description: 'Expire les comptes démo arrivés à échéance', intervalLabel: '1h', intervalMs: 3_600_000 },
      { name: 'low_balance_alerts', description: 'Alertes solde faible', intervalLabel: '6h', intervalMs: 21_600_000 },
      { name: 'cleanup_stale_data', description: 'Nettoyage données périmées', intervalLabel: '24h', intervalMs: 86_400_000 },
      { name: 'check_low_balance_alert', description: 'Vérification solde faible (notifications)', intervalLabel: '30min', intervalMs: 1_800_000 },
      { name: 'repondeur_hourly_summary', description: 'Résumés horaires Répondeur', intervalLabel: '1h', intervalMs: 3_600_000 },
      { name: 'repondeur_daily_summary', description: 'Résumés quotidiens Répondeur (20:00)', intervalLabel: '1h (vérif)', intervalMs: 3_600_000 },
      { name: 'repondeur_gdpr_cleanup', description: 'Nettoyage RGPD Répondeur (30j)', intervalLabel: '24h', intervalMs: 86_400_000 },
      { name: 'check_alarms', description: 'Déclenchement alarmes utilisateurs', intervalLabel: '1min', intervalMs: 60_000 },
      { name: 'check_referral_qualifications', description: 'Qualification parrainages', intervalLabel: '24h', intervalMs: 86_400_000 },
      { name: 'check_batch_results', description: 'Polling résultats Anthropic Batch API', intervalLabel: '15min', intervalMs: 900_000 },
    ];

    const { dbClient: db } = await import('../../infra');
    if (!db.isConnected()) { res.json(CRON_META.map(j => ({ ...j, lastRun: null, lastStatus: null, lastDuration: null }))); return; }

    try {
      const result = await db.query(`
        SELECT DISTINCT ON (job_name)
          job_name, status, duration_ms, created_at AS last_run
        FROM cron_history
        ORDER BY job_name, last_run DESC
      `);
      const byName = new Map(result.rows.map(r => [r.job_name, r]));
      res.json(CRON_META.map(j => {
        const h = byName.get(j.name) as { status: string; duration_ms: number; last_run: string } | undefined;
        return { ...j, lastRun: h?.last_run ?? null, lastStatus: h?.status ?? null, lastDurationMs: h?.duration_ms ?? null };
      }));
    } catch { res.json(CRON_META.map(j => ({ ...j, lastRun: null, lastStatus: null, lastDurationMs: null }))); }
  }));

  // ── POST /admin/crons/:name/run — force a job execution ──
  router.post('/admin/crons/:name/run', requireRole('admin'), asyncHandler(async (req: AuthenticatedRequest, res) => {
    const jobName = String(req.params['name']);
    auditLog({ actor: req.user?.sub ?? 'admin', action: 'admin_cron_run', resourceType: 'cron', resourceId: jobName, ip: req.ip });
    try {
      const { cronService } = await import('../../core/cron/cron.service');
      await cronService.triggerJob(jobName);
      logger.info('Admin triggered cron job', { jobName, admin: req.user?.sub });
      res.json({ ok: true, message: `Job "${jobName}" exécuté avec succès.` });
    } catch (e) {
      const msg = e instanceof Error ? e.message : 'Erreur inconnue';
      res.status(400).json({ error: msg });
    }
  }));

  router.get('/admin/transactions', requireRole('admin'), asyncHandler(async (req, res) => {
    const { dbClient: db } = await import('../../infra');
    if (!db.isConnected()) { res.status(500).json({ error: 'DB not connected' }); return; }
    const limit = Math.min(Number(req.query['limit'] ?? 50), 200);
    const offset = Number(req.query['offset'] ?? 0);
    const result = await db.query(
      `SELECT wt.id, wt.user_id, u.email, wt.type, wt.amount, wt.balance_after, wt.description, wt.reference_type, wt.created_at
       FROM wallet_transactions wt LEFT JOIN users u ON u.id = wt.user_id
       ORDER BY wt.created_at DESC LIMIT $1 OFFSET $2`,
      [limit, offset],
    );
    res.json({ transactions: result.rows, total: result.rowCount, limit, offset });
  }));

  router.get('/admin/export/transactions', requireRole('admin'), asyncHandler(async (req, res) => {
    const { dbClient: db } = await import('../../infra');
    if (!db.isConnected()) { res.status(500).json({ error: 'DB not connected' }); return; }

    const limit = Number(req.query['limit'] ?? 1000);
    const result = await db.query(
      `SELECT wt.id, wt.user_id, u.email, wt.type, wt.amount, wt.balance_after, wt.description, wt.reference_type, wt.created_at
       FROM wallet_transactions wt LEFT JOIN users u ON u.id = wt.user_id
       ORDER BY wt.created_at DESC LIMIT $1`,
      [limit],
    );

    const headers = ['id','user_id','email','type','amount','balance_after','description','reference_type','created_at'];
    const csvRows = [headers.join(',')];
    for (const row of result.rows) {
      const r = row as Record<string, unknown>;
      csvRows.push(headers.map(h => {
        const val = r[h];
        if (val === null || val === undefined) return '';
        const str = String(val);
        return str.includes(',') || str.includes('"') ? `"${str.replace(/"/g, '""')}"` : str;
      }).join(','));
    }

    res.setHeader('Content-Type', 'text/csv; charset=utf-8');
    res.setHeader('Content-Disposition', `attachment; filename="freenzy-transactions-${new Date().toISOString().split('T')[0]}.csv"`);
    res.send(csvRows.join('\n'));
  }));

  // ═══════════════════════════════════════════════════
  //   PILOTAGE — Admin endpoints for all client features
  // ═══════════════════════════════════════════════════

  // GET /admin/projects — list all projects across users
  router.get('/admin/projects', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');
    const { rows } = await db.query(`
      SELECT p.id, p.name, p.description, p.is_default, p.is_active, p.created_at,
             u.email, u.display_name,
             (SELECT COUNT(*) FROM projects) AS total,
             (SELECT COUNT(*) FILTER (WHERE is_active) FROM projects) AS active,
             (SELECT COUNT(DISTINCT user_id) FROM projects) AS users_count
      FROM projects p JOIN users u ON u.id = p.user_id
      ORDER BY p.created_at DESC LIMIT 200
    `);
    const stats = rows[0] ? { total: Number(rows[0].total), active: Number(rows[0].active), usersCount: Number(rows[0].users_count) } : { total: 0, active: 0, usersCount: 0 };
    res.json({ projects: rows.map((r: Record<string, unknown>) => ({ id: r.id, name: r.name, description: r.description, isDefault: r.is_default, isActive: r.is_active, createdAt: r.created_at, email: r.email, displayName: r.display_name })), stats });
  }));

  // GET /admin/modules — list all modules across users
  router.get('/admin/modules', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');
    const { rows } = await db.query(`
      SELECT m.id, m.name, m.slug, m.emoji, m.type, m.is_published, m.public_access,
             m.record_count, m.created_at, u.email, u.display_name
      FROM user_modules m JOIN users u ON u.id = m.user_id
      ORDER BY m.created_at DESC LIMIT 200
    `);
    const statsRes = await db.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE is_published) AS published,
             COUNT(*) FILTER (WHERE public_access) AS public_count,
             COALESCE(SUM(record_count), 0) AS total_records
      FROM user_modules
    `);
    const s = statsRes.rows[0] ?? {};
    const typeRes = await db.query(`SELECT type, COUNT(*)::int AS count FROM user_modules GROUP BY type ORDER BY count DESC`);
    res.json({
      modules: rows.map((r: Record<string, unknown>) => ({ id: r.id, name: r.name, slug: r.slug, emoji: r.emoji, type: r.type, isPublished: r.is_published, publicAccess: r.public_access, recordCount: r.record_count, createdAt: r.created_at, email: r.email, displayName: r.display_name })),
      stats: { total: Number(s.total), published: Number(s.published), publicCount: Number(s.public_count), totalRecords: Number(s.total_records) },
      byType: typeRes.rows,
    });
  }));

  // GET /admin/campaigns — list all campaigns cross-users
  router.get('/admin/campaigns', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');
    const { rows } = await db.query(`
      SELECT c.id, c.title, c.campaign_type, c.status, c.budget_credits, c.spent_credits,
             c.platforms, c.schedule, c.created_at, u.email, u.display_name
      FROM campaigns c JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at DESC LIMIT 200
    `);
    const statsRes = await db.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE status = 'draft') AS drafts,
             COUNT(*) FILTER (WHERE status = 'pending_approval') AS pending,
             COUNT(*) FILTER (WHERE status = 'approved') AS approved,
             COUNT(*) FILTER (WHERE status = 'active') AS active,
             COUNT(*) FILTER (WHERE status = 'completed') AS completed
      FROM campaigns
    `);
    const s = statsRes.rows[0] ?? {};
    res.json({
      campaigns: rows.map((r: Record<string, unknown>) => ({ id: r.id, name: r.title, type: r.campaign_type, status: r.status, budget: r.budget_credits, spent: r.spent_credits, platforms: r.platforms, createdAt: r.created_at, email: r.email, displayName: r.display_name })),
      stats: { total: Number(s.total), drafts: Number(s.drafts), pending: Number(s.pending), approved: Number(s.approved), active: Number(s.active), completed: Number(s.completed) },
    });
  }));

  // PATCH /admin/campaigns/:id/status — change campaign status
  router.patch('/admin/campaigns/:id/status', requireRole('admin'), asyncHandler(async (req, res) => {
    const { dbClient: db } = await import('../../infra');
    const id = String(req.params['id']);
    const { status } = req.body as { status: string };
    const validStatuses = ['draft', 'pending_approval', 'approved', 'scheduled', 'active', 'paused', 'completed', 'cancelled'];
    if (!validStatuses.includes(status)) { res.status(400).json({ error: 'Invalid status' }); return; }
    const { rowCount } = await db.query(`UPDATE campaigns SET status = $1, updated_at = NOW() WHERE id = $2`, [status, id]);
    if (!rowCount) { res.status(404).json({ error: 'Campaign not found' }); return; }
    auditLog({ actor: (req as AuthenticatedRequest).user?.sub ?? 'admin', action: 'admin_campaign_status', resourceType: 'campaign', resourceId: id, ip: req.ip });
    res.json({ success: true });
  }));

  // GET /admin/alarms — list all alarms cross-users
  router.get('/admin/alarms', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');
    const { rows } = await db.query(`
      SELECT a.id, a.name, a.is_active, a.alarm_time, a.timezone, a.days_of_week,
             a.mode, a.delivery_method, a.last_triggered_at, a.last_trigger_status,
             a.created_at, u.email, u.display_name
      FROM user_alarms a JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC LIMIT 200
    `);
    const statsRes = await db.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE is_active) AS active,
             COUNT(DISTINCT user_id) AS users_count
      FROM user_alarms
    `);
    const modeRes = await db.query(`SELECT mode, COUNT(*)::int AS count FROM user_alarms GROUP BY mode ORDER BY count DESC`);
    const deliveryRes = await db.query(`SELECT delivery_method, COUNT(*)::int AS count FROM user_alarms GROUP BY delivery_method ORDER BY count DESC`);
    const s = statsRes.rows[0] ?? {};
    res.json({
      alarms: rows.map((r: Record<string, unknown>) => ({ id: r.id, name: r.name, isActive: r.is_active, alarmTime: r.alarm_time, timezone: r.timezone, daysOfWeek: r.days_of_week, mode: r.mode, deliveryMethod: r.delivery_method, lastTriggeredAt: r.last_triggered_at, lastTriggerStatus: r.last_trigger_status, createdAt: r.created_at, email: r.email, displayName: r.display_name })),
      stats: { total: Number(s.total), active: Number(s.active), usersCount: Number(s.users_count) },
      byMode: modeRes.rows,
      byDelivery: deliveryRes.rows,
    });
  }));

  // GET /admin/custom-agents — list all custom agents cross-users
  router.get('/admin/custom-agents', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');
    const { rows } = await db.query(`
      SELECT ca.id, ca.name, ca.role, ca.emoji, ca.domain, ca.tone,
             ca.autonomy_level, ca.is_active, ca.created_at, u.email, u.display_name
      FROM custom_agents ca JOIN users u ON u.id = ca.user_id
      ORDER BY ca.created_at DESC LIMIT 200
    `);
    const statsRes = await db.query(`
      SELECT COUNT(*) AS total,
             COUNT(*) FILTER (WHERE is_active) AS active,
             COUNT(DISTINCT user_id) AS users_count,
             COALESCE(AVG(autonomy_level), 0) AS avg_autonomy
      FROM custom_agents
    `);
    const s = statsRes.rows[0] ?? {};
    res.json({
      agents: rows.map((r: Record<string, unknown>) => ({ id: r.id, name: r.name, role: r.role, emoji: r.emoji, domain: r.domain, tone: r.tone, autonomyLevel: r.autonomy_level, isActive: r.is_active, createdAt: r.created_at, email: r.email, displayName: r.display_name })),
      stats: { total: Number(s.total), active: Number(s.active), usersCount: Number(s.users_count), avgAutonomy: Math.round(Number(s.avg_autonomy)) },
    });
  }));

  // PATCH /admin/custom-agents/:id — toggle is_active
  router.patch('/admin/custom-agents/:id', requireRole('admin'), asyncHandler(async (req, res) => {
    const { dbClient: db } = await import('../../infra');
    const id = String(req.params['id']);
    const { isActive } = req.body as { isActive: boolean };
    const { rowCount } = await db.query(`UPDATE custom_agents SET is_active = $1, updated_at = NOW() WHERE id = $2`, [isActive, id]);
    if (!rowCount) { res.status(404).json({ error: 'Custom agent not found' }); return; }
    auditLog({ actor: (req as AuthenticatedRequest).user?.sub ?? 'admin', action: 'admin_toggle_custom_agent', resourceType: 'custom_agent', resourceId: id, ip: req.ip });
    res.json({ success: true });
  }));

  // GET /admin/personal-agents/stats — aggregated stats for all personal agents
  router.get('/admin/personal-agents/stats', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');

    // Agent activations
    const configsRes = await db.query(`SELECT agent_id, COUNT(*)::int AS total, COUNT(*) FILTER (WHERE is_active)::int AS active FROM personal_agent_configs GROUP BY agent_id ORDER BY total DESC`);

    // Budget
    const budgetRes = await db.query(`SELECT COUNT(*)::int AS transactions, COUNT(DISTINCT user_id)::int AS users, COALESCE(SUM(amount_cents) FILTER (WHERE type='income'),0)::bigint AS income, COALESCE(SUM(amount_cents) FILTER (WHERE type='expense'),0)::bigint AS expenses FROM budget_transactions`);

    // Comptable
    const comptaRes = await db.query(`SELECT COUNT(*)::int AS records, COUNT(DISTINCT user_id)::int AS users FROM freelance_records`);

    // Chasseur
    const chasseurRes = await db.query(`SELECT status, COUNT(*)::int AS count FROM mission_pipeline GROUP BY status ORDER BY count DESC`);

    // CV
    const cvRes = await db.query(`SELECT COUNT(*)::int AS total FROM cv_profiles`);

    // Events
    const eventsRes = await db.query(`SELECT COUNT(*)::int AS total, COUNT(DISTINCT user_id)::int AS users FROM events_planner`);

    // Writing
    const writingRes = await db.query(`SELECT COUNT(*)::int AS projects, COUNT(DISTINCT user_id)::int AS users, COALESCE(SUM(current_word_count),0)::int AS words FROM writing_projects`);

    res.json({
      configs: configsRes.rows,
      budget: budgetRes.rows[0] ?? { transactions: 0, users: 0, income: 0, expenses: 0 },
      comptable: comptaRes.rows[0] ?? { records: 0, users: 0 },
      chasseur: chasseurRes.rows,
      cv: { total: cvRes.rows[0]?.total ?? 0 },
      events: eventsRes.rows[0] ?? { total: 0, users: 0 },
      writing: writingRes.rows[0] ?? { projects: 0, users: 0, words: 0 },
    });
  }));

  // GET /admin/documents — list all documents cross-users
  router.get('/admin/documents', requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient: db } = await import('../../infra');
    const { rows } = await db.query(`
      SELECT d.id, d.original_filename, d.file_type, d.size_bytes,
             d.token_estimate, d.agent_context, d.created_at, u.email, u.display_name
      FROM user_documents d JOIN users u ON u.id = d.user_id
      WHERE d.is_active = true ORDER BY d.created_at DESC LIMIT 200
    `);
    const statsRes = await db.query(`
      SELECT COUNT(*) AS total, COUNT(DISTINCT user_id) AS users_count,
             COALESCE(SUM(size_bytes),0) AS total_bytes,
             COALESCE(SUM(token_estimate),0) AS total_tokens
      FROM user_documents WHERE is_active = true
    `);
    const typeRes = await db.query(`SELECT file_type, COUNT(*)::int AS count FROM user_documents WHERE is_active = true GROUP BY file_type ORDER BY count DESC`);
    const contextRes = await db.query(`SELECT agent_context, COUNT(*)::int AS count FROM user_documents WHERE is_active = true GROUP BY agent_context ORDER BY count DESC`);
    const s = statsRes.rows[0] ?? {};
    res.json({
      documents: rows.map((r: Record<string, unknown>) => ({ id: r.id, filename: r.original_filename, fileType: r.file_type, sizeBytes: r.size_bytes, tokenEstimate: r.token_estimate, agentContext: r.agent_context, createdAt: r.created_at, email: r.email, displayName: r.display_name })),
      stats: { total: Number(s.total), usersCount: Number(s.users_count), totalBytes: Number(s.total_bytes), totalTokens: Number(s.total_tokens) },
      byType: typeRes.rows,
      byContext: contextRes.rows,
    });
  }));

  // DELETE /admin/documents/:id — soft-delete document
  router.delete('/admin/documents/:id', requireRole('admin'), asyncHandler(async (req, res) => {
    const { dbClient: db } = await import('../../infra');
    const id = String(req.params['id']);
    const { rowCount } = await db.query(`UPDATE user_documents SET is_active = false, updated_at = NOW() WHERE id = $1 AND is_active = true`, [id]);
    if (!rowCount) { res.status(404).json({ error: 'Document not found' }); return; }
    auditLog({ actor: (req as AuthenticatedRequest).user?.sub ?? 'admin', action: 'admin_delete_document', resourceType: 'document', resourceId: id, ip: req.ip });
    res.json({ success: true });
  }));

  return router;
}
