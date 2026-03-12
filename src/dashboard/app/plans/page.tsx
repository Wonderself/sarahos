'use client';

import { useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { DEFAULT_AGENTS, PERSONAL_AGENTS, TOTAL_AGENTS_DISPLAY } from '../../lib/agent-config';
import EnterpriseSection from './EnterpriseSection';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';
import AudienceStickyBar from '../../components/AudienceStickyBar';
import { useAudience } from '../../lib/use-audience';
import { useSectionObserver } from '../../hooks/useSectionObserver';
import { trackPageView, trackCtaClick } from '../../lib/analytics';

const totalAgents = TOTAL_AGENTS_DISPLAY;

// ── Data from tarifs-api (merged) ──────────────────────────
const ACTION_COSTS = [
  { icon: '💬', action: 'Chat avec agent IA', model: 'Claude Haiku', credits: 0.5, per50: '100 chats', color: '#06b6d4' },
  { icon: '📧', action: 'Email professionnel', model: 'Claude Sonnet', credits: 1.1, per50: '45 emails', color: '#7c3aed' },
  { icon: '📱', action: 'Post reseaux sociaux', model: 'Claude Haiku', credits: 0.8, per50: '62 posts', color: '#3b82f6' },
  { icon: '📄', action: 'Document complet', model: 'Claude Sonnet', credits: 3.5, per50: '14 docs', color: '#7c3aed' },
  { icon: '📞', action: 'Appel repondeur IA', model: 'Twilio + Haiku', credits: 5, per50: '10 appels', color: '#f97316' },
  { icon: '📤', action: 'Appel sortant IA', model: 'Twilio + Sonnet', credits: 16, per50: '3 appels', color: '#f97316' },
  { icon: '💬', action: 'WhatsApp Business IA', model: 'Claude Haiku', credits: 0.4, per50: '125 msgs', color: '#06b6d4' },
  { icon: '🎙️', action: 'Message vocal TTS', model: 'ElevenLabs', credits: 4.5, per50: '11 msgs', color: '#f59e0b' },
  { icon: '🖼️', action: 'Image IA creee', model: 'DALL-E / Flux', credits: 7, per50: '7 images', color: '#9333ea' },
  { icon: '🎬', action: 'Clip video 30s', model: 'Runway ML', credits: 40, per50: '1 clip', color: '#ec4899' },
  { icon: '🤝', action: 'Reunion IA structuree', model: 'Claude Opus', credits: 8, per50: '6 reunions', color: '#9333ea' },
];

const MODEL_PRICES = [
  { model: 'Claude Haiku', input: '$0.80', output: '$4.00', usage: 'FAQ, chat, posts réseaux, WhatsApp', color: '#06b6d4' },
  { model: 'Claude Sonnet', input: '$3.00', output: '$15.00', usage: 'Emails, documents, analyses', color: '#7c3aed' },
  { model: 'Claude Opus', input: '$15.00', output: '$75.00', usage: 'Stratégie, DG, décisions critiques', color: '#9333ea' },
  { model: 'ElevenLabs TTS', input: '€0.18', output: '/ 1 000 chars', usage: 'Voix naturelle, messages vocaux', color: '#f59e0b' },
  { model: 'Twilio Voice', input: '$0.014', output: '/ min', usage: 'Appels entrants & sortants', color: '#f97316' },
  { model: 'Runway ML Gen-3', input: '$0.05', output: '/ seconde vidéo', usage: 'Génération vidéo', color: '#ec4899' },
];

// ── Shared styles ────────────────────────────────────────
const eyebrow: React.CSSProperties = {
  fontSize: 11, fontWeight: 700, letterSpacing: 4,
  textTransform: 'uppercase', color: '#86868b', marginBottom: 12,
  fontFamily: 'var(--font-display)',
};
const sectionTitle: React.CSSProperties = {
  fontSize: 'clamp(22px, 3.2vw, 36px)', fontWeight: 700,
  fontFamily: 'var(--font-display)',
  letterSpacing: -1.2, color: '#1d1d1f', lineHeight: 1.1, margin: 0,
};
const sectionSubtitle: React.CSSProperties = {
  fontSize: 15, color: '#86868b', lineHeight: 1.6, marginTop: 10,
};
const sectionPad: React.CSSProperties = {
  padding: 'clamp(64px, 8vw, 96px) 0',
};
const card: React.CSSProperties = {
  background: '#fff',
  border: '1px solid #e5e7eb',
  borderRadius: 16,
};
const cell = { padding: '12px 16px', fontSize: 13, borderBottom: '1px solid #f0f0f0' } as const;

// ── JSON-LD Structured Data for Plans page ──
const plansJsonLd = { '@context': 'https://schema.org', '@graph': [{ '@type': 'Product', '@id': 'https://freenzy.io/plans#product', name: 'Freenzy.io — Credits IA', description: 'Credits pour utiliser les 100 agents IA Freenzy.io. Payez uniquement ce que vous consommez. 0% de commission.', brand: { '@type': 'Organization', name: 'Freenzy.io', url: 'https://freenzy.io' }, url: 'https://freenzy.io/plans', image: 'https://freenzy.io/og-image.png', category: 'Business Software', offers: [{ '@type': 'Offer', name: 'Inscription gratuite', price: '0', priceCurrency: 'EUR', description: 'Acces gratuit. 50 credits offerts. Sans carte bancaire.', availability: 'https://schema.org/InStock', priceValidUntil: '2027-12-31', url: 'https://freenzy.io/login?mode=register' }, { '@type': 'Offer', name: 'Recharge 5 EUR — Basic', price: '5', priceCurrency: 'EUR', description: '500 credits IA. 500K tokens/jour.', availability: 'https://schema.org/InStock', url: 'https://freenzy.io/plans' }, { '@type': 'Offer', name: 'Recharge 20 EUR — Populaire', price: '20', priceCurrency: 'EUR', description: '2 000 credits IA. Pack le plus choisi.', availability: 'https://schema.org/InStock', url: 'https://freenzy.io/plans' }, { '@type': 'Offer', name: 'Recharge 50 EUR — Premium', price: '50', priceCurrency: 'EUR', description: '5 000 credits IA.', availability: 'https://schema.org/InStock', url: 'https://freenzy.io/plans' }, { '@type': 'Offer', name: 'Recharge 100 EUR — Pro', price: '100', priceCurrency: 'EUR', description: '10 000 credits IA.', availability: 'https://schema.org/InStock', url: 'https://freenzy.io/plans' }] }, { '@type': 'Service', '@id': 'https://freenzy.io/plans#service', name: 'Freenzy.io — Services IA', description: 'Actions IA au prix officiel fournisseur, 0% de commission.', provider: { '@type': 'Organization', name: 'Freenzy.io', url: 'https://freenzy.io' }, serviceType: 'Intelligence Artificielle', areaServed: { '@type': 'Country', name: 'France' }, hasOfferCatalog: { '@type': 'OfferCatalog', name: 'Actions IA', itemListElement: [{ '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Chat IA (Claude Haiku)' }, price: '0.005', priceCurrency: 'EUR', description: '0.5 credit/action' }, { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Email (Claude Sonnet)' }, price: '0.011', priceCurrency: 'EUR', description: '1.1 credits/action' }, { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Document (Claude Sonnet)' }, price: '0.035', priceCurrency: 'EUR', description: '3.5 credits/action' }, { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Appel repondeur (Twilio)' }, price: '0.05', priceCurrency: 'EUR', description: '5 credits/action' }, { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Image IA (DALL-E/Flux)' }, price: '0.07', priceCurrency: 'EUR', description: '7 credits/action' }, { '@type': 'Offer', itemOffered: { '@type': 'Service', name: 'Video 30s (Runway ML)' }, price: '0.40', priceCurrency: 'EUR', description: '40 credits/action' }] } }, { '@type': 'FAQPage', '@id': 'https://freenzy.io/plans#faq', mainEntity: [{ '@type': 'Question', name: "C'est vraiment gratuit ?", acceptedAnswer: { '@type': 'Answer', text: "Oui. Acces gratuit. Vous ne payez que les tokens IA consommes. 0% de commission pour tous, a vie." } }, { '@type': 'Question', name: 'Comment fonctionnent les frais ?', acceptedAnswer: { '@type': 'Answer', text: "0% de commission. Prix officiel fournisseur. Aucun abonnement." } }, { '@type': 'Question', name: 'Combien coute une action type ?', acceptedAnswer: { '@type': 'Answer', text: "Chat ~0.5 credit, email ~1.1, document ~3.5, appel ~5, image ~8. 1 credit = 0.01 EUR." } }, { '@type': 'Question', name: 'Quelle difference avec ChatGPT Plus ?', acceptedAnswer: { '@type': 'Answer', text: "ChatGPT Plus : 20 EUR/mois, 1 agent. Freenzy.io : gratuit + usage, 34 agents business, voix, video, telephonie." } }, { '@type': 'Question', name: 'La securite des donnees ?', acceptedAnswer: { '@type': 'Answer', text: "AES-256, RGPD, hebergement Europe. Isolation stricte par compte." } }, { '@type': 'Question', name: 'Une offre Entreprise ?', acceptedAnswer: { '@type': 'Answer', text: "Oui. White-Label SaaS, cles API, isolation donnees, SLA garanti." } }] }] };

export default function PlansPage() {
  const { audience, setAudience, config } = useAudience();

  // Section observer
  const heroRef = useRef<HTMLElement>(null);
  const faqRef = useRef<HTMLElement>(null);
  const ctaRef = useRef<HTMLElement>(null);
  const sectionRefs = useMemo(() => ({ hero: heroRef, faq: faqRef, cta: ctaRef }), []);
  useSectionObserver(sectionRefs);

  // Page view on mount
  useEffect(() => { trackPageView('/plans', 'plans', audience); }, [audience]);

  // Audience-aware CTA
  const ctaLabel = config?.cta.label || 'Acceder a Freenzy';
  const ctaHref = config?.cta.href || '/client/dashboard';

  // Credits breakdown — audience-specific or default
  const creditsItems = config?.tarifsExample.items || [
    { action: 'Chats', count: '~72' },
    { action: 'Emails', count: '~40' },
    { action: 'Documents', count: '~14' },
    { action: 'Réunions', count: '~6' },
    { action: 'Analyses', count: '~19' },
  ];
  const creditsLabel = config?.tarifsExample.details || 'Hors vidéo et avatars';

  return (
    <main aria-label="Tarifs et crédits IA Freenzy.io" style={{
      background: '#fff', color: '#1d1d1f',
      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Segoe UI", sans-serif',
    }}>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(plansJsonLd) }}
      />
      <PublicNav />
      <AudienceStickyBar audience={audience} onChange={setAudience} variant="dark" />

      {/* ── HERO ──────────────────────────────────────────────── */}
      <section ref={heroRef} aria-label="Présentation des tarifs Freenzy.io" style={{
        background: 'linear-gradient(160deg, #0f0720 0%, #150a30 55%, #0f0720 100%)',
        padding: 'clamp(90px, 11vw, 120px) 24px clamp(70px, 8vw, 96px)',
        paddingTop: 'clamp(142px, 14vw, 172px)',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '5%', left: '50%', transform: 'translateX(-50%)',
          width: 560, height: 320,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.1) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 640, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          {config?.hero.badge && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.25)',
              color: '#c4b5fd', padding: '5px 16px', borderRadius: 40,
              fontSize: 11, fontWeight: 700, marginBottom: 20, letterSpacing: 0.5,
            }}>
              {config.hero.badge}
            </div>
          )}
          <h1 style={{
            fontSize: 'clamp(34px, 6vw, 64px)', fontWeight: 700,
            fontFamily: 'var(--font-display)',
            color: '#fff', letterSpacing: -2.5, lineHeight: 1.02, marginBottom: 18,
          }}>
            {config ? (
              config.hero.headline
            ) : (
              <>
                <span className="fz-logo-word">Gratuit</span>.
                <br />
                <span style={{ color: 'rgba(255,255,255,0.38)' }}>
                  Payez ce que vous utilisez.
                </span>
              </>
            )}
          </h1>
          <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.45)', lineHeight: 1.7, maxWidth: 480, margin: '0 auto 10px' }}>
            {config ? config.hero.subheadline : `${totalAgents}+ agents IA. 0% de commission pour tous.`}
          </p>
          {!config && (
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.25)', marginBottom: 36 }}>
              Pas de minimum · Pas d&apos;abonnement · {DEFAULT_AGENTS.length} business · {PERSONAL_AGENTS.length} personnels · marketplace
            </p>
          )}
          {config?.bonusMessage && (
            <div style={{
              display: 'inline-flex', alignItems: 'center', gap: 6,
              background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.2)',
              color: '#4ade80', padding: '6px 18px', borderRadius: 40,
              fontSize: 12, fontWeight: 600, marginBottom: 28,
            }}>
              <span role="img" aria-label="cadeau">🎁</span>
              {config.bonusMessage}
            </div>
          )}
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap', marginTop: config ? 28 : 0 }}>
            <Link href={ctaHref} onClick={() => trackCtaClick('hero_cta', ctaHref, audience, '/plans')} style={{
              padding: '14px 32px', background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff',
              borderRadius: 12, fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: 15, textDecoration: 'none',
              boxShadow: '0 0 28px rgba(124,58,237,0.35)',
            }}>
              {ctaLabel}
            </Link>
            <a href="#faq" title="Voir les questions fréquentes sur les tarifs" style={{
              padding: '14px 22px',
              background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)',
              color: 'rgba(255,255,255,0.6)',
              borderRadius: 12, fontWeight: 600, fontSize: 14, textDecoration: 'none',
            }}>
              FAQ
            </a>
          </div>
        </div>
      </section>

      {/* sr-only SEO text */}
      <div className="sr-only" aria-hidden="false">
        <p>Freenzy.io propose un système de tarification à la consommation pour ses agents IA. Avec 0% de commission pour tous les utilisateurs et 50 crédits offerts à l&apos;inscription, la plateforme permet d&apos;accéder à plus de 100 agents IA spécialisés — commercial, juridique, RH, marketing, comptabilité — sans abonnement. Les crédits n&apos;expirent jamais. 1 crédit équivaut à environ 0.01 euro. Les modèles utilisés incluent Claude Haiku, Claude Sonnet et Claude Opus d&apos;Anthropic, ElevenLabs pour la synthèse vocale, Twilio pour la téléphonie et Runway ML pour la vidéo.</p>
      </div>

      {/* ── MAIN CONTENT ─────────────────────────────────────── */}
      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* VALUE PROPS */}
        <div style={{ ...sectionPad, borderBottom: '1px solid #f2f2f2' }}>
          <div className="lp-plans-value-props">
            {[
              { label: 'Claude & GPT-4', desc: 'Anthropic · OpenAI · Gemini · Meta' },
              { label: 'Voix naturelle', desc: 'ElevenLabs premium multilingual' },
              { label: 'Vidéo & Photo IA', desc: 'HeyGen · D-ID · Stable Diffusion' },
              { label: 'Zéro engagement', desc: '0% commission · pour tous · à vie' },
            ].map((p, i) => (
              <div key={p.label} className="lp-plans-value-prop-item" style={{
                padding: '28px 24px', textAlign: 'center',
              }}>
                <div style={{ width: 6, height: 6, background: '#7c3aed', borderRadius: '50%', margin: '0 auto 14px' }} />
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: '#1d1d1f', marginBottom: 5 }}>{p.label}</div>
                <div style={{ fontSize: 11, color: '#86868b', lineHeight: 1.5 }}>{p.desc}</div>
              </div>
            ))}
          </div>
        </div>

        {/* COMMENT CA MARCHE — dark card from tarifs-api */}
        <section aria-label="Comment fonctionne le système de crédits" style={sectionPad}>
          <div style={{ background: '#0f0720', borderRadius: 14, padding: '24px 28px', border: '1px solid rgba(255,255,255,0.08)' }}>
            <div style={{ fontSize: 12, fontWeight: 800, color: '#c4b5fd', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 14 }}>Comment ça marche</div>
            <div className="lp-plans-howto">
              {[
                { n: '1 crédit', sub: '≈ €0.01', desc: 'Unité de base' },
                { n: '0%', sub: 'de marge', desc: 'Prix officiel fournisseur' },
                { n: '∞', sub: 'validité', desc: 'Vos crédits n\'expirent jamais' },
              ].map((item, i) => (
                <div key={i} style={{ textAlign: 'center' }}>
                  <div style={{ fontSize: 24, fontFamily: 'var(--font-display)', fontWeight: 700, color: '#c4b5fd', letterSpacing: -1 }}>{item.n}</div>
                  <div style={{ fontSize: 13, fontWeight: 700, color: 'rgba(255,255,255,0.5)', marginTop: 2 }}>{item.sub}</div>
                  <div style={{ fontSize: 11, color: 'rgba(255,255,255,0.28)', marginTop: 4 }}>{item.desc}</div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* COMMISSION */}
        <section aria-label="0% de commission pour tous les utilisateurs" style={{ ...sectionPad, paddingTop: 0 }}>
          <div className="lp-plans-commission">
            <div>
              <p style={eyebrow}>Commission</p>
              <h2 style={sectionTitle}>0% pour tous.<br />À vie.</h2>
              <p style={{ ...sectionSubtitle, maxWidth: 380 }}>
                Aucune commission ajoutée sur vos actions. Vous payez uniquement le coût brut des tokens IA, au prix officiel du fournisseur.
              </p>
              <Link href={ctaHref} onClick={() => trackCtaClick('pricing_cta', ctaHref, audience, '/plans')} style={{
                display: 'inline-block', marginTop: 28,
                padding: '13px 28px', background: '#1a0e3a', color: '#fff',
                borderRadius: 10, fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: 14, textDecoration: 'none',
              }}>
                {ctaLabel}
              </Link>
            </div>
            <div className="lp-plans-commission-card" style={{ ...card, padding: '36px 32px' }}>
              <div style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: '#f0fdf4', border: '1px solid #bbf7d0',
                color: '#16a34a', padding: '4px 12px', borderRadius: 40,
                fontSize: 11, fontWeight: 700, marginBottom: 18, letterSpacing: 0.5,
              }}>
                Pour tous · à vie
              </div>
              <div className="lp-plans-zero-pct" style={{ fontSize: 'clamp(48px, 10vw, 64px)', fontWeight: 700, fontFamily: 'var(--font-display)', color: '#1d1d1f', letterSpacing: -4, lineHeight: 1, marginBottom: 6 }}>
                0%
              </div>
              <div style={{ fontSize: 14, color: '#86868b', marginBottom: 28, lineHeight: 1.5 }}>
                Prix officiel fournisseur · aucun frais ajouté
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                {[
                  '0% de commission sur toutes vos actions',
                  'Coût brut uniquement — zéro frais ajoutés',
                  'Valable pour tous les utilisateurs, pour toujours',
                  'Payez uniquement ce que vous consommez',
                ].map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 10, fontSize: 13, color: '#4b5563', alignItems: 'flex-start' }}>
                    <span style={{ color: '#22c55e', fontSize: 14, flexShrink: 0, marginTop: 1 }}>✅</span>
                    {item}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

      </div>

      {/* DEPOSITS — light bg */}
      <section aria-label="Packs de recharge de crédits" style={{ background: '#f5f5f7', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 48 }}>
            <p style={eyebrow}>Recharges</p>
            <h2 style={sectionTitle}>Déposez des euros, obtenez des crédits.</h2>
            <p style={{ ...sectionSubtitle, maxWidth: 420, margin: '10px auto 0', fontSize: 14 }}>
              Pas de minimum, pas d&apos;abonnement. 1 EUR = 100 crédits. Vos crédits n&apos;expirent jamais.
            </p>
          </div>
          <div className="lp-plans-deposits">
            {[
              { amount: 5, credits: 500, label: '', tier: 'basic', dailyK: 500, hourlyK: 150, outputMax: 4096, estReqs: 250 },
              { amount: 20, credits: 2000, label: 'Populaire', tier: 'standard', dailyK: 1000, hourlyK: 300, outputMax: 8192, estReqs: 500 },
              { amount: 50, credits: 5000, label: '', tier: 'premium', dailyK: 2000, hourlyK: 600, outputMax: 8192, estReqs: 1000 },
              { amount: 100, credits: 10000, label: 'Pro', tier: 'enterprise', dailyK: 5000, hourlyK: 1500, outputMax: 8192, estReqs: 2500 },
            ].map(opt => (
              <div key={opt.amount} style={{
                padding: '28px 20px', textAlign: 'center',
                borderRadius: 16, position: 'relative',
                background: opt.label === 'Populaire' ? '#1a0e3a' : '#fff',
                border: `1px solid ${opt.label === 'Populaire' ? '#1a0e3a' : '#e5e7eb'}`,
              }}>
                {opt.label && (
                  <div style={{
                    position: 'absolute', top: -11, left: '50%', transform: 'translateX(-50%)',
                    background: opt.label === 'Populaire' ? '#7c3aed' : '#1a0e3a',
                    color: '#fff', fontSize: 10, fontWeight: 700,
                    padding: '3px 12px', borderRadius: 40, whiteSpace: 'nowrap', letterSpacing: 0.5,
                  }}>
                    {opt.label}
                  </div>
                )}
                <div style={{
                  fontSize: 32, fontWeight: 700, fontFamily: 'var(--font-display)', letterSpacing: -1.5,
                  color: opt.label === 'Populaire' ? '#fff' : '#1d1d1f',
                  lineHeight: 1, marginBottom: 6,
                }}>
                  {opt.amount}€
                </div>
                <div style={{ fontSize: 13, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.45)' : '#86868b' }}>
                  {opt.credits.toLocaleString('fr-FR')} crédits
                </div>
                <div style={{
                  marginTop: 12, paddingTop: 12,
                  borderTop: `1px solid ${opt.label === 'Populaire' ? 'rgba(255,255,255,0.1)' : '#e5e7eb'}`,
                }}>
                  <p style={{ fontSize: 10, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.35)' : '#9ca3af', marginBottom: 4, fontWeight: 600 }}>
                    Tes limites avec ce pack :
                  </p>
                  <p style={{ fontSize: 11, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.6)' : '#4b5563', margin: '2px 0' }}>
                    {opt.dailyK >= 1000 ? `${opt.dailyK / 1000}M` : `${opt.dailyK}K`} tokens/jour
                  </p>
                  <p style={{ fontSize: 11, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.6)' : '#4b5563', margin: '2px 0' }}>
                    {opt.hourlyK >= 1000 ? `${opt.hourlyK / 1000}M` : `${opt.hourlyK}K`} tokens/heure
                  </p>
                  <p style={{ fontSize: 11, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.6)' : '#4b5563', margin: '2px 0' }}>
                    {opt.outputMax.toLocaleString('fr-FR')} tokens max/reponse
                  </p>
                  <p style={{ fontSize: 11, color: opt.label === 'Populaire' ? 'rgba(255,255,255,0.6)' : '#4b5563', margin: '2px 0' }}>
                    ~{opt.estReqs.toLocaleString('fr-FR')} requetes/jour
                  </p>
                </div>
              </div>
            ))}
          </div>
          <p style={{ textAlign: 'center', marginTop: 16, fontSize: 12, color: '#9ca3af' }}>
            Montant libre également disponible depuis votre tableau de bord.
          </p>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* CREDITS BREAKDOWN — audience-adapted */}
        <section aria-label="Exemples concrets d'utilisation des crédits" style={sectionPad}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Ce que vous pouvez faire</p>
            <h2 style={sectionTitle}>Des actions concrètes, au centime près.</h2>
            <p style={{ ...sectionSubtitle, fontSize: 13 }}>Avec 50 crédits (5€) · {creditsLabel}</p>
          </div>
          <div className="lp-plans-credits">
            {creditsItems.map(ex => (
              <div key={ex.action} style={{ padding: '24px 16px', textAlign: 'center', ...card }}>
                <div style={{ fontSize: 28, fontWeight: 700, fontFamily: 'var(--font-display)', color: '#1d1d1f', letterSpacing: -1.5, lineHeight: 1 }}>
                  {ex.count}
                </div>
                <div style={{ fontSize: 12, color: '#86868b', marginTop: 6, fontWeight: 600 }}>{ex.action}</div>
              </div>
            ))}
          </div>
        </section>

        {/* ACTION COSTS TABLE — from tarifs-api */}
        <section aria-label="Tableau des tarifs détaillés par action IA" style={{ ...sectionPad, paddingTop: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Tarifs détaillés</p>
            <h2 style={sectionTitle}>Prix par action, transparent.</h2>
            <p style={sectionSubtitle}>Toutes les actions disponibles dès l&apos;inscription</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div className="lp-table-scroll">
              <table style={{ width: '100%', minWidth: 540, borderCollapse: 'collapse', fontSize: 13 }}>
                <caption className="sr-only">Tarifs détaillés par action IA — coût en crédits et équivalent avec un pack de 50 crédits (5 euros)</caption>
                <thead>
                  <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e5e7eb' }}>
                    <th scope="col" style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#1d1d1f' }}>Action</th>
                    <th scope="col" style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#1d1d1f' }}>Modèle</th>
                    <th scope="col" style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1d1d1f' }}>Crédits/action</th>
                    <th scope="col" style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1d1d1f' }}>Avec 50 cr (5€)</th>
                  </tr>
                </thead>
                <tbody>
                  {ACTION_COSTS.map((item, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ ...cell }}>
                        <span style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                          <span role="img" aria-label={item.action} style={{ fontSize: 18 }}>{item.icon}</span>
                          <span style={{ color: '#1d1d1f' }}>{item.action}</span>
                        </span>
                      </td>
                      <td style={{ ...cell, color: '#6b7280' }}>{item.model}</td>
                      <td style={{ ...cell, textAlign: 'right', fontWeight: 700, color: item.color }}>{item.credits}</td>
                      <td style={{ ...cell, textAlign: 'right', fontWeight: 800, color: item.color }}>{item.per50}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </section>

        {/* MODEL PRICES TABLE — from tarifs-api */}
        <section aria-label="Prix officiels des fournisseurs IA" style={{ ...sectionPad, paddingTop: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Prix officiels fournisseurs</p>
            <h2 style={sectionTitle}>0% de marge. 0% de commission.</h2>
            <p style={sectionSubtitle}>Freenzy applique exactement ces tarifs, sans marge, sans commission.</p>
          </div>
          <div style={{ background: '#fff', borderRadius: 14, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
            <div className="lp-table-scroll">
              <table style={{ width: '100%', minWidth: 540, borderCollapse: 'collapse', fontSize: 13 }}>
                <caption className="sr-only">Prix officiels des modèles IA utilisés par Freenzy.io — tarifs input et output par fournisseur</caption>
                <thead>
                  <tr style={{ background: '#f9f9f9', borderBottom: '1px solid #e5e7eb' }}>
                    <th scope="col" style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#1d1d1f' }}>Modèle</th>
                    <th scope="col" style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1d1d1f' }}>Prix input</th>
                    <th scope="col" style={{ ...cell, textAlign: 'right', fontWeight: 700, color: '#1d1d1f' }}>Prix output</th>
                    <th scope="col" style={{ ...cell, textAlign: 'left', fontWeight: 700, color: '#1d1d1f' }}>Usage type</th>
                  </tr>
                </thead>
                <tbody>
                  {MODEL_PRICES.map((m, i) => (
                    <tr key={i} style={{ background: i % 2 === 0 ? '#fff' : '#fafafa' }}>
                      <td style={{ ...cell }}>
                        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                          <span style={{ width: 8, height: 8, borderRadius: '50%', background: m.color, flexShrink: 0, display: 'inline-block' }} />
                          <span style={{ fontWeight: 700, color: '#1d1d1f' }}>{m.model}</span>
                        </span>
                      </td>
                      <td style={{ ...cell, textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{m.input}</td>
                      <td style={{ ...cell, textAlign: 'right', fontFamily: 'monospace', color: '#374151' }}>{m.output}</td>
                      <td style={{ ...cell, color: '#6b7280', fontSize: 12 }}>{m.usage}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0' }}>
              <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>
                * Prix Anthropic, ElevenLabs, Twilio, Runway publiés sur leurs sites respectifs. Mis à jour automatiquement.
              </p>
            </div>
          </div>
        </section>

        {/* AGENTS */}
        <section aria-label="Liste des agents IA business inclus" style={{ ...sectionPad, paddingTop: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Votre équipe</p>
            <h2 style={sectionTitle}>{DEFAULT_AGENTS.length} <span className="fz-logo-word">agents</span> business. Tous inclus.</h2>
            <p style={sectionSubtitle}>Activez ceux dont vous avez besoin. En un clic.</p>
          </div>
          <div className="lp-plans-agents-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 8 }}>
            {DEFAULT_AGENTS.map(agent => (
              <div key={agent.id} style={{
                ...card,
                padding: '14px 16px',
                display: 'flex', alignItems: 'center', gap: 12,
              }}>
                <span role="img" aria-label={agent.role} style={{ fontSize: 20, flexShrink: 0 }}>{agent.emoji || '🤖'}</span>
                <div>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#1d1d1f' }}>{agent.role}</div>
                  <div style={{ fontSize: 11, color: '#9ca3af' }}>{agent.priceCredits} cr/action</div>
                </div>
              </div>
            ))}
          </div>
        </section>

      </div>

      {/* TELEPHONY — light bg */}
      <section aria-label="Coûts de téléphonie Twilio" style={{ background: '#f5f5f7', padding: 'clamp(64px, 8vw, 96px) 24px' }}>
        <div style={{ maxWidth: 960, margin: '0 auto' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Coûts détaillés</p>
            <h2 style={sectionTitle}>Téléphonie Twilio</h2>
          </div>
          <div className="lp-plans-costs">
            <div style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 16, overflow: 'hidden', maxWidth: 560, margin: '0 auto' }}>
              {[
                ['Appels entrants (France)', '~0.01€/min'],
                ['Appels sortants (France)', '~0.014€/min'],
                ['SMS sortants (France)', '~0.065€/SMS'],
                ['Numéro local', '~1–2€/mois'],
                ['WhatsApp', 'Inclus'],
              ].map(([service, cost], i, arr) => (
                <div key={String(service)} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '13px 20px',
                  borderBottom: i < arr.length - 1 ? '1px solid #f8f8f8' : 'none',
                }}>
                  <span style={{ fontSize: 13, color: '#4b5563' }}>{service}</span>
                  <span style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f' }}>{cost}</span>
                </div>
              ))}
              <div style={{ padding: '12px 20px', borderTop: '1px solid #f2f2f2' }}>
                <p style={{ fontSize: 11, color: '#9ca3af', margin: 0 }}>Facturés séparément du solde crédits.</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ maxWidth: 960, margin: '0 auto', padding: '0 24px' }}>

        {/* COMPARISON */}
        <section aria-label="Comparaison Freenzy.io vs ChatGPT Plus vs assistant humain" style={sectionPad}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Comparaison</p>
            <h2 style={sectionTitle}>Pourquoi Freenzy.io ?</h2>
            <p style={{ ...sectionSubtitle, marginTop: 8 }}>
              <Link href="/vs-alternatives" title="Voir la comparaison complète Freenzy.io vs alternatives" style={{ color: '#7c3aed', textDecoration: 'underline', fontSize: 13 }}>
                Voir la comparaison détaillée complète
              </Link>
            </p>
          </div>
          <div className="lp-table-scroll" style={{ border: '1px solid #e5e7eb', background: '#fff', borderRadius: 14 }}>
            <table style={{ width: '100%', minWidth: 540, borderCollapse: 'collapse', fontSize: 13 }}>
              <caption className="sr-only">Comparaison entre Freenzy.io, ChatGPT Plus et un assistant humain — prix, agents, téléphonie, disponibilité</caption>
              <thead>
                <tr style={{ background: '#f5f5f7' }}>
                  {['Critère', 'Freenzy.io', 'ChatGPT Plus', 'Assistant humain'].map((h, i) => (
                    <th scope="col" key={h} style={{
                      padding: '14px 20px', textAlign: i === 0 ? 'left' : 'center',
                      fontSize: 12, fontWeight: 700,
                      color: i === 1 ? '#7c3aed' : '#86868b',
                      borderBottom: '1px solid #e5e7eb',
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[
                  ['Prix mensuel', 'Gratuit + 0%', '20€/mois', '500–2 000€/mois'],
                  ['Agents IA', `${DEFAULT_AGENTS.length} spécialisés`, '1 généraliste', '1 personne'],
                  ['Téléphonie', <>✅ Incluse</>, <>✕</>, <>✅</>],
                  ['Disponibilité', '24h/7j/365j', '24h/7j', 'Horaires bureau'],
                  ['Personnalisation', 'Totale', 'Limitée', 'Totale'],
                  ['Engagement', 'Aucun', 'Mensuel', 'Contrat'],
                ].map(([label, freenzy, chatgpt, classic], i, arr) => (
                  <tr key={String(label)}>
                    <td style={{ padding: '13px 20px', fontWeight: 600, color: '#1d1d1f', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f2' : 'none' }}>{label}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'center', fontWeight: 700, color: '#06b6d4', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f2' : 'none' }}>{freenzy}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'center', color: '#9ca3af', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f2' : 'none' }}>{chatgpt}</td>
                    <td style={{ padding: '13px 20px', textAlign: 'center', color: '#9ca3af', borderBottom: i < arr.length - 1 ? '1px solid #f2f2f2' : 'none' }}>{classic}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* ECOSYSTEM */}
        <section aria-label="Écosystème et fonctionnalités incluses" style={{ ...sectionPad, paddingTop: 0 }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>Écosystème</p>
            <h2 style={sectionTitle}>Tout est inclus.</h2>
          </div>
          <div className="lp-plans-ecosystem-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(195px, 1fr))', gap: 10 }}>
            {[
              { title: 'Répondeur IA', desc: 'Twilio — répond 24/7', available: true },
              { title: 'Réveil intelligent', desc: 'Briefing matinal IA', available: true },
              { title: 'Studio vidéo', desc: 'HeyGen + D-ID', available: true },
              { title: 'Photo IA', desc: 'Nano Banana', available: true },
              { title: 'Voix Premium', desc: 'ElevenLabs multilingual', available: true },
              { title: 'WhatsApp', desc: 'Agents sur WhatsApp', available: true },
              { title: 'Visio agents', desc: "Face-à-face avec l'IA", available: true },
              { title: 'Création sur mesure', desc: 'Sites, apps, CRM', available: true },
              { title: 'Intégrations', desc: 'Slack, Notion, CRM...', available: false },
            ].map(item => (
              <div key={item.title} style={{
                padding: '18px 16px',
                background: '#fff',
                border: '1px solid #e5e7eb',
                borderRadius: 14, position: 'relative',
                opacity: item.available ? 1 : 0.55,
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 5 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'var(--font-display)', color: '#1d1d1f' }}>{item.title}</div>
                  <span style={{
                    fontSize: 9, fontWeight: 700,
                    padding: '2px 7px', borderRadius: 20,
                    background: item.available ? '#f0fdf4' : '#f5f5f7',
                    color: item.available ? '#22c55e' : '#9ca3af',
                    border: `1px solid ${item.available ? '#bbf7d0' : '#e5e7eb'}`,
                    flexShrink: 0, marginLeft: 8,
                  }}>
                    {item.available ? 'Dispo' : 'Bientôt'}
                  </span>
                </div>
                <div style={{ fontSize: 11, color: '#9ca3af' }}>{item.desc}</div>
              </div>
            ))}
          </div>
        </section>

        {/* FAQ */}
        <section ref={faqRef} id="faq" aria-label="Questions fréquentes sur les tarifs" style={{ ...sectionPad, paddingTop: 0, maxWidth: 680, margin: '0 auto clamp(64px, 8vw, 96px)' }}>
          <div style={{ textAlign: 'center', marginBottom: 40 }}>
            <p style={eyebrow}>FAQ</p>
            <h2 style={sectionTitle}>Questions fréquentes</h2>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {[
              {
                q: "C'est vraiment gratuit ?",
                a: "Oui. L'accès à la plateforme et à tous les agents est gratuit. Vous ne payez que les tokens IA réellement consommés, à prix coûtant. 0% de commission pour tous, à vie. Sans carte bancaire pour vous inscrire.",
              },
              {
                q: 'Comment fonctionnent les frais ?',
                a: "0% de commission pour tous les utilisateurs, à vie. Vous payez uniquement le coût brut des tokens IA au prix officiel du fournisseur (Anthropic, OpenAI, etc.). Aucun frais ajouté, aucun abonnement.",
              },
              {
                q: 'Combien coûte une action type ?',
                a: "Un chat IA coûte ~0.5 crédit, un email ~1.1 cr, un document ~3.5 cr, un appel répondeur ~5 cr, une image ~8 cr. 1 crédit ≈ €0.01. Rechargez au montant de votre choix.",
              },
              {
                q: 'Quelle différence avec ChatGPT Plus ?',
                a: `ChatGPT Plus : 20€/mois, 1 agent généraliste. Freenzy.io : gratuit + usage, ${DEFAULT_AGENTS.length} agents business spécialisés + ${PERSONAL_AGENTS.length} agents personnels, voix ElevenLabs, vidéo IA, photo IA, téléphonie Twilio.`,
              },
              {
                q: 'Comment fonctionne le calcul des tokens ?',
                a: "Chaque action consomme des tokens IA (input + output). Le coût est calculé au prix officiel du fournisseur (ex: Claude Haiku $0.80/M input, $4/M output). Nous facturons au centime près, sans marge ni commission. 1 crédit ≈ €0.01.",
              },
              {
                q: 'La sécurité des données ?',
                a: "Chiffrement AES-256, conformité RGPD, hébergement Europe. Isolation stricte des données par compte. Claude (Anthropic) ne s'entraîne pas sur vos données.",
              },
              {
                q: 'Une offre Entreprise ?',
                a: 'Oui. White-Label SaaS : votre domaine, vos clés API, isolation complète des données, SLA garanti, support dédié. Disponible sur devis.',
              },
            ].map((faq, i) => (
              <details key={i} style={{ borderRadius: 12, border: '1px solid #e5e7eb', overflow: 'hidden' }}>
                <summary style={{
                  padding: '16px 20px',
                  fontSize: 14, fontWeight: 600, fontFamily: 'var(--font-display)', color: '#1d1d1f',
                  cursor: 'pointer', listStyle: 'none',
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  background: '#fff', userSelect: 'none',
                }}>
                  {faq.q}
                  <span style={{ fontSize: 16, color: '#9ca3af', fontWeight: 400, flexShrink: 0, marginLeft: 12 }}>+</span>
                </summary>
                <div style={{
                  padding: '14px 20px 18px',
                  fontSize: 14, color: '#4b5563', lineHeight: 1.7,
                  background: '#fafafa', borderTop: '1px solid #f2f2f2',
                }}>
                  {faq.a}
                </div>
              </details>
            ))}
          </div>
        </section>

      </div>

      {/* ENTERPRISE — conditional */}
      {(!audience || audience === 'entreprise') && (
        <EnterpriseSection />
      )}

      {/* FINAL CTA */}
      <section ref={ctaRef} aria-label="Inscription gratuite avec 50 crédits offerts" style={{
        background: 'linear-gradient(165deg, #0f0720 0%, #1a0e3a 100%)',
        padding: 'clamp(70px, 9vw, 110px) 24px',
        textAlign: 'center', position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', bottom: 0, left: '50%', transform: 'translateX(-50%)',
          width: 560, height: 280,
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.08) 0%, transparent 70%)',
          pointerEvents: 'none',
        }} />
        <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
          <h2 style={{
            fontSize: 'clamp(28px, 5vw, 52px)',
            fontWeight: 700, fontFamily: 'var(--font-display)', color: '#fff',
            letterSpacing: -2, lineHeight: 1.08, marginBottom: 14,
          }}>
            Prêt à commencer ?
          </h2>
          <p style={{ color: 'rgba(255,255,255,0.38)', fontSize: 15, marginBottom: 38 }}>
            {totalAgents}+ agents <span className="fz-logo-word">IA</span>. Toutes les IA du marché. 0% de commission.
          </p>
          <Link href={ctaHref} onClick={() => trackCtaClick('final_cta', ctaHref, audience, '/plans')} style={{
            display: 'inline-block',
            padding: '15px 40px',
            background: 'linear-gradient(135deg, #7c3aed, #06b6d4)', color: '#fff',
            borderRadius: 12, fontWeight: 600, fontFamily: 'var(--font-display)', fontSize: 16,
            textDecoration: 'none',
            boxShadow: '0 0 36px rgba(124,58,237,0.3)',
          }}>
            {ctaLabel}
          </Link>
        </div>
      </section>

      {/* Internal links SEO */}
      <nav aria-label="Pages associées aux tarifs" style={{ maxWidth: 960, margin: '0 auto', padding: '32px 24px 48px', borderTop: '1px solid #f2f2f2' }}>
        <div className="sr-only"><h2>Liens utiles</h2></div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 16, justifyContent: 'center' }}>
          <Link href="/vs-alternatives" title="Comparer Freenzy.io avec ChatGPT Plus, Make, Zapier et les agences" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Freenzy vs Alternatives
          </Link>
          <Link href="/claude" title="Découvrir la technologie Claude AI d'Anthropic utilisée par Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Technologie Claude AI
          </Link>
          <Link href="/whatsapp" title="Gérer votre entreprise par WhatsApp avec les agents IA Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Agents IA sur WhatsApp
          </Link>
          <Link href="/demo" title="Voir la démonstration de la plateforme Freenzy.io" style={{ fontSize: 13, color: '#7c3aed', textDecoration: 'none' }}>
            Démonstration
          </Link>
        </div>
      </nav>

      <PublicFooter />

      {/* Responsive CSS moved to globals.css */}
    </main>
  );
}
