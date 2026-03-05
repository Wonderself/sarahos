// ═══════════════════════════════════════════════════════════════════
// Fallback Manager — multi-provider resilience
// ═══════════════════════════════════════════════════════════════════

import { redisClient } from '../../infra/redis/redis-client';
import { logger } from '../../utils/logger';
import type { FallbackConfig, ProviderService } from './guardrails.types';

/** How long a provider stays marked as "down" (seconds). */
const DOWN_TTL_SECONDS = 300; // 5 minutes

/** TTL for the failure counter window (seconds). */
const FAILURE_WINDOW_SECONDS = 120; // 2 minutes

/**
 * Default fallback configurations per service.
 */
export const FALLBACK_CONFIGS: Record<ProviderService, FallbackConfig> = {
  llm: {
    primary: 'anthropic',
    fallback: 'openai',
    healthCheckIntervalMs: 60_000,
    maxRetries: 3,
    timeoutMs: 30_000,
    circuitBreakerThreshold: 3,
  },
  image: {
    primary: 'fal_ai',
    fallback: 'replicate',
    healthCheckIntervalMs: 60_000,
    maxRetries: 3,
    timeoutMs: 60_000,
    circuitBreakerThreshold: 3,
  },
  voice: {
    primary: 'elevenlabs',
    fallback: 'google_tts',
    healthCheckIntervalMs: 60_000,
    maxRetries: 3,
    timeoutMs: 30_000,
    circuitBreakerThreshold: 3,
  },
  whatsapp: {
    primary: 'meta_cloud_api',
    fallback: 'twilio',
    healthCheckIntervalMs: 60_000,
    maxRetries: 5,
    timeoutMs: 15_000,
    circuitBreakerThreshold: 5,
  },
};

function downKey(service: ProviderService, provider: string): string {
  return `provider:down:${service}:${provider}`;
}

function failureKey(service: ProviderService): string {
  return `provider:failures:${service}`;
}

/**
 * Checks whether the primary provider for a service is currently marked as down.
 */
export async function isProviderDown(service: ProviderService): Promise<boolean> {
  if (!redisClient.isConnected()) return false;

  try {
    const config = FALLBACK_CONFIGS[service];
    const val = await redisClient.get(downKey(service, config.primary));
    return val !== null;
  } catch (error) {
    logger.error('FallbackManager: isProviderDown check failed', {
      service,
      error: error instanceof Error ? error.message : String(error),
    });
    return false;
  }
}

/**
 * Records a failure for the primary provider of a service.
 * If the failure count reaches the circuit breaker threshold, marks the provider as down for 5 minutes.
 * Returns whether the fallback was activated.
 */
export async function recordProviderFailure(
  service: ProviderService,
): Promise<{ switchedToFallback: boolean }> {
  if (!redisClient.isConnected()) {
    return { switchedToFallback: false };
  }

  const config = FALLBACK_CONFIGS[service];
  const fKey = failureKey(service);

  try {
    const count = await redisClient.incrBy(fKey, 1);

    // Set TTL on first failure so the window auto-resets
    if (count === 1) {
      await redisClient.expire(fKey, FAILURE_WINDOW_SECONDS);
    }

    if (count >= config.circuitBreakerThreshold) {
      // Mark primary as down
      await redisClient.set(downKey(service, config.primary), 'down', DOWN_TTL_SECONDS);
      // Reset failure counter
      await redisClient.del(fKey);

      logger.warn('FallbackManager: provider marked DOWN, switching to fallback', {
        service,
        primary: config.primary,
        fallback: config.fallback,
        failureCount: count,
      });

      return { switchedToFallback: true };
    }

    logger.debug('FallbackManager: provider failure recorded', {
      service,
      primary: config.primary,
      failureCount: count,
      threshold: config.circuitBreakerThreshold,
    });

    return { switchedToFallback: false };
  } catch (error) {
    logger.error('FallbackManager: recordProviderFailure failed', {
      service,
      error: error instanceof Error ? error.message : String(error),
    });
    return { switchedToFallback: false };
  }
}

/**
 * Records a successful call to the primary provider, resetting the failure counter.
 */
export async function recordProviderSuccess(service: ProviderService): Promise<void> {
  if (!redisClient.isConnected()) return;

  try {
    await redisClient.del(failureKey(service));
  } catch (error) {
    logger.error('FallbackManager: recordProviderSuccess failed', {
      service,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}

/**
 * Returns the health status of all provider services (primary + fallback).
 */
export async function getProviderHealth(): Promise<
  Record<ProviderService, { primary: { up: boolean }; fallback: { up: boolean } }>
> {
  const services: ProviderService[] = ['llm', 'image', 'voice', 'whatsapp'];

  const result = {} as Record<
    ProviderService,
    { primary: { up: boolean }; fallback: { up: boolean } }
  >;

  if (!redisClient.isConnected()) {
    // No Redis — assume everything is up
    for (const svc of services) {
      result[svc] = { primary: { up: true }, fallback: { up: true } };
    }
    return result;
  }

  // Build all keys to check in a single mget
  const keys: string[] = [];
  for (const svc of services) {
    const config = FALLBACK_CONFIGS[svc];
    keys.push(downKey(svc, config.primary));
    keys.push(downKey(svc, config.fallback));
  }

  try {
    const values = await redisClient.mget(...keys);

    for (let i = 0; i < services.length; i++) {
      const svc = services[i] as ProviderService;
      const primaryDown = values[i * 2] !== null;
      const fallbackDown = values[i * 2 + 1] !== null;
      result[svc] = {
        primary: { up: !primaryDown },
        fallback: { up: !fallbackDown },
      };
    }
  } catch (error) {
    logger.error('FallbackManager: getProviderHealth failed', {
      error: error instanceof Error ? error.message : String(error),
    });
    // Fallback: assume up
    for (const svc of services) {
      result[svc] = { primary: { up: true }, fallback: { up: true } };
    }
  }

  return result;
}
