'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import {
  TEMPLATES, CATEGORIES, CATEGORY_COLORS, FEATURED_GRADIENTS, MARKETPLACE_STORAGE_KEY as STORAGE_KEY,
  type AgentTemplate, type Category, type SortMode,
} from '../../../lib/marketplace-data';

// ── Component ──

export default function MarketplacePage() {
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState<Category>('Tous');
  const [sort, setSort] = useState<SortMode>('populaire');
  const { data: installedArray, setData: setInstalledArray } = useUserData<string[]>('marketplace_installed', [], STORAGE_KEY);
  const installed = useMemo(() => new Set(installedArray), [installedArray]);
  const [installing, setInstalling] = useState<string | null>(null);

  function persistInstalled(newSet: Set<string>) {
    setInstalledArray([...newSet]);
  }

  // Install / uninstall toggle
  async function handleToggleInstall(agentId: string) {
    setInstalling(agentId);

    const newSet = new Set(installed);
    const isInstalling = !newSet.has(agentId);

    if (isInstalling) {
      newSet.add(agentId);
    } else {
      newSet.delete(agentId);
    }

    // Try backend call (don't fail if 404)
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      const token = session.token;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
      if (token) {
        await fetch(`${baseUrl}/marketplace/templates/${agentId}/${isInstalling ? 'install' : 'uninstall'}`, {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }).catch(() => {});
      }
    } catch {
      // Backend not available — that's fine
    }

    persistInstalled(newSet);
    setInstalling(null);
  }

  // Filtering & sorting
  const filtered = useMemo(() => {
    let list = [...TEMPLATES];

    // Category filter
    if (category !== 'Tous') {
      list = list.filter((t) => t.category === category);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (t) =>
          t.name.toLowerCase().includes(q) ||
          t.description.toLowerCase().includes(q) ||
          t.category.toLowerCase().includes(q),
      );
    }

    // Sort
    switch (sort) {
      case 'populaire':
        list.sort((a, b) => b.installs - a.installs);
        break;
      case 'nouveau':
        list.sort((a, b) => (b.badge === 'nouveau' ? 1 : 0) - (a.badge === 'nouveau' ? 1 : 0));
        break;
      case 'alphabetique':
        list.sort((a, b) => a.name.localeCompare(b.name, 'fr'));
        break;
    }

    return list;
  }, [search, category, sort]);

  const featuredAgents = TEMPLATES.filter((t) => t.featured).slice(0, 6);

  return (
    <div style={{ padding: '32px 24px', maxWidth: 1200, margin: '0 auto' }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 8 }}>
          {'\u{1F3EA}'} Marketplace des Agents
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: 15 }}>
          Explorez et installez des agents IA specialises pour automatiser vos taches quotidiennes.
        </p>
      </div>

      {/* ── Featured Section ── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 16 }}>
          {'\u2B50'} Agents vedettes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 16 }}>
          {featuredAgents.map((agent, idx) => (
            <div
              key={agent.id}
              style={{
                background: FEATURED_GRADIENTS[idx % FEATURED_GRADIENTS.length],
                borderRadius: 'var(--radius-lg)',
                padding: 24,
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                transition: 'transform 0.2s, box-shadow 0.2s',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 8px 30px rgba(0,0,0,0.2)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{agent.icon}</div>
              <h3 style={{ fontSize: 20, fontWeight: 700, marginBottom: 6 }}>{agent.name}</h3>
              <p style={{ fontSize: 13, opacity: 0.9, marginBottom: 16, lineHeight: 1.5 }}>{agent.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, opacity: 0.8 }}>
                  {agent.installs.toLocaleString('fr-FR')} installations
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleInstall(agent.id);
                  }}
                  disabled={installing === agent.id}
                  style={{
                    background: installed.has(agent.id) ? 'rgba(255,255,255,0.2)' : '#fff',
                    color: installed.has(agent.id) ? '#fff' : '#333',
                    border: 'none',
                    borderRadius: 'var(--radius-md)',
                    padding: '8px 20px',
                    fontSize: 13,
                    fontWeight: 600,
                    cursor: installing === agent.id ? 'wait' : 'pointer',
                    transition: 'all 0.2s',
                  }}
                >
                  {installing === agent.id ? '...' : installed.has(agent.id) ? '\u2705 Installe' : 'Installer'}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ── Search & Filters ── */}
      <div style={{ marginBottom: 24 }}>
        {/* Search bar */}
        <div style={{ position: 'relative', marginBottom: 16 }}>
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-muted)' }}>
            {'\u{1F50D}'}
          </span>
          <input
            type="text"
            placeholder="Rechercher un agent..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              width: '100%',
              padding: '12px 16px 12px 42px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-primary)',
              color: 'var(--text-primary)',
              fontSize: 14,
              outline: 'none',
              transition: 'border-color 0.2s',
            }}
            onFocus={(e) => (e.target.style.borderColor = 'var(--accent)')}
            onBlur={(e) => (e.target.style.borderColor = 'var(--border-primary)')}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={{
                padding: '6px 16px',
                borderRadius: 20,
                border: category === cat ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                background: category === cat ? 'var(--accent-muted)' : 'var(--bg-primary)',
                color: category === cat ? 'var(--accent)' : 'var(--text-secondary)',
                fontSize: 13,
                fontWeight: category === cat ? 600 : 400,
                cursor: 'pointer',
                transition: 'all 0.2s',
                whiteSpace: 'nowrap',
              }}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
            {filtered.length} agent{filtered.length > 1 ? 's' : ''} trouve{filtered.length > 1 ? 's' : ''}
          </span>
          <div style={{ display: 'flex', gap: 4 }}>
            {([
              { key: 'populaire' as SortMode, label: 'Populaire' },
              { key: 'nouveau' as SortMode, label: 'Nouveau' },
              { key: 'alphabetique' as SortMode, label: 'A-Z' },
            ]).map((s) => (
              <button
                key={s.key}
                onClick={() => setSort(s.key)}
                style={{
                  padding: '5px 12px',
                  borderRadius: 'var(--radius-sm)',
                  border: 'none',
                  background: sort === s.key ? 'var(--accent)' : 'var(--bg-secondary)',
                  color: sort === s.key ? '#fff' : 'var(--text-secondary)',
                  fontSize: 12,
                  fontWeight: 500,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                }}
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* ── Agent Grid ── */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 16,
        }}
      >
        {filtered.map((agent) => (
          <AgentCard
            key={agent.id}
            agent={agent}
            isInstalled={installed.has(agent.id)}
            isInstalling={installing === agent.id}
            onToggle={() => handleToggleInstall(agent.id)}
          />
        ))}
      </div>

      {filtered.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
          <div style={{ fontSize: 48, marginBottom: 12 }}>{'\u{1F50E}'}</div>
          <p style={{ fontSize: 15 }}>Aucun agent ne correspond a votre recherche.</p>
          <button
            onClick={() => { setSearch(''); setCategory('Tous'); }}
            style={{
              marginTop: 12,
              padding: '8px 20px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--border-primary)',
              background: 'var(--bg-primary)',
              color: 'var(--accent)',
              fontSize: 13,
              cursor: 'pointer',
            }}
          >
            Reinitialiser les filtres
          </button>
        </div>
      )}

      {/* ── Stats bar ── */}
      <div
        style={{
          marginTop: 40,
          padding: '16px 24px',
          borderRadius: 'var(--radius-md)',
          background: 'var(--bg-secondary)',
          border: '1px solid var(--border-primary)',
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <StatItem label="Agents disponibles" value={TEMPLATES.length.toString()} />
        <StatItem label="Agents installes" value={installed.size.toString()} />
        <StatItem label="Categories" value={(CATEGORIES.length - 1).toString()} />
        <StatItem label="Gratuits" value={TEMPLATES.filter((t) => t.tier === 'free').length.toString()} />
      </div>
    </div>
  );
}

// ── Sub-components ──

function AgentCard({
  agent,
  isInstalled,
  isInstalling,
  onToggle,
}: {
  agent: AgentTemplate;
  isInstalled: boolean;
  isInstalling: boolean;
  onToggle: () => void;
}) {
  const catColor = CATEGORY_COLORS[agent.category] || 'var(--accent)';

  return (
    <div
      style={{
        background: 'var(--bg-primary)',
        borderRadius: 'var(--radius-lg)',
        border: '1px solid var(--border-primary)',
        padding: 20,
        transition: 'transform 0.2s, box-shadow 0.2s',
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.transform = 'translateY(-3px)';
        e.currentTarget.style.boxShadow = 'var(--shadow-lg)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.transform = 'translateY(0)';
        e.currentTarget.style.boxShadow = 'none';
      }}
    >
      {/* Top row: icon + badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 32 }}>{agent.icon}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {agent.badge === 'populaire' && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 10,
                background: '#fef3c7',
                color: '#92400e',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {'\u{1F525}'} Populaire
            </span>
          )}
          {agent.badge === 'nouveau' && (
            <span
              style={{
                padding: '2px 8px',
                borderRadius: 10,
                background: '#dbeafe',
                color: '#1e40af',
                fontSize: 11,
                fontWeight: 600,
              }}
            >
              {'\u2728'} Nouveau
            </span>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{agent.name}</h3>

      {/* Category + tier badges */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <span
          style={{
            padding: '2px 10px',
            borderRadius: 10,
            background: catColor + '18',
            color: catColor,
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {agent.category}
        </span>
        <span
          style={{
            padding: '2px 10px',
            borderRadius: 10,
            background: agent.tier === 'free' ? 'var(--success-muted)' : 'var(--purple-muted)',
            color: agent.tier === 'free' ? 'var(--success)' : 'var(--purple)',
            fontSize: 11,
            fontWeight: 600,
          }}
        >
          {agent.tier === 'free' ? 'Gratuit' : 'Premium'}
        </span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 13,
          color: 'var(--text-secondary)',
          lineHeight: 1.5,
          marginBottom: 16,
          flex: 1,
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          overflow: 'hidden',
        }}
      >
        {agent.description}
      </p>

      {/* Footer: installs + button */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
          {agent.installs.toLocaleString('fr-FR')} installs
        </span>
        <button
          onClick={onToggle}
          disabled={isInstalling}
          style={{
            padding: '7px 18px',
            borderRadius: 'var(--radius-md)',
            border: isInstalled ? '1px solid var(--border-primary)' : 'none',
            background: isInstalled ? 'var(--bg-primary)' : 'var(--accent)',
            color: isInstalled ? 'var(--text-secondary)' : '#fff',
            fontSize: 13,
            fontWeight: 600,
            cursor: isInstalling ? 'wait' : 'pointer',
            transition: 'all 0.2s',
          }}
          onMouseEnter={(e) => {
            if (!isInstalled && !isInstalling) {
              e.currentTarget.style.background = 'var(--accent-hover)';
            }
          }}
          onMouseLeave={(e) => {
            if (!isInstalled && !isInstalling) {
              e.currentTarget.style.background = 'var(--accent)';
            }
          }}
        >
          {isInstalling ? '...' : isInstalled ? '\u2705 Installe' : 'Installer'}
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{value}</div>
      <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{label}</div>
    </div>
  );
}
