'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import EnterpriseSection from './plans/EnterpriseSection';
import { TOTAL_AGENTS_DISPLAY } from '../lib/agent-config';
import { FAQ_CATEGORIES, TOTAL_FAQ_COUNT } from '../lib/faq-data';

const totalAgents = TOTAL_AGENTS_DISPLAY;

// ─── Modèles IA
const AI_MODELS = [
  { name: 'Claude · Anthropic', sub: 'Haiku · Sonnet · Opus 4 · Extended Thinking', icon: '🟠', color: '#D97706' },
  { name: 'GPT · OpenAI', sub: 'GPT-4o · o3 · GPT-4.5', icon: '🤖', color: '#10a37f' },
  { name: 'Gemini · Google', sub: 'Flash · Pro · Ultra', icon: '🔷', color: '#4285f4' },
  { name: 'Llama · Meta', sub: 'Llama 4 · open source', icon: '🦙', color: '#0668E1' },
  { name: 'Grok · xAI', sub: 'Grok 3 · raisonnement temps réel', icon: '⚡', color: '#6b7280' },
  { name: 'Mistral 🇫🇷 · Cohere', sub: 'IA européenne · et tous les prochains', icon: '🌊', color: '#f97316' },
];

// ─── Écosystème
const ECOSYSTEM = [
  { name: 'ElevenLabs', sub: 'Voix naturelle · TTS premium', icon: '🎙️' },
  { name: 'Twilio', sub: 'Appels entrants · SMS · WhatsApp', icon: '📞' },
  { name: 'pgvector', sub: 'Mémoire longue durée · RAG', icon: '🧠' },
  { name: 'WhatsApp Business', sub: 'Messages IA entrants & sortants', icon: '💬' },
  { name: 'Runway ML', sub: 'Génération vidéo IA', icon: '🎬' },
  { name: 'DALL-E · Flux', sub: 'Génération image IA', icon: '🖼️' },
  { name: 'Redis', sub: 'Cache · sessions temps réel', icon: '⚡' },
  { name: 'Stripe', sub: 'Paiement · facturation sécurisée', icon: '💳' },
];

// ─── Agents
const ALL_AGENTS = [
  { icon: '📞', name: 'Répondeur 24/7', cat: 'Business' },
  { icon: '🤝', name: 'Assistante', cat: 'Business' },
  { icon: '🚀', name: 'Commercial', cat: 'Business' },
  { icon: '📣', name: 'Marketing', cat: 'Business' },
  { icon: '👥', name: 'RH', cat: 'Business' },
  { icon: '📢', name: 'Communication', cat: 'Business' },
  { icon: '💰', name: 'Finance', cat: 'Business' },
  { icon: '💻', name: 'Dev', cat: 'Business' },
  { icon: '⚖️', name: 'Juridique', cat: 'Business' },
  { icon: '🎯', name: 'Direction Générale', cat: 'Business' },
  { icon: '🎬', name: 'Vidéo', cat: 'Business' },
  { icon: '📸', name: 'Photo / Visuel', cat: 'Business' },
  { icon: '💳', name: 'Budget perso', cat: 'Perso' },
  { icon: '🤺', name: 'Négociateur', cat: 'Perso' },
  { icon: '📊', name: 'Impôts', cat: 'Perso' },
  { icon: '🧾', name: 'Comptable', cat: 'Perso' },
  { icon: '🏠', name: 'Chasseur immo', cat: 'Perso' },
  { icon: '📈', name: 'Portfolio', cat: 'Perso' },
  { icon: '📝', name: 'CV & carrière', cat: 'Perso' },
  { icon: '💭', name: 'Contradicteur', cat: 'Perso' },
  { icon: '✍️', name: 'Écrivain', cat: 'Perso' },
  { icon: '🎥', name: 'Cinéaste', cat: 'Perso' },
  { icon: '🧘', name: 'Coach', cat: 'Perso' },
  { icon: '🌅', name: 'Déconnexion', cat: 'Perso' },
];

// ─── Actions avec crédits
const ACTION_COSTS = [
  { icon: '💬', action: 'Chat avec agent IA', model: 'Haiku', count: '100 chats', color: '#22c55e' },
  { icon: '✉️', action: 'Email professionnel', model: 'Sonnet', count: '45 emails', color: '#6366f1' },
  { icon: '📱', action: 'Post réseaux sociaux', model: 'Haiku', count: '62 posts', color: '#3b82f6' },
  { icon: '📄', action: 'Document complet', model: 'Sonnet', count: '14 docs', color: '#6366f1' },
  { icon: '📞', action: 'Appel répondeur IA', model: 'Twilio + Haiku', count: '10 appels', color: '#f97316' },
  { icon: '📤', action: 'Appel sortant IA', model: 'Twilio + Sonnet', count: '3 appels', color: '#f97316' },
  { icon: '💬', action: 'WhatsApp Business IA', model: 'Haiku', count: '125 msgs', color: '#22c55e' },
  { icon: '🗣️', action: 'Message vocal TTS', model: 'ElevenLabs', count: '11 msgs', color: '#f59e0b' },
  { icon: '🖼️', action: 'Image IA créée', model: 'DALL-E · Flux', count: '7 images', color: '#9333ea' },
  { icon: '🎬', action: 'Clip vidéo 30s', model: 'Runway ML', count: '1 clip', color: '#ec4899' },
  { icon: '🤝', action: 'Réunion IA structurée', model: 'Opus', count: '6 réunions', color: '#9333ea' },
];

// ─── Stats badges (reverse ticker)
const STATS_BADGES = [
  { icon: '\u{1F916}', value: '72+', label: 'agents' },
  { icon: '\u{1F9E0}', value: '6+', label: 'modeles IA' },
  { icon: '\u26A1', value: '5 min', label: 'onboarding' },
  { icon: '\u{1F48E}', value: '0%', label: 'commission' },
  { icon: '\u{1F319}', value: '24/7', label: 'actifs' },
  { icon: '\u{1F30D}', value: '50+', label: 'langues' },
  { icon: '\u{1F4CB}', value: '103', label: 'FAQ' },
  { icon: '\u{1F6D2}', value: '48', label: 'templates' },
  { icon: '\u{1F4BC}', value: '12', label: 'agents Business' },
  { icon: '\u{1F464}', value: '12', label: 'agents Perso' },
  { icon: '\u{1F1EA}\u{1F1FA}', value: 'RGPD', label: 'conforme' },
  { icon: '\u{1F512}', value: 'AES-256', label: 'chiffrement' },
  { icon: '\u{1F4F1}', value: '8', label: 'modes Reveil' },
  { icon: '\u{1F3AF}', value: '50', label: 'credits offerts' },
];

// ─── Live activity feed
const ACTIVITY = [
  { icon: '📞', text: 'Appel traité · lead qualifié', agent: 'Répondeur', color: '#22c55e', ago: '2 min' },
  { icon: '✉️', text: 'Proposition commerciale envoyée', agent: 'Commercial', color: '#6366f1', ago: '4 min' },
  { icon: '📱', text: '3 posts LinkedIn programmés', agent: 'Marketing', color: '#3b82f6', ago: '8 min' },
  { icon: '📊', text: 'Rapport mensuel généré', agent: 'Finance', color: '#f59e0b', ago: '13 min' },
  { icon: '⏰', text: 'Briefing matinal envoyé', agent: 'Réveil IA', color: '#f97316', ago: '19 min' },
  { icon: '🖼️', text: 'Visuel créé · campagne Été 2026', agent: 'Photo/Visuel', color: '#9333ea', ago: '24 min' },
  { icon: '📄', text: 'NDA bilingue généré', agent: 'Juridique', color: '#6366f1', ago: '31 min' },
  { icon: '💬', text: '12 messages WhatsApp traités', agent: 'Assistante', color: '#22c55e', ago: '39 min' },
  { icon: '🎬', text: 'Clip vidéo 30s créé', agent: 'Vidéo', color: '#ec4899', ago: '47 min' },
  { icon: '🤝', text: 'Stratégie Q2 synthétisée', agent: 'DG', color: '#9333ea', ago: '1h' },
];

// ─── Interactive demo scenarios
const DEMO_SCENARIOS = [
  {
    tab: '📞 Répondeur',
    color: '#22c55e',
    prompt: "Antoine Bernard vient d'appeler. Demande de devis, budget estimé 4 800€.",
    lines: [
      { label: 'Statut', text: 'Appel traité · 2 min 14s ✓' },
      { label: 'Lead', text: 'Qualifié · devis 4 800€' },
      { label: 'Action', text: 'RDV calendrier · demain 9h30' },
      { label: 'Notif.', text: 'Résumé envoyé par WhatsApp' },
    ],
    model: 'Haiku + Twilio · 5 crédits',
  },
  {
    tab: '✉️ Email',
    color: '#6366f1',
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
    tab: '📱 Social',
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
    tab: '📄 Document',
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
    color: '#6366f1',
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
  { from: 'agent', text: '📊 Résumé de la journée :\n· 3 appels traités\n· 2 leads qualifiés\n· 1 devis envoyé', time: '18:32' },
  { from: 'user', text: 'Envoie le devis à contact@acme.fr', time: '18:33' },
  { from: 'agent', text: '✅ Devis envoyé à contact@acme.fr · suivi planifié J+3', time: '18:33' },
];

// ─── Expand config
const AGENTS_PREVIEW = 6;
const MODELS_PREVIEW = 3;
const ECO_PREVIEW = 4;
const ACTIONS_PREVIEW = 4;

const expandBtnStyle = {
  marginTop: 10, width: '100%', padding: '8px',
  background: 'transparent', border: '1px dashed #d1d5db',
  borderRadius: 8, fontSize: 12, color: '#6b7280', cursor: 'pointer', fontWeight: 600,
  minHeight: 44,
} as const;

// ═══════════════════════════════════════════════════════════
export default function LandingPage() {
  const [showAllAgents, setShowAllAgents]   = useState(false);
  const [showAllModels, setShowAllModels]   = useState(false);
  const [showAllEco, setShowAllEco]         = useState(false);
  const [showAllActions, setShowAllActions] = useState(false);
  const [openFaq, setOpenFaq]               = useState<number | null>(null);
  const [faqCat, setFaqCat]                 = useState(0);
  const [demoTab, setDemoTab]               = useState(0);
  const [scenTechView, setScenTechView]     = useState<'scenarios' | 'tech'>('scenarios');

  const visibleAgents  = showAllAgents  ? ALL_AGENTS   : ALL_AGENTS.slice(0, AGENTS_PREVIEW);
  const visibleModels  = showAllModels  ? AI_MODELS    : AI_MODELS.slice(0, MODELS_PREVIEW);
  const visibleEco     = showAllEco     ? ECOSYSTEM    : ECOSYSTEM.slice(0, ECO_PREVIEW);
  const visibleActions = showAllActions ? ACTION_COSTS : ACTION_COSTS.slice(0, ACTIONS_PREVIEW);

  const demo = DEMO_SCENARIOS[demoTab];

  return (
    <>
      <PublicNav />
      <main style={{ paddingTop: 56 }}>

        {/* ══ HERO (condensé pour 14") ═══════════════════════════ */}
        <section style={{
          background: 'linear-gradient(170deg, #0a0a0f 0%, #13131f 100%)',
          padding: 'clamp(32px, 4vw, 48px) 24px clamp(24px, 3vw, 36px)',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div className="lp-hero-glow-anim" style={{
            position: 'absolute', top: 0, left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 600, height: 350,
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.14) 0%, transparent 68%)',
            pointerEvents: 'none',
          }} />

          <div style={{ maxWidth: 700, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <div style={{ marginBottom: 16 }}>
              <span style={{
                display: 'inline-flex', alignItems: 'center', gap: 7,
                background: 'rgba(34,197,94,0.1)', border: '1px solid rgba(34,197,94,0.22)',
                color: '#86efac', padding: '5px 16px', borderRadius: 40,
                fontSize: 11, fontWeight: 700,
              }}>
                <span style={{ width: 6, height: 6, borderRadius: '50%', background: '#22c55e', display: 'inline-block' }} />
                Pro &amp; Particuliers · 0% de commission
              </span>
            </div>

            <h1 className="lp-gradient-h1" style={{
              fontSize: 'clamp(38px, 6vw, 72px)',
              fontWeight: 900, lineHeight: 0.95,
              marginBottom: 14, letterSpacing: -3,
            }}>
              L&apos;app qui<br />remplace tout.
            </h1>

            <p style={{
              fontSize: 'clamp(13px, 1.6vw, 15px)',
              color: '#6366f1', fontWeight: 700,
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
              {totalAgents} agents IA spécialisés. Toutes les IA du marché. Prix officiel, 0% de commission.
            </p>

            <div style={{ textAlign: 'center', marginBottom: 16 }}>
              <div style={{ display: 'flex', gap: 10, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/login?mode=register" className="lp-cta-primary" style={{
                padding: '14px 30px', background: '#6366f1', color: '#fff',
                borderRadius: 10, fontWeight: 800, fontSize: 15, textDecoration: 'none',
                minHeight: 48,
              }}>
                Commencer gratuitement
              </Link>
              <Link href="/plans" style={{
                padding: '14px 22px', minHeight: 48,
                background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.11)',
                color: 'rgba(255,255,255,0.68)', borderRadius: 10, fontWeight: 600,
                fontSize: 14, textDecoration: 'none',
              }}>
                Voir les tarifs
              </Link>
              </div>
            </div>

            <div className="lp-hero-steps">
              <div className="lp-hero-step"><span className="lp-hero-step-num">01</span> Profil · 5 min</div>
              <div className="lp-hero-step"><span className="lp-hero-step-num">02</span> Activation</div>
              <div className="lp-hero-step"><span className="lp-hero-step-num">03</span> Operationnel</div>
            </div>
          </div>
        </section>

        {/* ══ LIVE ACTIVITY TICKER ══════════════════════════════ */}
        <div style={{ background: '#0c0c14', borderBottom: '1px solid rgba(255,255,255,0.05)', padding: '10px 0' }}>
          <div className="lp-ticker-wrap">
            <div className="lp-ticker">
              {[...ACTIVITY, ...ACTIVITY].map((item, i) => (
                <div key={i} className="lp-ticker-item lp-activity-chip" style={{ gap: 8, padding: '6px 14px' }}>
                  <span style={{ fontSize: 13 }}>{item.icon}</span>
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
                  <span className="lp-stats-badge-icon">{s.icon}</span>
                  <span className="lp-stats-badge-value">{s.value}</span>
                  <span className="lp-stats-badge-label">{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ══ TOUT EST INCLUS ═══════════════════════════════════ */}
        <section style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 36 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>Tout est inclus</p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 6 }}>
                Aucun extra. Aucun add-on.
              </h2>
              <p style={{ color: '#86868b', fontSize: 14 }}>Une plateforme. Tout dedans. Cliquez pour explorer.</p>
            </div>

            <div className="lp-inclus-grid">

              {/* ── AGENTS ── */}
              <div className="lp-app-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f' }}>Les agents IA</span>
                  <span style={{ fontSize: 11, background: '#6366f110', color: '#6366f1', border: '1px solid #6366f122', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    {ALL_AGENTS.length} agents
                  </span>
                </div>
                <div className="lp-agents-inner">
                  {visibleAgents.map((a, i) => (
                    <div key={i} className="lp-agent-chip" style={{
                      background: '#fafafa', borderRadius: 8, padding: '8px 10px',
                      border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 6,
                    }}>
                      <span style={{ fontSize: 15 }}>{a.icon}</span>
                      <div>
                        <div style={{ fontSize: 11, fontWeight: 700, color: '#1d1d1f', lineHeight: 1.2 }}>{a.name}</div>
                        <div style={{ fontSize: 9, color: '#9ca3af' }}>{a.cat}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAllAgents(v => !v)} className="lp-expand-btn" style={expandBtnStyle}>
                  {showAllAgents ? '▲ Réduire' : `▼ Voir les ${ALL_AGENTS.length - AGENTS_PREVIEW} autres agents`}
                </button>
              </div>

              {/* ── MODELES IA ── */}
              <div className="lp-app-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f' }}>Les modèles IA</span>
                  <span style={{ fontSize: 11, background: '#22c55e10', color: '#22c55e', border: '1px solid #22c55e22', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    {AI_MODELS.length} modèles
                  </span>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {visibleModels.map((m, i) => (
                    <div key={i} style={{
                      display: 'flex', alignItems: 'center', gap: 10,
                      background: '#fafafa', borderRadius: 9, padding: '10px 12px',
                      border: '1px solid #f0f0f0',
                    }}>
                      <span style={{ fontSize: 18 }}>{m.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>{m.name}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{m.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAllModels(v => !v)} className="lp-expand-btn" style={expandBtnStyle}>
                  {showAllModels ? '▲ Réduire' : `▼ Voir ${AI_MODELS.length - MODELS_PREVIEW} autres modèles`}
                </button>
              </div>

              {/* ── ECOSYSTEME ── */}
              <div className="lp-app-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f' }}>L&apos;écosystème</span>
                  <span style={{ fontSize: 11, background: '#f9731610', color: '#f97316', border: '1px solid #f9731622', padding: '2px 8px', borderRadius: 20, fontWeight: 700 }}>
                    {ECOSYSTEM.length} intégrations
                  </span>
                </div>
                <div className="lp-eco-inner">
                  {visibleEco.map((e, i) => (
                    <div key={i} style={{
                      background: '#fafafa', borderRadius: 9, padding: '10px 12px',
                      border: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 8,
                    }}>
                      <span style={{ fontSize: 18 }}>{e.icon}</span>
                      <div>
                        <div style={{ fontSize: 12, fontWeight: 700, color: '#1d1d1f' }}>{e.name}</div>
                        <div style={{ fontSize: 10, color: '#9ca3af' }}>{e.sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAllEco(v => !v)} className="lp-expand-btn" style={expandBtnStyle}>
                  {showAllEco ? '▲ Réduire' : `▼ Voir ${ECOSYSTEM.length - ECO_PREVIEW} autres intégrations`}
                </button>
              </div>

              {/* ── ACTIONS ── */}
              <div className="lp-app-card">
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14 }}>
                  <span style={{ fontSize: 14, fontWeight: 800, color: '#1d1d1f' }}>Les types d&apos;actions</span>
                  <Link href="/tarifs-api" style={{ fontSize: 11, color: '#6366f1', textDecoration: 'none', fontWeight: 700 }}>
                    Tarifs API →
                  </Link>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {visibleActions.map((a, i) => (
                    <div key={i} style={{
                      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                      background: '#fafafa', borderRadius: 8, padding: '9px 12px',
                      border: '1px solid #f0f0f0',
                    }}>
                      <span style={{ fontSize: 13, display: 'flex', alignItems: 'center', gap: 7, color: '#1d1d1f' }}>
                        <span>{a.icon}</span>{a.action}
                      </span>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 10, color: '#9ca3af' }}>{a.model}</span>
                        <span style={{ fontSize: 11, fontWeight: 700, color: a.color }}>{a.count}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={() => setShowAllActions(v => !v)} className="lp-expand-btn" style={expandBtnStyle}>
                  {showAllActions ? '▲ Réduire' : `▼ Voir ${ACTION_COSTS.length - ACTIONS_PREVIEW} autres actions`}
                </button>
              </div>

            </div>
          </div>
        </section>

        {/* ══ DEMO INTERACTIVE ══════════════════════════════════ */}
        <section style={{ background: '#1d1d1f', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 860, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#a5b4fc', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>En action</p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: -1.5 }}>
                Vos agents au travail.
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
                  Flashboard · Agent {demo.tab.replace(/^\S+\s/, '')}
                </span>
              </div>
              <div style={{ padding: '20px' }}>
                <div style={{ display: 'flex', gap: 10, marginBottom: 16 }}>
                  <div style={{
                    width: 26, height: 26, borderRadius: '50%', flexShrink: 0,
                    background: 'rgba(255,255,255,0.07)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                  }}>👤</div>
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
                    display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11,
                  }}>⚡</div>
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                      <span style={{ fontSize: 11, color: demo.color, fontWeight: 700, letterSpacing: 0.5 }}>
                        {demo.tab.replace(/^\S+\s/, '').toUpperCase()} · TERMINÉ
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

        {/* ══ SCÉNARIOS & TECHNOLOGIES (fusionné) ════════════════ */}
        <section style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 28 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#6366f1', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>En detail</p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 18 }}>
                {scenTechView === 'scenarios' ? 'Scenarios concrets.' : 'Les meilleurs outils du marche.'}
              </h2>
              <div style={{ display: 'flex', justifyContent: 'center' }}>
                <div className="lp-view-toggle">
                  <button
                    className={`lp-view-toggle-btn ${scenTechView === 'scenarios' ? 'active' : ''}`}
                    onClick={() => setScenTechView('scenarios')}
                  >
                    Cas d&apos;usage
                  </button>
                  <button
                    className={`lp-view-toggle-btn ${scenTechView === 'tech' ? 'active' : ''}`}
                    onClick={() => setScenTechView('tech')}
                  >
                    Technologies
                  </button>
                </div>
              </div>
            </div>

            <div className="lp-scenario-steps" style={{ gap: 16 }}>
              {scenTechView === 'scenarios' ? (
                SCENARIOS.map((s, i) => (
                  <div key={i} className="lp-app-card">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: s.color, marginBottom: 14 }} />
                    <h3 style={{ fontSize: 16, fontWeight: 800, color: '#1d1d1f', marginBottom: 8 }}>{s.title}</h3>
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
                ))
              ) : (
                TECH_FEATURES.map((t, i) => (
                  <div key={i} className="lp-app-card">
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: t.color, marginBottom: 14 }} />
                    <h3 style={{ fontSize: 15, fontWeight: 800, color: '#1d1d1f', marginBottom: 8 }}>{t.title}</h3>
                    <p style={{ fontSize: 13, color: '#6b7280', lineHeight: 1.6, marginBottom: 14 }}>{t.desc}</p>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 5 }}>
                      {t.points.map((p, j) => (
                        <div key={j} style={{ fontSize: 12, color: '#4b5563', display: 'flex', gap: 8, alignItems: 'center' }}>
                          <span style={{ color: '#22c55e', fontWeight: 800, fontSize: 11 }}>&#10003;</span> {p}
                        </div>
                      ))}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>

        {/* ══ WHATSAPP ══════════════════════════════════════════ */}
        <section style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 960, margin: '0 auto' }}>
            <div className="lp-whatsapp-grid">
              <div>
                <p style={{ fontSize: 11, fontWeight: 800, color: '#22c55e', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>WhatsApp</p>
                <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 12 }}>
                  Vos agents sur WhatsApp.
                </h2>
                <p style={{ fontSize: 14, color: '#6b7280', lineHeight: 1.65, marginBottom: 20 }}>
                  Recevez les résumés, donnez des instructions, pilotez votre entreprise depuis WhatsApp. Vos agents répondent en temps réel.
                </p>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                  {['Résumés automatiques', 'Instructions en langage naturel', 'Notifications intelligentes', 'Fichiers et documents'].map((f, i) => (
                    <div key={i} style={{ display: 'flex', gap: 8, alignItems: 'center', fontSize: 13, color: '#4b5563' }}>
                      <span style={{ color: '#22c55e', fontWeight: 800 }}>✓</span> {f}
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
              <p style={{ fontSize: 11, fontWeight: 800, color: '#8b5cf6', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Sur mesure
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: -1.5, marginBottom: 12 }}>
                Créez vos propres modules.
              </h2>
              <p style={{ fontSize: 15, color: '#6b7280', lineHeight: 1.65, maxWidth: 580, margin: '0 auto' }}>
                Chaque entreprise est unique. Créez des modules IA adaptés à votre métier, ou confiez-nous leur conception.
              </p>
            </div>

            <div className="lp-custom-grid" style={{
              display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20,
              marginBottom: 32,
            }}>
              {/* Self-service */}
              <div className="lp-app-card" style={{ padding: '32px 28px' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🛠️</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1d1d1f', marginBottom: 8 }}>
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
                      <span style={{ color: '#8b5cf6', fontWeight: 800, fontSize: 11 }}>✓</span> {p}
                    </div>
                  ))}
                </div>
              </div>

              {/* On-demand */}
              <div className="lp-app-card" style={{ padding: '32px 28px' }}>
                <div style={{ fontSize: 32, marginBottom: 16 }}>🎯</div>
                <h3 style={{ fontSize: 17, fontWeight: 800, color: '#1d1d1f', marginBottom: 8 }}>
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
                      <span style={{ color: '#8b5cf6', fontWeight: 800, fontSize: 11 }}>✓</span> {p}
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
                  { icon: '🏠', name: 'Agent Immobilier', desc: 'Rédige les annonces, qualifie les leads, planifie les visites' },
                  { icon: '⚖️', name: 'Veille Juridique', desc: 'Surveille les changements réglementaires et alerte en temps réel' },
                  { icon: '🍽️', name: 'Maître d\'Hôtel IA', desc: 'Gère les réservations, allergies, menus du jour par WhatsApp' },
                  { icon: '📦', name: 'Suivi Logistique', desc: 'Traque les colis, prévient les retards, notifie les clients' },
                ].map((ex, i) => (
                  <div key={i} style={{
                    padding: '16px 14px', borderRadius: 12,
                    background: '#fafafa', border: '1px solid #f0f0f0',
                  }}>
                    <div style={{ fontSize: 22, marginBottom: 8 }}>{ex.icon}</div>
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
              <p style={{ fontSize: 11, fontWeight: 800, color: '#a5b4fc', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>
                Free &amp; Easy
              </p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, color: '#fff', letterSpacing: -1.5 }}>
                L&apos;IA accessible à tous.
              </h2>
              <p style={{ fontSize: 14, color: 'rgba(255,255,255,0.38)', marginTop: 8, lineHeight: 1.6, maxWidth: 520, marginLeft: 'auto', marginRight: 'auto' }}>
                Free &amp; Easy, c&apos;est notre philosophie : une plateforme IA complète, gratuite, sans abonnement, sans commission, sans complexité. L&apos;intelligence artificielle pour tous, telle qu&apos;elle devrait être.
              </p>
            </div>
            <div className="lp-scenario-steps" style={{ gap: 16 }}>
              {[
                { icon: '💎', title: '0% de commission', desc: 'Vous payez le prix officiel des fournisseurs IA. Pas de markup, pas de marge cachée. Ce que ça coûte réellement, c\'est ce que vous payez.', color: '#22c55e' },
                { icon: '🔓', title: 'Aucun abonnement', desc: 'Pas de forfait mensuel, pas d\'engagement. Vous rechargez des crédits quand vous en avez besoin. Vos crédits n\'expirent jamais.', color: '#f59e0b' },
                { icon: '🌐', title: 'Toutes les IA du marché', desc: 'Claude, GPT, Gemini, Llama, Grok, Mistral — et tous les prochains dès leur sortie. Chaque agent choisit le meilleur modèle pour chaque tâche.', color: '#6366f1' },
                { icon: '🇫🇷', title: 'Données en Europe', desc: 'Serveurs EU, conformité RGPD native. Vos données ne servent jamais à entraîner des modèles. Chiffrement de bout en bout.', color: '#dc2626' },
                { icon: '⚡', title: 'Opérationnel en 5 min', desc: 'Pas de formation, pas de configuration complexe. Créez votre compte, décrivez votre activité, vos agents sont immédiatement prêts.', color: '#3b82f6' },
                { icon: '🤖', title: '72+ agents spécialisés', desc: 'Chaque domaine a son expert : commercial, marketing, RH, juridique, finance, créatif… Plus le marketplace avec 48 templates prêts à l\'emploi.', color: '#9333ea' },
              ].map((item, i) => (
                <div key={i} className="lp-app-card-dark">
                  <div style={{ fontSize: 28, marginBottom: 12 }}>{item.icon}</div>
                  <h3 style={{ fontSize: 15, fontWeight: 800, color: '#fff', marginBottom: 8 }}>{item.title}</h3>
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
                { icon: '🔒', text: 'Chiffrement AES-256' },
                { icon: '🇪🇺', text: 'Serveurs EU · RGPD' },
                { icon: '💳', text: 'Paiement Stripe PCI' },
                { icon: '🛡️', text: '2FA · TOTP' },
                { icon: '📊', text: 'Audit logs complets' },
              ].map((badge, i) => (
                <div key={i} style={{
                  display: 'flex', alignItems: 'center', gap: 7,
                  fontSize: 11, fontWeight: 600, color: 'rgba(255,255,255,0.28)',
                }}>
                  <span style={{ fontSize: 15 }}>{badge.icon}</span>
                  {badge.text}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══ ENTERPRISE ═══════════════════════════════════════ */}
        <section style={{ background: '#fff', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <EnterpriseSection />
        </section>

        {/* ══ FAQ — 100+ QUESTIONS PAR THÈME ════════════════════ */}
        <section id="faq" style={{ background: '#f7f7f7', padding: 'clamp(32px, 4vw, 56px) 24px' }}>
          <div style={{ maxWidth: 820, margin: '0 auto' }}>
            <div style={{ textAlign: 'center', marginBottom: 32 }}>
              <p style={{ fontSize: 11, fontWeight: 800, color: '#f97316', letterSpacing: 4, textTransform: 'uppercase', marginBottom: 10 }}>FAQ</p>
              <h2 style={{ fontSize: 'clamp(22px, 3.5vw, 36px)', fontWeight: 900, color: '#1d1d1f', letterSpacing: -1 }}>
                {TOTAL_FAQ_COUNT} réponses à vos questions.
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
              {FAQ_CATEGORIES.map((cat, ci) => (
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
              background: `${FAQ_CATEGORIES[faqCat].color}08`,
              border: `1px solid ${FAQ_CATEGORIES[faqCat].color}18`,
            }}>
              <span style={{ fontSize: 18 }}>{FAQ_CATEGORIES[faqCat].icon}</span>
              <span style={{ fontSize: 14, fontWeight: 800, color: FAQ_CATEGORIES[faqCat].color }}>
                {FAQ_CATEGORIES[faqCat].label}
              </span>
              <span style={{ fontSize: 12, color: '#9ca3af', marginLeft: 'auto' }}>
                {FAQ_CATEGORIES[faqCat].questions.length} questions
              </span>
            </div>

            {/* Questions */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              {FAQ_CATEGORIES[faqCat].questions.map((faq, i) => {
                const isOpen = openFaq === i;
                const catColor = FAQ_CATEGORIES[faqCat].color;
                return (
                  <div
                    key={`${faqCat}-${i}`}
                    className="lp-faq-item"
                    onClick={() => setOpenFaq(isOpen ? null : i)}
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
                        fontSize: 14, fontWeight: 900, color: isOpen ? '#fff' : '#9ca3af',
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
        <section style={{
          background: 'linear-gradient(165deg, #0a0a0f 0%, #1a1a2e 100%)',
          padding: 'clamp(56px, 8vw, 96px) 24px',
          textAlign: 'center', position: 'relative', overflow: 'hidden',
        }}>
          <div style={{
            position: 'absolute', bottom: '-10%', left: '50%', transform: 'translateX(-50%)',
            width: '100%', maxWidth: 500, height: 300,
            background: 'radial-gradient(ellipse, rgba(99,102,241,0.11) 0%, transparent 68%)',
            pointerEvents: 'none',
          }} />
          <div style={{ maxWidth: 600, margin: '0 auto', position: 'relative', zIndex: 1 }}>
            <p style={{ fontSize: 11, fontWeight: 800, color: 'rgba(255,255,255,0.18)', letterSpacing: 6, textTransform: 'uppercase', marginBottom: 16 }}>
              FREENZY.IO
            </p>
            <h2 style={{
              fontSize: 'clamp(28px, 5vw, 56px)',
              fontWeight: 900, color: '#fff',
              letterSpacing: -2.5, lineHeight: 1.05, marginBottom: 14,
            }}>
              Votre équipe IA<br />
              <span style={{ color: '#a5b4fc' }}>vous attend.</span>
            </h2>
            <p style={{ fontSize: 15, color: 'rgba(255,255,255,0.36)', marginBottom: 32 }}>
              {totalAgents} agents IA. Toutes les IA du marché. 0% de commission. Sans carte bancaire.
            </p>
            <Link href="/login?mode=register" className="lp-cta-primary" style={{
              display: 'inline-block', padding: '15px 40px',
              background: '#6366f1', color: '#fff',
              borderRadius: 12, fontWeight: 800, fontSize: 16,
              textDecoration: 'none',
            }}>
              Commencer gratuitement
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
