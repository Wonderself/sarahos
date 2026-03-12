'use client';

import { useState, useEffect, useMemo } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Suivi des habitudes
// ═══════════════════════════════════════════════════

const STORAGE_KEY = 'fz_habitudes';

interface Habit {
  id: string;
  name: string;
  emoji: string;
  frequency: 'daily' | 'weekly';
  target: number;
  color: string;
  completions: Record<string, boolean>; // date string -> done
  createdAt: string;
}

interface HabitsState {
  habits: Habit[];
}

const PRESET_HABITS: { name: string; emoji: string; color: string }[] = [
  { name: 'Sport', emoji: '🏃', color: '#EF4444' },
  { name: 'Méditation', emoji: '🧘', color: '#8B5CF6' },
  { name: 'Lecture', emoji: '📖', color: '#3B82F6' },
  { name: 'Eau (2L)', emoji: '💧', color: '#06B6D4' },
  { name: 'Sommeil 8h', emoji: '😴', color: '#6366F1' },
  { name: 'Marche', emoji: '🚶', color: '#22C55E' },
  { name: 'Pas de sucre', emoji: '🍬', color: '#F59E0B' },
  { name: 'Journaling', emoji: '📓', color: '#EC4899' },
  { name: 'Pas d\'écran', emoji: '📵', color: '#64748B' },
  { name: 'Gratitude', emoji: '🙏', color: '#F97316' },
];

function uid(): string { return Date.now().toString(36) + Math.random().toString(36).slice(2, 8); }
function dateStr(d: Date): string { return d.toISOString().slice(0, 10); }
function today(): string { return dateStr(new Date()); }

function loadState(): HabitsState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return { habits: [] };
}

function saveState(s: HabitsState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* */ }
}

function getStreak(h: Habit): number {
  let streak = 0;
  const d = new Date();
  // Start from today, go backwards
  for (let i = 0; i < 365; i++) {
    const ds = dateStr(d);
    if (h.completions[ds]) { streak++; } else if (i > 0) break; // skip today if not done yet
    else break;
    d.setDate(d.getDate() - 1);
  }
  return streak;
}

function getBestStreak(h: Habit): number {
  const dates = Object.keys(h.completions).filter(k => h.completions[k]).sort();
  if (dates.length === 0) return 0;
  let best = 1, cur = 1;
  for (let i = 1; i < dates.length; i++) {
    const prev = new Date(dates[i - 1]);
    const curr = new Date(dates[i]);
    const diff = (curr.getTime() - prev.getTime()) / 86400000;
    if (diff === 1) { cur++; if (cur > best) best = cur; } else { cur = 1; }
  }
  return best;
}

function getCompletionRate(h: Habit): number {
  const keys = Object.keys(h.completions);
  if (keys.length === 0) return 0;
  const done = keys.filter(k => h.completions[k]).length;
  const totalDays = Math.max(1, Math.ceil((Date.now() - new Date(h.createdAt).getTime()) / 86400000));
  return Math.round((done / totalDays) * 100);
}

function seedHabits(): HabitsState {
  const now = new Date();
  const habits: Habit[] = PRESET_HABITS.slice(0, 5).map((p, i) => {
    const completions: Record<string, boolean> = {};
    // Add some history
    for (let d = 0; d < 7; d++) {
      const dt = new Date(now);
      dt.setDate(dt.getDate() - d);
      if (Math.random() > 0.3 || d < 2) completions[dateStr(dt)] = true;
    }
    const created = new Date(now);
    created.setDate(created.getDate() - 10 - i);
    return { id: uid(), name: p.name, emoji: p.emoji, frequency: 'daily' as const, target: 1, color: p.color, completions, createdAt: created.toISOString() };
  });
  const state = { habits };
  saveState(state);
  return state;
}

export default function HabitudesPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['habitudes'];
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<HabitsState>({ habits: [] });
  const [showAdd, setShowAdd] = useState(false);
  const [newName, setNewName] = useState('');
  const [newEmoji, setNewEmoji] = useState('✅');
  const [newColor, setNewColor] = useState('#3B82F6');
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    setMounted(true);
    const loaded = loadState();
    setState(loaded.habits.length > 0 ? loaded : seedHabits());
  }, []);

  const persist = (updated: HabitsState) => { setState(updated); saveState(updated); };

  const toggleToday = (id: string) => {
    const d = today();
    const habits = state.habits.map(h => {
      if (h.id !== id) return h;
      const completions = { ...h.completions };
      completions[d] = !completions[d];
      if (!completions[d]) delete completions[d];
      return { ...h, completions };
    });
    persist({ habits });
  };

  const addHabit = (name: string, emoji: string, color: string) => {
    const h: Habit = { id: uid(), name, emoji, frequency: 'daily', target: 1, color, completions: {}, createdAt: new Date().toISOString() };
    persist({ habits: [...state.habits, h] });
    setShowAdd(false); setNewName(''); setNewEmoji('✅'); setNewColor('#3B82F6');
  };

  const deleteHabit = (id: string) => persist({ habits: state.habits.filter(h => h.id !== id) });

  const todayDone = useMemo(() => {
    const d = today();
    return state.habits.filter(h => h.completions[d]).length;
  }, [state]);
  const todayTotal = state.habits.length;
  const pct = todayTotal > 0 ? Math.round((todayDone / todayTotal) * 100) : 0;

  // Last 7 days for heatmap
  const last7 = useMemo(() => {
    const days: string[] = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date(); d.setDate(d.getDate() - i);
      days.push(dateStr(d));
    }
    return days;
  }, []);

  const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];

  if (!mounted) return null;

  const inputStyle: React.CSSProperties = { width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 };
  const btnStyle: React.CSSProperties = { padding: '8px 16px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 14 };

  return (
    <div style={{ padding: isMobile ? 16 : 32, maxWidth: 900, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{meta.emoji}</span>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{meta.title}</h1>
        <PageExplanation pageId="habitudes" text={meta.helpText} />
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 20, fontSize: 14 }}>{meta.subtitle}</p>

      {/* Daily progress */}
      <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 20, border: '1px solid var(--border-primary)' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 }}>
          <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)' }}>Progression du jour</span>
          <span style={{ fontSize: 14, fontWeight: 700, color: 'var(--accent)' }}>{todayDone}/{todayTotal} ({pct}%)</span>
        </div>
        <div style={{ width: '100%', height: 10, borderRadius: 5, background: 'var(--border-primary)', overflow: 'hidden' }}>
          <div style={{ width: `${pct}%`, height: '100%', borderRadius: 5, background: 'var(--accent)', transition: 'width 0.3s ease' }} />
        </div>
      </div>

      {/* Add button */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <button onClick={() => setShowAdd(!showAdd)} style={{ ...btnStyle, background: 'var(--accent)', color: '#fff' }}>+ Nouvelle habitude</button>
      </div>

      {/* Add form */}
      {showAdd && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 20, border: '1px solid var(--border-primary)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Ajouter une habitude</h3>
          <div style={{ display: 'flex', gap: 10, marginBottom: 12, flexWrap: 'wrap' }}>
            <input placeholder="Nom" value={newName} onChange={e => setNewName(e.target.value)} style={{ ...inputStyle, flex: 1, minWidth: 150 }} />
            <input placeholder="Emoji" value={newEmoji} onChange={e => setNewEmoji(e.target.value)} style={{ ...inputStyle, width: 60 }} />
            <input type="color" value={newColor} onChange={e => setNewColor(e.target.value)} style={{ width: 40, height: 36, borderRadius: 8, border: '1px solid var(--border-primary)', cursor: 'pointer', padding: 0 }} />
          </div>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 12 }}>
            {PRESET_HABITS.map(p => (
              <button key={p.name} onClick={() => addHabit(p.name, p.emoji, p.color)} style={{ ...btnStyle, background: 'var(--bg-primary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)', fontSize: 12 }}>
                {p.emoji} {p.name}
              </button>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={() => { if (newName.trim()) addHabit(newName.trim(), newEmoji, newColor); }} style={{ ...btnStyle, background: 'var(--accent)', color: '#fff' }}>Ajouter</button>
            <button onClick={() => setShowAdd(false)} style={{ ...btnStyle, background: 'var(--bg-primary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>Annuler</button>
          </div>
        </div>
      )}

      {/* Habits list */}
      {state.habits.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 60, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>✅</div>
          <p>Aucune habitude créée. Commencez par en ajouter une !</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          {state.habits.map(h => {
            const isDone = !!h.completions[today()];
            const streak = getStreak(h);
            const bestSt = getBestStreak(h);
            const rate = getCompletionRate(h);
            return (
              <div key={h.id} style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 14 : 18, border: '1px solid var(--border-primary)', borderLeft: `4px solid ${h.color}` }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <button onClick={() => toggleToday(h.id)} style={{ width: 32, height: 32, borderRadius: 8, border: `2px solid ${h.color}`, background: isDone ? h.color : 'transparent', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 16, color: isDone ? '#fff' : 'transparent' }}>
                      {isDone ? '✓' : ''}
                    </button>
                    <span style={{ fontSize: 20 }}>{h.emoji}</span>
                    <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', textDecoration: isDone ? 'line-through' : 'none', opacity: isDone ? 0.7 : 1 }}>{h.name}</span>
                  </div>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    {streak > 0 && <span style={{ fontSize: 13, color: '#F59E0B', fontWeight: 600 }}>🔥 {streak}j</span>}
                    <button onClick={() => setEditingId(editingId === h.id ? null : h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, color: 'var(--text-secondary)' }}>📊</button>
                    <button onClick={() => deleteHabit(h.id)} style={{ background: 'none', border: 'none', cursor: 'pointer', fontSize: 14, opacity: 0.5 }}>🗑️</button>
                  </div>
                </div>

                {/* 7-day heatmap */}
                <div style={{ display: 'flex', gap: 4, marginBottom: editingId === h.id ? 10 : 0 }}>
                  {last7.map((d, i) => {
                    const done = !!h.completions[d];
                    const isToday = d === today();
                    return (
                      <div key={d} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 2 }}>
                        <span style={{ fontSize: 10, color: 'var(--text-secondary)' }}>{dayLabels[new Date(d).getDay()]}</span>
                        <div style={{ width: isMobile ? 28 : 32, height: isMobile ? 28 : 32, borderRadius: 6, background: done ? h.color : 'var(--bg-primary)', border: isToday ? `2px solid var(--accent)` : '1px solid var(--border-primary)', opacity: done ? 1 : 0.4 }} />
                      </div>
                    );
                  })}
                </div>

                {/* Expanded stats */}
                {editingId === h.id && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 8, marginTop: 8 }}>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: h.color }}>{streak}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Streak actuel</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: h.color }}>{bestSt}</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Meilleur streak</div>
                    </div>
                    <div style={{ background: 'var(--bg-primary)', borderRadius: 8, padding: 10, textAlign: 'center' }}>
                      <div style={{ fontSize: 20, fontWeight: 700, color: h.color }}>{rate}%</div>
                      <div style={{ fontSize: 11, color: 'var(--text-secondary)' }}>Taux réussite</div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
