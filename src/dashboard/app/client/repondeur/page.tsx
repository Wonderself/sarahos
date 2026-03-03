'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';

// ─── Types ───

interface RepondeurConfig {
  active: boolean;
  greeting: string;
  voice: string;
  language: string;
  mode: string;
  scheduleFrom: string;
  scheduleTo: string;
  schedule24h: boolean;
  phoneNumber: string;
  escalationNumber: string;
}

interface RepondeurStats {
  callsToday: number;
  callsTotal: number;
  avgDuration: number;
  messagesTaken: number;
  resolutionRate: number;
}

interface CallRecord {
  id: string;
  date: string;
  caller: string;
  duration: number;
  status: 'resolved' | 'message' | 'escalated' | 'missed';
  transcript?: string;
}

type TestCallState = 'idle' | 'ringing' | 'active' | 'thinking' | 'ended';

// ─── Defaults ───

const DEFAULT_CONFIG: RepondeurConfig = {
  active: false,
  greeting: "Bonjour, vous \u00eates bien chez [nom entreprise]. Je suis Camille, votre assistante. Comment puis-je vous aider ?",
  voice: 'aura-2-agathe-fr',
  language: 'fr',
  mode: 'auto',
  scheduleFrom: '08:00',
  scheduleTo: '20:00',
  schedule24h: false,
  phoneNumber: '',
  escalationNumber: '',
};

const DEFAULT_STATS: RepondeurStats = {
  callsToday: 0,
  callsTotal: 0,
  avgDuration: 0,
  messagesTaken: 0,
  resolutionRate: 0,
};

const STORAGE_CONFIG_KEY = 'sarah_repondeur_config';
const STORAGE_STATS_KEY = 'sarah_repondeur_stats';
const STORAGE_HISTORY_KEY = 'sarah_repondeur_history';

// ─── Helpers ───

function getToken(): string | null {
  try {
    const session = JSON.parse(localStorage.getItem('sarah_session') ?? '{}');
    return session.token ?? null;
  } catch { return null; }
}

async function apiCall(action: string, data?: Record<string, unknown>): Promise<Record<string, unknown> | null> {
  const token = getToken();
  if (!token) return null;
  try {
    const res = await fetch('/api/repondeur', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ action, ...data }),
    });
    if (!res.ok) return null;
    return await res.json() as Record<string, unknown>;
  } catch { return null; }
}

function loadFromStorage<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback;
  try {
    const raw = localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted data */ }
  return fallback;
}

function saveToStorage(key: string, value: unknown): void {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch { /* quota exceeded */ }
}

function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${s.toString().padStart(2, '0')}`;
}

function formatDate(iso: string): string {
  try {
    return new Date(iso).toLocaleString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

const STATUS_MAP: Record<string, { label: string; badgeClass: string }> = {
  resolved: { label: 'R\u00e9solu', badgeClass: 'badge badge-success' },
  message: { label: 'Message pris', badgeClass: 'badge badge-info' },
  escalated: { label: 'Escalad\u00e9', badgeClass: 'badge badge-warning' },
  missed: { label: 'Manqu\u00e9', badgeClass: 'badge badge-danger' },
};

const SIMULATED_RESPONSES = [
  "Bien s\u00fbr, je prends note de votre demande. Je la transmettrai \u00e0 l'\u00e9quipe concern\u00e9e dans les plus brefs d\u00e9lais. Puis-je faire autre chose pour vous ?",
  "Je comprends votre pr\u00e9occupation. Laissez-moi v\u00e9rifier cela pour vous. D'apr\u00e8s les informations dont je dispose, je peux vous confirmer que votre dossier est en cours de traitement.",
  "Merci pour votre appel. J'ai bien enregistr\u00e9 votre message et un membre de l'\u00e9quipe vous recontactera sous 24 heures. Y a-t-il autre chose que je puisse faire ?",
  "Absolument, je peux vous aider avec \u00e7a. Nos horaires d'ouverture sont du lundi au vendredi, de 9h \u00e0 18h. Souhaitez-vous prendre rendez-vous ?",
];

// ─── Component ───

export default function RepondeurPage() {
  const [config, setConfig] = useState<RepondeurConfig>(DEFAULT_CONFIG);
  const [stats, setStats] = useState<RepondeurStats>(DEFAULT_STATS);
  const [history, setHistory] = useState<CallRecord[]>([]);
  const [configOpen, setConfigOpen] = useState(true);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [expandedCallId, setExpandedCallId] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Test call state
  const [testState, setTestState] = useState<TestCallState>('idle');
  const [testMessages, setTestMessages] = useState<{ role: 'system' | 'camille' | 'caller'; text: string }[]>([]);
  const [testInput, setTestInput] = useState('');
  const [testDuration, setTestDuration] = useState(0);
  const testTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // ─── Load data (API first, localStorage fallback) ───

  useEffect(() => {
    let cancelled = false;
    async function load() {
      // Try API first
      const [cfgRes, statsRes, histRes] = await Promise.all([
        apiCall('get-config'),
        apiCall('get-stats'),
        apiCall('get-history'),
      ]);
      if (cancelled) return;

      if (cfgRes?.config) {
        const c = cfgRes.config as RepondeurConfig;
        setConfig(c);
        saveToStorage(STORAGE_CONFIG_KEY, c);
      } else {
        setConfig(loadFromStorage(STORAGE_CONFIG_KEY, DEFAULT_CONFIG));
      }

      if (statsRes?.stats) {
        const s = statsRes.stats as RepondeurStats;
        setStats(s);
        saveToStorage(STORAGE_STATS_KEY, s);
      } else {
        setStats(loadFromStorage(STORAGE_STATS_KEY, DEFAULT_STATS));
      }

      if (histRes?.history) {
        const h = histRes.history as CallRecord[];
        setHistory(h);
        saveToStorage(STORAGE_HISTORY_KEY, h);
      } else {
        setHistory(loadFromStorage(STORAGE_HISTORY_KEY, []));
      }

      setLoading(false);
    }
    load();
    return () => { cancelled = true; };
  }, []);

  // ─── Toggle active ───

  const toggleActive = useCallback(async () => {
    setConfig(prev => {
      const updated = { ...prev, active: !prev.active };
      saveToStorage(STORAGE_CONFIG_KEY, updated);
      return updated;
    });
    await apiCall('toggle');
  }, []);

  // ─── Save config ───

  const handleSaveConfig = useCallback(async () => {
    saveToStorage(STORAGE_CONFIG_KEY, config);
    await apiCall('save-config', { config });
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 3000);
  }, [config]);

  // ─── Update config field ───

  const updateConfig = useCallback(<K extends keyof RepondeurConfig>(key: K, value: RepondeurConfig[K]) => {
    setConfig(prev => ({ ...prev, [key]: value }));
  }, []);

  // ─── Test call ───

  const startTestCall = useCallback(() => {
    setTestState('ringing');
    setTestMessages([{ role: 'system', text: 'Appel entrant...' }]);
    setTestInput('');
    setTestDuration(0);

    // Start duration timer
    if (testTimerRef.current) clearInterval(testTimerRef.current);
    testTimerRef.current = setInterval(() => {
      setTestDuration(d => d + 1);
    }, 1000);

    // After 2s, show greeting
    setTimeout(() => {
      setTestState('active');
      setTestMessages(prev => [
        ...prev,
        { role: 'system', text: 'Appel connect\u00e9' },
        { role: 'camille', text: config.greeting },
      ]);
    }, 2000);
  }, [config.greeting]);

  const sendTestMessage = useCallback(() => {
    if (!testInput.trim() || testState !== 'active') return;
    const msg = testInput.trim();
    setTestInput('');
    setTestMessages(prev => [...prev, { role: 'caller', text: msg }]);
    setTestState('thinking');

    // Simulate AI thinking
    setTimeout(() => {
      const response = SIMULATED_RESPONSES[Math.floor(Math.random() * SIMULATED_RESPONSES.length)];
      setTestMessages(prev => [...prev, { role: 'camille', text: response }]);
      setTestState('active');
    }, 1500);
  }, [testInput, testState]);

  const endTestCall = useCallback(() => {
    if (testTimerRef.current) {
      clearInterval(testTimerRef.current);
      testTimerRef.current = null;
    }
    setTestState('ended');
    setTestMessages(prev => [
      ...prev,
      { role: 'system', text: `Appel termin\u00e9 \u2014 Dur\u00e9e: ${formatDuration(testDuration)}` },
    ]);
  }, [testDuration]);

  const resetTestCall = useCallback(() => {
    if (testTimerRef.current) {
      clearInterval(testTimerRef.current);
      testTimerRef.current = null;
    }
    setTestState('idle');
    setTestMessages([]);
    setTestInput('');
    setTestDuration(0);
  }, []);

  // Cleanup timer on unmount
  useEffect(() => {
    return () => {
      if (testTimerRef.current) clearInterval(testTimerRef.current);
    };
  }, []);

  // ─── Render ───

  if (loading) {
    return (
      <div className="page-container max-w-lg">
        <div className="page-header">
          <div>
            <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
              <span style={{ fontSize: 28 }}>&#128222;</span>
              R&eacute;pondeur Intelligent
            </h1>
            <p className="page-subtitle">Chargement...</p>
          </div>
        </div>
        <div className="card section" style={{ padding: 48, textAlign: 'center' }}>
          <div className="animate-pulse text-muted">Chargement de la configuration...</div>
        </div>
      </div>
    );
  }

  return (
    <div className="page-container max-w-lg">
      {/* ═══ Header ═══ */}
      <div className="page-header">
        <div>
          <h1 className="page-title" style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 28 }}>&#128222;</span>
            R&eacute;pondeur Intelligent
          </h1>
          <p className="page-subtitle">
            Camille r&eacute;pond &agrave; vos appels 24h/24, prend les messages et g&egrave;re les urgences.
          </p>
        </div>
        <div className="flex items-center gap-12">
          <div className="flex items-center gap-8">
            <span
              style={{
                display: 'inline-block',
                width: 8,
                height: 8,
                borderRadius: '50%',
                background: config.active ? 'var(--success)' : 'var(--danger)',
                boxShadow: config.active ? '0 0 8px var(--success)' : 'none',
              }}
            />
            <span
              className="text-sm font-semibold"
              style={{ color: config.active ? 'var(--success)' : 'var(--danger)' }}
            >
              {config.active ? 'Actif' : 'Inactif'}
            </span>
          </div>
          <label className="toggle-switch">
            <input
              type="checkbox"
              checked={config.active}
              onChange={toggleActive}
            />
            <span className="toggle-slider" />
          </label>
        </div>
      </div>

      {/* ═══ Success alert ═══ */}
      {saveSuccess && (
        <div className="alert alert-success mb-16" style={{ animation: 'fadeIn 0.2s ease' }}>
          Configuration enregistr&eacute;e avec succ&egrave;s.
        </div>
      )}

      {/* ═══ Configuration Card ═══ */}
      <div className="card section">
        <button
          onClick={() => setConfigOpen(o => !o)}
          className="section-title"
          style={{
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            width: '100%',
            justifyContent: 'space-between',
            fontFamily: 'var(--font-sans)',
            padding: 0,
            marginBottom: configOpen ? 16 : 0,
          }}
        >
          <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>&#9881;&#65039;</span>
            Configuration
          </span>
          <span style={{
            fontSize: 12,
            color: 'var(--text-muted)',
            transform: configOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            transition: 'transform 0.2s ease',
            display: 'inline-block',
          }}>
            &#9660;
          </span>
        </button>

        {configOpen && (
          <div style={{ animation: 'fadeIn 0.2s ease' }}>
            {/* Message d'accueil */}
            <div className="form-group">
              <label>Message d&apos;accueil</label>
              <textarea
                value={config.greeting}
                onChange={e => updateConfig('greeting', e.target.value)}
                rows={3}
                placeholder="Bonjour, vous \u00eates bien chez..."
              />
              <span className="form-hint">Ce message sera lu lors du d&eacute;crochage automatique.</span>
            </div>

            {/* Voix + Langue */}
            <div className="grid-2">
              <div className="form-group">
                <label>Voix</label>
                <select
                  className="select"
                  value={config.voice}
                  onChange={e => updateConfig('voice', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="aura-2-agathe-fr">Agathe (Femme, FR)</option>
                  <option value="aura-2-theron-en">Th&eacute;ron (Homme, EN)</option>
                </select>
              </div>
              <div className="form-group">
                <label>Langue</label>
                <select
                  className="select"
                  value={config.language}
                  onChange={e => updateConfig('language', e.target.value)}
                  style={{ width: '100%' }}
                >
                  <option value="fr">Fran&ccedil;ais</option>
                  <option value="en">English</option>
                  <option value="auto">Auto-d&eacute;tection</option>
                </select>
              </div>
            </div>

            {/* Mode de fonctionnement */}
            <div className="form-group">
              <label>Mode de fonctionnement</label>
              <div className="flex gap-16 flex-wrap" style={{ marginTop: 4 }}>
                {[
                  { value: 'auto', label: 'R\u00e9ponse automatique' },
                  { value: 'message', label: 'Prise de message' },
                  { value: 'faq', label: 'FAQ + escalade' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-6" style={{ cursor: 'pointer' }}>
                    <input
                      type="radio"
                      name="repondeur-mode"
                      value={opt.value}
                      checked={config.mode === opt.value}
                      onChange={() => updateConfig('mode', opt.value)}
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Horaires d'activite */}
            <div className="form-group">
              <label>Horaires d&apos;activit&eacute;</label>
              <div className="flex items-center gap-12 flex-wrap" style={{ marginTop: 4 }}>
                <div className="flex items-center gap-6">
                  <span className="text-sm text-secondary">De</span>
                  <input
                    type="time"
                    className="input"
                    value={config.scheduleFrom}
                    onChange={e => updateConfig('scheduleFrom', e.target.value)}
                    disabled={config.schedule24h}
                    style={{ width: 120 }}
                  />
                </div>
                <div className="flex items-center gap-6">
                  <span className="text-sm text-secondary">&Agrave;</span>
                  <input
                    type="time"
                    className="input"
                    value={config.scheduleTo}
                    onChange={e => updateConfig('scheduleTo', e.target.value)}
                    disabled={config.schedule24h}
                    style={{ width: 120 }}
                  />
                </div>
                <label className="flex items-center gap-6" style={{ cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={config.schedule24h}
                    onChange={e => updateConfig('schedule24h', e.target.checked)}
                  />
                  <span className="text-sm font-medium">24h/24</span>
                </label>
              </div>
            </div>

            {/* Numeros */}
            <div className="grid-2">
              <div className="form-group">
                <label>Num&eacute;ro de t&eacute;l&eacute;phone</label>
                <input
                  type="tel"
                  className="input"
                  value={config.phoneNumber || ''}
                  readOnly
                  placeholder="Non configur&eacute;"
                  style={{ opacity: 0.7, cursor: 'not-allowed' }}
                />
                <span className="form-hint">G&eacute;r&eacute; par l&apos;administrateur.</span>
              </div>
              <div className="form-group">
                <label>Num&eacute;ro d&apos;escalade</label>
                <input
                  type="tel"
                  className="input"
                  value={config.escalationNumber}
                  onChange={e => updateConfig('escalationNumber', e.target.value)}
                  placeholder="+33 6 12 34 56 78"
                />
                <span className="form-hint">Num&eacute;ro pour transfert humain en cas d&apos;urgence.</span>
              </div>
            </div>

            {/* Save button */}
            <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 8 }}>
              <button
                className="btn btn-primary"
                onClick={handleSaveConfig}
              >
                Enregistrer la configuration
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ═══ Statistiques ═══ */}
      <div className="section">
        <h2 className="section-title">
          <span style={{ fontSize: 16 }}>&#128200;</span>
          Statistiques
        </h2>
        <div className="grid-4">
          <div className="stat-card">
            <div className="stat-label">Appels re&ccedil;us</div>
            <div className="stat-value">{stats.callsToday}</div>
            <div className="text-xs text-muted">{stats.callsTotal} au total</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Dur&eacute;e moyenne</div>
            <div className="stat-value stat-value-sm">{formatDuration(stats.avgDuration)}</div>
            <div className="text-xs text-muted">par appel</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Messages pris</div>
            <div className="stat-value">{stats.messagesTaken}</div>
            <div className="text-xs text-muted">en attente de suivi</div>
          </div>
          <div className="stat-card">
            <div className="stat-label">Taux de r&eacute;solution</div>
            <div className="stat-value stat-value-sm">{stats.resolutionRate}%</div>
            <div className="text-xs text-muted">r&eacute;solus sans escalade</div>
          </div>
        </div>
      </div>

      {/* ═══ Test du Repondeur ═══ */}
      <div className="card section">
        <h2 className="section-title">
          <span style={{ fontSize: 16 }}>&#127911;</span>
          Test du R&eacute;pondeur
        </h2>

        {testState === 'idle' ? (
          <div style={{ textAlign: 'center', padding: '24px 0' }}>
            <p className="text-secondary text-sm mb-16">
              Simulez un appel pour tester le comportement de Camille avec votre configuration actuelle.
            </p>
            <button className="btn btn-primary" onClick={startTestCall}>
              &#128222; Simuler un appel test
            </button>
          </div>
        ) : (
          <div>
            {/* Call conversation */}
            <div
              style={{
                background: 'var(--bg-primary)',
                border: '1px solid var(--border-primary)',
                borderRadius: 'var(--radius-md)',
                padding: 16,
                maxHeight: 360,
                overflowY: 'auto',
                marginBottom: 16,
              }}
            >
              {testMessages.map((msg, i) => (
                <div
                  key={i}
                  style={{
                    marginBottom: 10,
                    display: 'flex',
                    justifyContent: msg.role === 'caller' ? 'flex-end' : msg.role === 'system' ? 'center' : 'flex-start',
                  }}
                >
                  {msg.role === 'system' ? (
                    <span
                      className="text-xs text-muted font-medium"
                      style={{
                        background: 'var(--bg-tertiary)',
                        padding: '4px 12px',
                        borderRadius: 20,
                      }}
                    >
                      {msg.text}
                    </span>
                  ) : (
                    <div
                      style={{
                        maxWidth: '75%',
                        padding: '10px 14px',
                        borderRadius: msg.role === 'camille' ? '14px 14px 14px 4px' : '14px 14px 4px 14px',
                        background: msg.role === 'camille' ? 'var(--accent-muted)' : 'var(--success-muted)',
                        color: 'var(--text-primary)',
                        fontSize: 13,
                        lineHeight: 1.5,
                      }}
                    >
                      <div className="text-xs font-semibold mb-4" style={{
                        color: msg.role === 'camille' ? 'var(--accent)' : 'var(--success)',
                      }}>
                        {msg.role === 'camille' ? '&#128222; Camille' : '&#128100; Appelant'}
                      </div>
                      {msg.text}
                    </div>
                  )}
                </div>
              ))}

              {/* Ringing animation */}
              {testState === 'ringing' && (
                <div style={{ textAlign: 'center', padding: '16px 0' }}>
                  <div style={{
                    display: 'inline-block',
                    fontSize: 32,
                    animation: 'pulse 1s infinite',
                  }}>
                    &#128222;
                  </div>
                  <div className="text-sm text-muted mt-8">Sonnerie en cours...</div>
                </div>
              )}

              {/* Thinking indicator */}
              {testState === 'thinking' && (
                <div style={{ display: 'flex', justifyContent: 'flex-start', marginTop: 8 }}>
                  <div style={{
                    padding: '10px 14px',
                    borderRadius: '14px 14px 14px 4px',
                    background: 'var(--accent-muted)',
                    fontSize: 13,
                  }}>
                    <div className="text-xs font-semibold mb-4" style={{ color: 'var(--accent)' }}>
                      &#128222; Camille
                    </div>
                    <span style={{ display: 'inline-flex', gap: 4, alignItems: 'center' }}>
                      <span className="animate-pulse">&#9679;</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.2s' }}>&#9679;</span>
                      <span className="animate-pulse" style={{ animationDelay: '0.4s' }}>&#9679;</span>
                      <span className="text-muted text-xs" style={{ marginLeft: 6 }}>r&eacute;fl&eacute;chit...</span>
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Input area */}
            {(testState === 'active' || testState === 'thinking') && (
              <div className="flex gap-8">
                <input
                  type="text"
                  className="input flex-1"
                  placeholder="Tapez un message en tant qu'appelant..."
                  value={testInput}
                  onChange={e => setTestInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') sendTestMessage(); }}
                  disabled={testState === 'thinking'}
                />
                <button
                  className="btn btn-primary"
                  onClick={sendTestMessage}
                  disabled={testState === 'thinking' || !testInput.trim()}
                >
                  Envoyer
                </button>
                <button
                  className="btn btn-danger"
                  onClick={endTestCall}
                >
                  Raccrocher
                </button>
              </div>
            )}

            {/* Call timer */}
            {testState !== 'ended' && (
              <div className="text-xs text-muted mt-8" style={{ textAlign: 'center' }}>
                Dur&eacute;e : {formatDuration(testDuration)}
              </div>
            )}

            {/* Ended state */}
            {testState === 'ended' && (
              <div style={{ textAlign: 'center', marginTop: 8 }}>
                <button className="btn btn-secondary" onClick={resetTestCall}>
                  Nouveau test
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ═══ Historique des Appels ═══ */}
      <div className="card section">
        <h2 className="section-title">
          <span style={{ fontSize: 16 }}>&#128203;</span>
          Historique des Appels
        </h2>

        {history.length === 0 ? (
          <div className="empty-state">
            <div className="empty-state-icon">&#128222;</div>
            <div className="empty-state-text">Aucun appel enregistr&eacute;</div>
            <div className="empty-state-sub">
              Les appels appara&icirc;tront ici une fois le r&eacute;pondeur activ&eacute;.
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="data-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Appelant</th>
                  <th>Dur&eacute;e</th>
                  <th>Statut</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {history.map(call => {
                  const statusInfo = STATUS_MAP[call.status] || STATUS_MAP.missed;
                  const isExpanded = expandedCallId === call.id;
                  return (
                    <React.Fragment key={call.id}>
                      <tr>
                        <td>{formatDate(call.date)}</td>
                        <td className="font-medium">{call.caller}</td>
                        <td>{formatDuration(call.duration)}</td>
                        <td>
                          <span className={statusInfo.badgeClass}>{statusInfo.label}</span>
                        </td>
                        <td>
                          <button
                            className="btn btn-ghost btn-xs"
                            onClick={() => setExpandedCallId(isExpanded ? null : call.id)}
                          >
                            {isExpanded ? 'Fermer' : 'Voir'}
                          </button>
                        </td>
                      </tr>
                      {isExpanded && call.transcript && (
                        <tr>
                          <td colSpan={5} style={{ background: 'var(--bg-primary)', padding: '12px 16px' }}>
                            <div className="text-xs font-semibold text-muted mb-4">Transcription</div>
                            <div
                              className="text-sm"
                              style={{
                                whiteSpace: 'pre-wrap',
                                lineHeight: 1.6,
                                color: 'var(--text-secondary)',
                              }}
                            >
                              {call.transcript}
                            </div>
                          </td>
                        </tr>
                      )}
                    </React.Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
