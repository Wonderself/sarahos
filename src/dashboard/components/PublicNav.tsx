'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/demo', label: 'Démo' },
  { href: '/plans', label: 'Tarifs' },
  { href: '/tarifs-api', label: 'API' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const isLanding = pathname === '/';
  const isDark = !scrolled && isLanding;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  return (
    <nav style={{
      position: 'fixed', top: 0, left: 0, right: 0, zIndex: 100,
      background: scrolled ? 'rgba(255,255,255,0.88)' : 'transparent',
      backdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
      WebkitBackdropFilter: scrolled ? 'blur(24px) saturate(180%)' : 'none',
      borderBottom: scrolled ? '1px solid rgba(0,0,0,0.06)' : '1px solid transparent',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '0 24px',
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 10, textDecoration: 'none' }}>
          <span style={{
            fontSize: 22, fontWeight: 900, letterSpacing: -0.8,
            lineHeight: 1,
            color: isDark ? '#fff' : '#1d1d1f',
            transition: 'color 0.3s ease',
          }}>
            FREENZY<span style={{ color: '#6366f1' }}>.IO</span>
          </span>
        </Link>

        {/* Desktop links */}
        <div className="public-nav-links" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 13, fontWeight: 500, textDecoration: 'none',
                padding: '6px 14px', borderRadius: 8,
                color: isDark
                  ? 'rgba(255,255,255,0.7)'
                  : (pathname === link.href ? '#1d1d1f' : '#6b7280'),
                background: pathname === link.href
                  ? (isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)')
                  : 'transparent',
                transition: 'all 0.2s ease',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ width: 1, height: 20, background: isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.08)', margin: '0 6px' }} />
          <Link
            href="/login"
            style={{
              fontSize: 13, fontWeight: 600, textDecoration: 'none',
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
          {NAV_LINKS.map(link => (
            <Link
              key={link.href}
              href={link.href}
              style={{
                fontSize: 15, fontWeight: 500, textDecoration: 'none',
                padding: '14px 16px', borderRadius: 8,
                color: pathname === link.href ? '#6366f1' : '#4b5563',
                background: pathname === link.href ? 'rgba(99,102,241,0.06)' : 'transparent',
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
              background: '#6366f1', color: '#fff',
            }}
          >
            Créer un compte gratuit
          </Link>
        </div>
      )}
    </nav>
  );
}
