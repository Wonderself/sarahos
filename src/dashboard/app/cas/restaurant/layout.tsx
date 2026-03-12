import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IA pour Restaurant — Réservations, Avis Google, Réseaux Sociaux | Freenzy.io',
  description: 'Comment un restaurant automatise 80% de sa gestion avec l\'IA : réservations 24/7, réponses aux avis Google, posts Instagram automatiques.',
  keywords: 'IA restaurant, réservation automatique, avis Google IA, restaurant automatisation',
  alternates: { canonical: 'https://freenzy.io/cas/restaurant' },
  openGraph: {
    title: 'IA pour Restaurant — Réservations, Avis Google, Réseaux Sociaux',
    description: 'Comment un restaurant automatise 80% de sa gestion avec l\'IA : réservations 24/7, réponses aux avis Google, posts Instagram automatiques.',
    url: 'https://freenzy.io/cas/restaurant',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
