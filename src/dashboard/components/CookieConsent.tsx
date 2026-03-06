'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

const STORAGE_KEY = 'fz_cookies_accepted';

export default function CookieConsent() {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch { /* SSR or localStorage error */ }
  }, []);

  // Dismiss on click outside
  useEffect(() => {
    if (!visible) return;
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        accept();
      }
    }
    // Delay listener to avoid instant dismiss
    const timer = setTimeout(() => document.addEventListener('click', handleClick), 300);
    return () => { clearTimeout(timer); document.removeEventListener('click', handleClick); };
  });

  function accept() {
    try { localStorage.setItem(STORAGE_KEY, String(Date.now())); } catch { /* */ }
    setVisible(false);
  }

  if (!visible) return null;

  return (
    <div
      ref={ref}
      style={{
        position: 'fixed',
        bottom: 16,
        right: 16,
        zIndex: 9999,
        background: '#1d1d1f',
        color: '#ccc',
        padding: '10px 16px',
        borderRadius: 10,
        fontSize: 12,
        maxWidth: 340,
        boxShadow: '0 4px 20px rgba(0,0,0,0.4)',
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        opacity: 0.92,
      }}
    >
      <span style={{ flex: 1, lineHeight: 1.4 }}>
        Cookies essentiels uniquement.{' '}
        <Link href="/legal/cookies" style={{ color: '#5b6cf7', textDecoration: 'underline' }}>
          En savoir plus
        </Link>
      </span>
      <button
        onClick={accept}
        style={{
          background: '#5b6cf7',
          color: 'white',
          border: 'none',
          padding: '5px 14px',
          borderRadius: 6,
          fontSize: 11,
          fontWeight: 600,
          cursor: 'pointer',
          whiteSpace: 'nowrap',
        }}
      >
        OK
      </button>
    </div>
  );
}
