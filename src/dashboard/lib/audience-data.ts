/* ═══════════════════════════════════════════════════════════════
   audience-data.ts — Source unique de donnees par audience
   Particulier / Freelance / Entreprise
   ═══════════════════════════════════════════════════════════════ */

export type AudienceType = 'particulier' | 'freelance' | 'entreprise';

export interface AudienceHero {
  headline: string;
  subheadline: string;
  badge: string;
}

export interface AudienceAgent {
  icon: string;
  name: string;
  cat: string;
}

export interface AudienceUseCase {
  icon: string;
  title: string;
  desc: string;
  type: 'specific' | 'shared';
}

export interface AudienceCTA {
  label: string;
  href: string;
}

export interface AudienceTarifsExample {
  label: string;
  details: string;
  items: { action: string; count: string }[];
}

export interface AudienceConfig {
  id: AudienceType;
  label: string;
  emoji: string;
  hero: AudienceHero;
  agents: AudienceAgent[];
  useCases: AudienceUseCase[];
  cta: AudienceCTA;
  bonusMessage: string;
  tarifsExample: AudienceTarifsExample;
  showEnterprise: boolean;
}

// ─── Use cases partages (communs a toutes les audiences) ───
const SHARED_USE_CASES: AudienceUseCase[] = [
  { icon: 'chat', title: 'Chattez avec vos agents', desc: 'Posez n\'importe quelle question, obtenez une reponse experte en secondes.', type: 'shared' },
  { icon: 'mail', title: 'Emails professionnels', desc: 'Generez des emails percutants, adaptes au contexte et au destinataire.', type: 'shared' },
  { icon: 'chat', title: 'WhatsApp Business', desc: 'Gerez vos conversations WhatsApp avec l\'IA, 24h/24.', type: 'shared' },
];

// ═══════════════════════════════════════════════════════════════
// CONFIGS PAR AUDIENCE
// ═══════════════════════════════════════════════════════════════

export const AUDIENCE_CONFIGS: Record<AudienceType, AudienceConfig> = {
  particulier: {
    id: 'particulier',
    label: 'Particulier',
    emoji: '👤',
    hero: {
      headline: 'Simplifiez votre vie.',
      subheadline: 'Vos agents personnels s\'occupent de tout : budget, impots, immobilier, CV, coaching, ecriture...',
      badge: 'Particuliers : 0% de commission, a vie',
    },
    agents: [
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
    ],
    useCases: [
      { icon: 'bar_chart', title: 'Optimisez vos impots en 3 min', desc: 'Votre agent fiscal analyse votre situation et propose des optimisations concretes.', type: 'specific' },
      { icon: 'home', title: 'Trouvez votre appartement ideal', desc: 'Le chasseur immo IA filtre, compare et negocie pour vous.', type: 'specific' },
      { icon: 'credit_card', title: 'Gerez votre budget familial', desc: 'Suivi automatique, alertes, projections et conseils personnalises.', type: 'specific' },
      ...SHARED_USE_CASES,
    ],
    cta: { label: 'Essayer gratuitement', href: '/login?mode=register' },
    bonusMessage: '50 credits offerts = gestion budget 1 mois + aide impots',
    tarifsExample: {
      label: 'Avec 50 credits (5\u20AC), vous pouvez :',
      details: 'Exemples pour un particulier',
      items: [
        { action: 'Sessions budget/finances', count: '~72' },
        { action: 'Analyses fiscales', count: '~40' },
        { action: 'Recherches immobilieres', count: '~35' },
        { action: 'Revisions de CV', count: '~14' },
        { action: 'Seances coaching', count: '~19' },
      ],
    },
    showEnterprise: false,
  },

  freelance: {
    id: 'freelance',
    label: 'Freelance',
    emoji: '💼',
    hero: {
      headline: 'Gagnez du temps, gagnez plus.',
      subheadline: 'Votre equipe IA gere clients, devis, marketing, juridique pendant que vous creez.',
      badge: 'Freelances & TPE : 0% de commission, a vie',
    },
    agents: [
      { icon: 'call', name: 'Repondeur 24/7', cat: 'Business' },
      { icon: 'handshake', name: 'Assistante', cat: 'Business' },
      { icon: 'rocket_launch', name: 'Commercial', cat: 'Business' },
      { icon: 'campaign', name: 'Marketing', cat: 'Business' },
      { icon: 'campaign', name: 'Communication', cat: 'Business' },
      { icon: 'savings', name: 'Finance', cat: 'Business' },
      { icon: 'code', name: 'Dev', cat: 'Business' },
      { icon: 'gavel', name: 'Juridique', cat: 'Business' },
      { icon: 'photo_camera', name: 'Photo / Visuel', cat: 'Business' },
      { icon: 'movie', name: 'Video', cat: 'Business' },
      { icon: 'credit_card', name: 'Budget perso', cat: 'Perso' },
      { icon: 'receipt_long', name: 'Comptable', cat: 'Perso' },
    ],
    useCases: [
      { icon: 'call', title: 'Repondez aux prospects 24/7', desc: 'Le repondeur IA qualifie vos leads meme quand vous dormez.', type: 'specific' },
      { icon: 'description', title: 'Generez devis et contrats en 30s', desc: 'Documents professionnels generes et envoyes automatiquement.', type: 'specific' },
      { icon: 'campaign', title: 'Automatisez votre marketing', desc: 'Posts sociaux, newsletters, strategie — tout est gere par l\'IA.', type: 'specific' },
      ...SHARED_USE_CASES,
    ],
    cta: { label: 'Lancer mon assistant IA', href: '/login?mode=register' },
    bonusMessage: '50 credits offerts = 45 emails clients + 14 devis',
    tarifsExample: {
      label: 'Avec 50 credits (5\u20AC), vous pouvez :',
      details: 'Exemples pour un freelance',
      items: [
        { action: 'Emails clients', count: '~45' },
        { action: 'Devis / contrats', count: '~14' },
        { action: 'Posts reseaux sociaux', count: '~62' },
        { action: 'Appels repondeur', count: '~10' },
        { action: 'Analyses financieres', count: '~19' },
      ],
    },
    showEnterprise: false,
  },

  entreprise: {
    id: 'entreprise',
    label: 'Entreprise',
    emoji: '🏢',
    hero: {
      headline: 'Transformez votre organisation.',
      subheadline: '34 agents specialises pour chaque departement. Direction, RH, operations, data, innovation...',
      badge: 'Entreprises & ETI : instance dediee, SLA garanti',
    },
    agents: [
      { icon: 'target', name: 'Direction Generale', cat: 'Business' },
      { icon: 'group', name: 'RH', cat: 'Business' },
      { icon: 'precision_manufacturing', name: 'Operations', cat: 'Business' },
      { icon: 'query_stats', name: 'Data', cat: 'Business' },
      { icon: 'school', name: 'Formation', cat: 'Business' },
      { icon: 'lightbulb', name: 'Innovation', cat: 'Business' },
      { icon: 'verified', name: 'Qualite', cat: 'Business' },
      { icon: 'sentiment_satisfied', name: 'CSM', cat: 'Business' },
      { icon: 'public', name: 'International', cat: 'Business' },
      { icon: 'palette', name: 'Design', cat: 'Business' },
      { icon: 'rocket_launch', name: 'Commercial', cat: 'Business' },
      { icon: 'campaign', name: 'Marketing', cat: 'Business' },
      { icon: 'savings', name: 'Finance', cat: 'Business' },
      { icon: 'gavel', name: 'Juridique', cat: 'Business' },
      { icon: 'call', name: 'Repondeur 24/7', cat: 'Business' },
      { icon: 'handshake', name: 'Assistante', cat: 'Business' },
    ],
    useCases: [
      { icon: 'precision_manufacturing', title: 'Automatisez chaque departement', desc: 'Un agent specialise par service : RH, finance, juridique, marketing, operations...', type: 'specific' },
      { icon: 'dns', title: 'White-Label SaaS sur votre domaine', desc: 'Votre propre plateforme Freenzy.io, personnalisee a votre marque.', type: 'specific' },
      { icon: 'chat', title: 'Pilotez par WhatsApp', desc: 'Validez les propositions de vos agents IA directement depuis WhatsApp.', type: 'specific' },
      ...SHARED_USE_CASES,
    ],
    cta: { label: 'Demander une demo', href: '#enterprise' },
    bonusMessage: '50 credits offerts = testez 6 agents business',
    tarifsExample: {
      label: 'Avec 50 credits (5\u20AC), vous pouvez :',
      details: 'Exemples pour une entreprise',
      items: [
        { action: 'Reunions strategie IA', count: '~6' },
        { action: 'Audits departement', count: '~10' },
        { action: 'Rapports data', count: '~14' },
        { action: 'Emails departements', count: '~45' },
        { action: 'Analyses RH', count: '~19' },
      ],
    },
    showEnterprise: true,
  },
};

// ═══════════════════════════════════════════════════════════════
// VARIANT ANGLES — headlines differents par variante × audience
// Pour Phase 2 (variantes de style)
// ═══════════════════════════════════════════════════════════════

export interface VariantAngle {
  variantId: string;
  angle: string;
  heroes: Record<AudienceType, AudienceHero>;
}

export const VARIANT_ANGLES: VariantAngle[] = [
  {
    variantId: 'neon-futuriste',
    angle: 'Disruption',
    heroes: {
      particulier: {
        headline: 'Remplacez 12 pros. Maintenant.',
        subheadline: 'Comptable, coach, chasseur immo, negociateur... une IA pour chacun. Pour 0\u20AC.',
        badge: 'L\'IA qui remplace tout',
      },
      freelance: {
        headline: 'Virez vos prestataires.',
        subheadline: 'Commercial, marketing, juridique, finance : tous remplaces par l\'IA. Sans regret.',
        badge: 'Votre equipe, en mieux',
      },
      entreprise: {
        headline: 'Vos employes IA ne dorment jamais.',
        subheadline: '34 agents, 0 conge maladie, 0 turnover, 0 negociation salariale.',
        badge: 'L\'entreprise augmentee',
      },
    },
  },
  {
    variantId: 'minimal-luxe',
    angle: 'Premium / Confiance',
    heroes: {
      particulier: {
        headline: 'L\'IA, simplement.',
        subheadline: 'Des agents discrets et efficaces pour chaque aspect de votre vie.',
        badge: 'Simple. Fiable. Gratuit.',
      },
      freelance: {
        headline: 'Excellence, sans effort.',
        subheadline: 'Concentrez-vous sur votre art. L\'IA gere le reste avec elegance.',
        badge: 'Votre assistant premium',
      },
      entreprise: {
        headline: 'La confiance, a chaque decision.',
        subheadline: 'Anthropic, RGPD, chiffrement AES-256. La serenite totale pour votre organisation.',
        badge: 'Securite & excellence',
      },
    },
  },
  {
    variantId: 'bold-disrupteur',
    angle: 'ROI / Chiffres',
    heroes: {
      particulier: {
        headline: 'Economisez 847\u20AC/an.',
        subheadline: 'Comptable: 0.50cr vs 150\u20AC. Coach: 0.50cr vs 80\u20AC/seance. Impots: gratuit vs 200\u20AC.',
        badge: 'Les chiffres parlent',
      },
      freelance: {
        headline: '12h/semaine recuperees.',
        subheadline: '45 emails pour 5\u20AC. 14 devis pour 5\u20AC. 62 posts pour 5\u20AC. Faites le calcul.',
        badge: 'ROI immediat',
      },
      entreprise: {
        headline: 'ROI x47 en 90 jours.',
        subheadline: '1 agent = 0.50cr/action. 1 salarie = 3500\u20AC/mois. Vous faites le calcul.',
        badge: 'Performance mesuree',
      },
    },
  },
  {
    variantId: 'gradient-wave',
    angle: 'Innovation / Futur',
    heroes: {
      particulier: {
        headline: 'Votre vie, augmentee.',
        subheadline: 'L\'IA qui vous comprend, vous anticipe, vous simplifie tout. Bienvenue dans le futur.',
        badge: 'Le futur est la',
      },
      freelance: {
        headline: 'Le futur du travail independant.',
        subheadline: 'Multi-agents, multi-modeles, multi-possibilites. Une nouvelle ere commence.',
        badge: 'Travaillez autrement',
      },
      entreprise: {
        headline: 'L\'entreprise de 2030, aujourd\'hui.',
        subheadline: '6 modeles IA, 34 agents, orchestration autonome. Le futur n\'attend pas.',
        badge: 'Innovation continue',
      },
    },
  },
];

// ═══════════════════════════════════════════════════════════════
// TOKEN PRICING — pour la page tarifs fusionnee
// ═══════════════════════════════════════════════════════════════

export const TOKEN_PRICING = [
  {
    provider: 'Anthropic',
    models: [
      { name: 'Claude Haiku 4.5', input: 0.80, output: 4.00, use: 'FAQ, chat, social, WhatsApp' },
      { name: 'Claude Sonnet 4', input: 3.00, output: 15.00, use: 'Emails, documents, analyses' },
      { name: 'Claude Opus 4.6', input: 15.00, output: 75.00, use: 'Strategie, direction, thinking' },
    ],
  },
  {
    provider: 'Autres services',
    models: [
      { name: 'ElevenLabs TTS', input: 0, output: 0, use: 'Voix premium multilangue — 150 cr/1000 car.' },
      { name: 'Twilio Voice', input: 0, output: 0, use: 'Appels entrants ~0.01\u20AC/min, sortants ~0.014\u20AC/min' },
      { name: 'Runway ML', input: 0, output: 0, use: 'Generation video — ~40 cr/clip 30s' },
      { name: 'DALL-E / Flux', input: 0, output: 0, use: 'Generation image — 8 cr (standard), 12 cr (HD)' },
    ],
  },
];

// ═══════════════════════════════════════════════════════════════
// FAQ CATEGORY ORDER — reordonnement par audience
// Toutes les categories restent visibles, juste reordonnees.
// ═══════════════════════════════════════════════════════════════

export const FAQ_CATEGORY_ORDER: Record<AudienceType, string[]> = {
  particulier: ['general', 'pricing', 'agents', 'security', 'tech', 'whatsapp', 'studio', 'dashboard', 'custom', 'enterprise'],
  freelance:   ['agents', 'pricing', 'general', 'whatsapp', 'tech', 'studio', 'dashboard', 'security', 'custom', 'enterprise'],
  entreprise:  ['enterprise', 'security', 'agents', 'custom', 'tech', 'pricing', 'dashboard', 'general', 'whatsapp', 'studio'],
};
