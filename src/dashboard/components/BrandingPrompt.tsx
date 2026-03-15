'use client';

import { useState, useEffect, type CSSProperties } from 'react';
import { useRouter } from 'next/navigation';
import { BrandingService } from '@/lib/branding';
import type { BrandingCompleteness } from '@/lib/branding';

// ─── Constants ────────────────────────────────────────────────

const DISMISS_KEY = 'fz_branding_prompt_dismissed';

// ─── Styles ───────────────────────────────────────────────────

const s: Record<string, CSSProperties> = {
  banner: {
    background: '#FFFBEB',
    border: '1px solid #FDE68A',
    borderRadius: 8,
    padding: '14px 16px',
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    position: 'relative',
  },
  icon: {
    fontSize: 20,
    lineHeight: 1,
    flexShrink: 0,
  },
  body: {
    flex: 1,
    minWidth: 0,
  },
  title: {
    fontSize: 14,
    fontWeight: 700,
    color: '#1A1A1A',
    margin: 0,
    lineHeight: 1.3,
  },
  subtitle: {
    fontSize: 12,
    color: '#6B6B6B',
    margin: '4px 0 0 0',
    lineHeight: 1.4,
  },
  pills: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
    marginTop: 8,
  },
  pill: {
    fontSize: 11,
    color: '#92400E',
    background: '#FEF3C7',
    border: '1px solid #FDE68A',
    borderRadius: 12,
    padding: '2px 8px',
    whiteSpace: 'nowrap' as const,
  },
  progressRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  progressTrack: {
    flex: 1,
    height: 4,
    background: '#FDE68A',
    borderRadius: 2,
    overflow: 'hidden' as const,
  },
  progressBar: {
    height: '100%',
    background: '#F59E0B',
    borderRadius: 2,
    transition: 'width 0.3s ease',
  },
  progressLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: '#92400E',
    whiteSpace: 'nowrap' as const,
  },
  actions: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 10,
  },
  configBtn: {
    fontSize: 12,
    fontWeight: 600,
    color: '#1A1A1A',
    background: '#FFFFFF',
    border: '1px solid #E5E5E5',
    borderRadius: 6,
    padding: '5px 12px',
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  },
  dismissBtn: {
    position: 'absolute' as const,
    top: 8,
    right: 8,
    fontSize: 14,
    color: '#9B9B9B',
    background: 'none',
    border: 'none',
    cursor: 'pointer',
    padding: '2px 4px',
    lineHeight: 1,
  },
};

// ─── Component ────────────────────────────────────────────────

export default function BrandingPrompt() {
  const router = useRouter();
  const [completeness, setCompleteness] = useState<BrandingCompleteness | null>(null);
  const [dismissed, setDismissed] = useState(true);

  useEffect(() => {
    // Check dismissal
    try {
      const wasDismissed = sessionStorage.getItem(DISMISS_KEY) === '1';
      setDismissed(wasDismissed);
    } catch {
      setDismissed(false);
    }

    // Calculate completeness
    const result = BrandingService.getCompleteness();
    setCompleteness(result);
  }, []);

  // Don't render if dismissed or score >= 60 or not yet calculated
  if (dismissed || !completeness || completeness.score >= 60) {
    return null;
  }

  const handleDismiss = () => {
    setDismissed(true);
    try {
      sessionStorage.setItem(DISMISS_KEY, '1');
    } catch {
      // sessionStorage unavailable
    }
  };

  const handleConfigure = () => {
    router.push('/client/branding');
  };

  // Show max 4 pills
  const visibleMissing = completeness.missing.slice(0, 4);
  const extraCount = completeness.missing.length - visibleMissing.length;

  return (
    <div style={s.banner}>
      <span style={s.icon}>{'🎨'}</span>
      <div style={s.body}>
        <p style={s.title}>Completez votre branding</p>
        <p style={s.subtitle}>
          Ajoutez votre logo et vos couleurs pour des documents professionnels
        </p>

        {/* Missing items pills */}
        <div style={s.pills}>
          {visibleMissing.map((item) => (
            <span key={item} style={s.pill}>
              {item} manquant
            </span>
          ))}
          {extraCount > 0 && (
            <span style={s.pill}>+{extraCount} autre{extraCount > 1 ? 's' : ''}</span>
          )}
        </div>

        {/* Progress bar */}
        <div style={s.progressRow}>
          <div style={s.progressTrack}>
            <div style={{ ...s.progressBar, width: `${completeness.score}%` }} />
          </div>
          <span style={s.progressLabel}>{completeness.score}% complet</span>
        </div>

        {/* Actions */}
        <div style={s.actions}>
          <button style={s.configBtn} onClick={handleConfigure}>
            {'Configurer \u2192'}
          </button>
        </div>
      </div>

      {/* Dismiss */}
      <button style={s.dismissBtn} onClick={handleDismiss} aria-label="Fermer">
        {'\u2715'}
      </button>
    </div>
  );
}
