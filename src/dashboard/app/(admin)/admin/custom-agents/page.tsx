import { api } from '@/lib/api-client';
import CustomAgentActions from './CustomAgentActions';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

interface CustomAgent {
  id: string;
  name: string;
  role: string;
  emoji: string;
  domain: string;
  tone: string;
  autonomyLevel: number;
  isActive: boolean;
  createdAt: string;
  email: string;
  displayName: string;
}

export default async function CustomAgentsPage() {
  let agents: CustomAgent[] = [];
  let stats = { total: 0, active: 0, usersCount: 0, avgAutonomy: 0 };

  try {
    const result = await api.getAdminCustomAgents();
    agents = (result?.agents ?? []) as unknown as CustomAgent[];
    stats = {
      total: result?.stats?.total ?? 0,
      active: result?.stats?.active ?? 0,
      usersCount: result?.stats?.usersCount ?? 0,
      avgAutonomy: result?.stats?.avgAutonomy ?? 0,
    };
  } catch { /* empty */ }

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pilotage Agents Custom</h1>
          <p className="page-subtitle">Agents IA crees par les utilisateurs</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 section">
        <div className="stat-card">
          <div className="stat-label">Total agents</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Actifs</div>
          <div className="stat-value text-success">{stats.active}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Users createurs</div>
          <div className="stat-value text-accent">{stats.usersCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Autonomie moyenne</div>
          <div className="stat-value">{Math.round(stats.avgAutonomy * 10) / 10}%</div>
        </div>
      </div>

      {/* Table */}
      <div className="section">
        <div className="section-title">Agents personnalises</div>
        {agents.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 48 }}>build</span></div>
            <p className="text-muted">Aucun agent custom cree pour le moment.</p>
            <p className="text-sm text-muted" style={{ marginTop: 8 }}>
              Les agents apparaitront ici quand les utilisateurs en creeront depuis leur espace.
            </p>
          </div>
        ) : (
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Agent</th>
                  <th>Role</th>
                  <th className="hide-mobile">Domaine</th>
                  <th className="hide-mobile">Tone</th>
                  <th>Autonomie</th>
                  <th>Statut</th>
                  <th className="hide-mobile">Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {agents.map(a => (
                  <tr key={a.id}>
                    <td>
                      <div className="font-semibold text-sm">{a.displayName || '—'}</div>
                      <div className="text-xs text-muted">{a.email}</div>
                    </td>
                    <td>
                      <span className="material-symbols-rounded" style={{ fontSize: 16, marginRight: 6 }}>smart_toy</span>
                      <span className="font-semibold">{a.name}</span>
                    </td>
                    <td className="text-sm">{a.role || '—'}</td>
                    <td className="text-sm hide-mobile">{a.domain || '—'}</td>
                    <td className="text-sm hide-mobile">{a.tone || '—'}</td>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <div style={{
                          flex: 1,
                          height: 6,
                          background: 'var(--border, #e5e7eb)',
                          borderRadius: 3,
                          overflow: 'hidden',
                          minWidth: 60,
                        }}>
                          <div style={{
                            width: `${Math.min(100, a.autonomyLevel ?? 0)}%`,
                            height: '100%',
                            background: (a.autonomyLevel ?? 0) >= 70 ? '#1A1A1A' : (a.autonomyLevel ?? 0) >= 40 ? '#9B9B9B' : '#DC2626',
                            borderRadius: 3,
                          }} />
                        </div>
                        <span className="text-xs text-muted">{a.autonomyLevel ?? 0}%</span>
                      </div>
                    </td>
                    <td>
                      <span className={`badge ${a.isActive ? 'badge-success' : 'badge-neutral'}`}>
                        {a.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="text-sm text-muted hide-mobile">{a.createdAt ? fmt(a.createdAt) : '—'}</td>
                    <td className="text-right">
                      <CustomAgentActions agentId={a.id} isActive={a.isActive} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
