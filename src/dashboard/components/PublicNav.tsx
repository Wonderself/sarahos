'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const NAV_LINKS = [
  { href: '/demo', label: 'Démo' },
  { href: '/plans', label: 'Tarifs & API' },
  { href: '/blog', label: 'Blog' },
];

const FEATURE_LINKS = [
  { href: '/fonctionnalites/repondeur', label: 'Répondeur IA 24/7', emoji: '📞' },
  { href: '/fonctionnalites/documents', label: 'Documents & contrats IA', emoji: '📄' },
  { href: '/fonctionnalites/social', label: 'Réseaux sociaux IA', emoji: '📱' },
  { href: '/fonctionnalites/reveil', label: 'Briefing matinal', emoji: '☀️' },
  { href: '/demo#technologies', label: 'Studio Créatif (Photo/Vidéo)', emoji: '🎬' },
  { href: '/demo#whatsapp', label: 'WhatsApp Business IA', emoji: '💚' },
  { href: '/fonctionnalites/agents', label: '100+ Agents IA', emoji: '🤖' },
  { href: '/fonctionnalites/discussions', label: 'Discussions profondes', emoji: '🧠' },
  { href: '/fonctionnalites/arcade', label: 'Arcade & Gamification', emoji: '🕹️' },
  { href: '/fonctionnalites/marketplace', label: 'Marketplace (50 templates)', emoji: '🛒' },
];

export default function PublicNav() {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [featuresOpen, setFeaturesOpen] = useState(false);
  const [mobileFeaturesOpen, setMobileFeaturesOpen] = useState(false);
  const featuresTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isLanding = pathname === '/';
  const isDark = false;
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
      background: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(20px) saturate(180%)',
      WebkitBackdropFilter: 'blur(20px) saturate(180%)',
      borderBottom: '1px solid #E5E5E5',
      transition: 'all 0.35s cubic-bezier(0.4,0,0.2,1)',
    }}>
      <div style={{
        maxWidth: 1120, margin: '0 auto', padding: '0 24px',
        height: 56, display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}>
        {/* Logo */}
        <Link href="/" style={{ display: 'flex', alignItems: 'baseline', gap: 6, textDecoration: 'none' }}>
          <span style={{
            fontSize: 24,
            fontWeight: 800,
            letterSpacing: '-0.04em',
            color: isDark ? '#FFFFFF' : '#1A1A1A',
            transition: 'all 0.3s ease',
            fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
          }}>
            freenzy
          </span>
          <span style={{
            fontSize: 13,
            fontWeight: 300,
            color: isDark ? 'rgba(255,255,255,0.35)' : '#9B9B9B',
            letterSpacing: '0.02em',
          }}>
            .io
          </span>
          <span style={{
            fontSize: 8,
            fontWeight: 600,
            color: '#FFFFFF',
            background: isDark ? 'rgba(255,255,255,0.15)' : '#1A1A1A',
            padding: '2px 6px',
            borderRadius: 4,
            letterSpacing: '0.05em',
            textTransform: 'uppercase' as const,
            marginLeft: 4,
          }}>
            beta
          </span>
        </Link>

        {/* Desktop links */}
        <div className="public-nav-links">
          {/* Fonctionnalités dropdown */}
          <div
            onMouseEnter={handleFeaturesEnter}
            onMouseLeave={handleFeaturesLeave}
            style={{ position: 'relative' }}
          >
            <button
              onClick={() => setFeaturesOpen(o => !o)}
              aria-haspopup="true"
              aria-expanded={featuresOpen}
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
              <span style={{
                fontSize: 12,
                transition: 'transform 0.2s ease',
                transform: featuresOpen ? 'rotate(180deg)' : 'rotate(0deg)',
                display: 'inline-block',
              }}>▼</span>
            </button>

            {featuresOpen && (
              <div
                role="menu"
                onMouseEnter={handleFeaturesEnter}
                onMouseLeave={handleFeaturesLeave}
                onKeyDown={(e) => {
                  const items = e.currentTarget.querySelectorAll('[role="menuitem"]');
                  const currentIdx = Array.from(items).indexOf(document.activeElement as Element);
                  if (e.key === 'ArrowDown') { e.preventDefault(); (items[currentIdx < items.length - 1 ? currentIdx + 1 : 0] as HTMLElement)?.focus(); }
                  else if (e.key === 'ArrowUp') { e.preventDefault(); (items[currentIdx > 0 ? currentIdx - 1 : items.length - 1] as HTMLElement)?.focus(); }
                  else if (e.key === 'Escape') { setFeaturesOpen(false); }
                }}
                style={{
                  position: 'absolute', top: '100%', left: '50%', transform: 'translateX(-50%)',
                  marginTop: 8, minWidth: 'min(300px, calc(100vw - 32px))', maxHeight: 420, overflowY: 'auto',
                  background: '#FFFFFF', border: '1px solid #E5E5E5',
                  borderRadius: 12, padding: '8px',
                  boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
                }}
              >
                {FEATURE_LINKS.map(fl => (
                  <Link
                    key={fl.href}
                    href={fl.href}
                    role="menuitem"
                    tabIndex={0}
                    style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      padding: '10px 14px', borderRadius: 8,
                      textDecoration: 'none',
                      color: pathname === fl.href ? '#1A1A1A' : '#6B6B6B',
                      background: pathname === fl.href ? '#F7F7F7' : 'transparent',
                      fontSize: 13, fontWeight: 500, fontFamily: 'var(--font-display)',
                      transition: 'background 0.15s ease, color 0.15s ease',
                    }}
                    onMouseEnter={e => {
                      (e.currentTarget as HTMLElement).style.background = '#F7F7F7';
                      (e.currentTarget as HTMLElement).style.color = '#1A1A1A';
                    }}
                    onMouseLeave={e => {
                      (e.currentTarget as HTMLElement).style.background = pathname === fl.href ? '#F7F7F7' : 'transparent';
                      (e.currentTarget as HTMLElement).style.color = pathname === fl.href ? '#1A1A1A' : '#6B6B6B';
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{fl.emoji}</span>
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
              padding: '8px 16px', borderRadius: 8,
              background: 'transparent',
              color: '#1A1A1A',
              border: '1px solid #E5E5E5',
              transition: 'all 0.3s ease',
            }}
          >
            Ouvrir un compte
          </Link>
          <Link
            href="/client/dashboard"
            style={{
              fontFamily: 'var(--font-display)', fontSize: 13, fontWeight: 600, letterSpacing: '-0.01em', textDecoration: 'none',
              padding: '8px 20px', borderRadius: 8,
              background: '#1A1A1A',
              color: '#fff',
              border: '1px solid transparent',
              transition: 'all 0.3s ease',
            }}
          >
            Acceder a Freenzy
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
              color: isFeaturesActive ? '#1A1A1A' : '#4b5563',
              background: isFeaturesActive ? 'rgba(0,0,0,0.04)' : 'transparent',
              border: 'none', cursor: 'pointer', textAlign: 'left',
              display: 'flex', alignItems: 'center', justifyContent: 'space-between',
              width: '100%',
            }}
          >
            Fonctionnalités
            <span style={{
              fontSize: 12,
              transition: 'transform 0.2s ease',
              transform: mobileFeaturesOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              display: 'inline-block',
            }}>▼</span>
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
                    color: pathname === fl.href ? '#1A1A1A' : '#6b7280',
                    background: pathname === fl.href ? 'rgba(0,0,0,0.04)' : 'transparent',
                  }}
                >
                  <span style={{ fontSize: 16 }}>{fl.emoji}</span>
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
              color: pathname.startsWith('/cas') ? '#1A1A1A' : '#4b5563',
              background: pathname.startsWith('/cas') ? 'rgba(0,0,0,0.04)' : 'transparent',
            }}
          >
            Cas d&apos;usage
          </Link>
          <Link
            href="/vs-alternatives"
            style={{
              fontSize: 15, fontWeight: 500, textDecoration: 'none',
              padding: '14px 16px', borderRadius: 8,
              color: pathname === '/vs-alternatives' ? '#1A1A1A' : '#4b5563',
              background: pathname === '/vs-alternatives' ? 'rgba(0,0,0,0.04)' : 'transparent',
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
                color: pathname === link.href ? '#1A1A1A' : '#4b5563',
                background: pathname === link.href ? 'rgba(0,0,0,0.04)' : 'transparent',
              }}
            >
              {link.label}
            </Link>
          ))}
          <div style={{ height: 1, background: '#e5e7eb', margin: '8px 0' }} />
          <Link
            href="/client/dashboard"
            style={{
              fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
              padding: '12px 20px', borderRadius: 10,
              background: '#1A1A1A', color: '#fff',
            }}
          >
            Acceder a Freenzy
          </Link>
          <Link
            href="/login"
            style={{
              fontSize: 14, fontWeight: 600, textDecoration: 'none', textAlign: 'center',
              padding: '12px 20px', borderRadius: 10,
              background: 'transparent', color: '#1A1A1A',
              border: '1px solid #E5E5E5',
            }}
          >
            Ouvrir un compte
          </Link>
        </div>
      )}
    </nav>
  );
}
