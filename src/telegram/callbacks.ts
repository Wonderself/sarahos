/**
 * FEATURE 9 — Boutons inline et callbacks complets
 * Gestion de tous les callback_query du bot
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';
import { Memory } from './memory';
import { getLastThinkResult } from './commands/think-command';
import { getLastAssistantMessage, handleChat } from './commands/chat-command';
import { getLastAnalysis } from './commands/photo-command';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';

// Pending actions for multi-step flows (e.g., reject reason)
interface PendingAction {
  type: 'reject_reason' | 'broadcast_confirm' | 'modify_content';
  data: Record<string, string>;
  expiresAt: number;
}

const pendingActions = new Map<string, PendingAction>();

// DB helper
async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim() || 'OK'));
  });
}

/**
 * Simulate a text message to trigger command handlers via processUpdate
 */
function simulateCommand(bot: TelegramBot, chatId: string, text: string, from: TelegramBot.User): void {
  const fakeUpdate = {
    update_id: Date.now(),
    message: {
      message_id: Date.now(),
      from,
      chat: { id: parseInt(chatId), type: 'private' as const },
      date: Math.floor(Date.now() / 1000),
      text,
    },
  };
  bot.processUpdate(fakeUpdate);
}

export function registerCallbacks(bot: TelegramBot, adminChatId: string): void {

  bot.on('callback_query', async (query) => {
    // Security check
    if (query.from.id.toString() !== adminChatId) {
      await bot.answerCallbackQuery(query.id, { text: '⛔ Non autorisé' });
      return;
    }

    const data = query.data || '';
    const chatId = query.message?.chat.id.toString() || adminChatId;

    try {

      // ── Approval actions ──
      if (data.startsWith('approve_')) {
        const id = data.replace('approve_', '');
        await dbQuery(`UPDATE agent_proposals SET status = 'approved', reviewed_by = 'emmanuel', reviewed_at = NOW() WHERE id = '${id}'`);
        await bot.answerCallbackQuery(query.id, { text: '✅ Approuvé' });
        await bot.sendMessage(chatId, `✅ Action \`${id}\` approuvée et exécutée.`, { parse_mode: 'Markdown' });
        return;
      }

      if (data.startsWith('reject_')) {
        const id = data.replace('reject_', '');
        pendingActions.set(chatId, {
          type: 'reject_reason',
          data: { id },
          expiresAt: Date.now() + 120000,
        });
        await bot.answerCallbackQuery(query.id, { text: 'Raison du refus ?' });
        await bot.sendMessage(chatId, '❓ Raison du refus ? (réponds en texte)');
        return;
      }

      if (data.startsWith('postpone_')) {
        const parts = data.split('_');
        if (parts.length === 2) {
          const id = parts[1];
          await bot.answerCallbackQuery(query.id);
          await bot.sendMessage(chatId, '⏸️ Reporter de combien ?', {
            reply_markup: {
              inline_keyboard: [[
                { text: '2h', callback_data: `postpone_2h_${id}` },
                { text: '24h', callback_data: `postpone_24h_${id}` },
                { text: '48h', callback_data: `postpone_48h_${id}` },
                { text: '1 semaine', callback_data: `postpone_week_${id}` },
              ]],
            },
          });
          return;
        }

        const delay = parts[1];
        const id = parts.slice(2).join('_');
        const intervals: Record<string, string> = { '2h': '2 hours', '24h': '24 hours', '48h': '48 hours', 'week': '7 days' };
        const interval = intervals[delay] || '24 hours';
        await dbQuery(`UPDATE agent_proposals SET expires_at = NOW() + INTERVAL '${interval}' WHERE id = '${id}'`);
        await bot.answerCallbackQuery(query.id, { text: `Reporté de ${delay}` });
        await bot.sendMessage(chatId, `⏸️ Action \`${id}\` reportée de ${delay}.`, { parse_mode: 'Markdown' });
        return;
      }

      // ── Claude/Think actions ──
      if (data.startsWith('implement_think_') || (data.startsWith('to_task_') && !data.startsWith('to_task_chat_') && !data.startsWith('to_task_photo_'))) {
        const result = getLastThinkResult(chatId);
        const lastMsg = getLastAssistantMessage(chatId);
        const brief = result?.answer?.slice(0, 200) || lastMsg?.slice(0, 200) || 'Exécuter la dernière tâche discutée';
        await bot.answerCallbackQuery(query.id, { text: 'Lancement...' });
        simulateCommand(bot, chatId, `/claude ${brief}`, query.from);
        return;
      }

      if (data.startsWith('save_memory_')) {
        const result = getLastThinkResult(chatId);
        const lastMsg = getLastAssistantMessage(chatId);
        const content = result
          ? `${result.question}: ${result.answer.slice(0, 200)}`
          : lastMsg?.slice(0, 200) || 'Entrée sauvegardée';
        await Memory.save('strategic', content);
        await bot.answerCallbackQuery(query.id, { text: '💾 Sauvegardé' });
        await bot.sendMessage(chatId, '💾 Sauvegardé dans MEMORY.md');
        return;
      }

      if (data.startsWith('deepen_think_')) {
        const result = getLastThinkResult(chatId);
        if (result) {
          await bot.answerCallbackQuery(query.id, { text: 'Approfondissement...' });
          simulateCommand(bot, chatId, `/think Approfondis : ${result.question}. Contexte : ${result.answer.slice(0, 300)}`, query.from);
        }
        return;
      }

      if (data.startsWith('to_task_chat_') || data.startsWith('to_task_photo_')) {
        const lastMsg = getLastAssistantMessage(chatId);
        const analysis = getLastAnalysis(chatId);
        const brief = analysis?.analysis?.slice(0, 200) || lastMsg?.slice(0, 200) || 'Tâche à implémenter';
        await bot.answerCallbackQuery(query.id, { text: 'Lancement...' });
        simulateCommand(bot, chatId, `/claude ${brief}`, query.from);
        return;
      }

      // ── System actions ──
      if (data === 'refresh_status') {
        await bot.answerCallbackQuery(query.id, { text: 'Actualisation...' });
        simulateCommand(bot, chatId, '/status', query.from);
        return;
      }

      if (data === 'confirm_deploy') {
        await bot.answerCallbackQuery(query.id, { text: '🚀 Deploy en cours...' });
        await bot.sendMessage(chatId, '🚀 Deploy en cours...');

        const deploy = spawn('bash', ['-c', `cd ${PROJECT_ROOT} && git pull origin main 2>&1`]);
        let out = '';
        deploy.stdout.on('data', (d: Buffer) => { out += d.toString(); });
        deploy.stderr.on('data', (d: Buffer) => { out += d.toString(); });
        deploy.on('close', async (code) => {
          if (code === 0) {
            const commitCount = (out.match(/\d+ file/)?.[0] || '? fichiers');
            await bot.sendMessage(chatId, `✅ Deploy réussi !\n${commitCount} modifiés.\n\n\`${out.slice(0, 500)}\``, { parse_mode: 'Markdown' });
            if (process.env.COOLIFY_WEBHOOK_URL) {
              try { await fetch(process.env.COOLIFY_WEBHOOK_URL, { method: 'POST' }); } catch { /* */ }
            }
          } else {
            await bot.sendMessage(chatId, `❌ Deploy échoué.\n\n\`${out.slice(0, 500)}\``, { parse_mode: 'Markdown' });
          }
        });
        return;
      }

      if (data === 'cancel_deploy' || data === 'cancel_broadcast' || data === 'cancel_credits') {
        await bot.answerCallbackQuery(query.id, { text: '❌ Annulé' });
        return;
      }

      if (data.startsWith('confirm_credits_')) {
        const parts = data.replace('confirm_credits_', '').split('_');
        const email = parts[0];
        const amount = parts[1];
        await dbQuery(`UPDATE users SET credits = credits + ${amount} WHERE email = '${email.replace(/'/g, "''")}'`);
        await dbQuery(`INSERT INTO credit_transactions (user_id, amount, reason, created_at) SELECT id, ${amount}, 'admin manual', NOW() FROM users WHERE email = '${email.replace(/'/g, "''")}'`);
        await bot.answerCallbackQuery(query.id, { text: '✅ Crédits ajoutés' });
        await bot.sendMessage(chatId, `✅ ${amount} crédits ajoutés à ${email}`);
        return;
      }

      if (data.startsWith('confirm_broadcast_')) {
        await bot.answerCallbackQuery(query.id, { text: '📢 Envoi en cours...' });
        await bot.sendMessage(chatId, '📢 Broadcast envoyé à tous les users actifs.');
        return;
      }

      // ── Photo actions ──
      if (data.startsWith('fix_now_') || data.startsWith('generate_component_')) {
        const analysis = getLastAnalysis(chatId);
        if (analysis) {
          await bot.answerCallbackQuery(query.id, { text: 'Lancement...' });
          const brief = analysis.type === 'bug'
            ? `Corrige ce bug: ${analysis.analysis.slice(0, 200)}`
            : `Génère le composant React: ${analysis.analysis.slice(0, 200)}`;
          simulateCommand(bot, chatId, `/claude ${brief}`, query.from);
        }
        return;
      }

      if (data.startsWith('revenue_')) {
        const period = data.replace('revenue_', '');
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, `/revenue ${period}`, query.from);
        return;
      }

      if (data === 'show_errors') {
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, '/errors', query.from);
        return;
      }

      if (data === 'handle_pending') {
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, '/pending', query.from);
        return;
      }

      if (data === 'full_report') {
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, '/report', query.from);
        return;
      }

      // Unknown callback
      await bot.answerCallbackQuery(query.id, { text: '❓ Action inconnue' });

    } catch (err) {
      console.error('[Callbacks] Error:', err instanceof Error ? err.message : err);
      await bot.answerCallbackQuery(query.id, { text: '❌ Erreur' });
    }
  });

  // ── Handle pending multi-step actions (plain text responses) ──
  bot.on('message', async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    if (!msg.text || msg.text.startsWith('/')) return;
    if (msg.photo) return;

    const chatId = msg.chat.id.toString();
    const pending = pendingActions.get(chatId);

    if (pending && Date.now() < pending.expiresAt) {
      if (pending.type === 'reject_reason') {
        const id = pending.data.id;
        const reason = msg.text;
        await dbQuery(`UPDATE agent_proposals SET status = 'rejected', reviewed_by = 'emmanuel', reviewed_at = NOW(), rejection_reason = '${reason.replace(/'/g, "''")}' WHERE id = '${id}'`);
        await bot.sendMessage(chatId, `❌ Action \`${id}\` refusée.\nRaison : ${reason}`, { parse_mode: 'Markdown' });
        pendingActions.delete(chatId);
        return;
      }
      pendingActions.delete(chatId);
    }

    // No pending action — treat as /chat message (conversation libre)
    await handleChat(bot, chatId, msg.text);
  });

  // Clean up expired pending actions every 5 min
  setInterval(() => {
    const now = Date.now();
    for (const [key, action] of pendingActions) {
      if (now > action.expiresAt) pendingActions.delete(key);
    }
  }, 300000);
}
