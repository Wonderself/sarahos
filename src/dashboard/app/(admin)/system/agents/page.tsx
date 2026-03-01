import { api, type AgentEntry } from '@/lib/api-client';
import { AgentActions } from './actions';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

const levelMeta: Record<number, { label: string; color: string; desc: string }> = {
  1: { label: 'L1 — Execution', color: 'var(--info)', desc: 'Agents operationnels executant les taches quotidiennes' },
  2: { label: 'L2 — Management', color: 'var(--warning)', desc: 'Agents de coordination et gestion des workflows' },
  3: { label: 'L3 — Executive', color: 'var(--purple)', desc: 'Agents strategiques et prise de decision' },
};

const statusBadge: Record<string, string> = {
  IDLE: 'badge-success',
  BUSY: 'badge-warning',
  ERROR: 'badge-danger',
  DISABLED: 'badge-neutral',
};

export default async function AgentsPage() {
  let agents: AgentEntry[] = [];
  let error: string | undefined;

  try {
    agents = await api.getAgents();
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load agents';
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Agents IA</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const byLevel = [1, 2, 3].map(level => ({
    level,
    meta: levelMeta[level] ?? { label: `Level ${level}`, color: 'var(--text-muted)', desc: '' },
    agents: agents.filter(a => a.level === level),
  }));

  const idle = agents.filter(a => a.status === 'IDLE').length;
  const busy = agents.filter(a => a.status === 'BUSY').length;
  const errCount = agents.filter(a => a.status === 'ERROR').length;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Agents IA</h1>
          <p className="page-subtitle">{agents.length} agents — Hierarchie 3 niveaux</p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-4 section">
        <div className="stat-card">
          <span className="stat-label">Total</span>
          <span className="stat-value stat-value-sm">{agents.length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">En veille</span>
          <span className="stat-value stat-value-sm text-success">{idle}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Occupes</span>
          <span className="stat-value stat-value-sm text-warning">{busy}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Erreurs</span>
          <span className={`stat-value stat-value-sm ${errCount > 0 ? 'text-danger' : 'text-muted'}`}>{errCount}</span>
        </div>
      </div>

      {/* By Level */}
      {byLevel.map(group => (
        <div key={group.level} className="section">
          <div className="section-title" style={{ color: group.meta.color }}>
            {group.meta.label}
            <span className="section-subtitle">— {group.agents.length} agents — {group.meta.desc}</span>
          </div>
          <div className="grid-2">
            {group.agents.map(agent => (
              <div key={agent.id} className="card" style={{ borderLeft: `3px solid ${group.meta.color}` }}>
                <div className="flex flex-between items-center mb-8">
                  <span className="text-base font-semibold">{agent.name}</span>
                  <span className={`badge ${statusBadge[agent.status] ?? 'badge-neutral'}`}>{agent.status}</span>
                </div>
                <div className="flex flex-wrap gap-4">
                  {agent.capabilities.map(cap => (
                    <span key={cap} className="badge badge-neutral text-xs">
                      {cap}
                    </span>
                  ))}
                </div>
                <AgentActions agentId={agent.id} status={agent.status} />
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="text-xs text-muted mt-16">
        API: GET /agents | POST /agents/:id/execute | POST /agents/:id/pause | POST /agents/:id/resume | GET /agents/:id/health | GET /agents/:id/history
      </div>
    </div>
  );
}
