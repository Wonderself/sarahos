'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import Link from 'next/link';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

/* ═══════════════════════════════════════════════════════════
   FREENZY.IO — Demo Page
   Live chat demo + feature showcase + tech stack + CTA
   Inline styles, mobile-first, Notion palette
   ═══════════════════════════════════════════════════════════ */

// ─── Palette
const C = {
  text: '#1A1A1A',
  secondary: '#6B6B6B',
  muted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSec: '#FAFAFA',
};

// ─── Chat types
interface ChatMsg {
  role: 'user' | 'assistant';
  content: string;
}

// ─── Example questions
const EXAMPLE_QUESTIONS = [
  { text: 'Rédige-moi un email de relance client', emoji: '📧' },
  { text: 'Propose-moi 3 idées de posts LinkedIn', emoji: '📱' },
  { text: 'Quels sont les avantages de Freenzy ?', emoji: '💡' },
];

// ─── Feature cards
const FEATURES = [
  { emoji: '🤖', title: '100+ Assistants IA', desc: 'Commercial, marketing, juridique, RH... Un agent spécialisé pour chaque besoin métier.' },
  { emoji: '📄', title: 'Documents automatisés', desc: 'Contrats, devis, factures, rapports — générés en quelques secondes par l\'IA.' },
  { emoji: '📱', title: 'Réseaux sociaux IA', desc: 'Posts LinkedIn, Instagram, Twitter créés et planifiés automatiquement.' },
  { emoji: '🎨', title: 'Studio Créatif', desc: 'Génération de photos et vidéos par IA. Visuels pro sans compétences design.' },
  { emoji: '📰', title: 'Veille IA quotidienne', desc: 'Briefing matinal personnalisé : actualités secteur, concurrents, opportunités.' },
  { emoji: '🎓', title: 'Formations gratuites', desc: 'Mini-cours IA, marketing digital, productivité — directement dans le dashboard.' },
];

// ─── Tech stack
const TECH_STACK = [
  { emoji: '🧠', name: 'Claude AI', desc: 'Anthropic — Modèles Haiku, Sonnet & Opus' },
  { emoji: '📞', name: 'Twilio', desc: 'Appels, SMS & WhatsApp Business' },
  { emoji: '🎙️', name: 'ElevenLabs', desc: 'Voix IA ultra-réaliste multilingue' },
  { emoji: '🖼️', name: 'fal.ai', desc: 'Génération d\'images & vidéos par IA' },
  { emoji: '🛡️', name: 'PostgreSQL', desc: 'Base de données fiable + pgvector' },
  { emoji: '⚡', name: 'Redis', desc: 'Cache temps réel, files d\'attente' },
];

// ─── Session helpers
const DEMO_SESSION_KEY = 'fz_demo_chat';
const DEMO_MAX_MESSAGES = 3;

function generateToken(): string {
  return `demo_${Date.now()}_${Math.random().toString(36).slice(2, 10)}`;
}

// ─── Responsive hook
function useIsMobile(): boolean {
  const [mobile, setMobile] = useState(false);
  useEffect(() => {
    const check = () => setMobile(window.innerWidth <= 768);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);
  return mobile;
}

// ─── Main Page
export default function DemoPage() {
  const isMobile = useIsMobile();
  const [messages, setMessages] = useState<ChatMsg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const [msgCount, setMsgCount] = useState(0);
  const [sessionToken] = useState(() => {
    if (typeof window === 'undefined') return generateToken();
    try {
      const saved = sessionStorage.getItem(DEMO_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        return String(parsed.token || '') || generateToken();
      }
    } catch { /* ignore */ }
    return generateToken();
  });
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Restore session
  useEffect(() => {
    try {
      const saved = sessionStorage.getItem(DEMO_SESSION_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.messages) setMessages(parsed.messages);
        if (parsed.msgCount) setMsgCount(parsed.msgCount);
        if (parsed.msgCount >= DEMO_MAX_MESSAGES) setLimitReached(true);
      }
    } catch { /* ignore */ }
  }, []);

  // Auto-scroll on new messages
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const saveSession = useCallback((msgs: ChatMsg[], count: number) => {
    try {
      sessionStorage.setItem(DEMO_SESSION_KEY, JSON.stringify({ messages: msgs, msgCount: count, token: sessionToken }));
    } catch { /* ignore */ }
  }, [sessionToken]);

  const sendMessage = useCallback(async (text?: string) => {
    const msgText = (text || input).trim();
    if (!msgText || loading || limitReached) return;

    const userMsg: ChatMsg = { role: 'user', content: msgText };
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
          assistantId: 'fz-assistante',
          message: msgText,
          sessionToken,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({ error: 'Erreur serveur' }));
        if (errData.limitReached) {
          setLimitReached(true);
          saveSession(newMessages, DEMO_MAX_MESSAGES);
          return;
        }
        throw new Error(errData.error || 'Erreur');
      }

      const contentType = res.headers.get('content-type') || '';
      if (contentType.includes('application/json')) {
        const data = await res.json();
        if (data.limitReached) {
          setLimitReached(true);
          saveSession(newMessages, DEMO_MAX_MESSAGES);
          return;
        }
      }

      // Stream response
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsg: ChatMsg = { role: 'assistant', content: '' };
      setMessages([...newMessages, assistantMsg]);

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          assistantContent += decoder.decode(result.value, { stream: !done });
          setMessages([...newMessages, { role: 'assistant', content: assistantContent }]);
        }
      }

      const finalMessages: ChatMsg[] = [...newMessages, { role: 'assistant', content: assistantContent }];
      setMessages(finalMessages);
      saveSession(finalMessages, newCount);

      // Check if limit reached after this message
      if (newCount >= DEMO_MAX_MESSAGES) {
        setLimitReached(true);
      }
    } catch (err) {
      const errorMsg: ChatMsg = { role: 'assistant', content: `Erreur : ${err instanceof Error ? err.message : 'inconnue'}` };
      const errorMessages = [...newMessages, errorMsg];
      setMessages(errorMessages);
      saveSession(errorMessages, newCount);
    } finally {
      setLoading(false);
    }
  }, [input, loading, limitReached, messages, msgCount, sessionToken, saveSession]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  }, [sendMessage]);

  const handleExampleClick = useCallback((text: string) => {
    if (loading || limitReached) return;
    setInput(text);
    sendMessage(text);
  }, [loading, limitReached, sendMessage]);

  // ─── Styles
  const sectionStyle = (bg: string): React.CSSProperties => ({
    padding: isMobile ? '56px 20px' : '80px 24px',
    background: bg,
  });

  const sectionTitleStyle: React.CSSProperties = {
    fontSize: isMobile ? 28 : 36,
    fontWeight: 800,
    color: C.text,
    textAlign: 'center',
    marginBottom: 12,
    letterSpacing: '-0.03em',
    lineHeight: 1.2,
  };

  const sectionSubtitleStyle: React.CSSProperties = {
    fontSize: isMobile ? 15 : 17,
    color: C.secondary,
    textAlign: 'center',
    maxWidth: 600,
    margin: '0 auto 48px',
    lineHeight: 1.6,
  };

  return (
    <div style={{ minHeight: '100vh', background: C.bg, fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif" }}>
      <PublicNav />

      {/* ═══ HERO ═══ */}
      <section style={{
        paddingTop: isMobile ? 100 : 130,
        paddingBottom: isMobile ? 40 : 60,
        paddingLeft: 24,
        paddingRight: 24,
        textAlign: 'center',
        background: C.bg,
        position: 'relative',
        overflow: 'hidden',
      }}>
        {/* Decorative floating emojis */}
        {!isMobile && (
          <>
            <span style={{ position: 'absolute', top: '15%', left: '8%', fontSize: 40, opacity: 0.12, transform: 'rotate(-15deg)' }}>🤖</span>
            <span style={{ position: 'absolute', top: '20%', right: '10%', fontSize: 36, opacity: 0.10, transform: 'rotate(12deg)' }}>💬</span>
            <span style={{ position: 'absolute', bottom: '20%', left: '12%', fontSize: 34, opacity: 0.08, transform: 'rotate(8deg)' }}>⚡</span>
            <span style={{ position: 'absolute', bottom: '25%', right: '8%', fontSize: 38, opacity: 0.10, transform: 'rotate(-10deg)' }}>🎨</span>
          </>
        )}

        <div style={{
          display: 'inline-block',
          padding: '6px 16px',
          background: C.bgSec,
          border: `1px solid ${C.border}`,
          borderRadius: 20,
          fontSize: 13,
          color: C.secondary,
          fontWeight: 500,
          marginBottom: 24,
        }}>
          Essai gratuit — aucune inscription requise
        </div>

        <h1 style={{
          fontSize: isMobile ? 32 : 48,
          fontWeight: 800,
          color: C.text,
          lineHeight: 1.15,
          letterSpacing: '-0.04em',
          margin: '0 0 16px',
          maxWidth: 700,
          marginLeft: 'auto',
          marginRight: 'auto',
        }}>
          Découvrez Freenzy en action
        </h1>

        <p style={{
          fontSize: isMobile ? 16 : 18,
          color: C.secondary,
          lineHeight: 1.6,
          maxWidth: 540,
          margin: '0 auto',
        }}>
          Testez notre IA en temps réel. Posez vos questions, explorez les fonctionnalités et voyez pourquoi +100 agents IA changent la donne.
        </p>
      </section>

      {/* ═══ LIVE CHAT DEMO ═══ */}
      <section id="chat-demo" style={{
        padding: isMobile ? '0 16px 56px' : '0 24px 80px',
        background: C.bg,
      }}>
        <div style={{
          maxWidth: 680,
          margin: '0 auto',
          border: `1px solid ${C.border}`,
          borderRadius: 16,
          overflow: 'hidden',
          boxShadow: '0 4px 24px rgba(0,0,0,0.06)',
        }}>
          {/* Chat header */}
          <div style={{
            padding: '16px 20px',
            borderBottom: `1px solid ${C.border}`,
            background: C.bgSec,
            display: 'flex',
            alignItems: 'center',
            gap: 12,
          }}>
            <div style={{
              width: 40,
              height: 40,
              borderRadius: 12,
              background: C.text,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 20,
            }}>
              🤖
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 15, fontWeight: 600, color: C.text }}>
                Assistant Freenzy
              </div>
              <div style={{ fontSize: 12, color: C.muted, display: 'flex', alignItems: 'center', gap: 6 }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22C55E', display: 'inline-block' }} />
                En ligne — {DEMO_MAX_MESSAGES - msgCount} message{DEMO_MAX_MESSAGES - msgCount !== 1 ? 's' : ''} restant{DEMO_MAX_MESSAGES - msgCount !== 1 ? 's' : ''}
              </div>
            </div>
            <div style={{
              padding: '4px 10px',
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 8,
              fontSize: 11,
              color: C.muted,
              fontWeight: 500,
            }}>
              DEMO
            </div>
          </div>

          {/* Messages area */}
          <div ref={scrollRef} style={{
            height: isMobile ? 320 : 380,
            overflowY: 'auto',
            padding: '20px',
            background: C.bg,
          }}>
            {messages.length === 0 && !limitReached && (
              <div style={{ textAlign: 'center', paddingTop: isMobile ? 20 : 40 }}>
                <div style={{ fontSize: 48, marginBottom: 16 }}>💬</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: C.text, marginBottom: 8 }}>
                  Posez votre première question
                </div>
                <div style={{ fontSize: 13, color: C.muted, marginBottom: 24 }}>
                  Ou cliquez sur un exemple ci-dessous
                </div>

                {/* Example questions */}
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 8,
                  maxWidth: 400,
                  margin: '0 auto',
                }}>
                  {EXAMPLE_QUESTIONS.map((q, i) => (
                    <button
                      key={i}
                      onClick={() => handleExampleClick(q.text)}
                      disabled={loading}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10,
                        padding: '12px 16px',
                        background: C.bgSec,
                        border: `1px solid ${C.border}`,
                        borderRadius: 10,
                        cursor: loading ? 'default' : 'pointer',
                        fontSize: 13,
                        color: C.text,
                        fontWeight: 500,
                        textAlign: 'left',
                        transition: 'all 0.15s ease',
                        width: '100%',
                      }}
                      onMouseEnter={e => {
                        if (!loading) {
                          (e.currentTarget as HTMLButtonElement).style.borderColor = C.text;
                          (e.currentTarget as HTMLButtonElement).style.background = C.bg;
                        }
                      }}
                      onMouseLeave={e => {
                        (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
                        (e.currentTarget as HTMLButtonElement).style.background = C.bgSec;
                      }}
                    >
                      <span style={{ fontSize: 18, flexShrink: 0 }}>{q.emoji}</span>
                      <span>{q.text}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {messages.map((msg, i) => (
              <div key={i} style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 12,
              }}>
                {msg.role === 'assistant' && (
                  <div style={{
                    width: 28,
                    height: 28,
                    borderRadius: 8,
                    background: C.bgSec,
                    border: `1px solid ${C.border}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 14,
                    marginRight: 8,
                    flexShrink: 0,
                    marginTop: 2,
                  }}>
                    🤖
                  </div>
                )}
                <div style={{
                  maxWidth: '75%',
                  padding: '10px 14px',
                  borderRadius: 12,
                  fontSize: 14,
                  lineHeight: 1.6,
                  whiteSpace: 'pre-wrap',
                  ...(msg.role === 'user'
                    ? { background: C.text, color: '#FFFFFF', borderBottomRightRadius: 4 }
                    : { background: C.bgSec, color: C.text, border: `1px solid ${C.border}`, borderBottomLeftRadius: 4 }),
                }}>
                  {msg.content || (loading && i === messages.length - 1 ? '...' : '')}
                </div>
              </div>
            ))}

            {/* Limit reached banner inside chat */}
            {limitReached && (
              <div style={{
                textAlign: 'center',
                padding: '24px 16px',
                margin: '12px 0 0',
                background: C.bgSec,
                borderRadius: 12,
                border: `1px solid ${C.border}`,
              }}>
                <div style={{ fontSize: 28, marginBottom: 8 }}>✨</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>
                  Vous aimez ? Ce n'est qu'un aperçu !
                </div>
                <div style={{ fontSize: 13, color: C.secondary, marginBottom: 16 }}>
                  Créez votre compte pour accéder aux 100+ agents et 50 crédits offerts.
                </div>
                <Link
                  href="/login?mode=register"
                  style={{
                    display: 'inline-block',
                    padding: '10px 24px',
                    background: C.text,
                    color: '#FFFFFF',
                    borderRadius: 8,
                    fontSize: 13,
                    fontWeight: 600,
                    textDecoration: 'none',
                    transition: 'opacity 0.15s',
                  }}
                  onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85'; }}
                  onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
                >
                  Créer mon compte gratuit
                </Link>
              </div>
            )}
          </div>

          {/* Input area */}
          {!limitReached && (
            <div style={{
              padding: '12px 16px',
              borderTop: `1px solid ${C.border}`,
              background: C.bgSec,
              display: 'flex',
              gap: 8,
            }}>
              <input
                ref={inputRef}
                value={input}
                onChange={e => setInput(e.target.value)}
                onKeyDown={handleKeyDown}
                placeholder="Posez votre question..."
                disabled={loading}
                style={{
                  flex: 1,
                  padding: '10px 14px',
                  border: `1px solid ${C.border}`,
                  borderRadius: 8,
                  fontSize: 14,
                  color: C.text,
                  background: C.bg,
                  outline: 'none',
                  fontFamily: 'inherit',
                }}
              />
              <button
                onClick={() => sendMessage()}
                disabled={loading || !input.trim()}
                style={{
                  padding: '10px 18px',
                  background: loading || !input.trim() ? C.border : C.text,
                  color: '#FFFFFF',
                  border: 'none',
                  borderRadius: 8,
                  fontSize: 14,
                  fontWeight: 600,
                  cursor: loading || !input.trim() ? 'default' : 'pointer',
                  transition: 'background 0.15s',
                  fontFamily: 'inherit',
                  whiteSpace: 'nowrap',
                }}
              >
                {loading ? '...' : 'Envoyer'}
              </button>
            </div>
          )}
        </div>

        {/* Example questions below chat on mobile when messages exist */}
        {messages.length > 0 && !limitReached && msgCount < DEMO_MAX_MESSAGES && (
          <div style={{
            maxWidth: 680,
            margin: '16px auto 0',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 8,
            justifyContent: 'center',
          }}>
            {EXAMPLE_QUESTIONS.map((q, i) => (
              <button
                key={i}
                onClick={() => handleExampleClick(q.text)}
                disabled={loading}
                style={{
                  padding: '8px 14px',
                  background: C.bgSec,
                  border: `1px solid ${C.border}`,
                  borderRadius: 20,
                  cursor: loading ? 'default' : 'pointer',
                  fontSize: 12,
                  color: C.secondary,
                  fontWeight: 500,
                  transition: 'all 0.15s',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                }}
                onMouseEnter={e => {
                  if (!loading) {
                    (e.currentTarget as HTMLButtonElement).style.borderColor = C.text;
                    (e.currentTarget as HTMLButtonElement).style.color = C.text;
                  }
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLButtonElement).style.borderColor = C.border;
                  (e.currentTarget as HTMLButtonElement).style.color = C.secondary;
                }}
              >
                <span>{q.emoji}</span>
                <span>{q.text}</span>
              </button>
            ))}
          </div>
        )}
      </section>

      {/* ═══ FEATURE SHOWCASE ═══ */}
      <section style={sectionStyle(C.bgSec)}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: C.bg,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            fontSize: 12,
            color: C.muted,
            fontWeight: 500,
            marginBottom: 20,
            marginLeft: '50%',
            transform: 'translateX(-50%)',
          }}>
            Fonctionnalités
          </div>

          <h2 style={sectionTitleStyle}>
            Tout ce dont votre entreprise a besoin
          </h2>
          <p style={sectionSubtitleStyle}>
            Freenzy réunit plus de 100 agents IA spécialisés dans un seul tableau de bord. Voici les principaux domaines couverts.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
            gap: 16,
          }}>
            {FEATURES.map((f, i) => (
              <div
                key={i}
                style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 14,
                  padding: isMobile ? '24px 20px' : '28px 24px',
                  transition: 'all 0.2s ease',
                  cursor: 'default',
                }}
                onMouseEnter={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = '#C0C0C0';
                  (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(0,0,0,0.06)';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(-2px)';
                }}
                onMouseLeave={e => {
                  (e.currentTarget as HTMLDivElement).style.borderColor = C.border;
                  (e.currentTarget as HTMLDivElement).style.boxShadow = 'none';
                  (e.currentTarget as HTMLDivElement).style.transform = 'translateY(0)';
                }}
              >
                <div style={{
                  width: 48,
                  height: 48,
                  borderRadius: 12,
                  background: C.bgSec,
                  border: `1px solid ${C.border}`,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 24,
                  marginBottom: 16,
                }}>
                  {f.emoji}
                </div>
                <div style={{
                  fontSize: 16,
                  fontWeight: 600,
                  color: C.text,
                  marginBottom: 8,
                  letterSpacing: '-0.01em',
                }}>
                  {f.title}
                </div>
                <div style={{
                  fontSize: 14,
                  color: C.secondary,
                  lineHeight: 1.6,
                }}>
                  {f.desc}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ TECHNOLOGIES ═══ */}
      <section id="technologies" style={sectionStyle(C.bg)}>
        <div style={{ maxWidth: 1080, margin: '0 auto' }}>
          <div style={{
            display: 'inline-block',
            padding: '4px 12px',
            background: C.bgSec,
            border: `1px solid ${C.border}`,
            borderRadius: 20,
            fontSize: 12,
            color: C.muted,
            fontWeight: 500,
            marginBottom: 20,
            marginLeft: '50%',
            transform: 'translateX(-50%)',
          }}>
            Technologies
          </div>

          <h2 style={sectionTitleStyle}>
            Propulsé par les meilleures IA du marché
          </h2>
          <p style={sectionSubtitleStyle}>
            Nous intégrons les technologies les plus avancées pour offrir des résultats de qualité professionnelle.
          </p>

          <div style={{
            display: 'grid',
            gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(3, 1fr)',
            gap: 12,
          }}>
            {TECH_STACK.map((t, i) => (
              <div
                key={i}
                style={{
                  background: C.bgSec,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  padding: isMobile ? '20px 16px' : '24px 20px',
                  textAlign: 'center',
                  transition: 'border-color 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#C0C0C0'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = C.border; }}
              >
                <div style={{ fontSize: 32, marginBottom: 10 }}>{t.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: C.text, marginBottom: 4 }}>{t.name}</div>
                <div style={{ fontSize: 12, color: C.muted, lineHeight: 1.5 }}>{t.desc}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ STATS BAR ═══ */}
      <section style={{
        padding: isMobile ? '40px 20px' : '48px 24px',
        background: C.text,
        color: '#FFFFFF',
      }}>
        <div style={{
          maxWidth: 900,
          margin: '0 auto',
          display: 'grid',
          gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
          gap: isMobile ? 24 : 16,
          textAlign: 'center',
        }}>
          {[
            { value: '100+', label: 'Agents IA', emoji: '🤖' },
            { value: '50', label: 'Crédits offerts', emoji: '🎁' },
            { value: '0%', label: 'Commission*', emoji: '💎' },
            { value: '24/7', label: 'Disponibilité', emoji: '⚡' },
          ].map((s, i) => (
            <div key={i}>
              <div style={{ fontSize: 28, marginBottom: 4 }}>{s.emoji}</div>
              <div style={{ fontSize: isMobile ? 28 : 36, fontWeight: 800, letterSpacing: '-0.03em' }}>{s.value}</div>
              <div style={{ fontSize: 13, opacity: 0.6, marginTop: 4 }}>{s.label}</div>
            </div>
          ))}
        </div>
        <div style={{ textAlign: 'center', fontSize: 11, opacity: 0.3, marginTop: 20 }}>
          * 0% commission pour les 5 000 premiers utilisateurs, verrouillé à vie
        </div>
      </section>

      {/* ═══ CTA ═══ */}
      <section style={{
        padding: isMobile ? '64px 20px' : '96px 24px',
        background: C.bg,
        textAlign: 'center',
      }}>
        <div style={{ fontSize: 48, marginBottom: 20 }}>🚀</div>
        <h2 style={{
          fontSize: isMobile ? 28 : 40,
          fontWeight: 800,
          color: C.text,
          letterSpacing: '-0.03em',
          marginBottom: 12,
          lineHeight: 1.2,
        }}>
          Prêt à essayer ?
        </h2>
        <p style={{
          fontSize: isMobile ? 15 : 17,
          color: C.secondary,
          maxWidth: 480,
          margin: '0 auto 36px',
          lineHeight: 1.6,
        }}>
          Rejoignez Freenzy gratuitement. 50 crédits offerts à l'inscription, aucune carte bancaire requise.
        </p>

        <div style={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          gap: 12,
          justifyContent: 'center',
          alignItems: 'center',
        }}>
          <Link
            href="/login?mode=register"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: C.text,
              color: '#FFFFFF',
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: '2px solid transparent',
              minWidth: isMobile ? '100%' : 'auto',
              textAlign: 'center',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '0.9'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.opacity = '1'; }}
          >
            Créer mon compte gratuit
          </Link>
          <Link
            href="/try"
            style={{
              display: 'inline-block',
              padding: '14px 32px',
              background: 'transparent',
              color: C.text,
              borderRadius: 10,
              fontSize: 15,
              fontWeight: 600,
              textDecoration: 'none',
              transition: 'all 0.2s ease',
              border: `2px solid ${C.border}`,
              minWidth: isMobile ? '100%' : 'auto',
              textAlign: 'center',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.text; }}
            onMouseLeave={e => { (e.currentTarget as HTMLAnchorElement).style.borderColor = C.border; }}
          >
            Essayer sans inscription
          </Link>
        </div>

        <div style={{
          marginTop: 24,
          fontSize: 13,
          color: C.muted,
          display: 'flex',
          flexWrap: 'wrap',
          gap: isMobile ? 12 : 24,
          justifyContent: 'center',
        }}>
          <span>✓ 50 crédits offerts</span>
          <span>✓ Aucune carte requise</span>
          <span>✓ 0% commission</span>
        </div>
      </section>

      <PublicFooter />
    </div>
  );
}
