'use client';

import { useState, useEffect } from 'react';
import { loadQueue } from '../lib/offline-manager';

// ═══════════════════════════════════════════════════
//   FREENZY.IO — Offline Banner
//   Fixed top banner when user loses connectivity
// ═══════════════════════════════════════════════════

export default function OfflineBanner() {
  const [online, setOnline] = useState(true);
  const [visible, setVisible] = useState(false);
  const [queueCount, setQueueCount] = useState(0);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    const updateStatus = () => {
      const isOnline = navigator.onLine;
      setOnline(isOnline);

      if (!isOnline) {
        setVisible(true);
        setQueueCount(loadQueue().filter((m) => !m.synced).length);
      } else {
        // Delay hide for smooth animation
        setTimeout(() => setVisible(false), 600);
      }
    };

    // Check initial state
    updateStatus();

    window.addEventListener('online', updateStatus);
    window.addEventListener('offline', updateStatus);

    // Poll queue count while offline
    const interval = setInterval(() => {
      if (!navigator.onLine) {
        setQueueCount(loadQueue().filter((m) => !m.synced).length);
      }
    }, 5000);

    return () => {
      window.removeEventListener('online', updateStatus);
      window.removeEventListener('offline', updateStatus);
      clearInterval(interval);
    };
  }, []);

  if (!visible && online) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        zIndex: 9998,
        transform: !online ? 'translateY(0)' : 'translateY(-100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: !online ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          background: 'rgba(217, 119, 6, 0.15)',
          backdropFilter: 'blur(12px)',
          WebkitBackdropFilter: 'blur(12px)',
          borderBottom: '1px solid rgba(217, 119, 6, 0.3)',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: 10,
        }}
      >
        {/* Icon */}
        <span
          className="material-symbols-rounded"
          style={{ fontSize: 20, color: '#f59e0b', flexShrink: 0 }}
        >
          wifi_off
        </span>

        {/* Text */}
        <span style={{ color: '#fbbf24', fontSize: 13, fontWeight: 500 }}>
          Vous etes hors ligne — les messages seront envoyes automatiquement a la reconnexion
        </span>

        {/* Queue count badge */}
        {queueCount > 0 && (
          <span
            style={{
              background: 'rgba(217, 119, 6, 0.3)',
              border: '1px solid rgba(217, 119, 6, 0.4)',
              borderRadius: 12,
              padding: '2px 10px',
              color: '#fbbf24',
              fontSize: 12,
              fontWeight: 600,
              flexShrink: 0,
            }}
          >
            {queueCount} en file
          </span>
        )}
      </div>
    </div>
  );
}
