import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Mes Documents',
  description:
    'Génération de documents IA — Créez contrats, factures, rapports automatiquement avec Freenzy.io. 15+ modèles professionnels.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
