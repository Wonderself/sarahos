import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Répondeur Intelligent',
  description:
    'Répondeur téléphonique IA Freenzy.io — Ne manquez plus aucun appel. Accueil intelligent 24/7, transcription et résumé automatique.',
};

export default function Layout({ children }: { children: React.ReactNode }) {
  return children;
}
