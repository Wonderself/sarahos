// ═══════════════════════════════════════════════════════════
//   Landing Page Data — extracted from page.tsx
// ═══════════════════════════════════════════════════════════

// ─── Modèles IA
export const AI_MODELS = [
  { name: 'Claude · Anthropic', sub: 'Haiku · Sonnet · Opus 4 · Extended Thinking', icon: 'auto_awesome', color: '#D97706' },
  { name: 'GPT · OpenAI', sub: 'GPT-4o · o3 · GPT-4.5', icon: 'smart_toy', color: '#10a37f' },
  { name: 'Gemini · Google', sub: 'Flash · Pro · Ultra', icon: 'diamond', color: '#4285f4' },
  { name: 'Llama · Meta', sub: 'Llama 4 · open source', icon: 'smart_toy', color: '#0668E1' },
  { name: 'Grok · xAI', sub: 'Grok 3 · raisonnement temps réel', icon: 'bolt', color: '#6b7280' },
  { name: 'Mistral · Cohere', sub: 'IA européenne · et tous les prochains', icon: 'waves', color: '#f97316' },
];

// ─── Écosystème
export const ECOSYSTEM = [
  { name: 'ElevenLabs', sub: 'Voix naturelle · TTS premium', icon: 'mic' },
  { name: 'Twilio', sub: 'Appels entrants · SMS · WhatsApp', icon: 'call' },
  { name: 'pgvector', sub: 'Mémoire longue durée · RAG', icon: 'psychology' },
  { name: 'WhatsApp Business', sub: 'Messages IA entrants & sortants', icon: 'chat' },
  { name: 'Runway ML', sub: 'Génération vidéo IA', icon: 'movie' },
  { name: 'DALL-E · Flux', sub: 'Génération image IA', icon: 'image' },
  { name: 'Redis', sub: 'Cache · sessions temps réel', icon: 'bolt' },
  { name: 'Stripe', sub: 'Paiement · facturation sécurisée', icon: 'credit_card' },
];

// ─── Agents (display list for landing)
export const LANDING_AGENTS = [
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
export const ACTION_COSTS = [
  { icon: 'chat', action: 'Chat avec agent IA', model: 'Haiku', count: '100 chats', color: '#22c55e' },
  { icon: 'mail', action: 'Email professionnel', model: 'Sonnet', count: '45 emails', color: '#7c3aed' },
  { icon: 'phone_iphone', action: 'Post réseaux sociaux', model: 'Haiku', count: '62 posts', color: '#3b82f6' },
  { icon: 'description', action: 'Document complet', model: 'Sonnet', count: '14 docs', color: '#7c3aed' },
  { icon: 'call', action: 'Appel répondeur IA', model: 'Twilio + Haiku', count: '10 appels', color: '#f97316' },
  { icon: 'call_made', action: 'Appel sortant IA', model: 'Twilio + Sonnet', count: '3 appels', color: '#f97316' },
  { icon: 'chat', action: 'WhatsApp Business IA', model: 'Haiku', count: '125 msgs', color: '#22c55e' },
  { icon: 'record_voice_over', action: 'Message vocal TTS', model: 'ElevenLabs', count: '11 msgs', color: '#f59e0b' },
  { icon: 'image', action: 'Image IA créée', model: 'DALL-E · Flux', count: '7 images', color: '#9333ea' },
  { icon: 'movie', action: 'Clip vidéo 30s', model: 'Runway ML', count: '1 clip', color: '#ec4899' },
  { icon: 'handshake', action: 'Réunion IA structurée', model: 'Opus', count: '6 réunions', color: '#9333ea' },
];

// ─── Stats badges (reverse ticker)
export const STATS_BADGES = [
  { icon: 'smart_toy', value: '100+', label: 'agents IA' },
  { icon: 'psychology', value: '6+', label: 'modèles IA' },
  { icon: 'bolt', value: '5 min', label: 'onboarding' },
  { icon: 'diamond', value: '0%', label: 'commission' },
  { icon: 'dark_mode', value: '24/7', label: 'actifs' },
  { icon: 'language', value: '50+', label: 'langues' },
  { icon: 'quiz', value: '103', label: 'FAQ' },
  { icon: 'shopping_cart', value: '50', label: 'templates' },
  { icon: 'verified_user', value: 'RGPD', label: 'conforme' },
  { icon: 'lock', value: 'AES-256', label: 'chiffrement' },
  { icon: 'phone_iphone', value: '8', label: 'modes Réveil' },
  { icon: 'target', value: '50', label: 'crédits offerts' },
];

// ─── Live activity feed
export const ACTIVITY = [
  { icon: 'call', text: 'Appel traité · lead qualifié', agent: 'Répondeur', color: '#22c55e', ago: '2 min' },
  { icon: 'mail', text: 'Proposition commerciale envoyée', agent: 'Commercial', color: '#7c3aed', ago: '4 min' },
  { icon: 'phone_iphone', text: '3 posts LinkedIn programmés', agent: 'Marketing', color: '#3b82f6', ago: '8 min' },
  { icon: 'bar_chart', text: 'Rapport mensuel généré', agent: 'Finance', color: '#f59e0b', ago: '13 min' },
  { icon: 'alarm', text: 'Briefing matinal envoyé', agent: 'Réveil IA', color: '#f97316', ago: '19 min' },
  { icon: 'image', text: 'Visuel créé · campagne Été 2026', agent: 'Photo/Visuel', color: '#9333ea', ago: '24 min' },
  { icon: 'description', text: 'NDA bilingue généré', agent: 'Juridique', color: '#7c3aed', ago: '31 min' },
  { icon: 'chat', text: '12 messages WhatsApp traités', agent: 'Assistante', color: '#22c55e', ago: '39 min' },
  { icon: 'movie', text: 'Clip vidéo 30s créé', agent: 'Vidéo', color: '#ec4899', ago: '47 min' },
  { icon: 'handshake', text: 'Stratégie Q2 synthétisée', agent: 'DG', color: '#9333ea', ago: '1h' },
];

// ─── Interactive demo scenarios
export const DEMO_SCENARIOS = [
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
    color: '#7c3aed',
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

// ─── Scenarios (detailed use-cases)
export const SCENARIOS = [
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
    color: '#7c3aed',
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
export const TECH_FEATURES = [
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
export const WA_MESSAGES = [
  { from: 'agent', text: 'Résumé de la journée :\n· 3 appels traités\n· 2 leads qualifiés\n· 1 devis envoyé', time: '18:32' },
  { from: 'user', text: 'Envoie le devis à contact@acme.fr', time: '18:33' },
  { from: 'agent', text: 'Devis envoyé à contact@acme.fr · suivi planifié J+3', time: '18:33' },
];

// ─── Outils utilisateurs (par catégorie)
export const TOOL_CATEGORIES = [
  { id: 'comm', label: 'Communication', icon: 'call', tools: [
    { icon: 'call', name: 'Répondeur intelligent 24/7', desc: 'Répond à vos appels, qualifie les leads, prend les RDV automatiquement.' },
    { icon: 'chat', name: 'WhatsApp Business IA', desc: 'Messages entrants et sortants, notifications, pilotage par WhatsApp.' },
    { icon: 'phone_forwarded', name: 'Appels sortants IA', desc: 'Prospection, relances et confirmations par téléphone avec voix naturelle.' },
    { icon: 'mail', name: 'Email IA professionnel', desc: 'Rédaction, envoi et suivi automatique de vos emails business.' },
  ]},
  { id: 'prod', label: 'Productivité', icon: 'bolt', tools: [
    { icon: 'alarm', name: 'Réveil intelligent & Brief', desc: 'Briefing personnalisé chaque matin : agenda, priorités, météo, actus.' },
    { icon: 'target', name: 'Plan d\'action quotidien', desc: 'Objectifs structurés, tâches priorisées, suivi de progression en temps réel.' },
    { icon: 'description', name: 'Documents & contrats IA', desc: 'Génération de devis, contrats, NDA, rapports en quelques secondes.' },
    { icon: 'handshake', name: 'Réunions structurées IA', desc: 'Ordre du jour, compte-rendu, décisions et actions — tout automatisé.' },
  ]},
  { id: 'create', label: 'Création', icon: 'palette', tools: [
    { icon: 'photo_camera', name: 'Studio Photo IA', desc: 'Créez des visuels pro, logos, bannières avec DALL-E et Flux.' },
    { icon: 'movie', name: 'Studio Vidéo IA', desc: 'Clips vidéo 30s, talking heads, animations pour vos réseaux.' },
    { icon: 'phone_iphone', name: 'Réseaux sociaux IA', desc: 'Posts LinkedIn, Twitter, Instagram générés et planifiés automatiquement.' },
    { icon: 'campaign', name: 'Campagnes marketing IA', desc: 'Stratégies, contenus et calendrier éditorial générés par IA.' },
  ]},
  { id: 'gestion', label: 'Gestion', icon: 'bar_chart', tools: [
    { icon: 'savings', name: 'Comptabilité & finances', desc: 'Suivi trésorerie, factures, dépenses et rapports financiers IA.' },
    { icon: 'group', name: 'Suivi clients & CRM', desc: 'Pipeline commercial, relances automatiques, historique client complet.' },
    { icon: 'gavel', name: 'Veille juridique IA', desc: 'Alertes réglementaires, analyse de contrats, conformité automatisée.' },
    { icon: 'person', name: 'RH & recrutement IA', desc: 'Tri de CV, entretiens structurés, onboarding automatisé.' },
  ]},
  { id: 'perso', label: 'Personnel', icon: 'self_improvement', tools: [
    { icon: 'credit_card', name: 'Budget & dépenses perso', desc: 'Suivi de vos finances personnelles, alertes et conseils d\'économie.' },
    { icon: 'home', name: 'Chasseur immobilier IA', desc: 'Veille immobilière, alertes, analyse de marché et négociation.' },
    { icon: 'description', name: 'CV & carrière IA', desc: 'CV optimisé, lettres de motivation, préparation d\'entretiens.' },
    { icon: 'self_improvement', name: 'Coach bien-être IA', desc: 'Conseils santé, méditation, déconnexion et équilibre vie pro/perso.' },
  ]},
];

// ─── Custom module examples (carousel)
export const CUSTOM_EXAMPLES = [
  { icon: 'home', name: 'Agent Immobilier', desc: 'Rédige les annonces, qualifie les leads, planifie les visites' },
  { icon: 'gavel', name: 'Veille Juridique', desc: 'Surveille les changements réglementaires et alerte en temps réel' },
  { icon: 'restaurant', name: 'Maître d\'Hôtel IA', desc: 'Gère les réservations, allergies, menus du jour par WhatsApp' },
  { icon: 'package_2', name: 'Suivi Logistique', desc: 'Traque les colis, prévient les retards, notifie les clients' },
  { icon: 'local_hospital', name: 'Assistant Médical', desc: 'Pré-qualifie les patients, gère les rendez-vous et rappels' },
  { icon: 'school', name: 'Tuteur IA', desc: 'Cours personnalisés, exercices adaptatifs, suivi de progression' },
  { icon: 'storefront', name: 'Vendeur E-commerce', desc: 'Recommande des produits, gère le SAV, relance les paniers' },
  { icon: 'fitness_center', name: 'Coach Sportif IA', desc: 'Programmes sur mesure, suivi nutrition, motivation quotidienne' },
];

// ─── "Pourquoi Freenzy" benefits
export const WHY_FREENZY = [
  { icon: 'diamond', title: '0% de commission', desc: 'Vous payez le prix officiel des fournisseurs IA. Pas de markup, pas de marge cachée. Ce que ça coûte réellement, c\'est ce que vous payez.', color: '#22c55e' },
  { icon: 'lock_open', title: 'Aucun abonnement', desc: 'Pas de forfait mensuel, pas d\'engagement. Vous rechargez des crédits quand vous en avez besoin. Vos crédits n\'expirent jamais.', color: '#f59e0b' },
  { icon: 'language', title: 'Toutes les IA du marché', desc: 'Claude, GPT, Gemini, Llama, Grok, Mistral — et tous les prochains dès leur sortie. Chaque agent choisit le meilleur modèle pour chaque tâche.', color: '#7c3aed' },
  { icon: 'flag', title: 'Données en Europe', desc: 'Serveurs EU, conformité RGPD native. Vos données ne servent jamais à entraîner des modèles. Chiffrement de bout en bout.', color: '#dc2626' },
  { icon: 'bolt', title: 'Opérationnel en 5 min', desc: 'Pas de formation, pas de configuration complexe. Créez votre compte, décrivez votre activité, vos agents sont immédiatement prêts.', color: '#3b82f6' },
  { icon: 'smart_toy', title: '100+ agents & templates', desc: 'Chaque domaine a son expert : commercial, marketing, RH, juridique, finance, dev, design, formation… Plus le marketplace avec des dizaines de templates prêts à l\'emploi.', color: '#9333ea' },
];

// ─── Trust badges
export const TRUST_BADGES = [
  { icon: 'lock', text: 'Chiffrement AES-256' },
  { icon: 'verified_user', text: 'Serveurs EU · RGPD' },
  { icon: 'credit_card', text: 'Paiement Stripe PCI' },
  { icon: 'shield', text: '2FA · TOTP' },
  { icon: 'bar_chart', text: 'Audit logs complets' },
];

// ─── Deep Discussions section
export const DISCUSSION_HIGHLIGHTS = [
  { icon: 'auto_awesome', text: '85+ templates de discussion guidée' },
  { icon: 'psychology', text: 'Extended Thinking — réflexion profonde avec Opus' },
  { icon: 'swords', text: 'Mode Challenge — l\'IA joue l\'avocat du diable' },
  { icon: 'share', text: 'Export Markdown, partage social, conclusions structurées' },
];

export const DISCUSSION_CATEGORIES = [
  'Philosophie', 'Éthique', 'Science', 'Économie', 'Géopolitique',
  'Psychologie', 'Art', 'Technologie', 'Spiritualité', 'Histoire',
  'Société', 'Environnement', '+4 autres',
];

// ─── Personal Agents B2C section
export const PERSONAL_AGENTS_LANDING = [
  { icon: 'credit_card', name: 'Budget perso', desc: 'Suivi dépenses, alertes, conseils d\'épargne', color: '#22c55e' },
  { icon: 'handshake', name: 'Négociateur', desc: 'Négociez salaire, loyer, contrats en confiance', color: '#f59e0b' },
  { icon: 'bar_chart', name: 'Impôts', desc: 'Optimisation fiscale, simulations, déclarations', color: '#3b82f6' },
  { icon: 'receipt_long', name: 'Comptable perso', desc: 'Suivi factures, rapprochement bancaire', color: '#8b5cf6' },
  { icon: 'home', name: 'Chasseur immo', desc: 'Veille immobilière, analyse de marché', color: '#f97316' },
  { icon: 'description', name: 'CV & carrière', desc: 'CV optimisé, lettre, prep entretien', color: '#06b6d4' },
  { icon: 'self_improvement', name: 'Coach bien-être', desc: 'Méditation, équilibre, déconnexion', color: '#ec4899' },
  { icon: 'edit', name: 'Atelier écriture', desc: 'Rédaction créative, correction, storytelling', color: '#a855f7' },
];

// ─── Studio Créatif section
export const STUDIO_FEATURES = [
  { icon: 'photo_camera', title: 'Photos IA', desc: 'Visuels pro, logos, bannières en quelques secondes', badge: 'fal.ai Flux', credits: '8 crédits', color: '#9333ea' },
  { icon: 'movie', title: 'Vidéos IA', desc: 'Clips vidéo 30s, animations, présentations', badge: 'LTX Video', credits: '20 crédits', color: '#ec4899' },
  { icon: 'face', title: 'Avatars parlants', desc: 'Votre avatar qui parle votre texte, tout naturel', badge: 'D-ID + ElevenLabs', credits: '15 crédits', color: '#f59e0b' },
];

export const STUDIO_CATEGORIES = ['Social Media', 'E-commerce', 'Branding', 'Présentation', 'Personnel', 'Marketing'];

// ─── Arcade & Gamification section
export const ARCADE_GAMES_PREVIEW = [
  { name: 'Motus', icon: 'spellcheck', color: '#22c55e' },
  { name: 'Sudoku', icon: 'grid_on', color: '#3b82f6' },
  { name: 'Snake', icon: 'route', color: '#16a34a' },
  { name: 'Tetris', icon: 'view_comfy_alt', color: '#8b5cf6' },
  { name: 'Quiz IA', icon: 'quiz', color: '#f59e0b' },
  { name: 'Memory', icon: 'psychology', color: '#ec4899' },
  { name: '2048', icon: 'calculate', color: '#f97316' },
  { name: 'Démineur', icon: 'crisis_alert', color: '#64748b' },
  { name: 'Dactylo', icon: 'keyboard', color: '#06b6d4' },
  { name: 'Défi du jour', icon: 'today', color: '#ef4444' },
];

export const ARCADE_BADGES_PREVIEW = [
  { icon: 'emoji_events', name: 'Premier Pas', desc: 'Première partie jouée' },
  { icon: 'speed', name: 'Doigts de fée', desc: 'Typing > 60 WPM' },
  { icon: 'extension', name: 'Maître du puzzle', desc: 'Sudoku < 5 min' },
  { icon: 'local_fire_department', name: 'Assidu', desc: '7 jours de streak' },
  { icon: 'sports_esports', name: 'Touche-à-tout', desc: 'Joué aux 10 jeux' },
  { icon: 'auto_awesome', name: 'Immortel', desc: 'Niveau max atteint' },
];

export const ARCADE_STATS = [
  { icon: 'sports_esports', value: '10', label: 'jeux intégrés' },
  { icon: 'military_tech', value: '50', label: 'niveaux' },
  { icon: 'emoji_events', value: '20', label: 'badges' },
];

// ─── Rewards CTA chips
export const REWARDS_CHIPS = [
  { icon: 'redeem', text: '50 crédits offerts', color: '#22c55e' },
  { icon: 'sports_esports', text: 'Gagnez en jouant', color: '#7c3aed' },
  { icon: 'group_add', text: 'Parrainage récompensé', color: '#3b82f6' },
];
