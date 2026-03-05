'use client';

import { useState, useRef, useEffect, useCallback } from 'react';

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

interface AgentAction {
  type: string;
  data: string;
}

interface ChatPanelProps {
  systemPrompt: string;
  agentName: string;
  agentEmoji: string;
  agentLabel: string;
  token: string;
  onAgentAction?: (action: AgentAction) => void;
}

function parseActions(text: string): { cleanText: string; actions: AgentAction[] } {
  const actions: AgentAction[] = [];
  const cleanText = text.replace(/\[ACTION:(\w+)\]([\s\S]*?)\[\/ACTION\]/g, (_, type, data) => {
    actions.push({ type, data: data.trim() });
    return '';
  });
  return { cleanText: cleanText.trim(), actions };
}

export default function ChatPanel({
  systemPrompt, agentName, agentEmoji, agentLabel, token, onAgentAction,
}: ChatPanelProps) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const sendMessage = useCallback(async () => {
    const text = input.trim();
    if (!text || streaming) return;

    const userMsg: ChatMessage = { role: 'user', content: text };
    const updated = [...messages, userMsg];
    setMessages(updated);
    setInput('');
    setStreaming(true);

    try {
      const apiMessages = [
        { role: 'system' as const, content: systemPrompt },
        ...updated.map(m => ({ role: m.role as 'user' | 'assistant', content: m.content })),
      ];

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          model: 'claude-sonnet-4-20250514',
          messages: apiMessages,
          maxTokens: 2048,
          temperature: 0.7,
          agentName,
        }),
      });

      if (!res.ok) {
        const err = await res.json().catch(() => ({}));
        throw new Error((err as Record<string, string>).error || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream');

      const decoder = new TextDecoder();
      let accumulated = '';

      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        const lines = chunk.split('\n');

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.slice(6));
              if (data.type === 'content_block_delta' && data.delta?.text) {
                accumulated += data.delta.text;
                setMessages(prev => {
                  const msgs = [...prev];
                  msgs[msgs.length - 1] = { role: 'assistant', content: accumulated };
                  return msgs;
                });
              }
            } catch { /* skip non-JSON lines */ }
          }
        }
      }

      // Parse actions from final message
      const { cleanText, actions } = parseActions(accumulated);
      if (actions.length > 0) {
        setMessages(prev => {
          const msgs = [...prev];
          msgs[msgs.length - 1] = { role: 'assistant', content: cleanText || accumulated };
          return msgs;
        });
        for (const action of actions) {
          onAgentAction?.(action);
        }
      }
    } catch (err) {
      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: `Erreur: ${(err as Error).message}` },
      ]);
    } finally {
      setStreaming(false);
    }
  }, [input, messages, streaming, systemPrompt, token, agentName, onAgentAction]);

  return (
    <div style={{
      display: 'flex', flexDirection: 'column', height: '100%',
      borderRight: '1px solid #e5e7eb', background: 'white',
    }}>
      {/* Header */}
      <div style={{
        padding: '12px 16px', borderBottom: '1px solid #f3f4f6',
        display: 'flex', alignItems: 'center', gap: 8,
      }}>
        <span style={{ fontSize: 20 }}>{agentEmoji}</span>
        <div>
          <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{agentLabel}</div>
          <div style={{ fontSize: 11, color: '#6b7280' }}>Studio Creatif</div>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} style={{
        flex: 1, overflowY: 'auto', padding: 16,
        display: 'flex', flexDirection: 'column', gap: 12,
      }}>
        {messages.length === 0 && (
          <div style={{
            textAlign: 'center', padding: '40px 20px', color: '#9ca3af', fontSize: 13,
          }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>{agentEmoji}</div>
            <div>Bonjour ! Decrivez votre projet et je vous guiderai etape par etape.</div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} style={{
            alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
            maxWidth: '85%',
          }}>
            <div style={{
              padding: '10px 14px', borderRadius: 12, fontSize: 13, lineHeight: 1.6,
              background: msg.role === 'user' ? '#1d1d1f' : '#f3f4f6',
              color: msg.role === 'user' ? 'white' : '#1d1d1f',
              whiteSpace: 'pre-wrap',
            }}>
              {msg.content || (streaming && i === messages.length - 1 ? '...' : '')}
            </div>
          </div>
        ))}
      </div>

      {/* Input */}
      <div style={{ padding: '12px 16px', borderTop: '1px solid #f3f4f6' }}>
        <div style={{ display: 'flex', gap: 8 }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={e => {
              if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendMessage(); }
            }}
            placeholder="Decrivez votre projet..."
            rows={2}
            style={{
              flex: 1, resize: 'none', padding: '10px 12px', borderRadius: 10,
              border: '1px solid #e5e7eb', fontSize: 13, fontFamily: 'inherit',
              outline: 'none',
            }}
          />
          <button
            onClick={sendMessage}
            disabled={streaming || !input.trim()}
            style={{
              padding: '0 16px', borderRadius: 10, border: 'none',
              background: streaming ? '#9ca3af' : '#1d1d1f',
              color: 'white', fontSize: 14, cursor: streaming ? 'wait' : 'pointer',
            }}
          >
            {streaming ? '...' : '→'}
          </button>
        </div>
      </div>
    </div>
  );
}
