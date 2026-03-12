'use client';

import { useState, useEffect, useCallback } from 'react';
import { getPendingBadges, clearPendingBadge, Badge } from '@/lib/arcade-profile';

export default function BadgeUnlockPopup() {
  const [currentBadge, setCurrentBadge] = useState<Badge | null>(null);
  const [visible, setVisible] = useState(false);
  const [animating, setAnimating] = useState(false);

  const showNext = useCallback(() => {
    const pending = getPendingBadges();
    if (pending.length > 0) {
      setCurrentBadge(pending[0]);
      setAnimating(true);
      setTimeout(() => setVisible(true), 20);
      // Auto-dismiss after 4 seconds
      setTimeout(() => {
        dismiss(pending[0].id);
      }, 4000);
    } else {
      setCurrentBadge(null);
      setVisible(false);
      setAnimating(false);
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const dismiss = useCallback((badgeId: string) => {
    setVisible(false);
    setTimeout(() => {
      clearPendingBadge(badgeId);
      setAnimating(false);
      setCurrentBadge(null);
      // Check for more
      setTimeout(() => showNext(), 300);
    }, 300);
  }, [showNext]);

  useEffect(() => {
    const timer = setTimeout(() => showNext(), 500);
    return () => clearTimeout(timer);
  }, [showNext]);

  if (!currentBadge || !animating) return null;

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: visible ? 'rgba(0,0,0,0.5)' : 'rgba(0,0,0,0)',
        backdropFilter: visible ? 'blur(12px)' : 'none',
        transition: 'background 0.3s ease',
        cursor: 'pointer',
      }}
      onClick={() => dismiss(currentBadge.id)}
    >
      <div
        style={{
          background: '#fff',
          border: '1px solid #E5E5E5',
          borderRadius: 8,
          padding: '32px 40px',
          textAlign: 'center',
          transform: visible ? 'scale(1)' : 'scale(0.5)',
          opacity: visible ? 1 : 0,
          transition: 'transform 0.35s cubic-bezier(0.34, 1.56, 0.64, 1), opacity 0.3s ease',
          maxWidth: 320,
        }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Icon circle */}
        <div
          style={{
            width: 80,
            height: 80,
            borderRadius: '50%',
            background: '#F7F7F7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 16px',
          }}
        >
          <span
            className="material-symbols-rounded"
            style={{ fontSize: 48, color: 'var(--text-primary)' }}
          >
            {currentBadge.icon}
          </span>
        </div>

        <div style={{ fontSize: 11, color: 'var(--text-secondary)', fontWeight: 700, letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8 }}>
          Badge débloqué !
        </div>

        <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6 }}>
          {currentBadge.name}
        </div>

        <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
          {currentBadge.description}
        </div>

        <div
          style={{
            marginTop: 20,
            fontSize: 12,
            color: 'var(--text-tertiary)',
          }}
        >
          Cliquez pour fermer
        </div>
      </div>
    </div>
  );
}
