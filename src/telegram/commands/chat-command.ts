/**
 * FEATURE 4 — /chat : Conversation avec mémoire
 * Claude Sonnet avec historique, contexte projet injecté, streaming live
 */
import TelegramBot from 'node-telegram-bot-api';
import * as fs from 'fs';
import * as path from 'path';
import { TelegramStreamer, splitMessage } from '../utils/streaming';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';
const MAX_HISTORY = 20;

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

// Conversation history per chat
const conversationHistory = new Map<string, ChatMessage[]>();

// Cache the context file (reloaded every 5 min)
let contextCache = '';
let contextLoadedAt = 0;

function loadContext(): string {
  const now = Date.now();
  if (contextCache && now - contextLoadedAt < 300000) return contextCache; // 5 min cache
  try {
    const ctxPath = path.join(PROJECT_ROOT, 'TELEGRAM-CONTEXT.md');
    if (fs.existsSync(ctxPath)) {
      contextCache = fs.readFileSync(ctxPath, 'utf-8').trim();
      contextLoadedAt = now;
      return contextCache;
    }
  } catch { /* ignore */ }
  return 'Freenzy.io = OS IA multi-agents. 136 agents, Next.js, PostgreSQL, Hetzner.';
}

function buildSystemPrompt(): string {
  const context = loadContext();
  return `Tu es l'assistant Telegram d'Emmanuel Smadja, CEO de Freenzy.io.\n\n${context}\n\nRègles : Sois direct, concis, stratégique, en français. Pour modifier du code → /claude. Pour réfléchir → /think.`;
}

export function registerChatCommand(bot: TelegramBot, adminChatId: string): void {
  // /chat [message] command
  bot.onText(/\/chat (.+)/i, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const message = match?.[1]?.trim();
    if (!message) return;
    console.log(`[/chat command] message="${message.slice(0, 50)}"`);
    try {
      await handleChat(bot, msg.chat.id.toString(), message);
    } catch (err) {
      console.error('[/chat command] handleChat CRASHED:', err instanceof Error ? err.stack : err);
      try {
        await bot.sendMessage(msg.chat.id, `❌ Erreur /chat: ${err instanceof Error ? err.message : String(err)}`);
      } catch { /* last resort */ }
    }
  });
}

/**
 * Handle a chat message (can be called from /chat or fallback text handler)
 */
export async function handleChat(bot: TelegramBot, chatId: string, message: string): Promise<void> {
  console.log(`[handleChat] CALLED — chatId=${chatId} message="${message.slice(0, 80)}"`);

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
  try {
    await streamer.init(chatId, '💬 ...');
  } catch (initErr) {
    console.error('[handleChat] streamer.init FAILED:', initErr instanceof Error ? initErr.message : initErr);
    // Try to send a plain message as fallback
    try {
      await bot.sendMessage(chatId, '💬 Traitement en cours...');
    } catch (sendErr) {
      console.error('[handleChat] Even plain sendMessage failed:', sendErr instanceof Error ? sendErr.message : sendErr);
    }
    return;
  }

  try {
    const systemPrompt = buildSystemPrompt();

    // Build compact prompt — only last 3 messages for context
    const recentHistory = history.slice(-3).map(m => `${m.role === 'user' ? 'User' : 'Assistant'}: ${m.content.slice(0, 200)}`).join('\n');
    const fullPrompt = `${systemPrompt}\n\n${recentHistory ? `Historique:\n${recentHistory}\n\n` : ''}Réponds au dernier message. Sois concis.`;

    // Use Claude Code CLI via spawn + stdin pipe (no escaping issues)
    console.log(`[handleChat] Calling Claude Code CLI (prompt ${fullPrompt.length} chars)...`);
    const assistantText = await new Promise<string>((resolve) => {
      const { spawn: spawnProc } = require('child_process');
      const nvmBin = '/root/.nvm/versions/node/v22.22.1/bin';
      const proc = spawnProc(nvmBin + '/claude', ['-p', '-'], {
        cwd: PROJECT_ROOT,
        env: { ...process.env, HOME: '/root', PATH: `${nvmBin}:${process.env['PATH'] || '/usr/bin:/bin'}`, ANTHROPIC_API_KEY: '' },
        timeout: 120000,
        stdio: ['pipe', 'pipe', 'pipe'],
      });
      let stdout = '';
      let stderr = '';
      proc.stdout.on('data', (d: Buffer) => { stdout += d.toString(); });
      proc.stderr.on('data', (d: Buffer) => { stderr += d.toString(); });
      proc.on('close', (code: number) => {
        console.log(`[handleChat] Claude Code exited code=${code} stdout=${stdout.length} chars`);
        if (stderr) console.error('[handleChat] stderr:', stderr.slice(0, 300));
        resolve(stdout.trim() || stderr.trim() || 'Pas de réponse.');
      });
      proc.on('error', (err: Error) => {
        console.error('[handleChat] spawn error:', err.message);
        resolve('Erreur lancement Claude Code.');
      });
      // Send prompt via stdin
      proc.stdin.write(fullPrompt);
      proc.stdin.end();
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
    console.error('[handleChat] CATCH block error:', err instanceof Error ? err.stack : err);
    try {
      await streamer.error(`Erreur chat : ${err instanceof Error ? err.message : String(err)}`);
    } catch (streamerErr) {
      console.error('[handleChat] streamer.error also failed:', streamerErr);
      try {
        await bot.sendMessage(chatId, `❌ Erreur chat : ${err instanceof Error ? err.message : String(err)}`);
      } catch { /* last resort failed */ }
    }
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
