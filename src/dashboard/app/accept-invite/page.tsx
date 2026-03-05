'use client';

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import Link from 'next/link';

function AcceptInviteContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get('token');
  const [status, setStatus] = useState<'loading' | 'success' | 'error' | 'no-token'>('loading');
  const [error, setError] = useState('');
  const [workspaceId, setWorkspaceId] = useState<string | null>(null);

  useEffect(() => {
    if (!token) {
      setStatus('no-token');
      return;
    }
    acceptInvitation(token);
  }, [token]);

  async function acceptInvitation(inviteToken: string) {
    try {
      const authToken = document.cookie.split(';').find(c => c.trim().startsWith('fz-token='))?.split('=')[1];
      if (!authToken) {
        // Not logged in — redirect to login with return URL
        router.push(`/login?redirect=/accept-invite?token=${inviteToken}`);
        return;
      }

      const res = await fetch('/api/portal/workspaces/accept-invite', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({ token: inviteToken }),
      });

      if (res.ok) {
        const data = await res.json();
        setWorkspaceId(data.workspaceId);
        setStatus('success');
      } else {
        const data = await res.json();
        setError(data.error ?? 'Erreur inconnue');
        setStatus('error');
      }
    } catch {
      setError('Erreur de connexion');
      setStatus('error');
    }
  }

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--bg-primary, #0a0a0a)',
    }}>
      <div className="card" style={{ maxWidth: 420, width: '100%', padding: '40px 32px', textAlign: 'center' }}>
        {status === 'loading' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>⏳</div>
            <h2 className="text-lg font-bold mb-4">Acceptation en cours...</h2>
            <p className="text-sm text-secondary">Veuillez patienter.</p>
          </>
        )}

        {status === 'success' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🎉</div>
            <h2 className="text-lg font-bold mb-4">Invitation acceptée !</h2>
            <p className="text-sm text-secondary mb-16">
              Vous avez rejoint l&apos;espace de travail avec succès.
            </p>
            <Link href="/client/team" className="btn btn-primary">
              Voir mon équipe
            </Link>
          </>
        )}

        {status === 'error' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>❌</div>
            <h2 className="text-lg font-bold mb-4">Erreur</h2>
            <p className="text-sm text-secondary mb-16">{error}</p>
            <Link href="/client/team" className="btn btn-secondary">
              Retour
            </Link>
          </>
        )}

        {status === 'no-token' && (
          <>
            <div style={{ fontSize: 48, marginBottom: 16 }}>🔗</div>
            <h2 className="text-lg font-bold mb-4">Lien invalide</h2>
            <p className="text-sm text-secondary mb-16">
              Ce lien d&apos;invitation est invalide ou a expiré.
            </p>
            <Link href="/" className="btn btn-secondary">
              Accueil
            </Link>
          </>
        )}
      </div>
    </div>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense fallback={<div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-primary, #0a0a0a)' }}><p>Chargement...</p></div>}>
      <AcceptInviteContent />
    </Suspense>
  );
}
