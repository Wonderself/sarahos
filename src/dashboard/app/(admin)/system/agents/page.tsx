import { api, type AgentEntry } from '@/lib/api-client';
import { AgentsClientView } from './AgentsClientView';

export const dynamic = 'force-dynamic';
export const revalidate = 10;


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
      <div className="admin-page-scrollable">
        <div className="page-header"><h1 className="page-title">Agents IA</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const idle = agents.filter(a => a.status === 'IDLE').length;
  const busy = agents.filter(a => a.status === 'BUSY').length;
  const errCount = agents.filter(a => a.status === 'ERROR').length;

  return (
    <div className="admin-page-scrollable">
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

      {/* Client-side search/filter + agent list */}
      <AgentsClientView agents={agents} />

      <div className="text-xs text-muted mt-16">
        API: GET /agents | POST /agents/:id/execute | POST /agents/:id/pause | POST /agents/:id/resume
      </div>
    </div>
  );
}
