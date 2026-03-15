'use client';

import { useState, useEffect } from 'react';

interface ReferralStats {
  code: string;
  link: string;
  total: number;
  activated: number;
  creditsEarned: number;
}

function getToken(): string {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; } catch { return ''; }
}

export default function ReferralWidget() {
  const [stats, setStats] = useState<ReferralStats | null>(null);
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = getToken();
    if (!token) { setLoading(false); return; }

    fetch('/api/referral', { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json())
      .then(data => {
        if (data.code) setStats(data);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  async function generateCode() {
    const token = getToken();
    if (!token) return;
    const res = await fetch('/api/referral', {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    const data = await res.json();
    if (data.code) setStats(data);
  }

  function copyLink() {
    if (!stats?.link) return;
    navigator.clipboard.writeText(stats.link).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function shareWhatsApp() {
    if (!stats?.link) return;
    window.open(`https://wa.me/?text=${encodeURIComponent(`Je t'offre 20 crédits sur Freenzy.io ! Inscris-toi avec mon lien : ${stats.link}`)}`, '_blank');
  }

  function shareEmail() {
    if (!stats?.link) return;
    window.open(`mailto:?subject=${encodeURIComponent('20 crédits offerts sur Freenzy.io')}&body=${encodeURIComponent(`Salut !\n\nJe t'offre 20 crédits sur Freenzy.io, la plateforme d'assistants IA pour les professionnels.\n\nInscris-toi avec mon lien : ${stats.link}\n\nOn gagne 20 crédits chacun !`)}`, '_blank');
  }

  if (loading) return null;

  return (
    <div style={{
      background: '#fff',
      border: '1px solid #E5E5E5',
      borderRadius: 12,
      padding: '16px 20px',
    }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12 }}>
        <span style={{ fontSize: 18 }}>🎁</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A' }}>Parrainage</span>
        {stats && stats.total >= 5 && (
          <span style={{ fontSize: 11, background: '#FEF3C7', color: '#92400E', padding: '2px 8px', borderRadius: 10, fontWeight: 600 }}>🏆 Top parrain</span>
        )}
      </div>

      {!stats ? (
        <div style={{ textAlign: 'center', padding: '12px 0' }}>
          <p style={{ fontSize: 13, color: '#6B6B6B', marginBottom: 12 }}>
            Invitez un collègue, gagnez 20 crédits chacun
          </p>
          <button
            onClick={generateCode}
            style={{
              padding: '8px 20px', background: '#1A1A1A', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            Obtenir mon lien
          </button>
        </div>
      ) : (
        <>
          {/* Stats */}
          <div style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: '#FAFAFA', borderRadius: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#1A1A1A' }}>{stats.total}</div>
              <div style={{ fontSize: 11, color: '#9B9B9B' }}>filleuls</div>
            </div>
            <div style={{ flex: 1, textAlign: 'center', padding: '8px 0', background: '#FAFAFA', borderRadius: 8 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: '#16A34A' }}>+{stats.creditsEarned}</div>
              <div style={{ fontSize: 11, color: '#9B9B9B' }}>crédits gagnés</div>
            </div>
          </div>

          {/* Link */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8,
            background: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 8,
            padding: '8px 12px', marginBottom: 12,
          }}>
            <span style={{ flex: 1, fontSize: 12, color: '#6B6B6B', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {stats.link}
            </span>
            <button
              onClick={copyLink}
              style={{
                padding: '4px 12px', background: copied ? '#16A34A' : '#1A1A1A', color: '#fff',
                border: 'none', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer',
                flexShrink: 0, transition: 'background 0.2s',
              }}
            >
              {copied ? '✓ Copié' : 'Copier'}
            </button>
          </div>

          {/* Share buttons */}
          <div style={{ display: 'flex', gap: 8 }}>
            <button onClick={shareWhatsApp} style={{
              flex: 1, padding: '8px 0', background: '#25D366', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              WhatsApp
            </button>
            <button onClick={shareEmail} style={{
              flex: 1, padding: '8px 0', background: '#2563EB', color: '#fff',
              border: 'none', borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: 'pointer',
            }}>
              Email
            </button>
          </div>

          {stats.total === 0 && (
            <p style={{ fontSize: 12, color: '#9B9B9B', textAlign: 'center', marginTop: 8 }}>
              Partagez votre lien — vous gagnez 20 crédits par inscription
            </p>
          )}
        </>
      )}
    </div>
  );
}
