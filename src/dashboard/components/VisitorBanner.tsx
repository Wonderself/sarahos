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
        borderRadius: 12,
        padding: compact ? '12px 16px' : '16px 20px',
        margin: compact ? '0 0 16px' : '0 0 20px',
        display: 'flex',
        alignItems: compact ? 'center' : 'flex-start',
        gap: compact ? 12 : 16,
        flexWrap: 'wrap',
        position: 'relative',
      }}>
        {/* Icon */}
        <span style={{
          fontSize: compact ? 20 : 28,
          lineHeight: 1,
          flexShrink: 0,
        }}>
          👀
        </span>

        {/* Content */}
        <div style={{ flex: 1, minWidth: 200 }}>
          <div style={{
            fontSize: compact ? 13 : 15,
            fontWeight: 600,
            color: '#1A1A1A',
            lineHeight: 1.4,
          }}>
            Bienvenue sur Freenzy.io !
          </div>
          <div style={{
            fontSize: compact ? 12 : 13,
            color: '#6B6B6B',
            marginTop: 2,
            lineHeight: 1.5,
          }}>
            Vous explorez le dashboard en mode visiteur.
            {!compact && ' Créez un compte gratuit pour accéder à toutes les fonctionnalités.'}
          </div>
        </div>

        {/* CTA */}
        <button
          onClick={() => setLoginOpen(true)}
          style={{
            height: compact ? 32 : 36,
            padding: compact ? '0 14px' : '0 20px',
            borderRadius: 8,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: compact ? 12 : 13,
            fontWeight: 600,
            cursor: 'pointer',
            whiteSpace: 'nowrap',
            transition: 'all 0.15s ease',
            flexShrink: 0,
          }}
        >
          Ouvrir un compte gratuit
        </button>

        {/* Dismiss */}
        <button
          onClick={handleDismiss}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: compact ? 8 : 10,
            right: compact ? 8 : 10,
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            fontSize: 16,
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
  ctaLabel = 'Ouvrir un compte gratuit',
}: VisitorEmptyStateProps) {
  const [loginOpen, setLoginOpen] = useState(false);

  return (
    <>
      <div style={{
        textAlign: 'center',
        padding: '48px 24px',
        maxWidth: 640,
        margin: '0 auto',
      }}>
        {/* Hero icon */}
        <div style={{
          fontSize: 56,
          marginBottom: 16,
          filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.08))',
        }}>
          {icon}
        </div>

        {/* Title */}
        <h2 style={{
          fontSize: 22,
          fontWeight: 700,
          color: '#1A1A1A',
          margin: '0 0 8px',
          lineHeight: 1.3,
        }}>
          {title}
        </h2>

        {/* Description */}
        <p style={{
          fontSize: 15,
          color: '#6B6B6B',
          margin: '0 0 32px',
          lineHeight: 1.6,
          maxWidth: 480,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          {description}
        </p>

        {/* Feature previews */}
        {features && features.length > 0 && (
          <div style={{
            display: 'grid',
            gridTemplateColumns: features.length <= 3 ? `repeat(${features.length}, 1fr)` : 'repeat(auto-fill, minmax(160px, 1fr))',
            gap: 12,
            marginBottom: 32,
            textAlign: 'left',
          }}>
            {features.map((f, i) => (
              <div key={i} style={{
                background: '#fff',
                border: '1px solid #E5E5E5',
                borderRadius: 10,
                padding: '14px 16px',
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
              }}>
                <span style={{ fontSize: 22, flexShrink: 0, lineHeight: 1 }}>{f.icon}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1A1A1A', marginBottom: 2 }}>{f.label}</div>
                  <div style={{ fontSize: 11, color: '#9B9B9B', lineHeight: 1.4 }}>{f.desc}</div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* CTA */}
        <button
          onClick={() => setLoginOpen(true)}
          style={{
            height: 44,
            padding: '0 28px',
            borderRadius: 10,
            border: 'none',
            background: 'var(--accent)',
            color: '#fff',
            fontSize: 15,
            fontWeight: 600,
            cursor: 'pointer',
            transition: 'all 0.2s ease',
            boxShadow: '0 4px 14px rgba(124, 58, 237, 0.3)',
          }}
        >
          {ctaLabel}
        </button>

        <div style={{
          marginTop: 12,
          fontSize: 12,
          color: '#9B9B9B',
        }}>
          50 crédits offerts à l'inscription — aucune carte requise
        </div>
      </div>

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
