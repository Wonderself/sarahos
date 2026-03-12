import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes Agents IA',
  description:
    'Découvrez les 100 agents IA spécialisés de Freenzy.io — assistants pour documents, répondeur, social media, stratégie, comptabilité et plus. Explorez gratuitement.',
  openGraph: {
    title: '100 Agents IA Spécialisés — Freenzy.io',
    description:
      'Découvrez les 100 agents IA spécialisés de Freenzy.io — assistants pour documents, répondeur, social media, stratégie, comptabilité et plus. Explorez gratuitement.',
    url: 'https://freenzy.io/client/agents',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Freenzy.io — 100 Agents IA Spécialisés' }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
