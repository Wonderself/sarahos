import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Briefing Matinal IA — Votre Journée Résumée | Freenzy.io',
  description: 'Recevez chaque matin un briefing personnalisé par l\'IA : agenda, tâches prioritaires, actualités, métriques clés. Par email, WhatsApp ou vocal.',
  keywords: 'briefing matinal IA, résumé journée IA, assistant matinal, productivité',
  alternates: { canonical: 'https://freenzy.io/fonctionnalites/reveil' },
  openGraph: {
    title: 'Briefing Matinal IA — Votre Journée Résumée',
    description: 'Recevez chaque matin un briefing personnalisé par l\'IA : agenda, tâches prioritaires, actualités, métriques clés. Par email, WhatsApp ou vocal.',
    url: 'https://freenzy.io/fonctionnalites/reveil',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
