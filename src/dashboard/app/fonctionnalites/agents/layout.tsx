import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: '100 Agents IA Spécialisés — Marketing, Finance, RH | Freenzy.io',
  description: 'Découvrez les 100 agents IA spécialisés de Freenzy : marketing, finance, RH, commercial, juridique. Personnalisables et opérationnels en 10 minutes.',
  keywords: 'agents IA, agent IA entreprise, multi-agent IA, assistant virtuel PME',
  alternates: { canonical: 'https://freenzy.io/fonctionnalites/agents' },
  openGraph: {
    title: '100 Agents IA Spécialisés — Marketing, Finance, RH',
    description: 'Découvrez les 100 agents IA spécialisés de Freenzy : marketing, finance, RH, commercial, juridique. Personnalisables et opérationnels en 10 minutes.',
    url: 'https://freenzy.io/fonctionnalites/agents',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
