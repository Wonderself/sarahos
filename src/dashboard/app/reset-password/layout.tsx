import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Réinitialisation du Mot de Passe — Freenzy.io',
  description: 'Réinitialisez votre mot de passe Freenzy.io en toute sécurité. Recevez un lien de réinitialisation par email. Processus sécurisé et conforme RGPD.',
  keywords: [
    'réinitialiser mot de passe Freenzy', 'mot de passe oublié Freenzy.io',
    'récupérer compte Freenzy', 'reset password Flashboard',
  ],
  openGraph: {
    title: 'Réinitialisation du Mot de Passe — Freenzy.io',
    description: 'Réinitialisez votre mot de passe Freenzy.io en toute sécurité. Processus conforme RGPD.',
    type: 'website',
    url: 'https://freenzy.io/reset-password',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: { canonical: 'https://freenzy.io/reset-password' },
};

export default function ResetPasswordLayout({ children }: { children: React.ReactNode }) {
  return children;
}
