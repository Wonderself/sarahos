import { Router } from 'express';
import { verifyToken, requireRole } from '../auth.middleware';
import { asyncHandler } from '../async-handler';
import type { AuthenticatedRequest } from '../auth.types';

export function createGuardrailsRouter(): Router {
  const router = Router();

  // GET /admin/guardrails/status — Live monitoring dashboard data (admin-only)
  router.get('/admin/guardrails/status', verifyToken, requireRole('admin'), asyncHandler(async (_req: AuthenticatedRequest, res) => {
    const { getUserBudget } = await import('../../core/guardrails/token-budget-manager');
    const { getGlobalPlatformLevel, getSuspendedAgents } = await import('../../core/guardrails/circuit-breaker-enhanced');
    const { getModelDistribution } = await import('../../core/guardrails/model-router');
    const { getActiveChains } = await import('../../core/guardrails/loop-detector');
    const { getProviderHealth } = await import('../../core/guardrails/fallback-manager');
    const { getRecentAlerts } = await import('../../core/guardrails/alert-system');

    // Aggregate platform-wide token usage from Redis
    const { redisClient } = await import('../../infra/redis/redis-client');
    let globalHourlyTokens = 0;
    let globalHourlyCost = 0;
    try {
      const val = await redisClient.get('tokens:global:hour');
      globalHourlyTokens = val ? parseInt(val, 10) : 0;
    } catch { /* Redis unavailable */ }

    const level = await getGlobalPlatformLevel();
    const suspended = await getSuspendedAgents();
    const distribution = await getModelDistribution();
    const chains = await getActiveChains();
    const health = await getProviderHealth();
    const alerts = await getRecentAlerts(20);

    // Suppress unused-variable lint (getUserBudget loaded for future per-user queries)
    void getUserBudget;

    res.json({
      tokenBudget: {
        globalHourlyTokens,
        globalHourlyCost,
        globalHourlyBudget: 5_000_000,
        modelDistribution: distribution,
      },
      circuitBreakers: {
        level,
        agentsSuspended: suspended,
        tripsLast24h: 0,
      },
      activeChains: chains.length,
      loopsDetectedLast24h: 0,
      apiHealth: health,
      recentAlerts: alerts,
    });
  }));

  // PUT /portal/agent-mode — Switch user's agent mode (Pro/Eco)
  router.put('/portal/agent-mode', verifyToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.sub;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { mode } = req.body as { mode?: string };
    if (mode !== 'pro' && mode !== 'eco') {
      res.status(400).json({ error: 'Mode must be "pro" or "eco"' });
      return;
    }

    const { switchAgentMode } = await import('../../core/guardrails/user-mode');
    await switchAgentMode(userId, mode);
    res.json({ success: true, mode });
  }));

  // GET /portal/my-limits — Current user's token limits + consumption
  router.get('/portal/my-limits', verifyToken, asyncHandler(async (req: AuthenticatedRequest, res) => {
    const userId = req.user?.sub;
    if (!userId) { res.status(401).json({ error: 'Unauthorized' }); return; }

    const { getUserBudget, getBudgetLimitsForUser, BUDGET_TIERS } = await import('../../core/guardrails/token-budget-manager');
    const budget = await getUserBudget(userId);
    const limits = await getBudgetLimitsForUser(userId);

    res.json({
      tier: limits.tier.name,
      multiplier: limits.multiplier,
      limits: {
        daily: limits.dailyLimit,
        hourly: limits.hourlyLimit,
        perMinute: limits.perMinuteLimit,
        perRequest: limits.perRequestLimit,
      },
      consumed: budget.consumed,
      allTiers: BUDGET_TIERS.map(t => ({
        name: t.name,
        minCredits: t.minCredits,
        dailyLimit: t.dailyLimit,
        hourlyLimit: t.hourlyLimit,
        perMinuteLimit: t.perMinuteLimit,
        perRequestLimit: t.perRequestLimit,
      })),
    });
  }));

  // GET /admin/users/:id/token-limits — Admin: view computed limits for a user
  router.get('/admin/users/:id/token-limits', verifyToken, requireRole('admin'), asyncHandler(async (req: AuthenticatedRequest, res) => {
    const targetUserId = String(req.params['id']);
    const { getUserBudget, getBudgetLimitsForUser } = await import('../../core/guardrails/token-budget-manager');
    const budget = await getUserBudget(targetUserId);
    const limits = await getBudgetLimitsForUser(targetUserId);

    res.json({
      userId: targetUserId,
      tier: limits.tier.name,
      multiplier: limits.multiplier,
      limits: {
        daily: limits.dailyLimit,
        hourly: limits.hourlyLimit,
        perMinute: limits.perMinuteLimit,
        perRequest: limits.perRequestLimit,
      },
      consumed: budget.consumed,
    });
  }));

  // PATCH /admin/users/:id/token-multiplier — Admin: adjust token budget multiplier
  router.patch('/admin/users/:id/token-multiplier', verifyToken, requireRole('admin'), asyncHandler(async (req: AuthenticatedRequest, res) => {
    const targetUserId = String(req.params['id']);
    const { multiplier } = req.body as { multiplier?: number };

    if (typeof multiplier !== 'number' || multiplier < 0.1 || multiplier > 10) {
      res.status(400).json({ error: 'Multiplier must be between 0.1 and 10' });
      return;
    }

    const { dbClient: db } = await import('../../infra');
    await db.query('UPDATE users SET token_budget_multiplier = $1 WHERE id = $2', [multiplier, targetUserId]);

    const { invalidateUserLimitsCache } = await import('../../core/guardrails/token-budget-manager');
    await invalidateUserLimitsCache(targetUserId);

    res.json({ success: true, userId: targetUserId, multiplier });
  }));

  return router;
}
