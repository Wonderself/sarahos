// ═══════════════════════════════════════════════════
//   SARAH OS — API Rate Limiting Utility
//   In-memory token bucket for Next.js API routes
// ═══════════════════════════════════════════════════

import { NextRequest, NextResponse } from 'next/server';

// ── Types ──

interface RateLimitOptions {
  /** Time window in milliseconds */
  interval: number;
  /** Maximum number of unique tokens tracked per interval (LRU eviction) */
  uniqueTokenPerInterval: number;
}

interface TokenEntry {
  count: number;
  expiresAt: number;
}

// ── Rate Limiter ──

export function rateLimit(options: RateLimitOptions) {
  const { interval, uniqueTokenPerInterval } = options;
  const tokenMap = new Map<string, TokenEntry>();

  // Periodic cleanup of expired entries
  const cleanupInterval = setInterval(() => {
    const now = Date.now();
    for (const [key, entry] of tokenMap) {
      if (now >= entry.expiresAt) {
        tokenMap.delete(key);
      }
    }
  }, interval);

  // Ensure cleanup interval doesn't prevent process from exiting
  if (cleanupInterval && typeof cleanupInterval === 'object' && 'unref' in cleanupInterval) {
    cleanupInterval.unref();
  }

  return {
    /**
     * Check if a request from the given token is within the rate limit.
     * @param limit - Maximum number of requests allowed per interval
     * @param token - Unique identifier for the client (e.g., IP address or API key)
     * @throws Error with status 429 if rate limit is exceeded
     */
    async check(limit: number, token: string): Promise<void> {
      const now = Date.now();

      // Clean up this specific token if expired
      const existing = tokenMap.get(token);
      if (existing && now >= existing.expiresAt) {
        tokenMap.delete(token);
      }

      const entry = tokenMap.get(token);

      if (!entry) {
        // Enforce max unique tokens — evict oldest if at capacity
        if (tokenMap.size >= uniqueTokenPerInterval) {
          const firstKey = tokenMap.keys().next().value;
          if (firstKey !== undefined) {
            tokenMap.delete(firstKey);
          }
        }

        tokenMap.set(token, { count: 1, expiresAt: now + interval });
        return;
      }

      if (entry.count >= limit) {
        const retryAfterMs = entry.expiresAt - now;
        const error = new Error('Rate limit exceeded');
        (error as RateLimitError).statusCode = 429;
        (error as RateLimitError).retryAfterMs = retryAfterMs;
        throw error;
      }

      entry.count += 1;
    },
  };
}

// ── Error Type ──

export interface RateLimitError extends Error {
  statusCode: number;
  retryAfterMs: number;
}

export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof Error && 'statusCode' in error && (error as RateLimitError).statusCode === 429;
}

// ── Default Instance: 60 requests per minute ──

export const defaultRateLimiter = rateLimit({
  interval: 60 * 1000, // 1 minute
  uniqueTokenPerInterval: 500, // Track up to 500 unique clients
});

// ── Helper: withRateLimit wrapper for Next.js App Router handlers ──

type NextRouteHandler = (
  req: NextRequest,
  context?: { params?: Record<string, string> },
) => Promise<NextResponse> | NextResponse;

/**
 * Wraps a Next.js API route handler with rate limiting.
 * Uses the client IP as the rate limit token.
 *
 * @param handler - The original route handler
 * @param limit - Max requests per interval (default: 60)
 * @param limiter - Rate limiter instance (default: defaultRateLimiter)
 */
export function withRateLimit(
  handler: NextRouteHandler,
  limit = 60,
  limiter = defaultRateLimiter,
): NextRouteHandler {
  return async (req: NextRequest, context?: { params?: Record<string, string> }) => {
    // Extract client identifier from headers or fallback
    const forwarded = req.headers.get('x-forwarded-for');
    const ip = forwarded?.split(',')[0]?.trim() ?? req.headers.get('x-real-ip') ?? '127.0.0.1';

    try {
      await limiter.check(limit, ip);
    } catch (error: unknown) {
      if (isRateLimitError(error)) {
        return NextResponse.json(
          {
            error: 'Too many requests',
            retryAfterMs: error.retryAfterMs,
          },
          {
            status: 429,
            headers: {
              'Retry-After': String(Math.ceil(error.retryAfterMs / 1000)),
              'X-RateLimit-Limit': String(limit),
              'X-RateLimit-Remaining': '0',
            },
          },
        );
      }
      throw error;
    }

    return handler(req, context);
  };
}
