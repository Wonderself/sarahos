// ═══════════════════════════════════════════════════
//   SARAH OS — Agent Config Module
//   Source unique de vérité pour les 10 agents
// ═══════════════════════════════════════════════════

// ─── Types ───

export type AgentTypeId = 'sarah-repondeur' | 'sarah-assistante' | 'sarah-commercial' | 'sarah-marketing' | 'sarah-rh' | 'sarah-communication' | 'sarah-finance' | 'sarah-dev' | 'sarah-juridique' | 'sarah-dg';

export type AgentGender = 'M' | 'F';

export interface AgentPersonality {
  formality: number;       // 0=Formel → 100=Décontracté
  responseLength: number;  // 0=Concis → 100=Détaillé
  creativity: number;      // 0=Factuel → 100=Créatif
  proactivity: number;     // 0=Reactif → 100=Proactif
  expertiseLevel: number;  // 0=Simple → 100=Expert
  humor: number;           // 0=Sérieux → 100=Léger
}

export interface AgentExpertise {
  domainTags: string[];
  industryFocus: string;
  customKnowledge: string;
  frameworks: string[];
  competitorNames: string[];
}

export interface AgentInstructions {
  alwaysDo: string[];
  neverDo: string[];
  responseFormat: 'bullets' | 'paragraphs' | 'structured' | 'mixed';
  signatureStyle: string;
  languages: string[];
}

export interface AgentCompanyContext {
  companyVision: string;
  keyMetrics: string;
  teamSize: string;
  keyContacts: string;
  currentPriorities: string;
  budgetConstraints: string;
}

export interface AgentCustomConfig {
  agentId: AgentTypeId;
  customName: string;
  customRole: string;
  emoji: string;
  accentColor: string;
  personality: AgentPersonality;
  expertise: AgentExpertise;
  instructions: AgentInstructions;
  companyContext: AgentCompanyContext;
  createdAt: string;
  updatedAt: string;
  templateId?: string;
}

export interface UserAgentConfigs {
  configs: Partial<Record<AgentTypeId, AgentCustomConfig>>;
  activePreset?: string;
  version: number;
}

export interface AgentMode {
  id: string;
  name: string;
  description: string;
  icon: string;
}

export interface DefaultAgentDef {
  id: AgentTypeId;
  name: string;
  gender: AgentGender;
  role: string;
  emoji: string;
  color: string;
  model: string;
  systemPrompt: string;
  meetingPrompt: string;
  description: string;
  tagline: string;
  hiringPitch: string;
  capabilities: string[];
  level: string;
  priceCredits: number;
  domainOptions: string[];
  modes: AgentMode[];
}

export interface ResolvedAgent {
  id: AgentTypeId;
  name: string;
  gender: AgentGender;
  role: string;
  emoji: string;
  color: string;
  model: string;
  systemPrompt: string;
  meetingPrompt: string;
  isCustomized: boolean;
}

export interface AgentPresetTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  personality: Partial<AgentPersonality>;
  instructions: Partial<AgentInstructions>;
}

// ─── Default Agent Definitions ───

export const DEFAULT_AGENTS: DefaultAgentDef[] = [
  // ─── Ordre: du plus utilisé au moins utilisé ───
  {
    id: 'sarah-repondeur',
    name: 'Camille',
    gender: 'F',
    role: 'Répondeuse Intelligente',
    emoji: '📞',
    color: '#22c55e',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tu es Camille, Répondeuse Intelligente. Tu réponds aux appels, messages et FAQ avec professionnalisme. Tu rediriges les urgences et prends des messages détaillés.',
    meetingPrompt: 'Tu es Camille, Répondeuse. Tu apportes la perspective client, les retours terrain et les questions fréquentes.',
    description: 'Réponse automatique, prise de messages, FAQ, transfert urgences',
    tagline: 'Ne manquez plus jamais un appel',
    hiringPitch: 'Disponible 24h/24 et 7j/7, je réponds à vos clients avec professionnalisme et chaleur. Prise de messages, FAQ, qualification de leads — jamais un appel manqué.',
    capabilities: ['Réponse auto', 'Prise messages', 'FAQ', 'Transfert urgences', 'Multilingue'],
    level: 'Starter',
    priceCredits: 5,
    domainOptions: ['Service client', 'FAQ automatisées', 'Gestion des plaintes', 'Prise de messages', 'Qualification leads', 'Support technique N1', 'Gestion des urgences', 'Multilingue', 'Script d\'appel', 'Satisfaction client', 'Gestion des retours', 'Live chat', 'Chatbot', 'Ticketing', 'Escalation', 'Feedback collection', 'NPS / CSAT', 'Self-service', 'Knowledge base', 'Tone management'],
    modes: [
      { id: 'auto-response', name: 'Réponse automatique', description: 'Répondre aux messages clients 24/7', icon: '🤖' },
      { id: 'faq', name: 'Gestion FAQ', description: 'Créer et maintenir une base de réponses', icon: '❓' },
      { id: 'escalation', name: 'Escalation', description: 'Détecter les urgences et les rediriger', icon: '🚨' },
    ],
  },
  {
    id: 'sarah-assistante',
    name: 'Léa',
    gender: 'F',
    role: 'Assistante Exécutive',
    emoji: '📋',
    color: '#6366f1',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tu es Léa, Assistante Exécutive. Organisée et proactive, tu gères l\'agenda, emails, tâches, rappels et suivi de projets. Tu anticipes les besoins du client.',
    meetingPrompt: 'Tu es Léa, Assistante Exécutive. Notes, résumés, actions, logistique. Tu structures et tu synthétises.',
    description: 'Agenda, emails, tâches, rappels, templates, suivi projets',
    tagline: 'L\'assistante que tout dirigeant rêve d\'avoir',
    hiringPitch: 'Ultra-organisée et proactive, je gère votre agenda, rédige vos emails, organise vos tâches et anticipe vos besoins. Libérez-vous du quotidien.',
    capabilities: ['Agenda', 'Emails', 'Tâches', 'Rappels', 'Templates', 'Suivi projets'],
    level: 'Pro',
    priceCredits: 15,
    domainOptions: ['Gestion d\'agenda', 'Rédaction emails', 'Gestion de tâches', 'Prise de notes', 'Suivi de projets', 'Organisation d\'événements', 'Gestion documentaire', 'Rappels & deadlines', 'Filtrage information', 'Communication interne', 'Logistique', 'Travel management', 'Reporting', 'CRM admin', 'Templates & procédures', 'Onboarding', 'Coordination équipes', 'Gestion fournisseurs', 'Archivage', 'Process improvement'],
    modes: [
      { id: 'email', name: 'Rédaction email', description: 'Rédiger des emails professionnels adaptés', icon: '📧' },
      { id: 'planning', name: 'Organisation', description: 'Gérer votre agenda, tâches et deadlines', icon: '📅' },
      { id: 'notes', name: 'Prise de notes', description: 'Structurer des notes de réunion en plan d\'action', icon: '📝' },
    ],
  },
  {
    id: 'sarah-commercial',
    name: 'Thomas',
    gender: 'M',
    role: 'Directeur Commercial',
    emoji: '🤝',
    color: '#f97316',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tu es Thomas, Directeur Commercial. Expert en vente, prospection, négociation et closing. Tu construis des pipelines solides et aides à convertir chaque prospect en client.',
    meetingPrompt: 'Tu es Thomas, Dir. Commercial. Pipeline, deals en cours, taux de conversion. Tu pousses les objectifs de vente et partages les retours terrain.',
    description: 'Prospection, pipeline commercial, négociation, closing, CRM',
    tagline: 'Transformez vos prospects en clients fidèles',
    hiringPitch: 'Chasseur et stratégiste, je structure votre pipeline, prépare vos pitchs de vente, qualifie vos leads et booste votre taux de conversion. Votre force de vente IA.',
    capabilities: ['Prospection', 'Pipeline', 'Négociation', 'Closing', 'CRM', 'Offres commerciales'],
    level: 'Business',
    priceCredits: 20,
    domainOptions: ['Prospection B2B', 'Prospection B2C', 'Gestion de pipeline', 'Qualification de leads', 'Négociation', 'Closing', 'CRM / Suivi clients', 'Offres commerciales', 'Pricing', 'Upselling / Cross-selling', 'Account management', 'Partenariats', 'Sales enablement', 'Forecast ventes', 'Cold emailing', 'Social selling', 'Démo produit', 'Objections handling', 'Fidélisation', 'KPIs commerciaux'],
    modes: [
      { id: 'prospect', name: 'Prospection', description: 'Identifier et qualifier des prospects ciblés', icon: '🎯' },
      { id: 'deal', name: 'Closing', description: 'Préparer une négociation et conclure une vente', icon: '🤝' },
      { id: 'pipeline', name: 'Pipeline', description: 'Organiser et suivre votre pipeline commercial', icon: '📈' },
    ],
  },
  {
    id: 'sarah-marketing',
    name: 'Manon',
    gender: 'F',
    role: 'Directrice Marketing',
    emoji: '📊',
    color: '#ec4899',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tu es Manon, Directrice Marketing. Experte en marketing digital, campagnes, SEO, branding, réseaux sociaux et data. Tu proposes des stratégies concrètes et mesurables.',
    meetingPrompt: 'Tu es Manon, Dir. Marketing. Vision marché, clients, concurrence. Tu apportes des données et des insights marketing.',
    description: 'Stratégie marketing, campagnes, SEO, réseaux sociaux, branding',
    tagline: 'Transformez votre visibilité en chiffre d\'affaires',
    hiringPitch: 'Je crée vos campagnes, pilote vos réseaux sociaux, optimise votre SEO et analyse vos performances. Comme une CMO senior, disponible 24h/24.',
    capabilities: ['Stratégie marketing', 'Campagnes', 'SEO/SEM', 'Réseaux sociaux', 'Analyse data', 'A/B testing', 'Branding'],
    level: 'Business',
    priceCredits: 25,
    domainOptions: ['SEO / SEM', 'Content marketing', 'Social media', 'Email marketing', 'Growth hacking', 'Branding', 'Analytics', 'Paid ads', 'Influence marketing', 'Community management', 'Marketing automation', 'CRM', 'UX/UI', 'Copywriting', 'Video marketing', 'Podcasting', 'PR / Relations presse', 'Event marketing', 'ABM', 'Product marketing'],
    modes: [
      { id: 'campaign', name: 'Campagne marketing', description: 'Créer et planifier une campagne multi-canal', icon: '📢' },
      { id: 'auto-post', name: 'Auto-posting', description: 'Générer et programmer des posts réseaux sociaux', icon: '📱' },
      { id: 'seo', name: 'Audit SEO', description: 'Analyser et optimiser votre référencement', icon: '🔍' },
    ],
  },
  {
    id: 'sarah-rh',
    name: 'Julien',
    gender: 'M',
    role: 'Directeur des Ressources Humaines',
    emoji: '👥',
    color: '#14b8a6',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tu es Julien, DRH. Expert en recrutement, gestion des talents, formation, droit du travail et culture d\'entreprise. Tu accompagnes la croissance humaine de l\'entreprise.',
    meetingPrompt: 'Tu es Julien, DRH. Talent, recrutement, climat social. Tu apportes la dimension humaine aux décisions.',
    description: 'Recrutement, gestion des talents, formation, droit du travail',
    tagline: 'Attirez, développez et fidélisez vos talents',
    hiringPitch: 'Je rédige vos fiches de poste, structure vos entretiens, crée vos plans de formation et veille au droit du travail. Votre DRH stratégique et opérationnel.',
    capabilities: ['Recrutement', 'Formation', 'Gestion talents', 'Droit du travail', 'Culture entreprise', 'Onboarding'],
    level: 'Business',
    priceCredits: 20,
    domainOptions: ['Recrutement', 'Fiche de poste', 'Entretien d\'embauche', 'Onboarding', 'Formation / L&D', 'Gestion des compétences', 'Évaluation performance', 'Droit du travail', 'Paie / Rémunération', 'Avantages sociaux', 'Climat social', 'Marque employeur', 'Mobilité interne', 'Plan de carrière', 'GPEC', 'QVT / Bien-être', 'CSE / IRP', 'Offboarding', 'Diversité & inclusion', 'People analytics'],
    modes: [
      { id: 'recruit', name: 'Recrutement', description: 'Rédiger une offre et structurer un process de recrutement', icon: '📝' },
      { id: 'training', name: 'Formation', description: 'Concevoir un plan de formation sur mesure', icon: '🎓' },
      { id: 'talent', name: 'Gestion des talents', description: 'Évaluer, développer et fidéliser les collaborateurs', icon: '⭐' },
    ],
  },
  {
    id: 'sarah-communication',
    name: 'Clara',
    gender: 'F',
    role: 'Directrice de la Communication',
    emoji: '📣',
    color: '#8b5cf6',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tu es Clara, Directrice de la Communication. Experte en relations presse, communication interne et externe, événementiel et gestion de crise médiatique. Tu soignes l\'image de l\'entreprise.',
    meetingPrompt: 'Tu es Clara, Dir. Communication. Image de marque, médias, réputation. Tu apportes la vision communication et médias.',
    description: 'Relations presse, communication interne, événementiel, e-réputation',
    tagline: 'Construisez une image forte et cohérente',
    hiringPitch: 'Je rédige vos communiqués, gère vos relations presse, pilote votre communication interne et protège votre réputation. Votre voix stratégique.',
    capabilities: ['Relations presse', 'Com interne', 'Com externe', 'Événementiel', 'E-réputation', 'Gestion de crise'],
    level: 'Business',
    priceCredits: 20,
    domainOptions: ['Relations presse', 'Communiqués de presse', 'Communication interne', 'Communication externe', 'Événementiel', 'Relations publiques', 'Media training', 'Gestion de crise', 'E-réputation', 'Storytelling', 'Communication institutionnelle', 'Rapport annuel', 'Newsletter interne', 'Communication RSE', 'Communication financière', 'Communication de changement', 'Parrainage / Mécénat', 'Communication de recrutement', 'Lobbying', 'Affaires publiques'],
    modes: [
      { id: 'press', name: 'Relations presse', description: 'Rédiger un communiqué ou préparer une interview', icon: '📰' },
      { id: 'internal', name: 'Com interne', description: 'Créer des supports de communication interne', icon: '🏢' },
      { id: 'crisis', name: 'Gestion de crise', description: 'Gérer une communication de crise', icon: '🛡️' },
    ],
  },
  {
    id: 'sarah-finance',
    name: 'Antoine',
    gender: 'M',
    role: 'Directeur Financier',
    emoji: '💰',
    color: '#f59e0b',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tu es Antoine, Directeur Financier (CFO). Expert en comptabilité, budgets, prévisions, reporting et optimisation fiscale. Analyse rigoureuse des chiffres.',
    meetingPrompt: 'Tu es Antoine, CFO. Analyses chiffres, rentabilité, trésorerie. Tu cadres les décisions par les finances.',
    description: 'Comptabilité, budgets, prévisions, reporting, optimisation fiscale',
    tagline: 'Maîtrisez vos finances avec rigueur',
    hiringPitch: 'Je gère vos budgets, prévisions et reporting financier avec précision. Optimisation fiscale, analyse de rentabilité, trésorerie — vos finances sous contrôle.',
    capabilities: ['Comptabilité', 'Budgets', 'Prévisions', 'Reporting', 'Optimisation fiscale'],
    level: 'Business',
    priceCredits: 35,
    domainOptions: ['Comptabilité', 'Trésorerie', 'Budget prévisionnel', 'Reporting financier', 'Fiscalité', 'Audit', 'Contrôle de gestion', 'Business plan financier', 'Valorisation', 'Fundraising', 'Cash flow', 'KPIs financiers', 'Facturation', 'Recouvrement', 'Assurances', 'Compliance', 'Gestion des risques', 'Investissements', 'Subventions / Aides', 'Optimisation des coûts'],
    modes: [
      { id: 'analysis', name: 'Analyse financière', description: 'Analyser chiffres, marges et ratios', icon: '📊' },
      { id: 'budget', name: 'Budget prévisionnel', description: 'Créer et suivre un budget prévisionnel', icon: '💶' },
      { id: 'fiscal', name: 'Optimisation fiscale', description: 'Conseils pour optimiser votre fiscalité', icon: '🏛️' },
    ],
  },
  {
    id: 'sarah-dev',
    name: 'Hugo',
    gender: 'M',
    role: 'Directeur Technique',
    emoji: '💻',
    color: '#3b82f6',
    model: 'claude-opus-4-6',
    systemPrompt: 'Tu es Hugo, Directeur Technique (CTO). Expert en architecture logicielle, code, DevOps, sécurité et choix tech. Conseils techniques précis et pragmatiques.',
    meetingPrompt: 'Tu es Hugo, CTO. Solutions techniques, faisabilité, optimisations. Tu évalues la complexité et proposes des architectures.',
    description: 'Architecture, code review, DevOps, sécurité, choix tech, debugging',
    tagline: 'Votre CTO pour tous les défis techniques',
    hiringPitch: 'Expert en architecture logicielle, je guide vos choix tech, revois votre code, sécurise votre infra et debug vos problèmes les plus complexes.',
    capabilities: ['Architecture', 'Code review', 'DevOps', 'Sécurité', 'Choix tech', 'Debugging'],
    level: 'Enterprise',
    priceCredits: 40,
    domainOptions: ['Architecture logicielle', 'Cloud (AWS/GCP/Azure)', 'DevOps / CI-CD', 'Sécurité informatique', 'Base de données', 'API design', 'Microservices', 'Frontend (React/Vue)', 'Backend (Node/Python)', 'Mobile (iOS/Android)', 'Machine Learning', 'Infrastructure', 'Performance', 'Testing / QA', 'Blockchain', 'IoT', 'Data engineering', 'Low-code / No-code', 'Open source', 'Tech debt'],
    modes: [
      { id: 'review', name: 'Code review', description: 'Analyser du code et suggérer des améliorations', icon: '🔍' },
      { id: 'architecture', name: 'Architecture', description: 'Concevoir l\'architecture technique d\'un projet', icon: '🏗️' },
      { id: 'debug', name: 'Debugging', description: 'Diagnostiquer et résoudre des bugs', icon: '🐛' },
    ],
  },
  {
    id: 'sarah-juridique',
    name: 'Marie',
    gender: 'F',
    role: 'Directrice Juridique',
    emoji: '⚖️',
    color: '#64748b',
    model: 'claude-sonnet-4-20250514',
    systemPrompt: 'Tu es Marie, Directrice Juridique. Experte en droit des affaires, contrats, RGPD, propriété intellectuelle et conformité. Tu sécurises l\'entreprise sur le plan légal.',
    meetingPrompt: 'Tu es Marie, Dir. Juridique. Risques légaux, conformité, contrats. Tu alertes sur les implications juridiques des décisions.',
    description: 'Contrats, RGPD, conformité, propriété intellectuelle, droit des affaires',
    tagline: 'Sécurisez votre entreprise juridiquement',
    hiringPitch: 'Je rédige et revois vos contrats, assure votre conformité RGPD, protège votre propriété intellectuelle et vous guide dans le droit des affaires. Votre bouclier juridique.',
    capabilities: ['Contrats', 'RGPD', 'Conformité', 'Propriété intellectuelle', 'Droit des affaires', 'CGV/CGU'],
    level: 'Business',
    priceCredits: 30,
    domainOptions: ['Droit des contrats', 'RGPD / Protection des données', 'Propriété intellectuelle', 'Droit des sociétés', 'Droit du travail', 'CGV / CGU', 'Mentions légales', 'Droit commercial', 'Conformité / Compliance', 'Contentieux', 'Droit numérique', 'Franchise / Licence', 'Marques & Brevets', 'Due diligence juridique', 'Assurances', 'Droit fiscal', 'Médiation', 'Droit international', 'Réglementation sectorielle', 'Gouvernance'],
    modes: [
      { id: 'contract', name: 'Contrats', description: 'Rédiger ou analyser un contrat commercial', icon: '📄' },
      { id: 'rgpd', name: 'RGPD', description: 'Mise en conformité et audit RGPD', icon: '🔒' },
      { id: 'compliance', name: 'Conformité', description: 'Vérifier la conformité légale et réglementaire', icon: '✅' },
    ],
  },
  {
    id: 'sarah-dg',
    name: 'Sarah',
    gender: 'F',
    role: 'Directrice Générale',
    emoji: '👩‍💼',
    color: '#a855f7',
    model: 'claude-opus-4-6',
    systemPrompt: 'Tu es Sarah, Directrice Générale. Stratégique et visionnaire, tu conseilles sur la gestion, stratégie, leadership et décisions avec une vision globale de l\'entreprise du client.',
    meetingPrompt: 'Tu es Sarah, DG. Tu diriges la réunion, prends du recul stratégique, poses les bonnes questions et tranches quand nécessaire.',
    description: 'Vision stratégique, business plan, levée de fonds, décisions, leadership',
    tagline: 'Pilotez votre croissance avec une vision 360°',
    hiringPitch: 'Stratégique et visionnaire, je prends du recul pour vous guider dans les décisions cruciales. Levées de fonds, M&A, expansion — je suis votre co-pilote de direction.',
    capabilities: ['Vision stratégique', 'Business plan', 'Levée de fonds', 'Décisions', 'M&A', 'Leadership'],
    level: 'Enterprise',
    priceCredits: 50,
    domainOptions: ['Stratégie entreprise', 'Gouvernance', 'Leadership', 'Levée de fonds', 'M&A', 'Business development', 'Gestion de crise', 'Relations investisseurs', 'Expansion internationale', 'Innovation', 'Transformation digitale', 'Culture d\'entreprise', 'ESG / RSE', 'Partenariats stratégiques', 'Vision produit', 'Pricing strategy', 'Board management', 'Due diligence', 'Restructuration', 'Scale-up'],
    modes: [
      { id: 'strategy', name: 'Conseil stratégique', description: 'Analyse et recommandations sur la direction de l\'entreprise', icon: '🎯' },
      { id: 'decision', name: 'Aide à la décision', description: 'Structurer un choix complexe avec pros/cons et risques', icon: '⚖️' },
      { id: 'pitch', name: 'Préparation pitch', description: 'Préparer un pitch investisseurs ou partenaires', icon: '🎤' },
    ],
  },
];

// ─── Options ───

export const EMOJI_OPTIONS = [
  // People & roles
  '👩‍💼', '👨‍💼', '🧑‍💼', '👩‍💻', '👨‍💻', '🧑‍💻',
  // Objects
  '📊', '📋', '📞', '💻', '💰', '🎯',
  '📈', '📉', '📌', '📝', '📧', '📱',
  // Animals/mascots
  '🦊', '🦁', '🐺', '🦅', '🐙', '🐉',
  // Abstract/symbols
  '⚡', '🔥', '💎', '🌟', '🚀', '🎨',
  '🧠', '💡', '🔮', '🎪', '🏆', '🛡️',
];

export const COLOR_PRESETS = [
  { name: 'Indigo', value: '#6366f1' },
  { name: 'Violet', value: '#a855f7' },
  { name: 'Rose', value: '#ec4899' },
  { name: 'Rouge', value: '#ef4444' },
  { name: 'Orange', value: '#f59e0b' },
  { name: 'Vert', value: '#22c55e' },
  { name: 'Bleu', value: '#3b82f6' },
  { name: 'Cyan', value: '#14b8a6' },
];

export const PRESET_TEMPLATES: AgentPresetTemplate[] = [
  {
    id: 'startup',
    name: 'Mode Startup',
    description: 'Créatif, rapide, informel. Idéal pour les startups et projets innovants.',
    icon: '🚀',
    color: '#6366f1',
    personality: { formality: 75, responseLength: 30, creativity: 85, proactivity: 90, expertiseLevel: 60, humor: 65 },
    instructions: { alwaysDo: ['Proposer des growth hacks', 'Penser MVP', 'Suggérer des métriques'], neverDo: ['Overengineerer', 'Être trop formel', 'Ignorer le budget'], responseFormat: 'bullets' },
  },
  {
    id: 'corporate',
    name: 'Mode Corporate',
    description: 'Formel, structuré, basé sur les données. Pour les grandes entreprises.',
    icon: '🏢',
    color: '#3b82f6',
    personality: { formality: 15, responseLength: 70, creativity: 35, proactivity: 50, expertiseLevel: 90, humor: 10 },
    instructions: { alwaysDo: ['Citer les sources', 'Fournir des rapports structurés', 'Respecter les processus'], neverDo: ['Utiliser du jargon informel', 'Spéculer sans données', 'Ignorer la hiérarchie'], responseFormat: 'structured' },
  },
  {
    id: 'agency',
    name: 'Mode Agence',
    description: 'Créatif, orienté client, délivrables clairs. Pour les agences et freelances.',
    icon: '🎨',
    color: '#ec4899',
    personality: { formality: 50, responseLength: 50, creativity: 90, proactivity: 80, expertiseLevel: 70, humor: 50 },
    instructions: { alwaysDo: ['Proposer des concepts créatifs', 'Penser délivrables', 'Challenger le brief'], neverDo: ['Être générique', 'Oublier les deadlines', 'Ignorer le branding'], responseFormat: 'mixed' },
  },
];

export const LANGUAGE_OPTIONS = ['Français', 'Anglais', 'Espagnol', 'Arabe', 'Hébreu', 'Allemand', 'Italien', 'Portugais'];

export const FORMAT_OPTIONS: { value: AgentInstructions['responseFormat']; label: string; desc: string }[] = [
  { value: 'bullets', label: 'Puces', desc: 'Listes à puces, concis' },
  { value: 'paragraphs', label: 'Paragraphes', desc: 'Texte fluide, narratif' },
  { value: 'structured', label: 'Structuré', desc: 'Sections, titres, tableaux' },
  { value: 'mixed', label: 'Mixte', desc: 'Adapté au contexte' },
];

// ─── Defaults ───

export function getDefaultPersonality(): AgentPersonality {
  return { formality: 50, responseLength: 50, creativity: 50, proactivity: 50, expertiseLevel: 50, humor: 30 };
}

export function getDefaultExpertise(): AgentExpertise {
  return { domainTags: [], industryFocus: '', customKnowledge: '', frameworks: [], competitorNames: [] };
}

export function getDefaultInstructions(): AgentInstructions {
  return { alwaysDo: [], neverDo: [], responseFormat: 'mixed', signatureStyle: '', languages: ['Français'] };
}

export function getDefaultCompanyContext(): AgentCompanyContext {
  return { companyVision: '', keyMetrics: '', teamSize: '', keyContacts: '', currentPriorities: '', budgetConstraints: '' };
}

export function createDefaultConfig(agentId: AgentTypeId): AgentCustomConfig {
  const def = DEFAULT_AGENTS.find(a => a.id === agentId)!;
  return {
    agentId,
    customName: def.name,
    customRole: def.role,
    emoji: def.emoji,
    accentColor: def.color,
    personality: getDefaultPersonality(),
    expertise: getDefaultExpertise(),
    instructions: getDefaultInstructions(),
    companyContext: getDefaultCompanyContext(),
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };
}

// ─── Admin Defaults Storage ───

const ADMIN_DEFAULTS_KEY = 'sarah_admin_defaults';

export interface AdminAgentDefaults {
  [agentId: string]: { name?: string; role?: string };
}

export function loadAdminDefaults(): AdminAgentDefaults {
  if (typeof window === 'undefined') return {};
  try {
    const raw = localStorage.getItem(ADMIN_DEFAULTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return {};
}

export function saveAdminDefaults(defaults: AdminAgentDefaults): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ADMIN_DEFAULTS_KEY, JSON.stringify(defaults));
}

// ─── User Storage ───

const STORAGE_KEY = 'sarah_agent_configs';

export function loadAgentConfigs(): UserAgentConfigs {
  if (typeof window === 'undefined') return { configs: {}, version: 1 };
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch { /* corrupted */ }
  return { configs: {}, version: 1 };
}

export function saveAgentConfigs(configs: UserAgentConfigs): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(configs));
}

export function hasCustomConfig(agentId: AgentTypeId): boolean {
  const configs = loadAgentConfigs();
  return agentId in configs.configs;
}

// ─── Merge & Resolve ───

export function getEffectiveAgent(agentId: AgentTypeId, configs?: UserAgentConfigs): ResolvedAgent {
  const def = DEFAULT_AGENTS.find(a => a.id === agentId)!;
  const userConfigs = configs ?? loadAgentConfigs();
  const custom = userConfigs.configs[agentId];
  const adminDefaults = loadAdminDefaults();
  const adminOverride = adminDefaults[agentId];

  // 3-level priority: User custom > Admin defaults > Hardcoded defaults
  const baseName = adminOverride?.name || def.name;
  const baseRole = adminOverride?.role || def.role;

  if (!custom) {
    return {
      id: def.id, name: baseName, gender: def.gender, role: baseRole,
      emoji: def.emoji, color: def.color, model: def.model,
      systemPrompt: def.systemPrompt, meetingPrompt: def.meetingPrompt,
      isCustomized: !!adminOverride,
    };
  }

  return {
    id: def.id,
    name: custom.customName || baseName,
    gender: def.gender,
    role: custom.customRole || baseRole,
    emoji: custom.emoji || def.emoji,
    color: custom.accentColor || def.color,
    model: def.model,
    systemPrompt: buildSystemPrompt(agentId, userConfigs),
    meetingPrompt: buildMeetingPrompt(agentId, userConfigs),
    isCustomized: true,
  };
}

// ─── System Prompt Builder ───

function personalityToText(p: AgentPersonality): string {
  const parts: string[] = [];

  if (p.formality < 30) parts.push('Tu vouvoies toujours. Ton très professionnel et formel.');
  else if (p.formality > 70) parts.push('Tu tutoies le client. Ton décontracté et amical.');

  if (p.responseLength < 30) parts.push('Sois très concis: 2-3 phrases max par point.');
  else if (p.responseLength > 70) parts.push('Sois détaillé: développe chaque point avec des exemples et explications.');

  if (p.creativity < 30) parts.push('Reste factuel et pragmatique. Cite des sources, pas de spéculation.');
  else if (p.creativity > 70) parts.push('Sois créatif et innovant. Propose des idées originales, pense outside the box.');

  if (p.proactivity < 30) parts.push('Réponds uniquement à ce qui est demandé, pas de suggestions non sollicitées.');
  else if (p.proactivity > 70) parts.push('Sois proactif: anticipe les besoins, propose des next steps, suggère des améliorations.');

  if (p.expertiseLevel < 30) parts.push('Utilise un langage simple et accessible. Explique les termes techniques.');
  else if (p.expertiseLevel > 70) parts.push('Utilise un vocabulaire expert et technique. Le client est un professionnel.');

  if (p.humor < 20) parts.push('Ton sérieux et sobre. Pas d\'humour.');
  else if (p.humor > 70) parts.push('N\'hésite pas à être léger et à utiliser l\'humour quand c\'est adapté.');

  return parts.join('\n');
}

export function buildSystemPrompt(agentId: AgentTypeId, configs?: UserAgentConfigs, companyProfile?: Record<string, unknown>): string {
  const def = DEFAULT_AGENTS.find(a => a.id === agentId)!;
  const userConfigs = configs ?? loadAgentConfigs();
  const custom = userConfigs.configs[agentId];

  const followUpInstruction = '\n\nÀ la fin de ta réponse, propose 3 questions de suivi formatées:\n[Q1: question]\n[Q2: question]\n[Q3: question]\nCes questions aident le client à approfondir ou préciser sa demande.';

  if (!custom) return def.systemPrompt + followUpInstruction;

  const sections: string[] = [];

  // Base identity
  const name = custom.customName || def.name;
  const role = custom.customRole || def.role;
  sections.push(`Tu es ${name}, ${role}. ${def.systemPrompt.split('. ').slice(1).join('. ')}`);

  // Personality
  const personalityText = personalityToText(custom.personality);
  if (personalityText) sections.push(`STYLE DE COMMUNICATION:\n${personalityText}`);

  // Expertise
  const exp = custom.expertise;
  const expertiseParts: string[] = [];
  if (exp.domainTags.length > 0) expertiseParts.push(`Domaines d'expertise: ${exp.domainTags.join(', ')}.`);
  if (exp.industryFocus) expertiseParts.push(`Secteur d'activité: ${exp.industryFocus}.`);
  if (exp.customKnowledge) expertiseParts.push(`Connaissances spécifiques: ${exp.customKnowledge}`);
  if (exp.frameworks.length > 0) expertiseParts.push(`Méthodologies préférées: ${exp.frameworks.join(', ')}.`);
  if (exp.competitorNames.length > 0) expertiseParts.push(`Concurrents a surveiller: ${exp.competitorNames.join(', ')}.`);
  if (expertiseParts.length > 0) sections.push(`EXPERTISE:\n${expertiseParts.join('\n')}`);

  // Instructions
  const inst = custom.instructions;
  const rules: string[] = [];
  if (inst.alwaysDo.length > 0) rules.push(`Tu fais TOUJOURS: ${inst.alwaysDo.join('; ')}.`);
  if (inst.neverDo.length > 0) rules.push(`Tu ne fais JAMAIS: ${inst.neverDo.join('; ')}.`);
  if (inst.responseFormat === 'bullets') rules.push('Format de réponse: utilise des listes à puces.');
  else if (inst.responseFormat === 'paragraphs') rules.push('Format de réponse: texte fluide en paragraphes.');
  else if (inst.responseFormat === 'structured') rules.push('Format de réponse: structuré avec titres, sections et tableaux.');
  if (inst.signatureStyle) rules.push(`Termine tes messages par: "${inst.signatureStyle}".`);
  if (inst.languages.length > 0 && !(inst.languages.length === 1 && inst.languages[0] === 'Français')) {
    rules.push(`Langues maitrisees: ${inst.languages.join(', ')}. Reponds dans la langue du client.`);
  }
  if (rules.length > 0) sections.push(`REGLES:\n${rules.join('\n')}`);

  // Company context
  const ctx = custom.companyContext;
  const profile = companyProfile ?? {};
  const ctxParts: string[] = [];
  if (ctx.companyVision || profile['mission']) ctxParts.push(`Vision: ${ctx.companyVision || profile['mission']}`);
  if (ctx.keyMetrics || profile['kpis']) ctxParts.push(`KPIs: ${ctx.keyMetrics || profile['kpis']}`);
  if (ctx.teamSize || profile['employeeCount']) ctxParts.push(`Équipe: ${ctx.teamSize || profile['employeeCount']}`);
  if (ctx.currentPriorities || profile['shortTermGoals']) ctxParts.push(`Priorités: ${ctx.currentPriorities || profile['shortTermGoals']}`);
  if (ctx.budgetConstraints || profile['budget']) ctxParts.push(`Budget: ${ctx.budgetConstraints || profile['budget']}`);
  if (ctxParts.length > 0) sections.push(`CONTEXTE ENTREPRISE:\n${ctxParts.join('\n')}`);

  return sections.join('\n\n') + followUpInstruction;
}

export function buildMeetingPrompt(agentId: AgentTypeId, configs?: UserAgentConfigs): string {
  const def = DEFAULT_AGENTS.find(a => a.id === agentId)!;
  const userConfigs = configs ?? loadAgentConfigs();
  const custom = userConfigs.configs[agentId];

  if (!custom) return def.meetingPrompt;

  const name = custom.customName || def.name;
  const role = custom.customRole || def.role;
  let prompt = `Tu es ${name}, ${role}. ${def.meetingPrompt.split('. ').slice(1).join('. ')}`;

  const personalityText = personalityToText(custom.personality);
  if (personalityText) prompt += `\n\n${personalityText}`;

  return prompt;
}

// ─── Deposit Options (Free model — pay only for tokens consumed) ───

export interface DepositOption {
  id: string;
  amount: number;
  label: string;
  icon: string;
  popular?: boolean;
}

export const DEPOSIT_OPTIONS: DepositOption[] = [
  { id: 'dep_5', amount: 5, label: '5 EUR', icon: '🌱' },
  { id: 'dep_20', amount: 20, label: '20 EUR', icon: '🚀', popular: true },
  { id: 'dep_50', amount: 50, label: '50 EUR', icon: '💎' },
  { id: 'dep_100', amount: 100, label: '100 EUR', icon: '👑' },
];

export const COMMISSION_TIERS = [
  { maxUsers: 1000, rate: 0, label: '0%', badge: 'Early Adopter' },
  { maxUsers: 100000, rate: 0.05, label: '5%', badge: 'Standard' },
  { maxUsers: Infinity, rate: 0.07, label: '7%', badge: 'Standard+' },
];

export const SIGNUP_BONUS_CREDITS = 50;

// Legacy alias
export type CreditPack = DepositOption;
export const CREDIT_PACKS = DEPOSIT_OPTIONS;

// All agents are free for everyone
export function getAgentsForTier(_tier: string): AgentTypeId[] {
  return DEFAULT_AGENTS.map(a => a.id);
}

export function isAgentAvailable(_agentId: AgentTypeId, _tier: string): boolean {
  return true;
}

export function getRequiredPlan(_agentId: AgentTypeId): string {
  return 'Gratuit';
}

// ─── Active Agents (user selection) ───

const ACTIVE_AGENTS_KEY = 'sarah_active_agents';

export function getActiveAgentIds(): AgentTypeId[] {
  if (typeof window === 'undefined') return ['sarah-repondeur'];
  try {
    const raw = localStorage.getItem(ACTIVE_AGENTS_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) return parsed;
    }
  } catch { /* */ }
  // Also check session for server-stored active agents
  try {
    const session = JSON.parse(localStorage.getItem('sarah_session') ?? '{}');
    if (session.activeAgents && Array.isArray(session.activeAgents) && session.activeAgents.length > 0) {
      return session.activeAgents;
    }
  } catch { /* */ }
  return ['sarah-repondeur'];
}

export function setActiveAgentIds(ids: AgentTypeId[]): void {
  if (typeof window === 'undefined') return;
  const validIds = ids.filter(id => DEFAULT_AGENTS.some(a => a.id === id));
  if (validIds.length === 0) validIds.push('sarah-repondeur');
  localStorage.setItem(ACTIVE_AGENTS_KEY, JSON.stringify(validIds));
  // Also update session
  try {
    const session = JSON.parse(localStorage.getItem('sarah_session') ?? '{}');
    session.activeAgents = validIds;
    localStorage.setItem('sarah_session', JSON.stringify(session));
  } catch { /* */ }
}

export function isAgentActive(id: AgentTypeId): boolean {
  return getActiveAgentIds().includes(id);
}

export function toggleAgent(id: AgentTypeId): AgentTypeId[] {
  const current = getActiveAgentIds();
  const idx = current.indexOf(id);
  if (idx >= 0 && current.length > 1) {
    current.splice(idx, 1);
  } else if (idx < 0) {
    current.push(id);
  }
  setActiveAgentIds(current);
  return current;
}

// ─── Export / Import ───

export function exportConfigs(configs: UserAgentConfigs): string {
  return JSON.stringify(configs, null, 2);
}

export function importConfigs(json: string): UserAgentConfigs | null {
  try {
    const data = JSON.parse(json);
    if (data && typeof data === 'object' && data.configs && data.version) {
      return data as UserAgentConfigs;
    }
  } catch { /* invalid JSON */ }
  return null;
}
