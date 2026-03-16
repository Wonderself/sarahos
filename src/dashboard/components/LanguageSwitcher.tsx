'use client';

import { useState, useRef, useEffect } from 'react';
import { useTranslation, type Locale } from '../lib/i18n';

/**
 * Language switcher dropdown — compact design for nav bars.
 * Shows current locale emoji + label, dropdown with all supported locales.
 */
export default function LanguageSwitcher() {
  const { locale, setLocale, SUPPORTED_LOCALES } = useTranslation();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  // Close on outside click
  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    if (open) document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);

  const current = SUPPORTED_LOCALES.find(l => l.id === locale) || SUPPORTED_LOCALES[0];

  return (
    <div ref={ref} style={{ position: 'relative' }}>
      <button
        onClick={() => setOpen(!open)}
        aria-label="Change language"
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 4,
          padding: '6px 10px',
          borderRadius: 6,
          border: '1px solid #E5E5E5',
          background: '#fff',
          cursor: 'pointer',
          fontSize: 13,
          fontWeight: 500,
          color: '#1A1A1A',
          fontFamily: 'inherit',
        }}
      >
        <span>{current.emoji}</span>
        <span style={{ fontSize: 12 }}>{current.id.toUpperCase()}</span>
      </button>

      {open && (
        <div style={{
          position: 'absolute',
          top: '100%',
          right: 0,
          marginTop: 4,
          background: '#fff',
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          boxShadow: '0 4px 12px rgba(0,0,0,0.08)',
          zIndex: 1000,
          minWidth: 140,
          overflow: 'hidden',
        }}>
          {SUPPORTED_LOCALES.map(l => (
            <button
              key={l.id}
              onClick={() => { setLocale(l.id as Locale); setOpen(false); }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 8,
                width: '100%',
                padding: '10px 14px',
                border: 'none',
                background: l.id === locale ? '#FAFAFA' : '#fff',
                cursor: 'pointer',
                fontSize: 13,
                color: '#1A1A1A',
                fontWeight: l.id === locale ? 600 : 400,
                fontFamily: 'inherit',
                textAlign: 'left',
              }}
            >
              <span style={{ fontSize: 16 }}>{l.emoji}</span>
              <span>{l.label}</span>
              {l.id === locale && <span style={{ marginLeft: 'auto', fontSize: 12, color: '#9B9B9B' }}>✓</span>}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
