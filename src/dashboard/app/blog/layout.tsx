import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Guides IA, Tutoriels & Retours d\'Expérience | Freenzy.io',
  description: 'Guides pratiques, tutoriels et cas d\'usage pour tirer le meilleur parti de l\'IA dans votre entreprise. Répondeur IA, outils spécialisés, automatisation, RGPD.',
  keywords: 'blog IA, guides IA entreprise, tutoriels IA PME, cas usage IA, automatisation IA, Freenzy blog',
  alternates: { canonical: 'https://freenzy.io/blog' },
  openGraph: {
    title: 'Blog Freenzy — Guides IA, Tutoriels & Retours d\'Expérience',
    description: 'Guides pratiques, tutoriels et cas d\'usage pour tirer le meilleur parti de l\'IA dans votre entreprise.',
    url: 'https://freenzy.io/blog',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return children;
}
