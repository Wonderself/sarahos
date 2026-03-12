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
  const [selectedAgents, setSelectedAgents] = useState<AgentTypeId[]>(['fz-repondeur']);
  const [registeredSession, setRegisteredSession] = useState<Record<string, unknown> | null>(null);
  const [termsAccepted, setTermsAccepted] = useState(false);

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
      fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/portal/active-agents', token: session.token, method: 'PATCH', data: { activeAgents: selectedAgents } }),
      }).catch(() => {});
    }
    window.location.href = '/client/onboarding';
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      // Register
      if (mode === 'register') {
        if (!termsAccepted) { setError('Veuillez accepter les CGU et la Politique de Confidentialite'); setLoading(false); return; }
        if (!email || !name || !password) { setError('Tous les champs sont requis'); setLoading(false); return; }
        if (password.length < 10) { setError('Le mot de passe doit faire au moins 10 caracteres'); setLoading(false); return; }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) { setError('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'); setLoading(false); return; }

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
          role: data.role, tier: data.tier,
          activeAgents: data.activeAgents ?? ['fz-repondeur'],
          userNumber: data.userNumber ?? 0,
          commissionRate: data.commissionRate ?? 0,
          referralCode: data.referralCode ?? '',
        };
        localStorage.setItem('fz_session', JSON.stringify(sessionData));
        localStorage.setItem('fz_welcome_pending', 'true');
        setActiveAgentIds(data.activeAgents ?? ['fz-repondeur']);
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
        if (!password || password.length < 10) { setError('Le mot de passe doit faire au moins 10 caracteres'); setLoading(false); return; }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) { setError('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre'); setLoading(false); return; }
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

      localStorage.setItem('fz_session', JSON.stringify({
        token: data.token, userId: data.userId,
        email: data.email ?? email, displayName: data.displayName ?? name,
        role: data.role, tier: data.tier,
        activeAgents: data.activeAgents ?? ['fz-repondeur'],
        userNumber: data.userNumber ?? 0,
        commissionRate: data.commissionRate ?? 0,
        referralCode: data.referralCode ?? '',
      }));
      if (data.activeAgents) setActiveAgentIds(data.activeAgents);
      localStorage.setItem('fz_welcome_pending', 'true');
      /* login info logged server-side only */
      const redirectParam = new URLSearchParams(window.location.search).get('redirect');
      // Safe redirect: only allow paths starting with /client or /admin, no protocol/host injection
      const safeRedirectPattern = /^\/(?:client|admin|system|infra)(?:\/|$)/;
      if (redirectParam && safeRedirectPattern.test(redirectParam) && !redirectParam.includes('//') && !redirectParam.includes('\\')) {
        window.location.href = redirectParam;
      } else if (data.role === 'admin') {
        window.location.href = '/admin';
      } else if (data.onboardingCompleted === false) {
        window.location.href = '/client/onboarding';
      } else {
        window.location.href = '/client/dashboard';
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  // ── Structured data for SEO ──
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    'name': 'Connexion Freenzy.io',
    'description': 'Page de connexion à la plateforme IA Freenzy.io',
    'url': 'https://freenzy.io/login',
    'publisher': {
      '@type': 'Organization',
      'name': 'Freenzy.io',
      'url': 'https://freenzy.io',
    },
  };

  // ── Step 2: Agent Selection after registration ──
  if (step === 'agents') {
    return (
      <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <main aria-label="Selection des agents Freenzy.io" style={{ flex: 1, padding: 24, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: 640, width: '100%' }}>
            <div className="text-center" style={{ marginBottom: 32 }}>
              <div style={{ fontSize: 48, marginBottom: 16 }}>{'🎉'}</div>
              <h1 style={{ fontSize: 24, fontWeight: 600, fontFamily: 'var(--font-display)', color: '#111827', marginBottom: 8, letterSpacing: '-0.02em' }}>
                Bienvenue ! Choisissez vos <span className="fz-logo-word">agents</span>
              </h1>
              <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.6 }}>
                Selectionnez les agents dont vous avez besoin. Vous pourrez en activer d&apos;autres plus tard.
                <br />
                <span style={{ color: '#7c3aed', fontWeight: 600 }}>Camille (Répondeur Intelligent)</span> est pre-selectionnee par defaut.
              </p>
            </div>

            {/* Referral notice */}
            {refCode && (
              <div className="alert alert-success mb-16 text-md text-center" role="status">
                Vous avez ete invite par un ami ! Bienvenue dans la communaute Freenzy.io.
              </div>
            )}

            {/* Agent grid */}
            <div
              className="auth-agent-grid"
              role="group"
              aria-label="Choisissez vos agents"
              style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12 }}
            >
              {DEFAULT_AGENTS.map(agent => {
                const selected = selectedAgents.includes(agent.id);
                return (
                  <button
                    key={agent.id}
                    type="button"
                    onClick={() => toggleAgentSelection(agent.id)}
                    className="auth-agent-card"
                    aria-pressed={selected}
                    aria-label={`${agent.name} — ${agent.role}${selected ? ' (selectionne)' : ''}`}
                    style={{
                      background: selected ? '#fafafa' : '#fff',
                      border: `1.5px solid ${selected ? agent.color : 'rgba(0,0,0,0.08)'}`,
                      borderRadius: 14, padding: '16px 14px',
                      cursor: 'pointer', textAlign: 'left',
                      transition: 'all 0.2s ease',
                      position: 'relative',
                      opacity: selected ? 1 : 0.65,
                      fontFamily: 'var(--font-sans)',
                      minHeight: 44,
                    }}
                  >
                    <div style={{
                      position: 'absolute', top: 10, right: 10,
                      width: 20, height: 20, borderRadius: 6,
                      background: selected ? agent.color : '#f3f4f6',
                      border: `1.5px solid ${selected ? agent.color : 'rgba(0,0,0,0.1)'}`,
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      color: 'white', fontSize: 11, fontWeight: 700,
                    }} aria-hidden="true">
                      {selected && <span style={{ fontSize: 11 }}>{'✅'}</span>}
                    </div>
                    <div style={{ fontSize: 28, marginBottom: 10 }} aria-hidden="true">{agent.emoji || '\u{1F916}'}</div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: '#111827', marginBottom: 2 }}>
                      {agent.name}
                    </div>
                    <div style={{ fontSize: 11, color: '#6b7280', marginBottom: 4 }}>
                      {agent.role}
                    </div>
                    <div style={{ fontSize: 10, color: '#9ca3af', lineHeight: 1.4 }}>
                      {agent.tagline}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* CTA */}
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <button
                onClick={finishAgentSelection}
                className="btn btn-primary auth-agent-cta"
                aria-label={`Commencer avec ${selectedAgents.length} agent${selectedAgents.length > 1 ? 's' : ''} selectionne${selectedAgents.length > 1 ? 's' : ''}`}
                style={{ height: 48, fontSize: 15, padding: '0 36px', borderRadius: 12, fontWeight: 600 }}
              >
                Commencer avec {selectedAgents.length} agent{selectedAgents.length > 1 ? 's' : ''}
              </button>
              <div style={{ fontSize: 12, color: '#9ca3af', marginTop: 12 }}>
                Vous pourrez activer ou desactiver des agents a tout moment.
              </div>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // ── Step 1: Login / Register Form ──
  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
      />
      {/* Form panel */}
      <main aria-label="Connexion à Freenzy.io" style={{ flex: 1, padding: 24, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <div className="auth-form-container" style={{ maxWidth: 400, width: '100%' }}>
        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 32 }}>
          <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
            <div className="fz-logo-text fz-logo-text-light" style={{ fontSize: 22 }}>
              freenzy.io
            </div>
            <span style={{ fontSize: 9, fontStyle: 'italic', color: '#B0B0B0', fontWeight: 400 }}>Beta Test 1</span>
          </div>
          <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4, fontFamily: 'var(--font-display)' }}>
            Votre équipe <span className="fz-logo-word">IA</span> disponible 24/7
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
            <div style={{ display: 'flex', gap: 2, padding: 3, background: '#f3f4f6', borderRadius: 10, marginBottom: 20 }}>
              <button
                onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  background: mode === 'login' ? '#fff' : 'transparent',
                  color: mode === 'login' ? '#111827' : '#6b7280',
                  boxShadow: mode === 'login' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
              >
                Connexion
              </button>
              <button
                onClick={() => { setMode('register'); setError(''); setSuccess(''); }}
                style={{
                  flex: 1, padding: '8px 0', borderRadius: 8, fontSize: 13, fontWeight: 500,
                  border: 'none', cursor: 'pointer', fontFamily: 'var(--font-sans)',
                  background: mode === 'register' ? '#fff' : 'transparent',
                  color: mode === 'register' ? '#111827' : '#6b7280',
                  boxShadow: mode === 'register' ? '0 1px 3px rgba(0,0,0,0.06)' : 'none',
                }}
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
          <form onSubmit={handleSubmit} aria-label={mode === 'register' ? 'Formulaire d\'inscription' : mode === 'forgot' ? 'Formulaire de recuperation de mot de passe' : mode === 'reset' ? 'Formulaire de reinitialisation de mot de passe' : 'Formulaire de connexion'}>
            <div style={{ padding: 0 }}>
              {mode === 'register' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="register-name" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>
                      Nom complet
                    </label>
                    <input type="text" id="register-name" className="input w-full" placeholder="Marie Dupont"
                      autoComplete="name"
                      style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                      value={name} onChange={e => setName(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="register-email" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>
                      Email professionnel
                    </label>
                    <input type="email" id="register-email" className="input w-full" placeholder="marie@entreprise.com"
                      autoComplete="email"
                      style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="register-password" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>
                      Mot de passe
                    </label>
                    <input type="password" id="register-password" className="input w-full" placeholder="Min 10 car., majuscule, minuscule, chiffre"
                      autoComplete="new-password"
                      aria-describedby="password-requirements"
                      style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                      value={password} onChange={e => setPassword(e.target.value)} required minLength={10} />
                    <span id="password-requirements" className="sr-only">Le mot de passe doit faire au moins 10 caracteres et contenir une majuscule, une minuscule et un chiffre.</span>
                  </div>
                  <div style={{
                    background: '#f0fdf4', borderRadius: 12, padding: '12px 16px', marginBottom: 16,
                    border: '1px solid rgba(22,163,74,0.12)',
                  }}>
                    <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: '#16a34a' }}>
                      Accès <span className="fz-logo-word">gratuit</span> · 0% de commission
                    </div>
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2 }}>
                      Payez uniquement les tokens consommés, au prix officiel.
                    </div>
                  </div>
                </>
              )}

              {mode === 'login' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="login-email" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>Email</label>
                    <input type="email" id="login-email" className="input w-full" placeholder="marie@entreprise.com"
                      autoComplete="email"
                      style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                      value={email} onChange={e => setEmail(e.target.value)} required />
                  </div>
                  <div style={{ marginBottom: 8 }}>
                    <label htmlFor="login-password" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>Mot de passe</label>
                    <input type="password" id="login-password" className="input w-full" placeholder="Votre mot de passe"
                      autoComplete="current-password"
                      style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                      value={password} onChange={e => setPassword(e.target.value)} required />
                  </div>
                  <div style={{ textAlign: 'right', marginBottom: 16 }}>
                    <button type="button"
                      onClick={() => { setMode('forgot'); setError(''); setSuccess(''); }}
                      style={{ background: 'none', border: 'none', color: '#7c3aed', fontSize: 13, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}
                    >
                      Mot de passe oublie ?
                    </button>
                  </div>
                </>
              )}

              {mode === 'forgot' && (
                <div style={{ marginBottom: 16 }}>
                  <label htmlFor="forgot-email" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>Email de votre compte</label>
                  <input type="email" id="forgot-email" className="input w-full" placeholder="marie@entreprise.com"
                    autoComplete="email"
                    style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                    value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
              )}

              {mode === 'reset' && (
                <>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="reset-password" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>Nouveau mot de passe</label>
                    <input type="password" id="reset-password" className="input w-full" placeholder="Min 10 car., majuscule, minuscule, chiffre"
                      autoComplete="new-password"
                      aria-describedby="reset-password-requirements"
                      style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                      value={password} onChange={e => setPassword(e.target.value)} required minLength={10} />
                    <span id="reset-password-requirements" className="sr-only">Le mot de passe doit faire au moins 10 caracteres et contenir une majuscule, une minuscule et un chiffre.</span>
                  </div>
                  <div style={{ marginBottom: 16 }}>
                    <label htmlFor="reset-password-confirm" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>Confirmer le mot de passe</label>
                    <input type="password" id="reset-password-confirm" className="input w-full" placeholder="Repetez le mot de passe"
                      autoComplete="new-password"
                      style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                      value={passwordConfirm} onChange={e => setPasswordConfirm(e.target.value)} required minLength={10} />
                  </div>
                </>
              )}

              {mode === 'register' && (
                <label style={{ display: 'flex', alignItems: 'flex-start', gap: 10, fontSize: 12, color: '#6b7280', cursor: 'pointer', marginBottom: 4, padding: '6px 0' }}>
                  <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)}
                    style={{ marginTop: 2, accentColor: '#7c3aed', width: 18, height: 18, minWidth: 18, flexShrink: 0 }} />
                  <span>
                    J&apos;accepte les{' '}
                    <a href="/legal/cgu" target="_blank" style={{ color: '#7c3aed', textDecoration: 'underline' }}>
                      Conditions Generales d&apos;Utilisation
                    </a>{' '}et la{' '}
                    <a href="/legal/confidentialite" target="_blank" style={{ color: '#7c3aed', textDecoration: 'underline' }}>
                      Politique de Confidentialite
                    </a>.
                  </span>
                </label>
              )}

              {error && (
                <div className="alert alert-danger" role="alert" style={{ marginBottom: 16, fontSize: 13 }}>{error}</div>
              )}

              <button type="submit" className="btn btn-primary w-full auth-submit-btn"
                aria-label={mode === 'register' ? 'Creer mon compte gratuitement' : mode === 'forgot' ? 'Envoyer le lien de reinitialisation' : mode === 'reset' ? 'Mettre a jour le mot de passe' : 'Se connecter a Freenzy.io'}
                style={{
                height: 48, fontSize: 15, borderRadius: 10, fontWeight: 600,
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', border: 'none',
                boxShadow: '0 0 30px rgba(124,58,237,0.3)',
              }} disabled={loading || (mode === 'register' && !termsAccepted)}>
                {loading ? 'Chargement...'
                  : mode === 'register' ? 'Creer mon compte gratuitement'
                  : mode === 'forgot' ? 'Envoyer le lien'
                  : mode === 'reset' ? 'Mettre a jour'
                  : 'Se connecter'}
              </button>

              {(mode === 'forgot' || mode === 'reset') && (
                <button type="button"
                  onClick={() => { setMode('login'); setError(''); setSuccess(''); }}
                  style={{
                    width: '100%', marginTop: 10, padding: '10px 0', fontSize: 13,
                    background: 'none', border: 'none', color: '#6b7280', cursor: 'pointer',
                    fontFamily: 'var(--font-sans)',
                  }}
                >
                  Retour a la connexion
                </button>
              )}
            </div>
          </form>

          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a href="/plans" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
              Voir les tarifs — Tout est gratuit
            </a>
          </div>
        </>

        {/* Agent taglines */}
        <div className="auth-tagline-grid" style={{ marginTop: 32, display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 8 }}>
          {DEFAULT_AGENTS.slice(0, 4).map(agent => (
            <div key={agent.id} style={{
              display: 'flex', alignItems: 'center', gap: 8,
              padding: '8px 12px', borderRadius: 12, background: '#fafafa',
            }}>
              <span style={{ fontSize: 18 }}>{agent.emoji || '\u{1F916}'}</span>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{agent.role}</div>
                <div style={{ fontSize: 10, color: '#9ca3af' }}>{agent.tagline}</div>
              </div>
            </div>
          ))}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            padding: '8px 12px', borderRadius: 12, background: '#fafafa',
          }}>
            <span style={{ fontSize: 18 }}>+</span>
            <div>
              <div style={{ fontSize: 12, fontWeight: 600, color: '#374151' }}>{DEFAULT_AGENTS.length - 4} autres agents</div>
              <div style={{ fontSize: 10, color: '#9ca3af' }}>Tous gratuits</div>
            </div>
          </div>
        </div>
      </div>
      </main>
    </div>
  );
}
