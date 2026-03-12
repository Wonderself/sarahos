import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arcade & Gamification IA — Quiz et Défis | Freenzy.io',
  description: 'L\'Arcade Freenzy : quiz, défis et jeux créés par l\'IA pour apprendre en s\'amusant. Créez vos propres quiz et partagez-les.',
  keywords: 'gamification IA, quiz IA, apprentissage ludique, jeux IA',
  alternates: { canonical: 'https://freenzy.io/fonctionnalites/arcade' },
  openGraph: {
    title: 'Arcade & Gamification IA — Quiz et Défis',
    description: 'L\'Arcade Freenzy : quiz, défis et jeux créés par l\'IA pour apprendre en s\'amusant. Créez vos propres quiz et partagez-les.',
    url: 'https://freenzy.io/fonctionnalites/arcade',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
