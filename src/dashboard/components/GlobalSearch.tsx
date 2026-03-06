'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';

// ─── Static page index ────────────────────────────────────────────────────────

const ADMIN_PAGES = [
  { href: '/admin', label: 'Vue d\'ensemble', icon: 'home', section: 'Pages' },
  { href: '/admin/users', label: 'Utilisateurs', icon: 'group', section: 'Pages' },
  { href: '/admin/analytics', label: 'Analytics — Vue globale', icon: 'bar_chart', section: 'Pages' },
  { href: '/admin/analytics/studio', label: 'Analytics — Studio', icon: 'movie', section: 'Pages' },
  { href: '/admin/analytics/documents', label: 'Analytics — Documents', icon: 'description', section: 'Pages' },
  { href: '/admin/analytics/voice', label: 'Analytics — Voix & Visio', icon: 'mic', section: 'Pages' },
  { href: '/admin/billing', label: 'Facturation', icon: 'credit_card', section: 'Pages' },
  { href: '/admin/promo', label: 'Codes Promo', icon: 'confirmation_number', section: 'Pages' },
  { href: '/admin/repondeur', label: 'Répondeur', icon: 'call', section: 'Pages' },
  { href: '/admin/quotes', label: 'Devis & Entreprise', icon: 'business', section: 'Pages' },
  { href: '/system/agents', label: 'Agents IA', icon: 'smart_toy', section: 'Pages' },
  { href: '/system/approvals', label: 'Approbations', icon: 'check_circle', section: 'Pages' },
  { href: '/system/tasks', label: 'Tâches', icon: 'assignment', section: 'Pages' },
  { href: '/infra/health', label: 'Santé Système', icon: 'favorite', section: 'Pages' },
  { href: '/infra/avatar', label: 'Avatar & TTS', icon: 'theater_comedy', section: 'Pages' },
  { href: '/infra/metrics', label: 'Métriques', icon: 'trending_up', section: 'Pages' },
  { href: '/system/crons', label: 'Cron Jobs', icon: 'schedule', section: 'Pages' },
  { href: '/admin/referrals', label: 'Parrainages', icon: 'handshake', section: 'Pages' },
  { href: '/admin/setup', label: 'Setup & Onboarding', icon: 'check_circle', section: 'Pages' },
  { href: '/admin/security', label: 'Sécurité & 2FA', icon: 'lock', section: 'Pages' },
  { href: '/admin/tokens', label: 'Tokens & Tarifs', icon: 'lightbulb', section: 'Pages' },
  { href: '/admin/diagnostics', label: 'Diagnostics', icon: 'search', section: 'Pages' },
  { href: '/admin/roadmap', label: 'Roadmap', icon: 'map', section: 'Pages' },
  { href: '/admin/guide', label: 'Guide', icon: 'menu_book', section: 'Pages' },
  { href: '/client/dashboard', label: 'Espace Client', icon: 'link', section: 'Pages' },
];

interface SearchResult {
  href: string;
  label: string;
  icon: string;
  section: string;
  badge?: string;
}

const API = process.env['NEXT_PUBLIC_API_URL'] || 'http://localhost:3010';

function getToken() {
  try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').token ?? ''; } catch { return ''; }
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function GlobalSearch() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [userResults, setUserResults] = useState<SearchResult[]>([]);
  const [activeIdx, setActiveIdx] = useState(0);
  const [searching, setSearching] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  // Listen for Cmd+K event from AdminShell
  useEffect(() => {
    function onOpen() {
      setOpen(true);
      setQuery('');
      setResults([]);
      setActiveIdx(0);
    }
    document.addEventListener('fz:open-search', onOpen);
    return () => document.removeEventListener('fz:open-search', onOpen);
  }, []);

  // Focus input when opened
  useEffect(() => {
    if (open) {
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [open]);

  // Close on Escape
  useEffect(() => {
    if (!open) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') { setOpen(false); setQuery(''); }
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIdx(i => Math.min(i + 1, results.length + userResults.length - 1)); }
      if (e.key === 'ArrowUp') { e.preventDefault(); setActiveIdx(i => Math.max(i - 1, 0)); }
      if (e.key === 'Enter') { navigateToActive(); }
    }
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [open, results, userResults, activeIdx]);

  // Search pages (client-side)
  const searchPages = useCallback((q: string): SearchResult[] => {
    if (!q) return ADMIN_PAGES.slice(0, 8);
    const lower = q.toLowerCase();
    return ADMIN_PAGES.filter(p =>
      p.label.toLowerCase().includes(lower) || p.href.toLowerCase().includes(lower)
    ).slice(0, 5);
  }, []);

  // Search users (via API)
  const searchUsers = useCallback(async (q: string) => {
    if (!q || q.length < 2) { setUserResults([]); return; }
    setSearching(true);
    try {
      const res = await fetch(`${API}/admin/users?search=${encodeURIComponent(q)}&limit=5`, {
        headers: { Authorization: `Bearer ${getToken()}` },
      });
      if (!res.ok) return;
      const data = await res.json() as { users: Array<{ id: string; email: string; displayName: string; role: string; tier: string }> };
      setUserResults(data.users.map(u => ({
        href: `/admin/users/${u.id}`,
        label: u.displayName,
        icon: 'person',
        section: 'Utilisateurs',
        badge: `${u.tier} · ${u.role}`,
      })));
    } catch { /* */ }
    finally { setSearching(false); }
  }, []);

  useEffect(() => {
    const pageRes = searchPages(query);
    setResults(pageRes);
    setActiveIdx(0);
    const t = setTimeout(() => searchUsers(query), 300);
    return () => clearTimeout(t);
  }, [query, searchPages, searchUsers]);

  const allResults = [...results, ...userResults];

  function navigateToActive() {
    const item = allResults[activeIdx];
    if (item) {
      setOpen(false);
      setQuery('');
      router.push(item.href);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        onClick={() => { setOpen(false); setQuery(''); }}
        style={{
          position: 'fixed', inset: 0, zIndex: 10000,
          background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(2px)',
        }}
      />

      {/* Search modal */}
      <div style={{
        position: 'fixed', top: '15vh', left: '50%', transform: 'translateX(-50%)',
        width: '100%', maxWidth: 560, zIndex: 10001,
        background: 'var(--bg-primary)',
        borderRadius: 12,
        border: '1px solid var(--border-primary)',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)',
        overflow: 'hidden',
      }}>
        {/* Input */}
        <div style={{
          display: 'flex', alignItems: 'center', gap: 10,
          padding: '12px 16px',
          borderBottom: '1px solid var(--border-primary)',
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 16, flexShrink: 0 }}>search</span>
          <input
            ref={inputRef}
            type="text"
            placeholder="Rechercher une page, un utilisateur…"
            value={query}
            onChange={e => setQuery(e.target.value)}
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: 15, color: 'var(--text-primary)', fontFamily: 'inherit',
            }}
          />
          {searching && <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>…</span>}
          <span style={{
            fontSize: 10, padding: '2px 7px', borderRadius: 5,
            border: '1px solid var(--border-secondary)',
            color: 'var(--text-muted)', fontWeight: 600,
          }}>ESC</span>
        </div>

        {/* Results */}
        <div style={{ maxHeight: 360, overflowY: 'auto' }}>
          {allResults.length === 0 && query.length > 0 && !searching && (
            <div style={{ padding: '20px 16px', color: 'var(--text-muted)', fontSize: 13, textAlign: 'center' }}>
              Aucun résultat pour «&nbsp;{query}&nbsp;»
            </div>
          )}

          {/* Group by section */}
          {(['Pages', 'Utilisateurs'] as const).map(section => {
            const items = allResults.filter(r => r.section === section);
            if (items.length === 0) return null;
            const baseIdx = allResults.indexOf(items[0]);
            return (
              <div key={section}>
                <div style={{
                  padding: '6px 16px 4px',
                  fontSize: 10, fontWeight: 700, letterSpacing: '0.06em',
                  color: 'var(--text-muted)', textTransform: 'uppercase',
                }}>
                  {section}
                </div>
                {items.map((item, i) => {
                  const globalIdx = baseIdx + i;
                  const isActive = globalIdx === activeIdx;
                  return (
                    <div
                      key={item.href}
                      onClick={() => { router.push(item.href); setOpen(false); setQuery(''); }}
                      onMouseEnter={() => setActiveIdx(globalIdx)}
                      style={{
                        display: 'flex', alignItems: 'center', gap: 10,
                        padding: '9px 16px',
                        cursor: 'pointer',
                        background: isActive ? 'var(--bg-secondary)' : 'transparent',
                        borderLeft: isActive ? '3px solid var(--accent)' : '3px solid transparent',
                        transition: 'background 0.1s',
                      }}
                    >
                      <span className="material-symbols-rounded" style={{ fontSize: 15, flexShrink: 0 }}>{item.icon}</span>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: isActive ? 600 : 400 }}>{item.label}</div>
                        {item.badge && (
                          <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{item.badge}</div>
                        )}
                      </div>
                      <span style={{
                        fontSize: 10, color: 'var(--text-muted)',
                        overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', maxWidth: 120,
                      }}>
                        {item.href}
                      </span>
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        {/* Footer */}
        <div style={{
          display: 'flex', gap: 12, padding: '8px 16px',
          borderTop: '1px solid var(--border-primary)',
          fontSize: 10, color: 'var(--text-muted)',
        }}>
          <span><span className="kbd">↑↓</span> Naviguer</span>
          <span><span className="kbd">↵</span> Ouvrir</span>
          <span><span className="kbd">ESC</span> Fermer</span>
        </div>
      </div>
    </>
  );
}
