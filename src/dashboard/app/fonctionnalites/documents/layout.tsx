import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: "Génération de Documents IA — Freenzy.io | Créez Contrats, Factures et Rapports en 30 Secondes",
  description: "Générez automatiquement tous vos documents professionnels grâce à l'IA : contrats, factures, devis, rapports, présentations, emails formels, procès-verbaux, notes de synthèse. 15+ modèles prêts à l'emploi. Intelligence artificielle Claude pour une rédaction impeccable en français. Export PDF, Word, Markdown. Conforme RGPD.",
  openGraph: {
    title: "Génération de Documents IA — Freenzy.io | Créez Contrats, Factures et Rapports en 30 Secondes",
    description: "25 templates professionnels générés par IA. Emails, contrats, factures, CV, devis, rapports. Décrivez votre besoin et téléchargez le résultat en PDF ou Markdown. Conforme RGPD.",
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  alternates: {
    canonical: 'https://freenzy.io/fonctionnalites/documents',
  },
  keywords: ['génération documents IA', 'générateur contrats IA', 'facture automatique', 'devis IA', 'rédaction automatique', 'intelligence artificielle documents', 'template professionnel', 'export PDF', 'Freenzy', 'Claude Anthropic', 'RGPD', 'documents entreprise'],
};

export default function DocumentsLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
