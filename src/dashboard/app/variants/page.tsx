'use client';

import { useState } from 'react';
import Link from 'next/link';
import PublicNav from '../../components/PublicNav';
import PublicFooter from '../../components/PublicFooter';

/* ═══════════════════════════════════════════════════════════
   DATA — Historique + Variantes + Analyses Claude
   ═══════════════════════════════════════════════════════════ */

type ReviewItem = { label: string; type: 'good' | 'issue' | 'missing'; items: string[] };

interface LandingVersion {
  id: string;
  number?: string;
  name: string;
  desc: string;
  date: string;
  commit?: string;
  badge: { text: string; type: 'active' | 'archived' | 'variant' | 'v0' };
  colors: string[];
  meta: { label: string; value: string }[];
  sections?: string[];
  link?: string;          // route interne (variant viewable)
  githubUrl?: string;
  reviews: ReviewItem[];
  score: number;
  scoreLabel?: string;
}

const PRODUCTION: LandingVersion = {
  id: 'v8',
  number: '8',
  name: 'Design System Refresh + 82 Agents',
  desc: 'Version actuelle en production. Blue-violet (#5b6cf7), Material Icons partout, 82 agents (22 business + 12 perso + 48 marketplace). 11 sections: hero, stats ticker, outils IA, modeles IA, ecosysteme, agents tabs, avantages, temoignages, FAQ, CTA final, footer. Animations CSS natives. Dark theme unifie.',
  date: '8 mars 2026',
  commit: '1f9f068',
  badge: { text: 'EN PROD', type: 'active' },
  colors: ['#5b6cf7', '#0a0a0f', '#22c55e', '#a5b4fc'],
  meta: [
    { label: 'Commit', value: '1f9f068' },
    { label: 'Date', value: '8 mars 2026' },
    { label: 'Branche', value: 'main' },
    { label: 'Fichier', value: 'app/page.tsx (~970 lignes)' },
  ],
  sections: ['Hero + CTA', 'Stats Ticker', 'Outils IA (6)', 'Modeles IA (6)', 'Ecosysteme (6)', 'Agent Tabs (12)', 'Avantages (6)', 'Temoignages', 'FAQ Accordion', 'CTA Final', 'Enterprise Section'],
  link: '/',
  githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/page.tsx',
  reviews: [
    { label: 'CE QUI FONCTIONNE', type: 'good', items: [
      'Hero clair avec proposition de valeur "Free & Easy" immediate',
      'Stats ticker dynamique (82+ agents, 0% commission, 24/7)',
      'Tous les modeles IA listes (Claude, GPT, Gemini, Llama, Grok, Mistral)',
      'Agent tabs interactifs avec descriptions detaillees',
      'FAQ accordion integree dans la landing (pas une page separee)',
      'CTA fort "Commencer gratuitement" repete 3 fois',
      'Material Icons uniforme (plus d\'emojis)',
    ]},
    { label: 'PROBLEMES IDENTIFIES', type: 'issue', items: [
      'Page trop longue (~970 lignes JSX) — risque de bounce au scroll',
      'Pas de video demo / screencast du produit en action',
      'Pas de preuve sociale reelle (temoignages fictifs, pas de logos clients)',
      'Le hero ne montre pas le produit — aucun screenshot/mockup du dashboard',
      'Le "0% commission" est repete trop souvent, dilue le message',
      'Sections "Ecosysteme" et "Modeles IA" peu differenciees visuellement',
      'Pas d\'animation d\'entree (les sections apparaissent d\'un bloc)',
    ]},
    { label: 'CE QUI MANQUE', type: 'missing', items: [
      'Screenshot/mockup du dashboard Flashboard dans le hero',
      'Video demo de 30-60s montrant le produit',
      'Logos de clients ou partenaires ("Ils nous font confiance")',
      'Comparatif visuel prix vs concurrence (tableau ou cards)',
      'Section "Comment ca marche" en 3 etapes illustrees',
      'Micro-animations au scroll (fade-in, slide-up)',
      'Indicateur de scroll ou ancres de navigation',
      'Social proof : nombre d\'utilisateurs, reviews, ratings',
    ]},
  ],
  score: 62,
};

const HISTORY: LandingVersion[] = [
  {
    id: 'v7', number: '7', name: 'Design System Refresh — Material Icons',
    desc: 'Migration massive : tous les emojis remplaces par Material Symbols Rounded. Blue-violet #5b6cf7. 72 agents (avant l\'ajout des 10 enterprise). Cookie consent, audit securite, streaming fixes. Landing identique a V6 visuellement mais code propre.',
    date: '6 mars 2026', commit: '1e7090d',
    badge: { text: '1e7090d', type: 'archived' },
    colors: ['#5b6cf7', '#0a0a0f', '#22c55e'],
    meta: [{ label: 'Date', value: '6 mars 2026' }, { label: 'Delta', value: 'Emojis → Material Icons partout' }],
    reviews: [
      { label: 'AMELIORATIONS', type: 'good', items: ['Coherence visuelle : Material Icons uniforme (plus de mix emoji/icon)', 'Chiffres corrects : 72 agents a l\'epoque (coherent)'] },
      { label: 'RESTE A FAIRE', type: 'issue', items: ['Memes problemes structurels que V6 (pas de demo, pas de screenshot)', 'Le passage emojis → icons n\'a pas change la structure de la page'] },
    ],
    score: 58,
  },
  {
    id: 'v6', number: '6', name: 'Blue-Violet Accent — Design Harmony',
    desc: 'Shift de couleur accent sur 80 fichiers. Unification dark/light themes. Logo FREENZY.IO dans le nav. Meme structure de page, couleurs plus froides et professionnelles.',
    date: '6 mars 2026 (matin)', commit: '00133d2',
    badge: { text: '00133d2', type: 'archived' },
    colors: ['#5b6cf7', '#0a0a0f'],
    meta: [{ label: 'Date', value: '6 mars 2026 (matin)' }, { label: 'Delta', value: 'Purple #6366f1 → Blue-violet #5b6cf7' }],
    reviews: [
      { label: 'AMELIORATIONS', type: 'good', items: ['Couleur plus distinctive et unique (pas le classique Tailwind indigo)', 'Harmonie visuelle globale amelioree'] },
      { label: 'LIMITATIONS', type: 'issue', items: ['Changement cosmetique uniquement — la structure n\'a pas change', 'Toujours pas de differentiation claire du hero'] },
    ],
    score: 55,
  },
  {
    id: 'v5', number: '5', name: 'Landing Polish — Logo, Sections, Mobile',
    desc: 'Corrections de bugs mobile, logo recentre, sections reordonnees. Ajustements de padding et spacing. Pas de changement structural majeur, mais meilleure experience mobile.',
    date: '6 mars 2026', commit: '84f667d',
    badge: { text: '84f667d', type: 'archived' },
    colors: [],
    meta: [{ label: 'Date', value: '6 mars 2026' }, { label: 'Delta', value: 'Polissage general + fixes mobile' }],
    reviews: [
      { label: 'AMELIORATIONS', type: 'good', items: ['Responsive mobile corrige (plus de debordements)', 'Logo gradient propre'] },
      { label: 'LIMITATIONS', type: 'issue', items: ['Polish sans refonte — les problemes de fond restent'] },
    ],
    score: 50,
  },
  {
    id: 'v4', number: '4', name: 'Refonte Landing — Outils, Logo Gradient, Reorg',
    desc: 'Grande refonte : ajout des outils users (6 actions concretes), logo gradient anime, reorganisation complete des sections. Introduction du bento grid, agent tabs, et FAQ accordion. C\'est la base de la landing actuelle.',
    date: '6 mars 2026 (2h du matin)', commit: 'b9f1008',
    badge: { text: 'b9f1008', type: 'archived' },
    colors: [],
    meta: [{ label: 'Date', value: '6 mars 2026 (2h du matin)' }, { label: 'Delta', value: 'Premiere vraie refonte de la structure' }],
    reviews: [
      { label: 'AMELIORATIONS', type: 'good', items: ['Premiere version avec une vraie structure marketing', 'Outils concrets montres (pas juste "IA pour tout")', 'FAQ integree — reduit les frictions'] },
      { label: 'LIMITATIONS', type: 'issue', items: ['Premiere iteration — trop d\'infos, pas assez de hierarchie', 'Hero encore generique ("Free & Easy" sans visuel produit)'] },
    ],
    score: 48,
  },
  {
    id: 'v3', number: '3', name: 'UX Refonte Mobile-First',
    desc: 'Focus mobile-first pour le dashboard ET la landing. Bottom tab bar, sidebar responsive, topbar mobile. La landing a gagne un meilleur responsive mais la structure etait encore basique.',
    date: '5 mars 2026', commit: '00fbc9a',
    badge: { text: '00fbc9a', type: 'archived' },
    colors: [],
    meta: [{ label: 'Date', value: '5 mars 2026' }, { label: 'Delta', value: 'Responsive complet, navigation mobile' }],
    reviews: [
      { label: 'LIMITATIONS', type: 'issue', items: ['Landing secondaire — le focus etait sur le dashboard', 'Structure hero tres simple, peu de sections marketing'] },
    ],
    score: 35,
  },
  {
    id: 'v2', number: '2', name: 'Freenzy.io v0.19 — Premier deploy',
    desc: 'Premiere version deployable apres le rebranding complet. Logo FREENZY.IO, navigation simplifiee (Demo + Login seulement), 24 agents avec prefixe fz-*. Landing fonctionnelle mais pas optimisee marketing.',
    date: '5 mars 2026', commit: 'a1782f2',
    badge: { text: 'a1782f2', type: 'archived' },
    colors: [],
    meta: [{ label: 'Date', value: '5 mars 2026' }, { label: 'Delta', value: 'Post-rebranding SARAH OS → Freenzy.io' }],
    reviews: [
      { label: 'LIMITATIONS', type: 'issue', items: ['Landing "par defaut" — pas de reflexion marketing', 'Branding nouveau mais page generique', 'Pas de sections differenciantes'] },
    ],
    score: 25,
  },
  {
    id: 'v1', number: '1', name: 'SARAH OS v0.10 — Initial',
    desc: 'Version initiale sous le nom SARAH OS. Landing simple avec hero, description du produit, et boutons d\'action. Prefixes sarah-*, emojis partout, navigation complete (Tarifs, Claude AI, WhatsApp, Demo).',
    date: '1 mars 2026',
    badge: { text: 'V0', type: 'v0' },
    colors: [],
    meta: [{ label: 'Date', value: '1 mars 2026' }, { label: 'Delta', value: 'Premier commit, nom SARAH OS' }],
    reviews: [
      { label: 'LIMITATIONS', type: 'issue', items: ['Nom "SARAH OS" pas assez commercial', 'Navigation trop complexe (5+ liens publics)', 'Landing technique, pas marketing', 'Emojis au lieu d\'icons — aspect non-professionnel'] },
    ],
    score: 15,
  },
];

const VARIANTS: LandingVersion[] = [
  {
    id: 'v019-mercredi', name: 'v0.19 — Mercredi 5 mars (1er deploy)',
    desc: 'La toute premiere version deployee sur Coolify. Emojis partout (pas encore Material Icons), 72 agents, accent indigo #6366f1. Meme structure de sections que la version actuelle mais avec des emojis au lieu d\'icons. C\'est le point de depart avant les 3 jours de polish intensif (V3→V8).',
    date: '5 mars 2026 ~16h', commit: 'a1782f2', number: 'W',
    badge: { text: 'ARCHIVE', type: 'variant' },
    colors: ['#6366f1', '#0a0a0f', '#22c55e'],
    meta: [
      { label: 'Commit', value: 'a1782f2' },
      { label: 'Date', value: '5 mars 2026 ~16h' },
      { label: 'Contexte', value: 'Premier deploy Coolify, post-rebranding' },
      { label: 'Agents', value: '72 (24 core + 48 marketplace)' },
    ],
    link: '/variants/v019-mercredi',
    githubUrl: 'https://github.com/Wonderself/sarahos/commit/a1782f2',
    reviews: [
      { label: 'CE QUI FONCTIONNE', type: 'good', items: ['Structure de sections deja complete (hero, modeles, ecosysteme, FAQ)', 'Meme architecture de donnees que la version actuelle', 'Deja le "Free & Easy" et "0% commission" comme message principal'] },
      { label: 'PROBLEMES', type: 'issue', items: ['Emojis partout — aspect non-professionnel et rendu inconsistant cross-platform', 'Couleur accent indigo #6366f1 generique (Tailwind default)', 'Pas de responsive mobile optimise', '72 agents (avant l\'ajout des 10 enterprise)', 'Pas de cookie consent, pas d\'animations'] },
    ],
    score: 30,
  },
  {
    id: 'original', name: 'Original (V8)', number: 'O',
    desc: 'La version actuelle copiee en variante pour comparaison. Blue-violet, focus agents IA & productivite.',
    date: '8 mars 2026',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#5b6cf7', '#0a0a0f', '#22c55e'],
    meta: [{ label: 'Style', value: 'Version actuelle en variante' }],
    link: '/variants/original',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/original/page.tsx',
    reviews: [
      { label: 'REFERENCE', type: 'good', items: ['Copie de la landing en production', 'Sert de base de comparaison pour les autres variantes'] },
    ],
    score: 62,
  },
  {
    id: 'neon-futuriste', name: 'Neon Futuriste', number: 'N',
    desc: 'Esthetique cyberpunk avec neons cyan et magenta sur fond ultra-sombre. Messaging agressif style Y Combinator — "On remplace votre equipe". Typographie bold, effets glow, animations agressives.',
    date: '',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#00f0ff', '#0a001a', '#ff00aa'],
    meta: [{ label: 'Style', value: 'Cyberpunk, neons vifs, messaging agressif' }, { label: 'Slogan', value: '"On remplace tout"' }],
    link: '/variants/neon-futuriste',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/neon-futuriste/page.tsx',
    reviews: [
      { label: 'POINTS FORTS', type: 'good', items: ['Tres impactant visuellement, memorable', 'Messaging clair et direct ("on remplace tout")', 'Bon pour capter l\'attention des early adopters tech'] },
      { label: 'RISQUES', type: 'issue', items: ['Trop agressif pour les PME traditionnelles (cible principale)', 'Le messaging "on remplace" peut faire peur aux decideurs', 'Lisibilite reduite avec les effets neon sur ecran mobile', 'Connotation "startup tech" peut exclure des secteurs (artisans, commerce)'] },
    ],
    score: 45,
  },
  {
    id: 'minimal-luxe', name: 'Minimal Luxe', number: 'M',
    desc: 'Design epure, tons creme et or. Typographie fine et elegante. Beaucoup de blanc, espacement genereux. Messaging calme et rassurant — "L\'app essentielle pour votre business". Style Apple/Notion.',
    date: '',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#c8a97e', '#faf8f5', '#1a1a1a'],
    meta: [{ label: 'Style', value: 'Minimaliste premium, tons neutres chauds' }, { label: 'Slogan', value: '"L\'app essentielle"' }],
    link: '/variants/minimal-luxe',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/minimal-luxe/page.tsx',
    reviews: [
      { label: 'POINTS FORTS', type: 'good', items: ['Perception premium — inspire confiance aux decideurs', 'Lisibilite excellente, peu de distractions', 'Style Apple/Notion reconnu et apprecie', 'Bien pour le B2B et les professions liberales'] },
      { label: 'RISQUES', type: 'issue', items: ['Peut paraitre "cher" alors que le produit est gratuit', 'Manque d\'energie/dynamisme pour un produit IA', 'Le fond clair entre en conflit avec le dark theme du dashboard', 'Moins memorable que les variantes plus colorees'] },
    ],
    score: 55,
  },
  {
    id: 'bold-disrupteur', name: 'Bold Disrupteur', number: 'B',
    desc: 'Rouge + jaune vif sur fond sombre. Typographie XXL, messaging provocateur. Style Y Combinator / Superhuman. Bold et polarisant — "Le Facebook de l\'IA pour entreprises".',
    date: '',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#ff3b30', '#ffe600', '#1a1a2e'],
    meta: [{ label: 'Style', value: 'Couleurs vives, typographie massive' }, { label: 'Slogan', value: '"Le nouveau Facebook"' }],
    link: '/variants/bold-disrupteur',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/bold-disrupteur/page.tsx',
    reviews: [
      { label: 'POINTS FORTS', type: 'good', items: ['Impossible de l\'ignorer — tres fort taux de clic potentiel', 'Messaging ambitieux qui positionne haut'] },
      { label: 'RISQUES', type: 'issue', items: ['"Le nouveau Facebook" est pretentieux et irrealiste — credibilite zero', 'Rouge + jaune = aesthetique "promo/discount", pas premium', 'Trop polarisant — exclut les profils conservateurs (la majorite des PME)', 'Le messaging promet plus que le produit ne delivre actuellement', 'Fatigue visuelle rapide avec les couleurs saturees'] },
    ],
    score: 30,
  },
  {
    id: 'gradient-wave', name: 'Gradient Wave', number: 'G',
    desc: 'Degrades purple → cyan → rose. Effets glassmorphism (cartes transparentes blur). Animations fluides de vagues. Style Linear/Vercel. Esthetique futuriste mais accessible.',
    date: '',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#7c3aed', '#06b6d4', '#f43f5e'],
    meta: [{ label: 'Style', value: 'Degrades fluides, glassmorphism' }, { label: 'Slogan', value: '"Le futur est la"' }],
    link: '/variants/gradient-wave',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/gradient-wave/page.tsx',
    reviews: [
      { label: 'POINTS FORTS', type: 'good', items: ['Le plus equilibre visuellement — moderne sans etre agressif', 'Glassmorphism tendance (Linear, Vercel, Stripe)', 'Palette coherente avec le blue-violet du dashboard', 'Bon compromis entre impact et lisibilite'] },
      { label: 'RISQUES', type: 'issue', items: ['Glassmorphism peut rendre le texte moins lisible sur certains fonds', 'Risque d\'etre generique (beaucoup de SaaS utilisent ce style)', 'Performances : les effets blur sont couteux sur mobile bas de gamme'] },
      { label: 'RECOMMANDATION', type: 'missing', items: ['MEILLEUR CANDIDAT pour remplacer la landing actuelle', 'A combiner avec le contenu de V8 (82 agents, Material Icons)', 'Ajouter un hero avec screenshot du dashboard'] },
    ],
    score: 70,
    scoreLabel: 'Score potentiel',
  },
  {
    id: 'original-v2', name: 'Original V2 (+ Audience)', number: 'O2',
    desc: 'Copie de la version actuelle avec switcher audience Particulier/Freelance/Entreprise. Hero, CTAs et section Enterprise s\'adaptent selon l\'audience selectionnee. Persistance localStorage.',
    date: '8 mars 2026',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#5b6cf7', '#0a0a0f', '#22c55e'],
    meta: [{ label: 'Style', value: 'V8 + segmentation audience' }, { label: 'Feature', value: 'Switcher iOS Particulier/Freelance/Entreprise' }],
    link: '/variants/original-v2',
    reviews: [
      { label: 'NOUVEAUTE', type: 'good', items: ['Switcher audience sticky sous le nav', 'Hero adapte par audience (headline, subheadline, badge)', 'CTAs contextualises (Essayer / Lancer / Demo)', 'Section Enterprise masquee pour Particulier et Freelance'] },
    ],
    score: 68,
  },
  {
    id: 'v019-mercredi-v2', name: 'v0.19 Mercredi V2 (+ Audience)', number: 'W2',
    desc: 'Copie de la version mercredi (1er deploy) avec switcher audience. Meme structure emojis + indigo mais avec hero et CTAs adaptes par audience.',
    date: '8 mars 2026',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#6366f1', '#0a0a0f', '#22c55e'],
    meta: [{ label: 'Style', value: 'v0.19 mercredi + segmentation audience' }, { label: 'Feature', value: 'Switcher iOS Particulier/Freelance/Entreprise' }],
    link: '/variants/v019-mercredi-v2',
    reviews: [
      { label: 'NOUVEAUTE', type: 'good', items: ['Switcher audience ajoute a la version historique', 'Permet de comparer l\'impact du switcher sur une ancienne version'] },
    ],
    score: 38,
  },
];

/* ═══════════════════════════════════════════════════════════
   STYLES
   ═══════════════════════════════════════════════════════════ */

const accent = '#5b6cf7';
const green = '#22c55e';
const red = '#ef4444';
const orange = '#f59e0b';
const border = 'rgba(255,255,255,0.06)';
const card = 'rgba(255,255,255,0.03)';
const text2 = 'rgba(255,255,255,0.45)';

function scoreColor(score: number) {
  if (score >= 65) return green;
  if (score >= 40) return orange;
  return red;
}

function badgeStyle(type: string): React.CSSProperties {
  const m: Record<string, { bg: string; color: string }> = {
    active: { bg: 'rgba(34,197,94,0.15)', color: green },
    archived: { bg: 'rgba(161,161,170,0.1)', color: 'rgba(255,255,255,0.4)' },
    variant: { bg: 'rgba(91,108,247,0.15)', color: accent },
    v0: { bg: 'rgba(161,161,170,0.1)', color: 'rgba(255,255,255,0.3)' },
  };
  const c = m[type] || m.archived;
  return { display: 'inline-block', fontSize: 10, fontWeight: 700, letterSpacing: 1, textTransform: 'uppercase', padding: '3px 10px', borderRadius: 6, background: c.bg, color: c.color };
}

function dotColor(type: string) {
  if (type === 'good') return green;
  if (type === 'issue') return red;
  return orange;
}

/* ═══════════════════════════════════════════════════════════
   COMPONENTS
   ═══════════════════════════════════════════════════════════ */

function ScoreBar({ score, label }: { score: number; label?: string }) {
  const c = scoreColor(score);
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 12, paddingTop: 12, borderTop: '1px solid rgba(91,108,247,0.12)' }}>
      <span style={{ fontSize: 11, color: text2, whiteSpace: 'nowrap' }}>{label || 'Score'}</span>
      <div style={{ flex: 1, height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
        <div style={{ width: `${score}%`, height: '100%', borderRadius: 3, background: c, transition: 'width 0.5s' }} />
      </div>
      <span style={{ fontSize: 14, fontWeight: 800, color: c, minWidth: 36, textAlign: 'right' }}>{score}%</span>
    </div>
  );
}

function ReviewBlock({ reviews, score, scoreLabel }: { reviews: ReviewItem[]; score: number; scoreLabel?: string }) {
  return (
    <div style={{ background: 'rgba(91,108,247,0.05)', border: '1px solid rgba(91,108,247,0.15)', borderRadius: 12, padding: 16, marginTop: 16 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 12, fontSize: 12, fontWeight: 700, color: accent }}>
        <span className="material-symbols-rounded" style={{ fontSize: 16 }}>auto_awesome</span>
        Analyse Claude
      </div>
      {reviews.map((r, i) => (
        <div key={i} style={{ marginBottom: i < reviews.length - 1 ? 12 : 0 }}>
          <div style={{ fontSize: 10, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 1, color: dotColor(r.type), marginBottom: 4 }}>
            {r.label}
          </div>
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {r.items.map((item, j) => (
              <li key={j} style={{ fontSize: 12, color: text2, padding: '2px 0', paddingLeft: 16, position: 'relative' }}>
                <span style={{ position: 'absolute', left: 0, top: 9, width: 6, height: 6, borderRadius: '50%', background: dotColor(r.type) }} />
                {item}
              </li>
            ))}
          </ul>
        </div>
      ))}
      <ScoreBar score={score} label={scoreLabel} />
    </div>
  );
}

function LandingCard({ v, baseUrl, isActive }: { v: LandingVersion; baseUrl: string; isActive?: boolean }) {
  const numBg = isActive
    ? 'rgba(34,197,94,0.15)'
    : v.number === 'N' ? 'rgba(0,240,255,0.15)'
    : v.number === 'M' ? 'rgba(200,169,126,0.15)'
    : v.number === 'B' ? 'rgba(255,59,48,0.15)'
    : v.number === 'G' ? 'rgba(124,58,237,0.15)'
    : v.number === 'W' ? 'rgba(99,102,241,0.15)'
    : Number(v.number) >= 4 ? 'rgba(91,108,247,0.15)' : 'rgba(161,161,170,0.15)';

  const numColor = isActive ? green
    : v.number === 'N' ? '#00f0ff'
    : v.number === 'M' ? '#c8a97e'
    : v.number === 'B' ? '#ff3b30'
    : v.number === 'G' ? '#7c3aed'
    : v.number === 'W' ? '#6366f1'
    : Number(v.number) >= 4 ? accent : text2;

  return (
    <div style={{
      background: card,
      border: isActive ? `1px solid ${green}33` : `1px solid ${border}`,
      borderRadius: 16,
      overflow: 'hidden',
      transition: 'border-color 0.2s',
    }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '20px 20px 0' }}>
        {v.number && (
          <div style={{
            width: 36, height: 36, borderRadius: 10,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 16, fontWeight: 800,
            background: numBg, color: numColor,
          }}>{v.number}</div>
        )}
        <h3 style={{ flex: 1, fontFamily: 'var(--font-display)', fontSize: 16, fontWeight: 700, color: '#fff', margin: 0 }}>{v.name}</h3>
        <span style={badgeStyle(v.badge.type)}>{v.badge.text}</span>
      </div>

      {/* Body */}
      <div style={{ padding: 20 }}>
        {/* Meta */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 8, marginBottom: 14 }}>
          {v.meta.map((m, i) => (
            <div key={i}>
              <div style={{ fontSize: 10, fontWeight: 600, textTransform: 'uppercase', letterSpacing: 1, color: text2, marginBottom: 2 }}>{m.label}</div>
              <div style={{ fontSize: 13, color: 'rgba(255,255,255,0.7)' }}>{m.value}</div>
            </div>
          ))}
        </div>

        {/* Links */}
        {(v.link || v.githubUrl) && (
          <div style={{ display: 'flex', gap: 8, marginBottom: 14, flexWrap: 'wrap' }}>
            {v.link && (
              <Link
                href={v.link}
                target="_blank"
                style={{
                  display: 'inline-flex', alignItems: 'center', gap: 6,
                  fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
                  background: accent, color: '#fff', textDecoration: 'none',
                }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>open_in_new</span>
                Voir {v.badge.type === 'active' ? 'la landing' : 'cette version'}
              </Link>
            )}
            {v.githubUrl && (
              <a href={v.githubUrl} target="_blank" rel="noreferrer" style={{
                display: 'inline-flex', alignItems: 'center', gap: 6,
                fontSize: 12, fontWeight: 600, padding: '6px 14px', borderRadius: 8,
                background: 'rgba(161,161,170,0.1)', color: text2,
                border: `1px solid ${border}`, textDecoration: 'none',
              }}>
                <span className="material-symbols-rounded" style={{ fontSize: 14 }}>code</span>
                Code
              </a>
            )}
          </div>
        )}

        {/* Desc */}
        <p style={{ fontSize: 13, color: text2, lineHeight: 1.7, marginBottom: 12 }}>{v.desc}</p>

        {/* Colors */}
        {v.colors.length > 0 && (
          <div style={{ display: 'flex', gap: 6, marginBottom: 12 }}>
            {v.colors.map((c, i) => (
              <div key={i} style={{ width: 22, height: 22, borderRadius: '50%', background: c, border: '2px solid rgba(255,255,255,0.1)' }} title={c} />
            ))}
          </div>
        )}

        {/* Sections */}
        {v.sections && (
          <div style={{ marginBottom: 12 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'rgba(255,255,255,0.6)', marginBottom: 6 }}>Sections</div>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
              {v.sections.map((s, i) => (
                <span key={i} style={{ fontSize: 11, padding: '3px 10px', borderRadius: 6, background: 'rgba(255,255,255,0.06)', color: 'rgba(255,255,255,0.5)' }}>{s}</span>
              ))}
            </div>
          </div>
        )}

        {/* Reviews */}
        <ReviewBlock reviews={v.reviews} score={v.score} scoreLabel={v.scoreLabel} />
      </div>
    </div>
  );
}

function SectionTitle({ icon, children }: { icon: string; children: React.ReactNode }) {
  return (
    <h2 style={{ fontSize: 18, fontWeight: 700, marginBottom: 24, display: 'flex', alignItems: 'center', gap: 8, color: '#fff' }}>
      <span className="material-symbols-rounded" style={{ color: accent }}>{icon}</span>
      {children}
    </h2>
  );
}

/* ═══════════════════════════════════════════════════════════
   PAGE
   ═══════════════════════════════════════════════════════════ */

export default function VariantsPage() {
  const [baseUrl, setBaseUrl] = useState('https://freenzy.io');

  return (
    <>
      <PublicNav />
      <main style={{ paddingTop: 56, minHeight: '100vh', background: '#0a0a0f' }}>

        {/* ── HEADER ── */}
        <header style={{ padding: '48px 24px 32px', textAlign: 'center', borderBottom: `1px solid ${border}` }}>
          <h1 style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(24px, 4vw, 32px)', fontWeight: 800, letterSpacing: -1, color: '#fff', marginBottom: 8 }}>
            <span style={{ color: accent }}>FREENZY.IO</span> — Landing Pages
          </h1>
          <p style={{ fontSize: 14, color: text2, maxWidth: 600, margin: '0 auto 20px' }}>
            Historique complet de toutes les versions de landing page testees, avec analyse Claude de ce qui fonctionne et ce qui manque.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { val: '8', lbl: 'Versions' },
              { val: '6', lbl: 'Variantes' },
              { val: '82', lbl: 'Agents' },
              { val: 'v0.19+', lbl: 'Version' },
            ].map((s, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <div style={{ fontSize: 24, fontWeight: 800, color: accent }}>{s.val}</div>
                <div style={{ fontSize: 11, color: text2, textTransform: 'uppercase', letterSpacing: 1 }}>{s.lbl}</div>
              </div>
            ))}
          </div>
        </header>

        <div style={{ maxWidth: 1100, margin: '0 auto', padding: '40px 24px' }}>

          {/* ── URL SWITCHER ── */}
          <div style={{
            display: 'flex', alignItems: 'center', gap: 8, marginBottom: 32,
            padding: '12px 16px', background: card, border: `1px solid ${border}`, borderRadius: 10, fontSize: 12, flexWrap: 'wrap',
          }}>
            <span className="material-symbols-rounded" style={{ fontSize: 16, color: accent }}>link</span>
            <label style={{ color: text2, fontWeight: 600 }}>Base URL :</label>
            <select
              value={baseUrl}
              onChange={(e) => setBaseUrl(e.target.value)}
              style={{
                background: '#0a0a0f', color: '#fff', border: `1px solid ${border}`,
                padding: '4px 10px', borderRadius: 6, fontSize: 12, fontFamily: 'Inter, sans-serif',
              }}
            >
              <option value="http://localhost:3001">localhost:3001 (dev local)</option>
              <option value="https://freenzy.io">freenzy.io (production)</option>
            </select>
            <span style={{ color: accent, fontWeight: 600, marginLeft: 'auto', fontFamily: 'monospace', fontSize: 12 }}>{baseUrl}</span>
          </div>

          {/* ═══ PRODUCTION ACTUELLE ═══ */}
          <SectionTitle icon="rocket_launch">Landing Active (Production)</SectionTitle>
          <div style={{ marginBottom: 48 }}>
            <LandingCard v={PRODUCTION} baseUrl={baseUrl} isActive />
          </div>

          {/* ═══ VARIANTES ═══ */}
          <SectionTitle icon="palette">Variantes de style</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20, marginBottom: 48 }}>
            {VARIANTS.map((v) => (
              <LandingCard key={v.id} v={v} baseUrl={baseUrl} />
            ))}
          </div>

          {/* ═══ HISTORIQUE ═══ */}
          <SectionTitle icon="history">Historique des versions</SectionTitle>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(440px, 1fr))', gap: 20, marginBottom: 48 }}>
            {HISTORY.map((v) => (
              <LandingCard key={v.id} v={v} baseUrl={baseUrl} />
            ))}
          </div>

          {/* ═══ RECOMMANDATIONS GLOBALES ═══ */}
          <SectionTitle icon="tips_and_updates">Recommandations globales</SectionTitle>
          <div style={{
            background: card,
            border: `1px solid ${border}`,
            borderRadius: 16,
            padding: 20,
            marginBottom: 48,
          }}>
            <ReviewBlock
              reviews={[
                { label: 'GARDER DE V8 (ACTUELLE)', type: 'good', items: [
                  'Contenu : 82 agents, 6 modeles IA, ecosysteme, FAQ 103 questions',
                  'Material Icons partout',
                  'Blue-violet #5b6cf7 comme accent',
                  'Structure de donnees (AI_MODELS, ECOSYSTEM, STATS_BADGES)',
                ]},
                { label: 'AJOUTER', type: 'missing', items: [
                  'Hero avec screenshot du dashboard — montrer le produit immediatement',
                  'Video demo 30s — une demo vaut 1000 mots',
                  '"Comment ca marche" en 3 etapes — 1. Creez votre compte, 2. Parlez a vos agents, 3. Tout est automatise',
                  'Social proof reel — compteur utilisateurs, reviews, logos',
                  'Comparatif prix — tableau Freenzy vs ChatGPT Plus vs alternatives',
                  'Animations au scroll — IntersectionObserver pour fade-in progressif',
                  'Glassmorphism subtil (de Gradient Wave) — cards transparentes',
                ]},
                { label: 'EVITER', type: 'issue', items: [
                  'Messaging agressif ("on remplace tout") — les PME veulent de l\'aide, pas du remplacement',
                  'Rouge/jaune vif — connotation discount',
                  'Page trop longue sans navigation interne',
                  'Fond clair (clash avec le dark dashboard)',
                ]},
              ]}
              score={0}
            />
          </div>

        </div>

        {/* Footer signature */}
        <div style={{ textAlign: 'center', padding: '40px 24px', color: text2, fontSize: 11, borderTop: `1px solid ${border}` }}>
          FREENZY.IO — Landing Page Audit — Genere par Claude Opus 4.6 — 8 mars 2026
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
