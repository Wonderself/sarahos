'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import NavLink from './NavLink';

interface NavSection {
  title: string | null;
  links: Array<{ href: string; label: string; icon: string }>;
}

export default function AdminShell({
  children,
  navSections,
}: {
  children: React.ReactNode;
  navSections: NavSection[];
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'loading' | 'ok' | 'error'>('loading');
  const [darkMode, setDarkMode] = useState(false);
  const [adminName, setAdminName] = useState('Admin');
  const [pendingApprovals, setPendingApprovals] = useState(0);
  const [expandedSections, setExpandedSections] = useState<Set<number>>(new Set([0]));

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Auto-expand the section containing the current path
  useEffect(() => {
    const idx = navSections.findIndex(s => s.links.some(l => pathname.startsWith(l.href)));
    if (idx >= 0) {
      setExpandedSections(prev => {
        const next = new Set(prev);
        next.add(idx);
        return next;
      });
    }
  }, [pathname, navSections]);

  // Load admin session info + role check
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') || '{}');
      if (!session.token || session.role !== 'admin') {
        window.location.href = '/login';
        return;
      }
      if (session.displayName) setAdminName(session.displayName);
      // Dark mode removed — always light
    } catch { /* */ }
  }, []);

  // Check system health
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/health', { cache: 'no-store' });
        setSystemStatus(res.ok ? 'ok' : 'error');
      } catch {
        setSystemStatus('error');
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

  // Poll pending approvals count
  useEffect(() => {
    async function fetchApprovals() {
      try {
        const session = JSON.parse(localStorage.getItem('fz_session') || '{}');
        if (!session.token) return;
        const res = await fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/actions', token: session.token, method: 'GET' }),
          cache: 'no-store',
        });
        if (res.ok) {
          const data = await res.json();
          const pending = Array.isArray(data) ? data.filter((a: { status?: string }) => a.status === 'pending').length : 0;
          setPendingApprovals(pending);
        }
      } catch { /* network error */ }
    }
    fetchApprovals();
    const interval = setInterval(fetchApprovals, 120_000);
    return () => clearInterval(interval);
  }, []);

  // Global keyboard shortcuts
  useEffect(() => {
    function onKeyDown(e: KeyboardEvent) {
      const isMac = navigator.platform.toUpperCase().includes('MAC');
      const modKey = isMac ? e.metaKey : e.ctrlKey;
      if (!modKey) return;

      if (e.key === 'k') {
        e.preventDefault();
        document.dispatchEvent(new CustomEvent('fz:open-search'));
      }
      if (e.key === 'u') {
        e.preventDefault();
        router.push('/admin/users');
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [router]);

  // toggleDarkMode removed — always light theme

  function logout() {
    localStorage.removeItem('fz_session');
    document.cookie = 'fz-token=; path=/; max-age=0';
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
      .catch(() => {})
      .finally(() => { window.location.href = '/login'; });
  }

  function toggleSection(index: number) {
    setExpandedSections(prev => {
      const next = new Set(prev);
      if (next.has(index)) next.delete(index);
      else next.add(index);
      return next;
    });
  }

  return (
    <div className="app-shell">
      {/* Mobile Top Bar */}
      <div className="mobile-topbar">
        <button
          className="mobile-menu-btn"
          onClick={() => setSidebarOpen(o => !o)}
          aria-label="Menu"
        >
          {sidebarOpen ? '\u2715' : '\u2630'}
        </button>
        <div className="mobile-topbar-center">
          <span className="text-sm font-bold">Admin</span>
          <span className={`admin-status-dot-mini ${systemStatus}`} />
        </div>
        <button
          className="mobile-topbar-action"
          onClick={() => document.dispatchEvent(new CustomEvent('fz:open-search'))}
          aria-label="Recherche"
        >
          🔍
        </button>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <nav className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        {/* Header */}
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}><div className="sidebar-logo-text fz-logo-text" style={{ letterSpacing: '-0.04em' }}>freenzy.io</div><span style={{ fontSize: 8, fontStyle: 'italic', color: 'var(--text-secondary)', opacity: 0.5 }}>Beta Test 1</span></div>
              <div className="sidebar-logo-version">Console Admin</div>
            </div>
          </div>
          <div className="sidebar-header-row">
            <div className={`status-badge status-badge-${systemStatus}`}>
              <span className="status-dot" />
              {systemStatus === 'ok' ? 'OK' : systemStatus === 'error' ? 'Erreur' : '...'}
            </div>
            {/* Dark mode toggle removed */}
          </div>
        </div>

        {/* Nav — collapsible sections */}
        <div className="sidebar-nav">
          {navSections.map((section, i) => (
            <div key={i} className="nav-section">
              {section.title ? (
                <button
                  className="nav-section-toggle"
                  onClick={() => toggleSection(i)}
                >
                  {section.title}
                  <span className={`nav-chevron ${expandedSections.has(i) ? 'open' : ''}`}>&#9656;</span>
                </button>
              ) : null}
              {(expandedSections.has(i) || !section.title) && (
                <div className="nav-section-links">
                  {section.links.map((link) => (
                    <NavLink key={link.href} href={link.href}>
                      <span className="nav-icon" style={{ fontSize: 18 }}>{link.icon}</span>
                      {link.label}
                      {link.href === '/system/approvals' && pendingApprovals > 0 && (
                        <span className="approval-badge">
                          {pendingApprovals}
                        </span>
                      )}
                    </NavLink>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          <div className="sidebar-shortcuts">
            <span className="kbd">⌘K</span>
            <span className="shortcut-label">Recherche</span>
            <span className="kbd" style={{ marginLeft: 6 }}>⌘U</span>
            <span className="shortcut-label">Users</span>
          </div>

          <NavLink href="/client/dashboard">
            <span className="nav-icon" style={{ fontSize: 18 }}>🔗</span>
            Espace Client
          </NavLink>
          <div className="sidebar-user-row">
            <div className="flex items-center gap-8">
              <div className="admin-avatar">
                {adminName.charAt(0).toUpperCase()}
              </div>
              <span className="sidebar-footer-text">
                {adminName}
              </span>
            </div>
            <button
              className="sidebar-footer-logout"
              onClick={logout}
              title="Deconnexion"
            >
              ⏻
            </button>
          </div>
        </div>
      </nav>

      {/* Main */}
      <div className="main-content">
        <div className="page-container">
          {children}
        </div>
      </div>

      {/* Bottom Tab Bar — mobile only */}
      <nav className="admin-bottom-tab-bar">
        <Link href="/admin" className={`admin-tab-item${pathname === '/admin' ? ' active' : ''}`}>
          <span className="admin-tab-icon">📊</span>
          <span>Accueil</span>
        </Link>
        <Link href="/admin/users" className={`admin-tab-item${pathname.startsWith('/admin/users') ? ' active' : ''}`}>
          <span className="admin-tab-icon">👥</span>
          <span>Users</span>
        </Link>
        <Link href="/infra/health" className={`admin-tab-item${pathname.startsWith('/infra') ? ' active' : ''}`}>
          <span className="admin-tab-icon">❤️</span>
          <span>Sante</span>
        </Link>
        <Link href="/admin/billing" className={`admin-tab-item${pathname.startsWith('/admin/billing') ? ' active' : ''}`}>
          <span className="admin-tab-icon">💳</span>
          <span>Billing</span>
        </Link>
        <button className="admin-tab-item" onClick={() => setSidebarOpen(o => !o)}>
          <span className="admin-tab-icon">☰</span>
          <span>Menu</span>
        </button>
      </nav>
    </div>
  );
}
