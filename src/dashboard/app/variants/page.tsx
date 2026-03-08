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
  id: 'v11',
  number: '11',
  name: 'Audience Segmentation + GA4 Analytics + FAQ Reorder',
  desc: 'Version actuelle en production. Switcher audience Particulier/Freelance/Entreprise sur toutes les pages (sticky bar iOS-style). Hero, CTAs, agents et section Enterprise s\'adaptent par audience. GA4 avec Consent Mode v2 RGPD (modal centree accept/refuse). FAQ 103 questions reordonnees par audience. URL params ?audience= pour campagnes pub. Scroll tracking par section (IntersectionObserver). Blue-violet (#5b6cf7), Material Icons, 82 agents, dark theme unifie. 13 sections, ~1028 lignes.',
  date: '8 mars 2026',
  commit: '7ed357a',
  badge: { text: 'EN PROD', type: 'active' },
  colors: ['#5b6cf7', '#0a0a0f', '#22c55e', '#a5b4fc'],
  meta: [
    { label: 'Commit', value: '7ed357a' },
    { label: 'Date', value: '8 mars 2026' },
    { label: 'Branche', value: 'main' },
    { label: 'Fichier', value: 'app/page.tsx (~1028 lignes)' },
  ],
  sections: ['Hero adaptatif', 'Live Activity Ticker', 'Stats Reverse Ticker', 'Outils Utilisateurs (5 cat.)', 'Demo Interactive (4 onglets)', 'Comment ca marche (4 scenarios + 4 techs)', 'WhatsApp IA', 'Creation Sur Mesure', 'Pourquoi Freenzy (6 cards)', 'Enterprise (conditionnel)', 'FAQ 103Q (10 cat. reordonnees)', 'CTA Final', 'Audience Switcher (sticky)'],
  link: '/',
  githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/page.tsx',
  reviews: [
    { label: 'CE QUI FONCTIONNE BIEN', type: 'good', items: [
      'Segmentation audience — hero, CTAs, agents et Enterprise s\'adaptent en temps reel',
      'Switcher iOS-style fluide avec sliding indicator + persistance localStorage',
      'URL params ?audience=freelance pour ciblage pub (Google Ads, Meta Ads)',
      'FAQ 103 questions reordonnees par audience — le contenu pertinent en premier',
      'GA4 RGPD-compliant : Consent Mode v2, modal centree, accept/refuse obligatoire',
      'Tracking complet : fz_audience_selected, fz_cta_click, fz_section_viewed, fz_faq_opened',
      'IntersectionObserver sur sections cles — donnees de scroll depth sans impact perf',
      'Demo interactive avec 4 onglets (Repondeur, Email, Social, Document) — concret et visuel',
      'Section "Comment ca marche" avec scenarios reels + technologies spotlight',
      'Section WhatsApp avec mockup messages — montre le pilotage par WhatsApp',
      'Section "Creation sur mesure" (self-service + on-demand) — rassure les prospects complexes',
      'Material Icons uniforme (plus d\'emojis), dark theme coherent',
      'CTA "Commencer gratuitement" tracke en hero + final — double conversion',
      'Section Enterprise conditionnelle (masquee pour Particulier — bon UX)',
    ]},
    { label: 'PROBLEMES IDENTIFIES', type: 'issue', items: [
      'Page longue (~1028 lignes JSX) — pas de lazy loading ni code splitting des sections',
      'Pas de video demo / screencast du produit en action',
      'Pas de preuve sociale reelle (temoignages fictifs, pas de logos clients, pas de reviews)',
      'Le hero ne montre pas le produit — aucun screenshot/mockup du dashboard Flashboard',
      'Le "0% commission" est repete 4+ fois — dilue le message au lieu de le renforcer',
      'Pas d\'animation d\'entree (les sections apparaissent d\'un bloc au scroll)',
      'La demo interactive est statique (texte pre-ecrit) — pas d\'interaction reelle avec l\'IA',
      'Le live ticker est fictif (pas connecte a des donnees reelles)',
      'Pas de A/B testing en place — on ne sait pas quelle audience convertit mieux',
      'Pas de heatmap/session recording (Hotjar, Clarity) pour comprendre le comportement',
      'Mobile : le switcher audience avec 3 boutons est un peu serre sur petit ecran',
      'Performance : Google Fonts (3 families) bloquent le rendu initial',
    ]},
    { label: 'CE QUI MANQUE POUR CONVERTIR', type: 'missing', items: [
      'Screenshot/mockup du dashboard Flashboard dans le hero — montrer le produit immediatement',
      'Video demo 30-60s montrant un cas reel (ex: appel repondeur → resume WhatsApp)',
      'Social proof reel : compteur utilisateurs, logos clients, reviews Google/Trustpilot',
      'Comparatif prix : tableau Freenzy vs ChatGPT Plus vs Jasper vs concurrents',
      'Micro-animations au scroll (IntersectionObserver pour fade-in/slide-up progressif)',
      'Exit intent popup ou lead magnet (ex: "Guide gratuit : 10 agents IA pour votre PME")',
      'Chat widget ou demo live (parler directement a un agent IA sur la landing)',
      'Urgency/scarcity : compteur "0% commission pour les 5000 premiers" avec progress bar',
      'Section use-cases par secteur (restaurant, immobilier, e-commerce, cabinet comptable)',
      'Integration Hotjar/Clarity pour heatmaps et session recordings',
      'A/B testing framework (Vercel Edge Config ou custom) pour tester les variantes',
      'Progressive disclosure : hero court → "En savoir plus" → sections detaillees',
    ]},
  ],
  score: 71,
};

const HISTORY: LandingVersion[] = [
  {
    id: 'v10', number: '10', name: 'Phase 3 — GA4 Analytics + RGPD + FAQ Reorder',
    desc: 'Ajout du tracking GA4 complet avec Consent Mode v2 RGPD. Cookie consent transforme en modal centree (accept/refuse obligatoire). Module analytics.ts central avec event queue. URL params ?audience= pour campagnes pub. FAQ reordonnee par audience. IntersectionObserver sur toutes les sections cles. 8 events GA4 avec prefixe fz_.',
    date: '8 mars 2026', commit: '7ed357a',
    badge: { text: '7ed357a', type: 'archived' },
    colors: ['#5b6cf7', '#0a0a0f'],
    meta: [{ label: 'Date', value: '8 mars 2026' }, { label: 'Delta', value: 'GA4 + RGPD consent + FAQ reorder + URL params' }],
    reviews: [
      { label: 'AJOUTS', type: 'good', items: [
        'GA4 Consent Mode v2 (denied par defaut, granted sur accept)',
        'Cookie consent modal centree RGPD (plus de banner bottom-right)',
        'Event queue : events avant consent sont stockes puis envoyes apres accept',
        'FAQ 103 questions reordonnees par audience (Particulier → General en premier, Entreprise → Enterprise/Securite en premier)',
        'URL param ?audience= auto-select + persist localStorage (pour Google Ads, Meta Ads)',
        'IntersectionObserver tracking : hero, faq, enterprise, cta sections',
        '8 events fz_* : audience_selected, cta_click, section_viewed, faq_opened, page_view, scroll_depth, enterprise_form_viewed, bonus_message_viewed',
      ]},
      { label: 'TECHNIQUE', type: 'missing', items: ['analytics.ts module central (SSR-safe, idempotent)', 'AnalyticsLoader.tsx pour returning users', 'useSectionObserver.ts hook reutilisable', 'faq-utils.ts pour reordonnement'] },
    ],
    score: 71,
  },
  {
    id: 'v9', number: '9', name: 'Phase 1+2 — Audience Segmentation sur toutes les landings',
    desc: 'Ajout du switcher audience Particulier/Freelance/Entreprise sur toutes les pages publiques. Sticky bar iOS-style avec sliding indicator anime. Hero, CTAs, agents et section Enterprise s\'adaptent en temps reel. Persistance localStorage. Deploye sur page principale + /plans + 6 variantes.',
    date: '8 mars 2026', commit: '402aa1c',
    badge: { text: '402aa1c', type: 'archived' },
    colors: ['#5b6cf7', '#0a0a0f'],
    meta: [{ label: 'Date', value: '8 mars 2026' }, { label: 'Delta', value: 'Audience switcher (Particulier/Freelance/Entreprise)' }],
    reviews: [
      { label: 'AJOUTS', type: 'good', items: [
        'Switcher iOS-style avec sliding indicator CSS anime',
        'Audience configs detaillees (headline, subheadline, badge, CTA, agents, tarifs exemples)',
        'Section Enterprise conditionnelle (masquee pour Particulier et Freelance)',
        'Deploye sur 10 pages : /, /plans, et 8 variantes',
        'Hook useAudience() partage — changement propage via CustomEvent',
        'Sticky bar sous le nav (z-index 997, blur backdrop)',
      ]},
      { label: 'LIMITATION', type: 'issue', items: ['Pas encore de donnees analytics pour valider l\'impact (resolu en V10)'] },
    ],
    score: 68,
  },
  {
    id: 'v8', number: '8', name: 'Design System Refresh + 82 Agents',
    desc: 'Blue-violet (#5b6cf7), Material Icons partout, 82 agents (22 business + 12 perso + 48 marketplace). 11 sections: hero, stats ticker, outils IA, modeles IA, ecosysteme, agents tabs, avantages, FAQ, CTA final. Cookie consent basique. Pas de segmentation audience.',
    date: '8 mars 2026', commit: '1e7090d',
    badge: { text: '1e7090d', type: 'archived' },
    colors: ['#5b6cf7', '#0a0a0f', '#22c55e'],
    meta: [{ label: 'Date', value: '8 mars 2026' }, { label: 'Delta', value: '82 agents + Material Icons + dark theme' }],
    reviews: [
      { label: 'AMELIORATIONS', type: 'good', items: ['Design system unifie avec blue-violet', 'Material Icons partout (plus d\'emojis)', '82 agents complets avec marketplace'] },
      { label: 'LIMITATIONS', type: 'issue', items: ['Pas de segmentation audience — une seule version pour tous', 'Cookie consent basique (banner bottom-right)', 'Pas de tracking analytics'] },
    ],
    score: 62,
  },
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
    id: 'v019-mercredi', name: 'v0.19 — Mercredi 5 mars (1er deploy)', number: 'W',
    desc: 'La toute premiere version deployee sur Coolify. Emojis partout (pas encore Material Icons), 72 agents, accent indigo #6366f1. Snapshot historique avant les 3 jours de polish intensif (V3→V11). GA4 tracking ajoute pour comparaison avec les versions modernes.',
    date: '5 mars 2026 ~16h', commit: 'a1782f2',
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
      { label: 'VALEUR HISTORIQUE', type: 'good', items: [
        'Snapshot fidele du Day 1 — montre le chemin parcouru en 3 jours',
        'Structure de sections deja complete (hero, modeles, ecosysteme, FAQ)',
        'Message "Free & Easy" et "0% commission" deja la depuis le debut',
        'GA4 tracking ajoute — donnees comparables avec V11',
      ]},
      { label: 'PROBLEMES (TOUS RESOLUS EN V11)', type: 'issue', items: [
        'Emojis partout — rendu inconsistant cross-platform (resolu : Material Icons)',
        'Indigo #6366f1 generique Tailwind (resolu : blue-violet #5b6cf7)',
        'Pas de responsive mobile (resolu en V3)',
        '72 agents seulement (resolu : 82 en V8)',
        'Pas de cookie consent RGPD (resolu en V10)',
        'Pas de segmentation audience (resolu en V9)',
        'Pas d\'analytics (resolu en V10)',
      ]},
    ],
    score: 30,
  },
  {
    id: 'original', name: 'Original (V8 freeze)', number: 'O',
    desc: 'Snapshot de la V8 avant l\'ajout de l\'audience switcher. Pas de segmentation, pas de GA4. Sert de reference "avant/apres" pour mesurer l\'impact de la personnalisation par audience. GA4 tracking ajoute (sans audience — null).',
    date: '8 mars 2026',
    badge: { text: 'ARCHIVE', type: 'variant' },
    colors: ['#5b6cf7', '#0a0a0f', '#22c55e'],
    meta: [{ label: 'Style', value: 'V8 sans audience switcher' }, { label: 'Utilite', value: 'Reference A/B : mesurer l\'impact du switcher' }],
    link: '/variants/original',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/original/page.tsx',
    reviews: [
      { label: 'UTILITE', type: 'good', items: ['Reference "avant" pour comparer avec la version segmentee', 'Meme contenu que la prod, sans la couche audience', 'GA4 tracking actif (section observer, CTA clicks)'] },
      { label: 'LIMITATIONS', type: 'issue', items: ['Pas de personnalisation — hero generique pour tous', 'Section Enterprise toujours visible (meme pour les particuliers)', 'FAQ dans l\'ordre par defaut (pas reordonnee par audience)'] },
    ],
    score: 55,
  },
  {
    id: 'neon-futuriste', name: 'Neon Futuriste', number: 'N',
    desc: 'Esthetique cyberpunk avec neons cyan et magenta sur fond ultra-sombre. Messaging agressif style Y Combinator — "On remplace votre equipe". Typographie bold, effets glow. Maintenant avec switcher audience + GA4 tracking + FAQ reorder.',
    date: '',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#00f0ff', '#0a001a', '#ff00aa'],
    meta: [{ label: 'Style', value: 'Cyberpunk, neons vifs, messaging agressif' }, { label: 'Slogan', value: '"On remplace tout"' }, { label: 'Features', value: 'Audience + GA4 + FAQ reorder' }],
    link: '/variants/neon-futuriste',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/neon-futuriste/page.tsx',
    reviews: [
      { label: 'POINTS FORTS', type: 'good', items: [
        'Tres impactant visuellement — le plus memorable de toutes les variantes',
        'Messaging direct qui interpelle immediatement',
        'Effet "wow" pour les early adopters tech et startups',
        'Les neons cyan/magenta creent un contraste fort avec le dark bg',
        'Maintenant segmente par audience — le messaging s\'adapte',
      ]},
      { label: 'RISQUES MAJEURS', type: 'issue', items: [
        'Trop agressif pour la cible principale (PME traditionnelles francaises)',
        'Le messaging "on remplace" est anxiogene — les PME veulent de l\'aide, pas du remplacement',
        'Lisibilite reduite : effets neon sur mobile petit ecran = fatigue visuelle rapide',
        'Clash culturel : en France, l\'approche "disruptive" est moins acceptee qu\'aux US',
        'Exclut les professions liberales (avocats, comptables) qui veulent du serieux',
        'Performance : les effets glow/shadow sont couteux en CSS (repaint)',
      ]},
      { label: 'VERDICT', type: 'missing', items: ['A utiliser uniquement pour des campagnes ciblees "tech/startup" sur LinkedIn ou Product Hunt', 'Ne PAS utiliser comme landing principale — taux de rebond previsiblement eleve pour les PME'] },
    ],
    score: 42,
  },
  {
    id: 'minimal-luxe', name: 'Minimal Luxe', number: 'M',
    desc: 'Design epure, tons creme et or. Typographie fine et elegante. Beaucoup de blanc, espacement genereux. Messaging calme et rassurant — "L\'app essentielle pour votre business". Style Apple/Notion. Maintenant avec audience switcher + GA4 + FAQ reorder.',
    date: '',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#c8a97e', '#faf8f5', '#1a1a1a'],
    meta: [{ label: 'Style', value: 'Minimaliste premium, tons neutres chauds' }, { label: 'Slogan', value: '"L\'app essentielle"' }, { label: 'Features', value: 'Audience + GA4 + FAQ reorder' }],
    link: '/variants/minimal-luxe',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/minimal-luxe/page.tsx',
    reviews: [
      { label: 'POINTS FORTS', type: 'good', items: [
        'Perception premium qui inspire confiance immediatement aux decideurs',
        'Lisibilite excellente — le contenu respire, pas de surcharge cognitive',
        'Style Apple/Notion reconnaissable — associe a la qualite',
        'Ideal pour les professions liberales (avocats, experts-comptables, consultants)',
        'Le messaging "rassurant" est aligne avec la peur du changement des PME',
        'Contraste texte/fond optimal — accessible WCAG AA',
      ]},
      { label: 'RISQUES', type: 'issue', items: [
        'Le style "luxe" peut sembler contradictoire avec "gratuit / 0% commission"',
        'Manque d\'energie pour un produit IA — on attend du dynamisme',
        'Le fond clair cree un clash visuel avec le dark dashboard apres login',
        'Moins memorable en publicite — se perd dans le flux LinkedIn/Meta',
        'Les tons creme/or evoquent le "premium payant" — risque de confusion prix',
      ]},
      { label: 'RECOMMANDATION', type: 'missing', items: ['Bon candidat pour une landing "Entreprise" dediee (pas pour Particulier/Freelance)', 'A tester en A/B sur le segment "professions liberales" uniquement'] },
    ],
    score: 52,
  },
  {
    id: 'bold-disrupteur', name: 'Bold Disrupteur', number: 'B',
    desc: 'Rouge + jaune vif sur fond sombre. Typographie XXL, messaging provocateur. Style Y Combinator / Superhuman. Bold et polarisant — "Le Facebook de l\'IA pour entreprises". Avec audience switcher + GA4 + FAQ reorder.',
    date: '',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#ff3b30', '#ffe600', '#1a1a2e'],
    meta: [{ label: 'Style', value: 'Couleurs vives, typographie massive' }, { label: 'Slogan', value: '"Le nouveau Facebook"' }, { label: 'Features', value: 'Audience + GA4 + FAQ reorder' }],
    link: '/variants/bold-disrupteur',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/bold-disrupteur/page.tsx',
    reviews: [
      { label: 'POINTS FORTS', type: 'good', items: [
        'Impossible de l\'ignorer — le CTR en pub sera le plus eleve de toutes les variantes',
        'Messaging ambitieux qui positionne le produit haut',
      ]},
      { label: 'PROBLEMES GRAVES', type: 'issue', items: [
        '"Le nouveau Facebook" est pretentieux et irrealiste — credibilite zero aupres des PME',
        'Rouge + jaune = esthetique "promo/discount/soldes" — detruit la perception premium',
        'Trop polarisant — exclut 80%+ des PME francaises (profils conservateurs)',
        'Le messaging promet ce que le produit ne delivre pas encore — risque de deception immediate',
        'Fatigue visuelle rapide — les couleurs saturees sur dark bg sont agressives',
        'En France, ce style est associe a du "clickbait" ou du spam, pas a du SaaS serieux',
        'Le switcher audience ne resout pas le probleme fondamental du tone of voice',
      ]},
      { label: 'VERDICT', type: 'missing', items: ['A NE PAS UTILISER pour la landing principale', 'Eventuellement pour un test pub Facebook/Instagram hyper cible avec message retravaille', 'Necessiterait un rewrite complet du messaging pour etre utilisable'] },
    ],
    score: 25,
  },
  {
    id: 'gradient-wave', name: 'Gradient Wave', number: 'G',
    desc: 'Degrades purple → cyan → rose. Effets glassmorphism (cartes transparentes blur). Animations fluides. Style Linear/Vercel. Le plus equilibre de toutes les variantes : moderne, pro, accessible. Maintenant avec audience switcher + GA4 tracking + FAQ reorder par audience.',
    date: '',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#7c3aed', '#06b6d4', '#f43f5e'],
    meta: [{ label: 'Style', value: 'Degrades fluides, glassmorphism' }, { label: 'Slogan', value: '"Le futur est la"' }, { label: 'Features', value: 'Audience + GA4 + FAQ reorder' }],
    link: '/variants/gradient-wave',
    githubUrl: 'https://github.com/Wonderself/sarahos/blob/main/src/dashboard/app/variants/gradient-wave/page.tsx',
    reviews: [
      { label: 'POINTS FORTS', type: 'good', items: [
        'Le plus equilibre visuellement — moderne sans etre agressif ni ennuyeux',
        'Glassmorphism tendance 2026 (Linear, Vercel, Stripe, Arc Browser)',
        'Palette coherente avec le blue-violet #5b6cf7 du dashboard — transition naturelle',
        'Bon compromis entre impact visuel et lisibilite du contenu',
        'Les degrades donnent une impression de mouvement et de modernite',
        'Fonctionne aussi bien pour Particulier que pour Entreprise (neutre)',
        'Le glassmorphism est "novel" mais pas "weird" — accepte par tous les segments',
      ]},
      { label: 'RISQUES', type: 'issue', items: [
        'Glassmorphism peut reduire la lisibilite du texte sur certains fonds degrades',
        'Risque generique — beaucoup de SaaS utilisent ce style en 2026',
        'Performances : backdrop-filter blur est couteux sur mobiles Android bas de gamme',
        'Le style peut vieillir vite si le glassmorphism passe de mode',
      ]},
      { label: 'RECOMMANDATION FORTE', type: 'missing', items: [
        'MEILLEUR CANDIDAT pour devenir la prochaine landing principale',
        'A combiner avec le contenu enrichi de V11 (audience switcher, FAQ reorder, GA4)',
        'Ajouter : hero avec screenshot dashboard, video demo 30s, social proof reel',
        'Tester en A/B contre la version actuelle (V11) sur les 3 segments audience',
        'Si les metrics confirment, deployer en production avec les ameliorations',
      ]},
    ],
    score: 72,
    scoreLabel: 'Score potentiel',
  },
  {
    id: 'original-v2', name: 'Original V2 (identique a prod)', number: 'O2',
    desc: 'Copie identique de la landing en production (V11). Meme code, meme audience switcher, meme GA4, meme FAQ reorder. Existe pour comparaison historique — c\'est la V8 qui a ete upgradee en Phase 1-3. Hero, CTAs, agents et Enterprise s\'adaptent par audience.',
    date: '8 mars 2026',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#5b6cf7', '#0a0a0f', '#22c55e'],
    meta: [{ label: 'Style', value: 'Identique a la production' }, { label: 'Features', value: 'Audience + GA4 + FAQ reorder (complet)' }],
    link: '/variants/original-v2',
    reviews: [
      { label: 'FEATURES', type: 'good', items: [
        'Switcher audience iOS-style + sliding indicator',
        'Hero adapte par audience (headline, subheadline, badge, CTA)',
        'Section Enterprise conditionnelle (masquee pour Particulier/Freelance)',
        'FAQ 103 questions reordonnees par audience',
        'GA4 tracking complet (section observer, CTA clicks, FAQ opens)',
        'URL params ?audience= pour campagnes pub',
      ]},
      { label: 'NOTE', type: 'missing', items: ['Cette variante est desormais identique a la production (/)', 'Utile pour comparer avec l\'Original (V8 freeze) et mesurer l\'impact du switcher'] },
    ],
    score: 71,
  },
  {
    id: 'v019-mercredi-v2', name: 'v0.19 Mercredi V2 (+ Audience + GA4)', number: 'W2',
    desc: 'Copie de la version mercredi (1er deploy) avec audience switcher + GA4 + FAQ reorder. Meme structure emojis + indigo mais personnalisee par audience. Utile pour mesurer : est-ce que le switcher audience ameliore meme une vieille version ?',
    date: '8 mars 2026',
    badge: { text: 'VARIANTE', type: 'variant' },
    colors: ['#6366f1', '#0a0a0f', '#22c55e'],
    meta: [{ label: 'Style', value: 'v0.19 mercredi + segmentation' }, { label: 'Features', value: 'Audience + GA4 + FAQ reorder' }, { label: 'Test', value: 'Impact du switcher sur ancienne version' }],
    link: '/variants/v019-mercredi-v2',
    reviews: [
      { label: 'UTILITE', type: 'good', items: [
        'Test A/B naturel : meme contenu "ancien" + switcher audience moderne',
        'Permet de mesurer si la personnalisation ameliore meme une version mediocre',
        'GA4 tracking actif — donnees comparables avec les autres variantes',
      ]},
      { label: 'LIMITATIONS', type: 'issue', items: [
        'Emojis au lieu de Material Icons — aspect date',
        'Indigo #6366f1 generique vs blue-violet #5b6cf7 de la marque',
        'Pas de responsive optimise (pre-V3)',
        'Le switcher audience est visuellement deconnecte du style global',
      ]},
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
          <p style={{ fontSize: 14, color: text2, maxWidth: 640, margin: '0 auto 20px' }}>
            Historique complet de toutes les versions, variantes de style et analyses Claude. Chaque version est notee sur sa capacite a convertir les visiteurs en utilisateurs.
          </p>
          <div style={{ display: 'flex', gap: 24, justifyContent: 'center', flexWrap: 'wrap' }}>
            {[
              { val: '11', lbl: 'Versions' },
              { val: '8', lbl: 'Variantes' },
              { val: '82', lbl: 'Agents' },
              { val: '3', lbl: 'Audiences' },
              { val: 'GA4', lbl: 'Analytics' },
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
                { label: 'ACQUIS DE V11 (A GARDER)', type: 'good', items: [
                  'Segmentation audience Particulier/Freelance/Entreprise — le plus gros gain de conversion',
                  'GA4 Consent Mode v2 RGPD — tracking legal et complet',
                  'FAQ 103 questions reordonnees par audience — contenu pertinent en premier',
                  'URL params ?audience= — integration directe avec Google Ads et Meta Ads',
                  'Material Icons partout + blue-violet #5b6cf7 coherent',
                  '13 sections avec contenu riche (82 agents, 6 modeles IA, demo interactive)',
                  'Section Enterprise conditionnelle — bon UX pour les particuliers',
                  'IntersectionObserver tracking — donnees de scroll sans impact performance',
                ]},
                { label: 'PROCHAINES ETAPES (PRIORITE HAUTE)', type: 'missing', items: [
                  '1. Screenshot/mockup du dashboard Flashboard dans le hero — le visiteur doit VOIR le produit en < 3s',
                  '2. Video demo 30-60s (appel → repondeur → resume WhatsApp → dashboard) — conversion x2 attendue',
                  '3. Social proof reel — compteur "X utilisateurs", logos clients, reviews Trustpilot/Google',
                  '4. Micro-animations au scroll (fade-in, slide-up) — perception de qualite',
                  '5. A/B testing : V11 actuelle vs Gradient Wave sur les 3 segments audience',
                  '6. Hotjar/Clarity — heatmaps et session recordings pour identifier les points de friction',
                  '7. Comparatif prix interactif (Freenzy vs ChatGPT Plus vs Jasper vs alternatives)',
                ]},
                { label: 'PROCHAINES ETAPES (PRIORITE MOYENNE)', type: 'missing', items: [
                  'Exit intent popup avec lead magnet ("Guide gratuit : 10 agents IA pour votre PME")',
                  'Chat widget live — parler a un agent IA directement sur la landing',
                  'Urgency : progress bar "0% commission pour les 5000 premiers" avec compteur',
                  'Section use-cases par secteur (restaurant, immo, e-commerce, cabinet comptable)',
                  'Progressive disclosure : hero court → "En savoir plus" → sections detaillees',
                  'Landing pages dediees par secteur (/pour/restaurants, /pour/avocats, etc.)',
                ]},
                { label: 'EVITER', type: 'issue', items: [
                  'Messaging agressif type "on remplace votre equipe" — les PME francaises veulent de l\'AIDE',
                  'Rouge/jaune vif (Bold Disrupteur) — connotation discount/spam en France',
                  'Page encore plus longue sans navigation interne (deja 1028 lignes)',
                  'Fond clair pour la landing (clash avec le dark dashboard apres login)',
                  'Multiplier les variantes sans A/B testing — on accumule du code sans donnees',
                  'Temoignages fictifs — mieux vaut pas de social proof que du faux',
                ]},
              ]}
              score={0}
            />
          </div>

        </div>

        {/* Footer signature */}
        <div style={{ textAlign: 'center', padding: '40px 24px', color: text2, fontSize: 11, borderTop: `1px solid ${border}` }}>
          FREENZY.IO — Landing Page Audit V3 — Genere par Claude Opus 4.6 — 8 mars 2026 — V11 (Audience + GA4 + FAQ Reorder)
        </div>
      </main>
      <PublicFooter />
    </>
  );
}
