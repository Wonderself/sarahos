import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import { validateBody, validateUuidParam } from '../validation.middleware';
import { repondeurConfigSchema } from '../validation.schemas';
import type { AuthenticatedRequest } from '../auth.types';
import {
  getRepondeurConfig,
  createRepondeurConfig,
  updateRepondeurConfig,
  deleteRepondeurConfig,
  getRepondeurMessages,
  getRepondeurOrders,
  updateOrderStatus,
  getRepondeurSummaries,
  getRepondeurStats,
  exportContactData,
  deleteContactData,
} from '../../agents/level1-execution/repondeur/repondeur.tools';
import { eventBus } from '../../core/event-bus/event-bus';

function getUserId(req: AuthenticatedRequest): string | null {
  return req.user?.userId ?? req.user?.sub ?? null;
}

export function createRepondeurRouter(): Router {
  const router = Router();

  // ── Config CRUD ──

  router.get('/repondeur/config', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }
    res.json(config);
  }));

  router.post('/repondeur/config', verifyToken, validateBody(repondeurConfigSchema), asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const existing = await getRepondeurConfig(userId);
    if (existing) { res.status(409).json({ error: 'Config already exists, use PUT to update' }); return; }

    const config = await createRepondeurConfig(userId, req.body as Record<string, unknown>);
    res.status(201).json(config);
  }));

  router.put('/repondeur/config', verifyToken, validateBody(repondeurConfigSchema), asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await updateRepondeurConfig(userId, req.body as Record<string, unknown>);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }
    res.json(config);
  }));

  router.delete('/repondeur/config', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const deleted = await deleteRepondeurConfig(userId);
    if (!deleted) { res.status(404).json({ error: 'No config to delete' }); return; }
    res.json({ message: 'Repondeur config deleted' });
  }));

  // ── Messages ──

  router.get('/repondeur/messages', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const limit = Math.min(Number(req.query['limit']) || 50, 200);
    const offset = Number(req.query['offset']) || 0;
    const classification = req.query['classification'] as string | undefined;
    const priority = req.query['priority'] as string | undefined;

    const result = await getRepondeurMessages(config.id, { limit, offset, classification, priority });
    res.json({ ...result, limit, offset });
  }));

  router.delete('/repondeur/messages/:id', verifyToken, validateUuidParam('id'), asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }
    // GDPR: user can delete their own messages
    const { dbClient } = await import('../../infra');
    await dbClient.query('DELETE FROM repondeur_messages WHERE id = $1 AND user_id = $2', [String(req.params['id']), userId]);
    res.json({ message: 'Message deleted' });
  }));

  // ── Orders ──

  router.get('/repondeur/orders', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const limit = Math.min(Number(req.query['limit']) || 50, 200);
    const offset = Number(req.query['offset']) || 0;
    const status = req.query['status'] as string | undefined;

    const result = await getRepondeurOrders(config.id, { limit, offset, status });
    res.json({ ...result, limit, offset });
  }));

  router.patch('/repondeur/orders/:id', verifyToken, validateUuidParam('id'), asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const status = (req.body as Record<string, unknown>)['status'] as string;
    if (!status || !['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      res.status(400).json({ error: 'Valid status required (pending, confirmed, cancelled, completed)' });
      return;
    }

    // Verify ownership: order must belong to user's config (IDOR fix)
    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const { dbClient } = await import('../../infra');
    const orderParamId = String(req.params['id']);
    const orderCheck = await dbClient.query(
      'SELECT config_id FROM repondeur_orders WHERE id = $1',
      [orderParamId],
    );
    if (!orderCheck.rows[0] || (orderCheck.rows[0] as Record<string, unknown>)['config_id'] !== config.id) {
      res.status(404).json({ error: 'Order not found' });
      return;
    }

    const order = await updateOrderStatus(orderParamId, status);
    if (!order) { res.status(404).json({ error: 'Order not found' }); return; }
    res.json(order);
  }));

  // ── Summaries ──

  router.get('/repondeur/summaries', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const limit = Math.min(Number(req.query['limit']) || 20, 100);
    const offset = Number(req.query['offset']) || 0;

    const result = await getRepondeurSummaries(config.id, { limit, offset });
    res.json({ ...result, limit, offset });
  }));

  router.post('/repondeur/summaries/generate', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const now = new Date();
    const periodEnd = now.toISOString();
    const periodStart = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    await eventBus.publish('RepondeurSummaryRequested', 'repondeur-api', {
      configId: config.id,
      userId,
      periodStart,
      periodEnd,
      summaryType: 'manual',
    });

    res.json({ message: 'Summary generation triggered', periodStart, periodEnd });
  }));

  // ── Stats ──

  router.get('/repondeur/stats', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const stats = await getRepondeurStats(config.id);
    res.json(stats);
  }));

  // ── FAQ Management ──

  router.post('/repondeur/faq', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const { question, answer, category } = req.body as { question: string; answer: string; category?: string };
    if (!question || !answer) { res.status(400).json({ error: 'question and answer required' }); return; }

    const { v4: uuidv4 } = await import('uuid');
    const newFaq = { id: uuidv4(), question, answer, category: category ?? 'general', isActive: true };
    const updatedFaqs = [...config.faqEntries, newFaq];
    await updateRepondeurConfig(userId, { faqEntries: updatedFaqs } as Record<string, unknown>);

    res.status(201).json(newFaq);
  }));

  router.put('/repondeur/faq/:id', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const faqId = String(req.params['id']);
    const updates = req.body as Record<string, unknown>;
    const updatedFaqs = config.faqEntries.map(f =>
      f.id === faqId ? { ...f, ...updates, id: faqId } : f,
    );
    await updateRepondeurConfig(userId, { faqEntries: updatedFaqs } as Record<string, unknown>);

    res.json({ message: 'FAQ updated' });
  }));

  router.delete('/repondeur/faq/:id', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const updatedFaqs = config.faqEntries.filter(f => f.id !== String(req.params['id']));
    await updateRepondeurConfig(userId, { faqEntries: updatedFaqs } as Record<string, unknown>);

    res.json({ message: 'FAQ deleted' });
  }));

  // ── VIP Contacts ──

  router.post('/repondeur/vip', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const { phone, name, relationship, notes } = req.body as { phone: string; name: string; relationship?: string; notes?: string };
    if (!phone || !name) { res.status(400).json({ error: 'phone and name required' }); return; }

    const newVip = { phone, name, relationship: relationship ?? '', notes: notes ?? '' };
    const updatedVips = [...config.vipContacts, newVip];
    await updateRepondeurConfig(userId, { vipContacts: updatedVips } as Record<string, unknown>);

    res.status(201).json(newVip);
  }));

  router.delete('/repondeur/vip/:phone', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const phone = decodeURIComponent(String(req.params['phone']));
    const updatedVips = config.vipContacts.filter(v => v.phone !== phone);
    await updateRepondeurConfig(userId, { vipContacts: updatedVips } as Record<string, unknown>);

    res.json({ message: 'VIP contact removed' });
  }));

  // ── Blocked Contacts ──

  router.post('/repondeur/blocked', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const { phone } = req.body as { phone: string };
    if (!phone) { res.status(400).json({ error: 'phone required' }); return; }

    const updatedBlocked = [...new Set([...config.blockedContacts, phone])];
    await updateRepondeurConfig(userId, { blockedContacts: updatedBlocked } as Record<string, unknown>);

    res.status(201).json({ message: 'Contact blocked', phone });
  }));

  router.delete('/repondeur/blocked/:phone', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const phone = decodeURIComponent(String(req.params['phone']));
    const updatedBlocked = config.blockedContacts.filter(b => b !== phone);
    await updateRepondeurConfig(userId, { blockedContacts: updatedBlocked } as Record<string, unknown>);

    res.json({ message: 'Contact unblocked' });
  }));

  // ── GDPR ──

  router.post('/repondeur/gdpr/export', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const { phone } = req.body as { phone: string };
    if (!phone) { res.status(400).json({ error: 'phone required' }); return; }

    const data = await exportContactData(config.id, phone);
    res.json(data);
  }));

  router.delete('/repondeur/gdpr/contact/:phone', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }

    const phone = decodeURIComponent(String(req.params['phone']));
    const result = await deleteContactData(config.id, phone);
    res.json({ message: 'Contact data deleted', ...result });
  }));

  // ── Test ──

  router.post('/repondeur/test', verifyToken, asyncHandler(async (req, res) => {
    const userId = getUserId(req as AuthenticatedRequest);
    if (!userId) { res.status(401).json({ error: 'User ID required' }); return; }

    const config = await getRepondeurConfig(userId);
    if (!config) { res.status(404).json({ error: 'No repondeur config found' }); return; }
    if (!config.isActive) { res.status(400).json({ error: 'Repondeur is not active' }); return; }

    const { message } = req.body as { message: string };
    if (!message) { res.status(400).json({ error: 'message required' }); return; }

    await eventBus.publish('RepondeurMessageReceived', 'repondeur-test', {
      senderPhone: '+33600000000',
      senderName: 'Test User',
      messageContent: message,
      messageType: 'text',
      waMessageId: `test-${Date.now()}`,
      userId,
    });

    res.json({ message: 'Test message sent to repondeur agent' });
  }));

  // ── Admin Endpoints ──

  router.get('/repondeur/admin/stats', verifyToken, requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient } = await import('../../infra');

    const [configStats, messageStats, orderStats, summaryStats, classificationBreakdown, dailyVolume] = await Promise.all([
      dbClient.query(`SELECT COUNT(*) as total, COUNT(*) FILTER (WHERE is_active) as active FROM repondeur_configs`),
      dbClient.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE created_at > NOW() - INTERVAL '24 hours') as today,
        COALESCE(SUM(tokens_used), 0) as total_tokens,
        COALESCE(SUM(billed_credits), 0) as total_credits
        FROM repondeur_messages`),
      dbClient.query(`SELECT
        COUNT(*) as total,
        COUNT(*) FILTER (WHERE status = 'pending') as pending
        FROM repondeur_orders`),
      dbClient.query(`SELECT COUNT(*) as total FROM repondeur_summaries`),
      dbClient.query(`SELECT classification, COUNT(*)::int as count FROM repondeur_messages GROUP BY classification ORDER BY count DESC`),
      dbClient.query(`SELECT DATE(created_at) as date, COUNT(*)::int as count FROM repondeur_messages WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY DATE(created_at) ORDER BY date`),
    ]);

    const cs = configStats.rows[0] as Record<string, unknown>;
    const ms = messageStats.rows[0] as Record<string, unknown>;
    const os = orderStats.rows[0] as Record<string, unknown>;
    const ss = summaryStats.rows[0] as Record<string, unknown>;

    res.json({
      stats: {
        totalConfigs: Number(cs['total'] ?? 0),
        activeConfigs: Number(cs['active'] ?? 0),
        totalMessages: Number(ms['total'] ?? 0),
        messagesToday: Number(ms['today'] ?? 0),
        totalOrders: Number(os['total'] ?? 0),
        pendingOrders: Number(os['pending'] ?? 0),
        totalSummaries: Number(ss['total'] ?? 0),
        totalTokensUsed: Number(ms['total_tokens'] ?? 0),
        totalBilledCredits: Number(ms['total_credits'] ?? 0),
      },
      classifications: classificationBreakdown.rows,
      dailyVolume: dailyVolume.rows,
    });
  }));

  router.get('/repondeur/admin/configs', verifyToken, requireRole('admin'), asyncHandler(async (_req, res) => {
    const { dbClient } = await import('../../infra');

    const result = await dbClient.query(`
      SELECT
        rc.user_id,
        u.email as user_email,
        rc.is_active,
        rc.active_mode,
        rc.active_style,
        (SELECT COUNT(*) FROM repondeur_messages WHERE config_id = rc.id) as message_count,
        (SELECT COUNT(*) FROM repondeur_orders WHERE config_id = rc.id) as order_count,
        (SELECT MAX(created_at) FROM repondeur_messages WHERE config_id = rc.id) as last_message_at,
        (SELECT COALESCE(SUM(tokens_used), 0) FROM repondeur_messages WHERE config_id = rc.id) as tokens_used,
        (SELECT COALESCE(SUM(billed_credits), 0) FROM repondeur_messages WHERE config_id = rc.id) as billed_credits
      FROM repondeur_configs rc
      JOIN users u ON u.id = rc.user_id
      ORDER BY rc.is_active DESC, rc.updated_at DESC
    `);

    const configs = result.rows.map((r: Record<string, unknown>) => ({
      userId: r['user_id'],
      userEmail: r['user_email'],
      isActive: r['is_active'],
      activeMode: r['active_mode'],
      activeStyle: r['active_style'],
      messageCount: Number(r['message_count'] ?? 0),
      orderCount: Number(r['order_count'] ?? 0),
      lastMessageAt: r['last_message_at'] ? String(r['last_message_at']) : null,
      tokensUsed: Number(r['tokens_used'] ?? 0),
      billedCredits: Number(r['billed_credits'] ?? 0),
    }));

    res.json({ configs });
  }));

  return router;
}
