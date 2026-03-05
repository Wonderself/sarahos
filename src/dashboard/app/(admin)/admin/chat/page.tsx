'use client';

import { useState, useRef, useEffect, useCallback, FormEvent } from 'react';
import { ALL_AGENTS } from '../../../../lib/agent-config';
import type { DefaultAgentDef } from '../../../../lib/agent-config';

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
  agentEmoji: string;
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

function loadHistory(): ConversationEntry[] {
  try {
    return JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '[]');
  } catch { return []; }
}

function saveHistory(h: ConversationEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(h));
}

function truncate(s: string, n: number) {
  return s.length > n ? s.slice(0, n) + '...' : s;
}

// ─── Component ───

export default function AdminChatPage() {
  const [selectedAgent, setSelectedAgent] = useState<DefaultAgentDef>(ALL_AGENTS[0]);
  const [conversations, setConversations] = useState<ConversationEntry[]>([]);
  const [activeConvId, setActiveConvId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [sidebarTab, setSidebarTab] = useState<'agents' | 'history'>('agents');
  const [searchAgent, setSearchAgent] = useState('');

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);
  const streamBufferRef = useRef('');

  // Load history on mount
  useEffect(() => {
    setConversations(loadHistory());
  }, []);

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

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
        agentEmoji: selectedAgent.emoji,
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

      saveHistory(updated);
      return updated;
    });
  }, [activeConvId, selectedAgent]);

  const loadConversation = useCallback((conv: ConversationEntry) => {
    if (streaming) return;
    setActiveConvId(conv.id);
    setMessages(conv.messages);
    const agent = ALL_AGENTS.find(a => a.id === conv.agentId);
    if (agent) setSelectedAgent(agent);
  }, [streaming]);

  const deleteConversation = useCallback((id: string) => {
    setConversations(prev => {
      const updated = prev.filter(c => c.id !== id);
      saveHistory(updated);
      return updated;
    });
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
      alert('Session expirée. Reconnectez-vous.');
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

    // Build API messages (no timestamps/tokens for API)
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

      // Finalize assistant message with token info
      const finalMessages = [...updatedMessages, {
        ...assistantMsg,
        content: fullContent,
        tokens: totalTokens,
        cost: billedCredits,
      }];
      setMessages(finalMessages);

      // Compute totals
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

  return (
    <div className="flex h-[calc(100vh-64px)] bg-gray-900 text-white admin-page-scrollable">
      {/* ── Left Sidebar ── */}
      <div className="w-64 flex-shrink-0 bg-gray-950 border-r border-gray-800 flex flex-col">
        {/* Sidebar Tabs */}
        <div className="flex border-b border-gray-800">
          <button
            onClick={() => setSidebarTab('agents')}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              sidebarTab === 'agents'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Agents ({ALL_AGENTS.length})
          </button>
          <button
            onClick={() => setSidebarTab('history')}
            className={`flex-1 py-2.5 text-xs font-medium transition-colors ${
              sidebarTab === 'history'
                ? 'text-blue-400 border-b-2 border-blue-400'
                : 'text-gray-500 hover:text-gray-300'
            }`}
          >
            Historique ({conversations.length})
          </button>
        </div>

        {sidebarTab === 'agents' && (
          <>
            {/* Agent Search */}
            <div className="p-2">
              <input
                type="text"
                placeholder="Rechercher un agent..."
                value={searchAgent}
                onChange={e => setSearchAgent(e.target.value)}
                className="w-full px-2.5 py-1.5 bg-gray-800 border border-gray-700 rounded text-xs text-white placeholder-gray-500 focus:outline-none focus:border-blue-500"
              />
            </div>

            {/* Agent List */}
            <div className="flex-1 overflow-y-auto">
              {filteredAgents.map(agent => (
                <button
                  key={agent.id}
                  onClick={() => { setSelectedAgent(agent); }}
                  className={`w-full text-left px-3 py-2 flex items-center gap-2 transition-colors text-sm ${
                    selectedAgent.id === agent.id
                      ? 'bg-blue-900/40 text-blue-300 border-l-2 border-blue-400'
                      : 'text-gray-400 hover:bg-gray-800/60 hover:text-gray-200 border-l-2 border-transparent'
                  }`}
                  title={agent.description}
                >
                  <span className="text-base flex-shrink-0">{agent.emoji}</span>
                  <span className="truncate text-xs">{agent.name}</span>
                </button>
              ))}
            </div>
          </>
        )}

        {sidebarTab === 'history' && (
          <div className="flex-1 overflow-y-auto">
            {conversations.length === 0 && (
              <p className="text-gray-600 text-xs p-4 text-center">Aucune conversation</p>
            )}
            {conversations.map(conv => (
              <div
                key={conv.id}
                className={`group px-3 py-2 border-b border-gray-800/50 cursor-pointer transition-colors ${
                  activeConvId === conv.id
                    ? 'bg-gray-800/60'
                    : 'hover:bg-gray-800/30'
                }`}
                onClick={() => loadConversation(conv)}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs text-gray-300 truncate flex-1">
                    {conv.agentEmoji} {conv.title}
                  </span>
                  <button
                    onClick={e => { e.stopPropagation(); deleteConversation(conv.id); }}
                    className="text-gray-600 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity ml-1 text-xs"
                    title="Supprimer"
                  >
                    x
                  </button>
                </div>
                <div className="flex items-center justify-between mt-0.5">
                  <span className="text-[10px] text-gray-600">{conv.agentName}</span>
                  <span className="text-[10px] text-gray-600">
                    {new Date(conv.date).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ── Main Chat Area ── */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Top Bar */}
        <div className="flex items-center justify-between px-4 py-2.5 bg-gray-950/80 border-b border-gray-800">
          <div className="flex items-center gap-3">
            <span className="text-lg">{selectedAgent.emoji}</span>
            <div>
              <h2 className="text-sm font-semibold text-white">{selectedAgent.name}</h2>
              <p className="text-[10px] text-gray-500">{selectedAgent.role} &middot; {selectedAgent.model}</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {totalTokens > 0 && (
              <span className="text-[10px] bg-gray-800 px-2 py-1 rounded text-gray-400">
                {totalTokens.toLocaleString()} tokens &middot; {totalCost.toFixed(2)} cr
              </span>
            )}
            <button
              onClick={startNewConversation}
              disabled={streaming}
              className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 text-white text-xs rounded font-medium transition-colors"
            >
              + Nouvelle conversation
            </button>
          </div>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3">
          {messages.length === 0 && (
            <div className="flex flex-col items-center justify-center h-full text-center">
              <span className="text-5xl mb-4">{selectedAgent.emoji}</span>
              <h3 className="text-lg font-semibold text-gray-300 mb-1">
                Chat avec {selectedAgent.name}
              </h3>
              <p className="text-sm text-gray-500 max-w-md">
                {selectedAgent.description}
              </p>
              <p className="text-xs text-gray-600 mt-4">
                Modele: {selectedAgent.model}
              </p>
            </div>
          )}

          {messages.map((msg, i) => (
            <div
              key={i}
              className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[75%] rounded-lg px-3.5 py-2.5 ${
                  msg.role === 'user'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-800 text-gray-100'
                }`}
              >
                {msg.role === 'assistant' && (
                  <div className="flex items-center gap-1.5 mb-1">
                    <span className="text-xs">{selectedAgent.emoji}</span>
                    <span className="text-[10px] font-medium text-gray-400">{selectedAgent.name}</span>
                  </div>
                )}

                <div className="text-sm whitespace-pre-wrap break-words leading-relaxed">
                  {msg.content}
                  {streaming && i === messages.length - 1 && msg.role === 'assistant' && (
                    <span className="inline-block w-1.5 h-4 bg-blue-400 ml-0.5 animate-pulse rounded-sm" />
                  )}
                </div>

                {(msg.tokens != null && msg.tokens > 0) && (
                  <div className="mt-1.5 pt-1 border-t border-gray-700/50 flex items-center gap-2">
                    <span className="text-[10px] text-gray-500">
                      {msg.tokens.toLocaleString()} tokens
                    </span>
                    {msg.cost != null && msg.cost > 0 && (
                      <span className="text-[10px] text-gray-500">
                        {msg.cost.toFixed(2)} cr
                      </span>
                    )}
                  </div>
                )}

                {msg.timestamp && (
                  <span className="text-[9px] text-gray-600 mt-1 block">
                    {new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                  </span>
                )}
              </div>
            </div>
          ))}

          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-800 bg-gray-950/80 px-4 py-3">
          {streaming && (
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs text-blue-400 animate-pulse">
                {selectedAgent.emoji} {selectedAgent.name} est en train de repondre...
              </span>
              <button
                onClick={stopStreaming}
                className="text-xs text-red-400 hover:text-red-300 px-2 py-0.5 border border-red-800 rounded transition-colors"
              >
                Arreter
              </button>
            </div>
          )}

          <form onSubmit={handleSubmit} className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={e => setInput(e.target.value)}
              placeholder={`Message a ${selectedAgent.name}...`}
              disabled={streaming}
              className="flex-1 px-3 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-sm text-white placeholder-gray-500 focus:outline-none focus:border-blue-500 disabled:opacity-50 transition-colors"
              autoFocus
            />
            <button
              type="submit"
              disabled={streaming || !input.trim()}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-sm font-medium rounded-lg transition-colors"
            >
              Envoyer
            </button>
          </form>

          <div className="flex items-center justify-between mt-2">
            <span className="text-[10px] text-gray-600">
              {selectedAgent.emoji} {selectedAgent.name} &middot; {selectedAgent.model}
            </span>
            <span className="text-[10px] text-gray-600">
              {messages.filter(m => m.role === 'user').length} messages envoyes
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
