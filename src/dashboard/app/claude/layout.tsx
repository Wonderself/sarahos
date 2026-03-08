import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Powered by Claude AI — Technologie Anthropic',
  description: 'Freenzy.io utilise Claude d\'Anthropic : Sonnet pour la rapidite, Opus pour la reflexion avancee. Decouvrez la technologie derriere nos 34 agents IA.',
  openGraph: {
    title: 'Powered by Claude AI — Freenzy.io',
    description: 'Intelligence artificielle de pointe : Claude Sonnet pour 22 agents business rapides, Claude Opus pour la reflexion strategique avancee avec Extended Thinking.',
  },
};

export default function ClaudeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
