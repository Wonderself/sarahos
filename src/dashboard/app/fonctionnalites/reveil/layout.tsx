import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Réveil Intelligent IA — Freenzy.io | Briefing Personnalisé Chaque Matin avec l'Intelligence Artificielle",
  description: "Le réveil intelligent de Freenzy.io vous prépare un briefing matinal personnalisé : actualités, météo, agenda, tâches prioritaires, marchés financiers, motivation. 8 modes d'humeur, 18+ rubriques personnalisables. Voix naturelle ElevenLabs. L'assistant IA qui transforme votre routine matinale en avantage compétitif.",
  openGraph: {
    title: "Réveil Intelligent IA — Freenzy.io | Briefing Personnalisé Chaque Matin",
    description: "8 modes, 18 rubriques, votre assistant matinal IA. Recevez chaque matin un briefing personnalisé par appel vocal ou WhatsApp avec voix naturelle ElevenLabs.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  alternates: {
    canonical: 'https://freenzy.io/fonctionnalites/reveil',
  },
  keywords: ['réveil intelligent', 'briefing matinal IA', 'assistant matin', 'routine matinale', 'intelligence artificielle réveil', 'ElevenLabs voix', 'briefing personnalisé', 'Freenzy', 'actualités matin', 'météo agenda', 'productivité matinale', 'appel vocal IA'],
};

export default function ReveilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
