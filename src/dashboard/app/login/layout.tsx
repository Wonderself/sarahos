import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Connexion — Freenzy.io | Accédez à Votre Dashboard IA Multi-Agents',
  description: 'Connectez-vous à votre espace Freenzy.io pour accéder à vos 100 agents IA, votre répondeur intelligent, vos documents générés et votre calendrier éditorial. Inscription gratuite avec 50 crédits offerts. Choisissez votre agent d\'accueil personnalisé.',
  keywords: [
    'connexion Freenzy', 'login Flashboard', 'créer compte IA PME',
    'inscription Freenzy gratuit', 'compte IA entreprise', 's\'inscrire Flashboard',
    'dashboard IA multi-agents', 'agents IA gratuit', 'répondeur intelligent IA',
  ],
  openGraph: {
    title: 'Connexion — Freenzy.io | Accédez à Votre Dashboard IA Multi-Agents',
    description: 'Connectez-vous à votre espace Freenzy.io pour accéder à vos 100 agents IA. Inscription gratuite avec 50 crédits offerts.',
    type: 'website',
    url: 'https://freenzy.io/login',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: 'https://freenzy.io/login' },
};

export default function LoginLayout({ children }: { children: React.ReactNode }) {
  return children;
}
