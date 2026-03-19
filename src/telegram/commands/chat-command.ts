/**
 * FEATURE 4 — /chat : Conversation avec mémoire
 * Claude Sonnet avec historique, contexte projet injecté, streaming live
 */
import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import { TelegramStreamer, splitMessage } from '../utils/streaming';
import { Memory } from '../memory';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';
const MAX_HISTORY = 20;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Conversation history per chat
const conversationHistory = new Map<string, ChatMessage[]>();

function loadProjectContext(): string {
  try {
    const claudeMdPath = path.join(PROJECT_ROOT, 'CLAUDE.md');
    if (fs.existsSync(claudeMdPath)) {
      const content = fs.readFileSync(claudeMdPath, 'utf-8');
      // Limit to ~2000 tokens ≈ 8000 chars
      return content.slice(0, 8000);
    }
  } catch { /* */ }
  return 'Fichier CLAUDE.md non trouvé.';
}

function loadRecentLogs(): string {
  try {
    const logPath = '/root/logs/main.log';
    if (fs.existsSync(logPath)) {
      const content = fs.readFileSync(logPath, 'utf-8');
      const lines = content.split('\n').filter(Boolean);
      return lines.slice(-5).join('\n');
    }
  } catch { /* */ }
  return 'Pas de logs récents.';
}

function buildSystemPrompt(memory: string): string {
  const projectCtx = loadProjectContext();
  const recentLogs = loadRecentLogs();
  const now = new Date().toISOString();

  return `Tu es l'assistant de Emmanuel Smadja, fondateur de Freenzy.io.

CONTEXTE PROJET :
${projectCtx}

MÉMOIRE PROJET :
${memory.slice(0, 3000)}

LOGS RÉCENTS :
${recentLogs}

DATE ET HEURE : ${now}

TON RÔLE :
- Répondre aux questions sur Freenzy avec précision
- Proposer des idées en accord avec la vision du produit
- Ne JAMAIS modifier de fichiers en mode /chat (c'est le rôle de /claude)
- Être direct, concis, stratégique
- Répondre en français sauf si Emmanuel écrit en anglais`;
}

export function registerChatCommand(bot: TelegramBot, adminChatId: string): void {
  // /chat [message] command
  bot.onText(/\/chat (.+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const message = match?.[1]?.trim();
    if (!message) return;
    await handleChat(bot, msg.chat.id.toString(), message);
  });
}

/**
 * Handle a chat message (can be called from /chat or fallback text handler)
 */
export async function handleChat(bot: TelegramBot, chatId: string, message: string): Promise<void> {
  // Get or create history
  if (!conversationHistory.has(chatId)) {
    conversationHistory.set(chatId, []);
  }
  const history = conversationHistory.get(chatId)!;

  // Add user message
  history.push({ role: 'user', content: message });

  // Trim history to MAX_HISTORY
  while (history.length > MAX_HISTORY) {
    history.shift();
  }

  const streamer = new TelegramStreamer(bot, 800);
  await streamer.init(chatId, '💬 ...');

  try {
    const memory = await Memory.read();
    const systemPrompt = buildSystemPrompt(memory);

    // Build context with recent history for Claude Code CLI
    const historyContext = history.slice(-6).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\nHistorique récent:\n${historyContext}\n\nRéponds au dernier message de l'utilisateur. Sois concis et utile. Ne modifie aucun fichier.`;

    // Use Claude Code CLI (uses Max subscription, not API credits)
    const assistantText = await new Promise<string>((resolve) => {
      const { spawn: spawnProc } = require('child_process');
      const proc = spawnProc('bash', ['-c', `source /root/.nvm/nvm.sh && claude -p "${fullPrompt.replace(/"/g, '\\"').replace(/\$/g, '\\$')}" 2>&1`], {
        cwd: PROJECT_ROOT,
        env: { ...process.env, HOME: '/root', PATH: `${process.env['PATH']}:/root/.nvm/versions/node/v22.22.1/bin` },
        timeout: 120000,
      });
      let output = '';
      proc.stdout.on('data', (d: Buffer) => { output += d.toString(); });
      proc.stderr.on('data', (d: Buffer) => { output += d.toString(); });
      proc.on('close', () => resolve(output.trim() || 'Pas de réponse.'));
      proc.on('error', () => resolve('Erreur: impossible de lancer Claude Code.'));
    });

    // Add assistant response to history
    history.push({ role: 'assistant', content: assistantText });

    // Detect action intent
    const actionWords = ['fais', 'crée', 'modifie', 'corrige', 'déploie', 'génère', 'ajoute', 'supprime', 'installe'];
    const hasActionIntent = actionWords.some(w => message.toLowerCase().includes(w));
    const actionHint = hasActionIntent
      ? '\n\n💡 _Tu veux que j\'agisse ? Utilise_ `/claude [instruction]` _pour que j\'exécute ça._'
      : '';

    const fullResponse = assistantText + actionHint;

    // Helper: send message with Markdown fallback to plain text
    const safeSend = async (cid: string, text: string, opts?: TelegramBot.SendMessageOptions): Promise<void> => {
      try {
        await bot.sendMessage(cid, text, { parse_mode: 'Markdown', ...opts });
      } catch {
        await bot.sendMessage(cid, text, { ...opts, parse_mode: undefined });
      }
    };

    // Send response (split if needed)
    const chatButtons: TelegramBot.InlineKeyboardMarkup = {
      inline_keyboard: [
        [
          { text: '🔄 Continuer', callback_data: 'chat_continue' },
          { text: '📋 → Tâche', callback_data: `to_task_chat_${Date.now()}` },
          { text: '💾 Sauvegarder', callback_data: `save_memory_chat_${Date.now()}` },
        ],
      ],
    };

    const parts: string[] = splitMessage(fullResponse);
    if (parts.length === 1) {
      await streamer.finish(parts[0] ?? '', chatButtons);
    } else {
      await streamer.finish(parts[0] ?? '');
      for (let i = 1; i < parts.length; i++) {
        const isLast = i === parts.length - 1;
        const part = parts[i] ?? '';
        if (isLast) {
          await safeSend(chatId, part, { reply_markup: chatButtons });
        } else {
          await safeSend(chatId, part);
        }
      }
    }
  } catch (err) {
    await streamer.error(`Erreur chat : ${err instanceof Error ? err.message : String(err)}`);
  }
}

/**
 * Reset conversation history for a chat
 */
export function resetHistory(chatId: string): void {
  conversationHistory.delete(chatId);
}

/**
 * Get last assistant message for a chat (used by callbacks)
 */
export function getLastAssistantMessage(chatId: string): string | null {
  const history = conversationHistory.get(chatId);
  if (!history) return null;
  for (let i = history.length - 1; i >= 0; i--) {
    const msg = history[i];
    if (msg && msg.role === 'assistant') return msg.content;
  }
  return null;
}
