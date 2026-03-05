// ===================================================================
// Model Router — Intelligent model selection
// ===================================================================

import { logger } from '../../utils/logger';
import { redisClient } from '../../infra/redis/redis-client';
import type { AgentMode, RequestType } from './guardrails.types';
import { MODE_CONFIG } from './user-mode';

// ── Model constants ──

const MODEL_HAIKU = 'claude-haiku-4-5-20251001';
const MODEL_SONNET = 'claude-sonnet-4-20250514';
const MODEL_OPUS = 'claude-opus-4-6';

// Redis counter keys (TTL 1 hour)
const COUNTER_KEY_HAIKU = 'model:count:haiku';
const COUNTER_KEY_SONNET = 'model:count:sonnet';
const COUNTER_KEY_OPUS = 'model:count:opus';
const COUNTER_TTL_SEC = 3600;

// Agents that always use Haiku
const HAIKU_ONLY_AGENTS = new Set([
  'fz-sav',
  'fz-classifier',
  'fz-router',
]);

// Request types routed to Sonnet
const SONNET_REQUEST_TYPES = new Set<RequestType>([
  'writing',
  'analysis',
  'complex_conversation',
]);

// Request types routed to Opus (if allowed)
const OPUS_REQUEST_TYPES = new Set<RequestType>([
  'architecture',
  'multi_step_reasoning',
  'complex_code',
]);

// Plans that allow Opus
const OPUS_ELIGIBLE_PLANS = new Set(['pro', 'business']);

// ── selectModel ──

export async function selectModel(
  userId: string,
  agentId: string,
  requestType: RequestType,
  inputLength: number,
  agentMode: AgentMode,
  userPlan?: string,
): Promise<string> {
  let selectedModel: string;

  // 1. Free plan => always Haiku
  if (!userPlan || userPlan === 'free') {
    selectedModel = MODEL_HAIKU;
  }
  // 2. Eco mode => always Haiku
  else if (agentMode === 'eco') {
    selectedModel = MODEL_HAIKU;
  }
  // 3. SAV/classifier/router agents => always Haiku
  else if (HAIKU_ONLY_AGENTS.has(agentId)) {
    selectedModel = MODEL_HAIKU;
  }
  // 4. Short requests (<500 tokens input) => Haiku
  else if (inputLength < 500) {
    selectedModel = MODEL_HAIKU;
  }
  // 5. prompt_enhancement => Haiku
  else if (requestType === 'prompt_enhancement') {
    selectedModel = MODEL_HAIKU;
  }
  // 6. writing/analysis/complex_conversation => Sonnet
  else if (SONNET_REQUEST_TYPES.has(requestType)) {
    selectedModel = MODEL_SONNET;
  }
  // 7. architecture/multi_step_reasoning/complex_code => Opus (if eligible)
  else if (OPUS_REQUEST_TYPES.has(requestType)) {
    const config = MODE_CONFIG[agentMode];
    if (config.allowOpus && OPUS_ELIGIBLE_PLANS.has(userPlan)) {
      selectedModel = MODEL_OPUS;
    } else {
      selectedModel = MODEL_SONNET;
    }
  }
  // 8. Default => Haiku
  else {
    selectedModel = MODEL_HAIKU;
  }

  // Track model usage in Redis counters
  await trackModelUsage(selectedModel);

  logger.debug('Model selected', {
    userId,
    agentId,
    requestType,
    inputLength,
    agentMode,
    userPlan: userPlan ?? 'free',
    model: selectedModel,
  });

  return selectedModel;
}

// ── getModelDistribution ──

export async function getModelDistribution(): Promise<{
  haiku: number;
  sonnet: number;
  opus: number;
}> {
  try {
    const values = await redisClient.mget(
      COUNTER_KEY_HAIKU,
      COUNTER_KEY_SONNET,
      COUNTER_KEY_OPUS,
    );

    return {
      haiku: parseInt(values[0] ?? '0', 10),
      sonnet: parseInt(values[1] ?? '0', 10),
      opus: parseInt(values[2] ?? '0', 10),
    };
  } catch (error) {
    logger.warn('getModelDistribution failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    return { haiku: 0, sonnet: 0, opus: 0 };
  }
}

// ── Internal helpers ──

async function trackModelUsage(model: string): Promise<void> {
  let counterKey: string;

  if (model === MODEL_HAIKU) {
    counterKey = COUNTER_KEY_HAIKU;
  } else if (model === MODEL_SONNET) {
    counterKey = COUNTER_KEY_SONNET;
  } else if (model === MODEL_OPUS) {
    counterKey = COUNTER_KEY_OPUS;
  } else {
    return;
  }

  try {
    await redisClient.incrBy(counterKey, 1);
    await redisClient.expire(counterKey, COUNTER_TTL_SEC);
  } catch {
    // Counter tracking failure is non-critical
  }
}
