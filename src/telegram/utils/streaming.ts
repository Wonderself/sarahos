/**
 * FEATURE 6 — Streaming Live (effet live typing)
 * Utilitaire réutilisable pour toutes les commandes Telegram
 */
import TelegramBot from 'node-telegram-bot-api';

export class TelegramStreamer {
  private messageId: number = 0;
  private chatId: string = '';
  private buffer: string = '';
  private lastUpdate: number = 0;
  private updateInterval: number = 800; // ms
  private bot: TelegramBot;

  constructor(bot: TelegramBot, updateInterval = 800) {
    this.bot = bot;
    this.updateInterval = updateInterval;
  }

  async init(chatId: string, initialText: string): Promise<void> {
    this.chatId = chatId;
    this.buffer = initialText;
    const msg = await this.bot.sendMessage(chatId, initialText, { parse_mode: 'Markdown' });
    this.messageId = msg.message_id;
    this.lastUpdate = Date.now();
  }

  async append(text: string): Promise<void> {
    this.buffer += text;
    const now = Date.now();
    if (now - this.lastUpdate >= this.updateInterval) {
      await this.editMessage(this.buffer);
      this.lastUpdate = now;
    }
  }

  async update(text: string): Promise<void> {
    this.buffer = text;
    const now = Date.now();
    if (now - this.lastUpdate >= this.updateInterval) {
      await this.editMessage(this.buffer);
      this.lastUpdate = now;
    }
  }

  async finish(finalText: string, buttons?: TelegramBot.InlineKeyboardMarkup): Promise<void> {
    await this.editMessage(finalText, buttons);
  }

  async error(errorText: string): Promise<void> {
    const formatted = `❌ Erreur\n\n${errorText}`;
    await this.editMessage(formatted);
  }

  getMessageId(): number {
    return this.messageId;
  }

  private async editMessage(
    text: string,
    buttons?: TelegramBot.InlineKeyboardMarkup,
    retries = 3
  ): Promise<void> {
    for (let attempt = 0; attempt < retries; attempt++) {
      try {
        const opts: TelegramBot.EditMessageTextOptions = {
          chat_id: this.chatId,
          message_id: this.messageId,
          parse_mode: 'Markdown',
        };
        if (buttons) {
          opts.reply_markup = buttons;
        }
        await this.bot.editMessageText(text, opts);
        return;
      } catch (err: unknown) {
        const errMsg = err instanceof Error ? err.message : String(err);
        // "message is not modified" — content hasn't changed, ignore
        if (errMsg.includes('message is not modified')) return;
        // Rate limit — wait and retry
        if (errMsg.includes('Too Many Requests') || errMsg.includes('429')) {
          const waitMs = Math.min(1000 * Math.pow(2, attempt), 5000);
          await new Promise(r => setTimeout(r, waitMs));
          continue;
        }
        // Other errors — log and break
        console.error(`[TelegramStreamer] Edit failed (attempt ${attempt + 1}):`, errMsg);
        if (attempt === retries - 1) return;
        await new Promise(r => setTimeout(r, 500));
      }
    }
  }
}

/**
 * Split a long message into chunks for Telegram's 4096 char limit
 */
export function splitMessage(text: string, maxLen = 4000): string[] {
  if (text.length <= maxLen) return [text];
  const parts: string[] = [];
  let remaining = text;
  while (remaining.length > 0) {
    if (remaining.length <= maxLen) {
      parts.push(remaining);
      break;
    }
    // Try to split at newline
    let splitIdx = remaining.lastIndexOf('\n', maxLen);
    if (splitIdx < maxLen * 0.5) splitIdx = maxLen;
    parts.push(remaining.slice(0, splitIdx));
    remaining = remaining.slice(splitIdx).trimStart();
  }
  return parts;
}
