'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateQR } from '../../../lib/qr-generator';
import { claimReward } from '../../../lib/rewards';

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
  pending: { label: 'En attente', color: '#f59e0b', icon: 'hourglass_empty' },
  month1_ok: { label: 'Mois 1 valide', color: '#3b82f6', icon: 'check_circle' },
  qualified: { label: 'Qualifie', color: '#22c55e', icon: 'celebration' },
  rewarded: { label: 'Recompense', color: '#22c55e', icon: 'savings' },
  failed: { label: 'Non qualifie', color: '#ef4444', icon: 'cancel' },
};

export default function ReferralsPage() {
  const [referralCode, setReferralCode] = useState('');
  const [referrals, setReferrals] = useState<Referral[]>([]);
  const [loading, setLoading] = useState(true);
  const [copied, setCopied] = useState(false);
  const [shareSupported, setShareSupported] = useState(false);
  const [qrDownloaded, setQrDownloaded] = useState(false);
  const qrCanvasRef = useRef<HTMLCanvasElement>(null);

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

  // Generate QR code when referralCode is available
  useEffect(() => {
    if (!referralCode || !qrCanvasRef.current) return;
    const url = `${window.location.origin}/login?ref=${referralCode}`;
    generateQR(url, qrCanvasRef.current, { size: 200, foreground: '#7c3aed', background: '#0f0720' });
  }, [referralCode]);

  const downloadQR = useCallback(() => {
    if (!qrCanvasRef.current) return;
    const link = document.createElement('a');
    link.download = `freenzy-referral-${referralCode}.png`;
    link.href = qrCanvasRef.current.toDataURL('image/png');
    link.click();
    if (!qrDownloaded) {
      setQrDownloaded(true);
      claimReward('download_qr');
    }
  }, [referralCode, qrDownloaded]);

  const shareToSocial = useCallback((platform: string) => {
    const url = encodeURIComponent(getReferralLink());
    const text = encodeURIComponent('Rejoignez Freenzy.io — votre équipe IA complète, 0% de commission !');
    const urls: Record<string, string> = {
      twitter: `https://twitter.com/intent/tweet?text=${text}&url=${url}`,
      linkedin: `https://www.linkedin.com/sharing/share-offsite/?url=${url}`,
      whatsapp: `https://wa.me/?text=${text}%20${url}`,
      email: `mailto:?subject=${encodeURIComponent('Rejoignez Freenzy.io')}&body=${text}%20${url}`,
    };
    if (urls[platform]) window.open(urls[platform], '_blank');
  }, [referralCode]);

  const totalReferrals = referrals.length;
  const qualifiedReferrals = referrals.filter(r => r.status === 'qualified' || r.status === 'rewarded').length;
  const totalRewards = referrals.reduce((sum, r) => sum + (r.rewardAmount || 0), 0);

  return (
    <div className="client-page-scrollable">
      <div className="page-header">
        <div>
          <h1 className="page-title">Parrainage</h1>
          <p className="page-subtitle">Invitez vos amis, gagnez des <span className="fz-logo-word">crédits</span></p>
        </div>
      </div>

      {/* Hero */}
      <div className="card section" style={{
        background: 'linear-gradient(135deg, rgba(124,58,237,0.05), rgba(6,182,212,0.03))',
        border: '2px solid rgba(124,58,237,0.19)', padding: '24px 20px',
        backdropFilter: 'blur(12px)', boxShadow: '0 0 40px rgba(124,58,237,0.15)',
      }}>
        <div className="flex items-center gap-16 flex-wrap">
          <span style={{ fontSize: 48 }}><span className="material-symbols-rounded" style={{ fontSize: 48 }}>redeem</span></span>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div className="font-bold" style={{ fontSize: 20, marginBottom: 6 }}>
              Gagnez 20 EUR de crédits <span className="fz-logo-word">gratuits</span> !
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
            {copied ? <><span className="material-symbols-rounded" style={{ fontSize: 14 }}>check_circle</span> Copié !</> : 'Copier'}
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

      {/* QR Code & Social Share */}
      <div className="card section">
        <div className="section-title" style={{ marginBottom: 16 }}>QR Code & Partage</div>
        <div style={{ display: 'flex', gap: 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <canvas
              ref={qrCanvasRef}
              style={{ borderRadius: 12, border: '1px solid var(--border-primary)' }}
              width={200}
              height={200}
            />
            <button
              onClick={downloadQR}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 12, width: '100%' }}
              disabled={!referralCode}
            >
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>download</span> Télécharger PNG
            </button>
          </div>
          <div style={{ flex: 1, minWidth: 200 }}>
            <div className="text-sm font-bold mb-8">Partagez sur les réseaux</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { id: 'twitter', icon: 'tag', label: 'Twitter / X', color: '#1da1f2' },
                { id: 'linkedin', icon: 'work', label: 'LinkedIn', color: '#0077b5' },
                { id: 'whatsapp', icon: 'chat', label: 'WhatsApp', color: '#25d366' },
                { id: 'email', icon: 'mail', label: 'Email', color: '#8b5cf6' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => shareToSocial(p.id)}
                  className="btn btn-sm"
                  style={{
                    background: `${p.color}18`, border: `1px solid ${p.color}33`,
                    color: p.color, fontSize: 12, fontWeight: 600,
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                  disabled={!referralCode}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-xs text-muted" style={{ marginTop: 12, lineHeight: 1.6 }}>
              Scannez le QR code ou utilisez les boutons pour partager votre lien de parrainage.
            </div>
          </div>
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
            { step: '1', icon: 'link', title: 'Partagez', desc: 'Envoyez votre lien à vos amis et collègues' },
            { step: '2', icon: 'draw', title: 'Inscription', desc: 'Votre ami s\'inscrit via votre lien' },
            { step: '3', icon: 'bar_chart', title: 'Utilisation', desc: 'Votre filleul utilise Freenzy.io pendant 2 mois' },
            { step: '4', icon: 'savings', title: 'Récompense', desc: '20 EUR de crédits pour vous (10 EUR/mois)' },
          ].map(s => (
            <div key={s.step} className="text-center" style={{ padding: '12px 8px' }}>
              <div className="flex-center" style={{
                width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                background: 'var(--accent-muted)', fontSize: 20,
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{s.icon}</span>
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
            <div style={{ fontSize: 48, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 48 }}>group</span></div>
            <div className="text-md text-secondary" style={{ marginBottom: 16 }}>
              Vous n&apos;avez pas encore de filleul.
            </div>
            <div className="text-sm text-muted">
              Partagez votre lien pour commencer à gagner des crédits !
            </div>
          </div>
        ) : (
          <div className="card" style={{ padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table className="comparison-table" style={{ minWidth: 600 }}>
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
                          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>{st.icon}</span> {st.label}
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
          </div>
        )}
      </div>
    </div>
  );
}
