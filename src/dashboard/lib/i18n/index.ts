/**
 * Freenzy.io — Lightweight i18n system
 * Supports: fr (default), en, he, es, ar (future)
 * Usage: const { t } = useTranslation(); t('nav.home')
 */

import { useState, useCallback, useEffect } from 'react';
import fr from './locales/fr.json';
import en from './locales/en.json';

// ─── Types ──────────────────────────────────────────────────

export type Locale = 'fr' | 'en' | 'he' | 'es' | 'ar';

export interface LocaleConfig {
  id: Locale;
  label: string;
  emoji: string;
  dir: 'ltr' | 'rtl';
}

export const SUPPORTED_LOCALES: LocaleConfig[] = [
  { id: 'fr', label: 'Français', emoji: '🇫🇷', dir: 'ltr' },
  { id: 'en', label: 'English', emoji: '🇬🇧', dir: 'ltr' },
  // Future:
  // { id: 'he', label: 'עברית', emoji: '🇮🇱', dir: 'rtl' },
  // { id: 'es', label: 'Español', emoji: '🇪🇸', dir: 'ltr' },
  // { id: 'ar', label: 'العربية', emoji: '🇸🇦', dir: 'rtl' },
];

// ─── Translation dictionaries ───────────────────────────────

type TranslationDict = Record<string, string | Record<string, string | Record<string, string>>>;

const TRANSLATIONS: Record<string, TranslationDict> = {
  fr,
  en,
};

// ─── Deep key access (e.g., 'nav.home' → translations.nav.home) ──

function getNestedValue(obj: TranslationDict, path: string): string {
  const keys = path.split('.');
  let current: unknown = obj;
  for (const key of keys) {
    if (current && typeof current === 'object' && key in (current as Record<string, unknown>)) {
      current = (current as Record<string, unknown>)[key];
    } else {
      return path; // Fallback: return key itself
    }
  }
  return typeof current === 'string' ? current : path;
}

// ─── Storage ────────────────────────────────────────────────

const LOCALE_KEY = 'fz_locale';

function getStoredLocale(): Locale {
  if (typeof window === 'undefined') return 'fr';
  const stored = localStorage.getItem(LOCALE_KEY);
  if (stored && SUPPORTED_LOCALES.some(l => l.id === stored)) return stored as Locale;
  // Auto-detect from browser language
  const browserLang = navigator.language?.slice(0, 2);
  if (browserLang === 'fr') return 'fr';
  if (browserLang === 'he') return 'fr'; // Hebrew users → French fallback until Hebrew ready
  if (browserLang === 'es') return 'en'; // Spanish users → English fallback until Spanish ready
  if (browserLang === 'ar') return 'en'; // Arabic users → English fallback until Arabic ready
  // Default to English for all other languages
  return 'en';
}

function setStoredLocale(locale: Locale) {
  if (typeof window !== 'undefined') {
    localStorage.setItem(LOCALE_KEY, locale);
  }
}

// ─── Hook ───────────────────────────────────────────────────

export function useTranslation() {
  const [locale, setLocaleState] = useState<Locale>('en');

  useEffect(() => {
    setLocaleState(getStoredLocale());
  }, []);

  const setLocale = useCallback((newLocale: Locale) => {
    setLocaleState(newLocale);
    setStoredLocale(newLocale);
  }, []);

  const t = useCallback((key: string, params?: Record<string, string | number>): string => {
    const dict = TRANSLATIONS[locale] || TRANSLATIONS['fr'];
    let value = getNestedValue(dict, key);
    // Fallback to French if key not found in current locale
    if (value === key && locale !== 'fr') {
      value = getNestedValue(TRANSLATIONS['fr'], key);
    }
    // Replace {{param}} placeholders
    if (params) {
      for (const [k, v] of Object.entries(params)) {
        value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
      }
    }
    return value;
  }, [locale]);

  const localeConfig = SUPPORTED_LOCALES.find(l => l.id === locale) || SUPPORTED_LOCALES[0];

  return { t, locale, setLocale, localeConfig, SUPPORTED_LOCALES };
}

// ─── Server-side helper ─────────────────────────────────────

export function translate(key: string, locale: Locale = 'fr', params?: Record<string, string | number>): string {
  const dict = TRANSLATIONS[locale] || TRANSLATIONS['fr'];
  let value = getNestedValue(dict, key);
  if (value === key && locale !== 'fr') {
    value = getNestedValue(TRANSLATIONS['fr'], key);
  }
  if (params) {
    for (const [k, v] of Object.entries(params)) {
      value = value.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    }
  }
  return value;
}
