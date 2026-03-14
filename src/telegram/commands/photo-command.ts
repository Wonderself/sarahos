/**
 * FEATURE 5 — /photo : Analyse d'image et action
 * Détecte automatiquement les photos, analyse avec Claude Vision
 */
import TelegramBot from 'node-telegram-bot-api';
import { TelegramStreamer, splitMessage } from '../utils/streaming';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

// Store last analysis for callbacks
const lastAnalysis = new Map<string, { type: string; analysis: string }>();

export function registerPhotoCommand(bot: TelegramBot, adminChatId: string): void {
  bot.on('photo', async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const chatId = msg.chat.id.toString();
    const photos = msg.photo;
    if (!photos || photos.length === 0) return;

    // Get highest resolution photo
    const photo = photos[photos.length - 1]!;
    const caption = msg.caption || '';

    if (!ANTHROPIC_API_KEY) {
      await bot.sendMessage(chatId, '⚠️ `ANTHROPIC_API_KEY` non configurée.', { parse_mode: 'Markdown' });
      return;
    }

    const streamer = new TelegramStreamer(bot);
    await streamer.init(chatId, '📸 Analyse de l\'image en cours...');

    try {
      // Download photo from Telegram
      const file = await bot.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path || ''}`;

      const imageResponse = await fetch(fileUrl);
      if (!imageResponse.ok) throw new Error('Impossible de télécharger l\'image');

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());
      const base64Image = imageBuffer.toString('base64');

      // Detect media type from file extension
      const ext = file.file_path?.split('.').pop()?.toLowerCase() || 'jpg';
      const mediaType = ext === 'png' ? 'image/png' : ext === 'webp' ? 'image/webp' : 'image/jpeg';

      const prompt = caption || `Analyse cette image dans le contexte de Freenzy.io.
Identifie :
1. Ce que montre l'image (bug, maquette, screenshot, erreur, concurrent...)
2. Ce qu'il faudrait faire concrètement
3. Si c'est un bug → propose le code de correction
4. Si c'est une maquette → génère le composant React correspondant
5. Si c'est un screenshot concurrent → compare avec Freenzy et identifie les opportunités
Sois précis et actionnable.`;

      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-sonnet-4-6-20250514',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: [
              {
                type: 'image',
                source: {
                  type: 'base64',
                  media_type: mediaType,
                  data: base64Image,
                },
              },
              {
                type: 'text',
                text: prompt,
              },
            ],
          }],
        }),
      });

      if (!response.ok) {
        const errBody = await response.text();
        throw new Error(`API ${response.status}: ${errBody.slice(0, 200)}`);
      }

      const data = await response.json() as { content: { type: string; text: string }[] };
      const analysis = data.content
        .filter((b: { type: string }) => b.type === 'text')
        .map((b: { text: string }) => b.text)
        .join('');

      // Detect type of image
      const analysisLower = analysis.toLowerCase();
      let detectedType = 'other';
      if (analysisLower.includes('bug') || analysisLower.includes('erreur') || analysisLower.includes('crash')) {
        detectedType = 'bug';
      } else if (analysisLower.includes('maquette') || analysisLower.includes('design') || analysisLower.includes('figma') || analysisLower.includes('mockup')) {
        detectedType = 'maquette';
      } else if (analysisLower.includes('concurrent') || analysisLower.includes('compétiteur') || analysisLower.includes('alternative')) {
        detectedType = 'concurrent';
      }

      // Store for callbacks
      const resultId = Date.now().toString();
      lastAnalysis.set(chatId, { type: detectedType, analysis });

      // Build buttons based on type
      let buttons: TelegramBot.InlineKeyboardButton[][] = [];
      if (detectedType === 'bug') {
        buttons = [[
          { text: '🔧 Corriger maintenant', callback_data: `fix_now_${resultId}` },
          { text: '📋 Ajouter au backlog', callback_data: `backlog_photo_${resultId}` },
        ]];
      } else if (detectedType === 'maquette') {
        buttons = [[
          { text: '💻 Générer le composant', callback_data: `generate_component_${resultId}` },
          { text: '📋 Ajouter au backlog', callback_data: `backlog_photo_${resultId}` },
        ]];
      } else if (detectedType === 'concurrent') {
        buttons = [[
          { text: '📊 Analyse complète', callback_data: `analyze_competitor_${resultId}` },
          { text: '💡 Proposer une réponse', callback_data: `respond_competitor_${resultId}` },
        ]];
      } else {
        buttons = [[
          { text: '📋 Créer une tâche', callback_data: `to_task_photo_${resultId}` },
          { text: '💾 Sauvegarder l\'analyse', callback_data: `save_memory_photo_${resultId}` },
        ]];
      }

      const fullResponse = `📸 *Analyse d'image*\n\n${analysis}`;
      const parts: string[] = splitMessage(fullResponse);

      if (parts.length === 1) {
        await streamer.finish(parts[0] ?? '', { inline_keyboard: buttons });
      } else {
        await streamer.finish(parts[0] ?? '');
        for (let i = 1; i < parts.length; i++) {
          const isLast = i === parts.length - 1;
          await bot.sendMessage(chatId, parts[i] ?? '', {
            parse_mode: 'Markdown',
            reply_markup: isLast ? { inline_keyboard: buttons } : undefined,
          });
        }
      }

    } catch (err) {
      await streamer.error(`Erreur analyse photo : ${err instanceof Error ? err.message : String(err)}`);
    }
  });
}

export function getLastAnalysis(chatId: string): { type: string; analysis: string } | undefined {
  return lastAnalysis.get(chatId);
}
