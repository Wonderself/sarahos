'use client';

import { useState, useEffect, useCallback } from 'react';
import { AudienceType, AudienceConfig, AUDIENCE_CONFIGS } from './audience-data';

const STORAGE_KEY = 'fz_audience';
const EVENT_NAME = 'fz-audience-change';

export function useAudience() {
  const [audience, setAudienceState] = useState<AudienceType | null>(null);

  // Read from URL param (priority) or localStorage on mount (SSR-safe)
  useEffect(() => {
    // 1. URL param (highest priority — ad campaigns)
    const params = new URLSearchParams(window.location.search);
    const urlAudience = params.get('audience') as AudienceType | null;
    if (urlAudience && urlAudience in AUDIENCE_CONFIGS) {
      setAudienceState(urlAudience);
      localStorage.setItem(STORAGE_KEY, urlAudience);
    } else {
      // 2. Fall back to localStorage
      const stored = localStorage.getItem(STORAGE_KEY) as AudienceType | null;
      if (stored && stored in AUDIENCE_CONFIGS) {
        setAudienceState(stored);
      }
    }

    // Listen for changes from other components on the same page
    const handler = (e: Event) => {
      const detail = (e as CustomEvent<AudienceType | null>).detail;
      setAudienceState(detail);
    };
    window.addEventListener(EVENT_NAME, handler);
    return () => window.removeEventListener(EVENT_NAME, handler);
  }, []);

  const setAudience = useCallback((value: AudienceType | null) => {
    setAudienceState(value);
    if (value) {
      localStorage.setItem(STORAGE_KEY, value);
    } else {
      localStorage.removeItem(STORAGE_KEY);
    }
    // Notify other components on the same page
    window.dispatchEvent(new CustomEvent(EVENT_NAME, { detail: value }));
  }, []);

  const config: AudienceConfig | null = audience ? AUDIENCE_CONFIGS[audience] : null;

  return { audience, setAudience, config };
}
