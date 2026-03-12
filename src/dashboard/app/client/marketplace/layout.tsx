import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Marketplace Agents',
  description:
    "Marketplace d'agents IA Freenzy.io — 50+ modèles prêts à l'emploi pour automatiser votre entreprise. Templates gratuits et premium.",
  openGraph: {
    title: "Marketplace d'Agents IA — Freenzy.io",
    description:
      "50+ modèles d'agents IA prêts à l'emploi pour automatiser votre entreprise. Templates gratuits et premium. Explorez gratuitement.",
    url: 'https://freenzy.io/client/marketplace',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
    images: [{ url: '/opengraph-image', width: 1200, height: 630, alt: "Freenzy.io — Marketplace d'Agents IA" }],
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
