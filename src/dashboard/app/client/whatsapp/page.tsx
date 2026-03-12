'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_AGENTS } from '../../../lib/agent-config';
import { getBond, recordAgentInteraction, recordFeedback, getTopAgents, LEVEL_NAMES, LEVEL_ICONS } from '../../../lib/agent-bonding';

const API = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3010';

interface PhoneLinkStatus {
  linked: boolean;
  phoneNumber: string | null;
  isVerified: boolean;
  preferredAgent: string;
  preferredLanguage: string;
  enableVoiceResponses: boolean;
  lastMessageAt: string | null;
  activeConversation: {
    id: string;
    messageCount: number;
    windowEnd: string;
  } | null;
  whatsappConfigured: boolean;
}

interface Conversation {
  id: string;
  phoneNumber: string;
  status: string;
  messageCount: number;
  totalTokens: number;
  totalBilledCredits: number;
  agentName: string;
  windowStart: string;
  windowEnd: string;
  createdAt: string;
}

interface Message {
  id: string;
  direction: 'inbound' | 'outbound';
  messageType: string;
  content: string | null;
  transcription: string | null;
  tokensUsed: number;
  billedCredits: number;
  status: string;
  createdAt: string;
  metadata?: { agent_id?: string };
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') || '{}');
      return session.token || '';
    } catch { return ''; }
  }
  return '';
}

async function apiFetch(path: string, options: RequestInit = {}) {
  const token = getToken();
  const res = await fetch(`${API}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers,
    },
  });
  return res.json();
}

// WhatsApp commands guide
const WA_COMMANDS = [
  { cmd: '@ines', desc: 'Parler à Inès (Assistante)' },
  { cmd: '@sacha', desc: 'Parler à Sacha (Commercial)' },
  { cmd: '@jade', desc: 'Parler à Jade (Marketing)' },
  { cmd: 'détaille', desc: 'Obtenir une réponse longue' },
  { cmd: 'résume', desc: 'Revenir en mode court' },
];

export default function WhatsAppPage() {
  const [status, setStatus] = useState<PhoneLinkStatus | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingTimedOut, setLoadingTimedOut] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'status' | 'link' | 'verify'>('status');
  const [showAgentPicker, setShowAgentPicker] = useState(false);
  const [showGuide, setShowGuide] = useState(false);

  const loadStatus = useCallback(async () => {
    try {
      const data = await apiFetch('/whatsapp/status');
      setStatus(data);
      if (data.linked && data.isVerified) {
        const convData = await apiFetch('/whatsapp/conversations');
        setConversations(convData.conversations || []);
      }
    } catch {
      setError('Impossible de charger les données. Vérifiez votre connexion.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

  useEffect(() => {
    if (!loading) return;
    const timer = setTimeout(() => {
      if (loading) setLoadingTimedOut(true);
    }, 5000);
    return () => clearTimeout(timer);
  }, [loading]);

  const handleLinkPhone = async () => {
    setError(''); setSuccess('');
    if (!phoneInput.match(/^\+[1-9]\d{6,14}$/)) {
      setError('Format E.164 requis (ex: +33612345678)');
      return;
    }
    try {
      const data = await apiFetch('/whatsapp/link-phone', {
        method: 'POST',
        body: JSON.stringify({ phoneNumber: phoneInput }),
      });
      if (data.error) { setError(data.error); return; }
      setSuccess('Code de verification envoye sur WhatsApp !');
      setStep('verify');
    } catch { setError('Erreur lors de la liaison'); }
  };

  const handleVerify = async () => {
    setError(''); setSuccess('');
    try {
      const data = await apiFetch('/whatsapp/verify-phone', {
        method: 'POST',
        body: JSON.stringify({ code: codeInput }),
      });
      if (data.verified) {
        setSuccess('Numero verifie avec succes !');
        setStep('status');
        await loadStatus();
      } else {
        setError('Code invalide ou expire');
      }
    } catch { setError('Erreur de verification'); }
  };

  const handleUnlink = async () => {
    if (!confirm('Supprimer la liaison WhatsApp ?')) return;
    setError(''); setSuccess('');
    try {
      const data = await apiFetch('/whatsapp/unlink-phone', { method: 'DELETE' });
      if (data.error) { setError(data.error); return; }
      setSuccess('Numero dissocie avec succes');
      setStep('status');
      await loadStatus();
    } catch { setError('Erreur lors de la dissociation du numero'); }
  };

  const handleSettingsUpdate = async (settings: Record<string, unknown>) => {
    setError(''); setSuccess('');
    try {
      const data = await apiFetch('/whatsapp/settings', {
        method: 'POST',
        body: JSON.stringify(settings),
      });
      if (data.error) { setError(data.error); return; }
      setSuccess('Preferences mises a jour');
      await loadStatus();
    } catch { setError('Erreur de mise a jour'); }
  };

  const loadMessages = async (convId: string) => {
    setSelectedConv(convId);
    try {
      const data = await apiFetch(`/whatsapp/conversations/${convId}/messages`);
      setMessages(data.messages || []);
    } catch { setError('Erreur chargement messages'); }
  };

  const getAgentForMessage = (msg: Message) => {
    const agentId = msg.metadata?.agent_id;
    if (agentId) return DEFAULT_AGENTS.find(a => a.id === agentId);
    return null;
  };

  const topAgents = getTopAgents(3);

  if (loading) {
    return (
      <div className="p-24 text-center">
        {loadingTimedOut ? (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔌</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 8 }}>
              Impossible de charger les données
            </div>
            <div style={{ fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)', marginBottom: 16 }}>
              Vérifiez votre connexion ou réessayez.
            </div>
            <button
              onClick={() => { setLoadingTimedOut(false); setLoading(true); loadStatus(); }}
              className="btn btn-primary btn-sm"
            >
              Réessayer
            </button>
          </>
        ) : (
          <div className="animate-pulse text-md" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Chargement...</div>
        )}
      </div>
    );
  }

  return (
    <div className="page-container max-w-lg client-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ color: 'var(--fz-text, #1E293B)' }}>💬 WhatsApp</h1>
          <p className="page-subtitle" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
            Conversez avec vos <span className="fz-logo-word">assistants IA</span> directement sur WhatsApp. Changez d&apos;assistant avec @nom.
          </p>
        </div>
        <button
          onClick={() => setShowGuide(!showGuide)}
          className="btn btn-ghost btn-sm"
          style={{ fontSize: 13, gap: 6 }}
        >
          {showGuide ? 'Fermer' : <>📚 Guide</>}
        </button>
      </div>

      {/* Guide WhatsApp */}
      {showGuide && (
        <div className="card section" style={{ background: 'var(--fz-bg-secondary, #F8FAFC)', border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))' }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--fz-text, #1E293B)' }}>Commandes <span className="fz-logo-word">WhatsApp</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WA_COMMANDS.map(c => (
              <div key={c.cmd} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <code style={{
                  fontSize: 13, fontWeight: 600, color: '#25D366',
                  background: 'rgba(37,211,102,0.08)', padding: '2px 8px', borderRadius: 6,
                }}>{c.cmd}</code>
                <span style={{ fontSize: 12, color: 'var(--fz-text-muted)' }}>{c.desc}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 12 }}>
            Par défaut, les réponses sont courtes (300 car.). Dites &quot;détaille&quot; pour une réponse complète.
          </p>
        </div>
      )}

      {error && <div className="alert alert-danger mb-16">{error}</div>}
      {success && <div className="alert alert-success mb-16">{success}</div>}

      {status && !status.whatsappConfigured && (
        <div className="alert alert-warning mb-16">
          WhatsApp n&apos;est pas encore configure sur la plateforme. Contactez l&apos;administrateur.
        </div>
      )}

      {/* Link phone */}
      {(!status?.linked || step === 'link') && step !== 'verify' && (
        <div className="card section">
          <h2 className="section-title" style={{ color: 'var(--fz-text, #1E293B)' }}>Lier votre numero WhatsApp</h2>
          <div className="flex gap-12 items-center">
            <input
              type="tel"
              placeholder="+33612345678"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="input flex-1 text-lg"
            />
            <button onClick={handleLinkPhone} className="btn wa-btn font-semibold">
              📤 Envoyer le code
            </button>
          </div>
          <p style={{ color: 'var(--fz-text-muted, #94A3B8)' }} className="text-md mt-8">
            Format international requis (ex: +33612345678). Un code de verification sera envoye sur WhatsApp.
          </p>
        </div>
      )}

      {/* Verify code */}
      {step === 'verify' && (
        <div className="card section wa-bg">
          <h2 className="section-title" style={{ color: 'var(--fz-text, #1E293B)' }}>Verification</h2>
          <p className="mb-12" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>Entrez le code a 6 chiffres recu sur WhatsApp :</p>
          <div className="flex gap-12 items-center">
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
              className="input wa-verify-input"
            />
            <button onClick={handleVerify} className="btn wa-btn font-semibold">
              Verifier
            </button>
          </div>
        </div>
      )}

      {/* Status + Settings (linked & verified) */}
      {status?.linked && status.isVerified && step === 'status' && (
        <>
          <div className="card info-card info-card-success section">
            <div className="flex-between mb-16">
              <h2 className="section-title mb-0" style={{ color: 'var(--fz-text, #1E293B)' }}>WhatsApp connecte</h2>
              <span className="wa-badge-active">Actif</span>
            </div>

            <div className="grid-2 mb-16">
              <div>
                <div style={{ color: 'var(--fz-text-muted, #94A3B8)' }} className="text-md">📞 Numero</div>
                <div className="font-semibold text-lg" style={{ color: 'var(--fz-text, #1E293B)' }}>{status.phoneNumber}</div>
              </div>
              <div>
                <div style={{ color: 'var(--fz-text-muted, #94A3B8)' }} className="text-md">Dernier message</div>
                <div className="font-semibold" style={{ color: 'var(--fz-text, #1E293B)' }}>{status.lastMessageAt ? new Date(status.lastMessageAt).toLocaleString('fr-FR') : 'Aucun'}</div>
              </div>
            </div>

            {/* Agent Preferences */}
            <div className="separator"></div>
            <div>
              <div className="flex-between items-center mb-12">
                <h3 className="text-lg" style={{ color: 'var(--fz-text, #1E293B)' }}>🤖 Assistant principal</h3>
                <button
                  onClick={() => setShowAgentPicker(!showAgentPicker)}
                  className="btn btn-ghost btn-sm"
                  style={{ fontSize: 12 }}
                >
                  {showAgentPicker ? 'Fermer' : 'Changer'}
                </button>
              </div>

              {/* Current agent display */}
              {(() => {
                const current = DEFAULT_AGENTS.find(a => a.id === status.preferredAgent || a.name.toLowerCase() === status.preferredAgent);
                const bond = current ? getBond(current.id) : null;
                return current ? (
                  <div style={{
                    display: 'flex', alignItems: 'center', gap: 12,
                    padding: '10px 14px', borderRadius: 10,
                    background: 'var(--fz-bg-secondary, #F8FAFC)', border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
                  }}>
                    <span style={{ fontSize: 24 }}>🤖</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{current.name}</div>
                      <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{current.role}</div>
                    </div>
                    {bond && bond.relationshipLevel > 1 && (
                      <div style={{
                        fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 20,
                        background: 'rgba(91,108,247,0.1)', color: 'var(--fz-accent, #0EA5E9)',
                      }}>
                        {LEVEL_ICONS[bond.relationshipLevel]} {LEVEL_NAMES[bond.relationshipLevel]}
                      </div>
                    )}
                  </div>
                ) : null;
              })()}

              {/* Agent picker grid */}
              {showAgentPicker && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))',
                  gap: 8, marginTop: 12,
                }}>
                  {DEFAULT_AGENTS.map(agent => {
                    const bond = getBond(agent.id);
                    const isSelected = status.preferredAgent === agent.id || status.preferredAgent === agent.name.toLowerCase();
                    return (
                      <button
                        key={agent.id}
                        onClick={() => {
                          handleSettingsUpdate({ preferredAgent: agent.id });
                          setShowAgentPicker(false);
                        }}
                        style={{
                          display: 'flex', flexDirection: 'column', alignItems: 'center',
                          gap: 4, padding: '10px 6px', borderRadius: 10, cursor: 'pointer',
                          border: isSelected ? '2px solid #25D366' : '1px solid var(--fz-border, #E2E8F0)',
                          background: isSelected ? 'rgba(37,211,102,0.06)' : 'var(--fz-bg-secondary, #F8FAFC)',
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 22 }}>🤖</span>
                        <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', color: 'var(--fz-text, #1E293B)' }}>{agent.name}</span>
                        <span style={{ fontSize: 10, color: 'var(--fz-text-muted, #94A3B8)', textAlign: 'center', lineHeight: 1.2 }}>
                          {agent.role.length > 20 ? agent.role.slice(0, 18) + '...' : agent.role}
                        </span>
                        {bond.relationshipLevel > 1 && (
                          <span style={{ fontSize: 10, color: 'var(--fz-accent, #0EA5E9)' }}>
                            {LEVEL_ICONS[bond.relationshipLevel]} Niv.{bond.relationshipLevel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div className="flex gap-16 flex-wrap items-center mt-12">
                <label className="flex items-center gap-8">
                  <input
                    type="checkbox"
                    checked={status.enableVoiceResponses}
                    onChange={(e) => handleSettingsUpdate({ enableVoiceResponses: e.target.checked })}
                  />
                  Reponses vocales
                </label>
              </div>
            </div>

            <div className="mt-16">
              <button onClick={handleUnlink} className="btn btn-danger btn-sm">
                Dissocier le numero
              </button>
            </div>
          </div>

          {/* Top Agents — Bonding */}
          {topAgents.length > 0 && (
            <div className="card section">
              <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 12, color: 'var(--fz-text, #1E293B)' }}>Mes assistants preferes</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {topAgents.map(bond => {
                  const agentDef = DEFAULT_AGENTS.find(a => a.id === bond.agentId);
                  if (!agentDef) return null;
                  return (
                    <div key={bond.agentId} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px', borderRadius: 10,
                      background: 'var(--fz-bg-secondary, #F8FAFC)', border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
                      flex: '1 1 140px', minWidth: 140,
                    }}>
                      <span style={{ fontSize: 20 }}>🤖</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{agentDef.name}</div>
                        <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>
                          {bond.totalInteractions} echanges · {LEVEL_ICONS[bond.relationshipLevel]} {LEVEL_NAMES[bond.relationshipLevel]}
                        </div>
                        {bond.satisfactionScore !== 50 && (
                          <div style={{ fontSize: 10, color: bond.satisfactionScore >= 60 ? '#22c55e' : '#ef4444' }}>
                            Satisfaction: {bond.satisfactionScore}%
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Conversations */}
          <div className="section">
            <h2 className="section-title" style={{ color: 'var(--fz-text, #1E293B)' }}>💬 Conversations</h2>
            {conversations.length === 0 ? (
              <p style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Aucune conversation. Envoyez un message WhatsApp au numero Freenzy.io pour commencer !</p>
            ) : (
              <div className="flex-col gap-8">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadMessages(conv.id)}
                    className={`card-compact rounded-md border pointer ${selectedConv === conv.id ? 'wa-conv-active' : ''}`}
                  >
                    <div className="flex-between">
                      <span className="font-semibold" style={{ color: 'var(--fz-text, #1E293B)' }}>
                        {(() => {
                          const agent = DEFAULT_AGENTS.find(a => a.id === conv.agentName || a.name.toLowerCase() === conv.agentName);
                          return agent ? agent.name : conv.agentName;
                        })()}
                      </span>
                      <span className="text-md" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>{new Date(conv.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="text-md mt-4" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
                      {conv.messageCount} messages · {conv.totalTokens} tokens · {conv.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          {selectedConv && (
            <div className="card section">
              <h3 className="text-lg mb-12" style={{ color: 'var(--fz-text, #1E293B)' }}>Messages</h3>
              <div className="flex-col gap-8 wa-messages-scroll">
                {messages.map((msg) => {
                  const agent = msg.direction === 'outbound' ? getAgentForMessage(msg) : null;
                  return (
                    <div key={msg.id}>
                      {/* Agent indicator for outbound messages */}
                      {agent && (
                        <div style={{
                          fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)',
                          marginBottom: 2, textAlign: 'right',
                        }}>
                          🤖 {agent.name}
                        </div>
                      )}
                      <div className={`wa-bubble ${msg.direction === 'inbound' ? 'wa-bubble-inbound' : 'wa-bubble-outbound'}`}>
                        <div className="text-base">{msg.content || msg.transcription || `[${msg.messageType}]`}</div>
                        <div className="text-xs mt-4 text-right" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {msg.tokensUsed > 0 && ` · ${msg.tokensUsed}t`}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <p className="text-center" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Aucun message</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
