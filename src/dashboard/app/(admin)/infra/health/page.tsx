import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function InfraHealthPage() {
  let health: Record<string, unknown> | undefined;
  let infraHealth: Record<string, unknown> | undefined;
  let avatarHealth: Record<string, unknown> | undefined;
  let error: string | undefined;

  try {
    [health, infraHealth, avatarHealth] = await Promise.all([
      api.getHealth() as unknown as Promise<Record<string, unknown>>,
      api.getInfraHealth().catch(() => undefined),
      api.getAvatarPipelineHealth().catch(() => undefined),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load health data';
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Infrastructure</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  type ServiceStatus = { name: string; status: string; details?: string; category: string };
  const statuses: ServiceStatus[] = [];

  if (health) {
    statuses.push({ name: 'Backend API', status: 'ok', details: `v${health['version']} Phase ${health['phase']}`, category: 'Core' });
  }

  if (infraHealth) {
    const db = infraHealth['database'] as Record<string, unknown> | undefined;
    const redis = infraHealth['redis'] as Record<string, unknown> | undefined;
    if (db) statuses.push({ name: 'PostgreSQL', status: db['status'] === 'connected' || db['connected'] === true ? 'ok' : 'error', details: String(db['host'] ?? 'localhost:5432'), category: 'Core' });
    if (redis) statuses.push({ name: 'Redis', status: redis['status'] === 'connected' || redis['connected'] === true ? 'ok' : 'error', details: String(redis['host'] ?? 'localhost:6379'), category: 'Core' });
  }

  if (avatarHealth) {
    ['asr', 'tts', 'video', 'telephony', 'bridge'].forEach(svc => {
      const s = avatarHealth[svc] as Record<string, unknown> | undefined;
      statuses.push({ name: `Avatar ${svc.toUpperCase()}`, status: s ? 'ok' : 'unknown', category: 'Avatar' });
    });
  }

  statuses.push({ name: 'Dashboard', status: 'ok', details: 'Next.js :3001', category: 'Core' });

  const okCount = statuses.filter(s => s.status === 'ok').length;

  const version = String(health?.['version'] ?? '?');
  const phase = Number(health?.['phase'] ?? 0);
  const agentsInfo = health?.['agents'] as Record<string, unknown> | undefined;
  const totalAgents = Number(agentsInfo?.['total'] ?? 0);
  const agentEntries = (agentsInfo?.['entries'] as Array<Record<string, unknown>>) ?? [];
  const uptimeRaw = Number(health?.['uptime'] ?? 0);
  const uptimeHours = Math.floor(uptimeRaw / 3600);
  const uptimeMinutes = Math.floor((uptimeRaw % 3600) / 60);
  const uptime = uptimeRaw > 0 ? `${uptimeHours}h ${uptimeMinutes}m` : 'N/A';

  const db = infraHealth?.['database'] as Record<string, unknown> | undefined;
  const redis = infraHealth?.['redis'] as Record<string, unknown> | undefined;
  const persistence = infraHealth?.['persistence'] as Record<string, unknown> | undefined;

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Infrastructure</h1>
          <p className="page-subtitle">Sante de tous les services — temps reel</p>
        </div>
        <div className="page-actions">
          <span className={`badge ${okCount === statuses.length ? 'badge-success' : 'badge-warning'} text-sm`}>
            {okCount}/{statuses.length} OK
          </span>
        </div>
      </div>

      {/* Status Grid */}
      <div className="section">
        <div className="grid-auto">
          {statuses.map(svc => (
            <div key={svc.name} className="card card-compact flex items-center gap-12">
              <span className={svc.status === 'ok' ? 'status-dot' : svc.status === 'error' ? 'status-dot status-dot-error' : 'status-dot status-dot-warning'} />
              <div className="flex-1">
                <div className="text-md font-semibold">{svc.name}</div>
                {svc.details && <div className="text-xs text-tertiary">{svc.details}</div>}
              </div>
              <span className={`badge ${svc.status === 'ok' ? 'badge-success' : svc.status === 'error' ? 'badge-danger' : 'badge-neutral'}`}>
                {svc.status.toUpperCase()}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* System + DB Info */}
      <div className="grid-2 section">
        <div className="card">
          <div className="text-base font-bold mb-16">Systeme</div>
          <div className="flex flex-col" style={{ gap: 10 }}>
            {[
              { label: 'Version', value: version },
              { label: 'Phase', value: String(phase) },
              { label: 'Uptime', value: uptime },
              { label: 'Agents', value: `${totalAgents} enregistres` },
              { label: 'Statut', value: String(health?.['status'] ?? 'ok').toUpperCase() },
            ].map(row => (
              <div key={row.label} className="flex flex-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span className="text-md text-secondary">{row.label}</span>
                <span className="text-md font-semibold">{row.value}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="card">
          <div className="text-base font-bold mb-16">Base de donnees & Cache</div>
          <div className="flex flex-col" style={{ gap: 10 }}>
            {[
              { label: 'PostgreSQL', value: db ? (db['status'] === 'connected' || db['connected'] === true ? 'Connecte' : 'Erreur') : 'N/A' },
              { label: 'DB Host', value: String(db?.['host'] ?? 'localhost:5432') },
              { label: 'Redis', value: redis ? (redis['status'] === 'connected' || redis['connected'] === true ? 'Connecte' : 'Erreur') : 'N/A' },
              { label: 'Redis Host', value: String(redis?.['host'] ?? 'localhost:6379') },
              { label: 'Persistence', value: persistence ? 'Active' : 'N/A' },
            ].map(row => (
              <div key={row.label} className="flex flex-between" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                <span className="text-md text-secondary">{row.label}</span>
                <span className={`text-md font-semibold ${row.value === 'Connecte' || row.value === 'Active' ? 'text-success' : row.value === 'Erreur' ? 'text-danger' : ''}`}>
                  {row.value}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Agents Summary */}
      {agentEntries.length > 0 && (
        <div className="section">
          <div className="section-title">Agents ({totalAgents})</div>
          <div className="card" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr><th>Agent</th><th>Niveau</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {agentEntries.map((agent, i) => {
                  const status = String(agent['status'] ?? 'unknown');
                  const statusBadge = status === 'IDLE' ? 'badge-success' : status === 'BUSY' ? 'badge-warning' : status === 'ERROR' ? 'badge-danger' : 'badge-neutral';
                  return (
                    <tr key={i}>
                      <td className="font-medium">{String(agent['name'] ?? `Agent ${i}`)}</td>
                      <td><span className="badge badge-neutral">L{String(agent['level'] ?? '?')}</span></td>
                      <td><span className={`badge ${statusBadge}`}>{status}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <div className="text-xs text-muted mt-8">
        API: GET /health | GET /infra/health | GET /avatar/pipeline/health
      </div>
    </div>
  );
}
