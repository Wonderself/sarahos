'use client';

import { useState, useEffect, useCallback } from 'react';

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
}

function getToken(): string {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('sarah_token') || '';
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

export default function WhatsAppPage() {
  const [status, setStatus] = useState<PhoneLinkStatus | null>(null);
  const [phoneInput, setPhoneInput] = useState('');
  const [codeInput, setCodeInput] = useState('');
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [selectedConv, setSelectedConv] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [step, setStep] = useState<'status' | 'link' | 'verify'>('status');

  const loadStatus = useCallback(async () => {
    try {
      const data = await apiFetch('/whatsapp/status');
      setStatus(data);
      if (data.linked && data.isVerified) {
        const convData = await apiFetch('/whatsapp/conversations');
        setConversations(convData.conversations || []);
      }
    } catch {
      setError('Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { loadStatus(); }, [loadStatus]);

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
    await apiFetch('/whatsapp/unlink-phone', { method: 'DELETE' });
    setStep('status');
    await loadStatus();
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

  if (loading) {
    return (
      <div className="p-24 text-center">
        <div className="text-2xl">Chargement...</div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-lg">
      <div className="page-header">
        <div>
          <h1 className="page-title">WhatsApp</h1>
          <p className="page-subtitle">
            Liez votre numero WhatsApp pour converser avec votre agent IA directement sur WhatsApp.
          </p>
        </div>
      </div>

      {error && (
        <div className="alert alert-danger mb-16">
          {error}
        </div>
      )}
      {success && (
        <div className="alert alert-success mb-16">
          {success}
        </div>
      )}

      {/* Not configured warning */}
      {status && !status.whatsappConfigured && (
        <div className="alert alert-warning mb-16">
          WhatsApp n&apos;est pas encore configure sur la plateforme. Contactez l&apos;administrateur.
        </div>
      )}

      {/* Step: Link phone */}
      {(!status?.linked || step === 'link') && step !== 'verify' && (
        <div className="card section">
          <h2 className="section-title">Lier votre numero WhatsApp</h2>
          <div className="flex gap-12 items-center">
            <input
              type="tel"
              placeholder="+33612345678"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              className="input flex-1 text-lg"
            />
            <button
              onClick={handleLinkPhone}
              className="btn wa-btn font-semibold"
            >
              Envoyer le code
            </button>
          </div>
          <p className="text-muted text-md mt-8">
            Format international requis (ex: +33612345678). Un code de verification sera envoye sur WhatsApp.
          </p>
        </div>
      )}

      {/* Step: Verify code */}
      {step === 'verify' && (
        <div className="card section wa-bg">
          <h2 className="section-title">Verification</h2>
          <p className="mb-12">Entrez le code a 6 chiffres recu sur WhatsApp :</p>
          <div className="flex gap-12 items-center">
            <input
              type="text"
              placeholder="123456"
              maxLength={6}
              value={codeInput}
              onChange={(e) => setCodeInput(e.target.value.replace(/\D/g, ''))}
              className="input wa-verify-input"
            />
            <button
              onClick={handleVerify}
              className="btn wa-btn font-semibold"
            >
              Verifier
            </button>
          </div>
        </div>
      )}

      {/* Status + Settings (when linked & verified) */}
      {status?.linked && status.isVerified && step === 'status' && (
        <>
          <div className="card info-card info-card-success section">
            <div className="flex-between mb-16">
              <h2 className="section-title mb-0">WhatsApp connecte</h2>
              <span className="wa-badge-active">
                Actif
              </span>
            </div>

            <div className="grid-2 mb-16">
              <div>
                <div className="text-muted text-md">Numero</div>
                <div className="font-semibold text-lg">{status.phoneNumber}</div>
              </div>
              <div>
                <div className="text-muted text-md">Dernier message</div>
                <div className="font-semibold">{status.lastMessageAt ? new Date(status.lastMessageAt).toLocaleString('fr-FR') : 'Aucun'}</div>
              </div>
            </div>

            {/* Preferences */}
            <div className="separator">
            </div>
            <div>
              <h3 className="text-lg mb-12">Preferences</h3>
              <div className="flex gap-16 flex-wrap items-center">
                <label className="flex items-center gap-8">
                  Agent :
                  <select
                    value={status.preferredAgent}
                    onChange={(e) => handleSettingsUpdate({ preferredAgent: e.target.value })}
                    className="select"
                  >
                    <option value="sarah">Sarah</option>
                    <option value="emmanuel">Emmanuel</option>
                  </select>
                </label>

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
              <button
                onClick={handleUnlink}
                className="btn btn-danger btn-sm"
              >
                Dissocier le numero
              </button>
            </div>
          </div>

          {/* Conversations */}
          <div className="section">
            <h2 className="section-title">Conversations</h2>
            {conversations.length === 0 ? (
              <p className="text-muted">Aucune conversation. Envoyez un message WhatsApp au numero SARAH OS pour commencer !</p>
            ) : (
              <div className="flex-col gap-8">
                {conversations.map((conv) => (
                  <div
                    key={conv.id}
                    onClick={() => loadMessages(conv.id)}
                    className={`card-compact rounded-md border pointer ${selectedConv === conv.id ? 'wa-conv-active' : ''}`}
                  >
                    <div className="flex-between">
                      <span className="font-semibold">{conv.agentName === 'emmanuel' ? 'Emmanuel' : 'Sarah'}</span>
                      <span className="text-muted text-md">{new Date(conv.createdAt).toLocaleDateString('fr-FR')}</span>
                    </div>
                    <div className="text-secondary text-md mt-4">
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
              <h3 className="text-lg mb-12">Messages</h3>
              <div className="flex-col gap-8 wa-messages-scroll">
                {messages.map((msg) => (
                  <div
                    key={msg.id}
                    className={`wa-bubble ${msg.direction === 'inbound' ? 'wa-bubble-inbound' : 'wa-bubble-outbound'}`}
                  >
                    <div className="text-base">{msg.content || msg.transcription || `[${msg.messageType}]`}</div>
                    <div className="text-xs text-muted mt-4 text-right">
                      {new Date(msg.createdAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                      {msg.tokensUsed > 0 && ` · ${msg.tokensUsed}t`}
                    </div>
                  </div>
                ))}
                {messages.length === 0 && (
                  <p className="text-muted text-center">Aucun message</p>
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}
