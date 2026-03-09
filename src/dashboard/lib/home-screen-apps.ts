// ─── Home Screen App Registry ─────────────────────────────────────────────────
// Maps every client feature to an iOS-like app icon with unique gradient colors.

export interface HomeScreenApp {
  id: string;
  href: string;
  label: string;
  icon: string;
  gradient: [string, string];
  section: string;
}

export interface HomeScreenLayout {
  version: number;
  appOrder: string[];
  dockApps: string[];
}

// ─── Default Apps ─────────────────────────────────────────────────────────────

export const DEFAULT_APPS: HomeScreenApp[] = [
  // ── Espace de travail ──
  { id: 'reveil',           href: '/client/reveil',             label: 'Réveil',              icon: 'coffee',        gradient: ['#f59e0b', '#fbbf24'], section: 'workspace' },
  { id: 'chat',             href: '/client/chat',               label: 'Chat',                icon: 'chat',          gradient: ['#6366f1', '#818cf8'], section: 'workspace' },
  { id: 'repondeur',        href: '/client/repondeur',          label: 'Répondeur',           icon: 'call',          gradient: ['#22c55e', '#4ade80'], section: 'workspace' },
  { id: 'social',           href: '/client/social',             label: 'Réseaux Sociaux',     icon: 'share',         gradient: ['#8b5cf6', '#a78bfa'], section: 'workspace' },
  { id: 'studio',           href: '/client/studio',             label: 'Studio Créatif',      icon: 'movie',         gradient: ['#ec4899', '#f472b6'], section: 'workspace' },
  { id: 'documents',        href: '/client/documents',          label: 'Documents',           icon: 'description',   gradient: ['#06b6d4', '#22d3ee'], section: 'workspace' },
  { id: 'strategy',         href: '/client/strategy',           label: "Plan d'attaque",      icon: 'target',        gradient: ['#eab308', '#facc15'], section: 'workspace' },
  { id: 'custom-creation',  href: '/client/custom-creation',    label: 'Modules sur mesure',  icon: 'extension',     gradient: ['#10b981', '#34d399'], section: 'workspace' },
  { id: 'video-pro',        href: '/client/video-pro',          label: 'Vidéo Pro',           icon: 'videocam',      gradient: ['#e11d48', '#fb7185'], section: 'workspace' },
  { id: 'formations',       href: '/client/formations',         label: 'Formations',          icon: 'school',        gradient: ['#3b82f6', '#60a5fa'], section: 'workspace' },
  { id: 'personal',         href: '/client/personal',           label: 'Mes Agents',          icon: 'person',        gradient: ['#a855f7', '#c084fc'], section: 'workspace' },
  { id: 'agents-customize', href: '/client/agents/customize',   label: 'Personnaliser',       icon: 'palette',       gradient: ['#d946ef', '#e879f9'], section: 'workspace' },
  { id: 'agents',           href: '/client/agents',             label: 'Agents IA',           icon: 'smart_toy',     gradient: ['#7c3aed', '#a78bfa'], section: 'workspace' },
  { id: 'modules',          href: '/client/modules',            label: 'Modules',             icon: 'inventory_2',   gradient: ['#64748b', '#94a3b8'], section: 'workspace' },
  { id: 'campaigns',        href: '/client/campaigns',          label: 'Campagnes',           icon: 'campaign',      gradient: ['#f43f5e', '#fb7185'], section: 'workspace' },
  { id: 'telephony',        href: '/client/telephony',          label: 'Téléphonie',          icon: 'phone',         gradient: ['#059669', '#34d399'], section: 'workspace' },
  { id: 'projects',         href: '/client/projects',           label: 'Projets',             icon: 'folder',        gradient: ['#0ea5e9', '#38bdf8'], section: 'workspace' },
  { id: 'actions',          href: '/client/actions',            label: "Centre d'actions",    icon: 'bolt',          gradient: ['#f97316', '#fb923c'], section: 'workspace' },

  // ── Moi ──
  { id: 'account',       href: '/client/account',        label: 'Mon Compte',      icon: 'account_circle', gradient: ['#6366f1', '#a5b4fc'], section: 'moi' },
  { id: 'analytics',     href: '/client/analytics',      label: 'Analytics',       icon: 'analytics',      gradient: ['#0ea5e9', '#38bdf8'], section: 'moi' },
  { id: 'finances',      href: '/client/finances',       label: 'Finances',        icon: 'credit_card',    gradient: ['#84cc16', '#a3e635'], section: 'moi' },
  { id: 'referrals',     href: '/client/referrals',      label: 'Parrainer',       icon: 'redeem',         gradient: ['#f97316', '#fdba74'], section: 'moi' },
  { id: 'rewards',       href: '/client/rewards',        label: 'Récompenses',     icon: 'card_giftcard',  gradient: ['#eab308', '#fde047'], section: 'moi' },
  { id: 'activity',      href: '/client/activity',       label: 'Activité',        icon: 'history',        gradient: ['#64748b', '#cbd5e1'], section: 'moi' },
  { id: 'timeline',      href: '/client/timeline',       label: 'Timeline',        icon: 'timeline',       gradient: ['#14b8a6', '#5eead4'], section: 'moi' },
  { id: 'notifications', href: '/client/notifications',  label: 'Notifications',   icon: 'notifications',  gradient: ['#ef4444', '#fca5a5'], section: 'moi' },

  // ── Agents Personnels ──
  { id: 'budget',     href: '/client/personal/budget',     label: 'Budget',             icon: 'savings',     gradient: ['#10b981', '#6ee7b7'], section: 'agents-perso' },
  { id: 'comptable',  href: '/client/personal/comptable',  label: 'Comptabilité',       icon: 'receipt',     gradient: ['#0891b2', '#67e8f9'], section: 'agents-perso' },
  { id: 'chasseur',   href: '/client/personal/chasseur',   label: 'Chasseur',           icon: 'target',      gradient: ['#dc2626', '#fca5a5'], section: 'agents-perso' },
  { id: 'cv',         href: '/client/personal/cv',         label: 'CV 2026',            icon: 'description', gradient: ['#7c3aed', '#c4b5fd'], section: 'agents-perso' },
  { id: 'ecrivain',   href: '/client/personal/ecrivain',   label: 'Atelier Écriture',   icon: 'draw',        gradient: ['#be185d', '#f9a8d4'], section: 'agents-perso' },

  // ── Discussions ──
  { id: 'discussions', href: '/client/discussions', label: 'Discussions', icon: 'psychology', gradient: ['#14b8a6', '#2dd4bf'], section: 'discussions' },

  // ── Divertissement ──
  { id: 'games',           href: '/client/games',           label: 'Arcade',        icon: 'sports_esports', gradient: ['#ef4444', '#f87171'], section: 'divertissement' },
  { id: 'games-create',    href: '/client/games/create',    label: 'Créer un jeu',  icon: 'add_circle',     gradient: ['#f97316', '#fdba74'], section: 'divertissement' },
  { id: 'games-community', href: '/client/games/community', label: 'Communauté',    icon: 'groups',         gradient: ['#8b5cf6', '#c4b5fd'], section: 'divertissement' },

  // ── Mon Entreprise ──
  { id: 'onboarding',  href: '/client/onboarding',  label: 'Profil entreprise', icon: 'business',   gradient: ['#1d4ed8', '#93c5fd'], section: 'entreprise' },
  { id: 'team',        href: '/client/team',        label: 'Mon équipe',        icon: 'group',      gradient: ['#0891b2', '#67e8f9'], section: 'entreprise' },
  { id: 'partners',    href: '/client/partners',    label: 'Partenaires',       icon: 'handshake',  gradient: ['#059669', '#6ee7b7'], section: 'entreprise' },
  { id: 'marketplace', href: '/client/marketplace', label: 'Marketplace',       icon: 'storefront', gradient: ['#d946ef', '#e879f9'], section: 'entreprise' },

  // ── Développeur ──
  { id: 'widget', href: '/client/widget', label: 'Widget', icon: 'code', gradient: ['#475569', '#94a3b8'], section: 'developpeur' },
];

export const DEFAULT_DOCK_APPS = ['chat', 'studio', 'documents', 'actions'];

export const SECTION_LABELS: Record<string, string> = {
  workspace: 'Espace de travail',
  moi: 'Moi',
  'agents-perso': 'Agents Personnels',
  discussions: 'Discussions',
  divertissement: 'Divertissement',
  entreprise: 'Mon Entreprise',
  developpeur: 'Développeur',
};

export const SECTION_ORDER = ['workspace', 'moi', 'agents-perso', 'discussions', 'divertissement', 'entreprise', 'developpeur'];

// ─── Layout persistence ───────────────────────────────────────────────────────

const LAYOUT_KEY = 'fz_app_layout';

export function loadLayout(): HomeScreenLayout {
  try {
    const raw = localStorage.getItem(LAYOUT_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as HomeScreenLayout;
      if (parsed.version === 1) return parsed;
    }
  } catch { /* ignore */ }
  return {
    version: 1,
    appOrder: DEFAULT_APPS.map(a => a.id),
    dockApps: [...DEFAULT_DOCK_APPS],
  };
}

export function saveLayout(layout: HomeScreenLayout): void {
  try {
    localStorage.setItem(LAYOUT_KEY, JSON.stringify(layout));
  } catch { /* ignore */ }
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const APP_MAP = new Map(DEFAULT_APPS.map(a => [a.id, a]));

export function getAppById(id: string): HomeScreenApp | undefined {
  return APP_MAP.get(id);
}

export function getOrderedApps(layout: HomeScreenLayout): HomeScreenApp[] {
  const ordered: HomeScreenApp[] = [];
  for (const id of layout.appOrder) {
    const app = APP_MAP.get(id);
    if (app) ordered.push(app);
  }
  // Add any new apps not yet in the layout
  for (const app of DEFAULT_APPS) {
    if (!layout.appOrder.includes(app.id)) ordered.push(app);
  }
  return ordered;
}

export function getAppsBySection(apps: HomeScreenApp[]): { section: string; title: string; apps: HomeScreenApp[] }[] {
  const groups: Record<string, HomeScreenApp[]> = {};
  for (const app of apps) {
    if (!groups[app.section]) groups[app.section] = [];
    groups[app.section].push(app);
  }
  return SECTION_ORDER
    .filter(s => groups[s]?.length)
    .map(s => ({ section: s, title: SECTION_LABELS[s] ?? s, apps: groups[s] }));
}

export function getDockApps(layout: HomeScreenLayout): HomeScreenApp[] {
  return layout.dockApps
    .map(id => APP_MAP.get(id))
    .filter((a): a is HomeScreenApp => !!a);
}
