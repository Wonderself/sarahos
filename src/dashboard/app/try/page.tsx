'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

// ─── Types ──────────────────────────────────────────────────
interface DemoAssistant {
  id: string;
  name: string;
  emoji: string;
  description: string;
}

interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

interface TrySession {
  assistantId: string;
  messages: ChatMsg[];
  messageCount: number;
  token: string;
}

// ─── Constants ──────────────────────────────────────────────
const ASSISTANTS: DemoAssistant[] = [
  { id: 'fz-commercial', name: 'Commercial', emoji: '💼', description: 'Prospection, devis, relance clients — votre commercial IA disponible 24/7.' },
  { id: 'fz-marketing', name: 'Marketing', emoji: '📣', description: 'Stratégie digitale, posts réseaux sociaux, campagnes emailing.' },
  { id: 'fz-assistante', name: 'Secrétaire', emoji: '📋', description: 'Gestion agenda, emails, organisation quotidienne sans effort.' },
  { id: 'fz-redacteur', name: 'Rédacteur', emoji: '✍️', description: 'Articles, fiches produit, contenus web optimisés SEO.' },
];

const SESSION_KEY = 'fz_try_session';
const MAX_MESSAGES = 5;

function generateToken(): string {
  return `try_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

function loadSession(): TrySession | null {
  if (typeof window === 'undefined') return null;
  try {
    const raw = sessionStorage.getItem(SESSION_KEY);
    if (!raw) return null;
    return JSON.parse(raw) as TrySession;
  } catch {
    return null;
  }
}

function saveSession(session: TrySession): void {
  sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
}

// ─── Component ──────────────────────────────────────────────
export default function TryPage() {
  const [selectedAssistant, setSelectedAssistant] = useState<DemoAssistant | null>(null);
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [sessionToken] = useState(() => loadSession()?.token ?? generateToken());
  const scrollRef = useRef<HTMLDivElement>(null);

  // Restore session on mount
  useEffect(() => {
    const s = loadSession();
    if (s) {
      const assistant = ASSISTANTS.find(a => a.id === s.assistantId);
      if (assistant) {
        setSelectedAssistant(assistant);
        setMessages(s.messages);
        setMsgCount(s.messageCount);
        if (s.messageCount >= MAX_MESSAGES) setLimitReached(true);
      }
    }
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const selectAssistant = useCallback((a: DemoAssistant) => {
    setSelectedAssistant(a);
    setMessages([]);
    setMsgCount(0);
    setLimitReached(false);
    saveSession({ assistantId: a.id, messages: [], messageCount: 0, token: sessionToken });
  }, [sessionToken]);

  const sendMessage = useCallback(async () => {
    if (!input.trim() || !selectedAssistant || loading || limitReached) return;

    const userMsg: ChatMsg = { role: 'user', content: input.trim(), timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    const newCount = msgCount + 1;
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    setMsgCount(newCount);

    try {
      const res = await fetch('/api/try/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          assistantId: selectedAssistant.id,
          message: userMsg.content,
          sessionToken,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        if (errData.limitReached) {
          setLimitReached(true);
          saveSession({ assistantId: selectedAssistant.id, messages: newMessages, messageCount: MAX_MESSAGES, token: sessionToken });
          return;
        }
        throw new Error(errData.error || 'Erreur');
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.limitReached) {
          setLimitReached(true);
          saveSession({ assistantId: selectedAssistant.id, messages: newMessages, messageCount: MAX_MESSAGES, token: sessionToken });
          return;
        }
      }

      // Stream text/plain
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsg: ChatMsg = { role: 'assistant', content: '', timestamp: Date.now() };
      const streamedMessages = [...newMessages, assistantMsg];
      setMessages(streamedMessages);

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          assistantContent += decoder.decode(result.value, { stream: !done });
          const updated = [...newMessages, { ...assistantMsg, content: assistantContent }];
          setMessages(updated);
        }
      }

      const finalMessages: ChatMsg[] = [...newMessages, { role: 'assistant', content: assistantContent, timestamp: Date.now() }];
      setMessages(finalMessages);
      saveSession({ assistantId: selectedAssistant.id, messages: finalMessages, messageCount: newCount, token: sessionToken });
    } catch (err) {
      const errorMsg: ChatMsg = { role: 'assistant', content: `Erreur : ${err instanceof Error ? err.message : 'inconnue'}`, timestamp: Date.now() };
      const errorMessages = [...newMessages, errorMsg];
      setMessages(errorMessages);
      saveSession({ assistantId: selectedAssistant.id, messages: errorMessages, messageCount: newCount, token: sessionToken });
    } finally {
      setLoading(false);
    }
  }, [input, selectedAssistant, loading, limitReached, messages, msgCount, sessionToken]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  // ─── Render ─────────────────────────────────────────────
  return (
    <div style={{ minHeight: '100vh', background: '#FFFFFF', fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif' }}>
      {/* Header */}
      <header style={{
        padding: '24px 32px',
        borderBottom: '1px solid #E5E5E5',
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: '#9B9B9B', letterSpacing: 1, textTransform: 'uppercase', marginBottom: 8 }}>
          FREENZY.IO
        </div>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#1A1A1A', margin: 0, lineHeight: 1.4 }}>
          Testez Freenzy gratuitement — aucune inscription
        </h1>
        <p style={{ fontSize: 14, color: '#6B6B6B', margin: '8px 0 0', lineHeight: 1.5 }}>
          Choisissez un assistant et posez-lui vos questions. 5 messages gratuits.
        </p>
      </header>

      {!selectedAssistant ? (
        /* ─── Card Grid ──────────────────────────────────── */
        <div style={{
          maxWidth: 880,
          margin: '48px auto',
          padding: '0 24px',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 16,
        }}>
          {ASSISTANTS.map(a => (
            <button
              key={a.id}
              onClick={() => selectAssistant(a)}
              style={{
                background: '#FAFAFA',
                border: '1px solid #E5E5E5',
                borderRadius: 12,
                padding: 24,
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'border-color 0.15s, box-shadow 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A1A1A';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = '0 2px 8px rgba(0,0,0,0.06)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E5E5';
                (e.currentTarget as HTMLButtonElement).style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 32, marginBottom: 12 }}>{a.emoji}</div>
              <div style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 6 }}>{a.name}</div>
              <div style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.5 }}>{a.description}</div>
            </button>
          ))}
        </div>
      ) : (
        /* ─── Chat View ──────────────────────────────────── */
        <div style={{ maxWidth: 640, margin: '0 auto', display: 'flex', flexDirection: 'column', height: 'calc(100vh - 120px)' }}>
          {/* Chat header */}
          <div style={{
            padding: '12px 24px',
            borderBottom: '1px solid #E5E5E5',
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <button
              onClick={() => { setSelectedAssistant(null); setMessages([]); setMsgCount(0); setLimitReached(false); }}
              style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 18, color: '#6B6B6B', padding: '4px 8px' }}
            >
              ←
            </button>
            <span style={{ fontSize: 24 }}>{selectedAssistant.emoji}</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{selectedAssistant.name}</div>
              <div style={{ fontSize: 12, color: '#9B9B9B' }}>{msgCount}/{MAX_MESSAGES} messages</div>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} style={{ flex: 1, overflow: 'auto', padding: '16px 24px' }}>
            {messages.length === 0 && (
              <div style={{ textAlign: 'center', padding: '48px 0', color: '#9B9B9B', fontSize: 14 }}>
                Posez votre première question à {selectedAssistant.name}
              </div>
            )}
            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 12,
              }}>
                <div style={{
                  maxWidth: '80%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  lineHeight: 1.5,
                  whiteSpace: 'pre-wrap',
                  ...(msg.role === 'user'
                    ? { background: '#1A1A1A', color: '#FFFFFF', borderBottomRightRadius: 4 }
                    : { background: '#FAFAFA', color: '#1A1A1A', border: '1px solid #E5E5E5', borderBottomLeftRadius: 4 }),
                }}>
                  {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
                </div>
              </div>
            ))}
          </div>

          {/* Limit CTA */}
          {limitReached && (
            <div style={{
              padding: '20px 24px',
              background: '#FAFAFA',
              borderTop: '1px solid #E5E5E5',
              textAlign: 'center',
            }}>
              <p style={{ fontSize: 14, color: '#1A1A1A', fontWeight: 500, margin: '0 0 12px' }}>
                Vous aimez ? Creez votre compte pour continuer avec 50 credits offerts
              </p>
              <a
                href="/login?mode=register"
                style={{
                  display: 'inline-block',
                  padding: '10px 24px',
                  background: '#1A1A1A',
                  color: '#FFFFFF',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
              >
                Creer mon compte gratuit
              </a>
            </div>
          )}

          {/* Input */}
          {!limitReached && (
            <div style={{
              padding: '12px 24px',
              borderTop: '1px solid #E5E5E5',
              display: 'flex',
              gap: 8,
            }}>
              <input
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Votre message..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: '1px solid #E5E5E5',
                  borderRadius: 8,
                  fontSize: 14,
                  color: '#1A1A1A',
                  background: '#FFFFFF',
                  outline: 'none',
                }}
              />
              <button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                style={{
                  padding: '10px 16px',
                  background: loading || !input.trim() ? '#E5E5E5' : '#1A1A1A',
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading || !input.trim() ? 'default' : 'pointer',
                }}
              >
                {loading ? '...' : 'Envoyer'}
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
