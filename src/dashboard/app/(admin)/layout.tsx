import AdminShell from '../../components/AdminShell';
import { ToastProvider } from '../../components/Toast';
import GlobalSearch from '../../components/GlobalSearch';

const navSections = [
  {
    title: null,
    links: [
      { href: '/admin', label: "Vue d'ensemble", icon: 'home' },
    ],
  },
  {
    title: 'Gestion',
    links: [
      { href: '/admin/users', label: 'Utilisateurs', icon: 'group' },
      { href: '/admin/billing', label: 'Facturation', icon: 'credit_card' },
      { href: '/admin/referrals', label: 'Parrainages', icon: 'handshake' },
      { href: '/admin/promo', label: 'Codes Promo', icon: 'confirmation_number' },
      { href: '/admin/repondeur', label: 'Répondeur', icon: 'call' },
      { href: '/admin/quotes', label: 'Devis & Entreprise', icon: 'business' },
      { href: '/admin/telephony', label: 'Téléphonie', icon: 'cell_tower' },
      { href: '/admin/financial', label: 'Finances P&L', icon: 'savings' },
    ],
  },
  {
    title: 'Pilotage',
    links: [
      { href: '/admin/projects', label: 'Projets', icon: 'folder' },
      { href: '/admin/modules', label: 'Modules', icon: 'extension' },
      { href: '/admin/campaigns', label: 'Campagnes', icon: 'campaign' },
      { href: '/admin/reveil', label: 'Réveils', icon: 'alarm' },
      { href: '/admin/custom-agents', label: 'Agents Custom', icon: 'build' },
      { href: '/admin/personal-agents', label: 'Agents Perso', icon: 'person' },
      { href: '/admin/documents', label: 'Documents', icon: 'description' },
    ],
  },
  {
    title: 'Analytics',
    links: [
      { href: '/admin/analytics', label: 'Vue globale', icon: 'bar_chart' },
      { href: '/admin/analytics/studio', label: 'Studio Analytics', icon: 'movie' },
      { href: '/admin/analytics/documents', label: 'Documents', icon: 'description' },
      { href: '/admin/analytics/voice', label: 'Voix & Visio', icon: 'mic' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { href: '/admin/studio', label: 'fal.ai Studio', icon: 'palette' },
    ],
  },
  {
    title: 'Système IA',
    links: [
      { href: '/admin/guardrails', label: 'Guardrails', icon: 'shield' },
      { href: '/admin/autopilot', label: 'Autopilot', icon: 'smart_toy' },
      { href: '/system/agents', label: 'Agents IA', icon: 'smart_toy' },
      { href: '/system/approvals', label: 'Approbations', icon: 'check_circle' },
      { href: '/system/tasks', label: 'Tâches', icon: 'assignment' },
      { href: '/system/crons', label: 'Cron Jobs', icon: 'schedule' },
      { href: '/system/autonomy', label: 'Autonomie IA', icon: 'psychology' },
      { href: '/system/events', label: 'Événements', icon: 'cell_tower' },
    ],
  },
  {
    title: 'Infrastructure',
    links: [
      { href: '/infra/health', label: 'Santé Système', icon: 'favorite' },
      { href: '/infra/avatar', label: 'Avatar & TTS', icon: 'face_retouching_natural' },
      { href: '/infra/metrics', label: 'Métriques', icon: 'trending_up' },
    ],
  },
  {
    title: 'Configuration',
    links: [
      { href: '/admin/setup', label: 'Setup & Onboarding', icon: 'check_circle' },
      { href: '/admin/tokens', label: 'Tokens & Tarifs', icon: 'toll' },
      { href: '/admin/diagnostics', label: 'Diagnostics', icon: 'search' },
      { href: '/admin/security', label: 'Sécurité & 2FA', icon: 'lock' },
      { href: '/admin/roadmap', label: 'Roadmap', icon: 'map' },
      { href: '/admin/guide', label: 'Guide', icon: 'menu_book' },
    ],
  },
  {
    title: 'Mon Espace',
    links: [
      { href: '/admin/chat', label: 'Chat IA', icon: 'chat' },
      { href: '/admin/my-studio', label: 'Studio Créatif', icon: 'movie' },
      { href: '/admin/my-agents', label: 'Mes Outils IA', icon: 'smart_toy' },
      { href: '/admin/my-documents', label: 'Mes Documents', icon: 'description' },
      { href: '/admin/my-strategy', label: "Plan d'attaque", icon: 'target' },
    ],
  },
  {
    title: 'Communication',
    links: [
      { href: '/admin/social', label: 'Réseaux Sociaux', icon: 'phone_iphone' },
      { href: '/admin/whatsapp-hub', label: 'WhatsApp Hub', icon: 'chat' },
      { href: '/admin/my-discussions', label: 'Discussions', icon: 'psychology' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <ToastProvider>
      <GlobalSearch />
      <AdminShell navSections={navSections}>
        {children}
      </AdminShell>
    </ToastProvider>
  );
}
