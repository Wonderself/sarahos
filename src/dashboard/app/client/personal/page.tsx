'use client';

import { useState, useEffect, useMemo } from 'react';
import { useUserData } from '../../../lib/use-user-data';
import { useIsMobile } from '../../../lib/use-media-query';
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
import { PAGE_META } from '../../../lib/emoji-map';
import PageExplanation from '../../../components/PageExplanation';
import HelpBubble from '../../../components/HelpBubble';

// ═══════════════════════════════════════════════════
//  Freenzy.io — Mes agents persos (merged page)
//  Section 1: Mon equipe (enterprise agents toggle)
//  Section 2: Mes assistants personnalises (personal by category)
//  Section 3: Recruter de nouveaux assistants
// ═══════════════════════════════════════════════════

// ─── ClickUp-style design tokens ─────────────────────────────────────────────

const CU = {
  card: {
    background: '#fff',
    border: '1px solid #E5E5E5' as const,
    borderRadius: 8,
  },
  text: '#1A1A1A',
  textSecondary: '#6B6B6B',
  textMuted: '#9B9B9B',
  accent: '#1A1A1A',
  border: '#E5E5E5',
  bg: '#fff',
  bgSecondary: '#F7F7F7',
};

// ─── Person emoji overrides (replace generic object emojis with person emojis) ───
const PERSON_EMOJIS: Record<string, string> = {
  // Business agents
  'fz-repondeur': '👩‍💼', 'fz-assistante': '👩‍💼', 'fz-commercial': '🤵',
  'fz-marketing': '👩‍💻', 'fz-rh': '👩‍💼', 'fz-communication': '🗣️',
  'fz-finance': '🧑‍💼', 'fz-dev': '👨‍💻', 'fz-juridique': '👨‍⚖️',
  'fz-dg': '👔', 'fz-video': '🎬', 'fz-photo': '📸',
  'fz-quality': '👷', 'fz-operations': '🧑‍🔧', 'fz-strategy': '🧙',
  'fz-formation': '👨‍🏫', 'fz-innovation': '🧑‍🔬', 'fz-international': '🌍',
  // Personal agents
  'fz-budget': '👩‍🏫', 'fz-negociateur': '🤵', 'fz-impots': '🧑‍💼',
  'fz-comptable': '🧑‍💼', 'fz-chasseur': '🕵️', 'fz-portfolio': '👨‍🎨',
  'fz-cv': '👨‍🎓', 'fz-contradicteur': '🧑‍⚖️', 'fz-coach': '🧑‍🦱',
  'fz-ecrivain': '👨‍🎓', 'fz-cineaste': '🎬', 'fz-deconnexion': '🧘',
};

function getPersonEmoji(agentId: string, fallback: string): string {
  return PERSON_EMOJIS[agentId] || fallback;
}

// ─── Personal agent categories ───

const PERSONAL_CATEGORIES = [
  { title: 'Finances Personnelles', icon: '💰', ids: ['fz-budget', 'fz-negociateur', 'fz-impots'] as AgentTypeId[] },
  { title: 'Freelances & Carriere', icon: '💼', ids: ['fz-comptable', 'fz-chasseur', 'fz-portfolio', 'fz-cv'] as AgentTypeId[] },
  { title: 'Vie & Decisions', icon: '🧠', ids: ['fz-contradicteur', 'fz-coach'] as AgentTypeId[] },
  { title: 'Creatif & Bien-etre', icon: '🎨', ids: ['fz-ecrivain', 'fz-cineaste', 'fz-deconnexion'] as AgentTypeId[] },
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
  const isMobile = useIsMobile();
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
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12, flexWrap: 'nowrap' }}>
        <span style={{ fontSize: 20 }}>{PAGE_META.personal.emoji}</span>
        <div>
          <h1 style={{ fontSize: 16, fontWeight: 600, color: CU.text, margin: 0 }}>{PAGE_META.personal.title}</h1>
          <p style={{ fontSize: 12, color: CU.textMuted, margin: '2px 0 0' }}>— {totalActive} actifs · {activeBusinessIds.length} business + {activePersonalIds.length} perso</p>
        </div>
        <HelpBubble text={PAGE_META.personal.helpText} />
      </div>
      <PageExplanation pageId="personal" text={PAGE_META.personal?.helpText} />

      {/* ─── Tabs ─── */}
      <div style={{
        display: 'flex', background: CU.bgSecondary, borderRadius: 8,
        padding: 3, gap: 2, marginBottom: 24,
      }}>
        <button
          onClick={() => setActiveTab('equipe')}
          style={{
            flex: 1, textAlign: 'center', height: 36, padding: isMobile ? '0 8px' : '0 16px', borderRadius: 6,
            fontSize: isMobile ? 12 : 13, fontWeight: activeTab === 'equipe' ? 600 : 400,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'equipe' ? CU.bg : 'transparent',
            color: activeTab === 'equipe' ? CU.text : CU.textMuted,
            boxShadow: activeTab === 'equipe' ? 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))' : 'none',
          }}
        >
          👥 Mon équipe
        </button>
        <button
          onClick={() => setActiveTab('marketplace')}
          style={{
            flex: 1, textAlign: 'center', height: 36, padding: isMobile ? '0 8px' : '0 16px', borderRadius: 6,
            fontSize: isMobile ? 12 : 13, fontWeight: activeTab === 'marketplace' ? 600 : 400,
            border: 'none', cursor: 'pointer', transition: 'all 0.15s',
            background: activeTab === 'marketplace' ? CU.bg : 'transparent',
            color: activeTab === 'marketplace' ? CU.text : CU.textMuted,
            boxShadow: activeTab === 'marketplace' ? 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))' : 'none',
          }}
        >
          🏪 Marketplace
          <span style={{
            marginLeft: 8, fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 10,
            background: activeTab === 'marketplace' ? CU.accent : CU.bgSecondary,
            color: activeTab === 'marketplace' ? '#fff' : CU.textMuted,
          }}>
            {MARKETPLACE_TEMPLATES.length}
          </span>
        </button>
      </div>

      {/* ═══════════════════════════ EQUIPE TAB ════════════════════════════ */}
      {activeTab === 'equipe' && (<>

      {/* ─── Search ─── */}
      <div style={{ marginBottom: 24 }}>
        <input
          value={searchQuery}
          onChange={e => setSearchQuery(e.target.value)}
          className="input"
          placeholder="🔍 Rechercher un assistant par nom ou role..."
          style={{ width: '100%', maxWidth: isMobile ? '100%' : 400, borderRadius: 6, fontSize: 13, height: 36 }}
        />
      </div>

      {/* ═══════════════════════════════════════════════════ */}
      {/*  SECTION 1: Mon equipe (active enterprise agents)  */}
      {/* ═══════════════════════════════════════════════════ */}
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, background: 'rgba(0,0,0,0.04)', fontSize: 18,
          }}>
            🏢
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: CU.text, margin: 0 }}>Mon équipe</h2>
            <p style={{ fontSize: 12, color: CU.textMuted, margin: '2px 0 0' }}>
              {activeBusinessAgents.length} assistant{activeBusinessAgents.length > 1 ? 's' : ''} d&apos;entreprise actif{activeBusinessAgents.length > 1 ? 's' : ''} sur {teamAgents.length}
            </p>
          </div>
        </div>

        {activeBusinessAgents.length === 0 && (
          <div style={{ ...CU.card, padding: 24, textAlign: 'center' as const }}>
            <p style={{ fontSize: 14, color: CU.textMuted, marginBottom: 8 }}>Aucun assistant d&apos;entreprise actif</p>
            <p style={{ fontSize: 12, color: CU.textMuted }}>Recrutez des assistants dans la section ci-dessous</p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '260px' : '340px'}, 1fr))`, gap: 12 }}>
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
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, background: 'rgba(0,0,0,0.04)', fontSize: 18,
          }}>
            👥
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: CU.text, margin: 0 }}>Mes assistants personnalises</h2>
            <p style={{ fontSize: 12, color: CU.textMuted, margin: '2px 0 0' }}>
              {activePersonalIds.length} assistant{activePersonalIds.length > 1 ? 's' : ''} perso actif{activePersonalIds.length > 1 ? 's' : ''} sur {PERSONAL_AGENTS.length}
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
            <div key={cat.title} style={{ marginBottom: 16 }}>
              {/* Category header (clickable) */}
              <button
                onClick={() => toggleCategory(cat.title)}
                style={{
                  display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                  padding: '8px 12px', borderRadius: 8,
                  background: CU.bgSecondary, border: 'none',
                  boxShadow: 'none',
                  cursor: 'pointer', fontFamily: 'var(--font-sans)', marginBottom: 8,
                  transition: 'background 0.15s',
                }}
                onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.background = 'var(--fz-bg-hover, #F1F5F9)'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.background = CU.bgSecondary; }}
              >
                {cat.icon}
                <span style={{ flex: 1, textAlign: 'left', fontSize: 14, fontWeight: 600, color: CU.text }}>{cat.title}</span>
                <span style={{ fontSize: 12, color: CU.textMuted }}>{activeInCat}/{agents.length} actifs</span>
                <span style={{
                  fontSize: 12, color: CU.textMuted,
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
      <section style={{ marginBottom: 32 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 16 }}>
          <div style={{
            width: 36, height: 36, display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderRadius: 8, background: 'rgba(0,0,0,0.04)', fontSize: 18,
          }}>
            🚀
          </div>
          <div>
            <h2 style={{ fontSize: 16, fontWeight: 600, color: CU.text, margin: 0 }}>Recruter de nouveaux assistants</h2>
            <p style={{ fontSize: 12, color: CU.textMuted, margin: '2px 0 0' }}>
              {inactiveBusinessAgents.length} assistant{inactiveBusinessAgents.length > 1 ? 's' : ''} d&apos;entreprise disponible{inactiveBusinessAgents.length > 1 ? 's' : ''}
            </p>
          </div>
        </div>

        {inactiveBusinessAgents.length === 0 && (
          <div style={{ ...CU.card, padding: 24, textAlign: 'center' as const }}>
            <div style={{ fontSize: 32, marginBottom: 8 }}>🎉</div>
            <p style={{ fontSize: 14, fontWeight: 600, color: CU.text, marginBottom: 4 }}>Équipe au complet !</p>
            <p style={{ fontSize: 12, color: CU.textMuted }}>
              Tous les assistants d&apos;entreprise sont actifs dans votre équipe.
            </p>
          </div>
        )}

        <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '260px' : '320px'}, 1fr))`, gap: 12 }}>
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
      <div style={{
        ...CU.card,
        padding: 24,
        background: '#F7F7F7',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
          <div>
            <h3 style={{ fontSize: 16, fontWeight: 600, color: CU.text, marginBottom: 4 }}>Vos assistants sont prêts</h3>
            <p style={{ fontSize: 13, color: CU.textSecondary }}>
              Discutez avec votre équipe IA ou personnalisez leurs comportements en profondeur.
            </p>
          </div>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/client/chat" style={{
              textDecoration: 'none', height: 36, padding: '0 16px', borderRadius: 6,
              fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
              background: CU.accent, color: '#fff', border: 'none',
            }}>
              💬 Discuter avec mes assistants
            </Link>
            <Link href="/client/agents/customize" style={{
              textDecoration: 'none', height: 36, padding: '0 16px', borderRadius: 6,
              fontSize: 13, fontWeight: 500, display: 'inline-flex', alignItems: 'center',
              background: CU.bgSecondary, color: CU.text,
              border: `1px solid ${CU.border}`,
            }}>
              🎨 Personnaliser mes assistants
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
            <span style={{ position: 'absolute', left: 14, top: '50%', transform: 'translateY(-50%)', fontSize: 16, color: CU.textMuted }}>
              🔍
            </span>
            <input
              type="text"
              placeholder="Rechercher un assistant..."
              value={mpSearch}
              onChange={e => setMpSearch(e.target.value)}
              style={{
                width: '100%', height: 40, padding: '0 16px 0 42px', borderRadius: 8,
                border: `1px solid ${CU.border}`, background: CU.bg,
                color: CU.text, fontSize: 13, outline: 'none', transition: 'border-color 0.2s',
                boxShadow: 'none',
              }}
              onFocus={e => (e.target.style.borderColor = CU.accent)}
              onBlur={e => (e.target.style.borderColor = CU.border)}
            />
          </div>

          {/* Category chips */}
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 16 }}>
            {MARKETPLACE_CATEGORIES.map(cat => (
              <button
                key={cat}
                onClick={() => setMpCategory(cat)}
                style={{
                  height: 32, padding: '0 14px', borderRadius: 6,
                  border: mpCategory === cat ? `1.5px solid ${CU.accent}` : `1px solid ${CU.border}`,
                  background: mpCategory === cat ? CU.accent + '10' : CU.bg,
                  color: mpCategory === cat ? CU.accent : CU.textSecondary,
                  fontSize: 13, fontWeight: mpCategory === cat ? 600 : 400,
                  cursor: 'pointer', transition: 'all 0.15s', whiteSpace: 'nowrap',
                }}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Sort + count */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
            <span style={{ fontSize: 13, color: CU.textMuted }}>
              {mpFiltered.length} assistant{mpFiltered.length > 1 ? 's' : ''} trouve{mpFiltered.length > 1 ? 's' : ''}
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
                    height: 30, padding: '0 12px', borderRadius: 6, border: 'none',
                    background: mpSort === s.key ? CU.accent : CU.bgSecondary,
                    color: mpSort === s.key ? '#fff' : CU.textSecondary,
                    fontSize: 12, fontWeight: 500, cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </div>

          {/* Agent grid */}
          <div style={{ display: 'grid', gridTemplateColumns: `repeat(auto-fill, minmax(${isMobile ? '260px' : '320px'}, 1fr))`, gap: 12 }}>
            {mpFiltered.map(agent => {
              const catColor = CATEGORY_COLORS[agent.category] || CU.accent;
              const isInstalled = mpInstalled.has(agent.id);
              const isInstallingThis = mpInstalling === agent.id;
              return (
                <div
                  key={agent.id}
                  style={{
                    ...CU.card,
                    padding: 20, transition: 'transform 0.2s, box-shadow 0.2s',
                    display: 'flex', flexDirection: 'column',
                  }}
                  onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'none'; }}
                  onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'var(--fz-shadow-card, 0 1px 3px rgba(0,0,0,0.04))'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 12 }}>
                    <span style={{ fontSize: 32 }}>{agent.icon}</span>
                    <div style={{ display: 'flex', gap: 6 }}>
                      {agent.badge === 'populaire' && (
                        <span style={{ padding: '2px 8px', borderRadius: 6, background: '#fef3c7', color: '#92400e', fontSize: 11, fontWeight: 600 }}>
                          🔥 Populaire
                        </span>
                      )}
                      {agent.badge === 'nouveau' && (
                        <span style={{ padding: '2px 8px', borderRadius: 6, background: '#dbeafe', color: '#1e40af', fontSize: 11, fontWeight: 600 }}>
                          ✨ Nouveau
                        </span>
                      )}
                    </div>
                  </div>
                  <h3 style={{ fontSize: 14, fontWeight: 600, color: CU.text, marginBottom: 4 }}>{agent.name}</h3>
                  <div style={{ display: 'flex', gap: 6, marginBottom: 10 }}>
                    <span style={{ padding: '2px 10px', borderRadius: 6, background: catColor + '18', color: catColor, fontSize: 11, fontWeight: 600 }}>
                      {agent.category}
                    </span>
                    <span style={{
                      padding: '2px 10px', borderRadius: 6,
                      background: agent.tier === 'free' ? 'rgba(22,163,74,0.1)' : 'rgba(147,51,234,0.1)',
                      color: agent.tier === 'free' ? 'var(--success)' : 'var(--purple)',
                      fontSize: 11, fontWeight: 600,
                    }}>
                      {agent.tier === 'free' ? 'Gratuit' : 'Premium'}
                    </span>
                  </div>
                  <p style={{ fontSize: 12, color: CU.textMuted, lineHeight: 1.5, marginBottom: 16, flex: 1 }}>
                    {agent.description}
                  </p>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 12, color: CU.textMuted }}>{agent.installs.toLocaleString('fr-FR')} installs</span>
                    <button
                      onClick={() => handleMpToggleInstall(agent.id)}
                      disabled={isInstallingThis}
                      style={{
                        height: 36, padding: '0 16px', borderRadius: 6,
                        border: isInstalled ? `1px solid ${CU.border}` : 'none',
                        background: isInstalled ? CU.bg : CU.accent,
                        color: isInstalled ? CU.textSecondary : '#fff',
                        fontSize: 13, fontWeight: 500, cursor: isInstallingThis ? 'wait' : 'pointer',
                        transition: 'all 0.15s',
                      }}
                    >
                      {isInstallingThis ? '...' : isInstalled ? <>✅ Installe</> : 'Installer'}
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {mpFiltered.length === 0 && (
            <div style={{ textAlign: 'center', padding: '60px 20px', color: CU.textMuted }}>
              <div style={{ fontSize: 48, marginBottom: 12 }}>🔍</div>
              <p style={{ fontSize: 14 }}>Aucun assistant ne correspond a votre recherche.</p>
              <button
                onClick={() => { setMpSearch(''); setMpCategory('Tous'); }}
                style={{
                  marginTop: 12, height: 36, padding: '0 20px', borderRadius: 6,
                  border: 'none', boxShadow: 'none',
                  background: CU.bg, color: CU.accent, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Reinitialiser les filtres
              </button>
            </div>
          )}

          {/* Stats bar */}
          <div style={{
            marginTop: 40, padding: '16px 24px', borderRadius: 8,
            background: CU.bgSecondary, border: 'none',
            boxShadow: 'none',
            display: 'flex', justifyContent: 'space-around', flexWrap: 'wrap', gap: 16,
          }}>
            {[
              { label: 'Assistants disponibles', value: MARKETPLACE_TEMPLATES.length, icon: '📦' },
              { label: 'Assistants installes', value: mpInstalled.size, icon: '✅' },
              { label: 'Categories', value: MARKETPLACE_CATEGORIES.length - 1, icon: '📂' },
              { label: 'Gratuits', value: MARKETPLACE_TEMPLATES.filter(t => t.tier === 'free').length, icon: '🎁' },
            ].map(stat => (
              <div key={stat.label} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 14, marginBottom: 2 }}>{stat.icon}</div>
                <div style={{ fontSize: 20, fontWeight: 700, color: CU.accent }}>{stat.value}</div>
                <div style={{ fontSize: 12, color: CU.textMuted, marginTop: 2 }}>{stat.label}</div>
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
      style={{
        ...CU.card,
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
          fontSize: 10, fontWeight: 600, color: CU.accent,
          background: CU.accent + '15', padding: '2px 8px',
          borderRadius: 6,
        }}>
          Personnalise
        </span>
      )}

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, background: `${agent.color}15`,
        }}>
          {getPersonEmoji(agent.id, agent.emoji)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{agent.name}</div>
          <div style={{ fontSize: 12, color: agent.color }}>{agent.role}</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 8, lineHeight: 1.5 }}>{agent.description}</p>

      {/* Capabilities badges */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {agent.capabilities.slice(0, 5).map(cap => (
          <span
            key={cap}
            style={{
              padding: '2px 8px', borderRadius: 6, fontSize: 11,
              background: `${agent.color}12`,
              color: agent.color,
              border: `1px solid ${agent.color}30`,
            }}
          >
            {cap}
          </span>
        ))}
        {agent.capabilities.length > 5 && (
          <span style={{ fontSize: 11, color: CU.textMuted }}>+{agent.capabilities.length - 5}</span>
        )}
      </div>

      {/* Footer: level + price + toggle */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: CU.textMuted }}>{agent.level}</span>
          <span style={{ fontSize: 11, color: CU.textMuted }}>·</span>
          <span style={{ fontSize: 11, color: CU.textMuted }}>{agent.priceCredits} cr/appel</span>
        </div>

        {/* Toggle switch */}
        <button
          onClick={onToggle}
          style={{
            position: 'relative', width: 40, height: 22, borderRadius: 11,
            background: isActive ? agent.color : CU.bgSecondary,
            border: 'none', cursor: 'pointer', transition: 'background 0.2s',
            flexShrink: 0,
          }}
          title={isActive ? 'Desactiver' : 'Activer'}
        >
          <span style={{
            position: 'absolute', top: 2, left: isActive ? 20 : 2,
            width: 18, height: 18, borderRadius: '50%',
            background: 'white', transition: 'left 0.2s',
            boxShadow: 'none',
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
      style={{
        ...CU.card,
        padding: '16px 20px',
        borderLeft: `4px solid ${agent.color}44`,
        opacity: 0.75,
        transition: 'all 0.2s ease',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '1'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.75'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
        <div style={{
          width: 36, height: 36, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
          borderRadius: 8, background: `${agent.color}10`,
        }}>
          {getPersonEmoji(agent.id, agent.emoji)}
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{agent.name}</div>
          <div style={{ fontSize: 12, color: CU.textMuted }}>{agent.role}</div>
        </div>
      </div>

      <p style={{ fontSize: 13, color: CU.textMuted, marginBottom: 10, lineHeight: 1.5, fontStyle: 'italic' }}>
        &laquo; {agent.hiringPitch} &raquo;
      </p>

      {/* Capabilities preview */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {agent.capabilities.slice(0, 4).map(cap => (
          <span
            key={cap}
            style={{
              padding: '2px 8px', borderRadius: 6, fontSize: 11,
              background: CU.bgSecondary,
              color: CU.textMuted,
              border: 'none',
              boxShadow: 'none',
            }}
          >
            {cap}
          </span>
        ))}
      </div>

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: CU.textMuted }}>{agent.level}</span>
          <span style={{ fontSize: 11, color: CU.textMuted }}>·</span>
          <span style={{ fontSize: 11, color: CU.textMuted }}>{agent.priceCredits} cr/appel</span>
        </div>
        <button
          onClick={onRecruit}
          style={{
            height: 36, padding: '0 14px', borderRadius: 6,
            fontSize: 13, fontWeight: 500, border: 'none', cursor: 'pointer',
            background: CU.accent, color: '#fff',
            transition: 'opacity 0.15s',
          }}
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
      style={{
        ...CU.card,
        padding: '16px 20px',
        borderLeft: `4px solid ${agent.color}`,
        transition: 'all 0.2s ease',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          <div
            style={{
              width: 36, height: 36, fontSize: 18, display: 'flex', alignItems: 'center', justifyContent: 'center',
              borderRadius: 8, background: `${agent.color}15`,
            }}
          >
            {getPersonEmoji(agent.id, agent.emoji)}
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 600, color: CU.text }}>{agent.name}</div>
            <div style={{ fontSize: 12, color: agent.color }}>{agent.role}</div>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <span style={{ fontSize: 11, color: CU.textMuted }}>{agent.priceCredits} cr/appel</span>
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
              boxShadow: 'none',
            }} />
          </button>
        </div>
      </div>

      <p style={{ fontSize: 13, color: CU.textSecondary, marginBottom: 8 }}>{agent.description}</p>

      {/* Capabilities */}
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 12 }}>
        {agent.capabilities.map(cap => (
          <span
            key={cap}
            style={{
              padding: '2px 8px', borderRadius: 6, fontSize: 11,
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
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {agent.modes.map(mode => (
          <button
            key={mode.id}
            style={{
              height: 36, padding: '0 12px', borderRadius: 6, fontSize: 11, fontWeight: 500,
              background: CU.bgSecondary, color: CU.textSecondary,
              border: `1px solid ${CU.border}`, cursor: 'pointer',
              transition: 'background 0.12s',
            }}
            title={mode.description}
          >
            {/^[a-z_]+$/.test(mode.icon) ? <span className="material-symbols-rounded" style={{ fontSize: 14, marginRight: 4, verticalAlign: 'middle' }}>{mode.icon}</span> : <span style={{ marginRight: 4 }}>{mode.icon}</span>}
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
      style={{
        ...CU.card,
        padding: '10px 16px',
        opacity: 0.6,
        transition: 'all 0.2s ease',
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.85'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.opacity = '0.6'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        {getPersonEmoji(agent.id, agent.emoji)}
        <div>
          <span style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{agent.name}</span>
          <span style={{ fontSize: 12, color: CU.textMuted, marginLeft: 8 }}>{agent.role}</span>
        </div>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span style={{ fontSize: 11, color: CU.textMuted }}>{agent.priceCredits} cr</span>
        <button
          onClick={onToggle}
          style={{
            position: 'relative', width: 40, height: 22, borderRadius: 11,
            background: CU.bgSecondary, border: 'none', cursor: 'pointer',
            transition: 'background 0.2s', flexShrink: 0,
          }}
          title="Activer"
        >
          <span style={{
            position: 'absolute', top: 2, left: 2,
            width: 18, height: 18, borderRadius: '50%',
            background: 'white', transition: 'left 0.2s',
            boxShadow: 'none',
          }} />
        </button>
      </div>
    </div>
  );
}
