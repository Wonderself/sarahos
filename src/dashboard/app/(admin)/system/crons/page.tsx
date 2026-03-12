import { api } from '@/lib/api-client';
import CronActions from './CronActions';

export const dynamic = 'force-dynamic';
export const revalidate = 30;

interface CronEntry {
  name: string;
  description: string;
  intervalLabel: string;
  intervalMs: number;
  lastRun: string | null;
  lastStatus: string | null;
  lastDurationMs: number | null;
}

function statusBadge(status: string | null) {
  if (!status) return <span className="badge badge-neutral">Jamais exécuté</span>;
  if (status === 'success') return <span className="badge badge-success">✅ Succes</span>;
  if (status === 'error') return <span className="badge badge-danger">❌ Erreur</span>;
  if (status === 'manual_trigger') return <span className="badge badge-info">🖱️ Manuel</span>;
  return <span className="badge badge-neutral">{status}</span>;
}

function fmt(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default async function CronsPage() {
  let crons: CronEntry[] = [];
  try {
    crons = await api.get<CronEntry[]>('/admin/crons');
  } catch { /* empty */ }

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Cron Jobs</h1>
          <p className="page-subtitle">{crons.length} jobs planifiés — historique et déclenchement manuel</p>
        </div>
      </div>

      <div className="section cron-table-wrap card" style={{ padding: 0 }}>
        <table className="data-table">
          <thead>
            <tr>
              <th>Job</th>
              <th className="hide-mobile">Description</th>
              <th>Intervalle</th>
              <th>Statut</th>
              <th className="hide-mobile">Dernière exéc.</th>
              <th className="hide-mobile">Durée</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {crons.length === 0 ? (
              <tr>
                <td colSpan={7} style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '32px' }}>
                  Aucun cron job (backend hors ligne ?)
                </td>
              </tr>
            ) : crons.map(cron => (
              <tr key={cron.name}>
                <td>
                  <code style={{ fontSize: 11, color: 'var(--accent)' }}>{cron.name.replace(/_/g, '_\u200b')}</code>
                  <div className="text-xs text-muted show-mobile" style={{ marginTop: 2 }}>{fmt(cron.lastRun)}</div>
                </td>
                <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text-secondary)', maxWidth: 220 }}>{cron.description}</td>
                <td>
                  <span className="badge badge-neutral">{cron.intervalLabel}</span>
                </td>
                <td>{statusBadge(cron.lastStatus)}</td>
                <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>{fmt(cron.lastRun)}</td>
                <td className="hide-mobile" style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {cron.lastDurationMs !== null ? `${cron.lastDurationMs}ms` : '—'}
                </td>
                <td>
                  <CronActions jobName={cron.name} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="text-xs text-muted">
        Les crons tournent dans le processus backend Node.js. "Run now" exécute le job directement via le backend.
      </div>
    </div>
  );
}
