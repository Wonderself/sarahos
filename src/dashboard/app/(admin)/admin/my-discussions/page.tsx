'use client';

import { useState, useRef, useEffect } from 'react';
import { ALL_AGENTS } from '../../../../lib/agent-config';
import { useUserData } from '../../../../lib/use-user-data';

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; }
  catch { return ''; }
}

interface DiscussionMessage {
  role: 'user' | 'assistant';
  content: string;
  timestamp: string;
}

interface Discussion {
  id: string;
  title: string;
  agentId: string;
  agentName: string;
  agentMaterialIcon: string;
  messages: DiscussionMessage[];
  keyPoints: string[];
  status: 'active' | 'archived';
  createdAt: string;
  lastActivityAt: string;
}

const DISCUSSION_TEMPLATES = [
  { title: 'Analyse de marché', prompt: 'Analysons en profondeur le marché cible, les tendances et les opportunités.', agentId: 'fz-commercial' },
  { title: 'Optimisation financière', prompt: 'Explorons les leviers d\'optimisation financière et de réduction des coûts.', agentId: 'fz-finance' },
  { title: 'Stratégie marketing', prompt: 'Définissons une stratégie marketing digitale complète et mesurable.', agentId: 'fz-marketing' },
  { title: 'Architecture technique', prompt: 'Discutons de l\'architecture technique optimale pour nos besoins.', agentId: 'fz-dev' },
  { title: 'Plan de recrutement', prompt: 'Élaborons un plan de recrutement et de gestion des talents.', agentId: 'fz-rh' },
  { title: 'Conformité juridique', prompt: 'Passons en revue les aspects juridiques et de conformité.', agentId: 'fz-juridique' },
  { title: 'Vision stratégique', prompt: 'Réfléchissons à la vision à long terme et aux pivots stratégiques.', agentId: 'fz-dg' },
  { title: 'Plan de communication', prompt: 'Construisons un plan de communication interne et externe.', agentId: 'fz-communication' },
];

export default function MyDiscussionsPage() {
  const { data: discussions, setData: setDiscussions } = useUserData<Discussion[]>('admin_discussions', [], 'fz_admin_discussions');
  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  const active = discussions.find(d => d.id === activeId);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length, streaming]);

  useEffect(() => {
    return () => { abortRef.current?.abort(); };
  }, []);

  const save = (updated: Discussion[]) => {
    setDiscussions(updated);
  };

  const startDiscussion = (template: typeof DISCUSSION_TEMPLATES[0]) => {
    const agent = ALL_AGENTS.find(a => a.id === template.agentId) ?? ALL_AGENTS[0];
    const disc: Discussion = {
      id: crypto.randomUUID(),
      title: template.title,
      agentId: agent.id,
      agentName: agent.name,
      agentMaterialIcon: agent.materialIcon,
      messages: [],
      keyPoints: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
    };
    const updated = [disc, ...discussions];
    save(updated);
    setActiveId(disc.id);
    setShowTemplates(false);
    // Auto-send first message
    sendMessage(template.prompt, disc, updated);
  };

  const sendMessage = async (text: string, disc?: Discussion, allDiscs?: Discussion[]) => {
    const d = disc ?? active;
    const all = allDiscs ?? discussions;
    if (!d || !text.trim()) return;
    setInput('');
    setStreaming(true);

    const userMsg: DiscussionMessage = { role: 'user', content: text, timestamp: new Date().toISOString() };
    const assistantMsg: DiscussionMessage = { role: 'assistant', content: '', timestamp: new Date().toISOString() };

    let updated = all.map(dd => dd.id === d.id ? { ...dd, messages: [...dd.messages, userMsg, assistantMsg], lastActivityAt: new Date().toISOString() } : dd);
    save(updated);

    try {
      const agent = ALL_AGENTS.find(a => a.id === d.agentId) ?? ALL_AGENTS[0];
      const contextMsgs = d.messages.slice(-20).map(m => ({ role: m.role, content: m.content }));
      contextMsgs.push({ role: 'user', content: text });

      abortRef.current?.abort();
      const controller = new AbortController();
      abortRef.current = controller;

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: getToken(),
          model: agent.model ?? 'claude-sonnet-4-20250514',
          messages: contextMsgs,
          maxTokens: 4096,
          agentName: agent.id,
        }),
        signal: controller.signal,
      });

      if (!res.body) throw new Error('No stream');
      const reader = res.body.getReader();
      const decoder = new TextDecoder();
      let content = '';
      let buffer = '';
      let currentEvent = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';
        for (const line of lines) {
          if (line.startsWith('event: ')) {
            currentEvent = line.slice(7).trim();
          } else if (line.startsWith('data: ')) {
            const dataStr = line.slice(6).trim();
            if (dataStr === '[DONE]') continue;
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'content_delta' && data.text) {
                content += data.text;
                updated = updated.map(dd => {
                  if (dd.id !== d.id) return dd;
                  const msgs = [...dd.messages];
                  msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content };
                  return { ...dd, messages: msgs };
                });
                save(updated);
              }
            } catch { /* skip malformed */ }
          }
        }
      }
    } catch (err) {
      updated = updated.map(dd => {
        if (dd.id !== d.id) return dd;
        const msgs = [...dd.messages];
        msgs[msgs.length - 1] = { ...msgs[msgs.length - 1], content: `Erreur: ${err instanceof Error ? err.message : String(err)}` };
        return { ...dd, messages: msgs };
      });
      save(updated);
    }
    setStreaming(false);
  };

  const handleSend = () => sendMessage(input);

  const deleteDiscussion = (id: string) => {
    const updated = discussions.filter(d => d.id !== id);
    save(updated);
    if (activeId === id) setActiveId(null);
  };

  const exportMarkdown = (d: Discussion) => {
    const md = `# ${d.title}\nAgent: ${d.agentName}\nDate: ${new Date(d.createdAt).toLocaleDateString('fr-FR')}\n\n` +
      d.messages.map(m => `**${m.role === 'user' ? 'Vous' : d.agentName}** (${new Date(m.timestamp).toLocaleTimeString('fr-FR')}):\n${m.content}\n`).join('\n---\n\n');
    navigator.clipboard.writeText(md);
  };

  return (
    <div className="flex h-[calc(100vh-8rem)] gap-4 admin-page-scrollable">
      {/* Sidebar */}
      <div className="w-72 flex flex-col bg-[#1a0e3a] rounded-xl border border-white/[0.08] overflow-hidden shrink-0">
        <div className="p-3 border-b border-white/[0.08]">
          <button onClick={() => setShowTemplates(!showTemplates)} className="w-full px-3 py-2 bg-[#7c3aed] text-white rounded-lg text-sm hover:bg-[#6d28d9]">
            + Nouvelle discussion
          </button>
        </div>
        <div className="flex-1 overflow-y-auto">
          {showTemplates && (
            <div className="p-2 border-b border-white/[0.08] space-y-1">
              {DISCUSSION_TEMPLATES.map(t => {
                const agent = ALL_AGENTS.find(a => a.id === t.agentId);
                return (
                  <button key={t.title} onClick={() => startDiscussion(t)} className="w-full text-left p-2 rounded-lg hover:bg-white/[0.07] text-sm">
                    <span><span className="material-symbols-rounded" style={{ fontSize: 14, color: agent?.color || 'var(--accent)' }}>{agent?.materialIcon}</span> {t.title}</span>
                  </button>
                );
              })}
            </div>
          )}
          {discussions.map(d => (
            <div
              key={d.id}
              onClick={() => setActiveId(d.id)}
              className={`p-3 border-b border-white/[0.06] cursor-pointer hover:bg-white/[0.07] ${activeId === d.id ? 'bg-white/[0.07]' : ''}`}
            >
              <div className="flex items-center justify-between">
                <span className="text-white text-sm font-medium truncate"><span className="material-symbols-rounded" style={{ fontSize: 14 }}>{d.agentMaterialIcon}</span> {d.title}</span>
                <button onClick={(e) => { e.stopPropagation(); deleteDiscussion(d.id); }} className="text-red-500 text-xs hover:text-red-400">×</button>
              </div>
              <p className="text-gray-500 text-xs mt-1">{d.messages.length} messages • {new Date(d.lastActivityAt).toLocaleDateString('fr-FR')}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Main chat area */}
      <div className="flex-1 flex flex-col bg-[#1a0e3a] rounded-xl border border-white/[0.08] overflow-hidden">
        {active ? (
          <>
            <div className="p-4 border-b border-white/[0.08] flex items-center justify-between">
              <div>
                <h2 className="text-white font-medium"><span className="material-symbols-rounded" style={{ fontSize: 18 }}>{active.agentMaterialIcon}</span> {active.title}</h2>
                <p className="text-gray-500 text-xs">{active.agentName} • {active.messages.length} messages</p>
              </div>
              <button onClick={() => exportMarkdown(active)} className="px-3 py-1 bg-white/[0.08] text-gray-300 rounded text-xs hover:bg-white/[0.12]">
                Exporter
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {active.messages.map((m, i) => (
                <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[80%] rounded-xl p-3 ${m.role === 'user' ? 'bg-[#7c3aed] text-white' : 'bg-white/[0.08] text-gray-200'}`}>
                    <p className="text-sm whitespace-pre-wrap">{m.content || (streaming && i === active.messages.length - 1 ? '...' : '')}</p>
                    <p className={`text-xs mt-1 ${m.role === 'user' ? 'text-purple-200' : 'text-gray-500'}`}>
                      {new Date(m.timestamp).toLocaleTimeString('fr-FR')}
                    </p>
                  </div>
                </div>
              ))}
              <div ref={messagesEndRef} />
            </div>
            <div className="p-4 border-t border-white/[0.08]">
              <div className="flex gap-2">
                <input
                  value={input}
                  onChange={e => setInput(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && !e.shiftKey && !streaming && handleSend()}
                  placeholder="Continuez la discussion..."
                  disabled={streaming}
                  className="flex-1 bg-[#0f0720] border border-white/[0.08] rounded-lg px-4 py-2.5 text-white text-sm focus:border-purple-500 focus:outline-none disabled:opacity-50"
                />
                <button onClick={handleSend} disabled={streaming || !input.trim()} className="px-4 py-2.5 bg-[#7c3aed] text-white rounded-lg text-sm hover:bg-[#6d28d9] disabled:opacity-50">
                  {streaming ? '...' : 'Envoyer'}
                </button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center text-gray-500">
            <div className="text-center">
              <p className="mb-3"><span className="material-symbols-rounded" style={{ fontSize: 40 }}>psychology</span></p>
              <p className="text-lg font-medium text-gray-400">Discussions approfondies</p>
              <p className="text-sm mt-2">Explorez des sujets en profondeur avec les agents IA</p>
              <button onClick={() => setShowTemplates(true)} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg text-sm">
                Commencer une discussion
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
