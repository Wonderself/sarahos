import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Freenzy.io sur WhatsApp Business — Gérez Votre Entreprise par WhatsApp avec l\'IA',
  description: 'Déployez vos agents IA Freenzy.io directement sur WhatsApp Business : répondeur automatique, prise de rendez-vous, envoi de documents, notes vocales transcrites, pipeline commercial. Intégration Twilio certifiée. Commandes texte et vocales. Notifications intelligentes. Gérez votre entreprise depuis WhatsApp, où que vous soyez.',
  keywords: [
    'WhatsApp Business IA', 'agent IA WhatsApp', 'répondeur WhatsApp automatique',
    'chatbot WhatsApp entreprise', 'WhatsApp Twilio intégration', 'notes vocales IA WhatsApp',
    'gestion entreprise WhatsApp', 'WhatsApp Business France', 'automatisation WhatsApp IA',
    'pipeline commercial WhatsApp', 'CRM WhatsApp IA', 'assistant WhatsApp intelligent',
    'Freenzy WhatsApp', 'Deepgram transcription vocale', 'ElevenLabs voix WhatsApp',
  ],
  openGraph: {
    title: 'Freenzy.io sur WhatsApp Business — Agents IA par Messagerie',
    description: 'Pilotez vos 34 agents IA par WhatsApp : messages texte, notes vocales, répondeur intelligent 24/7. Transcription Deepgram + Claude AI + voix ElevenLabs.',
    type: 'website',
    url: 'https://freenzy.io/whatsapp',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Freenzy.io sur WhatsApp Business — Gérez Votre Entreprise par IA',
    description: 'Notes vocales transcrites, répondeur IA 24/7, briefing quotidien, alertes en temps réel. Tout dans WhatsApp.',
  },
  alternates: { canonical: 'https://freenzy.io/whatsapp' },
};

export default function WhatsAppLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'SoftwareApplication',
            name: 'Freenzy.io — Agents IA sur WhatsApp Business',
            description: 'Intégration WhatsApp Business pour Freenzy.io : déployez vos agents IA directement sur WhatsApp. Répondeur automatique, notes vocales transcrites, pipeline commercial, notifications intelligentes.',
            applicationCategory: 'BusinessApplication',
            operatingSystem: 'WhatsApp',
            url: 'https://freenzy.io/whatsapp',
            offers: {
              '@type': 'Offer',
              price: '0',
              priceCurrency: 'EUR',
              description: 'WhatsApp Business inclus gratuitement. 0% de commission sur toutes les interactions.',
              availability: 'https://schema.org/InStock',
            },
            featureList: [
              'Messages texte aux agents IA',
              'Notes vocales transcrites par Deepgram',
              'Répondeur IA intelligent 24/7',
              'Briefing quotidien automatique',
              'Alertes et notifications en temps réel',
              'Pipeline commercial intégré',
              'Voix naturelle ElevenLabs',
              '34 agents IA spécialisés disponibles',
            ],
            author: { '@type': 'Organization', name: 'Freenzy.io', url: 'https://freenzy.io' },
          }),
        }}
      />
      {children}
    </>
  );
}
