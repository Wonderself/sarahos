import { api } from '@/lib/api-client';

export const dynamic = 'force-dynamic';
export const revalidate = 10;

export default async function AvatarPage() {
  let pipelineHealth: Record<string, unknown> | undefined;
  let metrics: Record<string, unknown> | undefined;
  let personas: Record<string, unknown>[] | undefined;
  let conversations: Record<string, unknown>[] | undefined;
  let calls: Record<string, unknown>[] | undefined;
  let error: string | undefined;

  try {
    [pipelineHealth, metrics, personas, conversations, calls] = await Promise.all([
      api.getAvatarPipelineHealth(),
      api.getAvatarMetrics(),
      api.getAvatarPersonas().catch(() => []),
      api.getAvatarConversations().catch(() => []),
      api.getAvatarCalls().catch(() => []),
    ]);
  } catch (e) {
    error = e instanceof Error ? e.message : 'Failed to load avatar data';
  }

  if (error) {
    return (
      <div>
        <div className="page-header"><h1 className="page-title">Avatar Pipeline</h1></div>
        <div className="alert alert-danger">{error}</div>
      </div>
    );
  }

  const services = ['asr', 'tts', 'video', 'telephony', 'bridge'];
  const personaList = Array.isArray(personas) ? personas : [];
  const convList = Array.isArray(conversations) ? conversations : [];
  const callList = Array.isArray(calls) ? calls : [];

  return (
    <div>
      <div className="page-header">
        <div>
          <h1 className="page-title">Avatar Pipeline</h1>
          <p className="page-subtitle">Services voix, video et telephonie — Sarah & Emmanuel</p>
        </div>
      </div>

      {/* Service Health */}
      <div className="section">
        <div className="section-title">Sante des Services</div>
        <div className="grid-5">
          {services.map(service => {
            const health = pipelineHealth?.[service] as Record<string, unknown> | undefined;
            const isUp = !!health;
            return (
              <div key={service} className="card card-compact text-center">
                <div className="mb-8">
                  <span className={isUp ? 'status-dot' : 'status-dot status-dot-error'} style={{ display: 'inline-block' }} />
                </div>
                <div className="text-sm font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>{service}</div>
                <div className={`text-xs mt-4 ${isUp ? 'text-success' : 'text-muted'}`}>
                  {isUp ? 'Operational' : 'Offline'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Metrics */}
      <div className="section">
        <div className="section-title">Metriques Pipeline</div>
        <div className="grid-4">
          <div className="stat-card">
            <span className="stat-label">Latence Moy.</span>
            <span className="stat-value stat-value-sm">{Number(metrics?.['averageLatencyMs'] ?? 0)}ms</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Tokens / Tour</span>
            <span className="stat-value stat-value-sm">{Number(metrics?.['averageTokensPerTurn'] ?? 0)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Total Tours</span>
            <span className="stat-value stat-value-sm">{Number(metrics?.['totalTurns'] ?? 0)}</span>
          </div>
          <div className="stat-card">
            <span className="stat-label">Sessions</span>
            <span className="stat-value stat-value-sm">{Number(metrics?.['totalSessions'] ?? 0)}</span>
          </div>
        </div>
      </div>

      <div className="grid-2 section">
        {/* Personas */}
        <div className="card">
          <div className="text-md font-semibold mb-16">Personas</div>
          {personaList.length > 0 ? personaList.map((p, i) => (
            <div key={i} className="flex items-center gap-12" style={{ padding: '10px 0', borderBottom: '1px solid var(--border-primary)' }}>
              <div className="avatar" style={{ background: String(p['name']).toLowerCase().includes('sarah') ? 'linear-gradient(135deg, #ec4899, #a855f7)' : 'linear-gradient(135deg, #3b82f6, #6366f1)' }}>
                {String(p['name'] ?? '?')[0]}
              </div>
              <div>
                <div className="text-md font-semibold">{String(p['name'] ?? `Persona ${i}`)}</div>
                <div className="text-xs text-tertiary">{String(p['role'] ?? p['description'] ?? '')}</div>
              </div>
            </div>
          )) : (
            <div className="text-md text-tertiary">Sarah (DG) et Emmanuel (CEO)</div>
          )}
        </div>

        {/* Active Conversations & Calls */}
        <div className="card">
          <div className="text-md font-semibold mb-16">
            Sessions Actives
            <span className="section-subtitle"> — {convList.length} conv, {callList.length} appels</span>
          </div>
          {convList.length > 0 ? (
            <div className="mb-16">
              {convList.map((c, i) => (
                <div key={i} className="text-sm text-secondary" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
                  Session {String(c['id'] ?? i)} — {String(c['status'] ?? 'active')}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-sm text-muted mb-16">Aucune conversation active</div>
          )}
          {callList.length > 0 ? callList.map((c, i) => (
            <div key={i} className="text-sm text-secondary" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
              Appel {String(c['id'] ?? i)} — {String(c['status'] ?? 'active')}
            </div>
          )) : (
            <div className="text-sm text-muted">Aucun appel actif</div>
          )}
        </div>
      </div>

      {/* Latency Breakdown */}
      {metrics && (
        <div className="section">
          <div className="section-title">Latences detaillees</div>
          <div className="grid-4">
            <div className="card card-compact text-center">
              <div className="text-xs text-muted mb-4">ASR</div>
              <div style={{ fontSize: 18 }} className="font-bold">{Number(metrics['asrLatencyAvgMs'] ?? 0)}ms</div>
            </div>
            <div className="card card-compact text-center">
              <div className="text-xs text-muted mb-4">LLM</div>
              <div style={{ fontSize: 18 }} className="font-bold">{Number(metrics['llmLatencyAvgMs'] ?? 0)}ms</div>
            </div>
            <div className="card card-compact text-center">
              <div className="text-xs text-muted mb-4">TTS</div>
              <div style={{ fontSize: 18 }} className="font-bold">{Number(metrics['ttsLatencyAvgMs'] ?? 0)}ms</div>
            </div>
            <div className="card card-compact text-center">
              <div className="text-xs text-muted mb-4">Video</div>
              <div style={{ fontSize: 18 }} className="font-bold">{Number(metrics['videoLatencyAvgMs'] ?? 0)}ms</div>
            </div>
          </div>
        </div>
      )}

      <div className="text-xs text-muted mt-8">
        API: POST /avatar/conversation/start | POST /avatar/asr/transcribe | POST /avatar/tts/synthesize | POST /avatar/telephony/call | GET /avatar/personas
      </div>
    </div>
  );
}
