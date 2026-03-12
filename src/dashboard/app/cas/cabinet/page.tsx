'use client';

import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { CASE_STUDIES } from '@/lib/case-studies-data';
import Script from 'next/script';

const study = CASE_STUDIES.find((s) => s.slug === 'cabinet')!;

const iconToEmoji: Record<string, string> = {
  restaurant: '🍽️', apartment: '🏢', account_balance: '🏛️', phone_missed: '📞',
  edit_calendar: '📅', group_off: '👥', call: '📞', campaign: '📢', badge: '🪪',
  person_search: '🔍', description: '📄', notifications_off: '🔕', storefront: '🏪',
  gavel: '⚖️', support_agent: '🤖', schedule: '⏰', content_copy: '📋',
  visibility_off: '👁️', calculate: '🧮', monitoring: '📊', person: '👤',
  check_circle: '✅', format_quote: '💬', info: 'ℹ️', arrow_forward: '→',
  close: '✕', search: '🔍', star: '⭐', check: '✅', arrow_back: '←',
  phone: '📞', mail: '📧', smart_toy: '🤖', bolt: '⚡', auto_fix_high: '✨',
  rocket_launch: '🚀', settings: '⚙️', analytics: '📊', trending_up: '📈',
  celebration: '🎉', share: '📤', group: '👥', business: '🏢', credit_card: '💳',
  savings: '💰', calendar_month: '📅', home: '🏠', real_estate_agent: '🏠',
  balance: '⚖️', local_hospital: '🏥', medical_services: '🏥', chat: '💬',
  visibility: '👁️', verified: '✅', expand_more: '▼', chevron_right: '›',
  more_vert: '⋮', receipt_long: '🧾', point_of_sale: '💳', inventory: '📦',
  menu_book: '📖', local_dining: '🍽️', room_service: '🛎️', hotel: '🏨',
  key: '🔑', vpn_key: '🔑', meeting_room: '🚪', house: '🏠', villa: '🏡',
  location_on: '📍', map: '🗺️', directions: '🧭',
};
const e = (icon: string) => iconToEmoji[icon] || icon;

const srOnlyStyle: React.CSSProperties = {
  position: 'absolute',
  width: 1,
  height: 1,
  padding: 0,
  margin: -1,
  overflow: 'hidden',
  clip: 'rect(0,0,0,0)',
  whiteSpace: 'nowrap',
  borderWidth: 0,
};

const jsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Article',
  headline: 'Freenzy.io pour Cabinets — Automatisez Secretariat, Documents Juridiques et Suivi Dossiers avec l\'IA',
  description: 'Comment les cabinets d\'avocats, comptables et medicaux utilisent Freenzy.io pour automatiser le secretariat, generer des documents juridiques, gerer les rendez-vous et suivre les dossiers. Conforme RGPD.',
  author: { '@type': 'Organization', name: 'Freenzy.io' },
  publisher: { '@type': 'Organization', name: 'Freenzy.io' },
  about: { '@type': 'SoftwareApplication', name: 'Freenzy.io', applicationCategory: 'BusinessApplication' },
};

export default function CasCabinetPage() {
  return (
    <div style={{ background: '#0f0720', minHeight: '100vh', color: '#ffffff' }}>
      <Script
        id="jsonld-cabinet"
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <PublicNav />

      <main aria-label="Etude de cas cabinet professionnel — Freenzy.io">
        {/* Hero */}
        <section
          aria-label="Presentation de l'etude de cas cabinet"
          className="cs-hero"
          style={{
            padding: '120px 24px 80px',
            textAlign: 'center',
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
          <div
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              background: 'rgba(124,58,237,0.12)',
              border: '1px solid rgba(124,58,237,0.3)',
              borderRadius: 100,
              padding: '8px 20px',
              marginBottom: 32,
              fontSize: 14,
              color: '#7c3aed',
              fontWeight: 500,
            }}
          >
            <span role="img" aria-label="Cabinet professionnel" style={{ fontSize: 18 }}>
              {e(study.sectorIcon)}
            </span>
            {study.sector}
          </div>
          <h1
            style={{
              fontSize: 'clamp(1.8rem, 5vw, 3rem)',
              fontWeight: 800,
              lineHeight: 1.15,
              marginBottom: 24,
              letterSpacing: '-0.03em',
            }}
          >
            {study.heroTitle}
          </h1>
          <p
            style={{
              fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
              color: 'rgba(255,255,255,0.6)',
              lineHeight: 1.7,
              maxWidth: 700,
              margin: '0 auto 32px',
            }}
          >
            {study.heroSubtitle}
          </p>
          <div
            className="cs-persona-badge"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 12,
              background: 'rgba(255,255,255,0.05)',
              borderRadius: 100,
              padding: '12px 24px',
              fontSize: 15,
              color: 'rgba(255,255,255,0.7)',
              maxWidth: '100%',
              flexWrap: 'wrap',
              justifyContent: 'center',
            }}
          >
            <span role="img" aria-label="Personne" style={{ fontSize: 20, color: '#7c3aed' }}>
              {'👤'}
            </span>
            {study.persona.name}, {study.persona.age} ans — {study.persona.role} {'\u00E0'} {study.persona.city}
          </div>

          {/* sr-only SEO paragraph */}
          <p style={srOnlyStyle}>
            Freenzy.io est la solution d&apos;intelligence artificielle multi-agents pour les cabinets d&apos;avocats, cabinets comptables, cabinets medicaux et professions liberales. Automatisez le secretariat telephonique avec un repondeur IA qui filtre et qualifie les appels 24h/24, generez automatiquement vos documents juridiques (conclusions, memoires, courriers, contrats), gerez les rendez-vous et suivez l&apos;avancement des dossiers clients. Solution conforme RGPD avec hebergement des donnees en Europe. Cette etude de cas presente les gains de productivite concrets obtenus par un cabinet utilisant les agents IA Freenzy.
          </p>
        </section>

        {/* Les defis */}
        <section aria-label="Les defis avant Freenzy" className="cs-section" style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            Les{' '}
            <span style={{ color: '#ef4444' }}>defis</span>{' '}
            de {study.persona.name}
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              maxWidth: 550,
              margin: '0 auto 60px',
              lineHeight: 1.6,
            }}
          >
            Avant Freenzy, la charge administrative etouffait le cabinet.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              justifyContent: 'center',
            }}
          >
            {study.painPoints.map((pain, i) => (
              <div
                key={i}
                className="cs-card"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: 32,
                  flex: '1 1 280px',
                  maxWidth: 340,
                }}
              >
                <div
                  style={{
                    width: 48,
                    height: 48,
                    borderRadius: 12,
                    background: 'rgba(239,68,68,0.1)',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    marginBottom: 20,
                  }}
                >
                  <span
                    role="img"
                    aria-label={pain.title}
                    style={{ fontSize: 24, color: '#ef4444' }}
                  >
                    {e(pain.icon)}
                  </span>
                </div>
                <h3
                  style={{
                    fontSize: 16,
                    fontWeight: 600,
                    marginBottom: 12,
                    color: '#ffffff',
                  }}
                >
                  {pain.title}
                </h3>
                <p
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.65,
                    margin: 0,
                  }}
                >
                  {pain.description}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* La solution Freenzy */}
        <section aria-label="Solutions IA Freenzy pour les cabinets" className="cs-section" style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 16,
              letterSpacing: '-0.02em',
            }}
          >
            La solution{' '}
            <span style={{ color: '#7c3aed' }}>Freenzy</span>
          </h2>
          <p
            style={{
              textAlign: 'center',
              color: 'rgba(255,255,255,0.5)',
              fontSize: 'clamp(0.95rem, 2vw, 1.05rem)',
              maxWidth: 550,
              margin: '0 auto 60px',
              lineHeight: 1.6,
            }}
          >
            3 agents IA specialises, travaillant en continu pour {study.persona.name}.
          </p>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              justifyContent: 'center',
            }}
          >
            {study.solutions.map((sol, i) => (
              <div
                key={i}
                className="cs-card"
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: 32,
                  flex: '1 1 280px',
                  maxWidth: 340,
                  position: 'relative',
                  overflow: 'hidden',
                }}
              >
                <div
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    height: 2,
                    background: 'linear-gradient(90deg, #7c3aed, #06b6d4)',
                    opacity: 0.6,
                  }}
                />
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 12,
                    marginBottom: 20,
                  }}
                >
                  <div
                    style={{
                      width: 48,
                      height: 48,
                      borderRadius: 12,
                      background: 'rgba(124,58,237,0.12)',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                    }}
                  >
                    <span
                      role="img"
                      aria-label={`Agent ${sol.agent}`}
                      style={{ fontSize: 24, color: '#7c3aed' }}
                    >
                      {e(sol.agentIcon)}
                    </span>
                  </div>
                  <div>
                    <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 500 }}>
                      Agent
                    </div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: '#7c3aed' }}>
                      {sol.agent}
                    </div>
                  </div>
                </div>
                <p
                  style={{
                    fontSize: 14,
                    color: 'rgba(255,255,255,0.7)',
                    lineHeight: 1.6,
                    marginBottom: 16,
                  }}
                >
                  {sol.action}
                </p>
                <div
                  className="cs-result-badge"
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 8,
                    padding: '10px 14px',
                    background: 'rgba(34,197,94,0.08)',
                    borderRadius: 8,
                    fontSize: 13,
                    color: '#22c55e',
                    fontWeight: 500,
                  }}
                >
                  <span role="img" aria-label="Resultat positif" style={{ fontSize: 16 }}>
                    ✅
                  </span>
                  {sol.result}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Les resultats */}
        <section aria-label="Resultats chiffres obtenus" className="cs-section" style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
          <h2
            style={{
              fontSize: 'clamp(1.5rem, 4vw, 2.2rem)',
              fontWeight: 700,
              textAlign: 'center',
              marginBottom: 60,
              letterSpacing: '-0.02em',
            }}
          >
            Les{' '}
            <span
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
              }}
            >
              resultats
            </span>
          </h2>
          <div
            style={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 24,
              justifyContent: 'center',
            }}
          >
            {study.results.map((res, i) => (
              <figure
                key={i}
                className="cs-stat-card"
                aria-label={`${res.value} — ${res.metric}`}
                style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16,
                  padding: '40px 32px',
                  flex: '1 1 260px',
                  maxWidth: 320,
                  textAlign: 'center',
                  margin: 0,
                }}
              >
                <div
                  aria-label={`Statistique : ${res.value} ${res.metric}`}
                  style={{
                    fontSize: 'clamp(2.5rem, 6vw, 3.5rem)',
                    fontWeight: 800,
                    background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
                    WebkitBackgroundClip: 'text',
                    WebkitTextFillColor: 'transparent',
                    marginBottom: 8,
                    lineHeight: 1,
                  }}
                >
                  {res.value}
                </div>
                <figcaption
                  style={{
                    fontSize: 15,
                    fontWeight: 600,
                    color: '#ffffff',
                    marginBottom: 10,
                  }}
                >
                  {res.metric}
                </figcaption>
                <p
                  style={{
                    fontSize: 13,
                    color: 'rgba(255,255,255,0.5)',
                    lineHeight: 1.6,
                    margin: 0,
                  }}
                >
                  {res.description}
                </p>
              </figure>
            ))}
          </div>
        </section>

        {/* Testimonial */}
        <section aria-label="Temoignage client cabinet professionnel" className="cs-section" style={{ padding: '0 24px 100px', maxWidth: 800, margin: '0 auto' }}>
          <article
            className="cs-testimonial"
            style={{
              background: 'rgba(255,255,255,0.03)',
              border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 24,
              padding: '48px 40px',
              textAlign: 'center',
              position: 'relative',
            }}
          >
            <span
              role="img"
              aria-label="Citation"
              style={{
                fontSize: 40,
                color: 'rgba(124,58,237,0.3)',
                marginBottom: 24,
                display: 'block',
              }}
            >
              💬
            </span>
            <blockquote
              style={{
                fontSize: 'clamp(1rem, 2.5vw, 1.2rem)',
                color: 'rgba(255,255,255,0.85)',
                lineHeight: 1.8,
                fontStyle: 'italic',
                marginBottom: 24,
                maxWidth: 600,
                margin: '0 auto 24px',
              }}
            >
              &laquo; {study.testimonial.quote} &raquo;
            </blockquote>
            <div style={{ fontSize: 15, fontWeight: 600, color: '#7c3aed', marginBottom: 4 }}>
              {study.persona.name}, {study.persona.role}
            </div>
            <div
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 6,
                fontSize: 12,
                color: 'rgba(255,255,255,0.35)',
                marginTop: 8,
                background: 'rgba(255,255,255,0.04)',
                padding: '4px 12px',
                borderRadius: 100,
              }}
            >
              <span role="img" aria-label="Information" style={{ fontSize: 14 }}>
                ℹ️
              </span>
              {study.testimonial.note}
            </div>
          </article>
        </section>

        {/* CTA */}
        <section aria-label="Appel a l'action — essayer Freenzy" className="cs-cta-section" style={{ padding: '0 24px 120px', textAlign: 'center' }}>
          <Link
            href="/client/dashboard"
            title="Accedez au dashboard Freenzy.io pour votre cabinet"
            aria-label="Explorer le dashboard Freenzy.io pour automatiser votre cabinet"
            className="cs-cta-btn"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
              padding: '16px 36px',
              background: 'linear-gradient(135deg, #7c3aed, #06b6d4)',
              color: '#ffffff',
              borderRadius: 12,
              fontSize: 16,
              fontWeight: 600,
              textDecoration: 'none',
              border: 'none',
              cursor: 'pointer',
              minHeight: 48,
            }}
          >
            {study.ctaText}
            <span role="img" aria-label="Fleche vers la droite" style={{ fontSize: 20 }}>
              →
            </span>
          </Link>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
