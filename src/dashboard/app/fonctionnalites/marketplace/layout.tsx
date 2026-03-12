import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace IA — 50+ Templates d\'Agents Prêts à l\'Emploi | Freenzy.io',
  description: 'Explorez la marketplace Freenzy : 50+ templates d\'agents IA créés par la communauté. Installez en 1 clic et déployez immédiatement.',
  keywords: 'marketplace IA, templates agents IA, agents prêts à emploi',
  alternates: { canonical: 'https://freenzy.io/fonctionnalites/marketplace' },
  openGraph: {
    title: 'Marketplace IA — 50+ Templates d\'Agents Prêts à l\'Emploi',
    description: 'Explorez la marketplace Freenzy : 50+ templates d\'agents IA créés par la communauté. Installez en 1 clic et déployez immédiatement.',
    url: 'https://freenzy.io/fonctionnalites/marketplace',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
