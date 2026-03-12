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
  REWARDS_CHIPS,
} from '../lib/landing-data';

const totalAgents = TOTAL_AGENTS_DISPLAY;

/** Visually hidden but crawlable by search engines — equivalent to sr-only */
const srOnly: React.CSSProperties = {
  position: 'absolute', width: 1, height: 1, padding: 0, margin: -1,
  overflow: 'hidden', clip: 'rect(0,0,0,0)', whiteSpace: 'nowrap', border: 0,
};

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
      {/* Desktop: 4-column grid, Mobile: horizontal scroll-snap */}
      <div className="lp-carousel-scroll" style={{
        gap: 12,
      }}>
        {visible.map((vi, i) => (
          <div key={`${vi}-${i}`} className="lp-carousel-scroll-item" style={{ animation: 'lp-fade-in 0.4s ease' }}>
            {renderItem(items[vi], vi)}
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="lp-carousel-dots" style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 16 }}>
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Voir exemple ${i + 1}`}
            style={{
              width: idx === i ? 20 : 8, height: 8, borderRadius: 4, border: 'none',
              background: idx === i ? '#1A1A1A' : '#E5E5E5', cursor: 'pointer',
              transition: 'all 0.3s', padding: 0,
              boxSizing: 'content-box' as const, paddingBlock: 18, paddingInline: 10,
              margin: '-18px -4px', backgroundClip: 'content-box',
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
      <div className="lp-carousel-scroll lp-tech-carousel" style={{ gap: 14 }}>
        {items.map((t, i) => (
          <div key={i} className="lp-carousel-scroll-item" style={{
            padding: '20px 22px', borderRadius: 16,
            background: '#F7F7F7', border: `1px solid ${i === idx ? '#1A1A1A' : '#E5E5E5'}`,
            opacity: i === idx ? 1 : 0.6,
            transform: i === idx ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A1A1A', flexShrink: 0 }} />
              <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{t.title}</h3>
            </div>
            <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.6, marginBottom: 10 }}>{t.desc}</p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {t.points.map((p, j) => (
                <span key={j} style={{
                  fontSize: 11, color: '#6B6B6B', background: '#F7F7F7',
                  padding: '3px 10px', borderRadius: 20,
                  border: '1px solid #E5E5E5',
                }}>
                  {p}
                </span>
              ))}
            </div>
          </div>
        ))}
      </div>
      {/* Dots */}
      <div className="lp-carousel-dots" style={{ display: 'flex', gap: 6, justifyContent: 'center', marginTop: 14 }}>
        {items.map((t, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Technologie ${t.title}`}
            style={{
              width: idx === i ? 20 : 8, height: 8, borderRadius: 4, border: 'none',
              background: idx === i ? '#1A1A1A' : '#E5E5E5', cursor: 'pointer',
              transition: 'all 0.3s', padding: 0,
              boxSizing: 'content-box' as const, paddingBlock: 18, paddingInline: 10,
              margin: '-18px -4px', backgroundClip: 'content-box',
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
      <AudienceStickyBar audience={audience} onChange={setAudience} variant="light" />
      <main style={{ paddingTop: 0 }}>

        {/* ══ HERO + TICKERS viewport wrapper ═══════════════ */}
        <div className="lp-hero-viewport">

        {/* ══ 1. HERO ═══════════════════════════════════════════ */}
        <header>
        <section ref={heroRef} aria-label="Presentation principale de Freenzy.io, plateforme IA multi-agents pour entreprise" style={{
          background: '#FFFFFF',
          padding: 'clamp(16px, 3vw, 48px) 24px clamp(12px, 2vw, 36px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          flex: 1, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center',
        }}>
          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 'clamp(4px, 1vw, 10px)', marginTop: -8 }}>
              <span className="lp-hero-badge" style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: '#F7F7F7', border: '1px solid #E5E5E5',
                color: '#1A1A1A', padding: '5px 16px', borderRadius: 40,
                fontSize: 11, fontWeight: 700, whiteSpace: 'nowrap',
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#1A1A1A', display: 'inline-block', flexShrink: 0 }} role="img" aria-label="Indicateur actif montrant que la plateforme Freenzy.io est en ligne et operationnelle" />
                <span className="lp-green-badge-full">{heroBadge || 'Pro & Particuliers · 0% de commission · Simplicité · Personnalisation 100% · Complet'}</span>
                <span className="lp-green-badge-mobile">{heroBadge || 'Pros & Particuliers · 0% frais · Personnalisable 100% · Simple et complet'}</span>
              </span>
            </div>

            <h1 className="lp-gradient-h1" style={{
              fontFamily: 'var(--font-display)',
              fontSize: heroHeadline ? 'clamp(28px, 6vw, 72px)' : 'clamp(32px, 7.8vw, 94px)',
              fontWeight: 700, lineHeight: 0.92,
              marginBottom: 'clamp(8px, 1.5vw, 14px)', letterSpacing: -4,
              textTransform: heroHeadline ? 'none' : 'uppercase',
              color: '#1A1A1A',
            }}>
              {heroHeadline ? heroHeadline : <>Utilisez<br />vraiment l&apos;IA.</>}
              <span style={srOnly}>Freenzy.io — Plateforme IA multi-agents francaise pour automatiser votre entreprise avec plus de 100 agents intelligents specialises en marketing, finance, commercial, RH, juridique, communication, video et photo</span>
            </h1>

            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(13px, 1.6vw, 15px)',
              color: '#6B6B6B', fontWeight: 600,
              letterSpacing: 2, textTransform: 'uppercase',
              marginBottom: 8,
            }}>
              UNE APP POUR TOUT.
            </p>

            <p style={{
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              color: '#6B6B6B',
              lineHeight: 1.6, maxWidth: 480, margin: '0 auto', marginBottom: 'clamp(12px, 2vw, 24px)',
            }}>
              {heroSub ? (
                <span style={{ color: '#1A1A1A' }}>{heroSub}</span>
              ) : (
                <><span style={{ fontWeight: 700, color: '#1A1A1A' }}>{totalAgents}+ agents</span> pour s&apos;occuper de vous : <span style={{ color: '#1A1A1A' }}>téléphonie, réveil, réseaux sociaux, documents, réflexions, WhatsApp, modules sur mesure…</span></>
              )}
            </p>

            <p style={{
              fontSize: 13, color: '#1A1A1A', fontWeight: 600, marginBottom: 12,
              letterSpacing: 0.2,
            }}>
              Explorez le dashboard gratuitement, sans inscription.
            </p>

            {/* Bonus message per audience */}
            {config?.bonusMessage && (
              <p style={{
                fontSize: 12, color: '#1A1A1A', fontWeight: 600, marginBottom: 16,
                background: '#F7F7F7', border: '1px solid #E5E5E5',
                display: 'inline-block', padding: '5px 16px', borderRadius: 20,
              }}>
                <span role="img" aria-label="Cadeau de bienvenue offert aux nouveaux utilisateurs de Freenzy.io" style={{ fontSize: 14, verticalAlign: 'middle', marginRight: 4 }}>🎁</span>
                {config.bonusMessage}
              </p>
            )}

            <nav aria-label="Actions principales pour commencer avec Freenzy.io" style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/client/dashboard" className="lp-cta-primary" title="Accedez au dashboard Freenzy.io gratuitement — explorez 100 agents IA sans inscription" onClick={() => trackCtaClick('hero_cta', '/client/dashboard', audience, '/')} style={{
                padding: '12px 20px', background: '#1A1A1A', color: '#fff',
                borderRadius: 8, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(12px, 3.2vw, 15px)', textDecoration: 'none',
                minHeight: 44, whiteSpace: 'nowrap',
              }}>
                {'Acceder a Freenzy \u2192'}
              </Link>
              <Link href="/plans" title="Decouvrez les tarifs Freenzy.io — 0% commission, paiement a l'usage, sans abonnement" style={{
                padding: '12px 16px', minHeight: 44, whiteSpace: 'nowrap',
                background: '#F7F7F7', border: '1px solid #E5E5E5',
                color: '#1A1A1A', borderRadius: 10, fontWeight: 600,
                fontSize: 'clamp(11px, 3vw, 14px)', textDecoration: 'none',
              }}>
                Voir les tarifs Freenzy.io
              </Link>
              </div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8, marginTop: 'clamp(8px, 1.5vw, 16px)' }}>
                <div className="lp-hero-avatars" style={{ display: 'flex' }}>
                  {['��‍��', '��‍��', '��‍��'].map((e, i) => (
                    <span key={i} style={{ fontSize: 18, marginLeft: i > 0 ? -6 : 0, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.1))' }}>{e}</span>
                  ))}
                </div>
                <span className="lp-hero-social-proof" style={{ fontSize: 13, color: '#9B9B9B' }}>
                  Rejoint par <strong style={{ color: '#1A1A1A' }}>500+ professionnels</strong> ce mois-ci
                </span>
              </div>
            </nav>

            <span style={srOnly}>Freenzy.io est la plateforme francaise d&apos;intelligence artificielle multi-agents qui automatise la gestion d&apos;entreprise. Repondeur telephonique IA disponible 24 heures sur 24, generation automatique de documents professionnels, gestion intelligente des reseaux sociaux, reveil personnalise avec briefing matinal, discussions approfondies avec Claude Opus. Propulse par Claude Anthropic, GPT-4 OpenAI, Gemini Google, Mistral et Llama Meta. Zero pour cent de commission pour les 5000 premiers utilisateurs. 50 credits offerts a l&apos;inscription. Sans abonnement ni engagement.</span>

          </div>
        </section>
        </header>

        {/* ══ 2. LIVE ACTIVITY TICKER ══════════════════════════════ */}
        <div aria-label="Fil d'activite en temps reel montrant les actions des agents IA Freenzy.io" role="marquee" style={{ background: '#F7F7F7', borderBottom: '1px solid #E5E5E5', padding: '10px 0', flexShrink: 0 }}>
          <div className="lp-ticker-wrap">
            <div className="lp-ticker">
              {[...ACTIVITY, ...ACTIVITY].map((item, i) => (
                <div key={i} className="lp-ticker-item lp-activity-chip" style={{ gap: 8, padding: '6px 14px' }}>
                  <span style={{ fontSize: 13 }}>{item.emoji}</span>
                  <span style={{ color: '#1A1A1A', fontWeight: 700, fontSize: 11 }}>{item.agent}</span>
                  <span style={{ color: '#6B6B6B', fontSize: 11 }}>{item.text}</span>
                  <span style={{ color: '#9B9B9B', fontSize: 10 }}>· {item.ago}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ 3. STATS REVERSE TICKER ═════════════════════════════ */}
        <div aria-label="Statistiques cles de la plateforme Freenzy.io — agents IA, utilisateurs, modeles disponibles" role="marquee" style={{ background: '#F7F7F7', borderBottom: '1px solid #E5E5E5', padding: '10px 0', flexShrink: 0 }}>
          <div className="lp-ticker-wrap">
            <div className="lp-ticker-reverse">
              {[...STATS_BADGES, ...STATS_BADGES].map((s, i) => (
                <div key={i} className="lp-stats-badge" style={{ background: '#fff', border: '1px solid #E5E5E5' }}>
                  <span className="lp-stats-badge-icon" style={{ color: '#1A1A1A' }}>{s.emoji}</span>
                  <span className="lp-stats-badge-value" style={{ color: '#1A1A1A' }}>{s.value}</span>
                  <span className="lp-stats-badge-label" style={{ color: '#9B9B9B' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        </div>{/* end .lp-hero-viewport */}

        {/* ══ 4. OUTILS UTILISATEURS ═════════════════════════════════ */}
        <section aria-label="Outils IA integres dans la plateforme Freenzy.io pour automatiser telephonie, documents, reseaux sociaux et plus" style={{ background: '#FFFFFF', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Outils IA pour entreprise</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: -1.5, marginBottom: 6, color: '#1A1A1A' }}>
                Vos outils IA, prets a l&apos;emploi.
              </h2>
              <p style={{ color: '#6B6B6B', fontSize: 14 }}>Tout ce dont vous avez besoin pour automatiser votre entreprise, active en <strong style={{ color: '#1A1A1A' }}>un clic</strong>.</p>
            </div>

            <div className="lp-tools-tabs" style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {TOOL_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => setToolTab(i)}
                  aria-selected={toolTab === i}
                  role="tab"
                  style={{
                    padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44,
                    background: toolTab === i ? '#1A1A1A' : '#F7F7F7',
                    color: toolTab === i ? '#fff' : '#6B6B6B',
                    transition: 'all 0.2s',
                    display: 'flex', alignItems: 'center', gap: 6,
                  }}
                >
                  <span style={{ fontSize: 15 }}>{cat.emoji}</span>
                  {cat.label}
                </button>
              ))}
            </div>

            <div role="list" aria-label="Liste des outils IA disponibles dans la categorie selectionnee" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 14,
            }} className="lp-tools-grid">
              {TOOL_CATEGORIES[toolTab].tools.map((tool, i) => (
                <div key={i} role="listitem" className="lp-app-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px 18px', background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12 }}>
                  <div style={{
                    width: 44, height: 44, borderRadius: 12, flexShrink: 0,
                    background: '#F7F7F7', border: '1px solid #E5E5E5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}>
                    <span role="img" aria-label={`Icone de l'outil IA ${tool.name}`} style={{ fontSize: 22 }}>{tool.emoji}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{tool.name}</span>
                      <span style={{
                        fontSize: 10, fontWeight: 700, color: '#6B6B6B',
                        background: '#F7F7F7', border: '1px solid #E5E5E5',
                        padding: '2px 8px', borderRadius: 20,
                      }}>Inclus</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.55 }}>{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <span style={{ fontSize: 12, color: '#9B9B9B' }}>
                {TOOL_CATEGORIES.reduce((acc, c) => acc + c.tools.length, 0)} outils IA inclus dans tous les plans Freenzy.io
              </span>
            </div>
            <span style={srOnly}>Freenzy.io inclut des dizaines d&apos;outils IA pour automatiser la telephonie avec un repondeur intelligent, generer des documents professionnels, gerer les reseaux sociaux automatiquement, piloter votre entreprise depuis WhatsApp, creer des photos et videos par IA, et bien plus encore. Tous les outils sont inclus sans frais supplementaires.</span>
          </div>
        </section>

        {/* ══ 5. WHATSAPP ══════════════════════════════════════════ */}
        <section aria-label="Integration WhatsApp Business avec les agents IA Freenzy.io pour piloter votre entreprise par messagerie instantanee" style={{ background: '#F7F7F7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="lp-whatsapp-grid">
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>WhatsApp IA Business</p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1A1A1A', letterSpacing: -1.5, marginBottom: 12 }}>
                  Pilotez vos agents IA sur <strong>WhatsApp</strong>.
                </h2>
                <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.65, marginBottom: 20 }}>
                  Recevez les résumés, donnez des instructions, pilotez votre entreprise depuis WhatsApp. Vos agents répondent en <strong style={{ color: '#1A1A1A' }}>temps réel</strong>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Résumés automatiques', 'Instructions en langage naturel', 'Notifications intelligentes', 'Fichiers et documents'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#6B6B6B' }}>
                      <span role="img" aria-label="Fonctionnalite incluse" style={{ fontSize: 16 }}>✅</span> {f}
                    </div>
                  ))}
                </div>
              </div>
              <div className="lp-wa-mockup" style={{
                background: '#F7F7F7', border: '1px solid #E5E5E5', borderRadius: 20, padding: '20px 16px',
                maxWidth: 340, width: '100%', position: 'relative',
              }}>
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 3, borderRadius: '20px 20px 0 0', background: '#25D366' }} />
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: '#1A1A1A' }}>Freenzy Assistant</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {WA_MESSAGES.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.from === 'user' ? '#dcf8c6' : '#fff',
                      color: '#1A1A1A', borderRadius: 10, padding: '8px 12px',
                      maxWidth: '85%', fontSize: 12, lineHeight: 1.5,
                      whiteSpace: 'pre-line',
                      border: '1px solid #E5E5E5',
                    }}>
                      {msg.text}
                      <div style={{ fontSize: 10, color: '#9B9B9B', textAlign: 'right', marginTop: 3 }}>{msg.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 6. DEMO INTERACTIVE ══════════════════════════════════ */}
        <section aria-label="Demonstration interactive des agents IA Freenzy.io en action — exemples concrets d'automatisation" style={{ background: '#F7F7F7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Demonstration IA en action</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: -1.5, color: '#1A1A1A' }}>
                Vos agents IA au travail.
              </h2>
            </div>

            <div role="tablist" className="lp-demo-tabs" style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
              {DEMO_SCENARIOS.map((s, i) => (
                <button
                  key={i}
                  className="lp-demo-tab"
                  onClick={() => setDemoTab(i)}
                  role="tab"
                  aria-selected={demoTab === i}
                  style={{
                    padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: demoTab === i ? 'none' : '1px solid #E5E5E5', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44,
                    background: demoTab === i ? '#1A1A1A' : '#fff',
                    color: demoTab === i ? '#fff' : '#6B6B6B',
                    transition: 'all 0.2s',
                  }}
                >
                  <span style={{ fontSize: 16, marginRight: 6 }}>{s.tabEmoji}</span>
                  {s.tab}
                </button>
              ))}
            </div>

            <div style={{
              background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16, overflow: 'hidden',
              transition: 'all 0.3s',
            }}>
              <div style={{
                background: '#F7F7F7', padding: '9px 16px',
                borderBottom: '1px solid #E5E5E5',
                display: 'flex', alignItems: 'center', gap: 7,
              }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#E5E5E5', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#E5E5E5', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#E5E5E5', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: '#9B9B9B', marginLeft: 6 }}>
                  Flashboard · Agent {demo.tab}
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#F7F7F7',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><span style={{ fontSize: 14 }}>👤</span></div>
                  <div style={{
                    background: '#F7F7F7', border: '1px solid #E5E5E5',
                    borderRadius: '0 12px 12px 12px', padding: '9px 13px',
                    fontSize: 13, color: '#6B6B6B', lineHeight: 1.55, maxWidth: 520,
                  }}>
                    {demo.prompt}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{
                    width: 32, height: 32, borderRadius: '50%', flexShrink: 0,
                    background: '#F7F7F7', border: '1px solid #E5E5E5',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><span style={{ fontSize: 14 }}>⚡</span></div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: '#1A1A1A', fontWeight: 700, letterSpacing: 0.5 }}>
                        {demo.tab.toUpperCase()} · TERMINÉ
                      </span>
                      <span style={{
                        display: 'inline-block', width: 5, height: 5, borderRadius: '50%',
                        background: '#1A1A1A',
                        animation: 'lp-cursor-blink 1.2s step-end infinite',
                      }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {demo.lines.map((line, j) => (
                        <div key={j} className="lp-demo-line" style={{
                          background: '#F7F7F7',
                          border: '1px solid #E5E5E5',
                          borderLeft: '2px solid #E5E5E5',
                          borderRadius: '0 8px 8px 0', padding: '7px 11px',
                          display: 'flex', gap: 10, alignItems: 'baseline',
                        }}>
                          <span className="lp-demo-label" style={{ fontSize: 10, fontWeight: 700, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: 0.4, flexShrink: 0, minWidth: 58 }}>
                            {line.label}
                          </span>
                          <span style={{ fontSize: 12, color: '#1A1A1A' }}>{line.text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: '#9B9B9B' }}>{demo.model}</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 7. COMMENT ÇA MARCHE — scenarios + technologies ═════════ */}
        <section aria-label="Comment fonctionne Freenzy.io — scenarios d'automatisation IA et technologies utilisees" style={{ background: '#FFFFFF', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Comment fonctionne l&apos;automatisation IA</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: -1.5, marginBottom: 6, color: '#1A1A1A' }}>
                Automatisation IA concrete et instantanee.
              </h2>
              <p style={{ color: '#6B6B6B', fontSize: 14 }}>Vos agents IA traitent tout, <strong style={{ color: '#1A1A1A' }}>24h/24</strong>. Voici ce que ca donne concretement.</p>
            </div>

            {/* Scenarios concrets */}
            <div className="lp-scenario-steps" style={{ gap: 16, marginBottom: 40 }}>
              {SCENARIOS.map((s, i) => (
                <div key={i} style={{
                  background: '#F7F7F7', border: '1px solid #E5E5E5', borderRadius: 16,
                  padding: 'clamp(16px, 2.5vw, 24px)', transition: 'all 0.3s',
                }}>
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#1A1A1A', display: 'inline-block', flexShrink: 0, marginBottom: 14 }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {s.steps.map((step, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#6B6B6B' }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: '#F7F7F7', color: '#1A1A1A',
                          border: '1px solid #E5E5E5',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, flexShrink: 0,
                        }}>{j + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, fontSize: 11, color: '#9B9B9B' }}>{s.tech}</div>
                </div>
              ))}
            </div>

            {/* Technologies intégrées — carousel */}
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 3, textTransform: 'uppercase' }}>Propulsé par</p>
            </div>
            <TechCarousel items={TECH_FEATURES} />
          </div>
        </section>

        {/* ══ 8. AGENTS PERSONNELS B2C ══════════════════════════════ */}
        <section aria-label="Agents IA personnels pour la vie quotidienne — budget, impots, coaching, ecriture et bien-etre" style={{ background: '#F7F7F7', padding: 'clamp(40px, 5vw, 64px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Agents IA pour votre vie personnelle
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1A1A1A', letterSpacing: -1.5, marginBottom: 12 }}>
                Des agents IA personnels pour <strong>VOUS</strong>, pas juste votre entreprise.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                Budget, impôts, immobilier, coaching, écriture... <span style={{ color: '#1A1A1A', fontWeight: 600 }}>12 agents personnels</span>, inclus gratuitement dans chaque compte.
              </p>
            </div>
            <div className="lp-personal-grid" role="list" aria-label="Liste des 12 agents IA personnels inclus gratuitement">
              {PERSONAL_AGENTS_LANDING.map((agent, i) => (
                <div key={i} role="listitem" style={{
                  background: '#fff',
                  border: '1px solid #E5E5E5',
                  borderRadius: 14, padding: '16px 18px',
                  borderLeft: '3px solid #E5E5E5',
                  transition: 'all 0.3s',
                  display: 'flex', gap: 14, alignItems: 'flex-start',
                }}>
                  <span role="img" aria-label={`Icone de l'agent IA personnel ${agent.name}`} style={{ fontSize: 22, flexShrink: 0, marginTop: 2 }}>{agent.emoji}</span>
                  <div>
                    <p style={{ fontSize: 14, fontWeight: 600, color: '#1A1A1A', marginBottom: 3 }}>{agent.name}</p>
                    <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.4, margin: 0 }}>{agent.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 28 }}>
              <span style={{ fontSize: 12, color: '#9B9B9B' }}>+ Coach, Contradicteur, Cinéaste, Déconnexion et bien d&apos;autres...</span>
            </div>
          </div>
        </section>

        {/* ══ 9. STUDIO CRÉATIF ══════════════════════════════════════ */}
        <section aria-label="Studio creatif IA — generation de photos, videos et avatars par intelligence artificielle avec fal.ai et D-ID" style={{ background: '#FFFFFF', padding: 'clamp(40px, 5vw, 64px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Studio creatif IA
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1A1A1A', letterSpacing: -1.5, marginBottom: 12 }}>
                Photos, videos, avatars — <strong>generes par l&apos;intelligence artificielle</strong>.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.6, maxWidth: 560, margin: '0 auto' }}>
                Créez du contenu visuel professionnel en quelques secondes. Intégré directement dans votre dashboard.
              </p>
            </div>
            <div className="lp-studio-bento">
              {/* Main card — Photo */}
              <div style={{
                background: '#F7F7F7',
                borderRadius: 18, padding: 'clamp(20px, 3vw, 32px)', position: 'relative', overflow: 'hidden',
                border: '1px solid #E5E5E5',
                minHeight: 220,
              }}>
                <span style={{ fontSize: 36, marginBottom: 14, display: 'block', position: 'relative' }}>{STUDIO_FEATURES[0].emoji}</span>
                <h3 style={{ fontSize: 20, fontWeight: 700, color: '#1A1A1A', marginBottom: 6, position: 'relative' }}>{STUDIO_FEATURES[0].title}</h3>
                <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.5, marginBottom: 14, position: 'relative' }}>{STUDIO_FEATURES[0].desc}</p>
                <div style={{ display: 'flex', gap: 8, position: 'relative' }}>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#F7F7F7', color: '#6B6B6B', fontWeight: 600, border: '1px solid #E5E5E5' }}>{STUDIO_FEATURES[0].badge}</span>
                  <span style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: '#F7F7F7', color: '#6B6B6B', border: '1px solid #E5E5E5' }}>{STUDIO_FEATURES[0].credits}</span>
                </div>
                {/* Prompt mockup */}
                <div style={{
                  marginTop: 16, padding: '10px 14px', borderRadius: 10,
                  background: '#fff', border: '1px solid #E5E5E5',
                  fontSize: 11, color: '#9B9B9B', fontStyle: 'italic', position: 'relative',
                }}>
                  &quot;Photo produit minimaliste pour e-commerce, fond blanc, éclairage studio&quot;
                </div>
              </div>
              {/* Right stacked cards */}
              <div className="lp-studio-bento-right">
                {STUDIO_FEATURES.slice(1).map((f, i) => (
                  <div key={i} style={{
                    background: '#F7F7F7', borderRadius: 16, padding: 'clamp(16px, 2vw, 24px)',
                    border: '1px solid #E5E5E5', flex: 1,
                  }}>
                    <span style={{ fontSize: 26, marginBottom: 10, display: 'block' }}>{f.emoji}</span>
                    <h4 style={{ fontSize: 16, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{f.title}</h4>
                    <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.4, marginBottom: 10, margin: 0 }}>{f.desc}</p>
                    <div style={{ display: 'flex', gap: 6, marginTop: 10 }}>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#F7F7F7', color: '#6B6B6B', fontWeight: 600, border: '1px solid #E5E5E5' }}>{f.badge}</span>
                      <span style={{ fontSize: 10, padding: '2px 8px', borderRadius: 4, background: '#F7F7F7', color: '#6B6B6B', border: '1px solid #E5E5E5' }}>{f.credits}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            {/* Category pills */}
            <div className="lp-category-pills" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, justifyContent: 'center', marginTop: 24 }}>
              {STUDIO_CATEGORIES.map((cat, i) => (
                <span key={i} style={{
                  fontSize: 12, padding: '6px 14px', borderRadius: 100,
                  background: '#F7F7F7', color: '#1A1A1A', fontWeight: 500,
                  border: '1px solid #E5E5E5',
                }}>{cat}</span>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 10. CRÉATION SUR MESURE ═════════════════════════════════ */}
        <section aria-label="Creation de modules IA sur mesure — personnalisez vos agents et workflows d'automatisation" style={{ background: '#F7F7F7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Modules IA sur mesure
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: -1.5, marginBottom: 12, color: '#1A1A1A' }}>
                Creez vos propres modules IA personnalises.
              </h2>
              <p style={{ fontSize: 15, color: '#6B6B6B', lineHeight: 1.65, maxWidth: 580, margin: '0 auto' }}>
                Chaque entreprise est <strong style={{ color: '#1A1A1A' }}>unique</strong>. Créez des modules IA adaptés à votre métier, ou confiez-nous leur conception.
              </p>
            </div>

            <div className="lp-custom-grid" style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(min(320px, 100%), 1fr))', gap: 20,
              marginBottom: 32,
            }}>
              {/* Self-service */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '32px 28px' }}>
                <span role="img" aria-label="Outils de creation de modules IA personnalises en libre-service" style={{ fontSize: 28, marginBottom: 16, display: 'block' }}>🛠️</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                  Vous creez vos agents IA
                </h3>
                <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.65, marginBottom: 18 }}>
                  Depuis votre tableau de bord, définissez un agent personnalisé en quelques minutes : nom, rôle, instructions, ton, et outils connectés.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Définissez le rôle et les objectifs',
                    'Choisissez le modèle IA (Claude, GPT, Gemini…)',
                    'Connectez vos outils (email, CRM, WhatsApp…)',
                    'Testez et déployez instantanément',
                  ].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#6B6B6B', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span role="img" aria-label="Fonctionnalite incluse et disponible" style={{ fontSize: 14 }}>✅</span> {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* On-demand */}
              <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '32px 28px' }}>
                <span role="img" aria-label="Service de creation de modules IA sur mesure par l'equipe Freenzy.io" style={{ fontSize: 28, marginBottom: 16, display: 'block' }}>🎯</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>
                  On cree vos modules IA pour vous
                </h3>
                <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.65, marginBottom: 18 }}>
                  Besoin d&apos;un module complexe ou spécifique à votre secteur ? Notre équipe le conçoit, le configure et le déploie dans votre espace.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Agents métier sur mesure (immobilier, santé, juridique…)',
                    'Workflows automatisés multi-agents',
                    'Intégrations personnalisées (API, bases de données)',
                    'Formation et accompagnement inclus',
                  ].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#6B6B6B', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span role="img" aria-label="Fonctionnalite incluse et disponible" style={{ fontSize: 14 }}>✅</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Examples — CAROUSEL */}
            <div style={{ background: '#fff', border: '1px solid #E5E5E5', borderRadius: 12, padding: '24px 28px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9B9B9B', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
                Exemples de modules créés par nos utilisateurs
              </p>
              <Carousel
                items={CUSTOM_EXAMPLES}
                autoPlay={3500}
                renderItem={(ex: typeof CUSTOM_EXAMPLES[0]) => (
                  <div style={{
                    padding: '16px 14px', borderRadius: 12,
                    background: '#fff', border: '1px solid #E5E5E5',
                    minHeight: 120,
                  }}>
                    <span style={{ fontSize: 20, marginBottom: 8, display: 'block' }}>{ex.emoji}</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1A1A1A', marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: '#6B6B6B', lineHeight: 1.55 }}>{ex.desc}</div>
                  </div>
                )}
              />
            </div>
          </div>
        </section>

        {/* ══ 11. DISCUSSIONS APPROFONDIES ═══════════════════════════════ */}
        <section aria-label="Discussions approfondies avec intelligence artificielle — 85 templates de reflexion philosophique et pensee etendue avec Claude Opus" style={{ background: '#FFFFFF', padding: 'clamp(40px, 5vw, 64px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="lp-discussions-grid">
              <div>
                <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                  Réflexion profonde
                </p>
                <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1A1A1A', letterSpacing: -1.5, marginBottom: 12 }}>
                  Explorez les <strong>grandes questions</strong> avec l&apos;intelligence artificielle.
                </h2>
                <p style={{ fontSize: 14, color: '#6B6B6B', lineHeight: 1.65, marginBottom: 24 }}>
                  85+ templates de discussion guidée, 16 catégories, pensée étendue avec Claude Opus. L&apos;IA ne se contente pas de répondre — elle <strong style={{ color: '#1A1A1A' }}>réfléchit profondément</strong> avec vous.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
                  {DISCUSSION_HIGHLIGHTS.map((h, i) => (
                    <div key={i} style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
                      <span style={{ fontSize: 18 }}>{h.emoji}</span>
                      <span style={{ fontSize: 13, color: '#6B6B6B' }}>{h.text}</span>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginBottom: 20 }}>
                  {DISCUSSION_CATEGORIES.map((cat, i) => (
                    <span key={i} style={{
                      fontSize: 11, padding: '4px 10px', borderRadius: 100,
                      background: i < DISCUSSION_CATEGORIES.length - 1 ? '#F7F7F7' : 'transparent',
                      color: '#1A1A1A', fontWeight: 500,
                    }}>{cat}</span>
                  ))}
                </div>
                <Link href="/client/dashboard" className="lp-cta-primary" title="Accedez au dashboard pour explorer les 85 templates de discussions approfondies avec Claude Opus" style={{
                  display: 'inline-block', padding: '12px 28px',
                  background: '#1A1A1A', color: '#fff',
                  borderRadius: 8, fontSize: 14, fontWeight: 600, textDecoration: 'none',
                }}>
                  Explorer les discussions approfondies avec l&apos;IA
                </Link>
              </div>
              {/* Discussion mockup card */}
              <div style={{
                background: '#F7F7F7', borderRadius: 16, padding: 0, overflow: 'hidden',
                border: '1px solid #E5E5E5',
              }}>
                {/* macOS-style chrome */}
                <div style={{ padding: '10px 14px', display: 'flex', gap: 6, borderBottom: '1px solid #E5E5E5' }}>
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5E5E5' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5E5E5' }} />
                  <div style={{ width: 10, height: 10, borderRadius: '50%', background: '#E5E5E5' }} />
                </div>
                <div style={{ padding: '18px 18px 14px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 14 }}>
                    <span style={{ fontSize: 11, padding: '3px 8px', borderRadius: 6, background: '#F7F7F7', border: '1px solid #E5E5E5', color: '#1A1A1A', fontWeight: 600 }}>Philosophie</span>
                    <span style={{ fontSize: 11, color: '#9B9B9B' }}>Extended Thinking</span>
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: '#1A1A1A', marginBottom: 16 }}>Le bonheur est-il un choix ?</p>
                  {/* User bubble */}
                  <div style={{
                    background: '#fff', border: '1px solid #E5E5E5', borderRadius: '12px 12px 4px 12px',
                    padding: '10px 14px', marginBottom: 10, maxWidth: '85%', marginLeft: 'auto',
                  }}>
                    <p style={{ fontSize: 12, color: '#1A1A1A', lineHeight: 1.5, margin: 0 }}>
                      Est-ce que le bonheur dépend de nos circonstances ou de notre attitude intérieure ?
                    </p>
                  </div>
                  {/* AI bubble */}
                  <div style={{
                    background: '#fff', border: '1px solid #E5E5E5', borderRadius: '12px 12px 12px 4px',
                    padding: '10px 14px', maxWidth: '90%',
                  }}>
                    <p style={{ fontSize: 12, color: '#6B6B6B', lineHeight: 1.5, margin: 0 }}>
                      Cette question touche au cœur de la philosophie stoïcienne. Épictète distinguait les choses qui dépendent de nous de celles qui n&apos;en dépendent pas...
                    </p>
                  </div>
                  {/* Depth bar */}
                  <div style={{ marginTop: 14, display: 'flex', alignItems: 'center', gap: 8 }}>
                    <div style={{ flex: 1, height: 3, borderRadius: 2, background: '#E5E5E5' }}>
                      <div style={{ width: '25%', height: '100%', borderRadius: 2, background: '#1A1A1A' }} />
                    </div>
                    <span style={{ fontSize: 10, color: '#9B9B9B' }}>Profondeur 3/20</span>
                  </div>
                </div>
                <div style={{ padding: '8px 18px 12px', borderTop: '1px solid #E5E5E5', textAlign: 'center' }}>
                  <span style={{ fontSize: 11, color: '#9B9B9B' }}>85+ sujets disponibles</span>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ 12. POURQUOI FREENZY ═════════════════════════════════ */}
        <section aria-label="Pourquoi choisir Freenzy.io — plateforme IA gratuite, sans abonnement, 0% commission, accessible a tous" style={{ background: '#F7F7F7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Free &amp; Easy — L&apos;IA sans complexite
              </p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, letterSpacing: -1.5, color: '#1A1A1A' }}>
                L&apos;intelligence artificielle accessible a tous.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8, lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Free &amp; Easy, c&apos;est notre philosophie : une plateforme IA <strong style={{ color: '#1A1A1A' }}>complète</strong>, <strong style={{ color: '#1A1A1A' }}>gratuite</strong>, sans abonnement, sans commission, sans complexité. L&apos;intelligence artificielle pour tous.
              </p>
            </div>
            <div className="lp-scenario-steps" style={{ gap: 16 }}>
              {WHY_FREENZY.map((item, i) => (
                <div key={i} style={{
                  background: '#fff', border: '1px solid #E5E5E5', borderRadius: 16,
                  padding: '24px 22px', transition: 'all 0.3s',
                }}>
                  <span role="img" aria-label={`Avantage Freenzy.io : ${item.title}`} style={{ fontSize: 26, marginBottom: 12, display: 'block' }}>{item.emoji}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#1A1A1A', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: '#6B6B6B', lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust badges strip */}
            <div className="lp-trust-strip" role="list" aria-label="Badges de confiance et garanties Freenzy.io" style={{
              display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
              marginTop: 40, paddingTop: 32,
              borderTop: '1px solid #E5E5E5',
            }}>
              {TRUST_BADGES.map((badge, i) => (
                <div key={i} role="listitem" style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 11, fontWeight: 600, color: '#9B9B9B',
                }}>
                  <span role="img" aria-label={`Garantie : ${badge.text}`} style={{ fontSize: 15 }}>{badge.emoji}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ 13. ENTERPRISE (visible si audience null ou entreprise) ══ */}
        {(!audience || audience === 'entreprise') && (
          <section ref={enterpriseRef} id="enterprise" aria-label="Offre entreprise Freenzy.io — solutions IA sur mesure pour grandes entreprises et ETI" style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
            <EnterpriseSection />
          </section>
        )}

        {/* ══ 14. FAQ — 100+ QUESTIONS PAR THÈME ════════════════════ */}
        <section ref={faqRef} id="faq" aria-label="Questions frequentes sur Freenzy.io — plus de 100 reponses sur les agents IA, les tarifs, les fonctionnalites et la securite" style={{ background: '#FFFFFF', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9B9B9B', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>FAQ — Questions frequentes</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1A1A1A', letterSpacing: -1 }}>
                <span style={{ fontWeight: 700, color: '#1A1A1A' }}>{TOTAL_FAQ_COUNT}</span> reponses a vos questions sur l&apos;IA.
              </h2>
              <p style={{ fontSize: 14, color: '#6B6B6B', marginTop: 8 }}>
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
                    background: faqCat === ci ? '#1A1A1A' : '#F7F7F7',
                    color: faqCat === ci ? '#fff' : '#6B6B6B',
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
              background: '#F7F7F7',
              border: '1px solid #E5E5E5',
            }}>
              <span style={{ fontSize: 18 }}>{orderedFaq[faqCat].icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: '#1A1A1A' }}>
                {orderedFaq[faqCat].label}
              </span>
              <span style={{ fontSize: 12, color: '#9B9B9B', marginLeft: 'auto' }}>
                {orderedFaq[faqCat].questions.length} questions
              </span>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {orderedFaq[faqCat].questions.map((faq, i) => {
                const isOpen = openFaq === i;
                return (
                  <div
                    key={`${faqCat}-${i}`}
                    className="lp-faq-item"
                    role="button"
                    tabIndex={0}
                    aria-expanded={isOpen}
                    onClick={() => {
                      if (!isOpen) trackFaqOpened(faq.q, orderedFaq[faqCat].label);
                      setOpenFaq(isOpen ? null : i);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' || e.key === ' ') {
                        e.preventDefault();
                        if (!isOpen) trackFaqOpened(faq.q, orderedFaq[faqCat].label);
                        setOpenFaq(isOpen ? null : i);
                      }
                    }}
                    style={{
                      background: isOpen ? '#F7F7F7' : '#fff',
                      border: '1px solid #E5E5E5',
                      borderLeft: `3px solid ${isOpen ? '#1A1A1A' : '#E5E5E5'}`,
                      borderRadius: 11, padding: '16px 18px',
                      transition: 'all 0.2s', cursor: 'pointer',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1A1A1A' }}>{faq.q}</div>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: isOpen ? '#1A1A1A' : '#F7F7F7',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: isOpen ? '#fff' : '#9B9B9B',
                        transition: 'all 0.2s',
                      }}>
                        {isOpen ? '−' : '+'}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="lp-faq-answer" style={{
                        borderTop: '1px solid #E5E5E5',
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

        {/* ══ 15. CTA FINAL ════════════════════════════════════════ */}
        <section ref={ctaRef} aria-label="Accedez a Freenzy.io gratuitement — explorez le dashboard sans inscription, 0% commission" style={{
          background: '#F7F7F7',
          padding: 'clamp(56px, 8vw, 96px) 24px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 12, letterSpacing: 4, marginBottom: 16, color: '#9B9B9B', display: 'flex', alignItems: 'baseline', justifyContent: 'center', gap: 6 }}>
              <span className="fz-logo-text">freenzy.io</span>
              <span style={{ fontSize: 8, fontStyle: 'italic', letterSpacing: 0, fontWeight: 400 }}>Beta Test 1</span>
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 56px)',
              fontFamily: 'var(--font-display)', fontWeight: 700,
              letterSpacing: -2.5, lineHeight: 1.05, marginBottom: 14,
              color: '#1A1A1A',
            }}>
              Accedez a Freenzy maintenant<br />
              c&apos;est gratuit, sans inscription.
            </h2>
            <p style={{ fontSize: 15, color: '#6B6B6B', marginBottom: 24 }}>
              <span style={{ fontWeight: 700, color: '#1A1A1A' }}>{totalAgents}+ agents IA</span>. Toutes les IA du marche. <span style={{ fontWeight: 700, color: '#1A1A1A' }}>0% de commission</span>. Acces libre, sans inscription.
            </p>
            {/* Rewards chips */}
            <div className="lp-rewards-chips" role="list" aria-label="Avantages et recompenses offerts aux utilisateurs Freenzy.io" style={{ display: 'flex', flexWrap: 'wrap', gap: 10, justifyContent: 'center', marginBottom: 28 }}>
              {REWARDS_CHIPS.map((chip, i) => (
                <div key={i} role="listitem" style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  padding: '6px 14px', borderRadius: 100,
                  background: '#fff', border: '1px solid #E5E5E5',
                }}>
                  <span role="img" aria-label={`Recompense : ${chip.text}`} style={{ fontSize: 15 }}>{chip.emoji}</span>
                  <span style={{ fontSize: 12, fontWeight: 600, color: '#1A1A1A' }}>{chip.text}</span>
                </div>
              ))}
            </div>
            <span style={srOnly}>Rejoignez les 500 professionnels qui utilisent deja Freenzy.io pour automatiser leur entreprise. Inscription gratuite, sans carte bancaire, avec 50 credits offerts et 0 pour cent de commission a vie pour les premiers utilisateurs. Accedez immediatement a plus de 100 agents IA specialises.</span>
            <Link href="/client/dashboard" className="lp-cta-primary" title="Accedez au dashboard Freenzy.io gratuitement — explorez tous les agents IA sans inscription" onClick={() => trackCtaClick('final_cta', '/client/dashboard', audience, '/')} style={{
              display: 'inline-block', padding: '15px 40px',
              background: '#1A1A1A', color: '#fff',
              borderRadius: 8, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
              textDecoration: 'none',
            }}>
              Acceder au Dashboard
            </Link>
            <div style={{ marginTop: 16, fontSize: 12 }}>
              <Link href="/plans" title="Consultez les tarifs detailles de Freenzy.io — paiement a l'usage, 0% commission" style={{ color: '#9B9B9B', textDecoration: 'none' }}>Voir les tarifs detailles de Freenzy.io →</Link>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </>
  );
}
