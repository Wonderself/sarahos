import { ImageResponse } from 'next/og';

export const runtime = 'edge';
export const alt = 'Flashboard — 72 Agents IA pour PME | Freenzy.io';
export const size = { width: 1200, height: 630 };
export const contentType = 'image/png';

export default function OgImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '1200px',
          height: '630px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'center',
          alignItems: 'center',
          background: 'linear-gradient(135deg, #0a0a0f 0%, #1a1a2e 60%, #0f0f1a 100%)',
          fontFamily: 'system-ui, -apple-system, sans-serif',
          position: 'relative',
        }}
      >
        {/* Background glow */}
        <div
          style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '800px',
            height: '400px',
            background: 'radial-gradient(ellipse at center, rgba(99,102,241,0.18) 0%, transparent 70%)',
            display: 'flex',
          }}
        />

        {/* Top badge */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            marginBottom: '36px',
            background: 'rgba(99,102,241,0.12)',
            border: '1px solid rgba(99,102,241,0.35)',
            borderRadius: '100px',
            padding: '10px 28px',
          }}
        >
          <div
            style={{
              width: '10px',
              height: '10px',
              borderRadius: '50%',
              background: '#22c55e',
              display: 'flex',
            }}
          />
          <span style={{ fontSize: '18px', color: '#a5b4fc', fontWeight: 600, letterSpacing: '1px' }}>
            FREENZY.IO — FLASHBOARD
          </span>
        </div>

        {/* Main headline */}
        <div
          style={{
            fontSize: '80px',
            fontWeight: 900,
            color: '#ffffff',
            textAlign: 'center',
            lineHeight: '1.0',
            marginBottom: '16px',
            letterSpacing: '-3px',
            display: 'flex',
          }}
        >
          72 Agents IA
        </div>

        <div
          style={{
            fontSize: '52px',
            fontWeight: 700,
            color: '#8b5cf6',
            textAlign: 'center',
            marginBottom: '32px',
            letterSpacing: '-1px',
            display: 'flex',
          }}
        >
          pour votre entreprise
        </div>

        {/* Sub */}
        <div
          style={{
            fontSize: '22px',
            color: '#94a3b8',
            textAlign: 'center',
            maxWidth: '800px',
            lineHeight: '1.5',
            display: 'flex',
          }}
        >
          Répondeur 24/7 · Toutes les IA du marché · 0% commission · Sans abonnement
        </div>

        {/* Model badges */}
        <div
          style={{
            display: 'flex',
            gap: '12px',
            marginTop: '44px',
            alignItems: 'center',
          }}
        >
          {['Claude', 'GPT-4', 'Gemini', 'Llama', 'Grok'].map((m) => (
            <div
              key={m}
              style={{
                padding: '8px 18px',
                borderRadius: '100px',
                background: 'rgba(255,255,255,0.05)',
                border: '1px solid rgba(255,255,255,0.12)',
                color: '#cbd5e1',
                fontSize: '16px',
                fontWeight: 500,
                display: 'flex',
              }}
            >
              {m}
            </div>
          ))}
          <div
            style={{
              padding: '8px 18px',
              borderRadius: '100px',
              background: 'rgba(255,255,255,0.05)',
              border: '1px solid rgba(255,255,255,0.12)',
              color: '#cbd5e1',
              fontSize: '16px',
              fontWeight: 500,
              display: 'flex',
            }}
          >
            + Mistral
          </div>
        </div>

        {/* Bottom — tagline */}
        <div
          style={{
            position: 'absolute',
            bottom: '36px',
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
          }}
        >
          <div
            style={{
              width: '6px',
              height: '6px',
              borderRadius: '50%',
              background: '#6366f1',
              display: 'flex',
            }}
          />
          <span style={{ color: '#475569', fontSize: '16px' }}>
            Accès gratuit · 0% de commission · Sans abonnement
          </span>
        </div>
      </div>
    ),
    { width: 1200, height: 630 },
  );
}
