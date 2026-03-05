import { api } from '@/lib/api-client';
import DocumentActions from './DocumentActions';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

function fmt(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function fmtBytes(bytes: number): string {
  if (bytes < 1024) return `${bytes} o`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} Ko`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} Mo`;
}

function truncate(s: string, max: number): string {
  if (!s) return '—';
  return s.length > max ? s.slice(0, max) + '...' : s;
}

interface DocEntry {
  id: string;
  filename: string;
  fileType: string;
  sizeBytes: number;
  tokenEstimate: number;
  agentContext: string;
  createdAt: string;
  email: string;
  displayName: string;
}

interface TypeCount { file_type: string; count: number }
interface ContextCount { agent_context: string; count: number }

export default async function DocumentsPage() {
  let documents: DocEntry[] = [];
  let stats = { total: 0, usersCount: 0, totalBytes: 0, totalTokens: 0 };
  let byType: TypeCount[] = [];
  let byContext: ContextCount[] = [];

  try {
    const result = await api.getAdminDocuments();
    documents = (result?.documents ?? []) as unknown as DocEntry[];
    stats = {
      total: result?.stats?.total ?? 0,
      usersCount: result?.stats?.usersCount ?? 0,
      totalBytes: result?.stats?.totalBytes ?? 0,
      totalTokens: result?.stats?.totalTokens ?? 0,
    };
    byType = (result?.byType ?? []) as TypeCount[];
    byContext = (result?.byContext ?? []) as ContextCount[];
  } catch { /* empty */ }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Pilotage Documents</h1>
          <p className="page-subtitle">Tous les documents uploades par les utilisateurs</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 section">
        <div className="stat-card">
          <div className="stat-label">Total docs</div>
          <div className="stat-value">{stats.total}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Utilisateurs</div>
          <div className="stat-value text-accent">{stats.usersCount}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Stockage total</div>
          <div className="stat-value">{fmtBytes(stats.totalBytes)}</div>
        </div>
        <div className="stat-card">
          <div className="stat-label">Tokens indexes</div>
          <div className="stat-value text-warning">{stats.totalTokens.toLocaleString('fr-FR')}</div>
        </div>
      </div>

      {/* Distributions */}
      {(byType.length > 0 || byContext.length > 0) && (
        <div className="section" style={{ display: 'flex', flexWrap: 'wrap', gap: 24 }}>
          {byType.length > 0 && (
            <div>
              <div className="text-sm text-muted font-semibold" style={{ marginBottom: 8 }}>Par type</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {byType.map(t => (
                  <span key={t.file_type} className="badge badge-neutral">
                    {(t.file_type || 'autre').toUpperCase()} ({t.count})
                  </span>
                ))}
              </div>
            </div>
          )}
          {byContext.length > 0 && (
            <div>
              <div className="text-sm text-muted font-semibold" style={{ marginBottom: 8 }}>Par contexte</div>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                {byContext.map(c => (
                  <span key={c.agent_context} className="badge badge-warning">
                    {c.agent_context || 'general'} ({c.count})
                  </span>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Table */}
      <div className="section">
        <div className="section-title">Documents</div>
        {documents.length === 0 ? (
          <div className="card" style={{ padding: 48, textAlign: 'center' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>&#x1F4C4;</div>
            <p className="text-muted">Aucun document uploade pour le moment.</p>
            <p className="text-sm text-muted" style={{ marginTop: 8 }}>
              Les documents apparaitront ici quand les utilisateurs en ajouteront.
            </p>
          </div>
        ) : (
          <div className="card table-responsive" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>User</th>
                  <th>Fichier</th>
                  <th>Type</th>
                  <th className="text-right">Taille</th>
                  <th className="text-right hide-mobile">Tokens</th>
                  <th className="hide-mobile">Contexte</th>
                  <th className="hide-mobile">Date</th>
                  <th className="text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {documents.map(d => (
                  <tr key={d.id}>
                    <td>
                      <div className="font-semibold text-sm">{d.displayName || '—'}</div>
                      <div className="text-xs text-muted">{d.email}</div>
                    </td>
                    <td className="text-sm" title={d.filename}>{truncate(d.filename, 30)}</td>
                    <td>
                      <span className="badge badge-neutral" style={{ textTransform: 'uppercase', fontSize: 10 }}>
                        {d.fileType || '?'}
                      </span>
                    </td>
                    <td className="text-right text-sm">{fmtBytes(d.sizeBytes ?? 0)}</td>
                    <td className="text-right text-sm hide-mobile">{(d.tokenEstimate ?? 0).toLocaleString('fr-FR')}</td>
                    <td className="hide-mobile">
                      {d.agentContext ? (
                        <span className="badge badge-warning">{d.agentContext}</span>
                      ) : (
                        <span className="text-muted text-xs">—</span>
                      )}
                    </td>
                    <td className="text-sm text-muted hide-mobile">{d.createdAt ? fmt(d.createdAt) : '—'}</td>
                    <td className="text-right">
                      <DocumentActions documentId={d.id} filename={d.filename} />
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
