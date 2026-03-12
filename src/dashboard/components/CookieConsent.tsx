'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { loadGtag } from '../lib/analytics';

const OLD_KEY = 'fz_cookies_accepted';
const CONSENT_KEY = 'fz_cookies_consent';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      // Migrate old key if needed
      if (localStorage.getItem(OLD_KEY) && !localStorage.getItem(CONSENT_KEY)) {
        localStorage.setItem(CONSENT_KEY, 'accepted');
        localStorage.removeItem(OLD_KEY);
      }
      // Show modal only if no consent choice has been made
      if (!localStorage.getItem(CONSENT_KEY)) {
        setVisible(true);
      }
    } catch { /* SSR or localStorage error */ }
  }, []);

  function accept() {
    try {
      localStorage.setItem(CONSENT_KEY, 'accepted');
      localStorage.removeItem(OLD_KEY);
    } catch { /* */ }
    setVisible(false);
    // Load GA4
    const id = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID;
    if (id) loadGtag(id);
  }

  function refuse() {
    try {
      localStorage.setItem(CONSENT_KEY, 'refused');
      localStorage.removeItem(OLD_KEY);
    } catch { /* */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <>
      {/* Backdrop */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9998,
        background: 'rgba(0,0,0,0.5)',
        backdropFilter: 'blur(4px)',
        WebkitBackdropFilter: 'blur(4px)',
      }} />

      {/* Modal */}
      <div style={{
        position: 'fixed', inset: 0, zIndex: 9999,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 24,
      }}>
        <div style={{
          background: '#fff',
          color: 'var(--text-primary)',
          borderRadius: 8,
          padding: '24px 20px 20px',
          maxWidth: 'min(440px, calc(100vw - 32px))',
          width: '100%',
          border: '1px solid #E5E5E5',
        }}>
          {/* Icon + Title */}
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 14 }}>
            🍪
            <h3 style={{
              margin: 0, fontSize: 16, fontWeight: 700,
              fontFamily: 'var(--font-display)',
              color: 'var(--text-primary)',
            }}>
              Cookies &amp; confidentialité
            </h3>
          </div>

          {/* Body */}
          <p style={{ fontSize: 13, lineHeight: 1.65, color: 'var(--text-secondary)', margin: '0 0 8px' }}>
            Nous utilisons des cookies analytiques (Google Analytics) pour comprendre comment
            vous utilisez notre site et améliorer votre expérience. Aucune donnée personnelle
            n&apos;est vendue ni partagée à des tiers.
          </p>
          <p style={{ fontSize: 12, color: 'var(--text-tertiary)', margin: '0 0 22px' }}>
            Les cookies essentiels (session, préférences) fonctionnent toujours.{' '}
            <Link href="/legal/cookies" style={{ color: 'var(--text-primary)', textDecoration: 'underline' }}>
              Politique de cookies
            </Link>
          </p>

          {/* Buttons */}
          <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
            <button
              onClick={refuse}
              style={{
                flex: 1,
                padding: '11px 20px',
                minHeight: 44,
                background: '#fff',
                border: '1px solid #E5E5E5',
                color: 'var(--text-secondary)',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
              }}
            >
              Refuser
            </button>
            <button
              onClick={accept}
              style={{
                flex: 1,
                padding: '11px 20px',
                minHeight: 44,
                background: 'var(--text-primary)',
                border: '1px solid var(--text-primary)',
                color: '#fff',
                borderRadius: 8,
                fontSize: 13,
                fontWeight: 600,
                fontFamily: 'var(--font-display)',
                cursor: 'pointer',
              }}
            >
              Accepter
            </button>
          </div>
        </div>
      </div>
    </>
  );
}
