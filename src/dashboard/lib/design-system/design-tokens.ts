/**
 * Design Tokens — Freenzy.io Design System v1.0
 * Single source of truth for ALL visual constants.
 * Import: import { DESIGN_TOKENS, getProfileColor, getSemanticColor } from '@/lib/design-system';
 */

export const DESIGN_TOKENS = {
  // ─── Colors ──────────────────────────────────────────────────
  colors: {
    text: {
      primary: '#1A1A1A',
      secondary: '#6B6B6B',
      muted: '#9B9B9B',
      inverse: '#FFFFFF',
    },
    bg: {
      primary: '#FFFFFF',
      secondary: '#FAFAFA',
      tertiary: '#F5F5F5',
      hover: '#F0F0F0',
    },
    border: {
      primary: '#E5E5E5',
      secondary: '#D4D4D4',
      active: '#1A1A1A',
    },
    accent: {
      primary: '#0EA5E9',
      hover: '#0284C7',
      light: 'rgba(14,165,233,0.08)',
      text: '#0284C7',
    },
    semantic: {
      success: { bg: '#ECFDF5', text: '#059669', border: '#A7F3D0' },
      warning: { bg: '#FFFBEB', text: '#D97706', border: '#FDE68A' },
      danger: { bg: '#FEF2F2', text: '#DC2626', border: '#FECACA' },
      info: { bg: '#EFF6FF', text: '#2563EB', border: '#BFDBFE' },
    },
    brand: {
      gradient: 'linear-gradient(135deg, #0EA5E9, #06b6d4)',
    },
    profiles: {
      artisan: '#D97706',
      sante: '#0EA5E9',
      agence: '#8B5CF6',
      ecommerce: '#059669',
      coach: '#EC4899',
      restaurant: '#EF4444',
      liberal: '#64748B',
      pme: '#2563EB',
      immo: '#15803D',
      particulier: '#0EA5E9',
      autre: '#6B7280',
    },
  },

  // ─── Typography ──────────────────────────────────────────────
  typography: {
    fontFamily:
      "'Inter', -apple-system, BlinkMacSystemFont, 'SF Pro Display', 'Segoe UI', sans-serif",
    sizes: {
      xs: 11,
      sm: 12,
      md: 13,
      base: 14,
      lg: 16,
      xl: 18,
      '2xl': 20,
      '3xl': 24,
    },
    weights: {
      normal: 400,
      medium: 500,
      semibold: 600,
      bold: 700,
    },
    lineHeights: {
      tight: 1.2,
      normal: 1.5,
      relaxed: 1.7,
    },
  },

  // ─── Spacing ─────────────────────────────────────────────────
  spacing: {
    xs: 4,
    sm: 8,
    md: 12,
    lg: 16,
    xl: 20,
    '2xl': 24,
    '3xl': 32,
  },

  // ─── Border Radius ──────────────────────────────────────────
  radius: {
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },

  // ─── Shadows ─────────────────────────────────────────────────
  shadows: {
    sm: '0 1px 2px rgba(0,0,0,0.03)',
    md: '0 2px 8px rgba(0,0,0,0.05)',
    lg: '0 4px 16px rgba(0,0,0,0.07)',
    glow: '0 0 0 1px rgba(14,165,233,0.08)',
  },

  // ─── Z-index ─────────────────────────────────────────────────
  zIndex: {
    dropdown: 50,
    sticky: 55,
    modal: 100,
    toast: 110,
    tooltip: 120,
  },

  // ─── Breakpoints ─────────────────────────────────────────────
  breakpoints: {
    sm: 480,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1440,
  },

  // ─── Transitions ─────────────────────────────────────────────
  transitions: {
    fast: '0.15s ease',
    normal: '0.25s ease',
    slow: '0.4s ease',
  },

  // ─── Component Presets ───────────────────────────────────────
  components: {
    card: {
      background: '#FFFFFF',
      border: '1px solid #E5E5E5',
      borderRadius: 8,
      padding: '14px 16px',
    },
    button: {
      primary: {
        bg: '#1A1A1A',
        color: '#FFFFFF',
        height: 36,
        borderRadius: 8,
        fontWeight: 500,
      },
      ghost: {
        bg: '#FFFFFF',
        color: '#6B6B6B',
        border: '1px solid #E5E5E5',
        height: 36,
        borderRadius: 8,
      },
    },
    input: {
      height: 36,
      border: '1px solid #E5E5E5',
      borderRadius: 8,
      fontSize: 13,
      padding: '0 12px',
    },
    badge: {
      padding: '2px 8px',
      borderRadius: 10,
      fontSize: 11,
      fontWeight: 500,
    },
    avatar: {
      sizes: { sm: 24, md: 32, lg: 40, xl: 56 },
    },
  },
} as const;

export type DesignTokens = typeof DESIGN_TOKENS;

// ─── Helpers ───────────────────────────────────────────────────

/** Get the accent color for a given profession/profile key */
export function getProfileColor(profession: string): string {
  const key = profession.toLowerCase().replace(/[^a-z]/g, '') as keyof typeof DESIGN_TOKENS.colors.profiles;
  return DESIGN_TOKENS.colors.profiles[key] ?? DESIGN_TOKENS.colors.profiles.autre;
}

/** Get semantic color set (bg, text, border) for a status type */
export function getSemanticColor(
  type: 'success' | 'warning' | 'danger' | 'info',
): { bg: string; text: string; border: string } {
  return DESIGN_TOKENS.colors.semantic[type];
}

/** Generate CSS custom properties from all tokens */
export function exportTokensCSS(): string {
  const lines: string[] = [':root {'];

  // Colors — text
  for (const [k, v] of Object.entries(DESIGN_TOKENS.colors.text)) {
    lines.push(`  --color-text-${k}: ${v};`);
  }
  // Colors — bg
  for (const [k, v] of Object.entries(DESIGN_TOKENS.colors.bg)) {
    lines.push(`  --color-bg-${k}: ${v};`);
  }
  // Colors — border
  for (const [k, v] of Object.entries(DESIGN_TOKENS.colors.border)) {
    lines.push(`  --color-border-${k}: ${v};`);
  }
  // Colors — accent
  for (const [k, v] of Object.entries(DESIGN_TOKENS.colors.accent)) {
    lines.push(`  --color-accent-${k}: ${v};`);
  }
  // Colors — semantic
  for (const [sKey, sVal] of Object.entries(DESIGN_TOKENS.colors.semantic)) {
    for (const [prop, val] of Object.entries(sVal)) {
      lines.push(`  --color-${sKey}-${prop}: ${val};`);
    }
  }
  // Colors — brand
  lines.push(`  --color-brand-gradient: ${DESIGN_TOKENS.colors.brand.gradient};`);
  // Colors — profiles
  for (const [k, v] of Object.entries(DESIGN_TOKENS.colors.profiles)) {
    lines.push(`  --color-profile-${k}: ${v};`);
  }

  // Typography
  lines.push(`  --font-family: ${DESIGN_TOKENS.typography.fontFamily};`);
  for (const [k, v] of Object.entries(DESIGN_TOKENS.typography.sizes)) {
    lines.push(`  --font-size-${k}: ${v}px;`);
  }
  for (const [k, v] of Object.entries(DESIGN_TOKENS.typography.weights)) {
    lines.push(`  --font-weight-${k}: ${v};`);
  }
  for (const [k, v] of Object.entries(DESIGN_TOKENS.typography.lineHeights)) {
    lines.push(`  --line-height-${k}: ${v};`);
  }

  // Spacing
  for (const [k, v] of Object.entries(DESIGN_TOKENS.spacing)) {
    lines.push(`  --spacing-${k}: ${v}px;`);
  }

  // Radius
  for (const [k, v] of Object.entries(DESIGN_TOKENS.radius)) {
    lines.push(`  --radius-${k}: ${v}px;`);
  }

  // Shadows
  for (const [k, v] of Object.entries(DESIGN_TOKENS.shadows)) {
    lines.push(`  --shadow-${k}: ${v};`);
  }

  // Z-index
  for (const [k, v] of Object.entries(DESIGN_TOKENS.zIndex)) {
    lines.push(`  --z-${k}: ${v};`);
  }

  // Breakpoints
  for (const [k, v] of Object.entries(DESIGN_TOKENS.breakpoints)) {
    lines.push(`  --breakpoint-${k}: ${v}px;`);
  }

  // Transitions
  for (const [k, v] of Object.entries(DESIGN_TOKENS.transitions)) {
    lines.push(`  --transition-${k}: ${v};`);
  }

  lines.push('}');
  return lines.join('\n');
}

/** Export all tokens as formatted JSON */
export function exportTokensJSON(): string {
  return JSON.stringify(DESIGN_TOKENS, null, 2);
}
