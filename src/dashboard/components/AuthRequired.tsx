'use client';

import { useState, useEffect } from 'react';
import LoginModal from './LoginModal';

interface AuthRequiredProps {
  children: React.ReactNode;
  pageName: string;
}

function checkAuth(): boolean {
  try {
    // Check localStorage session
    const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
    if (session.token) return true;
  } catch { /* ignore */ }

  try {
    // Check cookie
    const cookies = document.cookie.split(';');
    for (const cookie of cookies) {
      const [name, value] = cookie.trim().split('=');
      if (name === 'fz-token' && value) return true;
    }
  } catch { /* ignore */ }

  return false;
}

export default function AuthRequired({ children, pageName }: AuthRequiredProps) {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [loginModalOpen, setLoginModalOpen] = useState(false);

  useEffect(() => {
    setIsAuthenticated(checkAuth());
  }, []);

  // Still checking — show nothing to avoid flash
  if (isAuthenticated === null) {
    return null;
  }

  if (!isAuthenticated) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '70vh',
        padding: 24,
      }}>
        <div style={{
          textAlign: 'center',
          maxWidth: 440,
          width: '100%',
          padding: '48px 32px',
          borderRadius: 12,
          background: 'var(--fz-bg, #FFFFFF)',
          border: '1px solid #E5E5E5',
        }}>
          <div style={{
            width: 64,
            height: 64,
            borderRadius: 16,
            background: 'rgba(124, 58, 237, 0.08)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            margin: '0 auto 20px',
            fontSize: 32,
          }}>
            🔒
          </div>

          <h2 style={{
            fontSize: 20,
            fontWeight: 700,
            color: 'var(--fz-text, #1A1A1A)',
            margin: '0 0 8px',
          }}>
            Connexion requise
          </h2>

          <p style={{
            fontSize: 14,
            color: 'var(--fz-text-secondary, #6B6B6B)',
            lineHeight: 1.6,
            margin: '0 0 28px',
          }}>
            La page &laquo;&nbsp;{pageName}&nbsp;&raquo; necessite une connexion pour acceder a vos donnees personnelles.
          </p>

          <button
            onClick={() => setLoginModalOpen(true)}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              height: 44,
              padding: '0 28px',
              borderRadius: 8,
              background: '#7c3aed',
              color: '#fff',
              fontSize: 14,
              fontWeight: 600,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              transition: 'opacity 0.15s',
              fontFamily: 'inherit',
            }}
          >
            Se connecter
          </button>

          <p style={{
            fontSize: 13,
            color: 'var(--fz-text-muted, #9B9B9B)',
            marginTop: 20,
          }}>
            Vous n&apos;avez pas de compte ?{' '}
            <button
              onClick={() => setLoginModalOpen(true)}
              style={{
                color: '#7c3aed',
                textDecoration: 'none',
                fontWeight: 500,
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 'inherit',
                fontFamily: 'inherit',
                padding: 0,
              }}
            >
              Creer un compte gratuit
            </button>
          </p>
        </div>

        <LoginModal
          open={loginModalOpen}
          onClose={() => setLoginModalOpen(false)}
          message={`Connectez-vous pour acceder a la page "${pageName}"`}
          onAuthenticated={() => {
            setLoginModalOpen(false);
            setIsAuthenticated(true);
          }}
        />
      </div>
    );
  }

  return <>{children}</>;
}
