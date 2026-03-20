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

// DB helper — uses dynamic container detection
async function findPgContainer(): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('docker', ['ps', '--format', '{{.Names}}', '--filter', 'name=freenzy-postgres']);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim().split('\n')[0] || ''));
    proc.on('error', () => resolve(''));
  });
}

async function dbQuery(sql: string): Promise<string> {
  const container = await findPgContainer();
  if (!container) return 'Error: PostgreSQL container not found';
  return new Promise((resolve) => {
    const proc = spawn('docker', ['exec', container, 'psql', '-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql]);
    let out = '';
    let err = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.stderr.on('data', (d: Buffer) => { err += d.toString(); });
    proc.on('error', (e: Error) => { resolve(`Error: ${e.message}`); });
    proc.on('close', (code) => {
      if (code !== 0 && err) resolve(`Error: ${err.trim()}`);
      else resolve(out.trim() || 'OK');
    });
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
        await dbQuery(`UPDATE agent_proposals SET status = 'approved', decided_by = 'emmanuel', decided_at = NOW() WHERE id = '${id}'`);
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

        const delay = parts[1] || '24h';
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

      if (data.startsWith('save_memory_photo_')) {
        const analysis = getLastAnalysis(chatId);
        if (analysis) {
          await Memory.save('photo_analysis', analysis.analysis.slice(0, 300));
          await bot.answerCallbackQuery(query.id, { text: '💾 Sauvegardé' });
          await bot.sendMessage(chatId, '💾 Analyse photo sauvegardée dans MEMORY.md');
        } else {
          await bot.answerCallbackQuery(query.id, { text: '⚠️ Analyse expirée' });
        }
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
        const email = parts[0] || '';
        const amount = parts[1] || '0';
        await dbQuery(`UPDATE wallets SET balance_credits = balance_credits + ${amount} WHERE user_id = (SELECT id FROM users WHERE email = '${email.replace(/'/g, "''")}')`);
        await dbQuery(`INSERT INTO wallet_transactions (id, wallet_id, user_id, type, amount, balance_after, description) SELECT gen_random_uuid(), w.id, w.user_id, 'deposit', ${amount}, w.balance_credits + ${amount}, 'admin manual' FROM wallets w JOIN users u ON w.user_id = u.id WHERE u.email = '${email.replace(/'/g, "''")}'`);
        await bot.answerCallbackQuery(query.id, { text: '✅ Crédits ajoutés' });
        await bot.sendMessage(chatId, `✅ ${amount} crédits ajoutés à ${email}`);
        return;
      }

      if (data.startsWith('confirm_broadcast_')) {
        await bot.answerCallbackQuery(query.id, { text: '📢 Envoi en cours...' });
        await bot.sendMessage(chatId, '📢 Broadcast envoyé à tous les users actifs.');
        return;
      }

      // ── Chat actions ──
      if (data === 'chat_continue') {
        await bot.answerCallbackQuery(query.id, { text: '💬 Continue la conversation...' });
        await bot.sendMessage(chatId, '💬 Envoie ton prochain message, je suis prêt !');
        return;
      }

      // ── Photo actions ──
      if (data.startsWith('fix_now_') || data.startsWith('generate_component_')) {
        const analysis = getLastAnalysis(chatId);
        if (analysis) {
          await bot.answerCallbackQuery(query.id, { text: '🔧 Lancement...' });
          const brief = analysis.type === 'bug'
            ? `Corrige ce bug: ${analysis.analysis.slice(0, 200)}`
            : `Génère le composant React: ${analysis.analysis.slice(0, 200)}`;
          simulateCommand(bot, chatId, `/claude ${brief}`, query.from);
        } else {
          await bot.answerCallbackQuery(query.id, { text: '⚠️ Analyse expirée' });
          await bot.sendMessage(chatId, '⚠️ L\'analyse photo a expiré. Renvoie la photo pour une nouvelle analyse.');
        }
        return;
      }

      if (data.startsWith('analyze_competitor_')) {
        const analysis = getLastAnalysis(chatId);
        if (analysis) {
          await bot.answerCallbackQuery(query.id, { text: '📊 Analyse en cours...' });
          simulateCommand(bot, chatId, `/think Analyse concurrentielle complète : ${analysis.analysis.slice(0, 300)}. Compare avec Freenzy.io et identifie les opportunités.`, query.from);
        } else {
          await bot.answerCallbackQuery(query.id, { text: '⚠️ Analyse expirée' });
        }
        return;
      }

      if (data.startsWith('respond_competitor_')) {
        const analysis = getLastAnalysis(chatId);
        if (analysis) {
          await bot.answerCallbackQuery(query.id, { text: '💡 Réflexion...' });
          simulateCommand(bot, chatId, `/think Propose une stratégie pour répondre à ce concurrent : ${analysis.analysis.slice(0, 300)}. Quelles fonctionnalités de Freenzy améliorer ?`, query.from);
        } else {
          await bot.answerCallbackQuery(query.id, { text: '⚠️ Analyse expirée' });
        }
        return;
      }

      if (data.startsWith('backlog_photo_')) {
        const analysis = getLastAnalysis(chatId);
        if (analysis) {
          const title = analysis.analysis.slice(0, 100).replace(/'/g, "''");
          await dbQuery(`INSERT INTO product_improvements (id, title, status, effort, impact, priority_score) VALUES (gen_random_uuid(), '${title}', 'proposed', 'M', 'M', 50)`);
          await bot.answerCallbackQuery(query.id, { text: '📋 Ajouté au backlog' });
          await bot.sendMessage(chatId, '📋 Ajouté au backlog produit.');
        } else {
          await bot.answerCallbackQuery(query.id, { text: '⚠️ Analyse expirée' });
        }
        return;
      }

      // ── Claude task actions ──
      if (data.startsWith('claude_details_')) {
        await bot.answerCallbackQuery(query.id);
        // Show git diff of recent changes
        const gitDiff = await new Promise<string>((resolve) => {
          const proc = spawn('bash', ['-c', `cd ${PROJECT_ROOT} && git diff --stat HEAD~1 2>&1 | head -30`]);
          let out = '';
          proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
          proc.stderr.on('data', (d: Buffer) => { out += d.toString(); });
          proc.on('close', () => resolve(out.trim() || 'Aucun changement détecté'));
          proc.on('error', () => resolve('❌ Impossible de lire les détails'));
        });
        await bot.sendMessage(chatId, `📊 *Détails du dernier changement :*\n\n\`\`\`\n${gitDiff.slice(0, 800)}\n\`\`\``, { parse_mode: 'Markdown' });
        return;
      }

      if (data.startsWith('retry_claude_')) {
        const instruction = decodeURIComponent(data.replace('retry_claude_', ''));
        await bot.answerCallbackQuery(query.id, { text: '🔄 Relancement...' });
        simulateCommand(bot, chatId, `/claude ${instruction}`, query.from);
        return;
      }

      // ── Revenue actions ──
      if (data.startsWith('revenue_')) {
        const period = data.replace('revenue_', '');
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, `/revenue ${period}`, query.from);
        return;
      }

      // ── Status actions ──
      if (data === 'status_details') {
        await bot.answerCallbackQuery(query.id);
        // Show detailed docker/system info
        const details = await new Promise<string>((resolve) => {
          const proc = spawn('bash', ['-c', `docker ps --format "{{.Names}}\\t{{.Status}}\\t{{.Size}}" 2>&1 | head -20`]);
          let out = '';
          proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
          proc.on('close', () => resolve(out.trim() || 'Aucun container'));
          proc.on('error', () => resolve('❌ Docker indisponible'));
        });
        await bot.sendMessage(chatId, `🐳 *Containers Docker :*\n\n\`\`\`\n${details.slice(0, 800)}\n\`\`\``, { parse_mode: 'Markdown' });
        return;
      }

      if (data === 'show_errors') {
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, '/errors', query.from);
        return;
      }

      // ── Daily brief actions ──
      if (data === 'handle_pending') {
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, '/pending', query.from);
        return;
      }

      if (data === 'implement_quickwin') {
        await bot.answerCallbackQuery(query.id, { text: '🔧 Recherche du quick win...' });
        const quickWin = await dbQuery(`
          SELECT title FROM product_improvements
          WHERE status IN ('proposed', 'approved') AND effort IN ('XS', 'S')
          ORDER BY priority_score DESC LIMIT 1
        `);
        if (quickWin && quickWin !== 'OK' && !quickWin.startsWith('Error')) {
          simulateCommand(bot, chatId, `/claude Implémente ce quick win: ${quickWin}`, query.from);
        } else {
          await bot.sendMessage(chatId, '✅ Aucun quick win en attente.');
        }
        return;
      }

      if (data === 'full_report') {
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, '/report', query.from);
        return;
      }

      // ── Teams actions ──
      if (data === 'teams_details' || data === 'teams_usage') {
        await bot.answerCallbackQuery(query.id);
        simulateCommand(bot, chatId, '/teams', query.from);
        return;
      }

      if (data.startsWith('team_add_credits_')) {
        const orgId = data.replace('team_add_credits_', '');
        await bot.answerCallbackQuery(query.id);
        await bot.sendMessage(chatId, `💳 Pour ajouter des crédits à l'équipe, utilise :\n\`/credits [email_owner] [montant]\`\n\nID Orga : \`${orgId}\``, { parse_mode: 'Markdown' });
        return;
      }

      if (data.startsWith('team_members_') || data.startsWith('team_settings_')) {
        const orgId = data.replace(/^team_(members|settings)_/, '');
        await bot.answerCallbackQuery(query.id);
        const members = await dbQuery(`
          SELECT u.display_name || ' (' || om.role || ')'
          FROM organization_members om JOIN users u ON om.user_id = u.id
          WHERE om.organization_id = '${orgId}'
        `);
        await bot.sendMessage(chatId, `👥 *Membres de l'équipe :*\n\n${members || 'Aucun membre'}`, { parse_mode: 'Markdown' });
        return;
      }

      // Unknown callback
      await bot.answerCallbackQuery(query.id, { text: '❓ Action non reconnue' });

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
        await dbQuery(`UPDATE agent_proposals SET status = 'denied', decided_by = 'emmanuel', decided_at = NOW(), decision_notes = '${reason.replace(/'/g, "''")}' WHERE id = '${id}'`);
        await bot.sendMessage(chatId, `❌ Action \`${id}\` refusée.\nRaison : ${reason}`, { parse_mode: 'Markdown' });
        pendingActions.delete(chatId);
        return;
      }
      pendingActions.delete(chatId);
    }

    // No pending action — treat as /chat message (conversation libre)
    console.log(`[Callbacks] Fallback → handleChat for: "${msg.text.slice(0, 50)}"`);
    try {
      await handleChat(bot, chatId, msg.text);
    } catch (chatErr) {
      console.error('[Callbacks] handleChat CRASHED:', chatErr instanceof Error ? chatErr.stack : chatErr);
      try {
        await bot.sendMessage(chatId, `❌ Erreur handleChat: ${chatErr instanceof Error ? chatErr.message : String(chatErr)}`);
      } catch { /* last resort */ }
    }
  });

  // Clean up expired pending actions every 5 min
  setInterval(() => {
    const now = Date.now();
    for (const [key, action] of pendingActions) {
      if (now > action.expiresAt) pendingActions.delete(key);
    }
  }, 300000);
}
