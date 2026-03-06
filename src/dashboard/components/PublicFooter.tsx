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
    <footer style={{ background: '#0a0a0f', color: 'rgba(255,255,255,0.5)', borderTop: 'none' }}>
      {/* Band 1: Logo + product links */}
      <div className="lp-footer-band1">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span className="fz-logo-text fz-logo-text-dark" style={{ fontSize: 18 }}>
            FREENZY.IO
          </span>
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
          &copy; {new Date().getFullYear()} Freenzy.io &middot; <span style={{ color: '#5b6cf7', fontWeight: 600 }}>Claude AI</span>
        </span>
      </div>
    </footer>
  );
}
