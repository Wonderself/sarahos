'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getActiveAgentIds, DEFAULT_AGENTS } from '../../../lib/agent-config';
import type { AgentTypeId } from '../../../lib/agent-config';
import FreenzyWelcome from '../../../components/FreenzyWelcome';
import { useToast } from '../../../components/Toast';
import { useIsMobile } from '../../../lib/use-media-query';
import HomeScreenIcon from '../../../components/HomeScreenIcon';
import { KpiWidget, BriefingWidget, TasksWidget } from '../../../components/HomeScreenWidget';
import { DEFAULT_APPS, loadLayout, saveLayout, getOrderedApps, getAppsBySection, getDockApps } from '../../../lib/home-screen-apps';
import type { HomeScreenLayout } from '../../../lib/home-screen-apps';

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
          messages: [{ role: 'user', content: `Tu es l'assistante IA de Freenzy. Nous sommes le ${today}. Genere un briefing du jour concis (max 4 lignes). Contexte: ${companyProfile}. Stats: ${stats.totalMessages} messages, ${stats.totalDocuments} docs, streak ${stats.streak}j, ${activeAgentIds.length} agents. Structure: 1 salutation + 2-3 priorites concretes. Sois directe et actionnable. Francais.` }],
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

  // ─── Home Screen state ───
  const [layout, setLayout] = useState<HomeScreenLayout | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  useEffect(() => {
    setLayout(loadLayout());
  }, []);

  const orderedApps = layout ? getOrderedApps(layout) : DEFAULT_APPS;
  const sections = getAppsBySection(orderedApps);
  const dockApps = layout ? getDockApps(layout) : [];
  const dockIds = new Set(layout?.dockApps ?? []);

  // ─── Drag handlers ───

  function handleDragStart(_e: React.DragEvent<HTMLDivElement>, id: string) {
    setDraggedId(id);
  }

  function handleDragOver(_e: React.DragEvent<HTMLDivElement>, id: string) {
    if (draggedId && draggedId !== id) setDragOverId(id);
  }

  function handleDrop(_e: React.DragEvent<HTMLDivElement>, targetId: string) {
    if (!layout || !draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }
    const order = [...layout.appOrder];
    const fromIdx = order.indexOf(draggedId);
    const toIdx = order.indexOf(targetId);
    if (fromIdx === -1 || toIdx === -1) return;
    order.splice(fromIdx, 1);
    order.splice(toIdx, 0, draggedId);
    const updated = { ...layout, appOrder: order };
    setLayout(updated);
    saveLayout(updated);
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleDragEnd() {
    setDraggedId(null);
    setDragOverId(null);
  }

  function handleLongPress() {
    setIsEditing(true);
  }

  return (
    <>
      <div className={`client-page-scrollable hs-container${isEditing ? ' hs-editing' : ''}`}>
        {showWelcome && (
          <FreenzyWelcome userName={userName} tier={session.tier || 'guest'} onDismiss={() => setShowWelcome(false)} />
        )}

        {/* ── Status Bar ── */}
        <div className="hs-status-bar">
          <div className="hs-status-left">
            {greeting}, {userName || 'cher client'}
          </div>
          <div className="hs-status-right">
            <div className="hs-credits-pill">
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>toll</span>
              {credits.toFixed(1)}
            </div>
            <Link href="/client/notifications" style={{ color: 'inherit', textDecoration: 'none', display: 'flex' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 20 }}>notifications</span>
            </Link>
          </div>
        </div>

        {/* ── Edit mode bar ── */}
        {isEditing && (
          <div className="hs-edit-bar">
            <span>Maintenez et deplacez pour reorganiser</span>
            <button className="hs-done-btn" onClick={() => setIsEditing(false)}>Terminer</button>
          </div>
        )}

        {/* ── Onboarding banner (new user only) ── */}
        {!hasProfile && !isDismissed('onboarding') && (
          <div style={{
            padding: '12px 14px', marginBottom: 12,
            background: 'linear-gradient(135deg, rgba(124,58,237,0.08), rgba(6,182,212,0.05))',
            border: '1px solid rgba(124,58,237,0.15)', borderRadius: 16,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#a78bfa' }}>domain</span>
              <div style={{ flex: 1 }}>
                <div style={{ fontSize: 13, fontWeight: 700, color: '#fff' }}>Configurez votre profil entreprise</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>5 minutes pour booster vos agents IA</div>
              </div>
              <Link href="/client/onboarding" style={{
                background: '#7c3aed', border: 'none', borderRadius: 10, padding: '6px 12px',
                color: '#fff', fontSize: 11, fontWeight: 600, textDecoration: 'none',
              }}>
                Configurer
              </Link>
              <button onClick={() => dismissFor('onboarding', 3)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
                <span className="material-symbols-rounded" style={{ fontSize: 16, color: 'rgba(255,255,255,0.3)' }}>close</span>
              </button>
            </div>
          </div>
        )}

        {/* ── Widget Zone ── */}
        <div className="hs-widget-zone">
          <KpiWidget
            credits={credits}
            messages={stats.totalMessages}
            activeAgents={activeAgents.length}
            streak={stats.streak}
          />
          <BriefingWidget
            briefing={briefing}
            loading={briefingLoading}
            onLoad={loadBriefing}
          />
          {todos.length > 0 && (
            <TasksWidget tasks={todos} onToggle={toggleTodo} />
          )}
        </div>

        {/* ── App Grid by section ── */}
        {sections.map(sec => (
          <div key={sec.section}>
            <div className="hs-section-title">{sec.title}</div>
            <div className="hs-grid">
              {sec.apps
                .filter(app => !dockIds.has(app.id))
                .map(app => (
                  <HomeScreenIcon
                    key={app.id}
                    app={app}
                    isEditing={isEditing}
                    onLongPress={handleLongPress}
                    draggable={isEditing}
                    onDragStart={handleDragStart}
                    onDragOver={handleDragOver}
                    onDrop={handleDrop}
                    onDragEnd={handleDragEnd}
                    isDragging={draggedId === app.id}
                    isDragOver={dragOverId === app.id}
                  />
                ))}
            </div>
          </div>
        ))}

        {/* ── Referral banner ── */}
        {!isDismissed('referral') && (
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, padding: '10px 14px', marginTop: 8,
            background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.06)',
            borderRadius: 14,
          }}>
            <Link href="/client/referrals" style={{ display: 'flex', alignItems: 'center', gap: 10, flex: 1, textDecoration: 'none', color: 'inherit' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#f97316' }}>redeem</span>
              <div>
                <span style={{ fontSize: 12, fontWeight: 700, color: '#fff' }}>Invitez un ami</span>
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 8 }}>+20 EUR</span>
              </div>
            </Link>
            <button onClick={() => dismissFor('referral', 7)} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 2 }}>
              <span className="material-symbols-rounded" style={{ fontSize: 14, color: 'rgba(255,255,255,0.3)' }}>close</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Dock (fixed bottom) ── */}
      {dockApps.length > 0 && (
        <div className="hs-dock">
          {dockApps.map(app => (
            <HomeScreenIcon key={app.id} app={app} />
          ))}
        </div>
      )}
    </>
  );
}
