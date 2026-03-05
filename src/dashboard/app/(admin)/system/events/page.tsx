import { api, type EventEntry } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

const typeColors: Record<string, string> = {
  TaskCreated: 'badge-info',
  TaskCompleted: 'badge-success',
  AgentStarted: 'badge-accent',
  AgentStopped: 'badge-neutral',
  Error: 'badge-danger',
  ApprovalRequested: 'badge-warning',
  ApprovalDecided: 'badge-success',
  SystemBoot: 'badge-purple',
  LLMCall: 'badge-accent',
  CronRun: 'badge-neutral',
  NotificationSent: 'badge-info',
};

const typeIcons: Record<string, string> = {
  TaskCreated: '📝', TaskCompleted: '✅', AgentStarted: '🤖', AgentStopped: '⏹️',
  Error: '❌', ApprovalRequested: '⏳', ApprovalDecided: '✔️', SystemBoot: '🚀',
  LLMCall: '🧠', CronRun: '⏰', NotificationSent: '📤',
};

export default async function EventsPage() {
  let events: EventEntry[] = [];
  let stats: Record<string, unknown> | undefined;
  let error: string | undefined;

  try {
    [events, stats] = await Promise.all([
      api.getEvents(100),
      api.getEventStats().catch(() => undefined),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load events';
  }

  if (error) {
    return (
      <div className="admin-page-scrollable">
        <div className="page-header"><h1 className="page-title">Événements</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  // Count by type
  const typeCounts: Record<string, number> = {};
  events.forEach(e => { typeCounts[e.type] = (typeCounts[e.type] ?? 0) + 1; });
  const topTypes = Object.entries(typeCounts).sort((a, b) => b[1] - a[1]).slice(0, 8);

  // Extract stats info
  const statsEntries: Array<{ label: string; value: string }> = [];
  if (stats) {
    if (stats['totalEvents'] !== undefined) statsEntries.push({ label: 'Total événements', value: String(stats['totalEvents']) });
    if (stats['eventsToday'] !== undefined) statsEntries.push({ label: 'Aujourd\'hui', value: String(stats['eventsToday']) });
    if (stats['eventsThisHour'] !== undefined) statsEntries.push({ label: 'Cette heure', value: String(stats['eventsThisHour']) });
    if (stats['errorCount'] !== undefined) statsEntries.push({ label: 'Erreurs', value: String(stats['errorCount']) });
    if (stats['avgPerDay'] !== undefined) statsEntries.push({ label: 'Moyenne/jour', value: String(stats['avgPerDay']) });
    // Handle generic key-value for any other stats
    for (const [k, v] of Object.entries(stats)) {
      if (typeof v === 'number' || typeof v === 'string') {
        if (!statsEntries.find(e => e.label.toLowerCase().includes(k.toLowerCase()))) {
          statsEntries.push({ label: k.replace(/([A-Z])/g, ' $1').replace(/_/g, ' '), value: String(v) });
        }
      }
    }
  }

  // Group by time (last hour, today, older)
  const now = Date.now();
  const oneHourAgo = now - 3600000;
  const todayStart = new Date().setHours(0, 0, 0, 0);
  const recentEvents = events.filter(e => new Date(e.timestamp).getTime() > oneHourAgo);
  const todayEvents = events.filter(e => { const t = new Date(e.timestamp).getTime(); return t <= oneHourAgo && t > todayStart; });
  const olderEvents = events.filter(e => new Date(e.timestamp).getTime() <= todayStart);

  function renderPayload(payload: Record<string, unknown>) {
    const entries = Object.entries(payload).filter(([, v]) => v !== null && v !== undefined && v !== '');
    if (entries.length === 0) return <span className="text-muted">—</span>;
    return (
      <div className="flex flex-wrap gap-4">
        {entries.slice(0, 3).map(([k, v]) => (
          <span key={k} className="badge badge-neutral text-mono" style={{ fontSize: 10 }}>
            {k}: {typeof v === 'object' ? '{}' : String(v).slice(0, 30)}
          </span>
        ))}
        {entries.length > 3 && (
          <span className="text-muted" style={{ fontSize: 10 }}>+{entries.length - 3}</span>
        )}
      </div>
    );
  }

  function renderEventGroup(groupEvents: EventEntry[], title: string) {
    if (groupEvents.length === 0) return null;
    return (
      <div className="mb-24">
        <div className="text-sm font-semibold text-muted mb-8" style={{ textTransform: 'uppercase', letterSpacing: 1 }}>
          {title} ({groupEvents.length})
        </div>
        {groupEvents.map((event) => (
          <div key={event.id} className="flex gap-8 rounded-sm p-8" style={{
            alignItems: 'flex-start', marginBottom: 2,
            background: event.type === 'Error' ? 'rgba(239,68,68,0.05)' : 'transparent',
          }}>
            <span style={{ fontSize: 16, marginTop: 2 }}>{typeIcons[event.type] ?? '◉'}</span>
            <div className="flex-1" style={{ minWidth: 0 }}>
              <div className="flex items-center gap-8" style={{ marginBottom: 3 }}>
                <span className={`badge ${typeColors[event.type] ?? 'badge-neutral'}`}>{event.type}</span>
                <span className="text-sm font-medium">{event.sourceAgent}</span>
                {event.targetAgent && (
                  <>
                    <span className="text-xs text-muted">→</span>
                    <span className="text-sm text-tertiary">{event.targetAgent}</span>
                  </>
                )}
                <span className="text-xs text-muted text-mono" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
                  {new Date(event.timestamp).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                </span>
              </div>
              {renderPayload(event.payload)}
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Événements</h1>
          <p className="page-subtitle">Flux temps réel du système — {events.length} derniers événements</p>
        </div>
      </div>

      {/* Stats + Type Distribution */}
      <div className="grid-2 section">
        {/* Type cards */}
        <div className="card">
          <div className="text-md font-semibold mb-16">Distribution par type</div>
          {topTypes.length > 0 ? (
            <div className="flex flex-col gap-8">
              {topTypes.map(([type, count]) => {
                const pct = events.length > 0 ? (count / events.length) * 100 : 0;
                return (
                  <div key={type} className="flex items-center gap-8">
                    <span className="text-base">{typeIcons[type] ?? '◉'}</span>
                    <span className="text-md font-medium" style={{ minWidth: 140 }}>{type}</span>
                    <div className="progress-bar" style={{ flex: 1 }}>
                      <div className="progress-bar-fill" style={{ width: `${pct}%` }} />
                    </div>
                    <span className="text-md font-bold text-right" style={{ minWidth: 30 }}>{count}</span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-md text-muted">Aucun événement</div>
          )}
        </div>

        {/* Stats */}
        <div className="card">
          <div className="text-md font-semibold mb-16">Statistiques</div>
          {statsEntries.length > 0 ? (
            <div className="flex flex-col gap-8">
              {statsEntries.slice(0, 10).map((s, i) => (
                <div key={i} className="flex flex-between border-secondary" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                  <span className="text-md text-secondary" style={{ textTransform: 'capitalize' }}>{s.label}</span>
                  <span className="text-md font-semibold">{s.value}</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid-3" style={{ gap: 8 }}>
              <div className="stat-card">
                <div className="stat-label">Total</div>
                <div className="stat-value stat-value-sm">{events.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Dernière heure</div>
                <div className="stat-value stat-value-sm">{recentEvents.length}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">Types uniques</div>
                <div className="stat-value stat-value-sm">{Object.keys(typeCounts).length}</div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Events Timeline */}
      <div className="section">
        <div className="section-title">Journal des Événements</div>
        <div className="card">
          {renderEventGroup(recentEvents, 'Dernière heure')}
          {renderEventGroup(todayEvents, 'Aujourd\'hui')}
          {renderEventGroup(olderEvents, 'Plus ancien')}
          {events.length === 0 && (
            <div className="empty-state">
              <div className="empty-state-icon">◎</div>
              <div className="empty-state-text">Aucun événement enregistre</div>
            </div>
          )}
        </div>
      </div>

      <div className="text-xs text-muted mt-8">
        API: GET /events/recent?count=N | GET /events/stats | GET /stream/events (SSE)
      </div>
    </div>
  );
}
