'use client';

import { useState, useRef, useEffect } from 'react';
import { DEFAULT_AGENTS, loadAgentConfigs, getEffectiveAgent, type ResolvedAgent, type AgentTypeId } from '../../../lib/agent-config';
import VoiceInput from '../../../components/VoiceInput';
import AudioPlayback from '../../../components/AudioPlayback';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon } from '../../../lib/page-styles';
import { useIsMobile } from '../../../lib/use-media-query';

interface MeetingMessage {
  speaker: string;
  speakerRole: string;
  speakerId: string;
  content: string;
  tokens: number;
  cost: number;
  timestamp: string;
}

const MEETING_TEMPLATES = [
  { icon: '🚀', title: 'Lancement de projet', topic: 'Lancer un nouveau projet stratégique', description: 'Définir les objectifs, les rôles et le planning', suggestedAgents: ['fz-dg', 'fz-dev', 'fz-finance'] as AgentTypeId[] },
  { icon: '📊', title: 'Revue trimestrielle', topic: 'Revue des performances du trimestre', description: 'Analyser les résultats et ajuster la stratégie', suggestedAgents: ['fz-dg', 'fz-finance', 'fz-commercial'] as AgentTypeId[] },
  { icon: '💡', title: 'Brainstorming produit', topic: 'Brainstorming pour un nouveau produit ou service', description: 'Générer des idées innovantes en équipe', suggestedAgents: ['fz-marketing', 'fz-dev', 'fz-commercial'] as AgentTypeId[] },
  { icon: '🛡️', title: 'Résolution de crise', topic: 'Résoudre une situation de crise urgente', description: 'Coordonner la réponse et protéger l\'entreprise', suggestedAgents: ['fz-dg', 'fz-communication', 'fz-juridique'] as AgentTypeId[] },
  { icon: '📅', title: 'Planification annuelle', topic: 'Planification stratégique pour l\'année', description: 'Fixer les objectifs et budgets annuels', suggestedAgents: ['fz-dg', 'fz-finance', 'fz-rh'] as AgentTypeId[] },
  { icon: '🤝', title: 'Partenariat stratégique', topic: 'Évaluer un partenariat ou une acquisition', description: 'Analyser les opportunités et risques', suggestedAgents: ['fz-dg', 'fz-commercial', 'fz-juridique'] as AgentTypeId[] },
];

const TOPIC_SUGGESTIONS = [
  'Comment augmenter notre CA de 20% ?',
  'Faut-il recruter un dev ou externaliser ?',
  'Notre concurrent a baissé ses prix, que faire ?',
  'On doit réduire nos coûts de 15%, par où commencer ?',
];

const VALIDATION_SUGGESTIONS = [
  'Creusez les coûts',
  'Quels risques ?',
  'Plan d\'action concret',
  'Comparez les options',
];

const meta = PAGE_META.meeting;

export default function MeetingPage() {
  const isMobile = useIsMobile();
  const [meetingAgents, setMeetingAgents] = useState<ResolvedAgent[]>([]);
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['fz-dg', 'fz-marketing', 'fz-finance']);
  const [topic, setTopic] = useState('');
  const [messages, setMessages] = useState<MeetingMessage[]>([]);
  const [running, setRunning] = useState(false);
  const [autoMode, setAutoMode] = useState(false);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [meetingStarted, setMeetingStarted] = useState(false);
  const [validationNeeded, setValidationNeeded] = useState(false);
  const [userDirection, setUserDirection] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef(false);
  const validationResolveRef = useRef<((direction: string) => void) | null>(null);
  // Refs to avoid stale closures in runAutoMode
  const messagesRef = useRef<MeetingMessage[]>([]);
  const meetingAgentsRef = useRef<ResolvedAgent[]>([]);
  const selectedAgentsRef = useRef<string[]>(['fz-dg', 'fz-marketing', 'fz-finance']);
  const topicRef = useRef('');

  // Keep refs in sync
  useEffect(() => { messagesRef.current = messages; }, [messages]);
  useEffect(() => { meetingAgentsRef.current = meetingAgents; }, [meetingAgents]);
  useEffect(() => { selectedAgentsRef.current = selectedAgents; }, [selectedAgents]);
  useEffect(() => { topicRef.current = topic; }, [topic]);

  // Load agents from config
  useEffect(() => {
    const configs = loadAgentConfigs();
    const resolved = DEFAULT_AGENTS.map(a => getEffectiveAgent(a.id, configs));
    setMeetingAgents(resolved);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getSession() {
    try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
  }

  function getCompanyContext(): string {
    try {
      const profile = localStorage.getItem('fz_company_profile');
      if (profile) {
        const p = JSON.parse(profile);
        return `Entreprise: ${p.companyName ?? 'N/A'}, Secteur: ${p.industry ?? 'N/A'}, Mission: ${p.mission ?? 'N/A'}, Défis: ${p.challenges ?? 'N/A'}, Objectifs: ${p.shortTermGoals ?? 'N/A'}`;
      }
    } catch { /* */ }
    return 'Pas de profil entreprise configuré. Répondre de manière générique.';
  }

  function toggleAgent(id: string) {
    setSelectedAgents(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 2) return prev; // Min 2 agents
        return prev.filter(x => x !== id);
      }
      if (prev.length >= 5) return prev; // Max 5
      return [...prev, id];
    });
  }

  async function nextTurn(direction?: string) {
    const session = getSession();
    if (!session.token) { window.location.href = '/login'; return; }

    const agents = meetingAgentsRef.current.filter(a => selectedAgentsRef.current.includes(a.id));
    const currentMessages = messagesRef.current;
    const currentTopic = topicRef.current;
    setRunning(true);

    try {
      const res = await fetch('/api/meeting', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          topic: currentTopic,
          agents: agents.map(a => ({ id: a.id, name: a.name + ' (' + a.role + ')', role: a.role, systemPrompt: a.meetingPrompt })),
          companyContext: getCompanyContext(),
          previousMessages: currentMessages.map(m => ({ speaker: m.speaker, content: m.content })),
          userDirection: direction || undefined,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? `Erreur ${res.status}`);

      const msg: MeetingMessage = {
        speaker: data.speaker ?? 'Agent',
        speakerRole: data.speakerRole ?? '',
        speakerId: data.speakerId ?? '',
        content: data.content ?? '',
        tokens: data.tokens ?? 0,
        cost: data.cost ?? 0,
        timestamp: new Date().toISOString(),
      };
      setMessages(prev => [...prev, msg]);
      setTotalTokens(t => t + msg.tokens);
      setTotalCost(c => c + msg.cost);
    } catch (e) {
      alert(e instanceof Error ? e.message : 'Erreur');
    } finally {
      setRunning(false);
    }
  }

  async function runAutoMode() {
    setAutoMode(true);
    abortRef.current = false;
    const agentCount = selectedAgentsRef.current.length;
    const totalRounds = 2; // 2 full rounds

    for (let round = 0; round < totalRounds; round++) {
      for (let i = 0; i < agentCount; i++) {
        if (abortRef.current) break;
        await nextTurn();
        // Small delay between turns for readability
        await new Promise(r => setTimeout(r, 800));
      }

      if (abortRef.current) break;

      // After each complete round (except the last), pause for user validation
      if (round < totalRounds - 1) {
        setUserDirection('');
        setValidationNeeded(true);

        // Wait for user to validate or stop
        const direction = await new Promise<string>((resolve) => {
          validationResolveRef.current = resolve;
        });

        // Check if user chose to stop
        if (direction === '__STOP__' || abortRef.current) {
          break;
        }

        // Continue with the direction provided — inject it in the first turn of next round
        if (direction) {
          await nextTurn(direction);
          await new Promise(r => setTimeout(r, 800));
        }
      }
    }

    setAutoMode(false);
    setValidationNeeded(false);
  }

  function handleValidationContinue() {
    setValidationNeeded(false);
    if (validationResolveRef.current) {
      validationResolveRef.current(userDirection);
      validationResolveRef.current = null;
    }
  }

  function handleValidationStop() {
    setValidationNeeded(false);
    abortRef.current = true;
    if (validationResolveRef.current) {
      validationResolveRef.current('__STOP__');
      validationResolveRef.current = null;
    }
  }

  function startMeeting() {
    if (!topic.trim()) return;
    setMeetingStarted(true);
    setMessages([]);
    setTotalTokens(0);
    setTotalCost(0);
  }

  function endMeeting() {
    abortRef.current = true;
    setAutoMode(false);
    setValidationNeeded(false);
    setMeetingStarted(false);
    if (validationResolveRef.current) {
      validationResolveRef.current('__STOP__');
      validationResolveRef.current = null;
    }
  }

  function getAgentByRole(role: string) {
    return meetingAgents.find(a => a.role === role);
  }

  if (!meetingStarted) {
    return (
      <div style={pageContainer(isMobile)}>
        <div style={{ marginBottom: 20 }}>
          <div style={headerRow()}>
            <span style={emojiIcon(24)}>{meta.emoji}</span>
            <div>
              <h1 style={CU.pageTitle}>Salle de Réunion</h1>
              <p style={CU.pageSubtitle}>
                Réunissez vos agents pour des discussions stratégiques. Ils collaborent, débattent, et proposent des solutions ensemble.
              </p>
            </div>
            <HelpBubble text={meta.helpText} />
          </div>
        </div>
        <PageExplanation pageId="meeting" text={PAGE_META.meeting?.helpText} />

        {/* Agent Selection */}
        <div style={{ ...CU.card, marginBottom: 16 }}>
          <div style={{ ...CU.sectionTitle, marginBottom: 14 }}>👥 Participants ({selectedAgents.length}/5)</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
            {meetingAgents.map(agent => {
              const selected = selectedAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
                    borderRadius: 8, background: selected ? CU.accentLight : CU.bgSecondary,
                    border: `2px solid ${selected ? CU.accent : CU.border}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>🤖</span>
                  <div style={{ textAlign: 'left' }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{agent.role}</div>
                    <div style={{ fontSize: 12, color: CU.textMuted }}>{selected ? 'Présent' : 'Inviter'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic */}
        <div style={{ ...CU.card, marginBottom: 16 }}>
          <div style={{ ...CU.sectionTitle, display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
            Sujet de la réunion
            <VoiceInput
              onTranscript={(t) => setTopic(prev => prev ? prev + ' ' + t : t)}
              size="sm"
            />
          </div>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            rows={3}
            placeholder="Décrivez le sujet, la problématique, ou l'objectif de cette réunion..."
            style={{ ...CU.textarea, marginBottom: 12 }}
          />

          {/* Prompt Suggestions */}
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 16 }}>
            {TOPIC_SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setTopic(suggestion)}
                style={{
                  ...CU.btnSmall,
                  borderRadius: 20,
                  minHeight: 36,
                  color: CU.textSecondary,
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = CU.accent; e.currentTarget.style.color = CU.accent; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = CU.border; e.currentTarget.style.color = CU.textSecondary; }}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div style={{ ...CU.sectionTitle, fontSize: 14, marginBottom: 12 }}>Ou choisissez un template</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 10 }}>
            {MEETING_TEMPLATES.map(tpl => (
              <button
                key={tpl.title}
                onClick={() => {
                  setTopic(tpl.topic);
                  setSelectedAgents(tpl.suggestedAgents);
                }}
                style={{
                  ...CU.cardHoverable,
                  textAlign: 'left' as const, padding: 14,
                  border: topic === tpl.topic ? `2px solid ${CU.accent}` : `1px solid ${CU.border}`,
                  background: topic === tpl.topic ? CU.accentLight : CU.bgSecondary,
                }}
              >
                <div style={{ fontSize: 20, marginBottom: 4 }}>{tpl.icon}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{tpl.title}</div>
                <div style={{ fontSize: 12, marginTop: 4, lineHeight: 1.4, color: CU.textMuted }}>{tpl.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div style={{ textAlign: 'center', padding: '20px 0' }}>
          <button
            onClick={startMeeting}
            disabled={!topic.trim() || selectedAgents.length < 2}
            style={{ ...CU.btnPrimary, padding: '14px 48px', fontSize: 16, height: 'auto' }}
          >
            Lancer la réunion
          </button>
        </div>
      </div>
    );
  }

  // Meeting in progress
  const activeAgents = meetingAgents.filter(a => selectedAgents.includes(a.id));

  return (
    <div style={{ ...pageContainer(isMobile), display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      {/* Meeting Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 8, padding: '12px 0', borderBottom: `1px solid ${CU.border}` }}>
        <div>
          <div style={{ fontSize: 16, fontWeight: 700, color: CU.text }}>📞 Réunion en cours</div>
          <div style={{ fontSize: 13, color: CU.textMuted }}>
            {activeAgents.length} participants | {messages.length} interventions | {totalTokens.toLocaleString()} tokens | {(totalCost / 1_000_000).toFixed(4)} cr
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {activeAgents.map(a => (
            <span key={a.id} title={a.role} style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, background: CU.bgSecondary, border: `2px solid ${CU.border}`,
            }}>
              🤖
            </span>
          ))}
        </div>
      </div>

      {/* Topic Bar */}
      <div style={{ padding: '10px 16px', borderBottom: `1px solid ${CU.border}`, background: CU.bgSecondary, color: CU.text, fontSize: 14 }}>
        <strong>Sujet:</strong> {topic}
      </div>

      {/* Messages */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '16px 0' }}>
        {messages.map((msg, i) => {
          return (
            <div key={i} style={{ display: 'flex', gap: 12, marginBottom: 16, padding: '0 4px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, background: CU.bgSecondary, border: `2px solid ${CU.border}`, flexShrink: 0,
              }}>
                🤖
              </div>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'baseline' }}>
                  <span style={{ fontSize: 14, fontWeight: 700, color: CU.text }}>{msg.speaker}</span>
                  <span style={{ fontSize: 12, color: CU.textMuted }}>{msg.speakerRole}</span>
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: '4px 8px 8px 8px',
                  background: CU.bgSecondary, border: `1px solid ${CU.border}`,
                  fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: CU.text,
                }}>
                  {msg.content}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                  <div style={{ fontSize: 12, color: CU.textMuted }}>
                    {msg.tokens} tokens | {(msg.cost / 1_000_000).toFixed(4)} cr
                  </div>
                  <AudioPlayback text={msg.content} gender={DEFAULT_AGENTS.find(a => a.name === msg.speaker || a.role === msg.speakerRole)?.gender ?? 'F'} size="sm" />
                </div>
              </div>
            </div>
          );
        })}
        {running && (
          <div style={{ display: 'flex', gap: 12, marginBottom: 16, padding: '0 4px' }}>
            <div style={{ width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: CU.bgSecondary }}>
              <span style={{ animation: 'pulse 1.5s infinite' }}>...</span>
            </div>
            <div style={{ padding: '10px 14px', color: CU.textMuted, animation: 'pulse 1.5s infinite' }}>
              Un agent prend la parole...
            </div>
          </div>
        )}

        {/* Validation Pause Panel */}
        {validationNeeded && (
          <div style={{
            margin: '16px 4px',
            padding: 20,
            borderRadius: 8,
            border: `2px solid ${CU.accent}`,
            background: CU.accentLight,
          }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4, color: CU.text }}>
              Votre avis est important
            </div>
            <div style={{ fontSize: 13, marginBottom: 14, color: CU.textSecondary }}>
              Un tour de table est terminé. Donnez une orientation pour la suite ou laissez continuer librement.
            </div>

            {/* Suggestion chips */}
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
              {VALIDATION_SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setUserDirection(suggestion)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: `1px solid ${userDirection === suggestion ? CU.accent : CU.border}`,
                    background: userDirection === suggestion ? CU.accent : CU.bg,
                    color: userDirection === suggestion ? '#fff' : CU.textSecondary,
                    cursor: 'pointer',
                    fontSize: 12,
                    minHeight: 36,
                    transition: 'all 0.2s',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Free-form input */}
            <div style={{ display: 'flex', gap: 8, alignItems: 'center', marginBottom: 12 }}>
              <input
                type="text"
                value={userDirection}
                onChange={e => setUserDirection(e.target.value)}
                placeholder="Ou tapez votre orientation libre..."
                style={{ ...CU.input, flex: 1 }}
                onKeyDown={e => { if (e.key === 'Enter') handleValidationContinue(); }}
              />
              <VoiceInput
                onTranscript={(t) => setUserDirection(prev => prev ? prev + ' ' + t : t)}
                size="sm"
              />
            </div>

            {/* Action buttons */}
            <div style={{ display: 'flex', gap: 8 }}>
              <button onClick={handleValidationContinue} style={{ ...CU.btnPrimary, flex: 1 }}>
                Continuer
              </button>
              <button onClick={handleValidationStop} style={{ ...CU.btnDanger, padding: '8px 20px' }}>
                Arrêter
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap', padding: '12px 0', borderTop: `1px solid ${CU.border}` }}>
        <button onClick={() => nextTurn()} disabled={running || validationNeeded} style={{ ...CU.btnPrimary, flex: 1 }}>
          {running ? 'En cours...' : 'Tour suivant'}
        </button>
        <button
          onClick={autoMode ? () => { abortRef.current = true; } : runAutoMode}
          disabled={(running && !autoMode) || validationNeeded}
          style={{ ...(autoMode ? CU.btnDanger : CU.btnGhost), flex: 1 }}
        >
          {autoMode ? 'Arrêter le mode auto' : 'Mode auto (2 tours)'}
        </button>
        <button onClick={endMeeting} style={CU.btnGhost}>
          Terminer
        </button>
      </div>
    </div>
  );
}
