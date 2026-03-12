import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Discussions Approfondies',
  description:
    "Discussions approfondies avec Claude Opus — Explorez des sujets complexes avec l'IA la plus avancée. 85+ templates, mode challenge.",
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
