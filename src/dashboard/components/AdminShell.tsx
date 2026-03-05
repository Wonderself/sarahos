'use client';

import { useState, useEffect } from 'react';
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

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Load admin session info
  useEffect(() => {
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') || '{}');
      if (session.displayName) setAdminName(session.displayName);
      const savedDark = localStorage.getItem('fz_dark_mode');
      if (savedDark === 'true') {
        setDarkMode(true);
        document.documentElement.setAttribute('data-theme', 'dark');
      }
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
        const res = await fetch('/api/health', { cache: 'no-store' });
        if (res.ok) {
          // Use a lightweight check — try to read from actions proxy
          // For now just keep badge at 0 until we have a dedicated endpoint
          setPendingApprovals(0);
        }
      } catch { /* */ }
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

      // Cmd+K → global search (placeholder — will be wired in Session 5)
      if (e.key === 'k') {
        e.preventDefault();
        // Dispatch a custom event that GlobalSearch can listen to
        document.dispatchEvent(new CustomEvent('fz:open-search'));
      }
      // Cmd+U → navigate to users
      if (e.key === 'u') {
        e.preventDefault();
        router.push('/admin/users');
      }
    }
    document.addEventListener('keydown', onKeyDown);
    return () => document.removeEventListener('keydown', onKeyDown);
  }, [router]);

  function toggleDarkMode() {
    const newValue = !darkMode;
    setDarkMode(newValue);
    if (newValue) {
      document.documentElement.setAttribute('data-theme', 'dark');
    } else {
      document.documentElement.removeAttribute('data-theme');
    }
    try { localStorage.setItem('fz_dark_mode', String(newValue)); } catch { /* */ }
    const stored = localStorage.getItem('fz_session');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/preferences', token: s.token, method: 'PATCH', data: { darkMode: newValue } }),
        }).catch(() => {});
      } catch { /* */ }
    }
  }

  function logout() {
    localStorage.removeItem('fz_session');
    document.cookie = 'fz-token=; path=/; max-age=0';
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
      .catch(() => {})
      .finally(() => { window.location.href = '/login'; });
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
          {sidebarOpen ? '✕' : '☰'}
        </button>
        <div className="flex items-center gap-8">
          <img
            src="/images/logo.jpg"
            alt="Freenzy.io"
            style={{ height: 28, borderRadius: 6 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
          <span className="text-sm font-bold">Admin</span>
        </div>
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
            <img
              src="/images/logo.jpg"
              alt="Freenzy.io"
              style={{ height: 32, borderRadius: 8 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <div className="sidebar-logo-text">FREENZY.IO</div>
              <div className="sidebar-logo-version">Console Admin</div>
            </div>
          </div>
          <div className="sidebar-header-row">
            {/* System status badge */}
            <div className={`status-badge status-badge-${systemStatus}`}>
              <span className="status-dot" />
              {systemStatus === 'ok' ? 'Opérationnel' : systemStatus === 'error' ? 'Erreur' : '…'}
            </div>
            {/* Dark mode toggle */}
            <button
              className="dark-mode-toggle"
              onClick={toggleDarkMode}
              title={darkMode ? 'Mode clair' : 'Mode sombre'}
            >
              {darkMode ? '☀️' : '🌙'}
            </button>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-nav">
          {navSections.map((section, i) => (
            <div key={i} className="nav-section">
              {section.title && (
                <div className="nav-section-title">{section.title}</div>
              )}
              {section.links.map((link) => (
                <NavLink key={link.href} href={link.href}>
                  <span className="nav-icon">{link.icon}</span>
                  {link.label}
                  {/* Badge for pending approvals */}
                  {link.href === '/system/approvals' && pendingApprovals > 0 && (
                    <span className="approval-badge">
                      {pendingApprovals}
                    </span>
                  )}
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="sidebar-footer">
          {/* Keyboard shortcuts hint */}
          <div className="sidebar-shortcuts">
            <span className="kbd">⌘K</span>
            <span className="shortcut-label">Recherche</span>
            <span className="kbd" style={{ marginLeft: 6 }}>⌘U</span>
            <span className="shortcut-label">Users</span>
          </div>

          {/* Client space link */}
          <NavLink href="/client/dashboard">
            <span className="nav-icon">🔗</span>
            Espace Client
          </NavLink>
          {/* Admin user + logout */}
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
              title="Déconnexion"
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
    </div>
  );
}
