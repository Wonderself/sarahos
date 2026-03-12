import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Création Sur Mesure' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
