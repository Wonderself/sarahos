'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import Link from 'next/link';
import {
  DEFAULT_AGENTS, PERSONAL_AGENTS, loadAgentConfigs, getEffectiveAgent,
  isAgentAvailable, getRequiredPlan, getActiveAgentIds, toggleAgent,
  type AgentTypeId, type ResolvedAgent, type DefaultAgentDef,
} from '../../../lib/agent-config';
import {
  TEMPLATES as MARKETPLACE_TEMPLATES, CATEGORIES as MARKETPLACE_CATEGORIES,
  CATEGORY_COLORS, FEATURED_GRADIENTS, MARKETPLACE_STORAGE_KEY,
  type AgentTemplate, type Category, type SortMode,
} from '../../../lib/marketplace-data';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Mes agents persos (merged page)
//  Section 1: Mon equipe (enterprise agents toggle)
//  Section 2: Mes agents personnalises (personal by category)
//  Section 3: Recruter de nouveaux agents
// ═══════════════════════════════════════════════════

// ─── Personal agent categories ───

const PERSONAL_CATEGORIES = [
  { title: 'Finances Personnelles', icon: 'savings', ids: ['fz-budget', 'fz-negociateur', 'fz-impots'] as AgentTypeId[] },
  { title: 'Freelances & Carriere', icon: 'work', ids: ['fz-comptable', 'fz-chasseur', 'fz-portfolio', 'fz-cv'] as AgentTypeId[] },
  { title: 'Vie & Decisions', icon: 'psychology', ids: ['fz-contradicteur', 'fz-coach'] as AgentTypeId[] },
  { title: 'Creatif & Bien-etre', icon: 'palette', ids: ['fz-ecrivain', 'fz-cineaste', 'fz-deconnexion'] as AgentTypeId[] },
];

const PERSONAL_STORAGE_KEY = 'fz_personal_agents_active';

// ─── Helpers ───

interface TeamAgent {
  id: AgentTypeId;
  shortId: string;
  name: string;
  role: string;
  emoji: string;
  level: string;
  description: string;
  tagline: string;
  hiringPitch: string;
  capabilities: string[];
  color: string;
  isCustomized: boolean;
  isAvailable: boolean;
  requiredPlan: string;
  priceCredits: number;
  modes: { id: string; name: string; description: string; icon: string }[];
  materialIcon?: string;
}

const SHORT_ID_MAP: Record<string, string> = {
  'fz-repondeur': 'repondeur', 'fz-assistante': 'assistante',
  'fz-commercial': 'commercial', 'fz-marketing': 'marketing',
  'fz-rh': 'rh', 'fz-communication': 'communication',
  'fz-finance': 'cfo', 'fz-dev': 'cto',
  'fz-juridique': 'juridique', 'fz-dg': 'dg',
  'fz-video': 'video', 'fz-photo': 'photo',
};

function buildTeamAgents(tier: string): TeamAgent[] {
  const configs = loadAgentConfigs();
  return DEFAULT_AGENTS.map(def => {
    const resolved = getEffectiveAgent(def.id, configs);
    return {
      id: def.id,
      shortId: SHORT_ID_MAP[def.id] ?? def.id,
      name: resolved.name,
      role: resolved.role,
      emoji: resolved.emoji,
      level: def.level,
      description: def.description,
      tagline: def.tagline,
      hiringPitch: def.hiringPitch,
      capabilities: def.capabilities,
      color: resolved.color,
      isCustomized: resolved.isCustomized,
      isAvailable: isAgentAvailable(def.id, tier),
      requiredPlan: getRequiredPlan(def.id),
      priceCredits: def.priceCredits,
      modes: def.modes,
    };
  });
}

function loadActivePersonal(): string[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = localStorage.getItem(PERSONAL_STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* */ }
  return [];
}

function saveActivePersonal(ids: string[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PERSONAL_STORAGE_KEY, JSON.stringify(ids));
}

function getUserTier(): string {
  if (typeof window === 'undefined') return 'free';
  try {
    const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
    return session.tier ?? 'free';
  } catch { return 'free'; }
}

// ═══════════════════════════════════════════════════
//  Main page component
// ═══════════════════════════════════════════════════

export default function PersonalAgentsPage() {
  const [activeTab, setActiveTab] = useState<'equipe' | 'marketplace'>('equipe');
  const [activeBusinessIds, setActiveBusinessIds] = useState<AgentTypeId[]>([]);
  const { data: activePersonalIds, setData: setActivePersonalIds } = useUserData<string[]>('personal_agents_active', [], PERSONAL_STORAGE_KEY);
  const [teamAgents, setTeamAgents] = useState<TeamAgent[]>([]);
  const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({});
  const [searchQuery, setSearchQuery] = useState('');

  // Marketplace state
  const [mpSearch, setMpSearch] = useState('');
  const [mpCategory, setMpCategory] = useState<Category>('Tous');
  const [mpSort, setMpSort] = useState<SortMode>('populaire');
  const { data: mpInstalledArray, setData: setMpInstalledArray } = useUserData<string[]>('marketplace_installed', [], MARKETPLACE_STORAGE_KEY);
  const mpInstalled = useMemo(() => new Set(mpInstalledArray), [mpInstalledArray]);
  const [mpInstalling, setMpInstalling] = useState<string | null>(null);

  useEffect(() => {
    const tier = getUserTier();
    setActiveBusinessIds(getActiveAgentIds());
    // activePersonalIds loaded by useUserData hook
    setTeamAgents(buildTeamAgents(tier));
    // Start with all categories expanded
    const expanded: Record<string, boolean> = {};
    PERSONAL_CATEGORIES.forEach(c => { expanded[c.title] = true; });
    setExpandedCategories(expanded);
    // Marketplace installs loaded by useUserData hook
  }, []);

  function handleToggleBusiness(id: AgentTypeId) {
    const updated = toggleAgent(id);
    setActiveBusinessIds(updated);
  }

  function handleTogglePersonal(id: string) {
    setActivePersonalIds(prev => {
      const next = prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id];
      return next;
    });
  }

  function toggleCategory(title: string) {
    setExpandedCategories(prev => ({ ...prev, [title]: !prev[title] }));
  }

  // Marketplace helpers
  function persistMpInstalled(newSet: Set<string>) {
    setMpInstalledArray([...newSet]);
  }
  async function handleMpToggleInstall(agentId: string) {
    setMpInstalling(agentId);
    const newSet = new Set(mpInstalled);
    const isInstalling = !newSet.has(agentId);
    if (isInstalling) newSet.add(agentId); else newSet.delete(agentId);
    try {
      const session = JSON.parse(localStorage.getItem('fz_session') ?? '{}');
      const token = session.token;
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
      if (token) {
        await fetch(`${baseUrl}/marketplace/templates/${agentId}/${isInstalling ? 'install' : 'uninstall'}`, {
          method: 'POST', headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
        }).catch(() => {});
      }
    } catch { /* */ }
    persistMpInstalled(newSet);
    setMpInstalling(null);
  }
  const mpFiltered = useMemo(() => {
    let list = [...MARKETPLACE_TEMPLATES];
    if (mpCategory !== 'Tous') list = list.filter(t => t.category === mpCategory);
    if (mpSearch.trim()) {
      const q = mpSearch.toLowerCase();
      list = list.filter(t => t.name.toLowerCase().includes(q) || t.description.toLowerCase().includes(q) || t.category.toLowerCase().includes(q));
    }
    switch (mpSort) {
      case 'populaire': list.sort((a, b) => b.installs - a.installs); break;
      case 'nouveau': list.sort((a, b) => (b.badge === 'nouveau' ? 1 : 0) - (a.badge === 'nouveau' ? 1 : 0)); break;
      case 'alphabetique': list.sort((a, b) => a.name.localeCompare(b.name, 'fr')); break;
    }
    return list;
  }, [mpSearch, mpCategory, mpSort]);

  // Compute which enterprise agents are NOT active (for Section 3)
  const inactiveBusinessAgents = teamAgents.filter(a => !activeBusinessIds.includes(a.id));
  const activeBusinessAgents = teamAgents.filter(a => activeBusinessIds.includes(a.id));

  // Filter for search
  const filterMatch = (name: string, role: string) => {
    if (!searchQuery) return true;
    const q = searchQuery.toLowerCase();
    return name.toLowerCase().includes(q) || role.toLowerCase().includes(q);
  };

  const totalActive = activeBusinessIds.length + activePersonalIds.length;

  return (
    <div className="client-page-scrollable">
      {/* ─── Header ─── */}
      <div className="page-header">
        <div>
          <h1 className="page-title">Mes <span className="fz-logo-word">agents</span></h1>
          <p className="page-subtitle">
            Gérez votre équipe <span className="fz-logo-word">IA</span> et explorez le marketplace — {totalActive} agent{totalActive > 1 ? 's' : ''} actif{totalActive > 1 ? 's' : ''}
          </p>
        </div>
        <div className="page-actions flex gap-8 items-center">
          <div className="badge badge-primary" style={{ padding: '6px 14px', fontSize: 13 }}>
            {activeBusinessIds.length} business + {activePersonalIds.length} perso
          </div>
        </div>
      </div>

      {/* ─── Tabs ─── */}
      <div style={{
        display: 'flex', background: 'var(--bg-secondary)', borderRadius: 10,
        padding: 3, gap: 2, marginBottom: 24,
      }}>
        <button
          onClick={() => setActiveTab('equipe')}
          style={{
            flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
            fontSize: 14, fontWeight: activeTab === 'equipe' ? 600 : 400,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'equipe' ? 'var(--bg-primary)' : 'transparent',
            color: activeTab === 'equipe' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: activeTab === 'equipe' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>person</span> Mon équipe
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          style={{
            flex: 1, textAlign: 'center', padding: '10px 16px', borderRadius: 8,
            fontSize: 14, fontWeight: activeTab === 'marketplace' ? 600 : 400,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'marketplace' ? 'var(--bg-primary)' : 'transparent',
            color: activeTab === 'marketplace' ? 'var(--text-primary)' : 'var(--text-tertiary)',
            boxShadow: activeTab === 'marketplace' ? 'var(--shadow-sm)' : 'none',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 14 }}>storefront</span> Marketplace
          <span style={{
            marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: activeTab === 'marketplace' ? 'var(--accent)' : 'var(--bg-tertiary)',
            color: activeTab === 'marketplace' ? '#fff' : 'var(--text-muted)',
          }}>
            {MARKETPLACE_TEMPLATES.length}
          </span>
        </button>
      </div>

      {/* ═══════════════════════════ EQUIPE TAB ════════════════════════════ */}
      {activeTab === 'equipe' && (<>

      {/* ─── Search ─── */}
      <div className="mb-24">
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input"
          placeholder="Rechercher un agent par nom ou role..."
          style={{ width: '100%', maxWidth: 400 }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  SECTION 1: Mon equipe (active enterprise agents)  */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="mb-32">
        <div className="flex items-center gap-12 mb-16">
          <div className="flex-center rounded-md" style={{
            width: 36, height: 36, background: '#7c3aed15', fontSize: 18,
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>business</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Mon équipe</h2>
            <p className="text-sm text-muted">
              {activeBusinessAgents.length} agent{activeBusinessAgents.length > 1 ? 's' : ''} d&apos;entreprise actif{activeBusinessAgents.length > 1 ? 's' : ''} sur {teamAgents.length}
            </p>
          </div>
        </div>

        {activeBusinessAgents.length === 0 && (
          <div className="card p-24" style={{ textAlign: 'center' }}>
            <p className="text-md text-muted mb-8">Aucun agent d&apos;entreprise actif</p>
            <p className="text-sm text-tertiary">Recrutez des agents dans la section ci-dessous</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: 12 }}>
          {activeBusinessAgents
            .filter(a => filterMatch(a.name, a.role))
            .map(agent => (
              <BusinessAgentCard
                key={agent.id}
                agent={agent}
                isActive={true}
                onToggle={() => handleToggleBusiness(agent.id)}
              />
            ))}
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  SECTION 2: Mes agents personnalises               */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="mb-32">
        <div className="flex items-center gap-12 mb-16">
          <div className="flex-center rounded-md" style={{
            width: 36, height: 36, background: '#06b6d415', fontSize: 18,
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>person</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Mes agents personnalises</h2>
            <p className="text-sm text-muted">
              {activePersonalIds.length} agent{activePersonalIds.length > 1 ? 's' : ''} perso actif{activePersonalIds.length > 1 ? 's' : ''} sur {PERSONAL_AGENTS.length}
            </p>
          </div>
        </div>

        {PERSONAL_CATEGORIES.map(cat => {
          const agents = cat.ids
            .map(id => PERSONAL_AGENTS.find(a => a.id === id))
            .filter(Boolean) as DefaultAgentDef[];
          const filteredAgents = agents.filter(a => filterMatch(a.name, a.role));
          if (filteredAgents.length === 0 && searchQuery) return null;
          const isExpanded = expandedCategories[cat.title] ?? true;
          const activeInCat = agents.filter(a => activePersonalIds.includes(a.id)).length;

          return (
            <div key={cat.title} className="mb-16">
              {/* Category header (clickable) */}
              <button
                onClick={() => toggleCategory(cat.title)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 12px', borderRadius: 'var(--radius-md)',
                  background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', marginBottom: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-hover)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-secondary)'; }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>{cat.icon}</span>
                <span className="text-md font-semibold text-primary" style={{ flex: 1, textAlign: 'left' }}>{cat.title}</span>
                <span className="text-xs text-muted">{activeInCat}/{agents.length} actifs</span>
                <span style={{
                  fontSize: 12, color: 'var(--text-muted)',
                  transform: isExpanded ? 'rotate(180deg)' : 'rotate(0deg)',
                  transition: 'transform 0.2s',
                }}>
                  ▼
                </span>
              </button>

              {/* Category content */}
              {isExpanded && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, paddingLeft: 4 }}>
                  {filteredAgents.map(agent => {
                    const isActive = activePersonalIds.includes(agent.id);
                    return isActive ? (
                      <PersonalActiveCard key={agent.id} agent={agent} onToggle={() => handleTogglePersonal(agent.id)} />
                    ) : (
                      <PersonalInactiveCard key={agent.id} agent={agent} onToggle={() => handleTogglePersonal(agent.id)} />
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </section>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  SECTION 3: Recruter de nouveaux agents             */}
      {/* ═══════════════════════════════════════════════════ */}
      <section className="mb-32">
        <div className="flex items-center gap-12 mb-16">
          <div className="flex-center rounded-md" style={{
            width: 36, height: 36, background: '#22c55e15', fontSize: 18,
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 18 }}>rocket_launch</span>
          </div>
          <div>
            <h2 className="text-xl font-bold">Recruter de nouveaux agents</h2>
            <p className="text-sm text-muted">
              {inactiveBusinessAgents.length} agent{inactiveBusinessAgents.length > 1 ? 's' : ''} d&apos;entreprise disponible{inactiveBusinessAgents.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {inactiveBusinessAgents.length === 0 && (
          <div className="card p-24" style={{ textAlign: 'center' }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}><span className="material-symbols-rounded" style={{ fontSize: 32 }}>celebration</span></div>
            <p className="text-md font-semibold mb-4">Équipe au complet !</p>
            <p className="text-sm text-muted">
              Tous les agents d&apos;entreprise sont actifs dans votre équipe.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 12 }}>
          {inactiveBusinessAgents
            .filter(a => filterMatch(a.name, a.role))
            .map(agent => (
              <RecruitCard
                key={agent.id}
                agent={agent}
                onRecruit={() => handleToggleBusiness(agent.id)}
              />
            ))}
        </div>
      </section>

      {/* ─── Bottom CTA ─── */}
      <div className="card p-24" style={{
        background: 'linear-gradient(135deg, #7c3aed08, #06b6d408)',
        border: '1px solid var(--border-secondary)',
      }}>
        <div className="flex-between flex-wrap" style={{ gap: 16 }}>
          <div>
            <h3 className="text-lg font-bold mb-4">Vos agents sont prêts</h3>
            <p className="text-sm text-secondary">
              Discutez avec votre équipe IA ou personnalisez leurs comportements en profondeur.
            </p>
          </div>
          <div className="flex gap-12 flex-wrap">
            <Link href="/client/chat" className="btn btn-primary" style={{ textDecoration: 'none' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>chat</span> Discuter avec mes agents
            </Link>
            <Link href="/client/agents/customize" className="btn btn-secondary" style={{ textDecoration: 'none' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 14 }}>palette</span> Personnaliser mes agents
            </Link>
          </div>
        </div>
      </div>

      </>)}

      {/* ═══════════════════════════ MARKETPLACE TAB ════════════════════════════ */}
      {activeTab === 'marketplace' && (
        <div>
          {/* Search bar */}
          <div style={{ position: 'relative', marginBottom: 16 }}>
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: 'var(--text-muted)' }}>
              <span className="material-symbols-rounded" style={{ fontSize: 16 }}>search</span>
            </span>
            <input
              type="text"
              placeholder="Rechercher un agent..."
              value={mpSearch}
              onChange={e => setMpSearch(e.target.value)}
              style={{
                width: '100%', padding: '12px 16px 12px 42px', borderRadius: 'var(--radius-md)',
                border: '1px solid var(--border-primary)', background: 'var(--bg-primary)',
                color: 'var(--text-primary)', fontSize: 14, outline: 'none', transition: 'border-color 0.2s',
              }}
              onFocus={e => (e.target.style.borderColor = 'var(--accent)')}
              onBlur={e => (e.target.style.borderColor = 'var(--border-primary)')}
            />
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 16 }}>
            {MARKETPLACE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setMpCategory(cat)}
                style={{
                  padding: '6px 16px', borderRadius: 20,
                  border: mpCategory === cat ? '2px solid var(--accent)' : '1px solid var(--border-primary)',
                  background: mpCategory === cat ? 'var(--accent-muted)' : 'var(--bg-primary)',
                  color: mpCategory === cat ? 'var(--accent)' : 'var(--text-secondary)',
                  fontSize: 13, fontWeight: mpCategory === cat ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.2s', whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: 'var(--text-tertiary)' }}>
              {mpFiltered.length} agent{mpFiltered.length > 1 ? 's' : ''} trouve{mpFiltered.length > 1 ? 's' : ''}
            </span>
            <div style={{ display: 'flex', gap: 4 }}>
              {([
                { key: 'populaire' as SortMode, label: 'Populaire' },
                { key: 'nouveau' as SortMode, label: 'Nouveau' },
                { key: 'alphabetique' as SortMode, label: 'A-Z' },
              ]).map(s => (
                <button
                  key={s.key}
                  onClick={() => setMpSort(s.key)}
                  style={{
                    padding: '5px 12px', borderRadius: 'var(--radius-sm)', border: 'none',
                    background: mpSort === s.key ? 'var(--accent)' : 'var(--bg-secondary)',
                    color: mpSort === s.key ? '#fff' : 'var(--text-secondary)',
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.2s',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agent grid */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 16 }}>
            {mpFiltered.map(agent => {
              const catColor = CATEGORY_COLORS[agent.category] || 'var(--accent)';
              const isInstalled = mpInstalled.has(agent.id);
              const isInstallingThis = mpInstalling === agent.id;
              return (
                <div
                  key={agent.id}
                  style={{
                    background: 'var(--bg-primary)', borderRadius: 'var(--radius-lg)',
                    border: '1px solid var(--border-primary)', padding: 20,
                    transition: 'transform 0.2s, box-shadow 0.2s', display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = 'var(--shadow-lg)'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 32 }}>{agent.icon}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {agent.badge === 'populaire' && (
                        <span style={{ padding: '2px 8px', borderRadius: 10, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600 }}>
                          <span className="material-symbols-rounded" style={{ fontSize: 11 }}>local_fire_department</span> Populaire
                        </span>
                      )}
                      {agent.badge === 'nouveau' && (
                        <span style={{ padding: '2px 8px', borderRadius: 10, background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 600 }}>
                          <span className="material-symbols-rounded" style={{ fontSize: 11 }}>auto_awesome</span> Nouveau
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>{agent.name}</h3>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <span style={{ padding: '2px 10px', borderRadius: 10, background: catColor + '18', color: catColor, fontSize: 11, fontWeight: 600 }}>
                      {agent.category}
                    </span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 10,
                      background: agent.tier === 'free' ? 'rgba(22,163,74,0.1)' : 'rgba(147,51,234,0.1)',
                      color: agent.tier === 'free' ? 'var(--success)' : 'var(--purple)',
                      fontSize: 11, fontWeight: 600,
                    }}>
                      {agent.tier === 'free' ? 'Gratuit' : 'Premium'}
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                    {agent.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{agent.installs.toLocaleString('fr-FR')} installs</span>
                    <button
                      onClick={() => handleMpToggleInstall(agent.id)}
                      disabled={isInstallingThis}
                      style={{
                        padding: '7px 18px', borderRadius: 'var(--radius-md)',
                        border: isInstalled ? '1px solid var(--border-primary)' : 'none',
                        background: isInstalled ? 'var(--bg-primary)' : 'var(--accent)',
                        color: isInstalled ? 'var(--text-secondary)' : '#fff',
                        fontSize: 13, fontWeight: 600, cursor: isInstallingThis ? 'wait' : 'pointer',
                        transition: 'all 0.2s',
                      }}
                    >
                      {isInstallingThis ? '...' : isInstalled ? <><span className="material-symbols-rounded" style={{ fontSize: 13 }}>check_circle</span> Installe</> : 'Installer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {mpFiltered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}><span className="material-symbols-rounded" style={{ fontSize: 48 }}>search</span></div>
              <p style={{ fontSize: 15 }}>Aucun agent ne correspond a votre recherche.</p>
              <button
                onClick={() => { setMpSearch(''); setMpCategory('Tous'); }}
                style={{
                  marginTop: 12, padding: '8px 20px', borderRadius: 'var(--radius-md)',
                  border: '1px solid var(--border-primary)', background: 'var(--bg-primary)',
                  color: 'var(--accent)', fontSize: 13, cursor: 'pointer',
                }}
              >
                Reinitialiser les filtres
              </button>
            </div>
          )}

          {/* Stats bar */}
          <div style={{
            marginTop: 40, padding: '16px 24px', borderRadius: 'var(--radius-md)',
            background: 'var(--bg-secondary)', border: '1px solid var(--border-primary)',
            display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16,
          }}>
            {[
              { label: 'Agents disponibles', value: MARKETPLACE_TEMPLATES.length },
              { label: 'Agents installes', value: mpInstalled.size },
              { label: 'Categories', value: MARKETPLACE_CATEGORIES.length - 1 },
              { label: 'Gratuits', value: MARKETPLACE_TEMPLATES.filter(t => t.tier === 'free').length },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--accent)' }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 2 }}>{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

// ═══════════════════════════════════════════════════
//  Sub-components
// ═══════════════════════════════════════════════════

// ─── Business Agent Card (active, with toggle) ───

function BusinessAgentCard({ agent, isActive, onToggle }: {
  agent: TeamAgent; isActive: boolean; onToggle: () => void;
}) {
  return (
    <div
      className="bg-elevated border rounded-lg"
      style={{
        padding: '16px 20px',
        borderLeft: `4px solid ${agent.color}`,
        transition: 'all 0.2s ease',
        position: 'relative',
      }}
    >
      {/* Customized badge */}
      {agent.isCustomized && (
        <span style={{
          position: 'absolute', top: 8, right: 10,
          fontSize: 10, fontWeight: 700, color: 'var(--accent)',
          background: 'var(--accent-muted)', padding: '2px 8px',
          borderRadius: 10,
        }}>
          Personnalise
        </span>
      )}

      <div className="flex items-center gap-12 mb-8">
        <div className="flex-center rounded-md" style={{
          width: 42, height: 42, fontSize: 22,
          background: `${agent.color}15`,
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 22, color: agent.color || 'var(--accent)' }}>{agent.materialIcon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="font-bold text-base">{agent.name}</div>
          <div className="text-sm" style={{ color: agent.color }}>{agent.role}</div>
        </div>
      </div>

      <p className="text-sm text-secondary mb-8" style={{ lineHeight: 1.5 }}>{agent.description}</p>

      {/* Capabilities badges */}
      <div className="flex flex-wrap gap-4 mb-12">
        {agent.capabilities.slice(0, 5).map(cap => (
          <span
            key={cap}
            className="text-xs rounded-sm"
            style={{
              padding: '2px 8px',
              background: `${agent.color}12`,
              color: agent.color,
              border: `1px solid ${agent.color}30`,
            }}
          >
            {cap}
          </span>
        ))}
        {agent.capabilities.length > 5 && (
          <span className="text-xs text-muted">+{agent.capabilities.length - 5}</span>
        )}
      </div>

      {/* Footer: level + price + toggle */}
      <div className="flex-between items-center">
        <div className="flex items-center gap-8">
          <span className="text-xs text-muted">{agent.level}</span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted">{agent.priceCredits} cr/appel</span>
        </div>

        {/* Toggle switch */}
        <button
          onClick={onToggle}
          style={{
            position: 'relative', width: 40, height: 22, borderRadius: 11,
            background: isActive ? agent.color : 'var(--bg-tertiary)',
            border: 'none', cursor: 'pointer', transition: 'background 0.2s',
            flexShrink: 0,
          }}
          title={isActive ? 'Desactiver' : 'Activer'}
        >
          <span style={{
            position: 'absolute', top: 2, left: isActive ? 20 : 2,
            width: 18, height: 18, borderRadius: '50%',
            background: 'white', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>
    </div>
  );
}

// ─── Recruit Card (inactive enterprise agent) ───

function RecruitCard({ agent, onRecruit }: { agent: TeamAgent; onRecruit: () => void }) {
  return (
    <div
      className="bg-secondary border rounded-lg"
      style={{
        padding: '16px 20px',
        borderLeft: `4px solid ${agent.color}44`,
        opacity: 0.75,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.75'; }}
    >
      <div className="flex items-center gap-12 mb-8">
        <div className="flex-center rounded-md" style={{
          width: 42, height: 42, fontSize: 22,
          background: `${agent.color}10`,
        }}>
          <span className="material-symbols-rounded" style={{ fontSize: 22, color: agent.color || 'var(--accent)' }}>{agent.materialIcon}</span>
        </div>
        <div style={{ flex: 1 }}>
          <div className="font-semibold text-base">{agent.name}</div>
          <div className="text-sm text-muted">{agent.role}</div>
        </div>
      </div>

      <p className="text-sm text-muted mb-10" style={{ lineHeight: 1.5, fontStyle: 'italic' }}>
        &laquo; {agent.hiringPitch} &raquo;
      </p>

      {/* Capabilities preview */}
      <div className="flex flex-wrap gap-4 mb-12">
        {agent.capabilities.slice(0, 4).map(cap => (
          <span
            key={cap}
            className="text-xs rounded-sm"
            style={{
              padding: '2px 8px',
              background: 'var(--bg-tertiary)',
              color: 'var(--text-muted)',
              border: '1px solid var(--border-primary)',
            }}
          >
            {cap}
          </span>
        ))}
      </div>

      <div className="flex-between items-center">
        <div className="flex items-center gap-8">
          <span className="text-xs text-muted">{agent.level}</span>
          <span className="text-xs text-muted">·</span>
          <span className="text-xs text-muted">{agent.priceCredits} cr/appel</span>
        </div>
        <button
          onClick={onRecruit}
          className="btn btn-primary btn-sm"
          style={{ fontSize: 12, padding: '5px 14px' }}
        >
          + Recruter
        </button>
      </div>
    </div>
  );
}

// ─── Personal Active Card (expanded with details) ───

function PersonalActiveCard({ agent, onToggle }: { agent: DefaultAgentDef; onToggle: () => void }) {
  return (
    <div
      className="bg-elevated border rounded-lg"
      style={{
        padding: '16px 20px',
        borderLeft: `4px solid ${agent.color}`,
        transition: 'all 0.2s ease',
      }}
    >
      <div className="flex-between mb-8">
        <div className="flex items-center gap-12">
          <div
            className="flex-center rounded-md"
            style={{
              width: 40, height: 40, fontSize: 22,
              background: `${agent.color}15`,
            }}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 22, color: agent.color || 'var(--accent)' }}>{agent.materialIcon}</span>
          </div>
          <div>
            <div className="font-bold text-base">{agent.name}</div>
            <div className="text-sm" style={{ color: agent.color }}>{agent.role}</div>
          </div>
        </div>
        <div className="flex items-center gap-8">
          <span className="text-xs text-muted">{agent.priceCredits} cr/appel</span>
          <button
            onClick={onToggle}
            style={{
              position: 'relative', width: 40, height: 22, borderRadius: 11,
              background: agent.color, border: 'none', cursor: 'pointer',
              transition: 'background 0.2s', flexShrink: 0,
            }}
            title="Desactiver"
          >
            <span style={{
              position: 'absolute', top: 2, left: 20,
              width: 18, height: 18, borderRadius: '50%',
              background: 'white', transition: 'left 0.2s',
              boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
            }} />
          </button>
        </div>
      </div>

      <p className="text-sm text-secondary mb-8">{agent.description}</p>

      {/* Capabilities */}
      <div className="flex flex-wrap gap-4 mb-12">
        {agent.capabilities.map(cap => (
          <span
            key={cap}
            className="text-xs rounded-sm"
            style={{
              padding: '2px 8px',
              background: `${agent.color}12`,
              color: agent.color,
              border: `1px solid ${agent.color}30`,
            }}
          >
            {cap}
          </span>
        ))}
      </div>

      {/* Modes */}
      <div className="flex gap-8 flex-wrap">
        {agent.modes.map(mode => (
          <button
            key={mode.id}
            className="btn btn-ghost btn-xs"
            style={{ fontSize: 11, padding: '4px 10px' }}
            title={mode.description}
          >
            <span className="material-symbols-rounded" style={{ fontSize: 11, marginRight: 4 }}>{mode.icon}</span>
            {mode.name}
          </button>
        ))}
      </div>
    </div>
  );
}

// ─── Personal Inactive Card (compact, greyed) ───

function PersonalInactiveCard({ agent, onToggle }: { agent: DefaultAgentDef; onToggle: () => void }) {
  return (
    <div
      className="bg-secondary border rounded-md flex-between"
      style={{
        padding: '10px 16px',
        opacity: 0.6,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.85'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.6'; }}
    >
      <div className="flex items-center gap-12">
        <span className="material-symbols-rounded" style={{ fontSize: 20, color: agent.color || 'var(--accent)' }}>{agent.materialIcon}</span>
        <div>
          <span className="text-sm font-semibold">{agent.name}</span>
          <span className="text-xs text-muted" style={{ marginLeft: 8 }}>{agent.role}</span>
        </div>
      </div>
      <div className="flex items-center gap-8">
        <span className="text-xs text-muted">{agent.priceCredits} cr</span>
        <button
          onClick={onToggle}
          style={{
            position: 'relative', width: 40, height: 22, borderRadius: 11,
            background: 'var(--bg-tertiary)', border: 'none', cursor: 'pointer',
            transition: 'background 0.2s', flexShrink: 0,
          }}
          title="Activer"
        >
          <span style={{
            position: 'absolute', top: 2, left: 2,
            width: 18, height: 18, borderRadius: '50%',
            background: 'white', transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
          }} />
        </button>
      </div>
    </div>
  );
}
