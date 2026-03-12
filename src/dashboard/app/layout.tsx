import type { Metadata } from 'next';
import CookieConsent from '../components/CookieConsent';
import AnalyticsLoader from '../components/AnalyticsLoader';
import { getAllFaqItems } from '../lib/faq-data';
import './globals.css';

// ─── Constants ────────────────────────────────────────────────────────────────

const SITE_URL = 'https://freenzy.io';
const SITE_NAME = 'Freenzy.io';
const APP_NAME = 'Flashboard';
const TAGLINE = 'Free & Easy';
const DEFAULT_TITLE = 'Freenzy.io — Votre OS IA Multi-Agents pour Entreprise | 100 Agents IA, Automatisation Intelligente, 0% Commission';
const DEFAULT_DESCRIPTION =
  'Freenzy.io est la plateforme IA multi-agents qui automatise votre entreprise : répondeur téléphonique intelligent 24/7, génération de documents IA, gestion des réseaux sociaux, réveil personnalisé, 100 agents IA spécialisés (Marketing, Finance, Commercial, RH, Juridique, Vidéo, Photo). Toutes les IA du marché (Claude, GPT-4, Gemini, Llama, Grok, Mistral) au prix officiel. 0% de commission, sans abonnement. 50 crédits offerts. Essayez gratuitement dès maintenant.';

// ─── Metadata ─────────────────────────────────────────────────────────────────

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),

  title: {
    default: DEFAULT_TITLE,
    template: '%s | Freenzy.io',
  },
  description: DEFAULT_DESCRIPTION,

  keywords: [
    // Brand
    'Freenzy', 'Freenzy.io', 'Flashboard', 'freenzy io', 'Free and Easy', 'free easy IA',
    // Répondeur (high intent)
    'répondeur IA', 'répondeur téléphonique IA', 'répondeur intelligent',
    'secrétaire IA', 'secrétariat téléphonique IA', 'répondeur automatique IA',
    'répondeur vocal intelligent', 'standard téléphonique IA', 'répondeur 24h24',
    'répondeur PME', 'accueil téléphonique automatisé', 'ne plus manquer appel',
    // Agents
    'agent IA entreprise', 'assistant virtuel PME', '100 agents IA',
    'multi-agent IA', 'agent IA spécialisé', 'OS IA entreprise',
    'agent marketing IA', 'agent commercial IA', 'agent RH IA',
    'agent finance IA', 'agent juridique IA', 'agent vidéo IA',
    'agent photo IA', 'agent communication IA', 'agent comptable IA',
    'plateforme multi-agents', 'SaaS IA entreprise', 'IA multi-agents France',
    // Automatisation
    'automatisation IA', 'automatisation entreprise', 'IA pour PME',
    'IA PME France', 'intelligence artificielle entreprise France',
    'automatisation appels', 'social media automation IA',
    'génération contenu IA', 'WhatsApp IA entreprise',
    'génération documents IA', 'gestion réseaux sociaux IA',
    'productivité IA', 'transformation digitale IA', 'IA bureau',
    // Cas d\'usage
    'IA restaurant', 'IA immobilier', 'IA cabinet', 'IA avocat',
    'IA médecin', 'IA artisan', 'IA freelance', 'IA commerçant',
    'réveil intelligent IA', 'WhatsApp business IA',
    // Modèles
    'Claude Anthropic', 'GPT-4 entreprise', 'Gemini entreprise',
    'Llama Meta', 'Grok xAI', 'Mistral IA France',
    'tous les modèles IA', 'meilleurs modèles IA 2026',
    'Claude AI', 'Anthropic', 'OpenAI', 'Google AI',
    // Business value
    'sans abonnement IA', 'pay as you go IA', 'IA 0% commission',
    'prix officiel IA', 'IA pas cher PME', 'démarrer IA gratuitement',
    'IA gratuit PME', 'chatbot PME', 'IA tout-en-un entreprise',
    'essai gratuit IA', '50 crédits offerts', 'IA sans carte bancaire',
    'alternative ChatGPT entreprise', 'meilleure IA entreprise 2026',
  ],

  authors: [{ name: SITE_NAME, url: SITE_URL }],
  creator: SITE_NAME,
  publisher: SITE_NAME,
  applicationName: APP_NAME,
  generator: 'Next.js',
  referrer: 'origin-when-cross-origin',

  formatDetection: { email: false, address: false, telephone: false },

  // Open Graph
  openGraph: {
    title: 'Freenzy.io — Votre OS IA Multi-Agents pour Entreprise | 100 Agents IA Spécialisés',
    description:
      'Automatisez votre entreprise avec 100 agents IA : répondeur téléphonique intelligent 24/7, génération de documents, gestion des réseaux sociaux, réveil personnalisé. Toutes les IA (Claude, GPT-4, Gemini, Mistral). 0% commission, 50 crédits offerts.',
    type: 'website',
    url: SITE_URL,
    locale: 'fr_FR',
    siteName: SITE_NAME,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Freenzy.io — Plateforme IA Multi-Agents pour Entreprise | 100 Agents IA',
        type: 'image/png',
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: 'summary_large_image',
    site: '@freenzyio',
    creator: '@freenzyio',
    title: 'Freenzy.io — OS IA Multi-Agents pour Entreprise | 100 Agents IA',
    description:
      'Automatisez votre entreprise avec 100 agents IA. Répondeur intelligent 24/7, documents, réseaux sociaux, réveil. Toutes les IA du marché. 0% commission, 50 crédits offerts.',
    images: [{ url: '/opengraph-image', alt: 'Freenzy.io — Tableau de bord Flashboard avec 100 agents IA specialises pour automatiser la gestion d\'entreprise' }],
  },

  // Robots
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },

  // Canonical
  alternates: { canonical: SITE_URL },

  // Verification
  verification: {
    google: 'PLACEHOLDER_GOOGLE_VERIFICATION',
  },

  category: 'technology',
  classification: 'Business Software, Artificial Intelligence, SaaS',
};

// ─── JSON-LD Structured Data ──────────────────────────────────────────────────

const jsonLd = {
  '@context': 'https://schema.org',
  '@graph': [
    // Organization
    {
      '@type': 'Organization',
      '@id': `${SITE_URL}/#organization`,
      name: SITE_NAME,
      alternateName: ['Freenzy', 'Flashboard', 'Freenzy IO'],
      slogan: TAGLINE,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        '@id': `${SITE_URL}/#logo`,
        url: `${SITE_URL}/images/logo.jpg`,
        width: 200,
        height: 200,
        caption: SITE_NAME,
      },
      image: `${SITE_URL}/images/logo.jpg`,
      description: 'Freenzy.io est la plateforme française d\'intelligence artificielle multi-agents pour l\'automatisation d\'entreprise. 100 agents IA spécialisés propulsés par Claude (Anthropic).',
      foundingDate: '2025',
      inLanguage: 'fr-FR',
      areaServed: {
        '@type': 'GeoCircle',
        geoMidpoint: { '@type': 'GeoCoordinates', latitude: 46.603354, longitude: 1.888334 },
        description: 'France et pays francophones',
      },
      address: { '@type': 'PostalAddress', addressCountry: 'FR' },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer service',
          availableLanguage: [
            { '@type': 'Language', name: 'French' },
            { '@type': 'Language', name: 'English' },
          ],
          url: `${SITE_URL}/login`,
        },
      ],
      sameAs: ['https://linkedin.com/company/freenzy', 'https://twitter.com/freenzyio'],
      knowsAbout: [
        'Intelligence Artificielle', 'Automatisation d\'entreprise', 'Agents IA',
        'Chatbot', 'Répondeur téléphonique IA', 'WhatsApp Business',
        'Génération de documents', 'Gestion des réseaux sociaux',
      ],
      offers: {
        '@type': 'Offer',
        description: '50 crédits IA offerts à l\'inscription, 0% commission pour les 5000 premiers utilisateurs',
      },
      numberOfEmployees: { '@type': 'QuantitativeValue', value: 100, unitText: 'agents IA' },
    },

    // SoftwareApplication
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: 'Freenzy.io - Flashboard',
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Artificial Intelligence Platform',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: 'Plateforme IA multi-agents pour automatiser la gestion d\'entreprise : répondeur intelligent, génération de documents, gestion des réseaux sociaux, réveil personnalisé. 100 agents IA spécialisés propulsés par Claude (Anthropic). Intégration WhatsApp Business, téléphonie Twilio, voix ElevenLabs.',
      inLanguage: 'fr-FR',
      isAccessibleForFree: true,
      softwareVersion: '0.17.0',
      releaseNotes: 'Deep Discussions, 100 agents IA, Studio Créatif, Arcade & Gamification',
      datePublished: '2025-01-01',
      dateModified: '2026-03-12',
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: 'Inscription gratuite avec 50 crédits offerts. Crédits supplémentaires à la consommation. 0% commission pour les 5000 premiers utilisateurs.',
          availability: 'https://schema.org/InStock',
          priceValidUntil: '2027-12-31',
          url: `${SITE_URL}/login?mode=register`,
        },
        {
          '@type': 'Offer',
          name: 'Recharge 5€',
          price: '5',
          priceCurrency: 'EUR',
          description: '500 crédits IA — pay as you go, 0% commission',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/plans`,
        },
        {
          '@type': 'Offer',
          name: 'Recharge 20€ — Populaire',
          price: '20',
          priceCurrency: 'EUR',
          description: '2 000 crédits IA — pack le plus populaire, 0% commission',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/plans`,
        },
        {
          '@type': 'Offer',
          name: 'Recharge 50€ — Premium',
          price: '50',
          priceCurrency: 'EUR',
          description: '5 000 crédits IA — pack premium, 0% commission',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/plans`,
        },
        {
          '@type': 'Offer',
          name: 'Recharge 100€ — Pro',
          price: '100',
          priceCurrency: 'EUR',
          description: '10 000 crédits IA — pack pro, 0% commission',
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/plans`,
        },
      ],
      featureList: [
        '100 agents IA spécialisés',
        'Répondeur téléphonique intelligent 24/7',
        'Génération automatique de documents',
        'Gestion des réseaux sociaux',
        'Réveil intelligent personnalisé',
        'Intégration WhatsApp Business',
        'Discussions approfondies avec IA',
        'Studio photo et vidéo IA',
        'Marketplace d\'agents',
        'Multi-projets avec isolation complète',
        'Claude Anthropic (Haiku, Sonnet, Opus)',
        'GPT-4o, o3, GPT-4.5 (OpenAI)',
        'Gemini Flash, Pro, Ultra (Google)',
        'Llama 4 (Meta)',
        'Grok 3 (xAI)',
        'Mistral (France)',
        'ElevenLabs TTS voix naturelle',
        'Twilio SMS, appels, WhatsApp',
        'Sans abonnement — pay as you go',
        '0% commission à vie pour les early adopters',
      ],
      screenshot: `${SITE_URL}/og-image.png`,
      /* aggregateRating removed — no verified reviews yet */
      author: { '@id': `${SITE_URL}/#organization` },
      publisher: { '@id': `${SITE_URL}/#organization` },
    },

    // WebSite with SearchAction
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: APP_NAME,
      url: SITE_URL,
      description: 'Plateforme IA multi-agents pour l\'automatisation d\'entreprise',
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'fr-FR',
      copyrightYear: 2026,
      copyrightHolder: { '@id': `${SITE_URL}/#organization` },
      potentialAction: {
        '@type': 'SearchAction',
        target: {
          '@type': 'EntryPoint',
          urlTemplate: `${SITE_URL}/search?q={search_term_string}`,
        },
        'query-input': 'required name=search_term_string',
      },
    },

    // BreadcrumbList — aide Google à comprendre la structure
    {
      '@type': 'BreadcrumbList',
      '@id': `${SITE_URL}/#breadcrumb`,
      itemListElement: [
        { '@type': 'ListItem', position: 1, name: 'Accueil', item: SITE_URL },
        { '@type': 'ListItem', position: 2, name: 'Démo', item: `${SITE_URL}/demo` },
        { '@type': 'ListItem', position: 3, name: 'Tarifs', item: `${SITE_URL}/plans` },
        { '@type': 'ListItem', position: 4, name: 'API', item: `${SITE_URL}/tarifs-api` },
        { '@type': 'ListItem', position: 5, name: 'FAQ', item: `${SITE_URL}/#faq` },
      ],
    },

    // FAQPage (homepage) — 100+ questions for SEO
    {
      '@type': 'FAQPage',
      '@id': `${SITE_URL}/#faq`,
      mainEntity: getAllFaqItems().map(faq => ({
        '@type': 'Question',
        name: faq.q,
        acceptedAnswer: {
          '@type': 'Answer',
          text: faq.a,
        },
      })),
    },
  ],
};

// ─── Layout ───────────────────────────────────────────────────────────────────

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <head>
        {/* Identity */}
        <meta name="author" content={SITE_NAME} />
        <meta name="geo.region" content="FR" />
        <meta name="geo.placename" content="France" />
        <meta name="language" content="French" />
        <meta name="content-language" content="fr" />

        {/* Viewport — critical for mobile rendering */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, viewport-fit=cover" />

        {/* PWA / mobile */}
        <meta name="theme-color" content="#7c3aed" />
        <meta name="mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="default" />
        <meta name="apple-mobile-web-app-title" content={APP_NAME} />
        <meta name="application-name" content={APP_NAME} />

        {/* PWA Manifest */}
        <link rel="manifest" href="/manifest.json" />

        {/* Icons */}
        <link rel="icon" href="/images/logo.jpg" sizes="any" />
        <link rel="apple-touch-icon" href="/images/logo.jpg" />
        <link rel="shortcut icon" href="/images/logo.jpg" />

        {/* Google Fonts — Inter (body + display) + Material Symbols (icons) */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        {/* Text fonts: swap (show fallback immediately) */}
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&display=swap" rel="stylesheet" />
        {/* Material Symbols: block (invisible until loaded — prevents icon names showing as text) */}
        <link href="https://fonts.googleapis.com/css2?family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=block" rel="stylesheet" />

        {/* JSON-LD Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />

        {/* GA4 Consent Mode v2 — must execute before gtag.js loads */}
        <script
          dangerouslySetInnerHTML={{ __html: `
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('consent', 'default', {
              analytics_storage: 'denied',
              ad_storage: 'denied',
            });
          `}}
        />
      </head>
      <body>
        {children}
        <CookieConsent />
        <AnalyticsLoader />
      </body>
    </html>
  );
}
