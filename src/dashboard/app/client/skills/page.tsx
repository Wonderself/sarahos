'use client';

import { useState, useEffect, useMemo, useCallback, type CSSProperties } from 'react';
import { useIsMobile, useWindowWidth } from '../../../lib/use-media-query';
import { CU, pageContainer, headerRow, cardGrid } from '../../../lib/page-styles';
import {
  SKILLS,
  SKILL_CATEGORIES,
  SKILL_CATEGORY_COLORS,
  MODEL_BADGES,
  PROFESSION_SKILL_MAP,
  INSTALLED_SKILLS_KEY,
  SKILL_USAGE_KEY,
  type Skill,
  type SkillCategory,
} from '../../../lib/skills-data';
import PageBlogSection from '@/components/blog/PageBlogSection';

// ── Types ──
type Tab = 'all' | 'installed' | 'popular' | 'new' | 'premium';

interface SessionData {
  profession?: string;
  token?: string;
}

// ── Helpers ──
function getSession(): SessionData {
  try {
    return JSON.parse(localStorage.getItem('fz_session') ?? '{}') as SessionData;
  } catch {
    return {};
  }
}

function getInstalledIds(): string[] {
  try {
    const raw = localStorage.getItem(INSTALLED_SKILLS_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

function setInstalledIds(ids: string[]): void {
  localStorage.setItem(INSTALLED_SKILLS_KEY, JSON.stringify(ids));
}

function getUsageMap(): Record<string, number> {
  try {
    const raw = localStorage.getItem(SKILL_USAGE_KEY);
    return raw ? (JSON.parse(raw) as Record<string, number>) : {};
  } catch {
    return {};
  }
}

function setUsageMap(map: Record<string, number>): void {
  localStorage.setItem(SKILL_USAGE_KEY, JSON.stringify(map));
}

// ── Main Component ──
export default function SkillsPage() {
  const isMobile = useIsMobile();
  const width = useWindowWidth();
  const isTablet = width >= 768 && width < 1024;

  const [tab, setTab] = useState<Tab>('all');
  const [category, setCategory] = useState<SkillCategory>('Tous');
  const [search, setSearch] = useState('');
  const [installed, setInstalled] = useState<Set<string>>(new Set());
  const [usage, setUsage] = useState<Record<string, number>>({});
  const [expandedCard, setExpandedCard] = useState<string | null>(null);
  const [activeSkill, setActiveSkill] = useState<string | null>(null);
  const [userInput, setUserInput] = useState('');
  const [skillResponse, setSkillResponse] = useState('');
  const [isRunning, setIsRunning] = useState(false);
  const [hoveredInstall, setHoveredInstall] = useState<string | null>(null);
  const [session, setSession] = useState<SessionData>({});

  // Hydrate from localStorage
  useEffect(() => {
    setInstalled(new Set(getInstalledIds()));
    setUsage(getUsageMap());
    setSession(getSession());
  }, []);

  const totalAvailable = SKILLS.length;
  const installedCount = installed.size;

  // ── Install / Uninstall ──
  const toggleInstall = useCallback((id: string) => {
    setInstalled((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
      } else {
        next.add(id);
      }
      setInstalledIds([...next]);
      return next;
    });
  }, []);

  // ── Use skill ──
  const handleUseSkill = useCallback((id: string) => {
    setActiveSkill(id);
    setUserInput('');
    setSkillResponse('');
    setExpandedCard(null);
  }, []);

  const handleRunSkill = useCallback(async () => {
    if (!activeSkill || !userInput.trim()) return;
    const skill = SKILLS.find((s) => s.id === activeSkill);
    if (!skill) return;

    setIsRunning(true);
    setSkillResponse('');

    // Update usage count
    setUsage((prev) => {
      const next = { ...prev, [activeSkill]: (prev[activeSkill] ?? 0) + 1 };
      setUsageMap(next);
      return next;
    });

    try {
      const baseUrl = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
      const token = getSession().token;
      const res = await fetch(`${baseUrl}/chat`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({
          message: userInput,
          systemPrompt: skill.systemPrompt,
          model: skill.model,
        }),
      });

      if (!res.ok) {
        setSkillResponse(`Erreur ${res.status} — veuillez réessayer.`);
      } else {
        const data = (await res.json()) as { response?: string; message?: string };
        setSkillResponse(data.response ?? data.message ?? 'Aucune réponse.');
      }
    } catch {
      setSkillResponse('Impossible de contacter le serveur. Vérifiez votre connexion.');
    } finally {
      setIsRunning(false);
    }
  }, [activeSkill, userInput]);

  const handleCopyResponse = useCallback(() => {
    if (skillResponse) {
      navigator.clipboard.writeText(skillResponse).catch(() => {});
    }
  }, [skillResponse]);

  // ── Filtering ──
  const filtered = useMemo(() => {
    let list = [...SKILLS];

    // Tab filter
    switch (tab) {
      case 'installed':
        list = list.filter((s) => installed.has(s.id));
        break;
      case 'popular':
        list = list.sort((a, b) => b.popularity - a.popularity);
        break;
      case 'new':
        list = list.filter((s) => s.isNew);
        break;
      case 'premium':
        list = list.filter((s) => s.isPremium);
        break;
    }

    // Category filter
    if (category !== 'Tous') {
      list = list.filter((s) => s.category === category);
    }

    // Search filter
    if (search.trim()) {
      const q = search.toLowerCase();
      list = list.filter(
        (s) =>
          s.name.toLowerCase().includes(q) ||
          s.description.toLowerCase().includes(q) ||
          s.tags.some((t) => t.toLowerCase().includes(q)) ||
          s.category.toLowerCase().includes(q),
      );
    }

    return list;
  }, [tab, category, search, installed]);

  // ── Recommendations ──
  const recommendations = useMemo(() => {
    const profession = (session.profession ?? 'default').toLowerCase();
    const recIds = PROFESSION_SKILL_MAP[profession] ?? PROFESSION_SKILL_MAP['default'];
    return SKILLS.filter((s) => recIds.includes(s.id) && !installed.has(s.id)).slice(0, 6);
  }, [session.profession, installed]);

  // ── Grid columns ──
  const gridCols = isMobile ? 1 : isTablet ? 2 : 3;

  // ── Tab definitions ──
  const TABS: { key: Tab; label: string }[] = [
    { key: 'all', label: 'Tous' },
    { key: 'installed', label: `\u2705 Mes Skills (${installedCount})` },
    { key: 'popular', label: '\uD83C\uDF1F Populaires' },
    { key: 'new', label: '\uD83C\uDD95 Nouveaux' },
    { key: 'premium', label: '\u2B50 Premium' },
  ];

  return (
    <div className="client-page-scrollable" style={pageContainer(isMobile)}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <div style={headerRow()}>
          <span style={{ fontSize: 24, lineHeight: 1, flexShrink: 0 }}>{'\u26A1'}</span>
          <div>
            <h1 style={CU.pageTitle}>Skills</h1>
            <p style={CU.pageSubtitle}>Installez des outils IA dans votre dashboard</p>
          </div>
        </div>
      </div>

      {/* ── Explanation box ── */}
      <div
        style={{
          background: '#EFF6FF',
          border: '1px solid #BFDBFE',
          borderRadius: 8,
          padding: '12px 16px',
          marginBottom: 16,
          fontSize: 13,
          color: '#1E40AF',
          lineHeight: 1.6,
        }}
      >
        {'\uD83D\uDCA1'} Quelle diff{'\u00E9'}rence ? Les <strong>Templates</strong> sont des mod{'\u00E8'}les pr{'\u00E9'}-remplis {'\u00E0'} usage unique.
        Les <strong>Skills</strong> sont des outils installables qui restent dans votre sidebar.
      </div>

      {/* ── Stats row ── */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          flexWrap: 'wrap',
          gap: 8,
          marginBottom: 20,
        }}
      >
        <span style={{ fontSize: 13, color: CU.textSecondary }}>
          {installedCount} skill{installedCount > 1 ? 's' : ''} install{'\u00E9'}{installedCount > 1 ? 's' : ''}{' '}
          {'\u00B7'} {totalAvailable} disponibles {'\u00B7'} 1 cr{'\u00E9'}dit par utilisation
        </span>
        <a
          href="/client/marketplace"
          style={{
            fontSize: 13,
            color: CU.accent,
            textDecoration: 'none',
            fontWeight: 500,
          }}
          onMouseEnter={(e) => { e.currentTarget.style.textDecoration = 'underline'; }}
          onMouseLeave={(e) => { e.currentTarget.style.textDecoration = 'none'; }}
        >
          {'\uD83D\uDCE6'} Voir les Templates {'\u2192'}
        </a>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${CU.border}`, marginBottom: 20, overflowX: 'auto' }}>
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            style={tab === t.key ? CU.tabActive : CU.tab}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* ── Category pills (horizontal scroll) ── */}
      <div
        style={{
          display: 'flex',
          gap: 8,
          overflowX: 'auto',
          paddingBottom: 8,
          marginBottom: 16,
          scrollbarWidth: 'none',
        }}
      >
        {SKILL_CATEGORIES.map((cat) => {
          const isActive = category === cat.value;
          return (
            <button
              key={cat.value}
              onClick={() => setCategory(cat.value)}
              style={{
                ...(isActive ? CU.btnPrimary : CU.btnGhost),
                height: 32,
                padding: '0 14px',
                fontSize: 12,
                whiteSpace: 'nowrap',
                flexShrink: 0,
              }}
            >
              {cat.emoji ? `${cat.emoji} ` : ''}{cat.label}
            </button>
          );
        })}
      </div>

      {/* ── Search ── */}
      <div style={{ position: 'relative', marginBottom: 20 }}>
        <span
          style={{
            position: 'absolute',
            left: 14,
            top: '50%',
            transform: 'translateY(-50%)',
            fontSize: 16,
            color: CU.textMuted,
          }}
        >
          {'\uD83D\uDD0D'}
        </span>
        <input
          type="text"
          placeholder="Rechercher un skill..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{ ...CU.input, padding: '0 16px 0 42px', height: 40 }}
          onFocus={(e) => { e.currentTarget.style.borderColor = CU.accent; }}
          onBlur={(e) => { e.currentTarget.style.borderColor = CU.border; }}
        />
      </div>

      {/* ── Results count ── */}
      <div style={{ fontSize: 13, color: CU.textMuted, marginBottom: 16 }}>
        {filtered.length} skill{filtered.length > 1 ? 's' : ''} trouv{'\u00E9'}{filtered.length > 1 ? 's' : ''}
      </div>

      {/* ── Skills Grid ── */}
      {filtered.length === 0 ? (
        <div style={CU.emptyState}>
          <div style={CU.emptyEmoji}>{tab === 'installed' ? '\uD83D\uDCE6' : '\uD83D\uDD0D'}</div>
          <div style={CU.emptyTitle}>
            {tab === 'installed'
              ? 'Aucun skill install\u00E9'
              : 'Aucun skill trouv\u00E9'}
          </div>
          <div style={CU.emptyDesc}>
            {tab === 'installed'
              ? 'Installez votre premier skill pour booster votre productivit\u00E9'
              : 'Essayez avec d\'autres mots-cl\u00E9s ou changez de cat\u00E9gorie'}
          </div>
          {tab === 'installed' && (
            <button style={CU.btnPrimary} onClick={() => setTab('all')}>
              Parcourir les skills
            </button>
          )}
        </div>
      ) : (
        <div style={cardGrid(isMobile, gridCols)}>
          {filtered.map((skill) => (
            <SkillCard
              key={skill.id}
              skill={skill}
              isInstalled={installed.has(skill.id)}
              usageCount={usage[skill.id] ?? 0}
              isExpanded={expandedCard === skill.id}
              isActive={activeSkill === skill.id}
              isHoveredInstall={hoveredInstall === skill.id}
              onToggleExpand={() => setExpandedCard(expandedCard === skill.id ? null : skill.id)}
              onToggleInstall={() => toggleInstall(skill.id)}
              onUse={() => handleUseSkill(skill.id)}
              onHoverInstall={(h) => setHoveredInstall(h ? skill.id : null)}
              showInstalled={tab === 'installed'}
              isMobile={isMobile}
              // Skill usage inline
              activeSkillId={activeSkill}
              userInput={userInput}
              onInputChange={setUserInput}
              onRun={handleRunSkill}
              isRunning={isRunning}
              skillResponse={skillResponse}
              onCopy={handleCopyResponse}
              onCloseUsage={() => { setActiveSkill(null); setSkillResponse(''); setUserInput(''); }}
            />
          ))}
        </div>
      )}

      {/* ── Recommendations ── */}
      {recommendations.length > 0 && tab !== 'installed' && (
        <div style={{ marginTop: 48 }}>
          <div style={{ ...CU.divider }} />
          <h2 style={{ ...CU.sectionTitle, fontSize: 16, marginBottom: 4, marginTop: 24 }}>
            {'\uD83C\uDFAF'} Recommand{'\u00E9'}s pour vous
          </h2>
          <p style={{ fontSize: 12, color: CU.textMuted, marginBottom: 16 }}>
            Bas{'\u00E9'} sur votre profil{session.profession ? ` (${session.profession})` : ''}
          </p>
          <div style={cardGrid(isMobile, gridCols)}>
            {recommendations.map((skill) => (
              <SkillCard
                key={skill.id}
                skill={skill}
                isInstalled={false}
                usageCount={0}
                isExpanded={expandedCard === skill.id}
                isActive={false}
                isHoveredInstall={hoveredInstall === skill.id}
                onToggleExpand={() => setExpandedCard(expandedCard === skill.id ? null : skill.id)}
                onToggleInstall={() => toggleInstall(skill.id)}
                onUse={() => {}}
                onHoverInstall={(h) => setHoveredInstall(h ? skill.id : null)}
                showInstalled={false}
                isMobile={isMobile}
                activeSkillId={null}
                userInput=""
                onInputChange={() => {}}
                onRun={() => Promise.resolve()}
                isRunning={false}
                skillResponse=""
                onCopy={() => {}}
                onCloseUsage={() => {}}
              />
            ))}
          </div>
        </div>
      )}
      <PageBlogSection pageId="skills" />
    </div>
  );
}

// ── Skill Card Component ──
interface SkillCardProps {
  skill: Skill;
  isInstalled: boolean;
  usageCount: number;
  isExpanded: boolean;
  isActive: boolean;
  isHoveredInstall: boolean;
  onToggleExpand: () => void;
  onToggleInstall: () => void;
  onUse: () => void;
  onHoverInstall: (hovered: boolean) => void;
  showInstalled: boolean;
  isMobile: boolean;
  // Usage inline props
  activeSkillId: string | null;
  userInput: string;
  onInputChange: (v: string) => void;
  onRun: () => Promise<void>;
  isRunning: boolean;
  skillResponse: string;
  onCopy: () => void;
  onCloseUsage: () => void;
}

function SkillCard({
  skill,
  isInstalled,
  usageCount,
  isExpanded,
  isActive,
  isHoveredInstall,
  onToggleExpand,
  onToggleInstall,
  onUse,
  onHoverInstall,
  showInstalled,
  isMobile,
  activeSkillId,
  userInput,
  onInputChange,
  onRun,
  isRunning,
  skillResponse,
  onCopy,
  onCloseUsage,
}: SkillCardProps) {
  const catColor = SKILL_CATEGORY_COLORS[skill.category] ?? CU.textSecondary;
  const modelInfo = MODEL_BADGES[skill.model];
  const showUsagePanel = activeSkillId === skill.id && isInstalled;

  const cardStyle: CSSProperties = {
    ...CU.cardHoverable,
    position: 'relative',
    display: 'flex',
    flexDirection: 'column',
    transition: 'border-color 0.15s, box-shadow 0.15s',
  };

  return (
    <div style={cardStyle}>
      {/* Badges top-right */}
      {(skill.isNew || skill.isPremium) && (
        <div style={{ position: 'absolute', top: 8, right: 8, display: 'flex', gap: 4 }}>
          {skill.isNew && (
            <span style={{ ...CU.badge, background: '#ECFDF5', color: '#059669', fontSize: 11 }}>
              {'\uD83C\uDD95'}
            </span>
          )}
          {skill.isPremium && (
            <span style={{ ...CU.badge, background: '#FFFBEB', color: '#D97706', fontSize: 11 }}>
              {'\u2B50'}
            </span>
          )}
        </div>
      )}

      {/* Card body — clickable to expand */}
      <div
        onClick={onToggleExpand}
        style={{ cursor: 'pointer', flex: 1 }}
      >
        {/* Top: emoji + name + category badge */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
          <span style={{ fontSize: 32, lineHeight: 1 }}>{skill.emoji}</span>
          <div style={{ flex: 1, minWidth: 0 }}>
            <div style={{ fontSize: 14, fontWeight: 600, color: CU.text, marginBottom: 2 }}>{skill.name}</div>
            <span
              style={{
                display: 'inline-block',
                padding: '1px 8px',
                borderRadius: 10,
                background: `${catColor}12`,
                color: catColor,
                fontSize: 11,
                fontWeight: 500,
              }}
            >
              {skill.category}
            </span>
          </div>
        </div>

        {/* Description */}
        <p
          style={{
            fontSize: 12,
            color: CU.textSecondary,
            lineHeight: 1.5,
            marginBottom: 8,
            display: '-webkit-box',
            WebkitLineClamp: 2,
            WebkitBoxOrient: 'vertical',
            overflow: 'hidden',
          }}
        >
          {skill.description}
        </p>

        {/* Tags */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 4, marginBottom: 10 }}>
          {skill.tags.map((tag) => (
            <span
              key={tag}
              style={{
                padding: '1px 8px',
                borderRadius: 6,
                background: CU.bgSecondary,
                fontSize: 11,
                color: CU.textMuted,
              }}
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Bottom row: model + cost + popularity */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
          <span style={{ fontSize: 11, color: modelInfo.color, fontWeight: 500 }}>
            {modelInfo.emoji} {modelInfo.label}
          </span>
          <span style={{ fontSize: 11, color: CU.textMuted }}>{'\u26A1'} {skill.creditCost}cr</span>
          <div style={{ flex: 1 }} />
          {/* Popularity bar */}
          <div
            style={{
              width: 48,
              height: 4,
              background: CU.border,
              borderRadius: 2,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                width: `${skill.popularity}%`,
                height: '100%',
                background: skill.popularity > 80 ? '#38A169' : skill.popularity > 60 ? '#D69E2E' : CU.textMuted,
                borderRadius: 2,
              }}
            />
          </div>
        </div>
      </div>

      {/* ── Install / action buttons ── */}
      <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
        {showInstalled && isInstalled ? (
          <>
            <button
              onClick={onUse}
              style={{
                ...CU.btnPrimary,
                flex: 1,
                height: isMobile ? 44 : 34,
                fontSize: 13,
              }}
            >
              {'\u25B6\uFE0F'} Utiliser
            </button>
            <button
              onClick={onToggleInstall}
              style={{
                ...CU.btnGhost,
                color: CU.danger,
                borderColor: CU.danger,
                height: isMobile ? 44 : 34,
                fontSize: 12,
                padding: '0 12px',
              }}
            >
              D{'\u00E9'}sinstaller
            </button>
          </>
        ) : (
          <button
            onClick={(e) => {
              e.stopPropagation();
              onToggleInstall();
            }}
            onMouseEnter={() => onHoverInstall(true)}
            onMouseLeave={() => onHoverInstall(false)}
            style={{
              ...(isInstalled
                ? isHoveredInstall
                  ? { ...CU.btnDanger, height: isMobile ? 44 : 34, fontSize: 13, width: '100%' }
                  : { ...CU.btnGhost, background: '#F0FFF4', color: '#38A169', borderColor: '#C6F6D5', height: isMobile ? 44 : 34, fontSize: 13, width: '100%' }
                : { ...CU.btnPrimary, height: isMobile ? 44 : 34, fontSize: 13, width: '100%' }),
            }}
          >
            {isInstalled
              ? isHoveredInstall
                ? 'D\u00E9sinstaller'
                : '\u2705 Install\u00E9'
              : 'Installer'}
          </button>
        )}
      </div>

      {/* Usage count (installed tab) */}
      {showInstalled && usageCount > 0 && (
        <div style={{ fontSize: 11, color: CU.textMuted, marginTop: 6, textAlign: 'center' }}>
          Utilis{'\u00E9'} {usageCount} fois
        </div>
      )}

      {/* ── Expanded: long description ── */}
      {isExpanded && !showUsagePanel && (
        <div
          style={{
            marginTop: 12,
            padding: '12px 0 0',
            borderTop: `1px solid ${CU.border}`,
          }}
        >
          <p style={{ fontSize: 12, color: CU.textSecondary, lineHeight: 1.6, marginBottom: 12 }}>
            {skill.longDescription}
          </p>
          {isInstalled && (
            <button
              onClick={onUse}
              style={{ ...CU.btnPrimary, width: '100%', height: isMobile ? 44 : 36 }}
            >
              Essayer {'\u2192'}
            </button>
          )}
        </div>
      )}

      {/* ── Skill Usage Panel (inline, Notion-style) ── */}
      {showUsagePanel && (
        <div
          style={{
            marginTop: 12,
            padding: '14px 0 0',
            borderTop: `1px solid ${CU.border}`,
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 10 }}>
            <span style={{ fontSize: 20 }}>{skill.emoji}</span>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: CU.text }}>{skill.name}</div>
              <div style={{ fontSize: 11, color: CU.textMuted }}>{skill.description}</div>
            </div>
            <button
              onClick={onCloseUsage}
              style={{
                background: 'none',
                border: 'none',
                cursor: 'pointer',
                fontSize: 16,
                color: CU.textMuted,
                padding: 4,
              }}
            >
              {'\u2715'}
            </button>
          </div>

          <textarea
            placeholder={skill.inputPlaceholder}
            value={userInput}
            onChange={(e) => onInputChange(e.target.value)}
            style={{
              ...CU.textarea,
              minHeight: 80,
              marginBottom: 8,
            }}
            onFocus={(e) => { e.currentTarget.style.borderColor = CU.accent; }}
            onBlur={(e) => { e.currentTarget.style.borderColor = CU.border; }}
          />

          <button
            onClick={() => { onRun(); }}
            disabled={isRunning || !userInput.trim()}
            style={{
              ...CU.btnPrimary,
              width: '100%',
              height: isMobile ? 44 : 36,
              opacity: isRunning || !userInput.trim() ? 0.5 : 1,
              cursor: isRunning || !userInput.trim() ? 'not-allowed' : 'pointer',
              marginBottom: 8,
            }}
          >
            {isRunning ? 'Traitement en cours...' : `\u26A1 Lancer (${skill.creditCost} cr\u00E9dit)`}
          </button>

          {/* Response area */}
          {skillResponse && (
            <div
              style={{
                background: CU.bgSecondary,
                border: `1px solid ${CU.border}`,
                borderRadius: 8,
                padding: 12,
                marginTop: 4,
                maxHeight: 300,
                overflowY: 'auto',
              }}
            >
              <pre
                style={{
                  whiteSpace: 'pre-wrap',
                  wordBreak: 'break-word',
                  fontSize: 12,
                  color: CU.text,
                  lineHeight: 1.6,
                  margin: 0,
                  fontFamily: skill.previewType === 'code' ? 'monospace' : 'inherit',
                }}
              >
                {skillResponse}
              </pre>
              <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
                <button onClick={onCopy} style={{ ...CU.btnSmall }}>
                  {'\uD83D\uDCCB'} Copier
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
