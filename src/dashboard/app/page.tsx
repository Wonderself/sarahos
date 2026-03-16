'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import PublicNav from '../components/PublicNav';
import PublicFooter from '../components/PublicFooter';
import { FAQ_CATEGORIES } from '../lib/faq-data';

/* ═══════════════════════════════════════════════════════════
   FREENZY.IO — Landing Page v5
   12 sections, inline styles, mobile-first, Notion palette
   ═══════════════════════════════════════════════════════════ */

// ─── Palette
const C = {
  text: '#1A1A1A',
  secondary: '#6B6B6B',
  muted: '#9B9B9B',
  border: '#E5E5E5',
  bg: '#FFFFFF',
  bgSec: '#FAFAFA',
};

// ─── Floating emojis data (25 emojis)
const FLOAT_EMOJIS = [
  { e: '🤖', top: '5%', left: '4%', size: 44, delay: 0 },
  { e: '💬', top: '12%', left: '88%', size: 38, delay: 2 },
  { e: '📊', top: '28%', left: '8%', size: 36, delay: 4 },
  { e: '⚡', top: '22%', left: '92%', size: 42, delay: 1 },
  { e: '📝', top: '48%', left: '3%', size: 38, delay: 6 },
  { e: '🎨', top: '52%', left: '94%', size: 44, delay: 3 },
  { e: '📧', top: '68%', left: '6%', size: 34, delay: 5 },
  { e: '💳', top: '62%', left: '90%', size: 38, delay: 7 },
  { e: '🎯', top: '78%', left: '12%', size: 40, delay: 2 },
  { e: '✨', top: '8%', left: '42%', size: 32, delay: 8 },
  { e: '🚀', top: '38%', left: '96%', size: 36, delay: 9 },
  { e: '💡', top: '82%', left: '82%', size: 38, delay: 4 },
  { e: '🎓', top: '18%', left: '30%', size: 34, delay: 10 },
  { e: '📱', top: '42%', left: '50%', size: 30, delay: 11 },
  { e: '🔍', top: '72%', left: '55%', size: 36, delay: 6 },
  { e: '💼', top: '32%', left: '18%', size: 40, delay: 12 },
  { e: '🛡️', top: '58%', left: '40%', size: 34, delay: 3 },
  { e: '📋', top: '88%', left: '25%', size: 38, delay: 14 },
  { e: '🎮', top: '15%', left: '65%', size: 32, delay: 5 },
  { e: '💬', top: '75%', left: '35%', size: 36, delay: 13 },
  { e: '📊', top: '45%', left: '75%', size: 30, delay: 7 },
  { e: '🧠', top: '25%', left: '55%', size: 42, delay: 15 },
  { e: '🤖', top: '65%', left: '70%', size: 34, delay: 8 },
  { e: '⚡', top: '85%', left: '60%', size: 38, delay: 16 },
  { e: '🎯', top: '55%', left: '15%', size: 50, delay: 9 },
];

// ─── Tool columns for Section 2
const TOOL_COLUMNS = [
  { title: '📝 Documents', color: '#3B82F6', tools: [
    { emoji: '📄', name: 'Devis automatiques', desc: 'Générez des devis professionnels en décrivant le travail. Mentions légales, TVA, numérotation inclus.' },
    { emoji: '🧾', name: 'Factures PDF', desc: 'Transformez vos devis en factures. Export PDF avec votre branding.' },
    { emoji: '📑', name: 'Contrats', desc: 'Contrats de prestation, NDA, partenariat — générés et personnalisés par l\'IA.' },
    { emoji: '📋', name: 'Comptes-rendus', desc: 'Résumés de réunion structurés avec actions et responsables.' },
    { emoji: '📊', name: 'Rapports', desc: 'Rapports d\'analyse, bilans, études de marché formatés.' },
    { emoji: '📝', name: 'Business Plan', desc: 'Business plan complet avec analyse de marché et projections financières.' },
  ]},
  { title: '💬 Communication', color: '#10B981', tools: [
    { emoji: '📧', name: 'Emails pro', desc: 'Emails professionnels adaptés au contexte : relance, prospection, support.' },
    { emoji: '⭐', name: 'Réponses avis Google', desc: 'Répondez aux avis clients en un clic, ton adapté positif ou négatif.' },
    { emoji: '💬', name: 'WhatsApp Business', desc: 'Messages WhatsApp automatisés : confirmations, rappels, suivi.' },
    { emoji: '📱', name: 'SMS de relance', desc: 'Relances automatiques J+3, J+7, J+14 pour vos devis en attente.' },
    { emoji: '📰', name: 'Newsletter', desc: 'Création et envoi de newsletters personnalisées par segment.' },
    { emoji: '🎧', name: 'Support client', desc: 'Chat support IA qui répond 24/7 à vos clients.' },
  ]},
  { title: '📱 Réseaux sociaux', color: '#8B5CF6', tools: [
    { emoji: '💼', name: 'Posts LinkedIn', desc: 'Posts LinkedIn format hook + story + leçon optimisés pour l\'algorithme.' },
    { emoji: '📸', name: 'Posts Instagram', desc: 'Légendes Instagram avec hashtags optimisés et appel à l\'action.' },
    { emoji: '👥', name: 'Posts Facebook', desc: 'Publications Facebook engageantes avec questions et sondages.' },
    { emoji: '🐦', name: 'Threads Twitter/X', desc: 'Threads viraux en 5-10 tweets avec hooks percutants.' },
    { emoji: '🎬', name: 'Scripts TikTok', desc: 'Scripts vidéo courts avec hook dans les 3 premières secondes.' },
    { emoji: '📅', name: 'Calendrier éditorial', desc: 'Planning de publication sur 4 semaines, multi-plateformes.' },
  ]},
  { title: '📊 Analyse', color: '#F59E0B', tools: [
    { emoji: '🔍', name: 'Veille concurrentielle', desc: 'Analyse de vos concurrents : positionnement, prix, forces/faiblesses.' },
    { emoji: '📈', name: 'Analyse de marché', desc: 'TAM/SAM/SOM, tendances sectorielles, opportunités identifiées.' },
    { emoji: '📊', name: 'Reporting', desc: 'Tableaux de bord KPI automatisés avec alertes et recommandations.' },
    { emoji: '🔎', name: 'Audit SEO', desc: 'Audit technique + contenu + backlinks avec plan d\'action priorisé.' },
    { emoji: '🎯', name: 'Prospection', desc: 'Identification et scoring de leads qualifiés par secteur et zone.' },
    { emoji: '📋', name: 'Scoring leads', desc: 'Attribution de scores aux prospects basée sur le comportement et le profil.' },
  ]},
  { title: '🎨 Création', color: '#EC4899', tools: [
    { emoji: '📸', name: 'Photos IA', desc: 'Génération de photos professionnelles avec fal.ai Flux (8 crédits).' },
    { emoji: '🎬', name: 'Vidéos avatars', desc: 'Vidéos avec avatar parlant via D-ID (25 crédits).' },
    { emoji: '🎨', name: 'Logos et branding', desc: 'Création d\'identité visuelle : logo, palette, typographie.' },
    { emoji: '🛍️', name: 'Fiches produits', desc: 'Descriptions e-commerce optimisées SEO avec bénéfices et specs.' },
    { emoji: '📄', name: 'CV professionnels', desc: 'CV structurés avec mise en valeur des compétences clés.' },
    { emoji: '📊', name: 'Présentations', desc: 'Slides de présentation avec structure narrative et speaker notes.' },
  ]},
  { title: '🤖 Automatisation', color: '#0EA5E9', tools: [
    { emoji: '☀️', name: 'Briefing matinal', desc: 'Chaque matin, un résumé personnalisé : agenda, KPIs, tâches prioritaires.' },
    { emoji: '🔔', name: 'Rappels RDV', desc: 'Rappels automatiques par SMS/email/WhatsApp avant chaque rendez-vous.' },
    { emoji: '🔄', name: 'Relances auto', desc: 'Relances clients automatiques avec escalade progressive.' },
    { emoji: '✅', name: 'Workflows', desc: 'Chaînes d\'actions automatisées : si X alors Y, validation, notification.' },
    { emoji: '📧', name: 'Emails séquencés', desc: 'Séquences email J+0, J+2, J+5 déclenchées par événement.' },
    { emoji: '🚨', name: 'Alertes intelligentes', desc: 'Notifications proactives : stock bas, client inactif, échéance proche.' },
  ]},
  { title: '🎓 Formation', color: '#6366F1', tools: [
    { emoji: '📚', name: '59 parcours', desc: '59 formations complètes avec quiz, exercices et diplômes téléchargeables.' },
    { emoji: '🎮', name: 'Mini-jeux', desc: '10 jeux éducatifs : Motus, Quiz, Memory, 2048, Snake, Tetris...' },
    { emoji: '🏆', name: 'Badges et XP', desc: 'Système de progression avec 19 badges, niveaux et classement.' },
    { emoji: '📰', name: 'Veille IA', desc: 'Actualités IA quotidiennes résumées en 2 minutes.' },
    { emoji: '🧠', name: 'Discussions profondes', desc: '91 sujets de réflexion avec l\'IA Opus en Extended Thinking.' },
    { emoji: '⏱️', name: 'Pomodoro', desc: 'Timer Pomodoro avec historique, stats et XP.' },
  ]},
  { title: '💼 Business', color: '#D97706', tools: [
    { emoji: '💰', name: 'Facturation', desc: 'Création de factures, devis, gestion clients et TVA automatique.' },
    { emoji: '📇', name: 'CRM', desc: 'Gestion complète des contacts, deals et pipeline commercial.' },
    { emoji: '📋', name: 'Kanban', desc: 'Tableaux de bord Kanban avec tâches, priorités et assignation.' },
    { emoji: '🔍', name: 'SEO Tracker', desc: 'Suivi de positionnement et recommandations d\'optimisation.' },
    { emoji: '🏗️', name: 'Landing Builder', desc: 'Création de pages d\'atterrissage optimisées conversion.' },
    { emoji: '📊', name: 'Analytics', desc: 'Tableau de bord analytique avec métriques clés et tendances.' },
  ]},
];

// ─── Dashboard carousel profiles for Section 3
const DASHBOARD_PROFILES = [
  {
    label: 'Particulier 🏠',
    greeting: 'Bonjour Julie 👋',
    sidebar: ['💰 Budget', '🏋️ Sport', '🍳 Cuisine', '📓 Journal', '🎯 Habitudes'],
    stats: [
      { emoji: '💰', label: 'Budget du mois', value: '1 250€', bg: '#F0FFF4' },
      { emoji: '🏋️', label: 'Séances sport', value: '12', bg: '#F0F7FF' },
      { emoji: '📓', label: 'Notes', value: '34', bg: '#FFF8F0' },
    ],
  },
  {
    label: 'Artisan 🔧',
    greeting: 'Bonjour Marc 👋',
    sidebar: ['📄 Devis', '🔄 Relances', '📅 Planning', '⭐ Avis Google', '🧾 Factures'],
    stats: [
      { emoji: '📄', label: 'Devis envoyés', value: '8', bg: '#F0F7FF' },
      { emoji: '🔄', label: 'Relances auto', value: '14', bg: '#FFF8F0' },
      { emoji: '⭐', label: 'Avis traités', value: '6', bg: '#F0FFF4' },
    ],
  },
  {
    label: 'PME 🏢',
    greeting: 'Bonjour Sophie 👋',
    sidebar: ['📇 CRM', '👥 Équipe', '🧑‍💼 RH', '📊 Compta', '📣 Marketing', '💼 Commercial'],
    stats: [
      { emoji: '📇', label: 'Leads actifs', value: '47', bg: '#F0F7FF' },
      { emoji: '👥', label: 'Collaborateurs', value: '12', bg: '#FFF8F0' },
      { emoji: '📊', label: 'CA mensuel', value: '34k€', bg: '#F0FFF4' },
    ],
  },
];

// ─── Profession cards with detailed use cases
const PROFILES = [
  { emoji: '🔧', name: 'Artisan', count: 5, assistants: ['Devis automatique', 'Relance clients', 'Avis Google', 'Planning chantiers'], useCases: [
    { emoji: '📄', title: 'Devis en 3 min', desc: 'Décrivez le travail, l\'IA génère un devis complet avec TVA et mentions légales.' },
    { emoji: '🔄', title: 'Relances auto J+3/J+7', desc: 'Vos devis non signés sont relancés automatiquement par email et SMS.' },
    { emoji: '⭐', title: 'Réponse avis Google', desc: 'Répondez à chaque avis client en un clic, ton professionnel garanti.' },
    { emoji: '📱', title: 'Posts réseaux sociaux', desc: 'Photos de chantier transformées en posts LinkedIn et Instagram.' },
    { emoji: '🧾', title: 'Factures PDF', desc: 'Convertissez vos devis acceptés en factures en un clic.' },
    { emoji: '📊', title: 'Reporting mensuel', desc: 'Bilan d\'activité avec CA, taux de conversion devis, avis reçus.' },
  ]},
  { emoji: '🏥', name: 'Santé', count: 5, assistants: ['Prise de RDV', 'Rappels patients', 'Comptes-rendus', 'Ordonnances'], useCases: [
    { emoji: '📅', title: 'Prise de RDV auto', desc: 'Les patients réservent en ligne, confirmation et rappels automatiques.' },
    { emoji: '🔔', title: 'Rappels patients', desc: 'SMS et email de rappel 24h et 1h avant chaque rendez-vous.' },
    { emoji: '📋', title: 'Comptes-rendus', desc: 'Dictez vos notes, l\'IA rédige un compte-rendu structuré.' },
    { emoji: '📄', title: 'Documents patients', desc: 'Attestations, certificats et courriers générés automatiquement.' },
    { emoji: '⭐', title: 'Avis Google', desc: 'Sollicitez et répondez aux avis pour améliorer votre visibilité.' },
  ]},
  { emoji: '🎨', name: 'Agence', count: 6, assistants: ['Brief créatif', 'Social media', 'Reporting client', 'Veille tendances'], useCases: [
    { emoji: '📝', title: 'Brief créatif IA', desc: 'Transformez les demandes clients en briefs structurés et actionnables.' },
    { emoji: '📱', title: 'Social media x4', desc: 'Un contenu décliné en posts LinkedIn, Instagram, Facebook et Twitter.' },
    { emoji: '📊', title: 'Reporting client', desc: 'Rapports mensuels automatiques avec KPIs et recommandations.' },
    { emoji: '🔍', title: 'Veille tendances', desc: 'Alertes quotidiennes sur les tendances de votre secteur.' },
    { emoji: '📸', title: 'Visuels IA', desc: 'Génération de visuels professionnels pour vos campagnes.' },
    { emoji: '📅', title: 'Planning éditorial', desc: 'Calendrier de publication multi-clients sur 4 semaines.' },
  ]},
  { emoji: '🛒', name: 'E-commerce', count: 5, assistants: ['Fiches produits', 'SAV automatisé', 'Relance paniers', 'Analyse ventes'], useCases: [
    { emoji: '🛍️', title: 'Fiches produits SEO', desc: 'Descriptions optimisées avec bénéfices, specs et mots-clés.' },
    { emoji: '🎧', title: 'SAV automatisé', desc: 'Chat IA qui gère retours, échanges et questions fréquentes.' },
    { emoji: '🛒', title: 'Relance paniers', desc: 'Emails automatiques pour récupérer les paniers abandonnés.' },
    { emoji: '📊', title: 'Analyse ventes', desc: 'Tableau de bord avec produits stars, tendances et prévisions.' },
    { emoji: '📧', title: 'Emails marketing', desc: 'Séquences email personnalisées par segment client.' },
  ]},
  { emoji: '🎯', name: 'Coach', count: 4, assistants: ['Planning séances', 'Suivi client', 'Contenu expert', 'Facturation'], useCases: [
    { emoji: '📅', title: 'Planning séances', desc: 'Réservation en ligne avec synchronisation agenda automatique.' },
    { emoji: '📈', title: 'Suivi client', desc: 'Tableau de progression par client avec notes et objectifs.' },
    { emoji: '📝', title: 'Contenu expert', desc: 'Articles, posts et newsletters pour asseoir votre expertise.' },
    { emoji: '🧾', title: 'Facturation auto', desc: 'Factures générées et envoyées après chaque séance.' },
  ]},
  { emoji: '🍽️', name: 'Restaurant', count: 4, assistants: ['Réservations', 'Menu du jour', 'Avis Google', 'Stocks'], useCases: [
    { emoji: '📅', title: 'Réservations', desc: 'Gestion des réservations avec confirmation automatique par SMS.' },
    { emoji: '🍽️', title: 'Menu du jour', desc: 'Publication automatique du menu sur Google, réseaux et site.' },
    { emoji: '⭐', title: 'Avis Google', desc: 'Réponse personnalisée à chaque avis en quelques secondes.' },
    { emoji: '📦', title: 'Gestion stocks', desc: 'Alertes de stock bas et suggestions de commande fournisseur.' },
  ]},
  { emoji: '⚖️', name: 'Libéral', count: 5, assistants: ['Contrats IA', 'Veille juridique', 'Facturation', 'Secrétariat'], useCases: [
    { emoji: '📑', title: 'Contrats IA', desc: 'Génération de contrats types personnalisés selon le cas.' },
    { emoji: '🔍', title: 'Veille juridique', desc: 'Alertes sur les évolutions légales de votre domaine.' },
    { emoji: '🧾', title: 'Facturation', desc: 'Notes d\'honoraires et factures conformes générées automatiquement.' },
    { emoji: '📧', title: 'Secrétariat IA', desc: 'Gestion des emails, RDV et relances par votre assistante IA.' },
    { emoji: '📋', title: 'Comptes-rendus', desc: 'Résumés de réunion et procès-verbaux structurés.' },
  ]},
  { emoji: '🏢', name: 'PME', count: 8, assistants: ['RH complet', 'Comptabilité', 'Commercial', 'Direction'], useCases: [
    { emoji: '🧑‍💼', title: 'RH complet', desc: 'Recrutement, onboarding, suivi des congés et entretiens.' },
    { emoji: '📊', title: 'Comptabilité', desc: 'Suivi financier, préparation comptable et alertes trésorerie.' },
    { emoji: '💼', title: 'Commercial', desc: 'Pipeline de vente, scoring leads et relances automatiques.' },
    { emoji: '👔', title: 'Direction', desc: 'Tableaux de bord stratégiques et aide à la décision IA.' },
    { emoji: '📣', title: 'Marketing', desc: 'Campagnes multi-canal avec analyse de performance.' },
    { emoji: '🎧', title: 'Support', desc: 'Chat IA interne et externe pour répondre 24/7.' },
  ]},
];

// ─── FAQ selection (10 most common)
const FAQ_SELECTION = (() => {
  const picked: { q: string; a: string }[] = [];
  for (const cat of FAQ_CATEGORIES) {
    for (const faq of cat.questions) {
      if (picked.length < 10) picked.push(faq);
    }
  }
  return picked;
})();

// ─── Shared styles
const sectionStyle = (bg: string): React.CSSProperties => ({
  padding: '80px 24px',
  background: bg,
  position: 'relative',
});

const containerStyle: React.CSSProperties = {
  maxWidth: 1120,
  margin: '0 auto',
};

const sectionTitle: React.CSSProperties = {
  fontSize: 32,
  fontWeight: 700,
  color: C.text,
  textAlign: 'center',
  marginBottom: 12,
  letterSpacing: '-0.02em',
};

const sectionSub: React.CSSProperties = {
  fontSize: 16,
  color: C.secondary,
  textAlign: 'center',
  marginBottom: 48,
  maxWidth: 600,
  marginLeft: 'auto',
  marginRight: 'auto',
  lineHeight: 1.6,
};

const cardStyle: React.CSSProperties = {
  background: C.bg,
  border: `1px solid ${C.border}`,
  borderRadius: 12,
  padding: 24,
  transition: 'box-shadow 0.2s ease, transform 0.2s ease',
};

export default function LandingPage() {
  const [hoveredProfile, setHoveredProfile] = useState<number | null>(null);
  const [expandedProfile, setExpandedProfile] = useState<number | null>(null);
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [isMobile, setIsMobile] = useState(false);
  const [expandedTools, setExpandedTools] = useState<Record<string, boolean>>({});
  const [dashProfileIdx, setDashProfileIdx] = useState(0);
  const dashIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const handler = () => setIsMobile(window.innerWidth <= 768);
    handler();
    window.addEventListener('resize', handler);
    return () => window.removeEventListener('resize', handler);
  }, []);

  // Auto-rotate dashboard profiles
  useEffect(() => {
    dashIntervalRef.current = setInterval(() => {
      setDashProfileIdx(prev => (prev + 1) % DASHBOARD_PROFILES.length);
    }, 4000);
    return () => {
      if (dashIntervalRef.current) clearInterval(dashIntervalRef.current);
    };
  }, []);

  const toggleTool = (key: string) => {
    setExpandedTools(prev => ({ ...prev, [key]: !prev[key] }));
  };

  const selectDashProfile = (idx: number) => {
    setDashProfileIdx(idx);
    if (dashIntervalRef.current) clearInterval(dashIntervalRef.current);
    dashIntervalRef.current = setInterval(() => {
      setDashProfileIdx(prev => (prev + 1) % DASHBOARD_PROFILES.length);
    }, 4000);
  };

  // ─── Mini dashboard mockup component for Section 3
  const DashMockup = ({ profile, compact }: { profile: typeof DASHBOARD_PROFILES[0]; compact?: boolean }) => {
    const h = compact ? 280 : 340;
    return (
      <div style={{
        background: C.bg,
        border: `1px solid ${C.border}`,
        borderRadius: compact ? 20 : 12,
        overflow: 'hidden',
        boxShadow: '0 8px 24px rgba(0,0,0,0.06)',
        width: '100%',
        height: h,
        display: 'flex',
        flexDirection: 'column',
        position: 'relative',
      }}>
        {/* Browser / phone chrome */}
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 6,
          padding: compact ? '8px 12px' : '10px 14px',
          borderBottom: `1px solid ${C.border}`,
          background: C.bgSec,
          flexShrink: 0,
        }}>
          {compact ? (
            <>
              {/* Phone notch */}
              <div style={{ margin: '0 auto', width: 40, height: 4, borderRadius: 2, background: C.border }} />
            </>
          ) : (
            <>
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F56' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }} />
              <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27C93F' }} />
              <span style={{ marginLeft: 'auto', fontSize: 10, color: C.muted, fontFamily: 'monospace' }}>freenzy.io</span>
            </>
          )}
        </div>

        <div style={{ display: 'flex', flex: 1, overflow: 'hidden' }}>
          {/* Sidebar (desktop mockup only) */}
          {!compact && (
            <div style={{
              width: 140,
              borderRight: `1px solid ${C.border}`,
              padding: '10px 8px',
              background: C.bgSec,
              flexShrink: 0,
            }}>
              <div style={{ fontSize: 10, fontWeight: 700, color: C.text, marginBottom: 10, padding: '0 4px' }}>FREENZY.IO</div>
              {profile.sidebar.map((item, i) => (
                <div key={i} style={{
                  padding: '5px 6px',
                  borderRadius: 4,
                  fontSize: 10,
                  color: i === 0 ? C.text : C.secondary,
                  fontWeight: i === 0 ? 600 : 400,
                  background: i === 0 ? C.bg : 'transparent',
                  marginBottom: 1,
                }}>
                  {item}
                </div>
              ))}
            </div>
          )}

          {/* Main content area */}
          <div style={{ flex: 1, padding: compact ? 10 : 14, overflow: 'hidden' }}>
            <div style={{ fontSize: compact ? 12 : 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>
              {profile.greeting}
            </div>

            {/* Stats */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
              {profile.stats.map((s, i) => (
                <div key={i} style={{
                  background: s.bg,
                  borderRadius: 6,
                  padding: compact ? '6px 4px' : '8px 6px',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: compact ? 12 : 14, marginBottom: 2 }}>{s.emoji}</div>
                  <div style={{ fontSize: compact ? 11 : 13, fontWeight: 800, color: C.text }}>{s.value}</div>
                  <div style={{ fontSize: compact ? 7 : 8, color: C.muted, lineHeight: 1.2 }}>{s.label}</div>
                </div>
              ))}
            </div>

            {/* Actions rapides */}
            <div style={{ fontSize: compact ? 9 : 10, fontWeight: 600, color: C.text, marginBottom: 6 }}>Actions rapides ⚡</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
              {profile.sidebar.slice(0, 4).map((item, i) => (
                <div key={i} style={{
                  padding: compact ? '4px 6px' : '5px 8px',
                  background: C.bgSec,
                  borderRadius: 4,
                  border: `1px solid ${C.border}`,
                  fontSize: compact ? 8 : 9,
                  color: C.secondary,
                  textAlign: 'center',
                  whiteSpace: 'nowrap',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}>
                  {item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      {/* Animation keyframes */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes float-emoji {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-15px); }
        }
        @keyframes fade-in-up {
          from { opacity: 0; transform: translateY(20px); }
          to { opacity: 1; transform: translateY(0); }
        }
      ` }} />

      <PublicNav />

      <main style={{ paddingTop: 56 }}>

        {/* ══════════════════════════════════════════════════════
            SECTION 1 — HERO
           ══════════════════════════════════════════════════════ */}
        <section style={{
          ...sectionStyle(C.bg),
          padding: '120px 24px 80px',
          overflow: 'hidden',
          minHeight: '85vh',
          display: 'flex',
          alignItems: 'center',
        }}>
          {/* Floating emojis */}
          {FLOAT_EMOJIS.map((fe, i) => (
            <span key={i} style={{
              position: 'absolute',
              top: fe.top,
              left: fe.left,
              fontSize: fe.size,
              opacity: 0.12,
              animation: `float-emoji 25s ease-in-out infinite`,
              animationDelay: `${fe.delay}s`,
              pointerEvents: 'none',
              zIndex: 0,
              userSelect: 'none',
            }}>
              {fe.e}
            </span>
          ))}

          <div style={{
            ...containerStyle,
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: 'center',
            gap: 48,
            position: 'relative',
            zIndex: 1,
          }}>
            {/* Left: Text */}
            <div style={{ flex: 1, textAlign: isMobile ? 'center' : 'left' }}>
              <h1 style={{
                fontSize: isMobile ? 38 : 56,
                fontWeight: 800,
                color: C.text,
                lineHeight: 1.08,
                letterSpacing: '-0.04em',
                marginBottom: 8,
                fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, sans-serif",
              }}>
                Utilisez<br />
                <span style={{
                  background: 'linear-gradient(135deg, #1A1A1A 0%, #6B6B6B 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}>vraiment</span>{' '}
                l&apos;IA.
              </h1>
              <h2 style={{
                fontSize: isMobile ? 20 : 26,
                fontWeight: 500,
                color: C.secondary,
                lineHeight: 1.3,
                marginBottom: 16,
                letterSpacing: '-0.01em',
              }}>
                Facile et gratuit<span style={{ color: C.muted, fontWeight: 400 }}>*</span>
              </h2>
              <p style={{
                fontSize: isMobile ? 15 : 17,
                color: C.secondary,
                lineHeight: 1.6,
                marginBottom: 8,
                maxWidth: 520,
                marginLeft: isMobile ? 'auto' : undefined,
                marginRight: isMobile ? 'auto' : undefined,
              }}>
                +150 assistants IA sur mesure pour vous
              </p>
              <p style={{
                fontSize: 11,
                color: C.muted,
                marginBottom: 32,
                maxWidth: 520,
                marginLeft: isMobile ? 'auto' : undefined,
                marginRight: isMobile ? 'auto' : undefined,
                fontStyle: 'italic',
              }}>
                *pas d&apos;abonnement · pas de commission sur les tokens
              </p>
              <div style={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row',
                gap: 12,
                justifyContent: isMobile ? 'center' : 'flex-start',
              }}>
                <Link href="/login" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 28px',
                  background: C.text,
                  color: '#FFFFFF',
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  transition: 'opacity 0.2s ease',
                  border: 'none',
                }}>
                  Accéder à Freenzy &rarr;
                </Link>
                <Link href="#features" style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  padding: '14px 28px',
                  background: 'transparent',
                  color: C.text,
                  borderRadius: 10,
                  fontSize: 15,
                  fontWeight: 600,
                  textDecoration: 'none',
                  border: `1px solid ${C.border}`,
                  transition: 'background 0.2s ease',
                }}>
                  Découvrir &darr;
                </Link>
              </div>
            </div>

            {/* Right: Desktop + Phone mockups */}
            <div style={{
              flex: 1,
              maxWidth: isMobile ? '100%' : 540,
              width: '100%',
              display: 'flex',
              gap: 16,
              alignItems: 'flex-start',
              justifyContent: 'center',
            }}>
              {/* Desktop mockup */}
              <div style={{ flex: 1, maxWidth: isMobile ? '65%' : 360 }}>
                <div style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 12,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                }}>
                  {/* Browser chrome */}
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '8px 12px',
                    borderBottom: `1px solid ${C.border}`,
                    background: C.bgSec,
                  }}>
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FF5F56' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#FFBD2E' }} />
                    <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#27C93F' }} />
                    <span style={{ marginLeft: 'auto', fontSize: 9, color: C.muted, fontFamily: 'monospace' }}>freenzy.io</span>
                  </div>

                  <div style={{ display: 'flex', minHeight: 260 }}>
                    {/* Sidebar */}
                    <div style={{
                      width: 44,
                      borderRight: `1px solid ${C.border}`,
                      padding: '10px 4px',
                      background: C.bgSec,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 6,
                    }}>
                      {['🏠', '💬', '🤖', '📄', '🎨', '📊', '⚙️'].map((emoji, i) => (
                        <div key={i} style={{
                          width: 28,
                          height: 28,
                          borderRadius: 6,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: 14,
                          background: i === 0 ? C.bg : 'transparent',
                          cursor: 'default',
                        }}>
                          {emoji}
                        </div>
                      ))}
                    </div>

                    {/* Main content */}
                    <div style={{ flex: 1, padding: 12 }}>
                      <div style={{ fontSize: 10, color: C.muted, marginBottom: 2 }}>🏠 Accueil</div>
                      <div style={{ fontSize: 14, fontWeight: 700, color: C.text, marginBottom: 10 }}>
                        Bonjour Emmanuel 👋
                      </div>

                      {/* Stat cards */}
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 6, marginBottom: 10 }}>
                        {[
                          { value: '47', label: 'crédits', emoji: '💎', bg: '#F0FFF4' },
                          { value: '12', label: 'agents', emoji: '🤖', bg: '#F0F7FF' },
                          { value: '3', label: 'docs', emoji: '📄', bg: '#FFF8F0' },
                        ].map((s, i) => (
                          <div key={i} style={{
                            background: s.bg,
                            borderRadius: 6,
                            padding: '8px 4px',
                            textAlign: 'center',
                          }}>
                            <div style={{ fontSize: 12, marginBottom: 2 }}>{s.emoji}</div>
                            <div style={{ fontSize: 14, fontWeight: 800, color: C.text }}>{s.value}</div>
                            <div style={{ fontSize: 8, color: C.muted }}>{s.label}</div>
                          </div>
                        ))}
                      </div>

                      {/* Actions rapides */}
                      <div style={{ fontSize: 10, fontWeight: 600, color: C.text, marginBottom: 6 }}>Actions rapides ⚡</div>
                      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 4 }}>
                        {['📄 Nouveau devis', '💬 Chat IA', '📧 Envoyer email', '📊 Voir stats'].map((action, i) => (
                          <div key={i} style={{
                            padding: '5px 8px',
                            background: C.bgSec,
                            borderRadius: 4,
                            border: `1px solid ${C.border}`,
                            fontSize: 9,
                            color: C.secondary,
                            textAlign: 'center',
                          }}>
                            {action}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Phone mockup */}
              <div style={{ width: isMobile ? '32%' : 150, flexShrink: 0 }}>
                <div style={{
                  background: C.bg,
                  border: `2px solid ${C.border}`,
                  borderRadius: 20,
                  overflow: 'hidden',
                  boxShadow: '0 8px 32px rgba(0,0,0,0.06)',
                }}>
                  {/* Phone notch */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'center',
                    padding: '6px 0 4px',
                    background: C.bgSec,
                    borderBottom: `1px solid ${C.border}`,
                  }}>
                    <div style={{ width: 36, height: 4, borderRadius: 2, background: C.border }} />
                  </div>

                  {/* Phone content */}
                  <div style={{ padding: 8, minHeight: 220 }}>
                    <div style={{ fontSize: 11, fontWeight: 700, color: C.text, marginBottom: 8 }}>
                      Bonjour 👋
                    </div>

                    <div style={{ display: 'flex', flexDirection: 'column', gap: 4, marginBottom: 8 }}>
                      {[
                        { value: '47', label: 'crédits', bg: '#F0FFF4' },
                        { value: '12', label: 'agents', bg: '#F0F7FF' },
                        { value: '3', label: 'docs', bg: '#FFF8F0' },
                      ].map((s, i) => (
                        <div key={i} style={{
                          background: s.bg,
                          borderRadius: 4,
                          padding: '4px 6px',
                          display: 'flex',
                          justifyContent: 'space-between',
                          alignItems: 'center',
                        }}>
                          <span style={{ fontSize: 8, color: C.muted }}>{s.label}</span>
                          <span style={{ fontSize: 11, fontWeight: 800, color: C.text }}>{s.value}</span>
                        </div>
                      ))}
                    </div>

                    <div style={{ fontSize: 8, fontWeight: 600, color: C.text, marginBottom: 4 }}>Actions ⚡</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
                      {['📄 Devis', '💬 Chat IA', '📧 Email'].map((action, i) => (
                        <div key={i} style={{
                          padding: '3px 6px',
                          background: C.bgSec,
                          borderRadius: 3,
                          border: `1px solid ${C.border}`,
                          fontSize: 8,
                          color: C.secondary,
                        }}>
                          {action}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 2 — TOOLS GRID
           ══════════════════════════════════════════════════════ */}
        <section id="features" style={{ ...sectionStyle(C.bgSec) }}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>+150 outils IA pour tout automatiser 🛠️</h2>
            <p style={sectionSub}>Chaque outil est cliquable — découvrez ce qu&apos;il fait en un clic.</p>
          </div>

          {/* Tool columns grid */}
          <div style={{
            ...containerStyle,
            display: isMobile ? 'flex' : 'grid',
            gridTemplateColumns: 'repeat(4, 1fr)',
            gap: 16,
            overflowX: isMobile ? 'auto' : undefined,
            WebkitOverflowScrolling: 'touch',
            paddingBottom: isMobile ? 12 : 0,
          }}>
            {TOOL_COLUMNS.map((col, ci) => (
              <div key={ci} style={{
                background: C.bg,
                border: `1px solid ${C.border}`,
                borderRadius: 12,
                overflow: 'hidden',
                minWidth: isMobile ? 260 : undefined,
                flexShrink: 0,
              }}>
                {/* Column header */}
                <div style={{
                  padding: '14px 16px',
                  background: col.color,
                  color: '#FFFFFF',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                }}>
                  <span style={{ fontSize: 14, fontWeight: 700 }}>{col.title}</span>
                  <span style={{
                    fontSize: 11,
                    fontWeight: 600,
                    background: 'rgba(255,255,255,0.25)',
                    padding: '2px 8px',
                    borderRadius: 10,
                  }}>
                    {col.tools.length}
                  </span>
                </div>

                {/* Tools list */}
                <div style={{ padding: '8px 0' }}>
                  {col.tools.map((tool, ti) => {
                    const toolKey = `${ci}-${ti}`;
                    const isExpanded = expandedTools[toolKey];
                    return (
                      <div key={ti}>
                        <button
                          onClick={() => toggleTool(toolKey)}
                          style={{
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            width: '100%',
                            padding: '8px 14px',
                            background: isExpanded ? C.bgSec : 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            textAlign: 'left',
                            fontSize: 13,
                            color: C.text,
                            fontWeight: 500,
                            transition: 'background 0.15s ease',
                          }}
                        >
                          <span style={{ fontSize: 15, flexShrink: 0 }}>{tool.emoji}</span>
                          <span style={{ flex: 1 }}>{tool.name}</span>
                          <span style={{
                            fontSize: 14,
                            color: C.muted,
                            transition: 'transform 0.2s ease',
                            transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)',
                            flexShrink: 0,
                          }}>
                            ›
                          </span>
                        </button>
                        {isExpanded && (
                          <div style={{
                            padding: '4px 14px 10px 37px',
                            fontSize: 12,
                            color: C.secondary,
                            lineHeight: 1.5,
                            background: C.bgSec,
                          }}>
                            {tool.desc}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 3 — DASHBOARD ADAPTÉ
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Un dashboard qui s&apos;adapte à votre activité 🎯</h2>
            <p style={sectionSub}>Dites-nous ce que vous faites, l&apos;IA organise tout pour vous.</p>

            {/* Profile selector dots */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 12, marginBottom: 32 }}>
              {DASHBOARD_PROFILES.map((prof, i) => (
                <button
                  key={i}
                  onClick={() => selectDashProfile(i)}
                  style={{
                    padding: '8px 20px',
                    background: dashProfileIdx === i ? C.text : C.bg,
                    color: dashProfileIdx === i ? '#FFFFFF' : C.text,
                    border: `1px solid ${dashProfileIdx === i ? C.text : C.border}`,
                    borderRadius: 20,
                    fontSize: 14,
                    fontWeight: 600,
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                >
                  {prof.label}
                </button>
              ))}
            </div>

            {/* Mockups display */}
            <div style={{
              display: 'flex',
              gap: 24,
              justifyContent: 'center',
              alignItems: 'flex-start',
              flexDirection: isMobile ? 'column' : 'row',
              maxWidth: 800,
              margin: '0 auto',
            }}>
              {/* Desktop mockup */}
              <div style={{ flex: 1, maxWidth: isMobile ? '100%' : 500 }}>
                <DashMockup profile={DASHBOARD_PROFILES[dashProfileIdx]} />
              </div>

              {/* Phone mockup */}
              {!isMobile && (
                <div style={{ width: 180 }}>
                  <DashMockup profile={DASHBOARD_PROFILES[dashProfileIdx]} compact />
                </div>
              )}
            </div>

            {/* Dots indicator */}
            <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24 }}>
              {DASHBOARD_PROFILES.map((_, i) => (
                <div
                  key={i}
                  onClick={() => selectDashProfile(i)}
                  style={{
                    width: dashProfileIdx === i ? 24 : 8,
                    height: 8,
                    borderRadius: 4,
                    background: dashProfileIdx === i ? C.text : C.border,
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                  }}
                />
              ))}
            </div>

            {/* Label overlay */}
            <div style={{
              textAlign: 'center',
              marginTop: 20,
            }}>
              <span style={{
                background: C.text,
                color: '#FFFFFF',
                fontSize: 12,
                fontWeight: 600,
                padding: '6px 14px',
                borderRadius: 20,
              }}>
                ✨ Le menu s&apos;adapte selon votre profil
              </span>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 4 — PROFILES
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Quel que soit votre métier 🎯</h2>
            <p style={sectionSub}>Freenzy s&apos;adapte à votre activité avec des assistants spécialisés.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 16,
            }}>
              {PROFILES.map((p, i) => {
                const isExpanded = expandedProfile === i;
                return (
                  <div
                    key={i}
                    onClick={() => setExpandedProfile(isExpanded ? null : i)}
                    onMouseEnter={() => setHoveredProfile(i)}
                    onMouseLeave={() => setHoveredProfile(null)}
                    style={{
                      ...cardStyle,
                      textAlign: 'center',
                      cursor: 'pointer',
                      position: 'relative',
                      padding: 28,
                      gridColumn: isExpanded && !isMobile ? 'span 2' : undefined,
                      gridRow: isExpanded && !isMobile ? 'span 2' : undefined,
                      transition: 'all 0.25s ease',
                      boxShadow: hoveredProfile === i || isExpanded ? '0 4px 16px rgba(0,0,0,0.08)' : 'none',
                    }}
                  >
                    <div style={{ fontSize: 36, marginBottom: 10 }}>{p.emoji}</div>
                    <div style={{ fontSize: 16, fontWeight: 600, color: C.text, marginBottom: 4 }}>{p.name}</div>
                    <div style={{ fontSize: 13, color: C.muted, marginBottom: isExpanded ? 14 : 0 }}>{p.count} assistants dédiés</div>

                    {isExpanded && p.useCases && (
                      <div style={{
                        paddingTop: 14,
                        borderTop: `1px solid ${C.border}`,
                        textAlign: 'left',
                      }}>
                        {p.useCases.map((uc, ui) => (
                          <div key={ui} style={{
                            display: 'flex',
                            gap: 10,
                            padding: '8px 0',
                            borderBottom: ui < p.useCases.length - 1 ? `1px solid ${C.border}` : 'none',
                          }}>
                            <span style={{ fontSize: 18, flexShrink: 0, lineHeight: 1.4 }}>{uc.emoji}</span>
                            <div>
                              <div style={{ fontSize: 13, fontWeight: 600, color: C.text, marginBottom: 2 }}>{uc.title}</div>
                              <div style={{ fontSize: 12, color: C.secondary, lineHeight: 1.5 }}>{uc.desc}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {!isExpanded && hoveredProfile === i && (
                      <div style={{
                        marginTop: 14,
                        paddingTop: 14,
                        borderTop: `1px solid ${C.border}`,
                      }}>
                        {p.assistants.map((a, ai) => (
                          <div key={ai} style={{
                            fontSize: 12,
                            color: C.secondary,
                            padding: '3px 0',
                          }}>
                            {a}
                          </div>
                        ))}
                        <div style={{ fontSize: 11, color: C.muted, marginTop: 8, fontStyle: 'italic' }}>
                          Cliquez pour voir le détail →
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 5 — HOW IT WORKS
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Opérationnel en 2 minutes ⚡</h2>
            <p style={sectionSub}>3 étapes simples pour démarrer.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 24,
            }}>
              {[
                { emoji: '🎯', step: '1', title: 'Testez gratuitement', desc: 'Pas de carte bancaire. 5 messages gratuits pour découvrir.' },
                { emoji: '⚙️', step: '2', title: 'On configure tout', desc: 'Quiz rapide de 2 minutes. Dashboard personnalisé selon votre métier.' },
                { emoji: '🚀', step: '3', title: 'Vos assistants travaillent', desc: 'Briefings, relances, documents — tout se fait automatiquement.' },
              ].map((s, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: 32,
                }}>
                  <div style={{ fontSize: 40, marginBottom: 16 }}>{s.emoji}</div>
                  <div style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 28,
                    height: 28,
                    borderRadius: '50%',
                    background: C.text,
                    color: '#fff',
                    fontSize: 13,
                    fontWeight: 700,
                    marginBottom: 12,
                  }}>
                    {s.step}
                  </div>
                  <h3 style={{ fontSize: 18, fontWeight: 700, color: C.text, marginBottom: 8 }}>{s.title}</h3>
                  <p style={{ fontSize: 14, color: C.secondary, lineHeight: 1.6, margin: 0 }}>{s.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 6 — FORMATIONS
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Formez-vous gratuitement 🎓</h2>
            <p style={sectionSub}>22 parcours, 396 leçons, diplômes téléchargeables</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 20,
              maxWidth: 900,
              margin: '0 auto',
            }}>
              {[
                { emoji: '🧠', title: 'Prompt Engineering', level: 'Intermédiaire', duration: '1h', color: '#F0F7FF' },
                { emoji: '🎨', title: 'Créer du contenu pro', level: 'Débutant', duration: '1h', color: '#FFF8F0' },
                { emoji: '🛡️', title: 'Droit de l\'IA', level: 'Avancé', duration: '1h', color: '#F0FFF4' },
              ].map((course, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  padding: 28,
                  textAlign: 'center',
                }}>
                  <div style={{
                    width: 56,
                    height: 56,
                    borderRadius: 14,
                    background: course.color,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: 28,
                    margin: '0 auto 16px',
                  }}>
                    {course.emoji}
                  </div>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: C.text, marginBottom: 8 }}>{course.title}</h3>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: 8, marginBottom: 4 }}>
                    <span style={{
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: C.bgSec,
                      border: `1px solid ${C.border}`,
                      color: C.secondary,
                      fontWeight: 500,
                    }}>
                      {course.level}
                    </span>
                    <span style={{
                      fontSize: 11,
                      padding: '3px 10px',
                      borderRadius: 12,
                      background: C.bgSec,
                      border: `1px solid ${C.border}`,
                      color: C.secondary,
                      fontWeight: 500,
                    }}>
                      {course.duration}
                    </span>
                  </div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/client/learn" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                background: C.text,
                color: '#fff',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Voir toutes les formations &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 7 — NEWS IA
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>L&apos;actu IA, résumée pour vous 📰</h2>
            <p style={sectionSub}>Les dernières nouvelles du monde de l&apos;intelligence artificielle.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? '1fr' : 'repeat(3, 1fr)',
              gap: 20,
              maxWidth: 900,
              margin: '0 auto',
            }}>
              {[
                { emoji: '🧠', title: 'Claude 4 Opus : ce que ça change pour les entreprises', date: '15 mars 2026', tag: 'Modèles IA' },
                { emoji: '⚖️', title: 'AI Act européen : les nouvelles obligations pour 2026', date: '14 mars 2026', tag: 'Régulation' },
                { emoji: '🚀', title: 'Comment les PME françaises adoptent l\'IA en 2026', date: '13 mars 2026', tag: 'Tendances' },
              ].map((article, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  padding: 24,
                }}>
                  <div style={{ fontSize: 32, marginBottom: 12 }}>{article.emoji}</div>
                  <span style={{
                    fontSize: 11,
                    padding: '3px 10px',
                    borderRadius: 12,
                    background: C.bgSec,
                    border: `1px solid ${C.border}`,
                    color: C.muted,
                    fontWeight: 500,
                  }}>
                    {article.tag}
                  </span>
                  <h3 style={{ fontSize: 15, fontWeight: 600, color: C.text, marginTop: 10, marginBottom: 8, lineHeight: 1.4 }}>
                    {article.title}
                  </h3>
                  <div style={{ fontSize: 12, color: C.muted }}>{article.date}</div>
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 32 }}>
              <Link href="/client/news-ai" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '12px 24px',
                background: C.text,
                color: '#fff',
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Lire toutes les news &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 8 — TARIFS (CRÉDITS ONLY)
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bgSec)}>
          <div style={containerStyle}>
            <h2 style={sectionTitle}>Transparent et sans surprise 💎</h2>
            <p style={sectionSub}>Pas d&apos;abonnement. Rechargez quand vous voulez.</p>

            <div style={{
              display: 'grid',
              gridTemplateColumns: isMobile ? 'repeat(2, 1fr)' : 'repeat(4, 1fr)',
              gap: 16,
              maxWidth: 900,
              margin: '0 auto 32px',
            }}>
              {[
                { credits: '10', price: '10€', bonus: null },
                { credits: '50', price: '45€', bonus: '10% offert' },
                { credits: '100', price: '80€', bonus: '20% offert', highlight: true },
                { credits: '500', price: '350€', bonus: '30% offert' },
              ].map((pack, i) => (
                <div key={i} style={{
                  ...cardStyle,
                  textAlign: 'center',
                  padding: 28,
                  border: pack.highlight ? `2px solid ${C.text}` : `1px solid ${C.border}`,
                  position: 'relative',
                }}>
                  {pack.highlight && (
                    <div style={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      background: C.text,
                      color: '#fff',
                      fontSize: 11,
                      fontWeight: 600,
                      padding: '4px 14px',
                      borderRadius: 20,
                      whiteSpace: 'nowrap',
                    }}>
                      Populaire
                    </div>
                  )}
                  <div style={{ fontSize: 36, fontWeight: 800, color: C.text, marginBottom: 4 }}>{pack.credits}</div>
                  <div style={{ fontSize: 13, color: C.muted, marginBottom: 12 }}>crédits</div>
                  <div style={{ fontSize: 24, fontWeight: 700, color: C.text, marginBottom: 4 }}>{pack.price}</div>
                  {pack.bonus && (
                    <div style={{
                      fontSize: 12,
                      color: '#16A34A',
                      fontWeight: 600,
                      marginTop: 8,
                      padding: '3px 10px',
                      background: '#F0FFF4',
                      borderRadius: 12,
                      display: 'inline-block',
                    }}>
                      {pack.bonus}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{
              textAlign: 'center',
              padding: '16px 24px',
              background: C.bg,
              border: `1px solid ${C.border}`,
              borderRadius: 12,
              maxWidth: 500,
              margin: '0 auto',
            }}>
              <p style={{ fontSize: 14, color: C.text, fontWeight: 500, margin: 0 }}>
                🎁 50 crédits offerts à l&apos;inscription · 1 crédit ≈ 1 action IA
              </p>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 9 — FAQ
           ══════════════════════════════════════════════════════ */}
        <section style={sectionStyle(C.bg)}>
          <div style={{ ...containerStyle, maxWidth: 720 }}>
            <h2 style={sectionTitle}>Des questions ? 💬</h2>
            <p style={sectionSub}>Les réponses aux 10 questions les plus posées.</p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
              {FAQ_SELECTION.map((faq, i) => (
                <div key={i} style={{
                  background: C.bg,
                  border: `1px solid ${C.border}`,
                  borderRadius: 10,
                  overflow: 'hidden',
                }}>
                  <button
                    onClick={() => setOpenFaq(openFaq === i ? null : i)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      width: '100%',
                      padding: '16px 20px',
                      background: 'transparent',
                      border: 'none',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontSize: 14,
                      fontWeight: 600,
                      color: C.text,
                      lineHeight: 1.4,
                    }}
                  >
                    <span style={{ flex: 1, paddingRight: 16 }}>{faq.q}</span>
                    <span style={{
                      fontSize: 18,
                      color: C.muted,
                      transition: 'transform 0.2s ease',
                      transform: openFaq === i ? 'rotate(45deg)' : 'rotate(0deg)',
                      flexShrink: 0,
                    }}>
                      +
                    </span>
                  </button>
                  {openFaq === i && (
                    <div style={{
                      padding: '0 20px 16px',
                      fontSize: 13,
                      color: C.secondary,
                      lineHeight: 1.7,
                    }}>
                      {faq.a.length > 300 ? faq.a.substring(0, 300) + '...' : faq.a}
                    </div>
                  )}
                </div>
              ))}
            </div>

            <div style={{ textAlign: 'center', marginTop: 24 }}>
              <Link href="/faq" style={{
                fontSize: 14,
                color: C.text,
                fontWeight: 600,
                textDecoration: 'underline',
                textUnderlineOffset: 3,
              }}>
                Voir les 100+ questions &rarr;
              </Link>
            </div>
          </div>
        </section>

        {/* ══════════════════════════════════════════════════════
            SECTION 10 — PARRAINAGE
           ══════════════════════════════════════════════════════ */}
        <section style={{
          ...sectionStyle(C.text),
          padding: '64px 24px',
        }}>
          <div style={{
            ...containerStyle,
            textAlign: 'center',
          }}>
            <h2 style={{ fontSize: 32, fontWeight: 800, color: '#FFFFFF', marginBottom: 12, letterSpacing: '-0.02em' }}>
              Partagez Freenzy, gagnez des crédits 🎁
            </h2>
            <p style={{ fontSize: 16, color: 'rgba(255,255,255,0.7)', marginBottom: 12, maxWidth: 520, margin: '0 auto 12px' }}>
              Invitez un ami &rarr; vous gagnez 20 crédits, il gagne 20 crédits.
            </p>
            <p style={{ fontSize: 13, color: 'rgba(255,255,255,0.5)', marginBottom: 28, maxWidth: 480, margin: '0 auto 28px' }}>
              Sans limite de parrainages.
            </p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Link href="/client/referrals" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 28px',
                background: '#FFFFFF',
                color: C.text,
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
              }}>
                Obtenir mon lien &rarr;
              </Link>
              <Link href="/login?mode=register" style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '14px 28px',
                background: 'transparent',
                color: '#FFFFFF',
                borderRadius: 10,
                fontSize: 15,
                fontWeight: 600,
                textDecoration: 'none',
                border: '1px solid rgba(255,255,255,0.3)',
              }}>
                Créer mon compte
              </Link>
            </div>
          </div>
        </section>

      </main>

      {/* ══════════════════════════════════════════════════════
          SECTION 11 — FOOTER
         ══════════════════════════════════════════════════════ */}
      <PublicFooter />
    </>
  );
}
