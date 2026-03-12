import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réseaux Sociaux',
  description:
    'Gestion des réseaux sociaux par IA — Planifiez, générez et publiez vos posts automatiquement avec Freenzy.io. Calendrier éditorial intelligent.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
