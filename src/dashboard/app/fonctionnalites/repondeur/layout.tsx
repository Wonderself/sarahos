import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Répondeur Intelligent IA — Freenzy.io | Ne Manquez Plus Aucun Appel avec l'Intelligence Artificielle",
  description: "Le répondeur intelligent IA de Freenzy.io transcrit, analyse et répond automatiquement à vos appels professionnels. Détection d'urgence, transfert intelligent, résumé instantané par WhatsApp. Compatible tous opérateurs. Intelligence artificielle Claude (Anthropic) pour des réponses naturelles et contextuelles. Idéal pour restaurants, cabinets médicaux, agences immobilières. Essai gratuit avec 50 crédits.",
  openGraph: {
    title: "Répondeur Intelligent IA — Freenzy.io | Ne Manquez Plus Aucun Appel",
    description: "Votre standard téléphonique IA répond 24h/24 avec une voix naturelle française. Transcription, qualification des leads, transfert intelligent et résumé instantané par WhatsApp ou email.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  alternates: {
    canonical: 'https://freenzy.io/fonctionnalites/repondeur',
  },
  keywords: ['répondeur intelligent', 'répondeur IA', 'standard téléphonique IA', 'accueil téléphonique automatique', 'intelligence artificielle appels', 'transcription appels', 'transfert intelligent', 'Freenzy', 'voix IA française', 'ElevenLabs', 'qualification leads', 'répondeur professionnel'],
};

export default function RepondeurLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
