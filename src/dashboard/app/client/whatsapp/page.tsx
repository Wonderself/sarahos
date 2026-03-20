'use client';

import { useState, useEffect, useCallback } from 'react';
import { DEFAULT_AGENTS } from '../../../lib/agent-config';
import { getBond, recordAgentInteraction, recordFeedback, getTopAgents, LEVEL_NAMES, LEVEL_ICONS } from '../../../lib/agent-bonding';
import { useAuthGuard } from '../../../lib/useAuthGuard';
import { useIsMobile } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';
import PageBlogSection from '@/components/blog/PageBlogSection';

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
  const isMobile = useIsMobile();
  const { requireAuth, LoginModalComponent } = useAuthGuard();
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
    if (!requireAuth('Connectez-vous pour lier votre WhatsApp')) return;
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
      <div style={{ ...pageContainer(isMobile), display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
        {loadingTimedOut ? (
          <div style={CU.emptyState}>
            <div style={CU.emptyEmoji}>🔌</div>
            <div style={CU.emptyTitle}>Impossible de charger les données</div>
            <div style={CU.emptyDesc}>Vérifiez votre connexion ou réessayez.</div>
            <button
              onClick={() => { setLoadingTimedOut(false); setLoading(true); loadStatus(); }}
              style={CU.btnPrimary}
            >
              Réessayer
            </button>
          </div>
        ) : (
          <div style={{ fontSize: 13, color: CU.textMuted }}>Chargement...</div>
        )}
      </div>
    );
  }

  return (
    <div style={pageContainer(isMobile)}>
      {/* Header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={headerRow()}>
              <span style={emojiIcon(24)}>💬</span>
              <h1 style={CU.pageTitle}>WhatsApp</h1>
            </div>
            <p style={CU.pageSubtitle}>
              Conversez avec vos <span style={{ fontWeight: 600, color: CU.text }}>assistants IA</span> directement sur WhatsApp. Changez d&apos;assistant avec @nom.
            </p>
          </div>
          <button
            onClick={() => setShowGuide(!showGuide)}
            style={CU.btnGhost}
          >
            {showGuide ? 'Fermer' : '📚 Guide'}
          </button>
        </div>
      </div>

      {/* Guide WhatsApp */}
      {showGuide && (
        <div style={{ ...CU.card, background: CU.bgSecondary, marginBottom: 16 }}>
          <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Commandes <span style={{ fontWeight: 600 }}>WhatsApp</span></h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {WA_COMMANDS.map(c => (
              <div key={c.cmd} style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <code style={{
                  fontSize: 13, fontWeight: 600, color: CU.text,
                  background: CU.accentLight, padding: '2px 8px', borderRadius: 6,
                }}>{c.cmd}</code>
                <span style={{ fontSize: 12, color: CU.textMuted }}>{c.desc}</span>
              </div>
            ))}
          </div>
          <p style={{ fontSize: 12, color: CU.textMuted, marginTop: 12 }}>
            Par défaut, les réponses sont courtes (300 car.). Dites &quot;détaille&quot; pour une réponse complète.
          </p>
        </div>
      )}

      {error && (
        <div style={{ ...CU.card, background: '#FFF5F5', borderColor: CU.danger, color: CU.danger, marginBottom: 16, fontSize: 13 }}>
          {error}
        </div>
      )}
      {success && (
        <div style={{ ...CU.card, background: '#F0FFF4', borderColor: CU.success, color: CU.success, marginBottom: 16, fontSize: 13 }}>
          {success}
        </div>
      )}

      {status && !status.whatsappConfigured && (
        <div style={{ ...CU.card, background: '#FFFFF0', borderColor: CU.warning, color: CU.warning, marginBottom: 16, fontSize: 13 }}>
          WhatsApp n&apos;est pas encore configure sur la plateforme. Contactez l&apos;administrateur.
        </div>
      )}

      {/* Link phone */}
      {(!status?.linked || step === 'link') && step !== 'verify' && (
        <div style={{ ...CU.card, marginBottom: 16 }}>
          <h2 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Lier votre numero WhatsApp</h2>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="tel"
              placeholder="+33612345678"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              style={{ ...CU.input, flex: 1, fontSize: 15 }}
            />
            <button onClick={handleLinkPhone} style={CU.btnPrimary}>
              📤 Envoyer le code
            </button>
          </div>
          <p style={{ color: CU.textMuted, fontSize: 12, marginTop: 8 }}>
            Format international requis (ex: +33612345678). Un code de verification sera envoye sur WhatsApp.
          </p>
        </div>
      )}

      {/* Verify code */}
      {step === 'verify' && (
        <div style={{ ...CU.card, background: CU.bgSecondary, marginBottom: 16 }}>
          <h2 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Verification</h2>
          <p style={{ marginBottom: 12, color: CU.textSecondary, fontSize: 13 }}>Entrez le code a 6 chiffres recu sur WhatsApp :</p>
          <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
              style={{ ...CU.input, maxWidth: 160, fontSize: 18, textAlign: 'center', letterSpacing: 6 }}
            />
            <button onClick={handleVerify} style={CU.btnPrimary}>
              Verifier
            </button>
          </div>
        </div>
      )}

      {/* Status + Settings (linked & verified) */}
      {status?.linked && status.isVerified && step === 'status' && (
        <>
          <div style={{ ...CU.card, marginBottom: 16 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <h2 style={CU.sectionTitle}>WhatsApp connecte</h2>
              <span style={CU.badgeSuccess}>Actif</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 12, color: CU.textMuted }}>📞 Numero</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: CU.text }}>{status.phoneNumber}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: CU.textMuted }}>Dernier message</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{status.lastMessageAt ? new Date(status.lastMessageAt).toLocaleString('fr-FR') : 'Aucun'}</div>
              </div>
            </div>

            {/* Agent Preferences */}
            <hr style={CU.divider} />
            <div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
                <h3 style={{ fontSize: 14, fontWeight: 600, color: CU.text, margin: 0 }}>🤖 Assistant principal</h3>
                <button
                  onClick={() => setShowAgentPicker(!showAgentPicker)}
                  style={CU.btnSmall}
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
                    padding: '10px 14px', borderRadius: 8,
                    background: CU.bgSecondary, border: `1px solid ${CU.border}`,
                  }}>
                    <span style={{ fontSize: 24 }}>🤖</span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{current.name}</div>
                      <div style={{ fontSize: 12, color: CU.textMuted }}>{current.role}</div>
                    </div>
                    {bond && bond.relationshipLevel > 1 && (
                      <span style={CU.badge}>
                        {LEVEL_ICONS[bond.relationshipLevel]} {LEVEL_NAMES[bond.relationshipLevel]}
                      </span>
                    )}
                  </div>
                ) : null;
              })()}

              {/* Agent picker grid */}
              {showAgentPicker && (
                <div style={{
                  display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(140px, 100%), 1fr))',
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
                          gap: 4, padding: '10px 6px', borderRadius: 8, cursor: 'pointer', minHeight: 44,
                          border: isSelected ? `2px solid ${CU.accent}` : `1px solid ${CU.border}`,
                          background: isSelected ? CU.accentLight : CU.bgSecondary,
                          transition: 'all 0.15s',
                        }}
                      >
                        <span style={{ fontSize: 22 }}>🤖</span>
                        <span style={{ fontSize: 12, fontWeight: 600, textAlign: 'center', color: CU.text }}>{agent.name}</span>
                        <span style={{ fontSize: 10, color: CU.textMuted, textAlign: 'center', lineHeight: 1.2 }}>
                          {agent.role.length > 20 ? agent.role.slice(0, 18) + '...' : agent.role}
                        </span>
                        {bond.relationshipLevel > 1 && (
                          <span style={{ fontSize: 10, color: CU.text }}>
                            {LEVEL_ICONS[bond.relationshipLevel]} Niv.{bond.relationshipLevel}
                          </span>
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'center', marginTop: 12 }}>
                <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, color: CU.textSecondary }}>
                  <input
                    type="checkbox"
                    checked={status.enableVoiceResponses}
                    onChange={(e) => handleSettingsUpdate({ enableVoiceResponses: e.target.checked })}
                  />
                  Reponses vocales
                </label>
              </div>
            </div>

            <div style={{ marginTop: 16 }}>
              <button onClick={handleUnlink} style={CU.btnDanger}>
                Dissocier le numero
              </button>
            </div>
          </div>

          {/* Top Agents — Bonding */}
          {topAgents.length > 0 && (
            <div style={{ ...CU.card, marginBottom: 16 }}>
              <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Mes outils preferes</h3>
              <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
                {topAgents.map(bond => {
                  const agentDef = DEFAULT_AGENTS.find(a => a.id === bond.agentId);
                  if (!agentDef) return null;
                  return (
                    <div key={bond.agentId} style={{
                      display: 'flex', alignItems: 'center', gap: 8,
                      padding: '8px 14px', borderRadius: 8,
                      background: CU.bgSecondary, border: `1px solid ${CU.border}`,
                      flex: '1 1 140px', minWidth: 140,
                    }}>
                      <span style={{ fontSize: 20 }}>🤖</span>
                      <div>
                        <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{agentDef.name}</div>
                        <div style={{ fontSize: 11, color: CU.textMuted }}>
                          {bond.totalInteractions} echanges · {LEVEL_ICONS[bond.relationshipLevel]} {LEVEL_NAMES[bond.relationshipLevel]}
                        </div>
                        {bond.satisfactionScore !== 50 && (
                          <div style={{ fontSize: 10, color: bond.satisfactionScore >= 60 ? CU.text : CU.textSecondary }}>
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
          <div style={{ marginBottom: 16 }}>
            <div style={{ ...headerRow(), marginBottom: 12 }}>
              <span style={emojiIcon(20)}>💬</span>
              <h2 style={CU.sectionTitle}>Conversations</h2>
            </div>
            {conversations.length === 0 ? (
              <div style={CU.emptyState}>
                <div style={CU.emptyEmoji}>💬</div>
                <div style={CU.emptyTitle}>Aucune conversation</div>
                <div style={CU.emptyDesc}>Envoyez un message WhatsApp au numero Freenzy.io pour commencer !</div>
              </div>
            ) : (
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadMessages(conv.id)}
                    style={{
                      ...CU.cardHoverable,
                      borderColor: selectedConv === conv.id ? CU.accent : CU.border,
                      background: selectedConv === conv.id ? CU.accentLight : CU.bg,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontWeight: 600, fontSize: 13, color: CU.text }}>
                        {(() => {
                          const agent = DEFAULT_AGENTS.find(a => a.id === conv.agentName || a.name.toLowerCase() === conv.agentName);
                          return agent ? agent.name : conv.agentName;
                        })()}
                      </span>
                      <span style={{ fontSize: 12, color: CU.textMuted }}>{new Date(conv.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div style={{ fontSize: 12, color: CU.textSecondary, marginTop: 4 }}>
                      {conv.messageCount} messages · {conv.totalTokens} tokens · {conv.status}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Messages */}
          {selectedConv && (
            <div style={{ ...CU.card, marginBottom: 16 }}>
              <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Messages</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxHeight: 400, overflowY: 'auto' }}>
                {messages.map((msg) => {
                  const agent = msg.direction === 'outbound' ? getAgentForMessage(msg) : null;
                  return (
                    <div key={msg.id}>
                      {/* Agent indicator for outbound messages */}
                      {agent && (
                        <div style={{
                          fontSize: 11, color: CU.textMuted,
                          marginBottom: 2, textAlign: 'right',
                        }}>
                          🤖 {agent.name}
                        </div>
                      )}
                      <div style={{
                        padding: '8px 12px',
                        borderRadius: 8,
                        maxWidth: '80%',
                        background: msg.direction === 'inbound' ? CU.bgSecondary : CU.accentLight,
                        border: `1px solid ${CU.border}`,
                        marginLeft: msg.direction === 'outbound' ? 'auto' : 0,
                        marginRight: msg.direction === 'inbound' ? 'auto' : 0,
                      }}>
                        <div style={{ fontSize: 13, color: CU.text }}>{msg.content || msg.transcription || `[${msg.messageType}]`}</div>
                        <div style={{ fontSize: 11, marginTop: 4, textAlign: 'right', color: CU.textMuted }}>
                          {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                          {msg.tokensUsed > 0 && ` · ${msg.tokensUsed}t`}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {messages.length === 0 && (
                  <div style={CU.emptyState}>
                    <div style={CU.emptyDesc}>Aucun message</div>
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      )}
      {LoginModalComponent}
      <PageBlogSection pageId="whatsapp" />
    </div>
  );
}
