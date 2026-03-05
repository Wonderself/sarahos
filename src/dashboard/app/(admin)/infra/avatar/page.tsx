'use client';

import { useState, useEffect, useCallback } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

async function authFetch(path: string, opts?: RequestInit) {
  return fetch(`${API}${path}`, {
    ...opts,
    headers: { Authorization: `Bearer ${getToken()}`, 'Content-Type': 'application/json', ...opts?.headers },
  });
}

interface ServiceStatus { configured: boolean; provider: string }

export default function AvatarPage() {
  const [metrics, setMetrics] = useState<Record<string, unknown> | null>(null);
  const [conversations, setConversations] = useState<Record<string, unknown>[]>([]);
  const [calls, setCalls] = useState<Record<string, unknown>[]>([]);
  const [services, setServices] = useState<Record<string, ServiceStatus> | null>(null);
  const [loading, setLoading] = useState(true);

  // TTS test
  const [ttsText, setTtsText] = useState('Bonjour, je suis votre assistante intelligente.');
  const [ttsTesting, setTtsTesting] = useState(false);
  const [ttsResult, setTtsResult] = useState<{ ok: boolean; latency?: number; provider?: string; audioBase64?: string; error?: string } | null>(null);

  const loadData = useCallback(async () => {
    setLoading(true);
    try {
      const [mRes, cRes, callRes, sRes] = await Promise.all([
        authFetch('/avatar/pipeline/metrics'),
        authFetch('/avatar/conversations/active'),
        authFetch('/avatar/telephony/calls'),
        authFetch('/avatar/admin/test/services'),
      ]);
      if (mRes.ok) setMetrics(await mRes.json() as Record<string, unknown>);
      if (cRes.ok) setConversations(await cRes.json() as Record<string, unknown>[]);
      if (callRes.ok) {
        const d = await callRes.json() as { active?: Record<string, unknown>[] };
        setCalls(Array.isArray(d.active) ? d.active : []);
      }
      if (sRes.ok) setServices(await sRes.json() as Record<string, ServiceStatus>);
    } catch { /* best effort */ }
    setLoading(false);
  }, []);

  useEffect(() => { loadData(); }, [loadData]);

  async function testTTS() {
    setTtsTesting(true);
    setTtsResult(null);
    try {
      const r = await authFetch('/avatar/admin/test/tts', {
        method: 'POST',
        body: JSON.stringify({ text: ttsText }),
      });
      const d = await r.json() as { ok: boolean; latency?: number; provider?: string; audioBase64?: string; error?: string };
      setTtsResult(d);
    } catch (e) {
      setTtsResult({ ok: false, error: e instanceof Error ? e.message : 'Erreur réseau' });
    }
    setTtsTesting(false);
  }

  const serviceEntries = services ? Object.entries(services) : [];

  return (
    <div className="admin-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Avatar Pipeline</h1>
          <p className="page-subtitle">Services voix, video et telephonie — Maëva &amp; Emmanuel</p>
        </div>
        <button className="btn btn-secondary" onClick={loadData} disabled={loading}>
          {loading ? 'Chargement…' : 'Actualiser'}
        </button>
      </div>

      {/* Service Health */}
      <div className="section">
        <div className="section-title">Statut des services IA</div>
        <div className="grid-4">
          {serviceEntries.length === 0 && loading && [1,2,3,4].map(i => (
            <div key={i} className="skeleton" style={{ height: 80, borderRadius: 8 }} />
          ))}
          {serviceEntries.map(([key, svc]) => (
            <div key={key} className="card card-compact text-center">
              <div className="mb-8">
                <span className={svc.configured ? 'status-dot' : 'status-dot status-dot-error'}
                      style={{ display: 'inline-block' }} />
              </div>
              <div className="text-sm font-bold" style={{ textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                {svc.provider}
              </div>
              <div className={`text-xs mt-4 ${svc.configured ? 'text-success' : 'text-muted'}`}>
                {svc.configured ? 'Configuré' : 'Non configuré'}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Metrics */}
      {metrics && (
        <div className="section">
          <div className="section-title">Métriques Pipeline</div>
          <div className="grid-4">
            <div className="stat-card">
              <span className="stat-label">Latence Moy.</span>
              <span className="stat-value stat-value-sm">{Number(metrics['averageLatencyMs'] ?? 0)}ms</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Tokens / Tour</span>
              <span className="stat-value stat-value-sm">{Number(metrics['averageTokensPerTurn'] ?? 0)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Total Tours</span>
              <span className="stat-value stat-value-sm">{Number(metrics['totalTurns'] ?? 0)}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Sessions</span>
              <span className="stat-value stat-value-sm">{Number(metrics['totalSessions'] ?? 0)}</span>
            </div>
          </div>
          <div className="grid-4" style={{ marginTop: 12 }}>
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
              <div className="text-xs text-muted mb-4">Vidéo</div>
              <div style={{ fontSize: 18 }} className="font-bold">{Number(metrics['videoLatencyAvgMs'] ?? 0)}ms</div>
            </div>
          </div>
        </div>
      )}

      {/* Sessions */}
      <div className="grid-2 section">
        <div className="card">
          <div className="text-md font-semibold mb-16">
            Conversations actives
            <span className="section-subtitle"> — {conversations.length}</span>
          </div>
          {conversations.length > 0 ? conversations.map((c, i) => (
            <div key={i} className="text-sm text-secondary" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
              Session {String(c['id'] ?? i)} — {String(c['status'] ?? 'active')}
            </div>
          )) : (
            <div className="text-sm text-muted">Aucune conversation active</div>
          )}
        </div>
        <div className="card">
          <div className="text-md font-semibold mb-16">
            Appels actifs
            <span className="section-subtitle"> — {calls.length}</span>
          </div>
          {calls.length > 0 ? calls.map((c, i) => (
            <div key={i} className="text-sm text-secondary" style={{ padding: '6px 0', borderBottom: '1px solid var(--border-primary)' }}>
              Appel {String(c['id'] ?? i)} — {String(c['status'] ?? 'active')}
            </div>
          )) : (
            <div className="text-sm text-muted">Aucun appel actif</div>
          )}
        </div>
      </div>

      {/* Live TTS Test */}
      <div className="section">
        <div className="section-title">Test live — Synthèse vocale (TTS)</div>
        <div className="card p-6">
          <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
            <input
              type="text"
              value={ttsText}
              onChange={e => setTtsText(e.target.value)}
              maxLength={200}
              placeholder="Texte à synthétiser…"
              className="input"
              style={{ flex: 1 }}
            />
            <button className="btn btn-primary" onClick={testTTS} disabled={ttsTesting || !ttsText.trim()}>
              {ttsTesting ? 'Synthèse…' : 'Tester TTS'}
            </button>
          </div>

          {ttsResult && (
            <div style={{ marginTop: 8 }}>
              {ttsResult.ok ? (
                <div>
                  <div className="text-sm mb-2" style={{ color: 'var(--muted)' }}>
                    Provider: <strong>{ttsResult.provider}</strong> — Latence: <strong>{ttsResult.latency}ms</strong>
                  </div>
                  {ttsResult.audioBase64 && (
                    // eslint-disable-next-line jsx-a11y/media-has-caption
                    <audio
                      controls
                      src={`data:audio/mp3;base64,${ttsResult.audioBase64}`}
                      style={{ width: '100%', marginTop: 8 }}
                    />
                  )}
                </div>
              ) : (
                <div style={{ color: 'var(--error, #ef4444)', fontSize: 13 }}>
                  Erreur TTS : {ttsResult.error}
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
