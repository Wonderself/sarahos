'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Pomodoro / Focus Timer
// ═══════════════════════════════════════════════════

const STORAGE_KEY = 'fz_pomodoro';

interface PomodoroSession {
  id: string;
  task: string;
  duration: number;
  type: 'work' | 'break' | 'longBreak';
  completedAt: string;
}

interface PomodoroState {
  sessions: PomodoroSession[];
  settings: { work: number; shortBreak: number; longBreak: number; longBreakInterval: number };
}

function loadState(): PomodoroState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return { sessions: [], settings: { work: 25, shortBreak: 5, longBreak: 15, longBreakInterval: 4 } };
}

function saveState(s: PomodoroState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(s)); } catch { /* */ }
}

function playBeep() {
  try {
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.frequency.value = 800;
    gain.gain.value = 0.3;
    osc.start();
    osc.stop(ctx.currentTime + 0.5);
    setTimeout(() => ctx.close(), 1000);
  } catch { /* */ }
}

function formatTime(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
}

export default function PomodoroPage() {
  const isMobile = useIsMobile();
  const meta = PAGE_META['pomodoro'];
  const [mounted, setMounted] = useState(false);
  const [state, setState] = useState<PomodoroState>(loadState());
  const [phase, setPhase] = useState<'work' | 'break' | 'longBreak'>('work');
  const [timeLeft, setTimeLeft] = useState(state.settings.work * 60);
  const [running, setRunning] = useState(false);
  const [task, setTask] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [workCount, setWorkCount] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setMounted(true);
    const loaded = loadState();
    setState(loaded);
    setTimeLeft(loaded.settings.work * 60);
  }, []);

  const persist = useCallback((updated: PomodoroState) => { setState(updated); saveState(updated); }, []);

  // Timer tick
  useEffect(() => {
    if (!running) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          setRunning(false);
          playBeep();
          // Record session
          const session: PomodoroSession = {
            id: Date.now().toString(36),
            task: task || 'Sans titre',
            duration: phase === 'work' ? state.settings.work : phase === 'break' ? state.settings.shortBreak : state.settings.longBreak,
            type: phase,
            completedAt: new Date().toISOString(),
          };
          const updated = { ...state, sessions: [session, ...state.sessions] };
          persist(updated);

          if (phase === 'work') {
            const newCount = workCount + 1;
            setWorkCount(newCount);
            if (newCount % state.settings.longBreakInterval === 0) {
              setPhase('longBreak');
              return state.settings.longBreak * 60;
            } else {
              setPhase('break');
              return state.settings.shortBreak * 60;
            }
          } else {
            setPhase('work');
            return state.settings.work * 60;
          }
        }
        return prev - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [running, phase, state, task, workCount, persist]);

  const reset = () => {
    setRunning(false);
    setPhase('work');
    setTimeLeft(state.settings.work * 60);
    setWorkCount(0);
  };

  const totalDuration = phase === 'work' ? state.settings.work * 60 : phase === 'break' ? state.settings.shortBreak * 60 : state.settings.longBreak * 60;
  const progress = 1 - timeLeft / totalDuration;
  const circumference = 2 * Math.PI * 110;

  // Stats
  const today = new Date().toISOString().slice(0, 10);
  const todaySessions = state.sessions.filter(s => s.completedAt.slice(0, 10) === today && s.type === 'work');
  const weekStart = new Date(); weekStart.setDate(weekStart.getDate() - weekStart.getDay());
  const weekStr = weekStart.toISOString().slice(0, 10);
  const weekSessions = state.sessions.filter(s => s.completedAt.slice(0, 10) >= weekStr && s.type === 'work');

  // Best streak
  const bestStreak = (() => {
    const days = new Set(state.sessions.filter(s => s.type === 'work').map(s => s.completedAt.slice(0, 10)));
    const sorted = Array.from(days).sort().reverse();
    let streak = 0, best = 0;
    for (let i = 0; i < sorted.length; i++) {
      const d = new Date(sorted[i]);
      if (i === 0) { streak = 1; best = 1; continue; }
      const prev = new Date(sorted[i - 1]);
      const diff = (prev.getTime() - d.getTime()) / 86400000;
      if (diff === 1) { streak++; if (streak > best) best = streak; } else { streak = 1; }
    }
    return best;
  })();

  const accentColor = phase === 'work' ? '#EF4444' : '#22C55E';

  const updateSetting = (key: 'work' | 'shortBreak' | 'longBreak' | 'longBreakInterval', val: number) => {
    const updated = { ...state, settings: { ...state.settings, [key]: val } };
    persist(updated);
    if (!running) {
      if (key === 'work' && phase === 'work') setTimeLeft(val * 60);
      if (key === 'shortBreak' && phase === 'break') setTimeLeft(val * 60);
      if (key === 'longBreak' && phase === 'longBreak') setTimeLeft(val * 60);
    }
  };

  if (!mounted) return null;

  const btnStyle: React.CSSProperties = { padding: '10px 20px', borderRadius: 8, border: 'none', cursor: 'pointer', fontWeight: 600, fontSize: 15 };
  const statCard: React.CSSProperties = { background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20, textAlign: 'center', border: '1px solid var(--border-primary)' };

  return (
    <div style={{ padding: isMobile ? 16 : 32, maxWidth: 800, margin: '0 auto' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <span style={{ fontSize: 28 }}>{meta.emoji}</span>
        <h1 style={{ fontSize: isMobile ? 22 : 28, fontWeight: 700, color: 'var(--text-primary)', margin: 0 }}>{meta.title}</h1>
        <PageExplanation pageId="pomodoro" text={meta.helpText} />
      </div>
      <p style={{ color: 'var(--text-secondary)', marginBottom: 24, fontSize: 14 }}>{meta.subtitle}</p>

      {/* Timer circle */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 20 }}>
          <svg width={240} height={240} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={120} cy={120} r={110} fill="none" stroke="var(--border-primary)" strokeWidth={8} />
            <circle cx={120} cy={120} r={110} fill="none" stroke={accentColor} strokeWidth={8} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</div>
            <div style={{ fontSize: 14, color: accentColor, fontWeight: 600, textTransform: 'uppercase' }}>
              {phase === 'work' ? 'Travail' : phase === 'break' ? 'Pause courte' : 'Pause longue'}
            </div>
          </div>
        </div>

        {/* Task input */}
        <input placeholder="Sur quoi travaillez-vous ?" value={task} onChange={e => setTask(e.target.value)} style={{ width: '100%', maxWidth: 360, padding: '10px 14px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14, textAlign: 'center', marginBottom: 16 }} />

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setRunning(!running)} style={{ ...btnStyle, background: accentColor, color: '#fff', minWidth: 100 }}>
            {running ? 'Pause' : 'Démarrer'}
          </button>
          <button onClick={reset} style={{ ...btnStyle, background: 'var(--bg-secondary)', color: 'var(--text-primary)', border: '1px solid var(--border-primary)' }}>Réinitialiser</button>
          <button onClick={() => setShowSettings(!showSettings)} style={{ ...btnStyle, background: 'var(--bg-secondary)', color: 'var(--text-secondary)', border: '1px solid var(--border-primary)' }}>
            {showSettings ? 'Fermer' : 'Réglages'}
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div style={{ background: 'var(--bg-secondary)', borderRadius: 12, padding: isMobile ? 16 : 20, marginBottom: 24, border: '1px solid var(--border-primary)' }}>
          <h3 style={{ margin: '0 0 12px', fontSize: 16, fontWeight: 700, color: 'var(--text-primary)' }}>Réglages</h3>
          <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : '1fr 1fr', gap: 12 }}>
            {([['Travail (min)', 'work', state.settings.work], ['Pause courte (min)', 'shortBreak', state.settings.shortBreak], ['Pause longue (min)', 'longBreak', state.settings.longBreak], ['Pauses longues tous les', 'longBreakInterval', state.settings.longBreakInterval]] as const).map(([label, key, val]) => (
              <div key={key}>
                <label style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 4, display: 'block' }}>{label}</label>
                <input type="number" min={1} max={120} value={val} onChange={e => updateSetting(key as 'work', Number(e.target.value) || 1)} style={{ width: '100%', padding: '8px 12px', borderRadius: 8, border: '1px solid var(--border-primary)', background: 'var(--bg-primary)', color: 'var(--text-primary)', fontSize: 14 }} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr 1fr' : '1fr 1fr 1fr', gap: 12, marginBottom: 24 }}>
        <div style={statCard}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{todaySessions.length}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Sessions aujourd&apos;hui</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{weekSessions.length}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Cette semaine</div>
        </div>
        <div style={statCard}>
          <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)' }}>{bestStreak}</div>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>Meilleur streak (jours)</div>
        </div>
      </div>

      {/* History */}
      <h3 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 12 }}>Historique des sessions</h3>
      {state.sessions.length === 0 ? (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-secondary)' }}>
          <div style={{ fontSize: 40, marginBottom: 8 }}>🍅</div>
          <p>Aucune session terminée. Lancez votre premier Pomodoro !</p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {state.sessions.slice(0, 20).map(s => (
            <div key={s.id} style={{ background: 'var(--bg-secondary)', borderRadius: 10, padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-primary)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{s.type === 'work' ? '🍅' : '☕'}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{s.task}</div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
                    {s.type === 'work' ? 'Travail' : s.type === 'break' ? 'Pause' : 'Pause longue'} — {s.duration} min
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{new Date(s.completedAt).toLocaleDateString('fr-FR')} {new Date(s.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
