'use client';

import { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import { ALL_AGENTS } from '../../../lib/agent-config';
import { useToast } from '../../../components/Toast';
import { useIsMobile } from '../../../lib/use-media-query';
import {
  MAX_DEEP_CONTEXT,
  DEEP_DISCUSSION_MODEL,
  parseDiscussionTags,
  parseFollowUps,
  buildAgentSelectionPrompt,
  parseAgentSelectionResponse,
  buildDiscussionSystemPrompt,
  buildDeeperPrompt,
  buildCustomAgentPrompt,
  buildConclusionPrompt,
  exportDiscussionMarkdown,
  TEMPLATE_SECTIONS,
  ALL_TEMPLATES,
  getDailyTemplates,
  SHARE_PLATFORMS,
  buildShareUrl,
} from '../../../lib/deep-discussion.utils';
import { DISCUSSION_CATEGORIES, DISCUSSION_TAGS } from '../../../lib/deep-discussion.types';
import type {
  DeepDiscussion, DiscussionMessage, DiscussionCategory, SensitivityAlert, ShareContent,
} from '../../../lib/deep-discussion.types';
import { SlideOver } from '../../../components/SlideOver';

// ─── Helpers ─────────────────────────────────────────────────────────────────

function genId(): string {
  return `dd_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

function getSession(): { token?: string; userId?: string } {
  try {
    return JSON.parse(localStorage.getItem('fz_session') ?? '{}');
  } catch { return {}; }
}

function timeAgo(iso: string): string {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "À l'instant";
  if (mins < 60) return `il y a ${mins}min`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `il y a ${hrs}h`;
  const days = Math.floor(hrs / 24);
  if (days < 7) return `il y a ${days}j`;
  return new Date(iso).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' });
}

function formatTimestamp(iso: string): string {
  return new Date(iso).toLocaleString('fr-FR', { hour: '2-digit', minute: '2-digit', day: 'numeric', month: 'short' });
}

// Depth milestones
function getDepthMilestone(depth: number): { label: string; progress: number } {
  if (depth >= 30) return { label: 'Maîtrise', progress: 100 };
  if (depth >= 20) return { label: 'Approfondissement', progress: Math.min(100, (depth / 30) * 100) };
  if (depth >= 10) return { label: 'Exploration', progress: Math.min(100, (depth / 30) * 100) };
  if (depth >= 5) return { label: 'Introduction', progress: Math.min(100, (depth / 30) * 100) };
  return { label: 'Début', progress: Math.min(100, (depth / 30) * 100) };
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function DiscussionsPage() {
  const isMobile = useIsMobile();
  const { data: discussions, setData: setDiscussions } =
    useUserData<DeepDiscussion[]>('deep_discussions', [], 'fz_deep_discussions');

  const { showSuccess, showError, showWarning, showInfo } = useToast();

  const [activeId, setActiveId] = useState<string | null>(null);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [followUps, setFollowUps] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');

  // Template search
  const [templateSearch, setTemplateSearch] = useState('');
  const [sensitivityAlerts, setSensitivityAlerts] = useState<SensitivityAlert[]>([]);

  // Wizard state
  const [wizardOpen, setWizardOpen] = useState(false);
  const [wizardStep, setWizardStep] = useState<'input' | 'analyzing' | 'ready'>('input');
  const [wizardInput, setWizardInput] = useState('');
  const [wizardResult, setWizardResult] = useState<{
    agentId: string | null; agentName: string; agentEmoji: string;
    reasoning: string; category: DiscussionCategory; suggestedTitle: string;
  } | null>(null);

  // Insights panel
  const [insightsOpen, setInsightsOpen] = useState(false);

  // UX v3 state
  const [confirmDeleteId, setConfirmDeleteId] = useState<string | null>(null);
  const [msgHoverIdx, setMsgHoverIdx] = useState<number>(-1);
  const [loadingPhase, setLoadingPhase] = useState(0);
  const [messageSearch, setMessageSearch] = useState('');
  const [messageSearchOpen, setMessageSearchOpen] = useState(false);

  // Social sharing state
  const [shareOpen, setShareOpen] = useState(false);
  const [shareContent, setShareContent] = useState<ShareContent | null>(null);
  const [connectedPlatforms, setConnectedPlatforms] = useState<{ id: string; label: string; color: string; materialIcon: string }[]>([]);

  // Title editing
  const [editingTitle, setEditingTitle] = useState(false);
  const [editTitleValue, setEditTitleValue] = useState('');

  // Tag filter (template browser)
  const [activeTag, setActiveTag] = useState<string | null>(null);

  // Retry state
  const [retryCount, setRetryCount] = useState(0);
  const [lastSendError, setLastSendError] = useState(false);
  const lastUserMsgRef = useRef<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const controllerRef = useRef<AbortController | null>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const pendingSendRef = useRef<{ discussionId: string; content: string } | null>(null);
  const loadingStartRef = useRef<number>(0);
  const activeIdRef = useRef<string | null>(null);

  const active = discussions.find(d => d.id === activeId) ?? null;
  activeIdRef.current = activeId;

  // Auto-scroll
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [active?.messages.length]);

  // [Item 2] Pending send effect — replaces DOM click hack
  // Watches both activeId and discussions length to handle async state batching
  useEffect(() => {
    if (pendingSendRef.current && active && active.id === pendingSendRef.current.discussionId) {
      const { content } = pendingSendRef.current;
      pendingSendRef.current = null;
      sendMessage(content);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId, active?.id, discussions.length]);

  // [Item 9] Keyboard shortcuts
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      // Ctrl+N / Cmd+N → new discussion
      if ((e.ctrlKey || e.metaKey) && e.key === 'n') {
        e.preventDefault();
        setWizardOpen(true); setWizardStep('input'); setWizardInput(''); setWizardResult(null);
      }
      // Escape → close wizard or deselect
      if (e.key === 'Escape') {
        if (wizardOpen) { setWizardOpen(false); pendingSendRef.current = null; }
        else if (confirmDeleteId) { setConfirmDeleteId(null); }
        else if (messageSearchOpen) { setMessageSearchOpen(false); setMessageSearch(''); }
        else if (activeId) { setActiveId(null); }
      }
      // Ctrl+E → export
      if ((e.ctrlKey || e.metaKey) && e.key === 'e' && active) {
        e.preventDefault();
        handleExport();
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wizardOpen, confirmDeleteId, messageSearchOpen, activeId, active]);

  // [Fix 9] Loading phases with targeted timeouts
  useEffect(() => {
    if (!loading) { setLoadingPhase(0); return; }
    setLoadingPhase(0);
    const t1 = setTimeout(() => setLoadingPhase(1), 3000);
    const t2 = setTimeout(() => setLoadingPhase(2), 10000);
    return () => { clearTimeout(t1); clearTimeout(t2); };
  }, [loading]);

  // [Item 15] Draft save — beforeunload warning
  useEffect(() => {
    if (input.trim().length <= 20) return;
    function beforeUnload(e: BeforeUnloadEvent) { e.preventDefault(); }
    window.addEventListener('beforeunload', beforeUnload);
    return () => window.removeEventListener('beforeunload', beforeUnload);
  }, [input]);

  // [Item 15] Draft persistence — uses ref to avoid stale closure
  useEffect(() => {
    if (!activeId) return;
    const timer = setTimeout(() => {
      const id = activeIdRef.current;
      if (!id) return;
      if (input.trim().length > 5) {
        localStorage.setItem(`fz_deep_draft_${id}`, input);
      } else {
        localStorage.removeItem(`fz_deep_draft_${id}`);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [input, activeId]);

  // [Item 15] Restore draft on discussion select
  useEffect(() => {
    if (!activeId) return;
    const draft = localStorage.getItem(`fz_deep_draft_${activeId}`);
    if (draft) setInput(draft);
    else setInput('');
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeId]);

  // ─── Update Discussion Helper ──────────────────────────────────────────────

  const updateDiscussion = useCallback((id: string, updater: (d: DeepDiscussion) => DeepDiscussion) => {
    setDiscussions(prev => prev.map(d => d.id === id ? updater(d) : d));
  }, [setDiscussions]);

  // ─── Wizard: Analyze Topic ─────────────────────────────────────────────────

  async function analyzeTopic() {
    if (!wizardInput.trim()) return;
    setWizardStep('analyzing');

    const session = getSession();
    if (!session.token) { window.location.href = '/login'; return; }

    try {
      const messages = buildAgentSelectionPrompt(wizardInput.trim());
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: 'claude-sonnet-4-20250514',
          messages,
          maxTokens: 500,
          agentName: 'fz-dg',
        }),
      });

      if (!res.ok) {
        setWizardResult({
          agentId: 'fz-contradicteur',
          agentName: 'Naël',
          agentEmoji: 'balance',
          reasoning: 'Agent par défaut sélectionné',
          category: 'philosophical',
          suggestedTitle: wizardInput.trim().slice(0, 60),
        });
        setWizardStep('ready');
        return;
      }

      const data = await res.json();
      const responseText = data.content ?? data.message ?? '';
      const parsed = parseAgentSelectionResponse(responseText);

      if (parsed) {
        const agent = parsed.agentId ? ALL_AGENTS.find(a => a.id === parsed.agentId) : null;
        setWizardResult({
          agentId: parsed.agentId,
          agentName: agent?.name ?? 'Expert Personnalisé',
          agentEmoji: agent?.materialIcon ?? 'psychology',
          reasoning: parsed.reasoning,
          category: parsed.category,
          suggestedTitle: parsed.suggestedTitle,
        });
      } else {
        setWizardResult({
          agentId: null,
          agentName: 'Expert Personnalisé',
          agentEmoji: 'psychology',
          reasoning: 'Analyse automatique',
          category: 'philosophical',
          suggestedTitle: wizardInput.trim().slice(0, 60),
        });
      }
      setWizardStep('ready');
    } catch {
      setWizardResult({
        agentId: 'fz-contradicteur',
        agentName: 'Naël',
        agentEmoji: 'balance',
        reasoning: 'Fallback — erreur de connexion',
        category: 'philosophical',
        suggestedTitle: wizardInput.trim().slice(0, 60),
      });
      setWizardStep('ready');
    }
  }

  // ─── Start Discussion ──────────────────────────────────────────────────────

  function startDiscussion() {
    if (!wizardResult) return;

    const customPrompt = !wizardResult.agentId
      ? buildCustomAgentPrompt(wizardResult.category, wizardResult.suggestedTitle)
      : undefined;

    const newDiscussion: DeepDiscussion = {
      id: genId(),
      title: wizardResult.suggestedTitle,
      category: wizardResult.category,
      agentId: wizardResult.agentId ?? 'custom-discussion',
      agentName: wizardResult.agentName,
      agentEmoji: wizardResult.agentEmoji,
      customSystemPrompt: customPrompt,
      messages: [],
      keyPoints: [],
      objectives: [],
      evolutionNotes: [],
      status: 'active',
      createdAt: new Date().toISOString(),
      lastActivityAt: new Date().toISOString(),
      depth: 0,
      challengeMode: false,
    };

    setDiscussions(prev => [newDiscussion, ...prev]);
    setActiveId(newDiscussion.id);
    setWizardOpen(false);
    setWizardStep('input');

    // [Item 2] Use pendingSendRef instead of DOM click hack
    const content = wizardInput.trim();
    setWizardInput('');
    setWizardResult(null);
    if (content) {
      pendingSendRef.current = { discussionId: newDiscussion.id, content };
    }
  }

  // ─── Start from Template ───────────────────────────────────────────────────

  function startFromTemplate(template: typeof ALL_TEMPLATES[0]) {
    setWizardOpen(true);
    setWizardInput(template.starterPrompt);
    setWizardResult({
      agentId: null,
      agentName: 'Expert Personnalisé',
      agentEmoji: template.materialIcon,
      reasoning: `Template: ${template.title}`,
      category: template.category,
      suggestedTitle: template.title,
    });
    setWizardStep('ready');
  }

  // ─── Send Message ──────────────────────────────────────────────────────────

  async function sendMessage(overrideContent?: string) {
    const content = overrideContent ?? input.trim();
    if (!content || !active || loading) return;

    // [Fix 1] Capture stable ID to avoid stale closure during streaming
    const currentId = active.id;
    const currentAgentId = active.agentId;
    const currentAgentName = active.agentName;

    const session = getSession();
    if (!session.token) { window.location.href = '/login'; return; }

    setLoading(true);
    setInput('');
    setFollowUps([]);
    lastUserMsgRef.current = content;
    setRetryCount(0);
    setLastSendError(false);
    // [Item 15] Clear draft on send
    localStorage.removeItem(`fz_deep_draft_${currentId}`);

    const userMsg: DiscussionMessage = {
      role: 'user',
      content,
      timestamp: new Date().toISOString(),
    };

    // Add user message
    const updatedMessages = [...active.messages, userMsg];
    updateDiscussion(currentId, d => ({
      ...d,
      messages: updatedMessages,
      lastActivityAt: new Date().toISOString(),
    }));

    // Build system prompt
    const systemPrompt = buildDiscussionSystemPrompt({
      ...active,
      messages: updatedMessages,
    });

    // Build API messages with context window
    const conversationMsgs = updatedMessages.map(m => ({
      role: m.role as 'user' | 'assistant',
      content: m.content,
    }));

    const truncated = conversationMsgs.length > MAX_DEEP_CONTEXT
      ? conversationMsgs.slice(-MAX_DEEP_CONTEXT)
      : conversationMsgs;

    const apiMessages = [
      { role: 'user' as const, content: systemPrompt },
      { role: 'assistant' as const, content: `Compris, je suis ${currentAgentName}. Je suis prêt pour cette discussion approfondie sur "${active.title}". Allons-y.` },
      ...(conversationMsgs.length > MAX_DEEP_CONTEXT
        ? [
          { role: 'user' as const, content: '[Note: messages précédents résumés. Concentre-toi sur les échanges récents.]' },
          { role: 'assistant' as const, content: 'Compris, je me concentre sur la conversation récente tout en gardant en mémoire les points clés découverts.' },
        ]
        : []),
      ...truncated,
    ];

    // Abort previous stream
    controllerRef.current?.abort();
    const controller = new AbortController();
    controllerRef.current = controller;
    let streamTimeout: ReturnType<typeof setTimeout> | undefined;

    try {
      const res = await fetch('/api/chat/stream', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: session.token,
          model: DEEP_DISCUSSION_MODEL,
          messages: apiMessages,
          maxTokens: 1500,
          agentName: currentAgentId !== 'custom-discussion' ? currentAgentId : 'fz-dg',
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        let errorMsg = `Erreur ${res.status}`;
        try { const data = await res.json(); errorMsg = data.error ?? data.message ?? errorMsg; } catch { /* */ }
        // [Item 5] Toast on error
        showError(errorMsg);
        setLastSendError(true);
        updateDiscussion(currentId, d => ({
          ...d,
          messages: [...d.messages, { role: 'assistant' as const, content: `Erreur: ${errorMsg}`, timestamp: new Date().toISOString() }],
        }));
        setLoading(false);
        return;
      }

      // Parse SSE stream
      const reader = res.body?.getReader();
      if (!reader) throw new Error('No stream reader');
      const decoder = new TextDecoder();
      let streamedContent = '';
      let streamTokens = 0;
      let buffer = '';
      let currentEvent = '';
      const MAX_STREAM_SIZE = 100 * 1024;
      streamTimeout = setTimeout(() => controller.abort(), 60000);

      // Add empty assistant message
      updateDiscussion(currentId, d => ({
        ...d,
        messages: [...d.messages, { role: 'assistant' as const, content: '', timestamp: new Date().toISOString() }],
      }));

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
                const partial = streamedContent;
                updateDiscussion(currentId, d => {
                  const msgs = [...d.messages];
                  const last = msgs[msgs.length - 1];
                  if (last && last.role === 'assistant') {
                    msgs[msgs.length - 1] = { ...last, content: partial };
                  }
                  return { ...d, messages: msgs };
                });
              } else if (currentEvent === 'message_complete') {
                streamTokens = data.totalTokens ?? 0;
              }
            } catch { /* non-JSON */ }
            currentEvent = '';
          }
        }
      }

      if (streamTimeout) { clearTimeout(streamTimeout); streamTimeout = undefined; }

      // Finalize: parse tags + follow-ups + sensitivity
      const msgIndex = updatedMessages.length; // index of the assistant message
      const { cleanContent: contentNoTags, keyPoints, objectives, evolutionNotes, sensitivityAlerts: newAlerts } =
        parseDiscussionTags(streamedContent, msgIndex);
      const { cleanContent, questions } = parseFollowUps(contentNoTags);
      setFollowUps(questions);
      if (newAlerts.length > 0) setSensitivityAlerts(prev => [...prev, ...newAlerts]);

      updateDiscussion(currentId, d => {
        const msgs = [...d.messages];
        const last = msgs[msgs.length - 1];
        if (last && last.role === 'assistant') {
          msgs[msgs.length - 1] = { ...last, content: cleanContent, tokens: streamTokens };
        }
        return {
          ...d,
          messages: msgs,
          keyPoints: [...d.keyPoints, ...keyPoints],
          objectives: [...d.objectives, ...objectives],
          evolutionNotes: [...d.evolutionNotes, ...evolutionNotes],
          depth: d.depth + 1,
          lastActivityAt: new Date().toISOString(),
        };
      });
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        showError('Erreur de connexion au serveur');
        setLastSendError(true);
        updateDiscussion(currentId, d => ({
          ...d,
          messages: [...d.messages.filter(m => m.content !== ''), {
            role: 'assistant' as const,
            content: 'Erreur de connexion. Réessayez.',
            timestamp: new Date().toISOString(),
          }],
        }));
      }
    } finally {
      if (streamTimeout) clearTimeout(streamTimeout);
      setLoading(false);
    }
  }

  // ─── Export ────────────────────────────────────────────────────────────────

  function handleExport() {
    if (!active) return;
    const md = exportDiscussionMarkdown(active);
    const blob = new Blob([md], { type: 'text/markdown;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `discussion-${active.title.slice(0, 30).replace(/[^a-zA-Z0-9À-ÿ]/g, '-')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    showSuccess('Discussion exportée en Markdown');
  }

  // ─── Toggle Challenge Mode ─────────────────────────────────────────────────

  function toggleChallenge() {
    if (!active) return;
    const newMode = !active.challengeMode;
    updateDiscussion(active.id, d => ({ ...d, challengeMode: newMode }));
    showInfo(newMode ? 'Mode challenge activé' : 'Mode challenge désactivé');
  }

  // ─── Toggle Status ─────────────────────────────────────────────────────────

  function togglePause() {
    if (!active) return;
    updateDiscussion(active.id, d => ({
      ...d,
      status: d.status === 'active' ? 'paused' : 'active',
    }));
  }

  // ─── Delete Discussion ─────────────────────────────────────────────────────

  function deleteDiscussion(id: string) {
    setDiscussions(prev => prev.filter(d => d.id !== id));
    if (activeId === id) setActiveId(null);
    setConfirmDeleteId(null);
    showWarning('Discussion supprimée');
  }

  // ─── Toggle Star ──────────────────────────────────────────────────────────

  function toggleStar(id: string) {
    updateDiscussion(id, d => ({ ...d, starred: !d.starred }));
  }

  // ─── Copy Message ──────────────────────────────────────────────────────────

  function copyMessage(content: string) {
    navigator.clipboard.writeText(content)
      .then(() => showSuccess('Copié dans le presse-papiers'))
      .catch(() => showError('Impossible de copier'));
  }

  // ─── Retry Last Message ──────────────────────────────────────────────────

  function retryLastMessage() {
    if (!active || retryCount >= 2) return;
    const lastMsg = lastUserMsgRef.current;
    if (!lastMsg) return;
    // Remove the last assistant error message
    updateDiscussion(active.id, d => {
      const msgs = [...d.messages];
      if (msgs.length > 0 && msgs[msgs.length - 1].role === 'assistant') {
        msgs.pop();
      }
      return { ...d, messages: msgs, depth: Math.max(0, d.depth - 1) };
    });
    setRetryCount(prev => prev + 1);
    setTimeout(() => sendMessage(lastMsg), 100);
  }

  // ─── Complete Discussion ────────────────────────────────────────────────

  function concludeDiscussion() {
    if (!active || loading || active.status === 'completed') return;
    const prompt = buildConclusionPrompt(active);
    sendMessage(prompt);
    // After conclusion is sent, mark as completed after a short delay
    // The actual summary will be set after the response comes back
    setTimeout(() => {
      updateDiscussion(active.id, d => {
        const lastMsg = d.messages[d.messages.length - 1];
        return {
          ...d,
          status: 'completed' as const,
          summary: lastMsg?.role === 'assistant' ? lastMsg.content : undefined,
        };
      });
    }, 500);
  }

  // ─── Social: detect connected platforms ──────────────────────────────────

  useEffect(() => {
    try {
      const raw = localStorage.getItem('fz_social_keys');
      if (!raw) return;
      const keys = JSON.parse(raw);
      const PLATFORMS = [
        { id: 'linkedin', label: 'LinkedIn', color: '#0077b5', materialIcon: 'work' },
        { id: 'facebook', label: 'Facebook', color: '#1877f2', materialIcon: 'thumb_up' },
        { id: 'twitter', label: 'Twitter/X', color: '#1da1f2', materialIcon: 'share' },
        { id: 'tiktok', label: 'TikTok', color: '#000000', materialIcon: 'music_note' },
      ];
      const connected = PLATFORMS.filter(p => keys[p.id]?.connected);
      setConnectedPlatforms(connected);
    } catch { /* */ }
  }, []);

  // ─── Share Functions ─────────────────────────────────────────────────────

  function openShare(content: ShareContent) {
    setShareContent(content);
    setShareOpen(true);
  }

  function shareKeyPoint(kp: { text: string }) {
    if (!active) return;
    openShare({ type: 'key_point', title: 'Point clé', text: kp.text, discussionTitle: active.title, agentName: active.agentName, agentEmoji: active.agentEmoji });
  }

  function shareMessage(msg: DiscussionMessage) {
    if (!active) return;
    openShare({ type: 'message_quote', title: 'Citation', text: msg.content, discussionTitle: active.title, agentName: active.agentName, agentEmoji: active.agentEmoji });
  }

  function shareDiscussionSummary() {
    if (!active) return;
    const text = active.summary ??
      `Discussion "${active.title}" — ${active.depth} échanges, ${active.keyPoints.length} points clés.` +
      (active.keyPoints.length > 0 ? '\n\nPoints clés:\n' + active.keyPoints.map(kp => `• ${kp.text}`).join('\n') : '');
    openShare({ type: 'discussion_summary', title: 'Résumé', text, discussionTitle: active.title, agentName: active.agentName, agentEmoji: active.agentEmoji });
  }

  function handlePlatformShare(platformId: string) {
    if (!shareContent) return;
    const url = buildShareUrl(shareContent, platformId);
    if (url) window.open(url, '_blank', 'width=600,height=500');
  }

  function handleNativeShare() {
    if (!shareContent || typeof navigator === 'undefined' || !navigator.share) return;
    navigator.share({ title: `Freenzy.io — ${shareContent.discussionTitle}`, text: shareContent.text, url: 'https://freenzy.io' }).catch(() => {});
  }

  function handleCopyShare() {
    if (!shareContent) return;
    navigator.clipboard.writeText(shareContent.text)
      .then(() => { showSuccess('Copié dans le presse-papiers'); setShareOpen(false); })
      .catch(() => showError('Impossible de copier'));
  }

  // ─── Filtered Discussions ──────────────────────────────────────────────────

  const filtered = discussions.filter(d => {
    if (categoryFilter !== 'all' && d.category !== categoryFilter) return false;
    if (searchQuery && !d.title.toLowerCase().includes(searchQuery.toLowerCase())) return false;
    return true;
  }).sort((a, b) => {
    // [Item 10] Starred first, then by date
    if (a.starred && !b.starred) return -1;
    if (!a.starred && b.starred) return 1;
    return new Date(b.lastActivityAt).getTime() - new Date(a.lastActivityAt).getTime();
  });

  // ─── Insights ──────────────────────────────────────────────────────────────

  const totalDepth = discussions.reduce((s, d) => s + d.depth, 0);
  const totalKeyPoints = discussions.reduce((s, d) => s + d.keyPoints.length, 0);
  const totalTokens = active ? active.messages.reduce((s, m) => s + (m.tokens ?? 0), 0) : 0;
  const categoryCounts = discussions.reduce<Record<string, number>>((acc, d) => {
    acc[d.category] = (acc[d.category] ?? 0) + 1;
    return acc;
  }, {});
  const topCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5);

  // [Fix 8] Pre-compute filtered message indices for search
  const filteredMsgIndices = useMemo(() => {
    if (!messageSearch || !active) return null;
    const q = messageSearch.toLowerCase();
    return new Set(active.messages.map((m, i) => m.content.toLowerCase().includes(q) ? i : -1).filter(i => i >= 0));
  }, [messageSearch, active?.messages, active]);

  // ─── Render ────────────────────────────────────────────────────────────────

  function TemplateCard({ template: t, onClick, highlight }: { template: typeof ALL_TEMPLATES[0]; onClick: () => void; highlight?: boolean }) {
    const catInfo = DISCUSSION_CATEGORIES.find(c => c.id === t.category);
    return (
      <div
        onClick={onClick}
        style={{
          padding: '14px 16px', borderRadius: 10, cursor: 'pointer',
          background: highlight ? 'linear-gradient(135deg, #1a0a2e, #0f1a3e)' : 'var(--bg-secondary, #111)',
          border: `1px solid ${highlight ? '#7c3aed33' : 'var(--border-primary, #1e1e1e)'}`,
          transition: 'border-color 0.2s, transform 0.15s',
        }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = highlight ? '#7c3aed33' : 'var(--border-primary, #1e1e1e)'; e.currentTarget.style.transform = 'none'; }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 6 }}>
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>{t.materialIcon}</span>
          <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 10, background: '#7c3aed22', color: '#a78bfa' }}>
            {catInfo?.label}
          </span>
        </div>
        <h3 style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #fff)', margin: '0 0 3px', lineHeight: 1.3 }}>
          {t.title}
        </h3>
        <p style={{ fontSize: 11, color: 'var(--text-secondary, #888)', margin: '0 0 4px', lineHeight: 1.3 }}>
          {t.description}
        </p>
        {t.tags && t.tags.length > 0 && (
          <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
            {t.tags.slice(0, 3).map(tagId => {
              const tagInfo = DISCUSSION_TAGS.find(tg => tg.id === tagId);
              return tagInfo ? (
                <span key={tagId} style={{
                  fontSize: 9, padding: '1px 6px', borderRadius: 8,
                  background: '#7c3aed11', color: '#a78bfa', whiteSpace: 'nowrap',
                }}>
                  {tagInfo.label}
                </span>
              ) : null;
            })}
          </div>
        )}
      </div>
    );
  }

  // Loading text based on phase
  const loadingText = loadingPhase === 2
    ? 'Opus réfléchit en profondeur...'
    : loadingPhase === 1
      ? 'Analyse approfondie en cours...'
      : 'En réflexion...';

  return (
    <div style={{ display: 'flex', flexDirection: isMobile ? 'column' : 'row', height: 'calc(100vh - 64px)', overflow: 'hidden' }}>

      {/* ─── Left Panel: Discussion List ─── */}
      {(!isMobile || !activeId) && <div style={{
        width: isMobile ? '100%' : 320, minWidth: isMobile ? 'auto' : 320,
        borderRight: isMobile ? 'none' : '1px solid var(--border-primary, #1e1e1e)',
        borderBottom: isMobile ? '1px solid var(--border-primary, #1e1e1e)' : 'none',
        display: 'flex', flexDirection: 'column', background: 'var(--bg-secondary, #111)',
        ...(isMobile ? { flex: 1 } : {}),
      }}>

        {/* Header */}
        <div style={{ padding: '16px 16px 12px' }}>
          <button
            onClick={() => { setWizardOpen(true); setWizardStep('input'); setWizardInput(''); setWizardResult(null); }}
            style={{
              width: '100%', padding: '10px 16px', borderRadius: 8,
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14,
            }}
          >
            + Nouvelle discussion
          </button>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            style={{
              width: '100%', marginTop: 8, padding: '8px 12px', borderRadius: 6,
              background: 'var(--bg-primary, #0a0a0a)', border: '1px solid var(--border-primary, #1e1e1e)',
              color: 'var(--text-primary, #fff)', fontSize: 13,
            }}
          />
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            style={{
              width: '100%', marginTop: 6, padding: '6px 10px', borderRadius: 6,
              background: 'var(--bg-primary, #0a0a0a)', border: '1px solid var(--border-primary, #1e1e1e)',
              color: 'var(--text-primary, #fff)', fontSize: 12,
            }}
          >
            <option value="all">Toutes les catégories</option>
            {DISCUSSION_CATEGORIES.map(c => (
              <option key={c.id} value={c.id}>{c.label}</option>
            ))}
          </select>
        </div>

        {/* List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '0 8px' }}>
          {filtered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '40px 16px', color: 'var(--text-secondary, #888)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 48 }}>psychology</span></div>
              <p style={{ fontSize: 14, fontWeight: 600 }}>Aucune discussion</p>
              <p style={{ fontSize: 12, marginTop: 4, marginBottom: 16 }}>Lancez votre première discussion <span className="fz-logo-word">profonde</span></p>
              <button
                onClick={() => { setWizardOpen(true); setWizardStep('input'); setWizardInput(''); setWizardResult(null); }}
                style={{
                  padding: '8px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600,
                  background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer',
                }}
              >
                Nouvelle discussion
              </button>
            </div>
          )}
          {filtered.map(d => {
            const catInfo = DISCUSSION_CATEGORIES.find(c => c.id === d.category);
            return (
              <div
                key={d.id}
                onClick={() => { setActiveId(d.id); setFollowUps([]); }}
                style={{
                  padding: '12px 12px', marginBottom: 4, borderRadius: 8, cursor: 'pointer',
                  background: activeId === d.id ? 'var(--bg-active, #1a1a2e)' : 'transparent',
                  border: activeId === d.id ? '1px solid #7c3aed33' : '1px solid transparent',
                  transition: 'all 0.15s',
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{catInfo?.materialIcon ?? 'psychology'}</span>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{
                      fontSize: 13, fontWeight: 600, color: 'var(--text-primary, #fff)',
                      whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
                      display: 'flex', alignItems: 'center', gap: 4,
                    }}>
                      {d.starred && <span className="material-symbols-rounded" style={{ color: '#FBBF24', fontSize: 12 }}>star</span>}
                      {d.title}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary, #888)', display: 'flex', gap: 8, marginTop: 2 }}>
                      <span>{timeAgo(d.lastActivityAt)}</span>
                      <span>{d.depth} échanges</span>
                      {d.keyPoints.length > 0 && <span>{d.keyPoints.length} pts clés</span>}
                    </div>
                  </div>
                  {/* [Item 10] Star button */}
                  <button
                    onClick={(e) => { e.stopPropagation(); toggleStar(d.id); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer', padding: 2,
                      color: d.starred ? '#FBBF24' : 'var(--text-secondary, #555)',
                      fontSize: 14, transition: 'color 0.15s',
                    }}
                    title={d.starred ? 'Retirer des favoris' : 'Ajouter aux favoris'}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{d.starred ? 'star' : 'star_outline'}</span>
                  </button>
                  <span style={{
                    width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
                    background: d.status === 'active' ? '#22C55E' : d.status === 'paused' ? '#F59E0B' : '#6B7280',
                  }} />
                </div>
              </div>
            );
          })}
        </div>

        {/* Insights */}
        {discussions.length > 0 && (
          <div style={{ borderTop: '1px solid var(--border-primary, #1e1e1e)', padding: '8px 12px' }}>
            <button
              onClick={() => setInsightsOpen(!insightsOpen)}
              style={{
                background: 'none', border: 'none', color: 'var(--text-secondary, #888)',
                fontSize: 12, cursor: 'pointer', width: '100%', textAlign: 'left', padding: '4px 0',
              }}
            >
              {insightsOpen ? '▼' : '▶'} Insights ({discussions.length} discussions)
            </button>
            {insightsOpen && (
              <div style={{ fontSize: 12, color: 'var(--text-secondary, #888)', padding: '4px 0' }}>
                <div>Profondeur totale: {totalDepth} échanges</div>
                <div>Points clés: {totalKeyPoints}</div>
                {topCategories.length > 0 && (
                  <div style={{ marginTop: 4 }}>
                    {topCategories.map(([cat, count]) => {
                      const info = DISCUSSION_CATEGORIES.find(c => c.id === cat);
                      return <div key={cat}><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>{info?.materialIcon}</span> {info?.label}: {count}</div>;
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>}

      {/* ─── Right Panel: Active Discussion or Landing ─── */}
      {(!isMobile || activeId) && <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        {/* Mobile back button */}
        {isMobile && active && (
          <button
            onClick={() => setActiveId(null)}
            style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '10px 16px',
              background: 'var(--bg-secondary)', border: 'none', borderBottom: '1px solid var(--border-primary)',
              color: 'var(--text-primary)', fontSize: 13, fontWeight: 600, cursor: 'pointer',
              fontFamily: 'inherit',
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>arrow_back</span>
            Retour aux discussions
          </button>
        )}

        {!active ? (
          /* ─── Landing: Rich Template Browser ─── */
          <div style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '16px 12px 60px' : '24px 24px 60px' }}>
            {/* Top bar: Create + Search + Random */}
            <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
              <div style={{
                flex: 1, minWidth: 200, display: 'flex', gap: 8,
                background: 'var(--bg-secondary, #111)', borderRadius: 10,
                border: '1px solid var(--border-primary, #1e1e1e)', padding: '4px 4px 4px 14px',
                alignItems: 'center',
              }}>
                <span className="material-symbols-rounded" style={{ color: 'var(--text-secondary, #888)', fontSize: 14 }}>search</span>
                <input
                  type="text"
                  placeholder="Chercher un sujet parmi 80+ discussions..."
                  value={templateSearch}
                  onChange={e => setTemplateSearch(e.target.value)}
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: 'var(--text-primary, #fff)', fontSize: 14, padding: '8px 0',
                  }}
                />
              </div>
              <button
                onClick={() => {
                  const random = ALL_TEMPLATES[Math.floor(Math.random() * ALL_TEMPLATES.length)];
                  startFromTemplate(random);
                }}
                style={{
                  padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                  background: 'var(--bg-secondary, #111)', border: '1px solid var(--border-primary, #1e1e1e)',
                  color: '#a78bfa', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 13 }}>casino</span> Sujet aléatoire
              </button>
              <button
                onClick={() => { setWizardOpen(true); setWizardStep('input'); setWizardInput(''); setWizardResult(null); }}
                style={{
                  padding: '10px 16px', borderRadius: 10, cursor: 'pointer',
                  background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                  border: 'none', color: '#fff', fontWeight: 600, fontSize: 13, whiteSpace: 'nowrap',
                }}
              >
                + Mon sujet
              </button>
            </div>

            {/* Keyboard hint */}
            <div style={{ fontSize: 11, color: 'var(--text-secondary, #555)', marginBottom: 12, display: 'flex', gap: 16 }}>
              <span><kbd style={{ padding: '1px 5px', borderRadius: 3, background: '#1e1e1e', border: '1px solid #333', fontSize: 10 }}>Ctrl+N</kbd> Nouvelle</span>
              <span><kbd style={{ padding: '1px 5px', borderRadius: 3, background: '#1e1e1e', border: '1px solid #333', fontSize: 10 }}>Esc</kbd> Retour</span>
            </div>

            {/* Tag filter pills */}
            <div style={{
              display: 'flex', gap: 6, overflowX: 'auto', paddingBottom: 12, marginBottom: 8,
              scrollbarWidth: 'thin',
            }}>
              {DISCUSSION_TAGS.map(tag => {
                const isActive = activeTag === tag.id;
                return (
                  <button
                    key={tag.id}
                    onClick={() => setActiveTag(isActive ? null : tag.id)}
                    style={{
                      padding: '5px 12px', borderRadius: 16, fontSize: 12, cursor: 'pointer',
                      whiteSpace: 'nowrap', fontWeight: isActive ? 600 : 400,
                      background: isActive ? '#7c3aed22' : 'var(--bg-secondary, #111)',
                      border: `1px solid ${isActive ? '#7c3aed' : 'var(--border-primary, #1e1e1e)'}`,
                      color: isActive ? '#a78bfa' : 'var(--text-secondary, #888)',
                      transition: 'all 0.15s',
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 14 }}>{tag.materialIcon}</span> {tag.label}
                  </button>
                );
              })}
            </div>

            {/* Search results mode or tag filter mode */}
            {(templateSearch.trim() || activeTag) ? (() => {
              const q = templateSearch.toLowerCase();
              const matchingTemplates = ALL_TEMPLATES.filter(t => {
                const matchesSearch = !templateSearch.trim() || (
                  t.title.toLowerCase().includes(q) ||
                  t.description.toLowerCase().includes(q) ||
                  t.starterPrompt.toLowerCase().includes(q)
                );
                const matchesTag = !activeTag || (t.tags ?? []).includes(activeTag);
                return matchesSearch && matchesTag;
              });
              const tagInfo = activeTag ? DISCUSSION_TAGS.find(tg => tg.id === activeTag) : null;
              const filterLabel = [
                templateSearch.trim() ? `"${templateSearch}"` : '',
                tagInfo ? `${tagInfo.label}` : '',
              ].filter(Boolean).join(' + ');
              return (
              <>
                <h2 style={{ fontSize: 15, color: 'var(--text-secondary, #888)', marginBottom: 12 }}>
                  {matchingTemplates.length} sujet{matchingTemplates.length !== 1 ? 's' : ''} — {filterLabel}
                </h2>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                  {matchingTemplates.map(t => (
                    <TemplateCard key={t.id} template={t} onClick={() => startFromTemplate(t)} />
                  ))}
                </div>
                {matchingTemplates.length === 0 && (
                  <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-secondary, #888)' }}>
                    <p>Aucun résultat. Créez votre propre sujet !</p>
                    <button
                      onClick={() => { setWizardOpen(true); setWizardStep('input'); setWizardInput(templateSearch || ''); setWizardResult(null); }}
                      style={{
                        marginTop: 8, padding: '10px 20px', borderRadius: 8,
                        background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer',
                        fontWeight: 600, fontSize: 14,
                      }}
                    >
                      Créer un sujet personnalisé
                    </button>
                  </div>
                )}
              </>
              );
            })() : (
              /* Normal browse mode */
              <>
                {/* Default agent card — compact */}
                <div style={{
                  display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20,
                  padding: '16px 20px', borderRadius: 12,
                  background: 'linear-gradient(135deg, #1a0a2e, #0f1a3e)',
                  border: '1px solid #7c3aed33',
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 36 }}>balance</span>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ margin: 0, fontSize: 15, color: '#fff' }}>Naël — Le Contradicteur</h3>
                    <p style={{ margin: '2px 0 0', fontSize: 12, color: '#94A3B8' }}>
                      Prêt à débattre. Méthode socratique, argumentation structurée, intelligence Opus.
                    </p>
                  </div>
                  <button
                    onClick={() => { setWizardOpen(true); setWizardStep('input'); setWizardInput(''); setWizardResult(null); }}
                    style={{
                      padding: '8px 16px', borderRadius: 8, whiteSpace: 'nowrap',
                      background: '#7c3aed', color: '#fff', border: 'none', cursor: 'pointer',
                      fontWeight: 600, fontSize: 13,
                    }}
                  >
                    Démarrer
                  </button>
                </div>

                {/* Daily picks */}
                <div style={{ marginBottom: 24 }}>
                  <h2 style={{ fontSize: 15, color: 'var(--text-primary, #fff)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 15 }}>target</span> Discussions du jour
                  </h2>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))', gap: 10 }}>
                    {getDailyTemplates().map(t => (
                      <TemplateCard key={t.id} template={t} onClick={() => startFromTemplate(t)} highlight />
                    ))}
                  </div>
                </div>

                {/* Recent discussions (if any) */}
                {discussions.length > 0 && (
                  <div style={{ marginBottom: 24 }}>
                    <h2 style={{ fontSize: 15, color: 'var(--text-primary, #fff)', marginBottom: 10, display: 'flex', alignItems: 'center', gap: 8 }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 15 }}>schedule</span> Reprendre une discussion
                    </h2>
                    <div style={{ display: 'flex', gap: 10, overflowX: 'auto', paddingBottom: 4 }}>
                      {discussions.slice(0, 4).map(d => {
                        const catInfo = DISCUSSION_CATEGORIES.find(c => c.id === d.category);
                        return (
                          <div
                            key={d.id}
                            onClick={() => { setActiveId(d.id); setFollowUps([]); }}
                            style={{
                              minWidth: 200, padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                              background: 'var(--bg-secondary, #111)',
                              border: '1px solid var(--border-primary, #1e1e1e)',
                              transition: 'border-color 0.2s',
                            }}
                            onMouseEnter={e => (e.currentTarget.style.borderColor = '#7c3aed')}
                            onMouseLeave={e => (e.currentTarget.style.borderColor = 'var(--border-primary, #1e1e1e)')}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 6 }}>
                              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{catInfo?.materialIcon}</span>
                              <span style={{ fontSize: 13, fontWeight: 600, color: '#fff' }}>{d.title.slice(0, 35)}{d.title.length > 35 ? '...' : ''}</span>
                            </div>
                            <div style={{ fontSize: 11, color: 'var(--text-secondary, #888)' }}>
                              {d.depth} échanges · {d.keyPoints.length} pts clés · {timeAgo(d.lastActivityAt)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                )}

                {/* Template sections */}
                {TEMPLATE_SECTIONS.map(section => (
                  <div key={section.id} style={{ marginBottom: 28 }}>
                    <h2 style={{
                      fontSize: 15, color: 'var(--text-primary, #fff)', marginBottom: 4,
                      display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{section.materialIcon}</span> {section.title}
                    </h2>
                    <p style={{ fontSize: 12, color: 'var(--text-secondary, #888)', margin: '0 0 10px' }}>
                      {section.description}
                    </p>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 8 }}>
                      {section.templates.map(t => (
                        <TemplateCard key={t.id} template={t} onClick={() => startFromTemplate(t)} />
                      ))}
                    </div>
                  </div>
                ))}
              </>
            )}
          </div>
        ) : (
          /* ─── Active Discussion ─── */
          <>
            {/* Header */}
            <div style={{
              padding: '12px 20px', borderBottom: '1px solid var(--border-primary, #1e1e1e)',
              display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0,
            }}>
              <span className="material-symbols-rounded" style={{ fontSize: 24, color: '#a78bfa' }}>{active.agentEmoji}</span>
              <div style={{ flex: 1 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                  {editingTitle ? (
                    <input
                      type="text"
                      value={editTitleValue}
                      onChange={e => setEditTitleValue(e.target.value)}
                      onKeyDown={e => {
                        if (e.key === 'Enter') {
                          if (editTitleValue.trim()) updateDiscussion(active.id, d => ({ ...d, title: editTitleValue.trim() }));
                          setEditingTitle(false);
                        }
                        if (e.key === 'Escape') setEditingTitle(false);
                      }}
                      onBlur={() => {
                        if (editTitleValue.trim()) updateDiscussion(active.id, d => ({ ...d, title: editTitleValue.trim() }));
                        setEditingTitle(false);
                      }}
                      autoFocus
                      style={{
                        margin: 0, fontSize: 16, fontWeight: 700, color: 'var(--text-primary, #fff)',
                        background: 'var(--bg-primary, #0a0a0a)', border: '1px solid #7c3aed',
                        borderRadius: 6, padding: '2px 8px', outline: 'none', minWidth: 200,
                      }}
                    />
                  ) : (
                    <h2
                      style={{ margin: 0, fontSize: 16, color: 'var(--text-primary, #fff)', cursor: 'pointer' }}
                      onDoubleClick={() => { setEditingTitle(true); setEditTitleValue(active.title); }}
                      title="Double-clic pour modifier le titre"
                    >
                      {active.title}
                    </h2>
                  )}
                  <span style={{
                    fontSize: 10, padding: '2px 8px', borderRadius: 10,
                    background: '#7c3aed22', color: '#a78bfa',
                  }}>
                    {DISCUSSION_CATEGORIES.find(c => c.id === active.category)?.label}
                  </span>
                </div>
                <div style={{ fontSize: 12, color: 'var(--text-secondary, #888)', display: 'flex', gap: 12, marginTop: 2 }}>
                  <span>{active.agentName}</span>
                  <span>{active.depth} échanges</span>
                  <span>{active.keyPoints.length} points clés</span>
                  <span>{active.objectives.length} objectifs</span>
                  {totalTokens > 0 && <span>{totalTokens.toLocaleString()} tokens</span>}
                  {connectedPlatforms.length > 0 && (
                    <span style={{ display: 'inline-flex', gap: 3, marginLeft: 4 }}>
                      {connectedPlatforms.map(p => (
                        <span key={p.id} title={`${p.label} connecté`} style={{
                          width: 16, height: 16, borderRadius: '50%', background: `${p.color}22`,
                          border: `1px solid ${p.color}44`, display: 'inline-flex', alignItems: 'center',
                          justifyContent: 'center', fontSize: 10,
                        }}><span className="material-symbols-rounded" style={{ fontSize: 10 }}>{p.materialIcon}</span></span>
                      ))}
                    </span>
                  )}
                </div>
              </div>
              <div style={{ display: 'flex', gap: 6 }}>
                {active.status === 'completed' ? (
                  <span style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                    background: '#22C55E11', border: '1px solid #22C55E33', color: '#4ADE80',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 12 }}>check_circle</span> Terminée
                  </span>
                ) : active.depth >= 2 && (
                  <button
                    onClick={concludeDiscussion}
                    disabled={loading}
                    style={{
                      padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                      background: '#22C55E11', border: '1px solid #22C55E33', color: '#4ADE80',
                    }}
                    title="Conclure et obtenir un bilan"
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 12 }}>check_circle</span> Conclure
                  </button>
                )}
                <button
                  onClick={toggleChallenge}
                  title={active.challengeMode ? 'Désactiver le mode challenge' : 'Activer le mode challenge'}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: active.challengeMode ? '#EF444422' : 'var(--bg-secondary, #111)',
                    border: `1px solid ${active.challengeMode ? '#EF4444' : 'var(--border-primary, #1e1e1e)'}`,
                    color: active.challengeMode ? '#EF4444' : 'var(--text-secondary, #888)',
                  }}
                >
                  {active.challengeMode ? <><span className="material-symbols-rounded" style={{ fontSize: 12 }}>swords</span> Challenge ON</> : <><span className="material-symbols-rounded" style={{ fontSize: 12 }}>swords</span> Challenge</>}
                </button>
                <button
                  onClick={togglePause}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: 'var(--bg-secondary, #111)',
                    border: '1px solid var(--border-primary, #1e1e1e)',
                    color: 'var(--text-secondary, #888)',
                  }}
                >
                  {active.status === 'active' ? <><span className="material-symbols-rounded" style={{ fontSize: 12 }}>pause</span> Pause</> : <><span className="material-symbols-rounded" style={{ fontSize: 12 }}>play_arrow</span> Reprendre</>}
                </button>
                {/* [Item 14] Search in messages */}
                <button
                  onClick={() => { setMessageSearchOpen(!messageSearchOpen); setMessageSearch(''); }}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: messageSearchOpen ? '#7c3aed22' : 'var(--bg-secondary, #111)',
                    border: `1px solid ${messageSearchOpen ? '#7c3aed' : 'var(--border-primary, #1e1e1e)'}`,
                    color: messageSearchOpen ? '#a78bfa' : 'var(--text-secondary, #888)',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 14 }}>search</span>
                </button>
                <button
                  onClick={handleExport}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: 'var(--bg-secondary, #111)',
                    border: '1px solid var(--border-primary, #1e1e1e)',
                    color: 'var(--text-secondary, #888)',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 14 }}>download</span> Exporter
                </button>
                <button
                  onClick={shareDiscussionSummary}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: 'var(--bg-secondary, #111)',
                    border: '1px solid var(--border-primary, #1e1e1e)',
                    color: 'var(--text-secondary, #888)',
                  }}
                >
                  ↗ Partager
                </button>
                {/* [Item 1] Delete with confirmation */}
                <button
                  onClick={() => setConfirmDeleteId(active.id)}
                  style={{
                    padding: '6px 12px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: 'var(--bg-secondary, #111)',
                    border: '1px solid var(--border-primary, #1e1e1e)',
                    color: '#EF4444',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 14 }}>delete</span>
                </button>
              </div>
            </div>

            {/* [Item 1] Delete confirmation bar */}
            {confirmDeleteId === active.id && (
              <div style={{
                padding: '8px 20px', borderBottom: '1px solid #EF444433',
                background: '#EF444411', display: 'flex', alignItems: 'center', gap: 12,
                flexShrink: 0,
              }}>
                <span style={{ fontSize: 13, color: '#FCA5A5', flex: 1 }}>
                  Supprimer cette discussion ? Cette action est irréversible.
                </span>
                <button
                  onClick={() => setConfirmDeleteId(null)}
                  style={{
                    padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: 'transparent', border: '1px solid #555', color: '#aaa',
                  }}
                >
                  Annuler
                </button>
                <button
                  onClick={() => deleteDiscussion(active.id)}
                  style={{
                    padding: '5px 14px', borderRadius: 6, fontSize: 12, cursor: 'pointer',
                    background: '#EF4444', border: 'none', color: '#fff', fontWeight: 600,
                  }}
                >
                  Supprimer
                </button>
              </div>
            )}

            {/* [Item 14] Message search bar */}
            {messageSearchOpen && (
              <div style={{
                padding: '6px 20px', borderBottom: '1px solid var(--border-primary, #1e1e1e)',
                display: 'flex', gap: 8, alignItems: 'center', flexShrink: 0,
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 13, color: '#888' }}>search</span>
                <input
                  type="text"
                  placeholder="Rechercher dans la discussion..."
                  value={messageSearch}
                  onChange={e => setMessageSearch(e.target.value)}
                  autoFocus
                  style={{
                    flex: 1, background: 'none', border: 'none', outline: 'none',
                    color: 'var(--text-primary, #fff)', fontSize: 13, padding: '6px 0',
                  }}
                />
                <button
                  onClick={() => { setMessageSearchOpen(false); setMessageSearch(''); }}
                  style={{
                    background: 'none', border: 'none', color: '#888', cursor: 'pointer',
                    fontSize: 14, padding: '2px 4px',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 14 }}>close</span>
                </button>
              </div>
            )}

            {/* [Item 8] Depth Progress Bar */}
            {active.depth > 0 && (
              <div style={{
                padding: '6px 20px 8px', borderBottom: '1px solid var(--border-primary, #1e1e1e)',
                flexShrink: 0,
              }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 3 }}>
                  <span style={{ fontSize: 10, color: 'var(--text-secondary, #888)' }}>Profondeur</span>
                  <span style={{ fontSize: 10, color: '#a78bfa', fontWeight: 600 }}>
                    {getDepthMilestone(active.depth).label}
                  </span>
                </div>
                <div style={{ height: 3, borderRadius: 2, background: '#1e1e1e', overflow: 'hidden' }}>
                  <div style={{
                    height: '100%', borderRadius: 2,
                    background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                    width: `${getDepthMilestone(active.depth).progress}%`,
                    transition: 'width 0.6s ease',
                  }} />
                </div>
              </div>
            )}

            {/* Key Points Bar (if any) */}
            {active.keyPoints.length > 0 && (
              <div style={{
                padding: '8px 20px', borderBottom: '1px solid var(--border-primary, #1e1e1e)',
                display: 'flex', gap: 8, overflowX: 'auto', flexShrink: 0,
              }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary, #888)', whiteSpace: 'nowrap', lineHeight: '24px' }}>
                  Points clés:
                </span>
                {active.keyPoints.slice(-6).map(kp => (
                  <span
                    key={kp.id}
                    style={{
                      fontSize: 11, padding: '4px 10px', borderRadius: 12,
                      background: '#7c3aed22', color: '#A78BFA', whiteSpace: 'nowrap',
                      maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis',
                    }}
                    title={kp.text}
                  >
                    {kp.text}
                  </span>
                ))}
              </div>
            )}

            {/* Messages */}
            <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
              {active.messages.length === 0 && (
                <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-secondary, #888)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 48, marginBottom: 16, display: 'block', color: '#a78bfa' }}>{active.agentEmoji}</span>
                  <p style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
                    {active.agentName} est prêt
                  </p>
                  <p style={{ fontSize: 14, marginTop: 4 }}>
                    Posez votre première question pour commencer la discussion
                  </p>
                </div>
              )}

              {active.messages
                .map((msg, realIdx) => ({ msg, realIdx }))
                .filter(({ realIdx }) => !filteredMsgIndices || filteredMsgIndices.has(realIdx))
                .map(({ msg, realIdx }) => {
                  const msgKeyPoints = active.keyPoints.filter(kp => kp.messageIndex === realIdx);
                  const msgEvolution = active.evolutionNotes.filter(en => en.messageIndex === realIdx);
                  const isHighlighted = filteredMsgIndices?.has(realIdx);

                return (
                  // [Item 17] Message entrance animation
                  <div key={realIdx} style={{ animation: 'fadeSlideUp 0.25s ease' }}>
                    {/* Evolution marker before message */}
                    {msgEvolution.length > 0 && (
                      <div style={{
                        padding: '6px 12px', margin: '8px 0', borderRadius: 6,
                        background: '#22C55E11', borderLeft: '3px solid #22C55E44',
                        fontSize: 12, color: '#4ADE80',
                      }}>
                        {msgEvolution.map(e => (
                          <div key={e.id}>→ {e.text}</div>
                        ))}
                      </div>
                    )}

                    {/* Message bubble */}
                    <div
                      style={{
                        display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start',
                        marginBottom: 12,
                      }}
                      onMouseEnter={() => setMsgHoverIdx(realIdx)}
                      onMouseLeave={() => setMsgHoverIdx(-1)}
                    >
                      <div style={{
                        maxWidth: '80%', padding: '12px 16px', borderRadius: 12, position: 'relative',
                        background: msg.role === 'user'
                          ? 'linear-gradient(135deg, #7c3aed, #06b6d4)'
                          : 'var(--bg-secondary, #111)',
                        border: msg.role === 'assistant'
                          ? `1px solid ${isHighlighted ? '#FBBF24' : 'var(--border-primary, #1e1e1e)'}`
                          : 'none',
                        color: 'var(--text-primary, #fff)',
                      }}>
                        {/* Copy + Share buttons on hover */}
                        {msgHoverIdx === realIdx && (
                          <div style={{ position: 'absolute', top: 6, right: 6, display: 'flex', gap: 2 }}>
                            <button
                              onClick={() => copyMessage(msg.content)}
                              style={{
                                background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 4,
                                color: '#aaa', fontSize: 11, cursor: 'pointer', padding: '2px 6px',
                              }}
                              title="Copier"
                            >
                              <span className="material-symbols-rounded" style={{ fontSize: 12 }}>content_copy</span>
                            </button>
                            {msg.role === 'assistant' && (
                              <button
                                onClick={() => shareMessage(msg)}
                                style={{
                                  background: 'rgba(0,0,0,0.4)', border: 'none', borderRadius: 4,
                                  color: '#aaa', fontSize: 11, cursor: 'pointer', padding: '2px 6px',
                                }}
                                title="Partager"
                              >
                                ↗
                              </button>
                            )}
                          </div>
                        )}
                        {msg.role === 'assistant' && (
                          <div style={{ fontSize: 11, color: '#a78bfa', marginBottom: 4 }}>
                            <span className="material-symbols-rounded" style={{ fontSize: 12, color: '#a78bfa' }}>{active.agentEmoji}</span> {active.agentName}
                          </div>
                        )}
                        <div style={{ fontSize: 14, lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
                          {msg.content}
                        </div>
                        {/* [Item 7] Timestamp */}
                        <div style={{
                          fontSize: 10, color: msg.role === 'user' ? 'rgba(255,255,255,0.5)' : 'var(--text-secondary, #555)',
                          marginTop: 4, textAlign: msg.role === 'user' ? 'right' : 'left',
                        }}>
                          {formatTimestamp(msg.timestamp)}
                        </div>
                      </div>
                    </div>

                    {/* Key points after assistant message */}
                    {msg.role === 'assistant' && msgKeyPoints.length > 0 && (
                      <div style={{ marginBottom: 12, paddingLeft: 8 }}>
                        {msgKeyPoints.map(kp => (
                          <div
                            key={kp.id}
                            style={{
                              display: 'inline-flex', alignItems: 'center', gap: 6,
                              padding: '4px 12px', marginRight: 6, marginBottom: 4, borderRadius: 8,
                              background: '#7c3aed11', border: '1px solid #7c3aed33',
                              fontSize: 12, color: '#A78BFA',
                            }}
                          >
                            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>lightbulb</span> {kp.text}
                            <button
                              onClick={(e) => { e.stopPropagation(); shareKeyPoint(kp); }}
                              style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#A78BFA', fontSize: 11, padding: '0 2px', opacity: 0.6 }}
                              title="Partager"
                            >↗</button>
                          </div>
                        ))}
                      </div>
                    )}

                    {/* [Item 4] Sensitivity alert with dismiss */}
                    {msg.role === 'assistant' && sensitivityAlerts.filter(sa => sa.messageIndex === realIdx).map(sa => (
                      <div
                        key={sa.id}
                        style={{
                          margin: '4px 0 12px 8px', padding: '8px 14px', borderRadius: 8,
                          background: '#F59E0B11', border: '1px solid #F59E0B33',
                          display: 'flex', alignItems: 'center', gap: 8,
                          fontSize: 12, color: '#FBBF24',
                        }}
                      >
                        <span style={{ flex: 1 }}><span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle' }}>shield</span> Sujet sensible : {sa.topic}</span>
                        <button
                          onClick={() => setSensitivityAlerts(prev => prev.filter(a => a.id !== sa.id))}
                          style={{
                            background: 'none', border: 'none', color: '#FBBF24', cursor: 'pointer',
                            fontSize: 12, opacity: 0.6, padding: '0 2px',
                          }}
                          title="Fermer"
                        >
                          <span className="material-symbols-rounded" style={{ fontSize: 12 }}>close</span>
                        </button>
                      </div>
                    ))}
                  </div>
                );
              })}

              {/* [Item 13] Improved loading indicator */}
              {loading && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12, animation: 'fadeSlideUp 0.25s ease' }}>
                  <div style={{
                    padding: '12px 16px', borderRadius: 12,
                    background: 'var(--bg-secondary, #111)',
                    border: '1px solid var(--border-primary, #1e1e1e)',
                    color: 'var(--text-secondary, #888)', fontSize: 14,
                  }}>
                    <span className="typing-dots">{loadingText}</span>
                  </div>
                </div>
              )}

              {/* Retry button on error */}
              {!loading && lastSendError && retryCount < 2 && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginBottom: 12 }}>
                  <button
                    onClick={retryLastMessage}
                    style={{
                      padding: '8px 16px', borderRadius: 8, cursor: 'pointer',
                      background: '#EF444411', border: '1px solid #EF444433',
                      color: '#FCA5A5', fontSize: 13, fontWeight: 600,
                      display: 'flex', alignItems: 'center', gap: 6,
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 14 }}>refresh</span> Réessayer
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* [Item 11] Follow-ups redesigned as cards */}
            {followUps.length > 0 && !loading && (
              <div style={{
                padding: '10px 20px', borderTop: '1px solid var(--border-primary, #1e1e1e)',
                display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                gap: 8, flexShrink: 0,
              }}>
                {followUps.map((q, i) => (
                  <button
                    key={i}
                    onClick={() => sendMessage(q)}
                    style={{
                      padding: '10px 14px', borderRadius: 10, fontSize: 12, cursor: 'pointer',
                      background: 'var(--bg-secondary, #111)',
                      border: '1px solid #7c3aed33', textAlign: 'left',
                      color: 'var(--text-primary, #ddd)', transition: 'border-color 0.2s, transform 0.15s',
                      display: 'flex', alignItems: 'flex-start', gap: 8,
                    }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = '#7c3aed'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = '#7c3aed33'; e.currentTarget.style.transform = 'none'; }}
                  >
                    <span style={{ color: '#a78bfa', fontWeight: 700, fontSize: 11, flexShrink: 0 }}>Q{i + 1}</span>
                    <span style={{ lineHeight: 1.4 }}>{q}</span>
                  </button>
                ))}
              </div>
            )}

            {/* [Item 3] Paused state banner */}
            {active.status === 'paused' && (
              <div style={{
                padding: '8px 20px', borderTop: '1px solid #F59E0B33',
                background: '#F59E0B11', display: 'flex', alignItems: 'center', gap: 8,
                flexShrink: 0,
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 13 }}>pause</span>
                <span style={{ fontSize: 12, color: '#FBBF24', flex: 1 }}>
                  Discussion en pause — cliquez &quot;Reprendre&quot; pour continuer.
                </span>
              </div>
            )}

            {/* Input */}
            <div style={{
              padding: '12px 20px', borderTop: '1px solid var(--border-primary, #1e1e1e)',
              display: 'flex', gap: 8, flexShrink: 0,
            }}>
              <textarea
                ref={textareaRef}
                value={input}
                onChange={e => {
                  setInput(e.target.value);
                  // Auto-expand
                  const ta = e.target;
                  ta.style.height = 'auto';
                  ta.style.height = Math.min(ta.scrollHeight, 200) + 'px';
                }}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    sendMessage();
                    // Reset height after send
                    if (textareaRef.current) textareaRef.current.style.height = 'auto';
                  }
                }}
                placeholder={active.status === 'paused' || active.status === 'completed' ? 'Discussion terminée...' : 'Votre réflexion...'}
                disabled={loading || active.status === 'paused' || active.status === 'completed'}
                rows={2}
                style={{
                  flex: 1, padding: '10px 14px', borderRadius: 8, resize: 'none',
                  background: 'var(--bg-primary, #0a0a0a)',
                  border: '1px solid var(--border-primary, #1e1e1e)',
                  color: 'var(--text-primary, #fff)', fontSize: 14,
                  opacity: (active.status === 'paused' || active.status === 'completed') ? 0.5 : 1,
                }}
              />
              <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <button
                  id="deep-send-btn"
                  onClick={() => sendMessage()}
                  disabled={loading || !input.trim() || active.status === 'paused' || active.status === 'completed'}
                  style={{
                    padding: '10px 16px', borderRadius: 8, border: 'none', cursor: 'pointer',
                    background: input.trim() ? '#7c3aed' : '#333', color: '#fff',
                    fontWeight: 600, fontSize: 13, opacity: loading ? 0.5 : 1,
                  }}
                >
                  Envoyer
                </button>
                <button
                  onClick={() => {
                    if (active) {
                      const prompt = buildDeeperPrompt(active);
                      sendMessage(prompt);
                    }
                  }}
                  disabled={loading || active.messages.length === 0 || active.status === 'paused' || active.status === 'completed'}
                  style={{
                    padding: '8px 12px', borderRadius: 8, fontSize: 11, cursor: 'pointer',
                    background: 'var(--bg-secondary, #111)',
                    border: '1px solid #7c3aed33',
                    color: '#A78BFA', fontWeight: 600,
                    opacity: active.messages.length === 0 ? 0.3 : 1,
                  }}
                >
                  Approfondir
                </button>
              </div>
            </div>
          </>
        )}
      </div>}

      {/* ─── Wizard Modal ─── */}
      {wizardOpen && (
        <div
          style={{
            position: 'fixed', inset: 0, zIndex: 1000,
            background: 'rgba(0,0,0,0.7)', display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}
          onClick={e => { if (e.target === e.currentTarget) { setWizardOpen(false); pendingSendRef.current = null; } }}
        >
          <div style={{
            width: '100%', maxWidth: 520, borderRadius: isMobile ? 12 : 16, padding: isMobile ? '20px 16px' : '32px',
            background: 'var(--bg-secondary, #111)', border: '1px solid var(--border-primary, #1e1e1e)',
            margin: isMobile ? '0 12px' : 0, boxSizing: 'border-box' as const,
          }}>
            {wizardStep === 'input' && (
              <>
                <h2 style={{ margin: '0 0 4px', fontSize: 20, color: 'var(--text-primary, #fff)' }}>
                  Nouvelle discussion
                </h2>
                <p style={{ margin: '0 0 20px', fontSize: 14, color: 'var(--text-secondary, #888)' }}>
                  Décrivez le sujet que vous souhaitez explorer en profondeur
                </p>
                <textarea
                  value={wizardInput}
                  onChange={e => setWizardInput(e.target.value)}
                  placeholder="Ex: Le libre arbitre existe-t-il vraiment ?"
                  rows={4}
                  style={{
                    width: '100%', padding: '12px 14px', borderRadius: 8, resize: 'none',
                    background: 'var(--bg-primary, #0a0a0a)',
                    border: '1px solid var(--border-primary, #1e1e1e)',
                    color: 'var(--text-primary, #fff)', fontSize: 14,
                  }}
                  autoFocus
                  onKeyDown={e => {
                    if (e.key === 'Enter' && !e.shiftKey && wizardInput.trim()) {
                      e.preventDefault();
                      analyzeTopic();
                    }
                  }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 16, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setWizardOpen(false); pendingSendRef.current = null; }}
                    style={{
                      padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                      background: 'transparent', border: '1px solid var(--border-primary, #1e1e1e)',
                      color: 'var(--text-secondary, #888)', fontSize: 14,
                    }}
                  >
                    Annuler
                  </button>
                  <button
                    onClick={analyzeTopic}
                    disabled={!wizardInput.trim()}
                    style={{
                      padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                      background: wizardInput.trim() ? '#7c3aed' : '#333',
                      border: 'none', color: '#fff', fontWeight: 600, fontSize: 14,
                    }}
                  >
                    Analyser le sujet
                  </button>
                </div>
              </>
            )}

            {wizardStep === 'analyzing' && (
              <div style={{ textAlign: 'center', padding: '40px 0' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 48, marginBottom: 16, display: 'block' }}>search</span>
                <p style={{ fontSize: 16, color: 'var(--text-primary, #fff)', fontWeight: 600 }}>
                  Analyse en cours...
                </p>
                <p style={{ fontSize: 14, color: 'var(--text-secondary, #888)' }}>
                  Sélection du meilleur agent pour ce sujet
                </p>
              </div>
            )}

            {wizardStep === 'ready' && wizardResult && (
              <>
                <h2 style={{ margin: '0 0 20px', fontSize: 20, color: 'var(--text-primary, #fff)' }}>
                  Discussion prête
                </h2>

                {/* Agent card */}
                <div style={{
                  padding: '16px', borderRadius: 10, marginBottom: 16,
                  background: 'var(--bg-primary, #0a0a0a)', border: '1px solid #7c3aed33',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 36, color: '#a78bfa' }}>{wizardResult.agentEmoji}</span>
                    <div>
                      <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary, #fff)' }}>
                        {wizardResult.agentName}
                      </div>
                      <div style={{ fontSize: 12, color: 'var(--text-secondary, #888)', marginTop: 2 }}>
                        {wizardResult.reasoning}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Category + Title */}
                <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: 12, color: 'var(--text-secondary, #888)', display: 'block', marginBottom: 4 }}>
                      Catégorie
                    </label>
                    <select
                      value={wizardResult.category}
                      onChange={e => setWizardResult(prev => prev ? { ...prev, category: e.target.value as DiscussionCategory } : null)}
                      style={{
                        width: '100%', padding: '8px 10px', borderRadius: 6,
                        background: 'var(--bg-primary, #0a0a0a)',
                        border: '1px solid var(--border-primary, #1e1e1e)',
                        color: 'var(--text-primary, #fff)', fontSize: 13,
                      }}
                    >
                      {DISCUSSION_CATEGORIES.map(c => (
                        <option key={c.id} value={c.id}>{c.label}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div style={{ marginBottom: 16 }}>
                  <label style={{ fontSize: 12, color: 'var(--text-secondary, #888)', display: 'block', marginBottom: 4 }}>
                    Titre
                  </label>
                  <input
                    type="text"
                    value={wizardResult.suggestedTitle}
                    onChange={e => setWizardResult(prev => prev ? { ...prev, suggestedTitle: e.target.value } : null)}
                    style={{
                      width: '100%', padding: '8px 12px', borderRadius: 6,
                      background: 'var(--bg-primary, #0a0a0a)',
                      border: '1px solid var(--border-primary, #1e1e1e)',
                      color: 'var(--text-primary, #fff)', fontSize: 14,
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button
                    onClick={() => { setWizardStep('input'); setWizardResult(null); }}
                    style={{
                      padding: '10px 20px', borderRadius: 8, cursor: 'pointer',
                      background: 'transparent', border: '1px solid var(--border-primary, #1e1e1e)',
                      color: 'var(--text-secondary, #888)', fontSize: 14,
                    }}
                  >
                    Retour
                  </button>
                  <button
                    onClick={startDiscussion}
                    style={{
                      padding: '10px 24px', borderRadius: 8, cursor: 'pointer',
                      background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                      border: 'none', color: '#fff', fontWeight: 600, fontSize: 14,
                    }}
                  >
                    Commencer la discussion
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* ─── Share SlideOver ─── */}
      <SlideOver
        isOpen={shareOpen}
        onClose={() => setShareOpen(false)}
        title="Partager"
        subtitle={shareContent?.type === 'key_point' ? 'Point clé' : shareContent?.type === 'message_quote' ? 'Citation' : 'Discussion'}
        size="sm"
        footer={
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={() => setShareOpen(false)}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: 'transparent', border: '1px solid var(--border-primary, #1e1e1e)',
                color: 'var(--text-secondary, #888)', fontSize: 13,
              }}
            >
              Fermer
            </button>
            <button
              onClick={handleCopyShare}
              style={{
                flex: 1, padding: '10px', borderRadius: 8, cursor: 'pointer',
                background: '#7c3aed', border: 'none', color: '#fff', fontWeight: 600, fontSize: 13,
              }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>content_copy</span> Copier le texte
            </button>
          </div>
        }
      >
        {/* Preview */}
        <div style={{
          padding: 16, borderRadius: 10, marginBottom: 20,
          background: 'var(--bg-primary, #0a0a0a)', border: '1px solid var(--border-primary, #1e1e1e)',
          maxHeight: 200, overflowY: 'auto',
        }}>
          <p style={{ fontSize: 13, color: 'var(--text-primary, #fff)', lineHeight: 1.6, whiteSpace: 'pre-wrap', margin: 0 }}>
            {shareContent?.text}
          </p>
          <div style={{ fontSize: 11, color: 'var(--text-secondary, #888)', marginTop: 8 }}>
            — <span className="material-symbols-rounded" style={{ fontSize: 12, color: '#a78bfa' }}>{shareContent?.agentEmoji}</span> {shareContent?.agentName} · &quot;{shareContent?.discussionTitle}&quot;
          </div>
        </div>

        {/* Native share */}
        {typeof navigator !== 'undefined' && !!navigator.share && (
          <button
            onClick={handleNativeShare}
            style={{
              width: '100%', padding: '12px', borderRadius: 10, marginBottom: 12, cursor: 'pointer',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              border: 'none', color: '#fff', fontWeight: 600, fontSize: 14,
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 16 }}>share</span> Partager via le système
          </button>
        )}

        {/* Platform buttons */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginBottom: 16 }}>
          {SHARE_PLATFORMS.map(p => (
            <button
              key={p.id}
              onClick={() => handlePlatformShare(p.id)}
              style={{
                padding: '12px 16px', borderRadius: 10, cursor: 'pointer',
                background: `${p.color}12`, border: `1px solid ${p.color}33`,
                color: p.color, fontWeight: 600, fontSize: 13,
                display: 'flex', alignItems: 'center', gap: 8, justifyContent: 'center',
                transition: 'all 0.15s',
              }}
              onMouseEnter={e => { e.currentTarget.style.background = `${p.color}22`; e.currentTarget.style.borderColor = `${p.color}66`; }}
              onMouseLeave={e => { e.currentTarget.style.background = `${p.color}12`; e.currentTarget.style.borderColor = `${p.color}33`; }}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{p.materialIcon}</span> {p.label}
            </button>
          ))}
        </div>

        {/* Connected platforms info */}
        {connectedPlatforms.length > 0 && (
          <div style={{ fontSize: 11, color: 'var(--text-secondary, #666)', display: 'flex', alignItems: 'center', gap: 6, padding: '8px 0', borderTop: '1px solid var(--border-primary, #1e1e1e)' }}>
            <span>Comptes connectés :</span>
            {connectedPlatforms.map(p => (
              <span key={p.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 3, padding: '2px 8px', borderRadius: 10, background: `${p.color}11`, color: p.color, fontSize: 10, fontWeight: 600 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{p.materialIcon}</span> {p.label}
              </span>
            ))}
          </div>
        )}
      </SlideOver>

      {/* Inline animation keyframes */}
      <style>{`
        @keyframes fadeSlideUp {
          from { opacity: 0; transform: translateY(8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </div>
  );
}
