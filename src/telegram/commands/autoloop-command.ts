/**
 * FEATURE 12 — /autoloop : Sessions autonomes Claude Code longue durée
 * Lance Claude Code en mode autonome avec budget tracking et contrôles live
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn, ChildProcess } from 'child_process';
import { TelegramStreamer } from '../utils/streaming';

const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';

interface AutoloopState {
  instruction: string;
  durationMinutes: number;
  startTime: number;
  toolUses: number;
  messageCount: number;
  filesModified: Set<string>;
  commits: string[];
  estimatedCost: number;
  status: 'running' | 'paused' | 'completed' | 'failed' | 'budget_killed' | 'timeout';
  lastOutput: string;
  process: ChildProcess | null;
  pid: number | null;
  budgetAlertSent: boolean;
}

// One active autoloop at a time
let activeLoop: AutoloopState | null = null;
let activeStreamer: TelegramStreamer | null = null;
// activeChatId removed — use msg.chat.id directly
let progressInterval: ReturnType<typeof setInterval> | null = null;

const MAX_DURATION_MINUTES = 180;
const BUDGET_ALERT_EUR = 10;
const BUDGET_LIMIT_EUR = 15;
const COST_PER_TOOL_USE = 0.01;
const COST_PER_MESSAGE = 0.005;

function estimateCost(state: AutoloopState): number {
  return state.toolUses * COST_PER_TOOL_USE + state.messageCount * COST_PER_MESSAGE;
}

function formatDuration(ms: number): string {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  if (minutes >= 60) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h${mins.toString().padStart(2, '0')}m`;
  }
  return `${minutes}m${seconds.toString().padStart(2, '0')}s`;
}

function formatProgress(state: AutoloopState): string {
  const elapsed = Date.now() - state.startTime;
  const cost = estimateCost(state);
  const statusEmoji = state.status === 'running' ? '🔄' : state.status === 'paused' ? '⏸️' : '⏳';

  return [
    `${statusEmoji} *AutoLoop en cours...*`,
    '',
    `📋 ${state.instruction.slice(0, 200)}`,
    `⏱ Durée : ${formatDuration(elapsed)} / ${state.durationMinutes}min`,
    `🔧 Actions : ${state.toolUses} tool uses`,
    `📁 Fichiers : ${state.filesModified.size} modifiés`,
    `📦 Commits : ${state.commits.length}`,
    `💰 Coût estimé : ${cost.toFixed(2)}€ / ${BUDGET_LIMIT_EUR}€`,
    '',
    state.status === 'paused' ? '⏸️ _En pause_' : '⏳ _En cours..._',
  ].join('\n');
}

function formatFinalReport(state: AutoloopState): string {
  const elapsed = Date.now() - state.startTime;
  const cost = estimateCost(state);

  const statusLabel = {
    completed: '✅ *AutoLoop terminé*',
    failed: '❌ *AutoLoop échoué*',
    budget_killed: '🛑 *AutoLoop arrêté (budget)*',
    timeout: '⏰ *AutoLoop terminé (timeout)*',
    running: '✅ *AutoLoop terminé*',
    paused: '⏸️ *AutoLoop arrêté*',
  }[state.status];

  const summary = state.lastOutput.slice(-500).trim() || 'Pas de résumé disponible';

  return [
    statusLabel,
    '',
    `📋 ${state.instruction.slice(0, 200)}`,
    `⏱ Durée : ${formatDuration(elapsed)}`,
    `🔧 Actions : ${state.toolUses} tool uses`,
    `📁 Fichiers modifiés : ${state.filesModified.size}`,
    `📦 Commits : ${state.commits.length}`,
    `💰 Coût estimé : ${cost.toFixed(2)}€`,
    '',
    'Résumé :',
    summary,
  ].join('\n');
}

function detectFileModification(text: string): string[] {
  const files: string[] = [];
  const patterns = [
    /(?:Writing|Creating|Editing|Edit)\s+(?:file\s+)?[`"]?([^\s`"]+)/gi,
    /(?:write|edit)\s+.*?([a-zA-Z0-9_\-/.]+\.\w+)/gi,
  ];
  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      if (match[1]) files.push(match[1]);
    }
  }
  return files;
}

function detectCommits(text: string): string[] {
  const commits: string[] = [];
  // Match git commit messages
  const commitPatterns = [
    /\[[\w/]+\s+([a-f0-9]{7,})\]\s+(.+)/g,
    /commit\s+([a-f0-9]{7,})/gi,
  ];
  for (const pattern of commitPatterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text)) !== null) {
      commits.push(match[1] || '');
    }
  }
  return commits;
}

function cleanup(): void {
  if (progressInterval) {
    clearInterval(progressInterval);
    progressInterval = null;
  }
  activeLoop = null;
  activeStreamer = null;
}

function killProcess(state: AutoloopState): void {
  if (!state.process || state.process.killed) return;
  state.process.kill('SIGTERM');
  // Force kill after 5 seconds
  setTimeout(() => {
    if (state.process && !state.process.killed) {
      state.process.kill('SIGKILL');
    }
  }, 5000);
}

export function registerAutoloopCommand(bot: TelegramBot, adminChatId: string): void {
  // Help when no args
  bot.onText(/^\/autoloop$/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    await bot.sendMessage(msg.chat.id, `🔄 *AutoLoop — Aide*

Lance Claude Code en mode autonome pour une session longue durée (max 3h).

*Usage :* \`/autoloop [instruction] [durée en minutes]\`

*Exemples :*
• \`/autoloop optimise les performances du dashboard 120\`
• \`/autoloop corrige tous les bugs CSS mobile\`
• \`/autoloop refactorise les composants admin 90\`

⏱ Durée par défaut : 60 minutes (max 180)
💰 Budget max : ${BUDGET_LIMIT_EUR}€/session (alerte à ${BUDGET_ALERT_EUR}€)`, { parse_mode: 'Markdown' });
  });

  // Main command handler
  bot.onText(/\/autoloop (.+)/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;
    const rawInput = match?.[1]?.trim();
    if (!rawInput) {
      await bot.sendMessage(msg.chat.id, '⚠️ Usage : `/autoloop [instruction] [durée en minutes]`', { parse_mode: 'Markdown' });
      return;
    }

    // Check if already running
    if (activeLoop && activeLoop.status === 'running') {
      await bot.sendMessage(msg.chat.id, '⚠️ Un AutoLoop est déjà en cours. Utilise les boutons pour le contrôler.', {
        reply_markup: {
          inline_keyboard: [[
            { text: '⏸️ Pause', callback_data: 'autoloop_pause' },
            { text: '🛑 Arrêter', callback_data: 'autoloop_stop' },
            { text: '💰 Budget', callback_data: 'autoloop_budget' },
          ]],
        },
      });
      return;
    }

    // Parse duration from end of instruction
    let instruction = rawInput;
    let duration = 60;
    const durationMatch = rawInput.match(/\s+(\d+)\s*$/);
    if (durationMatch) {
      const parsed = parseInt(durationMatch[1] || '60', 10);
      if (parsed >= 1 && parsed <= MAX_DURATION_MINUTES) {
        duration = parsed;
        instruction = rawInput.slice(0, durationMatch.index).trim();
      }
    }

    if (!instruction) {
      await bot.sendMessage(msg.chat.id, '⚠️ Instruction manquante. Usage : `/autoloop [instruction] [durée]`', { parse_mode: 'Markdown' });
      return;
    }

    if (duration > MAX_DURATION_MINUTES) {
      await bot.sendMessage(msg.chat.id, `⚠️ Durée max : ${MAX_DURATION_MINUTES} minutes (3h).`);
      return;
    }

    const chatId = msg.chat.id.toString();

    const state: AutoloopState = {
      instruction,
      durationMinutes: duration,
      startTime: Date.now(),
      toolUses: 0,
      messageCount: 0,
      filesModified: new Set(),
      commits: [],
      estimatedCost: 0,
      status: 'running',
      lastOutput: '',
      process: null,
      pid: null,
      budgetAlertSent: false,
    };
    activeLoop = state;

    // Send initial message
    const streamer = new TelegramStreamer(bot, 3000);
    activeStreamer = streamer;

    const initialMsg = [
      '🔄 *AutoLoop démarré*',
      '',
      `📋 Instruction : ${instruction.slice(0, 300)}`,
      `⏱ Durée max : ${duration} minutes`,
      `💰 Budget max : ${BUDGET_LIMIT_EUR}€/session (alerte à ${BUDGET_ALERT_EUR}€)`,
      '',
      '⏳ En cours...',
    ].join('\n');

    await streamer.init(chatId, initialMsg);

    try {
      const timeoutSeconds = duration * 60;
      const escapedInstruction = instruction.replace(/"/g, '\\"').replace(/\$/g, '\\$');

      const claude = spawn('bash', ['-c',
        `source /root/.nvm/nvm.sh && cd ${PROJECT_ROOT} && timeout ${timeoutSeconds}s claude -p "${escapedInstruction}. Fais tout sans demander de permission. Commit automatiquement chaque changement significatif avec un message descriptif. À la fin, fais un git push origin main." --output-format stream-json 2>&1`
      ], {
        cwd: PROJECT_ROOT,
        env: { ...process.env, HOME: '/root' },
      });

      state.process = claude;
      state.pid = claude.pid ?? null;

      let output = '';

      claude.stdout.on('data', (data: Buffer) => {
        const text = data.toString();
        output += text;
        state.lastOutput = output.slice(-2000);

        // Parse stream-json lines
        for (const line of text.split('\n').filter(Boolean)) {
          try {
            const parsed = JSON.parse(line);

            // Count messages
            if (parsed.type === 'assistant') {
              state.messageCount++;
              if (parsed.message?.content) {
                for (const block of parsed.message.content) {
                  if (block.type === 'tool_use') {
                    state.toolUses++;
                    // Detect file modifications
                    const toolInfo = `${block.name} ${JSON.stringify(block.input || {}).slice(0, 500)}`;
                    const files = detectFileModification(toolInfo);
                    for (const f of files) state.filesModified.add(f);
                    // Detect git commits
                    const commits = detectCommits(toolInfo);
                    for (const c of commits) {
                      if (!state.commits.includes(c)) state.commits.push(c);
                    }
                  }
                  if (block.type === 'text' && block.text) {
                    state.lastOutput = block.text.slice(-1000);
                    // Detect commits from text output
                    const commits = detectCommits(block.text);
                    for (const c of commits) {
                      if (!state.commits.includes(c)) state.commits.push(c);
                    }
                  }
                }
              }
            }

            // Tool results may contain file/commit info
            if (parsed.type === 'tool_result' || parsed.type === 'result') {
              const resultText = typeof parsed.result === 'string' ? parsed.result : JSON.stringify(parsed);
              const files = detectFileModification(resultText);
              for (const f of files) state.filesModified.add(f);
              const commits = detectCommits(resultText);
              for (const c of commits) {
                if (!state.commits.includes(c)) state.commits.push(c);
              }
              if (parsed.type === 'result') {
                state.lastOutput = (parsed.result || '').slice(-1000);
              }
            }
          } catch {
            // Not JSON — detect from raw text
            const files = detectFileModification(line);
            for (const f of files) state.filesModified.add(f);
            const commits = detectCommits(line);
            for (const c of commits) {
              if (!state.commits.includes(c)) state.commits.push(c);
            }
          }
        }

        // Update cost estimate
        state.estimatedCost = estimateCost(state);

        // Budget alert at threshold
        if (state.estimatedCost >= BUDGET_ALERT_EUR && !state.budgetAlertSent) {
          state.budgetAlertSent = true;
          bot.sendMessage(chatId,
            `⚠️ *Budget à ${BUDGET_ALERT_EUR}€.* L'autoloop continue. Limite: ${BUDGET_LIMIT_EUR}€.`,
            { parse_mode: 'Markdown' }
          ).catch(() => {});
        }

        // Budget limit — kill
        if (state.estimatedCost >= BUDGET_LIMIT_EUR) {
          state.status = 'budget_killed';
          killProcess(state);
          bot.sendMessage(chatId,
            `🛑 *Budget ${BUDGET_LIMIT_EUR}€ atteint.* AutoLoop arrêté.`,
            { parse_mode: 'Markdown' }
          ).catch(() => {});
        }
      });

      claude.stderr.on('data', (data: Buffer) => {
        output += data.toString();
      });

      // Update progress every 30 seconds
      progressInterval = setInterval(() => {
        if (state.status === 'running' && activeStreamer) {
          activeStreamer.update(formatProgress(state)).catch(() => {});
        }
      }, 30000);

      claude.on('close', async (code) => {
        if (progressInterval) {
          clearInterval(progressInterval);
          progressInterval = null;
        }

        // Determine final status
        if (state.status === 'running') {
          if (code === 124) {
            state.status = 'timeout';
          } else if (code === 0) {
            state.status = 'completed';
          } else {
            state.status = 'failed';
          }
        }

        const finalMsg = formatFinalReport(state);
        const buttons: TelegramBot.InlineKeyboardMarkup = {
          inline_keyboard: [
            [
              { text: '📊 Voir les commits', callback_data: 'autoloop_show_commits' },
              { text: '↩️ Revert dernier commit', callback_data: 'autoloop_revert' },
            ],
            [
              { text: '🔄 Relancer', callback_data: `autoloop_relaunch` },
            ],
          ],
        };

        if (activeStreamer) {
          await activeStreamer.finish(finalMsg, buttons);
        }

        cleanup();
      });

      // Send control buttons
      await bot.sendMessage(chatId, '🎛️ *Contrôles AutoLoop :*', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '⏸️ Pause', callback_data: 'autoloop_pause' },
            { text: '🛑 Arrêter', callback_data: 'autoloop_stop' },
            { text: '💰 Voir le budget', callback_data: 'autoloop_budget' },
          ]],
        },
      });

    } catch (err) {
      state.status = 'failed';
      if (activeStreamer) {
        await activeStreamer.error(`Impossible de lancer AutoLoop : ${err instanceof Error ? err.message : String(err)}`);
      }
      cleanup();
    }
  });

  // ─── Callback query handlers ───
  bot.on('callback_query', async (query) => {
    if (!query.message || query.message.chat.id.toString() !== adminChatId) return;
    const data = query.data || '';

    if (!data.startsWith('autoloop_')) return;

    const chatId = query.message.chat.id.toString();

    // Pause
    if (data === 'autoloop_pause') {
      if (!activeLoop || activeLoop.status !== 'running') {
        await bot.answerCallbackQuery(query.id, { text: 'Aucun AutoLoop en cours.' });
        return;
      }
      if (activeLoop.process && activeLoop.pid) {
        try {
          process.kill(activeLoop.pid, 'SIGSTOP');
          activeLoop.status = 'paused';
          await bot.answerCallbackQuery(query.id, { text: 'AutoLoop en pause.' });
          await bot.sendMessage(chatId, '⏸️ AutoLoop en pause. Utilise /autoloop\\_resume pour reprendre.', {
            parse_mode: 'Markdown',
            reply_markup: {
              inline_keyboard: [[
                { text: '▶️ Reprendre', callback_data: 'autoloop_resume' },
                { text: '🛑 Arrêter', callback_data: 'autoloop_stop' },
              ]],
            },
          });
        } catch {
          await bot.answerCallbackQuery(query.id, { text: 'Erreur lors de la pause.' });
        }
      }
      return;
    }

    // Resume
    if (data === 'autoloop_resume') {
      if (!activeLoop || activeLoop.status !== 'paused') {
        await bot.answerCallbackQuery(query.id, { text: 'Aucun AutoLoop en pause.' });
        return;
      }
      if (activeLoop.pid) {
        try {
          process.kill(activeLoop.pid, 'SIGCONT');
          activeLoop.status = 'running';
          await bot.answerCallbackQuery(query.id, { text: 'AutoLoop repris.' });
          await bot.sendMessage(chatId, '▶️ AutoLoop repris.');
        } catch {
          await bot.answerCallbackQuery(query.id, { text: 'Erreur lors de la reprise.' });
        }
      }
      return;
    }

    // Stop
    if (data === 'autoloop_stop') {
      if (!activeLoop || (activeLoop.status !== 'running' && activeLoop.status !== 'paused')) {
        await bot.answerCallbackQuery(query.id, { text: 'Aucun AutoLoop actif.' });
        return;
      }
      activeLoop.status = 'failed';
      killProcess(activeLoop);
      await bot.answerCallbackQuery(query.id, { text: 'AutoLoop arrêté.' });
      return;
    }

    // Budget
    if (data === 'autoloop_budget') {
      if (!activeLoop) {
        await bot.answerCallbackQuery(query.id, { text: 'Aucun AutoLoop actif.' });
        return;
      }
      const cost = estimateCost(activeLoop);
      const elapsed = formatDuration(Date.now() - activeLoop.startTime);
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, [
        `💰 *Budget AutoLoop*`,
        '',
        `Coût estimé : ${cost.toFixed(2)}€ / ${BUDGET_LIMIT_EUR}€`,
        `Tool uses : ${activeLoop.toolUses} (${COST_PER_TOOL_USE}€/use)`,
        `Messages : ${activeLoop.messageCount} (${COST_PER_MESSAGE}€/msg)`,
        `Durée : ${elapsed}`,
        '',
        cost >= BUDGET_ALERT_EUR ? '⚠️ Alerte budget atteinte' : '✅ Budget OK',
      ].join('\n'), { parse_mode: 'Markdown' });
      return;
    }

    // Show commits
    if (data === 'autoloop_show_commits') {
      await bot.answerCallbackQuery(query.id);
      // Run git log to get recent commits
      const gitLog = spawn('bash', ['-c',
        `source /root/.nvm/nvm.sh && cd ${PROJECT_ROOT} && git log --oneline -10 2>&1`
      ], { env: { ...process.env, HOME: '/root' } });

      let logOutput = '';
      gitLog.stdout.on('data', (d: Buffer) => { logOutput += d.toString(); });
      gitLog.on('close', async () => {
        await bot.sendMessage(chatId,
          `📊 *Derniers commits :*\n\n\`\`\`\n${logOutput.trim() || 'Aucun commit'}\n\`\`\``,
          { parse_mode: 'Markdown' }
        );
      });
      return;
    }

    // Revert
    if (data === 'autoloop_revert') {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, '⚠️ *Revert le dernier commit ?*', {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '✅ Confirmer revert', callback_data: 'autoloop_revert_confirm' },
            { text: '❌ Annuler', callback_data: 'autoloop_revert_cancel' },
          ]],
        },
      });
      return;
    }

    // Revert confirm
    if (data === 'autoloop_revert_confirm') {
      await bot.answerCallbackQuery(query.id);
      const revert = spawn('bash', ['-c',
        `source /root/.nvm/nvm.sh && cd ${PROJECT_ROOT} && git revert HEAD --no-edit && git push origin main 2>&1`
      ], { env: { ...process.env, HOME: '/root' } });

      let revertOutput = '';
      revert.stdout.on('data', (d: Buffer) => { revertOutput += d.toString(); });
      revert.stderr.on('data', (d: Buffer) => { revertOutput += d.toString(); });
      revert.on('close', async (code) => {
        if (code === 0) {
          await bot.sendMessage(chatId, `✅ Revert effectué et pushé.\n\n\`\`\`\n${revertOutput.trim().slice(0, 500)}\n\`\`\``, { parse_mode: 'Markdown' });
        } else {
          await bot.sendMessage(chatId, `❌ Erreur lors du revert.\n\n\`\`\`\n${revertOutput.trim().slice(0, 500)}\n\`\`\``, { parse_mode: 'Markdown' });
        }
      });
      return;
    }

    // Revert cancel
    if (data === 'autoloop_revert_cancel') {
      await bot.answerCallbackQuery(query.id, { text: 'Revert annulé.' });
      return;
    }

    // Relaunch
    if (data === 'autoloop_relaunch') {
      await bot.answerCallbackQuery(query.id, { text: 'Utilise /autoloop pour relancer.' });
      return;
    }
  });
}
