'use client';

import { useEffect, useState, useCallback } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { loadGamification } from '../../lib/gamification';
import { DEFAULT_AGENTS, getActiveAgentIds } from '../../lib/agent-config';

interface UserSession {
  token: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
  tier: string;
}

const NAV_SECTIONS = [
  {
    title: 'Espace de travail',
    links: [
      { href: '/client/dashboard', icon: '🏠', label: 'Accueil' },
      { href: '/client/repondeur', icon: '📞', label: 'Répondeur' },
      { href: '/client/briefing', icon: '☀️', label: 'Briefing du jour' },
      { href: '/client/chat', icon: '💬', label: 'Discuter' },
      { href: '/client/meeting', icon: '🏛️', label: 'Réunion' },
      { href: '/client/documents', icon: '📄', label: 'Documents' },
      { href: '/client/strategy', icon: '🎯', label: 'Plan d\'attaque' },
    ],
  },
  {
    title: 'Mon équipe',
    links: [
      { href: '/client/team', icon: '👥', label: 'Recruter / Gérer' },
      { href: '/client/agents/customize', icon: '🎨', label: 'Personnaliser' },
    ],
  },
  {
    title: 'Configuration',
    links: [
      { href: '/client/onboarding', icon: '🏢', label: 'Mon entreprise' },
      { href: '/client/account', icon: '👤', label: 'Compte & Credits' },
      { href: '/client/referrals', icon: '🎁', label: 'Parrainer' },
    ],
  },
];

const LEVEL_TITLES: Record<number, string> = {
  1: 'Débutant', 2: 'Apprenti', 3: 'Explorateur', 4: 'Collaborateur',
  5: 'Professionnel', 6: 'Expert', 7: 'Maître', 8: 'Visionnaire',
  9: 'Légende', 10: 'Transcendant',
};

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [gamLevel, setGamLevel] = useState(1);
  const [gamXP, setGamXP] = useState(0);
  const [gamXPNext, setGamXPNext] = useState(100);
  const [gamStreak, setGamStreak] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [lowCreditDismissed, setLowCreditDismissed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [theme, setTheme] = useState<'normal' | 'white' | 'dark'>('normal');
  const [activeAgentCount, setActiveAgentCount] = useState(1);

  const refreshGamification = useCallback(() => {
    const gam = loadGamification();
    setGamLevel(gam.level);
    setGamXP(gam.xp);
    setGamXPNext(gam.xpToNext);
    setGamStreak(gam.streak);
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem('sarah_session');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        setSession(s);
        loadWallet(s.token);
      } catch { /* corrupted session */ }
    }
    setLoading(false);
    refreshGamification();
    setActiveAgentCount(getActiveAgentIds().length);

    // Load theme
    try {
      const savedTheme = localStorage.getItem('sarah_theme') as 'normal' | 'white' | 'dark' | null;
      if (savedTheme) setTheme(savedTheme);
    } catch { /* */ }

    const interval = setInterval(refreshGamification, 30000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'sarah_gamification') refreshGamification();
    };
    window.addEventListener('storage', onStorage);
    return () => { clearInterval(interval); window.removeEventListener('storage', onStorage); };
  }, [refreshGamification]);

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Check low credit dismiss
  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('sarah_low_credit_dismissed');
      if (dismissed && Date.now() - Number(dismissed) < 86400000) setLowCreditDismissed(true);
    } catch { /* */ }
  }, []);

  // Ctrl+K handler
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
        setSearchQuery('');
      }
      if (e.key === 'Escape') setSearchOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  async function loadWallet(token: string) {
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/portal/wallet', token }),
      });
      const data = await res.json();
      setWalletBalance(data.balance ?? data.wallet?.balance ?? 0);
    } catch { /* */ }
  }

  if (loading) {
    return (
      <div className="flex-center" style={{ height: '100vh', background: 'var(--bg-primary)', flexDirection: 'column', gap: 16 }}>
        <img
          src="/images/logo.jpg"
          alt="SARAH OS"
          style={{ height: 40, borderRadius: 10, opacity: 0.6 }}
          onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
        />
        <div style={{ display: 'flex', flexDirection: 'column', gap: 8, width: 240 }}>
          <div className="animate-pulse" style={{ height: 10, borderRadius: 6, background: 'var(--bg-tertiary)' }} />
          <div className="animate-pulse" style={{ height: 10, borderRadius: 6, background: 'var(--bg-tertiary)', width: '70%' }} />
          <div className="animate-pulse" style={{ height: 10, borderRadius: 6, background: 'var(--bg-tertiary)', width: '50%' }} />
        </div>
      </div>
    );
  }

  if (!session) {
    if (typeof window !== 'undefined') window.location.href = '/login';
    return null;
  }

  function switchTheme(t: 'normal' | 'white' | 'dark') {
    setTheme(t);
    if (t === 'normal') {
      document.documentElement.removeAttribute('data-theme');
      localStorage.removeItem('sarah_theme');
    } else {
      document.documentElement.setAttribute('data-theme', t === 'dark' ? 'dark' : 'white');
      localStorage.setItem('sarah_theme', t === 'dark' ? 'dark' : 'white');
    }
  }

  function dismissLowCredit() {
    setLowCreditDismissed(true);
    try { localStorage.setItem('sarah_low_credit_dismissed', String(Date.now())); } catch { /* */ }
  }

  const allNavLinks = NAV_SECTIONS.flatMap(s => s.links);
  const filteredLinks = searchQuery
    ? allNavLinks.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allNavLinks;

  const xpPct = gamXPNext > 0 ? Math.min((gamXP / gamXPNext) * 100, 100) : 0;
  const planBadgeColor = '#6366f1';

  return (
    <div className="flex" style={{ minHeight: '100vh' }}>
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Menu"
        >
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <div className="flex items-center gap-8">
          <img
            src="/images/logo.jpg"
            alt="SARAH OS"
            className="rounded-md"
            style={{ height: 28 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Client Sidebar */}
      <nav className={`client-sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src="/images/logo.jpg"
              alt="SARAH OS"
              className="rounded-md"
              style={{ height: 30 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <div className="sidebar-logo-version">Employés IA 24/7</div>
            </div>
          </div>
          {/* Access badge */}
          <div className="badge badge-success flex items-center gap-4 mt-4" style={{ padding: '3px 8px' }}>
            <span className="text-xs">✅</span>
            <span className="text-xs font-bold" style={{ color: '#16a34a' }}>
              {activeAgentCount} agent{activeAgentCount > 1 ? 's' : ''} actif{activeAgentCount > 1 ? 's' : ''} / {DEFAULT_AGENTS.length}
            </span>
          </div>
        </div>

        <div className="sidebar-nav">
          {NAV_SECTIONS.map((section, i) => (
            <div key={i} className="nav-section">
              <div className="nav-section-title">{section.title}</div>
              {section.links.map(link => {
                const isActive = pathname === link.href || (link.href !== '/' && pathname.startsWith(link.href));
                return (
                  <Link key={link.href} href={link.href} className={`nav-link${isActive ? ' nav-link-active' : ''}`}>
                    <span className="nav-icon">{link.icon}</span> {link.label}
                  </Link>
                );
              })}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          {/* Credits Mini-Widget */}
          <div className="bg-secondary border rounded-md p-8 mb-4">
            <div className="flex-between mb-4">
              <span className="text-xs font-semibold text-secondary">Crédits</span>
              <Link href="/client/account" className="text-xs text-accent font-semibold" style={{ textDecoration: 'none' }}>
                Recharger
              </Link>
            </div>
            <div className={walletBalance !== null && walletBalance > 50_000_000 ? 'text-success' : walletBalance !== null && walletBalance > 10_000_000 ? 'text-warning' : 'text-danger'} style={{ fontSize: 16, fontWeight: 800 }}>
              {walletBalance !== null ? (walletBalance / 1_000_000).toFixed(1) : '—'}
              <span className="text-xs font-medium text-muted" style={{ marginLeft: 4 }}>crédits</span>
            </div>
          </div>

          {/* Gamification Mini-Widget */}
          <div className="bg-secondary border rounded-md p-8 mb-8">
            <div className="flex-between mb-4">
              <div className="flex items-center gap-6">
                <div className="flex-center rounded-sm font-bold" style={{
                  width: 20, height: 20, fontSize: 10,
                  background: 'linear-gradient(135deg, #6366f1, #a855f7)', color: 'white',
                }}>
                  {gamLevel}
                </div>
                <span className="text-xs font-semibold">{LEVEL_TITLES[gamLevel] ?? 'Maître'}</span>
              </div>
              {gamStreak > 0 && (
                <span className="text-xs text-warning">🔥{gamStreak}j</span>
              )}
            </div>
            <div className="progress-bar" style={{ height: 3 }}>
              <div className="progress-bar-fill" style={{ width: `${xpPct}%`, background: 'linear-gradient(90deg, #6366f1, #a855f7)' }} />
            </div>
            <div className="text-muted mt-4" style={{ fontSize: 9, textAlign: 'right' }}>
              {gamXP}/{gamXPNext} XP
            </div>
          </div>

          {/* Theme Toggle */}
          <div className="flex-between mb-8">
            <span className="text-xs text-muted">Theme</span>
            <div className="theme-toggle">
              <button
                className={`theme-toggle-btn${theme === 'white' ? ' active' : ''}`}
                onClick={() => switchTheme('white')}
                title="Clair & espace"
                aria-label="Theme clair"
              >☀️</button>
              <button
                className={`theme-toggle-btn${theme === 'normal' ? ' active' : ''}`}
                onClick={() => switchTheme('normal')}
                title="Normal"
                aria-label="Theme normal"
              >🔲</button>
              <button
                className={`theme-toggle-btn${theme === 'dark' ? ' active' : ''}`}
                onClick={() => switchTheme('dark')}
                title="Sombre & compact"
                aria-label="Theme sombre"
              >🌙</button>
            </div>
          </div>

          {/* User Info */}
          <div style={{ padding: '4px 0' }}>
            <div className="text-sm font-semibold truncate">{session.displayName}</div>
            <div className="text-xs text-tertiary truncate">{session.email}</div>
          </div>
          <button
            onClick={() => { localStorage.removeItem('sarah_session'); window.location.href = '/login'; }}
            className="btn btn-ghost btn-xs w-full mt-4"
            style={{ justifyContent: 'flex-start' }}
          >
            Déconnexion
          </button>
        </div>
      </nav>

      {/* Client Content */}
      <div className="client-main-content">
        {/* Low credit banner */}
        {!lowCreditDismissed && walletBalance !== null && walletBalance < 50_000_000 && (
          <div className="flex-between p-8" style={{
            background: walletBalance < 10_000_000 ? '#ef444415' : '#f59e0b15',
            borderBottom: `1px solid ${walletBalance < 10_000_000 ? '#ef444444' : '#f59e0b44'}`,
          }}>
            <span className={`text-sm font-semibold ${walletBalance < 10_000_000 ? 'text-danger' : 'text-warning'}`}>
              {walletBalance < 10_000_000
                ? '⚠️ Crédits presque épuisés — Rechargez pour continuer à utiliser vos agents'
                : '💡 Solde de crédits bas — Pensez à recharger'}
            </span>
            <div className="flex items-center gap-8">
              <Link href="/client/account" className="text-sm text-accent font-semibold" style={{ textDecoration: 'none' }}>
                Recharger
              </Link>
              <button onClick={dismissLowCredit} className="text-muted pointer" aria-label="Fermer l'alerte credits" style={{
                fontSize: 16, background: 'none', border: 'none', padding: '0 4px',
              }}>×</button>
            </div>
          </div>
        )}

        <div className="page-container">
          {children}
        </div>
      </div>

      {/* Ctrl+K Search Modal */}
      {searchOpen && (
        <>
          <div onClick={() => setSearchOpen(false)} style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999,
          }} />
          <div style={{
            position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: 480, zIndex: 1000,
            background: 'var(--bg-elevated)', borderRadius: 'var(--radius-lg)',
            border: '1px solid var(--border-secondary)', boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border-primary)' }}>
              <input
                autoFocus
                type="text"
                placeholder="Rechercher une page..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredLinks.length > 0) {
                    window.location.href = filteredLinks[0].href;
                    setSearchOpen(false);
                  }
                }}
                style={{
                  width: '100%', fontSize: 15, border: 'none', outline: 'none',
                  background: 'transparent', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)',
                }}
              />
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {filteredLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-8 text-base"
                  style={{
                    padding: '8px 16px', textDecoration: 'none', color: 'var(--text-primary)',
                    borderBottom: '1px solid var(--border-primary)',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-hover)')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span className="text-lg">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              {filteredLinks.length === 0 && (
                <div className="p-16 text-md text-muted" style={{ textAlign: 'center' }}>
                  Aucun résultat
                </div>
              )}
            </div>
            <div className="text-xs text-muted" style={{ padding: '6px 16px', borderTop: '1px solid var(--border-primary)' }}>
              Entrée pour naviguer | Echap pour fermer | Ctrl+K pour ouvrir
            </div>
          </div>
        </>
      )}
    </div>
  );
}
