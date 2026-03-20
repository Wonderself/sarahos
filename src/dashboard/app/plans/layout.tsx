import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tarifs Freenzy.io — Crédits IA à la Consommation | 0% Commission, 50 Crédits Gratuits',
  description: 'Découvrez les tarifs transparents de Freenzy.io : système de crédits à la consommation sans abonnement obligatoire. 50 crédits offerts à l\'inscription. 0% de commission pour les 5000 premiers utilisateurs (verrouillé à vie). Appels IA dès 3 crédits, documents dès 2 crédits, posts réseaux sociaux dès 1 crédit. Comparez avec ChatGPT Plus et les assistants traditionnels. Offre Entreprise sur mesure.',
  keywords: [
    'tarif IA entreprise', 'prix crédits IA', 'coût agent IA', 'tarif Claude Anthropic',
    'prix token IA France', 'coût répondeur IA', 'prix WhatsApp IA business',
    'tarif ElevenLabs TTS', 'prix appel Twilio IA', 'coût image DALL-E Flux',
    'prix vidéo Runway ML', 'calculateur crédit IA', 'combien coûte IA PME',
    'alternative ChatGPT Plus prix', 'IA sans abonnement', '0 commission IA',
    'crédits IA gratuits', 'tarif IA pay as you go', 'Freenzy tarifs',
  ],
  openGraph: {
    title: 'Tarifs Freenzy.io — Crédits IA à la Consommation | 0% Commission',
    description: 'Système de crédits transparent : chat IA dès 0.5 crédit, email dès 1.1 crédit, document dès 3.5 crédits. 50 crédits offerts. 0% de commission pour tous, à vie. Sans abonnement.',
    type: 'website',
    url: 'https://freenzy.io/plans',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tarifs Freenzy.io — 0% Commission, Crédits IA à la Consommation',
    description: '50 crédits offerts. 0% de commission à vie. Payez uniquement ce que vous utilisez. 100+ agents IA spécialisés.',
  },
  alternates: { canonical: 'https://freenzy.io/plans' },
};

export default function PlansLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Product',
            name: 'Freenzy.io — Plateforme IA Multi-Outils',
            description: 'Plateforme IA avec 100+ outils IA spécialisés. Système de crédits à la consommation, 0% de commission. Téléphonie IA, WhatsApp Business, génération de documents, réseaux sociaux.',
            brand: { '@type': 'Brand', name: 'Freenzy.io' },
            url: 'https://freenzy.io/plans',
            offers: [
              {
                '@type': 'Offer',
                name: 'Gratuit — 50 crédits offerts',
                price: '0',
                priceCurrency: 'EUR',
                description: '50 crédits offerts à l\'inscription. Accès à tous les agents IA. 0% de commission.',
                availability: 'https://schema.org/InStock',
                url: 'https://freenzy.io/login?mode=register',
              },
              {
                '@type': 'Offer',
                name: 'Recharge 5€ — 500 crédits',
                price: '5.00',
                priceCurrency: 'EUR',
                description: '500 crédits IA. ~100 chats, ~45 emails, ~14 documents.',
                availability: 'https://schema.org/InStock',
              },
              {
                '@type': 'Offer',
                name: 'Recharge 20€ — 2 000 crédits (Populaire)',
                price: '20.00',
                priceCurrency: 'EUR',
                description: '2 000 crédits IA. Pack le plus populaire. 1M tokens/jour.',
                availability: 'https://schema.org/InStock',
              },
              {
                '@type': 'Offer',
                name: 'Recharge 50€ — 5 000 crédits',
                price: '50.00',
                priceCurrency: 'EUR',
                description: '5 000 crédits IA. 2M tokens/jour, idéal pour les professionnels.',
                availability: 'https://schema.org/InStock',
              },
              {
                '@type': 'Offer',
                name: 'Recharge 100€ — 10 000 crédits (Pro)',
                price: '100.00',
                priceCurrency: 'EUR',
                description: '10 000 crédits IA. 5M tokens/jour, ~2 500 requêtes/jour.',
                availability: 'https://schema.org/InStock',
              },
            ],
          }),
        }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: [
              { '@type': 'Question', name: "C'est vraiment gratuit ?", acceptedAnswer: { '@type': 'Answer', text: "Oui. L'acc\u00e8s \u00e0 la plateforme et \u00e0 tous les agents est gratuit. Vous ne payez que les tokens IA r\u00e9ellement consomm\u00e9s, \u00e0 prix co\u00fbtant. 0% de commission pour tous, \u00e0 vie." } },
              { '@type': 'Question', name: 'Comment fonctionnent les frais ?', acceptedAnswer: { '@type': 'Answer', text: "0% de commission pour tous les utilisateurs, \u00e0 vie. Vous payez uniquement le co\u00fbt brut des tokens IA au prix officiel du fournisseur (Anthropic, OpenAI, etc.)." } },
              { '@type': 'Question', name: 'Combien co\u00fbte une action type ?', acceptedAnswer: { '@type': 'Answer', text: "Un chat IA co\u00fbte ~0.5 cr\u00e9dit, un email ~1.1 cr, un document ~3.5 cr, un appel r\u00e9pondeur ~5 cr, une image ~8 cr. 1 cr\u00e9dit \u2248 0.01\u20ac." } },
              { '@type': 'Question', name: 'Quelle diff\u00e9rence avec ChatGPT Plus ?', acceptedAnswer: { '@type': 'Answer', text: "ChatGPT Plus : 20\u20ac/mois, 1 agent g\u00e9n\u00e9raliste. Freenzy.io : gratuit + usage, 34 agents business sp\u00e9cialis\u00e9s + 28 agents personnels, voix ElevenLabs, vid\u00e9o IA, photo IA, t\u00e9l\u00e9phonie Twilio." } },
              { '@type': 'Question', name: 'La s\u00e9curit\u00e9 des donn\u00e9es ?', acceptedAnswer: { '@type': 'Answer', text: "Chiffrement AES-256, conformit\u00e9 RGPD, h\u00e9bergement Europe. Isolation stricte des donn\u00e9es par compte. Claude (Anthropic) ne s'entra\u00eene pas sur vos donn\u00e9es." } },
              { '@type': 'Question', name: 'Une offre Entreprise ?', acceptedAnswer: { '@type': 'Answer', text: "Oui. White-Label SaaS : votre domaine, vos cl\u00e9s API, isolation compl\u00e8te des donn\u00e9es, SLA garanti, support d\u00e9di\u00e9. Disponible sur devis." } },
            ],
          }),
        }}
      />
      {children}
    </>
  );
}
