export interface QuizOption {
  id: string;
  icon: string;
  label: string;
  sublabel?: string;
}

export interface QuizQuestion {
  id: string;
  title: string;
  type: 'single' | 'multi' | 'text';
  options?: QuizOption[];
  condition?: (answers: Record<string, string | string[]>) => boolean;
  max_select?: number;
  placeholder?: string;
  skipLabel?: string;
}

// Q2 adaptive options per profession
const Q2_MAP: Record<string, { title: string; options: QuizOption[] }> = {
  sante: {
    title: 'Votre plus grande perte de temps ?',
    options: [
      { id: 'patients', icon: '🏥', label: 'Gestion des patients' },
      { id: 'ordonnances', icon: '📋', label: 'Ordonnances et documents' },
      { id: 'rdv', icon: '📅', label: 'Prise de rendez-vous' },
      { id: 'facturation', icon: '💰', label: 'Facturation et comptabilite' },
      { id: 'communication', icon: '📢', label: 'Communication patients' },
    ],
  },
  artisan: {
    title: 'Ce qui vous prend le plus de temps hors chantier ?',
    options: [
      { id: 'devis', icon: '📝', label: 'Redaction de devis' },
      { id: 'relances', icon: '📞', label: 'Relances clients' },
      { id: 'rdv', icon: '📅', label: 'Planification des rendez-vous' },
      { id: 'facturation', icon: '💰', label: 'Facturation' },
      { id: 'clients', icon: '👥', label: 'Trouver de nouveaux clients' },
    ],
  },
  pme: {
    title: 'Combien de personnes dans votre equipe ?',
    options: [
      { id: 'solo', icon: '👤', label: 'Solo / independant' },
      { id: '2-5', icon: '👥', label: '2 a 5 personnes' },
      { id: '6-20', icon: '🏢', label: '6 a 20 personnes' },
      { id: '20+', icon: '🏗️', label: 'Plus de 20 personnes' },
    ],
  },
  agence: {
    title: 'Combien de clients gerez-vous ?',
    options: [
      { id: '1-5', icon: '📁', label: '1 a 5 clients' },
      { id: '6-15', icon: '📂', label: '6 a 15 clients' },
      { id: '16-50', icon: '🗄️', label: '16 a 50 clients' },
      { id: '50+', icon: '🏢', label: 'Plus de 50 clients' },
    ],
  },
  ecommerce: {
    title: 'Votre volume mensuel ?',
    options: [
      { id: 'debut', icon: '🌱', label: 'Lancement (< 50 commandes)' },
      { id: 'croissance', icon: '📈', label: 'Croissance (50–200)' },
      { id: 'etabli', icon: '🏪', label: 'Etabli (200–1000)' },
      { id: 'scale', icon: '🚀', label: 'Scale (1000+)' },
    ],
  },
  coach: {
    title: 'Votre format principal ?',
    options: [
      { id: 'individuel', icon: '👤', label: 'Coaching individuel' },
      { id: 'groupe', icon: '👥', label: 'Sessions de groupe' },
      { id: 'formation', icon: '🎓', label: 'Formations en ligne' },
      { id: 'hybride', icon: '🔄', label: 'Hybride (tout)' },
    ],
  },
  restaurant: {
    title: 'Votre principal defi ?',
    options: [
      { id: 'reservations', icon: '📅', label: 'Gestion des reservations' },
      { id: 'avis', icon: '⭐', label: 'Avis en ligne' },
      { id: 'livraison', icon: '🛵', label: 'Commandes et livraison' },
      { id: 'visibilite', icon: '📢', label: 'Visibilite locale' },
    ],
  },
  liberal: {
    title: 'Votre specialite ?',
    options: [
      { id: 'avocat', icon: '⚖️', label: 'Avocat' },
      { id: 'comptable', icon: '🧮', label: 'Expert-comptable' },
      { id: 'consultant', icon: '💼', label: 'Consultant' },
      { id: 'architecte', icon: '📐', label: 'Architecte' },
      { id: 'autre', icon: '📄', label: 'Autre profession liberale' },
    ],
  },
  immo: {
    title: 'Votre activite ?',
    options: [
      { id: 'transaction', icon: '🏠', label: 'Transaction (vente/achat)' },
      { id: 'location', icon: '🔑', label: 'Gestion locative' },
      { id: 'promotion', icon: '🏗️', label: 'Promotion immobiliere' },
      { id: 'mixte', icon: '🔄', label: 'Activite mixte' },
    ],
  },
  particulier: {
    title: "Qu'est-ce qui vous attire ?",
    options: [
      { id: 'productivite', icon: '⚡', label: 'Etre plus productif' },
      { id: 'creation', icon: '🎨', label: 'Creer du contenu' },
      { id: 'apprentissage', icon: '📚', label: 'Apprendre avec l\'IA' },
      { id: 'organisation', icon: '📋', label: 'Mieux m\'organiser' },
      { id: 'curiosite', icon: '🔍', label: 'Simple curiosite' },
    ],
  },
  autre: {
    title: 'Votre plus grand besoin ?',
    options: [
      { id: 'temps', icon: '⏰', label: 'Gagner du temps' },
      { id: 'clients', icon: '👥', label: 'Trouver des clients' },
      { id: 'organisation', icon: '📋', label: 'Mieux m\'organiser' },
      { id: 'communication', icon: '📢', label: 'Communiquer mieux' },
    ],
  },
};

// Q3 objectives per profession
const Q3_MAP: Record<string, QuizOption[]> = {
  sante: [
    { id: 'admin', icon: '📋', label: 'Reduire l\'administratif' },
    { id: 'patients', icon: '🤝', label: 'Mieux communiquer avec les patients' },
    { id: 'rdv', icon: '📅', label: 'Automatiser les rendez-vous' },
    { id: 'visibilite', icon: '📢', label: 'Ameliorer ma visibilite' },
    { id: 'facturation', icon: '💰', label: 'Simplifier la facturation' },
  ],
  artisan: [
    { id: 'devis', icon: '📝', label: 'Generer des devis rapidement' },
    { id: 'clients', icon: '👥', label: 'Trouver plus de clients' },
    { id: 'suivi', icon: '📊', label: 'Suivre mes chantiers' },
    { id: 'facturation', icon: '💰', label: 'Facturer sans erreur' },
    { id: 'avis', icon: '⭐', label: 'Collecter des avis' },
  ],
  pme: [
    { id: 'automatisation', icon: '🤖', label: 'Automatiser les taches repetitives' },
    { id: 'commercial', icon: '📈', label: 'Booster le commercial' },
    { id: 'equipe', icon: '👥', label: 'Coordonner mon equipe' },
    { id: 'clients', icon: '🤝', label: 'Mieux gerer les clients' },
    { id: 'reporting', icon: '📊', label: 'Rapports et analytics' },
  ],
  agence: [
    { id: 'clients', icon: '📂', label: 'Gerer plus de clients' },
    { id: 'contenu', icon: '✍️', label: 'Produire du contenu plus vite' },
    { id: 'reporting', icon: '📊', label: 'Reporting automatise' },
    { id: 'prospection', icon: '🎯', label: 'Prospection automatisee' },
    { id: 'workflow', icon: '⚙️', label: 'Optimiser les workflows' },
  ],
  ecommerce: [
    { id: 'fiches', icon: '📝', label: 'Rediger les fiches produits' },
    { id: 'sav', icon: '💬', label: 'Automatiser le SAV' },
    { id: 'marketing', icon: '📢', label: 'Campagnes marketing' },
    { id: 'analytics', icon: '📊', label: 'Analyser les ventes' },
    { id: 'social', icon: '📱', label: 'Social media' },
  ],
  coach: [
    { id: 'contenu', icon: '✍️', label: 'Creer du contenu' },
    { id: 'clients', icon: '👥', label: 'Trouver des clients' },
    { id: 'admin', icon: '📋', label: 'Reduire l\'admin' },
    { id: 'formation', icon: '🎓', label: 'Structurer mes formations' },
    { id: 'visibilite', icon: '📢', label: 'Developper ma visibilite' },
  ],
  restaurant: [
    { id: 'reservations', icon: '📅', label: 'Gerer les reservations' },
    { id: 'avis', icon: '⭐', label: 'Repondre aux avis' },
    { id: 'social', icon: '📱', label: 'Presence sur les reseaux' },
    { id: 'menu', icon: '📋', label: 'Mettre a jour le menu' },
    { id: 'livraison', icon: '🛵', label: 'Optimiser les livraisons' },
  ],
  liberal: [
    { id: 'admin', icon: '📋', label: 'Reduire l\'administratif' },
    { id: 'clients', icon: '👥', label: 'Gerer mes clients' },
    { id: 'facturation', icon: '💰', label: 'Facturation automatique' },
    { id: 'veille', icon: '🔍', label: 'Veille sectorielle' },
    { id: 'contenu', icon: '✍️', label: 'Produire du contenu expert' },
  ],
  immo: [
    { id: 'annonces', icon: '📝', label: 'Rediger les annonces' },
    { id: 'prospects', icon: '🎯', label: 'Qualifier les prospects' },
    { id: 'visites', icon: '📅', label: 'Planifier les visites' },
    { id: 'documents', icon: '📄', label: 'Gerer les documents' },
    { id: 'suivi', icon: '📊', label: 'Suivi des mandats' },
  ],
  particulier: [
    { id: 'productivite', icon: '⚡', label: 'Etre plus efficace au quotidien' },
    { id: 'creation', icon: '🎨', label: 'Creer (images, textes, videos)' },
    { id: 'apprentissage', icon: '📚', label: 'Apprendre de nouvelles choses' },
    { id: 'organisation', icon: '📋', label: 'Organiser ma vie' },
    { id: 'fun', icon: '🎮', label: 'Explorer et m\'amuser' },
  ],
  autre: [
    { id: 'temps', icon: '⏰', label: 'Gagner du temps' },
    { id: 'automatisation', icon: '🤖', label: 'Automatiser des taches' },
    { id: 'contenu', icon: '✍️', label: 'Creer du contenu' },
    { id: 'organisation', icon: '📋', label: 'Mieux m\'organiser' },
    { id: 'visibilite', icon: '📢', label: 'Ameliorer ma visibilite' },
  ],
};

export function getAdaptiveQ2(profession: string): QuizQuestion | null {
  const q2 = Q2_MAP[profession];
  if (!q2) return null;
  return {
    id: 'q2_adaptive',
    title: q2.title,
    type: 'single',
    options: q2.options,
    condition: (answers) => !!answers['q1_profession'],
  };
}

export function getAdaptiveQ3(profession: string): QuizQuestion {
  const options = Q3_MAP[profession] || Q3_MAP['autre'];
  return {
    id: 'q3_objectives',
    title: "Qu'esperez-vous de Freenzy ?",
    type: 'multi',
    max_select: 3,
    options,
  };
}

export const QUIZ_CONFIG: QuizQuestion[] = [
  // Q1 — Profession
  {
    id: 'q1_profession',
    title: 'Quelle est votre activite principale ?',
    type: 'single',
    options: [
      { id: 'sante', icon: '🏥', label: 'Sante', sublabel: 'Medecin, dentiste, kine...' },
      { id: 'artisan', icon: '🔧', label: 'Artisan', sublabel: 'Plombier, electricien, menuisier...' },
      { id: 'pme', icon: '🏢', label: 'PME / TPE', sublabel: 'Entreprise de 1 a 250 salaries' },
      { id: 'agence', icon: '🎯', label: 'Agence', sublabel: 'Marketing, com, dev, design...' },
      { id: 'ecommerce', icon: '🛒', label: 'E-commerce', sublabel: 'Boutique en ligne' },
      { id: 'liberal', icon: '⚖️', label: 'Profession liberale', sublabel: 'Avocat, comptable, consultant...' },
      { id: 'coach', icon: '🎓', label: 'Coach / Formateur', sublabel: 'Coaching, formation, conseil' },
      { id: 'restaurant', icon: '🍽️', label: 'Restaurant / Hotel', sublabel: 'Restauration, hotellerie' },
      { id: 'immo', icon: '🏠', label: 'Immobilier', sublabel: 'Agent, promoteur, gestionnaire' },
      { id: 'particulier', icon: '👤', label: 'Particulier', sublabel: 'Usage personnel' },
      { id: 'autre', icon: '📦', label: 'Autre', sublabel: 'Autre activite' },
    ],
  },

  // Q2 — Adaptive (injected dynamically based on Q1)
  // Handled via getAdaptiveQ2()

  // Q3 — Objectives (injected dynamically based on Q1)
  // Handled via getAdaptiveQ3()

  // Q4 — AI Level
  {
    id: 'q4_ai_level',
    title: 'Quel est votre niveau avec l\'IA ?',
    type: 'single',
    options: [
      { id: 'debutant', icon: '🌱', label: 'Debutant', sublabel: 'Je n\'ai jamais utilise d\'IA' },
      { id: 'curieux', icon: '🔍', label: 'Curieux', sublabel: 'J\'ai essaye ChatGPT ou autre' },
      { id: 'intermediaire', icon: '💡', label: 'Intermediaire', sublabel: 'J\'utilise l\'IA regulierement' },
      { id: 'expert', icon: '🚀', label: 'Expert', sublabel: 'L\'IA fait partie de mon quotidien' },
    ],
  },

  // Q5 — Tools
  {
    id: 'q5_tools',
    title: 'Quels outils utilisez-vous deja ?',
    type: 'multi',
    max_select: 7,
    skipLabel: 'Passer cette etape',
    options: [
      { id: 'crm', icon: '📇', label: 'CRM', sublabel: 'Hubspot, Salesforce, Pipedrive...' },
      { id: 'compta', icon: '🧮', label: 'Comptabilite', sublabel: 'Pennylane, QuickBooks...' },
      { id: 'communication', icon: '💬', label: 'Communication', sublabel: 'Slack, Teams, Discord...' },
      { id: 'ecommerce', icon: '🛒', label: 'E-commerce', sublabel: 'Shopify, WooCommerce...' },
      { id: 'social', icon: '📱', label: 'Reseaux sociaux', sublabel: 'Buffer, Hootsuite...' },
      { id: 'emailing', icon: '📧', label: 'Emailing', sublabel: 'Mailchimp, Sendinblue...' },
      { id: 'aucun', icon: '🚫', label: 'Aucun outil specifique' },
    ],
    condition: (answers) => {
      const prof = answers['q1_profession'];
      return ['pme', 'agence', 'liberal', 'ecommerce'].includes(String(prof));
    },
  },

  // Q6 — Notifications
  {
    id: 'q6_notifications',
    title: 'Comment preferez-vous etre notifie ?',
    type: 'single',
    options: [
      { id: 'email', icon: '📧', label: 'Email' },
      { id: 'whatsapp', icon: '💬', label: 'WhatsApp' },
      { id: 'telegram', icon: '✈️', label: 'Telegram' },
      { id: 'inapp', icon: '🔔', label: 'Notifications in-app' },
      { id: 'email_whatsapp', icon: '📧💬', label: 'Email + WhatsApp' },
      { id: 'email_telegram', icon: '📧✈️', label: 'Email + Telegram' },
    ],
  },

  // Q7 — Custom request
  {
    id: 'q7_custom',
    title: 'Avez-vous une demande specifique pour votre assistant ?',
    type: 'text',
    placeholder: 'Ex: Je veux qu\'un agent reponde a mes emails clients automatiquement...',
    skipLabel: 'Passer cette etape',
    condition: (answers) => {
      const level = answers['q4_ai_level'];
      return level === 'intermediaire' || level === 'expert';
    },
  },
];
