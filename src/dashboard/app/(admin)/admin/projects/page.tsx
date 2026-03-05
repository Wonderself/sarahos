import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

interface Project {
  id: string;
  name: string;
  description: string;
  isDefault: boolean;
  isActive: boolean;
  createdAt: string;
  email: string;
  displayName: string;
}

interface ProjectsData {
  projects: Project[];
  stats: { total: number; active: number; usersCount: number };
}

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function ProjectsPage() {
  let data: ProjectsData = { projects: [], stats: { total: 0, active: 0, usersCount: 0 } };
  try {
    data = await api.getAdminProjects() as unknown as ProjectsData;
  } catch { /* empty */ }

  const { projects, stats } = data;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pilotage Projets</h1>
          <p className="page-subtitle">Vue d&apos;ensemble de tous les projets utilisateurs</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-3 section">
        <div className="stat-card">
          <span className="stat-label">Total projets</span>
          <span className="stat-value stat-value-sm">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Projets actifs</span>
          <span className="stat-value stat-value-sm text-success">{stats.active}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Users avec projets</span>
          <span className="stat-value stat-value-sm">{stats.usersCount}</span>
        </div>
      </div>

      {/* Table */}
      <div className="section">
        <div className="section-title">Tous les projets ({projects.length})</div>
        {projects.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📁</div>
            <div>Aucun projet enregistré pour l&apos;instant.</div>
          </div>
        ) : (
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Nom du projet</th>
                  <th className="hide-mobile">Description</th>
                  <th>Défaut?</th>
                  <th>Actif?</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {projects.map(p => (
                  <tr key={p.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{p.displayName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{p.email}</div>
                    </td>
                    <td className="font-semibold">{p.name}</td>
                    <td className="hide-mobile text-sm text-muted">
                      {p.description ? (p.description.length > 50 ? p.description.slice(0, 50) + '...' : p.description) : '—'}
                    </td>
                    <td>
                      <span className={`badge ${p.isDefault ? 'badge-success' : 'badge-neutral'}`}>
                        {p.isDefault ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${p.isActive ? 'badge-success' : 'badge-danger'}`}>
                        {p.isActive ? 'Actif' : 'Inactif'}
                      </span>
                    </td>
                    <td className="text-right text-sm text-muted">{fmt(p.createdAt)}</td>
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
