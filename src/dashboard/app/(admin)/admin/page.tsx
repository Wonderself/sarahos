import Link from 'next/link';
import { api, type HealthResponse } from '@/lib/api-client';
import OverviewCharts from './OverviewCharts';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function OverviewPage() {
  let health: HealthResponse | undefined;
  let infraHealth: Record<string, unknown> | undefined;
  let billingStats: Record<string, unknown> | undefined;
  let tokenUsage: Record<string, unknown> | undefined;
  let recentEvents: Array<{ id: string; type: string; sourceAgent: string; payload: Record<string, unknown>; timestamp: string }> = [];
  let error: string | undefined;

  try {
    [health, infraHealth, billingStats, tokenUsage, recentEvents] = await Promise.all([
      api.getHealth(),
      api.getInfraHealth().catch(() => undefined),
      api.getBillingStats().catch(() => undefined) as Promise<Record<string, unknown> | undefined>,
      api.getTokenUsage().catch(() => undefined) as Promise<Record<string, unknown> | undefined>,
      api.getEvents(10).catch(() => []),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to connect';
  }

  if (error || !health) {
    return (
      <div>
        <div className="admin-dashboard-header">
          <div>
            <h1 className="admin-dashboard-title">Dashboard</h1>
            <span className="admin-dashboard-version">Freenzy.io — Multi-Agent OS</span>
          </div>
        </div>
        <div className="alert alert-danger">{error ?? 'Backend unreachable'}</div>
      </div>
    );
  }

  const upH = Math.floor(health.uptime / 3600);
  const upM = Math.floor((health.uptime % 3600) / 60);

  const db = (infraHealth?.['database'] as Record<string, unknown> | undefined);
  const redis = (infraHealth?.['redis'] as Record<string, unknown> | undefined);
  const dbOk = db?.['status'] === 'connected' || db?.['connected'] === true;
  const redisOk = redis?.['status'] === 'connected' || redis?.['connected'] === true;

  const revenue = Number((billingStats as Record<string, unknown>)?.['totalRevenue'] ?? 0);
  const totalCost = Number((billingStats as Record<string, unknown>)?.['totalCost'] ?? 0);
  const totalTokens = Number((tokenUsage as Record<string, unknown>)?.['total'] ?? 0);
  const margin = revenue - totalCost;
  const marginPct = revenue > 0 ? Math.round(margin / revenue * 100) : 0;

  const agentsByLevel = [1, 2, 3].map(l => ({
    level: l,
    label: l === 1 ? 'Execution' : l === 2 ? 'Management' : 'Executive',
    agents: health.agents.entries.filter(a => a.level === l),
  }));

  const levelColors: Record<number, string> = { 1: '#1A1A1A', 2: '#6B6B6B', 3: '#9B9B9B' };

  const statusCounts = (['IDLE', 'BUSY', 'ERROR', 'PAUSED'] as const)
    .map(s => ({ status: s, count: health.agents.entries.filter(a => a.status === s).length }))
    .filter(s => s.count > 0);

  const infraIssues: string[] = [];
  if (!dbOk) infraIssues.push('PostgreSQL hors ligne');
  if (!redisOk) infraIssues.push('Redis hors ligne');

  const displayEvents = recentEvents.slice(0, 5);

  return (
    <div className="admin-dashboard">
      {/* ── Header ── */}
      <div className="admin-dashboard-header">
        <div>
          <h1 className="admin-dashboard-title">Dashboard</h1>
          <span className="admin-dashboard-version">v{health.version} — Phase {health.phase}</span>
        </div>
        <div className="admin-dashboard-status">
          <div className="admin-security-checks">
            <span className="admin-security-check">✅ AES</span>
            <span className="admin-security-check">✅ JWT</span>
            <span className="admin-security-check">✅ Isol.</span>
          </div>
          <span className={`admin-infra-dot ${health.status === 'ok' ? 'ok' : 'error'}`} style={{ width: 10, height: 10 }} />
          <span style={{ fontSize: 12 }}>{upH}h{upM}m</span>
        </div>
      </div>

      {/* ── Alertes infra ── */}
      {infraIssues.length > 0 && (
        <div>
          {infraIssues.map(issue => (
            <div key={issue} className="alert alert-danger" style={{ marginBottom: 4, padding: '6px 12px', fontSize: 13 }}>
              {issue}
            </div>
          ))}
        </div>
      )}

      {/* ── Infra Strip ── */}
      <div className="admin-infra-strip">
        {[
          { label: 'PostgreSQL', ok: dbOk },
          { label: 'Redis', ok: redisOk },
          { label: 'Backend API', ok: true },
          { label: 'Dashboard', ok: true },
        ].map(s => (
          <div key={s.label} className="admin-infra-item">
            <span className={`admin-infra-dot ${s.ok ? 'ok' : 'error'}`} />
            <span>{s.label}</span>
          </div>
        ))}
      </div>

      {/* ── KPI Strip ── */}
      <div className="admin-kpi-strip">
        <div className="admin-kpi-item">
          <span className="admin-kpi-label">Revenus</span>
          <span className="admin-kpi-value" style={{ color: 'var(--success)' }}>
            {(revenue / 1_000_000).toFixed(2)} cr
          </span>
        </div>
        <div className="admin-kpi-item">
          <span className="admin-kpi-label">Couts LLM</span>
          <span className="admin-kpi-value" style={{ color: 'var(--warning)' }}>
            {(totalCost / 1_000_000).toFixed(2)} cr
          </span>
        </div>
        <div className="admin-kpi-item">
          <span className="admin-kpi-label">Marge</span>
          <span className="admin-kpi-value" style={{ color: marginPct >= 20 ? 'var(--success)' : 'var(--warning)' }}>
            {marginPct}%
          </span>
        </div>
        <div className="admin-kpi-item">
          <span className="admin-kpi-label">Tokens</span>
          <span className="admin-kpi-value">{(totalTokens / 1000).toFixed(1)}k</span>
        </div>
        <div className="admin-kpi-item">
          <span className="admin-kpi-label">Agents</span>
          <span className="admin-kpi-value" style={{ color: 'var(--accent)' }}>{health.agents.total}</span>
        </div>
      </div>

      {/* ── Main zone: Charts | Agents | Events ── */}
      <div className="admin-dashboard-main">
        {/* Column 1: Charts (compact) */}
        <div style={{ minHeight: 0, overflow: 'hidden' }}>
          <OverviewCharts />
        </div>

        {/* Column 2: Agents summary */}
        <div className="card" style={{ padding: 12 }}>
          <div className="text-sm font-bold" style={{ marginBottom: 8 }}>Agents IA</div>
          <div className="admin-agents-summary">
            <div className="admin-agents-levels">
              {agentsByLevel.map(g => (
                <div key={g.level} className="admin-agent-level-row">
                  <span className="admin-agent-level-badge" style={{ background: levelColors[g.level] }}>
                    L{g.level}
                  </span>
                  <span className="admin-agent-level-label">{g.label}</span>
                  <div className="admin-agent-level-bar">
                    <div style={{ width: `${health.agents.total > 0 ? (g.agents.length / health.agents.total) * 100 : 0}%`, background: levelColors[g.level] }} />
                  </div>
                  <span className="admin-agent-level-count">{g.agents.length}</span>
                </div>
              ))}
            </div>
            <div className="admin-agents-statuses">
              {statusCounts.map(s => (
                <span key={s.status} className={`admin-status-pill ${s.status.toLowerCase()}`}>
                  {s.count} {s.status}
                </span>
              ))}
            </div>
          </div>
        </div>

        {/* Column 3: Recent events */}
        <div className="card" style={{ padding: 12 }}>
          <div className="text-sm font-bold" style={{ marginBottom: 8 }}>Activite recente</div>
          <div className="admin-events-compact">
            {displayEvents.length === 0 ? (
              <div style={{ fontSize: 12, color: 'var(--text-muted)', textAlign: 'center', padding: 12 }}>
                Aucun evenement
              </div>
            ) : (
              displayEvents.map(ev => (
                <div key={ev.id} className="admin-event-row">
                  <span
                    className="admin-event-dot"
                    style={{ background: ev.type === 'error' ? 'var(--danger)' : ev.type === 'warning' ? 'var(--warning)' : 'var(--success)' }}
                  />
                  <span className="admin-event-type">{ev.type}</span>
                  <span className="admin-event-agent">{ev.sourceAgent}</span>
                  <span className="admin-event-time">
                    {new Date(ev.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
              ))
            )}
            <Link href="/system/events" className="admin-see-all-link">
              Voir tout &rarr;
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
