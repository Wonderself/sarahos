/**
 * FEATURE 3 — /think : Extended Thinking visible
 * Appelle Claude Opus avec extended thinking, affiche le raisonnement
 */
import TelegramBot from 'node-telegram-bot-api';
import { TelegramStreamer, splitMessage } from '../utils/streaming';
import { Memory } from '../memory';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

interface ThinkingBlock {
  type: 'thinking';
  thinking: string;
}

interface TextBlock {
  type: 'text';
  text: string;
}

type ContentBlock = ThinkingBlock | TextBlock;

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

    if (!ANTHROPIC_API_KEY) {
      await bot.sendMessage(msg.chat.id, '⚠️ `ANTHROPIC_API_KEY` non configurée.', { parse_mode: 'Markdown' });
      return;
    }

    const chatId = msg.chat.id.toString();
    const streamer = new TelegramStreamer(bot);
    await streamer.init(chatId, '🧠 Réflexion approfondie en cours... (30-60s)');

    try {
      // Load memory for context
      const memory = await Memory.read();

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
          'anthropic-beta': 'interleaved-thinking-2025-05-14',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 16000,
          thinking: { type: 'enabled', budget_tokens: 10000 },
          system: `Tu es l'assistant stratégique de Freenzy.io.
Tu connais tout du projet : stack (Next.js/PostgreSQL/Coolify/Hetzner),
positionnement (SaaS israélien PME françaises/belges, 0% commission),
les 120 agents, le système d'onboarding personnalisé, les automatisations.
Propriétaire : Emmanuel Smadja, Netanya, entrepreneur serial.
Sois direct, stratégique, et actionnable. Pas de fioriture.

MÉMOIRE PROJET :
${memory.slice(0, 3000)}`,
          messages: [{ role: 'user', content: question }],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await response.json() as { content: ContentBlock[]; usage?: { input_tokens?: number; output_tokens?: number } };

      // Parse thinking and text blocks
      let thinkingText = '';
      let answerText = '';
      let thinkingTokens = 0;

      for (const block of data.content) {
        if (block.type === 'thinking') {
          thinkingText += block.thinking;
          thinkingTokens += block.thinking.length; // approximate
        } else if (block.type === 'text') {
          answerText += block.text;
        }
      }

      // Estimate thinking tokens more accurately
      thinkingTokens = Math.round(thinkingTokens / 4);

      // Store for callbacks
      const resultId = Date.now().toString();
      lastThinkResults.set(chatId, { question, answer: answerText });

      // Message 1 — Raisonnement (résumé)
      const thinkingSummary = thinkingText.slice(0, 300) + (thinkingText.length > 300 ? '...' : '');
      const thinkMsg = [
        '🧠 *Raisonnement de Claude*',
        '',
        thinkingSummary,
        '',
        `_(Pensée complète : ~${thinkingTokens} tokens)_`,
      ].join('\n');

      await streamer.finish(thinkMsg);

      // Message 2+ — Réponse finale (split if needed)
      const answerFull = [
        `💡 *Analyse :* ${question}`,
        '',
        answerText,
        '',
        `---`,
        `_Modèle : claude-opus-4-6 • Tokens thinking : ~${thinkingTokens}_`,
      ].join('\n');

      const parts = splitMessage(answerFull);
      for (let i = 0; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const partLabel = parts.length > 1 ? `\n_(${i + 1}/${parts.length})_` : '';
        const text = parts[i] + partLabel;

        if (isLast) {
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
        } else {
          await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
        }
      }

    } catch (err) {
      await streamer.error(`Erreur Extended Thinking : ${err instanceof Error ? err.message : String(err)}`);
    }
  });
}

export function getLastThinkResult(chatId: string): { question: string; answer: string } | undefined {
  return lastThinkResults.get(chatId);
}
