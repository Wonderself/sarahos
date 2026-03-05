'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───

type Serializable = Record<string, unknown> | unknown[] | string | number | boolean | null;

interface UseUserDataOptions {
  debounceMs?: number;
  skipMigration?: boolean;
}

interface UseUserDataResult<T> {
  data: T;
  setData: (value: T | ((prev: T) => T)) => void;
  syncing: boolean;
}

// ─── Session helper ───

function getToken(): string | null {
  if (typeof window === 'undefined') return null;
  try {
    return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? null;
  } catch { return null; }
}

// ─── API helpers ───

const PORTAL_API = '/api/portal';

async function fetchFromApi<T>(namespace: string, token: string): Promise<T | null> {
  try {
    const res = await fetch(PORTAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: `/portal/user-data/${namespace}`,
        token,
        method: 'GET',
      }),
      cache: 'no-store',
    });
    if (!res.ok) return null;
    const body = await res.json() as { data?: T };
    return body.data ?? null;
  } catch { return null; }
}

async function pushToApi(namespace: string, token: string, data: unknown): Promise<boolean> {
  try {
    const res = await fetch(PORTAL_API, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        path: `/portal/user-data/${namespace}`,
        token,
        method: 'PUT',
        data: { data },
      }),
      cache: 'no-store',
    });
    return res.ok;
  } catch { return false; }
}

// ─── The Hook ───

export function useUserData<T extends Serializable>(
  namespace: string,
  defaultValue: T,
  localStorageKey?: string,
  options: UseUserDataOptions = {},
): UseUserDataResult<T> {
  const { debounceMs = 800, skipMigration = false } = options;

  // Step 1: Synchronous init from localStorage (instant — no loading)
  const [data, setDataState] = useState<T>(() => {
    if (typeof window === 'undefined') return defaultValue;
    if (!localStorageKey) return defaultValue;
    try {
      const raw = localStorage.getItem(localStorageKey);
      if (raw) return JSON.parse(raw) as T;
    } catch { /* corrupted */ }
    return defaultValue;
  });

  const [syncing, setSyncing] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const dataRef = useRef<T>(data);
  dataRef.current = data;
  const mountedRef = useRef(true);

  useEffect(() => {
    return () => { mountedRef.current = false; };
  }, []);

  // Step 2+3: Background API fetch + auto-migration (once on mount)
  useEffect(() => {
    const token = getToken();
    if (!token) return;

    let cancelled = false;

    async function syncFromApi() {
      if (mountedRef.current) setSyncing(true);
      try {
        const apiData = await fetchFromApi<T>(namespace, token!);
        if (cancelled) return;

        if (apiData !== null) {
          // API has data — it wins
          setDataState(apiData);
          if (localStorageKey) {
            try { localStorage.setItem(localStorageKey, JSON.stringify(apiData)); } catch { /* quota */ }
          }
        } else if (!skipMigration && localStorageKey) {
          // API empty — migrate localStorage to API
          try {
            const raw = localStorage.getItem(localStorageKey);
            if (raw) {
              const localData = JSON.parse(raw) as T;
              await pushToApi(namespace, token!, localData);
            }
          } catch { /* corrupted */ }
        }
      } catch { /* network error */ } finally {
        if (!cancelled && mountedRef.current) setSyncing(false);
      }
    }

    void syncFromApi();
    return () => { cancelled = true; };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [namespace]);

  // Step 4: Write handler — localStorage immediate, API debounced
  const setData = useCallback((value: T | ((prev: T) => T)) => {
    setDataState(prev => {
      const next = typeof value === 'function' ? (value as (p: T) => T)(prev) : value;
      dataRef.current = next;

      // Write to localStorage immediately
      if (localStorageKey) {
        try { localStorage.setItem(localStorageKey, JSON.stringify(next)); } catch { /* quota */ }
      }

      // Debounced API write
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(async () => {
        const tk = getToken();
        if (!tk) return;
        if (mountedRef.current) setSyncing(true);
        await pushToApi(namespace, tk, dataRef.current);
        if (mountedRef.current) setSyncing(false);
      }, debounceMs);

      return next;
    });
  }, [namespace, localStorageKey, debounceMs]);

  return { data, setData, syncing };
}
