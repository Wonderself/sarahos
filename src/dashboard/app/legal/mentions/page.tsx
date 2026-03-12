import { Metadata } from 'next';
import Script from 'next/script';
import { MENTIONS_SECTIONS, LEGAL_LAST_UPDATED } from '../../../lib/legal-content';

export const metadata: Metadata = {
  title: 'Mentions Légales — Freenzy.io | Éditeur, Hébergeur, Contact',
  description: 'Mentions légales de Freenzy.io : informations sur l\'éditeur, l\'hébergeur, le directeur de publication, les conditions d\'utilisation du site. Contact et informations juridiques. Propriété intellectuelle et droits d\'auteur.',
  alternates: { canonical: 'https://freenzy.io/legal/mentions' },
  openGraph: {
    title: 'Mentions Légales — Freenzy.io',
    description: 'Informations sur l\'éditeur, l\'hébergeur, le directeur de publication. Contact et informations juridiques. Propriété intellectuelle.',
    url: 'https://freenzy.io/legal/mentions',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
};

const PAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'Mentions Légales — Freenzy.io',
  'description': 'Mentions légales de Freenzy.io : informations sur l\'éditeur, l\'hébergeur, le directeur de publication, les conditions d\'utilisation du site. Contact et informations juridiques.',
  'url': 'https://freenzy.io/legal/mentions',
  'inLanguage': 'fr-FR',
  'publisher': {
    '@type': 'Organization',
    'name': 'Freenzy.io',
    'url': 'https://freenzy.io',
  },
  'dateModified': '2026-03-01',
};

export default function MentionsPage() {
  return (
    <>
      <Script
        id="mentions-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PAGE_JSONLD) }}
      />
      <article className="legal-article legal-content" aria-labelledby="mentions-title">
        <header style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
          <h1 id="mentions-title" style={{ fontSize: 22, fontWeight: 800, color: '#1a0e3a', marginBottom: 8, letterSpacing: -0.5 }}>
            Mentions Légales
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
            Dernière mise à jour : {LEGAL_LAST_UPDATED}
          </p>
        </header>

        {MENTIONS_SECTIONS.map((section, i) => (
          <section key={section.id} id={section.id} className="legal-section" style={{ marginBottom: 36 }} aria-labelledby={`mentions-section-${section.id}`}>
            <h2 id={`mentions-section-${section.id}`} className="legal-section-title" style={{
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
