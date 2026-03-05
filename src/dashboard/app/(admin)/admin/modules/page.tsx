import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

interface Module {
  id: string;
  name: string;
  slug: string;
  emoji: string;
  type: string;
  isPublished: boolean;
  publicAccess: boolean;
  recordCount: number;
  createdAt: string;
  email: string;
  displayName: string;
}

interface ModulesData {
  modules: Module[];
  stats: { total: number; published: number; publicCount: number; totalRecords: number };
  byType: Array<{ type: string; count: number }>;
}

const TYPE_COLORS: Record<string, string> = {
  form: '#6366f1',
  crm: '#06b6d4',
  agent: '#8b5cf6',
  dashboard: '#f59e0b',
};

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default async function ModulesPage() {
  let data: ModulesData = { modules: [], stats: { total: 0, published: 0, publicCount: 0, totalRecords: 0 }, byType: [] };
  try {
    data = await api.getAdminModules() as unknown as ModulesData;
  } catch { /* empty */ }

  const { modules, stats, byType } = data;

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Pilotage Modules</h1>
          <p className="page-subtitle">Modules créés par les utilisateurs (forms, CRM, agents, dashboards)</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 section">
        <div className="stat-card">
          <span className="stat-label">Total modules</span>
          <span className="stat-value stat-value-sm">{stats.total}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Publiés</span>
          <span className="stat-value stat-value-sm text-success">{stats.published}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Publics</span>
          <span className="stat-value stat-value-sm">{stats.publicCount}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Total records</span>
          <span className="stat-value stat-value-sm">{stats.totalRecords}</span>
        </div>
      </div>

      {/* Type distribution */}
      {byType.length > 0 && (
        <div className="section" style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
          {byType.map(t => (
            <span
              key={t.type}
              className="badge"
              style={{ background: TYPE_COLORS[t.type] ?? '#64748b', color: '#fff' }}
            >
              {t.type}: {t.count}
            </span>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="section">
        <div className="section-title">Tous les modules ({modules.length})</div>
        {modules.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '40px 20px', color: 'var(--text-muted)' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>📦</div>
            <div>Aucun module enregistré pour l&apos;instant.</div>
          </div>
        ) : (
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Nom</th>
                  <th>Type</th>
                  <th>Publié?</th>
                  <th className="text-right hide-mobile">Records</th>
                  <th className="text-right">Date</th>
                </tr>
              </thead>
              <tbody>
                {modules.map(m => (
                  <tr key={m.id}>
                    <td>
                      <div style={{ fontWeight: 500, fontSize: 13 }}>{m.displayName}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{m.email}</div>
                    </td>
                    <td className="font-semibold">
                      {m.emoji ? `${m.emoji} ` : ''}{m.name}
                    </td>
                    <td>
                      <span
                        className="badge"
                        style={{ background: TYPE_COLORS[m.type] ?? '#64748b', color: '#fff' }}
                      >
                        {m.type}
                      </span>
                    </td>
                    <td>
                      <span className={`badge ${m.isPublished ? 'badge-success' : 'badge-neutral'}`}>
                        {m.isPublished ? 'Oui' : 'Non'}
                      </span>
                    </td>
                    <td className="text-right hide-mobile text-sm">{m.recordCount}</td>
                    <td className="text-right text-sm text-muted">{fmt(m.createdAt)}</td>
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
