/**
 * FEATURE 5 — /photo : Analyse d'image et action
 * Détecte automatiquement les photos, analyse avec Claude Vision
 * Uses Claude Code CLI (Max subscription) instead of direct API calls
 */
import TelegramBot from 'node-telegram-bot-api';
// child_process used via require('child_process').execFile inline
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { TelegramStreamer, splitMessage } from '../utils/streaming';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';

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

    const streamer = new TelegramStreamer(bot);
    await streamer.init(chatId, '📸 Analyse de l\'image en cours...');

    try {
      // Download photo from Telegram
      const file = await bot.getFile(photo.file_id);
      const fileUrl = `https://api.telegram.org/file/bot${process.env.TELEGRAM_BOT_TOKEN}/${file.file_path || ''}`;

      const imageResponse = await fetch(fileUrl);
      if (!imageResponse.ok) throw new Error('Impossible de télécharger l\'image');

      const imageBuffer = Buffer.from(await imageResponse.arrayBuffer());

      // Save image to temp file for Claude Code CLI
      const ext = file.file_path?.split('.').pop()?.toLowerCase() || 'jpg';
      const tmpDir = os.tmpdir();
      const tmpFile = path.join(tmpDir, `freenzy-photo-${Date.now()}.${ext}`);
      fs.writeFileSync(tmpFile, imageBuffer);

      const prompt = caption || `Analyse cette image dans le contexte de Freenzy.io.
Identifie :
1. Ce que montre l'image (bug, maquette, screenshot, erreur, concurrent...)
2. Ce qu'il faudrait faire concrètement
3. Si c'est un bug, propose le code de correction
4. Si c'est une maquette, genere le composant React correspondant
5. Si c'est un screenshot concurrent, compare avec Freenzy et identifie les opportunites
Sois precis et actionnable.`;

      // Use Claude Code CLI with image file — execFile (no shell escaping issues)
      console.log(`[/photo] Calling Claude Code CLI with image: ${tmpFile}`);
      const analysis = await new Promise<string>((resolve) => {
        const { execFile } = require('child_process');
        const claudePath = '/root/.nvm/versions/node/v22.22.1/bin/claude';
        const nvmBin = '/root/.nvm/versions/node/v22.22.1/bin';
        const child = execFile(claudePath, ['-p', prompt, '--files', tmpFile], {
          cwd: PROJECT_ROOT,
          env: { ...process.env, HOME: '/root', PATH: `${nvmBin}:${process.env['PATH'] || '/usr/bin:/bin'}`, ANTHROPIC_API_KEY: '' },
          timeout: 120000,
          maxBuffer: 1024 * 1024,
        }, (err: Error | null, stdout: string, stderr: string) => {
          // Clean up temp file
          try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
          if (err) {
            console.error('[/photo] Claude Code execFile error:', err.message);
            if (stderr) console.error('[/photo] stderr:', stderr.slice(0, 500));
            resolve(stderr || stdout || 'Erreur analyse photo.');
          } else {
            console.log(`[/photo] Claude Code response: ${stdout.length} chars`);
            resolve(stdout.trim() || 'Pas de réponse.');
          }
        });
        child.on('error', (spawnErr: Error) => {
          console.error('[/photo] execFile spawn error:', spawnErr.message);
          try { fs.unlinkSync(tmpFile); } catch { /* ignore */ }
          resolve(`Erreur lancement Claude: ${spawnErr.message}`);
        });
      });
      // (old spawn error handler removed — now handled in execFile callback)

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
