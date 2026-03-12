import { Metadata } from 'next';
import Script from 'next/script';
import { CGU_SECTIONS, LEGAL_LAST_UPDATED } from '../../../lib/legal-content';

export const metadata: Metadata = {
  title: 'Conditions Générales d\'Utilisation — Freenzy.io | CGU Plateforme IA Multi-Agents',
  description: 'Conditions générales d\'utilisation de Freenzy.io, la plateforme IA multi-agents pour entreprises. Inscription, crédits, utilisation des agents IA, propriété intellectuelle, responsabilités, résiliation. Droit français applicable. Dernière mise à jour mars 2026.',
  alternates: { canonical: 'https://freenzy.io/legal/cgu' },
  openGraph: {
    title: 'CGU — Freenzy.io | Plateforme IA Multi-Agents',
    description: 'Conditions générales d\'utilisation de Freenzy.io. Inscription, crédits, agents IA, propriété intellectuelle, responsabilités et résiliation. Droit français.',
    url: 'https://freenzy.io/legal/cgu',
    type: 'website',
    locale: 'fr_FR',
    siteName: 'Freenzy.io',
  },
};

const PAGE_JSONLD = {
  '@context': 'https://schema.org',
  '@type': 'WebPage',
  'name': 'Conditions Générales d\'Utilisation — Freenzy.io',
  'description': 'Conditions générales d\'utilisation de Freenzy.io, la plateforme IA multi-agents pour entreprises. Inscription, crédits, utilisation des agents IA, propriété intellectuelle, responsabilités, résiliation.',
  'url': 'https://freenzy.io/legal/cgu',
  'inLanguage': 'fr-FR',
  'publisher': {
    '@type': 'Organization',
    'name': 'Freenzy.io',
    'url': 'https://freenzy.io',
  },
  'dateModified': '2026-03-01',
};

export default function CGUPage() {
  return (
    <>
      <Script
        id="cgu-jsonld"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(PAGE_JSONLD) }}
      />
      <article className="legal-article legal-content" aria-labelledby="cgu-title">
        <header style={{ marginBottom: 36, paddingBottom: 24, borderBottom: '1px solid #f0f0f0' }}>
          <h1 id="cgu-title" style={{ fontSize: 22, fontWeight: 800, color: '#1a0e3a', marginBottom: 8, letterSpacing: -0.5 }}>
            Conditions Générales d{"'"}Utilisation
          </h1>
          <p style={{ fontSize: 12, color: '#9ca3af', margin: 0 }}>
            Dernière mise à jour : {LEGAL_LAST_UPDATED}
          </p>
        </header>

        {CGU_SECTIONS.map((section, i) => (
          <section key={section.id} id={section.id} className="legal-section" style={{ marginBottom: 36 }} aria-labelledby={`cgu-section-${section.id}`}>
            <h2 id={`cgu-section-${section.id}`} className="legal-section-title" style={{
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
