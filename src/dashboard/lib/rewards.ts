// ═══════════════════════════════════════════════════════════
//   REWARDS ENGINE — Token rewards for user actions
//   Credits are awarded for beneficial actions (sharing, reviews, referrals, etc.)
// ═══════════════════════════════════════════════════════════

export interface RewardAction {
  id: string;
  label: string;
  description: string;
  icon: string;
  credits: number;
  category: 'social' | 'engagement' | 'referral' | 'content' | 'milestone';
  oneTime: boolean;
  maxClaims?: number;
  condition?: string;
}

export interface ClaimedReward {
  actionId: string;
  claimedAt: string;
  credits: number;
}

export interface RewardsState {
  totalEarned: number;
  claimed: ClaimedReward[];
  pendingActions: string[];
}

// ─── All rewardable actions
export const REWARD_ACTIONS: RewardAction[] = [
  // SOCIAL — Partage et visibilité
  {
    id: 'share_twitter',
    label: 'Partager sur Twitter/X',
    description: 'Partagez Freenzy.io sur Twitter avec votre lien de parrainage',
    icon: 'share', credits: 5, category: 'social', oneTime: false, maxClaims: 10,
  },
  {
    id: 'share_linkedin',
    label: 'Partager sur LinkedIn',
    description: 'Publiez un post LinkedIn mentionnant Freenzy.io',
    icon: 'work', credits: 8, category: 'social', oneTime: false, maxClaims: 10,
  },
  {
    id: 'share_facebook',
    label: 'Partager sur Facebook',
    description: 'Partagez votre lien Freenzy sur Facebook',
    icon: 'thumb_up', credits: 3, category: 'social', oneTime: false, maxClaims: 5,
  },
  {
    id: 'share_whatsapp',
    label: 'Partager sur WhatsApp',
    description: 'Envoyez votre lien à un contact WhatsApp',
    icon: 'chat', credits: 3, category: 'social', oneTime: false, maxClaims: 20,
  },
  {
    id: 'google_review',
    label: 'Avis Google',
    description: 'Laissez un avis sur Google Business — le plus impactant !',
    icon: 'star', credits: 25, category: 'social', oneTime: true,
  },
  {
    id: 'trustpilot_review',
    label: 'Avis Trustpilot',
    description: 'Laissez un avis sur Trustpilot',
    icon: 'verified', credits: 20, category: 'social', oneTime: true,
  },
  {
    id: 'product_hunt_upvote',
    label: 'Upvote Product Hunt',
    description: 'Votez pour Freenzy sur Product Hunt lors du lancement',
    icon: 'rocket_launch', credits: 15, category: 'social', oneTime: true,
  },

  // ENGAGEMENT — Utilisation de la plateforme
  {
    id: 'first_chat',
    label: 'Premier message',
    description: 'Envoyez votre premier message à un agent IA',
    icon: 'chat_bubble', credits: 5, category: 'engagement', oneTime: true,
  },
  {
    id: 'first_document',
    label: 'Premier document',
    description: 'Générez votre premier document avec un agent',
    icon: 'description', credits: 5, category: 'engagement', oneTime: true,
  },
  {
    id: 'first_meeting',
    label: 'Première réunion',
    description: 'Organisez votre première réunion multi-agents',
    icon: 'groups', credits: 10, category: 'engagement', oneTime: true,
  },
  {
    id: 'first_call',
    label: 'Premier appel',
    description: 'Utilisez le répondeur IA pour la première fois',
    icon: 'call', credits: 10, category: 'engagement', oneTime: true,
  },
  {
    id: 'customize_agent',
    label: 'Personnaliser un agent',
    description: 'Personnalisez le nom, le ton ou les instructions d\'un agent',
    icon: 'tune', credits: 5, category: 'engagement', oneTime: true,
  },
  {
    id: 'complete_profile',
    label: 'Profil complet',
    description: 'Remplissez toutes les informations de votre profil entreprise',
    icon: 'account_circle', credits: 10, category: 'engagement', oneTime: true,
  },
  {
    id: 'daily_login',
    label: 'Connexion quotidienne',
    description: 'Connectez-vous chaque jour pour gagner des crédits',
    icon: 'login', credits: 1, category: 'engagement', oneTime: false,
  },
  {
    id: 'use_5_agents',
    label: 'Utiliser 5 agents',
    description: 'Discutez avec 5 agents différents',
    icon: 'diversity_3', credits: 15, category: 'engagement', oneTime: true,
  },
  {
    id: 'use_studio',
    label: 'Utiliser le Studio',
    description: 'Créez votre première image ou vidéo IA',
    icon: 'palette', credits: 5, category: 'engagement', oneTime: true,
  },
  {
    id: 'whatsapp_connect',
    label: 'Connecter WhatsApp',
    description: 'Activez le pilotage par WhatsApp',
    icon: 'smartphone', credits: 10, category: 'engagement', oneTime: true,
  },

  // REFERRAL — Parrainage
  {
    id: 'refer_signup',
    label: 'Parrainage — inscription',
    description: 'Un filleul s\'inscrit avec votre lien de parrainage',
    icon: 'person_add', credits: 10, category: 'referral', oneTime: false,
  },
  {
    id: 'refer_active',
    label: 'Parrainage — filleul actif',
    description: 'Votre filleul utilise la plateforme activement (≥5 messages)',
    icon: 'emoji_people', credits: 15, category: 'referral', oneTime: false,
  },
  {
    id: 'refer_paying',
    label: 'Parrainage — filleul payant',
    description: 'Votre filleul effectue son premier dépôt de crédits',
    icon: 'paid', credits: 30, category: 'referral', oneTime: false,
  },

  // CONTENT — Création de contenu
  {
    id: 'create_template',
    label: 'Créer un template',
    description: 'Publiez un template d\'agent dans le marketplace',
    icon: 'store', credits: 20, category: 'content', oneTime: false, maxClaims: 10,
  },
  {
    id: 'share_discussion',
    label: 'Partager une discussion',
    description: 'Partagez une discussion approfondie sur les réseaux',
    icon: 'forum', credits: 5, category: 'content', oneTime: false, maxClaims: 20,
  },
  {
    id: 'feedback_agent',
    label: 'Feedback sur un agent',
    description: 'Donnez votre avis détaillé sur un agent (min 50 caractères)',
    icon: 'rate_review', credits: 3, category: 'content', oneTime: false, maxClaims: 34,
  },
  {
    id: 'bug_report',
    label: 'Signaler un bug',
    description: 'Signalez un bug vérifié — vous aidez à améliorer la plateforme',
    icon: 'bug_report', credits: 10, category: 'content', oneTime: false, maxClaims: 20,
  },
  {
    id: 'feature_request',
    label: 'Suggestion retenue',
    description: 'Votre suggestion de fonctionnalité est retenue par l\'équipe',
    icon: 'lightbulb', credits: 25, category: 'content', oneTime: false, maxClaims: 5,
  },

  // MILESTONES — Jalons
  {
    id: 'streak_7',
    label: '7 jours consécutifs',
    description: 'Connectez-vous 7 jours d\'affilée',
    icon: 'local_fire_department', credits: 10, category: 'milestone', oneTime: true,
  },
  {
    id: 'streak_30',
    label: '30 jours consécutifs',
    description: 'Connectez-vous 30 jours d\'affilée — impressionnant !',
    icon: 'whatshot', credits: 50, category: 'milestone', oneTime: true,
  },
  {
    id: 'level_5',
    label: 'Niveau 5 — Professionnel',
    description: 'Atteignez le niveau 5 de gamification',
    icon: 'military_tech', credits: 20, category: 'milestone', oneTime: true,
  },
  {
    id: 'level_10',
    label: 'Niveau 10 — Transcendant',
    description: 'Atteignez le niveau maximum',
    icon: 'emoji_events', credits: 100, category: 'milestone', oneTime: true,
  },
  {
    id: 'messages_100',
    label: '100 messages envoyés',
    description: 'Envoyez 100 messages à vos agents',
    icon: 'mark_chat_read', credits: 15, category: 'milestone', oneTime: true,
  },
  {
    id: 'messages_500',
    label: '500 messages envoyés',
    description: 'Envoyez 500 messages — vous êtes un power user !',
    icon: 'sms', credits: 30, category: 'milestone', oneTime: true,
  },
  {
    id: 'first_deposit',
    label: 'Premier dépôt',
    description: 'Effectuez votre premier dépôt de crédits',
    icon: 'savings', credits: 10, category: 'milestone', oneTime: true,
  },

  // GAMES — Arcade
  {
    id: 'play_first_game',
    label: 'Première partie',
    description: 'Jouez votre première partie dans l\'Arcade',
    icon: 'sports_esports', credits: 5, category: 'engagement', oneTime: true,
  },
  {
    id: 'play_10_games',
    label: '10 parties jouées',
    description: 'Jouez 10 parties dans l\'Arcade — vous êtes accro !',
    icon: 'stadia_controller', credits: 15, category: 'milestone', oneTime: true,
  },
  {
    id: 'daily_challenge_streak_7',
    label: '7 défis quotidiens',
    description: 'Complétez le défi du jour 7 jours d\'affilée',
    icon: 'local_fire_department', credits: 20, category: 'milestone', oneTime: true,
  },
  {
    id: 'download_qr',
    label: 'Télécharger le QR code',
    description: 'Téléchargez votre QR code de parrainage',
    icon: 'qr_code', credits: 3, category: 'engagement', oneTime: true,
  },
];

// ─── Category metadata
export const REWARD_CATEGORIES = {
  social: { label: 'Partage & Avis', icon: 'share', color: '#3b82f6', description: 'Faites connaître Freenzy' },
  engagement: { label: 'Utilisation', icon: 'bolt', color: '#22c55e', description: 'Explorez la plateforme' },
  referral: { label: 'Parrainage', icon: 'person_add', color: '#f97316', description: 'Invitez vos proches' },
  content: { label: 'Contribution', icon: 'edit', color: '#8b5cf6', description: 'Améliorez la communauté' },
  milestone: { label: 'Jalons', icon: 'emoji_events', color: '#f59e0b', description: 'Atteignez des objectifs' },
} as const;

// ─── State management
const STORAGE_KEY = 'fz_rewards';

export function loadRewards(): RewardsState {
  if (typeof window === 'undefined') return { totalEarned: 0, claimed: [], pendingActions: [] };
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return { totalEarned: 0, claimed: [], pendingActions: [] };
    return JSON.parse(stored);
  } catch { return { totalEarned: 0, claimed: [], pendingActions: [] }; }
}

export function saveRewards(state: RewardsState) {
  if (typeof window === 'undefined') return;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function claimReward(actionId: string): { success: boolean; credits: number; message: string } {
  const action = REWARD_ACTIONS.find(a => a.id === actionId);
  if (!action) return { success: false, credits: 0, message: 'Action inconnue' };

  const state = loadRewards();
  const claimCount = state.claimed.filter(c => c.actionId === actionId).length;

  if (action.oneTime && claimCount >= 1) {
    return { success: false, credits: 0, message: 'Déjà réclamé' };
  }
  if (action.maxClaims && claimCount >= action.maxClaims) {
    return { success: false, credits: 0, message: `Maximum ${action.maxClaims} fois atteint` };
  }

  state.claimed.push({ actionId, claimedAt: new Date().toISOString(), credits: action.credits });
  state.totalEarned += action.credits;
  saveRewards(state);

  return { success: true, credits: action.credits, message: `+${action.credits} crédits !` };
}

export function getClaimCount(actionId: string): number {
  const state = loadRewards();
  return state.claimed.filter(c => c.actionId === actionId).length;
}

export function canClaim(actionId: string): boolean {
  const action = REWARD_ACTIONS.find(a => a.id === actionId);
  if (!action) return false;
  const count = getClaimCount(actionId);
  if (action.oneTime && count >= 1) return false;
  if (action.maxClaims && count >= action.maxClaims) return false;
  return true;
}

export function getTotalPossibleCredits(): number {
  return REWARD_ACTIONS.reduce((sum, a) => {
    const max = a.oneTime ? 1 : (a.maxClaims ?? 100);
    return sum + a.credits * max;
  }, 0);
}

export function getShareUrl(referralCode: string, platform: string): string {
  const baseUrl = 'https://freenzy.io';
  const url = `${baseUrl}/?ref=${referralCode}&utm_source=${platform}&utm_medium=referral`;
  const text = encodeURIComponent('Découvrez Freenzy.io — 100+ agents IA pour gérer votre entreprise. 0% de commission, gratuit pour les premiers utilisateurs !');

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?text=${text}&url=${encodeURIComponent(url)}`;
    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`;
    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}&quote=${text}`;
    case 'whatsapp':
      return `https://wa.me/?text=${text}%20${encodeURIComponent(url)}`;
    default:
      return url;
  }
}
