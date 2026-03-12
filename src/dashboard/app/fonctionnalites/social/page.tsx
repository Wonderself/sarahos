'use client';

import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import Link from 'next/link';
import { useState } from 'react';

const STEPS = [
  {
    icon: '🏪',
    iconLabel: 'boutique description marque entreprise',
    title: 'Décrivez votre marque',
    desc: 'Ton, secteur, audience cible : l\'IA apprend votre identité en quelques phrases.',
  },
  {
    icon: '✨',
    iconLabel: 'étoiles création contenu IA automatique',
    title: 'L\'IA crée vos posts',
    desc: 'Textes accrocheurs, hashtags pertinents, adaptés à chaque réseau social.',
  },
  {
    icon: '📅',
    iconLabel: 'calendrier planification publication posts',
    title: 'Planifiez et publiez',
    desc: 'Organisez votre calendrier éditorial et publiez au meilleur moment.',
  },
];

const FEATURES = [
  {
    icon: '📤',
    iconLabel: 'envoi posts multi-plateformes réseaux sociaux',
    title: 'Posts multi-plateformes',
    desc: 'Un même message décliné pour LinkedIn, Instagram, Twitter et TikTok. Le bon format, le bon ton, automatiquement.',
  },
  {
    icon: '📅',
    iconLabel: 'calendrier éditorial planification contenu',
    title: 'Calendrier éditorial',
    desc: 'Visualisez votre planning de publication sur le mois. Glissez-déposez pour réorganiser vos posts.',
  },
  {
    icon: '📈',
    iconLabel: 'graphique analytics engagement performance',
    title: 'Analytics engagement',
    desc: 'Suivez vos performances : likes, partages, commentaires. L\'IA suggère les contenus qui marchent le mieux.',
  },
  {
    icon: '📱',
    iconLabel: 'smartphone adaptation contenu par réseau social',
    title: 'Adaptation par réseau',
    desc: 'LinkedIn professionnel, Instagram visuel, Twitter concis, TikTok dynamique : chaque post est optimisé pour sa plateforme.',
  },
  {
    icon: '🏷️',
    iconLabel: 'étiquette suggestions hashtags tendances',
    title: 'Suggestions hashtags',
    desc: 'L\'IA analyse les tendances de votre secteur et propose les hashtags les plus performants du moment.',
  },
  {
    icon: '📊',
    iconLabel: 'diagramme analyse concurrents veille',
    title: 'Analyse concurrents',
    desc: 'Comparez vos performances avec celles de vos concurrents. Identifiez les opportunités de contenu.',
  },
];

const PLATFORMS = [
  { name: 'LinkedIn', icon: '💼', color: '#0a66c2' },
  { name: 'Instagram', icon: '📷', color: '#e4405f' },
  { name: 'Twitter / X', icon: '💬', color: '#1da1f2' },
  { name: 'TikTok', icon: '▶️', color: '#ff0050' },
];

const CALENDAR_POSTS = [
  { day: 'Lun', platform: 'LinkedIn', title: '5 tendances IA en 2026', color: '#0a66c2', time: '9:00' },
  { day: 'Mar', platform: 'Instagram', title: 'Behind the scenes', color: '#e4405f', time: '12:30' },
  { day: 'Mer', platform: 'Twitter', title: 'Thread : productivité', color: '#1da1f2', time: '8:00' },
  { day: 'Jeu', platform: 'LinkedIn', title: 'Étude de cas client', color: '#0a66c2', time: '10:00' },
  { day: 'Ven', platform: 'TikTok', title: 'Astuce rapide 30s', color: '#ff0050', time: '18:00' },
  { day: 'Sam', platform: 'Instagram', title: 'Citation inspirante', color: '#e4405f', time: '11:00' },
  { day: 'Dim', platform: 'Twitter', title: 'Sondage audience', color: '#1da1f2', time: '16:00' },
];

const FAQS = [
  {
    q: 'Quels réseaux sociaux sont supportés ?',
    a: 'LinkedIn, Instagram, Twitter/X et TikTok. Nous ajoutons régulièrement de nouvelles plateformes. Facebook et YouTube sont prévus prochainement.',
  },
  {
    q: 'La publication est-elle automatique ?',
    a: 'L\'IA génère et planifie vos posts. La publication peut être manuelle (copier-coller) ou automatique via connexion de vos comptes. Vous gardez toujours le contrôle avant publication.',
  },
  {
    q: 'L\'IA peut-elle créer des images ?',
    a: 'L\'IA génère le texte des posts. Pour les visuels, vous pouvez utiliser notre Studio Photo IA intégré (Freenzy Studio) qui crée des images professionnelles à partir d\'une description.',
  },
  {
    q: 'Le ton est-il adapté à mon secteur ?',
    a: 'Absolument. Vous décrivez votre marque, votre audience et votre ton souhaité. L\'IA s\'adapte : formel pour le B2B, décontracté pour le lifestyle, technique pour la tech, etc.',
  },
  {
    q: 'Quelles analytics sont disponibles ?',
    a: 'Engagement par post, meilleur jour/heure de publication, croissance d\'audience, comparaison mensuelle et suggestions d\'optimisation basées sur vos données.',
  },
];

const srOnly: React.CSSProperties = { position: 'absolute', width: 1, height: 1, padding: 0, margin: -1, overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0 };

const JSON_LD = {
  '@context': 'https://schema.org',
  '@type': 'SoftwareApplication',
  name: 'Freenzy.io Gestion Réseaux Sociaux IA',
  description: "Outil de gestion des réseaux sociaux propulsé par l'intelligence artificielle. Création automatique de posts, calendrier éditorial intelligent, analyse d'engagement et stratégie par plateforme. Compatible LinkedIn, Instagram, Twitter/X, TikTok. Générateur de hashtags et légendes optimisées.",
  applicationCategory: 'BusinessApplication',
  operatingSystem: 'Web',
  url: 'https://freenzy.io/fonctionnalites/social',
  offers: {
    '@type': 'Offer',
    price: '0',
    priceCurrency: 'EUR',
    description: '50 crédits offerts à l\'inscription, environ 62 posts gratuits. Sans carte bancaire.',
  },
  aggregateRating: {
    '@type': 'AggregateRating',
    ratingValue: '4.8',
    ratingCount: '312',
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

export default function SocialPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [roiHours, setRoiHours] = useState(8);

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
    <main aria-label="Gestion automatisée des réseaux sociaux par intelligence artificielle — Freenzy.io" style={{ background: '#0f0720', color: '#fff', minHeight: '100vh' }}>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(JSON_LD) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(FAQ_LD) }} />
      <PublicNav />

      {/* Hero */}
      <section className="fp-hero" aria-label="Présentation de l'outil de gestion des réseaux sociaux IA Freenzy" style={{ paddingTop: 140, paddingBottom: 80, textAlign: 'center', position: 'relative', overflow: 'hidden' }}>
        <div style={{ position: 'absolute', top: -200, left: '50%', transform: 'translateX(-50%)', width: 600, height: 600, background: 'radial-gradient(circle, rgba(6,182,212,0.15) 0%, transparent 70%)', pointerEvents: 'none' }} aria-hidden="true" />
        <div className="fp-hero-inner" style={{ maxWidth: 800, margin: '0 auto', padding: '0 24px', position: 'relative' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(6,182,212,0.12)', border: '1px solid rgba(6,182,212,0.3)', borderRadius: 100, padding: '8px 20px', marginBottom: 28, fontSize: 14, color: '#22d3ee' }}>
            <span role="img" aria-label="publication automatique réseaux sociaux">📤</span>
            Réseaux Sociaux IA
          </div>
          <h1 style={{ fontSize: 'clamp(2rem, 5vw, 3.5rem)', fontWeight: 800, lineHeight: 1.1, margin: '0 0 20px' }}>
            Vos réseaux sociaux en<br />
            <span style={{ background: accentGradient, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>pilote automatique</span>
          </h1>
          <p style={{ fontSize: 'clamp(1rem, 2.5vw, 1.25rem)', color: 'rgba(255,255,255,0.7)', maxWidth: 600, margin: '0 auto 40px', lineHeight: 1.6 }}>
            Posts, calendrier éditorial et analytics gérés par IA. Publiez du contenu engageant sur tous vos réseaux, sans effort.
          </p>
          <p style={srOnly}>
            L&apos;outil de gestion des réseaux sociaux IA de Freenzy.io automatise votre présence en ligne sur Instagram, LinkedIn, Twitter/X, TikTok et Facebook. Création de contenu engageant, planification éditoriale intelligente, analyse d&apos;engagement et génération automatique de hashtags et légendes. Stratégie personnalisée par plateforme grâce à l&apos;intelligence artificielle Claude d&apos;Anthropic. Calendrier éditorial drag-and-drop, analytics détaillés et suggestions d&apos;optimisation. Idéal pour community managers, entrepreneurs, agences marketing et PME françaises.
          </p>
          <div style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
            <Link href="/client/dashboard" title="Accedez au dashboard Freenzy.io pour explorer la gestion des reseaux sociaux IA" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Acceder a Freenzy
              <span aria-hidden="true" style={{ fontSize: 20 }}>→</span>
            </Link>
            <Link href="/demo" title="Voir la démonstration de l'outil de gestion des réseaux sociaux IA Freenzy" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.15)', color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
              Voir la démo
            </Link>
          </div>
        </div>
      </section>

      {/* Platforms bar */}
      <section aria-label="Plateformes sociales compatibles avec Freenzy" style={{ maxWidth: 700, margin: '0 auto', padding: '0 24px 60px' }}>
        <div className="fp-trust-badges" style={{ display: 'flex', gap: 16, justifyContent: 'center', flexWrap: 'wrap' }}>
          {PLATFORMS.map((p, i) => (
            <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 12, padding: '12px 22px' }}>
              <span role="img" aria-label={`plateforme ${p.name} compatible`} style={{ fontSize: 22 }}>{p.icon}</span>
              <span style={{ fontWeight: 600, fontSize: 14 }}>{p.name}</span>
            </div>
          ))}
        </div>
      </section>

      {/* 3 Steps */}
      <section aria-label="Comment automatiser vos réseaux sociaux en 3 étapes avec l'IA" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Comment ça marche ?
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          De la création à la publication en trois étapes.
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
      <section aria-label="Fonctionnalités de l'outil de gestion réseaux sociaux IA" style={{ ...sectionStyle, paddingTop: 40 }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Tout pour briller sur les réseaux
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Créez, planifiez, analysez. L&apos;IA gère le reste.
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

      {/* Demo: Calendar Mockup */}
      <section aria-label="Démonstration du calendrier éditorial intelligent avec posts planifiés" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Votre semaine en un coup d&apos;oeil
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Un calendrier éditorial clair et actionnable.
        </p>
        <div style={{ maxWidth: 800, margin: '0 auto', ...cardStyle, padding: '24px 20px', overflowX: 'auto' }}>
          {/* Calendar header */}
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>
              <span role="img" aria-label="calendrier éditorial semaine" style={{ fontSize: 20, verticalAlign: 'middle', marginRight: 8 }}>📅</span>
              Semaine du 9 mars 2026
            </div>
            <div style={{ display: 'flex', gap: 4 }} aria-label="Navigation semaine précédente et suivante">
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span aria-hidden="true" style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>‹</span>
              </div>
              <div style={{ width: 32, height: 32, borderRadius: 8, background: 'rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <span aria-hidden="true" style={{ fontSize: 18, color: 'rgba(255,255,255,0.5)' }}>›</span>
              </div>
            </div>
          </div>
          {/* Posts */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {CALENDAR_POSTS.map((post, i) => (
              <div key={i} style={{
                display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px',
                background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                borderRadius: 10, borderLeft: `3px solid ${post.color}`,
              }}>
                <div style={{ minWidth: 40, textAlign: 'center' }}>
                  <div style={{ fontWeight: 700, fontSize: 13 }}>{post.day}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)' }}>{post.time}</div>
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 14 }}>{post.title}</div>
                  <div style={{ fontSize: 12, color: post.color, marginTop: 2 }}>{post.platform}</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <span role="img" aria-label="modifier ce post" style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>✏️</span>
                  <span role="img" aria-label="programmer la publication" style={{ fontSize: 18, color: 'rgba(255,255,255,0.3)', cursor: 'pointer' }}>📨</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stratégie par plateforme — detailed */}
      <section aria-label="Stratégie de contenu personnalisée par plateforme sociale" style={{ padding: '80px 24px', maxWidth: 1100, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Stratégie par plateforme
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 56, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Chaque réseau a ses codes. L&apos;IA adapte automatiquement.
        </p>
        <div className="fp-platform-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20 }}>
          {[
            { icon: '💼', iconLabel: 'mallette LinkedIn professionnel B2B', name: 'LinkedIn', subtitle: 'B2B & Formel', color: '#0a66c2', tips: ['1300 car. idéal', '3-5 hashtags sectoriels', 'Accroche data-driven', 'Publiez Mar-Jeu 8h-10h'] },
            { icon: '📷', iconLabel: 'appareil photo Instagram visuel engageant', name: 'Instagram', subtitle: 'Visuel & Engageant', color: '#e4405f', tips: ['Emoji + question en fin', '20-30 hashtags mix', 'Stories sondages/quiz', 'Reels < 30 secondes'] },
            { icon: '💬', iconLabel: 'bulle Twitter X concis percutant', name: 'Twitter/X', subtitle: 'Concis & Percutant', color: '#1da1f2', tips: ['280 car. max', '1-2 hashtags', 'Threads si besoin', 'Rebondissez sur tendances'] },
            { icon: '▶️', iconLabel: 'bouton lecture TikTok tendances authentique', name: 'TikTok', subtitle: 'Tendances & Authentique', color: '#ff0050', tips: ['Hook 3 premières sec.', 'Sons populaires', 'Hashtags tendance', 'Authenticité > production'] },
          ].map((platform, i) => (
            <article key={i} aria-label={`Stratégie ${platform.name} : ${platform.subtitle}`} style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', borderTop: `3px solid ${platform.color}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 16 }}>
                <span role="img" aria-label={platform.iconLabel} style={{ fontSize: 28 }}>{platform.icon}</span>
                <div>
                  <h3 style={{ fontSize: 17, fontWeight: 700, margin: 0 }}>{platform.name}</h3>
                  <div style={{ fontSize: 12, color: platform.color, fontWeight: 600 }}>{platform.subtitle}</div>
                </div>
              </div>
              <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {platform.tips.map((tip, j) => (
                  <li key={j} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13.5, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5 }}>
                    <span role="img" aria-label="conseil validé" style={{ fontSize: 16, color: platform.color, flexShrink: 0 }}>✅</span>
                    {tip}
                  </li>
                ))}
              </ul>
            </article>
          ))}
        </div>
      </section>

      {/* Calendrier éditorial type */}
      <section aria-label="Exemple de calendrier éditorial hebdomadaire généré par IA" style={{ padding: '80px 24px', maxWidth: 900, margin: '0 auto' }}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700, color: '#fff', marginBottom: 16 }}>
          Calendrier éditorial type
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Une semaine type générée par l&apos;IA, prête à publier.
        </p>
        <div className="fp-calendar-strip" style={{ display: 'flex', gap: 10, flexWrap: 'wrap', justifyContent: 'center' }}>
          {[
            { day: 'Lun', type: 'Éducatif / Tips', color: '#7c3aed' },
            { day: 'Mar', type: 'Cas client', color: '#06b6d4' },
            { day: 'Mer', type: 'Coulisses', color: '#f59e0b' },
            { day: 'Jeu', type: 'Interactif', color: '#22c55e' },
            { day: 'Ven', type: 'Récap semaine', color: '#7c3aed' },
            { day: 'Sam', type: 'Détente', color: '#ec4899' },
            { day: 'Dim', type: 'Objectifs', color: '#ef4444' },
          ].map((item, i) => (
            <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 8, background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 14, padding: '16px 20px', minWidth: 110 }}>
              <div style={{ fontWeight: 800, fontSize: 14, color: 'rgba(255,255,255,0.9)' }}>{item.day}</div>
              <div style={{ background: `${item.color}20`, border: `1px solid ${item.color}40`, borderRadius: 100, padding: '6px 14px', fontSize: 12, fontWeight: 700, color: item.color, whiteSpace: 'nowrap' }}>
                {item.type}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Pricing */}
      <section aria-label="Tarification de l'outil de gestion réseaux sociaux IA Freenzy" style={sectionStyle}>
        <div style={{ ...cardStyle, textAlign: 'center', maxWidth: 600, margin: '0 auto', background: 'rgba(124,58,237,0.06)', border: '1px solid rgba(124,58,237,0.15)' }}>
          <span role="img" aria-label="carte bancaire tarification posts sociaux" style={{ fontSize: 40, marginBottom: 12, display: 'block' }}>💳</span>
          <h2 style={{ fontSize: 'clamp(1.3rem, 3vw, 1.8rem)', fontWeight: 700, marginBottom: 12 }}>
            Tarification simple
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.7)', fontSize: 15, lineHeight: 1.6, marginBottom: 20 }}>
            Environ <strong style={{ color: '#fff' }}>62 posts</strong> pour 50 crédits offerts à l&apos;inscription.
            <br />Moins de 1 crédit par post. Le meilleur rapport qualité-prix du marché.
          </p>
          <div className="fp-pricing-stats" style={{ display: 'flex', justifyContent: 'center', gap: 32, flexWrap: 'wrap', marginBottom: 24 }}>
            <div>
              <div style={{ fontSize: 28, fontWeight: 800, color: '#7c3aed' }}>{'~0.8'}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>crédit / post</div>
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
          <Link href="/client/dashboard" title="Accedez au dashboard pour explorer la gestion des reseaux sociaux IA" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '14px 32px', borderRadius: 10, fontWeight: 600, fontSize: 16, textDecoration: 'none' }}>
            Explorer le Dashboard
            <span aria-hidden="true" style={{ fontSize: 20 }}>→</span>
          </Link>
        </div>
      </section>

      {/* FAQ */}
      <section aria-label="Questions fréquentes sur la gestion des réseaux sociaux par IA" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Questions fréquentes
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Tout savoir sur le pilotage de vos réseaux sociaux.
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

      {/* Calculateur de ROI */}
      <section aria-label="Calculateur de retour sur investissement pour la gestion des réseaux sociaux" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Calculateur de ROI
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Combien d&apos;heures par semaine sur vos réseaux ?
        </p>
        <div style={{ maxWidth: 600, margin: '0 auto', ...cardStyle }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 28 }}>
            <input type="range" min={1} max={20} value={roiHours} onChange={(e) => setRoiHours(Number(e.target.value))} style={{ flex: 1, accentColor: '#7c3aed' }} aria-label="Heures par semaine consacrées aux réseaux sociaux" aria-valuemin={1} aria-valuemax={20} aria-valuenow={roiHours} />
            <span style={{ fontWeight: 800, fontSize: 24, color: '#7c3aed', minWidth: 50, textAlign: 'right' }}>{roiHours}h</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            <div className="fp-roi-row" style={{ padding: '12px 16px', background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{'Coût manuel ('}{roiHours}{'h x 4 sem x 45€/h)'}</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#ef4444' }}>{(roiHours * 4 * 45).toLocaleString('fr-FR')}{' €/mois'}</span>
            </div>
            <div className="fp-roi-row" style={{ padding: '12px 16px', background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.2)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{'Coût Freenzy (25 posts/sem x 0.8 cr x 0.05€)'}</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#7c3aed' }}>{(25 * 4 * 0.8 * 0.05).toFixed(0)}{' €/mois'}</span>
            </div>
            <div className="fp-roi-row" style={{ padding: '14px 16px', background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.25)', borderRadius: 10 }}>
              <span style={{ fontSize: 15, fontWeight: 700, color: '#22c55e' }}>{'Économie mensuelle'}</span>
              <span style={{ fontWeight: 800, fontSize: 22, color: '#22c55e' }}>{(roiHours * 4 * 45 - 25 * 4 * 0.8 * 0.05).toLocaleString('fr-FR')}{' €'}</span>
            </div>
            <div className="fp-roi-row" style={{ padding: '12px 16px', background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 10 }}>
              <span style={{ fontSize: 14, color: 'rgba(255,255,255,0.7)' }}>{'Temps récupéré'}</span>
              <span style={{ fontWeight: 800, fontSize: 18, color: '#fff' }}>{roiHours * 4}{'h / mois'}</span>
            </div>
          </div>
        </div>
      </section>

      {/* Sécurité & Conformité */}
      <section aria-label="Sécurité et conformité RGPD pour la gestion des réseaux sociaux" style={sectionStyle}>
        <h2 style={{ textAlign: 'center', fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Sécurité & Conformité
        </h2>
        <p style={{ textAlign: 'center', color: 'rgba(255,255,255,0.6)', marginBottom: 48, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          Vos données et votre image de marque sont protégées.
        </p>
        <div className="fp-quality-grid" style={{ display: 'flex', gap: 24, flexWrap: 'wrap', justifyContent: 'center' }}>
          {([
            { icon: '🛡️', iconLabel: 'bouclier RGPD conformité Europe', title: 'RGPD conforme', desc: 'Données hébergées en Europe, conformité totale au règlement européen.' },
            { icon: '🔒', iconLabel: 'cadenas données non partagées confidentialité', title: 'Pas de partage de données', desc: 'Vos contenus et données ne sont jamais partagés avec des tiers.' },
            { icon: '✅', iconLabel: 'vérification contenu avant publication', title: 'Contenu vérifié avant publication', desc: 'Relecture IA anti-erreurs et validation humaine avant chaque post.' },
          ] as const).map((item, i) => (
            <div key={i} style={{ flex: '1 1 280px', maxWidth: 340, background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: '28px 24px', backdropFilter: 'blur(12px)', textAlign: 'center' }}>
              <span role="img" aria-label={item.iconLabel} style={{ fontSize: 36, marginBottom: 14, display: 'block' }}>{item.icon}</span>
              <h3 style={{ fontSize: 17, fontWeight: 700, marginBottom: 8 }}>{item.title}</h3>
              <p style={{ color: 'rgba(255,255,255,0.6)', fontSize: 14, lineHeight: 1.6 }}>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Final CTA */}
      <section aria-label="Inscription gratuite à l'outil de gestion des réseaux sociaux IA Freenzy" style={{ ...sectionStyle, textAlign: 'center', paddingBottom: 100 }}>
        <h2 style={{ fontSize: 'clamp(1.5rem, 3vw, 2.2rem)', fontWeight: 700, marginBottom: 16 }}>
          Prêt à automatiser vos réseaux sociaux ?
        </h2>
        <p style={{ color: 'rgba(255,255,255,0.6)', marginBottom: 32, fontSize: 'clamp(0.95rem, 2vw, 1.1rem)' }}>
          50 crédits offerts — aucune carte bancaire requise.
        </p>
        <Link href="/client/dashboard" title="Accedez au dashboard Freenzy.io et explorez la gestion des reseaux sociaux IA" style={{ display: 'inline-flex', alignItems: 'center', gap: 8, background: accentGradient, color: '#fff', padding: '16px 40px', borderRadius: 10, fontWeight: 700, fontSize: 17, textDecoration: 'none' }}>
          Acceder au Dashboard
          <span role="img" aria-label="fusée démarrage rapide" style={{ fontSize: 22 }}>🚀</span>
        </Link>
      </section>

      <PublicFooter />
    </main>
  );
}
