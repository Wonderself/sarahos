'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UsageByModel {
  model: string;
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
}

interface DailyUsage {
  date: string;
  totalTokens: number;
  totalCost: number;
  totalRequests: number;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const PERIOD_OPTIONS = [
  { label: '7 jours', days: 7 },
  { label: '30 jours', days: 30 },
  { label: '90 jours', days: 90 },
];

const PIE_COLORS = ['#1A1A1A', '#6B6B6B', '#9B9B9B', '#BFBFBF', '#4A4A4A', '#787878', '#A0A0A0', '#D0D0D0'];

// Agent names mapping (models → agent names)
const MODEL_LABELS: Record<string, { icon: string; label: string }> = {
  'claude-sonnet-4-6': { icon: '🤖', label: 'Claude Sonnet (agents L1/L2)' },
  'claude-opus-4-6': { icon: '🧠', label: 'Claude Opus (DG / L3)' },
  'claude-haiku-4-5-20251001': { icon: '⚡', label: 'Claude Haiku (tâches rapides)' },
};

function getModelLabel(model: string) {
  const entry = MODEL_LABELS[model];
  return entry ? entry.label : model;
}

function getModelIcon(model: string) {
  const entry = MODEL_LABELS[model];
  return entry ? entry.icon : '🤖';
}

// ── ClickUp-style tokens ──────────────────────────────────────────────────────
const CU = {
  card: {
    border: '1px solid #E5E5E5' as const,
    borderRadius: 8,
    background: '#fff',
  },
  sectionCard: {
    border: '1px solid #E5E5E5' as const,
    borderRadius: 8,
    padding: '16px 24px',
    background: '#fff',
  },
  statCard: {
    border: '1px solid #E5E5E5' as const,
    borderRadius: 8,
    padding: '16px 20px',
    background: '#fff',
    display: 'flex' as const,
    flexDirection: 'column' as const,
    gap: 4,
  },
  statValue: { fontSize: 20, fontWeight: 700 as const },
  statLabel: { fontSize: 12, color: '#9B9B9B' },
  btn: {
    height: 36,
    padding: '0 12px',
    borderRadius: 6,
    fontWeight: 500 as const,
    fontSize: 13,
    cursor: 'pointer' as const,
    border: '1px solid #E5E5E5' as const,
  },
};

// ─── API helper ───────────────────────────────────────────────────────────────

async function portalCall<T>(path: string, token: string): Promise<T> {
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token, method: 'GET' }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json() as Promise<T>;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const isMobile = useIsMobile();
  const [period, setPeriod] = useState(30);
  const [usageByModel, setUsageByModel] = useState<UsageByModel[]>([]);
  const [dailyUsage, setDailyUsage] = useState<DailyUsage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const load = useCallback(async () => {
    setLoading(true);
    setError('');
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      if (!session.token) { setError('Session invalide'); setLoading(false); return; }

      const endDate = new Date().toISOString().split('T')[0];
      const startDate = new Date(Date.now() - period * 86400000).toISOString().split('T')[0];

      const data = await portalCall<{
        byModel?: UsageByModel[];
        daily?: DailyUsage[];
        summary?: { totalTokens: number; totalCost: number; totalRequests: number };
      }>(`/billing/usage?startDate=${startDate}&endDate=${endDate}`, session.token);

      setUsageByModel(data.byModel ?? []);
      setDailyUsage(data.daily ?? []);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, [period]);

  useEffect(() => { load(); }, [load]);

  // Aggregates
  const totalTokens = usageByModel.reduce((s, m) => s + m.totalTokens, 0);
  const totalCost = usageByModel.reduce((s, m) => s + m.totalCost, 0);
  const totalRequests = usageByModel.reduce((s, m) => s + m.totalRequests, 0);
  const topModel = usageByModel.sort((a, b) => b.totalCost - a.totalCost)[0];

  // Chart data — last N days simplified
  const last30Days = dailyUsage
    .slice()
    .sort((a, b) => a.date.localeCompare(b.date))
    .map(d => ({
      date: new Date(d.date).toLocaleDateString('fr-FR', { month: 'short', day: 'numeric' }),
      Tokens: Math.round(d.totalTokens / 1000),
      Requêtes: d.totalRequests,
    }));

  // Pie data
  const pieData = usageByModel.map(m => ({
    name: getModelLabel(m.model),
    value: Math.round(m.totalCost / 1000),
  })).filter(d => d.value > 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>📊</div>
        <div style={{ fontSize: 13, color: '#9B9B9B' }}>Chargement des analytics...</div>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 22 }}>{PAGE_META.analytics.emoji}</span>
          <div style={{ flex: 1 }}>
            <h1 style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text)', margin: 0 }}>{PAGE_META.analytics.title}</h1>
            <p style={{ fontSize: 12, color: 'var(--fz-text-muted)', margin: '2px 0 0' }}>{PAGE_META.analytics.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.analytics.helpText} />
        </div>
      </div>
      <PageExplanation pageId="analytics" text={PAGE_META.analytics?.helpText} />

      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {PERIOD_OPTIONS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            style={{
              ...CU.btn,
              height: 32,
              fontSize: 12,
              fontWeight: 600,
              background: period === p.days ? 'var(--fz-accent, #0EA5E9)' : 'var(--fz-bg-secondary, #F8FAFC)',
              color: period === p.days ? '#fff' : 'var(--fz-text, #1E293B)',
              border: period === p.days ? 'none' : '1px solid #E5E5E5',
            }}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          ...CU.card, marginBottom: 20, padding: '12px 16px',
          borderLeft: '3px solid #ef4444', color: 'var(--danger)', fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '130px' : '180px'}, 1fr))`, gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Tokens consommés', value: totalTokens >= 1000000 ? `${(totalTokens / 1000000).toFixed(1)}M` : totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(0)}k` : String(totalTokens), icon: '🔤', color: '#1A1A1A' },
          { label: 'Requêtes', value: totalRequests.toLocaleString('fr-FR'), icon: '📨', color: '#1A1A1A' },
          { label: 'Coût total', value: `${(totalCost / 1_000_000).toFixed(2)} cr`, icon: '💰', color: '#1A1A1A' },
          { label: 'Modèle principal', value: topModel ? getModelLabel(topModel.model).split(' ').slice(1).join(' ').slice(0, 20) : '—', icon: '🤖', color: '#1A1A1A' },
        ].map(s => (
          <div key={s.label} style={CU.statCard}>
            <span style={{ fontSize: 20 }}>{s.icon}</span>
            <span style={{ ...CU.statValue, fontSize: isMobile ? 16 : 20, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</span>
            <span style={CU.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {totalRequests === 0 ? (
        <div style={{ ...CU.card, textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: '#1A1A1A' }}>Aucune donnée sur cette période</div>
          <div style={{ fontSize: 13, color: '#9B9B9B' }}>
            Utilisez vos agents pour voir apparaître les <span className="fz-logo-word">analytics</span> ici
          </div>
        </div>
      ) : (
        <>
          {/* Daily chart */}
          {last30Days.length > 0 && (
            <div style={{ ...CU.sectionCard, padding: isMobile ? 12 : 24, marginBottom: 20, overflowX: 'auto' as const, WebkitOverflowScrolling: 'touch' as const }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1A1A1A', margin: '0 0 16px' }}>Activité quotidienne</h3>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
                <BarChart data={last30Days} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#E5E5E5" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--fz-text-muted, #94A3B8)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--fz-text-muted, #94A3B8)' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Tokens" fill="#1A1A1A" radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Requêtes" fill="#9B9B9B" radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 8, textAlign: 'center' }}>Tokens en milliers (k)</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 && !isMobile ? '1fr 1fr' : '1fr', gap: 16 }}>
            {/* Pie chart */}
            {pieData.length > 0 && (
              <div style={{ ...CU.sectionCard, padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1A1A1A', margin: '0 0 16px' }}>Répartition par modèle</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ percent }: { percent?: number }) => `${((percent ?? 0) * 100).toFixed(0)}%`} labelLine={false}>
                      {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                    </Pie>
                    <Legend wrapperStyle={{ fontSize: 11 }} />
                    <Tooltip formatter={(v: number | undefined) => `${v ?? 0} credits`} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* Table by model */}
            <div style={{ ...CU.sectionCard, padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: '#1A1A1A', margin: '0 0 16px' }}>Détail par modèle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {usageByModel.map((m, i) => (
                  <div key={m.model} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 10px', borderRadius: 6,
                    background: '#F7F7F7',
                    transition: 'background 0.15s',
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: PIE_COLORS[i % PIE_COLORS.length],
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, color: '#1A1A1A' }}>
                        <span style={{ fontSize: 14 }}>{getModelIcon(m.model)}</span> {getModelLabel(m.model)}
                      </div>
                      <div style={{ fontSize: 11, color: '#9B9B9B', marginTop: 1 }}>
                        {m.totalRequests} req · {(m.totalTokens / 1000).toFixed(0)}k tokens
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', flexShrink: 0 }}>
                      {(m.totalCost / 1_000_000).toFixed(3)} cr
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
