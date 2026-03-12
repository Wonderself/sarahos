'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Script from 'next/script';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

const LEGAL_PAGES = [
  { href: '/legal/cgu', label: 'CGU', sub: 'Conditions d\'utilisation' },
  { href: '/legal/cgv', label: 'CGV', sub: 'Conditions de vente' },
  { href: '/legal/mentions', label: 'Mentions légales', sub: 'Informations légales' },
  { href: '/legal/confidentialite', label: 'Confidentialité', sub: 'Politique de données' },
  { href: '/legal/cookies', label: 'Cookies', sub: 'Gestion des cookies' },
];

export default function LegalLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  const currentPage = LEGAL_PAGES.find(p => p.href === pathname);

  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    'itemListElement': [
      {
        '@type': 'ListItem',
        'position': 1,
        'name': 'Accueil',
        'item': 'https://freenzy.io',
      },
      ...(currentPage ? [{
        '@type': 'ListItem',
        'position': 2,
        'name': currentPage.label,
        'item': `https://freenzy.io${currentPage.href}`,
      }] : []),
    ],
  };

  return (
    <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', background: '#fff' }}>
      <PublicNav />

      <Script
        id="legal-breadcrumb-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />

      {/* Branded mini-hero */}
      <div className="legal-hero" style={{
        background: 'linear-gradient(160deg, #0f0720 0%, #12121a 100%)',
        padding: '60px 24px 44px',
        marginTop: 52,
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
          width: 500, height: 200,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 68%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 1100, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {/* Breadcrumb */}
          <nav aria-label="Fil d'Ariane" role="navigation" style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 16, flexWrap: 'wrap' }}>
            <Link href="/" style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)', textDecoration: 'none', fontWeight: 600 }}>
              freenzy.io <span style={{ fontSize: 8, fontStyle: 'italic', opacity: 0.6 }}>Beta Test 1</span>
            </Link>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }} aria-hidden="true">/</span>
            <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: 0.5 }}>
              Légal
            </span>
            {currentPage && (
              <>
                <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.2)' }} aria-hidden="true">/</span>
                <span style={{ fontSize: 12, color: '#c4b5fd', fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.5 }} aria-current="page">
                  {currentPage.label}
                </span>
              </>
            )}
          </nav>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700,
            color: '#fff', letterSpacing: -1, margin: 0,
          }}>
            {currentPage?.sub ?? 'Documents légaux'}
          </h1>
        </div>
      </div>

      <div className="legal-layout-body" style={{ flex: 1, maxWidth: 1100, margin: '0 auto', width: '100%', padding: '40px 24px 60px', display: 'flex', gap: 48 }}>

        {/* Sidebar */}
        <nav aria-label="Navigation pages légales" className="legal-sidebar" style={{
          width: 210, flexShrink: 0, position: 'sticky', top: 80, alignSelf: 'flex-start',
          display: 'flex', flexDirection: 'column', gap: 2,
        }}>
          <div style={{ fontSize: 10, fontWeight: 800, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 12 }}>
            Documents légaux
          </div>
          {LEGAL_PAGES.map(p => {
            const isActive = pathname === p.href;
            return (
              <Link
                key={p.href}
                href={p.href}
                aria-current={isActive ? 'page' : undefined}
                style={{
                  fontSize: 13, textDecoration: 'none',
                  padding: '9px 12px',
                  borderRadius: 8,
                  background: isActive ? 'rgba(124,58,237,0.08)' : 'transparent',
                  borderLeft: isActive ? '3px solid #7c3aed' : '3px solid transparent',
                  color: isActive ? '#7c3aed' : '#4b5563',
                  fontWeight: isActive ? 700 : 400,
                  transition: 'all 0.15s ease',
                  display: 'block',
                  minHeight: 44,
                }}
              >
                <div style={{ fontWeight: isActive ? 700 : 500 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: isActive ? 'rgba(124,58,237,0.7)' : '#9ca3af', marginTop: 1 }}>{p.sub}</div>
              </Link>
            );
          })}

          {/* Back to home */}
          <div style={{ marginTop: 24, paddingTop: 20, borderTop: '1px solid #f0f0f0' }}>
            <Link href="/" style={{
              fontSize: 12, color: '#9ca3af', textDecoration: 'none',
              display: 'flex', alignItems: 'center', gap: 5,
              minHeight: 44,
            }}>
              {'<-'} Retour à l{"'"}accueil
            </Link>
          </div>
        </nav>

        {/* Content */}
        <main className="legal-main" style={{ flex: 1, maxWidth: 800, minWidth: 0 }} aria-label={currentPage?.sub ?? 'Documents légaux'}>
          {children}
        </main>
      </div>

      <PublicFooter />
    </div>
  );
}
