import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Mon Compte' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
