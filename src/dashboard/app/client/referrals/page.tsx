'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateQR } from '../../../lib/qr-generator';
import { claimReward } from '../../../lib/rewards';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';

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

const STATUS_LABELS: Record<string, { label: string; color: string; emoji: string }> = {
  pending: { label: 'En attente', color: '#f59e0b', emoji: '⏳' },
  month1_ok: { label: 'Mois 1 valide', color: '#3b82f6', emoji: '✅' },
  qualified: { label: 'Qualifie', color: '#22c55e', emoji: '🎉' },
  rewarded: { label: 'Recompense', color: '#22c55e', emoji: '💰' },
  failed: { label: 'Non qualifie', color: '#ef4444', emoji: '❌' },
};

export default function ReferralsPage() {
  const isMobile = useIsMobile();
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
    generateQR(url, qrCanvasRef.current, { size: 200, foreground: 'var(--fz-accent, #0EA5E9)', background: '#0f0720' });
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

  const meta = PAGE_META.referrals;

  return (
    <div className="client-page-scrollable">
      {/* Page Header */}
      <div style={{
        display: 'flex', alignItems: 'center', gap: 14,
        marginBottom: 24, padding: '0 0 16px 0',
        borderBottom: '1px solid var(--fz-border, #E2E8F0)',
      }}>
        <span style={{ fontSize: 32 }}>{meta.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{
            fontSize: 22, fontWeight: 800, margin: 0,
            color: 'var(--fz-text, #1E293B)',
            display: 'flex', alignItems: 'center', gap: 6,
          }}>
            {meta.title}
            <HelpBubble text={meta.helpText} />
          </h1>
          <p style={{
            margin: '4px 0 0', fontSize: 14,
            color: 'var(--fz-text-secondary, #64748B)',
          }}>
            {meta.subtitle}
          </p>
        </div>
      </div>
      <PageExplanation pageId="referrals" text={PAGE_META.referrals?.helpText} />

      {/* Hero */}
      <div className="card section" style={{
        background: 'linear-gradient(135deg, rgba(14,165,233,0.05), rgba(6,182,212,0.03))',
        border: '2px solid rgba(14,165,233,0.19)', padding: '24px 20px',
        backdropFilter: 'blur(12px)', boxShadow: '0 0 40px rgba(14,165,233,0.15)',
      }}>
        <div className="flex items-center gap-16 flex-wrap">
          <span style={{ fontSize: 48 }}>{'🎁'}</span>
          <div className="flex-1" style={{ minWidth: 0 }}>
            <div className="font-bold" style={{ fontSize: 20, marginBottom: 6, color: 'var(--fz-text, #1E293B)' }}>
              Gagnez 20 EUR de crédits <span className="fz-logo-word">gratuits</span> !
            </div>
            <div className="text-md" style={{ lineHeight: 1.6, color: 'var(--fz-text-secondary, #64748B)' }}>
              Partagez votre lien d&apos;invitation. Pour chaque filleul qualifié, vous recevez
              <strong style={{ color: 'var(--accent)' }}> 20 EUR de crédits </strong>
              (10 EUR/mois sur 2 mois).
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code & Link */}
      <div className="card section">
        <div className="section-title" style={{ marginBottom: 12, color: 'var(--fz-text, #1E293B)' }}>Votre lien de parrainage</div>
        <div className="flex items-center gap-8 flex-wrap">
          <div className="flex-1" style={{
            background: 'var(--fz-bg-secondary, #F8FAFC)', border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
            borderRadius: 10, padding: '10px 14px', fontFamily: 'var(--font-mono, monospace)',
            fontSize: 12, color: 'var(--fz-text-muted)', minWidth: isMobile ? 0 : 200, wordBreak: 'break-all',
            width: isMobile ? '100%' : undefined,
          }}>
            {referralCode ? getReferralLink() : 'Chargement...'}
          </div>
          <button onClick={copyLink} className="btn btn-primary btn-sm" disabled={!referralCode}>
            {copied ? <>{'✅'} Copié !</> : 'Copier'}
          </button>
          {shareSupported && (
            <button onClick={shareLink} className="btn btn-secondary btn-sm" disabled={!referralCode}>
              Partager
            </button>
          )}
        </div>
        <div className="text-xs" style={{ marginTop: 8, color: 'var(--fz-text-muted, #94A3B8)' }}>
          Code : <strong style={{ color: 'var(--accent)' }}>{referralCode || '...'}</strong>
        </div>
      </div>

      {/* QR Code & Social Share */}
      <div className="card section">
        <div className="section-title" style={{ marginBottom: 16, color: 'var(--fz-text, #1E293B)' }}>QR Code & Partage</div>
        <div style={{ display: 'flex', gap: isMobile ? 12 : 24, alignItems: 'center', flexWrap: 'wrap' }}>
          <div style={{ textAlign: 'center' }}>
            <canvas
              ref={qrCanvasRef}
              style={{ borderRadius: 12, border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))' }}
              width={200}
              height={200}
            />
            <button
              onClick={downloadQR}
              className="btn btn-primary btn-sm"
              style={{ marginTop: 12, width: '100%' }}
              disabled={!referralCode}
            >
              {'⬇️'} Télécharger PNG
            </button>
          </div>
          <div style={{ flex: 1, minWidth: isMobile ? 0 : 200 }}>
            <div className="text-sm font-bold mb-8" style={{ color: 'var(--fz-text, #1E293B)' }}>Partagez sur les réseaux</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { id: 'twitter', emoji: '💬', label: 'Twitter / X', color: '#1da1f2' },
                { id: 'linkedin', emoji: '💼', label: 'LinkedIn', color: '#0077b5' },
                { id: 'whatsapp', emoji: '📱', label: 'WhatsApp', color: '#25d366' },
                { id: 'email', emoji: '✉️', label: 'Email', color: '#8b5cf6' },
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
                  <span style={{ fontSize: 16 }}>{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
            <div className="text-xs" style={{ marginTop: 12, lineHeight: 1.6, color: 'var(--fz-text-muted, #94A3B8)' }}>
              Scannez le QR code ou utilisez les boutons pour partager votre lien de parrainage.
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid-3 section" style={{ gap: 10 }}>
        <div className="stat-card">
          <span className="stat-label" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Filleuls inscrits</span>
          <span className="stat-value" style={{ color: 'var(--fz-text, #1E293B)' }}>{totalReferrals}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Filleuls qualifies</span>
          <span className="stat-value" style={{ color: '#22c55e' }}>{qualifiedReferrals}</span>
        </div>
        <div className="stat-card">
          <span className="stat-label" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Crédits gagnés</span>
          <span className="stat-value" style={{ color: 'var(--accent)' }}>
            {totalRewards > 0 ? (totalRewards / 1_000_000).toFixed(0) : '0'}
          </span>
          <span className="text-xs" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>crédits</span>
        </div>
      </div>

      {/* How it works */}
      <div className="card section">
        <div className="section-title" style={{ marginBottom: 16, color: 'var(--fz-text, #1E293B)' }}>Comment ça marche</div>
        <div className="grid-4" style={{ gap: 12, gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : undefined }}>
          {[
            { step: '1', emoji: '🔗', title: 'Partagez', desc: 'Envoyez votre lien à vos amis et collègues' },
            { step: '2', emoji: '✍️', title: 'Inscription', desc: 'Votre ami s\'inscrit via votre lien' },
            { step: '3', emoji: '📊', title: 'Utilisation', desc: 'Votre filleul utilise Freenzy.io pendant 2 mois' },
            { step: '4', emoji: '💰', title: 'Récompense', desc: '20 EUR de crédits pour vous (10 EUR/mois)' },
          ].map(s => (
            <div key={s.step} className="text-center" style={{ padding: '12px 8px' }}>
              <div className="flex-center" style={{
                width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                background: 'var(--accent-muted)', fontSize: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
              </div>
              <div className="text-sm font-bold mb-4" style={{ color: 'var(--fz-text, #1E293B)' }}>{s.title}</div>
              <div className="text-xs" style={{ lineHeight: 1.5, color: 'var(--fz-text-muted, #94A3B8)' }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: 'var(--fz-bg-secondary, #F8FAFC)',
          border: 'none', boxShadow: 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))',
          borderRadius: 8, marginTop: 16, padding: '10px 14px',
        }}>
          <div className="text-xs" style={{ lineHeight: 1.6, color: 'var(--fz-text-muted, #94A3B8)' }}>
            <strong style={{ color: 'var(--fz-text-secondary, #64748B)' }}>Condition :</strong> Votre filleul doit dépenser au moins 9 EUR
            de tokens pendant 2 mois consécutifs pour que la récompense soit validée.
          </div>
        </div>
      </div>

      {/* Referral List */}
      <div className="section">
        <div className="section-title" style={{ color: 'var(--fz-text, #1E293B)' }}>Mes filleuls</div>
        {loading ? (
          <div className="card"><div className="animate-pulse" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>Chargement...</div></div>
        ) : referrals.length === 0 ? (
          <div className="card text-center" style={{ padding: '32px 20px' }}>
            <div style={{ fontSize: 48, marginBottom: 12 }}>{'👥'}</div>
            <div className="text-md" style={{ marginBottom: 16, color: 'var(--fz-text-secondary, #64748B)' }}>
              Vous n&apos;avez pas encore de filleul.
            </div>
            <div className="text-sm" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>
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
                      <td className="font-semibold" style={{ color: 'var(--fz-text, #1E293B)' }}>{ref.referredEmail}</td>
                      <td className="text-center">
                        <span style={{ color: st.color, fontWeight: 600, fontSize: 12 }}>
                          <span style={{ fontSize: 16, marginRight: 4, verticalAlign: 'middle' }}>{st.emoji}</span> {st.label}
                        </span>
                      </td>
                      <td className="text-center text-sm" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
                        {ref.month1Spend > 0 ? `${(ref.month1Spend / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td className="text-center text-sm" style={{ color: 'var(--fz-text-secondary, #64748B)' }}>
                        {ref.month2Spend > 0 ? `${(ref.month2Spend / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td className="text-center text-sm font-bold" style={{ color: ref.rewardCredited ? '#22c55e' : 'var(--fz-text-muted, #94A3B8)' }}>
                        {ref.rewardCredited ? `${(ref.rewardAmount / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td className="text-center text-xs" style={{ color: 'var(--fz-text-muted, #94A3B8)' }}>
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
