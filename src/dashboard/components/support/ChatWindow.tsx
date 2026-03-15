'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import QuickReplies from './QuickReplies';

/* ────────────────────────────────────────────
   Types
   ──────────────────────────────────────────── */

interface ChatWindowProps {
  onClose: () => void;
  userId?: string;
  onMessage?: () => void;
}

interface Msg {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: number;
  mode?: ChatMode;
  navCards?: NavCard[];
}

type ChatMode = 'support' | 'assistant' | 'navigation';

interface NavCard {
  path: string;
  label: string;
}

/* ────────────────────────────────────────────
   Page index for navigation mode
   ──────────────────────────────────────────── */

interface PageEntry {
  path: string;
  label: string;
  keywords: string[];
}

const PAGE_INDEX: PageEntry[] = [
  { path: '/client/dashboard', label: 'Tableau de bord', keywords: ['accueil', 'dashboard', 'home', 'tableau'] },
  { path: '/client/chat', label: 'Chat IA', keywords: ['chat', 'conversation', 'parler'] },
  { path: '/client/agents', label: 'Assistants', keywords: ['agent', 'assistant', 'bot'] },
  { path: '/client/documents', label: 'Documents', keywords: ['document', 'devis', 'facture'] },
  { path: '/client/studio/photo', label: 'Studio Photo', keywords: ['photo', 'image', 'studio'] },
  { path: '/client/branding', label: 'Mon Branding', keywords: ['branding', 'logo', 'couleur'] },
  { path: '/client/learn', label: 'Formations', keywords: ['formation', 'cours', 'apprendre'] },
  { path: '/client/team', label: 'Mon Equipe', keywords: ['equipe', 'team', 'membre'] },
  { path: '/client/account', label: 'Mon Compte', keywords: ['compte', 'profil', 'credit'] },
  { path: '/client/notifications', label: 'Notifications', keywords: ['notification', 'alerte'] },
  { path: '/client/discussions', label: 'Discussions', keywords: ['discussion', 'debat', 'reflexion'] },
  { path: '/client/blog', label: 'Blog', keywords: ['blog', 'article'] },
  { path: '/client/settings/personalization', label: 'Parametres', keywords: ['parametre', 'setting', 'config'] },
  { path: '/client/social', label: 'Reseaux sociaux', keywords: ['social', 'linkedin', 'instagram'] },
  { path: '/client/repondeur', label: 'Repondeur IA', keywords: ['repondeur', 'telephone', 'appel'] },
  { path: '/client/marketplace', label: 'Marketplace', keywords: ['marketplace', 'template', 'modele'] },
  { path: '/try', label: 'Essayer gratuitement', keywords: ['essayer', 'test', 'demo'] },
  { path: '/plans', label: 'Tarifs', keywords: ['tarif', 'prix', 'plan', 'abonnement'] },
];

/* ────────────────────────────────────────────
   Intent detection
   ──────────────────────────────────────────── */

function detectIntent(message: string): ChatMode {
  const lower = message.toLowerCase();
  if (/o[uù]\s+(est|se trouve|trouver)|trouve[r]?\s+(la page|le menu|la section)|page\s+\w|comment\s+aller|cherche\s+(la|le|les)/i.test(lower)) return 'navigation';
  if (/g[eé]n[eè]re|[eé]cris|cr[eé]e|traduis|r[eé]dige|fais\s+(un|une|le|la|du)|pr[eé]pare|calcule|envoie|programme/i.test(lower)) return 'assistant';
  return 'support';
}

/* ────────────────────────────────────────────
   Navigation search
   ──────────────────────────────────────────── */

function searchPages(query: string): NavCard[] {
  const lower = query.toLowerCase()
    .replace(/[àâ]/g, 'a')
    .replace(/[éèêë]/g, 'e')
    .replace(/[ùûü]/g, 'u')
    .replace(/[ôö]/g, 'o')
    .replace(/[îï]/g, 'i')
    .replace(/[ç]/g, 'c');

  const results: NavCard[] = [];
  for (const page of PAGE_INDEX) {
    const labelMatch = page.label.toLowerCase().includes(lower) ||
      lower.includes(page.label.toLowerCase());
    const keywordMatch = page.keywords.some(kw => lower.includes(kw) || kw.includes(lower));
    if (labelMatch || keywordMatch) {
      results.push({ path: page.path, label: page.label });
    }
  }
  return results.slice(0, 5);
}

/* ────────────────────────────────────────────
   Content detection (for assistant mode)
   ──────────────────────────────────────────── */

function hasGeneratedContent(response: string): boolean {
  return /^(objet\s*:|de\s*:|sujet\s*:|devis|facture|bonjour|cher|madame|monsieur)/im.test(response) ||
    response.length > 300;
}

/* ────────────────────────────────────────────
   Slide-up animation keyframes
   ──────────────────────────────────────────── */

const SLIDE_UP_KEYFRAMES = `
@keyframes fz-chat-slide-up {
  from { transform: translateY(100%); }
  to   { transform: translateY(0); }
}
@keyframes fz-chat-slide-down {
  from { transform: translateY(0); }
  to   { transform: translateY(100%); }
}
`;

/* ────────────────────────────────────────────
   Mode badges
   ──────────────────────────────────────────── */

const MODE_CONFIG: Record<ChatMode, { label: string; color: string }> = {
  support: { label: 'Support', color: '#6B6B6B' },
  assistant: { label: 'Mode assistant', color: '#1A1A1A' },
  navigation: { label: 'Navigation', color: '#0EA5E9' },
};

/* ────────────────────────────────────────────
   Component
   ──────────────────────────────────────────── */

export default function ChatWindow({ onClose, userId, onMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const [activeMode, setActiveMode] = useState<ChatMode | null>(null);
  const [pendingAssistant, setPendingAssistant] = useState<string | null>(null);
  const [closing, setClosing] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const dragStartY = useRef<number | null>(null);
  const dragCurrentY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // Detect mobile
  useEffect(() => {
    const check = () => setIsMobile(window.innerWidth < 640);
    check();
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Auto-scroll
  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  // Close with animation
  const handleClose = useCallback(() => {
    if (isMobile) {
      setClosing(true);
      setTimeout(() => {
        setClosing(false);
        onClose();
      }, 280);
    } else {
      onClose();
    }
  }, [isMobile, onClose]);

  // Drag-to-close handlers (mobile)
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    dragStartY.current = e.touches[0].clientY;
  }, []);

  const handleTouchMove = useCallback((e: React.TouchEvent) => {
    if (dragStartY.current === null) return;
    const delta = e.touches[0].clientY - dragStartY.current;
    if (delta > 0 && containerRef.current) {
      dragCurrentY.current = delta;
      containerRef.current.style.transform = `translateY(${delta}px)`;
    }
  }, []);

  const handleTouchEnd = useCallback(() => {
    if (dragCurrentY.current > 120) {
      handleClose();
    } else if (containerRef.current) {
      containerRef.current.style.transform = 'translateY(0)';
      containerRef.current.style.transition = 'transform 0.2s ease';
      setTimeout(() => {
        if (containerRef.current) {
          containerRef.current.style.transition = '';
        }
      }, 200);
    }
    dragStartY.current = null;
    dragCurrentY.current = 0;
  }, [handleClose]);

  /* ── Support mode: stream from /api/support/chat ── */
  const sendSupportMessage = useCallback(async (text: string, currentMessages: Msg[]) => {
    const userMsg: Msg = { role: 'user', content: text, timestamp: Date.now(), mode: 'support' };
    const newMessages = [...currentMessages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    setActiveMode('support');
    onMessage?.();

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: text, userId: userId ?? 'anonymous' }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsg: Msg = { role: 'assistant', content: '', timestamp: Date.now(), mode: 'support' };
      setMessages([...newMessages, assistantMsg]);

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          assistantContent += decoder.decode(result.value, { stream: !done });
          setMessages([...newMessages, { ...assistantMsg, content: assistantContent }]);
        }
      }

      setMessages([...newMessages, { role: 'assistant', content: assistantContent, timestamp: Date.now(), mode: 'support' }]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setMessages([...newMessages, { role: 'assistant', content: `Desolee, une erreur est survenue : ${errorMsg}`, timestamp: Date.now(), mode: 'support' }]);
    } finally {
      setLoading(false);
    }
  }, [userId, onMessage]);

  /* ── Assistant mode: stream from /api/chat ── */
  const sendAssistantMessage = useCallback(async (text: string, currentMessages: Msg[]) => {
    const userMsg: Msg = { role: 'user', content: text, timestamp: Date.now(), mode: 'assistant' };
    const newMessages = [...currentMessages, userMsg];
    setMessages(newMessages);
    setLoading(true);
    setActiveMode('assistant');
    onMessage?.();

    try {
      const token = typeof window !== 'undefined'
        ? JSON.parse(localStorage.getItem('fz_session') || '{}')?.token
        : undefined;

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ message: text, userId: userId ?? 'anonymous' }),
      });
      if (!res.ok) throw new Error(`Erreur ${res.status}`);

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsg: Msg = { role: 'assistant', content: '', timestamp: Date.now(), mode: 'assistant' };
      setMessages([...newMessages, assistantMsg]);

      let done = false;
      while (!done) {
        const result = await reader.read();
        done = result.done;
        if (result.value) {
          assistantContent += decoder.decode(result.value, { stream: !done });
          setMessages([...newMessages, { ...assistantMsg, content: assistantContent }]);
        }
      }

      const finalMsg: Msg = { role: 'assistant', content: assistantContent, timestamp: Date.now(), mode: 'assistant' };
      setMessages([...newMessages, finalMsg]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setMessages([...newMessages, { role: 'assistant', content: `Erreur : ${errorMsg}`, timestamp: Date.now(), mode: 'assistant' }]);
    } finally {
      setLoading(false);
    }
  }, [userId, onMessage]);

  /* ── Navigation mode: local search ── */
  const handleNavigation = useCallback((text: string, currentMessages: Msg[]) => {
    const userMsg: Msg = { role: 'user', content: text, timestamp: Date.now(), mode: 'navigation' };
    const results = searchPages(text);
    setActiveMode('navigation');
    onMessage?.();

    if (results.length > 0) {
      const navMsg: Msg = {
        role: 'assistant',
        content: `J'ai trouve ${results.length} page${results.length > 1 ? 's' : ''} :`,
        timestamp: Date.now(),
        mode: 'navigation',
        navCards: results,
      };
      setMessages([...currentMessages, userMsg, navMsg]);
    } else {
      const noResultMsg: Msg = {
        role: 'assistant',
        content: 'Je n\'ai pas trouve cette page. Essayez la recherche (Ctrl+K) ou demandez au support.',
        timestamp: Date.now(),
        mode: 'navigation',
      };
      setMessages([...currentMessages, userMsg, noResultMsg]);
    }
  }, [onMessage]);

  /* ── Main send handler ── */
  const sendMessage = useCallback((text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;
    setInput('');

    const mode = detectIntent(trimmed);

    if (mode === 'navigation') {
      handleNavigation(trimmed, messages);
      return;
    }

    if (mode === 'assistant') {
      setPendingAssistant(trimmed);
      return;
    }

    // Default: support
    sendSupportMessage(trimmed, messages);
  }, [messages, loading, handleNavigation, sendSupportMessage]);

  /* ── Assistant confirmation ── */
  const confirmAssistant = useCallback(() => {
    if (!pendingAssistant) return;
    const text = pendingAssistant;
    setPendingAssistant(null);
    sendAssistantMessage(text, messages);
  }, [pendingAssistant, messages, sendAssistantMessage]);

  const cancelAssistant = useCallback(() => {
    setPendingAssistant(null);
  }, []);

  /* ── Keyboard ── */
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [sendMessage, input]);

  /* ── Prefill from quick actions ── */
  const handlePrefill = useCallback((text: string) => {
    setInput(text);
    setTimeout(() => inputRef.current?.focus(), 50);
  }, []);

  /* ── "Talk to human" ── */
  const handleHumanRequest = useCallback(() => {
    const systemMsg: Msg = {
      role: 'system',
      content: 'Demande de contact humain envoyee. Un membre de l\'equipe vous recontactera sous 24h par email.',
      timestamp: Date.now(),
    };
    setMessages(prev => [...prev, systemMsg]);
  }, []);

  /* ── Copy generated content ── */
  const handleCopyContent = useCallback((content: string) => {
    navigator.clipboard.writeText(content).catch(() => {
      // silent fail
    });
  }, []);

  /* ── Styles ── */
  const containerStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        height: '90vh',
        borderRadius: '16px 16px 0 0',
        border: 'none',
        animation: closing ? 'fz-chat-slide-down 0.3s ease forwards' : 'fz-chat-slide-up 0.3s ease forwards',
      }
    : {
        width: 400,
        height: 560,
        borderRadius: 16,
        border: '1px solid #E5E5E5',
      };

  // Find the last assistant message to check for content preview
  const lastAssistantMsg = [...messages].reverse().find(m => m.role === 'assistant' && m.mode === 'assistant');
  const showContentPreview = lastAssistantMsg && hasGeneratedContent(lastAssistantMsg.content) && !loading;

  return (
    <>
      {isMobile && <style>{SLIDE_UP_KEYFRAMES}</style>}
      <div
        ref={containerRef}
        style={{
          ...containerStyle,
          background: '#FFFFFF',
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
          fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        }}
      >
        {/* Drag handle (mobile) */}
        {isMobile && (
          <div
            onTouchStart={handleTouchStart}
            onTouchMove={handleTouchMove}
            onTouchEnd={handleTouchEnd}
            style={{
              display: 'flex',
              justifyContent: 'center',
              padding: '10px 0 4px',
              cursor: 'grab',
              flexShrink: 0,
            }}
          >
            <div style={{
              width: 40,
              height: 4,
              borderRadius: 2,
              background: '#E5E5E5',
            }} />
          </div>
        )}

        {/* Header */}
        <div style={{
          padding: '14px 16px',
          borderBottom: '1px solid #E5E5E5',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#FAFAFA',
          flexShrink: 0,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>Freenzy</div>
              <div style={{ fontSize: 12, color: '#6B6B6B' }}>Comment puis-je vous aider ?</div>
            </div>
            {/* Mode badge */}
            {activeMode && messages.length > 0 && (
              <span style={{
                fontSize: 10,
                fontWeight: 600,
                padding: '3px 8px',
                borderRadius: 10,
                background: activeMode === 'assistant' ? '#1A1A1A' : (activeMode === 'navigation' ? '#0EA5E9' : '#FAFAFA'),
                color: activeMode === 'support' ? '#6B6B6B' : '#FFFFFF',
                border: activeMode === 'support' ? '1px solid #E5E5E5' : 'none',
                letterSpacing: 0.3,
              }}>
                {activeMode === 'assistant' && '\uD83E\uDD16 '}{MODE_CONFIG[activeMode].label}
              </span>
            )}
          </div>
          <button
            onClick={handleClose}
            aria-label="Fermer le chat"
            style={{
              width: 28,
              height: 28,
              borderRadius: 6,
              border: 'none',
              background: 'transparent',
              cursor: 'pointer',
              fontSize: 16,
              color: '#6B6B6B',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E5E5E5'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'transparent'; }}
          >
            {'\u2715'}
          </button>
        </div>

        {/* Messages */}
        <div ref={scrollRef} style={{
          flex: 1,
          overflow: 'auto',
          padding: '12px 16px',
        }}>
          {messages.length === 0 && !pendingAssistant && (
            <div style={{ padding: '16px 0' }}>
              <div style={{ fontSize: 13, color: '#9B9B9B', textAlign: 'center', marginBottom: 12 }}>
                Posez-nous une question ou choisissez un sujet :
              </div>
              <QuickReplies onSelect={sendMessage} onPrefill={handlePrefill} />
            </div>
          )}

          {messages.map((msg, i) => {
            // System messages (e.g., human request confirmation)
            if (msg.role === 'system') {
              return (
                <div key={i} style={{
                  textAlign: 'center',
                  padding: '10px 16px',
                  margin: '8px 0',
                  background: '#FAFAFA',
                  borderRadius: 8,
                  fontSize: 12,
                  color: '#6B6B6B',
                  border: '1px solid #E5E5E5',
                }}>
                  {msg.content}
                </div>
              );
            }

            // Navigation cards
            if (msg.role === 'assistant' && msg.navCards && msg.navCards.length > 0) {
              return (
                <div key={i} style={{ marginBottom: 10 }}>
                  <div style={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    marginBottom: 6,
                  }}>
                    <div style={{
                      maxWidth: '80%',
                      padding: '10px 14px',
                      borderRadius: 12,
                      fontSize: 13,
                      lineHeight: 1.5,
                      background: '#FAFAFA',
                      color: '#1A1A1A',
                      border: '1px solid #E5E5E5',
                      borderBottomLeftRadius: 4,
                    }}>
                      {msg.content}
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingLeft: 4 }}>
                    {msg.navCards.map((card, ci) => (
                      <a
                        key={ci}
                        href={card.path}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 8,
                          padding: '10px 14px',
                          borderRadius: 10,
                          border: '1px solid #E5E5E5',
                          background: '#FFFFFF',
                          color: '#1A1A1A',
                          fontSize: 13,
                          fontWeight: 500,
                          textDecoration: 'none',
                          cursor: 'pointer',
                          transition: 'background 0.15s, border-color 0.15s',
                        }}
                        onMouseEnter={e => {
                          (e.currentTarget as HTMLAnchorElement).style.background = '#FAFAFA';
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = '#1A1A1A';
                        }}
                        onMouseLeave={e => {
                          (e.currentTarget as HTMLAnchorElement).style.background = '#FFFFFF';
                          (e.currentTarget as HTMLAnchorElement).style.borderColor = '#E5E5E5';
                        }}
                      >
                        <span>{'\uD83D\uDCC4'}</span>
                        <span>{card.label}</span>
                        <span style={{ color: '#9B9B9B', marginLeft: 'auto', fontSize: 11 }}>{'\u2192'} {card.path}</span>
                      </a>
                    ))}
                  </div>
                  <div style={{
                    fontSize: 10,
                    color: '#9B9B9B',
                    marginTop: 3,
                    paddingLeft: 4,
                  }}>
                    {new Date(msg.timestamp).getHours().toString().padStart(2, '0')}:{new Date(msg.timestamp).getMinutes().toString().padStart(2, '0')}
                  </div>
                </div>
              );
            }

            return (
              <ChatMessage
                key={i}
                role={msg.role === 'assistant' ? 'assistant' : 'user'}
                content={msg.content || (loading && i === messages.length - 1 ? '...' : '')}
                timestamp={msg.timestamp}
              />
            );
          })}

          {/* Content preview button after assistant generation */}
          {showContentPreview && lastAssistantMsg && (
            <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 10, paddingLeft: 4 }}>
              <button
                onClick={() => handleCopyContent(lastAssistantMsg.content)}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 6,
                  padding: '8px 14px',
                  borderRadius: 8,
                  border: '1px solid #E5E5E5',
                  background: '#FAFAFA',
                  color: '#1A1A1A',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = '#E5E5E5'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = '#FAFAFA'; }}
              >
                <span>{'\uD83D\uDCCB'}</span>
                <span>Copier le contenu</span>
              </button>
            </div>
          )}
        </div>

        {/* Assistant credit confirmation bar */}
        {pendingAssistant && (
          <div style={{
            padding: '10px 16px',
            background: '#FAFAFA',
            borderTop: '1px solid #E5E5E5',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 10,
            flexShrink: 0,
          }}>
            <span style={{ fontSize: 12, color: '#1A1A1A' }}>
              {'\u26A1'} Cette action coutera 1 credit. Continuer ?
            </span>
            <div style={{ display: 'flex', gap: 6 }}>
              <button
                onClick={confirmAssistant}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: 'none',
                  background: '#1A1A1A',
                  color: '#FFFFFF',
                  fontSize: 12,
                  fontWeight: 600,
                  cursor: 'pointer',
                }}
              >
                Oui
              </button>
              <button
                onClick={cancelAssistant}
                style={{
                  padding: '6px 14px',
                  borderRadius: 6,
                  border: '1px solid #E5E5E5',
                  background: '#FFFFFF',
                  color: '#1A1A1A',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                }}
              >
                Non
              </button>
            </div>
          </div>
        )}

        {/* "Talk to a human" button */}
        {messages.length > 0 && activeMode === 'support' && (
          <div style={{
            padding: '6px 16px',
            borderTop: '1px solid #E5E5E5',
            flexShrink: 0,
          }}>
            <button
              onClick={handleHumanRequest}
              style={{
                width: '100%',
                padding: '8px',
                borderRadius: 8,
                border: '1px solid #E5E5E5',
                background: '#FFFFFF',
                color: '#6B6B6B',
                fontSize: 12,
                fontWeight: 500,
                cursor: 'pointer',
                transition: 'background 0.15s, border-color 0.15s',
              }}
              onMouseEnter={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FAFAFA';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#1A1A1A';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLButtonElement).style.background = '#FFFFFF';
                (e.currentTarget as HTMLButtonElement).style.borderColor = '#E5E5E5';
              }}
            >
              {'\uD83D\uDC64'} Parler a un humain
            </button>
          </div>
        )}

        {/* Input */}
        <div style={{
          padding: '10px 16px',
          borderTop: '1px solid #E5E5E5',
          display: 'flex',
          gap: 8,
          flexShrink: 0,
        }}>
          <input
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Ecrivez votre message..."
            disabled={loading || !!pendingAssistant}
            style={{
              flex: 1,
              padding: '9px 12px',
              border: '1px solid #E5E5E5',
              borderRadius: 8,
              fontSize: 13,
              color: '#1A1A1A',
              background: '#FFFFFF',
              outline: 'none',
            }}
          />
          <button
            onClick={() => sendMessage(input)}
            disabled={loading || !input.trim() || !!pendingAssistant}
            style={{
              padding: '9px 14px',
              background: (loading || !input.trim() || !!pendingAssistant) ? '#E5E5E5' : '#1A1A1A',
              color: '#FFFFFF',
              border: 'none',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 600,
              cursor: (loading || !input.trim() || !!pendingAssistant) ? 'default' : 'pointer',
            }}
          >
            {'\u2191'}
          </button>
        </div>
      </div>
    </>
  );
}
