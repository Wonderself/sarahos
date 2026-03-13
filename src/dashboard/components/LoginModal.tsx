'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { setActiveAgentIds } from '../lib/agent-config';

interface LoginModalProps {
  open: boolean;
  onClose: () => void;
  /** Message expliquant pourquoi la connexion est requise */
  message?: string;
  /** Callback apres connexion reussie */
  onAuthenticated?: () => void;
}

export default function LoginModal({ open, onClose, message, onAuthenticated }: LoginModalProps) {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [termsAccepted, setTermsAccepted] = useState(false);

  const overlayRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);
  const firstFocusRef = useRef<HTMLInputElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  // Reset form when opening
  useEffect(() => {
    if (open) {
      setError('');
      setMode('login');
      setEmail('');
      setPassword('');
      setName('');
      setTermsAccepted(false);
    }
  }, [open]);

  // Focus trap + escape to close
  useEffect(() => {
    if (!open) return;

    // Focus first input after mount
    const timer = setTimeout(() => {
      firstFocusRef.current?.focus();
    }, 50);

    function handleKeyDown(e: KeyboardEvent) {
      if (e.key === 'Escape') {
        onClose();
        return;
      }

      // Focus trap
      if (e.key === 'Tab' && cardRef.current) {
        const focusable = cardRef.current.querySelectorAll<HTMLElement>(
          'input, button, a, [tabindex]:not([tabindex="-1"])'
        );
        if (focusable.length === 0) return;

        const first = focusable[0];
        const last = focusable[focusable.length - 1];

        if (e.shiftKey && document.activeElement === first) {
          e.preventDefault();
          last.focus();
        } else if (!e.shiftKey && document.activeElement === last) {
          e.preventDefault();
          first.focus();
        }
      }
    }

    document.addEventListener('keydown', handleKeyDown);
    // Prevent body scroll
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      clearTimeout(timer);
      document.removeEventListener('keydown', handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [open, onClose]);

  const handleOverlayClick = useCallback((e: React.MouseEvent) => {
    if (e.target === overlayRef.current) {
      onClose();
    }
  }, [onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (mode === 'register') {
        if (!termsAccepted) {
          setError('Veuillez accepter les CGU et la Politique de Confidentialite');
          setLoading(false);
          return;
        }
        if (!email || !name || !password) {
          setError('Tous les champs sont requis');
          setLoading(false);
          return;
        }
        if (password.length < 10) {
          setError('Le mot de passe doit faire au moins 10 caracteres');
          setLoading(false);
          return;
        }
        if (!/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
          setError('Le mot de passe doit contenir une majuscule, une minuscule et un chiffre');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'register', email, displayName: name, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? `Erreur ${res.status}`);
          setLoading(false);
          return;
        }

        const sessionData = {
          token: data.token,
          userId: data.userId,
          email: data.email ?? email,
          displayName: data.displayName ?? name,
          role: data.role,
          tier: data.tier,
          activeAgents: data.activeAgents ?? ['fz-repondeur'],
          userNumber: data.userNumber ?? 0,
          commissionRate: data.commissionRate ?? 0,
          referralCode: data.referralCode ?? '',
        };
        localStorage.setItem('fz_session', JSON.stringify(sessionData));
        if (data.activeAgents) setActiveAgentIds(data.activeAgents);

        onClose();
        onAuthenticated?.();
      } else {
        // Login
        if (!email || !password) {
          setError('Email et mot de passe requis');
          setLoading(false);
          return;
        }

        const res = await fetch('/api/auth', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'login', email, password }),
        });
        const data = await res.json();
        if (!res.ok) {
          setError(data.error ?? `Erreur ${res.status}`);
          setLoading(false);
          return;
        }

        localStorage.setItem('fz_session', JSON.stringify({
          token: data.token,
          userId: data.userId,
          email: data.email ?? email,
          displayName: data.displayName ?? '',
          role: data.role,
          tier: data.tier,
          activeAgents: data.activeAgents ?? ['fz-repondeur'],
          userNumber: data.userNumber ?? 0,
          commissionRate: data.commissionRate ?? 0,
          referralCode: data.referralCode ?? '',
        }));
        if (data.activeAgents) setActiveAgentIds(data.activeAgents);

        onClose();
        onAuthenticated?.();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  const displayMessage = message || 'Connectez-vous pour utiliser cette fonctionnalite';

  return (
    <div
      ref={overlayRef}
      onClick={handleOverlayClick}
      role="dialog"
      aria-modal="true"
      aria-label="Connexion requise"
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 9999,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        background: 'rgba(0, 0, 0, 0.6)',
        backdropFilter: 'blur(6px)',
        WebkitBackdropFilter: 'blur(6px)',
        padding: 16,
        animation: 'loginModalFadeIn 0.2s ease',
      }}
    >
      <style>{`
        @keyframes loginModalFadeIn {
          from { opacity: 0; }
          to { opacity: 1; }
        }
        @keyframes loginModalSlideUp {
          from { opacity: 0; transform: translateY(20px) scale(0.97); }
          to { opacity: 1; transform: translateY(0) scale(1); }
        }
      `}</style>

      <div
        ref={cardRef}
        style={{
          background: '#1a1a2e',
          borderRadius: 20,
          maxWidth: 440,
          width: '100%',
          maxHeight: '90vh',
          overflowY: 'auto',
          padding: '32px 28px',
          position: 'relative',
          border: '1px solid rgba(124, 58, 237, 0.2)',
          boxShadow: '0 24px 80px rgba(0, 0, 0, 0.5), 0 0 60px rgba(124, 58, 237, 0.1)',
          animation: 'loginModalSlideUp 0.25s ease',
        }}
      >
        {/* Close button */}
        <button
          ref={closeRef}
          onClick={onClose}
          aria-label="Fermer"
          style={{
            position: 'absolute',
            top: 14,
            right: 14,
            width: 32,
            height: 32,
            borderRadius: 8,
            border: 'none',
            background: 'rgba(255, 255, 255, 0.06)',
            color: '#9ca3af',
            fontSize: 18,
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            transition: 'background 0.15s, color 0.15s',
          }}
          onMouseEnter={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.12)';
            e.currentTarget.style.color = '#fff';
          }}
          onMouseLeave={e => {
            e.currentTarget.style.background = 'rgba(255, 255, 255, 0.06)';
            e.currentTarget.style.color = '#9ca3af';
          }}
        >
          &#x2715;
        </button>

        {/* Logo */}
        <div style={{ textAlign: 'center', marginBottom: 8 }}>
          <div style={{
            fontSize: 20,
            fontWeight: 700,
            fontFamily: 'var(--font-display)',
            background: 'var(--accent)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            letterSpacing: '-0.02em',
          }}>
            freenzy.io
          </div>
          <span style={{ fontSize: 9, fontStyle: 'italic', color: 'rgba(255,255,255,0.4)', fontWeight: 400, marginTop: 2 }}>Beta Test 1</span>
        </div>

        {/* Context message */}
        <div style={{
          textAlign: 'center',
          marginBottom: 24,
          padding: '12px 16px',
          background: 'rgba(124, 58, 237, 0.08)',
          borderRadius: 12,
          border: '1px solid rgba(124, 58, 237, 0.15)',
        }}>
          <div style={{ fontSize: 14, color: '#c4b5fd', fontWeight: 500, lineHeight: 1.5 }}>
            {displayMessage}
          </div>
        </div>

        {/* Mode tabs */}
        <div style={{
          display: 'flex',
          gap: 2,
          padding: 3,
          background: 'rgba(255, 255, 255, 0.05)',
          borderRadius: 10,
          marginBottom: 20,
        }}>
          <button
            type="button"
            onClick={() => { setMode('login'); setError(''); }}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              background: mode === 'login' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
              color: mode === 'login' ? '#c4b5fd' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            Connexion
          </button>
          <button
            type="button"
            onClick={() => { setMode('register'); setError(''); }}
            style={{
              flex: 1,
              padding: '9px 0',
              borderRadius: 8,
              fontSize: 13,
              fontWeight: 500,
              border: 'none',
              cursor: 'pointer',
              fontFamily: 'var(--font-sans)',
              background: mode === 'register' ? 'rgba(124, 58, 237, 0.15)' : 'transparent',
              color: mode === 'register' ? '#c4b5fd' : '#6b7280',
              transition: 'all 0.15s',
            }}
          >
            Creer un compte
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={handleSubmit}
          aria-label={mode === 'register' ? 'Formulaire d\'inscription' : 'Formulaire de connexion'}
        >
          {mode === 'register' && (
            <div style={{ marginBottom: 14 }}>
              <label
                htmlFor="modal-register-name"
                style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: '#d1d5db' }}
              >
                Nom complet
              </label>
              <input
                ref={mode === 'register' ? firstFocusRef : undefined}
                type="text"
                id="modal-register-name"
                placeholder="Marie Dupont"
                autoComplete="name"
                value={name}
                onChange={e => setName(e.target.value)}
                required
                style={{
                  width: '100%',
                  padding: '11px 14px',
                  fontSize: 16,
                  borderRadius: 10,
                  border: '1px solid rgba(255, 255, 255, 0.1)',
                  background: 'rgba(255, 255, 255, 0.05)',
                  color: '#f3f4f6',
                  outline: 'none',
                  fontFamily: 'var(--font-sans)',
                  boxSizing: 'border-box',
                  transition: 'border-color 0.15s',
                }}
                onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)'; }}
                onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
              />
            </div>
          )}

          <div style={{ marginBottom: 14 }}>
            <label
              htmlFor={mode === 'register' ? 'modal-register-email' : 'modal-login-email'}
              style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: '#d1d5db' }}
            >
              Email
            </label>
            <input
              ref={mode === 'login' ? firstFocusRef : undefined}
              type="email"
              id={mode === 'register' ? 'modal-register-email' : 'modal-login-email'}
              placeholder="marie@entreprise.com"
              autoComplete="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              required
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: 16,
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f3f4f6',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
            />
          </div>

          <div style={{ marginBottom: mode === 'login' ? 6 : 14 }}>
            <label
              htmlFor={mode === 'register' ? 'modal-register-password' : 'modal-login-password'}
              style={{ display: 'block', marginBottom: 5, fontSize: 13, fontWeight: 500, color: '#d1d5db' }}
            >
              Mot de passe
            </label>
            <input
              type="password"
              id={mode === 'register' ? 'modal-register-password' : 'modal-login-password'}
              placeholder={mode === 'register' ? 'Min 10 car., majuscule, minuscule, chiffre' : 'Votre mot de passe'}
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={password}
              onChange={e => setPassword(e.target.value)}
              required
              minLength={mode === 'register' ? 10 : undefined}
              style={{
                width: '100%',
                padding: '11px 14px',
                fontSize: 16,
                borderRadius: 10,
                border: '1px solid rgba(255, 255, 255, 0.1)',
                background: 'rgba(255, 255, 255, 0.05)',
                color: '#f3f4f6',
                outline: 'none',
                fontFamily: 'var(--font-sans)',
                boxSizing: 'border-box',
                transition: 'border-color 0.15s',
              }}
              onFocus={e => { e.currentTarget.style.borderColor = 'rgba(124, 58, 237, 0.5)'; }}
              onBlur={e => { e.currentTarget.style.borderColor = 'rgba(255, 255, 255, 0.1)'; }}
            />
          </div>

          {mode === 'login' && (
            <div style={{ textAlign: 'right', marginBottom: 14 }}>
              <a
                href="/login?mode=forgot"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: 12,
                  color: 'var(--accent)',
                  textDecoration: 'none',
                  fontFamily: 'var(--font-sans)',
                }}
              >
                Mot de passe oublie ?
              </a>
            </div>
          )}

          {mode === 'register' && (
            <>
              {/* Free banner */}
              <div style={{
                background: 'rgba(22, 163, 74, 0.08)',
                borderRadius: 10,
                padding: '10px 14px',
                marginBottom: 14,
                border: '1px solid rgba(22, 163, 74, 0.15)',
              }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#4ade80' }}>
                  Acces gratuit - 0% de commission
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                  Payez uniquement les tokens consommes, au prix officiel.
                </div>
              </div>

              {/* Terms */}
              <label style={{
                display: 'flex',
                alignItems: 'flex-start',
                gap: 10,
                fontSize: 12,
                color: '#9ca3af',
                cursor: 'pointer',
                marginBottom: 14,
                padding: '4px 0',
              }}>
                <input
                  type="checkbox"
                  checked={termsAccepted}
                  onChange={e => setTermsAccepted(e.target.checked)}
                  style={{
                    marginTop: 2,
                    accentColor: 'var(--accent)',
                    width: 16,
                    height: 16,
                    minWidth: 16,
                    flexShrink: 0,
                  }}
                />
                <span>
                  J&apos;accepte les{' '}
                  <a href="/legal/cgu" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    CGU
                  </a>{' '}et la{' '}
                  <a href="/legal/confidentialite" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent)', textDecoration: 'underline' }}>
                    Politique de Confidentialite
                  </a>.
                </span>
              </label>
            </>
          )}

          {error && (
            <div
              role="alert"
              style={{
                marginBottom: 14,
                fontSize: 13,
                padding: '10px 14px',
                borderRadius: 10,
                background: 'rgba(239, 68, 68, 0.1)',
                border: '1px solid rgba(239, 68, 68, 0.2)',
                color: '#fca5a5',
              }}
            >
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading || (mode === 'register' && !termsAccepted)}
            aria-label={mode === 'register' ? 'Creer mon compte gratuitement' : 'Se connecter'}
            style={{
              width: '100%',
              height: 48,
              fontSize: 15,
              borderRadius: 10,
              fontWeight: 600,
              border: 'none',
              cursor: loading || (mode === 'register' && !termsAccepted) ? 'not-allowed' : 'pointer',
              background: 'var(--accent)',
              color: '#fff',
              fontFamily: 'var(--font-sans)',
              boxShadow: '0 0 30px rgba(124, 58, 237, 0.25)',
              opacity: loading || (mode === 'register' && !termsAccepted) ? 0.6 : 1,
              transition: 'opacity 0.15s, transform 0.1s',
            }}
          >
            {loading
              ? 'Chargement...'
              : mode === 'register'
                ? 'Creer mon compte gratuitement'
                : 'Se connecter'}
          </button>
        </form>

        {/* Footer link */}
        <div style={{ textAlign: 'center', marginTop: 16 }}>
          <a
            href="/plans"
            target="_blank"
            rel="noopener noreferrer"
            style={{ fontSize: 12, color: '#6b7280', textDecoration: 'none' }}
          >
            Voir les tarifs — Tout est gratuit
          </a>
        </div>
      </div>
    </div>
  );
}
