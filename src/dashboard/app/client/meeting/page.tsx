'use client';

import { useState, useRef, useEffect } from 'react';
import { DEFAULT_AGENTS, loadAgentConfigs, getEffectiveAgent, type ResolvedAgent, type AgentTypeId } from '../../../lib/agent-config';
import VoiceInput from '../../../components/VoiceInput';
import AudioPlayback from '../../../components/AudioPlayback';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

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
      <div className="client-page-scrollable">
        <div className="page-header" style={{ marginBottom: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>{meta.emoji}</span>
            <div>
              <h1 className="page-title" style={{ color: 'var(--fz-text, #1A1A1A)' }}>Salle de <span className="fz-logo-word">Réunion</span></h1>
              <p className="page-subtitle" style={{ color: 'var(--fz-text-secondary, #6B6B6B)' }}>
                Réunissez vos <span className="fz-logo-word">agents</span> pour des discussions stratégiques. Ils collaborent, débattent, et proposent des solutions <span className="fz-logo-word">ensemble</span>.
              </p>
            </div>
            <HelpBubble text={meta.helpText} />
          </div>
        </div>
        <PageExplanation pageId="meeting" text={PAGE_META.meeting?.helpText} />

        {/* Agent Selection */}
        <div className="card section">
          <div className="section-title mb-16" style={{ color: 'var(--fz-text, #1A1A1A)' }}>👥 Participants ({selectedAgents.length}/5)</div>
          <div className="flex flex-wrap" style={{ gap: 10 }}>
            {meetingAgents.map(agent => {
              const selected = selectedAgents.includes(agent.id);
              return (
                <button
                  key={agent.id}
                  onClick={() => toggleAgent(agent.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 10, padding: '12px 18px',
                    borderRadius: 'var(--radius-lg)', background: selected ? 'rgba(0,0,0,0.04)' : 'var(--fz-bg-secondary, #F7F7F7)',
                    border: `2px solid ${selected ? '#1A1A1A' : 'var(--fz-border, #E5E5E5)'}`,
                    cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 24 }}>🤖</span>
                  <div style={{ textAlign: 'left' }}>
                    <div className="text-md font-semibold" style={{ color: '#1A1A1A' }}>{agent.role}</div>
                    <div className="text-xs" style={{ color: 'var(--fz-text-muted, #9B9B9B)' }}>{selected ? 'Présent' : 'Inviter'}</div>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Topic */}
        <div className="card section">
          <div className="section-title flex items-center gap-8 mb-16" style={{ color: 'var(--fz-text, #1A1A1A)' }}>
            Sujet de la réunion
            <VoiceInput
              onTranscript={(t) => setTopic(prev => prev ? prev + ' ' + t : t)}
              size="sm"
            />
          </div>
          <textarea
            value={topic}
            onChange={e => setTopic(e.target.value)}
            className="input"
            rows={3}
            placeholder="Décrivez le sujet, la problématique, ou l'objectif de cette réunion..."
            style={{ width: '100%', resize: 'vertical', marginBottom: 12 }}
          />

          {/* Prompt Suggestions */}
          <div className="flex gap-8 flex-wrap mb-16">
            {TOPIC_SUGGESTIONS.map(suggestion => (
              <button
                key={suggestion}
                onClick={() => setTopic(suggestion)}
                style={{
                  padding: '6px 14px',
                  borderRadius: 20,
                  border: '1px solid var(--border-primary, #E5E5E5)',
                  background: 'var(--fz-bg-secondary, #F7F7F7)',
                  cursor: 'pointer',
                  fontSize: 12,
                  minHeight: 44,
                  color: 'var(--fz-text-secondary, #6B6B6B)',
                  transition: 'all 0.2s',
                }}
                onMouseOver={e => { e.currentTarget.style.borderColor = 'var(--accent)'; e.currentTarget.style.color = 'var(--accent)'; }}
                onMouseOut={e => { e.currentTarget.style.borderColor = 'var(--fz-border, #E5E5E5)'; e.currentTarget.style.color = 'var(--fz-text-secondary, #6B6B6B)'; }}
              >
                {suggestion}
              </button>
            ))}
          </div>

          <div className="section-title text-md mb-12" style={{ color: 'var(--fz-text, #1A1A1A)' }}>Ou choisissez un template</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(220px, 100%), 1fr))', gap: 10 }}>
            {MEETING_TEMPLATES.map(tpl => (
              <button
                key={tpl.title}
                onClick={() => {
                  setTopic(tpl.topic);
                  setSelectedAgents(tpl.suggestedAgents);
                }}
                className="card"
                style={{
                  cursor: 'pointer', textAlign: 'left', padding: 14,
                  border: topic === tpl.topic ? '2px solid var(--accent)' : '1px solid var(--fz-border, #E5E5E5)',
                  background: topic === tpl.topic ? 'var(--accent-muted)' : 'var(--fz-bg-secondary, #F7F7F7)',
                }}
              >
                <div className="text-xl mb-4">{tpl.icon}</div>
                <div className="text-md font-semibold" style={{ color: 'var(--fz-text, #1A1A1A)' }}>{tpl.title}</div>
                <div className="text-xs mt-4" style={{ lineHeight: 1.4, color: 'var(--fz-text-muted, #9B9B9B)' }}>{tpl.description}</div>
              </button>
            ))}
          </div>
        </div>

        <div className="text-center" style={{ padding: '20px 0' }}>
          <button
            onClick={startMeeting}
            disabled={!topic.trim() || selectedAgents.length < 2}
            className="btn btn-primary text-lg"
            style={{ padding: '14px 48px' }}
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
    <div className="chat-height flex flex-col client-page-scrollable">
      {/* Meeting Header */}
      <div className="flex flex-between items-center flex-wrap gap-8" style={{ padding: '12px 0', borderBottom: '1px solid var(--fz-border, #E5E5E5)' }}>
        <div>
          <div className="text-lg font-bold" style={{ color: 'var(--fz-text, #1A1A1A)' }}>📞 Réunion en cours</div>
          <div className="text-sm" style={{ color: 'var(--fz-text-muted, #9B9B9B)' }}>
            {activeAgents.length} participants | {messages.length} interventions | {totalTokens.toLocaleString()} tokens | {(totalCost / 1_000_000).toFixed(4)} cr
          </div>
        </div>
        <div className="flex gap-8">
          {activeAgents.map(a => (
            <span key={a.id} title={a.role} style={{
              width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 16, background: '#F0F0F0', border: '2px solid #E5E5E5',
            }}>
              🤖
            </span>
          ))}
        </div>
      </div>

      {/* Topic Bar */}
      <div className="text-md" style={{ padding: '10px 16px', borderBottom: '1px solid var(--fz-border, #E5E5E5)', background: 'var(--fz-bg-secondary, #F7F7F7)', color: 'var(--fz-text, #1A1A1A)' }}>
        <strong>Sujet:</strong> {topic}
      </div>

      {/* Messages */}
      <div className="flex-1" style={{ overflowY: 'auto', padding: '16px 0' }}>
        {messages.map((msg, i) => {
          const agent = getAgentByRole(msg.speakerRole) ?? meetingAgents[0];
          return (
            <div key={i} className="flex gap-12 mb-16" style={{ padding: '0 4px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 20, background: '#F0F0F0', border: '2px solid #E5E5E5', flexShrink: 0,
              }}>
                🤖
              </div>
              <div className="flex-1">
                <div className="flex gap-8 mb-4" style={{ alignItems: 'baseline' }}>
                  <span className="text-md font-bold" style={{ color: '#1A1A1A' }}>{msg.speaker}</span>
                  <span className="text-xs" style={{ color: 'var(--fz-text-muted, #9B9B9B)' }}>{msg.speakerRole}</span>
                </div>
                <div style={{
                  padding: '10px 14px', borderRadius: '4px 12px 12px 12px',
                  background: 'var(--fz-bg-secondary, #F7F7F7)', border: '1px solid var(--border-primary, #E5E5E5)',
                  fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap', color: 'var(--fz-text, #1A1A1A)',
                }}>
                  {msg.content}
                </div>
                <div className="flex items-center gap-6 mt-4">
                  <div className="text-xs" style={{ color: 'var(--fz-text-muted, #9B9B9B)' }}>
                    {msg.tokens} tokens | {(msg.cost / 1_000_000).toFixed(4)} cr
                  </div>
                  <AudioPlayback text={msg.content} gender={DEFAULT_AGENTS.find(a => a.name === msg.speaker || a.role === msg.speakerRole)?.gender ?? 'F'} size="sm" />
                </div>
              </div>
            </div>
          );
        })}
        {running && (
          <div className="flex gap-12 mb-16" style={{ padding: '0 4px' }}>
            <div className="flex-center rounded-full" style={{ width: 40, height: 40, background: 'var(--fz-bg-secondary, #F7F7F7)' }}>
              <span className="animate-pulse">...</span>
            </div>
            <div className="animate-pulse" style={{ padding: '10px 14px', color: 'var(--fz-text-muted, #9B9B9B)' }}>
              Un agent prend la parole...
            </div>
          </div>
        )}

        {/* Validation Pause Panel */}
        {validationNeeded && (
          <div style={{
            margin: '16px 4px',
            padding: 20,
            borderRadius: 'var(--radius-lg)',
            border: '2px solid var(--accent)',
            background: 'var(--accent-muted)',
          }}>
            <div className="text-lg font-bold mb-4" style={{ color: 'var(--fz-text, #1A1A1A)' }}>
              Votre avis est important
            </div>
            <div className="text-sm" style={{ marginBottom: 14, color: 'var(--fz-text-secondary, #6B6B6B)' }}>
              Un tour de table est terminé. Donnez une orientation pour la suite ou laissez continuer librement.
            </div>

            {/* Suggestion chips */}
            <div className="flex gap-8 flex-wrap mb-12">
              {VALIDATION_SUGGESTIONS.map(suggestion => (
                <button
                  key={suggestion}
                  onClick={() => setUserDirection(suggestion)}
                  style={{
                    padding: '6px 14px',
                    borderRadius: 20,
                    border: userDirection === suggestion ? '1px solid var(--accent)' : '1px solid var(--fz-border, #E5E5E5)',
                    background: userDirection === suggestion ? 'var(--accent)' : 'var(--fz-bg, #fff)',
                    color: userDirection === suggestion ? '#fff' : 'var(--fz-text-secondary, #6B6B6B)',
                    cursor: 'pointer',
                    fontSize: 12,
                    minHeight: 44,
                    transition: 'all 0.2s',
                  }}
                >
                  {suggestion}
                </button>
              ))}
            </div>

            {/* Free-form input */}
            <div className="flex gap-8 items-center mb-12">
              <input
                type="text"
                value={userDirection}
                onChange={e => setUserDirection(e.target.value)}
                className="input flex-1 text-md"
                placeholder="Ou tapez votre orientation libre..."
                style={{ padding: '8px 12px' }}
                onKeyDown={e => { if (e.key === 'Enter') handleValidationContinue(); }}
              />
              <VoiceInput
                onTranscript={(t) => setUserDirection(prev => prev ? prev + ' ' + t : t)}
                size="sm"
              />
            </div>

            {/* Action buttons */}
            <div className="flex gap-8">
              <button onClick={handleValidationContinue} className="btn btn-primary flex-1">
                Continuer
              </button>
              <button onClick={handleValidationStop} className="btn btn-danger" style={{ padding: '8px 20px' }}>
                Arrêter
              </button>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Controls */}
      <div className="flex gap-8 items-center flex-wrap" style={{ padding: '12px 0', borderTop: '1px solid var(--fz-border, #E5E5E5)' }}>
        <button onClick={() => nextTurn()} disabled={running || validationNeeded} className="btn btn-primary flex-1">
          {running ? 'En cours...' : 'Tour suivant'}
        </button>
        <button
          onClick={autoMode ? () => { abortRef.current = true; } : runAutoMode}
          disabled={(running && !autoMode) || validationNeeded}
          className={autoMode ? 'btn btn-danger flex-1' : 'btn btn-secondary flex-1'}
        >
          {autoMode ? 'Arrêter le mode auto' : 'Mode auto (2 tours)'}
        </button>
        <button onClick={endMeeting} className="btn btn-ghost">
          Terminer
        </button>
      </div>
    </div>
  );
}
