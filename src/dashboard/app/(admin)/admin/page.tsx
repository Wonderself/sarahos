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
        <div className="page-header">
          <div>
            <h1 className="page-title">Dashboard</h1>
            <p className="page-subtitle">Freenzy.io — Multi-Agent Operating System</p>
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

  const infraIssues: string[] = [];
  if (!dbOk) infraIssues.push('PostgreSQL hors ligne');
  if (!redisOk) infraIssues.push('Redis hors ligne');

  return (
    <div>
      {/* ── Header ── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">Freenzy.io v{health.version} — Phase {health.phase}</p>
        </div>
        <div className="page-actions">
          <span className={`badge ${health.status === 'ok' ? 'badge-success' : 'badge-danger'}`}>
            {health.status.toUpperCase()}
          </span>
          <span className="text-xs text-muted" style={{ marginLeft: 8 }}>
            Uptime {upH}h {upM}m
          </span>
        </div>
      </div>

      {/* ── SECTION A : Alertes infra ── */}
      {infraIssues.length > 0 && (
        <div className="section">
          {infraIssues.map(issue => (
            <div key={issue} className="alert alert-danger" style={{ marginBottom: 8 }}>
              ⚠️ {issue}
            </div>
          ))}
        </div>
      )}

      <div className="section">
        <div className="section-title">Infrastructure</div>
        <div className="grid-4">
          <div className="card card-compact flex items-center gap-12">
            <span className={dbOk ? 'status-dot' : 'status-dot status-dot-error'} />
            <div>
              <div className="text-md font-semibold">PostgreSQL</div>
              <div className="text-xs text-tertiary">{dbOk ? 'Connecté' : 'Hors ligne'}</div>
            </div>
          </div>
          <div className="card card-compact flex items-center gap-12">
            <span className={redisOk ? 'status-dot' : 'status-dot status-dot-error'} />
            <div>
              <div className="text-md font-semibold">Redis</div>
              <div className="text-xs text-tertiary">{redisOk ? 'Connecté' : 'Hors ligne'}</div>
            </div>
          </div>
          <div className="card card-compact flex items-center gap-12">
            <span className="status-dot" />
            <div>
              <div className="text-md font-semibold">Backend API</div>
              <div className="text-xs text-tertiary">Port 3010</div>
            </div>
          </div>
          <div className="card card-compact flex items-center gap-12">
            <span className="status-dot" />
            <div>
              <div className="text-md font-semibold">Dashboard</div>
              <div className="text-xs text-tertiary">Port 3001</div>
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION B : KPIs Business ── */}
      <div className="section">
        <div className="section-title">KPIs Business</div>
        <div className="grid-5">
          <div className="stat-card">
            <span className="stat-label">Revenus</span>
            <span className="stat-value stat-value-sm text-success">
              {(revenue / 1_000_000).toFixed(2)} cr
            </span>
            <span className="stat-change stat-change-up">total</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Coûts LLM</span>
            <span className="stat-value stat-value-sm" style={{ color: 'var(--warning)' }}>
              {(totalCost / 1_000_000).toFixed(2)} cr
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Marge</span>
            <span className="stat-value stat-value-sm" style={{ color: marginPct >= 20 ? 'var(--success)' : 'var(--warning)' }}>
              {marginPct}%
            </span>
            <span className="stat-change">objectif 20%</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tokens</span>
            <span className="stat-value stat-value-sm">
              {(totalTokens / 1000).toFixed(1)}k
            </span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Agents actifs</span>
            <span className="stat-value stat-value-sm text-accent">{health.agents.total}</span>
          </div>
        </div>
      </div>

      {/* ── Revenue + User Growth Charts (client component) ── */}
      <OverviewCharts />

      {/* ── Répartition agents + sécurité ── */}
      <div className="section">
        <div className="section-title">Répartition & Sécurité</div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12 }}>
          <div className="card" style={{ padding: 16 }}>
            <div className="text-md font-bold mb-8">Agents par niveau</div>
            {agentsByLevel.map(group => (
              <div key={group.level} style={{ marginBottom: 8 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 3 }}>
                  <span className="text-sm">L{group.level} {group.label}</span>
                  <span className="text-sm font-semibold">{group.agents.length}</span>
                </div>
                <div className="progress-bar">
                  <div
                    className="progress-bar-fill"
                    style={{
                      width: `${health.agents.total > 0 ? (group.agents.length / health.agents.total) * 100 : 0}%`,
                      background: group.level === 1 ? 'var(--accent)' : group.level === 2 ? '#a855f7' : '#f59e0b',
                    }}
                  />
                </div>
              </div>
            ))}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="text-md font-bold mb-8">Statuts agents</div>
            {(['IDLE', 'BUSY', 'ERROR', 'PAUSED'] as const).map(status => {
              const count = health.agents.entries.filter(a => a.status === status).length;
              if (count === 0) return null;
              return (
                <div key={status} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
                  <span className="text-sm">{status}</span>
                  <span className={`badge ${status === 'IDLE' ? 'badge-success' : status === 'BUSY' ? 'badge-warning' : status === 'ERROR' ? 'badge-danger' : 'badge-neutral'}`}>
                    {count}
                  </span>
                </div>
              );
            })}
          </div>

          <div className="card" style={{ padding: 16 }}>
            <div className="text-md font-bold mb-8">Sécurité</div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                'Isolation données OK',
                'AES-256 + scrypt',
                'JWT 24h + httpOnly',
              ].map(item => (
                <div key={item} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span style={{ color: '#10b981', fontSize: 14 }}>✓</span>
                  <span className="text-sm">{item}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* ── SECTION C : Feed activité récente ── */}
      <div className="section">
        <div className="section-title">
          Activité récente
          <span className="section-subtitle">— 10 derniers événements</span>
        </div>
        <div className="card" style={{ padding: 0 }}>
          {recentEvents.length === 0 ? (
            <div style={{ padding: '24px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              Aucun événement récent
            </div>
          ) : (
            recentEvents.map((ev, i) => (
              <div
                key={ev.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '12px 16px',
                  borderBottom: i < recentEvents.length - 1 ? '1px solid var(--border-primary)' : 'none',
                }}
              >
                <div style={{
                  width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                  background: 'var(--bg-secondary)',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 12,
                }}>
                  {ev.type === 'error' ? '🔴' : ev.type === 'warning' ? '🟡' : '🟢'}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
                    <span className="text-md font-semibold" style={{ textTransform: 'capitalize' }}>{ev.type}</span>
                    <span className="text-xs text-muted">{ev.sourceAgent}</span>
                  </div>
                  {ev.payload && typeof ev.payload === 'object' && Object.keys(ev.payload).length > 0 && (
                    <div className="text-xs text-tertiary" style={{ marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {JSON.stringify(ev.payload).slice(0, 100)}
                    </div>
                  )}
                </div>
                <div className="text-xs text-muted" style={{ flexShrink: 0 }}>
                  {new Date(ev.timestamp).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* ── Agents IA (détail par niveau) ── */}
      <div className="section">
        <div className="section-title">
          Agents IA
          <span className="section-subtitle">— {health.agents.total} agents actifs</span>
        </div>
        <div className="grid-3">
          {agentsByLevel.map(group => (
            <div key={group.level} className="card">
              <div className="text-xs font-bold text-muted mb-12" style={{ letterSpacing: '0.05em' }}>
                L{group.level} — {group.label.toUpperCase()} ({group.agents.length})
              </div>
              {group.agents.map(agent => (
                <div key={agent.name} className="flex items-center flex-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <span className="text-md font-medium">{agent.name}</span>
                  <span className={`badge ${agent.status === 'IDLE' ? 'badge-success' : agent.status === 'BUSY' ? 'badge-warning' : agent.status === 'ERROR' ? 'badge-danger' : 'badge-neutral'}`}>
                    {agent.status}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
