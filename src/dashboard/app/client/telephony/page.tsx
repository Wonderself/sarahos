'use client';

import { useState, useEffect, useCallback } from 'react';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';
import { useToast } from '../../../components/Toast';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useIsMobile } from '../../../lib/use-media-query';

// ─── Types ────────────────────────────────────────────────────────────────────

type CallStatus = 'completed' | 'failed' | 'busy' | 'no-answer';

interface TelephonyCall {
  id: string;
  from?: string;
  to?: string;
  duration: number;
  status: CallStatus;
  cost?: number;
  agent?: string;
  createdAt: string;
}

interface Persona {
  id: string;
  name: string;
  language: string;
  voice?: string;
  description?: string;
  active: boolean;
  emoji?: string;
}

interface PipelineMetrics {
  sttLatency?: number;
  llmLatency?: number;
  ttsLatency?: number;
  totalLatency?: number;
  samples?: Array<{ timestamp: string; total: number }>;
}

interface PipelineHealth {
  status: 'ok' | 'degraded' | 'down';
  stt?: string;
  llm?: string;
  tts?: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const STATUS_LABELS: Record<CallStatus, string> = {
  completed: 'Terminé', failed: 'Échec', busy: 'Occupé', 'no-answer': 'Sans réponse',
};
const STATUS_COLORS: Record<CallStatus, string> = {
  completed: '#22c55e', failed: '#ef4444', busy: '#f59e0b', 'no-answer': '#6b7280',
};
const TABS = ['Historique', 'Personas', 'Pipeline'] as const;
type Tab = typeof TABS[number];

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  return `${Math.floor(sec / 60)}min${sec % 60 > 0 ? ` ${sec % 60}s` : ''}`;
}

// ─── API helper ───────────────────────────────────────────────────────────────

async function portalCall<T>(path: string, method = 'GET', data?: unknown): Promise<T> {
  const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  const res = await fetch('/api/portal', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ path, token: session.token, method, data }),
  });
  if (!res.ok) throw new Error(`Erreur ${res.status}`);
  return res.json() as Promise<T>;
}

const meta = PAGE_META.telephony;

// ─── Component ────────────────────────────────────────────────────────────────

export default function TelephonyPage() {
  const isMobile = useIsMobile();
  const { showError, showSuccess } = useToast();
  const [tab, setTab] = useState<Tab>('Historique');

  // History
  const [calls, setCalls] = useState<TelephonyCall[]>([]);
  const [callsLoading, setCallsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<CallStatus | 'all'>('all');

  // Personas
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [personasLoading, setPersonasLoading] = useState(false);
  const [switchingPersona, setSwitchingPersona] = useState<string | null>(null);

  // Pipeline
  const [metrics, setMetrics] = useState<PipelineMetrics | null>(null);
  const [health, setHealth] = useState<PipelineHealth | null>(null);
  const [metricsLoading, setMetricsLoading] = useState(false);

  const loadCalls = useCallback(async () => {
    setCallsLoading(true);
    try {
      const res = await portalCall<{ calls: TelephonyCall[] }>('/avatar/telephony/calls');
      setCalls(res.calls ?? []);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de chargement de l\'historique');
    } finally {
      setCallsLoading(false);
    }
  }, [showError]);

  const loadPersonas = useCallback(async () => {
    setPersonasLoading(true);
    try {
      const res = await portalCall<{ personas: Persona[] }>('/avatar/personas');
      setPersonas(res.personas ?? []);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de chargement des personas');
    } finally {
      setPersonasLoading(false);
    }
  }, [showError]);

  const loadMetrics = useCallback(async () => {
    setMetricsLoading(true);
    try {
      const [metricsRes, healthRes] = await Promise.all([
        portalCall<PipelineMetrics>('/avatar/pipeline/metrics').catch(() => null),
        portalCall<PipelineHealth>('/avatar/pipeline/health').catch(() => null),
      ]);
      if (metricsRes) setMetrics(metricsRes);
      if (healthRes) setHealth(healthRes);
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur de chargement des métriques');
    } finally {
      setMetricsLoading(false);
    }
  }, [showError]);

  useEffect(() => { loadCalls(); }, [loadCalls]);

  useEffect(() => {
    if (tab === 'Personas') loadPersonas();
    if (tab === 'Pipeline') loadMetrics();
  }, [tab, loadPersonas, loadMetrics]);

  async function switchPersona(personaId: string) {
    setSwitchingPersona(personaId);
    try {
      await portalCall('/avatar/personas/switch', 'POST', { personaId });
      setPersonas(prev => prev.map(p => ({ ...p, active: p.id === personaId })));
      showSuccess('Persona activée');
    } catch (e) {
      showError(e instanceof Error ? e.message : 'Erreur lors du changement de persona');
    } finally {
      setSwitchingPersona(null);
    }
  }

  function exportCSV() {
    const rows = [['Date', 'De', 'Vers', 'Durée', 'Statut', 'Agent', 'Coût']];
    for (const c of displayedCalls) {
      rows.push([
        new Date(c.createdAt).toLocaleString('fr-FR'),
        c.from ?? '', c.to ?? '',
        formatDuration(c.duration),
        STATUS_LABELS[c.status],
        c.agent ?? '',
        c.cost ? `${(c.cost / 1_000_000).toFixed(4)} cr` : '',
      ]);
    }
    const csv = rows.map(r => r.map(v => `"${v}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'historique-appels.csv'; a.click();
    URL.revokeObjectURL(url);
  }

  // Stats
  const totalCalls = calls.length;
  const completedCalls = calls.filter(c => c.status === 'completed');
  const avgDuration = completedCalls.length > 0
    ? Math.round(completedCalls.reduce((s, c) => s + c.duration, 0) / completedCalls.length)
    : 0;
  const totalCost = calls.reduce((s, c) => s + (c.cost ?? 0), 0);
  const successRate = totalCalls > 0 ? Math.round((completedCalls.length / totalCalls) * 100) : 0;

  const displayedCalls = filterStatus === 'all' ? calls : calls.filter(c => c.status === filterStatus);

  // Latency chart
  const latencyChart = metrics?.samples?.map(s => ({
    time: new Date(s.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }),
    Latence: s.total,
  })) ?? [];

  const healthColor = health?.status === 'ok' ? '#22c55e' : health?.status === 'degraded' ? '#f59e0b' : '#ef4444';
  const healthLabel = health?.status === 'ok' ? 'Opérationnel' : health?.status === 'degraded' ? 'Dégradé' : 'En panne';

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 1000, margin: '0 auto', padding: isMobile ? 12 : undefined }}>

      {/* Header */}
      <div className="page-header" style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{meta.emoji}</span>
          <div>
            <h1 className="page-title" style={{ color: 'var(--fz-text, #1E293B)' }}>{meta.title}</h1>
            <p className="page-subtitle" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>{meta.subtitle}</p>
          </div>
          <HelpBubble text={meta.helpText} />
        </div>
      </div>
      <PageExplanation pageId="telephony" text={PAGE_META.telephony?.helpText} />

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: 12, marginBottom: 24 }}>
        {[
          { label: 'Total appels', value: String(totalCalls), icon: '☎️', color: 'var(--accent)' },
          { label: 'Taux de succès', value: `${successRate}%`, icon: '✅', color: '#22c55e' },
          { label: 'Durée moyenne', value: avgDuration > 0 ? formatDuration(avgDuration) : '—', icon: '⏱️', color: '#f59e0b' },
          { label: 'Coût total', value: totalCost > 0 ? `${(totalCost / 1_000_000).toFixed(3)} cr` : '—', icon: '💰', color: '#3b82f6' },
        ].map(s => (
          <div key={s.label} style={{ padding: '14px 18px', borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'var(--fz-bg, #FFFFFF)' }}>
            <div style={{ marginBottom: 4, fontSize: 20 }}>{s.icon}</div>
            <div style={{ fontSize: 16, fontWeight: 700, color: s.color }}>{s.value}</div>
            <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{s.label}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            border: tab === t ? '1.5px solid var(--accent)' : '1.5px solid var(--fz-border, #E2E8F0)',
            background: tab === t ? 'var(--accent)' : 'var(--fz-bg-secondary, #F8FAFC)',
            color: tab === t ? '#fff' : 'var(--fz-text, #1E293B)',
          }}>{t}</button>
        ))}
      </div>

      {/* Historique */}
      {tab === 'Historique' && (
        <div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {(['all', 'completed', 'failed', 'busy', 'no-answer'] as const).map(s => (
                <button key={s} onClick={() => setFilterStatus(s)} style={{
                  padding: '5px 12px', borderRadius: 16, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                  border: filterStatus === s ? `1.5px solid ${s === 'all' ? 'var(--accent)' : STATUS_COLORS[s as CallStatus]}` : '1.5px solid var(--fz-border, #E2E8F0)',
                  background: filterStatus === s ? (s === 'all' ? 'var(--accent)' : STATUS_COLORS[s as CallStatus]) + '15' : 'var(--fz-bg-secondary, #F8FAFC)',
                  color: filterStatus === s ? (s === 'all' ? 'var(--accent)' : STATUS_COLORS[s as CallStatus]) : 'var(--fz-text-secondary, #64748B)',
                }}>
                  {s === 'all' ? 'Tous' : STATUS_LABELS[s as CallStatus]}
                </button>
              ))}
            </div>
            {displayedCalls.length > 0 && (
              <button onClick={exportCSV} className="btn btn-ghost btn-sm" style={{ fontSize: 12 }}>
                ⬇️ Export CSV
              </button>
            )}
          </div>

          {callsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fz-text-muted, #94A3B8)' }} className="animate-pulse">Chargement...</div>
          ) : displayedCalls.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 40px', borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'var(--fz-bg, #FFFFFF)' }}>
              <div style={{ marginBottom: 16, fontSize: 48 }}>📞</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--fz-text, #1E293B)' }}>Aucun appel{filterStatus !== 'all' ? ' ' + STATUS_LABELS[filterStatus as CallStatus].toLowerCase() : ''}</div>
              <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)' }}>Les appels <span className="fz-logo-word">Twilio</span> apparaîtront ici.</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {displayedCalls.map(call => (
                <div key={call.id} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'var(--fz-bg, #FFFFFF)' }}>
                  <div style={{ flexShrink: 0, fontSize: 24 }}>📞</div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>
                      {call.from && call.to ? `${call.from} → ${call.to}` : call.from ?? call.to ?? 'Appel entrant'}
                      {call.agent && <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginLeft: 6 }}>· {call.agent}</span>}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>
                      {new Date(call.createdAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {call.duration > 0 && ` · ${formatDuration(call.duration)}`}
                      {call.cost && call.cost > 0 && ` · ${(call.cost / 1_000_000).toFixed(4)} cr`}
                    </div>
                  </div>
                  <span style={{
                    fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, flexShrink: 0,
                    background: STATUS_COLORS[call.status] + '20', color: STATUS_COLORS[call.status],
                  }}>
                    {STATUS_LABELS[call.status]}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Personas */}
      {tab === 'Personas' && (
        <div>
          {personasLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fz-text-muted, #94A3B8)' }} className="animate-pulse">Chargement des personas...</div>
          ) : personas.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px 40px', borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'var(--fz-bg, #FFFFFF)' }}>
              <div style={{ marginBottom: 16, fontSize: 48 }}>🎭</div>
              <div style={{ fontWeight: 700, fontSize: 16, marginBottom: 8, color: 'var(--fz-text, #1E293B)' }}>Aucune persona disponible</div>
              <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)' }}>Les personas vocales apparaîtront ici.</div>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14 }}>
              {personas.map(p => (
                <div key={p.id} style={{ padding: 20, position: 'relative', borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'var(--fz-bg, #FFFFFF)' }}>
                  {p.active && (
                    <span style={{ position: 'absolute', top: 10, right: 10, fontSize: 10, fontWeight: 700, padding: '2px 7px', borderRadius: 5, background: '#22c55e20', color: '#22c55e' }}>
                      Active
                    </span>
                  )}
                  <div style={{ textAlign: 'center', marginBottom: 14 }}>
                    <div style={{ marginBottom: 8, fontSize: 40 }}>👤</div>
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>{p.language}</div>
                  </div>
                  {p.description && (
                    <p style={{ fontSize: 12, color: 'var(--fz-text-secondary, #64748B)', lineHeight: 1.5, textAlign: 'center', marginBottom: 14 }}>{p.description}</p>
                  )}
                  {p.voice && (
                    <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', textAlign: 'center', marginBottom: 14 }}>
                      🎤 {p.voice}
                    </div>
                  )}
                  {!p.active && (
                    <button
                      onClick={() => switchPersona(p.id)}
                      disabled={switchingPersona === p.id}
                      className="btn btn-primary"
                      style={{ width: '100%', fontSize: 12 }}
                    >
                      {switchingPersona === p.id ? 'Activation...' : 'Activer cette persona'}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Pipeline */}
      {tab === 'Pipeline' && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {metricsLoading ? (
            <div style={{ textAlign: 'center', padding: '40px 0', color: 'var(--fz-text-muted, #94A3B8)' }} className="animate-pulse">Chargement des métriques...</div>
          ) : (
            <>
              {/* Health status */}
              <div style={{ padding: 20, borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'var(--fz-bg, #FFFFFF)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>État du pipeline</h3>
                  <span style={{ fontSize: 13, fontWeight: 700, padding: '4px 12px', borderRadius: 8, background: healthColor + '20', color: healthColor }}>
                    {healthLabel}
                  </span>
                </div>
                <div className="fz-grid-3" style={{ display: 'grid', gap: 10 }}>
                  {[
                    { label: 'STT (Transcription)', value: health?.stt ?? 'N/A', icon: '🎤' },
                    { label: 'LLM (Réponse)', value: health?.llm ?? 'N/A', icon: '🤖' },
                    { label: 'TTS (Synthèse)', value: health?.tts ?? 'N/A', icon: '🔊' },
                  ].map(item => (
                    <div key={item.label} style={{ textAlign: 'center', padding: '12px', background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 10 }}>
                      <div style={{ marginBottom: 4, fontSize: 22 }}>{item.icon}</div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: item.value === 'ok' ? '#22c55e' : item.value === 'degraded' ? '#f59e0b' : 'var(--fz-text-secondary, #64748B)' }}>
                        {item.value === 'ok' ? 'OK' : item.value === 'degraded' ? 'Dégradé' : item.value}
                      </div>
                      <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>{item.label}</div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Latency metrics */}
              {metrics && (
                <div style={{ padding: 20, borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: 'var(--fz-bg, #FFFFFF)' }}>
                  <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 16, color: 'var(--fz-text, #1E293B)' }}>Latences moyennes</h3>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 10, marginBottom: 20 }}>
                    {[
                      { label: 'STT', value: metrics.sttLatency, icon: '🎤' },
                      { label: 'LLM', value: metrics.llmLatency, icon: '🤖' },
                      { label: 'TTS', value: metrics.ttsLatency, icon: '🔊' },
                      { label: 'Total', value: metrics.totalLatency, icon: '⚡', highlight: true },
                    ].map(m => (
                      <div key={m.label} style={{ padding: '12px', textAlign: 'center', borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))', background: m.highlight ? 'var(--accent)10' : 'var(--fz-bg, #FFFFFF)' }}>
                        <div style={{ marginBottom: 4, fontSize: 18 }}>{m.icon}</div>
                        <div style={{ fontSize: 18, fontWeight: 700, color: m.highlight ? 'var(--accent)' : 'var(--fz-text, #1E293B)' }}>
                          {m.value != null ? `${m.value}ms` : '—'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 1 }}>{m.label}</div>
                      </div>
                    ))}
                  </div>

                  {latencyChart.length > 0 && (
                    <>
                      <h4 style={{ fontSize: 13, fontWeight: 600, marginBottom: 12, color: 'var(--fz-text-secondary, #64748B)' }}>Évolution de la latence</h4>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={latencyChart} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="var(--fz-border, #E2E8F0)" />
                          <XAxis dataKey="time" tick={{ fontSize: 10, fill: 'var(--fz-text-muted, #94A3B8)' }} />
                          <YAxis tick={{ fontSize: 10, fill: 'var(--fz-text-muted, #94A3B8)' }} unit="ms" />
                          <Tooltip formatter={(v: number | undefined) => [`${v ?? 0}ms`, 'Latence']} />
                          <Line type="monotone" dataKey="Latence" stroke="var(--accent)" strokeWidth={2} dot={false} />
                        </LineChart>
                      </ResponsiveContainer>
                    </>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}
