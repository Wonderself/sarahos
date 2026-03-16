'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';
import { recordEvent } from '../../../lib/gamification';

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
            recordEvent({ type: 'message' }); // +10 XP for completing a work session
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

  return (
    <div style={{ ...pageContainer(isMobile), maxWidth: 800 }}>
      {/* Header */}
      <div style={headerRow()}>
        <span style={emojiIcon(24)}>{meta.emoji}</span>
        <h1 style={CU.pageTitle}>{meta.title}</h1>
        <PageExplanation pageId="pomodoro" text={meta.helpText} />
      </div>
      <p style={{ ...CU.pageSubtitle, marginBottom: 24 }}>{meta.subtitle}</p>

      {/* Timer circle */}
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32 }}>
        <div style={{ position: 'relative', width: 240, height: 240, marginBottom: 20 }}>
          <svg width={240} height={240} style={{ transform: 'rotate(-90deg)' }}>
            <circle cx={120} cy={120} r={110} fill="none" stroke={CU.border} strokeWidth={8} />
            <circle cx={120} cy={120} r={110} fill="none" stroke={accentColor} strokeWidth={8} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={circumference * (1 - progress)} style={{ transition: 'stroke-dashoffset 0.5s ease' }} />
          </svg>
          <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: CU.text, fontVariantNumeric: 'tabular-nums' }}>{formatTime(timeLeft)}</div>
            <div style={{ fontSize: 14, color: accentColor, fontWeight: 600, textTransform: 'uppercase' }}>
              {phase === 'work' ? 'Travail' : phase === 'break' ? 'Pause courte' : 'Pause longue'}
            </div>
          </div>
        </div>

        {/* Task input */}
        <input placeholder="Sur quoi travaillez-vous ?" value={task} onChange={e => setTask(e.target.value)} style={{ ...CU.input, maxWidth: 360, textAlign: 'center', marginBottom: 16 }} />

        {/* Controls */}
        <div style={{ display: 'flex', gap: 12 }}>
          <button onClick={() => setRunning(!running)} style={{ ...CU.btnPrimary, background: accentColor, minWidth: 100, fontSize: 15, height: 40 }}>
            {running ? 'Pause' : 'Démarrer'}
          </button>
          <button onClick={reset} style={{ ...CU.btnGhost, fontSize: 15, height: 40 }}>Réinitialiser</button>
          <button onClick={() => setShowSettings(!showSettings)} style={{ ...CU.btnGhost, fontSize: 15, height: 40 }}>
            {showSettings ? 'Fermer' : 'Réglages'}
          </button>
        </div>
      </div>

      {/* Settings */}
      {showSettings && (
        <div style={{ ...CU.card, padding: isMobile ? 16 : 20, marginBottom: 24 }}>
          <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Réglages</h3>
          <div style={cardGrid(isMobile, 2)}>
            {([['Travail (min)', 'work', state.settings.work], ['Pause courte (min)', 'shortBreak', state.settings.shortBreak], ['Pause longue (min)', 'longBreak', state.settings.longBreak], ['Pauses longues tous les', 'longBreakInterval', state.settings.longBreakInterval]] as const).map(([label, key, val]) => (
              <div key={key}>
                <label style={CU.label}>{label}</label>
                <input type="number" min={1} max={120} value={val} onChange={e => updateSetting(key as 'work', Number(e.target.value) || 1)} style={CU.input} />
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Stats */}
      <div style={{ ...cardGrid(isMobile, 3), marginBottom: 24 }}>
        <div style={{ ...CU.card, textAlign: 'center' }}>
          <div style={CU.statValue}>{todaySessions.length}</div>
          <div style={CU.statLabel}>Sessions aujourd&apos;hui</div>
        </div>
        <div style={{ ...CU.card, textAlign: 'center' }}>
          <div style={CU.statValue}>{weekSessions.length}</div>
          <div style={CU.statLabel}>Cette semaine</div>
        </div>
        <div style={{ ...CU.card, textAlign: 'center' }}>
          <div style={CU.statValue}>{bestStreak}</div>
          <div style={CU.statLabel}>Meilleur streak (jours)</div>
        </div>
      </div>

      {/* History */}
      <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Historique des sessions</h3>
      {state.sessions.length === 0 ? (
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>🍅</div>
          <div style={CU.emptyTitle}>Aucune session terminée</div>
          <div style={CU.emptyDesc}>Lancez votre premier Pomodoro !</div>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          {state.sessions.slice(0, 20).map(s => (
            <div key={s.id} style={{ ...CU.card, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <span style={{ fontSize: 18 }}>{s.type === 'work' ? '🍅' : '☕'}</span>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{s.task}</div>
                  <div style={{ fontSize: 12, color: CU.textSecondary }}>
                    {s.type === 'work' ? 'Travail' : s.type === 'break' ? 'Pause' : 'Pause longue'} — {s.duration} min
                  </div>
                </div>
              </div>
              <div style={{ fontSize: 12, color: CU.textSecondary }}>{new Date(s.completedAt).toLocaleDateString('fr-FR')} {new Date(s.completedAt).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
