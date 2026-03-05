// ═══════════════════════════════════════════════════════════════════
// Agent Loop Detector — tracks inter-agent call chains
// Uses in-memory Map for active chains (short-lived, max 2 min)
// with Redis backup for distributed environments
// ═══════════════════════════════════════════════════════════════════

import { v4 as uuidv4 } from 'uuid';
import { redisClient } from '../../infra/redis/redis-client';
import { logger } from '../../utils/logger';
import type {
  AgentCallChain,
  ChainValidationResult,
  AgentMode,
  ModeConfig,
  InterAgentAction,
} from './guardrails.types';
import { INTER_AGENT_ACTIONS } from './guardrails.types';

// ── Mode Configurations (chain limits) ──

const MODE_CONFIGS: Record<AgentMode, Pick<ModeConfig, 'maxChainDepth' | 'maxChainTokens' | 'maxChainDurationMs'>> = {
  pro: {
    maxChainDepth: 5,
    maxChainTokens: 100_000,
    maxChainDurationMs: 120_000,
  },
  eco: {
    maxChainDepth: 1,
    maxChainTokens: 5_000,
    maxChainDurationMs: 15_000,
  },
};

// ── In-Memory Store ──

const activeChains = new Map<string, AgentCallChain>();

// Cleanup stale chains every 30 seconds
const CLEANUP_INTERVAL_MS = 30_000;
const MAX_CHAIN_AGE_MS = 180_000; // 3 min absolute max (safety net)

let cleanupTimer: ReturnType<typeof setInterval> | null = null;

function ensureCleanupRunning(): void {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    activeChains.forEach((chain, chainId) => {
      if (now - chain.startedAt > MAX_CHAIN_AGE_MS) {
        logger.warn('Loop detector: stale chain removed', { chainId, age: now - chain.startedAt });
        activeChains.delete(chainId);
        cleanupRedisChain(chainId);
      }
    });
    // Stop timer if no active chains
    if (activeChains.size === 0 && cleanupTimer) {
      clearInterval(cleanupTimer);
      cleanupTimer = null;
    }
  }, CLEANUP_INTERVAL_MS);

  // Don't keep Node alive just for cleanup
  if (cleanupTimer && typeof cleanupTimer === 'object' && 'unref' in cleanupTimer) {
    cleanupTimer.unref();
  }
}

// ═══════════════════════════════════════════════════════════════════
// startChain — creates a new call chain
// ═══════════════════════════════════════════════════════════════════

export function startChain(userId: string, agentMode: AgentMode): AgentCallChain {
  const config = MODE_CONFIGS[agentMode];
  const chain: AgentCallChain = {
    chainId: uuidv4(),
    initiatorUserId: userId,
    callStack: [],
    depth: 0,
    totalTokens: 0,
    totalCost: 0,
    startedAt: Date.now(),
    maxDepth: config.maxChainDepth,
    maxTokens: config.maxChainTokens,
    maxDurationMs: config.maxChainDurationMs,
  };

  activeChains.set(chain.chainId, chain);
  ensureCleanupRunning();

  // Persist to Redis for distributed visibility (best-effort)
  persistChainToRedis(chain);

  logger.debug('Loop detector: chain started', {
    chainId: chain.chainId,
    userId,
    agentMode,
    maxDepth: chain.maxDepth,
  });

  return chain;
}

// ═══════════════════════════════════════════════════════════════════
// validateAgentCall — checks if a new inter-agent call is allowed
// ═══════════════════════════════════════════════════════════════════

export function validateAgentCall(
  chain: AgentCallChain,
  fromAgent: string,
  toAgent: string,
): ChainValidationResult {
  // 1. Check circular call (agent already in stack)
  if (chain.callStack.includes(toAgent)) {
    const cycle = [...chain.callStack, toAgent].join(' → ');
    logger.warn('Loop detector: circular call detected', {
      chainId: chain.chainId,
      fromAgent,
      toAgent,
      cycle,
    });
    return {
      allowed: false,
      reason: `circular_call: ${cycle}`,
      userMessage: `Boucle détectée : ${toAgent} est déjà dans la chaîne d'appels. Requête annulée pour éviter une boucle infinie.`,
    };
  }

  // 2. Check max depth
  if (chain.depth >= chain.maxDepth) {
    logger.warn('Loop detector: max depth exceeded', {
      chainId: chain.chainId,
      depth: chain.depth,
      maxDepth: chain.maxDepth,
    });
    return {
      allowed: false,
      reason: `max_depth_exceeded: ${chain.depth}/${chain.maxDepth}`,
      userMessage: `Profondeur maximale de chaîne atteinte (${chain.maxDepth} appels). L'agent ne peut pas en appeler un autre.`,
    };
  }

  // 3. Check token budget
  if (chain.totalTokens >= chain.maxTokens) {
    logger.warn('Loop detector: chain token budget exceeded', {
      chainId: chain.chainId,
      totalTokens: chain.totalTokens,
      maxTokens: chain.maxTokens,
    });
    return {
      allowed: false,
      reason: `chain_token_budget_exceeded: ${chain.totalTokens}/${chain.maxTokens}`,
      userMessage: `Budget de tokens de la chaîne épuisé (${chain.totalTokens.toLocaleString()} / ${chain.maxTokens.toLocaleString()}). Opération annulée.`,
    };
  }

  // 4. Check duration
  const elapsed = Date.now() - chain.startedAt;
  if (elapsed >= chain.maxDurationMs) {
    logger.warn('Loop detector: chain duration exceeded', {
      chainId: chain.chainId,
      elapsedMs: elapsed,
      maxDurationMs: chain.maxDurationMs,
    });
    return {
      allowed: false,
      reason: `chain_duration_exceeded: ${elapsed}ms/${chain.maxDurationMs}ms`,
      userMessage: `Durée maximale de la chaîne dépassée (${Math.round(chain.maxDurationMs / 1000)}s). Opération annulée.`,
    };
  }

  // All checks passed — update chain state
  chain.callStack.push(toAgent);
  chain.depth += 1;

  // Update in-memory store
  activeChains.set(chain.chainId, chain);
  persistChainToRedis(chain);

  logger.debug('Loop detector: agent call allowed', {
    chainId: chain.chainId,
    fromAgent,
    toAgent,
    depth: chain.depth,
  });

  return { allowed: true };
}

// ═══════════════════════════════════════════════════════════════════
// recordChainTokens — accumulates tokens for a chain
// ═══════════════════════════════════════════════════════════════════

export function recordChainTokens(chainId: string, tokens: number): void {
  const chain = activeChains.get(chainId);
  if (!chain) {
    logger.debug('Loop detector: recordChainTokens for unknown chain', { chainId });
    return;
  }

  chain.totalTokens += tokens;
  activeChains.set(chainId, chain);

  logger.debug('Loop detector: chain tokens updated', {
    chainId,
    added: tokens,
    totalTokens: chain.totalTokens,
    maxTokens: chain.maxTokens,
  });
}

// ═══════════════════════════════════════════════════════════════════
// endChain — normal chain completion, cleanup
// ═══════════════════════════════════════════════════════════════════

export function endChain(chainId: string): void {
  const chain = activeChains.get(chainId);
  if (chain) {
    const elapsed = Date.now() - chain.startedAt;
    logger.info('Loop detector: chain ended', {
      chainId,
      depth: chain.depth,
      totalTokens: chain.totalTokens,
      durationMs: elapsed,
    });
  }

  activeChains.delete(chainId);
  cleanupRedisChain(chainId);
}

// ═══════════════════════════════════════════════════════════════════
// getActiveChains — list active chains, optionally filtered by user
// ═══════════════════════════════════════════════════════════════════

export function getActiveChains(userId?: string): AgentCallChain[] {
  const chains = Array.from(activeChains.values());

  if (userId) {
    return chains.filter((c) => c.initiatorUserId === userId);
  }

  return chains;
}

// ═══════════════════════════════════════════════════════════════════
// killChain — force-terminate a chain (admin / emergency)
// ═══════════════════════════════════════════════════════════════════

export function killChain(chainId: string, reason: string): void {
  const chain = activeChains.get(chainId);

  if (chain) {
    logger.warn('Loop detector: chain KILLED', {
      chainId,
      reason,
      depth: chain.depth,
      totalTokens: chain.totalTokens,
      durationMs: Date.now() - chain.startedAt,
      callStack: chain.callStack,
    });
  } else {
    logger.warn('Loop detector: killChain called for unknown chain', { chainId, reason });
  }

  activeChains.delete(chainId);
  cleanupRedisChain(chainId);
}

// ═══════════════════════════════════════════════════════════════════
// Inter-Agent Action Validation
// ═══════════════════════════════════════════════════════════════════

/**
 * Validates that a requested inter-agent action is in the allowed catalog.
 */
export function isValidInterAgentAction(action: string): action is InterAgentAction {
  return (INTER_AGENT_ACTIONS as readonly string[]).includes(action);
}

// ═══════════════════════════════════════════════════════════════════
// Redis Persistence (best-effort backup)
// ═══════════════════════════════════════════════════════════════════

const REDIS_CHAIN_PREFIX = 'chain:active:';
const REDIS_CHAIN_TTL = 180; // 3 min max

async function persistChainToRedis(chain: AgentCallChain): Promise<void> {
  if (!redisClient.isConnected()) return;

  try {
    await redisClient.set(
      `${REDIS_CHAIN_PREFIX}${chain.chainId}`,
      JSON.stringify(chain),
      REDIS_CHAIN_TTL,
    );
  } catch {
    // Best-effort — in-memory is the source of truth
  }
}

async function cleanupRedisChain(chainId: string): Promise<void> {
  if (!redisClient.isConnected()) return;

  try {
    await redisClient.del(`${REDIS_CHAIN_PREFIX}${chainId}`);
  } catch {
    // Best-effort
  }
}
