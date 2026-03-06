'use client';

import { useState, useEffect, useCallback } from 'react';
import Link from 'next/link';
import { getActiveAgentIds, DEFAULT_AGENTS } from '../../../lib/agent-config';
import type { AgentTypeId } from '../../../lib/agent-config';
import FreenzyWelcome from '../../../components/FreenzyWelcome';
import { useToast } from '../../../components/Toast';

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

  function loadStats() {
    try {
      const gam = JSON.parse(localStorage.getItem('fz_gamification') ?? '{}');
      const docs = JSON.parse(localStorage.getItem('fz_docs') ?? '[]');
      setStats({
        totalMessages: gam.totalMessages ?? 0,
        totalDocuments: docs.length ?? 0,
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
  const activeAgents = activeAgentIds.map(id => DEFAULT_AGENTS.find(a => a.id === id)).filter(Boolean);
  const todosDone = todos.filter(t => t.done).length;
  const todosTotal = todos.length;

  return (
    <div className="client-page-scrollable">
      {showWelcome && (
        <FreenzyWelcome userName={userName} tier={session.tier || 'guest'} onDismiss={() => setShowWelcome(false)} />
      )}

      {/* ── Header compact ── */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 900, letterSpacing: '-0.04em', color: 'var(--text-primary)' }}>
            {greeting}, <span style={{ color: 'var(--accent)' }}>{userName || 'cher client'}</span>
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>
            {todayStr}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
          {activeAgents.slice(0, 3).map(a => a && (
            <div key={a.id} title={a.name} style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: a.color + '22', border: `1px solid ${a.color}44`, fontSize: 14,
            }}>{a.emoji}</div>
          ))}
          {activeAgents.length > 3 && (
            <div style={{
              width: 28, height: 28, borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: 'var(--bg-tertiary)', fontSize: 11, fontWeight: 700, color: 'var(--text-muted)',
            }}>+{activeAgents.length - 3}</div>
          )}
        </div>
      </div>

      {/* ── Onboarding banner (new user only) ── */}
      {!hasProfile && (
        <Link href="/client/onboarding" style={{
          display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', marginBottom: 12,
          background: 'linear-gradient(135deg, #6366f10d, #a855f708)',
          border: '2px solid #6366f130', borderRadius: 12, textDecoration: 'none', color: 'inherit',
        }}>
          <span style={{ fontSize: 24 }}>🏢</span>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 14, fontWeight: 700 }}>Configurez votre profil entreprise</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Vos agents seront plus pertinents avec du contexte</div>
          </div>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>Configurer &rarr;</span>
        </Link>
      )}

      {/* ── 4 KPIs ── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 8, marginBottom: 12 }}>
        {[
          { label: 'Credits', value: credits.toFixed(1), color: credits > 30 ? '#22c55e' : credits > 10 ? '#f59e0b' : '#ef4444', sub: 'disponibles' },
          { label: 'Messages', value: String(stats.totalMessages), color: '#6366f1', sub: 'echanges' },
          { label: 'Agents', value: String(activeAgents.length), color: '#a855f7', sub: 'actifs' },
          { label: 'Streak', value: `${stats.streak}j`, color: stats.streak > 0 ? '#f59e0b' : '#86868b', sub: stats.streak > 7 ? 'en feu !' : 'consecutifs' },
        ].map(kpi => (
          <div key={kpi.label} style={{
            background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)',
            borderRadius: 12, padding: '12px 10px', textAlign: 'center',
          }}>
            <div style={{ fontSize: 22, fontWeight: 800, color: kpi.color, letterSpacing: -0.5 }}>{kpi.value}</div>
            <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{kpi.sub}</div>
          </div>
        ))}
      </div>

      {/* ── Briefing du jour (collapsible) ── */}
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)',
        borderRadius: 12, marginBottom: 12, overflow: 'hidden',
      }}>
        <button onClick={() => setShowBriefing(v => !v)} style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%',
          padding: '12px 16px', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>☀️</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Briefing du jour</span>
            {briefingTime && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>{briefingTime}</span>}
          </div>
          <span style={{ fontSize: 11, color: 'var(--text-muted)', transform: showBriefing ? 'rotate(0)' : 'rotate(-90deg)', transition: 'transform 0.2s', display: 'inline-block' }}>&#9660;</span>
        </button>
        {showBriefing && (
          <div style={{ padding: '0 16px 14px', borderTop: '1px solid var(--border-primary)' }}>
            {briefing ? (
              <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.7, whiteSpace: 'pre-wrap', marginTop: 10 }}>{briefing}</div>
            ) : briefingLoading ? (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 10 }}>Briefing en cours de generation...</div>
            ) : (
              <div style={{ fontSize: 13, color: 'var(--text-muted)', fontStyle: 'italic', marginTop: 10 }}>Chargement...</div>
            )}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button onClick={refreshBriefing} disabled={briefingLoading} className="btn btn-ghost btn-sm" style={{ fontSize: 11 }}>
                {briefingLoading ? '...' : briefingLoaded ? '🔄 Rafraichir' : '✨ Generer'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ── Taches + Priorites ── */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 12 }}>

        {/* Taches du jour */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <span style={{ fontSize: 14 }}>✅</span>
              <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Taches du jour</span>
            </div>
            {todosTotal > 0 && (
              <span style={{ fontSize: 11, color: todosDone === todosTotal && todosTotal > 0 ? '#22c55e' : 'var(--text-muted)', fontWeight: 600 }}>
                {todosDone}/{todosTotal}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
            {todos.map(t => (
              <div key={t.id} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <button
                  onClick={() => toggleTodo(t.id)}
                  style={{
                    width: 18, height: 18, borderRadius: 4, border: `2px solid ${t.done ? '#22c55e' : 'var(--border-secondary)'}`,
                    background: t.done ? '#22c55e' : 'transparent', cursor: 'pointer', flexShrink: 0,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#fff',
                  }}
                >{t.done ? '✓' : ''}</button>
                <span style={{
                  fontSize: 13, color: t.done ? 'var(--text-muted)' : 'var(--text-primary)',
                  textDecoration: t.done ? 'line-through' : 'none', flex: 1,
                }}>{t.text}</span>
                <button onClick={() => removeTodo(t.id)} style={{
                  background: 'none', border: 'none', cursor: 'pointer', fontSize: 12, color: 'var(--text-muted)',
                  opacity: 0.5, padding: 2,
                }}>✕</button>
              </div>
            ))}
          </div>

          <form onSubmit={e => { e.preventDefault(); addTodo(); }} style={{ display: 'flex', gap: 6 }}>
            <input
              type="text"
              value={newTodo}
              onChange={e => setNewTodo(e.target.value)}
              placeholder="Ajouter une tache..."
              style={{
                flex: 1, padding: '6px 10px', borderRadius: 8, fontSize: 12,
                border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
              }}
            />
            <button type="submit" style={{
              padding: '6px 10px', borderRadius: 8, fontSize: 12, fontWeight: 600,
              border: 'none', cursor: 'pointer', background: 'var(--accent)', color: '#fff',
              fontFamily: 'inherit', opacity: newTodo.trim() ? 1 : 0.5,
            }}>+</button>
          </form>
        </div>

        {/* Priorites Top 3 */}
        <div style={{
          background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)',
          borderRadius: 12, padding: '14px 16px',
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 10 }}>
            <span style={{ fontSize: 14 }}>🎯</span>
            <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Priorites du jour</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
            {priorities.map((p, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <span style={{
                  width: 20, height: 20, borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center',
                  fontSize: 11, fontWeight: 800, flexShrink: 0,
                  background: i === 0 ? '#f59e0b22' : i === 1 ? '#6366f122' : '#10b98122',
                  color: i === 0 ? '#f59e0b' : i === 1 ? '#6366f1' : '#10b981',
                }}>{i + 1}</span>
                <input
                  type="text"
                  value={p}
                  onChange={e => updatePriority(i, e.target.value)}
                  placeholder={`Priorite ${i + 1}...`}
                  style={{
                    flex: 1, padding: '5px 8px', borderRadius: 6, fontSize: 12,
                    border: '1px solid var(--border-primary)', background: 'var(--bg-secondary)',
                    color: 'var(--text-primary)', fontFamily: 'inherit', outline: 'none',
                  }}
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ── Acces rapides ── */}
      <div style={{
        display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 8, marginBottom: 12,
      }}>
        {[
          { href: '/client/chat', icon: '💬', label: 'Chat' },
          { href: '/client/actions', icon: '⚡', label: 'Actions' },
          { href: '/client/documents', icon: '📄', label: 'Documents' },
          { href: '/client/team', icon: '👥', label: 'Equipe' },
          { href: '/client/studio', icon: '🎬', label: 'Studio' },
          { href: '/client/strategy', icon: '🎯', label: 'Strategie' },
        ].map(item => (
          <Link key={item.href} href={item.href} style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '10px 12px', borderRadius: 10, textDecoration: 'none', color: 'inherit',
            background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)',
            transition: 'border-color 0.15s',
          }}>
            <span style={{ fontSize: 18 }}>{item.icon}</span>
            <span style={{ fontSize: 13, fontWeight: 600 }}>{item.label}</span>
          </Link>
        ))}
      </div>

      {/* ── Mon equipe IA (compact) ── */}
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)',
        borderRadius: 12, padding: '14px 16px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)' }}>Mon equipe IA</span>
          <Link href="/client/team" style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
            Gerer &rarr;
          </Link>
        </div>
        <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 4 }}>
          {activeAgents.map(a => a && (
            <Link key={a.id} href="/client/chat" style={{
              display: 'flex', alignItems: 'center', gap: 6, padding: '6px 10px',
              borderRadius: 8, background: a.color + '0d', border: `1px solid ${a.color}30`,
              textDecoration: 'none', color: 'inherit', flexShrink: 0, minWidth: 130,
            }}>
              <span style={{ fontSize: 16 }}>{a.emoji}</span>
              <div style={{ minWidth: 0 }}>
                <div style={{ fontSize: 12, fontWeight: 600, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{a.name}</div>
                <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{a.role}</div>
              </div>
              <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', flexShrink: 0, marginLeft: 'auto' }} />
            </Link>
          ))}
        </div>
      </div>

      {/* ── Credit detail (compact) ── */}
      <div style={{
        background: 'var(--bg-elevated)', border: '1px solid var(--border-primary)',
        borderRadius: 12, padding: '12px 16px', marginBottom: 12,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <span style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)' }}>Solde credits</span>
          <Link href="/client/account" style={{ fontSize: 11, fontWeight: 600, color: 'var(--accent)', textDecoration: 'none' }}>
            Recharger &rarr;
          </Link>
        </div>
        {(() => {
          const max = Math.max(credits, 50);
          const pct = Math.min((credits / max) * 100, 100);
          const barColor = credits > 30 ? '#22c55e' : credits > 10 ? '#f59e0b' : '#ef4444';
          return (
            <>
              <div style={{
                width: '100%', height: 6, background: 'var(--bg-tertiary)',
                borderRadius: 4, overflow: 'hidden', marginBottom: 6,
              }}>
                <div style={{
                  width: `${pct}%`, height: '100%',
                  background: `linear-gradient(90deg, ${barColor}, ${barColor}cc)`,
                  borderRadius: 4, transition: 'width 0.6s ease',
                }} />
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 11, color: '#9ca3af' }}>
                <span>{credits.toFixed(1)} credits &middot; ~{Math.round(credits / 0.69)} chats</span>
                <span style={{ color: barColor, fontWeight: 700 }}>
                  {credits > 30 ? 'Confortable' : credits > 10 ? 'Modere' : 'Faible'}
                </span>
              </div>
            </>
          );
        })()}
      </div>

      {/* ── Parrainage (compact) ── */}
      <Link href="/client/referrals" style={{
        display: 'flex', alignItems: 'center', gap: 10, padding: '10px 16px', marginBottom: 12,
        background: 'linear-gradient(135deg, #6366f10a, #a855f708)',
        border: '1px solid #6366f122', borderRadius: 12, textDecoration: 'none', color: 'inherit',
      }}>
        <span style={{ fontSize: 20 }}>🎁</span>
        <div style={{ flex: 1 }}>
          <span style={{ fontSize: 13, fontWeight: 700 }}>Invitez un ami</span>
          <span style={{ fontSize: 12, color: 'var(--text-muted)', marginLeft: 8 }}>+20 EUR de credits</span>
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--accent)' }}>&rarr;</span>
      </Link>
    </div>
  );
}
