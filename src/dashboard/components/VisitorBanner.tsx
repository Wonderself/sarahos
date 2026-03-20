'use client';

import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';

interface VisitorBannerProps {
  /** Compact mode for embedding inside pages */
  compact?: boolean;
}

/**
 * Check if the current visitor is authenticated.
 * Returns true if fz_session has a token.
 */
export function isAuthenticated(): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
    return !!session.token;
  } catch {
    return false;
  }
}

export default function VisitorBanner({ compact }: VisitorBannerProps) {
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [loginOpen, setLoginOpen] = useState(false);

  useEffect(() => {
    if (!isAuthenticated()) {
      // Check if previously dismissed this session
      const wasDismissed = sessionStorage.getItem('fz_visitor_banner_dismissed');
      if (!wasDismissed) {
        setVisible(true);
      }
    }
  }, []);

  function handleDismiss() {
    setDismissed(true);
    sessionStorage.setItem('fz_visitor_banner_dismissed', 'true');
  }

  if (!visible || dismissed) return null;

  return (
    <>
      <div style={{
        background: compact
          ? 'linear-gradient(135deg, #f0ebff 0%, #e8f4fd 100%)'
          : 'linear-gradient(135deg, #f0ebff 0%, #e8f4fd 50%, #fef3e2 100%)',
        border: '1px solid rgba(124, 58, 237, 0.15)',
        borderRadius: 10,
        padding: compact ? '8px 12px' : '10px 14px',
        margin: compact ? '0 0 12px' : '0 0 14px',
        display: 'flex',
        alignItems: 'center',
        gap: compact ? 8 : 10,
        flexWrap: 'wrap',
        position: 'relative',
      }}>
        {/* Icon */}
        <span style={{
          fontSize: compact ? 16 : 18,
          lineHeight: 1,
          flexShrink: 0,
        }}>
          👀
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            color: '#1A1A1A',
            lineHeight: 1.3,
          }}>
            Mode visiteur
          </div>
          <div style={{
            fontSize: compact ? 11 : 12,
            color: '#6B6B6B',
            marginTop: 1,
            lineHeight: 1.4,
          }}>
            Explorez librement.
            {!compact && ' Créez un compte gratuit pour tout débloquer.'}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setLoginOpen(true)}
          style={{
            height: compact ? 26 : 28,
            padding: compact ? '0 10px' : '0 14px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: compact ? 11 : 12,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          Creer un compte
        </button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: compact ? 4 : 6,
            right: compact ? 4 : 6,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 14,
            color: '#9B9B9B',
            padding: '0 4px',
            lineHeight: 1,
          }}
        >
          ×
        </button>
      </div>

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        message="Créez votre compte gratuit pour accéder à toutes les fonctionnalités de Freenzy.io"
        onAuthenticated={() => {
          setLoginOpen(false);
          setVisible(false);
          window.location.reload();
        }}
      />
    </>
  );
}

// ─── Visitor Empty State ─────────────────────────────────────────────────────

interface VisitorEmptyStateProps {
  icon: string;
  title: string;
  description: string;
  features?: { icon: string; label: string; desc: string }[];
  ctaLabel?: string;
}

/**
 * A beautiful empty state shown to unauthenticated visitors
 * on specific pages. Shows feature previews + CTA.
 */
export function VisitorEmptyState({
  icon,
  title,
  description,
  features,
  ctaLabel = 'Creer un compte gratuit',
}: VisitorEmptyStateProps) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      {/* Compact inline banner — does NOT block the page */}
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 10,
        padding: '10px 14px',
        marginBottom: 16,
        background: 'linear-gradient(135deg, #f0ebff 0%, #e8f4fd 100%)',
        border: '1px solid rgba(124, 58, 237, 0.12)',
        borderRadius: 8,
      }}>
        <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1 }}>{icon}</span>
        <div style={{ flex: 1, minWidth: 0 }}>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', lineHeight: 1.3 }}>
            {title}
          </div>
          <div style={{ fontSize: 11, color: '#6B6B6B', lineHeight: 1.4, marginTop: 1 }}>
            {description.length > 100 ? description.slice(0, 100) + '...' : description}
          </div>
        </div>
        <button
          onClick={() => setLoginOpen(true)}
          style={{
            height: 28,
            padding: '0 14px',
            borderRadius: 6,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 12,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            flexShrink: 0,
          }}
        >
          {ctaLabel}
        </button>
      </div>

      {/* Feature chips — compact horizontal row */}
      {features && features.length > 0 && (
        <div style={{
          display: 'flex',
          gap: 8,
          marginBottom: 16,
          flexWrap: 'wrap',
        }}>
          {features.map((f, i) => (
            <div key={i} style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 6,
              padding: '4px 10px',
              background: '#FAFAFA',
              border: '1px solid #E5E5E5',
              borderRadius: 6,
              fontSize: 11,
              color: '#6B6B6B',
            }}>
              <span style={{ fontSize: 14 }}>{f.icon}</span>
              {f.label}
            </div>
          ))}
        </div>
      )}

      <LoginModal
        open={loginOpen}
        onClose={() => setLoginOpen(false)}
        message="Créez votre compte gratuit pour accéder à toutes les fonctionnalités de Freenzy.io"
        onAuthenticated={() => {
          setLoginOpen(false);
          window.location.reload();
        }}
      />
    </>
  );
}
