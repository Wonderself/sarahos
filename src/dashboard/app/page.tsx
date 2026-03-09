'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import AudienceStickyBar from '../components/AudienceStickyBar';
import EnterpriseSection from './plans/EnterpriseSection';
import { TOTAL_AGENTS_DISPLAY } from '../lib/agent-config';
import { FAQ_CATEGORIES, TOTAL_FAQ_COUNT } from '../lib/faq-data';
import { useAudience } from '../lib/use-audience';
import { getOrderedFaqCategories } from '../lib/faq-utils';
import { useSectionObserver } from '../hooks/useSectionObserver';
import { trackPageView, trackCtaClick, trackFaqOpened } from '../lib/analytics';
import {
  ACTIVITY, STATS_BADGES, DEMO_SCENARIOS, SCENARIOS, TECH_FEATURES,
  WA_MESSAGES, TOOL_CATEGORIES, CUSTOM_EXAMPLES, WHY_FREENZY, TRUST_BADGES,
  LANDING_AGENTS,
  DISCUSSION_HIGHLIGHTS, DISCUSSION_CATEGORIES,
  PERSONAL_AGENTS_LANDING,
  STUDIO_FEATURES, STUDIO_CATEGORIES,
  ARCADE_GAMES_PREVIEW, ARCADE_BADGES_PREVIEW, ARCADE_STATS,
  REWARDS_CHIPS,
} from '../lib/landing-data';

const totalAgents = TOTAL_AGENTS_DISPLAY;

/* ═══════════════════════════════════════════════════════════
   CAROUSEL COMPONENT
   ═══════════════════════════════════════════════════════════ */

function Carousel({ items, renderItem, autoPlay = 4000 }: {
  items: any[];
  renderItem: (item: any, i: number) => React.ReactNode;
  autoPlay?: number;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const len = items.length;

  useEffect(() => {
    if (paused || !autoPlay) return;
    const t = setInterval(() => setIdx(p => (p + 1) % len), autoPlay);
    return () => clearInterval(t);
  }, [paused, autoPlay, len]);

  // Show 4 on desktop, wrap around
  const visibleCount = 4;
  const visible: number[] = [];
  for (let i = 0; i < visibleCount; i++) visible.push((idx + i) % len);

  return (
    <div
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      style={{ position: 'relative' }}
    >
      <div className="lp-carousel-grid" style={{
        display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
      }}>
        {visible.map((vi, i) => (
          <div key={`${vi}-${i}`} style={{ animation: 'lp-fade-in 0.4s ease' }}>
            {renderItem(items[vi], vi)}
          </div>
        ))}
      </div>
      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Voir exemple ${i + 1}`}
            style={{
              width: idx === i ? 20 : 8, height: 8, borderRadius: 4, border: 'none',
              background: idx === i ? '#8b5cf6' : '#d1d5db', cursor: 'pointer',
              transition: 'all 0.3s', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   TECH CAROUSEL (horizontal scroll on mobile, carousel desktop)
   ═══════════════════════════════════════════════════════════ */

function TechCarousel({ items }: { items: typeof TECH_FEATURES }) {
  const [idx, setIdx] = useState(0);
  const len = items.length;

  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % len), 5000);
    return () => clearInterval(t);
  }, [len]);

  return (
    <div>
      <div className="lp-scenario-steps" style={{ gap: 14 }}>
        {items.map((t, i) => (
          <div key={i} style={{
            padding: '20px 22px', borderRadius: 16,
            background: 'rgba(255,255,255,0.04)', border: `1px solid ${i === idx ? `${t.color}33` : 'rgba(255,255,255,0.06)'}`,
            opacity: i === idx ? 1 : 0.6,
            transform: i === idx ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#fff' }}>{t.title}</h3>
            </div>
            <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 10 }}>{t.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {t.points.map((p, j) => (
                <span key={j} style={{
                  fontSize: 11, color: 'rgba(255,255,255,0.5)', background: 'rgba(255,255,255,0.06)',
                  padding: '3px 10px', borderRadius: 20,
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Dots */}
      <div style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
        {items.map((t, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Technologie ${t.title}`}
            style={{
              width: idx === i ? 20 : 8, height: 8, borderRadius: 4, border: 'none',
              background: idx === i ? t.color : 'rgba(255,255,255,0.15)', cursor: 'pointer',
              transition: 'all 0.3s', padding: 0,
            }}
          />
        ))}
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */

export default function LandingPage() {
  const [openFaq, setOpenFaq]               = useState<number | null>(null);
  const [faqCat, setFaqCat]                 = useState(0);
  const [demoTab, setDemoTab]               = useState(0);
  const [toolTab, setToolTab]               = useState(0);
  const { audience, setAudience, config }   = useAudience();

  // FAQ reorder by audience
  const orderedFaq = useMemo(() => getOrderedFaqCategories(FAQ_CATEGORIES, audience), [audience]);
  useEffect(() => { setFaqCat(0); setOpenFaq(null); }, [audience]);

  // Section observer for scroll tracking
  const heroRef = useRef<HTMLElement>(null);
  const agentsRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const enterpriseRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const sectionRefs = useMemo(() => ({
    hero: heroRef, agents: agentsRef, faq: faqRef, enterprise: enterpriseRef, cta: ctaRef,
  }), []);
  useSectionObserver(sectionRefs);

  // Page view on mount
  useEffect(() => { trackPageView('/', 'main', audience); }, [audience]);

  const demo = DEMO_SCENARIOS[demoTab];

  // Audience-aware
  const displayAgents = config ? config.agents : LANDING_AGENTS;
  const heroHeadline = config?.hero.headline;
  const heroSub = config?.hero.subheadline;
  const heroBadge = config?.hero.badge;
  const heroCta = config?.cta;

  return (
    <>
      <PublicNav />
      <AudienceStickyBar audience={audience} onChange={setAudience} variant="dark" />
      <main style={{ paddingTop: 108 }}>

        {/* ══ HERO ═══════════════════════════════════════════ */}
        <section ref={heroRef} style={{
          background: 'linear-gradient(170deg, #0a0a0f 0%, #13131f 100%)',
          padding: 'clamp(32px, 4vw, 48px) 24px clamp(24px, 3vw, 36px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div className="lp-hero-glow-anim" style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 600, height: 350,
            background: 'radial-gradient(ellipse, rgba(91,108,247,0.14) 0%, transparent 68%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 10, marginTop: -8 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)',
                color: '#86efac', padding: '5px 16px', borderRadius: 40,
                fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block', flexShrink: 0 }} />
                <span className="lp-green-badge-full">{heroBadge || 'Pro & Particuliers · 0% de commission · Simplicité · Personnalisation 100% · Complet'}</span>
                <span className="lp-green-badge-mobile">{heroBadge || 'Pros & Particuliers · 0% frais · Personnalisable 100% · Simple et complet'}</span>
              </span>
            </div>

            <h1 className="lp-gradient-h1" style={{
              fontFamily: 'var(--font-display)',
              fontSize: heroHeadline ? 'clamp(28px, 6vw, 72px)' : 'clamp(32px, 7.8vw, 94px)',
              fontWeight: 700, lineHeight: 0.92,
              marginBottom: 14, letterSpacing: -4,
              textTransform: heroHeadline ? 'none' : 'uppercase',
            }}>
              {heroHeadline ? heroHeadline : <>Utilisez<br />vraiment l&apos;IA.</>}
            </h1>

            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(13px, 1.6vw, 15px)',
              color: '#5b6cf7', fontWeight: 600,
              letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              Free &amp; Easy
            </p>

            <p style={{
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              color: 'rgba(255,255,255,0.65)',
              lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px',
            }}>
              {heroSub ? (
                <span style={{ color: 'rgba(255,255,255,0.75)' }}>{heroSub}</span>
              ) : (
                <><span style={{ color: '#a5b4fc', fontWeight: 700 }}>{totalAgents}+ agents</span> pour s&apos;occuper de vous : <span style={{ color: 'rgba(255,255,255,0.75)' }}>téléphonie, réveil, réseaux sociaux, documents, réflexions, WhatsApp, modules sur mesure…</span></>
              )}
            </p>

            {/* Bonus message per audience */}
            {config?.bonusMessage && (
              <p style={{
                fontSize: 12, color: '#86efac', fontWeight: 600, marginBottom: 16,
                background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)',
                display: 'inline-block', padding: '5px 16px', borderRadius: 20,
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>redeem</span>
                {config.bonusMessage}
              </p>
            )}

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
              <Link href={heroCta?.href || '/login?mode=register'} className="lp-cta-primary" onClick={() => trackCtaClick('hero_cta', heroCta?.href || '/login?mode=register', audience, '/')} style={{
                padding: '12px 20px', background: '#5b6cf7', color: '#fff',
                borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(12px, 3.2vw, 15px)', textDecoration: 'none',
                minHeight: 44, whiteSpace: 'nowrap',
              }}>
                {heroCta?.label || 'Commencer gratuitement'}
              </Link>
              <Link href="/plans" style={{
                padding: '12px 16px', minHeight: 44, whiteSpace: 'nowrap',
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)',
                color: 'rgba(255,255,255,0.78)', borderRadius: 10, fontWeight: 600,
                fontSize: 'clamp(11px, 3vw, 14px)', textDecoration: 'none',
              }}>
                Voir les tarifs
              </Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 16 }}>
                <div style={{ display: 'flex' }}>
                  {['👩‍💼', '👨‍🔧', '👩‍🍳'].map((e, i) => (
                    <span key={i} style={{ fontSize: 18, marginLeft: i > 0 ? -6 : 0, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.3))' }}>{e}</span>
                  ))}
                </div>
                <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)' }}>
                  Rejoint par <strong style={{ color: 'rgba(255,255,255,0.8)' }}>500+ professionnels</strong> ce mois-ci
                </span>
              </div>
            </div>

          </div>
        </section>

        {/* ══ LIVE ACTIVITY TICKER ══════════════════════════════ */}
        <div style={{ background: '#0c0c14', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 0' }}>
          <div className="lp-ticker-wrap">
            <div className="lp-ticker">
              {[...ACTIVITY, ...ACTIVITY].map((item, i) => (
                <div key={i} className="lp-ticker-item lp-activity-chip" style={{ gap: 8, padding: '6px 14px' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 13 }}>{item.icon}</span>
                  <span style={{ color: item.color, fontWeight: 700, fontSize: 11 }}>{item.agent}</span>
                  <span style={{ color: 'rgba(255,255,255,0.65)', fontSize: 11 }}>{item.text}</span>
                  <span style={{ color: 'rgba(255,255,255,0.35)', fontSize: 10 }}>· {item.ago}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ STATS REVERSE TICKER ═════════════════════════════ */}
        <div style={{ background: '#0c0c14', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 0' }}>
          <div className="lp-ticker-wrap">
            <div className="lp-ticker-reverse">
              {[...STATS_BADGES, ...STATS_BADGES].map((s, i) => (
                <div key={i} className="lp-stats-badge">
                  <span className="lp-stats-badge-icon material-symbols-rounded">{s.icon}</span>
                  <span className="lp-stats-badge-value">{s.value}</span>
                  <span className="lp-stats-badge-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ AVANT / APRÈS ════════════════════════════════════════ */}
        <section style={{ background: '#0a0a0f', padding: 'clamp(40px, 5vw, 72px) 24px' }}>
          <div style={{ maxWidth: 900, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#a5b4fc', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Transformation</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#fff', letterSpacing: -1.5, marginBottom: 8 }}>
                Avant Freenzy <span style={{ color: 'rgba(255,255,255,0.35)' }}>vs</span> Avec Freenzy
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 14, maxWidth: 520, margin: '0 auto' }}>
                {`D\u00e9couvrez comment nos fonctionnalit\u00e9s transforment votre quotidien`}
              </p>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 380px), 1fr))', gap: 16 }}>
              {[
                { before: 'Appels manqu\u00e9s pendant les r\u00e9unions', after: 'R\u00e9pondeur IA traite 100% des appels 24/7', icon: 'call' },
                { before: '3 heures pour r\u00e9diger un contrat', after: 'Document g\u00e9n\u00e9r\u00e9 en 30 secondes par l\u2019IA', icon: 'description' },
                { before: 'Posts sociaux irr\u00e9guliers et oubli\u00e9s', after: 'Calendrier \u00e9ditorial IA automatis\u00e9', icon: 'calendar_month' },
                { before: 'R\u00e9veil chaotique, journ\u00e9e non planifi\u00e9e', after: 'Briefing matinal personnalis\u00e9 chaque jour', icon: 'alarm' },
              ].map((item, i) => (
                <div key={i} style={{
                  display: 'flex', borderRadius: 14, overflow: 'hidden',
                  border: '1px solid rgba(255,255,255,0.08)',
                  background: 'rgba(255,255,255,0.03)',
                }}>
                  {/* Before */}
                  <div style={{
                    flex: 1, padding: '18px 16px',
                    background: 'rgba(239,68,68,0.06)',
                    borderRight: '1px solid rgba(255,255,255,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>{'\u274C'}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.6)', lineHeight: 1.5 }}>{item.before}</span>
                  </div>

                  {/* Arrow */}
                  <div style={{
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    padding: '0 2px', background: 'rgba(255,255,255,0.03)', flexShrink: 0,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 20, color: '#5b6cf7' }}>arrow_forward</span>
                  </div>

                  {/* After */}
                  <div style={{
                    flex: 1, padding: '18px 16px',
                    background: 'rgba(34,197,94,0.06)',
                    display: 'flex', flexDirection: 'column', gap: 8,
                  }}>
                    <span style={{ fontSize: 18 }}>{'\u2705'}</span>
                    <span style={{ fontSize: 13, color: 'rgba(255,255,255,0.75)', lineHeight: 1.5, fontWeight: 600 }}>{item.after}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* RÉSULTATS CONCRETS */}
        <section style={{ background: '#0a0a0f', padding: 'clamp(40px, 5vw, 80px) 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{
            textAlign: 'center', fontSize: 'clamp(24px, 4vw, 36px)', fontWeight: 700,
            color: '#fff', marginBottom: 12
          }}>
            Des résultats mesurables
          </h2>
          <p style={{ textAlign: 'center', fontSize: 16, color: 'rgba(255,255,255,0.6)', marginBottom: 48, maxWidth: 600, margin: '0 auto 48px' }}>
            Ce que nos utilisateurs constatent dès la première semaine
          </p>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 20 }}>
            {[
              { value: '15h', label: 'récupérées par semaine', sub: 'en moyenne par utilisateur', icon: 'schedule' },
              { value: '200+', label: 'messages gérés / mois', sub: 'par le Répondeur IA', icon: 'chat' },
              { value: '30s', label: 'pour générer un document', sub: 'au lieu de 45 minutes', icon: 'description' },
              { value: '0€', label: 'de commission sur vos revenus', sub: 'pour les 5000 premiers', icon: 'payments' },
            ].map((stat, i) => (
              <div key={i} style={{
                padding: '28px 24px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)',
                textAlign: 'center',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#7c3aed', marginBottom: 12, display: 'block' }}>{stat.icon}</span>
                <div style={{ fontSize: 'clamp(32px, 5vw, 44px)', fontWeight: 800, color: '#fff', lineHeight: 1 }}>{stat.value}</div>
                <div style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginTop: 8 }}>{stat.label}</div>
                <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginTop: 4 }}>{stat.sub}</div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* TÉMOIGNAGES */}
        <section style={{ background: '#111118', padding: 'clamp(40px, 5vw, 60px) 24px' }}>
          <div style={{ maxWidth: 1100, margin: '0 auto' }}>
          <h2 style={{ textAlign: 'center', fontSize: 'clamp(22px, 3.5vw, 32px)', fontWeight: 700, color: '#fff', marginBottom: 40 }}>
            Ils utilisent Freenzy au quotidien
          </h2>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 20 }}>
            {[
              { name: 'Marie D.', role: 'Restauratrice, Lyon', quote: "J'ai récupéré 15h par semaine. Le Répondeur gère les réservations, l'agent RH fait les plannings.", icon: 'restaurant', color: '#f97316' },
              { name: 'Thomas R.', role: 'Agent immobilier, Paris', quote: "Mes documents juridiques sont générés en 30 secondes. Avant, ça me prenait une demi-journée.", icon: 'home', color: '#3b82f6' },
              { name: 'Sophie L.', role: 'Expert-comptable, Bordeaux', quote: "Le briefing matinal me donne tout ce que je dois savoir avant même d'ouvrir mon cabinet.", icon: 'bar_chart', color: '#22c55e' },
            ].map((t, i) => (
              <div key={i} style={{
                padding: '24px',
                background: 'rgba(255,255,255,0.04)',
                borderRadius: 16,
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                <div style={{ fontSize: 15, color: 'rgba(255,255,255,0.8)', lineHeight: 1.6, fontStyle: 'italic', marginBottom: 16 }}>
                  &ldquo;{t.quote}&rdquo;
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: '50%',
                    background: `${t.color}18`, border: `1px solid ${t.color}33`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 20, color: t.color }}>{t.icon}</span>
                  </div>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600, color: '#fff' }}>{t.name}</div>
                    <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)' }}>{t.role}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          </div>
        </section>

        {/* ══ OUTILS UTILISATEURS ═════════════════════════════════ */}
        <section style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#5b6cf7', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Outils</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 6 }}>
                Vos <span className="fz-accent-word">outils</span>, prêts à l&apos;emploi.
              </h2>
              <p style={{ color: '#666', fontSize: 14 }}>Tout ce dont vous avez besoin, activé en <span className="fz-accent-word">un clic</span>.</p>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {TOOL_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => setToolTab(i)}
                  aria-selected={toolTab === i}
                  role="tab"
                  style={{
                    padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44,
                    background: toolTab === i ? '#5b6cf7' : '#f0f0f0',
                    color: toolTab === i ? '#fff' : '#555',
                    boxShadow: toolTab === i ? '0 2px 12px rgba(91,108,247,0.25)' : 'none',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 15 }}>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14,
            }} className="lp-tools-grid">
              {TOOL_CATEGORIES[toolTab].tools.map((tool, i) => (
                <div key={i} className="lp-app-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px 18px' }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: '#f0f0ff', border: '1px solid #e0e0ff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22 }}>{tool.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{tool.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#22c55e',
                        background: '#22c55e10', border: '1px solid #22c55e22',
                        padding: '2px 8px', borderRadius: 20,
                      }}>Inclus</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#555', lineHeight: 1.55 }}>{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <span style={{ fontSize: 12, color: '#888' }}>
                {TOOL_CATEGORIES.reduce((acc, c) => acc + c.tools.length, 0)} outils inclus dans tous les plans
              </span>
            </div>
          </div>
        </section>

        {/* ══ DEMO INTERACTIVE ══════════════════════════════════ */}
        <section style={{ background: '#1d1d1f', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#a5b4fc', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>En action</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#fff', letterSpacing: -1.5 }}>
                Vos <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>agents</span> au travail.
              </h2>
            </div>

            <div role="tablist" style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
              {DEMO_SCENARIOS.map((s, i) => (
                <button
                  key={i}
                  className="lp-demo-tab"
                  onClick={() => setDemoTab(i)}
                  role="tab"
                  aria-selected={demoTab === i}
                  style={{
                    padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44,
                    background: demoTab === i ? s.color : 'rgba(255,255,255,0.06)',
                    color: demoTab === i ? '#fff' : 'rgba(255,255,255,0.65)',
                    boxShadow: demoTab === i ? `0 0 20px ${s.color}44` : 'none',
                    transition: 'all 0.2s',
                  }}
                >
                  <span className="material-symbols-rounded" style={{ fontSize: 16, marginRight: 6 }}>{s.tabIcon}</span>
                  {s.tab}
                </button>
              ))}
            </div>

            <div style={{
              background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)',
              borderRadius: 16, overflow: 'hidden',
            }}>
              <div style={{
                background: 'rgba(255,255,255,0.03)', padding: '9px 16px',
                borderBottom: '1px solid rgba(255,255,255,0.06)',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbe2e', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.4)', marginLeft: 6 }}>
                  Flashboard · Agent {demo.tab}
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><span className="material-symbols-rounded" style={{ fontSize: 11, color: 'rgba(255,255,255,0.65)' }}>person</span></div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '0 12px 12px 12px', padding: '9px 13px',
                    fontSize: 13, color: 'rgba(255,255,255,0.8)', lineHeight: 1.55, maxWidth: 520,
                  }}>
                    {demo.prompt}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: `${demo.color}1a`, border: `1px solid ${demo.color}44`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><span className="material-symbols-rounded" style={{ fontSize: 11 }}>bolt</span></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: demo.color, fontWeight: 700, letterSpacing: 0.5 }}>
                        {demo.tab.toUpperCase()} · TERMINÉ
                      </span>
                      <span style={{
                        display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                        background: demo.color,
                        animation: 'lp-cursor-blink 1.2s step-end infinite',
                      }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {demo.lines.map((line, j) => (
                        <div key={j} style={{
                          background: 'rgba(255,255,255,0.03)',
                          border: '1px solid rgba(255,255,255,0.06)',
                          borderLeft: `2px solid ${demo.color}55`,
                          borderRadius: '0 8px 8px 0', padding: '7px 11px',
                          display: 'flex', gap: 10, alignItems: 'baseline',
                        }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.4)', textTransform: 'uppercase', letterSpacing: 0.4, flexShrink: 0, minWidth: 58 }}>
                            {line.label}
                          </span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.78)' }}>{line.text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{demo.model}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ DISCUSSIONS APPROFONDIES ═══════════════════════════════ */}
        <section style={{ background: '#f7f7f7', padding: 'clamp(40px, 5vw, 64px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="lp-discussions-grid">
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#7c3aed', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                  Réflexion profonde
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 12 }}>
                  Explorez les <span className="fz-accent-word">grandes questions</span> avec l&apos;IA.
                </h2>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 24 }}>
                  85+ templates de discussion guidée, 16 catégories, pensée étendue avec Claude Opus. L&apos;IA ne se contente pas de répondre — elle <span className="fz-accent-word">réfléchit profondément</span> avec vous.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {DISCUSSION_HIGHLIGHTS.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span className="material-symbols-rounded" style={{ fontSize: 18, color: '#7c3aed' }}>{h.icon}</span>
                      <span style={{ fontSize: 13, color: '#444' }}>{h.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {DISCUSSION_CATEGORIES.map((cat, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '4px 10px', borderRadius: 100,
                      background: i < DISCUSSION_CATEGORIES.length - 1 ? 'rgba(124,58,237,0.08)' : 'transparent',
                      color: '#7c3aed', fontWeight: 500,
                    }}>{cat}</span>
                  ))}
                </div>
                <Link href="/login?mode=register" className="lp-cta-primary" style={{
                  display: 'inline-block', padding: '12px 28px',
                  background: '#7c3aed', color: '#fff',
                  borderRadius: 10, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}>
                  Explorer les discussions
                </Link>
              </div>
              {/* Discussion mockup card */}
              <div style={{
                background: '#0a0a0f', borderRadius: 16, padding: 0, overflow: 'hidden',
                border: '1px solid rgba(255,255,255,0.08)',
              }}>
                {/* macOS-style chrome */}
                <div style={{ padding: '10px 14px', display: 'flex', gap: 6, borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#ef4444' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#f59e0b' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#22c55e' }} />
                </div>
                <div style={{ padding: '18px 18px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: 'rgba(124,58,237,0.2)', color: '#a78bfa', fontWeight: 600 }}>Philosophie</span>
                    <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>Extended Thinking</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#fff', marginBottom: 16 }}>Le bonheur est-il un choix ?</p>
                  {/* User bubble */}
                  <div style={{
                    background: 'rgba(124,58,237,0.15)', borderRadius: '12px 12px 4px 12px',
                    padding: '10px 14px', marginBottom: 10, maxWidth: '85%', marginLeft: 'auto',
                  }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.8)', lineHeight: 1.5, margin: 0 }}>
                      Est-ce que le bonheur dépend de nos circonstances ou de notre attitude intérieure ?
                    </p>
                  </div>
                  {/* AI bubble */}
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', borderRadius: '12px 12px 12px 4px',
                    padding: '10px 14px', maxWidth: '90%',
                  }}>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.7)', lineHeight: 1.5, margin: 0 }}>
                      Cette question touche au cœur de la philosophie stoïcienne. Épictète distinguait les choses qui dépendent de nous de celles qui n&apos;en dépendent pas...
                    </p>
                  </div>
                  {/* Depth bar */}
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: 'rgba(255,255,255,0.06)' }}>
                      <div style={{ width: '25%', height: '100%', borderRadius: 2, background: 'linear-gradient(90deg, #7c3aed, #a78bfa)' }} />
                    </div>
                    <span style={{ fontSize: 10, color: 'rgba(255,255,255,0.3)' }}>Profondeur 3/20</span>
                  </div>
                </div>
                <div style={{ padding: '8px 18px 12px', borderTop: '1px solid rgba(255,255,255,0.04)', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.3)' }}>85+ sujets disponibles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ COMMENT ÇA MARCHE — scenarios + technologies ═════════ */}
        <section style={{ background: '#1d1d1f', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#5b6cf7', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Comment ça marche</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#fff', letterSpacing: -1.5, marginBottom: 6 }}>
                <span className="fz-accent-word">Concret</span>. <span className="fz-accent-word">Automatisé</span>. <span className="fz-accent-word">Instantané</span>.
              </h2>
              <p style={{ color: 'rgba(255,255,255,0.5)', fontSize: 14 }}>Vos agents traitent tout, <span className="fz-accent-word">24h/24</span>. Voici ce que ça donne.</p>
            </div>

            {/* Scenarios concrets */}
            <div className="lp-scenario-steps" style={{ gap: 16, marginBottom: 40 }}>
              {SCENARIOS.map((s, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  borderRadius: 16, padding: 'clamp(16px, 2.5vw, 24px)',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, marginBottom: 14 }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.55)', lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {s.steps.map((step, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: 'rgba(255,255,255,0.6)' }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: `${s.color}22`, color: s.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, flexShrink: 0,
                        }}>{j + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, fontSize: 11, color: 'rgba(255,255,255,0.35)' }}>{s.tech}</div>
                </div>
              ))}
            </div>

            {/* Technologies intégrées — carousel */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.4)', letterSpacing: 3, textTransform: 'uppercase' }}>Propulsé par</p>
            </div>
            <TechCarousel items={TECH_FEATURES} />
          </div>
        </section>

        {/* ══ WHATSAPP ══════════════════════════════════════════ */}
        <section style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="lp-whatsapp-grid">
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#22c55e', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>WhatsApp</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 12 }}>
                  Vos agents sur <span className="fz-accent-word" style={{ color: '#22c55e' }}>WhatsApp</span>.
                </h2>
                <p style={{ fontSize: 14, color: '#555', lineHeight: 1.65, marginBottom: 20 }}>
                  Recevez les résumés, donnez des instructions, pilotez votre entreprise depuis WhatsApp. Vos agents répondent en <span className="fz-accent-word" style={{ color: '#22c55e' }}>temps réel</span>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Résumés automatiques', 'Instructions en langage naturel', 'Notifications intelligentes', 'Fichiers et documents'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#444' }}>
                      <span className="material-symbols-rounded" style={{ color: '#22c55e', fontSize: 16 }}>check_circle</span> {f}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{
                background: '#075e54', borderRadius: 20, padding: '20px 16px',
                maxWidth: 340, width: '100%',
              }}>
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.8)' }}>Freenzy Assistant</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {WA_MESSAGES.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.from === 'user' ? '#dcf8c6' : '#fff',
                      color: '#1d1d1f', borderRadius: 10, padding: '8px 12px',
                      maxWidth: '85%', fontSize: 12, lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                    }}>
                      {msg.text}
                      <div style={{ fontSize: 10, color: '#888', textAlign: 'right', marginTop: 3 }}>{msg.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ AGENTS PERSONNELS B2C ══════════════════════════════ */}
        <section style={{ background: '#0e0e18', padding: 'clamp(40px, 5vw, 64px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#ec4899', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Votre vie personnelle
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#fff', letterSpacing: -1.5, marginBottom: 12 }}>
                Des agents IA pour <span className="fz-accent-word" style={{ color: '#ec4899' }}>VOUS</span>, pas juste votre entreprise.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                Budget, impôts, immobilier, coaching, écriture... <span style={{ color: '#ec4899', fontWeight: 600 }}>12 agents personnels</span>, inclus gratuitement dans chaque compte.
              </p>
            </div>
            <div className="lp-personal-grid">
              {PERSONAL_AGENTS_LANDING.map((agent, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 14, padding: '16px 18px',
                  borderLeft: `3px solid ${agent.color}`,
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 24, color: agent.color, flexShrink: 0, marginTop: 2 }}>{agent.icon}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#fff', marginBottom: 3 }}>{agent.name}</p>
                    <p style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)', lineHeight: 1.4, margin: 0 }}>{agent.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.3)' }}>+ Coach, Contradicteur, Cinéaste, Déconnexion et bien d&apos;autres...</span>
            </div>
          </div>
        </section>

        {/* ══ STUDIO CRÉATIF ══════════════════════════════════════ */}
        <section style={{ background: '#fff', padding: 'clamp(40px, 5vw, 64px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9333ea', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Studio créatif
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 12 }}>
                Photos, vidéos, avatars — <span className="fz-accent-word">générés par l&apos;IA</span>.
              </h2>
              <p style={{ fontSize: 14, color: '#555', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                Créez du contenu visuel professionnel en quelques secondes. Intégré directement dans votre dashboard.
              </p>
            </div>
            <div className="lp-studio-bento">
              {/* Main card — Photo */}
              <div style={{
                background: 'linear-gradient(145deg, #f5f0ff 0%, #ede9fe 100%)',
                borderRadius: 18, padding: 'clamp(20px, 3vw, 32px)', position: 'relative', overflow: 'hidden',
                border: '1px solid rgba(147,51,234,0.12)',
                minHeight: 220,
              }}>
                <div style={{
                  position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)',
                  width: 120, height: 120, borderRadius: '50%',
                  background: 'radial-gradient(circle, rgba(147,51,234,0.15) 0%, transparent 70%)',
                }} />
                <span className="material-symbols-rounded" style={{ fontSize: 40, color: '#9333ea', marginBottom: 14, display: 'block', position: 'relative' }}>photo_camera</span>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1d1d1f', marginBottom: 6, position: 'relative' }}>{STUDIO_FEATURES[0].title}</h3>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.5, marginBottom: 14, position: 'relative' }}>{STUDIO_FEATURES[0].desc}</p>
                <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(147,51,234,0.1)', color: '#9333ea', fontWeight: 600 }}>{STUDIO_FEATURES[0].badge}</span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(147,51,234,0.06)', color: '#9333ea' }}>{STUDIO_FEATURES[0].credits}</span>
                </div>
                {/* Prompt mockup */}
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 10,
                  background: 'rgba(0,0,0,0.04)', border: '1px solid rgba(0,0,0,0.06)',
                  fontSize: 11, color: '#888', fontStyle: 'italic', position: 'relative',
                }}>
                  &quot;Photo produit minimaliste pour e-commerce, fond blanc, éclairage studio&quot;
                </div>
              </div>
              {/* Right stacked cards */}
              <div className="lp-studio-bento-right">
                {STUDIO_FEATURES.slice(1).map((f, i) => (
                  <div key={i} style={{
                    background: '#fafafa', borderRadius: 16, padding: 'clamp(16px, 2vw, 24px)',
                    border: '1px solid rgba(0,0,0,0.06)', flex: 1,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 28, color: f.color, marginBottom: 10, display: 'block' }}>{f.icon}</span>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>{f.title}</h4>
                    <p style={{ fontSize: 12, color: '#666', lineHeight: 1.4, marginBottom: 10, margin: 0 }}>{f.desc}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${f.color}12`, color: f.color, fontWeight: 600 }}>{f.badge}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: `${f.color}08`, color: f.color }}>{f.credits}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Category pills */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {STUDIO_CATEGORIES.map((cat, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: '6px 14px', borderRadius: 100,
                  background: '#f5f0ff', color: '#7c3aed', fontWeight: 500,
                  border: '1px solid rgba(124,58,237,0.1)',
                }}>{cat}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ CRÉATION SUR MESURE ═════════════════════════════════ */}
        <section style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#8b5cf6', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Sur mesure
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 12 }}>
                Créez vos propres <span className="fz-accent-word" style={{ color: '#8b5cf6' }}>modules</span>.
              </h2>
              <p style={{ fontSize: 15, color: '#555', lineHeight: 1.65, maxWidth: 580, margin: '0 auto' }}>
                Chaque entreprise est <span className="fz-accent-word" style={{ color: '#8b5cf6' }}>unique</span>. Créez des modules IA adaptés à votre métier, ou confiez-nous leur conception.
              </p>
            </div>

            <div className="lp-custom-grid" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
              marginBottom: 32,
            }}>
              {/* Self-service */}
              <div className="lp-app-card" style={{ padding: '32px 28px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 32, marginBottom: 16, display: 'block' }}>build</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1d1d1f', marginBottom: 8 }}>
                  Vous créez
                </h3>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65, marginBottom: 18 }}>
                  Depuis votre tableau de bord, définissez un agent personnalisé en quelques minutes : nom, rôle, instructions, ton, et outils connectés.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Définissez le rôle et les objectifs',
                    'Choisissez le modèle IA (Claude, GPT, Gemini…)',
                    'Connectez vos outils (email, CRM, WhatsApp…)',
                    'Testez et déployez instantanément',
                  ].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#444', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="material-symbols-rounded" style={{ color: '#8b5cf6', fontSize: 14 }}>check_circle</span> {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* On-demand */}
              <div className="lp-app-card" style={{ padding: '32px 28px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 32, marginBottom: 16, display: 'block' }}>target</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1d1d1f', marginBottom: 8 }}>
                  On crée pour vous
                </h3>
                <p style={{ fontSize: 13, color: '#555', lineHeight: 1.65, marginBottom: 18 }}>
                  Besoin d&apos;un module complexe ou spécifique à votre secteur ? Notre équipe le conçoit, le configure et le déploie dans votre espace.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Agents métier sur mesure (immobilier, santé, juridique…)',
                    'Workflows automatisés multi-agents',
                    'Intégrations personnalisées (API, bases de données)',
                    'Formation et accompagnement inclus',
                  ].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#444', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="material-symbols-rounded" style={{ color: '#8b5cf6', fontSize: 14 }}>check_circle</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Examples — CAROUSEL */}
            <div className="lp-app-card" style={{ padding: '24px 28px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
                Exemples de modules créés par nos utilisateurs
              </p>
              <Carousel
                items={CUSTOM_EXAMPLES}
                autoPlay={3500}
                renderItem={(ex: typeof CUSTOM_EXAMPLES[0]) => (
                  <div style={{
                    padding: '16px 14px', borderRadius: 12,
                    background: '#fafafa', border: '1px solid #f0f0f0',
                    minHeight: 120,
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, marginBottom: 8, display: 'block' }}>{ex.icon}</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.55 }}>{ex.desc}</div>
                  </div>
                )}
              />
            </div>
          </div>
        </section>

        {/* ══ ARCADE & GAMIFICATION ══════════════════════════════ */}
        <section style={{ background: '#0f0720', padding: 'clamp(40px, 5vw, 64px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#7c3aed', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Arcade Freenzy
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#fff', letterSpacing: -1.5, marginBottom: 12 }}>
                <span className="fz-accent-word">Jouez</span>. Progressez. <span className="fz-accent-word">Gagnez des crédits</span>.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.5)', lineHeight: 1.6, maxWidth: 520, margin: '0 auto' }}>
                10 jeux intégrés, 50 niveaux, 20 badges à débloquer. Plus vous jouez, plus vous gagnez.
              </p>
            </div>

            {/* Games strip */}
            <div className="lp-arcade-strip" style={{ marginBottom: 28 }}>
              {ARCADE_GAMES_PREVIEW.map((game, i) => (
                <div key={i} style={{
                  minWidth: 110, padding: '14px 16px', borderRadius: 14,
                  background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)',
                  textAlign: 'center', flexShrink: 0,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 26, color: game.color, display: 'block', marginBottom: 6 }}>{game.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#fff' }}>{game.name}</span>
                </div>
              ))}
            </div>

            {/* Stats */}
            <div className="lp-arcade-stats" style={{ marginBottom: 28 }}>
              {ARCADE_STATS.map((stat, i) => (
                <div key={i} style={{
                  background: 'rgba(124,58,237,0.08)', border: '1px solid rgba(124,58,237,0.15)',
                  borderRadius: 14, padding: '20px 16px', textAlign: 'center',
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#7c3aed', display: 'block', marginBottom: 6 }}>{stat.icon}</span>
                  <div style={{ fontSize: 28, fontWeight: 800, color: '#fff', marginBottom: 2 }}>{stat.value}</div>
                  <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.45)' }}>{stat.label}</div>
                </div>
              ))}
            </div>

            {/* Badges preview */}
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <p style={{ fontSize: 13, fontWeight: 600, color: 'rgba(255,255,255,0.5)' }}>Badges à débloquer</p>
            </div>
            <div className="lp-arcade-badges">
              {ARCADE_BADGES_PREVIEW.map((badge, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)',
                  borderRadius: 12, padding: '12px 14px',
                  display: 'flex', gap: 10, alignItems: 'center',
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 22, color: '#f59e0b', flexShrink: 0 }}>{badge.icon}</span>
                  <div>
                    <p style={{ fontSize: 13, fontWeight: 600, color: '#fff', margin: 0 }}>{badge.name}</p>
                    <p style={{ fontSize: 11, color: 'rgba(255,255,255,0.35)', margin: 0 }}>{badge.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ POURQUOI FREENZY ═════════════════════════════════ */}
        <section style={{ background: '#0e0e18', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#a5b4fc', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Free &amp; Easy
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#fff', letterSpacing: -1.5 }}>
                L&apos;IA <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>accessible</span> à tous.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.6)', marginTop: 8, lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Free &amp; Easy, c&apos;est notre philosophie : une plateforme IA <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>complète</span>, <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>gratuite</span>, sans abonnement, sans commission, sans complexité. L&apos;intelligence artificielle pour tous.
              </p>
            </div>
            <div className="lp-scenario-steps" style={{ gap: 16 }}>
              {WHY_FREENZY.map((item, i) => (
                <div key={i} className="lp-app-card-dark">
                  <span className="material-symbols-rounded" style={{ fontSize: 28, marginBottom: 12, display: 'block' }}>{item.icon}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.65)', lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust badges strip */}
            <div style={{
              display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
              marginTop: 40, paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {TRUST_BADGES.map((badge, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.5)',
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 15 }}>{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ENTERPRISE (visible si audience null ou entreprise) ══ */}
        {(!audience || audience === 'entreprise') && (
          <section ref={enterpriseRef} id="enterprise" style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
            <EnterpriseSection />
          </section>
        )}

        {/* ══ FAQ — 100+ QUESTIONS PAR THÈME ════════════════════ */}
        <section ref={faqRef} id="faq" style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#f97316', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>FAQ</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1 }}>
                <span className="fz-accent-word" style={{ color: '#f97316' }}>{TOTAL_FAQ_COUNT}</span> réponses à vos questions.
              </h2>
              <p style={{ fontSize: 14, color: '#666', marginTop: 8 }}>
                Tout ce que vous devez savoir sur Freenzy.io, classé par thème.
              </p>
            </div>

            {/* Category tabs */}
            <div role="tablist" style={{
              display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
              marginBottom: 28, padding: '0 8px',
            }}>
              {orderedFaq.map((cat, ci) => (
                <button
                  key={cat.id}
                  onClick={() => { setFaqCat(ci); setOpenFaq(null); }}
                  role="tab"
                  aria-selected={faqCat === ci}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, minHeight: 44,
                    border: 'none', cursor: 'pointer',
                    background: faqCat === ci ? cat.color : '#fff',
                    color: faqCat === ci ? '#fff' : '#555',
                    boxShadow: faqCat === ci ? `0 2px 12px ${cat.color}33` : '0 1px 3px rgba(0,0,0,0.04)',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 13 }}>{cat.icon}</span>
                  <span className="lp-faq-tab-label">{cat.label}</span>
                  <span style={{
                    fontSize: 10, fontWeight: 800, opacity: 0.7,
                    marginLeft: 2,
                  }}>
                    {cat.questions.length}
                  </span>
                </button>
              ))}
            </div>

            {/* Active category title */}
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
              padding: '10px 16px', borderRadius: 10,
              background: `${orderedFaq[faqCat].color}08`,
              border: `1px solid ${orderedFaq[faqCat].color}18`,
            }}>
              <span style={{ fontSize: 18 }}>{orderedFaq[faqCat].icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: orderedFaq[faqCat].color }}>
                {orderedFaq[faqCat].label}
              </span>
              <span style={{ fontSize: 12, color: '#888', marginLeft: 'auto' }}>
                {orderedFaq[faqCat].questions.length} questions
              </span>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {orderedFaq[faqCat].questions.map((faq, i) => {
                const isOpen = openFaq === i;
                const catColor = orderedFaq[faqCat].color;
                return (
                  <div
                    key={`${faqCat}-${i}`}
                    className="lp-faq-item"
                    onClick={() => {
                      if (!isOpen) trackFaqOpened(faq.q, orderedFaq[faqCat].label);
                      setOpenFaq(isOpen ? null : i);
                    }}
                    style={{
                      background: isOpen ? '#fafaff' : '#fff',
                      border: isOpen ? `1.5px solid ${catColor}40` : '1px solid #ebebeb',
                      borderLeft: `3px solid ${isOpen ? catColor : '#d1d5db'}`,
                      borderRadius: 11, padding: '16px 18px',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{faq.q}</div>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: isOpen ? catColor : '#f0f0f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: isOpen ? '#fff' : '#888',
                        transition: 'all 0.2s',
                      }}>
                        {isOpen ? '−' : '+'}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="lp-faq-answer" style={{
                        borderTop: `1px solid ${catColor}12`,
                      }}>
                        {faq.a}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══ CTA FINAL ════════════════════════════════════════ */}
        <section ref={ctaRef} style={{
          background: 'linear-gradient(165deg, #0a0a0f 0%, #0f0f1a 50%, #0a0a0f 100%)',
          padding: 'clamp(56px, 8vw, 96px) 24px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', top: '20%', left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 500, height: 300,
            background: 'radial-gradient(ellipse, rgba(91,108,247,0.08) 0%, transparent 68%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <p className="fz-logo-text fz-logo-text-dark" style={{ fontSize: 12, letterSpacing: 4, marginBottom: 16, opacity: 0.4 }}>
              freenzy.io
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 56px)',
              fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff',
              letterSpacing: -2.5, lineHeight: 1.05, marginBottom: 14,
            }}>
              Votre équipe IA<br />
              <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>vous attend.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.6)', marginBottom: 24 }}>
              <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{totalAgents}+ agents IA</span>. Toutes les IA du marché. <span style={{ color: '#a5b4fc', fontWeight: 700 }}>0% de commission</span>. Sans carte bancaire.
            </p>
            {/* Rewards chips */}
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              {REWARDS_CHIPS.map((chip, i) => (
                <div key={i} style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 100,
                  background: `${chip.color}14`, border: `1px solid ${chip.color}30`,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 15, color: chip.color }}>{chip.icon}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: chip.color }}>{chip.text}</span>
                </div>
              ))}
            </div>
            <Link href={heroCta?.href || '/login?mode=register'} className="lp-cta-primary" onClick={() => trackCtaClick('final_cta', heroCta?.href || '/login?mode=register', audience, '/')} style={{
              display: 'inline-block', padding: '15px 40px',
              background: '#5b6cf7', color: '#fff',
              borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
              textDecoration: 'none',
            }}>
              {heroCta?.label || 'Commencer gratuitement'}
            </Link>
            <div style={{ marginTop: 16, fontSize: 12 }}>
              <Link href="/plans" style={{ color: 'rgba(255,255,255,0.5)', textDecoration: 'none' }}>Tarifs détaillés →</Link>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </>
  );
}
