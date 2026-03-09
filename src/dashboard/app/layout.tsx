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
const DEFAULT_TITLE = 'Freenzy.io — 82 Agents IA & Répondeur Intelligent pour PME | Free & Easy';
const DEFAULT_DESCRIPTION =
  'Freenzy.io : Free & Easy. Répondeur téléphonique IA 24/7 + 82 agents IA spécialisés (Marketing, Finance, Commercial, RH, Vidéo, Photo…). Toutes les IA du marché au prix officiel. 0% de commission. Sans abonnement. L\'IA accessible à tous.';

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
    // Agents
    'agent IA entreprise', 'assistant virtuel PME', '82 agents IA',
    'multi-agent IA', 'agent IA spécialisé', 'OS IA entreprise',
    'agent marketing IA', 'agent commercial IA', 'agent RH IA',
    'agent finance IA', 'agent juridique IA', 'agent vidéo IA',
    // Automatisation
    'automatisation IA', 'automatisation entreprise', 'IA pour PME',
    'IA PME France', 'intelligence artificielle entreprise France',
    'automatisation appels', 'social media automation IA',
    'génération contenu IA', 'WhatsApp IA entreprise',
    // Modèles
    'Claude Anthropic', 'GPT-4 entreprise', 'Gemini entreprise',
    'Llama Meta', 'Grok xAI', 'Mistral IA France',
    'tous les modèles IA', 'meilleurs modèles IA 2026',
    // Business value
    'sans abonnement IA', 'pay as you go IA', 'IA 0% commission',
    'prix officiel IA', 'IA pas cher PME', 'démarrer IA gratuitement',
    'IA gratuit PME', 'chatbot PME', 'IA tout-en-un entreprise',
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
    title: 'Freenzy.io — Free & Easy | 82 Agents IA & Répondeur Intelligent pour PME',
    description:
      'Free & Easy : l\'IA accessible à tous. Ne manquez plus jamais un appel. 82 agents IA spécialisés pour automatiser toute votre entreprise. Toutes les IA du marché au prix officiel. 0% commission, sans abonnement.',
    type: 'website',
    url: SITE_URL,
    locale: 'fr_FR',
    siteName: SITE_NAME,
    images: [
      {
        url: '/opengraph-image',
        width: 1200,
        height: 630,
        alt: 'Flashboard — 82 Agents IA pour PME | Freenzy.io',
        type: 'image/png',
      },
    ],
  },

  // Twitter / X Card
  twitter: {
    card: 'summary_large_image',
    site: '@freenzyio',
    creator: '@freenzyio',
    title: 'Freenzy.io — Free & Easy | 82 Agents IA pour PME',
    description:
      'Free & Easy : Répondeur IA 24/7 + 82 agents spécialisés. Toutes les IA du marché. 0% commission, sans abonnement.',
    images: [{ url: '/opengraph-image', alt: 'Flashboard — Freenzy.io' }],
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
      alternateName: ['Freenzy', 'Flashboard'],
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
      description: DEFAULT_DESCRIPTION,
      foundingDate: '2024',
      inLanguage: 'fr-FR',
      address: { '@type': 'PostalAddress', addressCountry: 'FR' },
      contactPoint: [
        {
          '@type': 'ContactPoint',
          contactType: 'customer support',
          availableLanguage: [{ '@type': 'Language', name: 'French' }],
        },
      ],
      sameAs: ['https://linkedin.com/company/freenzy', 'https://twitter.com/freenzyio'],
    },

    // SoftwareApplication
    {
      '@type': 'SoftwareApplication',
      '@id': `${SITE_URL}/#software`,
      name: APP_NAME,
      applicationCategory: 'BusinessApplication',
      applicationSubCategory: 'Artificial Intelligence Platform',
      operatingSystem: 'Web',
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      inLanguage: 'fr-FR',
      isAccessibleForFree: true,
      offers: [
        {
          '@type': 'Offer',
          price: '0',
          priceCurrency: 'EUR',
          description: "Accès gratuit — sans carte bancaire, 0% de commission",
          availability: 'https://schema.org/InStock',
          url: `${SITE_URL}/login?mode=register`,
        },
        {
          '@type': 'Offer',
          name: 'Pay-as-you-go',
          description: 'Rechargez des crédits au prix officiel des modèles IA, 0% de commission',
          priceCurrency: 'EUR',
          url: `${SITE_URL}/tarifs-api`,
        },
      ],
      featureList: [
        'Répondeur téléphonique IA 24/7',
        '82 agents IA spécialisés',
        'WhatsApp IA Business',
        'Social Media Autopilot',
        'Factory Documents IA',
        'Réveil Intelligent',
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
      screenshot: `${SITE_URL}/opengraph-image`,
      /* aggregateRating removed — no verified reviews yet */
      author: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
      publisher: { '@type': 'Organization', name: SITE_NAME, url: SITE_URL },
    },

    // WebSite
    {
      '@type': 'WebSite',
      '@id': `${SITE_URL}/#website`,
      name: SITE_NAME,
      alternateName: APP_NAME,
      url: SITE_URL,
      description: DEFAULT_DESCRIPTION,
      publisher: { '@id': `${SITE_URL}/#organization` },
      inLanguage: 'fr-FR',
      copyrightYear: 2026,
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
        <meta name="theme-color" content="#5b6cf7" />
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

        {/* Google Fonts — Inter (body) + Space Grotesk (display/logo) */}
        <link rel="dns-prefetch" href="//fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800;900&family=Space+Grotesk:wght@500;600;700&family=Material+Symbols+Rounded:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap" rel="stylesheet" />

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
