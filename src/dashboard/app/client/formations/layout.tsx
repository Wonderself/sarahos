import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Formations',
  description:
    "Formations Freenzy.io — Apprenez à maîtriser l'IA pour votre entreprise. Tutoriels, guides et parcours de formation personnalisés.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
