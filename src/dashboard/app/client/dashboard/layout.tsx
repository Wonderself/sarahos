import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tableau de Bord',
  description:
    'Tableau de bord Freenzy.io — Accédez gratuitement à votre espace de travail IA multi-agents. Gérez vos agents, documents, réseaux sociaux et plus. Sans inscription requise.',
  openGraph: {
    title: 'Tableau de Bord Freenzy.io — Espace de Travail IA Multi-Agents',
    description:
      'Accédez gratuitement à votre espace de travail IA multi-agents. Gérez vos agents, documents, réseaux sociaux et plus. Sans inscription requise.',
    url: 'https://freenzy.io/client/dashboard',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Freenzy.io — Tableau de Bord IA Multi-Agents' }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
