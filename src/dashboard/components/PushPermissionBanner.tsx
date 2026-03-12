'use client';

import { useState, useEffect } from 'react';
import { requestPushPermission, hasAskedPermission, markPermissionAsked } from '../lib/push-notifications';

// ═══════════════════════════════════════════════════
//   FREENZY.IO — Push Permission Banner
//   Fixed bottom banner to prompt notification opt-in
// ═══════════════════════════════════════════════════

export default function PushPermissionBanner() {
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  useEffect(() => {
    // SSR guard
    if (typeof window === 'undefined') return;
    if (!('Notification' in window)) return;

    // Don't show if already granted or already asked
    if (Notification.permission === 'granted') return;
    if (Notification.permission === 'denied') return;
    if (hasAskedPermission()) return;

    // Delay appearance for smoother UX
    const timer = setTimeout(() => {
      setAnimating(true);
      requestAnimationFrame(() => setVisible(true));
    }, 3000);

    return () => clearTimeout(timer);
  }, []);

  const handleActivate = async () => {
    const result = await requestPushPermission();
    dismiss();
    if (result === 'granted') {
      // Permission granted — banner goes away
    }
  };

  const handleDismiss = () => {
    markPermissionAsked();
    dismiss();
  };

  const dismiss = () => {
    setVisible(false);
    setTimeout(() => setAnimating(false), 400);
  };

  if (!animating) return null;

  return (
    <div
      style={{
        position: 'fixed',
        bottom: 'env(safe-area-inset-bottom, 0px)',
        left: 0,
        right: 0,
        zIndex: 9999,
        transform: visible ? 'translateY(0)' : 'translateY(100%)',
        transition: 'transform 0.4s cubic-bezier(0.16, 1, 0.3, 1)',
        pointerEvents: visible ? 'auto' : 'none',
      }}
    >
      <div
        style={{
          margin: '0 auto',
          maxWidth: 600,
          padding: '16px 20px',
          background: 'rgba(0, 0, 0, 0.06)',
          backdropFilter: 'blur(16px)',
          WebkitBackdropFilter: 'blur(16px)',
          borderTop: '1px solid rgba(0, 0, 0, 0.1)',
          borderRadius: '16px 16px 0 0',
          display: 'flex',
          alignItems: 'center',
          gap: 14,
          flexWrap: 'wrap' as const,
        }}
      >
        {/* Icon */}
        <span style={{ fontSize: 28, color: '#1A1A1A', flexShrink: 0 }}
        >
          🔔
        </span>

        {/* Text */}
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ color: '#fff', fontSize: 14, fontWeight: 600, lineHeight: 1.3 }}>
            Activez les notifications
          </div>
          <div style={{ color: 'rgba(255,255,255,0.55)', fontSize: 12, marginTop: 2 }}>
            Pour ne rien manquer de vos agents IA
          </div>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
          <button
            onClick={handleDismiss}
            style={{
              background: 'transparent',
              border: '1px solid rgba(255,255,255,0.12)',
              borderRadius: 8,
              padding: '7px 14px',
              color: 'rgba(255,255,255,0.55)',
              fontSize: 13,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = 'rgba(255,255,255,0.06)'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = 'transparent'; }}
          >
            Plus tard
          </button>
          <button
            onClick={handleActivate}
            style={{
              background: '#1A1A1A',
              border: 'none',
              borderRadius: 8,
              padding: '7px 16px',
              color: '#fff',
              fontSize: 13,
              fontWeight: 600,
              cursor: 'pointer',
              transition: 'background 0.2s',
            }}
            onMouseEnter={(e) => { (e.target as HTMLElement).style.background = '#333333'; }}
            onMouseLeave={(e) => { (e.target as HTMLElement).style.background = '#1A1A1A'; }}
          >
            Activer
          </button>
        </div>
      </div>
    </div>
  );
}
