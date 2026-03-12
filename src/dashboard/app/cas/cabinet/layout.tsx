import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freenzy.io pour Cabinets — Automatisez Secretariat, Documents Juridiques et Suivi Dossiers avec l\'IA',
  description: 'Comment les cabinets d\'avocats, comptables et medicaux utilisent Freenzy.io pour automatiser le secretariat, generer des documents juridiques, gerer les rendez-vous et suivre les dossiers clients. Repondeur IA filtrant et qualifiant les appels. Generation automatique de conclusions, memoires, courriers. Conforme RGPD.',
  openGraph: {
    title: 'Freenzy.io pour Cabinets — Automatisez Secretariat, Documents Juridiques et Suivi Dossiers avec l\'IA',
    description: 'Comment les cabinets d\'avocats, comptables et medicaux utilisent Freenzy.io pour automatiser le secretariat, generer des documents juridiques et suivre les dossiers. Conforme RGPD.',
    type: 'article',
    siteName: 'Freenzy.io',
  },
};

export default function CasCabinetLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
