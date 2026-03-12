import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Espace Personnel' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
