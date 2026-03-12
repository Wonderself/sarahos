import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freenzy.io propulsé par Claude (Anthropic) — Intelligence Artificielle de Pointe pour Votre Entreprise',
  description: 'Freenzy.io utilise Claude d\'Anthropic, l\'IA la plus avancée au monde : Haiku pour les tâches rapides, Sonnet pour la gestion quotidienne, Opus avec Extended Thinking pour les décisions stratégiques. Architecture 3 niveaux (L1 Exécution, L2 Management, L3 Direction). Agents IA capables de raisonnement profond, analyse contextuelle et prise de décision autonome.',
  keywords: [
    'Claude Anthropic entreprise', 'Claude Sonnet agents IA', 'Claude Opus Extended Thinking',
    'IA Anthropic France', 'meilleur modèle IA entreprise', 'Claude vs GPT-4',
    'intelligence artificielle avancée', 'IA raisonnement profond', 'Constitutional AI sécurité',
    'agent IA Claude Sonnet', 'agent IA Claude Opus', 'technologie Anthropic',
    'IA sécurisée RGPD', 'IA alignée éthique', 'Freenzy Claude',
  ],
  openGraph: {
    title: 'Freenzy.io propulsé par Claude AI d\'Anthropic',
    description: 'Architecture IA 3 niveaux : Claude Haiku (exécution rapide), Claude Sonnet (gestion quotidienne), Claude Opus avec Extended Thinking (décisions stratégiques). 34 agents spécialisés.',
    type: 'article',
    url: 'https://freenzy.io/claude',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freenzy.io propulsé par Claude AI — Anthropic',
    description: 'L\'IA la plus avancée au monde propulse vos agents : Sonnet pour la rapidité, Opus pour la réflexion stratégique avec Extended Thinking.',
  },
  alternates: { canonical: 'https://freenzy.io/claude' },
};

export default function ClaudeLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'TechArticle',
            headline: 'Freenzy.io propulsé par Claude AI d\'Anthropic — Architecture IA Multi-Niveaux',
            description: 'Article technique sur l\'architecture IA de Freenzy.io : utilisation de Claude Sonnet pour les tâches quotidiennes et Claude Opus avec Extended Thinking pour les décisions stratégiques.',
            author: { '@type': 'Organization', name: 'Freenzy.io', url: 'https://freenzy.io' },
            publisher: { '@type': 'Organization', name: 'Freenzy.io', url: 'https://freenzy.io' },
            datePublished: '2026-03-01',
            dateModified: '2026-03-12',
            mainEntityOfPage: 'https://freenzy.io/claude',
            about: [
              { '@type': 'Thing', name: 'Claude AI par Anthropic' },
              { '@type': 'Thing', name: 'Extended Thinking' },
              { '@type': 'Thing', name: 'Constitutional AI' },
              { '@type': 'Thing', name: 'Agents IA autonomes' },
            ],
            proficiencyLevel: 'Beginner',
            dependencies: 'Claude Sonnet, Claude Opus, Anthropic SDK',
          }),
        }}
      />
      {children}
    </>
  );
}
