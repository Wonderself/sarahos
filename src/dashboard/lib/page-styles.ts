/**
 * CU — Constants Unified (Notion-like design system)
 * Template partagée pour toutes les pages client du dashboard.
 * Import: import { CU, pageContainer, headerRow, cardGrid, toolbar, tabBar } from '@/lib/page-styles';
 */

import type { CSSProperties } from 'react';

// ─── Palette ────────────────────────────────────────────────
export const CU = {
  // Colors
  text: '#1A1A1A',
  textMuted: '#9B9B9B',
  textSecondary: '#6B6B6B',
  border: '#E5E5E5',
  bg: '#fff',
  bgSecondary: '#FAFAFA',
  accent: '#1A1A1A',       // Notion = boutons noirs
  accentLight: '#F5F5F5',  // Fond badges, hover léger
  danger: '#E53E3E',
  success: '#38A169',
  warning: '#D69E2E',

  // ─── Typography ─────────────────────────────────────────
  pageTitle: {
    fontSize: 20,
    fontWeight: 700,
    color: '#1A1A1A',
    margin: 0,
    lineHeight: 1.3,
  } as CSSProperties,

  pageSubtitle: {
    fontSize: 13,
    color: '#9B9B9B',
    margin: 0,
    lineHeight: 1.5,
  } as CSSProperties,

  sectionTitle: {
    fontSize: 15,
    fontWeight: 600,
    color: '#1A1A1A',
    margin: 0,
  } as CSSProperties,

  label: {
    fontSize: 12,
    fontWeight: 500,
    color: '#6B6B6B',
    marginBottom: 4,
  } as CSSProperties,

  // ─── Card ───────────────────────────────────────────────
  card: {
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    padding: '14px 16px',
  } as CSSProperties,

  cardHoverable: {
    background: '#fff',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    padding: '14px 16px',
    cursor: 'pointer',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  } as CSSProperties,

  // ─── Buttons ────────────────────────────────────────────
  btnPrimary: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    padding: '0 16px',
    background: '#1A1A1A',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'opacity 0.15s',
  } as CSSProperties,

  btnGhost: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    padding: '0 16px',
    background: '#fff',
    color: '#6B6B6B',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
    transition: 'border-color 0.15s',
  } as CSSProperties,

  btnDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    height: 36,
    padding: '0 16px',
    background: '#E53E3E',
    color: '#fff',
    border: 'none',
    borderRadius: 8,
    fontSize: 13,
    fontWeight: 500,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  } as CSSProperties,

  btnSmall: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 4,
    height: 28,
    padding: '0 10px',
    background: '#fff',
    color: '#6B6B6B',
    border: '1px solid #E5E5E5',
    borderRadius: 6,
    fontSize: 12,
    cursor: 'pointer',
    whiteSpace: 'nowrap' as const,
  } as CSSProperties,

  // ─── Inputs ─────────────────────────────────────────────
  input: {
    width: '100%',
    height: 36,
    padding: '0 12px',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    fontSize: 13,
    color: '#1A1A1A',
    background: '#fff',
    outline: 'none',
    boxSizing: 'border-box' as const,
  } as CSSProperties,

  textarea: {
    width: '100%',
    padding: 12,
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    fontSize: 13,
    color: '#1A1A1A',
    background: '#fff',
    outline: 'none',
    resize: 'vertical' as const,
    minHeight: 80,
    lineHeight: 1.5,
    boxSizing: 'border-box' as const,
  } as CSSProperties,

  select: {
    height: 36,
    padding: '0 12px',
    border: '1px solid #E5E5E5',
    borderRadius: 8,
    fontSize: 13,
    color: '#1A1A1A',
    background: '#fff',
    outline: 'none',
    cursor: 'pointer',
    boxSizing: 'border-box' as const,
  } as CSSProperties,

  // ─── Tabs ───────────────────────────────────────────────
  tab: {
    padding: '8px 16px',
    fontSize: 13,
    color: '#9B9B9B',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid transparent',
    cursor: 'pointer',
    fontWeight: 500,
    transition: 'color 0.15s, border-color 0.15s',
  } as CSSProperties,

  tabActive: {
    padding: '8px 16px',
    fontSize: 13,
    color: '#1A1A1A',
    background: 'transparent',
    border: 'none',
    borderBottom: '2px solid #1A1A1A',
    cursor: 'pointer',
    fontWeight: 600,
  } as CSSProperties,

  // ─── Badge ──────────────────────────────────────────────
  badge: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 10,
    background: '#F5F5F5',
    fontSize: 11,
    color: '#6B6B6B',
    fontWeight: 500,
  } as CSSProperties,

  badgeSuccess: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 10,
    background: '#F0FFF4',
    fontSize: 11,
    color: '#38A169',
    fontWeight: 500,
  } as CSSProperties,

  badgeDanger: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 10,
    background: '#FFF5F5',
    fontSize: 11,
    color: '#E53E3E',
    fontWeight: 500,
  } as CSSProperties,

  badgeWarning: {
    display: 'inline-flex',
    alignItems: 'center',
    padding: '2px 8px',
    borderRadius: 10,
    background: '#FFFFF0',
    fontSize: 11,
    color: '#D69E2E',
    fontWeight: 500,
  } as CSSProperties,

  // ─── Empty State ────────────────────────────────────────
  emptyState: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    justifyContent: 'center',
    padding: '48px 24px',
    textAlign: 'center' as const,
  } as CSSProperties,

  emptyEmoji: {
    fontSize: 48,
    marginBottom: 12,
  } as CSSProperties,

  emptyTitle: {
    fontSize: 16,
    fontWeight: 600,
    color: '#1A1A1A',
    marginBottom: 6,
  } as CSSProperties,

  emptyDesc: {
    fontSize: 13,
    color: '#9B9B9B',
    marginBottom: 20,
    maxWidth: 320,
    lineHeight: 1.5,
  } as CSSProperties,

  // ─── Modal/SlideOver ────────────────────────────────────
  overlay: {
    position: 'fixed' as const,
    inset: 0,
    background: 'rgba(0,0,0,0.3)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  } as CSSProperties,

  modal: {
    background: '#fff',
    borderRadius: 12,
    padding: 24,
    maxWidth: 480,
    width: '90%',
    maxHeight: '80vh',
    overflow: 'auto',
    boxShadow: '0 8px 30px rgba(0,0,0,0.12)',
  } as CSSProperties,

  // ─── Divider ────────────────────────────────────────────
  divider: {
    height: 1,
    background: '#E5E5E5',
    margin: '16px 0',
    border: 'none',
  } as CSSProperties,

  // ─── Stat Card ──────────────────────────────────────────
  statValue: {
    fontSize: 28,
    fontWeight: 700,
    color: '#1A1A1A',
    lineHeight: 1,
  } as CSSProperties,

  statLabel: {
    fontSize: 12,
    color: '#9B9B9B',
    marginTop: 4,
  } as CSSProperties,

  // ─── Help Bubble ──────────────────────────────────────
  helpBubble: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: 18,
    height: 18,
    borderRadius: '50%',
    border: '1px solid #E5E5E5',
    color: '#9B9B9B',
    fontSize: 11,
    cursor: 'pointer',
    marginLeft: 6,
    position: 'relative' as const,
  } as CSSProperties,
};

// ─── Layout Helpers ───────────────────────────────────────

export function pageContainer(isMobile: boolean): CSSProperties {
  return {
    padding: isMobile ? '10px 8px' : 28,
    maxWidth: 1100,
    margin: '0 auto',
    minHeight: '100vh',
    background: CU.bg,
  };
}

export function headerRow(isMobile = false): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 6 : 10,
    marginBottom: isMobile ? 2 : 4,
  };
}

export function emojiIcon(size = 24): CSSProperties {
  return {
    fontSize: size,
    lineHeight: 1,
    flexShrink: 0,
  };
}

export function cardGrid(isMobile: boolean, cols = 3): CSSProperties {
  return {
    display: 'grid',
    gridTemplateColumns: isMobile ? '1fr' : `repeat(${cols}, 1fr)`,
    gap: isMobile ? 6 : 12,
  };
}

export function toolbar(isMobile = false): CSSProperties {
  return {
    display: 'flex',
    alignItems: 'center',
    gap: isMobile ? 6 : 8,
    flexWrap: 'wrap' as const,
    marginBottom: isMobile ? 10 : 16,
  };
}

export function tabBar(isMobile = false): CSSProperties {
  return {
    display: 'flex',
    gap: 0,
    borderBottom: '1px solid #E5E5E5',
    marginBottom: isMobile ? 12 : 20,
    overflowX: 'auto' as const,
  };
}

export function searchInput(isMobile: boolean): CSSProperties {
  return {
    ...CU.input,
    maxWidth: isMobile ? '100%' : 280,
    flexShrink: 0,
  };
}

// ─── Mobile Compact Helpers ──────────────────────────────────
// Use these to get tighter values on mobile (Notion-style density)

/** Page title style — smaller on mobile */
export function pageTitleStyle(isMobile: boolean): CSSProperties {
  return {
    ...CU.pageTitle,
    fontSize: isMobile ? 17 : 20,
  };
}

/** Section title style — tighter on mobile */
export function sectionTitleStyle(isMobile: boolean): CSSProperties {
  return {
    ...CU.sectionTitle,
    fontSize: isMobile ? 13 : 15,
  };
}

/** Card style — less padding on mobile */
export function cardStyle(isMobile: boolean): CSSProperties {
  return {
    ...CU.card,
    padding: isMobile ? '10px 10px' : '14px 16px',
  };
}

/** Empty state — compact on mobile */
export function emptyStateStyle(isMobile: boolean): CSSProperties {
  return {
    ...CU.emptyState,
    padding: isMobile ? '24px 12px' : '48px 24px',
  };
}

/** Empty emoji — smaller on mobile */
export function emptyEmojiStyle(isMobile: boolean): CSSProperties {
  return {
    ...CU.emptyEmoji,
    fontSize: isMobile ? 32 : 48,
    marginBottom: isMobile ? 8 : 12,
  };
}
