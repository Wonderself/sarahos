/**
 * FEATURE 10 — Notifications proactives automatiques
 * Envoie des notifications sans que l'admin ne demande quoi que ce soit
 */
import TelegramBot from 'node-telegram-bot-api';
import { TelegramChannels } from './channels';

export let proactiveBot: TelegramBot;
export let proactiveAdminChatId: string;

export function initProactiveNotifications(botInstance: TelegramBot, chatId: string): void {
  proactiveBot = botInstance;
  proactiveAdminChatId = chatId;
}

/**
 * Nouveau user — appelé depuis /api/onboarding/complete
 */
export async function notifyNewUser(user: {
  firstName: string;
  lastName: string;
  city: string;
  country: string;
  profession: string;
  subProfession?: string;
  goal?: string;
  onboardingScore: number;
  credits: number;
  email: string;
}): Promise<void> {
  const ts = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const msg = [
    `👤 *Nouveau user* — ${ts}`,
    '',
    `${user.firstName} ${user.lastName}`,
    `📍 ${user.city}, ${user.country}`,
    `💼 ${user.profession}${user.subProfession ? ` — ${user.subProfession}` : ''}`,
    `🎯 Objectif : ${user.goal || 'non renseigné'}`,
    `📊 Score onboarding : ${user.onboardingScore}/100`,
    `💳 Crédits : ${user.credits} (offerts)`,
  ].join('\n');

  await TelegramChannels.sendBusiness(msg, {
    inline_keyboard: [[
      { text: '👁️ Voir le profil', callback_data: `view_user_${user.email}` },
      { text: '💬 Lui envoyer un message', callback_data: `message_user_${user.email}` },
    ]],
  });
}

/**
 * Paiement réussi — appelé depuis webhook Stripe
 */
export async function notifyPayment(payment: {
  name: string;
  pack: string;
  amount: number;
  lifetimeSpent: number;
}): Promise<void> {
  const ts = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  const msg = [
    `💰 *Paiement* — ${ts}`,
    '',
    payment.name,
    `Pack : ${payment.pack}`,
    `Montant : ${payment.amount}€`,
    `Total dépensé : ${payment.lifetimeSpent}€ (lifetime)`,
  ].join('\n');

  await TelegramChannels.sendBusiness(msg);
}

/**
 * Erreur critique — appelé depuis error handlers
 */
export async function notifyCriticalError(error: {
  service: string;
  message: string;
  occurrences: number;
  timeWindowMin: number;
}): Promise<void> {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  const msg = [
    `🚨 *ERREUR CRITIQUE*`,
    '',
    `${ts}`,
    `Service : ${error.service}`,
    `Message : ${error.message}`,
    `Occurrences : ${error.occurrences} fois en ${error.timeWindowMin} min`,
  ].join('\n');

  await TelegramChannels.sendAlert(msg, {
    inline_keyboard: [[
      { text: '🔧 Corriger maintenant', callback_data: `fix_error_${error.service}` },
      { text: '👁️ Voir les logs', callback_data: 'show_errors' },
      { text: '⏸️ Suspendre', callback_data: `suspend_${error.service}` },
    ]],
  });
}

/**
 * Disque > 80% — appelé depuis cron monitoring
 */
export async function notifyDiskSpace(info: {
  percentage: number;
  autoAction: string;
  spaceFreed: string;
  percentageAfter: number;
}): Promise<void> {
  const msg = [
    `⚠️ *Disque ${info.percentage}%*`,
    '',
    `Action auto : ${info.autoAction}`,
    `Espace libéré : ${info.spaceFreed}`,
    `Disque maintenant : ${info.percentageAfter}%`,
  ].join('\n');

  await TelegramChannels.sendAlert(msg);
}

/**
 * Milestone business — appelé quand un seuil est atteint
 */
export async function notifyMilestone(milestone: {
  description: string;
  nextMilestone: string;
}): Promise<void> {
  const date = new Date().toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  const msg = [
    `🎉 *Milestone atteint !*`,
    '',
    milestone.description,
    `Date : ${date}`,
    `Prochaine étape : ${milestone.nextMilestone}`,
  ].join('\n');

  await TelegramChannels.sendAdmin(msg);
}

/**
 * Users à risque de churn — appelé quotidiennement
 */
export async function notifyChurnRisk(users: {
  email: string;
  inactiveDays: number;
  profession: string;
}[]): Promise<void> {
  if (users.length === 0) return;

  const top3 = users.slice(0, 3).map((u, i) =>
    `${i + 1}. ${u.email} — inactif depuis ${u.inactiveDays}j — ${u.profession}`
  ).join('\n');

  const msg = [
    `⚠️ *${users.length} users à risque de churn*`,
    '',
    'Top 3 :',
    top3,
  ].join('\n');

  await TelegramChannels.sendAdmin(msg, {
    inline_keyboard: [[
      { text: '📧 Relance auto', callback_data: 'churn_relance_auto' },
      { text: '👁️ Voir tous', callback_data: 'churn_view_all' },
      { text: '⏸️ Ignorer', callback_data: 'churn_ignore_week' },
    ]],
  });
}

// ─── Milestone checker ─────────────────────────────────────────

const MILESTONES = [
  { threshold: 10, desc: '🎯 10 utilisateurs inscrits !', next: '50 utilisateurs' },
  { threshold: 50, desc: '🚀 50 utilisateurs inscrits !', next: '100 utilisateurs' },
  { threshold: 100, desc: '💯 100 utilisateurs !', next: '500 utilisateurs' },
  { threshold: 500, desc: '🔥 500 utilisateurs !', next: '1000 utilisateurs' },
  { threshold: 1000, desc: '🏆 1000 utilisateurs !', next: '5000 utilisateurs' },
];

const achievedMilestones = new Set<number>();

export async function checkMilestones(totalUsers: number): Promise<void> {
  for (const milestone of MILESTONES) {
    if (totalUsers >= milestone.threshold && !achievedMilestones.has(milestone.threshold)) {
      achievedMilestones.add(milestone.threshold);
      await notifyMilestone({ description: milestone.desc, nextMilestone: milestone.next });
    }
  }
}
