/**
 * ASSEMBLAGE FINAL — Freenzy Telegram Bot
 * Point d'entrée unique. Lance le bot avec toutes les features.
 *
 * Usage : npx ts-node src/telegram/index.ts
 * Ou import { startTelegramBot } depuis le serveur Next.js/Express
 *
 * Variables .env requises :
 *   TELEGRAM_BOT_TOKEN       — Token du bot @BotFather
 *   TELEGRAM_ADMIN_CHAT_ID   — Chat ID d'Emmanuel (6238804698)
 *
 * Variables .env optionnelles :
 *   TELEGRAM_ALERTS_CHANNEL  — Canal alertes critiques
 *   TELEGRAM_BUSINESS_CHANNEL — Canal business
 *   TELEGRAM_TECH_CHANNEL    — Canal technique
 *   (Claude Code CLI via Max subscription — pas besoin d'ANTHROPIC_API_KEY)
 *   COOLIFY_WEBHOOK_URL      — Pour /deploy auto
 *   STRIPE_SECRET_KEY        — Pour /revenue réel
 *   DB_PASSWORD              — Mot de passe PostgreSQL
 *   PROJECT_ROOT             — Racine du projet (default: /root/projects/freenzy/sarahos)
 */
import TelegramBot from 'node-telegram-bot-api';
import * as dotenv from 'dotenv';

// Load .env
dotenv.config();

// ─── Imports ───
import { registerBotCommands } from './admin-bot';
import { registerClaudeCommand } from './commands/claude-command';
import { registerThinkCommand } from './commands/think-command';
import { registerChatCommand } from './commands/chat-command';
import { registerPhotoCommand } from './commands/photo-command';
import { registerAutoloopCommand } from './commands/autoloop-command';
import { registerCallbacks } from './callbacks';
import { initChannels } from './channels';
import { initProactiveNotifications } from './proactive-notifications';
import { initDailyBrief } from './daily-brief';

// ─── Config ───
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '6238804698';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN manquant dans .env');
  process.exit(1);
}

// ─── Bot instance ───
let bot: TelegramBot;

export function startTelegramBot(): TelegramBot {
  if (bot) return bot;

  console.log('🤖 Démarrage du Freenzy Admin Bot...');

  bot = new TelegramBot(BOT_TOKEN!, { polling: true });

  // Prevent crash on polling errors
  bot.on('polling_error', (err) => {
    console.error('[Polling error]', err.message);
  });

  // Prevent crash on unhandled errors
  bot.on('error', (err) => {
    console.error('[Bot error]', err.message);
  });

  // Debug: log all received messages
  bot.on('message', (msg) => {
    console.log(`[Bot] Message reçu: chat_id=${msg.chat.id} text="${msg.text?.slice(0, 50)}"`);
    if (msg.chat.id.toString() !== ADMIN_CHAT_ID) {
      console.log(`[Security] Message ignoré de chat_id=${msg.chat.id} (non admin)`);
    }
  });

  // 1. Channels system
  initChannels(bot);

  // 2. Main bot commands (Feature 1)
  registerBotCommands(bot, ADMIN_CHAT_ID);

  // 3. /claude with progress (Feature 2)
  registerClaudeCommand(bot, ADMIN_CHAT_ID);

  // 4. /think with Extended Thinking (Feature 3)
  registerThinkCommand(bot, ADMIN_CHAT_ID);

  // 5. /chat with memory (Feature 4)
  registerChatCommand(bot, ADMIN_CHAT_ID);

  // 6. Photo analysis (Feature 5)
  registerPhotoCommand(bot, ADMIN_CHAT_ID);

  // 7. /autoloop with budget tracking (Feature 12)
  registerAutoloopCommand(bot, ADMIN_CHAT_ID);

  // 8. Inline callbacks (Feature 9)
  registerCallbacks(bot, ADMIN_CHAT_ID);

  // 8. Proactive notifications (Feature 10)
  initProactiveNotifications(bot, ADMIN_CHAT_ID);

  // 9. Daily CEO brief at 8h (Feature 11)
  initDailyBrief(bot, ADMIN_CHAT_ID);

  // ─── Startup message ───
  bot.sendMessage(ADMIN_CHAT_ID, [
    '🤖 *Freenzy Admin Bot — Démarré*',
    '',
    '✅ Commandes : /start /status /users /revenue /errors',
    '✅ Actions : /claude /think /chat /autoloop + photos',
    '✅ Validations : /pending /approve /reject',
    '✅ Système : /deploy /backup /report',
    '✅ Notifications proactives : activées',
    '✅ Brief quotidien 8h : activé',
    '',
    'Tape /start pour voir toutes les commandes.',
  ].join('\n'), { parse_mode: 'Markdown' }).catch(() => {});

  console.log('✅ Bot Telegram opérationnel');
  console.log(`   Admin Chat ID: ${ADMIN_CHAT_ID}`);
  console.log(`   Features: 12/12 actives`);

  // Graceful shutdown
  const shutdown = () => {
    console.log('🛑 Arrêt du bot...');
    bot.stopPolling();
    process.exit(0);
  };
  process.on('SIGINT', shutdown);
  process.on('SIGTERM', shutdown);

  return bot;
}

// ─── Direct execution ───
// If this file is run directly (not imported), start the bot
const isDirectExecution = require.main === module;
if (isDirectExecution) {
  startTelegramBot();
}

// ─── Re-exports for external use ───
export { TelegramChannels } from './channels';
export { notifyNewUser, notifyPayment, notifyCriticalError, notifyDiskSpace, notifyMilestone, checkMilestones } from './proactive-notifications';
export { Memory } from './memory';
export { sendBriefNow } from './daily-brief';
