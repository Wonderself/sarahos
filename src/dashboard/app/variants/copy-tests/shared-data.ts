/* ═══════════════════════════════════════════════════════════════
   shared-data.ts — Donnees partagees entre les 6 copy-test variants
   Extraites de original-v2/page.tsx pour eviter la duplication
   ═══════════════════════════════════════════════════════════════ */

// ─── Modeles IA
export const AI_MODELS = [
  { name: 'Claude · Anthropic', sub: 'Haiku · Sonnet · Opus 4 · Extended Thinking', icon: 'auto_awesome', color: '#D97706' },
  { name: 'GPT · OpenAI', sub: 'GPT-4o · o3 · GPT-4.5', icon: 'smart_toy', color: '#10a37f' },
  { name: 'Gemini · Google', sub: 'Flash · Pro · Ultra', icon: 'diamond', color: '#4285f4' },
  { name: 'Llama · Meta', sub: 'Llama 4 · open source', icon: 'smart_toy', color: '#0668E1' },
  { name: 'Grok · xAI', sub: 'Grok 3 · raisonnement temps reel', icon: 'bolt', color: '#6b7280' },
  { name: 'Mistral · Cohere', sub: 'IA europeenne · et tous les prochains', icon: 'waves', color: '#f97316' },
];

// ─── Ecosysteme
export const ECOSYSTEM = [
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
export const ALL_AGENTS = [
  { icon: 'call', name: 'Repondeur 24/7', cat: 'Business' },
  { icon: 'handshake', name: 'Assistante', cat: 'Business' },
  { icon: 'rocket_launch', name: 'Commercial', cat: 'Business' },
  { icon: 'campaign', name: 'Marketing', cat: 'Business' },
  { icon: 'group', name: 'RH', cat: 'Business' },
  { icon: 'campaign', name: 'Communication', cat: 'Business' },
  { icon: 'savings', name: 'Finance', cat: 'Business' },
  { icon: 'code', name: 'Dev', cat: 'Business' },
  { icon: 'gavel', name: 'Juridique', cat: 'Business' },
  { icon: 'target', name: 'Direction Generale', cat: 'Business' },
  { icon: 'movie', name: 'Video', cat: 'Business' },
  { icon: 'photo_camera', name: 'Photo / Visuel', cat: 'Business' },
  { icon: 'credit_card', name: 'Budget perso', cat: 'Perso' },
  { icon: 'handshake', name: 'Negociateur', cat: 'Perso' },
  { icon: 'bar_chart', name: 'Impots', cat: 'Perso' },
  { icon: 'receipt_long', name: 'Comptable', cat: 'Perso' },
  { icon: 'home', name: 'Chasseur immo', cat: 'Perso' },
  { icon: 'trending_up', name: 'Portfolio', cat: 'Perso' },
  { icon: 'description', name: 'CV & carriere', cat: 'Perso' },
  { icon: 'chat', name: 'Contradicteur', cat: 'Perso' },
  { icon: 'edit', name: 'Ecrivain', cat: 'Perso' },
  { icon: 'movie', name: 'Cineaste', cat: 'Perso' },
  { icon: 'self_improvement', name: 'Coach', cat: 'Perso' },
  { icon: 'landscape', name: 'Deconnexion', cat: 'Perso' },
];

// ─── Actions avec credits
export const ACTION_COSTS = [
  { icon: 'chat', action: 'Chat avec agent IA', model: 'Haiku', count: '100 chats', color: '#22c55e' },
  { icon: 'mail', action: 'Email professionnel', model: 'Sonnet', count: '45 emails', color: '#7c3aed' },
  { icon: 'phone_iphone', action: 'Post reseaux sociaux', model: 'Haiku', count: '62 posts', color: '#3b82f6' },
  { icon: 'description', action: 'Document complet', model: 'Sonnet', count: '14 docs', color: '#7c3aed' },
  { icon: 'call', action: 'Appel repondeur IA', model: 'Twilio + Haiku', count: '10 appels', color: '#f97316' },
  { icon: 'call_made', action: 'Appel sortant IA', model: 'Twilio + Sonnet', count: '3 appels', color: '#f97316' },
  { icon: 'chat', action: 'WhatsApp Business IA', model: 'Haiku', count: '125 msgs', color: '#22c55e' },
  { icon: 'record_voice_over', action: 'Message vocal TTS', model: 'ElevenLabs', count: '11 msgs', color: '#f59e0b' },
  { icon: 'image', action: 'Image IA creee', model: 'DALL-E · Flux', count: '7 images', color: '#9333ea' },
  { icon: 'movie', action: 'Clip video 30s', model: 'Runway ML', count: '1 clip', color: '#ec4899' },
  { icon: 'handshake', action: 'Reunion IA structuree', model: 'Opus', count: '6 reunions', color: '#9333ea' },
];

// ─── Stats badges (reverse ticker)
export const STATS_BADGES = [
  { icon: 'smart_toy', value: '72+', label: 'agents' },
  { icon: 'psychology', value: '6+', label: 'modeles IA' },
  { icon: 'bolt', value: '5 min', label: 'onboarding' },
  { icon: 'diamond', value: '0%', label: 'commission' },
  { icon: 'dark_mode', value: '24/7', label: 'actifs' },
  { icon: 'language', value: '50+', label: 'langues' },
  { icon: 'quiz', value: '103', label: 'FAQ' },
  { icon: 'shopping_cart', value: '48', label: 'templates' },
  { icon: 'business_center', value: '12', label: 'agents Business' },
  { icon: 'person', value: '12', label: 'agents Perso' },
  { icon: 'verified_user', value: 'RGPD', label: 'conforme' },
  { icon: 'lock', value: 'AES-256', label: 'chiffrement' },
  { icon: 'phone_iphone', value: '8', label: 'modes Reveil' },
  { icon: 'target', value: '50', label: 'credits offerts' },
];

// ─── Live activity feed
export const ACTIVITY = [
  { icon: 'call', text: 'Appel traite · lead qualifie', agent: 'Repondeur', color: '#22c55e', ago: '2 min' },
  { icon: 'mail', text: 'Proposition commerciale envoyee', agent: 'Commercial', color: '#7c3aed', ago: '4 min' },
  { icon: 'phone_iphone', text: '3 posts LinkedIn programmes', agent: 'Marketing', color: '#3b82f6', ago: '8 min' },
  { icon: 'bar_chart', text: 'Rapport mensuel genere', agent: 'Finance', color: '#f59e0b', ago: '13 min' },
  { icon: 'alarm', text: 'Briefing matinal envoye', agent: 'Reveil IA', color: '#f97316', ago: '19 min' },
  { icon: 'image', text: 'Visuel cree · campagne Ete 2026', agent: 'Photo/Visuel', color: '#9333ea', ago: '24 min' },
  { icon: 'description', text: 'NDA bilingue genere', agent: 'Juridique', color: '#7c3aed', ago: '31 min' },
  { icon: 'chat', text: '12 messages WhatsApp traites', agent: 'Assistante', color: '#22c55e', ago: '39 min' },
  { icon: 'movie', text: 'Clip video 30s cree', agent: 'Video', color: '#ec4899', ago: '47 min' },
  { icon: 'handshake', text: 'Strategie Q2 synthetisee', agent: 'DG', color: '#9333ea', ago: '1h' },
];

// ─── Interactive demo scenarios
export const DEMO_SCENARIOS = [
  {
    tab: 'Repondeur',
    tabIcon: 'call',
    color: '#22c55e',
    prompt: "Antoine Bernard vient d'appeler. Demande de devis, budget estime 4 800\u20AC.",
    lines: [
      { label: 'Statut', text: 'Appel traite · 2 min 14s' },
      { label: 'Lead', text: 'Qualifie · devis 4 800\u20AC' },
      { label: 'Action', text: 'RDV calendrier · demain 9h30' },
      { label: 'Notif.', text: 'Resume envoye par WhatsApp' },
    ],
    model: 'Haiku + Twilio · 5 credits',
  },
  {
    tab: 'Email',
    tabIcon: 'mail',
    color: '#7c3aed',
    prompt: 'Redige une proposition pour Acme Corp — integration SaaS, budget 12 000\u20AC.',
    lines: [
      { label: 'Objet', text: 'Proposition · Integration SaaS · Acme Corp' },
      { label: 'Corps', text: '487 mots · ton pro · personnalise' },
      { label: 'Annexes', text: 'Planning · CGV · Devis PDF' },
      { label: 'Envoi', text: 'Planifie lundi 8h30 · suivi auto' },
    ],
    model: 'Sonnet · 1.1 credits',
  },
  {
    tab: 'Social',
    tabIcon: 'phone_iphone',
    color: '#3b82f6',
    prompt: 'Cree 3 posts LinkedIn pour notre lancement produit, ton expert + storytelling.',
    lines: [
      { label: 'Post 1', text: 'Hook storytelling · 280 mots · hashtags' },
      { label: 'Post 2', text: 'Stats-first · data produit · 190 mots' },
      { label: 'Post 3', text: 'Question engagement · 120 mots · CTA' },
      { label: 'Planif.', text: 'Lun · Mer · Ven 9h · LinkedIn + Twitter' },
    ],
    model: 'Haiku · 2.4 credits',
  },
  {
    tab: 'Document',
    tabIcon: 'description',
    color: '#9333ea',
    prompt: 'Genere un NDA bilingue FR/EN pour un partenariat avec une startup US.',
    lines: [
      { label: 'Document', text: 'NDA bilingue · 4 pages · RGPD conforme' },
      { label: 'Clauses', text: '12 articles · duree 3 ans' },
      { label: 'Export', text: 'PDF signable + Word editable' },
      { label: 'Revision', text: 'Valide par agent Juridique IA' },
    ],
    model: 'Sonnet · 3.5 credits',
  },
];

// ─── Scenarios (detailed use-cases)
export const SCENARIOS = [
  {
    title: 'Repondeur IA 24/7',
    desc: "Un prospect appelle a 22h. L'agent repond, qualifie le lead, envoie un resume WhatsApp et planifie un RDV.",
    steps: ['Reception appel Twilio', 'Qualification lead par IA', 'Resume WhatsApp + RDV calendrier'],
    tech: 'Twilio + Claude Haiku + WhatsApp',
    color: '#22c55e',
  },
  {
    title: 'Reveil Intelligent',
    desc: 'Chaque matin a 7h : meteo, agenda, actualites sectorielles, KPIs et priorites du jour en audio.',
    steps: ['Collecte donnees multi-sources', 'Synthese personnalisee IA', 'Livraison audio ElevenLabs'],
    tech: 'Claude Sonnet + ElevenLabs + Cron',
    color: '#f59e0b',
  },
  {
    title: 'Factory Documents',
    desc: 'Generez contrats, devis, NDA, CGV en langage naturel. Export PDF signable, archivage auto.',
    steps: ['Prompt en langage naturel', 'Generation structuree IA', 'Export PDF + archivage'],
    tech: 'Claude Sonnet · 3.5 credits/doc',
    color: '#7c3aed',
  },
  {
    title: 'Social Media Autopilot',
    desc: 'Creez et planifiez vos posts LinkedIn, Twitter, Instagram. Ton adapte, hashtags, calendrier editorial.',
    steps: ['Brief creatif', 'Redaction multi-formats IA', 'Planification + publication'],
    tech: 'Claude Haiku · 2.4 credits/post',
    color: '#3b82f6',
  },
];

// ─── Technologies spotlight
export const TECH_FEATURES = [
  {
    title: 'Claude AI · Anthropic',
    desc: 'Le cerveau de vos agents. Haiku pour la vitesse, Sonnet pour la precision, Opus avec Extended Thinking pour les decisions strategiques.',
    points: ['3 niveaux de puissance', 'Extended Thinking (Opus)', 'Memoire contextuelle longue'],
    color: '#D97706',
  },
  {
    title: 'ElevenLabs · Voix Premium',
    desc: 'Voix naturelle multilingue pour le reveil intelligent, les messages vocaux et les appels sortants.',
    points: ['Multilingual v2', 'Voix personnalisable', '11 langues'],
    color: '#8B5CF6',
  },
  {
    title: 'Twilio · Telephonie',
    desc: 'Appels entrants, sortants, SMS et WhatsApp Business. Votre agent repond 24/7, qualifie et transmet.',
    points: ['Appels entrants/sortants', 'SMS + WhatsApp', 'Numero local dedie'],
    color: '#f97316',
  },
  {
    title: 'Studio Creatif · IA',
    desc: 'Generez photos, visuels, clips video et avatars parlants. Integre directement dans votre dashboard.',
    points: ['Photo IA (Flux/DALL-E)', 'Video IA (Runway/D-ID)', 'Avatars parlants'],
    color: '#ec4899',
  },
];

// ─── WhatsApp messages mockup
export const WA_MESSAGES = [
  { from: 'agent', text: 'Resume de la journee :\n\u00b7 3 appels traites\n\u00b7 2 leads qualifies\n\u00b7 1 devis envoye', time: '18:32' },
  { from: 'user', text: 'Envoie le devis a contact@acme.fr', time: '18:33' },
  { from: 'agent', text: 'Devis envoye a contact@acme.fr · suivi planifie J+3', time: '18:33' },
];

// ─── Outils utilisateurs (par categorie)
export const TOOL_CATEGORIES = [
  { id: 'comm', label: 'Communication', icon: 'call', tools: [
    { icon: 'call', name: 'Repondeur intelligent 24/7', desc: 'Repond a vos appels, qualifie les leads, prend les RDV automatiquement.' },
    { icon: 'chat', name: 'WhatsApp Business IA', desc: 'Messages entrants et sortants, notifications, pilotage par WhatsApp.' },
    { icon: 'phone_forwarded', name: 'Appels sortants IA', desc: 'Prospection, relances et confirmations par telephone avec voix naturelle.' },
    { icon: 'mail', name: 'Email IA professionnel', desc: 'Redaction, envoi et suivi automatique de vos emails business.' },
  ]},
  { id: 'prod', label: 'Productivite', icon: 'bolt', tools: [
    { icon: 'alarm', name: 'Reveil intelligent & Brief', desc: 'Briefing personnalise chaque matin : agenda, priorites, meteo, actus.' },
    { icon: 'target', name: "Plan d'action quotidien", desc: 'Objectifs structures, taches priorisees, suivi de progression en temps reel.' },
    { icon: 'description', name: 'Documents & contrats IA', desc: 'Generation de devis, contrats, NDA, rapports en quelques secondes.' },
    { icon: 'handshake', name: 'Reunions structurees IA', desc: "Ordre du jour, compte-rendu, decisions et actions — tout automatise." },
  ]},
  { id: 'create', label: 'Creation', icon: 'palette', tools: [
    { icon: 'photo_camera', name: 'Studio Photo IA', desc: 'Creez des visuels pro, logos, bannieres avec DALL-E et Flux.' },
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
    { icon: 'credit_card', name: 'Budget & depenses perso', desc: "Suivi de vos finances personnelles, alertes et conseils d'economie." },
    { icon: 'home', name: 'Chasseur immobilier IA', desc: 'Veille immobiliere, alertes, analyse de marche et negociation.' },
    { icon: 'description', name: 'CV & carriere IA', desc: "CV optimise, lettres de motivation, preparation d'entretiens." },
    { icon: 'self_improvement', name: 'Coach bien-etre IA', desc: 'Conseils sante, meditation, deconnexion et equilibre vie pro/perso.' },
  ]},
];
