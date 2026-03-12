'use client';

import { useState, useEffect } from 'react';
import { RevenueAreaChart, UserGrowthBarChart, TierDonutChart, LLMCostStackedBar, TopClientsTable, DateRangePicker } from '../../AdminCharts';
import { getToken, API_BASE } from '@/lib/client-fetch';

type Period = '7d' | '30d' | '90d';

async function fetchWithToken<T>(path: string): Promise<T | null> {
  try {
    const res = await fetch(`${API_BASE}${path}`, {
      headers: { Authorization: `Bearer ${getToken()}` },
      cache: 'no-store',
    });
    if (!res.ok) return null;
    return res.json() as Promise<T>;
  } catch { return null; }
}

export default function AnalyticsHubPage() {
  const [period, setPeriod] = useState<Period>('30d');
  const [revenue, setRevenue] = useState<Array<{ date: string; revenue: number; cost: number; margin: number }>>([]);
  const [growth, setGrowth] = useState<Array<{ date: string; newUsers: number }>>([]);
  const [topClients, setTopClients] = useState<Array<{
    id: string; email: string; displayName: string; tier: string;
    totalDeposited: number; totalSpent: number; balance: number;
  }>>([]);
  const [billingStats, setBillingStats] = useState<Record<string, unknown> | null>(null);
  const [tokenUsage, setTokenUsage] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Load static data once
  useEffect(() => {
    Promise.all([
      fetchWithToken<typeof topClients>('/analytics/top-clients?limit=10'),
      fetchWithToken<Record<string, unknown>>('/billing/admin/stats'),
      fetchWithToken<Record<string, unknown>>('/tokens/usage'),
    ]).then(([tc, bs, tu]) => {
      if (tc) setTopClients(tc);
      if (bs) setBillingStats((bs?.['stats'] as Record<string, unknown>) ?? bs);
      if (tu) setTokenUsage(tu);
    }).catch(() => setError('Impossible de charger les statistiques'));
  }, []);

  // Load period-dependent data
  useEffect(() => {
    setLoading(true);
    setError(null);
    Promise.all([
      fetchWithToken<typeof revenue>(`/analytics/revenue-trend?period=${period}`),
      fetchWithToken<typeof growth>(`/analytics/user-growth?period=${period}`),
    ]).then(([rev, grow]) => {
      setRevenue(rev ?? []);
      setGrowth(grow ?? []);
    }).catch(() => setError('Impossible de charger les données de la période')).finally(() => setLoading(false));
  }, [period]);

  // Build tier data from billing stats
  const tierData = billingStats ? [
    { name: 'Paid', value: Number(billingStats['paidUsers'] ?? billingStats['paid'] ?? 0) },
    { name: 'Free', value: Number(billingStats['freeUsers'] ?? billingStats['free'] ?? 0) },
    { name: 'Demo', value: Number(billingStats['demoUsers'] ?? billingStats['demo'] ?? 0) },
    { name: 'Guest', value: Number(billingStats['guestUsers'] ?? billingStats['guest'] ?? 0) },
  ].filter(d => d.value > 0) : [];

  // Build LLM cost data
  const llmData = tokenUsage?.['byModel']
    ? Object.entries(tokenUsage['byModel'] as Record<string, number>).map(([model, tokens]) => ({
        model: model.charAt(0).toUpperCase() + model.slice(1),
        cost: tokens * 3,       // approximate micro-credits per token
        billed: tokens * 3.75,
        margin: tokens * 0.75,
      }))
    : [];

  return (
    <div className="admin-page-scrollable">
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Analytics</h1>
          <p className="page-subtitle">Vue complète des métriques business Freenzy.io</p>
        </div>
        <div className="page-actions">
          <DateRangePicker value={period} onChange={setPeriod} />
        </div>
      </div>

      {error && <div className="alert alert-danger">{error}</div>}

      {/* ── Revenue + Growth ── */}
      <div className="grid-2 section">
        <div className="card" style={{ padding: 16 }}>
          <div className="text-md font-bold mb-12">Revenus & Marge ({period})</div>
          {loading
            ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
            : <RevenueAreaChart data={revenue} />
          }
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="text-md font-bold mb-12">Nouveaux utilisateurs ({period})</div>
          {loading
            ? <div className="skeleton" style={{ height: 200, borderRadius: 8 }} />
            : <UserGrowthBarChart data={growth} />
          }
        </div>
      </div>

      {/* ── Tier donut + LLM cost ── */}
      <div className="grid-2 section">
        <div className="card" style={{ padding: 16 }}>
          <div className="text-md font-bold mb-12">Répartition par tier</div>
          <TierDonutChart data={tierData} />
        </div>
        <div className="card" style={{ padding: 16 }}>
          <div className="text-md font-bold mb-12">Coût LLM par modèle</div>
          <LLMCostStackedBar data={llmData} />
        </div>
      </div>

      {/* ── Top clients ── */}
      <div className="section">
        <div className="section-title">Top 10 Clients par dépense</div>
        <div className="card" style={{ padding: 16 }}>
          <TopClientsTable clients={topClients} />
        </div>
      </div>

      {/* ── Quick links to sub-analytics ── */}
      <div className="section">
        <div className="section-title">Analytics par service</div>
        <div className="grid-3">
          {[
            { href: '/admin/analytics/studio', icon: '🎬', label: 'Studio Creatif', desc: 'Videos + Photos generees' },
            { href: '/admin/analytics/voice', icon: '🎙️', label: 'Voix & Visio', desc: 'TTS, STT, Sessions visio' },
            { href: '/admin/analytics/documents', icon: '📄', label: 'Documents', desc: 'Uploads & analyse de docs' },
          ].map(item => (
            <a key={item.href} href={item.href} className="card" style={{ textDecoration: 'none', color: 'inherit', display: 'block', padding: 16 }}>
              <div style={{ marginBottom: 8 }}>{item.icon}</div>
              <div className="text-md font-semibold">{item.label}</div>
              <div className="text-xs text-muted" style={{ marginTop: 4 }}>{item.desc}</div>
            </a>
          ))}
        </div>
      </div>
    </div>
  );
}
