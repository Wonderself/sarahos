// ─── Emoji Map ────────────────────────────────────────────────────────────────
// Centralized emoji mapping for the entire client dashboard.
// Replaces Material Symbols Rounded icons with native Unicode emojis.

// ─── Section Emojis ──────────────────────────────────────────────────────────

export const SECTION_EMOJIS: Record<string, string> = {
  quotidien: '⚡',
  creation: '🎨',
  communication: '📞',
  assistants: '🤖',
  productivite: '📋',
  business: '💼',
  bienetre: '🌿',
  moi: '👤',
  'agents-perso': '🧠',
  discussions: '💭',
  divertissement: '🎮',
  entreprise: '🏢',
  developpeur: '🔧',
  // legacy alias
  workspace: '📋',
};

// ─── Navigation Item Emojis ──────────────────────────────────────────────────

export const NAV_EMOJIS: Record<string, string> = {
  // Espace de travail
  dashboard: '🏠',
  reveil: '☕',
  chat: '💬',
  repondeur: '📞',
  social: '📱',
  studio: '🎬',
  documents: '📄',
  strategy: '🎯',
  'custom-creation': '🧩',
  'video-pro': '📹',
  formations: '🎓',
  personal: '👤',
  'agents-customize': '🎨',
  agents: '🤖',
  modules: '📦',
  campaigns: '📢',
  telephony: '☎️',
  projects: '📁',
  actions: '⚡',
  journee: '📅',

  // Moi
  account: '⚙️',
  analytics: '📊',
  finances: '💳',
  referrals: '🎁',
  rewards: '🏆',
  activity: '🕐',
  timeline: '📈',
  notifications: '🔔',

  // Agents personnels
  budget: '💰',
  comptable: '🧾',
  chasseur: '🏹',
  cv: '📝',
  ecrivain: '✍️',

  // Discussions
  discussions: '🧠',

  // Divertissement
  games: '🕹️',
  'games-create': '➕',
  'games-community': '🎪',

  // Mon Entreprise
  onboarding: '🏗️',
  team: '👥',
  partners: '🤝',
  marketplace: '🛒',

  // Developpeur
  widget: '💻',

  // Nouvelles pages outils
  notes: '📝',
  pomodoro: '🍅',
  calendrier: '📅',
  email: '✉️',
  signatures: '✒️',
  'email-templates': '📧',
  facturation: '🧾',
  crm: '🤝',
  seo: '🔍',
  veille: '📰',
  'landing-builder': '🏗️',
  kanban: '📋',
  traduction: '🌐',
  qrcode: '🔳',
  photos: '🖼️',
  habitudes: '✅',
  journal: '📓',

  // Extras
  briefing: '☀️',
  meeting: '📆',
  visio: '🎥',
  whatsapp: '💚',
  profile: '🪪',
  settings: '⚙️',
};

// ─── Page Metadata (title, subtitle, helpText) ──────────────────────────────

export interface PageMeta {
  emoji: string;
  title: string;
  subtitle: string;
  helpText: string;
}

export const PAGE_META: Record<string, PageMeta> = {
  dashboard: {
    emoji: '🏠',
    title: 'Tableau de bord',
    subtitle: 'Voici votre espace de travail',
    helpText: 'Votre page d\'accueil avec vos KPIs, tâches et accès rapides à toutes les fonctionnalités.',
  },
  chat: {
    emoji: '💬',
    title: 'Chat',
    subtitle: 'Parlez à vos assistants IA',
    helpText: 'Choisissez un assistant et démarrez une conversation. Chaque message consomme 1 à 3 crédits selon l\'assistant.',
  },
  repondeur: {
    emoji: '📞',
    title: 'Répondeur',
    subtitle: 'Votre secrétaire automatique',
    helpText: 'Le répondeur gère vos appels et messages WhatsApp 24/7. Il prend des messages, des commandes, et filtre les urgences.',
  },
  studio: {
    emoji: '🎬',
    title: 'Studio Créatif',
    subtitle: 'Créez des photos et vidéos IA',
    helpText: 'Générez des visuels professionnels en quelques clics. Photos : ~8 crédits. Vidéos : ~20 crédits.',
  },
  documents: {
    emoji: '📄',
    title: 'Documents',
    subtitle: 'Générez et gérez vos documents',
    helpText: 'Créez des contrats, factures, présentations et rapports avec l\'aide de l\'IA.',
  },
  social: {
    emoji: '📱',
    title: 'Réseaux Sociaux',
    subtitle: 'Gérez votre présence en ligne',
    helpText: 'Planifiez et générez du contenu pour Instagram, LinkedIn, Facebook et Twitter.',
  },
  reveil: {
    emoji: '☕',
    title: 'Réveil Intelligent',
    subtitle: 'Réveillez-vous avec votre briefing IA',
    helpText: 'Configurez un appel ou message matinal personnalisé avec les infos de votre journée.',
  },
  strategy: {
    emoji: '🎯',
    title: 'Plan d\'attaque',
    subtitle: 'Définissez vos objectifs',
    helpText: 'Créez votre stratégie avec l\'aide de vos assistants. Ils proposent des actions concrètes.',
  },
  actions: {
    emoji: '⚡',
    title: 'Centre d\'actions',
    subtitle: 'Actions proposées par vos assistants',
    helpText: 'Vos assistants proposent des actions à valider. Acceptez, refusez ou déléguez chaque proposition.',
  },
  agents: {
    emoji: '🤖',
    title: 'Assistants IA',
    subtitle: 'Votre équipe d\'assistants',
    helpText: 'Gérez vos assistants actifs, créez des assistants personnalisés, configurez leurs comportements.',
  },
  formations: {
    emoji: '🎓',
    title: 'Formations',
    subtitle: 'Apprenez à utiliser Freenzy',
    helpText: 'Tutoriels et guides pour tirer le meilleur de chaque fonctionnalité.',
  },
  analytics: {
    emoji: '📊',
    title: 'Analytics',
    subtitle: 'Vos statistiques d\'utilisation',
    helpText: 'Suivez votre consommation de tokens, crédits et l\'activité de vos assistants.',
  },
  finances: {
    emoji: '💳',
    title: 'Finances',
    subtitle: 'Coûts et facturation',
    helpText: 'Détail de vos dépenses, recharges de crédits et historique de facturation.',
  },
  referrals: {
    emoji: '🎁',
    title: 'Parrainer',
    subtitle: 'Gagnez 20€ par ami',
    helpText: 'Partagez votre code de parrainage. Quand votre ami s\'inscrit et utilise Freenzy, vous gagnez tous les deux.',
  },
  rewards: {
    emoji: '🏆',
    title: 'Récompenses',
    subtitle: 'Gagnez des crédits gratuits',
    helpText: 'Complétez des actions (première conversation, premier document...) pour gagner des crédits bonus.',
  },
  account: {
    emoji: '⚙️',
    title: 'Mon Compte',
    subtitle: 'Profil et paramètres',
    helpText: 'Gérez votre profil, suivez vos crédits et configurez vos préférences.',
  },
  notifications: {
    emoji: '🔔',
    title: 'Notifications',
    subtitle: 'Vos alertes',
    helpText: 'Tous les messages importants de vos assistants, du système et de votre activité.',
  },
  discussions: {
    emoji: '🧠',
    title: 'Discussions Profondes',
    subtitle: 'Explorez des sujets en profondeur',
    helpText: 'Des conversations thématiques approfondies avec vos assistants sur des sujets complexes. Utilise le modèle le plus puissant (Opus).',
  },
  games: {
    emoji: '🕹️',
    title: 'Arcade',
    subtitle: 'Jeux et mini-jeux',
    helpText: 'Détendez-vous avec des mini-jeux tout en gagnant des points et des badges.',
  },
  'games-create': {
    emoji: '➕',
    title: 'Créer un jeu',
    subtitle: 'Concevez votre propre jeu',
    helpText: 'Utilisez l\'IA pour créer un mini-jeu personnalisé et le partager avec la communauté.',
  },
  'games-community': {
    emoji: '🎪',
    title: 'Communauté',
    subtitle: 'Jeux partagés et scores',
    helpText: 'Découvrez les jeux créés par d\'autres utilisateurs et comparez vos scores.',
  },
  marketplace: {
    emoji: '🛒',
    title: 'Marketplace',
    subtitle: 'Recrutez de nouveaux assistants',
    helpText: 'Parcourez les assistants disponibles et ajoutez-les à votre équipe. Certains sont gratuits, d\'autres premium.',
  },
  budget: {
    emoji: '💰',
    title: 'Mon Budget',
    subtitle: 'Suivi de vos finances personnelles',
    helpText: 'Votre assistant budgétaire analyse vos revenus et dépenses pour vous aider à économiser.',
  },
  comptable: {
    emoji: '🧾',
    title: 'Comptabilité',
    subtitle: 'Gestion comptable simplifiée',
    helpText: 'Votre assistant comptable gère factures, TVA et déclarations.',
  },
  chasseur: {
    emoji: '🏹',
    title: 'Chasseur de missions',
    subtitle: 'Trouvez des opportunités',
    helpText: 'Votre assistant recherche des missions, emplois et opportunités correspondant à votre profil.',
  },
  cv: {
    emoji: '📝',
    title: 'CV 2026',
    subtitle: 'Créez un CV moderne',
    helpText: 'Votre assistant rédige et optimise votre CV pour chaque candidature.',
  },
  ecrivain: {
    emoji: '✍️',
    title: 'Atelier Écriture',
    subtitle: 'Écrivez avec l\'IA',
    helpText: 'Votre assistant écrivain vous aide à rédiger articles, livres, scripts et contenus créatifs.',
  },
  onboarding: {
    emoji: '🏗️',
    title: 'Profil Entreprise',
    subtitle: 'Configurez votre entreprise',
    helpText: '7 étapes pour configurer votre profil d\'entreprise et personnaliser vos assistants.',
  },
  team: {
    emoji: '👥',
    title: 'Mon Équipe',
    subtitle: 'Gérez votre workspace',
    helpText: 'Invitez des collaborateurs, assignez des rôles et gérez les permissions.',
  },
  partners: {
    emoji: '🤝',
    title: 'Partenaires',
    subtitle: 'Vos intégrations',
    helpText: 'Connectez vos outils existants (CRM, email, calendrier...) à Freenzy.',
  },
  projects: {
    emoji: '📁',
    title: 'Projets',
    subtitle: 'Multi-projets isolés',
    helpText: 'Créez des projets séparés avec leurs propres assistants, documents et paramètres.',
  },
  telephony: {
    emoji: '☎️',
    title: 'Téléphonie',
    subtitle: 'Configuration des appels',
    helpText: 'Configurez vos numéros Twilio, routage d\'appels et messages vocaux.',
  },
  campaigns: {
    emoji: '📢',
    title: 'Campagnes',
    subtitle: 'Marketing multi-plateformes',
    helpText: 'Créez et planifiez des campagnes marketing sur plusieurs canaux.',
  },
  modules: {
    emoji: '📦',
    title: 'Modules',
    subtitle: 'Étendez vos assistants',
    helpText: 'Ajoutez des capacités à vos assistants avec des modules spécialisés.',
  },
  'video-pro': {
    emoji: '📹',
    title: 'Vidéo Pro',
    subtitle: 'Production vidéo avancée',
    helpText: 'Créez des vidéos professionnelles, talking heads et montages.',
  },
  'custom-creation': {
    emoji: '🧩',
    title: 'Création sur mesure',
    subtitle: 'Créez votre propre module',
    helpText: 'Concevez un assistant ou un outil sur mesure adapté à votre métier.',
  },
  activity: {
    emoji: '🕐',
    title: 'Journal d\'activité',
    subtitle: 'Historique complet',
    helpText: 'Retrouvez toutes vos actions, connexions et interactions.',
  },
  timeline: {
    emoji: '📈',
    title: 'Chronologie',
    subtitle: 'Vue temporelle',
    helpText: 'Visualisez votre activité sur une frise chronologique.',
  },
  widget: {
    emoji: '💻',
    title: 'Widget',
    subtitle: 'Intégrez Freenzy',
    helpText: 'Ajoutez un widget Freenzy à votre site web. Copiez le code et personnalisez.',
  },
  personal: {
    emoji: '👤',
    title: 'Mes Assistants',
    subtitle: 'Gérez votre équipe personnelle',
    helpText: 'Activez, désactivez et configurez vos assistants business et personnels.',
  },
  'agents-customize': {
    emoji: '🎨',
    title: 'Personnaliser',
    subtitle: 'Configurez vos assistants',
    helpText: 'Ajustez le comportement, le ton et les capacités de chaque assistant.',
  },
  visio: {
    emoji: '🎥',
    title: 'Appel vocal',
    subtitle: 'Parlez à vos assistants',
    helpText: 'Démarrez un appel vocal avec n\'importe quel assistant. Transcription en temps réel.',
  },
  meeting: {
    emoji: '📆',
    title: 'Réunion',
    subtitle: 'Réunions multi-assistants',
    helpText: 'Lancez une réunion avec plusieurs assistants pour des discussions collaboratives.',
  },
  journee: {
    emoji: '📅',
    title: 'Ma Journée',
    subtitle: 'Votre planning complet',
    helpText: 'Tous vos widgets, tâches, bien-être et objectifs du jour en un coup d\'oeil.',
  },
  'team-members': {
    emoji: '🧑‍💼',
    title: 'Membres',
    subtitle: 'Gérez votre équipe',
    helpText: 'Invitez des collaborateurs, gérez les rôles et suivez qui est en ligne.',
  },
  'team-groups': {
    emoji: '🏘️',
    title: 'Groupes',
    subtitle: 'Organisez par équipe',
    helpText: 'Créez des groupes thématiques pour organiser votre équipe par projet ou département.',
  },
  'team-communities': {
    emoji: '🌐',
    title: 'Communautés',
    subtitle: 'Rejoignez et créez',
    helpText: 'Découvrez des communautés, échangez avec d\'autres utilisateurs et créez la vôtre.',
  },
  'team-chat': {
    emoji: '💬',
    title: 'Chat d\'équipe',
    subtitle: 'Messagerie collaborative',
    helpText: 'Échangez avec votre équipe dans des channels, DMs et fils de discussion.',
  },
  // ─── Nouvelles pages outils (Sprint Mars 2026) ──────────────────────────────
  notes: {
    emoji: '📝',
    title: 'Notes rapides',
    subtitle: 'Capturez vos idées',
    helpText: 'Prenez des notes rapidement, organisez-les par tags et couleurs. Recherche instantanée, export Markdown.',
  },
  pomodoro: {
    emoji: '🍅',
    title: 'Focus / Pomodoro',
    subtitle: 'Boostez votre concentration',
    helpText: 'Timer Pomodoro (25min travail / 5min pause), statistiques de sessions, streaks de productivité.',
  },
  calendrier: {
    emoji: '📅',
    title: 'Calendrier',
    subtitle: 'Organisez votre temps',
    helpText: 'Vue jour/semaine/mois, ajoutez des événements, rappels et deadlines. Prêt à connecter Google Calendar.',
  },
  email: {
    emoji: '✉️',
    title: 'Email IA',
    subtitle: 'Rédigez des emails parfaits',
    helpText: 'L\'IA rédige vos emails professionnels et personnels. Choisissez le ton, la langue et le style.',
  },
  signatures: {
    emoji: '✒️',
    title: 'Signatures Email',
    subtitle: 'Créez votre signature pro',
    helpText: 'Générez des signatures email HTML élégantes avec photo, logo, liens sociaux. Copiez le code HTML.',
  },
  'email-templates': {
    emoji: '📧',
    title: 'Templates Email',
    subtitle: 'Modèles prêts à l\'emploi',
    helpText: 'Bibliothèque de templates email pour vos campagnes : newsletter, promo, bienvenue, relance...',
  },
  facturation: {
    emoji: '🧾',
    title: 'Facturation',
    subtitle: 'Devis et factures en 30s',
    helpText: 'Créez des devis et factures professionnels, suivez les paiements, calculez la TVA automatiquement.',
  },
  crm: {
    emoji: '🤝',
    title: 'CRM',
    subtitle: 'Gérez vos contacts',
    helpText: 'Pipeline de ventes visuel, fiches contacts détaillées, suivi des relances et historique des interactions.',
  },
  seo: {
    emoji: '🔍',
    title: 'SEO Tracker',
    subtitle: 'Optimisez votre visibilité',
    helpText: 'Analysez le SEO de vos pages, recherchez des mots-clés stratégiques, suivez vos positions.',
  },
  veille: {
    emoji: '📰',
    title: 'Veille',
    subtitle: 'Restez informé',
    helpText: 'Surveillez vos flux RSS, les tendances sectorielles et l\'actualité de vos concurrents.',
  },
  'landing-builder': {
    emoji: '🏗️',
    title: 'Landing Builder',
    subtitle: 'Créez des pages de vente',
    helpText: 'Choisissez un template, personnalisez le contenu et les couleurs, prévisualisez et copiez le HTML.',
  },
  kanban: {
    emoji: '📋',
    title: 'Kanban',
    subtitle: 'Gérez vos tâches visuellement',
    helpText: 'Tableaux Kanban style Trello : colonnes personnalisables, drag & drop, étiquettes et deadlines.',
  },
  traduction: {
    emoji: '🌐',
    title: 'Traduction',
    subtitle: 'Traduisez en 50+ langues',
    helpText: 'Traduction instantanée de textes avec nuances culturelles. Supportez français, anglais, espagnol, arabe, hébreu...',
  },
  qrcode: {
    emoji: '🔳',
    title: 'QR Codes',
    subtitle: 'Générez des QR codes',
    helpText: 'Créez des QR codes pour URLs, cartes de visite, WiFi, événements. Téléchargez en PNG ou SVG.',
  },
  photos: {
    emoji: '🖼️',
    title: 'Banque d\'images',
    subtitle: 'Trouvez l\'image parfaite',
    helpText: 'Recherchez parmi des millions d\'images gratuites (Unsplash). Prêt à connecter l\'API Unsplash.',
  },
  habitudes: {
    emoji: '✅',
    title: 'Habitudes',
    subtitle: 'Construisez des routines',
    helpText: 'Suivez vos habitudes quotidiennes, maintenez des streaks, visualisez votre progression.',
  },
  journal: {
    emoji: '📓',
    title: 'Journal Perso',
    subtitle: 'Écrivez pour vous comprendre',
    helpText: 'Journal intime avec prompts guidés, analyse des émotions par l\'IA et bilans périodiques.',
  },
};

// ─── Repondeur Mode Emojis ───────────────────────────────────────────────────

export const REPONDEUR_MODE_EMOJIS: Record<string, string> = {
  professional: '👔',
  family_humor: '😄',
  order_taking: '🛒',
  emergency: '🚨',
  concierge: '🎩',
  support_technique: '🔧',
  qualification: '🎓',
  humoristique_debride: '🤣',
  butler_british: '🎭',
  coach_sportif: '💪',
  ami_proche: '🤗',
};

export const REPONDEUR_SCENARIO_EMOJIS: Record<string, string> = {
  absent: '🏖️',
  vacances: '✈️',
  commande: '🛒',
  urgence: '🚨',
  rdv: '📅',
  support: '🛠️',
};

// ─── Action Type Emojis ──────────────────────────────────────────────────────

export const ACTION_TYPE_EMOJIS: Record<string, string> = {
  task: '📋',
  email: '✉️',
  call: '📞',
  meeting: '📅',
  document: '📄',
  social: '📱',
  reminder: '⏰',
  research: '🔍',
  proposal: '💡',
  review: '👀',
  approval: '✅',
  follow_up: '🔄',
};

// ─── Priority Emojis ─────────────────────────────────────────────────────────

export const PRIORITY_EMOJIS: Record<string, string> = {
  low: '🟢',
  medium: '🟡',
  high: '🟠',
  urgent: '🔴',
};

// ─── Reveil Mode Emojis ──────────────────────────────────────────────────────

export const REVEIL_MODE_EMOJIS: Record<string, string> = {
  doux: '🌸',
  dur: '🔥',
  sympa: '😊',
  drole: '😂',
  fou: '🤪',
  motivant: '💪',
  zen: '🧘',
  energique: '⚡',
};

// ─── Social Tab Emojis ───────────────────────────────────────────────────────

export const SOCIAL_TAB_EMOJIS: Record<string, string> = {
  generator: '✏️',
  posts: '📝',
  calendar: '📅',
  accounts: '🔗',
  analytics: '📊',
  competitors: '🎯',
};

// ─── Notification Type Emojis ────────────────────────────────────────────────

export const NOTIFICATION_TYPE_EMOJIS: Record<string, string> = {
  alert: '🚨',
  session: '🔑',
  update: '📢',
  info: '💡',
  success: '✅',
  warning: '⚠️',
  error: '❌',
};

// ─── Quick Actions (Dashboard) ───────────────────────────────────────────────

export interface QuickActionDef {
  emoji: string;
  label: string;
  href: string;
  desc: string;
}

export const QUICK_ACTIONS: QuickActionDef[] = [
  { emoji: '💬', label: 'Nouvelle conversation', href: '/client/chat', desc: 'Parlez à un assistant IA' },
  { emoji: '📄', label: 'Créer un document', href: '/client/documents', desc: 'Contrats, rapports, factures...' },
  { emoji: '🎬', label: 'Créer du contenu', href: '/client/studio', desc: 'Photos & vidéos IA' },
  { emoji: '📞', label: 'Répondeur', href: '/client/repondeur', desc: 'Voir les messages reçus' },
  { emoji: '🎯', label: 'Plan d\'attaque', href: '/client/strategy', desc: 'Objectifs & stratégie' },
  { emoji: '📱', label: 'Réseaux sociaux', href: '/client/social', desc: 'Générer du contenu social' },
];

// ─── Feature List (Dashboard Home) ───────────────────────────────────────────

export interface FeatureItem {
  id: string;
  emoji: string;
  label: string;
  desc: string;
  href: string;
}

export interface FeatureSection {
  id: string;
  emoji: string;
  title: string;
  subtitle: string;
  proOnly?: boolean;
  items: FeatureItem[];
}

export const FEATURE_SECTIONS: FeatureSection[] = [
  {
    id: 'workspace',
    emoji: '📋',
    title: 'Espace de travail',
    subtitle: 'Vos outils principaux pour travailler',
    items: [
      { id: 'reveil', emoji: '☕', label: 'Réveil', desc: 'Briefing matinal personnalisé', href: '/client/reveil' },
      { id: 'chat', emoji: '💬', label: 'Chat', desc: 'Parlez à vos assistants IA', href: '/client/chat' },
      { id: 'repondeur', emoji: '📞', label: 'Répondeur', desc: 'Secrétaire automatique 24/7', href: '/client/repondeur' },
      { id: 'social', emoji: '📱', label: 'Réseaux', desc: 'Générez du contenu social', href: '/client/social' },
      { id: 'studio', emoji: '🎬', label: 'Studio', desc: 'Photos & vidéos IA', href: '/client/studio' },
      { id: 'documents', emoji: '📄', label: 'Documents', desc: 'Contrats, factures, rapports', href: '/client/documents' },
      { id: 'strategy', emoji: '🎯', label: 'Stratégie', desc: 'Objectifs & plan d\'action', href: '/client/strategy' },
      { id: 'custom-creation', emoji: '🧩', label: 'Sur mesure', desc: 'Créez vos propres modules', href: '/client/custom-creation' },
      { id: 'video-pro', emoji: '📹', label: 'Vidéo Pro', desc: 'Production vidéo avancée', href: '/client/video-pro' },
      { id: 'formations', emoji: '🎓', label: 'Formations', desc: 'Tutoriels & guides', href: '/client/formations' },
      { id: 'personal', emoji: '👤', label: 'Mes Assistants', desc: 'Gérez votre équipe', href: '/client/personal' },
      { id: 'agents-customize', emoji: '🎨', label: 'Personnaliser', desc: 'Configurez vos assistants', href: '/client/agents/customize' },
      { id: 'agents', emoji: '🤖', label: 'Assistants IA', desc: 'Tous les assistants disponibles', href: '/client/agents' },
      { id: 'modules', emoji: '📦', label: 'Modules', desc: 'Étendez les capacités', href: '/client/modules' },
      { id: 'campaigns', emoji: '📢', label: 'Campagnes', desc: 'Marketing multi-plateformes', href: '/client/campaigns' },
      { id: 'telephony', emoji: '☎️', label: 'Téléphonie', desc: 'Appels & messages vocaux', href: '/client/telephony' },
      { id: 'projects', emoji: '📁', label: 'Projets', desc: 'Espaces de travail isolés', href: '/client/projects' },
      { id: 'actions', emoji: '⚡', label: 'Actions', desc: 'Propositions de vos assistants', href: '/client/actions' },
    ],
  },
  {
    id: 'moi',
    emoji: '👤',
    title: 'Moi',
    subtitle: 'Votre espace personnel',
    items: [
      { id: 'account', emoji: '⚙️', label: 'Mon Compte', desc: 'Profil & paramètres', href: '/client/account' },
      { id: 'analytics', emoji: '📊', label: 'Analytics', desc: 'Statistiques d\'utilisation', href: '/client/analytics' },
      { id: 'finances', emoji: '💳', label: 'Finances', desc: 'Coûts & facturation', href: '/client/finances' },
      { id: 'referrals', emoji: '🎁', label: 'Parrainer', desc: 'Gagnez 20€ par ami', href: '/client/referrals' },
      { id: 'rewards', emoji: '🏆', label: 'Récompenses', desc: 'Gagnez des crédits gratuits', href: '/client/rewards' },
      { id: 'activity', emoji: '🕐', label: 'Activité', desc: 'Historique complet', href: '/client/activity' },
      { id: 'timeline', emoji: '📈', label: 'Timeline', desc: 'Frise chronologique', href: '/client/timeline' },
      { id: 'notifications', emoji: '🔔', label: 'Notifications', desc: 'Alertes & messages', href: '/client/notifications' },
    ],
  },
  {
    id: 'agents-perso',
    emoji: '🧠',
    title: 'Assistants Personnels',
    subtitle: 'Vos assistants de vie quotidienne',
    proOnly: true,
    items: [
      { id: 'budget', emoji: '💰', label: 'Budget', desc: 'Suivi finances personnelles', href: '/client/personal/budget' },
      { id: 'comptable', emoji: '🧾', label: 'Comptabilité', desc: 'Factures, TVA, déclarations', href: '/client/personal/comptable' },
      { id: 'chasseur', emoji: '🏹', label: 'Chasseur', desc: 'Opportunités & missions', href: '/client/personal/chasseur' },
      { id: 'cv', emoji: '📝', label: 'CV 2026', desc: 'CV moderne & optimisé', href: '/client/personal/cv' },
      { id: 'ecrivain', emoji: '✍️', label: 'Écriture', desc: 'Articles, livres, scripts', href: '/client/personal/ecrivain' },
    ],
  },
  {
    id: 'discussions',
    emoji: '💭',
    title: 'Discussions',
    subtitle: 'Explorez des sujets en profondeur avec l\'IA',
    items: [
      { id: 'discussions', emoji: '🧠', label: 'Discussions', desc: '85+ thèmes, modèle Opus', href: '/client/discussions' },
    ],
  },
  {
    id: 'divertissement',
    emoji: '🎮',
    title: 'Divertissement',
    subtitle: 'Détendez-vous tout en gagnant des points',
    items: [
      { id: 'games', emoji: '🕹️', label: 'Arcade', desc: 'Mini-jeux & classements', href: '/client/games' },
      { id: 'games-create', emoji: '➕', label: 'Créer un jeu', desc: 'Concevez votre propre jeu', href: '/client/games/create' },
      { id: 'games-community', emoji: '🎪', label: 'Communauté', desc: 'Jeux partagés & scores', href: '/client/games/community' },
    ],
  },
  {
    id: 'entreprise',
    emoji: '🏢',
    title: 'Mon Entreprise',
    subtitle: 'Gérez votre organisation',
    proOnly: true,
    items: [
      { id: 'onboarding', emoji: '🏗️', label: 'Profil', desc: 'Configuration entreprise', href: '/client/onboarding' },
      { id: 'team', emoji: '👥', label: 'Mon équipe', desc: 'Collaborateurs & rôles', href: '/client/team' },
      { id: 'partners', emoji: '🤝', label: 'Partenaires', desc: 'Intégrations & connexions', href: '/client/partners' },
      { id: 'marketplace', emoji: '🛒', label: 'Marketplace', desc: 'Assistants spécialisés', href: '/client/marketplace' },
    ],
  },
  {
    id: 'developpeur',
    emoji: '🔧',
    title: 'Développeur',
    subtitle: 'Intégrez Freenzy à votre site',
    items: [
      { id: 'widget', emoji: '💻', label: 'Widget', desc: 'Code d\'intégration', href: '/client/widget' },
    ],
  },
];
