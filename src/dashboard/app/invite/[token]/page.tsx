'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

interface InviteInfo {
  orgName: string;
  role: string;
  inviterName: string;
  agentCount: number;
  poolCredits: number;
  expired: boolean;
}

function getSession() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
}

export default function InvitePage({ params }: { params: { token: string } }) {
  const [info, setInfo] = useState<InviteInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [accepting, setAccepting] = useState(false);
  const [error, setError] = useState('');
  const [accepted, setAccepted] = useState(false);

  useEffect(() => {
    fetch(`/api/invite/${params.token}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) setError(data.error);
        else setInfo(data);
      })
      .catch(() => setError('Invitation introuvable'))
      .finally(() => setLoading(false));
  }, [params.token]);

  async function handleAccept() {
    const session = getSession();
    if (!session.token) {
      // Not logged in — redirect to register with invite token
      window.location.href = `/register?invite=${params.token}`;
      return;
    }

    setAccepting(true);
    try {
      const res = await fetch(`/api/invite/${params.token}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.token}` },
      });
      const data = await res.json();
      if (data.success) {
        setAccepted(true);
        setTimeout(() => { window.location.href = '/client/dashboard?welcome=true'; }, 1500);
      } else {
        setError(data.error || 'Erreur');
      }
    } catch {
      setError('Erreur réseau');
    }
    setAccepting(false);
  }

  if (loading) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAFAFA' }}>
        <div style={{ fontSize: 14, color: '#9B9B9B' }}>Chargement...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 400, textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>😕</div>
          <h1 style={{ fontSize: 20, color: '#1A1A1A', marginBottom: 8 }}>Invitation invalide</h1>
          <p style={{ color: '#6B6B6B', fontSize: 14, marginBottom: 24 }}>{error}</p>
          <Link href="/" style={{ color: '#0EA5E9', fontSize: 14, textDecoration: 'none' }}>Retour à l&apos;accueil</Link>
        </div>
      </div>
    );
  }

  if (accepted) {
    return (
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAFAFA' }}>
        <div style={{ maxWidth: 400, textAlign: 'center', padding: 32 }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
          <h1 style={{ fontSize: 20, color: '#1A1A1A', marginBottom: 8 }}>Bienvenue dans l&apos;équipe !</h1>
          <p style={{ color: '#6B6B6B', fontSize: 14 }}>Redirection vers le dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', background: '#FAFAFA', padding: 16 }}>
      <div style={{ maxWidth: 440, width: '100%', background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden' }}>
        <div style={{ height: 4, background: 'linear-gradient(90deg, #0EA5E9, #7C3AED)' }} />
        <div style={{ padding: '32px 28px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 24, letterSpacing: '-0.02em' }}>freenzy.io</div>

          <div style={{ fontSize: 40, marginBottom: 16, textAlign: 'center' }}>👥</div>
          <h1 style={{ fontSize: 22, fontWeight: 600, color: '#1A1A1A', textAlign: 'center', marginBottom: 8 }}>
            Rejoignez {info?.orgName}
          </h1>
          <p style={{ color: '#6B6B6B', fontSize: 14, textAlign: 'center', marginBottom: 24 }}>
            <strong>{info?.inviterName}</strong> vous invite à rejoindre son équipe sur Freenzy.io
          </p>

          <div style={{ background: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 10, padding: '16px 20px', marginBottom: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#9B9B9B' }}>Votre rôle</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{info?.role}</span>
            </div>
            <div style={{ height: 1, background: '#E5E5E5', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 12 }}>
              <span style={{ fontSize: 13, color: '#9B9B9B' }}>Assistants disponibles</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>{info?.agentCount}</span>
            </div>
            <div style={{ height: 1, background: '#E5E5E5', margin: '8px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ fontSize: 13, color: '#9B9B9B' }}>Crédits partagés</span>
              <span style={{ fontSize: 14, fontWeight: 600, color: '#16A34A' }}>{info?.poolCredits}</span>
            </div>
          </div>

          <button
            onClick={handleAccept}
            disabled={accepting || info?.expired}
            style={{
              width: '100%', padding: '14px 0', background: '#1A1A1A', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 15, fontWeight: 600,
              cursor: accepting ? 'wait' : 'pointer', opacity: accepting ? 0.7 : 1,
            }}
          >
            {accepting ? 'Inscription...' : '👥 Rejoindre l\'équipe'}
          </button>

          <p style={{ textAlign: 'center', fontSize: 12, color: '#9B9B9B', marginTop: 16 }}>
            Votre espace personnel reste privé. Seuls vous pouvez voir vos conversations et documents.
          </p>
        </div>
      </div>
    </div>
  );
}
