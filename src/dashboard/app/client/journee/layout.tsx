import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Ma Journée' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
