// ═══════════════════════════════════════════════════════════════════
// Enhanced 3-Level Circuit Breaker System
// Level 1: Per-request timeout enforcement (constants only)
// Level 2: Per-agent suspension via Redis counters
// Level 3: Global platform budget with degraded/emergency modes
// ═══════════════════════════════════════════════════════════════════

import { redisClient } from '../../infra/redis/redis-client';
import { logger } from '../../utils/logger';
import { createAlert } from './alert-system';

// ── Level 1: Request Timeouts (ms) ──

export const REQUEST_TIMEOUTS = {
  claude: 30_000,
  image: 60_000,
  video: 120_000,
} as const;

// ── Level 2: Agent Circuit Breaker Config ──

const AGENT_TOKEN_LIMIT_PER_MINUTE = 50_000;
const AGENT_SUSPENSION_TTL = 300; // 5 minutes
const AGENT_REDUCED_BUDGET_TTL = 900; // 15 minutes after reactivation

// ── Level 3: Global Platform Config ──

const GLOBAL_HOURLY_BUDGET = parseInt(
  process.env['GLOBAL_HOURLY_BUDGET'] ?? '5000000',
  10,
);

const GLOBAL_THRESHOLDS = {
  alert: 1.5,    // 150% → alert + notification
  degraded: 2.0, // 200% → force Haiku, disable inter-agent
  emergency: 3.0, // 300% → suspend all LLM requests
} as const;

// ── Redis Key Patterns ──

const keys = {
  agentMinute: (agentId: string) => `tokens:agent:${agentId}:minute`,
  agentSuspended: (agentId: string) => `suspended:agent:${agentId}`,
  agentReduced: (agentId: string) => `reduced:agent:${agentId}`,
  globalHour: () => `tokens:global:hour`,
  globalLevel: () => `guardrails:global:level`,
} as const;

// ═══════════════════════════════════════════════════════════════════
// Level 2 — Per-Agent Circuit Breaker
// ═══════════════════════════════════════════════════════════════════

/**
 * Checks whether an agent is currently suspended.
 * Also checks if the agent is in reduced-budget mode after reactivation.
 */
export async function checkAgentCircuitBreaker(
  agentId: string,
): Promise<{ allowed: boolean; reason?: string; budgetMultiplier?: number }> {
  if (!redisClient.isConnected()) {
    return { allowed: true };
  }

  try {
    const [suspendedVal, reducedVal] = await redisClient.mget(
      keys.agentSuspended(agentId),
      keys.agentReduced(agentId),
    );

    if (suspendedVal) {
      logger.warn('Circuit breaker: agent suspended', { agentId });
      return {
        allowed: false,
        reason: `Agent ${agentId} is suspended due to excessive token usage. Auto-reactivation in up to 5 minutes.`,
      };
    }

    // After reactivation, budget is halved for 15 minutes
    if (reducedVal) {
      return { allowed: true, budgetMultiplier: 0.5 };
    }

    return { allowed: true };
  } catch (error) {
    logger.error('Circuit breaker: agent check failed', {
      agentId,
      error: error instanceof Error ? error.message : String(error),
    });
    // Fail-open
    return { allowed: true };
  }
}

/**
 * Records token usage for an agent and triggers suspension if the
 * per-minute threshold is exceeded.
 */
export async function recordAgentTokens(
  agentId: string,
  tokens: number,
): Promise<void> {
  if (!redisClient.isConnected()) return;

  try {
    const key = keys.agentMinute(agentId);
    const newVal = await redisClient.incrBy(key, tokens);

    // Set TTL on first write
    if (newVal === tokens) {
      await redisClient.expire(key, 60);
    }

    // Check threshold
    if (newVal > AGENT_TOKEN_LIMIT_PER_MINUTE) {
      // Already suspended? skip
      const alreadySuspended = await redisClient.get(keys.agentSuspended(agentId));
      if (!alreadySuspended) {
        await suspendAgent(agentId, newVal);
        createAlert('high', 'circuit_breaker_agent', `Agent ${agentId} suspended: ${newVal} tokens/min exceeded limit`, {}, undefined, agentId).catch(() => {});
      }
    }
  } catch (error) {
    logger.error('Circuit breaker: agent token recording failed', {
      agentId,
      tokens,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

async function suspendAgent(agentId: string, tokenCount: number): Promise<void> {
  // Mark as suspended for 5 minutes
  await redisClient.set(
    keys.agentSuspended(agentId),
    JSON.stringify({ suspendedAt: Date.now(), tokenCount }),
    AGENT_SUSPENSION_TTL,
  );

  // Pre-set the reduced budget flag (it will be visible only after suspension TTL expires,
  // but we set it now with a longer TTL so it outlasts the suspension window)
  await redisClient.set(
    keys.agentReduced(agentId),
    '1',
    AGENT_SUSPENSION_TTL + AGENT_REDUCED_BUDGET_TTL,
  );

  logger.warn('Circuit breaker: agent SUSPENDED', {
    agentId,
    tokenCount,
    suspensionSeconds: AGENT_SUSPENSION_TTL,
  });
}

// ═══════════════════════════════════════════════════════════════════
// Level 3 — Global Platform Circuit Breaker
// ═══════════════════════════════════════════════════════════════════

/**
 * Returns the current global platform operating level.
 */
export async function getGlobalPlatformLevel(): Promise<'normal' | 'degraded' | 'emergency'> {
  if (!redisClient.isConnected()) return 'normal';

  try {
    const globalTokens = parseInt(
      (await redisClient.get(keys.globalHour())) ?? '0',
      10,
    );

    const ratio = globalTokens / GLOBAL_HOURLY_BUDGET;

    if (ratio >= GLOBAL_THRESHOLDS.emergency) return 'emergency';
    if (ratio >= GLOBAL_THRESHOLDS.degraded) return 'degraded';
    return 'normal';
  } catch (error) {
    logger.error('Circuit breaker: global level check failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return 'normal';
  }
}

/**
 * Records tokens against the global hourly counter and evaluates
 * whether the platform level needs to change.
 */
export async function recordGlobalTokens(tokens: number): Promise<void> {
  if (!redisClient.isConnected()) return;

  try {
    const key = keys.globalHour();
    const newVal = await redisClient.incrBy(key, tokens);

    // Set TTL on first write
    if (newVal === tokens) {
      await redisClient.expire(key, 3600);
    }

    const ratio = newVal / GLOBAL_HOURLY_BUDGET;

    // Determine level and persist it for quick reads
    let newLevel: 'normal' | 'degraded' | 'emergency' = 'normal';
    if (ratio >= GLOBAL_THRESHOLDS.emergency) {
      newLevel = 'emergency';
    } else if (ratio >= GLOBAL_THRESHOLDS.degraded) {
      newLevel = 'degraded';
    } else if (ratio >= GLOBAL_THRESHOLDS.alert) {
      // Alert level — log but stay normal
      logger.warn('Circuit breaker: global budget ALERT (150%)', {
        globalTokens: newVal,
        budget: GLOBAL_HOURLY_BUDGET,
        ratio: ratio.toFixed(2),
      });
    }

    // Only update level key when transitioning
    const currentLevel = (await redisClient.get(keys.globalLevel())) ?? 'normal';
    if (newLevel !== currentLevel) {
      await redisClient.set(keys.globalLevel(), newLevel, 3600);

      if (newLevel === 'degraded') {
        logger.error('Circuit breaker: DEGRADED MODE — forcing Haiku, disabling inter-agent', {
          globalTokens: newVal,
          budget: GLOBAL_HOURLY_BUDGET,
          ratio: ratio.toFixed(2),
        });
      } else if (newLevel === 'emergency') {
        logger.error('Circuit breaker: EMERGENCY — ALL LLM requests suspended', {
          globalTokens: newVal,
          budget: GLOBAL_HOURLY_BUDGET,
          ratio: ratio.toFixed(2),
        });
      } else if (currentLevel !== 'normal') {
        logger.info('Circuit breaker: returning to NORMAL', {
          globalTokens: newVal,
          budget: GLOBAL_HOURLY_BUDGET,
        });
      }
    }
  } catch (error) {
    logger.error('Circuit breaker: global token recording failed', {
      tokens,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

// ═══════════════════════════════════════════════════════════════════
// Utility — List Suspended Agents
// ═══════════════════════════════════════════════════════════════════

/**
 * Returns the list of currently suspended agent IDs.
 * Scans Redis for keys matching the suspended pattern.
 * Falls back to empty array if Redis is unavailable.
 */
export async function getSuspendedAgents(): Promise<string[]> {
  if (!redisClient.isConnected()) return [];

  try {
    // Known agent IDs in the platform (fz-* naming convention)
    const KNOWN_AGENTS = [
      'fz-repondeur', 'fz-assistante', 'fz-commercial', 'fz-marketing',
      'fz-rh', 'fz-communication', 'fz-finance', 'fz-dev',
      'fz-juridique', 'fz-dg', 'fz-video', 'fz-photo',
      'fz-budget', 'fz-negociateur', 'fz-impots', 'fz-comptable',
      'fz-chasseur', 'fz-portfolio', 'fz-cv', 'fz-contradicteur',
      'fz-ecrivain', 'fz-cineaste', 'fz-coach', 'fz-deconnexion',
    ];

    const suspendedKeys = KNOWN_AGENTS.map((id) => keys.agentSuspended(id));
    const values = await redisClient.mget(...suspendedKeys);

    const suspended: string[] = [];
    for (let i = 0; i < KNOWN_AGENTS.length; i++) {
      const agentId = KNOWN_AGENTS[i];
      if (values[i] && agentId) {
        suspended.push(agentId);
      }
    }

    return suspended;
  } catch (error) {
    logger.error('Circuit breaker: failed to list suspended agents', {
      error: error instanceof Error ? error.message : String(error),
    });
    return [];
  }
}
