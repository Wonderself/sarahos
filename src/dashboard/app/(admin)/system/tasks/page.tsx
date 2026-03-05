import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function TasksPage() {
  let tasks: Record<string, unknown>[] = [];
  let roadmap: Record<string, unknown> | undefined;
  let error: string | undefined;

  try {
    [tasks, roadmap] = await Promise.all([
      api.getTasks().catch(() => []),
      api.getRoadmapTasks().catch(() => undefined),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load tasks';
  }

  if (error) {
    return (
      <div className="admin-page-scrollable">
        <div className="page-header"><h1 className="page-title">Taches</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const taskList = Array.isArray(tasks) ? tasks : [];
  const roadmapTasks = (roadmap?.['tasks'] as Record<string, unknown>[]) ?? [];
  const currentPhase = Number(roadmap?.['currentPhase'] ?? 10);

  const priorityBadge: Record<string, string> = {
    high: 'badge-danger', medium: 'badge-warning', low: 'badge-info',
    critical: 'badge-danger', CRITICAL: 'badge-danger', HIGH: 'badge-danger', MEDIUM: 'badge-warning', LOW: 'badge-info',
  };

  const priorityOrder: Record<string, number> = { critical: 0, CRITICAL: 0, high: 1, HIGH: 1, medium: 2, MEDIUM: 2, low: 3, LOW: 3 };

  // Group roadmap tasks by phase
  const phases = new Map<number, typeof roadmapTasks>();
  roadmapTasks.forEach(t => {
    const phase = Number(t['phase'] ?? 0);
    if (!phases.has(phase)) phases.set(phase, []);
    phases.get(phase)!.push(t);
  });
  const sortedPhases = Array.from(phases.entries()).sort((a, b) => b[0] - a[0]);

  const completedCount = roadmapTasks.filter(t => t['completed'] === true).length;
  const totalCount = roadmapTasks.length;
  const completionPct = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Taches & Roadmap</h1>
          <p className="page-subtitle">Scheduler interne et roadmap produit — Phase {currentPhase}</p>
        </div>
      </div>

      {/* Roadmap Stats */}
      {totalCount > 0 && (
        <div className="grid-4 section">
          <div className="stat-card">
            <span className="stat-label">Phase actuelle</span>
            <span className="stat-value stat-value-sm text-accent">{currentPhase}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Taches Roadmap</span>
            <span className="stat-value stat-value-sm">{totalCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Completees</span>
            <span className="stat-value stat-value-sm text-success">{completedCount}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Progression</span>
            <span className={`stat-value stat-value-sm ${completionPct >= 80 ? 'text-success' : 'text-warning'}`}>{completionPct}%</span>
            <div className="progress-bar" style={{ marginTop: 6 }}>
              <div className="progress-bar-fill" style={{ width: `${completionPct}%`, background: completionPct >= 80 ? 'var(--success)' : 'var(--accent)' }} />
            </div>
          </div>
        </div>
      )}

      {/* Active Tasks */}
      <div className="section">
        <div className="section-title">
          Taches Actives <span className="section-subtitle">— {taskList.length}</span>
        </div>
        {taskList.length > 0 ? (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="data-table">
              <thead>
                <tr><th>Nom</th><th>Priorite</th><th>Assigne par</th><th>Statut</th></tr>
              </thead>
              <tbody>
                {taskList.map((task, i) => (
                  <tr key={String(task['id'] ?? i)}>
                    <td className="font-medium">{String(task['name'] ?? task['title'] ?? `Task ${i}`)}</td>
                    <td>
                      <span className={`badge ${priorityBadge[String(task['priority'] ?? 'medium')] ?? 'badge-neutral'}`}>
                        {String(task['priority'] ?? 'medium')}
                      </span>
                    </td>
                    <td className="text-sm text-tertiary">{String(task['assignedBy'] ?? '—')}</td>
                    <td><span className="badge badge-accent">{String(task['status'] ?? 'pending')}</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="card">
            <div className="empty-state">
              <div className="empty-state-icon">◒</div>
              <div className="empty-state-text">Aucune tache active</div>
              <div className="empty-state-sub">Les agents creent automatiquement des taches via POST /tasks</div>
            </div>
          </div>
        )}
      </div>

      {/* Roadmap by Phase */}
      {sortedPhases.length > 0 && (
        <div className="section">
          <div className="section-title">Roadmap par Phase</div>
          {sortedPhases.map(([phase, phaseTasks]) => {
            const phaseCompleted = phaseTasks.filter(t => t['completed'] === true).length;
            const phasePct = phaseTasks.length > 0 ? Math.round((phaseCompleted / phaseTasks.length) * 100) : 0;
            const isCurrent = phase === currentPhase;
            const sorted = [...phaseTasks].sort((a, b) => (priorityOrder[String(a['priority'])] ?? 5) - (priorityOrder[String(b['priority'])] ?? 5));

            return (
              <div key={phase} className="card mb-12" style={{ borderColor: isCurrent ? 'var(--accent)' : 'var(--border-primary)' }}>
                <div className="flex flex-between items-center mb-12">
                  <div className="flex items-center gap-8">
                    <span className="flex-center font-bold text-base rounded-md" style={{
                      display: 'inline-flex', width: 32, height: 32,
                      background: isCurrent ? 'var(--accent)' : 'var(--bg-tertiary)',
                      color: isCurrent ? 'white' : 'var(--text-muted)',
                    }}>
                      {phase}
                    </span>
                    <div>
                      <div className="text-base font-bold">Phase {phase}</div>
                      <div className="text-xs text-muted">{phaseCompleted}/{phaseTasks.length} taches — {phasePct}%</div>
                    </div>
                  </div>
                  <div className="flex items-center gap-8">
                    {isCurrent && <span className="badge badge-accent">Actuelle</span>}
                    {phasePct === 100 && <span className="badge badge-success">Complete</span>}
                  </div>
                </div>
                <div className="progress-bar mb-12" style={{ height: 4 }}>
                  <div className="progress-bar-fill" style={{ width: `${phasePct}%`, background: phasePct === 100 ? 'var(--success)' : 'var(--accent)' }} />
                </div>
                <div className="flex flex-col gap-4">
                  {sorted.map((t, i) => {
                    const done = t['completed'] === true;
                    return (
                      <div key={String(t['id'] ?? i)} className="flex items-center gap-8 rounded-sm" style={{
                        padding: '6px 10px',
                        background: done ? 'transparent' : 'var(--bg-secondary)',
                        opacity: done ? 0.5 : 1,
                      }}>
                        <span className="flex-center font-bold rounded-sm" style={{
                          width: 18, height: 18, fontSize: 10, flexShrink: 0,
                          background: done ? 'var(--success)' : 'var(--bg-tertiary)', color: done ? 'white' : 'var(--text-muted)',
                        }}>
                          {done ? '✓' : '○'}
                        </span>
                        <span className="flex-1 text-md font-medium" style={{ textDecoration: done ? 'line-through' : 'none' }}>
                          {String(t['id'] ?? '')} — {String(t['title'] ?? `Task ${i}`)}
                        </span>
                        <span className={`badge ${priorityBadge[String(t['priority'] ?? 'medium')] ?? 'badge-neutral'}`} style={{ fontSize: 10 }}>
                          {String(t['priority'] ?? 'medium')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <div className="text-xs text-muted mt-8">
        API: POST /tasks | GET /tasks | GET /tasks/:id | DELETE /tasks/:id | GET /roadmap/tasks
      </div>
    </div>
  );
}
