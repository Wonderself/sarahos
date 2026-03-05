'use client';

import { useState, useEffect } from 'react';
import {
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell,
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
} from 'recharts';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

const COLORS = ['#6366f1', '#22c55e', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];
const TOOLTIP_STYLE = { fontSize: 11, borderRadius: 8, border: '1px solid var(--border-primary)', background: '#fff' };

type RevenuePoint = { date: string; revenue: number; cost: number; margin: number };
type GrowthPoint = { date: string; newUsers: number };
type TierEntry = { tier: string; count: number };
type TopClient = { id: string; email: string; displayName: string; tier: string; totalSpent: number };

function fmt(n: number) { return (n / 1_000_000).toFixed(2); }

export default function BillingCharts({ tierData }: { tierData?: TierEntry[] }) {
  const [period, setPeriod] = useState<'7d' | '30d' | '90d'>('30d');
  const [revenue, setRevenue] = useState<RevenuePoint[]>([]);
  const [growth, setGrowth] = useState<GrowthPoint[]>([]);
  const [topClients, setTopClients] = useState<TopClient[]>([]);
  const [loading, setLoading] = useState(true);

  async function load(p: string) {
    setLoading(true);
    const h = { Authorization: `Bearer ${getToken()}` };
    try {
      const [r, g, t] = await Promise.all([
        fetch(`${API}/analytics/revenue-trend?period=${p}`, { headers: h }).then(r => r.json()),
        fetch(`${API}/analytics/user-growth?period=${p}`, { headers: h }).then(r => r.json()),
        fetch(`${API}/analytics/top-clients?limit=10`, { headers: h }).then(r => r.json()),
      ]);
      setRevenue(r as RevenuePoint[]);
      setGrowth(g as GrowthPoint[]);
      setTopClients((t as TopClient[]).slice(0, 10));
    } catch { /* empty */ }
    setLoading(false);
  }

  useEffect(() => { void load(period); }, [period]);

  // Tier distribution data
  const tierDist = tierData && tierData.length > 0 ? tierData : [
    { tier: 'free', count: 0 },
    { tier: 'pro', count: 0 },
    { tier: 'enterprise', count: 0 },
  ];

  // LLM Cost/Revenue/Margin stacked data from revenue timeline
  const costBarData = revenue.slice(-14).map(r => ({
    date: r.date.slice(5),
    Revenu: Number(fmt(r.revenue)),
    'Coût LLM': Number(fmt(r.cost)),
    Marge: Number(fmt(r.margin)),
  }));

  return (
    <div>
      {/* Period selector */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 20 }}>
        {(['7d', '30d', '90d'] as const).map(p => (
          <button
            key={p}
            onClick={() => { setPeriod(p); }}
            style={{
              padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: 'pointer',
              border: '1px solid var(--border-primary)',
              background: period === p ? 'var(--accent)' : 'var(--bg-secondary)',
              color: period === p ? '#fff' : 'var(--text-secondary)',
            }}
          >
            {p === '7d' ? '7 jours' : p === '30d' ? '30 jours' : '90 jours'}
          </button>
        ))}
        {loading && <span style={{ fontSize: 11, color: 'var(--text-muted)', alignSelf: 'center', marginLeft: 8 }}>Chargement…</span>}
      </div>

      {/* Row 1: Revenue area + User growth bar */}
      <div className="billing-charts-row">
        {/* Revenue Area Chart */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Revenus vs Coûts (credits)</div>
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={revenue.map(r => ({ date: r.date.slice(5), Revenu: Number(fmt(r.revenue)), 'Coût LLM': Number(fmt(r.cost)), Marge: Number(fmt(r.margin)) }))}>
              <defs>
                <linearGradient id="gradRevenu" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="gradCout" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#ef4444" stopOpacity={0.2} />
                  <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${String(v)} cr`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Area type="monotone" dataKey="Revenu" stroke="#6366f1" fill="url(#gradRevenu)" strokeWidth={2} />
              <Area type="monotone" dataKey="Coût LLM" stroke="#ef4444" fill="url(#gradCout)" strokeWidth={1.5} />
              <Area type="monotone" dataKey="Marge" stroke="#22c55e" fill="none" strokeWidth={1.5} strokeDasharray="4 2" />
            </AreaChart>
          </ResponsiveContainer>
        </div>

        {/* User growth bar */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Nouveaux utilisateurs / jour</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={growth.map(r => ({ date: r.date.slice(5), Users: r.newUsers }))}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} />
              <Bar dataKey="Users" fill="#6366f1" radius={[3, 3, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Row 2: Tier donut + LLM cost stacked bar */}
      <div className="billing-charts-row-sidebar">
        {/* Tier donut */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Répartition par tier</div>
          <ResponsiveContainer width="100%" height={160}>
            <PieChart>
              <Pie data={tierDist} dataKey="count" nameKey="tier" cx="50%" cy="50%" innerRadius={40} outerRadius={70} paddingAngle={3}>
                {tierDist.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v, n) => [`${String(v)} users`, String(n)]} />
            </PieChart>
          </ResponsiveContainer>
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, flexWrap: 'wrap' }}>
            {tierDist.map((t, i) => (
              <div key={t.tier} style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 11 }}>
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: COLORS[i % COLORS.length], display: 'inline-block' }} />
                <span style={{ textTransform: 'capitalize', color: 'var(--text-secondary)' }}>{t.tier}</span>
                <strong>{t.count}</strong>
              </div>
            ))}
          </div>
        </div>

        {/* LLM Cost stacked */}
        <div className="card">
          <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Revenu / Coût / Marge — 14 derniers jours</div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={costBarData}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" />
              <XAxis dataKey="date" tick={{ fontSize: 10 }} />
              <YAxis tick={{ fontSize: 10 }} />
              <Tooltip contentStyle={TOOLTIP_STYLE} formatter={(v) => [`${String(v)} cr`, '']} />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="Revenu" fill="#6366f1" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Coût LLM" fill="#ef4444" radius={[2, 2, 0, 0]} />
              <Bar dataKey="Marge" fill="#22c55e" radius={[2, 2, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Top Clients Table */}
      {topClients.length > 0 && (
        <div className="card" style={{ padding: 0 }}>
          <div style={{ fontWeight: 600, fontSize: 13, padding: '14px 16px', borderBottom: '1px solid var(--border-primary)' }}>
            Top 10 clients (par dépenses)
          </div>
          <table className="data-table">
            <thead>
              <tr>
                <th>#</th>
                <th>Client</th>
                <th>Tier</th>
                <th className="text-right">Dépensé (cr)</th>
              </tr>
            </thead>
            <tbody>
              {topClients.map((c, i) => (
                <tr key={c.id}>
                  <td style={{ color: 'var(--text-muted)', width: 32 }}>{i + 1}</td>
                  <td>
                    <div style={{ fontWeight: 500, fontSize: 13 }}>{c.displayName}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.email}</div>
                  </td>
                  <td><span className="badge badge-neutral" style={{ textTransform: 'capitalize' }}>{c.tier}</span></td>
                  <td className="text-right font-semibold">{fmt(c.totalSpent)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
