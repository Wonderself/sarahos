'use client';

import {
  PieChart, Pie, Cell,
  AreaChart, Area,
  BarChart, Bar,
  XAxis, YAxis, Tooltip, Legend,
  ResponsiveContainer, CartesianGrid,
} from 'recharts';

// ─── Palette ──────────────────────────────────────────────────────────────────

const PIE_COLORS = ['#7c3aed', '#06b6d4', '#10b981', '#f59e0b', '#dc2626'];
const CHART_STYLE = { fontSize: 11, borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-elevated)' };

// ─── Date range selector ───────────────────────────────────────────────────────

export function DateRangePicker({
  value,
  onChange,
}: {
  value: '7d' | '30d' | '90d';
  onChange: (v: '7d' | '30d' | '90d') => void;
}) {
  const options: { label: string; value: '7d' | '30d' | '90d' }[] = [
    { label: '7 jours', value: '7d' },
    { label: '30 jours', value: '30d' },
    { label: '90 jours', value: '90d' },
  ];
  return (
    <div style={{ display: 'flex', gap: 4 }}>
      {options.map(opt => (
        <button
          key={opt.value}
          onClick={() => onChange(opt.value)}
          style={{
            padding: '4px 10px',
            borderRadius: 6,
            border: '1px solid var(--border-primary)',
            fontSize: 11,
            fontWeight: 600,
            cursor: 'pointer',
            background: value === opt.value ? 'var(--accent)' : 'var(--bg-elevated)',
            color: value === opt.value ? 'white' : 'var(--text-secondary)',
            transition: 'all 0.15s',
          }}
        >
          {opt.label}
        </button>
      ))}
    </div>
  );
}

// ─── Revenue Area Chart ────────────────────────────────────────────────────────

export function RevenueAreaChart({
  data,
}: {
  data: Array<{ date: string; revenue: number; cost: number; margin: number }>;
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: 13 }}>
        Aucune donnée pour cette période
      </div>
    );
  }

  // Format dates as "DD/MM"
  const formatted = data.map(d => ({
    ...d,
    label: d.date.slice(5).replace('-', '/'),
    revenueK: +(d.revenue / 1_000_000).toFixed(2),
    costK: +(d.cost / 1_000_000).toFixed(2),
    marginK: +(d.margin / 1_000_000).toFixed(2),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <AreaChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <defs>
          <linearGradient id="gradRevenue" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#7c3aed" stopOpacity={0} />
          </linearGradient>
          <linearGradient id="gradMargin" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#10b981" stopOpacity={0.25} />
            <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
          </linearGradient>
        </defs>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={CHART_STYLE} formatter={(v) => [`${Number(v).toFixed(2)} cr`, '']} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 10, paddingTop: 4 }} />
        <Area type="monotone" dataKey="revenueK" stroke="#7c3aed" strokeWidth={2} fill="url(#gradRevenue)" name="Revenus (cr)" />
        <Area type="monotone" dataKey="marginK" stroke="#10b981" strokeWidth={2} fill="url(#gradMargin)" name="Marge (cr)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}

// ─── User Growth Bar Chart ─────────────────────────────────────────────────────

export function UserGrowthBarChart({
  data,
}: {
  data: Array<{ date: string; newUsers: number }>;
}) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 200, color: 'var(--text-muted)', fontSize: 13 }}>
        Aucune donnée pour cette période
      </div>
    );
  }

  const formatted = data.map(d => ({
    ...d,
    label: d.date.slice(5).replace('-', '/'),
  }));

  return (
    <ResponsiveContainer width="100%" height={200}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={CHART_STYLE} />
        <Bar dataKey="newUsers" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Nouveaux users" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Tier Donut Chart ─────────────────────────────────────────────────────────

interface TierData {
  name: string;
  value: number;
}

export function TierDonutChart({ data }: { data: TierData[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--text-muted)', fontSize: 13 }}>
        Aucune donnée
      </div>
    );
  }
  const total = data.reduce((s, d) => s + d.value, 0);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <ResponsiveContainer width={120} height={120}>
        <PieChart>
          <Pie data={data} cx="50%" cy="50%" innerRadius={34} outerRadius={54} dataKey="value" paddingAngle={3}>
            {data.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
          </Pie>
          <Tooltip contentStyle={CHART_STYLE} />
        </PieChart>
      </ResponsiveContainer>
      <div style={{ flex: 1 }}>
        {data.map((d, i) => (
          <div key={d.name} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <div style={{ width: 8, height: 8, borderRadius: 2, background: PIE_COLORS[i % PIE_COLORS.length], flexShrink: 0 }} />
              <span style={{ fontSize: 12, color: 'var(--text-secondary)', textTransform: 'capitalize' }}>{d.name}</span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 12, fontWeight: 700 }}>{d.value}</span>
              <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{total > 0 ? Math.round(d.value / total * 100) : 0}%</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ─── LLM Cost Stacked Bar ─────────────────────────────────────────────────────

interface LLMCostData {
  model: string;
  cost: number;
  billed: number;
  margin: number;
}

export function LLMCostStackedBar({ data }: { data: LLMCostData[] }) {
  if (!data || data.length === 0) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: 160, color: 'var(--text-muted)', fontSize: 13 }}>
        Aucune donnée
      </div>
    );
  }
  const formatted = data.map(d => ({
    ...d,
    costK: +(d.cost / 1_000_000).toFixed(4),
    billedK: +(d.billed / 1_000_000).toFixed(4),
    marginK: +(d.margin / 1_000_000).toFixed(4),
  }));
  return (
    <ResponsiveContainer width="100%" height={160}>
      <BarChart data={formatted} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--border-primary)" vertical={false} />
        <XAxis dataKey="model" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={CHART_STYLE} formatter={(v) => [`${Number(v).toFixed(2)} cr`, '']} />
        <Legend iconSize={8} wrapperStyle={{ fontSize: 10 }} />
        <Bar dataKey="costK" stackId="a" fill="#ef4444" name="Coût" />
        <Bar dataKey="marginK" stackId="a" fill="#10b981" radius={[4, 4, 0, 0]} name="Marge" />
      </BarChart>
    </ResponsiveContainer>
  );
}

// ─── Top Clients Table ────────────────────────────────────────────────────────

interface TopClientEntry {
  id: string;
  email: string;
  displayName: string;
  tier: string;
  totalSpent: number;
  totalDeposited: number;
  balance: number;
}

const TIER_BADGE: Record<string, string> = {
  paid: '#10b981',
  free: '#7c3aed',
  demo: '#f59e0b',
  guest: '#9ca3af',
};

export function TopClientsTable({ clients }: { clients: TopClientEntry[] }) {
  if (!clients || clients.length === 0) {
    return <div style={{ color: 'var(--text-muted)', fontSize: 13, padding: '16px 0' }}>Aucun client pour le moment</div>;
  }
  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
      <thead>
        <tr style={{ borderBottom: '1px solid var(--border-primary)' }}>
          <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>#</th>
          <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Client</th>
          <th style={{ textAlign: 'left', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Tier</th>
          <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Dépensé</th>
          <th style={{ textAlign: 'right', padding: '6px 8px', color: 'var(--text-muted)', fontWeight: 600, fontSize: 10, textTransform: 'uppercase' }}>Balance</th>
        </tr>
      </thead>
      <tbody>
        {clients.map((c, i) => (
          <tr key={c.id} style={{ borderBottom: '1px solid var(--border-primary)' }}>
            <td style={{ padding: '8px', color: 'var(--text-muted)', fontWeight: 600 }}>#{i + 1}</td>
            <td style={{ padding: '8px' }}>
              <div style={{ fontWeight: 600 }}>{c.displayName}</div>
              <div style={{ color: 'var(--text-muted)', fontSize: 10 }}>{c.email}</div>
            </td>
            <td style={{ padding: '8px' }}>
              <span style={{
                padding: '2px 8px', borderRadius: 10, fontSize: 10, fontWeight: 700,
                background: (TIER_BADGE[c.tier] ?? '#9ca3af') + '22',
                color: TIER_BADGE[c.tier] ?? '#9ca3af',
                textTransform: 'capitalize',
              }}>
                {c.tier}
              </span>
            </td>
            <td style={{ padding: '8px', textAlign: 'right', fontWeight: 700 }}>
              {(c.totalSpent / 1_000_000).toFixed(2)} cr
            </td>
            <td style={{ padding: '8px', textAlign: 'right', color: c.balance > 0 ? '#10b981' : 'var(--text-muted)' }}>
              {(c.balance / 1_000_000).toFixed(2)} cr
            </td>
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─── Legacy combined AdminCharts (kept for backward compat) ───────────────────

interface AdminChartsProps {
  billingStats?: Record<string, unknown>;
  tokenUsage?: Record<string, unknown>;
  agentCounts?: { level: number; label: string; count: number }[];
}

export default function AdminCharts({ billingStats, tokenUsage, agentCounts }: AdminChartsProps) {
  const tierData = billingStats ? [
    { name: 'Paid', value: Number(billingStats['paidUsers'] ?? billingStats['paid'] ?? 0) || 0 },
    { name: 'Free', value: Number(billingStats['freeUsers'] ?? billingStats['free'] ?? 0) || 0 },
    { name: 'Demo', value: Number(billingStats['demoUsers'] ?? billingStats['demo'] ?? 0) || 0 },
    { name: 'Guest', value: Number(billingStats['guestUsers'] ?? billingStats['guest'] ?? 0) || 0 },
  ].filter(d => d.value > 0) : [];

  const agentBarData = agentCounts ?? [
    { level: 1, label: 'L1 Execution', count: 7 },
    { level: 2, label: 'L2 Management', count: 4 },
    { level: 3, label: 'L3 Executive', count: 4 },
  ];

  const tokenByModel = tokenUsage ? [
    { name: 'Sonnet', value: Number(tokenUsage['sonnet'] ?? tokenUsage['standard'] ?? 0) || 0 },
    { name: 'Opus', value: Number(tokenUsage['opus'] ?? tokenUsage['advanced'] ?? 0) || 0 },
    { name: 'Haiku', value: Number(tokenUsage['haiku'] ?? tokenUsage['fast'] ?? 0) || 0 },
  ].filter(d => d.value > 0) : [];

  return (
    <div className="fz-grid-3" style={{ display: 'grid', gap: 12 }}>
      {/* Users by tier */}
      <div className="card" style={{ padding: 16 }}>
        <div className="text-md font-bold mb-8">Utilisateurs par tier</div>
        {tierData.length > 0 ? (
          <TierDonutChart data={tierData} />
        ) : (
          <div className="text-sm text-muted" style={{ padding: '40px 0', textAlign: 'center' }}>Données indisponibles</div>
        )}
      </div>

      {/* Agent hierarchy bar */}
      <div className="card" style={{ textAlign: 'center', padding: 16 }}>
        <div className="text-md font-bold mb-8">Agents par niveau</div>
        <ResponsiveContainer width="100%" height={140}>
          <BarChart data={agentBarData} margin={{ top: 4, right: 4, bottom: 0, left: -20 }}>
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: 'var(--text-muted)' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={CHART_STYLE} />
            <Bar dataKey="count" fill="#7c3aed" radius={[4, 4, 0, 0]} name="Agents" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Token usage by model */}
      <div className="card" style={{ padding: 16 }}>
        <div className="text-md font-bold mb-8">Tokens par modèle</div>
        {tokenByModel.length > 0 ? (
          <TierDonutChart data={tokenByModel} />
        ) : (
          <div className="text-sm text-muted" style={{ padding: '40px 0', textAlign: 'center' }}>Données indisponibles</div>
        )}
      </div>
    </div>
  );
}
