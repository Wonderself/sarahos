'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: '📄',
    iconLabel: 'document template modèle',
    title: 'Choisissez un template',
    desc: '25 modèles professionnels prêts à l\'emploi : emails, contrats, factures, CV et plus.',
  },
  {
    icon: '✏️',
    iconLabel: 'crayon rédaction description',
    title: 'Décrivez votre besoin',
    desc: 'En quelques mots, expliquez le contexte. L\'IA comprend et rédige pour vous.',
  },
  {
    icon: '📥',
    iconLabel: 'téléchargement export document',
    title: 'Téléchargez le document',
    desc: 'Relisez, ajustez si besoin, puis exportez en PDF ou Markdown.',
  },
];

const FEATURES = [
  {
    icon: '📁',
    iconLabel: 'dossier templates professionnels',
    title: '25 templates professionnels',
    desc: 'Email, contrat, facture, CV, proposition commerciale, rapport, lettre de motivation, procès-verbal... Tout y est.',
  },
  {
    icon: '📑',
    iconLabel: 'export PDF et Markdown',
    title: 'Export PDF & Markdown',
    desc: 'Téléchargez vos documents au format PDF prêt à envoyer ou en Markdown pour l\'intégrer à vos outils.',
  },
  {
    icon: '✨',
    iconLabel: 'étoiles rédaction intelligente IA',
    title: 'Rédaction IA intelligente',
    desc: 'L\'IA adapte le ton, la structure et le vocabulaire au type de document. Résultat professionnel garanti.',
  },
  {
    icon: '⚙️',
    iconLabel: 'engrenage personnalisation automatique',
    title: 'Personnalisation automatique',
    desc: 'Vos coordonnées, votre logo, le nom du destinataire : tout est pré-rempli automatiquement.',
  },
  {
    icon: '🔄',
    iconLabel: 'flèches historique documents',
    title: 'Historique des documents',
    desc: 'Retrouvez tous vos documents générés. Dupliquez, modifiez et renvoyez en un clic.',
  },
  {
    icon: '🌐',
    iconLabel: 'globe multi-langues international',
    title: 'Multi-langues',
    desc: 'Générez vos documents en français, anglais, espagnol, allemand ou italien.',
  },
];

const TEMPLATES = [
  { icon: '✉️', name: 'Email pro', color: '#7c3aed' },
  { icon: '⚖️', name: 'Contrat', color: '#7c3aed' },
  { icon: '🧾', name: 'Facture', color: '#06b6d4' },
  { icon: '👤', name: 'CV', color: '#22c55e' },
  { icon: '🤝', name: 'Proposition', color: '#f59e0b' },
  { icon: '📊', name: 'Rapport', color: '#ef4444' },
  { icon: '✉️', name: 'Lettre', color: '#ec4899' },
  { icon: '👥', name: 'PV réunion', color: '#8b5cf6' },
];

const FAQS = [
  {
    q: 'Quels formats de document sont disponibles ?',
    a: 'Vous pouvez exporter en PDF (mis en page, prêt à envoyer) ou en Markdown (pour intégration dans vos outils, sites web ou systèmes internes).',
  },
  {
    q: 'Peut-on modifier un document après génération ?',
    a: 'Bien sûr. Le document généré est entièrement éditable. Vous pouvez ajuster le texte, le ton ou la mise en page avant de l\'exporter.',
  },
  {
    q: 'Puis-je créer mes propres templates ?',
    a: 'Oui. En plus des 25 templates inclus, vous pouvez enregistrer vos propres modèles personnalisés pour les réutiliser à volonté.',
  },
  {
    q: 'Les documents peuvent-ils inclure une signature ?',
    a: 'Vous pouvez ajouter un bloc signature dans vos documents. Pour la signature électronique certifiée, nous recommandons d\'exporter le PDF puis d\'utiliser un outil dédié.',
  },
  {
    q: 'Mes données sont-elles protégées (RGPD) ?',
    a: 'Absolument. Vos documents sont chiffrés, stockés en Europe et ne sont jamais partagés. Vous pouvez les supprimer à tout moment.',
  },
];

const srOnly: React.CSSProperties = { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Freenzy.io Génération de Documents IA',
  description: "Générateur de documents professionnels propulsé par l'intelligence artificielle Claude d'Anthropic. Créez contrats, factures, devis, rapports, CV, emails formels et procès-verbaux en 30 secondes. 25 templates prêts à l'emploi avec export PDF et Markdown.",
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://freenzy.io/fonctionnalites/documents',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: '50 crédits offerts à l\'inscription, environ 14 documents gratuits. Sans carte bancaire.',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.7',
    ratingCount: '289',
    bestRating: '5',
  },
  publisher: {
    '@type': 'Organization',
    name: 'Freenzy.io',
    url: 'https://freenzy.io',
  },
};

const FAQ_LD = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQS.map(faq => ({
    '@type': 'Question',
    name: faq.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: faq.a,
    },
  })),
};

export default function DocumentsPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [activeTemplate, setActiveTemplate] = useState(0);

  const sectionStyle: React.CSSProperties = {
    maxWidth: 1100,
    margin: '0 auto',
    padding: '80px 24px',
  };

  const cardStyle: React.CSSProperties = {
    background: 'rgba(255,255,255,0.04)',
    border: '1px solid rgba(255,255,255,0.08)',
    borderRadius: 16,
    padding: '32px 28px',
  };

  const accentGradient = 'linear-gradient(135deg, #7c3aed, #06b6d4)';

  return (
    <main aria-label="Génération de documents professionnels par intelligence artificielle — Freenzy.io" style={{ background: '#0f0720', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
      <PublicNav />

      {/* Hero */}
      <section className="fp-hero" aria-label="Présentation du générateur de documents IA Freenzy" style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(124,58,237,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />
        <div className="fp-hero-inner" style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 28, fontSize: 14, color: '#a78bfa' }}>
            <span role="img" aria-label="document professionnel IA">📄</span>
            Documents IA
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Créez vos documents<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>en quelques secondes</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            25 templates professionnels générés par IA. Emails, contrats, factures, CV : décrivez votre besoin et téléchargez le résultat.
          </p>
          <p style={srOnly}>
            Le générateur de documents IA de Freenzy.io utilise l&apos;intelligence artificielle Claude d&apos;Anthropic pour créer automatiquement tous vos documents professionnels : contrats de prestation, factures détaillées, devis commerciaux, rapports d&apos;activité, présentations, emails formels, procès-verbaux de réunion et notes de synthèse. Plus de 25 modèles prêts à l&apos;emploi avec export PDF et Markdown. Rédaction impeccable en français, conforme RGPD. Idéal pour freelances, TPE, PME et cabinets professionnels.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/client/dashboard" title="Accedez au dashboard Freenzy.io pour explorer le generateur de documents IA" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Acceder a Freenzy
              <span aria-hidden="true" style={{ fontSize: 20 }}>→</span>
            </Link>
            <Link href="/demo" title="Voir la démonstration du générateur de documents IA Freenzy.io" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* 3 Steps */}
      <section aria-label="Comment générer un document professionnel en 3 étapes avec l'IA" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Comment ça marche ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Trois étapes pour un document professionnel prêt à envoyer.
        </p>
        <div className="fp-steps-grid" style={{ display: 'flex', gap: 32, flexWrap: 'wrap', justifyContent: 'center' }}>
          {STEPS.map((step, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 280px', maxWidth: 340, textAlign: 'center', position: 'relative' }}>
              <div style={{ position: 'absolute', top: -18, left: '50%', transform: 'translateX(-50%)', width: 36, height: 36, borderRadius: '50%', background: accentGradient, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 800, fontSize: 16 }} aria-label={`Étape ${i + 1}`}>
                {i + 1}
              </div>
              <span role="img" aria-label={step.iconLabel} style={{ fontSize: 40, marginBottom: 16, display: 'block', marginTop: 12 }}>{step.icon}</span>
              <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 8 }}>{step.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.65)', fontSize: 15, lineHeight: 1.6 }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 Features */}
      <section aria-label="Fonctionnalités du générateur de documents IA Freenzy" style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Des documents pro en un clic
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          L&apos;IA rédige, vous validez. Simple, rapide, professionnel.
        </p>
        <div className="fp-features-grid" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {FEATURES.map((feat, i) => (
            <div key={i} style={{ ...cardStyle, flex: '1 1 320px', maxWidth: 360 }}>
              <span role="img" aria-label={feat.iconLabel} style={{ fontSize: 32, marginBottom: 14, display: 'block' }}>{feat.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{feat.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14.5, lineHeight: 1.65 }}>{feat.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Demo: Template Selector + Preview */}
      <section aria-label="Aperçu interactif des templates de documents professionnels" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Aperçu des templates
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Cliquez sur un template pour voir l&apos;aperçu.
        </p>
        <div style={{ maxWidth: 700, margin: '0 auto' }}>
          {/* Template grid */}
          <nav aria-label="Sélection de template de document" className="fp-template-btns" style={{ display: 'flex', gap: 12, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 32 }}>
            {TEMPLATES.map((tpl, i) => (
              <button key={i} onClick={() => setActiveTemplate(i)} aria-label={`Sélectionner le template ${tpl.name}`} aria-pressed={activeTemplate === i} style={{
                display: 'flex', alignItems: 'center', gap: 8,
                background: activeTemplate === i ? 'rgba(124,58,237,0.15)' : 'rgba(255,255,255,0.04)',
                border: `1px solid ${activeTemplate === i ? 'rgba(124,58,237,0.4)' : 'rgba(255,255,255,0.08)'}`,
                borderRadius: 10, padding: '10px 18px', cursor: 'pointer', color: '#fff', fontSize: 14, fontWeight: 600,
                transition: 'all 0.2s',
              }}>
                <span role="img" aria-hidden="true" style={{ fontSize: 20 }}>{tpl.icon}</span>
                {tpl.name}
              </button>
            ))}
          </nav>
          {/* Preview card */}
          <div style={{ ...cardStyle, padding: '28px 28px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(255,255,255,0.08)' }}>
              <span role="img" aria-label={`Template ${TEMPLATES[activeTemplate].name} sélectionné`} style={{ fontSize: 28 }}>{TEMPLATES[activeTemplate].icon}</span>
              <div>
                <div style={{ fontWeight: 700, fontSize: 16 }}>{TEMPLATES[activeTemplate].name}</div>
                <div style={{ color: 'rgba(255,255,255,0.5)', fontSize: 13 }}>Généré par Freenzy IA</div>
              </div>
              <div style={{ marginLeft: 'auto', display: 'flex', gap: 8 }}>
                <div style={{ background: 'rgba(34,197,94,0.1)', color: '#22c55e', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>PDF</div>
                <div style={{ background: 'rgba(124,58,237,0.1)', color: '#7c3aed', padding: '4px 12px', borderRadius: 100, fontSize: 12, fontWeight: 600 }}>MD</div>
              </div>
            </div>
            {/* Mock document content */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }} aria-label="Aperçu du contenu du document généré">
              <div style={{ height: 14, background: 'rgba(255,255,255,0.12)', borderRadius: 4, width: '60%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '100%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '90%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '95%' }} />
              <div style={{ height: 1, background: 'rgba(255,255,255,0.06)', margin: '8px 0' }} />
              <div style={{ height: 12, background: 'rgba(255,255,255,0.1)', borderRadius: 4, width: '40%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '100%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '85%' }} />
              <div style={{ height: 10, background: 'rgba(255,255,255,0.06)', borderRadius: 4, width: '70%' }} />
            </div>
            <div style={{ marginTop: 20, display: 'flex', gap: 12 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: accentGradient, padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                <span role="img" aria-label="télécharger document PDF" style={{ fontSize: 16 }}>📥</span>
                Télécharger PDF
              </div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.12)', padding: '10px 20px', borderRadius: 8, fontSize: 13, fontWeight: 600 }}>
                <span role="img" aria-label="modifier le document généré" style={{ fontSize: 16 }}>✏️</span>
                Modifier
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Types de documents — expanded grid */}
      <section aria-label="Catalogue complet des 12 types de documents professionnels générés par IA" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Tous les types de documents
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          12 catégories couvrant tous vos besoins professionnels.
        </p>
        <div className="fp-doc-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: 18, maxWidth: 1000, margin: '0 auto' }}>
          {[
            { icon: '📋', iconLabel: 'devis commercial professionnel', title: 'Devis commercial', credits: 3 },
            { icon: '🤝', iconLabel: 'contrat de prestation services', title: 'Contrat de prestation', credits: 5 },
            { icon: '🔒', iconLabel: 'accord confidentialité NDA', title: 'NDA / Confidentialité', credits: 4 },
            { icon: '⚖️', iconLabel: 'conditions générales vente', title: 'CGV', credits: 4 },
            { icon: '📜', iconLabel: 'conditions générales utilisation', title: 'CGU', credits: 4 },
            { icon: '🔐', iconLabel: 'mentions légales RGPD conformité', title: 'Mentions légales RGPD', credits: 3 },
            { icon: '📋', iconLabel: 'lettre de mission professionnelle', title: 'Lettre de mission', credits: 3 },
            { icon: '🧾', iconLabel: 'facture détaillée automatique', title: 'Facture détaillée', credits: 3 },
            { icon: '💰', iconLabel: 'proposition commerciale IA', title: 'Proposition commerciale', credits: 4 },
            { icon: '👥', iconLabel: 'procès-verbal réunion', title: 'PV de réunion', credits: 2 },
            { icon: '📊', iconLabel: 'rapport activité entreprise', title: "Rapport d'activité", credits: 4 },
            { icon: '👤', iconLabel: 'CV professionnel IA', title: 'CV professionnel', credits: 3 },
          ].map((doc, i) => (
            <div key={i} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '22px 20px', display: 'flex', alignItems: 'center', gap: 14 }}>
              <span role="img" aria-label={doc.iconLabel} style={{ fontSize: 30, flexShrink: 0 }}>{doc.icon}</span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: 15, fontWeight: 700, marginBottom: 0, margin: 0 }}>{doc.title}</h3>
              </div>
              <div style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)', borderRadius: 100, padding: '4px 12px', fontSize: 12, fontWeight: 700, color: '#a78bfa', whiteSpace: 'nowrap' }}>
                ~{doc.credits} cr
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Qualité professionnelle */}
      <section aria-label="Qualité professionnelle des documents générés par intelligence artificielle" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Qualité professionnelle
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Des documents prêts à signer, pas des brouillons.
        </p>
        <div className="fp-quality-grid" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { icon: '⚖️', iconLabel: 'balance structure juridique conforme', title: 'Structure juridique', desc: 'Numérotation articles, clauses types, références croisées. Chaque document suit les normes de rédaction juridique.' },
            { icon: '⚙️', iconLabel: 'engrenage personnalisation SIRET automatique', title: 'Personnalisation auto', desc: 'Votre SIRET, nom, adresse injectés automatiquement. Plus besoin de remplir manuellement vos coordonnées.' },
            { icon: '📑', iconLabel: 'document export PDF professionnel', title: 'Export pro', desc: "PDF avec en-tête, pied de page, numérotation. Résultat impeccable, prêt à envoyer à vos clients." },
          ].map((item, i) => (
            <div key={i} style={{ flex: '1 1 260px', maxWidth: 320, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '32px 28px', textAlign: 'center' }}>
              <div style={{ width: 56, height: 56, borderRadius: '50%', background: 'rgba(124,58,237,0.12)', border: '2px solid rgba(124,58,237,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px' }}>
                <span role="img" aria-label={item.iconLabel} style={{ fontSize: 28 }}>{item.icon}</span>
              </div>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 10 }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.65, margin: 0 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section aria-label="Tarification du générateur de documents IA Freenzy" style={sectionStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 600, margin: '0 auto', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <span role="img" aria-label="carte bancaire tarification documents" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}>💳</span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: 12 }}>
            Tarification simple
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            Environ <strong style={{ color: '#fff' }}>14 documents</strong> pour 50 crédits offerts à l&apos;inscription.
            <br />Chaque document coûte entre 2 et 5 crédits selon sa complexité.
          </p>
          <div className="fp-pricing-stats" style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>{'~3.5'}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits / doc</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>50</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédits offerts</div>
            </div>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>0 €</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>pour commencer</div>
            </div>
          </div>
          <Link href="/client/dashboard" title="Accedez au dashboard pour explorer le generateur de documents IA" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            Explorer le Dashboard
            <span aria-hidden="true" style={{ fontSize: 20 }}>→</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section aria-label="Questions fréquentes sur la génération de documents par IA" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Questions fréquentes
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Tout savoir sur le générateur de documents.
        </p>
        <div style={{ maxWidth: 720, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 12 }}>
          {FAQS.map((faq, i) => (
            <div key={i} className="fp-faq-item" style={{ ...cardStyle, padding: '0', overflow: 'hidden', cursor: 'pointer' }} onClick={() => setOpenFaq(openFaq === i ? null : i)} role="button" aria-expanded={openFaq === i} aria-label={`Question : ${faq.q}`}>
              <div className="fp-faq-header">
                <span style={{ fontWeight: 600, fontSize: 15 }}>{faq.q}</span>
                <span className="fp-faq-chevron" aria-hidden="true" style={{ fontSize: 22, color: 'rgba(255,255,255,0.4)', transition: 'transform 0.2s', transform: openFaq === i ? 'rotate(180deg)' : 'rotate(0deg)' }}>{'▼'}</span>
              </div>
              {openFaq === i && (
                <div style={{ padding: '0 24px 20px', color: 'rgba(255,255,255,0.65)', fontSize: 14.5, lineHeight: 1.65 }}>
                  {faq.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Sécurité & Conformité */}
      <section aria-label="Sécurité et conformité RGPD des documents générés" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Sécurité & Conformité
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Vos documents sont protégés à chaque étape.
        </p>
        <div className="fp-security-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20, maxWidth: 960, margin: '0 auto' }}>
          {[
            { icon: '✅', iconLabel: 'conformité RGPD validée Europe', title: 'RGPD conforme', desc: 'Données hébergées en EU' },
            { icon: '🔐', iconLabel: 'chiffrement AES-256 sécurisé', title: 'Chiffrement AES-256', desc: 'Documents chiffrés de bout en bout' },
            { icon: '🛡️', iconLabel: 'bouclier isolation données clients', title: 'Isolation des données', desc: 'Chaque compte est cloisonné' },
            { icon: '🗑️', iconLabel: 'suppression automatique 90 jours', title: 'Pas de rétention', desc: 'Données supprimées après 90 jours' },
            { icon: '👁️‍🗨️', iconLabel: 'confidentialité aucune donnée partagée', title: 'Aucune donnée partagée avec l\'IA', desc: 'Vos documents restent confidentiels' },
          ].map((item, i) => (
            <div key={i} style={{ ...cardStyle, background: 'rgba(255,255,255,0.05)', backdropFilter: 'blur(12px)', textAlign: 'center', padding: '28px 20px' }}>
              <span role="img" aria-label={item.iconLabel} style={{ fontSize: 36, marginBottom: 12, display: 'block' }}>{item.icon}</span>
              <h3 style={{ fontSize: 16, fontWeight: 700, marginBottom: 6 }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.5 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Structure professionnelle garantie */}
      <section aria-label="Structure professionnelle garantie pour chaque document généré" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Structure professionnelle garantie
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Chaque document généré inclut une structure complète et conforme.
        </p>
        <div style={{ maxWidth: 600, margin: '0 auto', display: 'flex', flexDirection: 'column', gap: 0 }}>
          {[
            { icon: '🪪', iconLabel: 'en-tête coordonnées entreprise', text: 'En-tête avec vos coordonnées' },
            { icon: '🔢', iconLabel: 'numérotation automatique articles', text: 'Numérotation automatique (Article 1, 1.1, 1.1.1)' },
            { icon: '📚', iconLabel: 'clauses juridiques types', text: 'Clauses types (force majeure, RGPD, confidentialité)' },
            { icon: '📄', iconLabel: 'pied de page pagination légale', text: 'Pied de page légal avec pagination' },
            { icon: '📑', iconLabel: 'export PDF mise en page soignée', text: 'Export PDF avec mise en page soignée' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 16, position: 'relative', paddingLeft: 24 }}>
              {/* Vertical line */}
              {i < 4 && (
                <div style={{ position: 'absolute', left: 39, top: 40, width: 2, height: 'calc(100% - 16px)', background: 'rgba(124,58,237,0.2)' }} aria-hidden="true" />
              )}
              {/* Circle with check */}
              <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'rgba(124,58,237,0.15)', border: '2px solid rgba(124,58,237,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                <span role="img" aria-label="validé" style={{ fontSize: 18 }}>✅</span>
              </div>
              <div style={{ padding: '6px 0 28px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <span role="img" aria-label={item.iconLabel} style={{ fontSize: 22 }}>{item.icon}</span>
                  <span style={{ fontSize: 15, fontWeight: 600, color: 'rgba(255,255,255,0.9)' }}>{item.text}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section aria-label="Inscription gratuite au générateur de documents IA Freenzy" style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Prêt à gagner du temps sur vos documents ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          50 crédits offerts — aucune carte bancaire requise.
        </p>
        <Link href="/client/dashboard" title="Accedez au dashboard Freenzy.io et explorez le generateur de documents IA" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '16px 40px', borderRadius: 10, fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          Acceder au Dashboard
          <span role="img" aria-label="fusée démarrage rapide" style={{ fontSize: 22 }}>🚀</span>
        </Link>
      </section>

      <PublicFooter />
    </main>
  );
}
