// ===================================================================
// User Mode Toggle — Pro vs Eco configuration
// ===================================================================

import { logger } from '../../utils/logger';
import { redisClient } from '../../infra/redis/redis-client';
import { dbClient } from '../../infra';
import type { AgentMode, ModeConfig } from './guardrails.types';

// ── Mode configurations ──

export const MODE_CONFIG: Record<AgentMode, ModeConfig> = {
  pro: {
    defaultModel: 'claude-sonnet-4-20250514',
    allowOpus: true,
    allowInterAgentComm: true,
    slidingWindowSize: 10,
    summaryMaxTokens: 300,
    summarizeEvery: 10,
    maxOutputTokens: 8192,
    maxChainDepth: 5,
    maxChainTokens: 100_000,
    maxChainDurationMs: 120_000,
    creditMultiplier: 1,
  },
  eco: {
    defaultModel: 'claude-haiku-4-5-20251001',
    allowOpus: false,
    allowInterAgentComm: false,
    slidingWindowSize: 5,
    summaryMaxTokens: 100,
    summarizeEvery: 5,
    maxOutputTokens: 2048,
    maxChainDepth: 1,
    maxChainTokens: 5_000,
    maxChainDurationMs: 15_000,
    creditMultiplier: 0.3,
  },
};

const REDIS_KEY_PREFIX = 'user:mode:';
const REDIS_TTL_SEC = 300; // 5 minutes

// ── getUserMode ──

export async function getUserMode(userId: string): Promise<AgentMode> {
  const cacheKey = `${REDIS_KEY_PREFIX}${userId}`;

  // Try Redis cache first
  try {
    const cached = await redisClient.get(cacheKey);
    if (cached === 'pro' || cached === 'eco') {
      return cached;
    }
  } catch {
    // Redis unavailable — fall through to DB
  }

  // Read from database
  try {
    const result = await dbClient.query<{ agent_mode: string }>(
      'SELECT agent_mode FROM users WHERE id = $1',
      [userId],
    );

    const mode: AgentMode =
      result.rows[0]?.agent_mode === 'pro' ? 'pro' : 'eco';

    // Cache in Redis for 5 min
    try {
      await redisClient.set(cacheKey, mode, REDIS_TTL_SEC);
    } catch {
      // Cache write failure is non-critical
    }

    return mode;
  } catch (error) {
    logger.warn('getUserMode DB lookup failed, defaulting to eco', {
      userId,
      error: error instanceof Error ? error.message : String(error),
    });
    return 'eco';
  }
}

// ── switchAgentMode ──

export async function switchAgentMode(
  userId: string,
  newMode: AgentMode,
): Promise<{ success: boolean; changed: boolean; message: string }> {
  try {
    const currentMode = await getUserMode(userId);

    if (currentMode === newMode) {
      return {
        success: true,
        changed: false,
        message: `Mode already set to ${newMode}`,
      };
    }

    // Update database
    await dbClient.query(
      'UPDATE users SET agent_mode = $1, updated_at = NOW() WHERE id = $2',
      [newMode, userId],
    );

    // Clear Redis cache
    const cacheKey = `${REDIS_KEY_PREFIX}${userId}`;
    try {
      await redisClient.del(cacheKey);
    } catch {
      // Cache invalidation failure is non-critical
    }

    logger.info('Agent mode switched', {
      userId,
      from: currentMode,
      to: newMode,
    });

    return {
      success: true,
      changed: true,
      message: `Mode switched from ${currentMode} to ${newMode}`,
    };
  } catch (error) {
    logger.error('switchAgentMode failed', {
      userId,
      newMode,
      error: error instanceof Error ? error.message : String(error),
    });
    return {
      success: false,
      changed: false,
      message: 'Failed to switch agent mode',
    };
  }
}

// ── getModeConfig ──

export function getModeConfig(mode: AgentMode): ModeConfig {
  return MODE_CONFIG[mode];
}
