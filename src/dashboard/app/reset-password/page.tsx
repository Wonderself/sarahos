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
  const [dark, setDark] = useState(false);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const urlToken = params.get('token');
    if (urlToken) {
      setToken(urlToken);
      setMode('reset');
    }
    try {
      setDark(localStorage.getItem('fz_dark_mode') === 'true');
    } catch {}
  }, []);

  const bgPage = dark ? '#0f0720' : '#fff';
  const bgCard = dark ? 'rgba(255,255,255,0.04)' : '#fff';
  const textPrimary = dark ? '#e4e6eb' : '#111827';
  const textSecondary = dark ? 'rgba(255,255,255,0.55)' : '#6b7280';
  const textLabel = dark ? 'rgba(255,255,255,0.7)' : '#374151';
  const inputBorder = dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.12)';
  const inputBg = dark ? 'rgba(255,255,255,0.06)' : '#fff';
  const inputColor = dark ? '#e4e6eb' : '#1d1d1f';
  const btnBg = dark ? 'linear-gradient(135deg, #7c3aed, #06b6d4)' : '#1d1d1f';

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

  const inputStyle: React.CSSProperties = {
    padding: '11px 14px', fontSize: 14, borderRadius: 10,
    border: `1px solid ${inputBorder}`, background: inputBg,
    color: inputColor, width: '100%', boxSizing: 'border-box',
    outline: 'none',
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', background: bgPage }}>
      <div className="flex-center" style={{ flex: 1, padding: 24, minHeight: '100vh' }}>
        <div style={{ maxWidth: 400, width: '100%', background: bgCard, borderRadius: 20, padding: dark ? 32 : 0, border: dark ? '1px solid rgba(255,255,255,0.08)' : 'none' }}>
          {/* Logo */}
          <div style={{ textAlign: 'center', marginBottom: 32 }}>
            <div className={dark ? 'fz-logo-text fz-logo-text-dark' : 'fz-logo-text fz-logo-text-light'} style={{ fontSize: 22, margin: '0 auto 14px' }}>
              freenzy.io
            </div>
            <p style={{ fontSize: 14, color: textSecondary, marginTop: 4 }}>
              Votre &eacute;quipe IA disponible 24/7
            </p>
          </div>

          {/* Title */}
          <div className="text-center" style={{ marginBottom: 24 }}>
            <div style={{ fontSize: 20, fontWeight: 700, color: textPrimary, letterSpacing: '-0.02em' }}>
              {mode === 'reset' ? 'Nouveau mot de passe' : 'Mot de passe oubli\u00e9'}
            </div>
            <div style={{ fontSize: 14, color: textSecondary, marginTop: 6 }}>
              {mode === 'reset'
                ? 'Choisissez un nouveau mot de passe pour votre compte'
                : 'Entrez votre email pour recevoir un lien de r\u00e9initialisation'}
            </div>
          </div>

          {/* Success */}
          {success && (
            <div style={{
              marginBottom: 16, fontSize: 13, padding: '12px 16px', borderRadius: 10,
              background: dark ? 'rgba(34,197,94,0.12)' : '#f0fdf4',
              border: `1px solid ${dark ? 'rgba(34,197,94,0.25)' : '#bbf7d0'}`,
              color: dark ? '#4ade80' : '#166534',
            }}>{success}</div>
          )}

          {/* Error */}
          {error && (
            <div style={{
              marginBottom: 16, fontSize: 13, padding: '12px 16px', borderRadius: 10,
              background: dark ? 'rgba(239,68,68,0.12)' : '#fef2f2',
              border: `1px solid ${dark ? 'rgba(239,68,68,0.25)' : '#fecaca'}`,
              color: dark ? '#f87171' : '#991b1b',
            }}>{error}</div>
          )}

          {/* Forgot password form */}
          {mode === 'forgot' && !success && (
            <form onSubmit={handleForgot}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="reset-email" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: textLabel }}>
                  Email de votre compte
                </label>
                <input
                  id="reset-email"
                  type="email"
                  placeholder="marie@entreprise.com"
                  style={inputStyle}
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                  aria-required="true"
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', height: 46, fontSize: 14, borderRadius: 10, fontWeight: 600,
                  background: btnBg, border: 'none', color: '#fff', cursor: 'pointer',
                }}
                disabled={loading}
              >
                {loading ? 'Envoi en cours...' : 'Envoyer le lien'}
              </button>
            </form>
          )}

          {/* Reset password form */}
          {mode === 'reset' && !success && (
            <form onSubmit={handleReset}>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="reset-new-pw" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: textLabel }}>
                  Nouveau mot de passe
                </label>
                <input
                  id="reset-new-pw"
                  type="password"
                  placeholder="Min 10 car., majuscule, minuscule, chiffre"
                  style={inputStyle}
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                  minLength={10}
                  aria-required="true"
                />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label htmlFor="reset-confirm-pw" style={{ display: 'block', marginBottom: 6, fontSize: 13, fontWeight: 500, color: textLabel }}>
                  Confirmer le mot de passe
                </label>
                <input
                  id="reset-confirm-pw"
                  type="password"
                  placeholder="R\u00e9p\u00e9tez le mot de passe"
                  style={inputStyle}
                  value={passwordConfirm}
                  onChange={e => setPasswordConfirm(e.target.value)}
                  required
                  minLength={10}
                  aria-required="true"
                />
              </div>

              <button
                type="submit"
                style={{
                  width: '100%', height: 46, fontSize: 14, borderRadius: 10, fontWeight: 600,
                  background: btnBg, border: 'none', color: '#fff', cursor: 'pointer',
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
                fontSize: 13, color: '#7c3aed', textDecoration: 'none',
                fontWeight: 500,
              }}
            >
              Retour &agrave; la connexion
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
