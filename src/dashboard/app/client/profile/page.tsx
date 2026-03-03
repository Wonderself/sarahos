'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { DEFAULT_AGENTS, getActiveAgentIds } from '../../../lib/agent-config';

interface UserSession {
  token: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
  tier: string;
  createdAt?: string;
}

export default function ProfilePage() {
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [activeAgentCount, setActiveAgentCount] = useState(1);

  const loadWallet = useCallback(async (token: string) => {
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/portal/wallet', token }),
      });
      const data = await res.json();
      setWalletBalance(data.balance ?? data.wallet?.balance ?? 0);
    } catch {
      /* wallet fetch failed */
    }
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('sarah_session');
    if (stored) {
      try {
        const s: UserSession = JSON.parse(stored);
        setSession(s);
        loadWallet(s.token);
      } catch {
        /* corrupted session */
      }
    }
    setActiveAgentCount(getActiveAgentIds().length);
    setLoading(false);
  }, [loadWallet]);

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="animate-pulse" style={{ height: 10, borderRadius: 6, background: 'var(--bg-tertiary)', width: 200 }} />
        <div className="animate-pulse" style={{ height: 10, borderRadius: 6, background: 'var(--bg-tertiary)', width: 140 }} />
      </div>
    );
  }

  if (!session) {
    return (
      <div className="flex-center" style={{ height: '60vh', flexDirection: 'column', gap: 16 }}>
        <div className="text-lg font-semibold text-tertiary">Session introuvable</div>
        <Link href="/login" className="btn btn-primary rounded-md" style={{ textDecoration: 'none' }}>
          Se connecter
        </Link>
      </div>
    );
  }

  // Initials for avatar
  const initials = session.displayName
    .split(' ')
    .map((w) => w[0])
    .filter(Boolean)
    .slice(0, 2)
    .join('')
    .toUpperCase();

  // Plan/tier badge
  const tierLabels: Record<string, { label: string; className: string }> = {
    free: { label: 'Gratuit', className: 'badge-neutral' },
    starter: { label: 'Starter', className: 'badge-success' },
    pro: { label: 'Pro', className: 'badge-accent' },
    business: { label: 'Business', className: 'badge-purple' },
    enterprise: { label: 'Enterprise', className: 'badge-warning' },
  };
  const tierInfo = tierLabels[(session.tier || 'free').toLowerCase()] || tierLabels.free;

  // Format member since date
  const memberSince = session.createdAt
    ? new Date(session.createdAt).toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })
    : null;

  // Format wallet balance
  const formattedBalance =
    walletBalance !== null ? (walletBalance / 1_000_000).toFixed(1) : null;

  return (
    <div className="animate-in" style={{ maxWidth: 720 }}>
      {/* Page Header */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mon Profil</h1>
          <p className="page-subtitle">Vos informations personnelles et statistiques</p>
        </div>
      </div>

      {/* Profile Card */}
      <div
        className="card"
        style={{
          padding: 0,
          overflow: 'hidden',
          marginBottom: 20,
        }}
      >
        {/* Gradient banner */}
        <div
          style={{
            height: 80,
            background: 'linear-gradient(135deg, #6366f1, #a855f7, #ec4899)',
            position: 'relative',
          }}
        />

        {/* Avatar + info */}
        <div style={{ padding: '0 24px 24px' }}>
          {/* Avatar overlapping banner */}
          <div
            className="flex-center"
            style={{
              width: 72,
              height: 72,
              borderRadius: '50%',
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              color: 'white',
              fontSize: 24,
              fontWeight: 800,
              marginTop: -36,
              border: '4px solid var(--bg-secondary)',
              boxShadow: 'var(--shadow-md)',
              userSelect: 'none',
              flexShrink: 0,
            }}
          >
            {initials}
          </div>

          <div style={{ marginTop: 12 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, flexWrap: 'wrap' }}>
              <h2
                style={{
                  fontSize: 20,
                  fontWeight: 700,
                  color: 'var(--text-primary)',
                  letterSpacing: '-0.02em',
                }}
              >
                {session.displayName}
              </h2>
              <span className={`badge ${tierInfo.className}`}>{tierInfo.label}</span>
            </div>

            <p className="text-sm text-tertiary" style={{ marginTop: 4 }}>
              {session.email}
            </p>

            {session.role && (
              <p className="text-sm text-secondary" style={{ marginTop: 2 }}>
                {session.role}
              </p>
            )}

            {memberSince && (
              <p className="text-xs text-muted" style={{ marginTop: 8 }}>
                Membre depuis le {memberSince}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="section">
        <div className="section-title">
          Statistiques
        </div>

        <div className="grid-3" style={{ marginBottom: 20 }}>
          {/* Active agents stat */}
          <div className="stat-card">
            <div className="stat-label">Agents actifs</div>
            <div className="stat-value stat-value-sm">
              {activeAgentCount}
              <span
                className="text-xs text-muted"
                style={{ marginLeft: 4, fontWeight: 500 }}
              >
                / {DEFAULT_AGENTS.length}
              </span>
            </div>
          </div>

          {/* Wallet balance stat */}
          <div className="stat-card">
            <div className="stat-label">Solde cr&eacute;dits</div>
            <div
              className={`stat-value stat-value-sm ${
                walletBalance !== null && walletBalance > 50_000_000
                  ? 'text-success'
                  : walletBalance !== null && walletBalance > 10_000_000
                  ? 'text-warning'
                  : 'text-danger'
              }`}
            >
              {formattedBalance !== null ? formattedBalance : '...'}
              <span
                className="text-xs text-muted"
                style={{ marginLeft: 4, fontWeight: 500 }}
              >
                cr&eacute;dits
              </span>
            </div>
          </div>

          {/* Plan stat */}
          <div className="stat-card">
            <div className="stat-label">Forfait</div>
            <div className="stat-value stat-value-sm" style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span className={`badge ${tierInfo.className}`} style={{ fontSize: 13, padding: '4px 14px' }}>
                {tierInfo.label}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Links */}
      <div className="section">
        <div className="section-title">
          Acc&egrave;s rapides
        </div>

        <div className="grid-3">
          <Link
            href="/client/account"
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              className="flex-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--accent-muted)',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <span role="img" aria-label="Compte">&#128100;</span>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Compte &amp; Cr&eacute;dits
              </div>
              <div className="text-xs text-muted">
                G&eacute;rer votre abonnement
              </div>
            </div>
          </Link>

          <Link
            href="/client/team"
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              className="flex-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--purple-muted)',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <span role="img" aria-label="Equipe">&#128101;</span>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Mon &eacute;quipe
              </div>
              <div className="text-xs text-muted">
                Recruter et g&eacute;rer vos agents
              </div>
            </div>
          </Link>

          <Link
            href="/client/referrals"
            className="card"
            style={{
              textDecoration: 'none',
              display: 'flex',
              alignItems: 'center',
              gap: 12,
              cursor: 'pointer',
              transition: 'all 0.15s ease',
            }}
          >
            <div
              className="flex-center"
              style={{
                width: 40,
                height: 40,
                borderRadius: 'var(--radius-md)',
                background: 'var(--success-muted)',
                fontSize: 18,
                flexShrink: 0,
              }}
            >
              <span role="img" aria-label="Parrainage">&#127873;</span>
            </div>
            <div>
              <div className="text-sm font-semibold" style={{ color: 'var(--text-primary)' }}>
                Parrainage
              </div>
              <div className="text-xs text-muted">
                Inviter et gagner des cr&eacute;dits
              </div>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}
