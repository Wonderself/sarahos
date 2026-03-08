import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifs & API — Gratuit, payez uniquement ce que vous utilisez | Freenzy.io',
  description: 'Freenzy.io : accès gratuit, 82+ agents IA, 0% de commission pour tous, à vie. Prix officiels des tokens IA au détail. Pas de minimum, pas d\'abonnement.',
  keywords: [
    'tarif API IA', 'prix action IA', 'coût répondeur IA', 'prix par token IA',
    'coût Claude Anthropic', 'prix GPT-4 entreprise', 'coût ElevenLabs TTS',
    'prix appel IA Twilio', 'coût image DALL-E', 'prix vidéo Runway',
    'calculateur crédit IA', 'combien coûte IA PME', 'tarif WhatsApp IA',
  ],
  openGraph: {
    title: 'Tarifs & API Freenzy — Prix par action IA détaillés',
    description: 'Chat, email, post social, appel répondeur, WhatsApp, voix TTS, image, vidéo. Tous les prix IA au détail, payez uniquement ce que vous utilisez.',
    type: 'website',
    url: 'https://freenzy.io/plans',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  alternates: { canonical: 'https://freenzy.io/plans' },
};

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return children;
}
