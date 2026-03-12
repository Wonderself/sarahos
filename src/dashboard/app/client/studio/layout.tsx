import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Studio Créatif IA',
  description:
    "Studio créatif IA — Générez photos, vidéos et avatars avec l'intelligence artificielle. Fal.ai + D-ID intégrés.",
  openGraph: {
    title: 'Studio Créatif IA — Freenzy.io',
    description:
      "Générez photos, vidéos et avatars avec l'intelligence artificielle. Fal.ai + D-ID intégrés. Explorez gratuitement.",
    url: 'https://freenzy.io/client/studio',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: 'Freenzy.io — Studio Créatif IA' }],
  },
};

export default function StudioLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
