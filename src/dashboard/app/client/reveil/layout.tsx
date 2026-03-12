import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réveil Intelligent',
  description:
    'Réveil intelligent IA Freenzy.io — 8 modes de réveil personnalisés, 18 rubriques. Commencez chaque journée avec un briefing IA sur mesure.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
