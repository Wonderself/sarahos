'use client';

import { useState, useEffect, useCallback, useRef } from 'react';

/**
 * Saves form field values to localStorage for visitors.
 * After login, data persists so they don't lose their work.
 *
 * Usage:
 *   const [message, setMessage, clearMessage] = useVisitorDraft('chat', 'message', '');
 *   const [config, setConfig, clearConfig] = useVisitorDraft('repondeur', 'config', defaultConfig);
 *
 * Or for multiple fields at once:
 *   const { draft, updateField, updateDraft, clearDraft, isDirty } = useVisitorDraftObject('documents', {
 *     type: '',
 *     brief: '',
 *     tone: 'professionnel',
 *   });
 */

const KEY_PREFIX = 'fz_visitor_';
const DEBOUNCE_MS = 300;

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

function buildKey(pageKey: string, fieldKey?: string): string {
  return fieldKey ? `${KEY_PREFIX}${pageKey}_${fieldKey}` : `${KEY_PREFIX}${pageKey}`;
}

function readFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

function writeToStorage<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // quota exceeded or other storage error — silently ignore
  }
}

function removeFromStorage(key: string): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.removeItem(key);
  } catch {
    // ignore
  }
}

// ---------------------------------------------------------------------------
// useVisitorDraft — single field
// ---------------------------------------------------------------------------

export function useVisitorDraft<T>(
  pageKey: string,
  fieldKey: string,
  defaultValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const storageKey = buildKey(pageKey, fieldKey);

  const [value, setValueRaw] = useState<T>(() => readFromStorage<T>(storageKey, defaultValue));

  // Debounce timer ref
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  // Keep latest value in a ref so the debounced write always sees current state
  const latestRef = useRef<T>(value);

  // Hydration: sync with localStorage after mount (covers SSR mismatch)
  useEffect(() => {
    const stored = readFromStorage<T>(storageKey, defaultValue);
    setValueRaw(stored);
    latestRef.current = stored;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // Debounced persist
  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      writeToStorage(storageKey, latestRef.current);
    }, DEBOUNCE_MS);
  }, [storageKey]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        // Flush pending save on unmount
        writeToStorage(storageKey, latestRef.current);
      }
    };
  }, [storageKey]);

  const setValue = useCallback(
    (update: T | ((prev: T) => T)) => {
      setValueRaw((prev) => {
        const next = typeof update === 'function' ? (update as (prev: T) => T)(prev) : update;
        latestRef.current = next;
        scheduleSave();
        return next;
      });
    },
    [scheduleSave]
  );

  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    removeFromStorage(storageKey);
    setValueRaw(defaultValue);
    latestRef.current = defaultValue;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  return [value, setValue, clearDraft];
}

// ---------------------------------------------------------------------------
// useVisitorDraftObject — multi-field form
// ---------------------------------------------------------------------------

export function useVisitorDraftObject<T extends Record<string, unknown>>(
  pageKey: string,
  defaultValues: T
): {
  draft: T;
  updateField: <K extends keyof T>(key: K, value: T[K]) => void;
  updateDraft: (partial: Partial<T>) => void;
  clearDraft: () => void;
  isDirty: boolean;
} {
  const storageKey = buildKey(pageKey);

  const [draft, setDraftRaw] = useState<T>(() => {
    const stored = readFromStorage<Partial<T>>(storageKey, {});
    return { ...defaultValues, ...stored };
  });

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestRef = useRef<T>(draft);

  // Hydration sync
  useEffect(() => {
    const stored = readFromStorage<Partial<T>>(storageKey, {});
    const merged = { ...defaultValues, ...stored };
    setDraftRaw(merged);
    latestRef.current = merged;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  const scheduleSave = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      writeToStorage(storageKey, latestRef.current);
    }, DEBOUNCE_MS);
  }, [storageKey]);

  // Flush on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
        writeToStorage(storageKey, latestRef.current);
      }
    };
  }, [storageKey]);

  const updateField = useCallback(
    <K extends keyof T>(key: K, value: T[K]) => {
      setDraftRaw((prev) => {
        const next = { ...prev, [key]: value };
        latestRef.current = next;
        scheduleSave();
        return next;
      });
    },
    [scheduleSave]
  );

  const updateDraft = useCallback(
    (partial: Partial<T>) => {
      setDraftRaw((prev) => {
        const next = { ...prev, ...partial };
        latestRef.current = next;
        scheduleSave();
        return next;
      });
    },
    [scheduleSave]
  );

  const clearDraft = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    removeFromStorage(storageKey);
    setDraftRaw(defaultValues);
    latestRef.current = defaultValues;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [storageKey]);

  // isDirty: compare each field against defaults
  const isDirty = Object.keys(defaultValues).some((k) => {
    const key = k as keyof T;
    return draft[key] !== defaultValues[key];
  });

  return { draft, updateField, updateDraft, clearDraft, isDirty };
}

// ---------------------------------------------------------------------------
// Utilities
// ---------------------------------------------------------------------------

/** Remove all fz_visitor_* keys from localStorage. */
export function clearAllVisitorDrafts(): void {
  if (typeof window === 'undefined') return;
  try {
    const keysToRemove: string[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX)) {
        keysToRemove.push(key);
      }
    }
    keysToRemove.forEach((key) => localStorage.removeItem(key));
  } catch {
    // ignore
  }
}

/** Returns true if any fz_visitor_* keys exist in localStorage. */
export function hasVisitorDrafts(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith(KEY_PREFIX)) return true;
    }
  } catch {
    // ignore
  }
  return false;
}
