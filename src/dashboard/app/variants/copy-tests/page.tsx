'use client';

import Link from 'next/link';
import PublicNav from '../../../components/PublicNav';
import PublicFooter from '../../../components/PublicFooter';

const COPY_TESTS = [
  {
    slug: 'roi-economie',
    title: 'ROI / Economies',
    headline: 'Remplacez 5 employes pour le prix d\'un cafe',
    desc: 'Chiffres, comparaisons cout IA vs salaire, ROI immediat. Section tarifs promue en 3e position.',
    cta: 'Calculer mes economies',
    color: '#22c55e',
    icon: 'savings',
    score: 68,
  },
  {
    slug: 'urgence-fomo',
    title: 'Urgence / FOMO',
    headline: 'Vos concurrents automatisent deja',
    desc: 'Pression concurrentielle, places limitees (5 000 a 0% commission), compteurs urgence.',
    cta: 'Prendre ma place',
    color: '#ef4444',
    icon: 'timer',
    score: 62,
  },
  {
    slug: 'simplicite',
    title: 'Simplicite / Anti-tech',
    headline: 'Envoyez un WhatsApp. Votre IA fait le reste.',
    desc: 'Zero formation, WhatsApp promu en 3e section, 6 messages demo, section "3 etapes".',
    cta: 'Essayer maintenant',
    color: '#3b82f6',
    icon: 'touch_app',
    score: 70,
  },
  {
    slug: 'preuve-sociale',
    title: 'Preuve Sociale / Autorite',
    headline: 'Deja adopte par des milliers de pros',
    desc: 'Logos partenaires, temoignages, stats panel (2 400+ utilisateurs), trust signals.',
    cta: 'Rejoindre la communaute',
    color: '#9333ea',
    icon: 'verified',
    score: 65,
  },
  {
    slug: 'probleme-solution',
    title: 'Probleme → Solution',
    headline: 'Noye dans l\'admin ? On a la solution.',
    desc: 'Pain points d\'abord (appels manques, devis en retard), puis revelation de la solution.',
    cta: 'Reprendre le controle',
    color: '#f97316',
    icon: 'lightbulb',
    score: 72,
  },
  {
    slug: 'vision-futuriste',
    title: 'Vision / Futuriste',
    headline: 'Le CEO du futur ne travaille plus seul',
    desc: 'Futur du travail, showcase 6 modeles IA, transformation digitale, messaging pionnier.',
    cta: 'Devenir pionnier',
    color: '#5b6cf7',
    icon: 'rocket_launch',
    score: 58,
  },
];

export default function CopyTestsIndex() {
  return (
    <>
      <PublicNav />
      <main style={{ paddingTop: 56, minHeight: '100vh', background: '#0a0a0f' }}>

        <header style={{ padding: '48px 24px 32px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
          <p style={{ fontSize: 11, fontWeight: 600, color: '#5b6cf7', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
            Copy Tests
          </p>
          <h1 style={{
            fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 5vw, 40px)',
            fontWeight: 800, letterSpacing: -1.5, color: '#fff', marginBottom: 10,
          }}>
            6 angles de vente
          </h1>
          <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.45)', maxWidth: 520, margin: '0 auto 24px', lineHeight: 1.65 }}>
            Meme produit, meme design, meme features — mais un messaging different. Chaque variante teste un angle de vente pour identifier ce qui convertit le mieux.
          </p>
          <Link href="/variants" style={{
            fontSize: 12, color: '#5b6cf7', textDecoration: 'none', fontWeight: 600,
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>arrow_back</span>
            Voir l&apos;audit complet
          </Link>
        </header>

        <div style={{ maxWidth: 720, margin: '0 auto', padding: '32px 24px 64px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
            {COPY_TESTS.sort((a, b) => b.score - a.score).map((t) => (
              <Link
                key={t.slug}
                href={`/variants/copy-tests/${t.slug}`}
                style={{
                  display: 'flex', alignItems: 'center', gap: 16,
                  padding: '20px 22px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  textDecoration: 'none',
                  transition: 'border-color 0.2s, background 0.2s',
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = `${t.color}44`;
                  e.currentTarget.style.background = 'rgba(255,255,255,0.05)';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = 'rgba(255,255,255,0.06)';
                  e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
                }}
              >
                {/* Icon */}
                <div style={{
                  width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                  background: `${t.color}15`, border: `1px solid ${t.color}30`,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 22, color: t.color }}>{t.icon}</span>
                </div>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff' }}>
                      {t.title}
                    </span>
                    <span style={{
                      fontSize: 10, fontWeight: 700, padding: '2px 8px', borderRadius: 6,
                      background: `${t.color}15`, color: t.color,
                    }}>
                      {t.score}/100
                    </span>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', marginBottom: 3, fontStyle: 'italic' }}>
                    &laquo; {t.headline} &raquo;
                  </p>
                  <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.35)', lineHeight: 1.5 }}>
                    {t.desc}
                  </p>
                </div>

                {/* Arrow */}
                <span className="material-symbols-rounded" style={{ fontSize: 20, color: 'rgba(255,255,255,0.2)', flexShrink: 0 }}>
                  arrow_forward
                </span>
              </Link>
            ))}
          </div>

          {/* Footer note */}
          <div style={{
            marginTop: 32, padding: '16px 20px', borderRadius: 12,
            background: 'rgba(91,108,247,0.06)', border: '1px solid rgba(91,108,247,0.12)',
            fontSize: 12, color: 'rgba(255,255,255,0.4)', lineHeight: 1.65,
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 14, color: '#5b6cf7', verticalAlign: 'middle', marginRight: 6 }}>info</span>
            Toutes les variantes incluent le switcher audience (Particulier / Freelance / Entreprise), le tracking GA4, et le reordonnement FAQ par audience. Hero compact avec tickers visibles above the fold.
          </div>
        </div>

      </main>
      <PublicFooter />
    </>
  );
}
