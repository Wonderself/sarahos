import { api, type TokenUsageResponse } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function MetricsPage() {
  let tokenUsage: TokenUsageResponse | undefined;
  let state: Record<string, unknown> | undefined;
  let error: string | undefined;

  try {
    [tokenUsage, state] = await Promise.all([
      api.getTokenUsage(),
      api.getState(),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load metrics';
  }

  if (error || !tokenUsage) {
    return (
      <div className="admin-page-scrollable">
        <div className="page-header"><h1 className="page-title">Metriques</h1></div>
        <div className="alert alert-danger">{error ?? 'No data'}</div>
      </div>
    );
  }

  const avatarSystem = state?.['avatar_system'] as Record<string, unknown> | undefined;

  // Sort agents by usage
  const agentUsage = Object.entries(tokenUsage.byAgent).sort((a, b) => b[1] - a[1]);
  const modelUsage = Object.entries(tokenUsage.byModel).sort((a, b) => b[1] - a[1]);
  const maxAgentTokens = agentUsage.length > 0 ? agentUsage[0][1] : 1;

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Metriques Systeme</h1>
          <p className="page-subtitle">Consommation tokens, performances et pipeline</p>
        </div>
      </div>

      {/* KPIs */}
      <div className="grid-4 section">
        <div className="stat-card">
          <span className="stat-label">Total Tokens</span>
          <span className="stat-value stat-value-sm">{tokenUsage.total.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Moyenne / Jour</span>
          <span className="stat-value stat-value-sm text-accent">{tokenUsage.dailyAverage.toLocaleString()}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Modeles Utilises</span>
          <span className="stat-value stat-value-sm">{Object.keys(tokenUsage.byModel).length}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Agents Actifs</span>
          <span className="stat-value stat-value-sm text-success">{agentUsage.length}</span>
        </div>
      </div>

      <div className="grid-2 section">
        {/* By Agent */}
        <div className="card">
          <div className="text-md font-semibold mb-16">Consommation par Agent</div>
          {agentUsage.map(([agent, tokens]) => (
            <div key={agent} style={{ marginBottom: 10 }}>
              <div className="flex flex-between" style={{ marginBottom: 4 }}>
                <span className="text-sm font-medium">{agent}</span>
                <span className="text-sm font-bold text-mono">{tokens.toLocaleString()}</span>
              </div>
              <div className="progress-bar">
                <div className="progress-bar-fill" style={{ width: `${(tokens / maxAgentTokens) * 100}%`, background: 'var(--accent)' }} />
              </div>
            </div>
          ))}
          {agentUsage.length === 0 && <div className="empty-state"><div className="empty-state-text">Aucune donnee</div></div>}
        </div>

        {/* By Model */}
        <div className="card">
          <div className="text-md font-semibold mb-16">Consommation par Modele</div>
          {modelUsage.map(([model, tokens]) => (
            <div key={model} className="flex-between" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-primary)' }}>
              <div>
                <span className="text-md font-medium">{model}</span>
              </div>
              <span className="text-base font-bold text-mono text-accent">
                {tokens.toLocaleString()}
              </span>
            </div>
          ))}
          {modelUsage.length === 0 && <div className="empty-state"><div className="empty-state-text">Aucune donnee</div></div>}
        </div>
      </div>

      {/* Avatar Pipeline Metrics */}
      {avatarSystem && (
        <div className="section">
          <div className="section-title">Avatar Pipeline</div>
          <div className="grid-4">
            <div className="stat-card">
              <span className="stat-label">ASR Aujourd&apos;hui</span>
              <span className="stat-value stat-value-sm">{String(avatarSystem['asr_requests_today'] ?? 0)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Appels Actifs</span>
              <span className="stat-value stat-value-sm">{String(avatarSystem['active_calls'] ?? 0)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Conversations</span>
              <span className="stat-value stat-value-sm">{String(avatarSystem['active_conversations'] ?? 0)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Latence Moy.</span>
              <span className="stat-value stat-value-sm">{String(avatarSystem['pipeline_latency_avg_ms'] ?? 0)}ms</span>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted mt-8">
        API: GET /tokens/usage | GET /state | GET /avatar/pipeline/metrics
      </div>
    </div>
  );
}
