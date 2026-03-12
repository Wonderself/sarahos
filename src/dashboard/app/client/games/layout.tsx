import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Arcade & Jeux',
  description:
    "Arcade IA Freenzy.io — Jeux intelligents, défis et mini-games propulsés par l'intelligence artificielle.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
