'use client';

import { type CSSProperties } from 'react';

// ─── Notion Palette ───────────────────────────────────────────
const C = {
  text: '#1A1A1A',
  secondary: '#6B6B6B',
  muted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  accent: '#0EA5E9',
  success: '#38A169',
  warning: '#D69E2E',
  danger: '#DC2626',
} as const;

// ─── Types ────────────────────────────────────────────────────
interface CreditPool {
  total: number;
  used: number;
  remaining: number;
}

interface UsageByMember {
  id: string;
  name: string;
  usage: number;
}

interface CreditPoolManagerProps {
  pool: CreditPool;
  usageByMember: UsageByMember[];
  userRole: 'viewer' | 'member' | 'admin' | 'owner';
  onRecharge?: () => void;
}

// ─── Helpers ──────────────────────────────────────────────────
function formatCredits(n: number): string {
  if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
  return String(n);
}

function getUsageColor(percent: number): string {
  if (percent > 90) return C.danger;
  if (percent > 70) return C.warning;
  return C.accent;
}

// ─── Styles ───────────────────────────────────────────────────
const styles: Record<string, CSSProperties> = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: 20,
  },
  card: {
    background: C.bg,
    border: `1px solid ${C.border}`,
    borderRadius: 8,
    padding: '16px 20px',
  },
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: 600,
    color: C.text,
    margin: 0,
  },
  subtitle: {
    fontSize: 12,
    color: C.muted,
    marginTop: 2,
  },
  rechargeBtn: {
    height: 32,
    padding: '0 14px',
    background: C.accent,
    color: '#fff',
    border: 'none',
    borderRadius: 6,
    fontSize: 12,
    fontWeight: 500,
    cursor: 'pointer',
    transition: 'opacity 0.15s',
    whiteSpace: 'nowrap',
  },
  statsRow: {
    display: 'flex',
    gap: 24,
    marginBottom: 16,
  },
  stat: {
    flex: 1,
  },
  statValue: {
    fontSize: 24,
    fontWeight: 700,
    color: C.text,
    lineHeight: 1,
  },
  statLabel: {
    fontSize: 11,
    color: C.muted,
    marginTop: 4,
    textTransform: 'uppercase',
    letterSpacing: '0.3px',
  },
  progressContainer: {
    width: '100%',
    height: 8,
    background: C.bgSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 6,
  },
  progressBar: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.4s ease',
  },
  progressLabel: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: 11,
    color: C.muted,
  },
  chartTitle: {
    fontSize: 13,
    fontWeight: 600,
    color: C.text,
    marginBottom: 12,
  },
  barRow: {
    display: 'flex',
    alignItems: 'center',
    gap: 10,
    marginBottom: 8,
  },
  barLabel: {
    width: 100,
    fontSize: 12,
    color: C.secondary,
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    whiteSpace: 'nowrap',
    flexShrink: 0,
  },
  barTrack: {
    flex: 1,
    height: 16,
    background: C.bgSecondary,
    borderRadius: 4,
    overflow: 'hidden',
    position: 'relative',
  },
  barFill: {
    height: '100%',
    borderRadius: 4,
    transition: 'width 0.4s ease',
    minWidth: 2,
  },
  barValue: {
    width: 60,
    fontSize: 12,
    color: C.muted,
    textAlign: 'right',
    flexShrink: 0,
  },
  emptyChart: {
    textAlign: 'center',
    padding: '24px 0',
    fontSize: 13,
    color: C.muted,
  },
};

// ─── Component ────────────────────────────────────────────────
export default function CreditPoolManager({
  pool,
  usageByMember,
  userRole,
  onRecharge,
}: CreditPoolManagerProps) {
  const usagePercent = pool.total > 0 ? Math.round((pool.used / pool.total) * 100) : 0;
  const usageColor = getUsageColor(usagePercent);
  const maxMemberUsage = Math.max(...usageByMember.map(m => m.usage), 1);
  const sortedMembers = [...usageByMember].sort((a, b) => b.usage - a.usage);

  return (
    <div style={styles.container}>
      {/* Pool Overview */}
      <div style={styles.card}>
        <div style={styles.header}>
          <div>
            <h3 style={styles.title}>Pool de credits</h3>
            <div style={styles.subtitle}>Consommation globale de l&apos;organisation</div>
          </div>
          {userRole === 'owner' && onRecharge && (
            <button style={styles.rechargeBtn} onClick={onRecharge}>
              Recharger
            </button>
          )}
        </div>

        <div style={styles.statsRow}>
          <div style={styles.stat}>
            <div style={styles.statValue}>{formatCredits(pool.total)}</div>
            <div style={styles.statLabel}>Total</div>
          </div>
          <div style={styles.stat}>
            <div style={{ ...styles.statValue, color: usageColor }}>
              {formatCredits(pool.used)}
            </div>
            <div style={styles.statLabel}>Utilises</div>
          </div>
          <div style={styles.stat}>
            <div style={{ ...styles.statValue, color: C.success }}>
              {formatCredits(pool.remaining)}
            </div>
            <div style={styles.statLabel}>Restants</div>
          </div>
        </div>

        <div style={styles.progressContainer}>
          <div
            style={{
              ...styles.progressBar,
              width: `${Math.min(usagePercent, 100)}%`,
              background: usageColor,
            }}
          />
        </div>
        <div style={styles.progressLabel}>
          <span>{usagePercent}% utilise</span>
          <span>{formatCredits(pool.remaining)} restants</span>
        </div>
      </div>

      {/* Usage by Member Chart */}
      <div style={styles.card}>
        <div style={styles.chartTitle}>Consommation par membre (30 derniers jours)</div>
        {sortedMembers.length === 0 ? (
          <div style={styles.emptyChart}>Aucune consommation enregistree.</div>
        ) : (
          sortedMembers.map(member => {
            const barPercent = Math.round((member.usage / maxMemberUsage) * 100);
            return (
              <div key={member.id} style={styles.barRow}>
                <div style={styles.barLabel} title={member.name}>
                  {member.name}
                </div>
                <div style={styles.barTrack}>
                  <div
                    style={{
                      ...styles.barFill,
                      width: `${barPercent}%`,
                      background: C.accent,
                    }}
                  />
                </div>
                <div style={styles.barValue}>{formatCredits(member.usage)} cr</div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
