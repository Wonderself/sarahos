import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IA pour Immobilier — Gestion Locative & Visites Automatisées | Freenzy.io',
  description: 'Automatisez votre agence immobilière avec l\'IA : prise de rendez-vous, qualification de dossiers, gestion des urgences locataires 24/7.',
  keywords: 'IA immobilier, gestion locative IA, agence immobilière automatisation',
  alternates: { canonical: 'https://freenzy.io/cas/immobilier' },
  openGraph: {
    title: 'IA pour Immobilier — Gestion Locative & Visites Automatisées',
    description: 'Automatisez votre agence immobilière avec l\'IA : prise de rendez-vous, qualification de dossiers, gestion des urgences locataires 24/7.',
    url: 'https://freenzy.io/cas/immobilier',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
