'use client';

import { useState, useEffect } from 'react';

export default function ResetPasswordPage() {
  const [token, setToken] = useState('');
  const [mode, setMode] = useState<'forgot' | 'reset'>('forgot');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setMode('reset');
    }
  }, []);

  async function handleForgot(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!email) { setError('Entrez votre adresse email'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'forgot-password', email }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Erreur ${res.status}`); return; }
      setSuccess('Si cet email existe dans notre systeme, un lien de reinitialisation vous a ete envoye.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  async function handleReset(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setSuccess('');
    if (!password || password.length < 10) { setError('Le mot de passe doit faire au moins 10 caracteres'); return; }
    if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      setError('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre');
      return;
    }
    if (password !== passwordConfirm) { setError('Les mots de passe ne correspondent pas'); return; }
    setLoading(true);

    try {
      const res = await fetch('/api/auth', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'reset-password', token, password }),
      });
      const data = await res.json();
      if (!res.ok) { setError(data.error ?? `Erreur ${res.status}`); return; }
      setSuccess('Mot de passe mis a jour avec succes ! Vous pouvez maintenant vous connecter.');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page" style={{ minHeight: '100vh', display: 'flex', background: '#fff' }}>
      <main aria-label="Reinitialisation du mot de passe Freenzy.io" style={{ flex: 1, padding: 24, minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <div className="auth-form-container" style={{ maxWidth: 400, width: '100%' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6, marginBottom: 14 }}>
              <div className="fz-logo-text fz-logo-text-light" style={{ fontSize: 22 }}>
                freenzy.io
              </div>
              <span style={{ fontSize: 9, fontStyle: 'italic', color: '#B0B0B0', fontWeight: 400 }}>Beta Test 1</span>
            </div>
            <p style={{ fontSize: 14, color: '#9ca3af', marginTop: 4 }}>
              Votre équipe IA disponible 24/7
            </p>
          </div>

          {/* Title */}
          <div className="text-center" style={{ marginBottom: 24 }}>
            <h1 style={{ fontSize: 20, fontWeight: 700, color: '#111827', letterSpacing: '-0.02em' }}>
              {mode === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe oublie'}
            </h1>
            <div style={{ fontSize: 14, color: '#6b7280', marginTop: 6 }}>
              {mode === 'reset'
                ? 'Choisissez un nouveau mot de passe pour votre compte'
                : 'Entrez votre email pour recevoir un lien de reinitialisation'}
            </div>
          </div>

          {/* Success */}
          {success && (
            <div className="alert alert-success mb-16 text-md">{success}</div>
          )}

          {/* Error */}
          {error && (
            <div className="alert alert-danger" role="alert" style={{ marginBottom: 16, fontSize: 13 }}>{error}</div>
          )}

          {/* Forgot password form */}
          {mode === 'forgot' && !success && (
            <form onSubmit={handleForgot} aria-label="Formulaire de recuperation de mot de passe">
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="rp-forgot-email" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>
                  Email de votre compte
                </label>
                <input
                  type="email"
                  id="rp-forgot-email"
                  className="input w-full"
                  placeholder="marie@entreprise.com"
                  autoComplete="email"
                  style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full auth-submit-btn"
                aria-label="Envoyer le lien de reinitialisation par email"
                style={{
                  height: 48, fontSize: 15, borderRadius: 10, fontWeight: 600,
                  background: '#1d1d1f', border: 'none',
                }}
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>
          )}

          {/* Reset password form */}
          {mode === 'reset' && !success && (
            <form onSubmit={handleReset} aria-label="Formulaire de reinitialisation de mot de passe">
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="rp-new-password" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>
                  Nouveau mot de passe
                </label>
                <input
                  type="password"
                  id="rp-new-password"
                  className="input w-full"
                  placeholder="Min 10 car., majuscule, minuscule, chiffre"
                  autoComplete="new-password"
                  aria-describedby="rp-password-requirements"
                  style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={10}
                />
                <span id="rp-password-requirements" className="sr-only">Le mot de passe doit faire au moins 10 caracteres et contenir une majuscule, une minuscule et un chiffre.</span>
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="rp-confirm-password" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: '#374151' }}>
                  Confirmer le mot de passe
                </label>
                <input
                  type="password"
                  id="rp-confirm-password"
                  className="input w-full"
                  placeholder="Repetez le mot de passe"
                  autoComplete="new-password"
                  style={{ padding: '11px 14px', fontSize: 16, borderRadius: 10, border: '1px solid rgba(0,0,0,0.12)', height: 'auto' }}
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  required
                  minLength={10}
                />
              </div>

              <button
                type="submit"
                className="btn btn-primary w-full auth-submit-btn"
                aria-label="Mettre a jour le mot de passe"
                style={{
                  height: 48, fontSize: 15, borderRadius: 10, fontWeight: 600,
                  background: '#1d1d1f', border: 'none',
                }}
                disabled={loading}
              >
                {loading ? 'Mise a jour...' : 'Mettre a jour le mot de passe'}
              </button>
            </form>
          )}

          {/* Back to login */}
          <div style={{ textAlign: 'center', marginTop: 20 }}>
            <a
              href="/login"
              style={{
                fontSize: 13, color: 'var(--accent)', textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Retour a la connexion
            </a>
          </div>
        </div>
      </main>
    </div>
  );
}
