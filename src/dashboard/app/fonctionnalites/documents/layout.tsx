import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Générateur de Documents IA — Contrats, Devis, Factures | Freenzy.io',
  description: 'Générez automatiquement contrats, devis, factures et emails avec l\'IA. Templates personnalisables, conformité juridique, export PDF.',
  keywords: 'générateur documents IA, contrat IA, devis automatique, rédaction IA',
  alternates: { canonical: 'https://freenzy.io/fonctionnalites/documents' },
  openGraph: {
    title: 'Générateur de Documents IA — Contrats, Devis, Factures',
    description: 'Générez automatiquement contrats, devis, factures et emails avec l\'IA. Templates personnalisables, conformité juridique, export PDF.',
    url: 'https://freenzy.io/fonctionnalites/documents',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
