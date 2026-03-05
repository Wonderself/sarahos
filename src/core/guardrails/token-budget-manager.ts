// ═══════════════════════════════════════════════════════════════════
// Token Budget Manager — central gatekeeper for ALL Claude API calls
// Uses Redis counters with TTL for per-user rate limiting
// Limits are PROPORTIONAL to the user's credit balance + admin multiplier
// ═══════════════════════════════════════════════════════════════════

import { redisClient } from '../../infra/redis/redis-client';
import { dbClient } from '../../infra';
import { logger } from '../../utils/logger';
import { createAlert } from './alert-system';
import type {
  TokenBudget,
  BudgetCheckResult,
  AgentMode,
  TokenEvent,
} from './guardrails.types';

// ── Budget Tiers — based on wallet balance (in credits, not micro-credits) ──

export interface BudgetTier {
  name: string;
  minCredits: number;
  dailyLimit: number;
  hourlyLimit: number;
  perMinuteLimit: number;
  perRequestLimit: number;
}

export const BUDGET_TIERS: BudgetTier[] = [
  { name: 'starter',     minCredits: 0,     dailyLimit: 200_000,   hourlyLimit: 50_000,    perMinuteLimit: 20_000,  perRequestLimit: 4096 },
  { name: 'basic',       minCredits: 500,   dailyLimit: 500_000,   hourlyLimit: 150_000,   perMinuteLimit: 50_000,  perRequestLimit: 4096 },
  { name: 'standard',    minCredits: 2000,  dailyLimit: 1_000_000, hourlyLimit: 300_000,   perMinuteLimit: 80_000,  perRequestLimit: 8192 },
  { name: 'premium',     minCredits: 5000,  dailyLimit: 2_000_000, hourlyLimit: 600_000,   perMinuteLimit: 150_000, perRequestLimit: 8192 },
  { name: 'enterprise',  minCredits: 10000, dailyLimit: 5_000_000, hourlyLimit: 1_500_000, perMinuteLimit: 300_000, perRequestLimit: 8192 },
];

// ── Redis Key Helpers ──

const redisKeys = {
  minute: (userId: string) => `tokens:user:${userId}:minute`,
  hour: (userId: string) => `tokens:user:${userId}:hour`,
  day: (userId: string) => `tokens:user:${userId}:day`,
  limitsCache: (userId: string) => `tokens:user:${userId}:limits`,
} as const;

const TTL = {
  minute: 60,
  hour: 3600,
  day: 86400,
  limitsCache: 300, // 5 min cache for computed limits
} as const;

// ── User-Friendly Error Messages (French) ──

const MESSAGES = {
  dailyExceeded:
    'Tu as atteint ta limite quotidienne. Reviens demain ou recharge tes crédits pour augmenter tes limites.',
  hourlyExceeded:
    'Tu utilises Freenzy très activement ! Fais une pause, on se retrouve dans quelques minutes.',
  minuteExceeded:
    'Trop de requêtes en une minute. Patiente quelques secondes.',
  redisDown:
    'Service de contrôle temporairement indisponible. Réessaie dans un instant.',
} as const;

// ═══════════════════════════════════════════════════════════════════
// getBudgetLimitsForUser — compute dynamic limits from wallet + multiplier
// ═══════════════════════════════════════════════════════════════════

export interface UserBudgetLimits {
  tier: BudgetTier;
  multiplier: number;
  dailyLimit: number;
  hourlyLimit: number;
  perMinuteLimit: number;
  perRequestLimit: number;
}

export async function getBudgetLimitsForUser(userId: string): Promise<UserBudgetLimits> {
  // Check Redis cache first
  try {
    const cached = await redisClient.get(redisKeys.limitsCache(userId));
    if (cached) {
      return JSON.parse(cached) as UserBudgetLimits;
    }
  } catch { /* cache miss */ }

  // Read wallet balance + user multiplier from DB
  let balanceCredits = 0;
  let multiplier = 1.0;

  try {
    if (dbClient.isConnected()) {
      const result = await dbClient.query(
        `SELECT u.token_budget_multiplier, COALESCE(w.balance_credits, 0)::bigint AS balance
         FROM users u
         LEFT JOIN wallets w ON w.user_id = u.id
         WHERE u.id = $1`,
        [userId],
      );
      if (result.rows[0]) {
        const row = result.rows[0] as Record<string, unknown>;
        multiplier = Number(row['token_budget_multiplier'] ?? 1.0);
        // Convert micro-credits to credits (1 credit = 1,000,000 micro-credits)
        balanceCredits = Math.floor(Number(row['balance'] ?? 0) / 1_000_000);
      }
    }
  } catch (error) {
    logger.debug('getBudgetLimitsForUser: DB read failed, using defaults', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }

  // Find the matching tier (highest tier whose minCredits is <= balance)
  let tier = BUDGET_TIERS[0] as BudgetTier;
  for (const t of BUDGET_TIERS) {
    if (balanceCredits >= t.minCredits) {
      tier = t;
    }
  }

  const limits: UserBudgetLimits = {
    tier,
    multiplier,
    dailyLimit: Math.round(tier.dailyLimit * multiplier),
    hourlyLimit: Math.round(tier.hourlyLimit * multiplier),
    perMinuteLimit: Math.round(tier.perMinuteLimit * multiplier),
    perRequestLimit: tier.perRequestLimit, // Output cap not affected by multiplier
  };

  // Cache in Redis for 5 minutes
  try {
    await redisClient.set(redisKeys.limitsCache(userId), JSON.stringify(limits), TTL.limitsCache);
  } catch { /* best effort */ }

  return limits;
}

// ═══════════════════════════════════════════════════════════════════
// beforeClaudeCall — checks all budget levels before an LLM request
// ═══════════════════════════════════════════════════════════════════

export async function beforeClaudeCall(
  userId: string,
  estimatedInputTokens: number,
  agentMode: AgentMode,
): Promise<BudgetCheckResult> {
  try {
    const [consumed, limits] = await Promise.all([
      readConsumed(userId),
      getBudgetLimitsForUser(userId),
    ]);

    // Check daily limit
    if (consumed.today >= limits.dailyLimit) {
      logger.warn('Token budget: daily limit exceeded', { userId, consumed: consumed.today, limit: limits.dailyLimit, tier: limits.tier.name });
      createAlert('medium', 'budget_exceeded', `User ${userId} budget exceeded: daily_limit_exceeded`, { userId }, userId).catch(() => {});
      return {
        allowed: false,
        reason: 'daily_limit_exceeded',
        userMessage: MESSAGES.dailyExceeded,
        maxTokensAllowed: 0,
        consumed,
      };
    }

    // Check hourly limit
    if (consumed.thisHour >= limits.hourlyLimit) {
      logger.warn('Token budget: hourly limit exceeded', { userId, consumed: consumed.thisHour, limit: limits.hourlyLimit });
      createAlert('medium', 'budget_exceeded', `User ${userId} budget exceeded: hourly_limit_exceeded`, { userId }, userId).catch(() => {});
      return {
        allowed: false,
        reason: 'hourly_limit_exceeded',
        userMessage: MESSAGES.hourlyExceeded,
        maxTokensAllowed: 0,
        consumed,
      };
    }

    // Check per-minute limit
    if (consumed.thisMinute >= limits.perMinuteLimit) {
      logger.warn('Token budget: per-minute limit exceeded', { userId, consumed: consumed.thisMinute, limit: limits.perMinuteLimit });
      createAlert('medium', 'budget_exceeded', `User ${userId} budget exceeded: minute_limit_exceeded`, { userId }, userId).catch(() => {});
      return {
        allowed: false,
        reason: 'minute_limit_exceeded',
        userMessage: MESSAGES.minuteExceeded,
        maxTokensAllowed: 0,
        consumed,
      };
    }

    // Calculate the maximum output tokens allowed for this request
    const remainingDaily = limits.dailyLimit - consumed.today - estimatedInputTokens;
    const remainingHourly = limits.hourlyLimit - consumed.thisHour - estimatedInputTokens;
    const remainingMinute = limits.perMinuteLimit - consumed.thisMinute - estimatedInputTokens;

    // In eco mode, cap output harder (1/4 of request limit)
    const modeCap = agentMode === 'eco' ? Math.min(2_000, limits.perRequestLimit) : limits.perRequestLimit;

    const maxTokensAllowed = Math.max(
      0,
      Math.min(modeCap, remainingDaily, remainingHourly, remainingMinute),
    );

    if (maxTokensAllowed === 0) {
      createAlert('medium', 'budget_exceeded', `User ${userId} budget exceeded: insufficient_budget_after_input`, { userId }, userId).catch(() => {});
      return {
        allowed: false,
        reason: 'insufficient_budget_after_input',
        userMessage: MESSAGES.hourlyExceeded,
        maxTokensAllowed: 0,
        consumed,
      };
    }

    logger.debug('Token budget: call allowed', {
      userId,
      agentMode,
      maxTokensAllowed,
      tier: limits.tier.name,
      multiplier: limits.multiplier,
      consumed,
    });

    return {
      allowed: true,
      maxTokensAllowed,
      consumed,
    };
  } catch (error) {
    logger.error('Token budget check failed', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });

    // Fail-open with conservative limit so the system doesn't brick
    return {
      allowed: true,
      reason: 'budget_check_error_failopen',
      maxTokensAllowed: 2_000,
      consumed: { today: 0, thisHour: 0, thisMinute: 0 },
    };
  }
}

// ═══════════════════════════════════════════════════════════════════
// afterClaudeCall — updates Redis counters and logs to DB
// ═══════════════════════════════════════════════════════════════════

export async function afterClaudeCall(
  userId: string,
  event: TokenEvent,
): Promise<void> {
  const totalTokens =
    event.inputTokens +
    event.outputTokens +
    event.cacheReadTokens +
    event.cacheCreationTokens;

  try {
    // Increment all three Redis windows atomically
    const [minuteVal, hourVal, dayVal] = await Promise.all([
      redisClient.incrBy(redisKeys.minute(userId), totalTokens),
      redisClient.incrBy(redisKeys.hour(userId), totalTokens),
      redisClient.incrBy(redisKeys.day(userId), totalTokens),
    ]);

    // Set TTL only on first increment (when value equals what we just added)
    const ttlPromises: Promise<boolean>[] = [];
    if (minuteVal === totalTokens) {
      ttlPromises.push(redisClient.expire(redisKeys.minute(userId), TTL.minute));
    }
    if (hourVal === totalTokens) {
      ttlPromises.push(redisClient.expire(redisKeys.hour(userId), TTL.hour));
    }
    if (dayVal === totalTokens) {
      ttlPromises.push(redisClient.expire(redisKeys.day(userId), TTL.day));
    }
    if (ttlPromises.length > 0) {
      await Promise.all(ttlPromises);
    }

    // Log to DB for audit trail
    await logTokenEvent(event);

    logger.debug('Token budget: counters updated', {
      userId,
      totalTokens,
      minute: minuteVal,
      hour: hourVal,
      day: dayVal,
    });
  } catch (error) {
    // Never let counter updates block the response pipeline
    logger.error('Token budget: counter update failed', {
      userId,
      totalTokens,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// getUserBudget — reads current consumption + computed limits
// ═══════════════════════════════════════════════════════════════════

export async function getUserBudget(userId: string): Promise<TokenBudget> {
  const [consumed, limits] = await Promise.all([
    readConsumed(userId),
    getBudgetLimitsForUser(userId),
  ]);

  return {
    userId,
    dailyLimit: limits.dailyLimit,
    hourlyLimit: limits.hourlyLimit,
    perRequestLimit: limits.perRequestLimit,
    perMinuteLimit: limits.perMinuteLimit,
    consumed,
  };
}

// ═══════════════════════════════════════════════════════════════════
// resetUserBudget — admin function to clear all counters
// ═══════════════════════════════════════════════════════════════════

export async function resetUserBudget(userId: string): Promise<void> {
  await Promise.all([
    redisClient.del(redisKeys.minute(userId)),
    redisClient.del(redisKeys.hour(userId)),
    redisClient.del(redisKeys.day(userId)),
    redisClient.del(redisKeys.limitsCache(userId)),
  ]);

  logger.info('Token budget: user budget reset', { userId });
}

// ═══════════════════════════════════════════════════════════════════
// invalidateUserLimitsCache — call after admin changes multiplier
// ═══════════════════════════════════════════════════════════════════

export async function invalidateUserLimitsCache(userId: string): Promise<void> {
  try {
    await redisClient.del(redisKeys.limitsCache(userId));
  } catch { /* best effort */ }
}

// ═══════════════════════════════════════════════════════════════════
// Internal helpers
// ═══════════════════════════════════════════════════════════════════

async function readConsumed(userId: string): Promise<TokenBudget['consumed']> {
  if (!redisClient.isConnected()) {
    return { today: 0, thisHour: 0, thisMinute: 0 };
  }

  const [minuteStr, hourStr, dayStr] = await redisClient.mget(
    redisKeys.minute(userId),
    redisKeys.hour(userId),
    redisKeys.day(userId),
  );

  return {
    thisMinute: parseInt(minuteStr ?? '0', 10),
    thisHour: parseInt(hourStr ?? '0', 10),
    today: parseInt(dayStr ?? '0', 10),
  };
}

async function logTokenEvent(event: TokenEvent): Promise<void> {
  try {
    if (!dbClient.isConnected()) return;

    await dbClient.query(
      `INSERT INTO token_events
        (user_id, model, input_tokens, output_tokens, cache_read_tokens,
         cache_creation_tokens, cost_micro_credits, agent_name, request_type,
         chain_id, mode, created_at)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, NOW())`,
      [
        event.userId,
        event.model,
        event.inputTokens,
        event.outputTokens,
        event.cacheReadTokens,
        event.cacheCreationTokens,
        event.costMicroCredits,
        event.agentName,
        event.requestType,
        event.chainId ?? null,
        event.mode,
      ],
    );
  } catch (error) {
    // DB logging is best-effort — never block the main flow
    logger.error('Token event DB logging failed', {
      userId: event.userId,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
