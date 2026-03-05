import AdminShell from '../../components/AdminShell';
import { ToastProvider } from '../../components/Toast';
import GlobalSearch from '../../components/GlobalSearch';

const navSections = [
  {
    title: null,
    links: [
      { href: '/admin', label: "Vue d'ensemble", icon: '🏠' },
    ],
  },
  {
    title: 'Gestion',
    links: [
      { href: '/admin/users', label: 'Utilisateurs', icon: '👥' },
      { href: '/admin/billing', label: 'Facturation', icon: '💳' },
      { href: '/admin/referrals', label: 'Parrainages', icon: '🤝' },
      { href: '/admin/promo', label: 'Codes Promo', icon: '🎫' },
      { href: '/admin/repondeur', label: 'Répondeur', icon: '📞' },
      { href: '/admin/quotes', label: 'Devis & Entreprise', icon: '🏢' },
      { href: '/admin/telephony', label: 'Téléphonie', icon: '📡' },
      { href: '/admin/financial', label: 'Finances P&L', icon: '💰' },
    ],
  },
  {
    title: 'Pilotage',
    links: [
      { href: '/admin/projects', label: 'Projets', icon: '📁' },
      { href: '/admin/modules', label: 'Modules', icon: '🧩' },
      { href: '/admin/campaigns', label: 'Campagnes', icon: '📣' },
      { href: '/admin/reveil', label: 'Réveils', icon: '⏰' },
      { href: '/admin/custom-agents', label: 'Agents Custom', icon: '🛠️' },
      { href: '/admin/personal-agents', label: 'Agents Perso', icon: '👤' },
      { href: '/admin/documents', label: 'Documents', icon: '📄' },
    ],
  },
  {
    title: 'Analytics',
    links: [
      { href: '/admin/analytics', label: 'Vue globale', icon: '📊' },
      { href: '/admin/analytics/studio', label: 'Studio Analytics', icon: '🎬' },
      { href: '/admin/analytics/documents', label: 'Documents', icon: '📄' },
      { href: '/admin/analytics/voice', label: 'Voix & Visio', icon: '🎙️' },
    ],
  },
  {
    title: 'Studio',
    links: [
      { href: '/admin/studio', label: 'fal.ai Studio', icon: '🎨' },
    ],
  },
  {
    title: 'Système IA',
    links: [
      { href: '/admin/guardrails', label: 'Guardrails', icon: '🛡️' },
      { href: '/admin/autopilot', label: 'Autopilot', icon: '🤖' },
      { href: '/system/agents', label: 'Agents IA', icon: '🤖' },
      { href: '/system/approvals', label: 'Approbations', icon: '✅' },
      { href: '/system/tasks', label: 'Tâches', icon: '📋' },
      { href: '/system/crons', label: 'Cron Jobs', icon: '⏱️' },
      { href: '/system/autonomy', label: 'Autonomie IA', icon: '🧠' },
      { href: '/system/events', label: 'Événements', icon: '📡' },
    ],
  },
  {
    title: 'Infrastructure',
    links: [
      { href: '/infra/health', label: 'Santé Système', icon: '❤️' },
      { href: '/infra/avatar', label: 'Avatar & TTS', icon: '🎭' },
      { href: '/infra/metrics', label: 'Métriques', icon: '📈' },
    ],
  },
  {
    title: 'Configuration',
    links: [
      { href: '/admin/setup', label: 'Setup & Onboarding', icon: '✅' },
      { href: '/admin/tokens', label: 'Tokens & Tarifs', icon: '💡' },
      { href: '/admin/diagnostics', label: 'Diagnostics', icon: '🔍' },
      { href: '/admin/security', label: 'Sécurité & 2FA', icon: '🔒' },
      { href: '/admin/roadmap', label: 'Roadmap', icon: '🗺️' },
      { href: '/admin/guide', label: 'Guide', icon: '📖' },
    ],
  },
  {
    title: 'Mon Espace',
    links: [
      { href: '/admin/chat', label: 'Chat IA', icon: '💬' },
      { href: '/admin/my-studio', label: 'Studio Créatif', icon: '🎬' },
      { href: '/admin/my-agents', label: 'Mes Agents', icon: '🤖' },
      { href: '/admin/my-documents', label: 'Mes Documents', icon: '📄' },
      { href: '/admin/my-strategy', label: "Plan d'attaque", icon: '🎯' },
    ],
  },
  {
    title: 'Communication',
    links: [
      { href: '/admin/social', label: 'Réseaux Sociaux', icon: '📱' },
      { href: '/admin/whatsapp-hub', label: 'WhatsApp Hub', icon: '💬' },
      { href: '/admin/my-discussions', label: 'Discussions', icon: '🧠' },
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
