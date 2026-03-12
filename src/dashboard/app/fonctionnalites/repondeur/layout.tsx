import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Répondeur IA 24/7 — Standard Téléphonique Intelligent | Freenzy.io',
  description: 'Répondeur téléphonique IA qui répond à vos appels 24h/24 avec une voix française naturelle. Qualification automatique, prise de RDV, transcription temps réel. Dès 0.15€/appel.',
  keywords: 'répondeur IA, standard téléphonique IA, secrétariat téléphonique IA, répondeur intelligent',
  alternates: { canonical: 'https://freenzy.io/fonctionnalites/repondeur' },
  openGraph: {
    title: 'Répondeur IA 24/7 — Standard Téléphonique Intelligent',
    description: 'Répondeur téléphonique IA qui répond à vos appels 24h/24 avec une voix française naturelle. Qualification automatique, prise de RDV, transcription tem',
    url: 'https://freenzy.io/fonctionnalites/repondeur',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
