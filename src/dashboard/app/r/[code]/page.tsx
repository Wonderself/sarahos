'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';

interface ReferralInfo {
  referrerName: string;
  rewardAmount: number;
}

const COLORS = {
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  bg: '#FFFFFF',
  bgSecondary: '#FAFAFA',
  border: '#E5E5E5',
  accent: '#1A1A1A',
} as const;

export default function ReferralLandingPage() {
  const params = useParams();
  const code = typeof params['code'] === 'string' ? params['code'] : '';
  const [info, setInfo] = useState<ReferralInfo | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!code) {
      setError(true);
      setLoading(false);
      return;
    }

    fetch(`/api/referral/info?code=${encodeURIComponent(code)}`)
      .then((res) => {
        if (!res.ok) throw new Error('Not found');
        return res.json() as Promise<ReferralInfo>;
      })
      .then((data) => {
        setInfo(data);
        setLoading(false);
      })
      .catch(() => {
        setError(true);
        setLoading(false);
      });
  }, [code]);

  if (loading) {
    return (
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: COLORS.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      }}>
        <div style={{ color: COLORS.textMuted, fontSize: 16 }}>Chargement...</div>
      </div>
    );
  }

  if (error || !info) {
    return (
      <div style={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        background: COLORS.bg,
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
        padding: 24,
      }}>
        <div style={{ fontSize: 48, marginBottom: 16 }}>{'🔗'}</div>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: COLORS.text, margin: '0 0 8px 0' }}>
          Lien de parrainage invalide
        </h1>
        <p style={{ color: COLORS.textSecondary, fontSize: 15, margin: '0 0 24px 0' }}>
          Ce code de parrainage n&apos;existe pas ou a expire.
        </p>
        <a
          href="/"
          style={{
            display: 'inline-block',
            padding: '10px 24px',
            background: COLORS.accent,
            color: '#FFFFFF',
            borderRadius: 6,
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 600,
          }}
        >
          Decouvrir Freenzy.io
        </a>
      </div>
    );
  }

  const registerUrl = `/login?mode=register&ref=${encodeURIComponent(code)}`;

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      minHeight: '100vh',
      background: COLORS.bg,
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      padding: 24,
    }}>
      {/* Card */}
      <div style={{
        maxWidth: 480,
        width: '100%',
        background: COLORS.bgSecondary,
        border: `1px solid ${COLORS.border}`,
        borderRadius: 12,
        padding: 40,
        textAlign: 'center',
      }}>
        {/* Gift emoji */}
        <div style={{ fontSize: 56, marginBottom: 20 }}>{'🎁'}</div>

        {/* Title */}
        <h1 style={{
          fontSize: 24,
          fontWeight: 700,
          color: COLORS.text,
          margin: '0 0 12px 0',
          lineHeight: 1.3,
        }}>
          {info.referrerName} vous offre {info.rewardAmount} credits sur Freenzy
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: 15,
          color: COLORS.textSecondary,
          margin: '0 0 32px 0',
          lineHeight: 1.5,
        }}>
          Inscrivez-vous gratuitement et recevez {info.rewardAmount} credits pour decouvrir
          tous les agents IA de Freenzy.io. Votre parrain sera egalement recompense.
        </p>

        {/* CTA Button */}
        <a
          href={registerUrl}
          style={{
            display: 'inline-block',
            width: '100%',
            padding: '14px 32px',
            background: COLORS.accent,
            color: '#FFFFFF',
            borderRadius: 8,
            textDecoration: 'none',
            fontSize: 16,
            fontWeight: 700,
            boxSizing: 'border-box',
            transition: 'opacity 0.2s',
          }}
          onMouseEnter={(e) => { (e.target as HTMLElement).style.opacity = '0.9'; }}
          onMouseLeave={(e) => { (e.target as HTMLElement).style.opacity = '1'; }}
        >
          Creer mon compte gratuit
        </a>

        {/* Details */}
        <div style={{
          marginTop: 32,
          paddingTop: 24,
          borderTop: `1px solid ${COLORS.border}`,
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            gap: 32,
          }}>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>
                {info.rewardAmount}
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                Credits offerts
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>
                100+
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                Agents IA
              </div>
            </div>
            <div>
              <div style={{ fontSize: 24, fontWeight: 700, color: COLORS.text }}>
                0%
              </div>
              <div style={{ fontSize: 12, color: COLORS.textMuted, marginTop: 2 }}>
                Commission
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <p style={{
        marginTop: 24,
        fontSize: 13,
        color: COLORS.textMuted,
      }}>
        Freenzy.io — Votre OS entreprise autonome propulse par l&apos;IA
      </p>
    </div>
  );
}
