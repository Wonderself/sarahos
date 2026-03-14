/**
 * FEATURE 7 — Multi-canaux Telegram
 * Système de canaux thématiques : alerts, business, tech, admin
 */
import TelegramBot from 'node-telegram-bot-api';

let bot: TelegramBot;

const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '';
const ALERTS_CHANNEL = process.env.TELEGRAM_ALERTS_CHANNEL || '';
const BUSINESS_CHANNEL = process.env.TELEGRAM_BUSINESS_CHANNEL || '';
const TECH_CHANNEL = process.env.TELEGRAM_TECH_CHANNEL || '';

export function initChannels(botInstance: TelegramBot): void {
  bot = botInstance;
}

function getChannel(channelEnv: string): string {
  return channelEnv || ADMIN_CHAT_ID;
}

export const TelegramChannels = {
  /**
   * Alertes critiques : erreurs, disque plein, DB down
   */
  async sendAlert(message: string, buttons?: TelegramBot.InlineKeyboardMarkup): Promise<void> {
    const target = getChannel(ALERTS_CHANNEL);
    if (!target) return;
    try {
      await bot.sendMessage(target, message, {
        parse_mode: 'Markdown',
        reply_markup: buttons,
      });
    } catch (err) {
      console.error('[Channels] sendAlert failed:', err instanceof Error ? err.message : err);
    }
  },

  /**
   * Business : nouveaux users, upgrades, revenus, churn
   */
  async sendBusiness(message: string, buttons?: TelegramBot.InlineKeyboardMarkup): Promise<void> {
    const target = getChannel(BUSINESS_CHANNEL);
    if (!target) return;
    try {
      await bot.sendMessage(target, message, {
        parse_mode: 'Markdown',
        reply_markup: buttons,
      });
    } catch (err) {
      console.error('[Channels] sendBusiness failed:', err instanceof Error ? err.message : err);
    }
  },

  /**
   * Technique : deploys, backups, crons, erreurs techniques
   */
  async sendTech(message: string, buttons?: TelegramBot.InlineKeyboardMarkup): Promise<void> {
    const target = getChannel(TECH_CHANNEL);
    if (!target) return;
    try {
      await bot.sendMessage(target, message, {
        parse_mode: 'Markdown',
        reply_markup: buttons,
      });
    } catch (err) {
      console.error('[Channels] sendTech failed:', err instanceof Error ? err.message : err);
    }
  },

  /**
   * Admin direct : validations, commandes bot, rapports perso
   */
  async sendAdmin(message: string, buttons?: TelegramBot.InlineKeyboardMarkup): Promise<void> {
    if (!ADMIN_CHAT_ID) return;
    try {
      await bot.sendMessage(ADMIN_CHAT_ID, message, {
        parse_mode: 'Markdown',
        reply_markup: buttons,
      });
    } catch (err) {
      console.error('[Channels] sendAdmin failed:', err instanceof Error ? err.message : err);
    }
  },
};

// ─── Pre-formatted notification builders ───

export function formatCriticalAlert(service: string, error: string, impact: string, autoAction?: string): string {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  return [
    `🚨 *ALERTE CRITIQUE* — ${ts}`,
    '',
    `Service : ${service}`,
    `Erreur : ${error}`,
    `Impact : ${impact}`,
    '',
    autoAction ? `Action auto : ${autoAction}` : 'Action auto : aucune',
  ].join('\n');
}

export function formatBusinessNotif(type: string, details: Record<string, string>): string {
  const ts = new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
  if (type === 'new_user') {
    return [
      `👤 *Nouveau user* — ${ts}`,
      '',
      `Email : ${details.email || '?'}`,
      `Profil : ${details.profession || '?'} — ${details.city || '?'}`,
      `Score onboarding : ${details.score || '?'}/100`,
      `Crédits : ${details.credits || '5000'}`,
    ].join('\n');
  }
  if (type === 'payment') {
    return [
      `💰 *Paiement* — ${ts}`,
      '',
      `${details.name || '?'}`,
      `Pack : ${details.pack || '?'}`,
      `Montant : ${details.amount || '?'}€`,
      `Total dépensé : ${details.lifetime || '?'}€ (lifetime)`,
    ].join('\n');
  }
  return `📊 ${type}: ${JSON.stringify(details)}`;
}

export function formatTechNotif(type: string, details: Record<string, string>): string {
  const ts = new Date().toISOString().replace('T', ' ').slice(0, 19);
  if (type === 'deploy') {
    return [
      `🚀 *Deploy réussi* — ${ts}`,
      '',
      `Branche : ${details.branch || 'main'}`,
      `Commits : ${details.commits || '?'} nouveaux`,
      `Durée : ${details.duration || '?'}s`,
    ].join('\n');
  }
  if (type === 'backup') {
    return [
      `💾 *Backup terminé* — ${ts}`,
      '',
      `Base : ${details.database || 'freenzy'}`,
      `Taille : ${details.size || '?'}`,
      `Durée : ${details.duration || '?'}s`,
    ].join('\n');
  }
  return `🔧 ${type}: ${JSON.stringify(details)}`;
}
