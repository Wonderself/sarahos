'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { generateQR } from '../../../lib/qr-generator';
import { claimReward } from '../../../lib/rewards';
import { useIsMobile } from '../../../lib/use-media-query';
import HelpBubble from '../../../components/HelpBubble';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid } from '../../../lib/page-styles';
import PageBlogSection from '@/components/blog/PageBlogSection';

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
  pending: { label: 'En attente', color: CU.text, emoji: '\u23F3' },
  month1_ok: { label: 'Mois 1 valide', color: CU.text, emoji: '\u2705' },
  qualified: { label: 'Qualifie', color: CU.text, emoji: '\uD83C\uDF89' },
  rewarded: { label: 'Recompense', color: CU.text, emoji: '\uD83D\uDCB0' },
  failed: { label: 'Non qualifie', color: CU.danger, emoji: '\u274C' },
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
    generateQR(url, qrCanvasRef.current, { size: 200, foreground: CU.accent, background: '#FFFFFF' });
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
    <div style={pageContainer(isMobile)}>
      {/* Page Header */}
      <div style={{ ...headerRow(), marginBottom: 4 }}>
        <span style={emojiIcon(24)}>{meta.emoji}</span>
        <div style={{ flex: 1 }}>
          <h1 style={{ ...CU.pageTitle, display: 'flex', alignItems: 'center', gap: 6 }}>
            {meta.title}
            <HelpBubble text={meta.helpText} />
          </h1>
          <p style={CU.pageSubtitle}>{meta.subtitle}</p>
        </div>
      </div>
      <PageExplanation pageId="referrals" text={PAGE_META.referrals?.helpText} />
      <hr style={CU.divider} />

      {/* Hero */}
      <div style={{ ...CU.card, background: CU.bgSecondary, padding: '24px 20px', marginBottom: 16 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
          <span style={emojiIcon(48)}>{'🎁'}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 20, fontWeight: 700, marginBottom: 6, color: CU.text }}>
              Gagnez 20 crédits <span className="fz-logo-word">gratuits</span> !
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.6, color: CU.textSecondary }}>
              Partagez votre lien d&apos;invitation. Pour chaque filleul qualifié, vous recevez
              <strong style={{ color: CU.text }}> 20 crédits </strong>
              (10 crédits/mois sur 2 mois). Votre filleul reçoit aussi 20 crédits !
            </div>
          </div>
        </div>
      </div>

      {/* Referral Code & Link */}
      <div style={{ ...CU.card, marginBottom: 16 }}>
        <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Votre lien de parrainage</h3>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <div style={{
            flex: 1, background: CU.bgSecondary, border: `1px solid ${CU.border}`,
            borderRadius: 8, padding: '10px 14px', fontFamily: 'monospace',
            fontSize: 12, color: CU.textMuted, minWidth: isMobile ? 0 : 200, wordBreak: 'break-all',
            width: isMobile ? '100%' : undefined,
          }}>
            {referralCode ? getReferralLink() : 'Chargement...'}
          </div>
          <button onClick={copyLink} style={CU.btnPrimary} disabled={!referralCode}>
            {copied ? <><span>{'✅'}</span> Copié !</> : 'Copier'}
          </button>
          {shareSupported && (
            <button onClick={shareLink} style={CU.btnGhost} disabled={!referralCode}>
              Partager
            </button>
          )}
        </div>
        <div style={{ marginTop: 8, fontSize: 12, color: CU.textMuted }}>
          Code : <strong style={{ color: CU.text }}>{referralCode || '...'}</strong>
        </div>
      </div>

      {/* QR Code & Social Share */}
      <div style={{ ...CU.card, marginBottom: 16 }}>
        <h3 style={{ ...CU.sectionTitle, marginBottom: 16 }}>QR Code & Partage</h3>
        <div style={{ display: 'flex', gap: isMobile ? 12 : 24, alignItems: isMobile ? 'stretch' : 'center', flexWrap: 'wrap', flexDirection: isMobile ? 'column' as const : 'row' as const }}>
          <div style={{ textAlign: 'center' }}>
            <canvas
              ref={qrCanvasRef}
              style={{ borderRadius: 8, border: `1px solid ${CU.border}` }}
              width={200}
              height={200}
            />
            <button
              onClick={downloadQR}
              style={{ ...CU.btnPrimary, marginTop: 12, width: '100%' }}
              disabled={!referralCode}
            >
              {'⬇️'} Télécharger PNG
            </button>
          </div>
          <div style={{ flex: 1, minWidth: isMobile ? 0 : 200 }}>
            <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8, color: CU.text }}>Partagez sur les réseaux</div>
            <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
              {[
                { id: 'twitter', emoji: '💬', label: 'Twitter / X' },
                { id: 'linkedin', emoji: '💼', label: 'LinkedIn' },
                { id: 'whatsapp', emoji: '📱', label: 'WhatsApp' },
                { id: 'email', emoji: '✉️', label: 'Email' },
              ].map(p => (
                <button
                  key={p.id}
                  onClick={() => shareToSocial(p.id)}
                  style={{
                    ...CU.btnSmall,
                    display: 'flex', alignItems: 'center', gap: 6,
                    fontWeight: 600,
                  }}
                  disabled={!referralCode}
                >
                  <span style={{ fontSize: 16 }}>{p.emoji}</span>
                  {p.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 12, fontSize: 12, lineHeight: 1.6, color: CU.textMuted }}>
              Scannez le QR code ou utilisez les boutons pour partager votre lien de parrainage.
            </div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div style={{ ...cardGrid(isMobile, 3), marginBottom: 16 }}>
        <div style={{ ...CU.card, background: CU.bgSecondary, textAlign: 'center', padding: '18px 16px' }}>
          <div style={CU.statLabel}>Filleuls inscrits</div>
          <div style={CU.statValue}>{totalReferrals}</div>
        </div>
        <div style={{ ...CU.card, background: CU.bgSecondary, textAlign: 'center', padding: '18px 16px' }}>
          <div style={CU.statLabel}>Filleuls qualifies</div>
          <div style={CU.statValue}>{qualifiedReferrals}</div>
        </div>
        <div style={{ ...CU.card, background: CU.bgSecondary, textAlign: 'center', padding: '18px 16px' }}>
          <div style={CU.statLabel}>Crédits gagnés</div>
          <div style={CU.statValue}>
            {totalRewards > 0 ? (totalRewards / 1_000_000).toFixed(0) : '0'}
          </div>
          <span style={{ fontSize: 12, color: CU.textMuted }}>crédits</span>
        </div>
      </div>

      {/* How it works */}
      <div style={{ ...CU.card, marginBottom: 16 }}>
        <h3 style={{ ...CU.sectionTitle, marginBottom: 16 }}>Comment ça marche</h3>
        <div style={{ ...cardGrid(isMobile, isMobile ? 2 : 4) }}>
          {[
            { step: '1', emoji: '🔗', title: 'Partagez', desc: 'Envoyez votre lien à vos amis et collègues' },
            { step: '2', emoji: '✍️', title: 'Inscription', desc: 'Votre ami s\'inscrit via votre lien' },
            { step: '3', emoji: '📊', title: 'Utilisation', desc: 'Votre filleul utilise Freenzy.io pendant 2 mois' },
            { step: '4', emoji: '💰', title: 'Récompense', desc: '20 crédits pour vous et 20 pour votre filleul' },
          ].map(s => (
            <div key={s.step} style={{ textAlign: 'center', padding: '12px 8px' }}>
              <div style={{
                width: 40, height: 40, borderRadius: '50%', margin: '0 auto 8px',
                background: CU.accentLight, fontSize: 20,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                <span style={{ fontSize: 20 }}>{s.emoji}</span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 4, color: CU.text }}>{s.title}</div>
              <div style={{ fontSize: 12, lineHeight: 1.5, color: CU.textMuted }}>{s.desc}</div>
            </div>
          ))}
        </div>
        <div style={{
          background: CU.bgSecondary,
          border: `1px solid ${CU.border}`,
          borderRadius: 8, marginTop: 16, padding: '10px 14px',
        }}>
          <div style={{ fontSize: 12, lineHeight: 1.6, color: CU.textMuted }}>
            <strong style={{ color: CU.textSecondary }}>Condition :</strong> Votre filleul doit utiliser au moins 5 crédits
            de tokens pendant 2 mois consécutifs pour que la récompense soit validée.
          </div>
        </div>
      </div>

      {/* Referral List */}
      <div style={{ marginBottom: 16 }}>
        <h3 style={{ ...CU.sectionTitle, marginBottom: 12 }}>Mes filleuls</h3>
        {loading ? (
          <div style={CU.card}><div style={{ color: CU.textMuted }}>Chargement...</div></div>
        ) : referrals.length === 0 ? (
          <div style={{ ...CU.card, ...CU.emptyState }}>
            <div style={CU.emptyEmoji}>{'👥'}</div>
            <div style={CU.emptyTitle}>
              Vous n&apos;avez pas encore de filleul.
            </div>
            <div style={CU.emptyDesc}>
              Partagez votre lien pour commencer à gagner des crédits !
            </div>
          </div>
        ) : (
          <div style={{ ...CU.card, padding: 0, overflow: 'hidden' }}>
            <div style={{ overflowX: 'auto', WebkitOverflowScrolling: 'touch' }}>
            <table style={{ width: '100%', minWidth: 600, borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: `1px solid ${CU.border}` }}>
                  <th style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: CU.textSecondary, fontSize: 12 }}>Filleul</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: CU.textSecondary, fontSize: 12 }}>Statut</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: CU.textSecondary, fontSize: 12 }}>Mois 1</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: CU.textSecondary, fontSize: 12 }}>Mois 2</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: CU.textSecondary, fontSize: 12 }}>Recompense</th>
                  <th style={{ padding: '10px 14px', textAlign: 'center', fontWeight: 600, color: CU.textSecondary, fontSize: 12 }}>Date</th>
                </tr>
              </thead>
              <tbody>
                {referrals.map(ref => {
                  const st = STATUS_LABELS[ref.status] ?? STATUS_LABELS.pending;
                  return (
                    <tr key={ref.id} style={{ borderBottom: `1px solid ${CU.border}` }}>
                      <td style={{ padding: '10px 14px', fontWeight: 600, color: CU.text }}>{ref.referredEmail}</td>
                      <td style={{ padding: '10px 14px', textAlign: 'center' }}>
                        <span style={{ color: st.color, fontWeight: 600, fontSize: 12 }}>
                          <span style={{ fontSize: 16, marginRight: 4, verticalAlign: 'middle' }}>{st.emoji}</span> {st.label}
                        </span>
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, color: CU.textSecondary }}>
                        {ref.month1Spend > 0 ? `${(ref.month1Spend / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, color: CU.textSecondary }}>
                        {ref.month2Spend > 0 ? `${(ref.month2Spend / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 13, fontWeight: 700, color: ref.rewardCredited ? CU.text : CU.textMuted }}>
                        {ref.rewardCredited ? `${(ref.rewardAmount / 1_000_000).toFixed(0)} cr` : '—'}
                      </td>
                      <td style={{ padding: '10px 14px', textAlign: 'center', fontSize: 12, color: CU.textMuted }}>
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
      <PageBlogSection pageId="referrals" />
    </div>
  );
}
