import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freenzy.io pour l\'Immobilier — Automatisez Prospection, Visites et Suivi Client avec l\'IA',
  description: 'Comment les agences immobilieres utilisent Freenzy.io pour automatiser la qualification des prospects, organiser les visites, generer les mandats et compromis, et suivre les clients. Repondeur IA qualifiant les appels acheteurs/vendeurs 24h/24. Generation automatique de descriptifs de biens, estimations, mandats. Etude de cas avec resultats chiffres.',
  openGraph: {
    title: 'Freenzy.io pour l\'Immobilier — Automatisez Prospection, Visites et Suivi Client avec l\'IA',
    description: 'Comment les agences immobilieres utilisent Freenzy.io pour automatiser la qualification des prospects, organiser les visites, generer les mandats et suivre les clients. Repondeur IA 24h/24.',
    type: 'article',
    siteName: 'Freenzy.io',
  },
};

export default function CasImmobilierLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
