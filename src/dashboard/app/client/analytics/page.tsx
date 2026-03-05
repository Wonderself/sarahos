'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, PieChart, Pie, Cell, Legend,
} from 'recharts';

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

const PIE_COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#3b82f6', '#a855f7', '#ec4899', '#14b8a6'];

// Agent names mapping (models → agent names)
const MODEL_LABELS: Record<string, string> = {
  'claude-sonnet-4-6': '🤖 Claude Sonnet (agents L1/L2)',
  'claude-opus-4-6': '🧠 Claude Opus (DG / L3)',
  'claude-haiku-4-5-20251001': '⚡ Claude Haiku (tâches rapides)',
};

function getModelLabel(model: string) {
  return MODEL_LABELS[model] ?? model;
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
    name: getModelLabel(m.model).replace(/^[^\s]+ /, ''),
    value: Math.round(m.totalCost / 1000),
  })).filter(d => d.value > 0);

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 400, flexDirection: 'column', gap: 12 }}>
        <div style={{ fontSize: 40 }}>📊</div>
        <div className="text-md text-tertiary animate-pulse">Chargement des analytics...</div>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">📊 Analytics</h1>
          <p className="page-subtitle">Utilisation de vos agents — tokens, requêtes et coûts</p>
        </div>
        <div style={{ display: 'flex', gap: 6 }}>
          {PERIOD_OPTIONS.map(p => (
            <button
              key={p.days}
              onClick={() => setPeriod(p.days)}
              style={{
                padding: '7px 14px', borderRadius: 20, fontSize: 12, fontWeight: 600, cursor: 'pointer',
                border: period === p.days ? '1.5px solid var(--accent)' : '1.5px solid var(--border-primary)',
                background: period === p.days ? 'var(--accent)' : 'var(--bg-secondary)',
                color: period === p.days ? '#fff' : 'var(--text-primary)',
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {error && <div className="alert alert-danger" style={{ marginBottom: 20 }}>{error}</div>}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Tokens consommés', value: totalTokens >= 1000000 ? `${(totalTokens / 1000000).toFixed(1)}M` : totalTokens >= 1000 ? `${(totalTokens / 1000).toFixed(0)}k` : String(totalTokens), icon: '🔤', color: 'var(--accent)' },
          { label: 'Requêtes', value: totalRequests.toLocaleString('fr-FR'), icon: '📨', color: '#3b82f6' },
          { label: 'Coût total', value: `${(totalCost / 1_000_000).toFixed(2)} cr`, icon: '💰', color: '#f59e0b' },
          { label: 'Modèle principal', value: topModel ? getModelLabel(topModel.model).split(' ').slice(1).join(' ').slice(0, 20) : '—', icon: '🤖', color: '#22c55e' },
        ].map(s => (
          <div key={s.label} className="card" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 22, marginBottom: 6 }}>{s.icon}</div>
            <div style={{ fontSize: 18, fontWeight: 700, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{s.label}</div>
          </div>
        ))}
      </div>

      {totalRequests === 0 ? (
        <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>📊</div>
          <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8 }}>Aucune donnée sur cette période</div>
          <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            Utilisez vos agents pour voir apparaître les analytics ici
          </div>
        </div>
      ) : (
        <>
          {/* Daily chart */}
          {last30Days.length > 0 && (
            <div className="card" style={{ padding: 24, marginBottom: 20 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Activité quotidienne</h3>
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={last30Days} margin={{ top: 4, right: 4, left: 0, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <YAxis tick={{ fontSize: 10, fill: 'var(--text-tertiary)' }} />
                  <Tooltip />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  <Bar dataKey="Tokens" fill="var(--accent)" radius={[2, 2, 0, 0]} />
                  <Bar dataKey="Requêtes" fill="#22c55e" radius={[2, 2, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 8, textAlign: 'center' }}>Tokens en milliers (k)</div>
            </div>
          )}

          <div style={{ display: 'grid', gridTemplateColumns: pieData.length > 0 ? '1fr 1fr' : '1fr', gap: 20 }}>
            {/* Pie chart */}
            {pieData.length > 0 && (
              <div className="card" style={{ padding: 24 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Répartition par modèle</h3>
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
            <div className="card" style={{ padding: 24 }}>
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16 }}>Détail par modèle</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {usageByModel.map((m, i) => (
                  <div key={m.model} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                      width: 10, height: 10, borderRadius: '50%', flexShrink: 0,
                      background: PIE_COLORS[i % PIE_COLORS.length],
                    }} />
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 12, fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {getModelLabel(m.model)}
                      </div>
                      <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 1 }}>
                        {m.totalRequests} req · {(m.totalTokens / 1000).toFixed(0)}k tokens
                      </div>
                    </div>
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--accent)', flexShrink: 0 }}>
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
