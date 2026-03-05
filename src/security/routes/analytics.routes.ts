import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import { dbClient } from '../../infra/database/db-client';

export function createAnalyticsRouter(): Router {
  const router = Router();

  // ── Studio analytics ──
  router.get('/analytics/studio', verifyToken, requireRole('admin'), asyncHandler(async (_req, res) => {
    try {
      // Try to get real data from studio_generations table
      const result = await dbClient.query(`
        SELECT
          COUNT(*) FILTER (WHERE type = 'video') as video_count,
          COUNT(*) FILTER (WHERE type = 'photo') as photo_count,
          COALESCE(SUM(cost_credits), 0) as total_cost,
          COALESCE(AVG(cost_credits), 0) as avg_cost
        FROM studio_generations
      `);
      const row = result.rows[0] || {};
      res.json({
        videoGenerations: Number(row.video_count || 0),
        photoGenerations: Number(row.photo_count || 0),
        totalCost: Number(row.total_cost || 0),
        avgCostPerGeneration: Number(Number(row.avg_cost || 0).toFixed(1)),
        topWorkflows: [],
        recentGenerations: [],
      });
    } catch {
      // Table might not exist yet — return empty data
      res.json({
        videoGenerations: 0,
        photoGenerations: 0,
        totalCost: 0,
        avgCostPerGeneration: 0,
        topWorkflows: [],
        recentGenerations: [],
      });
    }
  }));

  // ── Documents analytics ──
  router.get('/analytics/documents', verifyToken, requireRole('admin'), asyncHandler(async (_req, res) => {
    try {
      const countResult = await dbClient.query(`
        SELECT
          COUNT(*) as total,
          COALESCE(SUM(size_bytes), 0) as total_bytes,
          COALESCE(AVG(token_estimate), 0) as avg_tokens
        FROM user_documents
      `);
      const countRow = countResult.rows[0] || {};

      const typeResult = await dbClient.query(`
        SELECT file_type as type, COUNT(*) as count
        FROM user_documents
        GROUP BY file_type
        ORDER BY count DESC
      `);

      res.json({
        totalDocuments: Number(countRow.total || 0),
        totalStorageBytes: Number(countRow.total_bytes || 0),
        avgTokensPerDoc: Math.round(Number(countRow.avg_tokens || 0)),
        byType: typeResult.rows.map(r => ({ type: r.type, count: Number(r.count) })),
        topUsers: [],
      });
    } catch {
      res.json({
        totalDocuments: 0,
        totalStorageBytes: 0,
        avgTokensPerDoc: 0,
        byType: [],
        topUsers: [],
      });
    }
  }));

  // ── Voice & Visio analytics ──
  router.get('/analytics/voice', verifyToken, requireRole('admin'), asyncHandler(async (_req, res) => {
    try {
      const result = await dbClient.query(`
        SELECT
          COUNT(*) FILTER (WHERE type = 'visio') as visio_count,
          COALESCE(AVG(duration_sec) FILTER (WHERE type = 'visio'), 0) as avg_duration,
          COUNT(*) FILTER (WHERE type = 'tts') as tts_count,
          COUNT(*) FILTER (WHERE type = 'stt') as stt_count,
          COUNT(*) FILTER (WHERE provider = 'deepgram') as deepgram_count,
          COUNT(*) FILTER (WHERE provider = 'elevenlabs') as elevenlabs_count,
          COALESCE(SUM(cost_credits), 0) as total_credits
        FROM voice_usage
      `);
      const row = result.rows[0] || {};

      res.json({
        visioSessions: Number(row.visio_count || 0),
        avgSessionDurationSec: Number(Number(row.avg_duration || 0).toFixed(0)),
        totalTTSCalls: Number(row.tts_count || 0),
        totalSTTCalls: Number(row.stt_count || 0),
        deepgramUsage: Number(row.deepgram_count || 0),
        elevenLabsUsage: Number(row.elevenlabs_count || 0),
        totalVoiceCredits: Number(row.total_credits || 0),
      });
    } catch {
      res.json({
        visioSessions: 0,
        avgSessionDurationSec: 0,
        totalTTSCalls: 0,
        totalSTTCalls: 0,
        deepgramUsage: 0,
        elevenLabsUsage: 0,
        totalVoiceCredits: 0,
      });
    }
  }));

  // ── Revenue timeline ──
  router.get('/analytics/revenue-trend', verifyToken, requireRole('admin'), asyncHandler(async (req, res) => {
    const period = String(req.query['period'] ?? '30d');
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    try {
      const result = await dbClient.query(`
        SELECT
          DATE_TRUNC('day', created_at) as date,
          COALESCE(SUM(CASE WHEN type = 'credit' THEN amount ELSE 0 END), 0) as revenue,
          COALESCE(SUM(CASE WHEN type = 'debit' THEN ABS(amount) ELSE 0 END), 0) as cost
        FROM billing_transactions
        WHERE created_at >= NOW() - ($1 * INTERVAL '1 day')
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date ASC
      `, [days]);
      const data = result.rows.map(r => ({
        date: new Date(r.date).toISOString().slice(0, 10),
        revenue: Number(r.revenue || 0),
        cost: Number(r.cost || 0),
        margin: Number(r.revenue || 0) - Number(r.cost || 0),
      }));
      res.json(data);
    } catch {
      res.json([]);
    }
  }));

  // ── User growth ──
  router.get('/analytics/user-growth', verifyToken, requireRole('admin'), asyncHandler(async (req, res) => {
    const period = String(req.query['period'] ?? '30d');
    const days = period === '7d' ? 7 : period === '90d' ? 90 : 30;
    try {
      const result = await dbClient.query(`
        SELECT
          DATE_TRUNC('day', created_at) as date,
          COUNT(*) as new_users
        FROM users
        WHERE created_at >= NOW() - ($1 * INTERVAL '1 day')
        GROUP BY DATE_TRUNC('day', created_at)
        ORDER BY date ASC
      `, [days]);
      // Also get daily active users per date (users who made API calls)
      const data = result.rows.map(r => ({
        date: new Date(r.date).toISOString().slice(0, 10),
        newUsers: Number(r.new_users || 0),
      }));
      res.json(data);
    } catch {
      res.json([]);
    }
  }));

  // ── Top clients ──
  router.get('/analytics/top-clients', verifyToken, requireRole('admin'), asyncHandler(async (req, res) => {
    const limit = Math.min(Number(req.query['limit'] ?? 10), 50);
    try {
      const result = await dbClient.query(`
        SELECT
          u.id,
          u.email,
          u.display_name,
          u.tier,
          COALESCE(w.total_deposited, 0) as total_deposited,
          COALESCE(w.total_spent, 0) as total_spent,
          COALESCE(w.balance, 0) as balance
        FROM users u
        LEFT JOIN wallets w ON w.user_id = u.id
        WHERE u.role != 'system'
        ORDER BY COALESCE(w.total_spent, 0) DESC
        LIMIT $1
      `, [limit]);
      res.json(result.rows.map(r => ({
        id: r.id,
        email: r.email,
        displayName: r.display_name,
        tier: r.tier,
        totalDeposited: Number(r.total_deposited || 0),
        totalSpent: Number(r.total_spent || 0),
        balance: Number(r.balance || 0),
      })));
    } catch {
      res.json([]);
    }
  }));

  return router;
}
