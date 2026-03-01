import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';

export default async function MemoryPage() {
  let memories: Record<string, unknown>[] = [];
  let error: string | undefined;

  try {
    memories = await api.searchMemory('*').catch(() => []);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load memories';
  }

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Memoire</h1>
          <p className="page-subtitle">Base de connaissances vectorielle — souvenirs et apprentissages</p>
        </div>
        <div className="page-actions">
          <span className="badge badge-accent text-sm">
            {memories.length} entrees
          </span>
        </div>
      </div>

      {error && <div className="alert alert-danger mb-24">{error}</div>}

      {memories.length > 0 ? (
        <div className="section">
          <div className="card" style={{ padding: 0 }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Contenu</th>
                  <th>Source</th>
                  <th>Type</th>
                  <th>Score</th>
                </tr>
              </thead>
              <tbody>
                {memories.slice(0, 50).map((mem, i) => (
                  <tr key={String(mem['id'] ?? i)}>
                    <td className="truncate" style={{ maxWidth: 500 }}>
                      {String(mem['content'] ?? mem['text'] ?? mem['key'] ?? '—').slice(0, 200)}
                    </td>
                    <td className="text-sm text-tertiary">
                      {String(mem['source'] ?? mem['agent'] ?? '—')}
                    </td>
                    <td>
                      <span className="badge badge-neutral">{String(mem['type'] ?? mem['category'] ?? 'general')}</span>
                    </td>
                    <td className="text-sm">
                      {mem['score'] != null ? Number(mem['score']).toFixed(3) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="card">
          <div className="empty-state">
            <div className="empty-state-icon">🧠</div>
            <div className="empty-state-text">Aucun souvenir enregistre</div>
            <div className="empty-state-sub">Les agents stockent automatiquement leurs apprentissages via POST /memory/store</div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted mt-8">
        API: POST /memory/search | POST /memory/store | GET /memory/stats
      </div>
    </div>
  );
}
