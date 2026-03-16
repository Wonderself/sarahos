'use client';

import { useEffect, useState, useCallback, useRef } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { loadGamification } from '../../lib/gamification';
import { ALL_AGENTS, getActiveAgentIds } from '../../lib/agent-config';
import { ToastProvider } from '../../components/Toast';
import OnboardingTour from '../../components/OnboardingTour';
import QuickOnboarding from '../../components/QuickOnboarding';
import OfflineBanner from '../../components/OfflineBanner';
import PushPermissionBanner from '../../components/PushPermissionBanner';
import { getFavorites } from '../../lib/favorite-agents';
import { registerServiceWorker } from '../../lib/push-notifications';
import { NAV_EMOJIS, SECTION_EMOJIS, PAGE_META } from '../../lib/emoji-map';
import OnboardingCopilot from '../../components/OnboardingCopilot';
import VisitorBanner from '../../components/VisitorBanner';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UserSession {
  token: string;
  userId: string;
  email: string;
  displayName: string;
  role: string;
  tier: string;
}

interface NavItemConfig {
  href: string;
  icon: string;
  label: string;
  visible: boolean;
  order: number;
}

interface SectionConfig {
  id: string;
  title: string;
  visible: boolean;
  order: number;
  items: NavItemConfig[];
}

interface MenuConfig {
  desktop: SectionConfig[];
  mobile: SectionConfig[];
}

// ─── Default data ─────────────────────────────────────────────────────────────

const DEFAULT_SECTIONS: SectionConfig[] = [
  {
    id: 'quotidien',
    title: 'Quotidien',
    visible: true,
    order: 0,
    items: [
      { href: '/client/dashboard', icon: 'home', label: 'Accueil', visible: true, order: 0 },
      { href: '/client/chat', icon: 'chat', label: 'Chat', visible: true, order: 1 },
      { href: '/client/reveil', icon: 'coffee', label: 'Réveil intelligent', visible: true, order: 2 },
      { href: '/client/notifications', icon: 'notifications', label: 'Notifications', visible: true, order: 3 },
      { href: '/client/notes', icon: 'sticky_note_2', label: 'Notes rapides', visible: true, order: 4 },
      { href: '/client/pomodoro', icon: 'timer', label: 'Focus / Pomodoro', visible: true, order: 5 },
      { href: '/client/calendrier', icon: 'calendar_month', label: 'Calendrier', visible: true, order: 6 },
      { href: '/client/actions', icon: 'bolt', label: "Centre d'actions", visible: true, order: 7 },
    ],
  },
  {
    id: 'creation',
    title: 'Création',
    visible: true,
    order: 1,
    items: [
      { href: '/client/studio', icon: 'movie', label: 'Studio Créatif', visible: true, order: 0 },
      { href: '/client/video-pro', icon: 'videocam', label: 'Vidéo Pro', visible: true, order: 1 },
      { href: '/client/photos', icon: 'image_search', label: 'Banque d\'images', visible: true, order: 2 },
      { href: '/client/social', icon: 'share', label: 'Réseaux Sociaux', visible: true, order: 3 },
      { href: '/client/campaigns', icon: 'campaign', label: 'Campagnes', visible: true, order: 4 },
      { href: '/client/custom-creation', icon: 'extension', label: 'Modules sur mesure', visible: true, order: 5 },
    ],
  },
  {
    id: 'communication',
    title: 'Communication',
    visible: true,
    order: 2,
    items: [
      { href: '/client/repondeur', icon: 'call', label: 'Répondeur Intelligent', visible: true, order: 0 },
      { href: '/client/telephony', icon: 'phone', label: 'Téléphonie', visible: true, order: 1 },
      { href: '/client/email', icon: 'mail', label: 'Email IA', visible: true, order: 2 },
      { href: '/client/signatures', icon: 'draw', label: 'Signatures Email', visible: true, order: 3 },
      { href: '/client/email-templates', icon: 'mark_email_read', label: 'Templates Email', visible: true, order: 4 },
    ],
  },
  {
    id: 'assistants',
    title: 'Assistants IA',
    visible: true,
    order: 3,
    items: [
      { href: '/client/agents', icon: 'smart_toy', label: 'Mes assistants IA', visible: true, order: 0 },
      { href: '/client/personal', icon: 'person', label: 'Mes Assistants Perso', visible: true, order: 1 },
      { href: '/client/agents/customize', icon: 'palette', label: 'Personnaliser', visible: true, order: 2 },
      { href: '/client/modules', icon: 'inventory_2', label: 'Mes modules', visible: true, order: 3 },
      { href: '/client/memory', icon: 'psychology', label: 'Mémoire IA', visible: true, order: 4 },
    ],
  },
  {
    id: 'productivite',
    title: 'Productivité',
    visible: true,
    order: 4,
    items: [
      { href: '/client/strategy', icon: 'target', label: "Plan d'attaque", visible: true, order: 0 },
      { href: '/client/projects', icon: 'folder', label: 'Projets', visible: true, order: 1 },
      { href: '/client/kanban', icon: 'view_kanban', label: 'Kanban', visible: true, order: 2 },
      { href: '/client/documents', icon: 'description', label: 'Documents', visible: true, order: 3 },
      { href: '/client/traduction', icon: 'translate', label: 'Traduction', visible: true, order: 4 },
      { href: '/client/qrcode', icon: 'qr_code_2', label: 'QR Codes', visible: true, order: 5 },
      { href: '/client/formations', icon: 'school', label: 'Formations', visible: true, order: 6 },
      { href: '/client/learn', icon: 'menu_book', label: 'Apprendre', visible: true, order: 7 },
      { href: '/client/skills', icon: 'bolt', label: 'Skills', visible: true, order: 8 },
    ],
  },
  {
    id: 'business',
    title: 'Business',
    visible: true,
    order: 5,
    items: [
      { href: '/client/facturation', icon: 'receipt_long', label: 'Facturation', visible: true, order: 0 },
      { href: '/client/crm', icon: 'contacts', label: 'CRM', visible: true, order: 1 },
      { href: '/client/seo', icon: 'search', label: 'SEO Tracker', visible: true, order: 2 },
      { href: '/client/veille', icon: 'newspaper', label: 'Veille / RSS', visible: true, order: 3 },
      { href: '/client/news-ai', icon: 'auto_awesome', label: 'Actu IA', visible: true, order: 4 },
      { href: '/client/landing-builder', icon: 'web', label: 'Landing Builder', visible: true, order: 5 },
    ],
  },
  {
    id: 'bienetre',
    title: 'Bien-être',
    visible: true,
    order: 6,
    items: [
      { href: '/client/habitudes', icon: 'task_alt', label: 'Habitudes', visible: true, order: 0 },
      { href: '/client/journal', icon: 'auto_stories', label: 'Journal Perso', visible: true, order: 1 },
    ],
  },
  {
    id: 'moi',
    title: 'Moi',
    visible: true,
    order: 7,
    items: [
      { href: '/client/account', icon: 'account_circle', label: 'Mon Compte', visible: true, order: 0 },
      { href: '/client/rewards', icon: 'card_giftcard', label: 'Récompenses', visible: true, order: 1 },
      { href: '/client/referrals', icon: 'redeem', label: 'Parrainer', visible: true, order: 2 },
      { href: '/client/analytics', icon: 'analytics', label: 'Analytics', visible: true, order: 3 },
      { href: '/client/finances', icon: 'credit_card', label: 'Finances', visible: true, order: 4 },
      { href: '/client/activity', icon: 'history', label: "Journal d'activité", visible: true, order: 5 },
      { href: '/client/timeline', icon: 'timeline', label: 'Timeline', visible: true, order: 6 },
    ],
  },
];

const DIVERTISSEMENT_SECTION: SectionConfig = {
  id: 'divertissement',
  title: 'Divertissement',
  visible: true,
  order: 3,
  items: [
    { href: '/client/games', icon: 'sports_esports', label: 'Arcade', visible: true, order: 0 },
    { href: '/client/games/create', icon: 'add_circle', label: 'Créer un jeu', visible: true, order: 1 },
    { href: '/client/games/community', icon: 'groups', label: 'Communauté', visible: true, order: 2 },
  ],
};

const DEVELOPPEUR_SECTION: SectionConfig = {
  id: 'developpeur',
  title: 'Développeur',
  visible: true,
  order: 10,
  items: [
    { href: '/client/widget', icon: 'code', label: 'Widget', visible: true, order: 0 },
  ],
};

const AGENTS_PERSONNELS_SECTION: SectionConfig = {
  id: 'agents-perso',
  title: 'Assistants Personnels',
  visible: true,
  order: 1,
  items: [
    { href: '/client/personal/budget', icon: 'savings', label: 'Budget', visible: true, order: 0 },
    { href: '/client/personal/comptable', icon: 'receipt', label: 'Comptabilité', visible: true, order: 1 },
    { href: '/client/personal/chasseur', icon: 'target', label: 'Chasseur de missions', visible: true, order: 2 },
    { href: '/client/personal/cv', icon: 'description', label: 'CV 2026', visible: true, order: 3 },
    { href: '/client/personal/ecrivain', icon: 'draw', label: 'Atelier Écriture', visible: true, order: 4 },
  ],
};

const DISCUSSIONS_SECTION: SectionConfig = {
  id: 'discussions',
  title: 'Discussions Approfondies',
  visible: true,
  order: 2,
  items: [
    { href: '/client/discussions', icon: 'psychology', label: 'Mes Discussions', visible: true, order: 0 },
  ],
};

const MON_ENTREPRISE_SECTION: SectionConfig = {
  id: 'entreprise',
  title: 'Mon Entreprise',
  visible: true,
  order: 2,
  items: [
    { href: '/client/onboarding', icon: 'business', label: 'Profil entreprise', visible: true, order: 0 },
    { href: '/client/team', icon: 'group', label: 'Mon équipe', visible: true, order: 1 },
    { href: '/client/partners', icon: 'handshake', label: 'Partenaires', visible: true, order: 2 },
    { href: '/client/marketplace', icon: 'storefront', label: 'Marketplace', visible: true, order: 3 },
  ],
};

// ─── Config helpers ───────────────────────────────────────────────────────────

const MENU_CONFIG_KEY = 'fz_menu_config';

function buildDefaultSections(isPro: boolean): SectionConfig[] {
  const base: SectionConfig[] = JSON.parse(JSON.stringify(DEFAULT_SECTIONS));
  const perso: SectionConfig = JSON.parse(JSON.stringify(AGENTS_PERSONNELS_SECTION));
  perso.order = base.length;
  base.push(perso);
  const disc: SectionConfig = JSON.parse(JSON.stringify(DISCUSSIONS_SECTION));
  disc.order = base.length;
  base.push(disc);
  const divert: SectionConfig = JSON.parse(JSON.stringify(DIVERTISSEMENT_SECTION));
  divert.order = base.length;
  base.push(divert);
  if (isPro) {
    const ent: SectionConfig = JSON.parse(JSON.stringify(MON_ENTREPRISE_SECTION));
    ent.order = base.length;
    base.push(ent);
  }
  const dev: SectionConfig = JSON.parse(JSON.stringify(DEVELOPPEUR_SECTION));
  dev.order = base.length;
  base.push(dev);
  return base;
}

function loadMenuSections(desktop: boolean, isPro: boolean): SectionConfig[] {
  try {
    const stored = localStorage.getItem(MENU_CONFIG_KEY);
    if (stored) {
      const config: MenuConfig = JSON.parse(stored);
      const sections: SectionConfig[] = JSON.parse(
        JSON.stringify(desktop ? config.desktop : config.mobile),
      );
      if (sections.length > 0) {
        if (!sections.find(s => s.id === 'agents-perso')) {
          const perso: SectionConfig = JSON.parse(JSON.stringify(AGENTS_PERSONNELS_SECTION));
          perso.order = sections.length;
          sections.push(perso);
        }
        if (!sections.find(s => s.id === 'discussions')) {
          const disc: SectionConfig = JSON.parse(JSON.stringify(DISCUSSIONS_SECTION));
          disc.order = sections.length;
          sections.push(disc);
        }
        if (!sections.find(s => s.id === 'divertissement')) {
          const divert: SectionConfig = JSON.parse(JSON.stringify(DIVERTISSEMENT_SECTION));
          divert.order = sections.length;
          sections.push(divert);
        }
        if (!sections.find(s => s.id === 'developpeur')) {
          const dev: SectionConfig = JSON.parse(JSON.stringify(DEVELOPPEUR_SECTION));
          dev.order = sections.length;
          sections.push(dev);
        }
        if (isPro && !sections.find(s => s.id === 'entreprise')) {
          const ent: SectionConfig = JSON.parse(JSON.stringify(MON_ENTREPRISE_SECTION));
          ent.order = sections.length;
          sections.push(ent);
        }
        if (!isPro) {
          const idx = sections.findIndex(s => s.id === 'entreprise');
          if (idx !== -1) sections.splice(idx, 1);
        }
        return sections;
      }
    }
  } catch { /* */ }
  return buildDefaultSections(isPro);
}

function saveMenuSections(sections: SectionConfig[], desktop: boolean): void {
  try {
    const stored = localStorage.getItem(MENU_CONFIG_KEY);
    const config: MenuConfig = stored
      ? JSON.parse(stored)
      : { desktop: buildDefaultSections(false), mobile: buildDefaultSections(false) };
    if (desktop) config.desktop = sections;
    else config.mobile = sections;
    localStorage.setItem(MENU_CONFIG_KEY, JSON.stringify(config));
  } catch { /* */ }
}

// ─── Emoji helper ─────────────────────────────────────────────────────────────

// Auth-required nav items (visitor sees lock icon)
const AUTH_REQUIRED_HREFS = new Set([
  '/client/account',
  '/client/finances',
  '/client/notifications',
  '/client/projects',
  '/client/strategy',
  '/client/team',
  '/client/onboarding',
  '/client/activity',
  '/client/referrals',
  '/client/rewards',
  '/client/analytics',
  '/client/personal/budget',
  '/client/personal/comptable',
  '/client/personal/chasseur',
  '/client/personal/cv',
  '/client/personal/ecrivain',
  '/client/campaigns',
  '/client/telephony',
  '/client/actions',
  '/client/widget',
  '/client/agents/customize',
]);

function getNavEmoji(href: string): string {
  const slug = href.replace('/client/', '').replace(/\//g, '-').replace(/-$/, '');
  return NAV_EMOJIS[slug] || NAV_EMOJIS[slug.split('-')[0]] || '📎';
}

// ─── Nav context for emoji rail breadcrumb ───────────────────────────────────

function getCurrentNavContext(
  pathname: string,
  sections: SectionConfig[],
): { sectionId: string; sectionEmoji: string; pageEmoji: string } | null {
  for (const section of sections) {
    for (const item of section.items) {
      if (item.visible && (pathname === item.href || (item.href !== '/client/dashboard' && pathname.startsWith(item.href)))) {
        return {
          sectionId: section.id,
          sectionEmoji: SECTION_EMOJIS[section.id] || '📌',
          pageEmoji: getNavEmoji(item.href),
        };
      }
    }
  }
  return null;
}

// ─── Level titles ─────────────────────────────────────────────────────────────

const LEVEL_TITLES: Record<number, string> = {
  1: 'Débutant', 2: 'Apprenti', 3: 'Explorateur', 4: 'Collaborateur',
  5: 'Professionnel', 6: 'Expert', 7: 'Maître', 8: 'Visionnaire',
  9: 'Légende', 10: 'Transcendant',
};

// ─── Material icon palette for icon picker ───────────────────────────────────

const MATERIAL_ICON_PALETTE = [
  // Work & folders
  'home', 'work', 'folder', 'folder_open', 'assignment', 'bar_chart', 'trending_up', 'savings', 'credit_card', 'business', 'architecture', 'inventory_2',
  // Communication
  'chat', 'call', 'share', 'mail', 'email', 'notifications', 'campaign', 'record_voice_over', 'forum', 'chat_bubble', 'send', 'cell_tower',
  // People
  'account_circle', 'group', 'person', 'handshake', 'waving_hand', 'terminal', 'verified', 'engineering', 'palette', 'school', 'balance', 'smart_toy',
  // Tools & tech
  'settings', 'build', 'lock', 'key', 'handyman', 'bolt', 'search', 'computer', 'psychology', 'rocket_launch', 'shield', 'language',
  // Content & docs
  'description', 'edit_note', 'draw', 'menu_book', 'library_books', 'attach_file', 'image', 'brush', 'sticky_note_2', 'square_foot', 'receipt', 'package_2',
  // Media
  'movie', 'videocam', 'photo_camera', 'mic', 'music_note', 'palette', 'video_camera_back', 'desktop_windows', 'headphones', 'tv', 'theater_comedy', 'sports_esports',
  // Time & nature
  'calendar_month', 'schedule', 'coffee', 'wb_twilight', 'dark_mode', 'star', 'local_fire_department', 'light_mode', 'water', 'eco', 'looks', 'ac_unit',
  // Misc
  'redeem', 'school', 'trophy', 'diamond', 'extension', 'storefront', 'celebration', 'check_circle', 'favorite', 'balance', 'target', 'auto_fix_high',
];

// ─── Component ────────────────────────────────────────────────────────────────

export default function ClientLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const [session, setSession] = useState<UserSession | null>(null);
  const [loading, setLoading] = useState(true);
  const [gamLevel, setGamLevel] = useState(1);
  const [gamXP, setGamXP] = useState(0);
  const [gamXPNext, setGamXPNext] = useState(100);
  const [gamStreak, setGamStreak] = useState(0);
  const [walletBalance, setWalletBalance] = useState<number | null>(null);
  const [sidebarExpanded, setSidebarExpanded] = useState(true);
  const [lowCreditDismissed, setLowCreditDismissed] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [activeAgentCount, setActiveAgentCount] = useState(1);
  // darkMode removed
  const [projects, setProjects] = useState<{ id: string; name: string; isDefault: boolean }[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [showProjectDropdown, setShowProjectDropdown] = useState(false);
  const [hasOnboarding, setHasOnboarding] = useState(true);
  const [publishedModules, setPublishedModules] = useState<{ id: string; name: string; slug: string; emoji: string }[]>([]);
  const [customAgents, setCustomAgents] = useState<{ id: string; name: string; emoji: string }[]>([]);

  // Menu customization
  const [menuSections, setMenuSections] = useState<SectionConfig[]>([]);
  const [deviceType, setDeviceType] = useState<'phone' | 'tablet' | 'desktop'>('desktop');
  const isDesktop = deviceType === 'desktop' || deviceType === 'tablet';
  const isPhone = deviceType === 'phone';
  const [isPro, setIsPro] = useState(false);
  const [notifUnreadCount, setNotifUnreadCount] = useState(0);
  const [customizeOpen, setCustomizeOpen] = useState(false);
  const [customizeTab, setCustomizeTab] = useState<'desktop' | 'mobile'>('desktop');
  const [editSections, setEditSections] = useState<SectionConfig[]>([]);
  const [editingEmoji, setEditingEmoji] = useState<{ sIdx: number; iIdx: number } | null>(null);
  const [editingLabel, setEditingLabel] = useState<{ sIdx: number; iIdx: number } | null>(null);
  const [editingSectionTitle, setEditingSectionTitle] = useState<number | null>(null);

  // New features state
  const [showQuickOnboarding, setShowQuickOnboarding] = useState(false);
  const [isOffline, setIsOffline] = useState(false);
  const [showPushBanner, setShowPushBanner] = useState(false);
  const [favoriteAgents, setFavoriteAgents] = useState<string[]>([]);

  // Drag-and-drop refs (no re-render needed)
  const sectionDragIdx = useRef<number | null>(null);
  const itemDragRef = useRef<{ sectionIdx: number; itemIdx: number } | null>(null);

  const refreshGamification = useCallback(() => {
    const gam = loadGamification();
    setGamLevel(gam.level);
    setGamXP(gam.xp);
    setGamXPNext(gam.xpToNext);
    setGamStreak(gam.streak);
  }, []);

  useEffect(() => {
    const w = window.innerWidth;
    const dt = w < 768 ? 'phone' : w <= 1024 ? 'tablet' : 'desktop';
    setDeviceType(dt);
    const desktop = dt !== 'phone';
    setCustomizeTab(desktop ? 'desktop' : 'mobile');

    const proStored = localStorage.getItem('fz_is_pro') === 'true';
    setIsPro(proStored);

    // Count unread notifications (3 system + potential alert, minus read ones)
    try {
      const readIds: string[] = JSON.parse(localStorage.getItem('fz_notif_read') ?? '[]');
      const SYSTEM_IDS = ['sys-v014', 'sys-stripe', 'sys-whatsapp'];
      const unread = SYSTEM_IDS.filter(id => !readIds.includes(id)).length;
      setNotifUnreadCount(unread);
    } catch { /* */ }

    setMenuSections(loadMenuSections(desktop, proStored));

    const stored = localStorage.getItem('fz_session');
    if (stored) {
      try {
        const s = JSON.parse(stored);
        setSession(s);
        loadWallet(s.token);
        const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3010';
        fetch(`${API_BASE}/portal/projects`, { headers: { Authorization: `Bearer ${s.token}` } })
          .then(r => { if (r.ok) return r.json(); throw new Error('fail'); })
          .then(data => {
            if (data.projects) {
              setProjects(data.projects);
              const storedProj = localStorage.getItem('fz_active_project');
              const defaultProj = data.projects.find((p: { isDefault: boolean }) => p.isDefault);
              setActiveProjectId(storedProj || defaultProj?.id || data.projects[0]?.id || null);
            }
          })
          .catch(() => {});
        fetch('/api/company', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ token: s.token, action: 'check' }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(data => { setHasOnboarding(!!data?.profile?.companyName); })
          .catch(() => {});
        // Load published modules for sidebar
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/modules', token: s.token }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data?.modules) {
              const published = (data.modules as { id: string; name: string; slug: string; emoji: string; is_published: boolean }[])
                .filter(m => m.is_published)
                .slice(0, 8); // max 8 in sidebar
              setPublishedModules(published.map(m => ({ id: m.id, name: m.name, slug: m.slug, emoji: m.emoji })));
            }
          })
          .catch(() => {});
        // Load custom agents for sidebar
        fetch('/api/portal', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ path: '/portal/agents/custom', token: s.token }),
        })
          .then(r => r.ok ? r.json() : null)
          .then(data => {
            if (data?.agents) {
              const visible = (data.agents as { id: string; name: string; emoji: string; visible_in_sidebar: boolean; is_active: boolean }[])
                .filter(a => a.visible_in_sidebar && a.is_active)
                .slice(0, 6); // max 6 in sidebar
              setCustomAgents(visible.map(a => ({ id: a.id, name: a.name, emoji: a.emoji })));
            }
          })
          .catch(() => {});
      } catch { /* corrupted session */ }
    }
    setLoading(false);
    refreshGamification();
    setActiveAgentCount(getActiveAgentIds().length);

    // Dark mode removed — always light

    // Resize listener — keep deviceType in sync + sidebar state
    const onResize = () => {
      const w2 = window.innerWidth;
      const newDt = w2 < 768 ? 'phone' as const : w2 <= 1024 ? 'tablet' as const : 'desktop' as const;
      setDeviceType(prev => {
        if (prev !== newDt) {
          // Phone: sidebar closed; tablet/desktop: sidebar open
          setSidebarExpanded(newDt !== 'phone');
        }
        return newDt;
      });
    };
    // Initial sync on mount
    if (window.innerWidth < 768) {
      setDeviceType('phone');
      setSidebarExpanded(false);
    } else if (window.innerWidth <= 1024) {
      setDeviceType('tablet');
      setSidebarExpanded(true);
    }
    window.addEventListener('resize', onResize);

    const interval = setInterval(refreshGamification, 30000);
    const onStorage = (e: StorageEvent) => {
      if (e.key === 'fz_session' && !e.newValue) {
        // Session removed (explicit logout) — clear state but don't redirect
        setSession(null);
        return;
      }
      if (e.key === 'fz_gamification') refreshGamification();
    };
    window.addEventListener('storage', onStorage);

    // ── New features init ──
    // Quick onboarding — disabled: the FreenzyWelcome popup handles first-time guidance
    // if (!localStorage.getItem('fz_quick_onboarding_done')) {
    //   setShowQuickOnboarding(true);
    // }
    // Push permission banner
    if (!localStorage.getItem('fz_push_permission_asked') && 'Notification' in window && Notification.permission === 'default') {
      setShowPushBanner(true);
    }
    // Favorite agents
    setFavoriteAgents(getFavorites());
    // Offline detection
    setIsOffline(!navigator.onLine);
    const goOffline = () => setIsOffline(true);
    const goOnline = () => setIsOffline(false);
    window.addEventListener('offline', goOffline);
    window.addEventListener('online', goOnline);
    // Register service worker
    registerServiceWorker();

    return () => {
      clearInterval(interval);
      window.removeEventListener('resize', onResize);
      window.removeEventListener('storage', onStorage);
      window.removeEventListener('offline', goOffline);
      window.removeEventListener('online', goOnline);
    };
  }, [refreshGamification]);

  // Refresh favorites when localStorage changes
  useEffect(() => {
    const onFavChange = () => setFavoriteAgents(getFavorites());
    window.addEventListener('storage', onFavChange);
    return () => window.removeEventListener('storage', onFavChange);
  }, []);

  // Close sidebar on navigation (phone only)
  useEffect(() => { if (deviceType === 'phone') setSidebarExpanded(false); }, [pathname, deviceType]);

  // Close sidebar on scroll (phone only)
  useEffect(() => {
    if (deviceType !== 'phone') return;
    const mainEl = document.querySelector('.client-main-content');
    if (!mainEl) return;
    const handleScroll = () => {
      if (sidebarExpanded) setSidebarExpanded(false);
    };
    mainEl.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => {
      mainEl.removeEventListener('scroll', handleScroll);
      window.removeEventListener('scroll', handleScroll);
    };
  }, [deviceType, sidebarExpanded]);

  // SSE — real-time notifications
  useEffect(() => {
    if (!session?.token) return;
    let es: EventSource | null = null;
    try {
      es = new EventSource(`/api/portal/sse?token=${encodeURIComponent(session.token)}`);
      es.addEventListener('notification', () => {
        setNotifUnreadCount(n => n + 1);
      });
      es.onerror = () => { es?.close(); };
    } catch { /* SSE not supported or blocked */ }
    return () => { es?.close(); };
  }, [session?.token]);

  useEffect(() => {
    try {
      const dismissed = localStorage.getItem('fz_low_credit_dismissed');
      if (dismissed && Date.now() - Number(dismissed) < 86400000) setLowCreditDismissed(true);
    } catch { /* */ }
  }, []);

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(o => !o);
        setSearchQuery('');
      }
      if (e.key === 'Escape') {
        setSearchOpen(false);
        setCustomizeOpen(false);
      }
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Detect mobile keyboard open/close to hide bottom nav
  useEffect(() => {
    if (typeof window === 'undefined' || !window.visualViewport) return;
    const vv = window.visualViewport;
    const onResize = () => {
      const keyboardOpen = vv.height < window.innerHeight * 0.75;
      document.documentElement.classList.toggle('keyboard-open', keyboardOpen);
    };
    vv.addEventListener('resize', onResize);
    return () => vv.removeEventListener('resize', onResize);
  }, []);

  async function loadWallet(token: string) {
    try {
      const res = await fetch('/api/portal', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ path: '/portal/wallet', token }),
      });
      if (res.status === 401) {
        // Token expired — clear session state but don't redirect (guest-friendly)
        localStorage.removeItem('fz_session');
        document.cookie = 'fz-token=; path=/; max-age=0';
        setSession(null);
        fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
          .catch(() => {});
        return;
      }
      if (!res.ok) return; // Non-401 errors: stay on page, wallet just won't show
      const data = await res.json();
      setWalletBalance(data.balance ?? data.wallet?.balance ?? 0);
    } catch { /* network error - stay on page */ }
  }

  function logout() {
    localStorage.removeItem('fz_session');
    document.cookie = 'fz-token=; path=/; max-age=0';
    fetch('/api/auth', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ action: 'logout' }) })
      .catch(() => {})
      .finally(() => { window.location.href = '/login'; });
  }

  function dismissLowCredit() {
    setLowCreditDismissed(true);
    try { localStorage.setItem('fz_low_credit_dismissed', String(Date.now())); } catch { /* */ }
  }

  // toggleDarkMode removed — always light theme

  // ─── Menu customization handlers ──────────────────────────────────────────

  function openCustomize() {
    const tab = isDesktop ? 'desktop' : 'mobile';
    setCustomizeTab(tab);
    setEditSections(JSON.parse(JSON.stringify(loadMenuSections(tab === 'desktop', isPro))));
    setCustomizeOpen(true);
  }

  function changeCustomizeTab(tab: 'desktop' | 'mobile') {
    setCustomizeTab(tab);
    setEditSections(JSON.parse(JSON.stringify(loadMenuSections(tab === 'desktop', isPro))));
  }

  function saveCustomize() {
    saveMenuSections(editSections, customizeTab === 'desktop');
    if ((customizeTab === 'desktop') === isDesktop) {
      setMenuSections(JSON.parse(JSON.stringify(editSections)));
    }
    setCustomizeOpen(false);
  }

  function resetCustomize() {
    setEditSections(JSON.parse(JSON.stringify(buildDefaultSections(isPro))));
  }

  function updateItemIcon(sIdx: number, iIdx: number, newIcon: string) {
    setEditSections(prev => prev.map((s, i) => {
      if (i !== sIdx) return s;
      return { ...s, items: s.items.map((item, j) => j === iIdx ? { ...item, icon: newIcon } : item) };
    }));
    setEditingEmoji(null);
  }

  function updateItemLabel(sIdx: number, iIdx: number, newLabel: string) {
    if (!newLabel.trim()) { setEditingLabel(null); return; }
    setEditSections(prev => prev.map((s, i) => {
      if (i !== sIdx) return s;
      return { ...s, items: s.items.map((item, j) => j === iIdx ? { ...item, label: newLabel.trim() } : item) };
    }));
    setEditingLabel(null);
  }

  function updateSectionTitle(sIdx: number, newTitle: string) {
    if (!newTitle.trim()) { setEditingSectionTitle(null); return; }
    setEditSections(prev => prev.map((s, i) => i === sIdx ? { ...s, title: newTitle.trim() } : s));
    setEditingSectionTitle(null);
  }

  function toggleSectionVisible(sIdx: number) {
    setEditSections(prev => prev.map((s, i) => i === sIdx ? { ...s, visible: !s.visible } : s));
  }

  function toggleItemVisible(sIdx: number, iIdx: number) {
    setEditSections(prev => prev.map((s, i) => {
      if (i !== sIdx) return s;
      return { ...s, items: s.items.map((item, j) => j === iIdx ? { ...item, visible: !item.visible } : item) };
    }));
  }

  function moveSectionUp(idx: number) {
    if (idx === 0) return;
    setEditSections(prev => {
      const next = [...prev];
      [next[idx - 1], next[idx]] = [next[idx], next[idx - 1]];
      next.forEach((s, i) => { s.order = i; });
      return next;
    });
  }

  function moveSectionDown(idx: number) {
    setEditSections(prev => {
      if (idx >= prev.length - 1) return prev;
      const next = [...prev];
      [next[idx], next[idx + 1]] = [next[idx + 1], next[idx]];
      next.forEach((s, i) => { s.order = i; });
      return next;
    });
  }

  function moveItemUp(sIdx: number, iIdx: number) {
    if (iIdx === 0) return;
    setEditSections(prev => prev.map((s, i) => {
      if (i !== sIdx) return s;
      const items = [...s.items];
      [items[iIdx - 1], items[iIdx]] = [items[iIdx], items[iIdx - 1]];
      items.forEach((it, j) => { it.order = j; });
      return { ...s, items };
    }));
  }

  function moveItemDown(sIdx: number, iIdx: number) {
    setEditSections(prev => prev.map((s, i) => {
      if (i !== sIdx) return s;
      if (iIdx >= s.items.length - 1) return s;
      const items = [...s.items];
      [items[iIdx], items[iIdx + 1]] = [items[iIdx + 1], items[iIdx]];
      items.forEach((it, j) => { it.order = j; });
      return { ...s, items };
    }));
  }

  // HTML5 DnD — sections
  function handleSectionDragStart(e: React.DragEvent, idx: number) {
    sectionDragIdx.current = idx;
    e.dataTransfer.effectAllowed = 'move';
  }
  function handleSectionDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
  }
  function handleSectionDrop(e: React.DragEvent, targetIdx: number) {
    e.preventDefault();
    const src = sectionDragIdx.current;
    if (src === null || src === targetIdx) return;
    setEditSections(prev => {
      const next = [...prev];
      const [removed] = next.splice(src, 1);
      next.splice(targetIdx, 0, removed);
      next.forEach((s, i) => { s.order = i; });
      return next;
    });
    sectionDragIdx.current = null;
  }

  // HTML5 DnD — items
  function handleItemDragStart(e: React.DragEvent, sIdx: number, iIdx: number) {
    itemDragRef.current = { sectionIdx: sIdx, itemIdx: iIdx };
    e.dataTransfer.effectAllowed = 'move';
    e.stopPropagation();
  }
  function handleItemDragOver(e: React.DragEvent) {
    e.preventDefault();
    e.stopPropagation();
  }
  function handleItemDrop(e: React.DragEvent, targetSIdx: number, targetIIdx: number) {
    e.preventDefault();
    e.stopPropagation();
    const src = itemDragRef.current;
    if (!src || src.sectionIdx !== targetSIdx || src.itemIdx === targetIIdx) return;
    setEditSections(prev => prev.map((s, i) => {
      if (i !== targetSIdx) return s;
      const items = [...s.items];
      const [removed] = items.splice(src.itemIdx, 1);
      items.splice(targetIIdx, 0, removed);
      items.forEach((it, j) => { it.order = j; });
      return { ...s, items };
    }));
    itemDragRef.current = null;
  }

  // In-sidebar restore buttons
  function restoreItem(sectionId: string, href: string) {
    setMenuSections(prev => {
      const next = prev.map(s => {
        if (s.id !== sectionId) return s;
        return { ...s, items: s.items.map(item => item.href === href ? { ...item, visible: true } : item) };
      });
      saveMenuSections(next, isDesktop);
      return next;
    });
  }

  function restoreSection(sectionId: string) {
    setMenuSections(prev => {
      const next = prev.map(s => s.id === sectionId ? { ...s, visible: true } : s);
      saveMenuSections(next, isDesktop);
      return next;
    });
  }

  // ─── Derived data ──────────────────────────────────────────────────────────

  const sortedSections = [...menuSections].sort((a, b) => a.order - b.order);
  const visibleSections = sortedSections.filter(s => s.visible);
  const hiddenSections = sortedSections.filter(s => !s.visible);
  const allNavItems = menuSections.flatMap(s => s.items.filter(item => item.href));
  const filteredLinks = searchQuery
    ? allNavItems.filter(l => l.label.toLowerCase().includes(searchQuery.toLowerCase()))
    : allNavItems;
  const activeProject = projects.find(p => p.id === activeProjectId);

  if (loading) {
    return (
      <div style={{ display: 'flex', minHeight: '100dvh', background: '#fff' }}>
        {/* Emoji rail skeleton — always visible */}
        <div style={{
          position: 'fixed', top: 0, left: 0, bottom: 0, width: 56,
          background: '#FFFFFF', borderRight: '1px solid #E5E5E5',
          zIndex: 9999, display: 'flex', flexDirection: 'column',
          alignItems: 'center', padding: '16px 0',
        }}>
          <div style={{ fontSize: 13, fontWeight: 800, color: '#1A1A1A' }}>f.</div>
        </div>
        <div style={{ flex: 1, marginLeft: deviceType === 'desktop' ? 296 : deviceType === 'tablet' ? 260 : 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ fontSize: 14, color: '#9B9B9B' }}>Chargement...</div>
        </div>
      </div>
    );
  }

  // Guest mode: if no session, still render the page (no redirect)
  // Auth-dependent features will check `session` before rendering

  // Check if admin is impersonating this session
  const isImpersonating = typeof window !== 'undefined' &&
    (() => { try { return JSON.parse(localStorage.getItem('fz_session') ?? '{}').impersonating === true; } catch { return false; } })();

  function exitImpersonation() {
    const backup = localStorage.getItem('fz_admin_session_backup');
    if (backup) {
      localStorage.setItem('fz_session', backup);
      localStorage.removeItem('fz_admin_session_backup');
    }
    window.location.href = '/admin';
  }

  return (
    <ToastProvider>
    {isImpersonating && (
      <div style={{
        position: 'fixed', top: 0, left: 0, right: 0, zIndex: 9999,
        background: '#ef4444', color: 'white',
        display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 16,
        padding: '8px 16px', fontSize: 13, fontWeight: 600,
      }}>
        <span>⚠️ MODE ADMIN — vous agissez en tant que {session?.displayName ?? session?.email}</span>
        <button
          onClick={exitImpersonation}
          style={{
            background: 'rgba(255,255,255,0.25)', border: '1px solid rgba(255,255,255,0.5)',
            color: 'white', padding: '3px 12px', borderRadius: 6, cursor: 'pointer', fontSize: 12, fontWeight: 700,
          }}
        >
          Quitter
        </button>
      </div>
    )}
    <div style={{ display: 'flex', minHeight: '100dvh', paddingTop: isImpersonating ? 40 : 0 }}>
      {/* Sidebar Overlay — click outside to close (phone only) */}
      {sidebarExpanded && isPhone && (
        <div
          className="sidebar-overlay active"
          onClick={() => setSidebarExpanded(false)}
        />
      )}

      {/* Emoji Rail — visible on desktop + phone (hidden on tablet via CSS) */}
      {deviceType !== 'tablet' && (() => {
        const navCtx = getCurrentNavContext(pathname, visibleSections);

        // On emoji click: open sidebar and scroll to that section
        function handleEmojiClick(sectionId: string) {
          setSidebarExpanded(true);
          // Scroll to section after sidebar renders
          requestAnimationFrame(() => {
            const el = document.getElementById(`nav-section-${sectionId}`);
            if (el) el.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
          });
        }

        return (
          <nav className="emoji-rail" style={{
            position: 'fixed', top: 0, left: 0, bottom: 0,
            width: 56, background: '#FFFFFF', borderRight: '1px solid #E5E5E5',
            display: 'flex', flexDirection: 'column', alignItems: 'center',
            zIndex: 9999, padding: '4px 0',
            overflowY: 'auto', overflowX: 'hidden',
            WebkitOverflowScrolling: 'touch',
          }}>
            <div className="emoji-rail-top">
              <button
                className="emoji-rail-btn"
                onClick={() => { if (!isDesktop) setSidebarExpanded(e => !e); }}
                title="Menu"
                style={{ fontSize: 13, fontWeight: 800, fontFamily: 'system-ui', color: '#1A1A1A' }}
              >
                f.
              </button>
            </div>
            <div className="emoji-rail-sections">
              {visibleSections.map(section => {
                const sEmoji = SECTION_EMOJIS[section.id] || '📌';
                const isCurrent = navCtx?.sectionId === section.id;
                return (
                  <div className="emoji-rail-section" key={section.id}>
                    <button
                      className={`emoji-rail-btn${isCurrent ? ' active' : ''}`}
                      onClick={() => handleEmojiClick(section.id)}
                      title={section.title}
                    >
                      {sEmoji}
                    </button>
                    {isCurrent && navCtx?.pageEmoji && (
                      <div className="emoji-rail-child" title={(() => {
                        const slug = pathname.replace('/client/', '').replace(/\//g, '-').replace(/-$/, '');
                        const meta = PAGE_META[slug] || PAGE_META[slug.split('-')[0]];
                        return meta?.title || '';
                      })()}>
                        {navCtx.pageEmoji}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
            <div className="emoji-rail-bottom">
              <button className="emoji-rail-btn" onClick={() => setSearchOpen(true)} title="Rechercher (Ctrl+K)">🔍</button>
              <Link href="/client/account" className="emoji-rail-btn" style={{ textDecoration: 'none' }} title="Mon compte" onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
                ⚙️
              </Link>
              <Link href="/client/notifications" className="emoji-rail-btn" style={{ textDecoration: 'none', position: 'relative' }} onClick={() => { setNotifUnreadCount(0); if (isPhone) setSidebarExpanded(false); }}>
                🔔
                {notifUnreadCount > 0 && (
                  <span style={{ position: 'absolute', top: 0, right: 0, minWidth: 16, height: 16, borderRadius: 8, background: '#ef4444', color: '#fff', fontSize: 9, fontWeight: 700, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '0 3px' }}>{notifUnreadCount}</span>
                )}
              </Link>
              <Link href={session ? '/client/account' : '/login'} className="emoji-rail-avatar" title={session ? (session.displayName || 'Mon compte') : 'Se connecter'} style={{ textDecoration: 'none', background: session ? undefined : '#1A1A1A', color: session ? undefined : '#fff' }} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
                {session ? (session.displayName || session.email || '?').slice(0, 2).toUpperCase() : '?'}
              </Link>
            </div>
          </nav>
        );
      })()}

      {/* Client Sidebar (expanded) */}
      <nav className={`client-sidebar${sidebarExpanded ? ' sidebar-expanded' : ''}`} style={{ background: '#fff', width: 240, borderRight: '1px solid #E5E5E5' }}>
        <div className="sidebar-header" style={{ padding: '8px 12px 4px' }}>
          <div style={{
            display: 'flex', alignItems: 'center', gap: 10, height: 44,
          }}>
            <Link href="/" style={{ textDecoration: 'none', display: 'flex', alignItems: 'baseline', gap: 4, flex: 1 }} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#1A1A1A', letterSpacing: '-0.02em' }}>freenzy.io</span>
              <span style={{ fontSize: 9, fontStyle: 'italic', color: '#9B9B9B' }}>Beta Test 1</span>
            </Link>
            {isPhone && (
              <button
                onClick={() => setSidebarExpanded(false)}
                title="Fermer le menu"
                style={{
                  width: 28, height: 28, borderRadius: '50%', border: '1px solid #E5E5E5',
                  background: '#fff', cursor: 'pointer', display: 'flex',
                  alignItems: 'center', justifyContent: 'center', fontSize: 13, flexShrink: 0,
                  color: '#6B6B6B',
                }}
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Project Selector — auth only */}
        {session && projects.length > 0 && (
          <div style={{ position: 'relative', margin: '0 16px 12px' }}>
            <button
              onClick={() => setShowProjectDropdown(!showProjectDropdown)}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                padding: '8px 12px', background: '#FAFAFA', border: '1px solid #E5E5E5', borderRadius: 8,
                fontSize: 12, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              <span style={{ fontWeight: 600, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                📁 {activeProject?.name || 'Projet'}
              </span>
              <span style={{ fontSize: 10, color: '#9B9B9B' }}>{showProjectDropdown ? '▲' : '▼'}</span>
            </button>
            {showProjectDropdown && (
              <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 50, background: '#fff', border: '1px solid #E5E5E5', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.08)', marginTop: 4 }}>
                {projects.map(proj => (
                  <button
                    key={proj.id}
                    onClick={() => { setActiveProjectId(proj.id); localStorage.setItem('fz_active_project', proj.id); setShowProjectDropdown(false); window.location.reload(); }}
                    style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: proj.id === activeProjectId ? '#F5F5F5' : 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12 }}
                  >
                    {proj.isDefault && <>⭐ </>}{proj.name}
                  </button>
                ))}
                <div style={{ borderTop: '1px solid #E5E5E5' }}>
                  <button
                    onClick={() => { setShowProjectDropdown(false); window.location.href = '/client/projects'; }}
                    style={{ display: 'block', width: '100%', padding: '8px 12px', textAlign: 'left', background: 'transparent', border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontSize: 12, color: '#1A1A1A', fontWeight: 600 }}
                  >
                    + Gérer les projets
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Favorite agents bar — auth only */}
        {session && favoriteAgents.length > 0 && (
          <div style={{ margin: '0 16px 12px', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 14 }}>⭐</span>
            {favoriteAgents.map(agId => {
              const ag = ALL_AGENTS.find(a => a.id === agId);
              if (!ag) return null;
              return (
                <Link
                  key={agId}
                  href={`/client/chat?agent=${agId}`}
                  title={ag.name}
                  onClick={() => { if (isPhone) setSidebarExpanded(false); }}
                  style={{
                    width: 32, height: 32, borderRadius: '50%',
                    background: '#FAFAFA', border: '1px solid #E5E5E5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    textDecoration: 'none', fontSize: 16, transition: 'transform 0.15s',
                  }}
                  onMouseEnter={e => (e.currentTarget.style.transform = 'scale(1.15)')}
                  onMouseLeave={e => (e.currentTarget.style.transform = 'scale(1)')}
                >
                  <span style={{ fontSize: 16 }}>{ag.emoji || '🤖'}</span>
                </Link>
              );
            })}
          </div>
        )}

        {/* Navigation — relative container for customize panel overlay */}
        <div className="sidebar-nav" style={{ position: 'relative', flex: 1, overflowY: 'auto', overflowX: 'hidden', WebkitOverflowScrolling: 'touch' }}>

          {/* Customize Panel */}
          {customizeOpen && (
            <div className="customize-panel">
              <div className="customize-panel-header">
                <span style={{ fontWeight: 700, fontSize: 13 }}>Personnaliser le menu</span>
                <button onClick={() => setCustomizeOpen(false)} className="customize-close-btn">✕</button>
              </div>

              {/* Device tabs */}
              <div className="customize-tabs">
                <button
                  className={`customize-tab${customizeTab === 'desktop' ? ' active' : ''}`}
                  onClick={() => changeCustomizeTab('desktop')}
                >
                  🖥️ Ordinateur
                </button>
                <button
                  className={`customize-tab${customizeTab === 'mobile' ? ' active' : ''}`}
                  onClick={() => changeCustomizeTab('mobile')}
                >
                  📱 Mobile
                </button>
              </div>

              {/* Sections list */}
              <div className="customize-scroll">
                {editSections.map((section, sIdx) => (
                  <div
                    key={section.id}
                    className="customize-section"
                    draggable={customizeTab === 'desktop'}
                    onDragStart={customizeTab === 'desktop' ? e => handleSectionDragStart(e, sIdx) : undefined}
                    onDragOver={customizeTab === 'desktop' ? handleSectionDragOver : undefined}
                    onDrop={customizeTab === 'desktop' ? e => handleSectionDrop(e, sIdx) : undefined}
                  >
                    <div className="customize-section-header">
                      {customizeTab === 'desktop'
                        ? <span className="drag-handle" title="Glisser pour réordonner">⠿</span>
                        : (
                          <div className="flex items-center gap-2">
                            <button className="updown-btn" onClick={() => moveSectionUp(sIdx)} disabled={sIdx === 0}>▲</button>
                            <button className="updown-btn" onClick={() => moveSectionDown(sIdx)} disabled={sIdx >= editSections.length - 1}>▼</button>
                          </div>
                        )}
                      {editingSectionTitle === sIdx ? (
                        <input
                          autoFocus
                          defaultValue={section.title}
                          onBlur={(e) => updateSectionTitle(sIdx, e.target.value)}
                          onKeyDown={(e) => { if (e.key === 'Enter') updateSectionTitle(sIdx, (e.target as HTMLInputElement).value); if (e.key === 'Escape') setEditingSectionTitle(null); }}
                          style={{ flex: 1, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', border: '1px solid #1A1A1A', borderRadius: 4, padding: '2px 6px', outline: 'none', background: '#fff', color: '#1A1A1A', fontFamily: 'inherit' }}
                        />
                      ) : (
                        <span
                          onClick={() => setEditingSectionTitle(sIdx)}
                          style={{ flex: 1, fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', cursor: 'text', borderRadius: 3, padding: '1px 4px' }}
                          title="Cliquer pour renommer"
                          className="edit-title-trigger"
                        >
                          {section.title}
                        </span>
                      )}
                      <button
                        className="eye-btn"
                        onClick={() => toggleSectionVisible(sIdx)}
                        title={section.visible ? 'Masquer la section' : 'Afficher la section'}
                      >
                        {section.visible ? '👁️' : '🚫'}
                      </button>
                    </div>

                    {/* Items */}
                    {section.items.map((item, iIdx) => (
                      <div
                        key={item.href}
                        className={`customize-item${!item.visible ? ' customize-item-hidden' : ''}`}
                        draggable={customizeTab === 'desktop'}
                        onDragStart={customizeTab === 'desktop' ? e => handleItemDragStart(e, sIdx, iIdx) : undefined}
                        onDragOver={customizeTab === 'desktop' ? handleItemDragOver : undefined}
                        onDrop={customizeTab === 'desktop' ? e => handleItemDrop(e, sIdx, iIdx) : undefined}
                      >
                        {customizeTab === 'desktop'
                          ? <span className="drag-handle" style={{ fontSize: 10 }} title="Glisser">⠿</span>
                          : (
                            <div className="flex items-center gap-1">
                              <button className="updown-btn" style={{ fontSize: 9 }} onClick={() => moveItemUp(sIdx, iIdx)} disabled={iIdx === 0}>▲</button>
                              <button className="updown-btn" style={{ fontSize: 9 }} onClick={() => moveItemDown(sIdx, iIdx)} disabled={iIdx >= section.items.length - 1}>▼</button>
                            </div>
                          )}
                        <span
                          onClick={() => setEditingEmoji(editingEmoji?.sIdx === sIdx && editingEmoji?.iIdx === iIdx ? null : { sIdx, iIdx })}
                          style={{ fontSize: 14, cursor: 'pointer', borderRadius: 4, padding: '0 2px', lineHeight: 1 }}
                          className="emoji-edit-trigger"
                          title="Changer l'icône"
                        >
                          {getNavEmoji(item.href)}
                        </span>
                        {editingEmoji?.sIdx === sIdx && editingEmoji?.iIdx === iIdx && (
                          <>
                            <div className="emoji-picker-backdrop" onClick={() => setEditingEmoji(null)} />
                            <div className="emoji-picker-popup">
                              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 2 }}>
                                {MATERIAL_ICON_PALETTE.map(emoji => (
                                  <button key={emoji} onClick={() => updateItemIcon(sIdx, iIdx, emoji)}
                                    className="emoji-pick-btn"
                                  >
                                    {emoji}
                                  </button>
                                ))}
                              </div>
                            </div>
                          </>
                        )}
                        {editingLabel?.sIdx === sIdx && editingLabel?.iIdx === iIdx ? (
                          <input
                            autoFocus
                            defaultValue={item.label}
                            onBlur={(e) => updateItemLabel(sIdx, iIdx, e.target.value)}
                            onKeyDown={(e) => { if (e.key === 'Enter') updateItemLabel(sIdx, iIdx, (e.target as HTMLInputElement).value); if (e.key === 'Escape') setEditingLabel(null); }}
                            className="label-edit-input"
                          />
                        ) : (
                          <span
                            onClick={() => setEditingLabel({ sIdx, iIdx })}
                            style={{ fontSize: 11, flex: 1, cursor: 'text', borderRadius: 3, padding: '1px 4px' }}
                            title="Cliquer pour renommer"
                            className="label-edit-trigger"
                          >
                            {item.label}
                          </span>
                        )}
                        <button
                          className="eye-btn"
                          style={{ fontSize: 12 }}
                          onClick={() => toggleItemVisible(sIdx, iIdx)}
                          title={item.visible ? 'Masquer' : 'Afficher'}
                        >
                          {item.visible ? '👁️' : '🚫'}
                        </button>
                      </div>
                    ))}
                  </div>
                ))}
              </div>

              {/* Actions */}
              <div className="customize-footer">
                <button onClick={resetCustomize} className="btn btn-ghost btn-xs">
                  Réinitialiser
                </button>
                <button onClick={saveCustomize} className="btn btn-xs" style={{ background: '#1A1A1A', color: '#fff' }}>
                  Enregistrer
                </button>
              </div>
            </div>
          )}

          {/* Normal nav — visible sections */}
          {visibleSections.map(section => {
            const sortedItems = [...section.items].sort((a, b) => a.order - b.order);
            const visibleItems = sortedItems.filter(item => item.visible);
            const hiddenItems = sortedItems.filter(item => !item.visible);
            return (
              <div key={section.id} id={`nav-section-${section.id}`} className="nav-section">
                <div className="nav-section-title" style={{ fontSize: 11, fontWeight: 600, color: '#9B9B9B', textTransform: 'none', letterSpacing: 'normal' }}>
                  <span className="section-emoji-label" style={{ fontSize: 12 }}>{SECTION_EMOJIS[section.id] || '📌'}</span> {section.title}
                </div>
                {visibleItems.map(item => {
                  const isActive = pathname === item.href || (item.href !== '/' && pathname.startsWith(item.href));
                  const isNotifications = item.href === '/client/notifications';
                  return (
                    <Link key={item.href} href={item.href} className={`nav-link${isActive ? ' nav-link-active' : ''}`}
                      onClick={() => { if (isNotifications) setNotifUnreadCount(0); if (isPhone) setSidebarExpanded(false); }}
                      style={{
                        minHeight: 32, fontSize: 13, fontWeight: isActive ? 500 : 400,
                        color: isActive ? '#1A1A1A' : '#6B6B6B',
                        ...(isActive ? {
                          borderLeft: '2px solid #1A1A1A',
                          background: 'rgba(0,0,0,0.04)',
                        } : {}),
                      }}
                    >
                      <span className="nav-icon"><span style={{ fontSize: 16 }}>{getNavEmoji(item.href)}</span></span>
                      <span style={{ flex: 1 }}>{item.label}</span>
                      {!session && AUTH_REQUIRED_HREFS.has(item.href) && (
                        <span style={{ fontSize: 10, opacity: 0.5, marginLeft: 2 }} title="Connexion requise">🔒</span>
                      )}
                      {isNotifications && notifUnreadCount > 0 && (
                        <span style={{
                          minWidth: 18, height: 18, borderRadius: 9, padding: '0 5px',
                          background: '#ef4444', color: '#fff', fontSize: 10, fontWeight: 700,
                          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                        }}>
                          {notifUnreadCount}
                        </span>
                      )}
                    </Link>
                  );
                })}
                {/* Hidden items — greyed out at bottom of section */}
                {hiddenItems.map(item => (
                  <div key={item.href} className="nav-link nav-link-hidden">
                    <span className="nav-icon" style={{ opacity: 0.4 }}><span style={{ fontSize: 16 }}>{getNavEmoji(item.href)}</span></span>
                    <span style={{ flex: 1 }}>{item.label}</span>
                    <button
                      onClick={() => restoreItem(section.id, item.href)}
                      className="nav-restore-btn"
                      title="Réafficher"
                    >+</button>
                  </div>
                ))}
              </div>
            );
          })}

          {/* Dynamic — Mes assistants personnalisés (auth only) */}
          {session && customAgents.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-title" style={{ fontSize: 11, fontWeight: 600, color: '#9B9B9B', textTransform: 'none', letterSpacing: 'normal' }}>
                <span className="section-emoji-label" style={{ fontSize: 12 }}>🤖</span> Mes assistants IA
              </div>
              {customAgents.map(agent => (
                  <Link key={agent.id} href="/client/agents" className={`nav-link${pathname === '/client/agents' ? ' nav-link-active' : ''}`} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
                    <span className="nav-icon"><span style={{ fontSize: 16 }}>🤖</span></span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{agent.name}</span>
                  </Link>
              ))}
              <Link href="/client/agents/create" className="nav-link" style={{ opacity: 0.7 }} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
                <span className="nav-icon"><span style={{ fontSize: 16 }}>➕</span></span>
                <span style={{ flex: 1 }}>Créer un assistant</span>
              </Link>
            </div>
          )}

          {/* Dynamic — Mes modules publiés (auth only) */}
          {session && publishedModules.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-title" style={{ fontSize: 11, fontWeight: 600, color: '#9B9B9B', textTransform: 'none', letterSpacing: 'normal' }}>
                <span className="section-emoji-label" style={{ fontSize: 12 }}>📦</span> Mes modules
              </div>
              {publishedModules.map(mod => {
                const href = `/client/modules/${mod.slug}`;
                const isActive = pathname === href;
                return (
                  <Link key={mod.id} href={href} className={`nav-link${isActive ? ' nav-link-active' : ''}`} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
                    <span className="nav-icon"><span style={{ fontSize: 16 }}>📦</span></span>
                    <span style={{ flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{mod.name}</span>
                  </Link>
                );
              })}
              <Link href="/client/modules/builder" className="nav-link" style={{ opacity: 0.7 }} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
                <span className="nav-icon"><span style={{ fontSize: 16 }}>➕</span></span>
                <span style={{ flex: 1 }}>Nouveau module</span>
              </Link>
            </div>
          )}

          {/* Statut — auth only */}
          {session && (
          <div className="nav-section">
            <div className="nav-section-title" style={{ fontSize: 11, fontWeight: 600, color: '#9B9B9B', textTransform: 'none', letterSpacing: 'normal' }}>
              <span className="section-emoji-label" style={{ fontSize: 12 }}>📊</span> Statut
            </div>
            <Link href="/client/account" className={`nav-link${pathname === '/client/account' ? ' nav-link-active' : ''}`} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
              <span className="nav-icon"><span style={{ fontSize: 16 }}>💳</span></span>
              <span style={{ flex: 1 }}>Crédits</span>
              <span style={{
                fontSize: 12, fontWeight: 800, marginLeft: 'auto',
                color: walletBalance !== null && walletBalance < 10_000_000 ? '#DC2626' : '#1A1A1A',
              }}>
                {walletBalance !== null ? (walletBalance / 1_000_000).toFixed(1) : '—'}
              </span>
            </Link>
            <Link href="/client/account" className="nav-link" onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
              <span className="nav-icon">
                <span style={{
                  display: 'inline-flex', width: 16, height: 16, borderRadius: 4,
                  alignItems: 'center', justifyContent: 'center',
                  background: '#1A1A1A', color: '#fff', fontSize: 9, fontWeight: 700,
                }}>{gamLevel}</span>
              </span>
              <span style={{ flex: 1 }}>Niv. {gamLevel} — {LEVEL_TITLES[gamLevel] ?? 'Maître'}</span>
              {gamStreak > 0 && (
                <span style={{ fontSize: 11, color: '#6B6B6B', marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 2 }}>🔥{gamStreak}j</span>
              )}
            </Link>
          </div>
          )}

          {/* Visitor CTA in sidebar */}
          {!session && (
            <div style={{ padding: '12px 10px' }}>
              <Link
                href="/login"
                style={{
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  gap: 6, fontSize: 13, fontWeight: 600,
                  background: '#1A1A1A', color: '#fff',
                  borderRadius: 8, padding: '10px 12px',
                  textDecoration: 'none', width: '100%',
                  transition: 'opacity 0.15s',
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.9')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
                onClick={() => { if (isPhone) setSidebarExpanded(false); }}
              >
                Ouvrir un compte gratuit
              </Link>
              <div style={{ textAlign: 'center', marginTop: 6 }}>
                <Link href="/login" style={{ fontSize: 11, color: '#9B9B9B', textDecoration: 'none' }} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
                  Déjà un compte ? Se connecter
                </Link>
              </div>
            </div>
          )}

          {/* Hidden sections — at the very bottom, greyed out */}
          {hiddenSections.length > 0 && (
            <div className="nav-section">
              <div className="nav-section-title" style={{ fontSize: 11, fontWeight: 600, color: '#9B9B9B', textTransform: 'none', letterSpacing: 'normal', opacity: 0.5 }}>
                <span className="section-emoji-label" style={{ fontSize: 12 }}>👁️</span> Sections masquées
              </div>
              {hiddenSections.map(section => (
                <div key={section.id} className="nav-link nav-link-hidden">
                  <span style={{ flex: 1, fontSize: 11 }}>{section.title}</span>
                  <button
                    onClick={() => restoreSection(section.id)}
                    className="nav-restore-btn"
                    title="Réafficher"
                  >+</button>
                </div>
              ))}
            </div>
          )}

          {/* Customize button — auth only */}
          {session && (
          <div style={{ padding: '8px 10px 4px' }}>
            <button
              onClick={openCustomize}
              style={{
                width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center',
                gap: 6, fontSize: 11, color: '#9B9B9B',
                background: '#fff', border: '1px dashed #E5E5E5',
                borderRadius: 8, padding: '5px 10px', cursor: 'pointer',
                fontFamily: 'inherit',
              }}
            >
              ⚙️ Personnaliser le menu
            </button>
          </div>
          )}
        </div>

        {/* Footer compact — avatar + name + settings + logout (or login link for guests) */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '8px 12px', paddingBottom: 'max(8px, env(safe-area-inset-bottom, 0px))', borderTop: '1px solid #E5E5E5', flexShrink: 0 }}>
          {session ? (
            <>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: '#FAFAFA', border: '1px solid #E5E5E5',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 11, fontWeight: 700, color: '#1A1A1A',
              }}>
                {(session.displayName || session.email || '?').slice(0, 2).toUpperCase()}
              </div>
              <span style={{ fontSize: 13, flex: 1, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#1A1A1A' }}>
                {session.displayName}
              </span>
              <Link href="/client/account" title="Paramètres" style={{ fontSize: 16, textDecoration: 'none', flexShrink: 0 }} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>⚙️</Link>
              <button onClick={logout} title="Déconnexion" style={{
                flexShrink: 0, background: 'none', border: 'none', cursor: 'pointer',
                fontSize: 14, color: '#9B9B9B', padding: '4px',
              }}>
                ⏻
              </button>
            </>
          ) : (
            <>
              <div style={{
                width: 28, height: 28, borderRadius: '50%', flexShrink: 0,
                background: '#1A1A1A',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: 12, color: '#fff',
              }}>?</div>
              <Link
                href="/login"
                style={{
                  fontSize: 12, fontWeight: 600, color: '#1A1A1A',
                  textDecoration: 'none', flex: 1,
                }}
                onClick={() => { if (isPhone) setSidebarExpanded(false); }}
              >
                Ouvrir un compte
              </Link>
              <Link href="/login" style={{ fontSize: 11, color: '#9B9B9B', textDecoration: 'none', flexShrink: 0 }} onClick={() => { if (isPhone) setSidebarExpanded(false); }}>
                Connexion
              </Link>
            </>
          )}
        </div>
      </nav>

      {/* Client Content */}
      <div className="client-main-content" onClick={() => { if (sidebarExpanded && isPhone) setSidebarExpanded(false); }}>
        <OfflineBanner />
        <PushPermissionBanner />
        {!hasOnboarding && pathname !== '/client/onboarding' && (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', background: '#FAFAFA', borderBottom: '1px solid #E5E5E5', fontSize: 12, flexWrap: 'wrap', gap: 4 }}>
            <span style={{ color: '#6B6B6B' }}>📋 Profil incomplet — complétez pour des résultats optimaux</span>
            <a href="/client/onboarding" style={{ color: '#1A1A1A', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap', marginLeft: 12, minHeight: 44, display: 'inline-flex', alignItems: 'center' }}>
              Compléter →
            </a>
          </div>
        )}
        {!lowCreditDismissed && walletBalance !== null && walletBalance < 50_000_000 && (
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '6px 16px', fontSize: 12,
            background: '#FAFAFA', borderBottom: '1px solid #E5E5E5',
          }}>
            <span style={{ color: '#6B6B6B' }}>
              {walletBalance < 10_000_000 ? '⚠️' : '⚡'} {Math.round(walletBalance / 1_000_000)} crédits restants
            </span>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <Link href="/client/account" style={{ color: '#1A1A1A', textDecoration: 'none', fontWeight: 600, whiteSpace: 'nowrap' }}>
                Recharger →
              </Link>
              <button onClick={dismissLowCredit} style={{ fontSize: 14, background: 'none', border: 'none', padding: '10px', minWidth: 44, minHeight: 44, cursor: 'pointer', color: '#9B9B9B', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>×</button>
            </div>
          </div>
        )}
        <div style={{ padding: '8px 16px 0', fontSize: 12, color: '#9B9B9B', display: 'flex', alignItems: 'center', gap: 4 }}>
          <Link href="/client/dashboard" style={{ textDecoration: 'none', color: '#9B9B9B' }}>🏠 Accueil</Link>
          {pathname !== '/client/dashboard' && (() => {
            const slug = pathname.replace('/client/', '').replace(/\//g, '-').replace(/-$/, '');
            const meta = PAGE_META[slug] || PAGE_META[slug.split('-')[0]];
            return meta ? <><span style={{ color: '#9B9B9B' }}>›</span><span style={{ color: '#6B6B6B' }}>{meta.title}</span></> : null;
          })()}
        </div>
        <div className="page-container">
          {!session && !loading && <VisitorBanner />}
          {children}
        </div>
      </div>

      {/* Bottom Tab Bar removed — emoji rail replaces it */}

      {/* Ctrl+K Search Modal */}
      {searchOpen && (
        <>
          <div onClick={() => setSearchOpen(false)} style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', zIndex: 999 }} />
          <div style={{
            position: 'fixed', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '90%', maxWidth: 480, zIndex: 1000,
            background: '#fff', borderRadius: 12,
            border: '1px solid #E5E5E5', boxShadow: '0 8px 30px rgba(0,0,0,0.08)', overflow: 'hidden',
          }}>
            <div style={{ padding: '12px 16px', borderBottom: '1px solid #E5E5E5' }}>
              <input
                autoFocus
                type="text"
                placeholder="Rechercher une page..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && filteredLinks.length > 0) {
                    window.location.href = filteredLinks[0].href;
                    setSearchOpen(false);
                  }
                }}
                style={{ width: '100%', fontSize: 15, border: 'none', outline: 'none', background: 'transparent', color: '#1A1A1A', fontFamily: 'inherit' }}
              />
            </div>
            <div style={{ maxHeight: 300, overflowY: 'auto' }}>
              {filteredLinks.map(link => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setSearchOpen(false)}
                  className="flex items-center gap-8 text-base"
                  style={{ padding: '12px 16px', minHeight: 44, textDecoration: 'none', color: '#1A1A1A', borderBottom: '1px solid #E5E5E5' }}
                  onMouseEnter={e => (e.currentTarget.style.background = '#F5F5F5')}
                  onMouseLeave={e => (e.currentTarget.style.background = 'transparent')}
                >
                  <span style={{ fontSize: 18 }}>{getNavEmoji(link.href)}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              {filteredLinks.length === 0 && (
                <div className="p-16 text-md text-muted" style={{ textAlign: 'center' }}>Aucun résultat</div>
              )}
            </div>
            <div className="text-xs text-muted" style={{ padding: '6px 16px', borderTop: '1px solid #E5E5E5' }}>
              Entrée pour naviguer | Echap pour fermer | Ctrl+K pour ouvrir
            </div>
          </div>
        </>
      )}
    </div>


    <OnboardingTour />
    <OnboardingCopilot />
    {showQuickOnboarding && (
      <QuickOnboarding
        onComplete={() => {
          setShowQuickOnboarding(false);
          try { localStorage.setItem('fz_quick_onboarding_done', 'true'); } catch { /* */ }
        }}
        onSkip={() => {
          setShowQuickOnboarding(false);
          try { localStorage.setItem('fz_quick_onboarding_done', 'true'); } catch { /* */ }
        }}
      />
    )}
    </ToastProvider>
  );
}
