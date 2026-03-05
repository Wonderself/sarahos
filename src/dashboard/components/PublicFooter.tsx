import Link from 'next/link';

const PRODUCT_LINKS = [
  { href: '/demo', label: 'Demo' },
  { href: '/plans', label: 'Tarifs' },
  { href: '/tarifs-api', label: 'API' },
  { href: '/login', label: 'Se connecter' },
];

const LEGAL_LINKS = [
  { href: '/legal/cgu', label: 'CGU' },
  { href: '/legal/cgv', label: 'CGV' },
  { href: '/legal/mentions', label: 'Mentions' },
  { href: '/legal/confidentialite', label: 'Confidentialite' },
  { href: '/legal/cookies', label: 'Cookies' },
];

export default function PublicFooter() {
  return (
    <footer style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.5)', borderTop: '1px solid rgba(255,255,255,0.06)' }}>
      {/* Band 1: Logo + product links */}
      <div className="lp-footer-band1">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <div style={{
            width: 30, height: 30, borderRadius: 8,
            background: 'linear-gradient(135deg, #6366f1, #a855f7)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            flexShrink: 0,
          }}>
            <span style={{ color: '#fff', fontSize: 14, fontWeight: 900, lineHeight: 1 }}>F</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: 18, fontWeight: 900, letterSpacing: -0.5, color: '#fff', lineHeight: 1 }}>
              FREENZY<span style={{ color: '#6366f1' }}>.IO</span>
            </span>
            <span style={{ fontSize: 8, fontWeight: 600, letterSpacing: 1.5, color: 'rgba(255,255,255,0.25)', textTransform: 'uppercase', lineHeight: 1, marginTop: 2 }}>
              Free &amp; Easy
            </span>
          </div>
        </Link>
        <nav className="lp-footer-band1-links">
          {PRODUCT_LINKS.map(l => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
      </div>

      {/* Band 2: Legal + copyright */}
      <div className="lp-footer-band2">
        <nav className="lp-footer-band2-links">
          {LEGAL_LINKS.map(l => (
            <Link key={l.href} href={l.href}>{l.label}</Link>
          ))}
        </nav>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>
          &copy; {new Date().getFullYear()} Freenzy.io &middot; <span style={{ color: '#6366f1', fontWeight: 600 }}>Claude AI</span>
        </span>
      </div>
    </footer>
  );
}
