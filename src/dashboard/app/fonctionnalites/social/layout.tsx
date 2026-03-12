import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Gestion Réseaux Sociaux IA — Freenzy.io | Automatisez Vos Posts Instagram, LinkedIn, Twitter, TikTok",
  description: "Automatisez votre présence sur les réseaux sociaux avec l'IA : création de contenu, planification éditoriale, analyse d'engagement. Compatible Instagram, LinkedIn, Twitter/X, TikTok, Facebook. Stratégie personnalisée par plateforme. Générateur de hashtags et légendes. Calendrier éditorial intelligent.",
  openGraph: {
    title: "Gestion Réseaux Sociaux IA — Freenzy.io | Automatisez Vos Posts sur Tous les Réseaux",
    description: "Posts, calendrier éditorial et analytics gérés par IA. Publiez du contenu engageant sur LinkedIn, Instagram, Twitter/X et TikTok, sans effort. Stratégie personnalisée par plateforme.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  alternates: {
    canonical: 'https://freenzy.io/fonctionnalites/social',
  },
  keywords: ['gestion réseaux sociaux IA', 'automatisation social media', 'community management IA', 'calendrier éditorial', 'création contenu IA', 'Instagram automatique', 'LinkedIn IA', 'Twitter automatique', 'TikTok IA', 'hashtags IA', 'Freenzy', 'planification posts'],
};

export default function SocialLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
