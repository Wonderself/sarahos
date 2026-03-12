import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Pilotage Réseaux Sociaux IA — Automatisation Social Media | Freenzy.io',
  description: 'Automatisez vos réseaux sociaux avec l\'IA : génération de posts, planification, réponses automatiques. Instagram, LinkedIn, Facebook, X.',
  keywords: 'réseaux sociaux IA, social media automation, community management IA',
  alternates: { canonical: 'https://freenzy.io/fonctionnalites/social' },
  openGraph: {
    title: 'Pilotage Réseaux Sociaux IA — Automatisation Social Media',
    description: 'Automatisez vos réseaux sociaux avec l\'IA : génération de posts, planification, réponses automatiques. Instagram, LinkedIn, Facebook, X.',
    url: 'https://freenzy.io/fonctionnalites/social',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
