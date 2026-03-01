import AdminShell from '../../components/AdminShell';

const navSections = [
  {
    title: null,
    links: [
      { href: '/', label: 'Overview', icon: '◎' },
    ],
  },
  {
    title: 'Admin',
    links: [
      { href: '/admin/users', label: 'Utilisateurs', icon: '◉' },
      { href: '/admin/billing', label: 'Facturation', icon: '◈' },
      { href: '/admin/financial', label: 'Finances', icon: '◆' },
      { href: '/admin/promo', label: 'Codes Promo', icon: '◇' },
      { href: '/admin/tokens', label: 'Tokens & Couts', icon: '◈' },
      { href: '/admin/roadmap', label: 'Roadmap', icon: '▹' },
      { href: '/admin/agents', label: 'Agents (noms)', icon: '◉' },
      { href: '/admin/control', label: 'Centre de Controle', icon: '◉' },
      { href: '/admin/guide', label: 'Guide', icon: '◈' },
    ],
  },
  {
    title: 'Systeme',
    links: [
      { href: '/system/agents', label: 'Agents IA', icon: '●' },
      { href: '/system/events', label: 'Evenements', icon: '○' },
      { href: '/system/approvals', label: 'Approbations', icon: '◐' },
      { href: '/system/autonomy', label: 'Autonomie', icon: '◑' },
      { href: '/system/tasks', label: 'Taches', icon: '◒' },
    ],
  },
  {
    title: 'Infra',
    links: [
      { href: '/infra/health', label: 'Infrastructure', icon: '▬' },
      { href: '/infra/memory', label: 'Memoire', icon: '▪' },
      { href: '/infra/metrics', label: 'Metriques', icon: '▫' },
      { href: '/infra/avatar', label: 'Avatar Pipeline', icon: '▸' },
    ],
  },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return (
    <AdminShell navSections={navSections}>
      {children}
    </AdminShell>
  );
}
