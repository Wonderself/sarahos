'use client';

import { useState, useEffect } from 'react';
import { getToken, API_BASE } from '@/lib/client-fetch';

const API = API_BASE;

interface CheckItem {
  id: string;
  label: string;
  description: string;
  link?: string;
  testEndpoint?: string;
  testMethod?: string;
  icon: string;
  category: string;
}

const CHECKLIST: CheckItem[] = [
  { id: 'postgres', label: 'PostgreSQL connecté', description: 'Base de données principale opérationnelle', testEndpoint: '/health', icon: '🗄️', category: 'Infrastructure' },
  { id: 'redis', label: 'Redis connecté', description: 'Cache et sessions opérationnels', testEndpoint: '/health', icon: '⚡', category: 'Infrastructure' },
  { id: 'admin_user', label: 'Compte admin créé', description: 'Au moins un compte avec le rôle admin', link: '/admin/users', icon: '👤', category: 'Sécurité' },
  { id: '2fa', label: '2FA activée sur le compte admin', description: 'Authentification à deux facteurs configurée', link: '/admin/security', icon: '🔒', category: 'Sécurité' },
  { id: 'anthropic', label: 'Anthropic API configurée', description: 'ANTHROPIC_API_KEY définie et valide', testEndpoint: '/admin/test/anthropic', testMethod: 'POST', icon: '🤖', category: 'Intégrations IA' },
  { id: 'elevenlabs', label: 'ElevenLabs TTS configuré', description: 'ELEVENLABS_API_KEY définie et valide', testEndpoint: '/admin/test/tts', testMethod: 'POST', icon: '🎙️', category: 'Intégrations IA' },
  { id: 'twilio', label: 'Twilio SMS configuré', description: 'TWILIO_ACCOUNT_SID, AUTH_TOKEN, FROM_NUMBER définis', icon: '📱', category: 'Communications' },
  { id: 'resend', label: 'Resend email configuré', description: 'RESEND_API_KEY définie pour les emails transactionnels', icon: '📧', category: 'Communications' },
  { id: 'first_user', label: 'Premier client créé', description: 'Au moins un utilisateur avec le rôle client', link: '/admin/users', icon: '🧑', category: 'Contenu' },
  { id: 'pricing', label: 'Grille tarifaire configurée', description: 'Tarifs LLM configurés via POST /billing/pricing', link: '/admin/tokens', icon: '💡', category: 'Contenu' },
];

const CATEGORIES = [...new Set(CHECKLIST.map(c => c.category))];

export default function SetupPage() {
  const [completed, setCompleted] = useState<Set<string>>(new Set());
  const [testing, setTesting] = useState<string | null>(null);
  const [testResults, setTestResults] = useState<Record<string, { ok: boolean; message: string }>>({});
  const [health, setHealth] = useState<{ postgres: boolean; redis: boolean } | null>(null);

  useEffect(() => {
    try {
      const saved = JSON.parse(localStorage.getItem('fz_setup_completed') ?? '[]') as string[];
      setCompleted(new Set(saved));
    } catch { /* empty */ }

    fetch(`${API}/health`).then(r => r.json()).then((d: { postgres?: { status?: string }; redis?: { status?: string } }) => {
      setHealth({
        postgres: d?.postgres?.status === 'healthy',
        redis: d?.redis?.status === 'healthy',
      });
      if (d?.postgres?.status === 'healthy') markDone('postgres');
      if (d?.redis?.status === 'healthy') markDone('redis');
    }).catch(() => setHealth({ postgres: false, redis: false }));
  }, []);

  function markDone(id: string) {
    setCompleted(prev => {
      const next = new Set(prev);
      next.add(id);
      localStorage.setItem('fz_setup_completed', JSON.stringify([...next]));
      return next;
    });
  }

  function toggleDone(id: string) {
    setCompleted(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      localStorage.setItem('fz_setup_completed', JSON.stringify([...next]));
      return next;
    });
  }

  async function runTest(item: CheckItem) {
    if (!item.testEndpoint) return;
    setTesting(item.id);
    try {
      const res = await fetch(`${API}${item.testEndpoint}`, {
        method: item.testMethod ?? 'GET',
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      const data = await res.json() as { ok?: boolean; status?: string; message?: string };
      const ok = data.ok === true || res.ok;
      setTestResults(r => ({ ...r, [item.id]: { ok, message: data.message ?? (ok ? 'OK ✅' : 'Erreur ❌') } }));
      if (ok) markDone(item.id);
    } catch (e) {
      setTestResults(r => ({ ...r, [item.id]: { ok: false, message: e instanceof Error ? e.message : 'Erreur' } }));
    }
    setTesting(null);
  }

  const done = CHECKLIST.filter(c => completed.has(c.id)).length;
  const total = CHECKLIST.length;
  const pct = Math.round((done / total) * 100);

  return (
    <div className="setup-page">
      <div className="page-header">
        <div>
          <h1 className="page-title">Setup & Onboarding</h1>
          <p className="page-subtitle">Checklist de configuration initiale</p>
        </div>
      </div>

      {/* Progress */}
      <div className="card section">
        <div className="setup-progress-header">
          <span className="setup-progress-label">
            {done === total ? '🎉 Configuration complète !' : `${done} / ${total} étapes complétées`}
          </span>
          <span className="setup-progress-pct" style={{ color: pct === 100 ? 'var(--success)' : 'var(--accent)' }}>{pct}%</span>
        </div>
        <div className="setup-progress-track">
          <div
            className="setup-progress-fill"
            style={{ width: `${pct}%`, background: pct === 100 ? 'var(--success)' : 'var(--accent)' }}
          />
        </div>
        {health && (
          <div className="setup-health-row">
            <span style={{ color: health.postgres ? 'var(--success)' : 'var(--danger)' }}>
              {health.postgres ? '✅' : '❌'} PostgreSQL
            </span>
            <span style={{ color: health.redis ? 'var(--success)' : 'var(--danger)' }}>
              {health.redis ? '✅' : '❌'} Redis
            </span>
          </div>
        )}
      </div>

      {/* Checklist by category */}
      {CATEGORIES.map(cat => {
        const items = CHECKLIST.filter(c => c.category === cat);
        const catDone = items.filter(i => completed.has(i.id)).length;
        return (
          <div key={cat} className="section">
            <div className="section-title">
              {cat}
              <span className="setup-cat-count">{catDone}/{items.length}</span>
            </div>
            <div className="setup-list">
              {items.map(item => {
                const isDone = completed.has(item.id);
                const testResult = testResults[item.id];
                return (
                  <div key={item.id} className={`setup-item${isDone ? ' done' : ''}`}>
                    <span className="setup-item-icon">{item.icon}</span>
                    <div className="setup-item-body">
                      <span className={`setup-item-label${isDone ? ' done' : ''}`}>
                        {item.label}
                      </span>
                      <div className="setup-item-desc">{item.description}</div>
                      {testResult && (
                        <div className={`setup-item-result ${testResult.ok ? 'ok' : 'err'}`}>
                          {testResult.message}
                        </div>
                      )}
                    </div>
                    <div className="setup-item-actions">
                      {item.testEndpoint && (
                        <button
                          className="btn btn-ghost btn-xs"
                          onClick={() => runTest(item)}
                          disabled={testing === item.id}
                        >
                          {testing === item.id ? '…' : '🔍 Tester'}
                        </button>
                      )}
                      {item.link && (
                        <a href={item.link} className="btn btn-ghost btn-xs">🔗 Config</a>
                      )}
                      <button
                        className={`btn btn-xs ${isDone ? 'btn-ghost' : 'btn-success'}`}
                        onClick={() => toggleDone(item.id)}
                        style={{ minWidth: 28 }}
                      >
                        {isDone ? '↩' : '✓'}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      <p className="text-xs text-muted">
        Les cases cochées sont sauvegardées localement dans votre navigateur.
      </p>
    </div>
  );
}
