'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import {
  TEMPLATES, CATEGORIES, CATEGORY_COLORS, FEATURED_GRADIENTS, MARKETPLACE_STORAGE_KEY as STORAGE_KEY,
  type AgentTemplate, type Category, type SortMode,
} from '../../../lib/marketplace-data';
import { useIsMobile } from '../../../lib/use-media-query';
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import HelpBubble from '../../../components/HelpBubble';
import { CU, pageContainer, headerRow, emojiIcon, cardGrid, searchInput, tabBar } from '../../../lib/page-styles';

// ── Component ──

export default function MarketplacePage() {
  const isMobile = useIsMobile();
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
    <div className="client-page-scrollable" style={pageContainer(isMobile)}>
      {/* ── Page Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={emojiIcon(24)}>{PAGE_META.marketplace.emoji}</span>
          <div>
            <h1 style={CU.pageTitle}>{PAGE_META.marketplace.title}</h1>
            <p style={CU.pageSubtitle}>{PAGE_META.marketplace.subtitle}</p>
          </div>
          <HelpBubble text={PAGE_META.marketplace.helpText} />
        </div>
      </div>
      <PageExplanation pageId="marketplace" text={PAGE_META.marketplace?.helpText} />

      {/* ── Featured Section ── */}
      <div style={{ marginBottom: 40 }}>
        <h2 style={{ ...CU.sectionTitle, fontSize: 18, marginBottom: 16 }}>
          ⭐ Assistants vedettes
        </h2>
        <div style={{ display: 'grid', gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fit, minmax(300px, 1fr))', gap: 12 }}>
          {featuredAgents.map((agent) => (
            <div
              key={agent.id}
              style={{
                ...CU.cardHoverable,
                background: CU.bgSecondary,
                padding: 24,
                position: 'relative',
                overflow: 'hidden',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = CU.accentLight;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = CU.bgSecondary;
              }}
            >
              <div style={{ fontSize: 40, marginBottom: 12 }}>{agent.icon}</div>
              <h3 style={{ fontSize: isMobile ? 17 : 20, fontWeight: 700, color: CU.text, marginBottom: 6 }}>{agent.name}</h3>
              <p style={{ fontSize: isMobile ? 12 : 13, color: CU.textSecondary, marginBottom: 16, lineHeight: 1.5 }}>{agent.description}</p>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: CU.textMuted }}>
                  {agent.installs.toLocaleString('fr-FR')} installations
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleToggleInstall(agent.id);
                  }}
                  disabled={installing === agent.id}
                  style={{
                    ...(installed.has(agent.id) ? CU.btnGhost : CU.btnPrimary),
                    minHeight: isMobile ? 44 : 36,
                    cursor: installing === agent.id ? 'wait' : 'pointer',
                  }}
                >
                  {installing === agent.id ? '...' : installed.has(agent.id) ? <>✅ Installe</> : 'Installer'}
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
          <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: CU.textMuted }}>
            🔍
          </span>
          <input
            type="text"
            placeholder="Rechercher un assistant..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            style={{
              ...CU.input,
              padding: '0 16px 0 42px',
              height: 40,
            }}
            onFocus={(e) => (e.target.style.borderColor = CU.accent)}
            onBlur={(e) => (e.target.style.borderColor = CU.border)}
          />
        </div>

        {/* Category chips */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
          {CATEGORIES.map((cat) => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              style={category === cat
                ? { ...CU.btnPrimary, height: 32, padding: '0 16px', fontSize: 13 }
                : { ...CU.btnGhost, height: 32, padding: '0 16px', fontSize: 13, whiteSpace: 'nowrap' }
              }
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Sort + count */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: 13, color: CU.textMuted }}>
            {filtered.length} assistant{filtered.length > 1 ? 's' : ''} trouve{filtered.length > 1 ? 's' : ''}
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
                style={sort === s.key
                  ? { ...CU.btnPrimary, height: isMobile ? 40 : 28, padding: '0 12px', fontSize: 12 }
                  : { ...CU.btnGhost, height: isMobile ? 40 : 28, padding: '0 12px', fontSize: 12 }
                }
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
          gridTemplateColumns: isMobile ? '1fr' : 'repeat(auto-fill, minmax(320px, 1fr))',
          gap: 12,
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
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>🔍</div>
          <p style={CU.emptyTitle}>Aucun assistant ne correspond a votre recherche.</p>
          <button
            onClick={() => { setSearch(''); setCategory('Tous'); }}
            style={CU.btnGhost}
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
          borderRadius: 8,
          background: CU.bgSecondary,
          border: `1px solid ${CU.border}`,
          display: 'flex',
          justifyContent: 'space-around',
          flexWrap: 'wrap',
          gap: 16,
        }}
      >
        <StatItem label="Assistants disponibles" value={TEMPLATES.length.toString()} />
        <StatItem label="Assistants installes" value={installed.size.toString()} />
        <StatItem label="Categories" value={(CATEGORIES.length - 1).toString()} />
        <StatItem label="100% Gratuits" value={TEMPLATES.length.toString()} />
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
  const isMobile = useIsMobile();

  return (
    <div
      style={{
        ...CU.cardHoverable,
        padding: 20,
        cursor: 'default',
        display: 'flex',
        flexDirection: 'column',
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = CU.bgSecondary;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = CU.bg;
      }}
    >
      {/* Top row: icon + badges */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
        <span style={{ fontSize: 32 }}>{agent.icon}</span>
        <div style={{ display: 'flex', gap: 6 }}>
          {agent.badge === 'populaire' && (
            <span style={CU.badge}>📈 Populaire</span>
          )}
          {agent.badge === 'nouveau' && (
            <span style={CU.badge}>✨ Nouveau</span>
          )}
        </div>
      </div>

      {/* Name */}
      <h3 style={{ fontSize: 16, fontWeight: 600, color: CU.text, marginBottom: 4 }}>{agent.name}</h3>

      {/* Category + tier badges */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
        <span style={CU.badge}>{agent.category}</span>
        <span style={CU.badgeSuccess}>Gratuit</span>
      </div>

      {/* Description */}
      <p
        style={{
          fontSize: 13,
          color: CU.textSecondary,
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
        <span style={{ fontSize: 12, color: CU.textMuted }}>
          {agent.installs.toLocaleString('fr-FR')} installs
        </span>
        <button
          onClick={onToggle}
          disabled={isInstalling}
          style={{
            ...(isInstalled ? CU.btnGhost : CU.btnPrimary),
            minHeight: isMobile ? 44 : 36,
            cursor: isInstalling ? 'wait' : 'pointer',
          }}
        >
          {isInstalling ? '...' : isInstalled ? <>✅ Installe</> : 'Installer'}
        </button>
      </div>
    </div>
  );
}

function StatItem({ label, value }: { label: string; value: string }) {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={CU.statValue}>{value}</div>
      <div style={CU.statLabel}>{label}</div>
    </div>
  );
}
