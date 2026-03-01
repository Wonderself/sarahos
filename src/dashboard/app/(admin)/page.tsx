import { api, type HealthResponse } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function OverviewPage() {
  let health: HealthResponse | undefined;
  let infraHealth: Record<string, unknown> | undefined;
  let billingStats: Record<string, unknown> | undefined;
  let tokenUsage: Record<string, unknown> | undefined;
  let error: string | undefined;

  try {
    [health, infraHealth, billingStats, tokenUsage] = await Promise.all([
      api.getHealth(),
      api.getInfraHealth().catch(() => undefined),
      api.getBillingStats().catch(() => undefined) as Promise<Record<string, unknown> | undefined>,
      api.getTokenUsage().catch(() => undefined) as Promise<Record<string, unknown> | undefined>,
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
            <p className="page-subtitle">SARAH OS — Multi-Agent Operating System</p>
          </div>
        </div>
        <div className="alert alert-danger">{error ?? 'Backend unreachable'}</div>
      </div>
    );
  }

  const upH = Math.floor(health.uptime / 3600);
  const upM = Math.floor((health.uptime % 3600) / 60);

  const agentsByLevel = [1, 2, 3].map(l => ({
    level: l,
    label: l === 1 ? 'Execution' : l === 2 ? 'Management' : 'Executive',
    agents: health.agents.entries.filter(a => a.level === l),
  }));

  const db = infraHealth?.['database'] as Record<string, unknown> | undefined;
  const redis = infraHealth?.['redis'] as Record<string, unknown> | undefined;
  const dbOk = db?.['status'] === 'connected' || db?.['connected'] === true;
  const redisOk = redis?.['status'] === 'connected' || redis?.['connected'] === true;

  const revenue = Number((billingStats as Record<string, unknown>)?.['totalRevenue'] ?? 0);
  const totalTokens = Number((tokenUsage as Record<string, unknown>)?.['total'] ?? 0);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Dashboard</h1>
          <p className="page-subtitle">SARAH OS v{health.version} — Phase {health.phase}</p>
        </div>
        <div className="page-actions">
          <span className="badge badge-success">
            {health.status.toUpperCase()}
          </span>
        </div>
      </div>

      {/* KPI Row */}
      <div className="grid-5 section">
        <div className="stat-card">
          <span className="stat-label">Uptime</span>
          <span className="stat-value stat-value-sm">{upH}h {upM}m</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Agents</span>
          <span className="stat-value stat-value-sm">{health.agents.total}</span>
          <span className="stat-change stat-change-up">actifs</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Tokens Utilises</span>
          <span className="stat-value stat-value-sm">{totalTokens.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Revenu</span>
          <span className="stat-value stat-value-sm text-success">
            {(revenue / 1_000_000).toFixed(2)} cr
          </span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Phase</span>
          <span className="stat-value stat-value-sm text-accent">{health.phase}</span>
        </div>
      </div>

      {/* Infrastructure Status */}
      <div className="section">
        <div className="section-title">Infrastructure</div>
        <div className="grid-4">
          <div className="card card-compact flex items-center gap-12">
            <span className={dbOk ? 'status-dot' : 'status-dot status-dot-error'} />
            <div>
              <div className="text-md font-semibold">PostgreSQL</div>
              <div className="text-xs text-tertiary">{dbOk ? 'Connected' : 'Down'}</div>
            </div>
          </div>
          <div className="card card-compact flex items-center gap-12">
            <span className={redisOk ? 'status-dot' : 'status-dot status-dot-error'} />
            <div>
              <div className="text-md font-semibold">Redis</div>
              <div className="text-xs text-tertiary">{redisOk ? 'Connected' : 'Down'}</div>
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

      {/* Agents by Level */}
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
