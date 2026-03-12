import Link from 'next/link';

const PRODUCT_LINKS = [
  { href: '/demo', label: 'Demo' },
  { href: '/plans', label: 'Tarifs' },
  { href: '/tarifs-api', label: 'API' },
  { href: '/blog', label: 'Blog' },
  { href: '/login', label: 'Se connecter' },
];

const FEATURE_LINKS = [
  { href: '/fonctionnalites/repondeur', label: 'Répondeur IA' },
  { href: '/fonctionnalites/documents', label: 'Générateur de documents' },
  { href: '/fonctionnalites/social', label: 'Pilotage réseaux sociaux' },
  { href: '/fonctionnalites/reveil', label: 'Briefing matinal' },
];

const USE_CASE_LINKS = [
  { href: '/cas/restaurant', label: 'Restaurant' },
  { href: '/cas/immobilier', label: 'Immobilier' },
  { href: '/cas/cabinet', label: 'Cabinet' },
];

const LEGAL_LINKS = [
  { href: '/legal/cgu', label: 'CGU' },
  { href: '/legal/cgv', label: 'CGV' },
  { href: '/legal/mentions', label: 'Mentions' },
  { href: '/legal/confidentialite', label: 'Confidentialite' },
  { href: '/legal/cookies', label: 'Cookies' },
];

const footerColumnTitleStyle: React.CSSProperties = {
  fontSize: 12, fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.08em',
  color: 'rgba(255,255,255,0.35)', marginBottom: 12,
};

const footerLinkStyle: React.CSSProperties = {
  display: 'block', fontSize: 13, color: 'rgba(255,255,255,0.55)',
  textDecoration: 'none', padding: '4px 0', transition: 'color 0.15s ease',
};

export default function PublicFooter() {
  return (
    <footer role="contentinfo" style={{ background: '#1A1A1A', color: 'rgba(255,255,255,0.5)', borderTop: 'none' }}>
      {/* Band 0: Multi-column links */}
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '48px 24px 32px',
        display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: 32,
      }}>
        {/* Fonctionnalités column */}
        <div>
          <div style={footerColumnTitleStyle}>Fonctionnalités</div>
          {FEATURE_LINKS.map(l => (
            <Link
              key={l.href} href={l.href} style={footerLinkStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
            >{l.label}</Link>
          ))}
        </div>

        {/* Cas d'usage column */}
        <div>
          <div style={footerColumnTitleStyle}>Cas d&apos;usage</div>
          {USE_CASE_LINKS.map(l => (
            <Link
              key={l.href} href={l.href} style={footerLinkStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
            >{l.label}</Link>
          ))}
          <Link
            href="/vs-alternatives" style={{ ...footerLinkStyle, marginTop: 8 }}
            onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
            onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
          >Comparaison</Link>
        </div>

        {/* Produit column */}
        <div>
          <div style={footerColumnTitleStyle}>Produit</div>
          {PRODUCT_LINKS.map(l => (
            <Link
              key={l.href} href={l.href} style={footerLinkStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
            >{l.label}</Link>
          ))}
        </div>

        {/* Légal column */}
        <div>
          <div style={footerColumnTitleStyle}>Légal</div>
          {LEGAL_LINKS.map(l => (
            <Link
              key={l.href} href={l.href} style={footerLinkStyle}
              onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#fff'; }}
              onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,255,255,0.55)'; }}
            >{l.label}</Link>
          ))}
        </div>
      </div>

      {/* Band 1: Logo + product links */}
      <div className="lp-footer-band1">
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span className="fz-logo-text fz-logo-text-dark" style={{ fontSize: 18 }}>
            freenzy.io
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
          &copy; {new Date().getFullYear()} Freenzy.io &middot; <span style={{ background: '#1A1A1A', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent', fontWeight: 600 }}>Claude AI</span>
        </span>
      </div>
    </footer>
  );
}
