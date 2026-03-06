'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    try {
      const accepted = localStorage.getItem('fz_cookies_accepted');
      if (!accepted) setVisible(true);
    } catch { /* SSR or localStorage error */ }
  }, []);

  function accept() {
    try { localStorage.setItem('fz_cookies_accepted', String(Date.now())); } catch { /* */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div style={{
      position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 9999,
      background: '#1d1d1f', color: '#f5f5f7', padding: '14px 24px',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
      flexWrap: 'wrap', fontSize: 13,
    }}>
      <span>
        Ce site utilise uniquement des cookies necessaires au fonctionnement du service.{' '}
        <Link href="/legal/cookies" style={{ color: '#5b6cf7', textDecoration: 'underline' }}>
          En savoir plus
        </Link>
      </span>
      <button
        onClick={accept}
        style={{
          background: '#5b6cf7', color: 'white', border: 'none', padding: '7px 20px',
          borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: 'pointer',
        }}
      >
        Accepter
      </button>
    </div>
  );
}
