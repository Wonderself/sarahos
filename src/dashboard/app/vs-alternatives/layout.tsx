import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freenzy.io vs Alternatives — Comparaison Make, Zapier, ChatGPT Plus | Pourquoi Choisir Freenzy',
  description: 'Comparaison détaillée entre Freenzy.io et les alternatives : Make/Zapier (automatisation), ChatGPT Plus (IA conversationnelle), agences traditionnelles. Freenzy.io combine 100 agents IA spécialisés, téléphonie intégrée (Twilio), génération de documents et gestion réseaux sociaux en une seule plateforme. Économisez jusqu\'à 80% par rapport aux solutions traditionnelles.',
  keywords: [
    'Freenzy vs ChatGPT', 'Freenzy vs Make', 'Freenzy vs Zapier',
    'alternative ChatGPT Plus entreprise', 'alternative Make automatisation',
    'comparaison IA entreprise', 'meilleure IA PME France',
    'plateforme IA multi-agents vs chatbot', 'agent IA vs assistant virtuel',
    'Freenzy vs agence traditionnelle', 'IA 0 commission comparaison',
    'automatisation entreprise IA France', 'outil IA tout-en-un',
  ],
  openGraph: {
    title: 'Freenzy.io vs Alternatives — Pourquoi Choisir Freenzy',
    description: '24 agents IA spécialisés, 0% commission, WhatsApp intégré, voix ElevenLabs. Comparaison avec ChatGPT Plus, Make/Zapier et agences traditionnelles.',
    type: 'article',
    url: 'https://freenzy.io/vs-alternatives',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freenzy.io vs ChatGPT, Make, Zapier — Comparaison Complète',
    description: 'Découvrez pourquoi Freenzy.io remplace ChatGPT Plus, Make et Zapier pour les entreprises françaises. 24 agents IA, 0% commission.',
  },
  alternates: { canonical: 'https://freenzy.io/vs-alternatives' },
};

export default function VsAlternativesLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Article',
            headline: 'Freenzy.io vs Alternatives : Comparaison Complète avec ChatGPT Plus, Make, Zapier et Agences',
            description: 'Analyse comparative détaillée entre Freenzy.io et les principales alternatives du marché pour l\'automatisation et l\'IA en entreprise.',
            author: { '@type': 'Organization', name: 'Freenzy.io', url: 'https://freenzy.io' },
            publisher: { '@type': 'Organization', name: 'Freenzy.io', url: 'https://freenzy.io' },
            datePublished: '2026-03-01',
            dateModified: '2026-03-12',
            mainEntityOfPage: 'https://freenzy.io/vs-alternatives',
            about: [
              { '@type': 'Thing', name: 'Intelligence artificielle pour entreprises' },
              { '@type': 'Thing', name: 'Automatisation business' },
              { '@type': 'Thing', name: 'Agents IA multi-fonctions' },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
