'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/demo', label: 'Démo' },
  { href: '/plans', label: 'Tarifs & API' },
];

const FEATURE_LINKS = [
  { href: '/fonctionnalites/repondeur', label: 'Répondeur IA', icon: 'smart_toy' },
  { href: '/fonctionnalites/documents', label: 'Générateur de documents', icon: 'description' },
  { href: '/fonctionnalites/social', label: 'Pilotage réseaux sociaux', icon: 'share' },
  { href: '/fonctionnalites/reveil', label: 'Briefing matinal', icon: 'wb_sunny' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const featuresTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLanding = pathname === '/';
  const isDark = !scrolled && isLanding;
  const isFeaturesActive = pathname.startsWith('/fonctionnalites');

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); setMobileFeaturesOpen(false); }, [pathname]);

  const handleFeaturesEnter = () => {
    if (featuresTimeoutRef.current) clearTimeout(featuresTimeoutRef.current);
    setFeaturesOpen(true);
  };
  const handleFeaturesLeave = () => {
    featuresTimeoutRef.current = setTimeout(() => setFeaturesOpen(false), 200);
  };

  const linkStyle = (href: string) => ({
    fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 500, letterSpacing: '-0.01em', textDecoration: 'none' as const,
    padding: '6px 12px', borderRadius: 8,
    color: isDark
      ? 'rgba(255,255,255,0.7)'
      : (pathname === href ? '#1d1d1f' : '#6b7280'),
    background: pathname === href
      ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')
      : 'transparent',
    transition: 'all 0.2s ease',
  });

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled
        ? 'rgba(255,255,255,0.92)'
        : (isLanding ? 'rgba(10,10,15,0.65)' : 'rgba(255,255,255,0.92)'),
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid rgba(255,255,255,0.06)',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '0 24px',
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span
            className={`fz-logo-text ${isDark ? 'fz-logo-text-dark' : 'fz-logo-text-light'}`}
            style={{ fontSize: 22, transition: 'all 0.3s ease' }}
          >
            freenzy.io
          </span>
        </Link>

        {/* Desktop links */}
        <div className="public-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {/* Fonctionnalités dropdown */}
          <div
            onMouseEnter={handleFeaturesEnter}
            onMouseLeave={handleFeaturesLeave}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => setFeaturesOpen(o => !o)}
              style={{
                ...linkStyle('/fonctionnalites'),
                color: isDark
                  ? 'rgba(255,255,255,0.7)'
                  : (isFeaturesActive ? '#1d1d1f' : '#6b7280'),
                background: isFeaturesActive
                  ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')
                  : 'transparent',
                border: 'none', cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 4,
              }}
            >
              Fonctionnalités
              <span className="material-symbols-rounded" style={{
                fontSize: 16,
                transition: 'transform 0.2s ease',
                transform: featuresOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              }}>expand_more</span>
            </button>

            {featuresOpen && (
              <div
                onMouseEnter={handleFeaturesEnter}
                onMouseLeave={handleFeaturesLeave}
                style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginTop: 8, minWidth: 260,
                  background: '#14141b', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 12, padding: '8px',
                  boxShadow: '0 16px 48px rgba(0,0,0,0.4)',
                }}
              >
                {FEATURE_LINKS.map(fl => (
                  <Link
                    key={fl.href}
                    href={fl.href}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 8,
                      textDecoration: 'none',
                      color: pathname === fl.href ? '#fff' : 'rgba(255,255,255,0.7)',
                      background: pathname === fl.href ? 'rgba(91,108,247,0.15)' : 'transparent',
                      fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-display)',
                      transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = 'rgba(255,255,255,0.06)';
                      (e.currentTarget as HTMLElement).style.color = '#fff';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = pathname === fl.href ? 'rgba(91,108,247,0.15)' : 'transparent';
                      (e.currentTarget as HTMLElement).style.color = pathname === fl.href ? '#fff' : 'rgba(255,255,255,0.7)';
                    }}
                  >
                    <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#5b6cf7' }}>{fl.icon}</span>
                    {fl.label}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Cas d'usage */}
          <Link href="/cas/restaurant" style={linkStyle('/cas/restaurant')}>
            Cas d&apos;usage
          </Link>

          {/* Comparaison */}
          <Link href="/vs-alternatives" style={linkStyle('/vs-alternatives')}>
            Comparaison
          </Link>

          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={linkStyle(link.href)}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ width: 1, height: 16, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', margin: '0 4px' }} />
          <Link
            href="/login"
            style={{
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', textDecoration: 'none',
              padding: '8px 20px', borderRadius: 8,
              background: isDark ? 'rgba(255,255,255,0.1)' : '#1d1d1f',
              color: '#fff',
              border: isDark ? '1px solid rgba(255,255,255,0.18)' : '1px solid transparent',
              transition: 'all 0.3s ease',
            }}
          >
            Se connecter
          </Link>
        </div>

        {/* Mobile toggle */}
        <button
          className="public-nav-mobile-toggle"
          onClick={() => setMobileOpen(o => !o)}
          aria-label="Menu"
          style={{ color: isDark ? 'rgba(255,255,255,0.85)' : '#1d1d1f' }}
        >
          {mobileOpen ? '\u2715' : '\u2630'}
        </button>
      </div>

      {/* Mobile dropdown */}
      {mobileOpen && (
        <div style={{
          position: 'absolute', top: 56, left: 0, right: 0,
          background: 'rgba(255,255,255,0.98)',
          backdropFilter: 'blur(24px)',
          WebkitBackdropFilter: 'blur(24px)',
          borderBottom: '1px solid rgba(0,0,0,0.08)',
          padding: '20px 24px',
          display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          {/* Mobile Fonctionnalités accordion */}
          <button
            onClick={() => setMobileFeaturesOpen(o => !o)}
            style={{
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              padding: '14px 16px', borderRadius: 8,
              color: isFeaturesActive ? '#5b6cf7' : '#4b5563',
              background: isFeaturesActive ? 'rgba(91,108,247,0.06)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%',
            }}
          >
            Fonctionnalités
            <span className="material-symbols-rounded" style={{
              fontSize: 18,
              transition: 'transform 0.2s ease',
              transform: mobileFeaturesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
            }}>expand_more</span>
          </button>
          {mobileFeaturesOpen && (
            <div style={{ paddingLeft: 12, display: 'flex', flexDirection: 'column', gap: 2 }}>
              {FEATURE_LINKS.map(fl => (
                <Link
                  key={fl.href}
                  href={fl.href}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 8,
                    fontSize: 14, fontWeight: 500, textDecoration: 'none',
                    padding: '10px 16px', borderRadius: 8,
                    color: pathname === fl.href ? '#5b6cf7' : '#6b7280',
                    background: pathname === fl.href ? 'rgba(91,108,247,0.06)' : 'transparent',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 16, color: '#5b6cf7' }}>{fl.icon}</span>
                  {fl.label}
                </Link>
              ))}
            </div>
          )}

          <Link
            href="/cas/restaurant"
            style={{
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              padding: '14px 16px', borderRadius: 8,
              color: pathname.startsWith('/cas') ? '#5b6cf7' : '#4b5563',
              background: pathname.startsWith('/cas') ? 'rgba(91,108,247,0.06)' : 'transparent',
            }}
          >
            Cas d&apos;usage
          </Link>
          <Link
            href="/vs-alternatives"
            style={{
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              padding: '14px 16px', borderRadius: 8,
              color: pathname === '/vs-alternatives' ? '#5b6cf7' : '#4b5563',
              background: pathname === '/vs-alternatives' ? 'rgba(91,108,247,0.06)' : 'transparent',
            }}
          >
            Comparaison
          </Link>

          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                padding: '14px 16px', borderRadius: 8,
                color: pathname === link.href ? '#5b6cf7' : '#4b5563',
                background: pathname === link.href ? 'rgba(91,108,247,0.06)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0' }} />
          <Link
            href="/login"
            style={{
              fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
              padding: '12px 20px', borderRadius: 10,
              background: '#1d1d1f', color: '#fff',
            }}
          >
            Se connecter
          </Link>
          <Link
            href="/login?mode=register"
            style={{
              fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
              padding: '12px 20px', borderRadius: 10,
              background: '#5b6cf7', color: '#fff',
            }}
          >
            Créer un compte gratuit
          </Link>
        </div>
      )}
    </nav>
  );
}
