'use client';

import { useState, useRef, useEffect } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import Link from 'next/link';
import { recordEvent } from '../../../lib/gamification';
import { DEFAULT_AGENTS, ALL_AGENTS, loadAgentConfigs, getEffectiveAgent, type ResolvedAgent } from '../../../lib/agent-config';
import { recordAgentInteraction, recordFeedback, getBond, LEVEL_NAMES, LEVEL_ICONS } from '../../../lib/agent-bonding';
import { parseActionProposals, ACTION_TYPE_ICONS, ACTION_TYPE_LABELS, PRIORITY_LABELS, PRIORITY_COLORS, formatDueDate, type ParsedActionProposal } from '../../../lib/action-parser';

type CommMode = 'chat' | 'visio' | 'whatsapp' | 'repondeur';
const COMM_TABS: { id: CommMode; label: string; icon: string }[] = [
  { id: 'chat', label: 'Chat texte', icon: 'chat' },
  { id: 'visio', label: 'Appel vocal', icon: 'mic' },
  { id: 'whatsapp', label: 'WhatsApp', icon: 'phone_iphone' },
  { id: 'repondeur', label: 'Répondeur IA', icon: 'call' },
];
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
const FAQ_STORAGE_KEY = 'fz_faq';
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
const FREQ_STORAGE_KEY = 'fz_question_freq';

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
  const { data: history, setData: setHistory } = useUserData<ConversationEntry[]>('chat_history', [], 'fz_chat_history');
  const [showHistory, setShowHistory] = useState(false);
  const [currentConvoId, setCurrentConvoId] = useState<string | null>(null);
  const [copiedIdx, setCopiedIdx] = useState<number | null>(null);
  const { data: faqEntries, setData: setFaqEntries } = useUserData<FaqEntry[]>('chat_faq', [], 'fz_faq');
  const [faqMatch, setFaqMatch] = useState<FaqEntry | null>(null);
  const [showFaqPanel, setShowFaqPanel] = useState(false);
  const [savedFaqIdx, setSavedFaqIdx] = useState<number | null>(null);
  const [faqSuggestion, setFaqSuggestion] = useState(false);
  const [commMode, setCommMode] = useState<CommMode>('chat');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const sendingRef = useRef(false);
  const saveTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchActive, setSearchActive] = useState(false);
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [feedbackGiven, setFeedbackGiven] = useState<Record<number, 'positive' | 'negative'>>({});
  const [assistantMsgCount, setAssistantMsgCount] = useState(0);
  const [actionProposals, setActionProposals] = useState<ParsedActionProposal[]>([]);
  const [acceptedActions, setAcceptedActions] = useState<Set<number>>(new Set());
  const [actionSaving, setActionSaving] = useState(false);

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
    // History + FAQ loaded by useUserData hooks
    return () => { controllerRef.current?.abort(); };
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  function getSession() {
    try {
      return JSON.parse(localStorage.getItem('fz_session') ?? '{}');
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
    // saveFaq removed — useUserData hook handles persistence
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
    // saveFaq removed — useUserData hook handles persistence
    setSavedFaqIdx(answerIdx);
    setTimeout(() => setSavedFaqIdx(null), 2000);
  }

  // Delete a FAQ entry
  function deleteFaqEntry(id: string) {
    const updated = faqEntries.filter(e => e.id !== id);
    setFaqEntries(updated);
    // saveFaq removed — useUserData hook handles persistence
  }

  async function sendMessage() {
    if (!input.trim() || loading || !selectedAgent) return;
    const session = getSession();
    if (!session.token) { window.location.href = '/login'; return; }

    const userMsg: Message = { role: 'user', content: input.trim(), timestamp: new Date().toISOString() };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setFollowUpQuestions([]);
    setFaqMatch(null);
    setLoading(true);

    try {
      // Build API messages with truncation: system prompt + last N messages
      const conversationMsgs = newMessages
        .filter(m => m.role === 'user' || m.role === 'assistant')
        .map(m => ({ role: m.role as 'user' | 'assistant', content: m.content }));

      // Truncate: keep only last MAX_CONTEXT_MESSAGES
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

      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: selectedAgent.model,
          messages: apiMessages,
          maxTokens: 4096,
          agentName: selectedAgent.id,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        const errorMsg = data.error ?? data.message ?? `Erreur ${res.status}`;
        setMessages(prev => [...prev, {
          role: 'system',
          content: res.status === 402 || data.code === 'INSUFFICIENT_BALANCE'
            ? `Credits epuises. [Rechargez votre compte](/client/account) pour continuer.`
            : `Erreur: ${errorMsg}`,
          timestamp: new Date().toISOString(),
        }]);
      } else {
        const tokens = Number(data.totalTokens ?? 0);
        const cost = Number(data.billedCredits ?? 0);
        setTotalTokens(t => t + tokens);
        setTotalCost(c => c + cost);
        const rawContent = data.content ?? data.text ?? 'Pas de réponse';
        const { cleanContent: contentNoActions, proposals } = parseActionProposals(rawContent);
        const { cleanContent, questions } = parseFollowUps(contentNoActions);
        setFollowUpQuestions(questions);
        setActionProposals(proposals);
        setAcceptedActions(new Set());
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: cleanContent,
          tokens,
          cost,
          timestamp: new Date().toISOString(),
        }]);
        // Track gamification
        const result = recordEvent({ type: 'message', tokens, cost });
        if (result.leveledUp) {
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Niveau ${result.state.level} atteint! Bravo, continuez comme ca!`,
            timestamp: new Date().toISOString(),
          }]);
        }
        if (result.newAchievements.length > 0) {
          setMessages(prev => [...prev, {
            role: 'system',
            content: `Nouveau succès débloqué : ${result.newAchievements.join(', ')}! +50 XP`,
            timestamp: new Date().toISOString(),
          }]);
        }
        // Agent bonding
        if (selectedAgent) {
          const bondResult = recordAgentInteraction(selectedAgent.id);
          if (bondResult.leveledUp) {
            recordEvent({ type: 'agent_bond_levelup' });
            setMessages(prev => [...prev, {
              role: 'system',
              content: `${LEVEL_ICONS[bondResult.bond.relationshipLevel]} Votre relation avec ${selectedAgent.name} a évolué : ${LEVEL_NAMES[bondResult.bond.relationshipLevel]}!`,
              timestamp: new Date().toISOString(),
            }]);
          }
          setAssistantMsgCount(c => c + 1);
        }
        // Check if question asked 3+ times -> suggest FAQ
        if (selectedAgent && trackQuestion(userMsg.content, faqEntries, selectedAgent.id)) {
          setFaqSuggestion(true);
        }
      }
    } catch (e) {
      setMessages(prev => [...prev, {
        role: 'system',
        content: `Erreur de connexion: ${e instanceof Error ? e.message : 'inconnue'}`,
        timestamp: new Date().toISOString(),
      }]);
    } finally {
      setLoading(false);
      inputRef.current?.focus();
    }
  }

  // ─── SSE Streaming version of sendMessage ───
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
          content: res.status === 402 ? 'Credits epuises. [Rechargez votre compte](/client/account) pour continuer.' : `Erreur: ${errorMsg}`,
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

      // Finalize: parse actions
      const { cleanContent: contentNoActions, proposals } = parseActionProposals(streamedContent);
      const { cleanContent, questions } = parseFollowUps(contentNoActions);
      setFollowUpQuestions(questions);
      setActionProposals(proposals);
      setAcceptedActions(new Set());
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
        setMessages(prev => [...prev, { role: 'system', content: `Niveau ${result.state.level} atteint! Bravo, continuez comme ca!`, timestamp: new Date().toISOString() }]);
      }
      if (result.newAchievements.length > 0) {
        setMessages(prev => [...prev, { role: 'system', content: `Nouveau succès débloqué : ${result.newAchievements.join(', ')}! +50 XP`, timestamp: new Date().toISOString() }]);
      }
      // Agent bonding
      if (selectedAgent) {
        const bondResult = recordAgentInteraction(selectedAgent.id);
        if (bondResult.leveledUp) {
          recordEvent({ type: 'agent_bond_levelup' });
          setMessages(prev => [...prev, {
            role: 'system',
            content: `${LEVEL_ICONS[bondResult.bond.relationshipLevel]} Votre relation avec ${selectedAgent.name} a évolué : ${LEVEL_NAMES[bondResult.bond.relationshipLevel]}!`,
            timestamp: new Date().toISOString(),
          }]);
        }
        setAssistantMsgCount(c => c + 1);
      }
      // Check auto-FAQ suggestion
      if (selectedAgent && trackQuestion(userContent, faqEntries, selectedAgent.id)) {
        setFaqSuggestion(true);
      }
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') {
        // Stream was intentionally aborted (timeout or user action)
      } else {
        setMessages(prev => [...prev, { role: 'system', content: `Erreur de connexion: ${e instanceof Error ? e.message : 'inconnue'}`, timestamp: new Date().toISOString() }]);
      }
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
    setHistory(prev => [entry, ...prev.filter(h => h.id !== id)].slice(0, MAX_HISTORY));
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
    setHistory([]);
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

  function highlightText(text: string, query: string): React.ReactNode {
    if (!query.trim() || !searchActive) return text;
    const escaped = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const parts = text.split(new RegExp(`(${escaped})`, 'gi'));
    return parts.map((part, i) =>
      part.toLowerCase() === query.toLowerCase()
        ? <mark key={i} style={{ background: '#fef08a', color: '#000', borderRadius: 2 }}>{part}</mark>
        : part
    );
  }

  function exportConversation() {
    if (!selectedAgent || messages.length === 0) return;
    const lines: string[] = [
      `# Conversation avec ${selectedAgent.name} (${selectedAgent.role})`,
      `Date : ${new Date().toLocaleDateString('fr-FR', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}`,
      '',
    ];
    for (const msg of messages) {
      if (msg.role === 'system') continue;
      const speaker = msg.role === 'user' ? 'Vous' : selectedAgent.name;
      lines.push(`**${speaker}** : ${msg.content}`);
      if (msg.tokens) {
        lines.push(`*${msg.tokens} tokens — ${((msg.cost ?? 0) / 1_000_000).toFixed(4)} crédits*`);
      }
      lines.push('');
    }
    lines.push('---');
    lines.push(`*Total : ${totalTokens.toLocaleString()} tokens — ${(totalCost / 1_000_000).toFixed(4)} crédits*`);
    const blob = new Blob([lines.join('\n')], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `conversation-${selectedAgent.id}-${new Date().toISOString().split('T')[0]}.md`;
    a.click();
    URL.revokeObjectURL(url);
  }

  // ─── Agent bottom sheet state ───
  const [showAgentSheet, setShowAgentSheet] = useState(false);
  const [showActionsMenu, setShowActionsMenu] = useState(false);
  const [textareaHeight, setTextareaHeight] = useState('auto');

  // Auto-resize textarea
  function handleTextareaInput(e: React.ChangeEvent<HTMLTextAreaElement>) {
    onInputChange(e.target.value);
    e.target.style.height = 'auto';
    const newHeight = Math.min(e.target.scrollHeight, 200);
    e.target.style.height = newHeight + 'px';
    setTextareaHeight(newHeight + 'px');
  }

  // Reset textarea height after send
  function resetTextareaHeight() {
    setTextareaHeight('auto');
    if (inputRef.current) {
      inputRef.current.style.height = 'auto';
    }
  }

  // Keyboard detection
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    function onResize() {
      const keyboardOpen = window.innerHeight - (vv?.height ?? window.innerHeight) > 150;
      document.documentElement.classList.toggle('keyboard-open', keyboardOpen);
    }
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  if (!selectedAgent) return <div className="animate-pulse p-24 text-center text-muted">Chargement...</div>;

  return (
    <div className="chat-page">
      {/* ═══ COMPACT HEADER ═══ */}
      <div className="chat-header-compact">
        {/* Agent info — clickable to open agent selector */}
        <div className="chat-header-agent" onClick={() => setShowAgentSheet(true)}>
          <div className="chat-header-agent-avatar" style={{ background: selectedAgent.color + '22' }}>
            {selectedAgent.emoji}
          </div>
          <div style={{ minWidth: 0, flex: 1 }}>
            <div className="chat-header-agent-name">
              {selectedAgent.name}
              {selectedAgent.isCustomized && <span className="material-symbols-rounded" style={{ fontSize: 9, marginLeft: 4, color: 'var(--accent)' }}>auto_awesome</span>}
            </div>
            <div className="chat-header-agent-status">
              {selectedAgent.role} · {totalTokens.toLocaleString()} tokens
              {(() => {
                const bond = getBond(selectedAgent.id);
                return bond.relationshipLevel > 1 ? ` · ${LEVEL_ICONS[bond.relationshipLevel]} ${LEVEL_NAMES[bond.relationshipLevel]}` : '';
              })()}
            </div>
          </div>
          <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>&#9662;</span>
        </div>

        {/* Actions menu */}
        <div className="chat-header-actions" style={{ position: 'relative' }}>
          <button onClick={startNewChat} className="chat-header-action-btn" title="Nouvelle conversation">+</button>
          <button
            onClick={() => setShowActionsMenu(v => !v)}
            className="chat-header-action-btn"
            title="Plus d'options"
          >
            &#8943;
          </button>
          {showActionsMenu && (
            <div style={{
              position: 'absolute', top: '100%', right: 0, marginTop: 4, zIndex: 20,
              background: 'var(--bg-primary)', border: '1px solid var(--border-primary)',
              borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)',
              minWidth: 180, padding: 4,
            }}>
              <button onClick={() => { setSearchActive(s => !s); setSearchQuery(''); setShowActionsMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', borderRadius: 6, fontFamily: 'inherit' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>search</span> Rechercher
              </button>
              {messages.length > 0 && (
                <button onClick={() => { exportConversation(); setShowActionsMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', borderRadius: 6, fontFamily: 'inherit' }}>
                  ↓ Exporter
                </button>
              )}
              <button onClick={() => { setShowHistory(!showHistory); setShowActionsMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', borderRadius: 6, fontFamily: 'inherit' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>library_books</span> Historique {history.length > 0 && `(${history.length})`}
              </button>
              {faqEntries.length > 0 && (
                <button onClick={() => { setShowFaqPanel(!showFaqPanel); setShowActionsMenu(false); }}
                  style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', borderRadius: 6, fontFamily: 'inherit' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 14 }}>lightbulb</span> FAQ ({faqEntries.filter(e => e.agentId === selectedAgent?.id).length})
                </button>
              )}
              <button onClick={() => { setShowActionsMenu(false); }}
                style={{ display: 'flex', alignItems: 'center', gap: 8, width: '100%', padding: '8px 12px', border: 'none', background: 'none', cursor: 'pointer', fontSize: 13, color: 'var(--text-primary)', borderRadius: 6, fontFamily: 'inherit' }}>
                <Link href="/client/agents/customize" style={{ color: 'inherit', textDecoration: 'none' }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>palette</span> Personnaliser</Link>
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Close actions menu on click outside */}
      {showActionsMenu && <div onClick={() => setShowActionsMenu(false)} style={{ position: 'fixed', inset: 0, zIndex: 15 }} />}

      {/* ═══ SEARCH BAR ═══ */}
      {searchActive && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 16px', background: 'var(--bg-secondary)', borderBottom: '1px solid var(--border-primary)' }}>
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>search</span>
          <input
            autoFocus
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            onKeyDown={e => e.key === 'Escape' && (setSearchActive(false), setSearchQuery(''))}
            placeholder="Rechercher dans la conversation..."
            style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 14, color: 'var(--text-primary)', fontFamily: 'inherit' }}
          />
          {searchQuery && (
            <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>
              {messages.filter(m => m.content.toLowerCase().includes(searchQuery.toLowerCase())).length} résultat(s)
            </span>
          )}
          <button onClick={() => { setSearchActive(false); setSearchQuery(''); }} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span></button>
        </div>
      )}

      {/* ═══ HISTORY PANEL ═══ */}
      {showHistory && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', maxHeight: 280, overflowY: 'auto', background: 'var(--bg-secondary)' }}>
          <div className="flex flex-between items-center mb-8">
            <span className="text-md font-bold">Conversations récentes</span>
            <div className="flex gap-4">
              {history.length > 0 && (
                <button onClick={clearHistory} className="btn btn-ghost btn-sm text-xs text-danger">Effacer tout</button>
              )}
              <button onClick={() => setShowHistory(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span></button>
            </div>
          </div>
          {history.length > 0 && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 8, padding: '5px 8px', background: 'var(--bg-primary)', borderRadius: 6, border: '1px solid var(--border-primary)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 13 }}>search</span>
              <input
                value={historySearchQuery}
                onChange={e => setHistorySearchQuery(e.target.value)}
                placeholder="Rechercher dans l'historique..."
                style={{ flex: 1, background: 'none', border: 'none', outline: 'none', fontSize: 12, color: 'var(--text-primary)', fontFamily: 'inherit' }}
              />
              {historySearchQuery && <button onClick={() => setHistorySearchQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 13 }}><span className="material-symbols-rounded" style={{ fontSize: 13 }}>close</span></button>}
            </div>
          )}
          {history.length === 0 ? (
            <div className="text-sm text-muted" style={{ padding: '8px 0' }}>Aucune conversation sauvegardée</div>
          ) : (
            <div className="flex flex-col gap-4">
              {history
                .filter(h => !historySearchQuery.trim() || h.title.toLowerCase().includes(historySearchQuery.toLowerCase()) || h.messages.some(m => m.content.toLowerCase().includes(historySearchQuery.toLowerCase())))
                .map(h => {
                const matchMsg = historySearchQuery.trim()
                  ? h.messages.find(m => m.content.toLowerCase().includes(historySearchQuery.toLowerCase()))
                  : null;
                return (
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
                      {h.messages.length} msg · {new Date(h.date).toLocaleDateString('fr-FR')}
                    </div>
                    {matchMsg && (
                      <div className="text-xs" style={{ color: 'var(--accent)', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        ...{matchMsg.content.substring(Math.max(0, matchMsg.content.toLowerCase().indexOf(historySearchQuery.toLowerCase()) - 20), Math.min(matchMsg.content.length, matchMsg.content.toLowerCase().indexOf(historySearchQuery.toLowerCase()) + 60))}...
                      </div>
                    )}
                  </div>
                </button>
              );
              })}
            </div>
          )}
        </div>
      )}

      {/* ═══ FAQ PANEL ═══ */}
      {showFaqPanel && selectedAgent && (
        <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)', maxHeight: 250, overflowY: 'auto', background: 'var(--bg-secondary)' }}>
          <div className="flex flex-between items-center mb-8">
            <span className="text-md font-bold"><span className="material-symbols-rounded" style={{ fontSize: 14 }}>lightbulb</span> FAQ de {selectedAgent.name}</span>
            <button onClick={() => setShowFaqPanel(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', fontSize: 16 }}><span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span></button>
          </div>
          <div className="text-xs text-muted mb-8">Réponses gratuites (0 token)</div>
          {faqEntries.filter(e => e.agentId === selectedAgent.id).length === 0 ? (
            <div className="text-sm text-muted" style={{ padding: '8px 0' }}>
              Aucune FAQ pour cet agent. Cliquez &laquo; FAQ &raquo; sur une réponse pour la sauvegarder.
            </div>
          ) : (
            <div className="flex flex-col gap-4">
              {faqEntries.filter(e => e.agentId === selectedAgent.id).map(entry => (
                <div key={entry.id} className="rounded-sm border" style={{ padding: '8px 12px', background: 'var(--bg-primary)' }}>
                  <div className="flex flex-between items-center">
                    <div className="text-sm font-semibold" style={{ flex: 1, minWidth: 0 }}>
                      Q: {entry.question.substring(0, 80)}{entry.question.length > 80 ? '...' : ''}
                    </div>
                    <div className="flex gap-4 items-center">
                      <span className="text-xs text-success">Utilisée {entry.usedCount}x</span>
                      <button onClick={() => deleteFaqEntry(entry.id)} className="text-xs text-danger pointer"
                        style={{ background: 'none', border: 'none', fontFamily: 'var(--font-sans)' }}><span className="material-symbols-rounded" style={{ fontSize: 12 }}>close</span></button>
                    </div>
                  </div>
                  <div className="text-xs text-muted truncate mt-4">R: {entry.answer.substring(0, 120)}...</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ═══ VISIO TAB ═══ */}
      {commMode === 'visio' && (
        <div className="flex-1" style={{ overflowY: 'auto', padding: '24px 16px' }}>
          <div style={{ marginBottom: 20 }}>
            <h2 className="text-lg font-bold" style={{ marginBottom: 6 }}>Appel vocal avec vos <span className="fz-logo-word">agents</span></h2>
            <p className="text-sm text-secondary" style={{ lineHeight: 1.6 }}>
              Parlez en temps réel avec vos agents IA. Micro + synthèse vocale <span className="fz-logo-word">ElevenLabs</span>.
            </p>
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6, marginTop: 10,
              padding: '5px 10px', borderRadius: 8, background: 'var(--warning-muted)', border: '1px solid var(--warning)',
              fontSize: 11, color: 'var(--warning)',
            }}>
              Consomme ~3x plus de crédits (STT + LLM + TTS)
            </div>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 14 }}>
            {ALL_AGENTS.map(agent => (
              <Link key={agent.id} href={`/client/visio/${agent.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                <div className="card card-lift" style={{ padding: 16, textAlign: 'center' }}>
                  <div style={{
                    width: 52, height: 52, borderRadius: '50%', margin: '0 auto 10px',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${agent.color}15`, border: `2px solid ${agent.color}40`, fontSize: 24,
                  }}>
                    {agent.emoji}
                  </div>
                  <div className="text-sm font-bold">{agent.name}</div>
                  <div className="text-xs text-muted" style={{ marginTop: 2 }}>{agent.role}</div>
                  <div className="text-xs font-semibold mt-8" style={{ color: agent.color, padding: '3px 8px', borderRadius: 6, background: `${agent.color}10`, display: 'inline-block' }}>
                    Appeler
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* ═══ WHATSAPP TAB ═══ */}
      {commMode === 'whatsapp' && (
        <div className="flex-1 flex flex-center" style={{ padding: '40px 20px' }}>
          <div className="card" style={{ padding: 32, maxWidth: 500, textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}><span className="material-symbols-rounded" style={{ fontSize: 48 }}>phone_iphone</span></div>
            <h2 className="text-xl font-bold mb-8">WhatsApp Business</h2>
            <p className="text-sm text-secondary mb-16" style={{ lineHeight: 1.6 }}>
              Discutez avec vos <span className="fz-logo-word">agents IA</span> directement depuis WhatsApp.
            </p>
            <div className="flex flex-col gap-8 mb-20" style={{ textAlign: 'left' }}>
              {['Messages texte et vocaux', 'Briefings quotidiens', 'Alertes en temps réel', 'Support multi-agents', 'Répondeur IA intégré'].map(f => (
                <div key={f} className="flex items-center gap-8 text-sm"><span className="material-symbols-rounded" style={{ fontSize: 14, color: '#22c55e' }}>check_circle</span> {f}</div>
              ))}
            </div>
            <Link href="/client/whatsapp" className="btn btn-primary">Configurer WhatsApp →</Link>
          </div>
        </div>
      )}

      {/* ═══ REPONDEUR TAB ═══ */}
      {commMode === 'repondeur' && (
        <div className="flex-1 flex flex-center" style={{ padding: '40px 20px' }}>
          <div className="card" style={{ padding: 32, maxWidth: 500, textAlign: 'center' }}>
            <div style={{ marginBottom: 16 }}><span className="material-symbols-rounded" style={{ fontSize: 48 }}>call</span></div>
            <h2 className="text-xl font-bold mb-8">Répondeur <span className="fz-logo-word">IA</span></h2>
            <p className="text-sm text-secondary mb-16" style={{ lineHeight: 1.6 }}>
              Votre standard téléphonique <span className="fz-logo-word">intelligent 24/7</span>.
            </p>
            <div className="flex flex-col gap-8 mb-20" style={{ textAlign: 'left' }}>
              {['7 modes de fonctionnement', '7 styles de réponse', '10 compétences IA', 'FAQ automatique', 'Détection VIP & anti-spam', 'Résumés horaires/quotidiens', 'Intégration Twilio complète'].map(f => (
                <div key={f} className="flex items-center gap-8 text-sm"><span className="material-symbols-rounded" style={{ fontSize: 14, color: '#22c55e' }}>check_circle</span> {f}</div>
              ))}
            </div>
            <Link href="/client/repondeur" className="btn btn-primary">Configurer le répondeur →</Link>
          </div>
        </div>
      )}

      {/* ═══ CHAT TAB ═══ */}
      {commMode === 'chat' && <>

      {/* Messages Area */}
      <div className="chat-messages-area">
        {messages.length === 0 && (
          <div className="text-center text-tertiary" style={{ padding: '40px 12px', flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center' }}>
            <div className="mb-16" style={{ fontSize: 48 }}>{selectedAgent.emoji}</div>
            <div className="text-xl font-semibold mb-8" style={{ color: 'var(--text-primary)' }}>
              Bonjour, je suis {selectedAgent.name}
            </div>
            <div className="text-base" style={{ maxWidth: 400, margin: '0 auto', lineHeight: 1.6, color: 'var(--text-secondary)' }}>
              Votre {selectedAgent.role}. Posez-moi vos questions, demandez-moi de rédiger, analyser, planifier...
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

            {/* Suggested questions */}
            <div className="flex gap-8 flex-center flex-wrap mt-24">
              {(selectedAgent.id === 'fz-repondeur' ? [
                'Configure mon message d\'accueil',
                'Comment gerer les appels manques ?',
                'Cree une FAQ pour mes clients',
                'Quels horaires d\'ouverture recommandes-tu ?',
              ] : selectedAgent.id === 'fz-assistante' ? [
                'Rédige un email professionnel',
                'Organise mon planning de la semaine',
                'Prepare un compte-rendu de reunion',
                'Conseille-moi sur ma productivite',
              ] : selectedAgent.id === 'fz-commercial' ? [
                'Rédige un email de prospection',
                'Comment améliorer mon taux de closing ?',
                'Structure mon pipeline commercial',
                'Prepare mon pitch de vente',
              ] : selectedAgent.id === 'fz-marketing' ? [
                'Fais-moi un plan marketing',
                'Cree un post LinkedIn',
                'Analyse ma strategie SEO',
                'Comment booster ma visibilite ?',
              ] : selectedAgent.id === 'fz-rh' ? [
                'Rédige une fiche de poste',
                'Prepare mes questions d\'entretien',
                'Cree un plan de formation',
                'Comment améliorer ma marque employeur ?',
              ] : selectedAgent.id === 'fz-communication' ? [
                'Rédige un communiqué de presse',
                'Prepare ma communication interne',
                'Comment gerer une crise mediatique ?',
                'Cree une newsletter',
              ] : selectedAgent.id === 'fz-finance' ? [
                'Analyse mes dépenses du mois',
                'Prepare un prévisionnel',
                'Comment optimiser ma trésorerie ?',
                'Quels KPIs financiers suivre ?',
              ] : selectedAgent.id === 'fz-dev' ? [
                'Review mon architecture technique',
                'Conseille-moi sur le choix de stack',
                'Comment améliorer mes performances ?',
                'Planifie ma roadmap technique',
              ] : selectedAgent.id === 'fz-juridique' ? [
                'Revois mon contrat commercial',
                'Suis-je conforme au RGPD ?',
                'Rédige mes CGV',
                'Quels risques juridiques anticiper ?',
              ] : selectedAgent.id === 'fz-dg' ? [
                'Quelle strategie pour ce trimestre ?',
                'Analyse mon positionnement marche',
                'Comment structurer ma croissance ?',
                'Conseille-moi sur la levee de fonds',
              ] : selectedAgent.id === 'fz-qualite' ? [
                'Lance un audit qualite interne',
                'Analyse cette non-conformite avec Ishikawa',
                'Prepare ma certification ISO 9001',
                'Cree un plan DMAIC pour ce probleme',
              ] : selectedAgent.id === 'fz-data' ? [
                'Analyse ce dataset et trouve des insights',
                'Concois un dashboard pour mes KPIs',
                'Quel modele ML pour ce probleme ?',
                'Aide-moi a structurer ma data governance',
              ] : selectedAgent.id === 'fz-product' ? [
                'Structure ma roadmap produit Q2',
                'Priorise mon backlog avec RICE',
                'Redige des user stories pour cette feature',
                'Lance un discovery sprint',
              ] : selectedAgent.id === 'fz-csm' ? [
                'Analyse le risque de churn de mes clients',
                'Structure mon onboarding client',
                'Prepare une QBR pour ce client',
                'Comment ameliorer mon NPS ?',
              ] : selectedAgent.id === 'fz-rse' ? [
                'Realise mon bilan carbone simplifie',
                'Prepare mon reporting CSRD',
                'Definis ma strategie RSE',
                'Quels ODD prioriser pour mon secteur ?',
              ] : selectedAgent.id === 'fz-operations' ? [
                'Optimise ce processus avec le Lean',
                'Cartographie ma supply chain',
                'Identifie les goulots d\'etranglement',
                'Planifie ce projet complexe',
              ] : selectedAgent.id === 'fz-design' ? [
                'Cree un brief creatif pour ce projet',
                'Audite l\'UX de mon application',
                'Structure mon design system',
                'Comment ameliorer l\'accessibilite ?',
              ] : selectedAgent.id === 'fz-formation' ? [
                'Concois un module de formation',
                'Elabore mon plan de formation annuel',
                'Evalue l\'impact de cette formation',
                'Cree un parcours d\'onboarding',
              ] : selectedAgent.id === 'fz-innovation' ? [
                'Anime un Design Sprint',
                'Genere des idees avec SCAMPER',
                'Evalue cette idee avec Impact/Effort',
                'Definis un MVP pour ce concept',
              ] : selectedAgent.id === 'fz-international' ? [
                'Analyse ce marche etranger (PESTEL)',
                'Quel mode d\'entree pour ce pays ?',
                'Adapte ma strategie a cette culture',
                'Aide-moi avec les Incoterms',
              ] : [
                'Pose-moi ta question',
                'Comment puis-je t\'aider ?',
                'De quoi as-tu besoin ?',
                'Décris-moi ton problème',
              ]).map(q => (
                <button key={q} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="chat-guided-option">
                  {q}
                </button>
              ))}
            </div>

            {/* Reunions multi-agents */}
            <div style={{ marginTop: 32, textAlign: 'left', maxWidth: 600, margin: '32px auto 0' }}>
              <div className="flex items-center gap-8 mb-8" style={{ justifyContent: 'center' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 20 }}>account_balance</span>
                <span className="text-base font-bold" style={{ color: 'var(--text-primary)' }}>Reunions multi-agents</span>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(170px, 1fr))', gap: 8 }}>
                {([
                  { id: 'lancement-projet', emoji: 'rocket_launch', title: 'Lancement de projet', desc: 'Scope, roles et timeline' },
                  { id: 'revue-trimestrielle', emoji: 'bar_chart', title: 'Revue trimestrielle', desc: 'Resultats et strategie' },
                  { id: 'brainstorming-produit', emoji: 'lightbulb', title: 'Brainstorming', desc: 'Idees innovantes' },
                  { id: 'resolution-crise', emoji: 'shield', title: 'Resolution de crise', desc: 'Situation urgente' },
                  { id: 'planification-annuelle', emoji: 'calendar_month', title: 'Planification', desc: 'Vision et objectifs' },
                  { id: 'partenariat-strategique', emoji: 'handshake', title: 'Partenariat', desc: 'Opportunites' },
                ] as const).map(tpl => (
                  <Link key={tpl.id} href={`/client/meeting?template=${tpl.id}`} style={{
                    display: 'block', padding: '10px 12px', borderRadius: 8,
                    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                    textDecoration: 'none', color: 'inherit', transition: 'border-color 0.15s',
                  }}>
                    <div className="text-sm font-semibold"><span className="material-symbols-rounded" style={{ fontSize: 14 }}>{tpl.emoji}</span> {tpl.title}</div>
                    <div className="text-xs text-muted">{tpl.desc}</div>
                  </Link>
                ))}
              </div>
              <div style={{ marginTop: 10, textAlign: 'center' }}>
                <Link href="/client/meeting" className="btn btn-primary btn-sm" style={{ fontSize: 12 }}>
                  Lancer une reunion
                </Link>
              </div>
            </div>

            <div className="flex items-center gap-6 mt-16" style={{ justifyContent: 'center' }}>
              <span className="text-xs text-muted"><span className="material-symbols-rounded" style={{ fontSize: 12 }}>phone_iphone</span> Vous pouvez aussi discuter via</span>
              <Link href="/client/whatsapp" className="text-xs font-semibold" style={{ color: 'var(--accent)', textDecoration: 'none' }}>WhatsApp</Link>
            </div>
          </div>
        )}

        {/* Message bubbles */}
        {messages.map((msg, i) => (
          <div key={i}>
            <div className={`chat-msg ${msg.role === 'user' ? 'chat-msg-user' : msg.role === 'assistant' ? 'chat-msg-assistant' : ''}`}
              style={msg.role === 'system' ? { alignSelf: 'center', maxWidth: '90%' } : undefined}>
              {msg.role === 'assistant' && (
                <div className="chat-msg-avatar" style={{ background: selectedAgent.color + '22' }}>
                  {selectedAgent.emoji}
                </div>
              )}
              <div>
                <div className="chat-msg-content" style={
                  msg.role === 'system' ? {
                    background: 'var(--danger-muted)', color: 'var(--danger)',
                    borderRadius: 'var(--radius-md)', fontSize: 13, fontStyle: 'italic',
                  } : undefined
                }>
                  <div style={{ whiteSpace: 'pre-wrap' }}>
                    {searchActive && searchQuery ? highlightText(msg.content, searchQuery) : msg.content}
                    {loading && i === messages.length - 1 && msg.role === 'assistant' && msg.content && (
                      <span className="chat-typing-cursor" />
                    )}
                  </div>
                </div>
                {/* Meta info — timestamp + actions */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4, flexWrap: 'wrap' }}>
                  <div className="chat-msg-timestamp">
                    {msg.timestamp && new Date(msg.timestamp).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
                    {msg.tokens ? ` · ${msg.tokens} tokens · ${((msg.cost ?? 0) / 1_000_000).toFixed(4)} cr` : ''}
                  </div>
                  {msg.role === 'assistant' && (
                    <div className="chat-msg-actions">
                      <AudioPlayback text={msg.content} gender={selectedAgent?.gender ?? 'F'} size="sm" />
                      {msg.isFaq && (
                        <span style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, background: '#22c55e15', color: '#22c55e', fontWeight: 600 }}>
                          FAQ
                        </span>
                      )}
                      <button onClick={() => copyMessage(msg.content, i)}
                        style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer', background: 'none', border: '1px solid var(--border-primary)', color: copiedIdx === i ? 'var(--success)' : 'var(--text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
                        title="Copier">
                        {copiedIdx === i ? <span className="material-symbols-rounded" style={{ fontSize: 10 }}>check</span> : <span className="material-symbols-rounded" style={{ fontSize: 10 }}>assignment</span>}
                      </button>
                      {!msg.isFaq && i > 0 && messages[i - 1]?.role === 'user' && (
                        <button onClick={() => saveAsFaq(i - 1, i)}
                          style={{ fontSize: 10, padding: '2px 6px', borderRadius: 4, cursor: 'pointer', background: 'none', border: '1px solid var(--border-primary)', color: savedFaqIdx === i ? '#22c55e' : 'var(--text-muted)', fontFamily: 'var(--font-sans)', transition: 'all 0.15s' }}
                          title="Sauvegarder en FAQ">
                          {savedFaqIdx === i ? <span className="material-symbols-rounded" style={{ fontSize: 10 }}>check</span> : <span className="material-symbols-rounded" style={{ fontSize: 10 }}>save</span>}
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
            {/* Feedback buttons every 5th assistant message */}
            {msg.role === 'assistant' && (() => {
              const assistantIdx = messages.slice(0, i + 1).filter(m => m.role === 'assistant').length;
              return assistantIdx > 0 && assistantIdx % 5 === 0 && !feedbackGiven[i];
            })() && (
              <div style={{ display: 'flex', gap: 6, marginTop: 6, paddingLeft: 38 }}>
                <button
                  onClick={() => { if (selectedAgent) { recordFeedback(selectedAgent.id, true); recordEvent({ type: 'agent_feedback' }); } setFeedbackGiven(prev => ({ ...prev, [i]: 'positive' })); }}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, cursor: 'pointer', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                  Utile <span className="material-symbols-rounded" style={{ fontSize: 12 }}>thumb_up</span>
                </button>
                <button
                  onClick={() => { if (selectedAgent) { recordFeedback(selectedAgent.id, false); recordEvent({ type: 'agent_feedback' }); } setFeedbackGiven(prev => ({ ...prev, [i]: 'negative' })); }}
                  style={{ fontSize: 11, padding: '3px 10px', borderRadius: 20, cursor: 'pointer', border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', color: 'var(--text-secondary)', fontFamily: 'var(--font-sans)' }}>
                  A ameliorer <span className="material-symbols-rounded" style={{ fontSize: 12 }}>thumb_down</span>
                </button>
              </div>
            )}
            {feedbackGiven[i] && (
              <div style={{ fontSize: 11, color: feedbackGiven[i] === 'positive' ? '#22c55e' : '#f97316', marginTop: 4, fontWeight: 500, paddingLeft: 38 }}>
                {feedbackGiven[i] === 'positive' ? <><span className="material-symbols-rounded" style={{ fontSize: 12 }}>volunteer_activism</span> Merci pour votre retour !</> : 'Noté, on va s\'améliorer !'}
              </div>
            )}
          </div>
        ))}

        {/* Loading indicator */}
        {loading && !(messages.length > 0 && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content) && (
          <div className="chat-msg chat-msg-assistant">
            <div className="chat-msg-avatar" style={{ background: selectedAgent.color + '22' }}>
              {selectedAgent.emoji}
            </div>
            <div className="chat-msg-content" style={{ background: 'var(--bg-secondary)' }}>
              <div className="animate-pulse text-tertiary" style={{ fontSize: 14 }}>
                {selectedAgent.name} réfléchit...
              </div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* ═══ GUIDED OPTIONS ZONE (above input) ═══ */}

      {/* Action Proposals */}
      {actionProposals.length > 0 && !loading && (
        <div style={{ padding: '8px 16px', borderTop: '1px solid var(--border-primary)', background: 'var(--bg-secondary)', maxHeight: 200, overflowY: 'auto' }}>
          <div className="flex flex-between items-center mb-4">
            <span className="text-sm font-semibold" style={{ color: 'var(--text-secondary)' }}>
              Actions proposées ({actionProposals.length})
            </span>
            {actionProposals.length > 1 && (
              <button
                disabled={actionSaving || acceptedActions.size === actionProposals.length}
                onClick={async () => {
                  setActionSaving(true);
                  try {
                    const token = (() => { try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token; } catch { return undefined; } })();
                    const actions = actionProposals.map(p => ({
                      type: p.type, title: p.title, description: p.description,
                      priority: p.priority, dueDate: p.dueDate, sourceAgent: selectedAgent?.id ?? 'unknown',
                    }));
                    const res = await fetch('/api/portal/actions/batch', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                      body: JSON.stringify({ actions }),
                    });
                    if (res.ok) setAcceptedActions(new Set(actionProposals.map((_, i) => i)));
                  } catch {}
                  setActionSaving(false);
                }}
                className="btn btn-sm" style={{ fontSize: 11, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>
                Tout accepter
              </button>
            )}
          </div>
          <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
            {actionProposals.map((p, i) => (
              <div key={i} className="rounded-sm" style={{
                padding: '8px 12px', minWidth: 220, flexShrink: 0,
                border: acceptedActions.has(i) ? '1px solid var(--success)' : '1px solid var(--border-primary)',
                background: acceptedActions.has(i) ? 'var(--success-muted)' : 'var(--bg-primary)',
                opacity: acceptedActions.has(i) ? 0.7 : 1,
              }}>
                <div className="flex items-center gap-6 mb-2">
                  <span style={{ fontSize: 14 }}>{ACTION_TYPE_ICONS[p.type] ?? <span className="material-symbols-rounded" style={{ fontSize: 14 }}>bolt</span>}</span>
                  <span className="text-xs font-semibold" style={{ flex: 1 }}>{p.title}</span>
                  <span className="text-xs" style={{ padding: '1px 4px', borderRadius: 3, background: `${PRIORITY_COLORS[p.priority]}22`, color: PRIORITY_COLORS[p.priority] }}>
                    {PRIORITY_LABELS[p.priority] ?? p.priority}
                  </span>
                </div>
                {p.description && <p className="text-xs mb-2" style={{ color: 'var(--text-secondary)', lineHeight: 1.3 }}>{p.description}</p>}
                <div className="flex flex-between items-center">
                  <span className="text-xs" style={{ color: 'var(--text-tertiary)' }}>{ACTION_TYPE_LABELS[p.type] ?? p.type}{p.dueDate ? ` · ${formatDueDate(p.dueDate)}` : ''}</span>
                  {acceptedActions.has(i) ? (
                    <span className="material-symbols-rounded text-xs font-medium" style={{ fontSize: 14, color: 'var(--success)' }}>check_circle</span>
                  ) : (
                    <button disabled={actionSaving} onClick={async () => {
                      setActionSaving(true);
                      try {
                        const token = (() => { try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token; } catch { return undefined; } })();
                        const res = await fetch('/api/portal/actions', {
                          method: 'POST',
                          headers: { 'Content-Type': 'application/json', ...(token ? { Authorization: `Bearer ${token}` } : {}) },
                          body: JSON.stringify({ type: p.type, title: p.title, description: p.description, priority: p.priority, dueDate: p.dueDate, sourceAgent: selectedAgent?.id ?? 'unknown' }),
                        });
                        if (res.ok) setAcceptedActions(prev => new Set([...prev, i]));
                      } catch {}
                      setActionSaving(false);
                    }} className="btn btn-sm" style={{ fontSize: 10, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)', padding: '2px 8px' }}>
                      Accepter
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
          {acceptedActions.size > 0 && (
            <div className="text-xs mt-4" style={{ color: 'var(--success)' }}>
              {acceptedActions.size} action{acceptedActions.size > 1 ? 's' : ''} ajoutée{acceptedActions.size > 1 ? 's' : ''} —{' '}
              <Link href="/client/actions" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>Voir le centre d&apos;actions</Link>
            </div>
          )}
        </div>
      )}

      {/* Follow-up Questions */}
      {followUpQuestions.length > 0 && !loading && (
        <div className="chat-guided-options">
          <div className="chat-guided-options-list">
            {followUpQuestions.map((q, i) => (
              <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }} className="chat-guided-option">
                {q}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Auto-FAQ suggestion */}
      {faqSuggestion && !loading && messages.length >= 2 && (
        <div className="flex flex-between items-center flex-wrap gap-6" style={{
          padding: '6px 16px', background: 'var(--info-muted)', borderTop: '1px solid var(--info)',
        }}>
          <span className="text-xs font-medium" style={{ color: 'var(--info)' }}>
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>lightbulb</span> Question fréquente ! Sauvegardez en FAQ (gratuit).
          </span>
          <div className="flex gap-4">
            <button onClick={() => {
              const lastAssistantIdx = messages.length - 1;
              const lastUserIdx = messages.length - 2;
              if (messages[lastAssistantIdx]?.role === 'assistant' && messages[lastUserIdx]?.role === 'user') saveAsFaq(lastUserIdx, lastAssistantIdx);
              setFaqSuggestion(false);
            }} className="btn btn-sm" style={{ fontSize: 10, background: 'var(--accent)', color: 'white', borderColor: 'var(--accent)' }}>
              Sauvegarder
            </button>
            <button onClick={() => setFaqSuggestion(false)} className="btn btn-ghost btn-sm" style={{ fontSize: 10 }}>Ignorer</button>
          </div>
        </div>
      )}

      {/* FAQ match hint */}
      {faqMatch && !loading && (
        <div className="flex flex-between items-center flex-wrap gap-6" style={{
          padding: '6px 16px', background: '#22c55e10', borderTop: '1px solid #22c55e33',
        }}>
          <span className="text-xs font-semibold text-success"><span className="material-symbols-rounded" style={{ fontSize: 12 }}>lightbulb</span> FAQ trouvée — 0 token</span>
          <div className="flex gap-4">
            <button onClick={() => useFaqAnswer(faqMatch)} className="btn btn-sm"
              style={{ fontSize: 10, background: '#22c55e', color: 'white', borderColor: '#22c55e' }}>Utiliser FAQ</button>
            <button onClick={() => setFaqMatch(null)} className="btn btn-ghost btn-sm" style={{ fontSize: 10 }}>IA</button>
          </div>
        </div>
      )}

      {/* ═══ INPUT BAR — ChatGPT-like ═══ */}
      <div className="chat-input-bar">
        <button className="chat-input-action" onClick={() => setShowActionsMenu(v => !v)} title="Plus d'options">
          +
        </button>
        <div className="chat-input-wrapper">
          <textarea
            ref={inputRef}
            className="chat-input-textarea"
            value={input}
            onChange={handleTextareaInput}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                sendMessageStream();
                resetTextareaHeight();
              }
            }}
            placeholder={`Écrivez à ${selectedAgent?.name ?? 'votre agent'}...`}
            rows={1}
            style={{ height: textareaHeight }}
          />
        </div>
        <div className="chat-send-modes">
          {input.trim() ? (
            <button className="chat-send-btn chat-send-text" onClick={() => { sendMessageStream(); resetTextareaHeight(); }} title="Envoyer">
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>send</span>
            </button>
          ) : (
            <>
              <VoiceInput
                onTranscript={(t) => setInput(prev => prev ? prev + ' ' + t : t)}
                disabled={loading}
                size="sm"
              />
              <Link href={`/client/visio/${selectedAgent?.id ?? 'fz-assistante'}`}>
                <button className="chat-send-btn chat-send-visio" title="Appel visio">
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>videocam</span>
                </button>
              </Link>
            </>
          )}
        </div>
      </div>

      {/* Mode pills */}
      <div className="chat-mode-bar">
        {COMM_TABS.map(tab => (
          <button
            key={tab.id}
            className={`chat-mode-pill ${commMode === tab.id ? 'active' : ''}`}
            onClick={() => setCommMode(tab.id)}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{tab.icon}</span> {tab.label}
          </button>
        ))}
      </div>

      </>}

      {/* ═══ AGENT BOTTOM SHEET ═══ */}
      {showAgentSheet && <>
        <div className="agent-bottom-sheet-overlay open" onClick={() => setShowAgentSheet(false)} />
        <div className="agent-bottom-sheet open">
          <div className="agent-bottom-sheet-handle" />
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 12 }}>Choisir un agent</div>
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`agent-bottom-sheet-item ${selectedAgent.id === agent.id ? 'active' : ''}`}
              onClick={() => { setSelectedAgent(agent); setShowAgentSheet(false); }}
            >
              <div style={{
                width: 36, height: 36, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: agent.color + '22', fontSize: 18, flexShrink: 0,
              }}>
                {agent.emoji}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{agent.name}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{agent.role}</div>
              </div>
              {agent.isCustomized && <span style={{ fontSize: 10, color: 'var(--accent)' }}><span className="material-symbols-rounded" style={{ fontSize: 10 }}>auto_awesome</span> Perso</span>}
              {selectedAgent.id === agent.id && <span className="material-symbols-rounded" style={{ color: 'var(--accent)', fontSize: 16 }}>check</span>}
            </div>
          ))}
        </div>
      </>}
    </div>
  );
}
