import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freenzy.io pour Restaurants — Automatisez Reservations, Commandes et Service Client avec l\'IA',
  description: 'Comment les restaurants utilisent Freenzy.io pour automatiser les reservations telephoniques, gerer les commandes, repondre aux avis clients et optimiser leur presence en ligne. Repondeur IA qui prend les reservations 24h/24, generation automatique de menus et cartes, gestion des avis Google et TripAdvisor. Etude de cas complete avec resultats chiffres. ROI moyen : 340%.',
  openGraph: {
    title: 'Freenzy.io pour Restaurants — Automatisez Reservations, Commandes et Service Client avec l\'IA',
    description: 'Comment les restaurants utilisent Freenzy.io pour automatiser les reservations telephoniques, gerer les commandes, repondre aux avis clients et optimiser leur presence en ligne. ROI moyen : 340%.',
    type: 'article',
    siteName: 'Freenzy.io',
  },
};

export default function CasRestaurantLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
