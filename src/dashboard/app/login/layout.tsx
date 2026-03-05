import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion — Accédez à Flashboard | Freenzy.io',
  description: 'Connectez-vous à Flashboard ou créez votre compte gratuit. 72 agents IA disponibles immédiatement, sans carte bancaire.',
  keywords: [
    'connexion Freenzy', 'login Flashboard', 'créer compte IA PME',
    'inscription Freenzy gratuit', 'compte IA entreprise', 's\'inscrire Flashboard',
  ],
  openGraph: {
    title: 'Se connecter à Flashboard | Freenzy.io',
    description: 'Créez votre compte gratuit — sans carte bancaire. 72 agents IA disponibles immédiatement.',
    type: 'website',
    url: 'https://freenzy.io/login',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  robots: {
    index: true,
    follow: false, // Don't follow links from auth page
  },
  alternates: { canonical: 'https://freenzy.io/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
