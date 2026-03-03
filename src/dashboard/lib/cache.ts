/**
 * SARAH OS — Client-side Caching Utility
 * SWR-like pattern with localStorage persistence
 */

import { useState, useEffect, useCallback, useRef } from 'react';

// ── Types ──

export interface CacheEntry<T> {
  data: T;
  timestamp: number;
  ttl: number;
}

interface UseCachedFetchResult<T> {
  data: T | null;
  error: Error | null;
  loading: boolean;
  refetch: () => Promise<void>;
  invalidate: () => void;
}

// ── Constants ──

const DEFAULT_TTL_MS = 5 * 60 * 1000; // 5 minutes
const STORAGE_PREFIX = 'sarah_cache_';

// ── Cache Key Hashing ──

async function hashBody(body: string | undefined): Promise<string> {
  if (!body) return '';
  // Use a simple hash for cache key generation
  let hash = 0;
  for (let i = 0; i < body.length; i++) {
    const char = body.charCodeAt(i);
    hash = ((hash << 5) - hash + char) | 0;
  }
  return hash.toString(36);
}

function buildCacheKey(url: string, body?: string): string {
  // Synchronous simple hash for cache key
  let bodyHash = '';
  if (body) {
    let h = 0;
    for (let i = 0; i < body.length; i++) {
      const char = body.charCodeAt(i);
      h = ((h << 5) - h + char) | 0;
    }
    bodyHash = h.toString(36);
  }
  return `${url}${bodyHash ? `_${bodyHash}` : ''}`;
}

// ── Glob Pattern Matching ──

function matchGlob(pattern: string, text: string): boolean {
  // Convert glob to regex: * -> .*, ? -> .
  const regexStr = pattern
    .replace(/[.+^${}()|[\]\\]/g, '\\$&')
    .replace(/\*/g, '.*')
    .replace(/\?/g, '.');
  return new RegExp(`^${regexStr}$`).test(text);
}

// ── AppCache Class ──

class AppCache {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();

  constructor() {
    this.loadFromStorage();
  }

  /** Return cached data if present and not expired, otherwise null. */
  get<T>(key: string): T | null {
    const entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;
    if (!entry) return null;

    const age = Date.now() - entry.timestamp;
    if (age > entry.ttl) {
      this.invalidate(key);
      return null;
    }

    return entry.data;
  }

  /** Store data in cache with an optional TTL (default 5 minutes). */
  set<T>(key: string, data: T, ttlMs: number = DEFAULT_TTL_MS): void {
    const entry: CacheEntry<T> = {
      data,
      timestamp: Date.now(),
      ttl: ttlMs,
    };
    this.memoryCache.set(key, entry as CacheEntry<unknown>);
    this.persistToStorage(key, entry);
  }

  /** Remove a single cache entry. */
  invalidate(key: string): void {
    this.memoryCache.delete(key);
    this.removeFromStorage(key);
  }

  /** Remove all entries whose keys match the given glob pattern. */
  invalidatePattern(pattern: string): void {
    const keysToRemove: string[] = [];
    for (const key of this.memoryCache.keys()) {
      if (matchGlob(pattern, key)) {
        keysToRemove.push(key);
      }
    }
    for (const key of keysToRemove) {
      this.invalidate(key);
    }
  }

  /** Clear all cached entries. */
  clear(): void {
    this.memoryCache.clear();
    this.clearStorage();
  }

  // ── LocalStorage Persistence ──

  private persistToStorage(key: string, entry: CacheEntry<unknown>): void {
    try {
      if (typeof window === 'undefined') return;
      const storageKey = STORAGE_PREFIX + key;
      window.localStorage.setItem(storageKey, JSON.stringify(entry));
    } catch {
      // localStorage may be full or unavailable — silently degrade
    }
  }

  private removeFromStorage(key: string): void {
    try {
      if (typeof window === 'undefined') return;
      window.localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // Ignore storage errors
    }
  }

  private clearStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      const keysToRemove: string[] = [];
      for (let i = 0; i < window.localStorage.length; i++) {
        const storageKey = window.localStorage.key(i);
        if (storageKey?.startsWith(STORAGE_PREFIX)) {
          keysToRemove.push(storageKey);
        }
      }
      for (const storageKey of keysToRemove) {
        window.localStorage.removeItem(storageKey);
      }
    } catch {
      // Ignore storage errors
    }
  }

  private loadFromStorage(): void {
    try {
      if (typeof window === 'undefined') return;
      for (let i = 0; i < window.localStorage.length; i++) {
        const storageKey = window.localStorage.key(i);
        if (!storageKey?.startsWith(STORAGE_PREFIX)) continue;

        const cacheKey = storageKey.slice(STORAGE_PREFIX.length);
        const raw = window.localStorage.getItem(storageKey);
        if (!raw) continue;

        const entry = JSON.parse(raw) as CacheEntry<unknown>;
        const age = Date.now() - entry.timestamp;

        if (age > entry.ttl) {
          // Expired — remove from storage
          window.localStorage.removeItem(storageKey);
        } else {
          this.memoryCache.set(cacheKey, entry);
        }
      }
    } catch {
      // Corrupted storage — ignore
    }
  }
}

/** Singleton cache instance */
export const appCache = new AppCache();

// ── useCachedFetch Hook ──

/**
 * SWR-like hook that checks cache first, falls back to network fetch.
 * Updates cache on successful response. Uses localStorage for persistence.
 */
export function useCachedFetch<T = unknown>(
  url: string,
  options?: RequestInit,
  ttlMs: number = DEFAULT_TTL_MS,
): UseCachedFetchResult<T> {
  const cacheKey = buildCacheKey(url, options?.body as string | undefined);
  const [data, setData] = useState<T | null>(() => appCache.get<T>(cacheKey));
  const [error, setError] = useState<Error | null>(null);
  const [loading, setLoading] = useState<boolean>(!appCache.get<T>(cacheKey));
  const abortRef = useRef<AbortController | null>(null);

  const fetchData = useCallback(async () => {
    // Cancel any in-flight request
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setError(null);

    try {
      const response = await fetch(url, {
        ...options,
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      const json = (await response.json()) as T;
      appCache.set<T>(cacheKey, json, ttlMs);
      setData(json);
      setError(null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        return; // Request was cancelled — do not update state
      }
      setError(err instanceof Error ? err : new Error(String(err)));
    } finally {
      setLoading(false);
    }
  }, [url, cacheKey, ttlMs, options]);

  const invalidate = useCallback(() => {
    appCache.invalidate(cacheKey);
    setData(null);
  }, [cacheKey]);

  useEffect(() => {
    // If cache had data, still revalidate in the background (stale-while-revalidate)
    const cached = appCache.get<T>(cacheKey);
    if (cached) {
      setData(cached);
      setLoading(false);
      // Background revalidation
      fetchData();
    } else {
      fetchData();
    }

    return () => {
      abortRef.current?.abort();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, cacheKey]);

  return { data, error, loading, refetch: fetchData, invalidate };
}
