import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'WhatsApp AI — Agents IA par messagerie',
  description: 'Interagissez avec vos agents IA par WhatsApp. Notes vocales, commandes texte, repondeur intelligent 24h/24. Integration simple et securisee.',
  openGraph: {
    title: 'WhatsApp AI — Freenzy.io',
    description: 'Pilotez votre entreprise par WhatsApp. Notes vocales transcrites par Deepgram, traitees par Claude AI. Repondeur intelligent inclus.',
  },
};

export default function WhatsAppLayout({ children }: { children: React.ReactNode }) {
  return children;
}
