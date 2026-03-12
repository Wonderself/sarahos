import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discussions Profondes IA — Conversations Contextuelles | Freenzy.io',
  description: 'Des conversations IA avec mémoire contextuelle, multilingue, analyse de documents. L\'IA qui comprend votre contexte et s\'adapte à vos besoins.',
  keywords: 'discussions IA, conversation IA, chatbot entreprise, mémoire contextuelle',
  alternates: { canonical: 'https://freenzy.io/fonctionnalites/discussions' },
  openGraph: {
    title: 'Discussions Profondes IA — Conversations Contextuelles',
    description: 'Des conversations IA avec mémoire contextuelle, multilingue, analyse de documents. L\'IA qui comprend votre contexte et s\'adapte à vos besoins.',
    url: 'https://freenzy.io/fonctionnalites/discussions',
    siteName: 'Freenzy.io',
    type: 'website',
  },
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
