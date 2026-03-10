'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { ALL_AGENTS } from '../../../lib/agent-config';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';

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

const meta = PAGE_META.visio;

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 28 }}>{meta.emoji}</span>
          <div>
            <h1 className="page-title" style={{ color: 'var(--fz-text, #1E293B)' }}>{meta.title}</h1>
            <p className="page-subtitle" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
              Parlez face-\u00e0-face avec vos assistants IA en <span className="fz-logo-word">temps r\u00e9el</span>. Micro + synth\u00e8se vocale pour une exp\u00e9rience naturelle.
            </p>
          </div>
          <HelpBubble text={meta.helpText} />
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
          padding: '6px 12px', borderRadius: 8, background: '#fef3c720', border: '1px solid #fcd34d40',
          fontSize: 11, color: '#b45309',
        }}>
          \u26a1 Consomme ~3x plus de cr\u00e9dits qu&apos;un chat texte (<span className="fz-logo-word">STT + LLM + TTS</span>)
        </div>
      </div>

      {/* Stats */}
      {totalCalls > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12, marginBottom: 24 }}>
          {[
            { label: 'Appels au total', value: String(totalCalls), icon: '\ud83d\udcde', color: 'var(--accent)' },
            { label: 'Ce mois', value: String(thisMonth.length), icon: '\ud83d\udcc5', color: '#3b82f6' },
            { label: 'Dur\u00e9e ce mois', value: formatDuration(totalDurationMonth), icon: '\u23f1\ufe0f', color: '#f59e0b' },
            { label: 'Assistant favori', value: topAgent?.name ?? '\u2014', icon: '\ud83e\udd16', color: '#22c55e' },
          ].map(s => (
            <div key={s.label} style={{ padding: '14px 18px', borderRadius: 12, border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg, #FFFFFF)' }}>
              <div style={{ marginBottom: 4, fontSize: 20 }}>{s.icon}</div>
              <div style={{ fontSize: 16, fontWeight: 700, color: s.color, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
              <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {([['agents', '\ud83c\udfa4', 'Assistants'], ['history', '\ud83d\udccb', `Historique${totalCalls > 0 ? ` (${totalCalls})` : ''}`]] as [string, string, string][]).map(([t, icon, l]) => (
          <button
            key={t}
            onClick={() => setActiveSection(t as 'agents' | 'history')}
            style={{
              padding: '8px 20px', borderRadius: 20, fontSize: 13, fontWeight: 600, cursor: 'pointer',
              border: activeSection === t ? '1.5px solid var(--accent)' : '1.5px solid var(--fz-border, #E2E8F0)',
              background: activeSection === t ? 'var(--accent)' : 'var(--fz-bg-secondary, #F8FAFC)',
              color: activeSection === t ? '#fff' : 'var(--fz-text, #1E293B)',
            }}
          >
            {icon} {l}
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
                style={{ padding: 20, cursor: 'pointer', transition: 'all 0.2s', borderRadius: 12, border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg, #FFFFFF)' }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = agent.color;
                  e.currentTarget.style.boxShadow = `0 4px 12px ${agent.color}20`;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = 'var(--fz-border, #E2E8F0)';
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
                  \ud83e\udd16
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--fz-text, #1E293B)' }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>{agent.role}</div>
                  {agentFreq[agent.id] && (
                    <div style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 4 }}>
                      {agentFreq[agent.id]} appel{agentFreq[agent.id] > 1 ? 's' : ''}
                    </div>
                  )}
                  <div style={{
                    marginTop: 10, fontSize: 11, fontWeight: 600, color: agent.color,
                    padding: '4px 10px', borderRadius: 6, background: `${agent.color}10`,
                    display: 'inline-block',
                  }}>
                    Appeler \ud83d\udcde
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
          <div style={{ textAlign: 'center', padding: '60px 40px', borderRadius: 12, border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg, #FFFFFF)' }}>
            <div style={{ marginBottom: 16, fontSize: 48 }}>\ud83d\udcde</div>
            <div style={{ fontWeight: 600, fontSize: 16, marginBottom: 8, color: 'var(--fz-text, #1E293B)' }}>Aucun appel pour le moment</div>
            <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)' }}>
              Vos appels avec les assistants appara\u00eetront ici apr\u00e8s chaque conversation visio
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {callHistory.map((call, i) => {
              const agent = VISIO_AGENTS.find(a => a.id === call.agentId);
              const statusColor = call.status === 'completed' ? '#22c55e' : call.status === 'missed' ? '#f59e0b' : '#ef4444';
              const statusLabel = call.status === 'completed' ? 'Termin\u00e9' : call.status === 'missed' ? 'Manqu\u00e9' : 'Erreur';
              return (
                <div key={i} style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', gap: 12, borderRadius: 12, border: '1px solid var(--fz-border, #E2E8F0)', background: 'var(--fz-bg, #FFFFFF)' }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: (agent?.color ?? '#7c3aed') + '15', fontSize: 18,
                  }}>
                    \ud83e\udd16
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--fz-text, #1E293B)' }}>{call.agentName}</div>
                    <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>
                      {new Date(call.startedAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {call.durationSeconds > 0 && ` \u00b7 ${formatDuration(call.durationSeconds)}`}
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
      <div style={{ marginTop: 28, padding: 16, borderRadius: 12, background: 'var(--fz-bg-secondary, #F8FAFC)', border: '1px solid var(--fz-border, #E2E8F0)' }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: 'var(--fz-text, #1E293B)' }}>Probl\u00e8mes audio ?</div>
        <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 8 }}>
          Testez votre micro et vos haut-parleurs pour v\u00e9rifier que tout fonctionne.
        </div>
        <Link href="/client/visio/diagnostic" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
          Lancer le diagnostic audio \u2192
        </Link>
      </div>
    </div>
  );
}
