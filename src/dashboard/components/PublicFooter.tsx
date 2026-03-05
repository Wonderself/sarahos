import Link from 'next/link';

const PRODUCT_LINKS = [
  { href: '/demo', label: 'Démo' },
  { href: '/plans', label: 'Tarifs' },
  { href: '/tarifs-api', label: 'Tarifs API' },
  { href: '/login', label: 'Se connecter' },
  { href: '/login?mode=register', label: 'Créer un compte' },
];

const LEGAL_LINKS = [
  { href: '/legal/cgu', label: 'CGU' },
  { href: '/legal/cgv', label: 'CGV' },
  { href: '/legal/mentions', label: 'Mentions légales' },
  { href: '/legal/confidentialite', label: 'Confidentialité' },
  { href: '/legal/cookies', label: 'Cookies' },
];

const TECH = ['Claude AI', 'GPT-4', 'Gemini', 'ElevenLabs', 'Twilio', 'Stripe'];

export default function PublicFooter() {
  return (
    <footer className="public-footer" style={{
      background: '#0a0a0f',
      color: 'rgba(255,255,255,0.5)',
      borderTop: '1px solid rgba(255,255,255,0.06)',
    }}>
      {/* ── Main grid ── */}
      <div className="public-footer-inner" style={{
        maxWidth: 1040, margin: '0 auto',
        padding: '64px 24px 48px',
        display: 'grid',
        gridTemplateColumns: '2.2fr 1fr 1fr',
        gap: 56,
      }}>
        {/* Brand */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
            <div style={{
              width: 36, height: 36, borderRadius: 10,
              background: 'linear-gradient(135deg, #6366f1, #a855f7)',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              boxShadow: '0 0 20px rgba(99,102,241,0.25)',
              flexShrink: 0,
            }}>
              <span style={{ color: '#fff', fontSize: 17, fontWeight: 900, lineHeight: 1 }}>F</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' }}>
              <span style={{
                fontSize: 22, fontWeight: 900, letterSpacing: -0.8, color: '#fff', lineHeight: 1,
              }}>
                FREENZY<span style={{ color: '#6366f1' }}>.IO</span>
              </span>
              <span style={{
                fontSize: 9, fontWeight: 600, letterSpacing: 1.5,
                color: 'rgba(255,255,255,0.3)',
                textTransform: 'uppercase', lineHeight: 1, marginTop: 3,
              }}>
                Free &amp; Easy
              </span>
            </div>
          </div>
          <p style={{
            fontSize: 14, color: 'rgba(255,255,255,0.32)',
            lineHeight: 1.7, maxWidth: 320, marginBottom: 24,
          }}>
            Free &amp; Easy — votre équipe IA complète. 72+ agents spécialisés, toutes les IA du marché, 0% de commission.
          </p>
          <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
            {TECH.map(t => (
              <span key={t} style={{
                fontSize: 10, fontWeight: 600,
                color: 'rgba(255,255,255,0.28)',
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.07)',
                padding: '4px 11px', borderRadius: 20,
              }}>
                {t}
              </span>
            ))}
          </div>
        </div>

        {/* Product */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.18)',
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20,
          }}>
            Produit
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {PRODUCT_LINKS.map(l => (
              <Link key={l.href + l.label} href={l.href} style={{
                fontSize: 13, color: 'rgba(255,255,255,0.42)',
                textDecoration: 'none', transition: 'color 0.15s',
              }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>

        {/* Legal */}
        <div>
          <div style={{
            fontSize: 11, fontWeight: 700, color: 'rgba(255,255,255,0.18)',
            textTransform: 'uppercase', letterSpacing: 2, marginBottom: 20,
          }}>
            Légal
          </div>
          <nav style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {LEGAL_LINKS.map(l => (
              <Link key={l.href} href={l.href} style={{
                fontSize: 13, color: 'rgba(255,255,255,0.42)',
                textDecoration: 'none', transition: 'color 0.15s',
              }}>
                {l.label}
              </Link>
            ))}
          </nav>
        </div>
      </div>

      {/* ── Bottom bar ── */}
      <div className="public-footer-bottom" style={{
        maxWidth: 1040, margin: '0 auto',
        padding: '20px 24px',
        borderTop: '1px solid rgba(255,255,255,0.06)',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        flexWrap: 'wrap', gap: 12,
      }}>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          © {new Date().getFullYear()} Freenzy.io — Tous droits réservés
        </span>
        <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.18)' }}>
          Propulsé par{' '}
          <span style={{ color: '#6366f1', fontWeight: 600 }}>Claude AI</span>
          {' '}(Anthropic)
        </span>
      </div>
    </footer>
  );
}
