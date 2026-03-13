'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ALL_AGENTS } from '../../../lib/agent-config';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';

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
  const { requireAuth, LoginModalComponent } = useAuthGuard();
  const router = useRouter();
  const isMobile = useIsMobile();
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
    <div style={{ ...pageContainer(isMobile), maxWidth: 1000 }}>
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{meta.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{meta.title}</h1>
            <p style={CU.pageSubtitle}>
              Parlez face-à-face avec vos assistants IA en <span className="fz-logo-word">temps réel</span>. Micro + synthèse vocale pour une expérience naturelle.
            </p>
          </div>
          <HelpBubble text={meta.helpText} />
        </div>
        <div style={{
          display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
          padding: '6px 12px', borderRadius: 8, background: CU.accentLight, border: `1px solid ${CU.border}`,
          fontSize: 11, color: CU.textSecondary,
        }}>
          ⚡ Consomme ~3x plus de crédits qu&apos;un chat texte (<span className="fz-logo-word">STT + LLM + TTS</span>)
        </div>
      </div>
      <PageExplanation pageId="visio" text={PAGE_META.visio?.helpText} />

      {/* Stats */}
      {totalCalls > 0 && (
        <div style={{ ...cardGrid(isMobile, 4), gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', marginBottom: 24 }}>
          {[
            { label: 'Appels au total', value: String(totalCalls), icon: '📞' },
            { label: 'Ce mois', value: String(thisMonth.length), icon: '📅' },
            { label: 'Durée ce mois', value: formatDuration(totalDurationMonth), icon: '⏱️' },
            { label: 'Assistant favori', value: topAgent?.name ?? '—', icon: '🤖' },
          ].map(s => (
            <div key={s.label} style={CU.card}>
              <div style={{ marginBottom: 4, fontSize: 20 }}>{s.icon}</div>
              <div style={{ ...CU.statValue, fontSize: 16, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{s.value}</div>
              <div style={CU.statLabel}>{s.label}</div>
            </div>
          ))}
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24 }}>
        {([['agents', '🎤', 'Assistants'], ['history', '📋', `Historique${totalCalls > 0 ? ` (${totalCalls})` : ''}`]] as [string, string, string][]).map(([t, icon, l]) => (
          <button
            key={t}
            onClick={() => setActiveSection(t as 'agents' | 'history')}
            style={activeSection === t ? { ...CU.btnPrimary, borderRadius: 20, padding: '8px 20px' } : { ...CU.btnGhost, borderRadius: 20, padding: '8px 20px' }}
          >
            {icon} {l}
          </button>
        ))}
      </div>

      {/* Agents grid */}
      {activeSection === 'agents' && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 16 }}>
          {VISIO_AGENTS.map(agent => (
            <div
              key={agent.id}
              onClick={() => {
                if (!requireAuth('Connectez-vous pour demarrer un appel')) return;
                router.push(`/client/visio/${agent.id}`);
              }}
              style={{ textDecoration: 'none', color: 'inherit', cursor: 'pointer' }}
            >
              <div
                style={CU.cardHoverable}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = CU.accent;
                  e.currentTarget.style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = CU.border;
                  e.currentTarget.style.transform = 'none';
                }}
              >
                <div style={{
                  width: 64, height: 64, borderRadius: '50%', margin: '0 auto 12px',
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: CU.accentLight, border: `2px solid ${CU.border}`,
                  fontSize: 28,
                }}>
                  🤖
                </div>
                <div style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 15, fontWeight: 700, color: CU.text }}>{agent.name}</div>
                  <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 2 }}>{agent.role}</div>
                  {agentFreq[agent.id] && (
                    <div style={{ fontSize: 10, color: CU.textMuted, marginTop: 4 }}>
                      {agentFreq[agent.id]} appel{agentFreq[agent.id] > 1 ? 's' : ''}
                    </div>
                  )}
                  <div style={{
                    marginTop: 10, fontSize: 11, fontWeight: 600, color: CU.text,
                    height: 36, padding: '0 12px', borderRadius: 6, background: CU.accentLight,
                    display: 'inline-block',
                  }}>
                    Appeler 📞
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Call history */}
      {activeSection === 'history' && (
        callHistory.length === 0 ? (
          <div style={{ ...CU.card, ...CU.emptyState }}>
            <div style={CU.emptyEmoji}>📞</div>
            <div style={CU.emptyTitle}>Aucun appel pour le moment</div>
            <div style={CU.emptyDesc}>
              Vos appels avec les assistants apparaîtront ici après chaque conversation visio
            </div>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {callHistory.map((call, i) => {
              const statusColor = call.status === 'completed' ? CU.text : call.status === 'missed' ? CU.textMuted : CU.text;
              const statusLabel = call.status === 'completed' ? 'Terminé' : call.status === 'missed' ? 'Manqué' : 'Erreur';
              return (
                <div key={i} style={{ ...CU.card, display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: CU.accentLight, fontSize: 18,
                  }}>
                    🤖
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontWeight: 600, fontSize: 14, color: CU.text }}>{call.agentName}</div>
                    <div style={{ fontSize: 12, color: CU.textMuted, marginTop: 2 }}>
                      {new Date(call.startedAt).toLocaleString('fr-FR', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                      {call.durationSeconds > 0 && ` · ${formatDuration(call.durationSeconds)}`}
                    </div>
                  </div>
                  <span style={{ ...CU.badge, background: statusColor + '20', color: statusColor, fontWeight: 700 }}>
                    {statusLabel}
                  </span>
                  <Link
                    href={`/client/visio/${call.agentId}`}
                    style={{ ...CU.btnPrimary, fontSize: 12, textDecoration: 'none', flexShrink: 0 }}
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
      <div style={{ ...CU.card, marginTop: 28, background: CU.bgSecondary }}>
        <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 4, color: CU.text }}>Problèmes audio ?</div>
        <div style={{ fontSize: 12, color: CU.textMuted, marginBottom: 8 }}>
          Testez votre micro et vos haut-parleurs pour vérifier que tout fonctionne.
        </div>
        <Link href="/client/visio/diagnostic" style={{ fontSize: 12, fontWeight: 600, color: CU.accent, textDecoration: 'none' }}>
          Lancer le diagnostic audio →
        </Link>
      </div>
      {LoginModalComponent}
    </div>
  );
}
