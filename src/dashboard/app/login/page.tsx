'use client';

import { useState, useEffect } from 'react';
import { DEFAULT_AGENTS, setActiveAgentIds } from '../../lib/agent-config';
import type { AgentTypeId } from '../../lib/agent-config';

export default function LoginPage() {
  const [mode, setMode] = useState<'login' | 'register' | 'forgot' | 'reset'>('login');
  const [step, setStep] = useState<'form' | 'agents'>('form');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetToken, setResetToken] = useState('');
  const [refCode, setRefCode] = useState('');
  const [selectedAgents, setSelectedAgents] = useState<AgentTypeId[]>(['sarah-repondeur']);
  const [registeredSession, setRegisteredSession] = useState<Record<string, unknown> | null>(null);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlMode = params.get('mode');
    const token = params.get('token');
    const emailConfirmed = params.get('emailConfirmed');
    const ref = params.get('ref');

    if (urlMode === 'register') setMode('register');
    else if (urlMode === 'reset' && token) { setMode('reset'); setResetToken(token); }
    if (emailConfirmed === 'true') setSuccess('Email confirme avec succes ! Vous pouvez maintenant vous connecter.');
    if (ref) setRefCode(ref);
  }, []);

  function toggleAgentSelection(id: AgentTypeId) {
    setSelectedAgents(prev => {
      if (prev.includes(id)) {
        if (prev.length <= 1) return prev;
        return prev.filter(a => a !== id);
      }
      return [...prev, id];
    });
  }

  function finishAgentSelection() {
    setActiveAgentIds(selectedAgents);
    // Save to backend
    const session = registeredSession;
    if (session?.token) {
      fetch('/api/portal?path=/portal/active-agents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token: session.token, agents: selectedAgents }),
      }).catch(() => {});
    }
    window.location.href = '/client/dashboard';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Register
      if (mode === 'register') {
        if (!email || !name || !password) { setError('Tous les champs sont requis'); setLoading(false); return; }
        if (password.length < 6) { setError('Le mot de passe doit faire au moins 6 caracteres'); setLoading(false); return; }

        const body: Record<string, unknown> = { action: 'register', email, displayName: name, password };
        if (selectedAgents.length > 0) body.activeAgents = selectedAgents;
        if (refCode) body.referredBy = refCode;

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(body),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? `Erreur ${res.status}`); setLoading(false); return; }

        const sessionData = {
          token: data.token, userId: data.userId,
          email: data.email ?? email, displayName: data.displayName ?? name,
          role: data.role, tier: data.tier, apiKey: data.apiKey,
          activeAgents: data.activeAgents ?? ['sarah-repondeur'],
          userNumber: data.userNumber ?? 0,
          commissionRate: data.commissionRate ?? 0,
          referralCode: data.referralCode ?? '',
        };
        localStorage.setItem('sarah_session', JSON.stringify(sessionData));
        localStorage.setItem('sarah_welcome_pending', 'true');
        setActiveAgentIds(data.activeAgents ?? ['sarah-repondeur']);
        setRegisteredSession(sessionData);

        // Go to agent selection step
        setStep('agents');
        setLoading(false);
        return;
      }

      // Forgot Password
      if (mode === 'forgot') {
        if (!email) { setError('Entrez votre adresse email'); setLoading(false); return; }
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'forgot-password', email }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? `Erreur ${res.status}`); setLoading(false); return; }
        setSuccess('Si cet email existe dans notre systeme, un lien de reinitialisation vous a ete envoye.');
        setLoading(false);
        return;
      }

      // Reset Password
      if (mode === 'reset') {
        if (!password || password.length < 6) { setError('Le mot de passe doit faire au moins 6 caracteres'); setLoading(false); return; }
        if (password !== passwordConfirm) { setError('Les mots de passe ne correspondent pas'); setLoading(false); return; }
        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'reset-password', token: resetToken, password }),
        });
        const data = await res.json();
        if (!res.ok) { setError(data.error ?? `Erreur ${res.status}`); setLoading(false); return; }
        setSuccess('Mot de passe mis a jour ! Vous pouvez maintenant vous connecter.');
        setMode('login');
        setPassword('');
        setPasswordConfirm('');
        setLoading(false);
        return;
      }

      // Login
      if (!email || !password) { setError('Email et mot de passe requis'); setLoading(false); return; }
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'login', email, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Erreur ${res.status}`); setLoading(false); return; }

      localStorage.setItem('sarah_session', JSON.stringify({
        token: data.token, userId: data.userId,
        email: data.email ?? email, displayName: data.displayName ?? name,
        role: data.role, tier: data.tier, apiKey: data.apiKey,
        activeAgents: data.activeAgents ?? ['sarah-repondeur'],
        userNumber: data.userNumber ?? 0,
        commissionRate: data.commissionRate ?? 0,
        referralCode: data.referralCode ?? '',
      }));
      if (data.activeAgents) setActiveAgentIds(data.activeAgents);
      localStorage.setItem('sarah_welcome_pending', 'true');
      window.location.href = '/client/dashboard';
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  // ── Step 2: Agent Selection after registration ──
  if (step === 'agents') {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
        <div className="flex-center" style={{ flex: 1, padding: 16, minHeight: '100vh' }}>
          <div style={{ maxWidth: 640, width: '100%' }}>
            <div className="text-center mb-24">
              <div style={{ fontSize: 48, marginBottom: 12 }}>🎉</div>
              <div style={{ fontSize: 22, fontWeight: 800, color: 'var(--text-primary)', marginBottom: 8 }}>
                Bienvenue ! Choisissez vos agents
              </div>
              <div className="text-md text-secondary" style={{ lineHeight: 1.6 }}>
                Selectionnez les agents dont vous avez besoin. Vous pourrez en activer d&apos;autres plus tard.
                <br />
                <span style={{ color: 'var(--accent)', fontWeight: 600 }}>Camille (Repondeuse)</span> est pre-selectionnee par defaut.
              </div>
            </div>

            {/* Referral notice */}
            {refCode && (
              <div className="alert alert-success mb-16 text-md text-center">
                Vous avez ete invite par un ami ! Bienvenue dans la communaute SARAH OS.
              </div>
            )}

            {/* Agent grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 10 }}>
              {DEFAULT_AGENTS.map(agent => {
                const selected = selectedAgents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgentSelection(agent.id)}
                    style={{
                      background: selected ? agent.color + '18' : 'var(--bg-secondary)',
                      border: `2px solid ${selected ? agent.color : 'var(--border-primary)'}`,
                      borderRadius: 12, padding: '14px 12px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.15s ease',
                      position: 'relative',
                      opacity: selected ? 1 : 0.7,
                      fontFamily: 'var(--font-sans)',
                    }}
                  >
                    {/* Checkbox */}
                    <div style={{
                      position: 'absolute', top: 8, right: 8,
                      width: 20, height: 20, borderRadius: 6,
                      background: selected ? agent.color : 'var(--bg-tertiary)',
                      border: `2px solid ${selected ? agent.color : 'var(--border-secondary)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 12, fontWeight: 800,
                    }}>
                      {selected && '✓'}
                    </div>
                    <div style={{ fontSize: 28, marginBottom: 8 }}>{agent.emoji}</div>
                    <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 2 }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--text-secondary)', marginBottom: 6 }}>
                      {agent.role}
                    </div>
                    <div style={{ fontSize: 10, color: 'var(--text-muted)', lineHeight: 1.4 }}>
                      {agent.tagline}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <div className="text-center" style={{ marginTop: 24 }}>
              <button
                onClick={finishAgentSelection}
                className="btn btn-primary"
                style={{ height: 46, fontSize: 15, padding: '0 32px', borderRadius: 12 }}
              >
                Commencer avec {selectedAgents.length} agent{selectedAgents.length > 1 ? 's' : ''}
              </button>
              <div className="text-xs text-muted" style={{ marginTop: 10 }}>
                Vous pourrez activer ou desactiver des agents a tout moment depuis votre dashboard.
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Step 1: Login / Register Form ──
  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: 'var(--bg-primary)' }}>
      {/* Left: Image panel */}
      <div className="login-image-panel" style={{ flex: 1, position: 'relative', display: 'none' }}>
        <img
          src="/images/image1.jpg"
          alt="SARAH OS — Intelligence artificielle pour entreprises"
          style={{ width: '100%', height: '100%', objectFit: 'cover' }}
        />
        <div style={{
          position: 'absolute', inset: 0,
          background: 'linear-gradient(135deg, rgba(99,102,241,0.8), rgba(168,85,247,0.85))',
          display: 'flex', flexDirection: 'column', justifyContent: 'center', padding: '60px 40px',
        }}>
          <div style={{ fontSize: 32, fontWeight: 800, color: 'white', marginBottom: 16, lineHeight: 1.2 }}>
            Votre equipe IA<br />est prete.
          </div>
          <div style={{ fontSize: 16, color: 'rgba(255,255,255,0.85)', lineHeight: 1.7, maxWidth: 360 }}>
            {DEFAULT_AGENTS.length} agents specialises, disponibles 24/7, sans abonnement. Inscrivez-vous et commencez a deleguer.
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 32 }}>
            {[
              { val: String(DEFAULT_AGENTS.length), label: 'Agents IA' },
              { val: '24/7', label: 'Disponible' },
              { val: '0%', label: 'Commission' },
            ].map(s => (
              <div key={s.label}>
                <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>{s.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.7)' }}>{s.label}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Right: Form panel */}
      <div className="flex-center" style={{ flex: 1, padding: 16, minHeight: '100vh' }}>
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-24">
          <img
            src="/images/logo.jpg" alt="SARAH OS"
            style={{ height: 48, borderRadius: 12, margin: '0 auto 12px', display: 'block' }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <p className="text-base text-tertiary mt-4">
            Votre equipe IA disponible 24/7
          </p>
        </div>

        <>
          {success && (
            <div className="alert alert-success mb-16 text-md">{success}</div>
          )}

          {/* Referral banner */}
          {refCode && mode === 'register' && (
            <div className="alert mb-12" style={{
              background: 'var(--accent-muted)', border: '1px solid var(--accent)',
              borderRadius: 10, padding: '10px 14px',
            }}>
              <div className="text-sm font-semibold" style={{ color: 'var(--accent)' }}>
                Invite par un ami
              </div>
              <div className="text-xs text-secondary" style={{ marginTop: 2 }}>
                Code de parrainage : {refCode}
              </div>
            </div>
          )}

          {/* Tabs */}
          {(mode === 'login' || mode === 'register') && (
            <div className="flex bg-tertiary rounded-lg mb-16" style={{ gap: 2, padding: 3 }}>
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                className={`${mode === 'login' ? 'tab tab-active' : 'tab'} text-center`}
                style={{ flex: 1 }}
              >
                Connexion
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                className={`${mode === 'register' ? 'tab tab-active' : 'tab'} text-center`}
                style={{ flex: 1 }}
              >
                Inscription
              </button>
            </div>
          )}

          {mode === 'reset' && (
            <div className="text-center mb-16">
              <div className="text-lg font-bold">Nouveau mot de passe</div>
              <div className="text-md text-tertiary mt-4">Choisissez un nouveau mot de passe pour votre compte</div>
            </div>
          )}

          {mode === 'forgot' && (
            <div className="text-center mb-16">
              <div className="text-lg font-bold">Mot de passe oublie</div>
              <div className="text-md text-tertiary mt-4">Entrez votre email pour recevoir un lien de reinitialisation</div>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit}>
            <div className="card p-20">
              {mode === 'register' && (
                <>
                  <div className="mb-12">
                    <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                      Nom complet
                    </label>
                    <input type="text" className="input w-full" placeholder="Marie Dupont"
                      value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div className="mb-12">
                    <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                      Email professionnel
                    </label>
                    <input type="email" className="input w-full" placeholder="marie@entreprise.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="mb-12">
                    <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>
                      Mot de passe
                    </label>
                    <input type="password" className="input w-full" placeholder="Minimum 6 caracteres"
                      value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div className="alert alert-success mb-12">
                    <div className="text-sm font-semibold">
                      🎁 50 credits offerts + 0% de commission pour les premiers inscrits !
                    </div>
                    <div className="text-xs" style={{ color: '#4b5563', marginTop: 2 }}>
                      Acces gratuit. Payez uniquement les tokens que vous consommez.
                    </div>
                  </div>
                </>
              )}

              {mode === 'login' && (
                <>
                  <div className="mb-12">
                    <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>Email</label>
                    <input type="email" className="input w-full" placeholder="marie@entreprise.com"
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div className="mb-8">
                    <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>Mot de passe</label>
                    <input type="password" className="input w-full" placeholder="Votre mot de passe"
                      value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <div className="mb-12" style={{ textAlign: 'right' }}>
                    <button type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                      className="btn-ghost text-sm pointer"
                      style={{ background: 'none', border: 'none', color: 'var(--accent)', fontFamily: 'var(--font-sans)' }}
                    >
                      Mot de passe oublie ?
                    </button>
                  </div>
                </>
              )}

              {mode === 'forgot' && (
                <div className="mb-12">
                  <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>Email de votre compte</label>
                  <input type="email" className="input w-full" placeholder="marie@entreprise.com"
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              )}

              {mode === 'reset' && (
                <>
                  <div className="mb-12">
                    <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>Nouveau mot de passe</label>
                    <input type="password" className="input w-full" placeholder="Minimum 6 caracteres"
                      value={password} onChange={e => setPassword(e.target.value)} required minLength={6} />
                  </div>
                  <div className="mb-12">
                    <label className="text-sm font-semibold text-secondary" style={{ display: 'block', marginBottom: 6 }}>Confirmer le mot de passe</label>
                    <input type="password" className="input w-full" placeholder="Repetez le mot de passe"
                      value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required minLength={6} />
                  </div>
                </>
              )}

              {error && (
                <div className="alert alert-danger mb-12 text-md">{error}</div>
              )}

              <button type="submit" className="btn btn-primary w-full" style={{ height: 42, fontSize: 14 }} disabled={loading}>
                {loading ? 'Chargement...'
                  : mode === 'register' ? 'Creer mon compte gratuitement'
                  : mode === 'forgot' ? 'Envoyer le lien de reinitialisation'
                  : mode === 'reset' ? 'Mettre a jour le mot de passe'
                  : 'Se connecter'}
              </button>

              {(mode === 'forgot' || mode === 'reset') && (
                <button type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  className="btn btn-ghost w-full mt-8 text-md"
                >
                  Retour a la connexion
                </button>
              )}
            </div>
          </form>

          <div className="text-center mt-16">
            <a href="/plans" className="text-md" style={{ color: 'var(--accent)' }}>
              Voir les tarifs — Tout est gratuit !
            </a>
          </div>
        </>

        {/* Agent taglines */}
        <div className="mt-24" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {DEFAULT_AGENTS.slice(0, 4).map(agent => (
            <div key={agent.id} className="flex items-center gap-8 bg-secondary border rounded-lg" style={{ padding: '6px 10px' }}>
              <span style={{ fontSize: 18 }}>{agent.emoji}</span>
              <div>
                <div className="text-sm font-semibold text-secondary">{agent.role}</div>
                <div className="text-xs text-muted">{agent.tagline}</div>
              </div>
            </div>
          ))}
          <div className="flex items-center gap-8 bg-secondary border rounded-lg" style={{ padding: '6px 10px' }}>
            <span style={{ fontSize: 18 }}>+</span>
            <div>
              <div className="text-sm font-semibold text-secondary">{DEFAULT_AGENTS.length - 4} autres agents</div>
              <div className="text-xs text-muted">Tous gratuits</div>
            </div>
          </div>
        </div>
      </div>
      </div>
    </div>
  );
}
