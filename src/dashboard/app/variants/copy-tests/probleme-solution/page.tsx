'use client';

import { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import PublicNav from '../../../../components/PublicNav';
import PublicFooter from '../../../../components/PublicFooter';
import EnterpriseSection from '../../../plans/EnterpriseSection';
import { TOTAL_AGENTS_DISPLAY } from '../../../../lib/agent-config';
import { FAQ_CATEGORIES, TOTAL_FAQ_COUNT } from '../../../../lib/faq-data';
import AudienceStickyBar from '../../../../components/AudienceStickyBar';
import { useAudience } from '../../../../lib/use-audience';
import { AUDIENCE_CONFIGS, AudienceType } from '../../../../lib/audience-data';
import { getOrderedFaqCategories } from '../../../../lib/faq-utils';
import { useSectionObserver } from '../../../../hooks/useSectionObserver';
import { trackPageView, trackCtaClick, trackFaqOpened } from '../../../../lib/analytics';
import { AI_MODELS, ECOSYSTEM, ALL_AGENTS, ACTION_COSTS, STATS_BADGES, ACTIVITY, DEMO_SCENARIOS, SCENARIOS, TECH_FEATURES, WA_MESSAGES, TOOL_CATEGORIES } from '../shared-data';

const totalAgents = TOTAL_AGENTS_DISPLAY;

const DEFAULT_HERO = {
  badge: 'Liberez-vous de l\'administratif',
  headline: 'NOYE DANS L\'ADMIN ? ON A LA SOLUTION.',
  tagline: 'Avant / Apres.',
  subheadline: 'Appels manques, devis en retard, posts oublies, compta en vrac. Chaque heure perdue vous coute des clients. Vos 72 agents IA s\'en occupent.',
};

const AUDIENCE_HEROES: Record<string, typeof DEFAULT_HERO> = {
  particulier: {
    badge: 'Liberez votre temps',
    headline: 'LA CHARGE MENTALE S\'ARRETE ICI.',
    tagline: 'Respirez.',
    subheadline: 'Impots, budget, immo... Vous gerez tout seul. Chaque week-end, memes corvees. Vos 12 agents perso changent ca.',
  },
  freelance: {
    badge: 'Sortez la tete de l\'eau',
    headline: '16H PAR JOUR ET TOUJOURS EN RETARD ?',
    tagline: 'Ca suffit.',
    subheadline: 'Devis, relances, compta, social media... Vous faites tout. Sauf ce que vous aimez. Changeons ca.',
  },
  entreprise: {
    badge: 'Liberez vos equipes',
    headline: 'VOS EQUIPES CROULENT SOUS L\'ADMIN.',
    tagline: 'On a la solution.',
    subheadline: 'RH, juridique, finance : 60% du temps en taches repetitives. 34 agents IA liberent vos talents.',
  },
};

// ---------------------------------------------------------------
export default function LandingPageProblemeSolution() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [faqCat, setFaqCat] = useState(0);
  const [demoTab, setDemoTab] = useState(0);
  const [toolTab, setToolTab] = useState(0);
  const { audience, setAudience, config } = useAudience();
  const ctaHref = config?.cta.href || '/login?mode=register';
  const demo = DEMO_SCENARIOS[demoTab];

  const orderedFaq = useMemo(() => getOrderedFaqCategories(FAQ_CATEGORIES, audience), [audience]);
  useEffect(() => { setFaqCat(0); setOpenFaq(null); }, [audience]);

  const heroRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const sectionRefs = useMemo(() => ({ hero: heroRef, faq: faqRef, cta: ctaRef }), []);
  useSectionObserver(sectionRefs);

  const heroCopy = useMemo(() => {
    if (!audience) return DEFAULT_HERO;
    return AUDIENCE_HEROES[audience] || DEFAULT_HERO;
  }, [audience]);

  const ctaLabel = config?.cta.label || 'Reprendre le controle';

  useEffect(() => { trackPageView('/variants/copy-tests/probleme-solution', 'probleme-solution', audience); }, [audience]);

  return (
    <>
      <PublicNav />
      <AudienceStickyBar audience={audience} onChange={setAudience} variant="dark" />
      <main style={{ paddingTop: 108 }}>

        {/* ══ HERO COMPACT ═══════════════════════════════════════ */}
        <section ref={heroRef} style={{
          background: 'linear-gradient(170deg, #0a0a0f 0%, #13131f 100%)',
          padding: 'clamp(20px, 3vw, 32px) 24px clamp(16px, 2vw, 24px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
          minHeight: 'calc(100vh - 188px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
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
                {heroCopy.badge}
              </span>
            </div>
            <h1 className="lp-gradient-h1" style={{
              fontFamily: 'var(--font-display)',
              fontSize: 'clamp(26px, 6vw, 72px)',
              fontWeight: 700, lineHeight: 0.92,
              marginBottom: 10, letterSpacing: -3,
              textTransform: 'uppercase',
            }}>
              {heroCopy.headline}
            </h1>
            <p style={{
              fontFamily: 'var(--font-display)', fontSize: 'clamp(13px, 1.6vw, 15px)',
              color: '#5b6cf7', fontWeight: 600,
              letterSpacing: 2, textTransform: 'uppercase', marginBottom: 8,
            }}>
              {heroCopy.tagline}
            </p>
            <p style={{
              fontSize: 'clamp(14px, 1.8vw, 17px)',
              color: 'rgba(255,255,255,0.44)',
              lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px',
            }}>
              {heroCopy.subheadline}
            </p>
            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 8, justifyContent: 'center' }}>
                <Link href={ctaHref} className="lp-cta-primary" onClick={() => trackCtaClick('hero_cta', ctaHref, audience, '/variants/copy-tests/probleme-solution')} style={{
                  padding: '12px 20px', background: '#5b6cf7', color: '#fff',
                  borderRadius: 10, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 'clamp(12px, 3.2vw, 15px)', textDecoration: 'none',
                  minHeight: 44, whiteSpace: 'nowrap',
                }}>
                  {ctaLabel}
                </Link>
                <Link href="/plans" style={{
                  padding: '12px 16px', minHeight: 44, whiteSpace: 'nowrap',
                  background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)',
                  color: 'rgba(255,255,255,0.68)', borderRadius: 10, fontWeight: 600,
                  fontSize: 'clamp(11px, 3vw, 14px)', textDecoration: 'none',
                }}>
                  Voir les tarifs
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ══ PROBLEM STRIP ═════════════════════════════════════ */}
        <section style={{ background: '#1d1d1f', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#ef4444', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Le probleme</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#fff', letterSpacing: -1.5 }}>
                Ce qui vous <span style={{ color: '#ef4444' }}>coute</span> chaque jour.
              </h2>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16 }} className="lp-scenario-steps">
              {[
                { icon: 'phone_missed', color: '#ef4444', title: 'Appels manques', desc: '73% des appels clients tombent en messagerie. Chaque appel perdu = un client perdu.' },
                { icon: 'schedule', color: '#f97316', title: 'Devis en retard', desc: 'Un devis envoye apres 24h a 60% de chances en moins d\'etre accepte.' },
                { icon: 'visibility_off', color: '#ef4444', title: 'Posts non publies', desc: 'Sans presence en ligne reguliere, votre entreprise est invisible. Vos concurrents publient chaque jour.' },
                { icon: 'error', color: '#f97316', title: 'Compta en desordre', desc: 'Factures oubliees, relances en retard, tresorerie floue. Le chaos administratif vous coute cher.' },
              ].map((pain, i) => (
                <div key={i} style={{
                  background: 'rgba(255,255,255,0.03)',
                  border: '1px solid rgba(255,255,255,0.06)',
                  borderLeft: `3px solid ${pain.color}`,
                  borderRadius: '0 12px 12px 0',
                  padding: '22px 20px',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, color: pain.color }}>{pain.icon}</span>
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff' }}>{pain.title}</h3>
                  </div>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{pain.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ SOLUTION REVEAL ═══════════════════════════════════ */}
        <section style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#5b6cf7', letterSpacing: -1.5, marginBottom: 8 }}>
                Et si tout ca disparaissait ?
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, maxWidth: 520, margin: '0 auto' }}>
                Vos 72 agents IA prennent le relais. Chaque probleme a sa solution.
              </p>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14 }} className="lp-custom-examples">
              {[
                { before: 'Appels manques', after: '0 appel manque', icon: 'call', label: 'Repondeur 24/7' },
                { before: 'Devis en retard', after: '100% a temps', icon: 'description', label: 'Devis en 30s' },
                { before: 'Posts oublies', after: 'Presence quotidienne', icon: 'phone_iphone', label: 'Posts automatiques' },
                { before: 'Compta en vrac', after: 'Tout en ordre', icon: 'savings', label: 'Compta IA' },
              ].map((sol, i) => (
                <div key={i} style={{
                  padding: '20px 16px', borderRadius: 14,
                  background: '#fff', border: '1px solid #e8e8e8',
                  textAlign: 'center',
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 28, color: '#5b6cf7', marginBottom: 10, display: 'block' }}>{sol.icon}</span>
                  <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>{sol.label}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af', textDecoration: 'line-through', marginBottom: 4 }}>{sol.before}</div>
                  <div style={{
                    fontSize: 12, fontWeight: 700, color: '#22c55e',
                    background: 'rgba(34,197,94,0.08)', border: '1px solid rgba(34,197,94,0.18)',
                    padding: '3px 10px', borderRadius: 20, display: 'inline-block',
                  }}>{sol.after}</div>
                </div>
              ))}
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
            <div style={{ display: 'flex', gap: 6, marginBottom: 14, overflowX: 'auto', paddingBottom: 2 }}>
              {DEMO_SCENARIOS.map((s, i) => (
                <button key={i} className="lp-demo-tab" onClick={() => setDemoTab(i)} style={{
                  padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44,
                  background: demoTab === i ? s.color : 'rgba(255,255,255,0.06)',
                  color: demoTab === i ? '#fff' : 'rgba(255,255,255,0.45)',
                  boxShadow: demoTab === i ? `0 0 20px ${s.color}44` : 'none',
                  transition: 'all 0.2s',
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 16, marginRight: 6 }}>{s.tabIcon}</span>
                  {s.tab}
                </button>
              ))}
            </div>
            <div style={{ background: '#0a0a0f', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, overflow: 'hidden' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '9px 16px', borderBottom: '1px solid rgba(255,255,255,0.06)', display: 'flex', alignItems: 'center', gap: 7 }}>
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ff5f57', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#ffbe2e', display: 'inline-block' }} />
                <span style={{ width: 9, height: 9, borderRadius: '50%', background: '#28c840', display: 'inline-block' }} />
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginLeft: 6 }}>Flashboard &middot; Agent {demo.tab}</span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: 'rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>person</span>
                  </div>
                  <div style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)', borderRadius: '0 12px 12px 12px', padding: '9px 13px', fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, maxWidth: 520 }}>
                    {demo.prompt}
                  </div>
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <div style={{ width: 26, height: 26, borderRadius: '50%', flexShrink: 0, background: `${demo.color}1a`, border: `1px solid ${demo.color}44`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 11 }}>bolt</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: demo.color, fontWeight: 700, letterSpacing: 0.5 }}>{demo.tab.toUpperCase()} &middot; TERMINE</span>
                      <span style={{ display: 'inline-block', width: 5, height: 5, borderRadius: '50%', background: demo.color, animation: 'lp-cursor-blink 1.2s step-end infinite' }} />
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                      {demo.lines.map((line, j) => (
                        <div key={j} style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)', borderLeft: `2px solid ${demo.color}55`, borderRadius: '0 8px 8px 0', padding: '7px 11px', display: 'flex', gap: 10, alignItems: 'baseline' }}>
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: 0.4, flexShrink: 0, minWidth: 58 }}>{line.label}</span>
                          <span style={{ fontSize: 12, color: 'rgba(255,255,255,0.68)' }}>{line.text}</span>
                        </div>
                      ))}
                    </div>
                    <div style={{ marginTop: 8, fontSize: 11, color: 'rgba(255,255,255,0.18)' }}>{demo.model}</div>
                  </div>
                </div>
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
                  <span style={{ color: 'rgba(255,255,255,0.45)', fontSize: 11 }}>{item.text}</span>
                  <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10 }}>&middot; {item.ago}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
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

        {/* ══ OUTILS UTILISATEURS ═══════════════════════════════ */}
        <section style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#5b6cf7', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Outils</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 6 }}>
                Vos <span className="fz-accent-word">outils</span>, prets a l&apos;emploi.
              </h2>
              <p style={{ color: '#86868b', fontSize: 14 }}>Tout ce dont vous avez besoin, active en <span className="fz-accent-word">un clic</span>.</p>
            </div>
            <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {TOOL_CATEGORIES.map((cat, i) => (
                <button key={cat.id} onClick={() => setToolTab(i)} style={{
                  padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                  border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44,
                  background: toolTab === i ? '#5b6cf7' : '#f0f0f0',
                  color: toolTab === i ? '#fff' : '#6b7280',
                  boxShadow: toolTab === i ? '0 2px 12px rgba(91,108,247,0.25)' : 'none',
                  transition: 'all 0.2s', display: 'flex', alignItems: 'center', gap: 6,
                }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 15 }}>{cat.icon}</span>
                  {cat.label}
                </button>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 14 }} className="lp-tools-grid">
              {TOOL_CATEGORIES[toolTab].tools.map((tool, i) => (
                <div key={i} className="lp-app-card" style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '20px 18px' }}>
                  <div style={{ width: 44, height: 44, borderRadius: 12, flexShrink: 0, background: '#f0f0ff', border: '1px solid #e0e0ff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22 }}>{tool.icon}</span>
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                      <span style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{tool.name}</span>
                      <span style={{ fontSize: 10, fontWeight: 700, color: '#22c55e', background: '#22c55e10', border: '1px solid #22c55e22', padding: '2px 8px', borderRadius: 20 }}>Inclus</span>
                    </div>
                    <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.55 }}>{tool.desc}</p>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <span style={{ fontSize: 12, color: '#9ca3af' }}>
                {TOOL_CATEGORIES.reduce((acc, c) => acc + c.tools.length, 0)} outils inclus dans tous les plans
              </span>
            </div>
          </div>
        </section>

        {/* ══ SCENARIOS + TECH ══════════════════════════════════ */}
        <section style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#5b6cf7', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Comment ca marche</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 6 }}>
                <span className="fz-accent-word">Concret</span>. <span className="fz-accent-word">Automatise</span>. <span className="fz-accent-word">Instantane</span>.
              </h2>
              <p style={{ color: '#86868b', fontSize: 14 }}>Vos agents traitent tout, <span className="fz-accent-word">24h/24</span>. Voici ce que ca donne.</p>
            </div>
            <div className="lp-scenario-steps" style={{ gap: 16, marginBottom: 40 }}>
              {SCENARIOS.map((s, i) => (
                <div key={i} className="lp-app-card">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, marginBottom: 14 }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {s.steps.map((step, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#4b5563' }}>
                        <span style={{ width: 20, height: 20, borderRadius: '50%', background: `${s.color}14`, color: s.color, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, fontWeight: 800, flexShrink: 0 }}>{j + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, fontSize: 11, color: '#9ca3af' }}>{s.tech}</div>
                </div>
              ))}
            </div>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#9ca3af', letterSpacing: 3, textTransform: 'uppercase' }}>Propulse par</p>
            </div>
            <div className="lp-scenario-steps" style={{ gap: 14 }}>
              {TECH_FEATURES.map((t, i) => (
                <div key={i} className="lp-app-card" style={{ padding: '20px 22px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, flexShrink: 0 }} />
                    <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{t.title}</h3>
                  </div>
                  <p style={{ fontSize: 12, color: '#6b7280', lineHeight: 1.6, marginBottom: 10 }}>{t.desc}</p>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
                    {t.points.map((p, j) => (
                      <span key={j} style={{ fontSize: 11, color: '#4b5563', background: '#f0f0f0', padding: '3px 10px', borderRadius: 20 }}>{p}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
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
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, marginBottom: 20 }}>
                  Recevez les resumes, donnez des instructions, pilotez votre entreprise depuis WhatsApp. Vos agents repondent en <span className="fz-accent-word" style={{ color: '#22c55e' }}>temps reel</span>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Resumes automatiques', 'Instructions en langage naturel', 'Notifications intelligentes', 'Fichiers et documents'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#4b5563' }}>
                      <span className="material-symbols-rounded" style={{ color: '#22c55e', fontSize: 16 }}>check_circle</span> {f}
                    </div>
                  ))}
                </div>
              </div>
              <div style={{ background: '#075e54', borderRadius: 20, padding: '20px 16px', maxWidth: 340, width: '100%' }}>
                <div style={{ textAlign: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Freenzy Assistant</span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {WA_MESSAGES.map((msg, i) => (
                    <div key={i} style={{
                      alignSelf: msg.from === 'user' ? 'flex-end' : 'flex-start',
                      background: msg.from === 'user' ? '#dcf8c6' : '#fff',
                      color: '#1d1d1f', borderRadius: 10, padding: '8px 12px',
                      maxWidth: '85%', fontSize: 12, lineHeight: 1.5, whiteSpace: 'pre-line',
                    }}>
                      {msg.text}
                      <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right', marginTop: 3 }}>{msg.time}</div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══ CREATION SUR MESURE ═══════════════════════════════ */}
        <section style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#8b5cf6', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Sur mesure</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 12 }}>
                Creez vos propres <span className="fz-accent-word" style={{ color: '#8b5cf6' }}>modules</span>.
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, maxWidth: 580, margin: '0 auto' }}>
                Chaque entreprise est <span className="fz-accent-word" style={{ color: '#8b5cf6' }}>unique</span>. Creez des modules IA adaptes a votre metier, ou confiez-nous leur conception.
              </p>
            </div>
            <div className="lp-custom-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 32 }}>
              <div className="lp-app-card" style={{ padding: '32px 28px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 32, marginBottom: 16, display: 'block' }}>build</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1d1d1f', marginBottom: 8 }}>Vous creez</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 18 }}>
                  Depuis votre tableau de bord, definissez un agent personnalise en quelques minutes : nom, role, instructions, ton, et outils connectes.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Definissez le role et les objectifs', 'Choisissez le modele IA (Claude, GPT, Gemini...)', 'Connectez vos outils (email, CRM, WhatsApp...)', 'Testez et deployez instantanement'].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#4b5563', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="material-symbols-rounded" style={{ color: '#8b5cf6', fontSize: 14 }}>check_circle</span> {p}
                    </div>
                  ))}
                </div>
              </div>
              <div className="lp-app-card" style={{ padding: '32px 28px' }}>
                <span className="material-symbols-rounded" style={{ fontSize: 32, marginBottom: 16, display: 'block' }}>target</span>
                <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 17, fontWeight: 700, color: '#1d1d1f', marginBottom: 8 }}>On cree pour vous</h3>
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 18 }}>
                  Besoin d&apos;un module complexe ou specifique a votre secteur ? Notre equipe le concoit, le configure et le deploie dans votre espace.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Agents metier sur mesure (immobilier, sante, juridique...)', 'Workflows automatises multi-agents', 'Integrations personnalisees (API, bases de donnees)', 'Formation et accompagnement inclus'].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#4b5563', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="material-symbols-rounded" style={{ color: '#8b5cf6', fontSize: 14 }}>check_circle</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>
            <div className="lp-app-card" style={{ padding: '24px 28px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>Exemples de modules crees par nos utilisateurs</p>
              <div className="lp-custom-examples" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
                {[
                  { icon: 'home', name: 'Agent Immobilier', desc: 'Redige les annonces, qualifie les leads, planifie les visites' },
                  { icon: 'gavel', name: 'Veille Juridique', desc: 'Surveille les changements reglementaires et alerte en temps reel' },
                  { icon: 'restaurant', name: 'Maitre d\'Hotel IA', desc: 'Gere les reservations, allergies, menus du jour par WhatsApp' },
                  { icon: 'package_2', name: 'Suivi Logistique', desc: 'Traque les colis, previent les retards, notifie les clients' },
                ].map((ex, i) => (
                  <div key={i} style={{ padding: '16px 14px', borderRadius: 12, background: '#fafafa', border: '1px solid #f0f0f0' }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, marginBottom: 8, display: 'block' }}>{ex.icon}</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.55 }}>{ex.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* ══ LA SOLUTION COMPLETE (Pourquoi) ═══════════════════ */}
        <section style={{ background: '#0e0e18', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 40 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#a5b4fc', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>La solution</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#fff', letterSpacing: -1.5 }}>
                La solution <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>complete</span>.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginTop: 8, lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Chaque probleme a sa reponse. Une plateforme <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>complete</span>, <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>simple</span>, sans commission.
              </p>
            </div>
            <div className="lp-scenario-steps" style={{ gap: 16 }}>
              {[
                { icon: 'bolt', title: 'Tout automatise', desc: 'Emails, devis, posts, compta, appels — chaque tache repetitive est geree par un agent IA dedie.' },
                { icon: 'school', title: 'Zero formation', desc: 'Pas de logiciel a apprendre. Ecrivez en francais, l\'IA comprend et execute.' },
                { icon: 'chat', title: 'WhatsApp natif', desc: 'Pilotez tout depuis WhatsApp. Validez, instruisez, recevez les rapports — sans ouvrir un logiciel.' },
                { icon: 'smart_toy', title: '72+ agents prets', desc: 'Un agent specialise pour chaque probleme. Commercial, juridique, marketing, RH, finance, creatif...' },
                { icon: 'diamond', title: '0% de commission', desc: 'Prix fournisseurs IA, sans marge. Vos 50 premiers credits sont offerts.' },
                { icon: 'trending_up', title: 'Resultats en 48h', desc: 'Des la premiere action, vous gagnez du temps. Le changement est immediat et mesurable.' },
              ].map((item, i) => (
                <div key={i} className="lp-app-card-dark">
                  <span className="material-symbols-rounded" style={{ fontSize: 28, marginBottom: 12, display: 'block' }}>{item.icon}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap', marginTop: 40, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.06)' }}>
              {[
                { icon: 'lock', text: 'Chiffrement AES-256' },
                { icon: 'verified_user', text: 'Serveurs EU · RGPD' },
                { icon: 'credit_card', text: 'Paiement Stripe PCI' },
                { icon: 'shield', text: '2FA · TOTP' },
                { icon: 'bar_chart', text: 'Audit logs complets' },
              ].map((badge, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 7, fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.28)' }}>
                  <span className="material-symbols-rounded" style={{ fontSize: 15 }}>{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ENTERPRISE ═══════════════════════════════════════ */}
        {(!audience || audience === 'entreprise') && (
          <section style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
            <EnterpriseSection />
          </section>
        )}

        {/* ══ FAQ ═══════════════════════════════════════════════ */}
        <section ref={faqRef} id="faq" style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#f97316', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>FAQ</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1 }}>
                <span className="fz-accent-word" style={{ color: '#f97316' }}>{TOTAL_FAQ_COUNT}</span> reponses a vos questions.
              </h2>
              <p style={{ fontSize: 14, color: '#86868b', marginTop: 8 }}>Tout ce que vous devez savoir sur Freenzy.io, classe par theme.</p>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center', marginBottom: 28, padding: '0 8px' }}>
              {orderedFaq.map((cat, ci) => (
                <button key={cat.id} onClick={() => { setFaqCat(ci); setOpenFaq(null); }} style={{
                  display: 'flex', alignItems: 'center', gap: 5,
                  padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, minHeight: 44,
                  border: 'none', cursor: 'pointer',
                  background: faqCat === ci ? cat.color : '#fff',
                  color: faqCat === ci ? '#fff' : '#6b7280',
                  boxShadow: faqCat === ci ? `0 2px 12px ${cat.color}33` : '0 1px 3px rgba(0,0,0,0.04)',
                  transition: 'all 0.2s',
                }}>
                  <span style={{ fontSize: 13 }}>{cat.icon}</span>
                  <span className="lp-faq-tab-label">{cat.label}</span>
                  <span style={{ fontSize: 10, fontWeight: 800, opacity: 0.7, marginLeft: 2 }}>{cat.questions.length}</span>
                </button>
              ))}
            </div>
            <div style={{
              display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16,
              padding: '10px 16px', borderRadius: 10,
              background: `${orderedFaq[faqCat].color}08`, border: `1px solid ${orderedFaq[faqCat].color}18`,
            }}>
              <span style={{ fontSize: 18 }}>{orderedFaq[faqCat].icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: orderedFaq[faqCat].color }}>{orderedFaq[faqCat].label}</span>
              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>{orderedFaq[faqCat].questions.length} questions</span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {orderedFaq[faqCat].questions.map((faq, i) => {
                const isOpen = openFaq === i;
                const catColor = orderedFaq[faqCat].color;
                return (
                  <div key={`${faqCat}-${i}`} className="lp-faq-item" onClick={() => { if (!isOpen) trackFaqOpened(faq.q, orderedFaq[faqCat].label); setOpenFaq(isOpen ? null : i); }} style={{
                    background: isOpen ? '#fafaff' : '#fff',
                    border: isOpen ? `1.5px solid ${catColor}40` : '1px solid #ebebeb',
                    borderLeft: `3px solid ${isOpen ? catColor : '#d1d5db'}`,
                    borderRadius: 11, padding: '16px 18px', transition: 'all 0.2s', cursor: 'pointer',
                  }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: '#1d1d1f' }}>{faq.q}</div>
                      <div style={{
                        width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                        background: isOpen ? catColor : '#f0f0f0',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700,
                        color: isOpen ? '#fff' : '#9ca3af', transition: 'all 0.2s',
                      }}>
                        {isOpen ? '\u2212' : '+'}
                      </div>
                    </div>
                    {isOpen && (
                      <div className="lp-faq-answer" style={{ borderTop: `1px solid ${catColor}12` }}>{faq.a}</div>
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
            <p className="fz-logo-text fz-logo-text-dark" style={{ fontSize: 12, letterSpacing: 4, marginBottom: 16, opacity: 0.4 }}>freenzy.io</p>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 56px)',
              fontFamily: 'var(--font-display)', fontWeight: 700, color: '#fff',
              letterSpacing: -2.5, lineHeight: 1.05, marginBottom: 14,
            }}>
              Arretez de subir.<br />
              <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>Commencez a deleguer.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.36)', marginBottom: 32 }}>
              <span style={{ color: '#a5b4fc', fontWeight: 700 }}>72 agents prets</span>. 0 formation requise. <span style={{ color: '#a5b4fc', fontWeight: 700 }}>50 credits offerts</span>.
            </p>
            <Link href={ctaHref} className="lp-cta-primary" onClick={() => trackCtaClick('final_cta', ctaHref, audience, '/variants/copy-tests/probleme-solution')} style={{
              display: 'inline-block', padding: '15px 40px',
              background: '#5b6cf7', color: '#fff',
              borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
              textDecoration: 'none',
            }}>
              {ctaLabel}
            </Link>
            <div style={{ marginTop: 16, fontSize: 12 }}>
              <Link href="/plans" style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>Tarifs detailles &rarr;</Link>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </>
  );
}
