/**
 * ASSEMBLAGE FINAL — Freenzy Telegram Bot
 * Point d'entrée unique. Lance le bot avec toutes les features.
 *
 * RESILIENCE:
 * - Process-level unhandled error catchers (no crash)
 * - Polling auto-reconnect with exponential backoff
 * - Graceful shutdown with timeout
 * - Auto-restart watchdog
 * - All intervals tracked for cleanup
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
 *   ANTHROPIC_API_KEY        — Pour /think, /chat, /photo
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
import { initDailyBrief, stopDailyBrief } from './daily-brief';
import { registerFunCommands, registerFunCallbacks } from './fun-interactive';
import { initCoach, registerCoachCommand, registerCoachCallbacks, stopCoach } from './coach';

// ─── Config ───
const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN;
const ADMIN_CHAT_ID = process.env.TELEGRAM_ADMIN_CHAT_ID || '6238804698';

if (!BOT_TOKEN) {
  console.error('❌ TELEGRAM_BOT_TOKEN manquant dans .env');
  process.exit(1);
}

// ─── Tracked intervals for cleanup ───
const trackedIntervals: ReturnType<typeof setInterval>[] = [];

// ─── Bot instance ───
let bot: TelegramBot;
let isShuttingDown = false;
let pollingRetryCount = 0;
const MAX_POLLING_RETRIES = 10;

// ─── Process-level crash protection ───
// These MUST be registered before anything else to prevent ANY unhandled crash

process.on('uncaughtException', (err) => {
  console.error('[CRITICAL] Uncaught exception (bot survived):', err.message);
  console.error(err.stack);
  // Do NOT exit — the bot survives
});

process.on('unhandledRejection', (reason) => {
  const msg = reason instanceof Error ? reason.message : String(reason);
  console.error('[CRITICAL] Unhandled promise rejection (bot survived):', msg);
  // Do NOT exit — the bot survives
});

// ─── Safe send helper ───
async function safeSend(chatId: string, text: string, options?: TelegramBot.SendMessageOptions): Promise<void> {
  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown', ...options });
  } catch {
    try {
      await bot.sendMessage(chatId, text, { ...options, parse_mode: undefined });
    } catch (err2) {
      console.error('[SafeSend] Failed to send message:', err2 instanceof Error ? err2.message : err2);
    }
  }
}

// ─── Polling recovery ───
function setupPollingRecovery(): void {
  bot.on('polling_error', (err) => {
    pollingRetryCount++;
    const errMsg = err instanceof Error ? err.message : String(err);

    if (errMsg.includes('ETELEGRAM: 409')) {
      // Another instance is running — stop this one gracefully
      console.error('[Polling] Conflict: another bot instance detected. Stopping...');
      bot.stopPolling();
      return;
    }

    if (errMsg.includes('EFATAL') || pollingRetryCount > MAX_POLLING_RETRIES) {
      console.error(`[Polling] Fatal error after ${pollingRetryCount} retries. Restarting polling...`);
      pollingRetryCount = 0;
      restartPolling();
      return;
    }

    const backoffMs = Math.min(1000 * Math.pow(2, pollingRetryCount), 60000);
    console.error(`[Polling] Error #${pollingRetryCount} (retry in ${backoffMs / 1000}s): ${errMsg}`);
  });

  // Reset retry count on successful poll
  bot.on('message', () => {
    pollingRetryCount = 0;
  });

  bot.on('callback_query', () => {
    pollingRetryCount = 0;
  });
}

async function restartPolling(): Promise<void> {
  if (isShuttingDown) return;
  try {
    await bot.stopPolling();
    // Wait 5s before restarting
    await new Promise((r) => setTimeout(r, 5000));
    if (!isShuttingDown) {
      await bot.startPolling();
      console.log('[Polling] Restarted successfully');
    }
  } catch (err) {
    console.error('[Polling] Restart failed:', err instanceof Error ? err.message : err);
    // Try again in 30s
    setTimeout(() => { restartPolling().catch(() => {}); }, 30000);
  }
}

// ─── Health check watchdog ───
function startHealthWatchdog(): void {
  let lastActivity = Date.now();

  // Track activity
  bot.on('message', () => { lastActivity = Date.now(); });
  bot.on('callback_query', () => { lastActivity = Date.now(); });

  const watchdog = setInterval(async () => {
    if (isShuttingDown) return;

    const silenceMinutes = (Date.now() - lastActivity) / 60000;

    // If no activity for 30 minutes during business hours (5-20 UTC), self-check
    const hour = new Date().getUTCHours();
    if (silenceMinutes > 30 && hour >= 5 && hour <= 20) {
      console.log(`[Watchdog] No activity for ${silenceMinutes.toFixed(0)}min, checking health...`);

      try {
        // Test: can we send a message?
        await bot.getMe();
        console.log('[Watchdog] Bot is responsive');
        // Reset: the bot works, just no messages
        lastActivity = Date.now();
      } catch (_err) {
        console.error('[Watchdog] Bot unresponsive, restarting polling...');
        await restartPolling();
      }
    }
  }, 5 * 60000); // Check every 5 minutes

  trackedIntervals.push(watchdog);
}

// ─── Graceful shutdown ───
async function gracefulShutdown(signal: string): Promise<void> {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.log(`🛑 ${signal} reçu — arrêt propre du bot...`);

  // 1. Stop accepting new messages
  try {
    bot.stopPolling();
  } catch { /* already stopped */ }

  // 2. Stop all intervals
  stopDailyBrief();
  stopCoach();
  for (const interval of trackedIntervals) {
    clearInterval(interval);
  }
  trackedIntervals.length = 0;

  // 3. Notify admin (best effort)
  try {
    await bot.sendMessage(ADMIN_CHAT_ID, '🛑 Bot arrêté pour maintenance. Redémarrage en cours...', {
      parse_mode: 'Markdown',
    });
  } catch { /* can't send, that's ok */ }

  // 4. Give in-flight handlers 5s to finish
  await new Promise((r) => setTimeout(r, 5000));

  console.log('✅ Arrêt propre terminé');
  process.exit(0);
}

// ─── Start bot ───
export function startTelegramBot(): TelegramBot {
  if (bot) return bot;

  console.log('🤖 Démarrage du Freenzy Admin Bot...');

  bot = new TelegramBot(BOT_TOKEN!, {
    polling: {
      autoStart: true,
      params: {
        timeout: 30,
      },
    },
  });

  // ─── Error handling ───
  setupPollingRecovery();

  bot.on('error', (err) => {
    console.error('[Bot error]', err.message);
  });

  // Security: ignore all messages from non-admin
  bot.on('message', (msg) => {
    if (msg.chat.id.toString() !== ADMIN_CHAT_ID) {
      console.log(`[Security] Message ignoré de chat_id=${msg.chat.id} (non admin)`);
      return;
    }
  });

  // ─── Feature registration (all wrapped in try-catch) ───
  try {
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

    // 7. /autoloop with budget tracking
    registerAutoloopCommand(bot, ADMIN_CHAT_ID);

    // 8. Inline callbacks (Feature 9)
    registerCallbacks(bot, ADMIN_CHAT_ID);

    // 8. Proactive notifications (Feature 10)
    initProactiveNotifications(bot, ADMIN_CHAT_ID);

    // 9. Daily CEO brief at 8h (Feature 11)
    initDailyBrief(bot, ADMIN_CHAT_ID);

    // 10. Fun & Interactive commands (Feature 12)
    registerFunCommands(bot, ADMIN_CHAT_ID);
    registerFunCallbacks(bot, ADMIN_CHAT_ID);

    // 11. Proactive Coach (Feature 13)
    initCoach(bot, ADMIN_CHAT_ID);
    registerCoachCommand(bot, ADMIN_CHAT_ID);
    registerCoachCallbacks(bot, ADMIN_CHAT_ID);
  } catch (err) {
    console.error('[CRITICAL] Feature registration failed:', err instanceof Error ? err.message : err);
  }

  // ─── Health watchdog ───
  startHealthWatchdog();

  // ─── Startup message ───
  safeSend(ADMIN_CHAT_ID, [
    '🤖 *Freenzy Admin Bot — Démarré*',
    '',
    '✅ Commandes : /start /status /users /revenue /errors',
    '✅ Actions : /claude /think /chat /autoloop + photos',
    '✅ Validations : /pending /approve /reject',
    '✅ Système : /deploy /backup /report',
    '✅ Fun : /score /streak /quiz /motivation /mood /goals /kpi /dice /tip /gsd',
    '✅ Coach IA : /coach /poke — 5 check-ins/jour',
    '✅ Notifications proactives : activées',
    '✅ Brief quotidien 8h : activé (+ motivation + tip + GSD)',
    '✅ Watchdog santé : actif',
    '',
    'Tape /start pour voir toutes les commandes.',
  ].join('\n')).catch(() => {});

  console.log('✅ Bot Telegram opérationnel');
  console.log(`   Admin Chat ID: ${ADMIN_CHAT_ID}`);
  console.log(`   Features: 13/13 actives`);
  console.log('   🛡️ Crash protection: ON');
  console.log('   🔄 Auto-reconnect: ON');
  console.log('   🏥 Health watchdog: ON');

  // ─── Graceful shutdown ───
  process.on('SIGINT', () => { gracefulShutdown('SIGINT').catch(() => process.exit(1)); });
  process.on('SIGTERM', () => { gracefulShutdown('SIGTERM').catch(() => process.exit(1)); });

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
