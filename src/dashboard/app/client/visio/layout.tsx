import { Metadata } from 'next';

export const metadata: Metadata = { title: 'Visioconférence' };

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
