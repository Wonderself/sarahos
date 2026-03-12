import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'IA pour Cabinet — Secrétariat & Gestion de Rendez-vous | Freenzy.io',
  description: 'Répondeur IA pour cabinets : prise de rendez-vous 24/7, qualification des urgences, gestion du planning. Médical, juridique, comptable.',
  keywords: 'IA cabinet, secrétariat cabinet IA, prise rendez-vous IA, cabinet médical IA',
  alternates: { canonical: 'https://freenzy.io/cas/cabinet' },
  openGraph: {
    title: 'IA pour Cabinet — Secrétariat & Gestion de Rendez-vous',
    description: 'Répondeur IA pour cabinets : prise de rendez-vous 24/7, qualification des urgences, gestion du planning. Médical, juridique, comptable.',
    url: 'https://freenzy.io/cas/cabinet',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
