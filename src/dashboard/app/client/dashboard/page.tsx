'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getActiveAgentIds, DEFAULT_AGENTS } from '../../../lib/agent-config';
import type { AgentTypeId } from '../../../lib/agent-config';
import FreenzyWelcome from '../../../components/FreenzyWelcome';
import { useToast } from '../../../components/Toast';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import PageExplanation from '../../../components/PageExplanation';
import { QUICK_ACTIONS, FEATURE_SECTIONS, PAGE_META } from '../../../lib/emoji-map';

// ─── Types ───

interface TodoItem { id: string; text: string; done: boolean; }

interface UsageStats {
  totalMessages: number;
  totalDocuments: number;
  streak: number;
}

// ─── Helpers ───

function uid(): string { return Math.random().toString(36).slice(2, 9); }

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

// ─── ClickUp-style shared styles ───

const CU = {
  card: {
    background: 'var(--fz-bg, #fff)',
    border: 'none',
    borderRadius: 'var(--fz-radius-md, 8px)',
    boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
    transition: 'all 0.15s ease',
  } as React.CSSProperties,
  cardHover: {
    background: 'var(--fz-bg, #fff)',
    border: 'none',
    borderRadius: 'var(--fz-radius-md, 8px)',
    boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
    transition: 'all 0.15s ease',
    cursor: 'pointer',
  } as React.CSSProperties,
  sectionHeader: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  } as React.CSSProperties,
  sectionTitle: {
    fontSize: 14,
    fontWeight: 600,
    color: 'var(--fz-text, #1E293B)',
    lineHeight: 1.3,
  } as React.CSSProperties,
  sectionSub: {
    fontSize: 12,
    color: 'var(--fz-text-muted, #94A3B8)',
    lineHeight: 1.3,
  } as React.CSSProperties,
  kpiLabel: {
    fontSize: 11,
    fontWeight: 600,
    color: 'var(--fz-text-muted, #94A3B8)',
    textTransform: 'uppercase' as const,
    letterSpacing: '0.04em',
  },
  kpiValue: {
    fontSize: 20,
    fontWeight: 700,
    color: 'var(--fz-text, #1E293B)',
    lineHeight: 1.2,
  } as React.CSSProperties,
  kpiMeta: {
    fontSize: 11,
    color: 'var(--fz-text-muted, #94A3B8)',
    marginTop: 2,
  } as React.CSSProperties,
  btn: {
    height: 36,
    padding: '0 12px',
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
  } as React.CSSProperties,
  btnGhost: {
    height: 36,
    padding: '0 12px',
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
    background: 'transparent',
    color: 'var(--fz-text-secondary, #64748B)',
  } as React.CSSProperties,
  btnPrimary: {
    height: 36,
    padding: '0 12px',
    borderRadius: 6,
    fontWeight: 500,
    fontSize: 13,
    border: 'none',
    cursor: 'pointer',
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    transition: 'all 0.15s ease',
    background: 'var(--fz-accent, #0EA5E9)',
    color: '#fff',
    minWidth: 36,
  } as React.CSSProperties,
  input: {
    height: 36,
    padding: '0 10px',
    borderRadius: 6,
    border: '1px solid var(--fz-border, #E2E8F0)',
    background: 'var(--fz-bg, #fff)',
    color: 'var(--fz-text, #1E293B)',
    fontSize: 13,
    outline: 'none',
    transition: 'border-color 0.15s ease',
  } as React.CSSProperties,
};

// ─── Component ───

export default function ClientDashboard() {
  const { showError } = useToast();
  const isMobile = useIsMobile();
  const [stats, setStats] = useState<UsageStats>({ totalMessages: 0, totalDocuments: 0, streak: 0 });
  const [walletBalance, setWalletBalance] = useState<number>(0);
  const [activeAgentIds, setActiveAgentIds] = useState<AgentTypeId[]>(['fz-repondeur']);
  const [showWelcome, setShowWelcome] = useState(false);
  const [hasProfile, setHasProfile] = useState(false);

  // ─── Todos from journee ───
  const [todos, setTodos] = useState<TodoItem[]>([]);
  const [newTodo, setNewTodo] = useState('');
  const [priorities, setPriorities] = useState<string[]>(['', '', '']);

  // ─── Briefing ───
  const [briefing, setBriefing] = useState('');
  const [briefingLoading, setBriefingLoading] = useState(false);
  const [briefingLoaded, setBriefingLoaded] = useState(false);
  const [briefingTime, setBriefingTime] = useState('');
  const [showBriefing, setShowBriefing] = useState(true);

  useEffect(() => {
    loadStats();
    loadWallet();
    setActiveAgentIds(getActiveAgentIds());
    checkProfile();
    checkWelcome();
    loadTodos();
    loadPriorities();
    loadBriefingWithCache();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  function checkWelcome() {
    try {
      if (localStorage.getItem('fz_welcome_pending') === 'true') {
        setShowWelcome(true);
        localStorage.removeItem('fz_welcome_pending');
      }
    } catch {}
  }

  function checkProfile() {
    try {
      const p = localStorage.getItem('fz_company_profile');
      setHasProfile(!!p && p !== '{}');
    } catch {}
  }

  // ─── Remind me later system ───
  const [dismissals, setDismissals] = useState<Record<string, string>>({});
  const [showRemindMenu, setShowRemindMenu] = useState<string | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fz_dismissals') ?? '{}');
      setDismissals(saved);
    } catch {}
  }, []);

  function isDismissed(key: string): boolean {
    const until = dismissals[key];
    if (!until) return false;
    return new Date(until).getTime() > Date.now();
  }

  function dismissFor(key: string, days: number) {
    const until = new Date(Date.now() + days * 86400000).toISOString();
    const updated = { ...dismissals, [key]: until };
    setDismissals(updated);
    localStorage.setItem('fz_dismissals', JSON.stringify(updated));
    setShowRemindMenu(null);
  }

  function loadStats() {
    try {
      const gam = JSON.parse(localStorage.getItem('fz_gamification') ?? '{}');
      const docs = JSON.parse(localStorage.getItem('fz_docs') ?? '[]');
      setStats({
        totalMessages: gam.totalMessages ?? 0,
        totalDocuments: Array.isArray(docs) ? docs.length : 0,
        streak: gam.streak ?? 0,
      });
    } catch {}
  }

  async function loadWallet() {
    const session = getSession();
    if (!session.token) return;
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/portal/wallet', token: session.token, method: 'GET' }),
      });
      const data = await res.json();
      setWalletBalance(data.balance ?? data.wallet?.balance ?? 0);
    } catch (e) { showError(e instanceof Error ? e.message : 'Erreur chargement solde'); }
  }

  // ─── Todos persistence ───

  function loadTodos() {
    try {
      const saved = JSON.parse(localStorage.getItem('fz_journee_data') ?? '{}');
      if (Array.isArray(saved.todos)) setTodos(saved.todos);
    } catch {}
  }

  const saveTodos = useCallback((items: TodoItem[]) => {
    setTodos(items);
    try {
      const saved = JSON.parse(localStorage.getItem('fz_journee_data') ?? '{}');
      saved.todos = items;
      localStorage.setItem('fz_journee_data', JSON.stringify(saved));
    } catch {}
  }, []);

  function addTodo() {
    if (!newTodo.trim()) return;
    const updated = [...todos, { id: uid(), text: newTodo.trim(), done: false }];
    saveTodos(updated);
    setNewTodo('');
  }

  function toggleTodo(id: string) {
    saveTodos(todos.map(t => t.id === id ? { ...t, done: !t.done } : t));
  }

  function removeTodo(id: string) {
    saveTodos(todos.filter(t => t.id !== id));
  }

  // ─── Priorities persistence ───

  function loadPriorities() {
    try {
      const saved = JSON.parse(localStorage.getItem('fz_journee_data') ?? '{}');
      if (Array.isArray(saved.priorites)) {
        setPriorities(saved.priorites.map((p: { text?: string }) => p.text || ''));
      }
    } catch {}
  }

  function updatePriority(idx: number, text: string) {
    const updated = [...priorities];
    updated[idx] = text;
    setPriorities(updated);
    try {
      const saved = JSON.parse(localStorage.getItem('fz_journee_data') ?? '{}');
      if (!Array.isArray(saved.priorites)) {
        saved.priorites = [
          { id: uid(), text: '', rank: 1 },
          { id: uid(), text: '', rank: 2 },
          { id: uid(), text: '', rank: 3 },
        ];
      }
      saved.priorites[idx] = { ...saved.priorites[idx], text };
      localStorage.setItem('fz_journee_data', JSON.stringify(saved));
    } catch {}
  }

  // ─── Briefing ───

  const BRIEFING_CACHE_KEY = 'fz_briefing_cache';

  function loadBriefingWithCache() {
    const s = getSession();
    if (!s.token) return;
    const todayKey = new Date().toISOString().split('T')[0];
    try {
      const cached = JSON.parse(localStorage.getItem(BRIEFING_CACHE_KEY) ?? '{}');
      if (cached.date === todayKey && cached.content) {
        setBriefing(cached.content);
        setBriefingLoaded(true);
        setBriefingTime(cached.generatedAt || '');
        return;
      }
    } catch {}
    loadBriefing();
  }

  async function loadBriefing() {
    const s = getSession();
    if (!s.token) return;
    setBriefingLoading(true);
    try {
      const today = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
      const companyProfile = localStorage.getItem('fz_company_profile') || 'Non renseigne';
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          token: s.token,
          model: 'claude-sonnet-4-20250514',
          messages: [{ role: 'user', content: `Tu es l'assistante IA de Freenzy. Nous sommes le ${today}. Genere un briefing du jour concis (max 4 lignes). Contexte: ${companyProfile}. Stats: ${stats.totalMessages} messages, ${stats.totalDocuments} docs, streak ${stats.streak}j, ${activeAgentIds.length} assistants. Structure: 1 salutation + 2-3 priorites concretes. Sois directe et actionnable. Francais.` }],
          maxTokens: 300,
          agentName: 'fz-dg',
        }),
      });
      if (!res.ok) { setBriefing('Service temporairement indisponible.'); return; }
      const data = await res.json();
      const content = data.content ?? data.text ?? '';
      setBriefing(content);
      setBriefingLoaded(true);
      const timeStr = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
      setBriefingTime(timeStr);
      try {
        localStorage.setItem(BRIEFING_CACHE_KEY, JSON.stringify({
          date: new Date().toISOString().split('T')[0], content, generatedAt: timeStr,
        }));
      } catch {}
    } catch { setBriefing('Connectez-vous pour votre briefing.'); }
    finally { setBriefingLoading(false); }
  }

  function refreshBriefing() {
    try { localStorage.removeItem(BRIEFING_CACHE_KEY); } catch {}
    setBriefingLoaded(false);
    setBriefingTime('');
    loadBriefing();
  }

  // ─── Derived ───

  const session = getSession();
  const userName = session.name || session.email?.split('@')[0] || '';
  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Bonjour' : hour < 18 ? 'Bon apres-midi' : 'Bonsoir';
  const todayStr = new Date().toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long' });
  const credits = walletBalance / 1_000_000;
  const averageDaily = Math.max(1, Math.round(credits > 0 ? credits / Math.max(stats.streak, 1) : 0));
  const daysLeft = averageDaily > 0 ? Math.round(credits / averageDaily) : 0;
  const activeAgents = activeAgentIds.map(id => DEFAULT_AGENTS.find(a => a.id === id)).filter(Boolean);
  const todosDone = todos.filter(t => t.done).length;
  const todosTotal = todos.length;

  return (
    <div style={{ padding: isMobile ? '16px 12px 32px' : '24px 32px 40px', maxWidth: 1100, margin: '0 auto' }}>
      {showWelcome && (
        <FreenzyWelcome userName={userName} tier={session.tier || 'guest'} onDismiss={() => setShowWelcome(false)} />
      )}

      {/* ── Greeting Header — compact single row ── */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
        <span style={{ fontSize: 20, lineHeight: 1 }}>👋</span>
        <div style={{ display: 'flex', flexDirection: 'column' }}>
          <span style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text, #1E293B)', lineHeight: 1.3 }}>
            {greeting}, {userName || 'cher client'}
          </span>
          <span style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', lineHeight: 1.3 }}>
            {todayStr}
          </span>
        </div>
      </div>
      <PageExplanation pageId="dashboard" text={PAGE_META.dashboard?.helpText} />

      {/* ── Onboarding banner ── */}
      {!hasProfile && !isDismissed('onboarding') && (
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10, padding: '8px 12px', marginBottom: 12,
          background: 'rgba(14,165,233,0.04)', borderRadius: 'var(--fz-radius-md, 8px)',
          boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
          border: 'none',
        }}>
          <span style={{ fontSize: 16 }}>🏗️</span>
          <span style={{ flex: 1, fontSize: 12, color: 'var(--fz-text-secondary, #64748B)' }}>Complétez votre profil pour des résultats optimaux</span>
          <Link href="/client/onboarding" style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-accent, #0EA5E9)', textDecoration: 'none', whiteSpace: 'nowrap' }}>
            Configurer →
          </Link>
          <button onClick={() => dismissFor('onboarding', 3)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: '0 2px', fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)' }}>×</button>
        </div>
      )}

      {/* ── KPI Cards ── */}
      <div style={{
        display: 'grid',
        gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
        gap: 12,
        marginBottom: 16,
      }}>
        <Link href="/client/account" style={{
          ...CU.cardHover, textDecoration: 'none', padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>💰</span>
          <div>
            <div style={CU.kpiLabel}>Crédits</div>
            <div style={CU.kpiValue}>{credits.toFixed(1)}</div>
            <div style={CU.kpiMeta}>
              {daysLeft > 0 ? `~${daysLeft}j · ${averageDaily}/j` : 'Rechargez'}
            </div>
          </div>
        </Link>
        <div style={{ ...CU.card, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>💬</span>
          <div>
            <div style={CU.kpiLabel}>Messages</div>
            <div style={CU.kpiValue}>{stats.totalMessages}</div>
            <div style={CU.kpiMeta}>Conversations</div>
          </div>
        </div>
        <Link href="/client/agents" style={{
          ...CU.cardHover, textDecoration: 'none', padding: '12px 14px',
          display: 'flex', alignItems: 'flex-start', gap: 10,
        }}>
          <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>🤖</span>
          <div>
            <div style={CU.kpiLabel}>Assistants</div>
            <div style={CU.kpiValue}>{activeAgents.length}</div>
            <div style={CU.kpiMeta}>sur {DEFAULT_AGENTS.length}</div>
          </div>
        </Link>
        <div style={{ ...CU.card, padding: '12px 14px', display: 'flex', alignItems: 'flex-start', gap: 10 }}>
          <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0, marginTop: 2 }}>🔥</span>
          <div>
            <div style={CU.kpiLabel}>Streak</div>
            <div style={CU.kpiValue}>{stats.streak}j</div>
            <div style={CU.kpiMeta}>Jours consécutifs</div>
          </div>
        </div>
      </div>

      {/* ── AI Briefing ── */}
      <div style={{ ...CU.card, padding: '12px 16px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>🧠</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>Briefing IA du jour</span>
            <HelpBubble text="Chaque matin, votre IA analyse votre activité et vous propose un résumé actionnable." />
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            {briefingTime && <span style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)' }}>Mis à jour à {briefingTime}</span>}
            <button
              onClick={refreshBriefing}
              disabled={briefingLoading}
              style={{
                ...CU.btnGhost,
                opacity: briefingLoading ? 0.6 : 1,
              }}
            >
              {briefingLoading ? '⏳' : '🔄'} {briefingLoading ? 'Génération...' : 'Actualiser'}
            </button>
          </div>
        </div>
        {briefingLoading && !briefingLoaded ? (
          <div style={{ padding: '12px 0', color: 'var(--fz-text-muted, #94A3B8)', fontSize: 13, fontStyle: 'italic' }}>
            ⏳ Votre briefing IA est en cours de génération...
          </div>
        ) : briefing ? (
          <div style={{
            fontSize: 13, lineHeight: 1.7, color: 'var(--fz-text-secondary, #64748B)',
            background: 'var(--fz-bg-secondary, #F8FAFC)', borderRadius: 'var(--fz-radius-md, 8px)', padding: '12px 16px',
            whiteSpace: 'pre-wrap',
          }}>
            {briefing}
          </div>
        ) : (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <div style={{ fontSize: 40, marginBottom: 8 }}>🧠</div>
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 4 }}>Briefing IA</div>
            <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)' }}>
              Connectez-vous pour recevoir votre briefing quotidien.
            </div>
          </div>
        )}
      </div>

      {/* ── Quick Actions ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>⚡</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)', flex: 1 }}>Actions rapides</span>
          <HelpBubble text="Accédez directement aux fonctionnalités les plus utilisées." />
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
          gap: 12,
        }}>
          {QUICK_ACTIONS.map(action => (
            <Link key={action.href} href={action.href} style={{
              ...CU.cardHover, textDecoration: 'none', padding: '14px 16px',
              display: 'flex', alignItems: 'center', gap: 12,
            }}>
              <span style={{ fontSize: 28, flexShrink: 0 }}>{action.emoji}</span>
              <div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{action.label}</div>
                <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>{action.desc}</div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* ── Todos & Priorities ── */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 16, marginBottom: 24 }}>
        {/* Todos */}
        <div style={{ ...CU.card, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>✅</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)', flex: 1 }}>
              Tâches du jour {todosTotal > 0 && <span style={{ fontWeight: 500, color: 'var(--fz-text-muted, #94A3B8)' }}>({todosDone}/{todosTotal})</span>}
            </span>
            <HelpBubble text="Ajoutez vos tâches pour la journée. Elles sont sauvegardées automatiquement." />
          </div>
          <div style={{ display: 'flex', gap: 8, marginBottom: 12 }}>
            <input
              type="text"
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addTodo()}
              placeholder="Ajouter une tâche..."
              style={{ ...CU.input, flex: 1 }}
            />
            <button onClick={addTodo} style={CU.btnPrimary}>+</button>
          </div>
          <div style={{ maxHeight: 200, overflowY: 'auto' }}>
            {todos.length === 0 && (
              <div style={{ textAlign: 'center', padding: '16px 0' }}>
                <div style={{ fontSize: 40, marginBottom: 4 }}>✅</div>
                <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--fz-text, #1E293B)', marginBottom: 2 }}>Aucune tâche</div>
                <div style={{ fontSize: 13, color: 'var(--fz-text-muted, #94A3B8)' }}>Ajoutez-en une ci-dessus</div>
              </div>
            )}
            {todos.map(todo => (
              <div key={todo.id} style={{
                display: 'flex', alignItems: 'center', gap: 8, padding: '6px 0',
                borderBottom: '1px solid var(--fz-border-light, #F1F5F9)',
              }}>
                <button onClick={() => toggleTodo(todo.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 16, padding: 0,
                }}>
                  {todo.done ? '✅' : '⬜'}
                </button>
                <span style={{
                  flex: 1, fontSize: 13, color: 'var(--fz-text, #1E293B)',
                  textDecoration: todo.done ? 'line-through' : 'none',
                  opacity: todo.done ? 0.5 : 1,
                }}>
                  {todo.text}
                </span>
                <button onClick={() => removeTodo(todo.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--fz-text-muted, #94A3B8)',
                  padding: '0 4px',
                }}>
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {/* Priorities */}
        <div style={{ ...CU.card, padding: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
            <span style={{ fontSize: 16 }}>🎯</span>
            <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)', flex: 1 }}>3 priorités du jour</span>
            <HelpBubble text="Définissez vos 3 objectifs principaux. Restez concentré sur l'essentiel." />
          </div>
          {[0, 1, 2].map(idx => (
            <div key={idx} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
              <span style={{
                width: 24, height: 24, borderRadius: '50%',
                background: idx === 0 ? '#ef4444' : idx === 1 ? '#f59e0b' : '#22c55e',
                color: '#fff', fontSize: 12, fontWeight: 800,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                {idx + 1}
              </span>
              <input
                type="text"
                value={priorities[idx] || ''}
                onChange={e => updatePriority(idx, e.target.value)}
                placeholder={`Priorité n°${idx + 1}...`}
                style={{ ...CU.input, flex: 1 }}
              />
            </div>
          ))}
        </div>
      </div>

      {/* ── Feature Sections Grid ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
          <span style={{ fontSize: 16 }}>🧭</span>
          <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)', flex: 1 }}>Toutes vos fonctionnalités</span>
          <HelpBubble text="Retrouvez ici l'ensemble des outils disponibles dans votre espace Freenzy." />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FEATURE_SECTIONS.map(section => (
            <div key={section.id} style={{
              ...CU.card,
              padding: 0,
              overflow: 'hidden',
            }}>
              <div style={{
                display: 'flex', alignItems: 'center', gap: 10,
                padding: '12px 16px',
                borderBottom: '1px solid var(--fz-border-light, #F1F5F9)',
                background: 'var(--fz-bg-secondary, #F8FAFC)',
              }}>
                <span style={{ fontSize: 16 }}>{section.emoji}</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>
                    {section.title}
                    {section.proOnly && <span style={{ fontSize: 10, fontWeight: 700, color: 'var(--fz-accent, #0EA5E9)', marginLeft: 8, padding: '1px 6px', background: 'rgba(14,165,233,0.08)', borderRadius: 4 }}>PRO</span>}
                  </div>
                  <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)' }}>{section.subtitle}</div>
                </div>
              </div>
              <div style={{
                display: 'grid',
                gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(auto-fill, minmax(160px, 1fr))',
                gap: 0,
              }}>
                {section.items.map(item => (
                  <Link key={item.id} href={item.href} style={{
                    textDecoration: 'none',
                    display: 'flex', alignItems: 'center', gap: 10,
                    padding: '12px 16px',
                    borderBottom: '1px solid var(--fz-border-light, #F1F5F9)',
                    transition: 'background 0.15s ease',
                    color: 'inherit',
                  }}>
                    <span style={{ fontSize: 22, flexShrink: 0 }}>{item.emoji}</span>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>{item.label}</div>
                      <div style={{ fontSize: 11, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 1 }}>{item.desc}</div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Referral banner ── */}
      {!isDismissed('referral') && (
        <div style={{
          ...CU.card,
          display: 'flex', alignItems: 'center', gap: 12, padding: '14px 18px', marginBottom: 16,
          background: 'linear-gradient(135deg, rgba(249,115,22,0.06), rgba(234,179,8,0.04))',
        }}>
          <Link href="/client/referrals" style={{ display: 'flex', alignItems: 'center', gap: 12, flex: 1, textDecoration: 'none', color: 'inherit' }}>
            <span style={{ fontSize: 28 }}>🎁</span>
            <div>
              <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--fz-text, #1E293B)' }}>Invitez un ami, gagnez 20€</div>
              <div style={{ fontSize: 12, color: 'var(--fz-text-muted, #94A3B8)', marginTop: 2 }}>Parrainage illimité — crédits offerts pour les deux</div>
            </div>
          </Link>
          <button onClick={() => dismissFor('referral', 7)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, fontSize: 16, color: 'var(--fz-text-muted, #94A3B8)' }}>
            ×
          </button>
        </div>
      )}
    </div>
  );
}
