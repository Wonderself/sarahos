'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';

// ═══════════════════════════════════════════════════════
//  Freenzy.io — Reveil Intelligent (Smart Alarm)
//  Complete alarm management: modes, rubrics, voice,
//  delivery, test, morning routine
// ═══════════════════════════════════════════════════════

const API_BASE = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3010';

// ─── Types ───

interface ContentModules {
  meteo: { enabled: boolean; city: string; units: 'celsius' | 'fahrenheit'; multiDay: boolean; clothingSuggestion: boolean };
  astrologie: { enabled: boolean; zodiacSign: string; detailLevel: 'court' | 'moyen' | 'detaille'; horoscopeChinois: boolean; numerologie: boolean };
  briefing: { enabled: boolean; categories: string[]; itemCount: number };
  agenda: { enabled: boolean; showTodayEvents: boolean; showDeadlines: boolean };
  bienEtre: { enabled: boolean; meditation: boolean; exercise: boolean; sleepTracking: boolean };
  motivation: { enabled: boolean; citationDuJour: boolean; objectifRappel: boolean; gratitudePrompt: boolean; defiDuJour: boolean };
  finance: { enabled: boolean; marketSummary: boolean; crypto: boolean; portfolioAlert: boolean };
  social: { enabled: boolean; birthdayReminders: boolean; pendingMessages: boolean; socialHighlights: boolean };
}

interface AlarmConfig {
  id: string;
  enabled: boolean;
  time: string;           // "07:00"
  days: number[];         // 0=Sun..6=Sat
  timezone: string;
  mode: string;
  rubrics: string[];
  voice: 'sarah' | 'emmanuel';
  delivery: 'call' | 'whatsapp';
  phone: string;
  birthDate: string;
  customAnnouncement: string;
  contentModules: ContentModules;
  preset: 'express' | 'standard' | 'complet' | 'custom';
}

interface TestResult {
  content: string;
  delivered: boolean;
}

// ─── Constants ───

const ALARM_MODES = [
  { id: 'doux',       emoji: '\u{1F338}', label: 'Doux',       color: '#93c5fd', desc: 'Un reveil tout en douceur pour commencer la journee sereinement' },
  { id: 'dur',        emoji: '\u{1F525}', label: 'Dur',        color: '#ef4444', desc: 'Pas de pitie ! Un reveil direct et sans concession' },
  { id: 'sympa',      emoji: '\u{1F60A}', label: 'Sympa',      color: '#4ade80', desc: 'Un reveil amical et bienveillant, comme un bon ami' },
  { id: 'drole',      emoji: '\u{1F602}', label: 'Drole',      color: '#fb923c', desc: 'Commencez la journee en riant avec humour et blagues' },
  { id: 'fou',        emoji: '\u{1F92A}', label: 'Fou',        color: '#a855f7', desc: 'Un reveil completement delirant et imprevisible' },
  { id: 'motivant',   emoji: '\u{1F4AA}', label: 'Motivant',   color: '#eab308', desc: 'Boost d\'energie et motivation pour attaquer la journee' },
  { id: 'zen',        emoji: '\u{1F9D8}', label: 'Zen',        color: '#2dd4bf', desc: 'Meditation, respiration, calme interieur' },
  { id: 'energique',  emoji: '\u26A1',    label: 'Energique',  color: '#f43f5e', desc: 'Reveil dynamique et plein d\'energie des le matin' },
];

const RUBRICS = [
  { id: 'bonne_humeur',       emoji: '\u{1F308}', label: 'Bonne humeur' },
  { id: 'meteo',              emoji: '\u2600\uFE0F', label: 'Meteo' },
  { id: 'astrologie',         emoji: '\u2648',    label: 'Astrologie' },
  { id: 'annonce_perso',      emoji: '\u{1F4E2}', label: 'Annonce personnalisee' },
  { id: 'energies_jour',      emoji: '\u2728',    label: 'Energies du jour' },
  { id: 'news',               emoji: '\u{1F4F0}', label: 'Actualites' },
  { id: 'citation',           emoji: '\u{1F48E}', label: 'Citation' },
  { id: 'conseil_bien_etre',  emoji: '\u{1F9E0}', label: 'Conseil bien-etre' },
  { id: 'resume_agenda',      emoji: '\u{1F4C5}', label: 'Resume de l\'agenda' },
  { id: 'rappel_objectifs',   emoji: '\u{1F3AF}', label: 'Rappel objectifs' },
  { id: 'blague',             emoji: '\u{1F0CF}', label: 'Blague du jour' },
  { id: 'horoscope_chinois',  emoji: '\u{1F409}', label: 'Horoscope chinois' },
  { id: 'gratitude',          emoji: '\u{1F64F}', label: 'Gratitude' },
  { id: 'fun_fact',           emoji: '\u{1F9EA}', label: 'Fun fact' },
  { id: 'musique_suggeree',   emoji: '\u{1F3B5}', label: 'Musique suggeree' },
  { id: 'defi_jour',          emoji: '\u{1F3C6}', label: 'Defi du jour' },
  { id: 'anecdote_histoire',  emoji: '\u{1F4DC}', label: 'Anecdote historique' },
  { id: 'conseil_productivite', emoji: '\u23F1\uFE0F', label: 'Conseil productivite' },
];

const DAY_LABELS = [
  { short: 'L', index: 1 },
  { short: 'M', index: 2 },
  { short: 'M', index: 3 },
  { short: 'J', index: 4 },
  { short: 'V', index: 5 },
  { short: 'S', index: 6 },
  { short: 'D', index: 0 },
];

const ROUTINE_ITEMS = [
  'Consulter mes messages',
  'Voir le resume du repondeur',
  'Verifier mon agenda',
  'Lire le briefing IA',
  'Definir mes 3 priorites',
];

const QUICK_ACTIONS = [
  { icon: '\u2600\uFE0F', label: 'Briefing', href: '/client/briefing' },
  { icon: '\u{1F4DE}', label: 'Repondeur', href: '/client/repondeur' },
  { icon: '\u{1F4AC}', label: 'Discutez', href: '/client/chat' },
  { icon: '\u{1F4CA}', label: 'Dashboard', href: '/client/dashboard' },
];

// ─── Content Modules ───

const CONTENT_MODULES = [
  { id: 'meteo' as const, emoji: '🌤️', label: 'Meteo', desc: 'Previsions, temperature, suggestion vestimentaire', seconds: 30 },
  { id: 'astrologie' as const, emoji: '♈', label: 'Astrologie', desc: 'Horoscope, numerologie, energies du jour', seconds: 45 },
  { id: 'briefing' as const, emoji: '📰', label: 'Briefing du matin', desc: 'Actualites par categorie personnalisee', seconds: 60 },
  { id: 'agenda' as const, emoji: '📅', label: 'Agenda', desc: 'Evenements du jour, deadlines a venir', seconds: 30 },
  { id: 'bienEtre' as const, emoji: '🧘', label: 'Bien-etre', desc: 'Meditation, exercice, suivi sommeil', seconds: 40 },
  { id: 'motivation' as const, emoji: '💪', label: 'Motivation', desc: 'Citation, objectifs, gratitude, defi', seconds: 35 },
  { id: 'finance' as const, emoji: '📈', label: 'Finance', desc: 'Marches, crypto, alertes portfolio', seconds: 25 },
  { id: 'social' as const, emoji: '👥', label: 'Social', desc: 'Anniversaires, messages, reseaux', seconds: 20 },
];

const PRESETS = [
  { id: 'express' as const, label: 'Express', emoji: '⚡', duration: '~2 min', desc: 'Meteo + Citation + Agenda', moduleIds: ['meteo', 'motivation', 'agenda'] },
  { id: 'standard' as const, label: 'Standard', emoji: '☀️', duration: '~5 min', desc: 'Meteo + Briefing + Agenda + Motivation', moduleIds: ['meteo', 'briefing', 'agenda', 'motivation'] },
  { id: 'complet' as const, label: 'Complet', emoji: '🌟', duration: '~10 min', desc: 'Tous les modules actives', moduleIds: ['meteo', 'astrologie', 'briefing', 'agenda', 'bienEtre', 'motivation', 'finance', 'social'] },
  { id: 'custom' as const, label: 'Personnalise', emoji: '🎛️', duration: 'Variable', desc: 'Choisissez vos modules', moduleIds: [] },
];

const BRIEFING_CATEGORIES = [
  { id: 'tech', label: 'Tech', emoji: '💻' },
  { id: 'business', label: 'Business', emoji: '💼' },
  { id: 'politique', label: 'Politique', emoji: '🏛️' },
  { id: 'sport', label: 'Sport', emoji: '⚽' },
  { id: 'culture', label: 'Culture', emoji: '🎭' },
  { id: 'local', label: 'Local', emoji: '📍' },
];

const ZODIAC_SIGNS = [
  { id: 'belier', label: 'Belier', emoji: '♈', dates: '21 mars - 19 avril' },
  { id: 'taureau', label: 'Taureau', emoji: '♉', dates: '20 avril - 20 mai' },
  { id: 'gemeaux', label: 'Gemeaux', emoji: '♊', dates: '21 mai - 20 juin' },
  { id: 'cancer', label: 'Cancer', emoji: '♋', dates: '21 juin - 22 juillet' },
  { id: 'lion', label: 'Lion', emoji: '♌', dates: '23 juillet - 22 aout' },
  { id: 'vierge', label: 'Vierge', emoji: '♍', dates: '23 aout - 22 sept.' },
  { id: 'balance', label: 'Balance', emoji: '♎', dates: '23 sept. - 22 oct.' },
  { id: 'scorpion', label: 'Scorpion', emoji: '♏', dates: '23 oct. - 21 nov.' },
  { id: 'sagittaire', label: 'Sagittaire', emoji: '♐', dates: '22 nov. - 21 dec.' },
  { id: 'capricorne', label: 'Capricorne', emoji: '♑', dates: '22 dec. - 19 jan.' },
  { id: 'verseau', label: 'Verseau', emoji: '♒', dates: '20 jan. - 18 fev.' },
  { id: 'poissons', label: 'Poissons', emoji: '♓', dates: '19 fev. - 20 mars' },
];

function getDefaultContentModules(): ContentModules {
  return {
    meteo: { enabled: false, city: 'Paris', units: 'celsius', multiDay: false, clothingSuggestion: true },
    astrologie: { enabled: false, zodiacSign: '', detailLevel: 'moyen', horoscopeChinois: false, numerologie: false },
    briefing: { enabled: false, categories: ['tech', 'business'], itemCount: 3 },
    agenda: { enabled: false, showTodayEvents: true, showDeadlines: true },
    bienEtre: { enabled: false, meditation: true, exercise: false, sleepTracking: false },
    motivation: { enabled: false, citationDuJour: true, objectifRappel: false, gratitudePrompt: false, defiDuJour: false },
    finance: { enabled: false, marketSummary: false, crypto: false, portfolioAlert: false },
    social: { enabled: false, birthdayReminders: true, pendingMessages: false, socialHighlights: false },
  };
}

function computeEstimatedDuration(modules: ContentModules): string {
  let total = 30; // base greeting
  CONTENT_MODULES.forEach(m => {
    if (modules[m.id]?.enabled) total += m.seconds;
  });
  const min = Math.floor(total / 60);
  const sec = total % 60;
  return min > 0 ? `~${min} min ${sec > 0 ? `${sec}s` : ''}` : `~${sec}s`;
}

// ─── Helpers ───

function getSession(): { token?: string; displayName?: string; phone?: string } {
  if (typeof window === 'undefined') return {};
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

async function apiCall(path: string, options?: RequestInit) {
  const session = getSession();
  return fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${session.token}`,
      ...options?.headers,
    },
  });
}

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Bonne nuit';
  if (h < 12) return 'Bonjour';
  if (h < 18) return 'Bon apres-midi';
  return 'Bonsoir';
}

function formatFrenchDate(): string {
  return new Date().toLocaleDateString('fr-FR', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });
}

function getNextAlarmLabel(alarm: AlarmConfig | null): string {
  if (!alarm || !alarm.enabled || alarm.days.length === 0) return 'Aucun reveil programme';
  const dayNames = ['Dimanche', 'Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
  const now = new Date();
  const todayIdx = now.getDay();
  // find next active day
  for (let offset = 0; offset < 7; offset++) {
    const candidate = (todayIdx + offset) % 7;
    if (alarm.days.includes(candidate)) {
      const label = offset === 0 ? 'Aujourd\'hui' : offset === 1 ? 'Demain' : dayNames[candidate];
      return `Prochain reveil : ${label} a ${alarm.time}`;
    }
  }
  return 'Aucun reveil programme';
}

// ═══════════════════════════════════════════════════════
//  Main Component
// ═══════════════════════════════════════════════════════

export default function ReveilPage() {
  // ─── State ───
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const [alarm, setAlarm] = useState<AlarmConfig | null>(null);
  const [currentTime, setCurrentTime] = useState('');
  const [currentDate] = useState(formatFrenchDate);
  const [greeting] = useState(getGreeting);

  // Test
  const [testing, setTesting] = useState(false);
  const [testResult, setTestResult] = useState<TestResult | null>(null);

  // Morning routine
  const [routine, setRoutine] = useState<{ label: string; done: boolean }[]>(
    ROUTINE_ITEMS.map(label => ({ label, done: false }))
  );

  const saveTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Clock ───
  useEffect(() => {
    setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    const timer = setInterval(() => {
      setCurrentTime(new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' }));
    }, 60000);
    return () => clearInterval(timer);
  }, []);

  // ─── Load routine from localStorage ───
  useEffect(() => {
    try {
      const saved = localStorage.getItem('fz_reveil_routine');
      if (saved) {
        const parsed = JSON.parse(saved);
        const today = new Date().toDateString();
        if (parsed.date === today && parsed.items) {
          setRoutine(parsed.items);
        }
      }
    } catch { /* ignore */ }
  }, []);

  // ─── Load alarm from API ───
  useEffect(() => {
    loadAlarm();
  }, []);

  async function loadAlarm() {
    const session = getSession();
    if (!session.token) {
      setLoading(false);
      return;
    }
    try {
      const res = await apiCall('/portal/alarms');
      if (res.ok) {
        const data = await res.json();
        const alarms = data.alarms ?? data.data ?? [];
        if (alarms.length > 0) {
          const a = alarms[0];
          setAlarm({
            id: a.id,
            enabled: a.enabled ?? false,
            time: a.time ?? '07:00',
            days: a.days ?? [1, 2, 3, 4, 5],
            timezone: a.timezone ?? 'Europe/Paris',
            mode: a.mode ?? 'doux',
            rubrics: a.rubrics ?? ['bonne_humeur', 'meteo', 'citation'],
            voice: a.voice ?? 'sarah',
            delivery: a.delivery ?? 'call',
            phone: a.phone ?? '',
            birthDate: a.birthDate ?? a.birth_date ?? '',
            customAnnouncement: a.customAnnouncement ?? a.custom_announcement ?? '',
            contentModules: a.contentModules ?? a.content_modules ?? getDefaultContentModules(),
            preset: a.preset ?? 'custom',
          });
        }
      }
    } catch {
      // API may not exist yet; that's OK
    } finally {
      setLoading(false);
    }
  }

  // ─── Debounced auto-save ───
  const debouncedSave = useCallback((updated: AlarmConfig) => {
    if (saveTimerRef.current) clearTimeout(saveTimerRef.current);
    saveTimerRef.current = setTimeout(() => {
      saveAlarm(updated);
    }, 800);
  }, []);

  function updateAlarm(partial: Partial<AlarmConfig>) {
    setAlarm(prev => {
      if (!prev) {
        // Create new alarm with defaults
        const newAlarm: AlarmConfig = {
          id: '',
          enabled: false,
          time: '07:00',
          days: [1, 2, 3, 4, 5],
          timezone: 'Europe/Paris',
          mode: 'doux',
          rubrics: ['bonne_humeur', 'meteo', 'citation'],
          voice: 'sarah',
          delivery: 'call',
          phone: '',
          birthDate: '',
          customAnnouncement: '',
          contentModules: getDefaultContentModules(),
          preset: 'custom',
          ...partial,
        };
        debouncedSave(newAlarm);
        return newAlarm;
      }
      const updated = { ...prev, ...partial };
      debouncedSave(updated);
      return updated;
    });
  }

  async function saveAlarm(config: AlarmConfig) {
    const session = getSession();
    if (!session.token) return;

    setSaving(true);
    setError('');
    try {
      const body = JSON.stringify({
        enabled: config.enabled,
        time: config.time,
        days: config.days,
        timezone: config.timezone,
        mode: config.mode,
        rubrics: config.rubrics,
        voice: config.voice,
        delivery: config.delivery,
        phone: config.phone,
        birthDate: config.birthDate,
        customAnnouncement: config.customAnnouncement,
        contentModules: config.contentModules,
        preset: config.preset,
      });

      let res: Response;
      if (config.id) {
        res = await apiCall(`/portal/alarms/${config.id}`, { method: 'PATCH', body });
      } else {
        res = await apiCall('/portal/alarms', { method: 'POST', body });
      }

      if (res.ok) {
        const data = await res.json();
        const saved = data.alarm ?? data;
        if (saved.id && !config.id) {
          setAlarm(prev => prev ? { ...prev, id: saved.id } : prev);
        }
        setSuccess('Sauvegarde');
        setTimeout(() => setSuccess(''), 2000);
      } else {
        const err = await res.json().catch(() => ({}));
        setError((err as Record<string, string>).error ?? `Erreur HTTP ${res.status}`);
        setTimeout(() => setError(''), 4000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de sauvegarde');
      setTimeout(() => setError(''), 4000);
    } finally {
      setSaving(false);
    }
  }

  // ─── Test alarm ───
  async function testAlarm() {
    if (!alarm?.id) {
      setError('Sauvegardez d\'abord votre reveil avant de le tester');
      setTimeout(() => setError(''), 3000);
      return;
    }
    setTesting(true);
    setTestResult(null);
    try {
      const res = await apiCall(`/portal/alarms/${alarm.id}/test`, { method: 'POST' });
      if (res.ok) {
        const data = await res.json();
        setTestResult({ content: data.content ?? '', delivered: data.delivered ?? false });
      } else {
        const err = await res.json().catch(() => ({}));
        setError((err as Record<string, string>).error ?? 'Erreur lors du test');
        setTimeout(() => setError(''), 4000);
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur');
      setTimeout(() => setError(''), 4000);
    } finally {
      setTesting(false);
    }
  }

  // ─── Routine ───
  function toggleRoutine(index: number) {
    const updated = routine.map((r, i) => i === index ? { ...r, done: !r.done } : r);
    setRoutine(updated);
    try {
      localStorage.setItem('fz_reveil_routine', JSON.stringify({
        date: new Date().toDateString(),
        items: updated,
      }));
    } catch { /* ignore */ }
  }

  // ─── Derived values ───
  const session = getSession();
  const routineDone = routine.filter(r => r.done).length;
  const routineTotal = routine.length;
  const routinePct = routineTotal > 0 ? Math.round((routineDone / routineTotal) * 100) : 0;

  const hasAstro = alarm?.rubrics.includes('astrologie') || false;
  const hasHoroscope = alarm?.rubrics.includes('horoscope_chinois') || false;
  const hasAnnonce = alarm?.rubrics.includes('annonce_perso') || false;

  // ─── Loading state ───
  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div className="animate-pulse text-md text-muted">Chargement du reveil...</div>
      </div>
    );
  }

  // ═══════════════════════════════════════════════════════
  //  Render
  // ═══════════════════════════════════════════════════════

  return (
    <div>
      {/* ─── STATUS BAR ─── */}
      {(error || success || saving) && (
        <div style={{ position: 'sticky', top: 0, zIndex: 30, padding: '0 0 8px' }}>
          {error && (
            <div className="alert alert-danger" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{'\u26A0\uFE0F'}</span> {error}
            </div>
          )}
          {success && (
            <div className="alert alert-success" style={{ marginBottom: 4 }}>
              <span style={{ fontSize: 14 }}>{'\u2705'}</span> {success}
            </div>
          )}
          {saving && !error && !success && (
            <div className="alert alert-info" style={{ marginBottom: 4 }}>
              <span className="animate-pulse">Sauvegarde en cours...</span>
            </div>
          )}
        </div>
      )}

      {/* ═══════════════════════════════════════════════ */}
      {/*  1. HEADER                                     */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="page-header" style={{ textAlign: 'center', flexDirection: 'column', paddingBottom: 8 }}>
        <div style={{ fontSize: 48, marginBottom: 8 }}>{'\u2615'}</div>
        <div style={{
          fontSize: 42, fontWeight: 200, color: 'var(--text-muted)',
          letterSpacing: '-0.03em', fontFamily: 'var(--font-sans)',
        }}>
          {currentTime}
        </div>
        <h1 className="page-title" style={{ marginTop: 8, marginBottom: 4, fontSize: 22 }}>
          {greeting}{session.displayName ? `, ${session.displayName}` : ''} !
        </h1>
        <p className="page-subtitle" style={{ textTransform: 'capitalize', marginBottom: 4 }}>
          {currentDate}
        </p>
        <p className="text-sm" style={{ color: 'var(--accent)', fontWeight: 500 }}>
          {getNextAlarmLabel(alarm)}
        </p>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  2. MAIN ALARM TOGGLE                          */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="card" style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '20px 24px',
        }}>
          <div className="flex items-center gap-16">
            <div style={{
              width: 48, height: 48, borderRadius: 'var(--radius-md)',
              background: alarm?.enabled ? 'var(--success-muted)' : 'var(--bg-tertiary)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: 24, transition: 'background 0.3s',
            }}>
              {alarm?.enabled ? '\u{1F514}' : '\u{1F515}'}
            </div>
            <div>
              <div className="text-lg font-bold">
                Reveil Intelligent
              </div>
              <div className="text-sm text-muted">
                {alarm?.enabled ? 'Actif — votre IA vous reveille chaque matin' : 'Inactif — activez votre reveil IA'}
              </div>
            </div>
          </div>

          {/* Big toggle */}
          <button
            onClick={() => updateAlarm({ enabled: !alarm?.enabled })}
            style={{
              position: 'relative', width: 56, height: 30, borderRadius: 15,
              background: alarm?.enabled ? 'var(--success)' : 'var(--bg-tertiary)',
              border: '2px solid transparent',
              borderColor: alarm?.enabled ? 'var(--success)' : 'var(--border-secondary)',
              cursor: 'pointer', transition: 'all 0.3s ease', flexShrink: 0,
            }}
            title={alarm?.enabled ? 'Desactiver le reveil' : 'Activer le reveil'}
          >
            <span style={{
              position: 'absolute', top: 3, left: alarm?.enabled ? 28 : 3,
              width: 22, height: 22, borderRadius: '50%',
              background: 'white', transition: 'left 0.3s ease',
              boxShadow: '0 1px 4px rgba(0,0,0,0.15)',
            }} />
          </button>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  3. TIME & SCHEDULE                            */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-title">Horaire et jours</div>
        <div className="card" style={{ padding: '20px 24px' }}>
          {/* Time picker */}
          <div className="flex items-center gap-16 mb-16" style={{ flexWrap: 'wrap' }}>
            <div>
              <label className="text-sm text-muted mb-4" style={{ display: 'block' }}>Heure du reveil</label>
              <input
                type="time"
                value={alarm?.time ?? '07:00'}
                onChange={e => updateAlarm({ time: e.target.value })}
                className="input"
                style={{
                  width: 140, fontSize: 20, fontWeight: 600, padding: '10px 14px',
                  textAlign: 'center', letterSpacing: '0.02em',
                }}
              />
            </div>
            <div style={{ flex: 1 }}>
              <label className="text-sm text-muted mb-4" style={{ display: 'block' }}>Fuseau horaire</label>
              <div className="text-md" style={{ padding: '12px 0', color: 'var(--text-secondary)' }}>
                {alarm?.timezone ?? 'Europe/Paris'}
              </div>
            </div>
          </div>

          {/* Day selector */}
          <label className="text-sm text-muted mb-8" style={{ display: 'block' }}>Jours actifs</label>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
            {DAY_LABELS.map(day => {
              const isActive = alarm?.days.includes(day.index) ?? false;
              return (
                <button
                  key={`${day.short}-${day.index}`}
                  onClick={() => {
                    const currentDays = alarm?.days ?? [1, 2, 3, 4, 5];
                    const newDays = isActive
                      ? currentDays.filter(d => d !== day.index)
                      : [...currentDays, day.index];
                    updateAlarm({ days: newDays });
                  }}
                  style={{
                    width: 42, height: 42, borderRadius: '50%',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 14, fontWeight: 600,
                    fontFamily: 'var(--font-sans)',
                    background: isActive ? 'var(--accent)' : 'var(--bg-tertiary)',
                    color: isActive ? 'white' : 'var(--text-muted)',
                    border: isActive ? '2px solid var(--accent)' : '2px solid var(--border-primary)',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {day.short}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  4. MODE SELECTOR                              */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-title">Mode du reveil</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: 10,
        }}>
          {ALARM_MODES.map(mode => {
            const isSelected = (alarm?.mode ?? 'doux') === mode.id;
            return (
              <button
                key={mode.id}
                onClick={() => updateAlarm({ mode: mode.id })}
                style={{
                  padding: '16px 14px',
                  borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isSelected ? mode.color : 'var(--border-primary)'}`,
                  background: isSelected ? `${mode.color}15` : 'var(--bg-primary)',
                  cursor: 'pointer',
                  textAlign: 'left',
                  transition: 'all 0.2s ease',
                  fontFamily: 'var(--font-sans)',
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                {isSelected && (
                  <div style={{
                    position: 'absolute', top: 6, right: 8,
                    width: 18, height: 18, borderRadius: '50%',
                    background: mode.color, display: 'flex',
                    alignItems: 'center', justifyContent: 'center',
                    color: 'white', fontSize: 10, fontWeight: 700,
                  }}>
                    {'\u2713'}
                  </div>
                )}
                <div style={{ fontSize: 28, marginBottom: 6 }}>{mode.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>
                  {mode.label}
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                  {mode.desc}
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  5. RUBRICS GRID                               */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-title">
          Rubriques
          <span className="text-sm text-muted" style={{ fontWeight: 400, marginLeft: 8 }}>
            {alarm?.rubrics.length ?? 0} active{(alarm?.rubrics.length ?? 0) > 1 ? 's' : ''}
          </span>
        </div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))',
          gap: 8,
        }}>
          {RUBRICS.map(rubric => {
            const isActive = alarm?.rubrics.includes(rubric.id) ?? false;
            return (
              <button
                key={rubric.id}
                onClick={() => {
                  const current = alarm?.rubrics ?? [];
                  const newRubrics = isActive
                    ? current.filter(r => r !== rubric.id)
                    : [...current, rubric.id];
                  updateAlarm({ rubrics: newRubrics });
                }}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10,
                  padding: '12px 14px',
                  borderRadius: 'var(--radius-sm)',
                  border: `1px solid ${isActive ? 'var(--accent)' : 'var(--border-primary)'}`,
                  background: isActive ? 'var(--accent-muted)' : 'var(--bg-primary)',
                  cursor: 'pointer',
                  transition: 'all 0.15s ease',
                  fontFamily: 'var(--font-sans)',
                  textAlign: 'left',
                  width: '100%',
                }}
              >
                <span style={{ fontSize: 20, flexShrink: 0 }}>{rubric.emoji}</span>
                <span style={{
                  flex: 1, fontSize: 13, fontWeight: 500,
                  color: isActive ? 'var(--accent-hover)' : 'var(--text-secondary)',
                }}>
                  {rubric.label}
                </span>
                {/* Mini toggle */}
                <div style={{
                  position: 'relative', width: 34, height: 18, borderRadius: 9,
                  background: isActive ? 'var(--accent)' : 'var(--bg-tertiary)',
                  flexShrink: 0, transition: 'background 0.2s',
                }}>
                  <span style={{
                    position: 'absolute', top: 2, left: isActive ? 18 : 2,
                    width: 14, height: 14, borderRadius: '50%',
                    background: 'white', transition: 'left 0.2s',
                    boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                  }} />
                </div>
              </button>
            );
          })}
        </div>

        {/* Conditional fields for special rubrics */}
        {(hasAstro || hasHoroscope || hasAnnonce) && (
          <div style={{
            marginTop: 12, display: 'flex', flexDirection: 'column', gap: 10,
          }}>
            {(hasAstro || hasHoroscope) && (
              <div className="card" style={{ padding: '14px 18px' }}>
                <div className="flex items-center gap-8 mb-8">
                  <span style={{ fontSize: 18 }}>{hasAstro ? '\u2648' : '\u{1F409}'}</span>
                  <span className="text-md font-semibold">
                    {hasAstro && hasHoroscope
                      ? 'Date de naissance (Astrologie & Horoscope chinois)'
                      : hasAstro
                        ? 'Date de naissance (Astrologie)'
                        : 'Date de naissance (Horoscope chinois)'}
                  </span>
                </div>
                <input
                  type="date"
                  value={alarm?.birthDate ?? ''}
                  onChange={e => updateAlarm({ birthDate: e.target.value })}
                  className="input"
                  style={{ maxWidth: 220 }}
                />
              </div>
            )}

            {hasAnnonce && (
              <div className="card" style={{ padding: '14px 18px' }}>
                <div className="flex items-center gap-8 mb-8">
                  <span style={{ fontSize: 18 }}>{'\u{1F4E2}'}</span>
                  <span className="text-md font-semibold">Annonce personnalisee</span>
                </div>
                <textarea
                  value={alarm?.customAnnouncement ?? ''}
                  onChange={e => updateAlarm({ customAnnouncement: e.target.value })}
                  placeholder="Ecrivez ici votre annonce personnalisee qui sera lue chaque matin..."
                  className="input"
                  style={{
                    minHeight: 80, resize: 'vertical',
                    fontFamily: 'var(--font-sans)',
                  }}
                />
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  5b. PRESETS                                    */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-title">
          Profil de reveil
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 10 }}>
          {PRESETS.map(p => {
            const isSelected = (alarm?.preset ?? 'custom') === p.id;
            return (
              <button
                key={p.id}
                onClick={() => {
                  if (p.id === 'custom') {
                    updateAlarm({ preset: 'custom' });
                    return;
                  }
                  const modules = alarm?.contentModules ? { ...alarm.contentModules } : getDefaultContentModules();
                  // Disable all, then enable preset modules
                  (Object.keys(modules) as (keyof ContentModules)[]).forEach(k => { (modules[k] as { enabled: boolean }).enabled = false; });
                  p.moduleIds.forEach(mid => { if (modules[mid as keyof ContentModules]) (modules[mid as keyof ContentModules] as { enabled: boolean }).enabled = true; });
                  updateAlarm({ preset: p.id, contentModules: modules });
                }}
                style={{
                  padding: '16px 14px', borderRadius: 'var(--radius-md)',
                  border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-primary)'}`,
                  background: isSelected ? 'var(--accent-muted)' : 'var(--bg-primary)',
                  cursor: 'pointer', textAlign: 'center', transition: 'all 0.2s',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                <div style={{ fontSize: 28, marginBottom: 6 }}>{p.emoji}</div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 2 }}>{p.label}</div>
                <div style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 600, marginBottom: 4 }}>{p.duration}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4 }}>{p.desc}</div>
              </button>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  5c. CONTENT MODULES                            */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-title">
          Contenu du reveil
          <span style={{
            marginLeft: 10, fontSize: 11, fontWeight: 600, padding: '3px 10px',
            borderRadius: 12, background: 'var(--accent-muted)', color: 'var(--accent)',
          }}>
            {computeEstimatedDuration(alarm?.contentModules ?? getDefaultContentModules())}
          </span>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: 10 }}>
          {CONTENT_MODULES.map(mod => {
            const modules = alarm?.contentModules ?? getDefaultContentModules();
            const modConfig = modules[mod.id];
            const isEnabled = modConfig?.enabled ?? false;
            return (
              <div key={mod.id} style={{
                borderRadius: 'var(--radius-md)',
                border: `1px solid ${isEnabled ? 'var(--accent)' : 'var(--border-primary)'}`,
                background: isEnabled ? 'var(--accent-muted)' : 'var(--bg-primary)',
                overflow: 'hidden', transition: 'all 0.2s',
              }}>
                {/* Module header */}
                <button
                  onClick={() => {
                    const updated = { ...(alarm?.contentModules ?? getDefaultContentModules()) };
                    (updated[mod.id] as { enabled: boolean }).enabled = !isEnabled;
                    updateAlarm({ contentModules: updated, preset: 'custom' });
                  }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 12, width: '100%',
                    padding: '14px 16px', border: 'none', cursor: 'pointer',
                    background: 'transparent', fontFamily: 'var(--font-sans)', textAlign: 'left',
                  }}
                >
                  <span style={{ fontSize: 24, flexShrink: 0 }}>{mod.emoji}</span>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{mod.label}</div>
                    <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{mod.desc}</div>
                  </div>
                  <div style={{
                    position: 'relative', width: 40, height: 22, borderRadius: 11,
                    background: isEnabled ? 'var(--accent)' : 'var(--bg-tertiary)',
                    flexShrink: 0, transition: 'background 0.2s',
                  }}>
                    <span style={{
                      position: 'absolute', top: 2, left: isEnabled ? 20 : 2,
                      width: 18, height: 18, borderRadius: '50%',
                      background: 'white', transition: 'left 0.2s',
                      boxShadow: '0 1px 2px rgba(0,0,0,0.15)',
                    }} />
                  </div>
                </button>

                {/* Sub-options when enabled */}
                {isEnabled && (
                  <div style={{
                    padding: '0 16px 14px', borderTop: '1px solid var(--border-primary)',
                    paddingTop: 12,
                  }}>
                    {mod.id === 'meteo' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Ville</label>
                          <input
                            type="text" className="input input-sm" style={{ width: '100%' }}
                            value={(modules.meteo as ContentModules['meteo']).city}
                            onChange={e => { const u = { ...modules }; u.meteo = { ...u.meteo, city: e.target.value }; updateAlarm({ contentModules: u, preset: 'custom' }); }}
                            placeholder="Paris"
                          />
                        </div>
                        <div className="flex gap-8 flex-wrap">
                          {['celsius', 'fahrenheit'].map(u => (
                            <button key={u} onClick={() => { const up = { ...modules }; up.meteo = { ...up.meteo, units: u as 'celsius' | 'fahrenheit' }; updateAlarm({ contentModules: up, preset: 'custom' }); }}
                              style={{
                                padding: '4px 12px', borderRadius: 16, fontSize: 12, border: 'none', cursor: 'pointer',
                                background: modules.meteo.units === u ? 'var(--accent)' : 'var(--bg-tertiary)',
                                color: modules.meteo.units === u ? '#fff' : 'var(--text-secondary)',
                              }}
                            >
                              {u === 'celsius' ? '°C' : '°F'}
                            </button>
                          ))}
                        </div>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.meteo.multiDay}
                            onChange={e => { const u = { ...modules }; u.meteo = { ...u.meteo, multiDay: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Previsions 3 jours
                        </label>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.meteo.clothingSuggestion}
                            onChange={e => { const u = { ...modules }; u.meteo = { ...u.meteo, clothingSuggestion: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Suggestion vestimentaire
                        </label>
                      </div>
                    )}

                    {mod.id === 'astrologie' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Signe zodiacal</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4 }}>
                            {ZODIAC_SIGNS.map(z => (
                              <button key={z.id} onClick={() => { const u = { ...modules }; u.astrologie = { ...u.astrologie, zodiacSign: z.id }; updateAlarm({ contentModules: u, preset: 'custom' }); }}
                                title={`${z.label} (${z.dates})`}
                                style={{
                                  width: 32, height: 32, borderRadius: '50%', border: 'none', cursor: 'pointer',
                                  fontSize: 16, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                  background: modules.astrologie.zodiacSign === z.id ? 'var(--accent)' : 'var(--bg-tertiary)',
                                  transition: 'all 0.15s',
                                }}
                              >
                                {z.emoji}
                              </button>
                            ))}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Niveau de detail</label>
                          <div className="flex gap-4">
                            {(['court', 'moyen', 'detaille'] as const).map(lvl => (
                              <button key={lvl} onClick={() => { const u = { ...modules }; u.astrologie = { ...u.astrologie, detailLevel: lvl }; updateAlarm({ contentModules: u, preset: 'custom' }); }}
                                style={{
                                  padding: '4px 12px', borderRadius: 16, fontSize: 12, border: 'none', cursor: 'pointer',
                                  background: modules.astrologie.detailLevel === lvl ? 'var(--accent)' : 'var(--bg-tertiary)',
                                  color: modules.astrologie.detailLevel === lvl ? '#fff' : 'var(--text-secondary)',
                                }}
                              >
                                {lvl.charAt(0).toUpperCase() + lvl.slice(1)}
                              </button>
                            ))}
                          </div>
                        </div>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.astrologie.horoscopeChinois}
                            onChange={e => { const u = { ...modules }; u.astrologie = { ...u.astrologie, horoscopeChinois: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Horoscope chinois
                        </label>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.astrologie.numerologie}
                            onChange={e => { const u = { ...modules }; u.astrologie = { ...u.astrologie, numerologie: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Numerologie
                        </label>
                      </div>
                    )}

                    {mod.id === 'briefing' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        <div>
                          <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Categories d&apos;actualites</label>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                            {BRIEFING_CATEGORIES.map(cat => {
                              const isActive = modules.briefing.categories.includes(cat.id);
                              return (
                                <button key={cat.id} onClick={() => {
                                  const u = { ...modules };
                                  const cats = isActive ? u.briefing.categories.filter(c => c !== cat.id) : [...u.briefing.categories, cat.id];
                                  u.briefing = { ...u.briefing, categories: cats };
                                  updateAlarm({ contentModules: u, preset: 'custom' });
                                }}
                                  style={{
                                    padding: '4px 12px', borderRadius: 16, fontSize: 12, border: 'none', cursor: 'pointer',
                                    background: isActive ? 'var(--accent)' : 'var(--bg-tertiary)',
                                    color: isActive ? '#fff' : 'var(--text-secondary)',
                                  }}
                                >
                                  {cat.emoji} {cat.label}
                                </button>
                              );
                            })}
                          </div>
                        </div>
                        <div>
                          <label className="text-xs text-muted" style={{ display: 'block', marginBottom: 4 }}>Nombre d&apos;articles</label>
                          <div className="flex gap-4">
                            {[3, 5, 10].map(n => (
                              <button key={n} onClick={() => { const u = { ...modules }; u.briefing = { ...u.briefing, itemCount: n }; updateAlarm({ contentModules: u, preset: 'custom' }); }}
                                style={{
                                  padding: '4px 14px', borderRadius: 16, fontSize: 12, border: 'none', cursor: 'pointer',
                                  background: modules.briefing.itemCount === n ? 'var(--accent)' : 'var(--bg-tertiary)',
                                  color: modules.briefing.itemCount === n ? '#fff' : 'var(--text-secondary)',
                                }}
                              >
                                {n}
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}

                    {mod.id === 'agenda' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.agenda.showTodayEvents}
                            onChange={e => { const u = { ...modules }; u.agenda = { ...u.agenda, showTodayEvents: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Evenements du jour
                        </label>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.agenda.showDeadlines}
                            onChange={e => { const u = { ...modules }; u.agenda = { ...u.agenda, showDeadlines: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Deadlines a venir
                        </label>
                      </div>
                    )}

                    {mod.id === 'bienEtre' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.bienEtre.meditation}
                            onChange={e => { const u = { ...modules }; u.bienEtre = { ...u.bienEtre, meditation: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Suggestion meditation
                        </label>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.bienEtre.exercise}
                            onChange={e => { const u = { ...modules }; u.bienEtre = { ...u.bienEtre, exercise: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Exercice du matin
                        </label>
                        <label className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                          <input type="checkbox" checked={modules.bienEtre.sleepTracking}
                            onChange={e => { const u = { ...modules }; u.bienEtre = { ...u.bienEtre, sleepTracking: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                          Suivi du sommeil
                        </label>
                      </div>
                    )}

                    {mod.id === 'motivation' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { key: 'citationDuJour', label: 'Citation du jour' },
                          { key: 'objectifRappel', label: 'Rappel des objectifs' },
                          { key: 'gratitudePrompt', label: 'Gratitude du matin' },
                          { key: 'defiDuJour', label: 'Defi du jour' },
                        ].map(opt => (
                          <label key={opt.key} className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={(modules.motivation as Record<string, boolean>)[opt.key]}
                              onChange={e => { const u = { ...modules }; u.motivation = { ...u.motivation, [opt.key]: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    )}

                    {mod.id === 'finance' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { key: 'marketSummary', label: 'Resume des marches' },
                          { key: 'crypto', label: 'Crypto & Bitcoin' },
                          { key: 'portfolioAlert', label: 'Alertes portfolio' },
                        ].map(opt => (
                          <label key={opt.key} className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={(modules.finance as Record<string, boolean>)[opt.key]}
                              onChange={e => { const u = { ...modules }; u.finance = { ...u.finance, [opt.key]: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    )}

                    {mod.id === 'social' && (
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                        {[
                          { key: 'birthdayReminders', label: 'Anniversaires du jour' },
                          { key: 'pendingMessages', label: 'Messages en attente' },
                          { key: 'socialHighlights', label: 'Highlights reseaux sociaux' },
                        ].map(opt => (
                          <label key={opt.key} className="flex items-center gap-8 text-sm" style={{ cursor: 'pointer' }}>
                            <input type="checkbox" checked={(modules.social as Record<string, boolean>)[opt.key]}
                              onChange={e => { const u = { ...modules }; u.social = { ...u.social, [opt.key]: e.target.checked }; updateAlarm({ contentModules: u, preset: 'custom' }); }} />
                            {opt.label}
                          </label>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  5d. PREVIEW                                    */}
      {/* ═══════════════════════════════════════════════ */}
      {(() => {
        const modules = alarm?.contentModules ?? getDefaultContentModules();
        const enabledModules = CONTENT_MODULES.filter(m => modules[m.id]?.enabled);
        if (enabledModules.length === 0) return null;
        const mode = ALARM_MODES.find(m => m.id === alarm?.mode) ?? ALARM_MODES[0];
        return (
          <div className="section">
            <div className="section-title">Apercu du reveil</div>
            <div style={{
              borderLeft: `3px solid ${mode.color}`,
              background: 'var(--bg-secondary)',
              borderRadius: 'var(--radius-md)',
              padding: '16px 20px',
            }}>
              <div className="text-sm text-secondary" style={{ lineHeight: 1.8 }}>
                <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  {mode.emoji} {greeting}{session.displayName ? ` ${session.displayName}` : ''} !
                </span>
                <span style={{ color: 'var(--text-muted)' }}> — Mode {mode.label}</span>
                <br />
                {enabledModules.map(m => (
                  <span key={m.id}>
                    {m.emoji}{' '}
                    {m.id === 'meteo' && <><strong>Meteo</strong> : Il fait 18°C a {modules.meteo.city || 'Paris'}{modules.meteo.clothingSuggestion ? ', veste legere conseillee' : ''}.</>}
                    {m.id === 'astrologie' && <><strong>Horoscope</strong> : {modules.astrologie.zodiacSign ? ZODIAC_SIGNS.find(z => z.id === modules.astrologie.zodiacSign)?.label ?? 'votre signe' : 'votre signe'} — journee propice aux nouvelles initiatives.</>}
                    {m.id === 'briefing' && <><strong>Briefing</strong> : {modules.briefing.itemCount} actualites {modules.briefing.categories.length > 0 ? `(${modules.briefing.categories.join(', ')})` : ''}</>}
                    {m.id === 'agenda' && <><strong>Agenda</strong> : {modules.agenda.showTodayEvents ? '3 evenements aujourd\'hui' : ''}{modules.agenda.showDeadlines ? ', 1 deadline cette semaine' : ''}</>}
                    {m.id === 'bienEtre' && <><strong>Bien-etre</strong> : {modules.bienEtre.meditation ? '5 min meditation guidee' : ''}{modules.bienEtre.exercise ? ', etirements du matin' : ''}</>}
                    {m.id === 'motivation' && <><strong>Motivation</strong> : {modules.motivation.citationDuJour ? '"La seule limite est celle que vous vous fixez."' : ''}{modules.motivation.defiDuJour ? ' — Defi: parler a 3 nouvelles personnes' : ''}</>}
                    {m.id === 'finance' && <><strong>Finance</strong> : {modules.finance.marketSummary ? 'CAC 40 +0.8%' : ''}{modules.finance.crypto ? ', BTC 67,420€' : ''}</>}
                    {m.id === 'social' && <><strong>Social</strong> : {modules.social.birthdayReminders ? 'Anniversaire de Marie aujourd\'hui' : ''}{modules.social.pendingMessages ? ', 3 messages en attente' : ''}</>}
                    <br />
                  </span>
                ))}
              </div>
              <div className="text-xs text-muted" style={{ marginTop: 8, fontStyle: 'italic' }}>
                Apercu indicatif — le contenu reel sera genere par l&apos;IA selon vos parametres
              </div>
            </div>
          </div>
        );
      })()}

      {/* ═══════════════════════════════════════════════ */}
      {/*  6. VOICE & DELIVERY                           */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-title">Voix et livraison</div>
        <div className="card" style={{ padding: '20px 24px' }}>
          {/* Voice selector */}
          <label className="text-sm text-muted mb-8" style={{ display: 'block' }}>Voix de l&apos;agent</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'sarah' as const, label: 'Maëva', emoji: '\u{1F469}', desc: 'Voix feminine chaleureuse' },
              { id: 'emmanuel' as const, label: 'Emmanuel', emoji: '\u{1F468}', desc: 'Voix masculine posee' },
            ].map(v => {
              const isSelected = (alarm?.voice ?? 'sarah') === v.id;
              return (
                <button
                  key={v.id}
                  onClick={() => updateAlarm({ voice: v.id })}
                  style={{
                    flex: 1, padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-primary)'}`,
                    background: isSelected ? 'var(--accent-muted)' : 'var(--bg-primary)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div className="flex items-center gap-10">
                    <span style={{ fontSize: 28 }}>{v.emoji}</span>
                    <div>
                      <div style={{
                        fontSize: 14, fontWeight: 600,
                        color: isSelected ? 'var(--accent-hover)' : 'var(--text-primary)',
                      }}>
                        {v.label}
                      </div>
                      <div className="text-xs text-muted">{v.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Delivery method */}
          <label className="text-sm text-muted mb-8" style={{ display: 'block' }}>Mode de livraison</label>
          <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
            {[
              { id: 'call' as const, label: 'Appel telephonique', emoji: '\u{1F4DE}', desc: 'L\'IA vous appelle' },
              { id: 'whatsapp' as const, label: 'Message WhatsApp', emoji: '\u{1F4AC}', desc: 'Message vocal WhatsApp' },
            ].map(d => {
              const isSelected = (alarm?.delivery ?? 'call') === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => updateAlarm({ delivery: d.id })}
                  style={{
                    flex: 1, padding: '14px 16px',
                    borderRadius: 'var(--radius-sm)',
                    border: `2px solid ${isSelected ? 'var(--accent)' : 'var(--border-primary)'}`,
                    background: isSelected ? 'var(--accent-muted)' : 'var(--bg-primary)',
                    cursor: 'pointer', textAlign: 'left',
                    transition: 'all 0.2s', fontFamily: 'var(--font-sans)',
                  }}
                >
                  <div className="flex items-center gap-10">
                    <span style={{ fontSize: 24 }}>{d.emoji}</span>
                    <div>
                      <div style={{
                        fontSize: 14, fontWeight: 600,
                        color: isSelected ? 'var(--accent-hover)' : 'var(--text-primary)',
                      }}>
                        {d.label}
                      </div>
                      <div className="text-xs text-muted">{d.desc}</div>
                    </div>
                  </div>
                </button>
              );
            })}
          </div>

          {/* Phone number */}
          <label className="text-sm text-muted mb-4" style={{ display: 'block' }}>Numero de telephone</label>
          <input
            type="tel"
            value={alarm?.phone ?? session.phone ?? ''}
            onChange={e => updateAlarm({ phone: e.target.value })}
            placeholder="+33 6 12 34 56 78"
            className="input"
            style={{ maxWidth: 280 }}
          />
          <div className="text-xs text-muted mt-4">
            Numero ou vous recevrez l&apos;appel ou le message WhatsApp
          </div>
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  7. TEST BUTTON                                */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-title">Tester votre reveil</div>
        <div className="card" style={{ padding: '24px', textAlign: 'center' }}>
          <button
            onClick={testAlarm}
            disabled={testing}
            className="btn btn-primary"
            style={{
              fontSize: 16, padding: '14px 32px',
              borderRadius: 'var(--radius-md)',
              minWidth: 280,
            }}
          >
            {testing ? (
              <span className="animate-pulse">Test en cours...</span>
            ) : (
              <>{'\u{1F514}'} Tester mon reveil maintenant</>
            )}
          </button>
          <div className="text-xs text-muted mt-8">
            Genere et envoie un reveil de test avec vos parametres actuels
          </div>
        </div>

        {/* Test result preview */}
        {testResult && (
          <div className="card mt-12" style={{
            borderLeft: '3px solid var(--accent)',
            background: 'var(--bg-secondary)',
            padding: '16px 20px',
          }}>
            <div className="flex items-center gap-8 mb-8">
              <span style={{ fontSize: 20 }}>{'\u{1F916}'}</span>
              <span className="text-md font-bold">Apercu du reveil</span>
              {testResult.delivered && (
                <span className="badge badge-success" style={{ marginLeft: 'auto' }}>
                  Livre
                </span>
              )}
            </div>
            <div className="text-md text-secondary" style={{
              lineHeight: 1.7, whiteSpace: 'pre-wrap',
            }}>
              {testResult.content}
            </div>
          </div>
        )}
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  8. MORNING ROUTINE                            */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="flex-between items-center mb-12">
          <div className="section-title" style={{ margin: 0 }}>Routine du matin</div>
          <span className="text-sm text-muted">{routineDone}/{routineTotal} — {routinePct}%</span>
        </div>
        <div className="progress-bar mb-12" style={{ height: 4 }}>
          <div className="progress-fill" style={{
            width: `${routinePct}%`,
            background: routinePct === 100 ? 'var(--success)' : 'var(--accent)',
            transition: 'width 0.3s ease',
          }} />
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {routine.map((r, i) => (
            <button
              key={i}
              onClick={() => toggleRoutine(i)}
              className="flex items-center gap-12 rounded-md"
              style={{
                padding: '10px 14px', border: 'none', cursor: 'pointer',
                background: 'var(--bg-secondary)', width: '100%', textAlign: 'left',
                fontFamily: 'var(--font-sans)', opacity: r.done ? 0.6 : 1,
                transition: 'opacity 0.2s',
              }}
            >
              <div style={{
                width: 22, height: 22, borderRadius: 6, flexShrink: 0,
                border: r.done ? '2px solid var(--success)' : '2px solid var(--border-secondary)',
                background: r.done ? 'var(--success)' : 'transparent',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                color: 'white', fontSize: 12,
              }}>
                {r.done && '\u2713'}
              </div>
              <span className="text-base" style={{
                textDecoration: r.done ? 'line-through' : 'none',
                color: 'var(--text-primary)',
              }}>
                {r.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* ═══════════════════════════════════════════════ */}
      {/*  9. QUICK ACTIONS                              */}
      {/* ═══════════════════════════════════════════════ */}
      <div className="section">
        <div className="section-title">Actions rapides</div>
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))',
          gap: 10,
        }}>
          {QUICK_ACTIONS.map(action => (
            <Link
              key={action.label}
              href={action.href}
              className="card flex items-center gap-12 p-16"
              style={{
                textDecoration: 'none', color: 'inherit',
                transition: 'border-color 0.2s, box-shadow 0.2s',
              }}
            >
              <span style={{ fontSize: 24 }}>{action.icon}</span>
              <span className="text-md font-medium">{action.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
