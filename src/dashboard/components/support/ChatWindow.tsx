'use client';

import { useState, useRef, useEffect, useCallback } from 'react';
import ChatMessage from './ChatMessage';
import QuickReplies from './QuickReplies';

interface ChatWindowProps {
  onClose: () => void;
  userId?: string;
  onMessage?: () => void;
}

interface Msg {
  role: 'user' | 'assistant';
  content: string;
  timestamp: number;
}

export default function ChatWindow({ onClose, userId, onMessage }: ChatWindowProps) {
  const [messages, setMessages] = useState<Msg[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

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

  const sendMessage = useCallback(async (text: string) => {
    const trimmed = text.trim();
    if (!trimmed || loading) return;

    const userMsg: Msg = { role: 'user', content: trimmed, timestamp: Date.now() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setLoading(true);
    onMessage?.();

    try {
      const res = await fetch('/api/support/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: trimmed, userId: userId ?? 'anonymous' }),
      });

      if (!res.ok) {
        throw new Error(`Erreur ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No reader');

      const decoder = new TextDecoder();
      let assistantContent = '';
      const assistantMsg: Msg = { role: 'assistant', content: '', timestamp: Date.now() };
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

      setMessages([...newMessages, { role: 'assistant', content: assistantContent, timestamp: Date.now() }]);
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Erreur inconnue';
      setMessages([...newMessages, { role: 'assistant', content: `Desolee, une erreur est survenue : ${errorMsg}`, timestamp: Date.now() }]);
    } finally {
      setLoading(false);
    }
  }, [messages, loading, userId, onMessage]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage(input);
    }
  }, [sendMessage, input]);

  const containerStyle: React.CSSProperties = isMobile
    ? {
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        width: '100%',
        height: '100%',
        borderRadius: 0,
        border: 'none',
      }
    : {
        width: 380,
        height: 520,
        borderRadius: 16,
        border: '1px solid #E5E5E5',
      };

  return (
    <div style={{
      ...containerStyle,
      background: '#FFFFFF',
      display: 'flex',
      flexDirection: 'column',
      overflow: 'hidden',
      boxShadow: '0 8px 32px rgba(0,0,0,0.12)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    }}>
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
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>Freenzy</div>
          <div style={{ fontSize: 12, color: '#6B6B6B' }}>Comment puis-je vous aider ?</div>
        </div>
        <button
          onClick={onClose}
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
          ✕
        </button>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1,
        overflow: 'auto',
        padding: '12px 16px',
      }}>
        {messages.length === 0 && (
          <div style={{ padding: '16px 0' }}>
            <div style={{ fontSize: 13, color: '#9B9B9B', textAlign: 'center', marginBottom: 12 }}>
              Posez-nous une question ou choisissez un sujet :
            </div>
            <QuickReplies onSelect={sendMessage} />
          </div>
        )}
        {messages.map((msg, i) => (
          <ChatMessage
            key={i}
            role={msg.role}
            content={msg.content || (loading && i === messages.length - 1 ? '...' : '')}
            timestamp={msg.timestamp}
          />
        ))}
      </div>

      {/* Input */}
      <div style={{
        padding: '10px 16px',
        borderTop: '1px solid #E5E5E5',
        display: 'flex',
        gap: 8,
        flexShrink: 0,
      }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ecrivez votre message..."
          disabled={loading}
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
          disabled={loading || !input.trim()}
          style={{
            padding: '9px 14px',
            background: loading || !input.trim() ? '#E5E5E5' : '#1A1A1A',
            color: '#FFFFFF',
            border: 'none',
            borderRadius: 8,
            fontSize: 13,
            fontWeight: 600,
            cursor: loading || !input.trim() ? 'default' : 'pointer',
          }}
        >
          ↑
        </button>
      </div>
    </div>
  );
}
