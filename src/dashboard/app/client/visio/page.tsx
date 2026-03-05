'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ALL_AGENTS } from '../../../lib/agent-config';

const VISIO_AGENTS = ALL_AGENTS.map(a => ({
  id: a.id,
  name: a.name,
  role: a.role,
  emoji: a.emoji,
  color: a.color,
  gender: a.gender,
}));

const CALL_HISTORY_KEY = 'fz_call_history';

interface CallRecord {
  agentId: string;
  agentName: string;
  startedAt: string;
  durationSeconds: number;
  status: 'completed' | 'missed' | 'error';
}

function loadCallHistory(): CallRecord[] {
  try { return JSON.parse(localStorage.getItem(CALL_HISTORY_KEY) ?? '[]'); } catch { return []; }
}

function formatDuration(sec: number): string {
  if (sec < 60) return `${sec}s`;
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}min${s > 0 ? ` ${s}s` : ''}`;
}

export default function VisioPage() {
  const [callHistory, setCallHistory] = useState<CallRecord[]>([]);
  const [activeSection, setActiveSection] = useState<'agents' | 'history'>('agents');

  const load = useCallback(() => {
    setCallHistory(loadCallHistory().slice().reverse());
  }, []);

  useEffect(() => { load(); }, [load]);

  // Stats
  const totalCalls = callHistory.length;
  const thisMonth = callHistory.filter(c => {
    const d = new Date(c.startedAt);
    const now = new Date();
    return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
  });
  const totalDurationMonth = thisMonth.reduce((s, c) => s + c.durationSeconds, 0);
  const agentFreq = callHistory.reduce<Record<string, number>>((acc, c) => {
    acc[c.agentId] = (acc[c.agentId] ?? 0) + 1;
    return acc;
  }, {});
  const topAgentId = Object.entries(agentFreq).sort((a, b) => b[1] - a[1])[0]?.[0];
  const topAgent = VISIO_AGENTS.find(a => a.id === topAgentId);

  return (
    <div className="client-page-scrollable" style={{ maxWidth: 1000, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <h1 className="page-title">🎙️ Visio Agents</h1>
        <p className="page-subtitle">
          Parlez face-à-face avec vos agents IA en temps réel. Micro + synthèse vocale pour une expérience naturelle.
        </p>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
          padding: '6px 12px', borderRadius: 8, background: '#fef3c720', border: '1px solid #fcd34d40',
          fontSize: 11, color: '#b45309',
        }}>
          ⚡ Consomme ~3x plus de crédits qu&apos;un chat texte (STT + LLM + TTS)
        </div>
      </div>

      {/* Stats */}
      {totalCalls > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Appels au total', value: String(totalCalls), icon: '📞', color: 'var(--accent)' },
            { label: 'Ce mois', value: String(thisMonth.length), icon: '📅', color: '#3b82f6' },
            { label: 'Durée ce mois', value: formatDuration(totalDurationMonth), icon: '⏱️', color: '#f59e0b' },
            { label: 'Agent favori', value: topAgent?.name ?? '—', icon: topAgent?.emoji ?? '🤖', color: '#22c55e' },
          ].map(s => (
            <div key={s.label} className="card" style={{ padding: '14px 18px' }}>
              <div style={{ fontSize: 20, marginBottom: 4 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--text-tertiary)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {([['agents', '🎙️ Agents'], ['history', `📋 Historique${totalCalls > 0 ? ` (${totalCalls})` : ''}`]] as const).map(([t, l]) => (
          <button
            key={t}
            onClick={() => setActiveSection(t)}
            style={{
              padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: activeSection === t ? '1.5px solid var(--accent)' : '1.5px solid var(--border-primary)',
              background: activeSection === t ? 'var(--accent)' : 'var(--bg-secondary)',
              color: activeSection === t ? '#fff' : 'var(--text-primary)',
            }}
          >
            {l}
          </button>
        ))}
      </div>

      {/* Agents grid */}
      {activeSection === 'agents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16 }}>
          {VISIO_AGENTS.map(agent => (
            <Link
              key={agent.id}
              href={`/client/visio/${agent.id}`}
              style={{ textDecoration: 'none', color: 'inherit' }}
            >
              <div
                className="card"
                style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = agent.color;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${agent.color}20`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--border-primary)';
                  e.currentTarget.style.boxShadow = 'none';
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: `${agent.color}15`, border: `2px solid ${agent.color}40`,
                  fontSize: 28,
                }}>
                  {agent.emoji}
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-primary)' }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-tertiary)', marginTop: 2 }}>{agent.role}</div>
                  {agentFreq[agent.id] && (
                    <div style={{ fontSize: 10, color: 'var(--text-tertiary)', marginTop: 4 }}>
                      {agentFreq[agent.id]} appel{agentFreq[agent.id] > 1 ? 's' : ''}
                    </div>
                  )}
                  <div style={{
                    marginTop: 10, fontSize: 11, fontWeight: 600, color: agent.color,
                    padding: '4px 10px', borderRadius: 6, background: `${agent.color}10`,
                    display: 'inline-block',
                  }}>
                    Appeler 📞
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      )}

      {/* Call history */}
      {activeSection === 'history' && (
        callHistory.length === 0 ? (
          <div className="card" style={{ textAlign: 'center', padding: '60px 40px' }}>
            <div style={{ fontSize: 48, marginBottom: 16 }}>📞</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8 }}>Aucun appel pour le moment</div>
            <div style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              Vos appels avec les agents apparaîtront ici après chaque conversation visio
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {callHistory.map((call, i) => {
              const agent = VISIO_AGENTS.find(a => a.id === call.agentId);
              const statusColor = call.status === 'completed' ? '#22c55e' : call.status === 'missed' ? '#f59e0b' : '#ef4444';
              const statusLabel = call.status === 'completed' ? 'Terminé' : call.status === 'missed' ? 'Manqué' : 'Erreur';
              return (
                <div key={i} className="card" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: (agent?.color ?? '#6366f1') + '15', fontSize: 18,
                  }}>
                    {agent?.emoji ?? '🤖'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14 }}>{call.agentName}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginTop: 2 }}>
                      {new Date(call.startedAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {call.durationSeconds > 0 && ` · ${formatDuration(call.durationSeconds)}`}
                    </div>
                  </div>
                  <span style={{ fontSize: 11, fontWeight: 700, padding: '3px 8px', borderRadius: 6, background: statusColor + '20', color: statusColor, flexShrink: 0 }}>
                    {statusLabel}
                  </span>
                  <Link
                    href={`/client/visio/${call.agentId}`}
                    style={{ fontSize: 12, fontWeight: 600, padding: '6px 12px', borderRadius: 8, background: 'var(--accent)', color: '#fff', textDecoration: 'none', flexShrink: 0 }}
                  >
                    Rappeler
                  </Link>
                </div>
              );
            })}
          </div>
        )
      )}

      {/* Audio diagnostic */}
      <div style={{ marginTop: 28, padding: 16, borderRadius: 12, background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4 }}>Problèmes audio ?</div>
        <div style={{ fontSize: 12, color: 'var(--text-tertiary)', marginBottom: 8 }}>
          Testez votre micro et vos haut-parleurs pour vérifier que tout fonctionne.
        </div>
        <Link href="/client/visio/diagnostic" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
          Lancer le diagnostic audio →
        </Link>
      </div>
    </div>
  );
}
