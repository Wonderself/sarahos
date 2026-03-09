'use client';

import Link from 'next/link';
import PublicNav from '@/components/PublicNav';
import PublicFooter from '@/components/PublicFooter';
import { CASE_STUDIES } from '@/lib/case-studies-data';

const study = CASE_STUDIES.find((s) => s.slug === 'immobilier')!;

export default function CasImmobilierPage() {
  return (
    <div style={{ background: '#0f0720', minHeight: '100vh', color: '#ffffff' }}>
      <PublicNav />

      {/* Hero */}
      <section
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
          <span className="material-symbols-rounded" style={{ fontSize: 18 }}>
            {study.sectorIcon}
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
          style={{
            display: 'inline-flex',
            alignItems: 'center',
            gap: 12,
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 100,
            padding: '12px 24px',
            fontSize: 15,
            color: 'rgba(255,255,255,0.7)',
          }}
        >
          <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#7c3aed' }}>
            person
          </span>
          {study.persona.name}, {study.persona.age} ans — {study.persona.role} à {study.persona.city}
        </div>
      </section>

      {/* Les défis */}
      <section style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
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
          <span style={{ color: '#ef4444' }}>défis</span>{' '}
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
          Avant Freenzy, chaque journée était une course après le temps.
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
                  className="material-symbols-rounded"
                  style={{ fontSize: 24, color: '#ef4444' }}
                >
                  {pain.icon}
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
      <section style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
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
          3 agents IA spécialisés, travaillant en continu pour {study.persona.name}.
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
                    className="material-symbols-rounded"
                    style={{ fontSize: 24, color: '#7c3aed' }}
                  >
                    {sol.agentIcon}
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
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                  padding: '10px 14px',
                  background: 'rgba(34,197,94,0.08)',
                  borderRadius: 8,
                  fontSize: 13,
                  color: '#22c55e',
                  fontWeight: 500,
                }}
              >
                <span className="material-symbols-rounded" style={{ fontSize: 16 }}>
                  check_circle
                </span>
                {sol.result}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Les résultats */}
      <section style={{ padding: '0 24px 100px', maxWidth: 1100, margin: '0 auto' }}>
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
            résultats
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
            <div
              key={i}
              style={{
                background: 'rgba(255,255,255,0.03)',
                border: '1px solid rgba(255,255,255,0.08)',
                borderRadius: 16,
                padding: '40px 32px',
                flex: '1 1 260px',
                maxWidth: 320,
                textAlign: 'center',
              }}
            >
              <div
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
              <div
                style={{
                  fontSize: 15,
                  fontWeight: 600,
                  color: '#ffffff',
                  marginBottom: 10,
                }}
              >
                {res.metric}
              </div>
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
            </div>
          ))}
        </div>
      </section>

      {/* Testimonial */}
      <section style={{ padding: '0 24px 100px', maxWidth: 800, margin: '0 auto' }}>
        <div
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
            className="material-symbols-rounded"
            style={{
              fontSize: 40,
              color: 'rgba(124,58,237,0.3)',
              marginBottom: 24,
              display: 'block',
            }}
          >
            format_quote
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
            <span className="material-symbols-rounded" style={{ fontSize: 14 }}>
              info
            </span>
            {study.testimonial.note}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: '0 24px 120px', textAlign: 'center' }}>
        <Link
          href="/register"
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
          }}
        >
          {study.ctaText}
          <span className="material-symbols-rounded" style={{ fontSize: 20 }}>
            arrow_forward
          </span>
        </Link>
      </section>

      <PublicFooter />
    </div>
  );
}
