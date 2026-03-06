'use client';

import { useState, useEffect } from 'react';

interface Referral {
  id: string;
  referredEmail: string;
  status: 'pending' | 'month1_ok' | 'qualified' | 'rewarded' | 'failed';
  month1Spend: number;
  month2Spend: number;
  rewardCredited: boolean;
  rewardAmount: number;
  createdAt: string;
}

const STATUS_LABELS: Record<string, { label: string; color: string; icon: string }> = {
  pending: { label: 'En attente', color: '#f59e0b', icon: '⏳' },
  month1_ok: { label: 'Mois 1 valide', color: '#3b82f6', icon: '✅' },
  qualified: { label: 'Qualifie', color: '#22c55e', icon: '🎉' },
  rewarded: { label: 'Recompense', color: '#22c55e', icon: '💰' },
  failed: { label: 'Non qualifie', color: '#ef4444', icon: '❌' },
};

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);

  useEffect(() => {
    setShareSupported(typeof navigator !== 'undefined' && !!navigator.share);
    loadReferrals();
  }, []);

  function getSession() {
    try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}'); } catch { return {}; }
  }

  async function loadReferrals() {
    const session = getSession();
    // Generate referral code from userId if not stored
    const code = session.referralCode || (session.userId ? session.userId.slice(0, 8).toUpperCase() : '');
    setReferralCode(code);

    if (session.token) {
      try {
        // Try to get referral code from backend profile
        const profileRes = await fetch(`/api/portal?path=/portal/profile&token=${session.token}`);
        if (profileRes.ok) {
          const profileData = await profileRes.json();
          if (profileData.referralCode) setReferralCode(profileData.referralCode);
        }

        const res = await fetch(`/api/portal?path=/portal/referrals&token=${session.token}`);
        if (res.ok) {
          const data = await res.json();
          setReferrals(data.referrals ?? []);
        }
      } catch { /* */ }
    }
    setLoading(false);
  }

  function getReferralLink() {
    return `${window.location.origin}/login?ref=${referralCode}`;
  }

  function copyLink() {
    navigator.clipboard.writeText(getReferralLink()).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }).catch(() => {});
  }

  function shareLink() {
    if (navigator.share) {
      navigator.share({
        title: 'Freenzy.io — Votre équipe IA gratuite',
        text: 'Rejoignez Freenzy.io — votre équipe IA complète, 0% de commission !',
        url: getReferralLink(),
      }).catch(() => {});
    }
  }

  const totalReferrals = referrals.length;
  const qualifiedReferrals = referrals.filter(r => r.status === 'qualified' || r.status === 'rewarded').length;
  const totalRewards = referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

  return (
    <div className="client-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parrainage</h1>
          <p className="page-subtitle">Invitez vos amis, gagnez des crédits</p>
        </div>
      </div>

      {/* Hero */}
      <div className="card section" style={{
        background: 'linear-gradient(135deg, #5b6cf70d, #8b7cf808)',
        border: '2px solid #5b6cf730', padding: '24px 20px',
      }}>
        <div className="flex items-center gap-16 flex-wrap">
          <span style={{ fontSize: 48 }}>🎁</span>
          <div className="flex-1" style={{ minWidth: 240 }}>
            <div className="font-bold" style={{ fontSize: 20, marginBottom: 6 }}>
              Gagnez 20 EUR de crédits gratuits !
            </div>
            <div className="text-md text-secondary" style={{ lineHeight: 1.6 }}>
              Partagez votre lien d&apos;invitation. Pour chaque filleul qualifié, vous recevez
              <strong style={{ color: 'var(--accent)' }}> 20 EUR de crédits </strong>
              (10 EUR/mois sur 2 mois).
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code & Link */}
      <div className="card section">
        <div className="section-title" style={{ marginBottom: 12 }}>Votre lien de parrainage</div>
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex-1" style={{
            background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
            borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)',
            fontSize: 13, color: 'var(--text-secondary)', minWidth: 200, wordBreak: 'break-all',
          }}>
            {referralCode ? getReferralLink() : 'Chargement...'}
          </div>
          <button onClick={copyLink} className="btn btn-primary btn-sm" disabled={!referralCode}>
            {copied ? '✅ Copie !' : 'Copier'}
          </button>
          {shareSupported && (
            <button onClick={shareLink} className="btn btn-secondary btn-sm" disabled={!referralCode}>
              Partager
            </button>
          )}
        </div>
        <div className="text-xs text-muted" style={{ marginTop: 8 }}>
          Code : <strong style={{ color: 'var(--accent)' }}>{referralCode || '...'}</strong>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 section" style={{ gap: 10 }}>
        <div className="stat-card">
          <span className="stat-label">Filleuls inscrits</span>
          <span className="stat-value">{totalReferrals}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Filleuls qualifies</span>
          <span className="stat-value" style={{ color: '#22c55e' }}>{qualifiedReferrals}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label">Crédits gagnés</span>
          <span className="stat-value" style={{ color: 'var(--accent)' }}>
            {totalRewards > 0 ? (totalRewards / 1_000_000).toFixed(0) : '0'}
          </span>
          <span className="text-xs text-muted">crédits</span>
        </div>
      </div>

      {/* How it works */}
      <div className="card section">
        <div className="section-title" style={{ marginBottom: 16 }}>Comment ça marche</div>
        <div className="grid-4" style={{ gap: 12 }}>
          {[
            { step: '1', icon: '🔗', title: 'Partagez', desc: 'Envoyez votre lien à vos amis et collègues' },
            { step: '2', icon: '✍️', title: 'Inscription', desc: 'Votre ami s\'inscrit via votre lien' },
            { step: '3', icon: '📊', title: 'Utilisation', desc: 'Votre filleul utilise Freenzy.io pendant 2 mois' },
            { step: '4', icon: '💰', title: 'Récompense', desc: '20 EUR de crédits pour vous (10 EUR/mois)' },
          ].map(s => (
            <div key={s.step} className="text-center" style={{ padding: '12px 8px' }}>
              <div className="flex-center" style={{
                width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                background: 'var(--accent-muted)', fontSize: 20,
              }}>
                {s.icon}
              </div>
              <div className="text-sm font-bold mb-4">{s.title}</div>
              <div className="text-xs text-muted" style={{ lineHeight: 1.5 }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div className="bg-secondary border rounded-md mt-16" style={{ padding: '10px 14px' }}>
          <div className="text-xs text-muted" style={{ lineHeight: 1.6 }}>
            <strong className="text-secondary">Condition :</strong> Votre filleul doit dépenser au moins 9 EUR
            de tokens pendant 2 mois consécutifs pour que la récompense soit validée.
          </div>
        </div>
      </div>

      {/* Referral List */}
      <div className="section">
        <div className="section-title">Mes filleuls</div>
        {loading ? (
          <div className="card"><div className="animate-pulse text-muted">Chargement...</div></div>
        ) : referrals.length === 0 ? (
          <div className="card text-center" style={{ padding: '32px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>👥</div>
            <div className="text-md text-secondary" style={{ marginBottom: 16 }}>
              Vous n&apos;avez pas encore de filleul.
            </div>
            <div className="text-sm text-muted">
              Partagez votre lien pour commencer à gagner des crédits !
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <table className="comparison-table">
              <thead>
                <tr>
                  <th>Filleul</th>
                  <th className="text-center">Statut</th>
                  <th className="text-center">Mois 1</th>
                  <th className="text-center">Mois 2</th>
                  <th className="text-center">Recompense</th>
                  <th className="text-center">Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(ref => {
                  const st = STATUS_LABELS[ref.status] ?? STATUS_LABELS.pending;
                  return (
                    <tr key={ref.id}>
                      <td className="font-semibold">{ref.referredEmail}</td>
                      <td className="text-center">
                        <span style={{ color: st.color, fontWeight: 600, fontSize: 12 }}>
                          {st.icon} {st.label}
                        </span>
                      </td>
                      <td className="text-center text-sm">
                        {ref.month1Spend > 0 ? `${(ref.month1Spend / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td className="text-center text-sm">
                        {ref.month2Spend > 0 ? `${(ref.month2Spend / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td className="text-center text-sm font-bold" style={{ color: ref.rewardCredited ? '#22c55e' : 'var(--text-muted)' }}>
                        {ref.rewardCredited ? `${(ref.rewardAmount / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td className="text-center text-xs text-muted">
                        {new Date(ref.createdAt).toLocaleDateString('fr-FR')}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
