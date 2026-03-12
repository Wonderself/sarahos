import { Metadata } from 'next';
import Script from 'next/script';
import { PRIVACY_SECTIONS, LEGAL_LAST_UPDATED } from '../../../lib/legal-content';

export const metadata: Metadata = {
  title: 'Politique de Confidentialité — Freenzy.io | Protection des Données RGPD',
  description: 'Politique de confidentialité et protection des données personnelles de Freenzy.io. Conforme RGPD. Données hébergées en Europe. Collecte minimale, chiffrement, droit d\'accès, de rectification et de suppression. DPO joignable. Purge automatique des données après 90 jours.',
  alternates: { canonical: 'https://freenzy.io/legal/confidentialite' },
  openGraph: {
    title: 'Politique de Confidentialité — Freenzy.io | RGPD',
    description: 'Protection des données personnelles conforme RGPD. Données hébergées en Europe, collecte minimale, chiffrement, purge automatique après 90 jours.',
    url: 'https://freenzy.io/legal/confidentialite',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
};

const PAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'Politique de Confidentialité — Freenzy.io',
  'description': 'Politique de confidentialité et protection des données personnelles de Freenzy.io. Conforme RGPD. Données hébergées en Europe. Collecte minimale, chiffrement, purge automatique.',
  'url': 'https://freenzy.io/legal/confidentialite',
  'inLanguage': 'fr-FR',
  'publisher': {
    '@type': 'Organization',
    'name': 'Freenzy.io',
    'url': 'https://freenzy.io',
  },
  'dateModified': '2026-03-01',
};

export default function ConfidentialitePage() {
  return (
    <>
      <Script
        id="confidentialite-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PAGE_JSONLD) }}
      />
      <article className="legal-article legal-content" aria-labelledby="confidentialite-title">
        <header style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
          <h1 id="confidentialite-title" style={{ fontSize: 22, fontWeight: 800, color: '#1a0e3a', marginBottom: 8, letterSpacing: -0.5 }}>
            Politique de Confidentialité
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
            Dernière mise à jour : {LEGAL_LAST_UPDATED}
          </p>
        </header>

        {PRIVACY_SECTIONS.map((section, i) => (
          <section key={section.id} id={section.id} className="legal-section" style={{ marginBottom: 36 }} aria-labelledby={`confidentialite-section-${section.id}`}>
            <h2 id={`confidentialite-section-${section.id}`} className="legal-section-title" style={{
              fontSize: 15, fontWeight: 700, color: '#1a0e3a', marginBottom: 12,
              paddingLeft: 12, borderLeft: '3px solid #7c3aed',
              display: 'flex', alignItems: 'center', gap: 8,
            }}>
              <span style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, minWidth: 24 }} aria-hidden="true">
                {String(i + 1).padStart(2, '0')}
              </span>
              {section.title}
            </h2>
            <div className="legal-section-body" style={{
              fontSize: 14, lineHeight: 1.8, color: '#4b5563',
              whiteSpace: 'pre-line', paddingLeft: 12,
              wordBreak: 'break-word', overflowWrap: 'break-word',
            }}>
              {section.content}
            </div>
          </section>
        ))}
      </article>
    </>
  );
}
