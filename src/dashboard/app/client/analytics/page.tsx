'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, tabBar } from '../../../lib/page-styles';
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
      <div style={{ ...CU.emptyState, minHeight: 400 }}>
        <div style={CU.emptyEmoji}>📊</div>
        <div style={{ fontSize: 13, color: CU.textMuted }}>Chargement des analytics...</div>
      </div>
    );
  }

  return (
    <div className="client-page-scrollable" style={{ ...pageContainer(isMobile), maxWidth: 1000 }}>
      {/* Page Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.analytics.emoji}</span>
          <div style={{ flex: 1 }}>
            <h1 style={CU.pageTitle}>{PAGE_META.analytics.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.analytics.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.analytics.helpText} />
        </div>
      </div>
      <PageExplanation pageId="analytics" text={PAGE_META.analytics?.helpText} />

      {/* Period selector */}
      <div style={tabBar()}>
        {PERIOD_OPTIONS.map(p => (
          <button
            key={p.days}
            onClick={() => setPeriod(p.days)}
            style={period === p.days ? CU.tabActive : CU.tab}
          >
            {p.label}
          </button>
        ))}
      </div>

      {error && (
        <div style={{
          ...CU.card, marginBottom: 20,
          borderLeft: `3px solid ${CU.danger}`, color: CU.danger, fontSize: 13,
        }}>
          {error}
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fit, minmax(${isMobile ? '130px' : '180px'}, 1fr))`, gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Tokens consommés', value: totalTokens >= 1000000 ? `${(totalTokens / 1000000).toFixed(1)}M` : totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(0)}k` : String(totalTokens), icon: '🔤' },
          { label: 'Requêtes', value: totalRequests.toLocaleString('fr-FR'), icon: '📨' },
          { label: 'Coût total', value: `${(totalCost / 1_000_000).toFixed(2)} cr`, icon: '💰' },
          { label: 'Modèle principal', value: topModel ? getModelLabel(topModel.model).split(' ').slice(1).join(' ').slice(0, 20) : '—', icon: '🤖' },
        ].map(s => (
          <div key={s.label} style={{ ...CU.card, display: 'flex', flexDirection: 'column' as const, gap: 4 }}>
            <span style={emojiIcon(20)}>{s.icon}</span>
            <span style={{ ...CU.statValue, fontSize: isMobile ? 16 : 20, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</span>
            <span style={CU.statLabel}>{s.label}</span>
          </div>
        ))}
      </div>

      {totalRequests === 0 ? (
        <div style={CU.card}>
          <div style={CU.emptyState}>
            <div style={CU.emptyEmoji}>📊</div>
            <div style={CU.emptyTitle}>Aucune donnée sur cette période</div>
            <div style={CU.emptyDesc}>
              Utilisez vos agents pour voir apparaître les <span className="fz-logo-word">analytics</span> ici
            </div>
          </div>
        </div>
      ) : (
        <>
          {/* Daily chart */}
          {last30Days.length > 0 && (
            <div style={{ ...CU.card, padding: isMobile ? 12 : 24, marginBottom: 20, overflowX: 'auto' as const, WebkitOverflowScrolling: 'touch' as const }}>
              <h3 style={{ ...CU.sectionTitle, marginBottom: 16 }}>Activité quotidienne</h3>
              <ResponsiveContainer width="100%" height={isMobile ? 200 : 240}>
                <BarChart data={last30Days} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke={CU.border} />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: CU.textMuted }} />
                  <YAxis tick={{ fontSize: 10, fill: CU.textMuted }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Tokens" fill={CU.accent} radius={[3, 3, 0, 0]} />
                  <Bar dataKey="Requêtes" fill={CU.textMuted} radius={[3, 3, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 8, textAlign: 'center' }}>Tokens en milliers (k)</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 && !isMobile ? '1fr 1fr' : '1fr', gap: 16 }}>
            {/* Pie chart */}
            {pieData.length > 0 && (
              <div style={{ ...CU.card, padding: 24 }}>
                <h3 style={{ ...CU.sectionTitle, marginBottom: 16 }}>Répartition par modèle</h3>
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
            <div style={{ ...CU.card, padding: 24 }}>
              <h3 style={{ ...CU.sectionTitle, marginBottom: 16 }}>Détail par modèle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {usageByModel.map((m, i) => (
                  <div key={m.model} style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '8px 10px', borderRadius: 8,
                    background: CU.bgSecondary,
                    transition: 'background 0.15s',
                  }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: PIE_COLORS[i % PIE_COLORS.length],
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: 4, color: CU.text }}>
                        <span style={{ fontSize: 14 }}>{getModelIcon(m.model)}</span> {getModelLabel(m.model)}
                      </div>
                      <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 1 }}>
                        {m.totalRequests} req · {(m.totalTokens / 1000).toFixed(0)}k tokens
                      </div>
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: CU.text, flexShrink: 0 }}>
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
