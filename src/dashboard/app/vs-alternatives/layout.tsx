import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freenzy vs Alternatives — Comparatif Complet IA pour PME | Freenzy.io',
  description: 'Comparatif détaillé : Freenzy vs les alternatives IA pour PME. Fonctionnalités, tarifs, modèles IA, support. Pourquoi choisir Freenzy ?',
  keywords: 'comparatif IA PME, alternative IA entreprise, Freenzy vs concurrent',
  alternates: { canonical: 'https://freenzy.io/vs-alternatives' },
  openGraph: {
    title: 'Freenzy vs Alternatives — Comparatif Complet IA pour PME',
    description: 'Comparatif détaillé : Freenzy vs les alternatives IA pour PME. Fonctionnalités, tarifs, modèles IA, support. Pourquoi choisir Freenzy ?',
    url: 'https://freenzy.io/vs-alternatives',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
