'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { recordEvent } from '../../../lib/gamification';
import { DEFAULT_AGENTS, loadAgentConfigs, getEffectiveAgent, type ResolvedAgent } from '../../../lib/agent-config';
import VoiceInput from '../../../components/VoiceInput';
import AudioPlayback from '../../../components/AudioPlayback';

interface Message {
  role: 'user' | 'assistant' | 'system';
  content: string;
  tokens?: number;
  cost?: number;
  timestamp?: string;
  isFaq?: boolean;
}

interface ConversationEntry {
  id: string;
  agentId: string;
  agentEmoji: string;
  title: string;
  messages: Message[];
  date: string;
  totalTokens: number;
}

interface FaqEntry {
  id: string;
  agentId: string;
  question: string;
  answer: string;
  keywords: string[];
  usedCount: number;
  createdAt: string;
}

const MAX_HISTORY = 50;
const MAX_CONTEXT_MESSAGES = 8; // Keep last 8 messages for API calls (saves tokens)
const FAQ_STORAGE_KEY = 'sarah_faq';
const FAQ_MATCH_THRESHOLD = 0.4; // 40% keyword match = FAQ hit

// Simple keyword-based FAQ matching
function normalizeTxt(s: string): string[] {
  return s.toLowerCase().replace(/[^a-z0-9àâäéèêëïîôùûüÿç\s]/g, '').split(/\s+/).filter(w => w.length > 2);
}

function matchFaq(query: string, faqEntries: FaqEntry[], agentId: string): FaqEntry | null {
  const queryWords = normalizeTxt(query);
  if (queryWords.length === 0) return null;
  let bestMatch: FaqEntry | null = null;
  let bestScore = 0;
  for (const entry of faqEntries) {
    if (entry.agentId !== agentId) continue;
    const matchCount = queryWords.filter(w => entry.keywords.some(k => k.includes(w) || w.includes(k))).length;
    const score = matchCount / queryWords.length;
    if (score > bestScore && score >= FAQ_MATCH_THRESHOLD) {
      bestScore = score;
      bestMatch = entry;
    }
  }
  return bestMatch;
}

function loadFaq(): FaqEntry[] {
  try {
    const raw = localStorage.getItem(FAQ_STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch { return []; }
}

function saveFaq(entries: FaqEntry[]) {
  try { localStorage.setItem(FAQ_STORAGE_KEY, JSON.stringify(entries)); } catch { /* */ }
}

// ─── Question frequency tracker for auto-FAQ suggestions ───
const FREQ_STORAGE_KEY = 'sarah_question_freq';

interface QuestionFreqEntry {
  keywords: string[];
  count: number;
  lastQuestion: string;
}

function loadQuestionFreq(): QuestionFreqEntry[] {
  try { return JSON.parse(localStorage.getItem(FREQ_STORAGE_KEY) ?? '[]'); } catch { return []; }
}

function saveQuestionFreq(entries: QuestionFreqEntry[]) {
  try { localStorage.setItem(FREQ_STORAGE_KEY, JSON.stringify(entries)); } catch { /* */ }
}

function trackQuestion(question: string, faqEntriesList: FaqEntry[], agentId: string): boolean {
  const keywords = normalizeTxt(question);
  if (keywords.length < 2) return false;
  // Don't suggest if already saved as FAQ
  if (matchFaq(question, faqEntriesList, agentId)) return false;

  const freq = loadQuestionFreq();
  let found = false;
  for (const entry of freq) {
    const matchCount = keywords.filter(w => entry.keywords.some(k => k.includes(w) || w.includes(k))).length;
    const score = matchCount / Math.max(keywords.length, entry.keywords.length);
    if (score >= FAQ_MATCH_THRESHOLD) {
      entry.count++;
      entry.lastQuestion = question;
      found = true;
      if (entry.count >= 3) {
        saveQuestionFreq(freq);
        return true;
      }
      break;
    }
  }
  if (!found) {
    freq.push({ keywords, count: 1, lastQuestion: question });
  }
  saveQuestionFreq(freq);
  return false;
}

export default function ChatPage() {
  const [agents, setAgents] = useState<ResolvedAgent[]>([]);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<ResolvedAgent | null>(null);
  const [totalTokens, setTotalTokens] = useState(0);
  const [totalCost, setTotalCost] = useState(0);
  const [followUpQuestions, setFollowUpQuestions] = useState<string[]>([]);
  const [history, setHistory] = useState<ConversationEntry[]>([]);
  const [showHistory, setShowHistory] = useState(false);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const [faqEntries, setFaqEntries] = useState<FaqEntry[]>([]);
  const [faqMatch, setFaqMatch] = useState<FaqEntry | null>(null);
  const [showFaqPanel, setShowFaqPanel] = useState(false);
  const [savedFaqIdx, setSavedFaqIdx] = useState<number | null>(null);
  const [faqSuggestion, setFaqSuggestion] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function parseFollowUps(text: string): { cleanContent: string; questions: string[] } {
    const questions: string[] = [];
    const regex = /\[Q\d+:\s*(.+?)\]/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      questions.push(match[1].trim());
    }
    const cleanContent = text.replace(/\[Q\d+:\s*.+?\]/g, '').trim();
    return { cleanContent, questions };
  }

  // Load agents from config (defaults + custom overrides)
  useEffect(() => {
    const configs = loadAgentConfigs();
    const resolved = DEFAULT_AGENTS.map(a => getEffectiveAgent(a.id, configs));
    setAgents(resolved);
    setSelectedAgent(resolved[0]);
    // Load chat history
    try {
      const stored = localStorage.getItem('sarah_chat_history');
      if (stored) setHistory(JSON.parse(stored));
    } catch { /* */ }
    // Load FAQ entries
    setFaqEntries(loadFaq());
    return () => { controllerRef.current?.abort(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('sarah_session') ?? '{}');
    } catch { return {}; }
  }

  // Check FAQ as user types
  function onInputChange(val: string) {
    setInput(val);
    if (val.trim().length > 10 && selectedAgent) {
      setFaqMatch(matchFaq(val, faqEntries, selectedAgent.id));
    } else {
      setFaqMatch(null);
    }
  }

  // Use a FAQ answer instead of calling the API
  function useFaqAnswer(entry: FaqEntry) {
    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const faqMsg: Message = {
      role: 'assistant', content: entry.answer, tokens: 0, cost: 0,
      timestamp: new Date().toISOString(), isFaq: true,
    };
    setMessages(prev => [...prev, userMsg, faqMsg]);
    setInput('');
    setFaqMatch(null);
    // Update usage count
    const updated = faqEntries.map(e => e.id === entry.id ? { ...e, usedCount: e.usedCount + 1 } : e);
    setFaqEntries(updated);
    saveFaq(updated);
  }

  // Save a Q&A pair as FAQ
  function saveAsFaq(questionIdx: number, answerIdx: number) {
    const q = messages[questionIdx];
    const a = messages[answerIdx];
    if (!q || !a || !selectedAgent) return;
    const entry: FaqEntry = {
      id: Date.now().toString(),
      agentId: selectedAgent.id,
      question: q.content,
      answer: a.content,
      keywords: normalizeTxt(q.content),
      usedCount: 0,
      createdAt: new Date().toISOString(),
    };
    const updated = [...faqEntries, entry];
    setFaqEntries(updated);
    saveFaq(updated);
    setSavedFaqIdx(answerIdx);
    setTimeout(() => setSavedFaqIdx(null), 2000);
  }

  // Delete a FAQ entry
  function deleteFaqEntry(id: string) {
    const updated = faqEntries.filter(e => e.id !== id);
    setFaqEntries(updated);
    saveFaq(updated);
  }

  // ─── SSE Streaming sendMessage ───
  async function sendMessageStream() {
    if (!input.trim() || loading || !selectedAgent) return;
    if (sendingRef.current) return;
    sendingRef.current = true;
    const session = getSession();
    if (!session.token) { sendingRef.current = false; window.location.href = '/login'; return; }

    const userContent = input.trim();
    const userMsg: Message = { role: 'user', content: userContent, timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setFollowUpQuestions([]);
    setFaqMatch(null);
    setFaqSuggestion(false);
    setLoading(true);

    try {
      const conversationMsgs = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      const truncated = conversationMsgs.length > MAX_CONTEXT_MESSAGES
        ? conversationMsgs.slice(-MAX_CONTEXT_MESSAGES)
        : conversationMsgs;

      const apiMessages = [
        { role: 'user' as const, content: selectedAgent.systemPrompt },
        { role: 'assistant' as const, content: `Compris, je suis ${selectedAgent.name}, ${selectedAgent.role}. Comment puis-je vous aider?` },
        ...(conversationMsgs.length > MAX_CONTEXT_MESSAGES
          ? [{ role: 'user' as const, content: '[Note: messages précédents résumés pour optimiser les tokens. Concentre-toi sur les messages récents ci-dessous.]' },
             { role: 'assistant' as const, content: 'Compris, je me concentre sur la conversation récente.' }]
          : []),
        ...truncated,
      ];

      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: selectedAgent.model,
          messages: apiMessages,
          maxTokens: 4096,
          agentName: selectedAgent.id,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMsg = `Erreur ${res.status}`;
        try { const data = await res.json(); errorMsg = data.error ?? data.message ?? errorMsg; } catch { /* */ }
        setMessages(prev => [...prev, {
          role: 'system',
          content: res.status === 402 ? 'Crédits insuffisants. Rechargez votre compte dans Mon Compte > Wallet.' : `Erreur: ${errorMsg}`,
          timestamp: new Date().toISOString(),
        }]);
        return;
      }

      // Parse SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream reader');
      const decoder = new TextDecoder();
      let streamedContent = '';
      let streamTokens = 0;
      let streamCost = 0;

      // Add empty assistant message to fill incrementally
      setMessages(prev => [...prev, { role: 'assistant', content: '', tokens: 0, cost: 0, timestamp: new Date().toISOString() }]);

      let buffer = '';
      let currentEvent = '';
      const MAX_STREAM_SIZE = 100 * 1024; // 100KB safety limit
      const streamTimeout = setTimeout(() => controller.abort(), 30000);

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
            if (currentEvent === 'done' || dataStr === '[DONE]') { currentEvent = ''; continue; }
            try {
              const data = JSON.parse(dataStr);
              if (currentEvent === 'content_delta' && data.text !== undefined) {
                streamedContent += data.text;
                if (streamedContent.length > MAX_STREAM_SIZE) { controller.abort(); break; }
                const content = streamedContent;
                setMessages(prev => {
                  const updated = [...prev];
                  const last = updated[updated.length - 1];
                  if (last && last.role === 'assistant') {
                    updated[updated.length - 1] = { ...last, content };
                  }
                  return updated;
                });
              } else if (currentEvent === 'message_complete') {
                streamTokens = data.totalTokens ?? 0;
                streamCost = data.billedCredits ?? 0;
              } else if (currentEvent === 'error') {
                setMessages(prev => [...prev, { role: 'system', content: `Erreur: ${data.error}`, timestamp: new Date().toISOString() }]);
              }
            } catch { /* non-JSON */ }
            currentEvent = '';
          }
        }
      }

      clearTimeout(streamTimeout);

      // Finalize: parse follow-ups, update tokens
      const { cleanContent, questions } = parseFollowUps(streamedContent);
      setFollowUpQuestions(questions);
      setMessages(prev => {
        const updated = [...prev];
        const last = updated[updated.length - 1];
        if (last && last.role === 'assistant') {
          updated[updated.length - 1] = { ...last, content: cleanContent, tokens: streamTokens, cost: streamCost };
        }
        return updated;
      });
      setTotalTokens(t => t + streamTokens);
      setTotalCost(c => c + streamCost);

      // Gamification
      const result = recordEvent({ type: 'message', tokens: streamTokens, cost: streamCost });
      if (result.leveledUp) {
        setMessages(prev => [...prev, { role: 'system', content: `🎉 Niveau ${result.state.level} atteint! Bravo, continuez comme ca!`, timestamp: new Date().toISOString() }]);
      }
      if (result.newAchievements.length > 0) {
        setMessages(prev => [...prev, { role: 'system', content: `🏆 Nouveau succès débloqué : ${result.newAchievements.join(', ')}! +50 XP`, timestamp: new Date().toISOString() }]);
      }
      // Check auto-FAQ suggestion
      if (selectedAgent && trackQuestion(userContent, faqEntries, selectedAgent.id)) {
        setFaqSuggestion(true);
      }
    } catch (e) {
      setMessages(prev => [...prev, { role: 'system', content: `Erreur de connexion: ${e instanceof Error ? e.message : 'inconnue'}`, timestamp: new Date().toISOString() }]);
    } finally {
      sendingRef.current = false;
      controllerRef.current = null;
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessageStream();
    }
  }

  function saveCurrentConvo() {
    if (messages.length === 0 || !selectedAgent) return;
    const id = currentConvoId ?? Date.now().toString();
    const firstUserMsg = messages.find(m => m.role === 'user');
    const title = firstUserMsg ? firstUserMsg.content.substring(0, 60) + (firstUserMsg.content.length > 60 ? '...' : '') : 'Conversation';
    const entry: ConversationEntry = {
      id, agentId: selectedAgent.id, agentEmoji: selectedAgent.emoji,
      title, messages, date: new Date().toISOString(), totalTokens,
    };
    setHistory(prev => {
      const updated = [entry, ...prev.filter(h => h.id !== id)].slice(0, MAX_HISTORY);
      try { localStorage.setItem('sarah_chat_history', JSON.stringify(updated)); } catch { /* */ }
      return updated;
    });
    setCurrentConvoId(id);
  }

  function loadConversation(entry: ConversationEntry) {
    // Save current first
    saveCurrentConvo();
    setMessages(entry.messages);
    setTotalTokens(entry.totalTokens);
    setTotalCost(0);
    setCurrentConvoId(entry.id);
    setFollowUpQuestions([]);
    const agent = agents.find(a => a.id === entry.agentId);
    if (agent) setSelectedAgent(agent);
    setShowHistory(false);
  }

  function startNewChat() {
    saveCurrentConvo();
    setMessages([]);
    setTotalTokens(0);
    setTotalCost(0);
    setFollowUpQuestions([]);
    setCurrentConvoId(null);
    setShowHistory(false);
    setFaqSuggestion(false);
  }

  function clearHistory() {
    if (!confirm('Effacer tout l\'historique de conversation ?')) return;
    setHistory([]);
    try { localStorage.removeItem('sarah_chat_history'); } catch { /* */ }
  }

  function copyMessage(content: string, idx: number) {
    navigator.clipboard.writeText(content).then(() => {
      setCopiedIdx(idx);
      setTimeout(() => setCopiedIdx(null), 2000);
    }).catch(() => { /* fallback: noop */ });
  }

  // Auto-save conversation after each assistant response (debounced)
  useEffect(() => {
    if (messages.length > 0 && messages[messages.length - 1].role === 'assistant') {
      if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current);
      saveTimeoutRef.current = setTimeout(() => saveCurrentConvo(), 300);
    }
    return () => { if (saveTimeoutRef.current) clearTimeout(saveTimeoutRef.current); };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  if (!selectedAgent) return <div className="animate-pulse p-24 text-center text-muted">Chargement...</div>;

  return (
    <div className="chat-height flex flex-col">
      {/* Header */}
      <div className="flex flex-between items-center flex-wrap gap-8" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-primary)' }}>
        <div className="flex items-center gap-12" style={{ minWidth: 0 }}>
          <span style={{ fontSize: 28 }}>{selectedAgent.emoji}</span>
          <div style={{ minWidth: 0 }}>
            <div className="flex items-center flex-wrap gap-8">
              <span className="text-lg font-bold">{selectedAgent.name} — {selectedAgent.role}</span>
              {selectedAgent.isCustomized && (
                <span className="badge badge-accent">Personnalisé</span>
              )}
            </div>
            <div className="text-xs text-tertiary">
              Modèle: {selectedAgent.model} | Tokens: {totalTokens.toLocaleString()} | Coût: {(totalCost / 1_000_000).toFixed(4)} cr
            </div>
          </div>
        </div>
        <div className="flex gap-6">
          <button onClick={() => setShowHistory(!showHistory)} className="btn btn-ghost btn-sm text-sm">
            📚 Historique {history.length > 0 && `(${history.length})`}
          </button>
          {faqEntries.length > 0 && (
            <button onClick={() => setShowFaqPanel(!showFaqPanel)} className="btn btn-ghost btn-sm text-sm">
              💡 FAQ ({faqEntries.filter(e => e.agentId === selectedAgent?.id).length})
            </button>
          )}
          <Link href="/client/agents/customize" className="btn btn-ghost btn-sm text-sm">
            🎨 Personnaliser
          </Link>
          <button onClick={startNewChat} className="btn btn-ghost btn-sm">
            + Nouveau chat
          </button>
        </div>
      </div>

      {/* Agent Selector */}
      {/* History Panel */}
      {showHistory && (
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-primary)', maxHeight: 300, overflowY: 'auto' }}>
          <div className="flex flex-between items-center mb-8">
            <span className="text-md font-bold">Conversations récentes</span>
            {history.length > 0 && (
              <button onClick={clearHistory} className="btn btn-ghost btn-sm text-xs text-danger">
                Effacer tout
              </button>
            )}
          </div>
          {history.length === 0 ? (
            <div className="text-sm text-muted" style={{ padding: '8px 0' }}>Aucune conversation sauvegardée</div>
          ) : (
            <div className="flex flex-col gap-4">
              {history.map(h => (
                <button
                  key={h.id}
                  onClick={() => loadConversation(h)}
                  className="flex items-center gap-8 rounded-sm border pointer w-full"
                  style={{
                    padding: '8px 12px',
                    background: h.id === currentConvoId ? 'var(--accent-muted)' : 'var(--bg-primary)',
                    textAlign: 'left', fontFamily: 'var(--font-sans)',
                  }}
                >
                  <span className="text-lg">{h.agentEmoji}</span>
                  <div className="flex-1" style={{ minWidth: 0 }}>
                    <div className="text-sm font-semibold truncate">{h.title}</div>
                    <div className="text-xs text-muted">
                      {h.messages.length} msg • {new Date(h.date).toLocaleDateString('fr-FR')}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </div>
      )}

      {/* FAQ Panel */}
      {showFaqPanel && selectedAgent && (
        <div style={{ padding: '12px 0', borderBottom: '1px solid var(--border-primary)', maxHeight: 300, overflowY: 'auto' }}>
          <div className="flex flex-between items-center mb-8">
            <span className="text-md font-bold">💡 Réponses FAQ de {selectedAgent.name}</span>
            <span className="text-xs text-muted">
              Les FAQ sont gratuites (0 token) et s&apos;ameliorent avec l&apos;usage
            </span>
          </div>
          {faqEntries.filter(e => e.agentId === selectedAgent.id).length === 0 ? (
            <div className="text-sm text-muted" style={{ padding: '8px 0' }}>
              Aucune FAQ pour cet agent. Cliquez &laquo; 💾 FAQ &raquo; sur une réponse pour la sauvegarder.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {faqEntries.filter(e => e.agentId === selectedAgent.id).map(entry => (
                <div key={entry.id} className="rounded-sm border" style={{ padding: '8px 12px' }}>
                  <div className="flex flex-between items-center">
                    <div className="text-sm font-semibold">
                      Q: {entry.question.substring(0, 80)}{entry.question.length > 80 ? '...' : ''}
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-xs text-success">Utilisée {entry.usedCount}x</span>
                      <button
                        onClick={() => deleteFaqEntry(entry.id)}
                        className="text-xs text-danger pointer"
                        style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)' }}
                      >
                        ✕
                      </button>
                    </div>
                  </div>
                  <div className="text-xs text-muted truncate mt-4">
                    R: {entry.answer.substring(0, 120)}...
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Agent Selector */}
      <div className="flex gap-6" style={{ padding: '12px 0', borderBottom: '1px solid var(--border-primary)', overflowX: 'auto' }}>
        {agents.map(agent => (
          <button
            key={agent.id}
            onClick={() => setSelectedAgent(agent)}
            className={selectedAgent.id === agent.id ? 'btn btn-primary btn-sm' : 'btn btn-ghost btn-sm'}
            title={agent.role}
            style={{
              borderColor: selectedAgent.id === agent.id ? agent.color : undefined,
              background: selectedAgent.id === agent.id ? agent.color + '22' : undefined,
              color: selectedAgent.id === agent.id ? agent.color : undefined,
              whiteSpace: 'nowrap',
            }}
          >
            {agent.emoji} {agent.role}
            {agent.isCustomized && <span style={{ fontSize: 8, marginLeft: 4 }}>✨</span>}
          </button>
        ))}
      </div>

      {/* Messages */}
      <div className="flex-1" style={{ overflowY: 'auto', padding: '16px 0' }}>
        {messages.length === 0 && (
          <div className="text-center text-tertiary" style={{ padding: '60px 20px' }}>
            <div className="mb-16" style={{ fontSize: 48 }}>{selectedAgent.emoji}</div>
            <div className="text-xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>
              Bonjour, je suis {selectedAgent.name}
            </div>
            <div className="text-base max-w-md" style={{ margin: '0 auto', lineHeight: 1.6 }}>
              Votre {selectedAgent.role}. Posez-moi vos questions, demandez-moi de rédiger, analyser, planifier...
              Je suis la pour vous aider.
            </div>
            {/* Agent Modes */}
            {(() => {
              const agentDef = DEFAULT_AGENTS.find(a => a.id === selectedAgent.id);
              if (!agentDef?.modes?.length) return null;
              return (
                <div className="flex gap-8 flex-center flex-wrap mt-16">
                  {agentDef.modes.map(mode => (
                    <div key={mode.id} className="rounded-md bg-secondary border text-sm" style={{ padding: '10px 14px', maxWidth: 200, textAlign: 'left' }}>
                      <div className="font-bold" style={{ marginBottom: 2 }}>{mode.icon} {mode.name}</div>
                      <div className="text-xs text-muted">{mode.description}</div>
                    </div>
                  ))}
                </div>
              );
            })()}

            <div className="flex gap-8 flex-center flex-wrap mt-24">
              {(selectedAgent.id === 'sarah-repondeur' ? [
                'Configure mon message d\'accueil',
                'Comment gerer les appels manques ?',
                'Cree une FAQ pour mes clients',
                'Quels horaires d\'ouverture recommandes-tu ?',
              ] : selectedAgent.id === 'sarah-assistante' ? [
                'Rédige un email professionnel',
                'Organise mon planning de la semaine',
                'Prepare un compte-rendu de reunion',
                'Conseille-moi sur ma productivite',
              ] : selectedAgent.id === 'sarah-commercial' ? [
                'Rédige un email de prospection',
                'Comment améliorer mon taux de closing ?',
                'Structure mon pipeline commercial',
                'Prepare mon pitch de vente',
              ] : selectedAgent.id === 'sarah-marketing' ? [
                'Fais-moi un plan marketing',
                'Cree un post LinkedIn',
                'Analyse ma strategie SEO',
                'Comment booster ma visibilite ?',
              ] : selectedAgent.id === 'sarah-rh' ? [
                'Rédige une fiche de poste',
                'Prepare mes questions d\'entretien',
                'Cree un plan de formation',
                'Comment améliorer ma marque employeur ?',
              ] : selectedAgent.id === 'sarah-communication' ? [
                'Rédige un communiqué de presse',
                'Prepare ma communication interne',
                'Comment gerer une crise mediatique ?',
                'Cree une newsletter',
              ] : selectedAgent.id === 'sarah-finance' ? [
                'Analyse mes dépenses du mois',
                'Prepare un prévisionnel',
                'Comment optimiser ma trésorerie ?',
                'Quels KPIs financiers suivre ?',
              ] : selectedAgent.id === 'sarah-dev' ? [
                'Review mon architecture technique',
                'Conseille-moi sur le choix de stack',
                'Comment améliorer mes performances ?',
                'Planifie ma roadmap technique',
              ] : selectedAgent.id === 'sarah-juridique' ? [
                'Revois mon contrat commercial',
                'Suis-je conforme au RGPD ?',
                'Rédige mes CGV',
                'Quels risques juridiques anticiper ?',
              ] : selectedAgent.id === 'sarah-dg' ? [
                'Quelle strategie pour ce trimestre ?',
                'Analyse mon positionnement marche',
                'Comment structurer ma croissance ?',
                'Conseille-moi sur la levee de fonds',
              ] : [
                'Pose-moi ta question',
                'Comment puis-je t\'aider ?',
                'De quoi as-tu besoin ?',
                'Décris-moi ton problème',
              ]).map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="btn btn-secondary btn-sm">
                  {q}
                </button>
              ))}
            </div>
          </div>
        )}

        {messages.map((msg, i) => (
          <div key={i} className="flex mb-12" style={{
            justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
            padding: '0 4px',
          }}>
            <div style={{
              maxWidth: '75%',
              padding: '12px 16px',
              borderRadius: msg.role === 'user' ? '16px 16px 4px 16px' : '16px 16px 16px 4px',
              background: msg.role === 'user' ? 'var(--accent)' : msg.role === 'system' ? 'var(--danger-muted)' : 'var(--bg-secondary)',
              border: msg.role === 'assistant' ? '1px solid var(--border-primary)' : 'none',
              color: msg.role === 'user' ? 'white' : msg.role === 'system' ? 'var(--danger)' : 'var(--text-primary)',
            }}>
              <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>{msg.content}</div>
              <div className="flex flex-between items-center mt-4">
                {msg.tokens ? (
                  <div style={{ fontSize: 10, color: msg.role === 'user' ? 'rgba(255,255,255,0.6)' : 'var(--text-muted)' }}>
                    {msg.tokens} tokens | {((msg.cost ?? 0) / 1_000_000).toFixed(4)} cr
                  </div>
                ) : <div />}
                {msg.role === 'assistant' && (
                  <div className="flex gap-4 items-center">
                    <AudioPlayback text={msg.content} gender={selectedAgent?.gender ?? 'F'} size="sm" />
                    {msg.isFaq && (
                      <span style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4,
                        background: '#22c55e15', color: '#22c55e', fontWeight: 600,
                      }}>
                        FAQ — 0 token
                      </span>
                    )}
                    <button
                      onClick={() => copyMessage(msg.content, i)}
                      style={{
                        fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                        background: 'none', border: '1px solid var(--border-primary)',
                        color: copiedIdx === i ? 'var(--success)' : 'var(--text-muted)',
                        fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                      }}
                      title="Copier"
                    >
                      {copiedIdx === i ? '✓ Copié' : '📋 Copier'}
                    </button>
                    {!msg.isFaq && i > 0 && messages[i - 1]?.role === 'user' && (
                      <button
                        onClick={() => saveAsFaq(i - 1, i)}
                        style={{
                          fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer',
                          background: 'none', border: '1px solid var(--border-primary)',
                          color: savedFaqIdx === i ? '#22c55e' : 'var(--text-muted)',
                          fontFamily: 'var(--font-sans)', transition: 'all 0.15s',
                        }}
                        title="Sauvegarder en FAQ"
                      >
                        {savedFaqIdx === i ? '✓ FAQ sauvée' : '💾 FAQ'}
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}

        {loading && !(messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content) && (
          <div className="flex mb-12" style={{ justifyContent: 'flex-start', padding: '0 4px' }}>
            <div className="bg-secondary border" style={{ padding: '12px 16px', borderRadius: '16px 16px 16px 4px' }}>
              <div className="animate-pulse text-tertiary">
                {selectedAgent.name} réfléchit...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && !loading && (
        <div className="flex gap-6 flex-wrap" style={{ padding: '8px 0', overflowX: 'auto' }}>
          {followUpQuestions.map((q, i) => (
            <button
              key={i}
              onClick={() => { setInput(q); inputRef.current?.focus(); }}
              className="btn btn-secondary btn-sm"
              style={{ fontSize: 12, whiteSpace: 'normal', textAlign: 'left', maxWidth: 280 }}
            >
              {q}
            </button>
          ))}
        </div>
      )}

      {/* Auto-FAQ suggestion banner */}
      {faqSuggestion && !loading && messages.length >= 2 && (
        <div className="flex flex-between items-center flex-wrap gap-6 rounded-sm mb-4" style={{
          padding: '8px 12px', background: 'var(--info)11', border: '1px solid var(--info)33',
        }}>
          <span className="text-sm font-medium" style={{ color: 'var(--info)' }}>
            💡 Vous posez souvent des questions similaires. Sauvegardez en FAQ pour y acceder gratuitement !
          </span>
          <div className="flex gap-6">
            <button
              onClick={() => {
                const lastAssistantIdx = messages.length - 1;
                const lastUserIdx = messages.length - 2;
                if (messages[lastAssistantIdx]?.role === 'assistant' && messages[lastUserIdx]?.role === 'user') {
                  saveAsFaq(lastUserIdx, lastAssistantIdx);
                }
                setFaqSuggestion(false);
              }}
              className="btn btn-sm"
              style={{ fontSize: 11, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}
            >
              Sauvegarder en FAQ
            </button>
            <button onClick={() => setFaqSuggestion(false)} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
              Ignorer
            </button>
          </div>
        </div>
      )}

      {/* FAQ match hint */}
      {faqMatch && !loading && (
        <div className="flex flex-between items-center flex-wrap gap-6 rounded-sm" style={{
          padding: '8px 12px', background: '#22c55e10', border: '1px solid #22c55e33',
        }}>
          <span className="text-sm font-semibold text-success">
            💡 Réponse FAQ trouvée — gratuit, 0 token
          </span>
          <div className="flex gap-6">
            <button
              onClick={() => useFaqAnswer(faqMatch)}
              className="btn btn-sm"
              style={{ fontSize: 11, background: '#22c55e', color: 'white', borderColor: '#22c55e' }}
            >
              Utiliser la réponse FAQ
            </button>
            <button
              onClick={() => setFaqMatch(null)}
              className="btn btn-ghost btn-sm"
              style={{ fontSize: 11 }}
            >
              Demander a l&apos;IA
            </button>
          </div>
        </div>
      )}

      {/* Input */}
      <div style={{ padding: '12px 0', borderTop: '1px solid var(--border-primary)' }}>
        <div className="flex gap-8" style={{ alignItems: 'flex-end' }}>
          <textarea
            ref={inputRef}
            value={input}
            onChange={e => onInputChange(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={`Écrivez à ${selectedAgent?.name ?? 'Sarah'} (${selectedAgent?.role ?? 'Agent'})...`}
            className="input"
            rows={2}
            style={{ resize: 'none', flex: 1 }}
          />
          <VoiceInput
            onTranscript={(t) => setInput(prev => prev ? prev + ' ' + t : t)}
            disabled={loading}
            size="md"
          />
          <button
            onClick={sendMessageStream}
            disabled={loading || !input.trim()}
            className="btn btn-primary"
            style={{ height: 52, padding: '0 24px' }}
          >
            {loading ? '...' : 'Envoyer'}
          </button>
        </div>
        <div className="text-xs text-muted mt-4">
          Entrée pour envoyer | Shift+Entrée pour un saut de ligne | Modèle: {selectedAgent.model}
        </div>
      </div>

      {/* WhatsApp info bar */}
      <div className="flex items-center gap-8 text-xs text-muted" style={{
        padding: '6px 12px', borderTop: '1px solid var(--border-primary)',
      }}>
        <span>📱</span>
        <span>Vous pouvez aussi parler a {selectedAgent.name} via WhatsApp</span>
        <a href="/client/account" style={{ color: 'var(--accent)', textDecoration: 'none', fontWeight: 600 }}>Configurer</a>
      </div>
    </div>
  );
}
