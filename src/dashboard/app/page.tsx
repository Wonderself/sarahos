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

const totalAgents = TOTAL_AGENTS_DISPLAY;

// ─── Modèles IA
const AI_MODELS = [
  { name: 'Claude · Anthropic', sub: 'Haiku · Sonnet · Opus 4 · Extended Thinking', icon: 'auto_awesome', color: '#D97706' },
  { name: 'GPT · OpenAI', sub: 'GPT-4o · o3 · GPT-4.5', icon: 'smart_toy', color: '#10a37f' },
  { name: 'Gemini · Google', sub: 'Flash · Pro · Ultra', icon: 'diamond', color: '#4285f4' },
  { name: 'Llama · Meta', sub: 'Llama 4 · open source', icon: 'smart_toy', color: '#0668E1' },
  { name: 'Grok · xAI', sub: 'Grok 3 · raisonnement temps réel', icon: 'bolt', color: '#6b7280' },
  { name: 'Mistral · Cohere', sub: 'IA europeenne · et tous les prochains', icon: 'waves', color: '#f97316' },
];

// ─── Écosystème
const ECOSYSTEM = [
  { name: 'ElevenLabs', sub: 'Voix naturelle · TTS premium', icon: 'mic' },
  { name: 'Twilio', sub: 'Appels entrants · SMS · WhatsApp', icon: 'call' },
  { name: 'pgvector', sub: 'Memoire longue duree · RAG', icon: 'psychology' },
  { name: 'WhatsApp Business', sub: 'Messages IA entrants & sortants', icon: 'chat' },
  { name: 'Runway ML', sub: 'Generation video IA', icon: 'movie' },
  { name: 'DALL-E · Flux', sub: 'Generation image IA', icon: 'image' },
  { name: 'Redis', sub: 'Cache · sessions temps reel', icon: 'bolt' },
  { name: 'Stripe', sub: 'Paiement · facturation securisee', icon: 'credit_card' },
];

// ─── Agents
const ALL_AGENTS = [
  { icon: 'call', name: 'Répondeur 24/7', cat: 'Business' },
  { icon: 'handshake', name: 'Assistante', cat: 'Business' },
  { icon: 'rocket_launch', name: 'Commercial', cat: 'Business' },
  { icon: 'campaign', name: 'Marketing', cat: 'Business' },
  { icon: 'group', name: 'RH', cat: 'Business' },
  { icon: 'campaign', name: 'Communication', cat: 'Business' },
  { icon: 'savings', name: 'Finance', cat: 'Business' },
  { icon: 'code', name: 'Dev', cat: 'Business' },
  { icon: 'gavel', name: 'Juridique', cat: 'Business' },
  { icon: 'target', name: 'Direction Générale', cat: 'Business' },
  { icon: 'movie', name: 'Vidéo', cat: 'Business' },
  { icon: 'photo_camera', name: 'Photo / Visuel', cat: 'Business' },
  { icon: 'credit_card', name: 'Budget perso', cat: 'Perso' },
  { icon: 'handshake', name: 'Négociateur', cat: 'Perso' },
  { icon: 'bar_chart', name: 'Impôts', cat: 'Perso' },
  { icon: 'receipt_long', name: 'Comptable', cat: 'Perso' },
  { icon: 'home', name: 'Chasseur immo', cat: 'Perso' },
  { icon: 'trending_up', name: 'Portfolio', cat: 'Perso' },
  { icon: 'description', name: 'CV & carrière', cat: 'Perso' },
  { icon: 'chat', name: 'Contradicteur', cat: 'Perso' },
  { icon: 'edit', name: 'Écrivain', cat: 'Perso' },
  { icon: 'movie', name: 'Cinéaste', cat: 'Perso' },
  { icon: 'self_improvement', name: 'Coach', cat: 'Perso' },
  { icon: 'landscape', name: 'Déconnexion', cat: 'Perso' },
];

// ─── Actions avec crédits
const ACTION_COSTS = [
  { icon: 'chat', action: 'Chat avec agent IA', model: 'Haiku', count: '100 chats', color: '#22c55e' },
  { icon: 'mail', action: 'Email professionnel', model: 'Sonnet', count: '45 emails', color: '#5b6cf7' },
  { icon: 'phone_iphone', action: 'Post réseaux sociaux', model: 'Haiku', count: '62 posts', color: '#3b82f6' },
  { icon: 'description', action: 'Document complet', model: 'Sonnet', count: '14 docs', color: '#5b6cf7' },
  { icon: 'call', action: 'Appel répondeur IA', model: 'Twilio + Haiku', count: '10 appels', color: '#f97316' },
  { icon: 'call_made', action: 'Appel sortant IA', model: 'Twilio + Sonnet', count: '3 appels', color: '#f97316' },
  { icon: 'chat', action: 'WhatsApp Business IA', model: 'Haiku', count: '125 msgs', color: '#22c55e' },
  { icon: 'record_voice_over', action: 'Message vocal TTS', model: 'ElevenLabs', count: '11 msgs', color: '#f59e0b' },
  { icon: 'image', action: 'Image IA créée', model: 'DALL-E · Flux', count: '7 images', color: '#9333ea' },
  { icon: 'movie', action: 'Clip vidéo 30s', model: 'Runway ML', count: '1 clip', color: '#ec4899' },
  { icon: 'handshake', action: 'Réunion IA structurée', model: 'Opus', count: '6 réunions', color: '#9333ea' },
];

// ─── Stats badges (reverse ticker)
const STATS_BADGES = [
  { icon: 'smart_toy', value: '82+', label: 'agents' },
  { icon: 'psychology', value: '6+', label: 'modeles IA' },
  { icon: 'bolt', value: '5 min', label: 'onboarding' },
  { icon: 'diamond', value: '0%', label: 'commission' },
  { icon: 'dark_mode', value: '24/7', label: 'actifs' },
  { icon: 'language', value: '50+', label: 'langues' },
  { icon: 'quiz', value: '103', label: 'FAQ' },
  { icon: 'shopping_cart', value: '48', label: 'templates' },
  { icon: 'business_center', value: '22', label: 'agents Business' },
  { icon: 'person', value: '12', label: 'agents Perso' },
  { icon: 'verified_user', value: 'RGPD', label: 'conforme' },
  { icon: 'lock', value: 'AES-256', label: 'chiffrement' },
  { icon: 'phone_iphone', value: '8', label: 'modes Reveil' },
  { icon: 'target', value: '50', label: 'credits offerts' },
];

// ─── Live activity feed
const ACTIVITY = [
  { icon: 'call', text: 'Appel traité · lead qualifié', agent: 'Répondeur', color: '#22c55e', ago: '2 min' },
  { icon: 'mail', text: 'Proposition commerciale envoyée', agent: 'Commercial', color: '#5b6cf7', ago: '4 min' },
  { icon: 'phone_iphone', text: '3 posts LinkedIn programmés', agent: 'Marketing', color: '#3b82f6', ago: '8 min' },
  { icon: 'bar_chart', text: 'Rapport mensuel généré', agent: 'Finance', color: '#f59e0b', ago: '13 min' },
  { icon: 'alarm', text: 'Briefing matinal envoyé', agent: 'Réveil IA', color: '#f97316', ago: '19 min' },
  { icon: 'image', text: 'Visuel créé · campagne Été 2026', agent: 'Photo/Visuel', color: '#9333ea', ago: '24 min' },
  { icon: 'description', text: 'NDA bilingue généré', agent: 'Juridique', color: '#5b6cf7', ago: '31 min' },
  { icon: 'chat', text: '12 messages WhatsApp traités', agent: 'Assistante', color: '#22c55e', ago: '39 min' },
  { icon: 'movie', text: 'Clip vidéo 30s créé', agent: 'Vidéo', color: '#ec4899', ago: '47 min' },
  { icon: 'handshake', text: 'Stratégie Q2 synthétisée', agent: 'DG', color: '#9333ea', ago: '1h' },
];

// ─── Interactive demo scenarios
const DEMO_SCENARIOS = [
  {
    tab: 'Répondeur',
    tabIcon: 'call',
    color: '#22c55e',
    prompt: "Antoine Bernard vient d'appeler. Demande de devis, budget estimé 4 800€.",
    lines: [
      { label: 'Statut', text: 'Appel traité · 2 min 14s' },
      { label: 'Lead', text: 'Qualifié · devis 4 800€' },
      { label: 'Action', text: 'RDV calendrier · demain 9h30' },
      { label: 'Notif.', text: 'Résumé envoyé par WhatsApp' },
    ],
    model: 'Haiku + Twilio · 5 crédits',
  },
  {
    tab: 'Email',
    tabIcon: 'mail',
    color: '#5b6cf7',
    prompt: 'Rédige une proposition pour Acme Corp — intégration SaaS, budget 12 000€.',
    lines: [
      { label: 'Objet', text: 'Proposition · Intégration SaaS · Acme Corp' },
      { label: 'Corps', text: '487 mots · ton pro · personnalisé' },
      { label: 'Annexes', text: 'Planning · CGV · Devis PDF' },
      { label: 'Envoi', text: 'Planifié lundi 8h30 · suivi auto' },
    ],
    model: 'Sonnet · 1.1 crédits',
  },
  {
    tab: 'Social',
    tabIcon: 'phone_iphone',
    color: '#3b82f6',
    prompt: 'Crée 3 posts LinkedIn pour notre lancement produit, ton expert + storytelling.',
    lines: [
      { label: 'Post 1', text: 'Hook storytelling · 280 mots · hashtags' },
      { label: 'Post 2', text: 'Stats-first · data produit · 190 mots' },
      { label: 'Post 3', text: 'Question engagement · 120 mots · CTA' },
      { label: 'Planif.', text: 'Lun · Mer · Ven 9h · LinkedIn + Twitter' },
    ],
    model: 'Haiku · 2.4 crédits',
  },
  {
    tab: 'Document',
    tabIcon: 'description',
    color: '#9333ea',
    prompt: 'Génère un NDA bilingue FR/EN pour un partenariat avec une startup US.',
    lines: [
      { label: 'Document', text: 'NDA bilingue · 4 pages · RGPD conforme' },
      { label: 'Clauses', text: '12 articles · durée 3 ans' },
      { label: 'Export', text: 'PDF signable + Word éditable' },
      { label: 'Révision', text: 'Validé par agent Juridique IA' },
    ],
    model: 'Sonnet · 3.5 crédits',
  },
];

// ─── Scenarios (from demo — detailed use-cases)
const SCENARIOS = [
  {
    title: 'Répondeur IA 24/7',
    desc: 'Un prospect appelle à 22h. L\'agent répond, qualifie le lead, envoie un résumé WhatsApp et planifie un RDV.',
    steps: ['Réception appel Twilio', 'Qualification lead par IA', 'Résumé WhatsApp + RDV calendrier'],
    tech: 'Twilio + Claude Haiku + WhatsApp',
    color: '#22c55e',
  },
  {
    title: 'Réveil Intelligent',
    desc: 'Chaque matin à 7h : météo, agenda, actualités sectorielles, KPIs et priorités du jour en audio.',
    steps: ['Collecte données multi-sources', 'Synthèse personnalisée IA', 'Livraison audio ElevenLabs'],
    tech: 'Claude Sonnet + ElevenLabs + Cron',
    color: '#f59e0b',
  },
  {
    title: 'Factory Documents',
    desc: 'Générez contrats, devis, NDA, CGV en langage naturel. Export PDF signable, archivage auto.',
    steps: ['Prompt en langage naturel', 'Génération structurée IA', 'Export PDF + archivage'],
    tech: 'Claude Sonnet · 3.5 crédits/doc',
    color: '#5b6cf7',
  },
  {
    title: 'Social Media Autopilot',
    desc: 'Créez et planifiez vos posts LinkedIn, Twitter, Instagram. Ton adapté, hashtags, calendrier éditorial.',
    steps: ['Brief créatif', 'Rédaction multi-formats IA', 'Planification + publication'],
    tech: 'Claude Haiku · 2.4 crédits/post',
    color: '#3b82f6',
  },
];

// ─── Technologies spotlight
const TECH_FEATURES = [
  {
    title: 'Claude AI · Anthropic',
    desc: 'Le cerveau de vos agents. Haiku pour la vitesse, Sonnet pour la précision, Opus avec Extended Thinking pour les décisions stratégiques.',
    points: ['3 niveaux de puissance', 'Extended Thinking (Opus)', 'Mémoire contextuelle longue'],
    color: '#D97706',
  },
  {
    title: 'ElevenLabs · Voix Premium',
    desc: 'Voix naturelle multilingue pour le réveil intelligent, les messages vocaux et les appels sortants.',
    points: ['Multilingual v2', 'Voix personnalisable', '11 langues'],
    color: '#8B5CF6',
  },
  {
    title: 'Twilio · Téléphonie',
    desc: 'Appels entrants, sortants, SMS et WhatsApp Business. Votre agent répond 24/7, qualifie et transmet.',
    points: ['Appels entrants/sortants', 'SMS + WhatsApp', 'Numéro local dédié'],
    color: '#f97316',
  },
  {
    title: 'Studio Créatif · IA',
    desc: 'Générez photos, visuels, clips vidéo et avatars parlants. Intégré directement dans votre dashboard.',
    points: ['Photo IA (Flux/DALL-E)', 'Vidéo IA (Runway/D-ID)', 'Avatars parlants'],
    color: '#ec4899',
  },
];

// ─── WhatsApp messages mockup
const WA_MESSAGES = [
  { from: 'agent', text: 'Résumé de la journée :\n· 3 appels traités\n· 2 leads qualifiés\n· 1 devis envoyé', time: '18:32' },
  { from: 'user', text: 'Envoie le devis à contact@acme.fr', time: '18:33' },
  { from: 'agent', text: 'Devis envoyé à contact@acme.fr · suivi planifié J+3', time: '18:33' },
];

// ─── Outils utilisateurs (par catégorie)
const TOOL_CATEGORIES = [
  { id: 'comm', label: 'Communication', icon: 'call', tools: [
    { icon: 'call', name: 'Repondeur intelligent 24/7', desc: 'Repond a vos appels, qualifie les leads, prend les RDV automatiquement.' },
    { icon: 'chat', name: 'WhatsApp Business IA', desc: 'Messages entrants et sortants, notifications, pilotage par WhatsApp.' },
    { icon: 'phone_forwarded', name: 'Appels sortants IA', desc: 'Prospection, relances et confirmations par telephone avec voix naturelle.' },
    { icon: 'mail', name: 'Email IA professionnel', desc: 'Redaction, envoi et suivi automatique de vos emails business.' },
  ]},
  { id: 'prod', label: 'Productivite', icon: 'bolt', tools: [
    { icon: 'alarm', name: 'Reveil intelligent & Brief', desc: 'Briefing personnalise chaque matin : agenda, priorites, meteo, actus.' },
    { icon: 'target', name: 'Plan d\'action quotidien', desc: 'Objectifs structures, taches priorisees, suivi de progression en temps reel.' },
    { icon: 'description', name: 'Documents & contrats IA', desc: 'Generation de devis, contrats, NDA, rapports en quelques secondes.' },
    { icon: 'handshake', name: 'Reunions structurees IA', desc: 'Ordre du jour, compte-rendu, decisions et actions — tout automatise.' },
  ]},
  { id: 'create', label: 'Creation', icon: 'palette', tools: [
    { icon: 'photo_camera', name: 'Studio Photo IA', desc: 'Creez des visuels pro, logos, bannières avec DALL-E et Flux.' },
    { icon: 'movie', name: 'Studio Video IA', desc: 'Clips video 30s, talking heads, animations pour vos reseaux.' },
    { icon: 'phone_iphone', name: 'Reseaux sociaux IA', desc: 'Posts LinkedIn, Twitter, Instagram generes et planifies automatiquement.' },
    { icon: 'campaign', name: 'Campagnes marketing IA', desc: 'Strategies, contenus et calendrier editorial generes par IA.' },
  ]},
  { id: 'gestion', label: 'Gestion', icon: 'bar_chart', tools: [
    { icon: 'savings', name: 'Comptabilite & finances', desc: 'Suivi tresorerie, factures, depenses et rapports financiers IA.' },
    { icon: 'group', name: 'Suivi clients & CRM', desc: 'Pipeline commercial, relances automatiques, historique client complet.' },
    { icon: 'gavel', name: 'Veille juridique IA', desc: 'Alertes reglementaires, analyse de contrats, conformite automatisee.' },
    { icon: 'person', name: 'RH & recrutement IA', desc: 'Tri de CV, entretiens structures, onboarding automatise.' },
  ]},
  { id: 'perso', label: 'Personnel', icon: 'self_improvement', tools: [
    { icon: 'credit_card', name: 'Budget & depenses perso', desc: 'Suivi de vos finances personnelles, alertes et conseils d\'economie.' },
    { icon: 'home', name: 'Chasseur immobilier IA', desc: 'Veille immobiliere, alertes, analyse de marche et negociation.' },
    { icon: 'description', name: 'CV & carriere IA', desc: 'CV optimise, lettres de motivation, preparation d\'entretiens.' },
    { icon: 'self_improvement', name: 'Coach bien-etre IA', desc: 'Conseils sante, meditation, deconnexion et equilibre vie pro/perso.' },
  ]},
];


// ═══════════════════════════════════════════════════════════
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

  // Audience-aware agents list
  const displayAgents = config ? config.agents : ALL_AGENTS;
  // Audience-aware hero
  const heroHeadline = config?.hero.headline;
  const heroSub = config?.hero.subheadline;
  const heroBadge = config?.hero.badge;
  const heroCta = config?.cta;

  return (
    <>
      <PublicNav />
      <AudienceStickyBar audience={audience} onChange={setAudience} variant="dark" />
      <main style={{ paddingTop: 108 }}>

        {/* ══ HERO (condensé pour 14") ═══════════════════════════ */}
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
              color: 'rgba(255,255,255,0.44)',
              lineHeight: 1.6, maxWidth: 480, margin: '0 auto 24px',
            }}>
              {heroSub ? (
                <span style={{ color: 'rgba(255,255,255,0.62)' }}>{heroSub}</span>
              ) : (
                <><span style={{ color: '#a5b4fc', fontWeight: 700 }}>82 agents</span> pour s&apos;occuper de vous : <span style={{ color: 'rgba(255,255,255,0.62)' }}>téléphonie, réveil, réseaux sociaux, documents, réflexions, WhatsApp, modules sur mesure…</span></>
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
                color: 'rgba(255,255,255,0.68)', borderRadius: 10, fontWeight: 600,
                fontSize: 'clamp(11px, 3vw, 14px)', textDecoration: 'none',
              }}>
                Voir les tarifs
              </Link>
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
                  <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 10 }}>· {item.ago}</span>
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

        {/* ══ OUTILS UTILISATEURS ═════════════════════════════════ */}
        <section style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#5b6cf7', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Outils</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 6 }}>
                Vos <span className="fz-accent-word">outils</span>, prêts à l&apos;emploi.
              </h2>
              <p style={{ color: '#86868b', fontSize: 14 }}>Tout ce dont vous avez besoin, activé en <span className="fz-accent-word">un clic</span>.</p>
            </div>

            <div style={{ display: 'flex', gap: 6, marginBottom: 20, overflowX: 'auto', paddingBottom: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              {TOOL_CATEGORIES.map((cat, i) => (
                <button
                  key={cat.id}
                  onClick={() => setToolTab(i)}
                  style={{
                    padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44,
                    background: toolTab === i ? '#5b6cf7' : '#f0f0f0',
                    color: toolTab === i ? '#fff' : '#6b7280',
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
                <button
                  key={i}
                  className="lp-demo-tab"
                  onClick={() => setDemoTab(i)}
                  style={{
                    padding: '10px 16px', borderRadius: 8, fontSize: 13, fontWeight: 700,
                    border: 'none', cursor: 'pointer', whiteSpace: 'nowrap', minHeight: 44,
                    background: demoTab === i ? s.color : 'rgba(255,255,255,0.06)',
                    color: demoTab === i ? '#fff' : 'rgba(255,255,255,0.45)',
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
                <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.22)', marginLeft: 6 }}>
                  Flashboard · Agent {demo.tab}
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                  }}><span className="material-symbols-rounded" style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>person</span></div>
                  <div style={{
                    background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.07)',
                    borderRadius: '0 12px 12px 12px', padding: '9px 13px',
                    fontSize: 13, color: 'rgba(255,255,255,0.7)', lineHeight: 1.55, maxWidth: 520,
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
                          <span style={{ fontSize: 10, fontWeight: 700, color: 'rgba(255,255,255,0.22)', textTransform: 'uppercase', letterSpacing: 0.4, flexShrink: 0, minWidth: 58 }}>
                            {line.label}
                          </span>
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

        {/* ══ COMMENT ÇA MARCHE — scenarios + technologies ═════════ */}
        <section style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontFamily: 'var(--font-display)', fontSize: 11, fontWeight: 600, color: '#5b6cf7', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Comment ca marche</p>
              <h2 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 700, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 6 }}>
                <span className="fz-accent-word">Concret</span>. <span className="fz-accent-word">Automatisé</span>. <span className="fz-accent-word">Instantané</span>.
              </h2>
              <p style={{ color: '#86868b', fontSize: 14 }}>Vos agents traitent tout, <span className="fz-accent-word">24h/24</span>. Voici ce que ça donne.</p>
            </div>

            {/* Scenarios concrets */}
            <div className="lp-scenario-steps" style={{ gap: 16, marginBottom: 40 }}>
              {SCENARIOS.map((s, i) => (
                <div key={i} className="lp-app-card">
                  <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, marginBottom: 14 }} />
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#1d1d1f', marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 16 }}>{s.desc}</p>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                    {s.steps.map((step, j) => (
                      <div key={j} style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#4b5563' }}>
                        <span style={{
                          width: 20, height: 20, borderRadius: '50%',
                          background: `${s.color}14`, color: s.color,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: 10, fontWeight: 800, flexShrink: 0,
                        }}>{j + 1}</span>
                        {step}
                      </div>
                    ))}
                  </div>
                  <div style={{ marginTop: 14, fontSize: 11, color: '#9ca3af' }}>{s.tech}</div>
                </div>
              ))}
            </div>

            {/* Technologies intégrées */}
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
                      <span key={j} style={{
                        fontSize: 11, color: '#4b5563', background: '#f0f0f0',
                        padding: '3px 10px', borderRadius: 20,
                      }}>
                        {p}
                      </span>
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
                  Recevez les résumés, donnez des instructions, pilotez votre entreprise depuis WhatsApp. Vos agents répondent en <span className="fz-accent-word" style={{ color: '#22c55e' }}>temps réel</span>.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Résumés automatiques', 'Instructions en langage naturel', 'Notifications intelligentes', 'Fichiers et documents'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#4b5563' }}>
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
                  <span style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.7)' }}>Freenzy Assistant</span>
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
                      <div style={{ fontSize: 10, color: '#9ca3af', textAlign: 'right', marginTop: 3 }}>{msg.time}</div>
                    </div>
                  ))}
                </div>
              </div>
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
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, maxWidth: 580, margin: '0 auto' }}>
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
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 18 }}>
                  Depuis votre tableau de bord, définissez un agent personnalisé en quelques minutes : nom, rôle, instructions, ton, et outils connectés.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Définissez le rôle et les objectifs',
                    'Choisissez le modèle IA (Claude, GPT, Gemini…)',
                    'Connectez vos outils (email, CRM, WhatsApp…)',
                    'Testez et déployez instantanément',
                  ].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#4b5563', display: 'flex', gap: 8, alignItems: 'center' }}>
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
                <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.65, marginBottom: 18 }}>
                  Besoin d'un module complexe ou spécifique à votre secteur ? Notre équipe le conçoit, le configure et le déploie dans votre espace.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {[
                    'Agents métier sur mesure (immobilier, santé, juridique…)',
                    'Workflows automatisés multi-agents',
                    'Intégrations personnalisées (API, bases de données)',
                    'Formation et accompagnement inclus',
                  ].map((p, i) => (
                    <div key={i} style={{ fontSize: 12, color: '#4b5563', display: 'flex', gap: 8, alignItems: 'center' }}>
                      <span className="material-symbols-rounded" style={{ color: '#8b5cf6', fontSize: 14 }}>check_circle</span> {p}
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Examples */}
            <div className="lp-app-card" style={{ padding: '24px 28px' }}>
              <p style={{ fontSize: 12, fontWeight: 700, color: '#9ca3af', textTransform: 'uppercase', letterSpacing: 2, marginBottom: 16 }}>
                Exemples de modules créés par nos utilisateurs
              </p>
              <div className="lp-custom-examples" style={{
                display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12,
              }}>
                {[
                  { icon: 'home', name: 'Agent Immobilier', desc: 'Rédige les annonces, qualifie les leads, planifie les visites' },
                  { icon: 'gavel', name: 'Veille Juridique', desc: 'Surveille les changements réglementaires et alerte en temps réel' },
                  { icon: 'restaurant', name: 'Maître d\'Hôtel IA', desc: 'Gère les réservations, allergies, menus du jour par WhatsApp' },
                  { icon: 'package_2', name: 'Suivi Logistique', desc: 'Traque les colis, prévient les retards, notifie les clients' },
                ].map((ex, i) => (
                  <div key={i} style={{
                    padding: '16px 14px', borderRadius: 12,
                    background: '#fafafa', border: '1px solid #f0f0f0',
                  }}>
                    <span className="material-symbols-rounded" style={{ fontSize: 22, marginBottom: 8, display: 'block' }}>{ex.icon}</span>
                    <div style={{ fontSize: 13, fontWeight: 700, color: '#1d1d1f', marginBottom: 4 }}>{ex.name}</div>
                    <div style={{ fontSize: 11, color: '#6b7280', lineHeight: 1.55 }}>{ex.desc}</div>
                  </div>
                ))}
              </div>
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
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginTop: 8, lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Free &amp; Easy, c&apos;est notre philosophie : une plateforme IA <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>complète</span>, <span className="fz-accent-word" style={{ color: '#a5b4fc' }}>gratuite</span>, sans abonnement, sans commission, sans complexité. L&apos;intelligence artificielle pour tous.
              </p>
            </div>
            <div className="lp-scenario-steps" style={{ gap: 16 }}>
              {[
                { icon: 'diamond', title: '0% de commission', desc: 'Vous payez le prix officiel des fournisseurs IA. Pas de markup, pas de marge cachée. Ce que ça coûte réellement, c\'est ce que vous payez.', color: '#22c55e' },
                { icon: 'lock_open', title: 'Aucun abonnement', desc: 'Pas de forfait mensuel, pas d\'engagement. Vous rechargez des crédits quand vous en avez besoin. Vos crédits n\'expirent jamais.', color: '#f59e0b' },
                { icon: 'language', title: 'Toutes les IA du marché', desc: 'Claude, GPT, Gemini, Llama, Grok, Mistral — et tous les prochains dès leur sortie. Chaque agent choisit le meilleur modèle pour chaque tâche.', color: '#5b6cf7' },
                { icon: 'flag', title: 'Données en Europe', desc: 'Serveurs EU, conformité RGPD native. Vos données ne servent jamais à entraîner des modèles. Chiffrement de bout en bout.', color: '#dc2626' },
                { icon: 'bolt', title: 'Opérationnel en 5 min', desc: 'Pas de formation, pas de configuration complexe. Créez votre compte, décrivez votre activité, vos agents sont immédiatement prêts.', color: '#3b82f6' },
                { icon: 'smart_toy', title: '82+ agents spécialisés', desc: 'Chaque domaine a son expert : commercial, marketing, RH, juridique, finance, data, produit, qualité, RSE, design, formation, innovation, international… Plus le marketplace avec 48 templates prêts à l\'emploi.', color: '#9333ea' },
              ].map((item, i) => (
                <div key={i} className="lp-app-card-dark">
                  <span className="material-symbols-rounded" style={{ fontSize: 28, marginBottom: 12, display: 'block' }}>{item.icon}</span>
                  <h3 style={{ fontFamily: 'var(--font-display)', fontSize: 15, fontWeight: 700, color: '#fff', marginBottom: 8 }}>{item.title}</h3>
                  <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.45)', lineHeight: 1.65 }}>{item.desc}</p>
                </div>
              ))}
            </div>

            {/* Trust badges strip */}
            <div style={{
              display: 'flex', gap: 20, justifyContent: 'center', flexWrap: 'wrap',
              marginTop: 40, paddingTop: 32,
              borderTop: '1px solid rgba(255,255,255,0.06)',
            }}>
              {[
                { icon: 'lock', text: 'Chiffrement AES-256' },
                { icon: 'verified_user', text: 'Serveurs EU · RGPD' },
                { icon: 'credit_card', text: 'Paiement Stripe PCI' },
                { icon: 'shield', text: '2FA · TOTP' },
                { icon: 'bar_chart', text: 'Audit logs complets' },
              ].map((badge, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.28)',
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
              <p style={{ fontSize: 14, color: '#86868b', marginTop: 8 }}>
                Tout ce que vous devez savoir sur Freenzy.io, classé par thème.
              </p>
            </div>

            {/* Category tabs */}
            <div style={{
              display: 'flex', gap: 6, flexWrap: 'wrap', justifyContent: 'center',
              marginBottom: 28, padding: '0 8px',
            }}>
              {orderedFaq.map((cat, ci) => (
                <button
                  key={cat.id}
                  onClick={() => { setFaqCat(ci); setOpenFaq(null); }}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 5,
                    padding: '10px 16px', borderRadius: 8, fontSize: 12, fontWeight: 700, minHeight: 44,
                    border: 'none', cursor: 'pointer',
                    background: faqCat === ci ? cat.color : '#fff',
                    color: faqCat === ci ? '#fff' : '#6b7280',
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
              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
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
                        fontFamily: 'var(--font-display)', fontSize: 14, fontWeight: 700, color: isOpen ? '#fff' : '#9ca3af',
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
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.36)', marginBottom: 32 }}>
              <span style={{ color: '#a5b4fc', fontWeight: 700 }}>{totalAgents} agents IA</span>. Toutes les IA du marché. <span style={{ color: '#a5b4fc', fontWeight: 700 }}>0% de commission</span>. Sans carte bancaire.
            </p>
            <Link href={heroCta?.href || '/login?mode=register'} className="lp-cta-primary" onClick={() => trackCtaClick('final_cta', heroCta?.href || '/login?mode=register', audience, '/')} style={{
              display: 'inline-block', padding: '15px 40px',
              background: '#5b6cf7', color: '#fff',
              borderRadius: 12, fontFamily: 'var(--font-display)', fontWeight: 600, fontSize: 16,
              textDecoration: 'none',
            }}>
              {heroCta?.label || 'Commencer gratuitement'}
            </Link>
            <div style={{ marginTop: 16, fontSize: 12 }}>
              <Link href="/plans" style={{ color: 'rgba(255,255,255,0.28)', textDecoration: 'none' }}>Tarifs détaillés →</Link>
            </div>
          </div>
        </section>

      </main>
      <PublicFooter />
    </>
  );
}
