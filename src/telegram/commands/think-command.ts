/**
 * FEATURE 3 — /think : Extended Thinking visible
 * Uses Claude Code CLI (Max subscription) instead of API credits
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';
import { TelegramStreamer, splitMessage } from '../utils/streaming';
import { Memory } from '../memory';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';

// Store last think result for callbacks
const lastThinkResults = new Map<string, { question: string; answer: string }>();

export function registerThinkCommand(bot: TelegramBot, adminChatId: string): void {
  bot.onText(/\/think (.+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const question = match?.[1]?.trim();
    if (!question) {
      await bot.sendMessage(msg.chat.id, '⚠️ Usage : `/think [question]`', { parse_mode: 'Markdown' });
      return;
    }

    const chatId = msg.chat.id.toString();
    const streamer = new TelegramStreamer(bot);
    await streamer.init(chatId, '🧠 Réflexion approfondie en cours... (30-60s)');

    try {
      const memory = await Memory.read();
      const memorySlice = memory.slice(0, 3000);

      const prompt = `Tu es l'assistant stratégique de Freenzy.io.
Tu connais tout du projet : stack (Next.js/PostgreSQL/Coolify/Hetzner),
positionnement (SaaS israélien PME françaises/belges, 0% commission),
les 120 agents, le système d'onboarding personnalisé, les automatisations.
Propriétaire : Emmanuel Smadja, Netanya, entrepreneur serial.
Sois direct, stratégique, et actionnable. Pas de fioriture.

MÉMOIRE PROJET :
${memorySlice}

QUESTION (réfléchis en profondeur avant de répondre) :
${question}`;

      // Use Claude Code CLI — execFile (no shell escaping issues)
      const assistantText = await new Promise<string>((resolve) => {
        const { execFile } = require('child_process');
        const claudePath = '/root/.nvm/versions/node/v22.22.1/bin/claude';
        execFile(claudePath, ['-p', prompt], {
          cwd: PROJECT_ROOT,
          env: { ...process.env, HOME: '/root' },
          timeout: 180000,
          maxBuffer: 1024 * 1024,
        }, (err: Error | null, stdout: string, stderr: string) => {
          if (err) {
            console.error('[Think] Claude Code error:', err.message);
            resolve(stderr || stdout || 'Erreur Claude Code.');
          } else {
            resolve(stdout.trim() || 'Pas de réponse.');
          }
        });
      });

      // Store for callbacks
      const resultId = Date.now().toString();
      lastThinkResults.set(chatId, { question, answer: assistantText });

      // Send response
      const answerFull = [
        `💡 *Analyse :* ${question}`,
        '',
        assistantText,
        '',
        `---`,
        `_Via Claude Code (Max subscription)_`,
      ].join('\n');

      const parts = splitMessage(answerFull);
      await streamer.finish(`🧠 *Réflexion terminée*\n\n_(${parts.length} partie${parts.length > 1 ? 's' : ''})_`);

      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const partLabel = parts.length > 1 ? `\n_(${i + 1}/${parts.length})_` : '';
        const text = parts[i] + partLabel;

        if (isLast) {
          try {
            await bot.sendMessage(chatId, text, {
              parse_mode: 'Markdown',
              reply_markup: {
                inline_keyboard: [
                  [
                    { text: '📋 Implémenter', callback_data: `implement_think_${resultId}` },
                    { text: '💾 Sauvegarder', callback_data: `save_memory_think_${resultId}` },
                    { text: '🔄 Approfondir', callback_data: `deepen_think_${resultId}` },
                  ],
                ],
              },
            });
          } catch {
            await bot.sendMessage(chatId, text);
          }
        } else {
          try {
            await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
          } catch {
            await bot.sendMessage(chatId, text);
          }
        }
      }

    } catch (err) {
      await streamer.error(`Erreur : ${err instanceof Error ? err.message : String(err)}`);
    }
  });
}

export function getLastThinkResult(chatId: string): { question: string; answer: string } | undefined {
  return lastThinkResults.get(chatId);
}
