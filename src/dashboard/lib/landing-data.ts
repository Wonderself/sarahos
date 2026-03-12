// ═══════════════════════════════════════════════════════════
//   Landing Page Data — extracted from page.tsx
//   All icons replaced with native Unicode emojis
// ═══════════════════════════════════════════════════════════

// ─── Modèles IA
export const AI_MODELS = [
  { name: 'Claude · Anthropic', sub: 'Haiku · Sonnet · Opus 4 · Extended Thinking', emoji: '✨', color: '#1A1A1A' },
  { name: 'GPT · OpenAI', sub: 'GPT-4o · o3 · GPT-4.5', emoji: '🤖', color: '#1A1A1A' },
  { name: 'Gemini · Google', sub: 'Flash · Pro · Ultra', emoji: '💎', color: '#1A1A1A' },
  { name: 'Llama · Meta', sub: 'Llama 4 · open source', emoji: '🦙', color: '#1A1A1A' },
  { name: 'Grok · xAI', sub: 'Grok 3 · raisonnement temps réel', emoji: '⚡', color: '#1A1A1A' },
  { name: 'Mistral · Cohere', sub: 'IA européenne · et tous les prochains', emoji: '🌊', color: '#1A1A1A' },
];

// ─── Écosystème
export const ECOSYSTEM = [
  { name: 'ElevenLabs', sub: 'Voix naturelle · TTS premium', emoji: '🎙️' },
  { name: 'Twilio', sub: 'Appels entrants · SMS · WhatsApp', emoji: '📞' },
  { name: 'pgvector', sub: 'Mémoire longue durée · RAG', emoji: '🧠' },
  { name: 'WhatsApp Business', sub: 'Messages IA entrants & sortants', emoji: '💚' },
  { name: 'Runway ML', sub: 'Génération vidéo IA', emoji: '🎬' },
  { name: 'DALL-E · Flux', sub: 'Génération image IA', emoji: '🖼️' },
  { name: 'Redis', sub: 'Cache · sessions temps réel', emoji: '⚡' },
  { name: 'Stripe', sub: 'Paiement · facturation sécurisée', emoji: '💳' },
];

// ─── Agents (display list for landing)
export const LANDING_AGENTS = [
  { emoji: '📞', name: 'Répondeur 24/7', cat: 'Business' },
  { emoji: '🤝', name: 'Assistante', cat: 'Business' },
  { emoji: '🚀', name: 'Commercial', cat: 'Business' },
  { emoji: '📢', name: 'Marketing', cat: 'Business' },
  { emoji: '👥', name: 'RH', cat: 'Business' },
  { emoji: '📣', name: 'Communication', cat: 'Business' },
  { emoji: '💰', name: 'Finance', cat: 'Business' },
  { emoji: '💻', name: 'Dev', cat: 'Business' },
  { emoji: '⚖️', name: 'Juridique', cat: 'Business' },
  { emoji: '🎯', name: 'Direction Générale', cat: 'Business' },
  { emoji: '🎬', name: 'Vidéo', cat: 'Business' },
  { emoji: '📸', name: 'Photo / Visuel', cat: 'Business' },
  { emoji: '💳', name: 'Budget perso', cat: 'Perso' },
  { emoji: '🤝', name: 'Négociateur', cat: 'Perso' },
  { emoji: '📊', name: 'Impôts', cat: 'Perso' },
  { emoji: '🧾', name: 'Comptable', cat: 'Perso' },
  { emoji: '🏠', name: 'Chasseur immo', cat: 'Perso' },
  { emoji: '📈', name: 'Portfolio', cat: 'Perso' },
  { emoji: '📝', name: 'CV & carrière', cat: 'Perso' },
  { emoji: '💬', name: 'Contradicteur', cat: 'Perso' },
  { emoji: '✍️', name: 'Écrivain', cat: 'Perso' },
  { emoji: '🎥', name: 'Cinéaste', cat: 'Perso' },
  { emoji: '🧘', name: 'Coach', cat: 'Perso' },
  { emoji: '🏔️', name: 'Déconnexion', cat: 'Perso' },
];

// ─── Actions avec crédits
export const ACTION_COSTS = [
  { emoji: '💬', action: 'Chat avec agent IA', model: 'Haiku', count: '100 chats', color: '#1A1A1A' },
  { emoji: '✉️', action: 'Email professionnel', model: 'Sonnet', count: '45 emails', color: '#1A1A1A' },
  { emoji: '📱', action: 'Post réseaux sociaux', model: 'Haiku', count: '62 posts', color: '#1A1A1A' },
  { emoji: '📄', action: 'Document complet', model: 'Sonnet', count: '14 docs', color: '#1A1A1A' },
  { emoji: '📞', action: 'Appel répondeur IA', model: 'Twilio + Haiku', count: '10 appels', color: '#1A1A1A' },
  { emoji: '📲', action: 'Appel sortant IA', model: 'Twilio + Sonnet', count: '3 appels', color: '#1A1A1A' },
  { emoji: '💚', action: 'WhatsApp Business IA', model: 'Haiku', count: '125 msgs', color: '#1A1A1A' },
  { emoji: '🎙️', action: 'Message vocal TTS', model: 'ElevenLabs', count: '11 msgs', color: '#1A1A1A' },
  { emoji: '🖼️', action: 'Image IA créée', model: 'DALL-E · Flux', count: '7 images', color: '#1A1A1A' },
  { emoji: '🎬', action: 'Clip vidéo 30s', model: 'Runway ML', count: '1 clip', color: '#1A1A1A' },
  { emoji: '🤝', action: 'Réunion IA structurée', model: 'Opus', count: '6 réunions', color: '#1A1A1A' },
];

// ─── Stats badges (reverse ticker)
export const STATS_BADGES = [
  { emoji: '🤖', value: '100+', label: 'agents IA' },
  { emoji: '🧠', value: '6+', label: 'modèles IA' },
  { emoji: '⚡', value: '5 min', label: 'onboarding' },
  { emoji: '💎', value: '0%', label: 'commission' },
  { emoji: '🌙', value: '24/7', label: 'actifs' },
  { emoji: '🌍', value: '50+', label: 'langues' },
  { emoji: '❓', value: '103', label: 'FAQ' },
  { emoji: '🛒', value: '50', label: 'templates' },
  { emoji: '🛡️', value: 'RGPD', label: 'conforme' },
  { emoji: '🔒', value: 'AES-256', label: 'chiffrement' },
  { emoji: '☕', value: '8', label: 'modes Réveil' },
  { emoji: '🎯', value: '50', label: 'crédits offerts' },
];

// ─── Live activity feed
export const ACTIVITY = [
  { emoji: '📞', text: 'Appel traité · lead qualifié', agent: 'Répondeur', color: '#1A1A1A', ago: '2 min' },
  { emoji: '✉️', text: 'Proposition commerciale envoyée', agent: 'Commercial', color: '#1A1A1A', ago: '4 min' },
  { emoji: '📱', text: '3 posts LinkedIn programmés', agent: 'Marketing', color: '#1A1A1A', ago: '8 min' },
  { emoji: '📊', text: 'Rapport mensuel généré', agent: 'Finance', color: '#1A1A1A', ago: '13 min' },
  { emoji: '⏰', text: 'Briefing matinal envoyé', agent: 'Réveil IA', color: '#1A1A1A', ago: '19 min' },
  { emoji: '🖼️', text: 'Visuel créé · campagne Été 2026', agent: 'Photo/Visuel', color: '#1A1A1A', ago: '24 min' },
  { emoji: '📄', text: 'NDA bilingue généré', agent: 'Juridique', color: '#1A1A1A', ago: '31 min' },
  { emoji: '💬', text: '12 messages WhatsApp traités', agent: 'Assistante', color: '#1A1A1A', ago: '39 min' },
  { emoji: '🎬', text: 'Clip vidéo 30s créé', agent: 'Vidéo', color: '#1A1A1A', ago: '47 min' },
  { emoji: '🎯', text: 'Stratégie Q2 synthétisée', agent: 'DG', color: '#1A1A1A', ago: '1h' },
];

// ─── Interactive demo scenarios
export const DEMO_SCENARIOS = [
  {
    tab: 'Répondeur',
    tabEmoji: '📞',
    color: '#1A1A1A',
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
    tabEmoji: '✉️',
    color: '#1A1A1A',
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
    tabEmoji: '📱',
    color: '#1A1A1A',
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
    tabEmoji: '📄',
    color: '#1A1A1A',
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
    color: '#1A1A1A',
  },
  {
    title: 'Réveil Intelligent',
    desc: 'Chaque matin à 7h : météo, agenda, actualités sectorielles, KPIs et priorités du jour en audio.',
    steps: ['Collecte données multi-sources', 'Synthèse personnalisée IA', 'Livraison audio ElevenLabs'],
    tech: 'Claude Sonnet + ElevenLabs + Cron',
    color: '#1A1A1A',
  },
  {
    title: 'Factory Documents',
    desc: 'Générez contrats, devis, NDA, CGV en langage naturel. Export PDF signable, archivage auto.',
    steps: ['Prompt en langage naturel', 'Génération structurée IA', 'Export PDF + archivage'],
    tech: 'Claude Sonnet · 3.5 crédits/doc',
    color: '#1A1A1A',
  },
  {
    title: 'Social Media Autopilot',
    desc: 'Créez et planifiez vos posts LinkedIn, Twitter, Instagram. Ton adapté, hashtags, calendrier éditorial.',
    steps: ['Brief créatif', 'Rédaction multi-formats IA', 'Planification + publication'],
    tech: 'Claude Haiku · 2.4 crédits/post',
    color: '#1A1A1A',
  },
];

// ─── Technologies spotlight
export const TECH_FEATURES = [
  {
    title: 'Claude AI · Anthropic',
    desc: 'Le cerveau de vos agents. Haiku pour la vitesse, Sonnet pour la précision, Opus avec Extended Thinking pour les décisions stratégiques.',
    points: ['3 niveaux de puissance', 'Extended Thinking (Opus)', 'Mémoire contextuelle longue'],
    color: '#1A1A1A',
  },
  {
    title: 'ElevenLabs · Voix Premium',
    desc: 'Voix naturelle multilingue pour le réveil intelligent, les messages vocaux et les appels sortants.',
    points: ['Multilingual v2', 'Voix personnalisable', '11 langues'],
    color: '#1A1A1A',
  },
  {
    title: 'Twilio · Téléphonie',
    desc: 'Appels entrants, sortants, SMS et WhatsApp Business. Votre agent répond 24/7, qualifie et transmet.',
    points: ['Appels entrants/sortants', 'SMS + WhatsApp', 'Numéro local dédié'],
    color: '#1A1A1A',
  },
  {
    title: 'Studio Créatif · IA',
    desc: 'Générez photos, visuels, clips vidéo et avatars parlants. Intégré directement dans votre dashboard.',
    points: ['Photo IA (Flux/DALL-E)', 'Vidéo IA (Runway/D-ID)', 'Avatars parlants'],
    color: '#1A1A1A',
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
  { id: 'comm', label: 'Communication', emoji: '📞', tools: [
    { emoji: '📞', name: 'Répondeur intelligent 24/7', desc: 'Répond à vos appels, qualifie les leads, prend les RDV automatiquement.' },
    { emoji: '💚', name: 'WhatsApp Business IA', desc: 'Messages entrants et sortants, notifications, pilotage par WhatsApp.' },
    { emoji: '📲', name: 'Appels sortants IA', desc: 'Prospection, relances et confirmations par téléphone avec voix naturelle.' },
    { emoji: '✉️', name: 'Email IA professionnel', desc: 'Rédaction, envoi et suivi automatique de vos emails business.' },
  ]},
  { id: 'prod', label: 'Productivité', emoji: '⚡', tools: [
    { emoji: '⏰', name: 'Réveil intelligent & Brief', desc: 'Briefing personnalisé chaque matin : agenda, priorités, météo, actus.' },
    { emoji: '🎯', name: 'Plan d\'action quotidien', desc: 'Objectifs structurés, tâches priorisées, suivi de progression en temps réel.' },
    { emoji: '📄', name: 'Documents & contrats IA', desc: 'Génération de devis, contrats, NDA, rapports en quelques secondes.' },
    { emoji: '📆', name: 'Réunions structurées IA', desc: 'Ordre du jour, compte-rendu, décisions et actions — tout automatisé.' },
  ]},
  { id: 'create', label: 'Création', emoji: '🎨', tools: [
    { emoji: '📸', name: 'Studio Photo IA', desc: 'Créez des visuels pro, logos, bannières avec DALL-E et Flux.' },
    { emoji: '🎬', name: 'Studio Vidéo IA', desc: 'Clips vidéo 30s, talking heads, animations pour vos réseaux.' },
    { emoji: '📱', name: 'Réseaux sociaux IA', desc: 'Posts LinkedIn, Twitter, Instagram générés et planifiés automatiquement.' },
    { emoji: '📢', name: 'Campagnes marketing IA', desc: 'Stratégies, contenus et calendrier éditorial générés par IA.' },
  ]},
  { id: 'gestion', label: 'Gestion', emoji: '📊', tools: [
    { emoji: '💰', name: 'Comptabilité & finances', desc: 'Suivi trésorerie, factures, dépenses et rapports financiers IA.' },
    { emoji: '👥', name: 'Suivi clients & CRM', desc: 'Pipeline commercial, relances automatiques, historique client complet.' },
    { emoji: '⚖️', name: 'Veille juridique IA', desc: 'Alertes réglementaires, analyse de contrats, conformité automatisée.' },
    { emoji: '🧑‍💼', name: 'RH & recrutement IA', desc: 'Tri de CV, entretiens structurés, onboarding automatisé.' },
  ]},
  { id: 'perso', label: 'Personnel', emoji: '🧘', tools: [
    { emoji: '💳', name: 'Budget & dépenses perso', desc: 'Suivi de vos finances personnelles, alertes et conseils d\'économie.' },
    { emoji: '🏠', name: 'Chasseur immobilier IA', desc: 'Veille immobilière, alertes, analyse de marché et négociation.' },
    { emoji: '📝', name: 'CV & carrière IA', desc: 'CV optimisé, lettres de motivation, préparation d\'entretiens.' },
    { emoji: '🧘', name: 'Coach bien-être IA', desc: 'Conseils santé, méditation, déconnexion et équilibre vie pro/perso.' },
  ]},
];

// ─── Custom module examples (carousel)
export const CUSTOM_EXAMPLES = [
  { emoji: '🏠', name: 'Agent Immobilier', desc: 'Rédige les annonces, qualifie les leads, planifie les visites' },
  { emoji: '⚖️', name: 'Veille Juridique', desc: 'Surveille les changements réglementaires et alerte en temps réel' },
  { emoji: '🍽️', name: 'Maître d\'Hôtel IA', desc: 'Gère les réservations, allergies, menus du jour par WhatsApp' },
  { emoji: '📦', name: 'Suivi Logistique', desc: 'Traque les colis, prévient les retards, notifie les clients' },
  { emoji: '🏥', name: 'Assistant Médical', desc: 'Pré-qualifie les patients, gère les rendez-vous et rappels' },
  { emoji: '🎓', name: 'Tuteur IA', desc: 'Cours personnalisés, exercices adaptatifs, suivi de progression' },
  { emoji: '🛒', name: 'Vendeur E-commerce', desc: 'Recommande des produits, gère le SAV, relance les paniers' },
  { emoji: '💪', name: 'Coach Sportif IA', desc: 'Programmes sur mesure, suivi nutrition, motivation quotidienne' },
];

// ─── "Pourquoi Freenzy" benefits
export const WHY_FREENZY = [
  { emoji: '💎', title: '0% de commission', desc: 'Vous payez le prix officiel des fournisseurs IA. Pas de markup, pas de marge cachée. Ce que ça coûte réellement, c\'est ce que vous payez.', color: '#1A1A1A' },
  { emoji: '🔓', title: 'Aucun abonnement', desc: 'Pas de forfait mensuel, pas d\'engagement. Vous rechargez des crédits quand vous en avez besoin. Vos crédits n\'expirent jamais.', color: '#1A1A1A' },
  { emoji: '🌍', title: 'Toutes les IA du marché', desc: 'Claude, GPT, Gemini, Llama, Grok, Mistral — et tous les prochains dès leur sortie. Chaque agent choisit le meilleur modèle pour chaque tâche.', color: '#1A1A1A' },
  { emoji: '🇪🇺', title: 'Données en Europe', desc: 'Serveurs EU, conformité RGPD native. Vos données ne servent jamais à entraîner des modèles. Chiffrement de bout en bout.', color: '#1A1A1A' },
  { emoji: '⚡', title: 'Opérationnel en 5 min', desc: 'Pas de formation, pas de configuration complexe. Créez votre compte, décrivez votre activité, vos agents sont immédiatement prêts.', color: '#1A1A1A' },
  { emoji: '🤖', title: '100+ agents & templates', desc: 'Chaque domaine a son expert : commercial, marketing, RH, juridique, finance, dev, design, formation… Plus le marketplace avec des dizaines de templates prêts à l\'emploi.', color: '#1A1A1A' },
];

// ─── Trust badges
export const TRUST_BADGES = [
  { emoji: '🔒', text: 'Chiffrement AES-256' },
  { emoji: '🛡️', text: 'Serveurs EU · RGPD' },
  { emoji: '💳', text: 'Paiement Stripe PCI' },
  { emoji: '🔐', text: '2FA · TOTP' },
  { emoji: '📊', text: 'Audit logs complets' },
];

// ─── Deep Discussions section
export const DISCUSSION_HIGHLIGHTS = [
  { emoji: '✨', text: '85+ templates de discussion guidée' },
  { emoji: '🧠', text: 'Extended Thinking — réflexion profonde avec Opus' },
  { emoji: '⚔️', text: 'Mode Challenge — l\'IA joue l\'avocat du diable' },
  { emoji: '🔗', text: 'Export Markdown, partage social, conclusions structurées' },
];

export const DISCUSSION_CATEGORIES = [
  'Philosophie', 'Éthique', 'Science', 'Économie', 'Géopolitique',
  'Psychologie', 'Art', 'Technologie', 'Spiritualité', 'Histoire',
  'Société', 'Environnement', '+4 autres',
];

// ─── Personal Agents B2C section
export const PERSONAL_AGENTS_LANDING = [
  { emoji: '💳', name: 'Budget perso', desc: 'Suivi dépenses, alertes, conseils d\'épargne', color: '#1A1A1A' },
  { emoji: '🤝', name: 'Négociateur', desc: 'Négociez salaire, loyer, contrats en confiance', color: '#1A1A1A' },
  { emoji: '📊', name: 'Impôts', desc: 'Optimisation fiscale, simulations, déclarations', color: '#1A1A1A' },
  { emoji: '🧾', name: 'Comptable perso', desc: 'Suivi factures, rapprochement bancaire', color: '#1A1A1A' },
  { emoji: '🏠', name: 'Chasseur immo', desc: 'Veille immobilière, analyse de marché', color: '#1A1A1A' },
  { emoji: '📝', name: 'CV & carrière', desc: 'CV optimisé, lettre, prep entretien', color: '#1A1A1A' },
  { emoji: '🧘', name: 'Coach bien-être', desc: 'Méditation, équilibre, déconnexion', color: '#1A1A1A' },
  { emoji: '✍️', name: 'Atelier écriture', desc: 'Rédaction créative, correction, storytelling', color: '#1A1A1A' },
];

// ─── Studio Créatif section
export const STUDIO_FEATURES = [
  { emoji: '📸', title: 'Photos IA', desc: 'Visuels pro, logos, bannières en quelques secondes', badge: 'fal.ai Flux', credits: '8 crédits', color: '#1A1A1A' },
  { emoji: '🎬', title: 'Vidéos IA', desc: 'Clips vidéo 30s, animations, présentations', badge: 'LTX Video', credits: '20 crédits', color: '#1A1A1A' },
  { emoji: '🗣️', title: 'Avatars parlants', desc: 'Votre avatar qui parle votre texte, tout naturel', badge: 'D-ID + ElevenLabs', credits: '15 crédits', color: '#1A1A1A' },
];

export const STUDIO_CATEGORIES = ['Social Media', 'E-commerce', 'Branding', 'Présentation', 'Personnel', 'Marketing'];

// ─── Arcade & Gamification section
export const ARCADE_GAMES_PREVIEW = [
  { name: 'Motus', emoji: '🔤', color: '#1A1A1A' },
  { name: 'Sudoku', emoji: '🔢', color: '#1A1A1A' },
  { name: 'Snake', emoji: '🐍', color: '#1A1A1A' },
  { name: 'Tetris', emoji: '🧱', color: '#1A1A1A' },
  { name: 'Quiz IA', emoji: '❓', color: '#1A1A1A' },
  { name: 'Memory', emoji: '🃏', color: '#1A1A1A' },
  { name: '2048', emoji: '🔟', color: '#1A1A1A' },
  { name: 'Démineur', emoji: '💣', color: '#1A1A1A' },
  { name: 'Dactylo', emoji: '⌨️', color: '#1A1A1A' },
  { name: 'Défi du jour', emoji: '📅', color: '#1A1A1A' },
];

export const ARCADE_BADGES_PREVIEW = [
  { emoji: '🏆', name: 'Premier Pas', desc: 'Première partie jouée' },
  { emoji: '⚡', name: 'Doigts de fée', desc: 'Typing > 60 WPM' },
  { emoji: '🧩', name: 'Maître du puzzle', desc: 'Sudoku < 5 min' },
  { emoji: '🔥', name: 'Assidu', desc: '7 jours de streak' },
  { emoji: '🕹️', name: 'Touche-à-tout', desc: 'Joué aux 10 jeux' },
  { emoji: '✨', name: 'Immortel', desc: 'Niveau max atteint' },
];

export const ARCADE_STATS = [
  { emoji: '🕹️', value: '10', label: 'jeux intégrés' },
  { emoji: '🎖️', value: '50', label: 'niveaux' },
  { emoji: '🏆', value: '20', label: 'badges' },
];

// ─── Rewards CTA chips
export const REWARDS_CHIPS = [
  { emoji: '🎁', text: '50 crédits offerts', color: '#1A1A1A' },
  { emoji: '🕹️', text: 'Gagnez en jouant', color: '#1A1A1A' },
  { emoji: '👥', text: 'Parrainage récompensé', color: '#1A1A1A' },
];
