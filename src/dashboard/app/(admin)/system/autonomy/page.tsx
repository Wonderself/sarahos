import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function AutonomyPage() {
  let report: Record<string, unknown> | undefined;
  let scheduler: Record<string, unknown>[] | undefined;
  let improvements: Record<string, unknown>[] | undefined;
  let error: string | undefined;

  try {
    [report, scheduler, improvements] = await Promise.all([
      api.getAutonomyReport(),
      api.getSchedulerTasks().catch(() => []),
      api.getImprovementHistory().catch(() => []),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load autonomy data';
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Autonomie</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const score = Number(report?.['score'] ?? 0);
  const factors = (report?.['factors'] as Array<{ name: string; maxPoints: number; currentPoints: number; details: string }>) ?? [];
  const scoreColor = score >= 70 ? 'var(--success)' : score >= 40 ? 'var(--warning)' : 'var(--danger)';
  const level = score >= 80 ? 'Autonome' : score >= 60 ? 'Semi-autonome' : score >= 40 ? 'Assiste' : 'Manuel';

  const recommendations = (report?.['recommendations'] as string[]) ?? [];
  const capabilities = (report?.['capabilities'] as Record<string, unknown>) ?? {};
  const capEntries = Object.entries(capabilities);

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Autonomie du Systeme</h1>
          <p className="page-subtitle">Score de maturite et capacites autonomes</p>
        </div>
        <div className="page-actions">
          <span className="badge" style={{ background: scoreColor + '22', color: scoreColor, fontSize: 14, padding: '6px 16px' }}>
            {level}
          </span>
        </div>
      </div>

      {/* Score + Factors */}
      <div className="grid-2 section">
        <div className="card flex flex-col flex-center" style={{ padding: 40 }}>
          <div className="score-ring" style={{ '--ring-color': scoreColor, '--ring-pct': `${score}%` } as React.CSSProperties}>
            <span className="score-value" style={{ color: scoreColor }}>{score}</span>
            <span className="score-label">/ 100</span>
          </div>
          <div className="mt-16 font-bold" style={{ fontSize: 18 }}>{level}</div>
          <div className="text-sm text-tertiary mt-4">
            {score >= 80 ? 'Le systeme fonctionne de facon autonome' :
             score >= 60 ? 'Intervention humaine minimale requise' :
             score >= 40 ? 'Supervision humaine recommandee' :
             'Intervention humaine frequente necessaire'}
          </div>
        </div>

        <div className="card">
          <div className="text-md font-semibold mb-16">Facteurs ({factors.length})</div>
          {factors.length > 0 ? factors.map((f, i) => {
            const pct = f.maxPoints > 0 ? (f.currentPoints / f.maxPoints) * 100 : 0;
            const color = pct >= 70 ? 'var(--success)' : pct >= 40 ? 'var(--warning)' : 'var(--danger)';
            return (
              <div key={i} className="mb-16">
                <div className="flex flex-between mb-4">
                  <span className="text-md font-medium">{f.name.replace(/_/g, ' ')}</span>
                  <span className="text-md font-bold" style={{ color }}>{f.currentPoints}/{f.maxPoints}</span>
                </div>
                <div className="progress-bar">
                  <div className="progress-bar-fill" style={{ width: `${pct}%`, background: color }} />
                </div>
                <div className="text-xs text-muted mt-4">{f.details}</div>
              </div>
            );
          }) : (
            <div className="text-md text-muted" style={{ fontStyle: 'italic' }}>Aucun facteur disponible</div>
          )}
        </div>
      </div>

      {/* Capabilities + Recommendations */}
      {(capEntries.length > 0 || recommendations.length > 0) && (
        <div className="grid-2 section">
          {capEntries.length > 0 && (
            <div className="card">
              <div className="text-md font-semibold mb-16">Capacites</div>
              <div className="flex flex-col gap-8">
                {capEntries.map(([name, val]) => {
                  const enabled = val === true || val === 'enabled' || (typeof val === 'object' && val !== null && (val as Record<string, unknown>)['enabled'] === true);
                  return (
                    <div key={name} className="flex items-center gap-8" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                      <span className={`dot dot-sm ${enabled ? 'dot-success' : 'dot-muted'}`} />
                      <span className="flex-1 text-md" style={{ textTransform: 'capitalize' }}>{name.replace(/_/g, ' ').replace(/([A-Z])/g, ' $1')}</span>
                      <span className={`badge ${enabled ? 'badge-success' : 'badge-neutral'}`}>{enabled ? 'Actif' : 'Inactif'}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {recommendations.length > 0 && (
            <div className="card">
              <div className="text-md font-semibold mb-16">Recommandations</div>
              <div className="flex flex-col gap-8">
                {recommendations.map((rec, i) => (
                  <div key={i} className="text-md text-secondary leading-relaxed rounded-sm bg-secondary p-12" style={{
                    borderLeft: '3px solid var(--accent)',
                  }}>
                    {rec}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Scheduler + Improvements */}
      <div className="grid-2 section">
        <div className="card">
          <div className="text-md font-semibold mb-16">
            Taches Planifiees <span className="section-subtitle">— {scheduler?.length ?? 0}</span>
          </div>
          {scheduler && scheduler.length > 0 ? (
            <div className="flex flex-col gap-8">
              {scheduler.map((task, i) => (
                <div key={i} className="flex flex-between items-center" style={{ padding: '8px 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <div>
                    <div className="text-md font-medium">{String(task['name'] ?? `Task ${i}`)}</div>
                    {task['lastRun'] ? (
                      <div className="text-xs text-muted">
                        Dernier: {new Date(String(task['lastRun'])).toLocaleString('fr-FR')}
                      </div>
                    ) : null}
                  </div>
                  <div className="flex gap-6">
                    {task['intervalMs'] ? (
                      <span className="badge badge-neutral">toutes les {Math.round(Number(task['intervalMs']) / 60000)}min</span>
                    ) : null}
                    {task['enabled'] !== false ? <span className="badge badge-success">Actif</span> : null}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text">Aucune tache planifiee</div>
            </div>
          )}
        </div>

        <div className="card">
          <div className="text-md font-semibold mb-16">
            Historique Ameliorations <span className="section-subtitle">— {improvements?.length ?? 0}</span>
          </div>
          {improvements && improvements.length > 0 ? (
            <div className="flex flex-col gap-8">
              {improvements.slice(0, 15).map((imp, i) => (
                <div key={i} className="rounded-sm bg-secondary p-12" style={{
                  borderLeft: '3px solid var(--success)',
                }}>
                  <div className="flex flex-between items-center mb-4">
                    <span className="text-md font-semibold">
                      {String(imp['type'] ?? imp['action'] ?? imp['title'] ?? `Amelioration ${i + 1}`)}
                    </span>
                    {imp['timestamp'] ? (
                      <span className="text-xs text-muted">
                        {new Date(String(imp['timestamp'])).toLocaleString('fr-FR')}
                      </span>
                    ) : null}
                  </div>
                  {imp['description'] ? (
                    <div className="text-sm text-secondary leading-relaxed">{String(imp['description'])}</div>
                  ) : null}
                  {imp['result'] ? (
                    <span className={`badge ${imp['result'] === 'success' ? 'badge-success' : 'badge-warning'} mt-4`}>
                      {String(imp['result'])}
                    </span>
                  ) : null}
                </div>
              ))}
            </div>
          ) : (
            <div className="empty-state">
              <div className="empty-state-text">Aucun cycle d&apos;amelioration execute</div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
