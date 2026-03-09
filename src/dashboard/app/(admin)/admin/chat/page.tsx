'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { ALL_AGENTS } from '../../../../lib/agent-config';
import type { DefaultAgentDef } from '../../../../lib/agent-config';
import { useUserData } from '../../../../lib/use-user-data';
import { useIsMobile } from '../../../../lib/use-media-query';

// ─── Types ───

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  cost?: number;
  timestamp?: string;
}

interface ConversationEntry {
  id: string;
  agentId: string;
  agentMaterialIcon: string;
  agentName: string;
  title: string;
  messages: Message[];
  date: string;
  totalTokens: number;
  totalCost: number;
}

// ─── Helpers ───

const STORAGE_KEY = 'fz_admin_chat_history';

function getToken(): string {
  try {
    return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? '';
  } catch { return ''; }
}

function uid(): string {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '...' : s;
}

// ─── Component ───

export default function AdminChatPage() {
  const isMobile = useIsMobile();
  const [selectedAgent, setSelectedAgent] = useState<DefaultAgentDef>(ALL_AGENTS[0]);
  const { data: conversations, setData: setConversations } = useUserData<ConversationEntry[]>('admin_chat_history', [], STORAGE_KEY);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'agents' | 'history'>('agents');
  const [searchAgent, setSearchAgent] = useState('');
  const [chatSidebarOpen, setChatSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamBufferRef = useRef('');

  // Cleanup on unmount
  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Close sidebar on mobile when selecting agent
  const selectAgentMobile = useCallback((agent: DefaultAgentDef) => {
    setSelectedAgent(agent);
    if (isMobile) setChatSidebarOpen(false);
  }, [isMobile]);

  // ─── Conversation management ───

  const startNewConversation = useCallback(() => {
    if (streaming) return;
    setActiveConvId(null);
    setMessages([]);
    setInput('');
  }, [streaming]);

  const saveCurrentConversation = useCallback((msgs: Message[], tokens: number, cost: number) => {
    if (msgs.length === 0) return;

    const firstUserMsg = msgs.find(m => m.role === 'user');
    const title = firstUserMsg ? truncate(firstUserMsg.content, 60) : 'Conversation';

    setConversations(prev => {
      const updated = [...prev];
      const idx = activeConvId ? updated.findIndex(c => c.id === activeConvId) : -1;

      const entry: ConversationEntry = {
        id: activeConvId ?? uid(),
        agentId: selectedAgent.id,
        agentMaterialIcon: selectedAgent.materialIcon,
        agentName: selectedAgent.name,
        title,
        messages: msgs,
        date: new Date().toISOString(),
        totalTokens: tokens,
        totalCost: cost,
      };

      if (idx >= 0) {
        updated[idx] = entry;
      } else {
        updated.unshift(entry);
        setActiveConvId(entry.id);
      }

      return updated;
    });
  }, [activeConvId, selectedAgent]);

  const loadConversation = useCallback((conv: ConversationEntry) => {
    if (streaming) return;
    setActiveConvId(conv.id);
    setMessages(conv.messages);
    const agent = ALL_AGENTS.find(a => a.id === conv.agentId);
    if (agent) setSelectedAgent(agent);
    if (isMobile) setChatSidebarOpen(false);
  }, [streaming, isMobile]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => prev.filter(c => c.id !== id));
    if (activeConvId === id) {
      setActiveConvId(null);
      setMessages([]);
    }
  }, [activeConvId]);

  // ─── SSE Streaming ───

  const handleSubmit = useCallback(async (e?: FormEvent) => {
    e?.preventDefault();
    const text = input.trim();
    if (!text || streaming) return;

    const token = getToken();
    if (!token) {
      alert('Session expiree. Reconnectez-vous.');
      return;
    }

    const userMsg: Message = {
      role: 'user',
      content: text,
      timestamp: new Date().toISOString(),
    };

    const updatedMessages = [...messages, userMsg];
    setMessages(updatedMessages);
    setInput('');
    setStreaming(true);
    streamBufferRef.current = '';

    const apiMessages = updatedMessages.map(m => ({
      role: m.role,
      content: m.content,
    }));

    const assistantMsg: Message = {
      role: 'assistant',
      content: '',
      timestamp: new Date().toISOString(),
    };

    setMessages(prev => [...prev, assistantMsg]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token,
          model: selectedAgent.model,
          messages: apiMessages,
          maxTokens: 4096,
          agentName: selectedAgent.id,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || `HTTP ${res.status}`);
      }

      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream reader');

      const decoder = new TextDecoder();
      let fullContent = '';
      let totalTokens = 0;
      let billedCredits = 0;
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        let currentEvent = '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ') && currentEvent) {
            try {
              const data = JSON.parse(line.slice(6));
              if (currentEvent === 'content_delta' && data.text) {
                fullContent += data.text;
                setMessages(prev => {
                  const copy = [...prev];
                  const last = copy[copy.length - 1];
                  if (last?.role === 'assistant') {
                    copy[copy.length - 1] = { ...last, content: fullContent };
                  }
                  return copy;
                });
              } else if (currentEvent === 'message_complete') {
                totalTokens = data.totalTokens ?? 0;
                billedCredits = data.billedCredits ?? 0;
              } else if (currentEvent === 'error') {
                throw new Error(data.error ?? 'Stream error');
              }
            } catch (parseErr) {
              if (parseErr instanceof Error && parseErr.message !== 'Stream error') {
                // Ignore JSON parse errors for incomplete data
              } else {
                throw parseErr;
              }
            }
            currentEvent = '';
          }
        }
      }

      const finalMessages = [...updatedMessages, {
        ...assistantMsg,
        content: fullContent,
        tokens: totalTokens,
        cost: billedCredits,
      }];
      setMessages(finalMessages);

      const allTokens = finalMessages.reduce((s, m) => s + (m.tokens ?? 0), 0);
      const allCost = finalMessages.reduce((s, m) => s + (m.cost ?? 0), 0);
      saveCurrentConversation(finalMessages, allTokens, allCost);

    } catch (err: unknown) {
      if (err instanceof DOMException && err.name === 'AbortError') {
        // User cancelled
      } else {
        const errMsg = err instanceof Error ? err.message : 'Erreur inconnue';
        setMessages(prev => {
          const copy = [...prev];
          const last = copy[copy.length - 1];
          if (last?.role === 'assistant') {
            copy[copy.length - 1] = {
              ...last,
              content: last.content || `[Erreur: ${errMsg}]`,
            };
          }
          return copy;
        });
      }
    } finally {
      setStreaming(false);
      abortRef.current = null;
    }
  }, [input, streaming, messages, selectedAgent, saveCurrentConversation]);

  const stopStreaming = useCallback(() => {
    abortRef.current?.abort();
  }, []);

  // ─── Filtered agents ───

  const filteredAgents = searchAgent
    ? ALL_AGENTS.filter(a =>
        a.name.toLowerCase().includes(searchAgent.toLowerCase()) ||
        a.id.toLowerCase().includes(searchAgent.toLowerCase())
      )
    : ALL_AGENTS;

  // ─── Totals ───

  const totalTokens = messages.reduce((s, m) => s + (m.tokens ?? 0), 0);
  const totalCost = messages.reduce((s, m) => s + (m.cost ?? 0), 0);

  // ─── Render ───

  const sidebarContent = (
    <>
      {/* Sidebar Tabs */}
      <div style={{ display: 'flex', borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
        <button
          onClick={() => setSidebarTab('agents')}
          style={{
            flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
            background: 'transparent',
            color: sidebarTab === 'agents' ? '#7c3aed' : '#6b7280',
            borderBottom: sidebarTab === 'agents' ? '2px solid #7c3aed' : '2px solid transparent',
          }}
        >
          Agents ({ALL_AGENTS.length})
        </button>
        <button
          onClick={() => setSidebarTab('history')}
          style={{
            flex: 1, padding: '10px 0', fontSize: 12, fontWeight: 500, border: 'none', cursor: 'pointer',
            background: 'transparent',
            color: sidebarTab === 'history' ? '#7c3aed' : '#6b7280',
            borderBottom: sidebarTab === 'history' ? '2px solid #7c3aed' : '2px solid transparent',
          }}
        >
          Historique ({conversations.length})
        </button>
      </div>

      {sidebarTab === 'agents' && (
        <>
          <div style={{ padding: 8 }}>
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={searchAgent}
              onChange={e => setSearchAgent(e.target.value)}
              style={{
                width: '100%', padding: '6px 10px', background: '#1a0e3a', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 4, fontSize: 12, color: '#fff', outline: 'none',
              }}
            />
          </div>
          <div style={{ flex: 1, overflowY: 'auto' }}>
            {filteredAgents.map(agent => (
              <button
                key={agent.id}
                onClick={() => selectAgentMobile(agent)}
                style={{
                  width: '100%', textAlign: 'left', padding: '8px 12px', display: 'flex', alignItems: 'center', gap: 8,
                  fontSize: 12, border: 'none', cursor: 'pointer', minHeight: 44,
                  background: selectedAgent.id === agent.id ? 'rgba(124, 58, 237, 0.2)' : 'transparent',
                  color: selectedAgent.id === agent.id ? '#a78bfa' : '#9ca3af',
                  borderLeft: selectedAgent.id === agent.id ? '2px solid #7c3aed' : '2px solid transparent',
                }}
                title={agent.description}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: agent.color || 'var(--accent)', flexShrink: 0 }}>{agent.materialIcon}</span>
                <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</span>
              </button>
            ))}
          </div>
        </>
      )}

      {sidebarTab === 'history' && (
        <div style={{ flex: 1, overflowY: 'auto' }}>
          {conversations.length === 0 && (
            <p style={{ color: '#4b5563', fontSize: 12, padding: 16, textAlign: 'center' }}>Aucune conversation</p>
          )}
          {conversations.map(conv => (
            <div
              key={conv.id}
              style={{
                padding: '8px 12px', borderBottom: '1px solid rgba(255,255,255,0.06)', cursor: 'pointer',
                background: activeConvId === conv.id ? 'rgba(124,58,237,0.15)' : 'transparent',
                minHeight: 44, display: 'flex', flexDirection: 'column', justifyContent: 'center',
              }}
              onClick={() => loadConversation(conv)}
            >
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <span style={{ fontSize: 12, color: '#d1d5db', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', flex: 1 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{conv.agentMaterialIcon}</span> {conv.title}
                </span>
                <button
                  onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                  style={{ color: '#ef4444', background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, marginLeft: 4, padding: '2px 4px', minWidth: 24, minHeight: 24 }}
                  title="Supprimer"
                >
                  x
                </button>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                <span style={{ fontSize: 10, color: '#4b5563' }}>{conv.agentName}</span>
                <span style={{ fontSize: 10, color: '#4b5563' }}>
                  {new Date(conv.date).toLocaleDateString('fr-FR')}
                </span>
              </div>
            </div>
          ))}
        </div>
      )}
    </>
  );

  return (
    <div style={{ display: 'flex', height: 'calc(100vh - 64px)', background: '#0f0720', color: '#fff', position: 'relative' }} className="admin-page-scrollable">

      {/* Mobile sidebar overlay */}
      {isMobile && chatSidebarOpen && (
        <div
          onClick={() => setChatSidebarOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', zIndex: 40 }}
        />
      )}

      {/* Sidebar */}
      <div style={{
        width: isMobile ? 'min(280px, 85vw)' : 256,
        flexShrink: 0,
        background: '#0a0518',
        borderRight: '1px solid rgba(255,255,255,0.08)',
        display: 'flex',
        flexDirection: 'column',
        ...(isMobile ? {
          position: 'fixed',
          top: 0,
          left: 0,
          bottom: 0,
          zIndex: 50,
          transform: chatSidebarOpen ? 'translateX(0)' : 'translateX(-100%)',
          transition: 'transform 0.25s ease',
        } : {}),
      }}>
        {sidebarContent}
      </div>

      {/* Main Chat Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minWidth: 0 }}>
        {/* Top Bar */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: isMobile ? '8px 12px' : '10px 16px',
          background: 'rgba(15,7,32,0.8)', borderBottom: '1px solid rgba(255,255,255,0.08)',
          gap: 8, flexWrap: isMobile ? 'wrap' : 'nowrap',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 8 : 12 }}>
            {isMobile && (
              <button
                onClick={() => setChatSidebarOpen(true)}
                style={{ background: 'none', border: 'none', color: '#9ca3af', cursor: 'pointer', padding: 4, minWidth: 44, minHeight: 44, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>menu</span>
              </button>
            )}
            <span className="material-symbols-rounded" style={{ fontSize: 20, color: selectedAgent.color || 'var(--accent)' }}>{selectedAgent.materialIcon}</span>
            <div>
              <h2 style={{ fontSize: 14, fontWeight: 600, color: '#fff', margin: 0 }}>{selectedAgent.name}</h2>
              <p style={{ fontSize: 10, color: '#6b7280', margin: 0 }}>{selectedAgent.role} &middot; {selectedAgent.model}</p>
            </div>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? 6 : 12, flexWrap: 'wrap' }}>
            {totalTokens > 0 && (
              <span style={{ fontSize: 10, background: '#1a0e3a', padding: '4px 8px', borderRadius: 4, color: '#9ca3af', whiteSpace: 'nowrap' }}>
                {totalTokens.toLocaleString()} tokens &middot; {totalCost.toFixed(2)} cr
              </span>
            )}
            <button
              onClick={startNewConversation}
              disabled={streaming}
              style={{
                padding: isMobile ? '8px 12px' : '6px 12px', background: '#7c3aed', color: '#fff',
                fontSize: 12, fontWeight: 500, borderRadius: 4, border: 'none', cursor: 'pointer',
                opacity: streaming ? 0.4 : 1, whiteSpace: 'nowrap', minHeight: 44,
              }}
            >
              + Nouvelle
            </button>
          </div>
        </div>

        {/* Messages */}
        <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '12px 8px' : '16px 16px' }}>
          {messages.length === 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%', textAlign: 'center', padding: isMobile ? 16 : 0 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 48, color: selectedAgent.color || 'var(--accent)', marginBottom: 16 }}>{selectedAgent.materialIcon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 600, color: '#d1d5db', marginBottom: 4 }}>
                Chat avec {selectedAgent.name}
              </h3>
              <p style={{ fontSize: 14, color: '#6b7280', maxWidth: 400 }}>
                {selectedAgent.description}
              </p>
              <p style={{ fontSize: 12, color: '#4b5563', marginTop: 16 }}>
                Modele: {selectedAgent.model}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              style={{
                display: 'flex',
                justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                marginBottom: 12,
              }}
            >
              <div
                style={{
                  maxWidth: isMobile ? '90%' : '75%',
                  borderRadius: 8,
                  padding: '10px 14px',
                  background: msg.role === 'user' ? '#7c3aed' : '#1a0e3a',
                  color: msg.role === 'user' ? '#fff' : '#f3f4f6',
                }}
              >
                {msg.role === 'assistant' && (
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 14, color: selectedAgent.color || 'var(--accent)' }}>{selectedAgent.materialIcon}</span>
                    <span style={{ fontSize: 10, fontWeight: 500, color: '#9ca3af' }}>{selectedAgent.name}</span>
                  </div>
                )}

                <div style={{ fontSize: 14, whiteSpace: 'pre-wrap', wordBreak: 'break-word', lineHeight: 1.6 }}>
                  {msg.content}
                  {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                    <span style={{ display: 'inline-block', width: 6, height: 16, background: '#7c3aed', marginLeft: 2, borderRadius: 2, animation: 'pulse 1s infinite' }} />
                  )}
                </div>

                {(msg.tokens != null && msg.tokens > 0) && (
                  <div style={{ marginTop: 6, paddingTop: 4, borderTop: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{ fontSize: 10, color: '#6b7280' }}>
                      {msg.tokens.toLocaleString()} tokens
                    </span>
                    {msg.cost != null && msg.cost > 0 && (
                      <span style={{ fontSize: 10, color: '#6b7280' }}>
                        {msg.cost.toFixed(2)} cr
                      </span>
                    )}
                  </div>
                )}

                {msg.timestamp && (
                  <span style={{ fontSize: 9, color: '#4b5563', marginTop: 4, display: 'block' }}>
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div style={{ borderTop: '1px solid rgba(255,255,255,0.08)', background: 'rgba(15,7,32,0.8)', padding: isMobile ? '8px 8px' : '12px 16px' }}>
          {streaming && (
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
              <span style={{ fontSize: 12, color: '#7c3aed' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14, color: selectedAgent.color || 'var(--accent)' }}>{selectedAgent.materialIcon}</span> {selectedAgent.name} repond...
              </span>
              <button
                onClick={stopStreaming}
                style={{ fontSize: 12, color: '#f87171', padding: '2px 8px', border: '1px solid #7f1d1d', borderRadius: 4, background: 'none', cursor: 'pointer', minHeight: 32 }}
              >
                Arreter
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', gap: 8 }}>
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Message a ${selectedAgent.name}...`}
              disabled={streaming}
              style={{
                flex: 1, padding: '10px 12px', background: '#1a0e3a', border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 8, fontSize: 14, color: '#fff', outline: 'none',
                opacity: streaming ? 0.5 : 1, minHeight: 44,
              }}
              autoFocus
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              style={{
                padding: '10px 20px', background: '#7c3aed', color: '#fff', fontSize: 14, fontWeight: 500,
                borderRadius: 8, border: 'none', cursor: 'pointer',
                opacity: (streaming || !input.trim()) ? 0.4 : 1, minHeight: 44, whiteSpace: 'nowrap',
              }}
            >
              Envoyer
            </button>
          </form>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: 8 }}>
            <span style={{ fontSize: 10, color: '#4b5563' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 12, color: selectedAgent.color || 'var(--accent)' }}>{selectedAgent.materialIcon}</span> {selectedAgent.name} &middot; {selectedAgent.model}
            </span>
            <span style={{ fontSize: 10, color: '#4b5563' }}>
              {messages.filter(m => m.role === 'user').length} messages envoyes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
