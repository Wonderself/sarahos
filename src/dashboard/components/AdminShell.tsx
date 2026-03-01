'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [systemStatus, setSystemStatus] = useState<'loading' | 'ok' | 'error'>('loading');

  // Close sidebar on navigation
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Check system health
  useEffect(() => {
    async function checkHealth() {
      try {
        const res = await fetch('/api/portal?path=/health', { cache: 'no-store' });
        setSystemStatus(res.ok ? 'ok' : 'error');
      } catch {
        setSystemStatus('error');
      }
    }
    checkHealth();
    const interval = setInterval(checkHealth, 60000);
    return () => clearInterval(interval);
  }, []);

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
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <img
            src="/images/logo.jpg"
            alt="SARAH OS"
            style={{ height: 32, borderRadius: 8 }}
            onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
          />
        </div>
      </div>

      {/* Sidebar Overlay */}
      <div
        className={`sidebar-overlay${sidebarOpen ? ' active' : ''}`}
        onClick={() => setSidebarOpen(false)}
      />

      {/* Sidebar */}
      <nav className={`sidebar${sidebarOpen ? ' sidebar-open' : ''}`}>
        <div className="sidebar-header">
          <div className="sidebar-logo">
            <img
              src="/images/logo.jpg"
              alt="SARAH OS"
              style={{ height: 36, borderRadius: 8 }}
              onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }}
            />
            <div>
              <div className="sidebar-logo-version">v0.10.0 — Phase 10</div>
            </div>
          </div>
        </div>

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
                </NavLink>
              ))}
            </div>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-status" style={{
            color: systemStatus === 'ok' ? '#22c55e' : systemStatus === 'error' ? '#ef4444' : 'var(--text-muted)',
          }}>
            <span className="status-dot" style={{
              background: systemStatus === 'ok' ? '#22c55e' : systemStatus === 'error' ? '#ef4444' : '#f59e0b',
              boxShadow: systemStatus === 'ok' ? '0 0 6px #22c55e88' : systemStatus === 'error' ? '0 0 6px #ef444488' : 'none',
            }} />
            <span>{systemStatus === 'ok' ? 'Système opérationnel' : systemStatus === 'error' ? 'Système indisponible' : 'Vérification...'}</span>
          </div>
          <div style={{ marginTop: 6, fontSize: 11 }}>
            <NavLink href="/login">
              <span className="nav-icon">&rarr;</span>
              Espace Client
            </NavLink>
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
