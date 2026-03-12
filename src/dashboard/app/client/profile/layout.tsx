import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mon Profil' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
