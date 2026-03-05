import React from 'react';

// ── Shared Styles for User Detail Tabs ──

export const styles = {
  container: {
    maxWidth: 1200,
    margin: '0 auto',
  } as React.CSSProperties,
  backLink: {
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    color: 'var(--text-tertiary)',
    fontSize: 14,
    marginBottom: 16,
    cursor: 'pointer',
    textDecoration: 'none',
    transition: 'color 0.15s',
  } as React.CSSProperties,
  pageHeader: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 24,
    flexWrap: 'wrap' as const,
    gap: 12,
  } as React.CSSProperties,
  pageTitle: {
    fontSize: 24,
    fontWeight: 700,
    color: 'var(--text-primary)',
    margin: 0,
  } as React.CSSProperties,
  pageSubtitle: {
    fontSize: 14,
    color: 'var(--text-tertiary)',
    marginTop: 4,
  } as React.CSSProperties,
  tabBar: {
    display: 'flex',
    gap: 4,
    marginBottom: 24,
    overflowX: 'auto' as const,
    borderBottom: '1px solid var(--border-primary)',
    paddingBottom: 0,
  } as React.CSSProperties,
  tab: (active: boolean) => ({
    padding: '10px 18px',
    fontSize: 14,
    fontWeight: active ? 600 : 400,
    color: active ? '#fff' : 'var(--text-secondary)',
    background: active ? 'var(--accent)' : 'transparent',
    border: 'none',
    borderRadius: '8px 8px 0 0',
    cursor: 'pointer',
    transition: 'all 0.15s ease',
    whiteSpace: 'nowrap' as const,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
  } as React.CSSProperties),
  card: {
    background: 'var(--bg-secondary)',
    borderRadius: 12,
    padding: 20,
    border: '1px solid var(--border-primary)',
    marginBottom: 16,
  } as React.CSSProperties,
  cardTitle: {
    fontSize: 16,
    fontWeight: 600,
    marginBottom: 16,
    color: 'var(--text-primary)',
  } as React.CSSProperties,
  grid2: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  grid3: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  grid4: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
    gap: 16,
    marginBottom: 16,
  } as React.CSSProperties,
  kpiCard: {
    background: 'var(--bg-secondary)',
    borderRadius: 12,
    padding: 20,
    border: '1px solid var(--border-primary)',
    textAlign: 'center' as const,
  } as React.CSSProperties,
  kpiLabel: {
    fontSize: 12,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.05em',
    display: 'block',
    marginBottom: 6,
  } as React.CSSProperties,
  kpiValue: {
    fontSize: 28,
    fontWeight: 700,
    color: 'var(--text-primary)',
    display: 'block',
  } as React.CSSProperties,
  formGroup: {
    marginBottom: 16,
  } as React.CSSProperties,
  label: {
    display: 'block',
    fontSize: 13,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    marginBottom: 6,
  } as React.CSSProperties,
  input: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid var(--border-secondary)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    transition: 'border-color 0.15s',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  select: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 14,
    borderRadius: 8,
    border: '1px solid var(--border-secondary)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    cursor: 'pointer',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  textarea: {
    width: '100%',
    padding: '10px 14px',
    fontSize: 13,
    borderRadius: 8,
    border: '1px solid var(--border-secondary)',
    background: 'var(--bg-primary)',
    color: 'var(--text-primary)',
    outline: 'none',
    fontFamily: 'var(--font-mono)',
    minHeight: 200,
    resize: 'vertical' as const,
    lineHeight: 1.5,
  } as React.CSSProperties,
  btnPrimary: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    background: 'var(--accent)',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  btnDanger: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 600,
    color: '#fff',
    background: 'var(--danger)',
    border: 'none',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  btnSecondary: {
    padding: '10px 20px',
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-secondary)',
    background: 'var(--bg-tertiary)',
    border: '1px solid var(--border-secondary)',
    borderRadius: 8,
    cursor: 'pointer',
    transition: 'background 0.15s',
    fontFamily: 'inherit',
  } as React.CSSProperties,
  badge: (color: string) => ({
    display: 'inline-block',
    padding: '3px 10px',
    fontSize: 12,
    fontWeight: 600,
    borderRadius: 20,
    background: color,
    color: '#fff',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.03em',
  } as React.CSSProperties),
  toggle: (active: boolean) => ({
    width: 44,
    height: 24,
    borderRadius: 12,
    background: active ? 'var(--accent)' : 'var(--bg-tertiary)',
    border: `1px solid ${active ? 'var(--accent)' : 'var(--border-secondary)'}`,
    cursor: 'pointer',
    position: 'relative' as const,
    transition: 'all 0.2s ease',
    flexShrink: 0,
  } as React.CSSProperties),
  toggleDot: (active: boolean) => ({
    width: 18,
    height: 18,
    borderRadius: '50%',
    background: '#fff',
    position: 'absolute' as const,
    top: 2,
    left: active ? 22 : 2,
    transition: 'left 0.2s ease',
    boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
  } as React.CSSProperties),
  table: {
    width: '100%',
    borderCollapse: 'collapse' as const,
    fontSize: 14,
  } as React.CSSProperties,
  th: {
    textAlign: 'left' as const,
    padding: '10px 14px',
    fontSize: 12,
    fontWeight: 600,
    color: 'var(--text-muted)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
    borderBottom: '1px solid var(--border-primary)',
  } as React.CSSProperties,
  td: (index: number) => ({
    padding: '10px 14px',
    borderBottom: '1px solid var(--border-primary)',
    background: index % 2 === 0 ? 'transparent' : 'var(--bg-tertiary)',
    color: 'var(--text-primary)',
  } as React.CSSProperties),
  toast: (type: 'success' | 'error') => ({
    position: 'fixed' as const,
    bottom: 24,
    right: 24,
    padding: '14px 24px',
    borderRadius: 10,
    fontSize: 14,
    fontWeight: 500,
    color: '#fff',
    background: type === 'success' ? 'var(--success)' : 'var(--danger)',
    boxShadow: '0 4px 20px rgba(0,0,0,0.15)',
    zIndex: 9999,
    animation: 'fadeIn 0.3s ease',
    maxWidth: 400,
  } as React.CSSProperties),
  loadingSpinner: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 60,
    color: 'var(--text-muted)',
    fontSize: 15,
  } as React.CSSProperties,
  multiSelect: {
    display: 'flex',
    flexWrap: 'wrap' as const,
    gap: 6,
    padding: 8,
    borderRadius: 8,
    border: '1px solid var(--border-secondary)',
    background: 'var(--bg-primary)',
    maxHeight: 200,
    overflowY: 'auto' as const,
  } as React.CSSProperties,
  agentChip: (selected: boolean) => ({
    padding: '4px 10px',
    fontSize: 12,
    borderRadius: 16,
    border: `1px solid ${selected ? 'var(--accent)' : 'var(--border-secondary)'}`,
    background: selected ? 'var(--accent-muted)' : 'transparent',
    color: selected ? 'var(--accent)' : 'var(--text-secondary)',
    cursor: 'pointer',
    fontWeight: selected ? 600 : 400,
    transition: 'all 0.15s',
  } as React.CSSProperties),
  toggleRow: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid var(--border-primary)',
  } as React.CSSProperties,
  infoRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '8px 0',
    borderBottom: '1px solid var(--border-primary)',
  } as React.CSSProperties,
  infoLabel: {
    fontSize: 13,
    color: 'var(--text-tertiary)',
  } as React.CSSProperties,
  infoValue: {
    fontSize: 14,
    fontWeight: 500,
    color: 'var(--text-primary)',
  } as React.CSSProperties,
};

// ── Shared Constants ──

export const ROLES = ['admin', 'operator', 'viewer', 'system'];
export const TIERS = ['guest', 'demo', 'free', 'paid'];
export const LANGUAGES = ['fr', 'en', 'es', 'de', 'it', 'pt', 'ar', 'he'];
export const VOICES = ['alloy', 'echo', 'fable', 'onyx', 'nova', 'shimmer', 'sarah', 'emmanuel'];
export const CHANNELS = ['in_app', 'email', 'sms', 'whatsapp'];

export const ALL_AGENTS = [
  'fz-repondeur', 'fz-assistante', 'fz-commercial', 'fz-marketing',
  'fz-rh', 'fz-communication', 'fz-finance', 'fz-dev',
  'fz-juridique', 'fz-dg', 'fz-video', 'fz-photo',
  'fz-budget', 'fz-negociateur', 'fz-impots', 'fz-comptable',
  'fz-chasseur', 'fz-portfolio', 'fz-cv', 'fz-contradicteur',
  'fz-ecrivain', 'fz-cineaste', 'fz-coach', 'fz-deconnexion',
];

export const ROLE_COLORS: Record<string, string> = {
  admin: '#dc2626',
  system: '#9333ea',
  operator: '#d97706',
  viewer: '#6b7280',
};

export const TIER_COLORS: Record<string, string> = {
  paid: '#16a34a',
  free: '#2563eb',
  demo: '#d97706',
  guest: '#6b7280',
};

// ── Shared Types ──

export interface UserData {
  id: string;
  email: string;
  displayName: string;
  role: string;
  tier: string;
  isActive: boolean;
  dailyApiCalls: number;
  dailyApiLimit: number;
  activeAgents?: string[];
  demoExpiresAt?: string | null;
  createdAt: string;
  updatedAt?: string;
  lastLoginAt?: string | null;
  apiKey?: string;
  emailConfirmed?: boolean;
  userNumber?: number;
  commissionRate?: number;
  referralCode?: string | null;
  referredBy?: string | null;
  promoCodeUsed?: string | null;
}

export interface WalletData {
  wallet: {
    userId: string;
    balanceCredits: number;
    totalDeposited: number;
    totalSpent: number;
    autoTopupEnabled?: boolean;
    autoTopupThreshold?: number;
    autoTopupAmount?: number;
  };
  recentTransactions: Array<{
    id: string;
    type: string;
    amount: number;
    balanceAfter: number;
    description: string;
    createdAt: string;
    referenceType?: string;
  }>;
}

export interface PreferencesData {
  preferences: {
    darkMode?: boolean;
    compactMode?: boolean;
    language?: string;
    notifyEmail?: boolean;
    notifySms?: boolean;
    notifyWhatsapp?: boolean;
    notifyInApp?: boolean;
    notifyLowBalance?: boolean;
    notifyDailyReport?: boolean;
    notifyWeeklyReport?: boolean;
    voiceEnabled?: boolean;
    preferredVoice?: string;
    defaultAgent?: string;
  } | null;
}

export interface UsageData {
  usage: {
    totalRequests?: number;
    inputTokens?: number;
    outputTokens?: number;
    totalCost?: number;
    byModel?: Record<string, {
      requests: number;
      inputTokens: number;
      outputTokens: number;
      cost: number;
    }>;
  } | null;
}

export interface GamificationData {
  level?: number;
  xp?: number;
  streak?: number;
  achievements?: number;
  badges?: string[];
}

export type TabId = 'profil' | 'wallet' | 'preferences' | 'entreprise' | 'usage' | 'gamification' | 'notifications' | 'feature_flags' | 'danger';

// ── Shared Helper Components ──

export function Toggle({ value, onChange, disabled }: { value: boolean; onChange: (v: boolean) => void; disabled?: boolean }) {
  return (
    <div
      style={{ ...styles.toggle(value), opacity: disabled ? 0.5 : 1, pointerEvents: disabled ? 'none' : 'auto' }}
      onClick={() => onChange(!value)}
    >
      <div style={styles.toggleDot(value)} />
    </div>
  );
}

// ── Shared Helper Functions ──

export function formatCredits(microCredits: number): string {
  return (microCredits / 1_000_000).toFixed(2);
}

export function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '\u2014';
  return new Date(dateStr).toLocaleDateString('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}
