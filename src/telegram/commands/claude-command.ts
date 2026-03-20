/**
 * FEATURE 2 — /claude : Tâches avec progression en temps réel
 * Lance Claude Code en background, streame la progression via Telegram
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';
import { TelegramStreamer } from '../utils/streaming';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';

interface ClaudeTaskState {
  instruction: string;
  startTime: number;
  steps: string[];
  filesModified: number;
  status: 'running' | 'completed' | 'failed';
}

// Active tasks per chat
const activeTasks = new Map<string, ClaudeTaskState>();

function detectStep(line: string): string | null {
  const lower = line.toLowerCase();
  if (lower.includes('reading file') || lower.includes('read')) return '📖 Lecture des fichiers...';
  if (lower.includes('writing file') || lower.includes('creating') || lower.includes('write')) return '✏️ Modification du code...';
  if (lower.includes('bash') || lower.includes('running') || lower.includes('exec')) return '⚙️ Exécution de commandes...';
  if (lower.includes('git push') || lower.includes('git commit')) return '📦 Push vers GitHub...';
  if (lower.includes('error') || lower.includes('fail')) return '⚠️ Problème détecté, correction en cours...';
  if (lower.includes('grep') || lower.includes('search') || lower.includes('glob')) return '🔍 Recherche dans le code...';
  if (lower.includes('edit') || lower.includes('replace')) return '✏️ Édition de fichiers...';
  if (lower.includes('test') || lower.includes('jest')) return '🧪 Exécution des tests...';
  if (lower.includes('build') || lower.includes('compile') || lower.includes('tsc')) return '🏗️ Build en cours...';
  return null;
}

function formatProgress(state: ClaudeTaskState): string {
  const elapsed = Math.round((Date.now() - state.startTime) / 1000);
  const stepsText = state.steps
    .slice(-8) // Last 8 steps
    .map((s, i, arr) => i === arr.length - 1 ? s : `✅ ${s.replace(/^[📖✏️⚙️📦⚠️🔍🧪🏗️]\s*/, '')}`)
    .join('\n');

  return [
    '⏳ *Tâche en cours...*',
    '',
    `📋 ${state.instruction}`,
    `🕐 Démarré il y a ${elapsed}s`,
    '',
    stepsText || 'Initialisation...',
  ].join('\n');
}

export function registerClaudeCommand(bot: TelegramBot, adminChatId: string): void {
  // Handle /claude without arguments — show help
  bot.onText(/^\/claude$/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    await bot.sendMessage(msg.chat.id, `🤖 *Claude Code — Aide*

Donne une instruction à Claude Code pour exécuter une tâche sur le projet.

*Usage :* \`/claude [instruction]\`

*Exemples :*
• \`/claude ajoute un bouton contact sur la homepage\`
• \`/claude génère 3 articles blog SEO\`
• \`/claude corrige les bugs TypeScript\`
• \`/claude analyse les logs d'erreur\`
• \`/claude lance le build et corrige les erreurs\`

⏱ Timeout : 10 minutes max par tâche.`, { parse_mode: 'Markdown' });
  });

  bot.onText(/\/claude (.+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const instruction = match?.[1]?.trim();
    if (!instruction) {
      await bot.sendMessage(msg.chat.id, '⚠️ Usage : `/claude [instruction]`', { parse_mode: 'Markdown' });
      return;
    }
    console.log(`[/claude command] CALLED — instruction="${instruction.slice(0, 80)}"`);

    const chatId = msg.chat.id.toString();

    // Check if task already running (with 5min auto-expire for stuck tasks)
    const existing = activeTasks.get(chatId);
    if (existing?.status === 'running') {
      const elapsed = Date.now() - existing.startTime;
      if (elapsed < 300000) { // Less than 5 min — genuinely running
        await bot.sendMessage(msg.chat.id, '⚠️ Une tâche est déjà en cours. Attendez qu\'elle se termine.');
        return;
      }
      // Stuck task — clear it
      activeTasks.delete(chatId);
    }

    const state: ClaudeTaskState = {
      instruction,
      startTime: Date.now(),
      steps: ['Initialisation...'],
      filesModified: 0,
      status: 'running',
    };
    activeTasks.set(chatId, state);

    const streamer = new TelegramStreamer(bot, 2000);
    try {
      await streamer.init(chatId, formatProgress(state));
    } catch (initErr) {
      console.error('[/claude] streamer.init FAILED:', initErr instanceof Error ? initErr.message : initErr);
      activeTasks.delete(chatId);
      return;
    }

    try {
      console.log(`[/claude] Spawning bash with claude CLI for: "${instruction.slice(0, 60)}"`);
      const claude = spawn('bash', ['-c', `source /root/.nvm/nvm.sh && cd ${PROJECT_ROOT} && claude -p "${instruction.replace(/"/g, '\\"')}" --output-format stream-json 2>&1`], {
        cwd: PROJECT_ROOT,
        env: { ...process.env, HOME: '/root', PATH: `${process.env['PATH']}:/root/.nvm/versions/node/v22.22.1/bin`, ANTHROPIC_API_KEY: '' },
      });

      // Handle spawn failure
      claude.on('error', async (err) => {
        console.error('[/claude] spawn ERROR:', err.message);
        state.status = 'failed';
        activeTasks.delete(chatId);
        await streamer.error(`❌ Impossible de lancer Claude Code: ${err.message}`);
      });

      let output = '';
      let lastSummary = '';

      claude.stdout.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;

        // Parse stream-json lines
        for (const line of text.split('\n').filter(Boolean)) {
          try {
            const parsed = JSON.parse(line);
            // Detect tool use
            if (parsed.type === 'assistant' && parsed.message?.content) {
              for (const block of parsed.message.content) {
                if (block.type === 'tool_use') {
                  const step = detectStep(`${block.name} ${JSON.stringify(block.input || {}).slice(0, 100)}`);
                  if (step && state.steps[state.steps.length - 1] !== step) {
                    state.steps.push(step);
                  }
                }
                if (block.type === 'text' && block.text) {
                  lastSummary = block.text.slice(0, 500);
                }
              }
            }
            // Detect result
            if (parsed.type === 'result') {
              lastSummary = (parsed.result || '').slice(0, 500);
            }
          } catch {
            // Not JSON — detect steps from raw text
            const step = detectStep(line);
            if (step && state.steps[state.steps.length - 1] !== step) {
              state.steps.push(step);
            }
          }
        }

        // Count modified files from output
        const fileMatches = output.match(/(?:Writing|Creating|Editing|Edit)\s+(?:file\s+)?[`"]?([^\s`"]+)/gi);
        state.filesModified = fileMatches ? new Set(fileMatches).size : 0;

        // Update progress message
        streamer.update(formatProgress(state)).catch(() => {});
      });

      claude.stderr.on('data', (data: Buffer) => {
        output += data.toString();
      });

      claude.on('close', async (code) => {
        console.log(`[/claude] Process closed with code=${code}`);
        const elapsed = Math.round((Date.now() - state.startTime) / 1000);

        if (code === 0) {
          state.status = 'completed';
          const hasGitPush = output.includes('git push') || output.includes('Pushed to');
          const summary = lastSummary || output.slice(-400).trim();

          const finalMsg = [
            '✅ *Tâche terminée !*',
            '',
            `📋 ${instruction}`,
            `⏱ Durée : ${elapsed}s`,
            `📁 Fichiers modifiés : ${state.filesModified}`,
            '',
            'Résumé :',
            summary.slice(0, 800),
            '',
            hasGitPush ? '🚀 Déployé sur GitHub' : 'ℹ️ Pas de push automatique',
          ].join('\n');

          await streamer.finish(finalMsg, {
            inline_keyboard: [
              [
                { text: '📊 Détails', callback_data: `claude_details_${Date.now()}` },
                { text: '🔍 Vérifier', callback_data: `claude_verify_${Date.now()}` },
                { text: '🚀 Déployer', callback_data: `confirm_deploy` },
              ],
            ],
          });
        } else {
          state.status = 'failed';
          const errorLines = output.split('\n').filter(l => l.toLowerCase().includes('error')).slice(-3);
          const errorMsg = errorLines.join('\n') || 'Erreur inconnue';

          const finalMsg = [
            '❌ *Tâche échouée*',
            '',
            `📋 ${instruction}`,
            `⏱ Durée : ${elapsed}s`,
            '',
            `🔴 Erreur :\n${errorMsg.slice(0, 600)}`,
            '',
            '_Utilise 🔄 Réessayer ou reformule l\'instruction._',
          ].join('\n');

          await streamer.finish(finalMsg, {
            inline_keyboard: [
              [
                { text: '🔄 Réessayer', callback_data: `retry_claude_${encodeURIComponent(instruction).slice(0, 40)}` },
              ],
            ],
          });
        }

        activeTasks.delete(chatId);
      });

      // Timeout 10 min
      setTimeout(() => {
        if (state.status === 'running') {
          claude.kill('SIGTERM');
          state.status = 'failed';
          streamer.error('⏰ Timeout (10 min). Tâche annulée.').catch(() => {});
          activeTasks.delete(chatId);
        }
      }, 600000);

    } catch (err) {
      console.error('[/claude] CATCH block error:', err instanceof Error ? err.stack : err);
      state.status = 'failed';
      activeTasks.delete(chatId);
      try {
        await streamer.error(`Impossible de lancer Claude Code : ${err instanceof Error ? err.message : String(err)}`);
      } catch (streamerErr) {
        console.error('[/claude] streamer.error also failed:', streamerErr);
        try {
          await bot.sendMessage(chatId, `❌ Erreur /claude : ${err instanceof Error ? err.message : String(err)}`);
        } catch { /* last resort */ }
      }
    }
  });
}
