import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Chat IA',
  description:
    'Chat IA Freenzy.io — Utilisez vos outils IA spécialisés en temps réel. Streaming SSE, contexte persistant.',
  openGraph: {
    title: 'Chat IA — Freenzy.io',
    description:
      'Utilisez vos outils IA spécialisés en temps réel. Streaming SSE, contexte persistant. Explorez gratuitement.',
    url: 'https://freenzy.io/client/chat',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Freenzy.io — Chat Multi-Agents IA' }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
