import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: {
    default: 'SARAH OS — Répondeur Intelligent & 10 Agents IA pour PME',
    template: '%s | SARAH OS',
  },
  description: 'Répondeur téléphonique IA disponible 24h/24 + 10 agents IA spécialisés (Marketing, Finance, Commercial, RH, Juridique, Tech…). Sans abonnement, payez uniquement ce que vous utilisez. 50 crédits offerts.',
  keywords: [
    'répondeur intelligent', 'répondeur IA', 'agent IA entreprise', 'assistant virtuel PME',
    'secrétariat téléphonique IA', 'automatisation appels', 'IA pour entreprise',
    'Sarah OS', 'agents IA spécialisés', 'répondeur téléphonique automatique',
    'assistant IA marketing', 'assistant IA commercial', 'IA PME France',
    'intelligence artificielle entreprise', 'chatbot entreprise', 'IA Claude',
  ],
  openGraph: {
    title: 'SARAH OS — Répondeur Intelligent & 10 Agents IA pour PME',
    description: 'Ne manquez plus jamais un appel. Sarah répond 24h/24 avec intelligence. Découvrez 10 agents IA spécialisés pour gérer toute votre entreprise.',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'SARAH OS',
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: '/',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <head>
        <meta name="author" content="SARAH OS" />
        <meta name="geo.region" content="FR" />
        <link rel="icon" href="/images/logo.jpg" />
        <script dangerouslySetInnerHTML={{ __html: `try{var t=localStorage.getItem('sarah_theme');if(t)document.documentElement.setAttribute('data-theme',t)}catch(e){}` }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
