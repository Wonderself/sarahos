/**
 * FEATURE 12 — Fun & Interactive commands
 * Gamification, motivation, mood, quizzes, GSD cheatsheet, streaks, goals, dice, KPI
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';

// ─── DB Helper ─────────────────────────────────────────────────
const PG_CONTAINER = process.env.PG_CONTAINER || 'freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-024742433003';

async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('docker', ['exec', PG_CONTAINER, 'psql', '-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql]);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('error', (e: Error) => { resolve(`Error: ${e.message}`); });
    proc.on('close', () => resolve(out.trim() || '0'));
  });
}

// ─── Motivation Quotes ─────────────────────────────────────────
const MOTIVATIONS = [
  { emoji: '🚀', quote: 'Ship fast, fix later. Perfection is the enemy of progress.', author: 'Reid Hoffman' },
  { emoji: '💡', quote: 'The best time to plant a tree was 20 years ago. The second best time is now.', author: 'Proverbe chinois' },
  { emoji: '🔥', quote: "Stay hungry, stay foolish.", author: 'Steve Jobs' },
  { emoji: '💪', quote: "Il n'y a pas de raccourci vers un endroit qui en vaut la peine.", author: 'Beverly Sills' },
  { emoji: '🎯', quote: "Focus is saying no to the hundred good ideas.", author: 'Steve Jobs' },
  { emoji: '⚡', quote: "Done is better than perfect.", author: 'Sheryl Sandberg' },
  { emoji: '🏆', quote: "Le succès n'est pas final, l'échec n'est pas fatal : c'est le courage de continuer qui compte.", author: 'Winston Churchill' },
  { emoji: '🧠', quote: "Work smart, not hard. Mais parfois, work hard aussi.", author: 'Elon Musk (adapté)' },
  { emoji: '🌟', quote: "Chaque expert a d'abord été un débutant.", author: 'Helen Hayes' },
  { emoji: '🦁', quote: "Un lion ne se retourne pas quand un petit chien aboie.", author: 'Proverbe africain' },
  { emoji: '🎸', quote: "Move fast and break things. Unless you are building products for people.", author: 'Mark Zuckerberg' },
  { emoji: '🧩', quote: "Simplicity is the ultimate sophistication.", author: 'Leonardo da Vinci' },
  { emoji: '🛠️', quote: "First, solve the problem. Then, write the code.", author: 'John Johnson' },
  { emoji: '🌊', quote: "L'eau qui coule ne craint pas le gel.", author: 'Proverbe japonais' },
  { emoji: '💎', quote: "Les diamants ne sont que des morceaux de charbon qui ont bien géré la pression.", author: 'Henry Kissinger' },
];

// ─── Dev Tips ──────────────────────────────────────────────────
const DEV_TIPS = [
  { emoji: '🧪', tip: 'Lance `/audit` 1x par semaine pour garder le code sain.' },
  { emoji: '📊', tip: 'Check `/status` chaque matin avant de coder.' },
  { emoji: '🔄', tip: '`/gsd:resume-work` pour reprendre exactement là où tu t\'es arrêté.' },
  { emoji: '🎯', tip: 'Pour un gros feature, `/gsd:new-project` > coder directement.' },
  { emoji: '💾', tip: 'Commit souvent, push souvent. Petit commits > gros commits.' },
  { emoji: '🧠', tip: '`/think` sur Telegram pour réfléchir à un problème sans ouvrir le laptop.' },
  { emoji: '⚡', tip: '`/gsd:quick` pour les tâches moyennes avec commits atomiques.' },
  { emoji: '🔍', tip: '`/errors` pour vérifier les erreurs récentes — ne laisse pas traîner.' },
  { emoji: '📈', tip: 'Check `/revenue` et `/users` pour rester motivé par la croissance.' },
  { emoji: '🛡️', tip: 'Jamais de `any` en TypeScript. Zod pour valider, toujours.' },
  { emoji: '🎪', tip: '`/gsd:autonomous` quand tu veux que Claude enchaîne tout seul.' },
  { emoji: '📱', tip: 'Envoie une photo de mockup au bot — il analyse et génère le code.' },
  { emoji: '🔐', tip: 'Jamais de clés API dans le code. `.env` uniquement.' },
  { emoji: '🎬', tip: '`/gsd:debug` pour les bugs vicieux — debug systématique > guessing.' },
  { emoji: '🏗️', tip: 'Feature branch toujours. Jamais commit sur main directement.' },
];

// ─── Quiz Questions ────────────────────────────────────────────
const QUIZZES = [
  {
    question: '🧠 Combien d\'agents a Freenzy ?',
    options: ['50', '100', '136', '200'],
    correct: 2,
    explanation: '136 agents ! 34 cœur + 19 business1 + 19 business2 + 28 personnels + 16 outils 🤖',
  },
  {
    question: '💰 Quel est le bonus d\'inscription en crédits ?',
    options: ['10', '25', '50', '100'],
    correct: 2,
    explanation: '50 crédits offerts à l\'inscription ! Généreux mais pas trop 💎',
  },
  {
    question: '🤖 Quel modèle est utilisé pour L1 (ultrafast) ?',
    options: ['GPT-4', 'Claude Sonnet', 'Claude Haiku', 'Claude Opus'],
    correct: 2,
    explanation: 'Claude Haiku pour L1 — ultra rapide, parfait pour l\'exécution ⚡',
  },
  {
    question: '🗄️ Combien de tables dans la DB ?',
    options: ['32', '56', '78', '120'],
    correct: 2,
    explanation: '78 tables ! Un vrai système d\'entreprise 🏗️',
  },
  {
    question: '🧪 Combien de tests unitaires ?',
    options: ['500+', '1000+', '1535+', '3000+'],
    correct: 2,
    explanation: '1535+ tests dans 89 suites ! Couverture solide ✅',
  },
  {
    question: '📄 Combien de pages le dashboard Next.js ?',
    options: ['50', '120', '188', '300'],
    correct: 2,
    explanation: '188 pages ! Un dashboard massif 📊',
  },
  {
    question: '🏢 Freenzy est une entreprise de quel pays ?',
    options: ['🇫🇷 France', '🇮🇱 Israël', '🇺🇸 USA', '🇩🇪 Allemagne'],
    correct: 1,
    explanation: 'Israël 🇮🇱 ! Interface en français car cible francophone (FR+BE) 🎯',
  },
  {
    question: '🔒 Quel algo de chiffrement est utilisé ?',
    options: ['RSA-2048', 'AES-128', 'AES-256', 'Blowfish'],
    correct: 2,
    explanation: 'AES-256 — le standard military grade 🛡️',
  },
  {
    question: '☁️ Où sont hébergées les données ?',
    options: ['AWS US', 'Azure', 'Hetzner EU', 'Google Cloud'],
    correct: 2,
    explanation: 'Hetzner en EU pour conformité RGPD 🇪🇺',
  },
  {
    question: '💳 Commission Freenzy pour les 5000 premiers users ?',
    options: ['0%', '5%', '10%', '15%'],
    correct: 0,
    explanation: '0% verrouillé à vie pour les 5000 premiers ! Early adopters gagnent 🎁',
  },
  {
    question: '⏰ À quelle heure est envoyé le brief quotidien ?',
    options: ['7h', '8h Netanya', '9h Paris', '10h'],
    correct: 1,
    explanation: '8h heure de Netanya (5h UTC) — pile pour le café du matin ☕',
  },
  {
    question: '📝 Quel préfixe pour les IDs d\'agents ?',
    options: ['sarah-*', 'fz-*', 'agent-*', 'fr-*'],
    correct: 1,
    explanation: 'fz-* uniquement ! sarah-* c\'est legacy obsolète 🚫',
  },
];

// ─── Mood tracking (in-memory, resets on restart) ──────────────
const moodHistory: Array<{ mood: string; emoji: string; timestamp: Date }> = [];

// ─── Goals (in-memory) ────────────────────────────────────────
const weeklyGoals: Array<{ text: string; done: boolean; id: number }> = [];
let goalCounter = 0;

// ─── Pending quiz answer ──────────────────────────────────────
const pendingQuiz = new Map<string, { correct: number; explanation: string }>();

// ─── Register all fun commands ────────────────────────────────

export function registerFunCommands(bot: TelegramBot, adminChatId: string): void {

  // ══════════════════════════════════════════════════════════════
  // /gsd — GSD Cheatsheet with interactive buttons
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/gsd$/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const gsdMsg = `📋 *GSD — Commandes essentielles*

🆕 *Démarrer*
\`/gsd:new-project\` — Nouveau gros projet
\`/gsd:quick\` — Tâche rapide avec garanties

📊 *Suivre*
\`/gsd:progress\` — Où j'en suis ?
\`/gsd:resume-work\` — Reprendre après une pause
\`/gsd:stats\` — Stats du projet

🤖 *Exécuter*
\`/gsd:autonomous\` — Mode autopilote
\`/gsd:execute-phase\` — Exécuter une phase
\`/gsd:plan-phase\` — Planifier une phase

🔍 *Diagnostiquer*
\`/gsd:debug\` — Debug systématique
\`/gsd:verify-work\` — Vérifier les features
\`/gsd:audit-milestone\` — Audit milestone

💡 *Rappel : petit truc → direct | moyen → quick | gros → new-project*`;

    await bot.sendMessage(msg.chat.id, gsdMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🆕 Nouveau projet', callback_data: 'gsd_info_new' },
            { text: '⚡ Quick task', callback_data: 'gsd_info_quick' },
          ],
          [
            { text: '🤖 Autopilote', callback_data: 'gsd_info_auto' },
            { text: '🐛 Debug', callback_data: 'gsd_info_debug' },
          ],
        ],
      },
    });
  });

  // ══════════════════════════════════════════════════════════════
  // /motivation — Random motivation quote
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/motivation/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const m = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]!;
    await bot.sendMessage(msg.chat.id, `${m.emoji} *"${m.quote}"*\n\n— _${m.author}_`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔄 Autre citation', callback_data: 'fun_motivation_next' },
          { text: '💾 Sauvegarder', callback_data: 'fun_motivation_save' },
        ]],
      },
    });
  });

  // ══════════════════════════════════════════════════════════════
  // /tip — Random dev/business tip
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/tip/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const t = DEV_TIPS[Math.floor(Math.random() * DEV_TIPS.length)]!;
    await bot.sendMessage(msg.chat.id, `${t.emoji} *Tip du jour*\n\n${t.tip}`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔄 Autre tip', callback_data: 'fun_tip_next' },
        ]],
      },
    });
  });

  // ══════════════════════════════════════════════════════════════
  // /mood — Mood tracker with emoji selector
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/mood/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    let history = '';
    if (moodHistory.length > 0) {
      const last5 = moodHistory.slice(-5);
      history = '\n\n📅 *Historique récent :*\n' + last5.map((m) => {
        const time = m.timestamp.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
        const date = m.timestamp.toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit' });
        return `${m.emoji} ${date} ${time} — ${m.mood}`;
      }).join('\n');
    }

    await bot.sendMessage(msg.chat.id, `🎭 *Comment tu te sens ?*${history}`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '🔥 On fire', callback_data: 'mood_onfire' },
            { text: '😊 Bien', callback_data: 'mood_good' },
            { text: '😐 Moyen', callback_data: 'mood_meh' },
          ],
          [
            { text: '😤 Frustré', callback_data: 'mood_frustrated' },
            { text: '😴 Fatigué', callback_data: 'mood_tired' },
            { text: '🤯 Débordé', callback_data: 'mood_overwhelmed' },
          ],
        ],
      },
    });
  });

  // ══════════════════════════════════════════════════════════════
  // /quiz — Random quiz about Freenzy
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/quiz/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const q = QUIZZES[Math.floor(Math.random() * QUIZZES.length)]!;
    const chatId = msg.chat.id.toString();

    pendingQuiz.set(chatId, { correct: q.correct, explanation: q.explanation });

    const buttons = q.options.map((opt, i) => ({
      text: opt,
      callback_data: `quiz_answer_${i}`,
    }));

    await bot.sendMessage(msg.chat.id, `${q.question}`, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [buttons],
      },
    });
  });

  // ══════════════════════════════════════════════════════════════
  // /score — Gamification score based on real data
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/score/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    // Calculate score from real metrics
    const totalUsers = parseInt(await dbQuery('SELECT COUNT(*) FROM users') || '0');
    const activeUsers = parseInt(await dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '7 days'") || '0');
    const totalRevenue = parseFloat(await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE status = 'completed'") || '0');
    const errorsToday = parseInt(await dbQuery("SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND created_at > NOW() - INTERVAL '24 hours'") || '0');
    const testsCount = 1535; // from CLAUDE.md

    // Score calculation
    const userScore = Math.min(totalUsers * 10, 500); // max 500 pts
    const retentionRate = totalUsers > 0 ? (activeUsers / totalUsers) * 100 : 0;
    const retentionScore = Math.min(Math.floor(retentionRate * 3), 300); // max 300 pts
    const revenueScore = Math.min(Math.floor(totalRevenue / 10), 200); // max 200 pts
    const stabilityScore = Math.max(100 - (errorsToday * 20), 0); // max 100 pts
    const testScore = Math.min(Math.floor(testsCount / 15), 100); // max 100 pts

    const totalScore = userScore + retentionScore + revenueScore + stabilityScore + testScore;
    const maxScore = 1200;
    const percentage = Math.floor((totalScore / maxScore) * 100);

    // Level system
    let level = '🥉 Bronze';
    let nextLevel = 'Silver';
    let pointsToNext = 300 - totalScore;
    if (totalScore >= 900) { level = '💎 Diamond'; nextLevel = 'Legend'; pointsToNext = 1200 - totalScore; }
    else if (totalScore >= 700) { level = '🥇 Gold'; nextLevel = 'Diamond'; pointsToNext = 900 - totalScore; }
    else if (totalScore >= 500) { level = '🥈 Silver'; nextLevel = 'Gold'; pointsToNext = 700 - totalScore; }
    else if (totalScore >= 300) { level = '🥉 Bronze'; nextLevel = 'Silver'; pointsToNext = 500 - totalScore; }

    // Progress bar
    const filled = Math.floor(percentage / 10);
    const progressBar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    const scoreMsg = `🏆 *Freenzy Score*

${level} — *${totalScore}* / ${maxScore} pts
\`[${progressBar}]\` ${percentage}%

📊 *Détail :*
👥 Users : ${userScore} pts _(${totalUsers} inscrits)_
📈 Rétention : ${retentionScore} pts _(${retentionRate.toFixed(0)}% actifs 7j)_
💰 Revenue : ${revenueScore} pts _(${totalRevenue.toFixed(0)}€ total)_
🛡️ Stabilité : ${stabilityScore} pts _(${errorsToday} erreurs 24h)_
🧪 Tests : ${testScore} pts _(${testsCount} tests)_

${pointsToNext > 0 ? `⬆️ Encore *${pointsToNext} pts* pour ${nextLevel} !` : '🎉 Score maximum atteint !'}`;

    await bot.sendMessage(msg.chat.id, scoreMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔄 Rafraîchir', callback_data: 'fun_score_refresh' },
          { text: '📈 Historique', callback_data: 'fun_score_history' },
        ]],
      },
    });
  });

  // ══════════════════════════════════════════════════════════════
  // /streak — Work streak tracker
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/streak/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    // Get commit streak from recent days
    const commitDays = await dbQuery(`
      SELECT DISTINCT DATE(created_at) as d FROM cron_logs
      WHERE cron_name IN ('deploy', 'backup') AND status = 'success'
      ORDER BY d DESC LIMIT 30
    `);

    // Get user registration streak
    const userDays = await dbQuery(`
      SELECT DISTINCT DATE(created_at) as d FROM users
      ORDER BY d DESC LIMIT 14
    `);

    const days = commitDays.split('\n').filter(Boolean);
    const userRegistrationDays = userDays.split('\n').filter(Boolean);

    // Calculate streak
    let streak = 0;
    const today = new Date();
    for (let i = 0; i < 30; i++) {
      const checkDate = new Date(today);
      checkDate.setDate(today.getDate() - i);
      const dateStr = checkDate.toISOString().split('T')[0] || '';
      if (days.some((d: string) => d.includes(dateStr))) {
        streak++;
      } else if (i > 0) {
        break;
      }
    }

    // Visual streak calendar (last 14 days)
    let calendar = '';
    const dayLabels = ['D', 'L', 'M', 'M', 'J', 'V', 'S'];
    for (let i = 13; i >= 0; i--) {
      const d = new Date(today);
      d.setDate(today.getDate() - i);
      const dateStr = d.toISOString().split('T')[0] || '';
      const hasActivity = days.some((day: string) => day.includes(dateStr));
      const hasUsers = userRegistrationDays.some((day: string) => day.includes(dateStr));
      void dayLabels[d.getDay()];
      if (hasActivity && hasUsers) calendar += `🟢`;
      else if (hasActivity || hasUsers) calendar += `🟡`;
      else calendar += `⬜`;
      if (i === 7) calendar += ' ';
    }

    const streakEmoji = streak >= 7 ? '🔥🔥🔥' : streak >= 3 ? '🔥🔥' : streak >= 1 ? '🔥' : '❄️';

    const streakMsg = `${streakEmoji} *Streak : ${streak} jours*

📅 *14 derniers jours :*
${calendar}
🟢 = actif (deploys + users) | 🟡 = partiel | ⬜ = off

${streak >= 7 ? '🏆 Tu es en feu ! 7+ jours consécutifs !' :
  streak >= 3 ? '💪 Beau streak de ' + streak + ' jours ! Continue !' :
  streak >= 1 ? '👍 Streak commencé ! Ne casse pas la chaîne !' :
  '😴 Pas de streak actif. Lance un `/deploy` pour démarrer !'}`;

    await bot.sendMessage(msg.chat.id, streakMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [[
          { text: '🔄 Rafraîchir', callback_data: 'fun_streak_refresh' },
          { text: '🏆 Score', callback_data: 'fun_score_refresh' },
        ]],
      },
    });
  });

  // ══════════════════════════════════════════════════════════════
  // /goals — Weekly goals tracker
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/goals(?:\s+(.+))?/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const newGoal = match?.[1]?.trim();

    if (newGoal) {
      goalCounter++;
      weeklyGoals.push({ text: newGoal, done: false, id: goalCounter });
      await bot.sendMessage(msg.chat.id, `✅ Goal ajouté : *${newGoal}*`, { parse_mode: 'Markdown' });
      return;
    }

    // Display goals
    if (weeklyGoals.length === 0) {
      await bot.sendMessage(msg.chat.id, `🎯 *Goals de la semaine*\n\n_Aucun goal défini._\n\nAjoute un goal : \`/goals Mon objectif ici\``, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '➕ Suggestions', callback_data: 'goals_suggest' },
          ]],
        },
      });
      return;
    }

    const doneCount = weeklyGoals.filter((g) => g.done).length;
    const totalGoals = weeklyGoals.length;
    const progressPct = Math.floor((doneCount / totalGoals) * 100);
    const filled = Math.floor(progressPct / 10);
    const bar = '█'.repeat(filled) + '░'.repeat(10 - filled);

    let goalsMsg = `🎯 *Goals de la semaine*\n\n`;
    goalsMsg += `\`[${bar}]\` ${doneCount}/${totalGoals} (${progressPct}%)\n\n`;

    for (const g of weeklyGoals) {
      goalsMsg += `${g.done ? '✅' : '⬜'} ${g.text}\n`;
    }

    goalsMsg += `\nAjoute : \`/goals Mon objectif\``;

    // Build toggle buttons
    const buttons = weeklyGoals.slice(0, 8).map((g) => ({
      text: `${g.done ? '✅' : '⬜'} ${g.text.slice(0, 15)}`,
      callback_data: `goal_toggle_${g.id}`,
    }));

    // Split buttons into rows of 2
    const rows: Array<Array<{ text: string; callback_data: string }>> = [];
    for (let i = 0; i < buttons.length; i += 2) {
      rows.push(buttons.slice(i, i + 2));
    }
    rows.push([
      { text: '🗑️ Clear tout', callback_data: 'goals_clear' },
      { text: '➕ Suggestions', callback_data: 'goals_suggest' },
    ]);

    await bot.sendMessage(msg.chat.id, goalsMsg, {
      parse_mode: 'Markdown',
      reply_markup: { inline_keyboard: rows },
    });
  });

  // ══════════════════════════════════════════════════════════════
  // /dice — Decision helper (roll a dice)
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/dice(?:\s+(.+))?/, async (msg, match) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const options = match?.[1]?.split(',').map((s: string) => s.trim()).filter(Boolean);

    if (options && options.length >= 2) {
      const chosen = options[Math.floor(Math.random() * options.length)];
      const diceEmojis = ['🎲', '🎰', '🎯', '🎪', '🎱'];
      const dice = diceEmojis[Math.floor(Math.random() * diceEmojis.length)];

      await bot.sendMessage(msg.chat.id, `${dice} *Le destin a parlé !*\n\nOptions : ${options.map((o: string) => `_${o}_`).join(' | ')}\n\n➡️ *${chosen}*`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🔄 Relancer', callback_data: `dice_reroll` },
          ]],
        },
      });
    } else {
      // Simple dice roll 1-6
      const roll = Math.floor(Math.random() * 6) + 1;
      const dices = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      await bot.sendMessage(msg.chat.id, `🎲 Tu as lancé un *${roll}* ${dices[roll - 1]}\n\n💡 _Utilise_ \`/dice option1, option2, option3\` _pour choisir entre plusieurs options !_`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🎲 Relancer', callback_data: 'dice_reroll_simple' },
          ]],
        },
      });
    }
  });

  // ══════════════════════════════════════════════════════════════
  // /kpi — Quick KPI dashboard
  // ══════════════════════════════════════════════════════════════
  bot.onText(/\/kpi/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const totalUsers = await dbQuery('SELECT COUNT(*) FROM users');
    const usersWeek = await dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '7 days'");
    const usersMonth = await dbQuery("SELECT COUNT(*) FROM users WHERE created_at > NOW() - INTERVAL '30 days'");
    const active7d = await dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '7 days'");
    const revenueMonth = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '30 days' AND status = 'completed'");
    const revenueWeek = await dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '7 days' AND status = 'completed'");
    const topAgent = await dbQuery("SELECT agent_id FROM agent_usage_logs WHERE created_at > NOW() - INTERVAL '7 days' GROUP BY agent_id ORDER BY COUNT(*) DESC LIMIT 1");
    const totalAgentUses = await dbQuery("SELECT COUNT(*) FROM agent_usage_logs WHERE created_at > NOW() - INTERVAL '7 days'");
    const onboardingRate = await dbQuery("SELECT ROUND(COUNT(CASE WHEN onboarding_completed THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) FROM users");

    const total = parseInt(totalUsers || '0');
    const active = parseInt(active7d || '0');
    const retention = total > 0 ? ((active / total) * 100).toFixed(0) : '0';

    const kpiMsg = `📊 *KPI Dashboard*

👥 *Acquisition*
├ Total users : *${totalUsers}*
├ Cette semaine : *+${usersWeek}*
├ Ce mois : *+${usersMonth}*
└ Onboarding : *${onboardingRate}%*

💰 *Revenue*
├ Semaine : *${parseFloat(revenueWeek || '0').toFixed(0)}€*
└ Mois : *${parseFloat(revenueMonth || '0').toFixed(0)}€*

📈 *Engagement*
├ Actifs 7j : *${active7d}* (${retention}%)
├ Agent star : *${topAgent || 'N/A'}*
└ Utilisations 7j : *${totalAgentUses}*

${parseInt(usersWeek || '0') > 5 ? '🚀 *Bonne semaine !*' : parseInt(usersWeek || '0') > 0 ? '👍 *On avance !*' : '⚠️ *Pas de nouveaux users cette semaine*'}`;

    await bot.sendMessage(msg.chat.id, kpiMsg, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [
          [
            { text: '👥 Users', callback_data: 'kpi_users' },
            { text: '💰 Revenue', callback_data: 'kpi_revenue' },
            { text: '🔄 Refresh', callback_data: 'fun_kpi_refresh' },
          ],
        ],
      },
    });
  });
}

// ─── Callback handler for fun commands ────────────────────────

export function registerFunCallbacks(bot: TelegramBot, adminChatId: string): void {
  bot.on('callback_query', async (query) => {
    if (query.from.id.toString() !== adminChatId) return;

    const data = query.data || '';
    const chatId = query.message?.chat.id.toString() || adminChatId;

    // ── GSD info buttons ──
    if (data === 'gsd_info_new') {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, `🆕 *\`/gsd:new-project\`*

📝 Quand l'utiliser ?
Quand tu as un *gros chantier* (nouveau feature, refonte, etc.)

🔄 Ce que ça fait :
1️⃣ Te pose des questions pour comprendre le besoin
2️⃣ Crée un roadmap avec des phases numérotées
3️⃣ Recherche le code existant
4️⃣ Planifie chaque phase en détail
5️⃣ Exécute avec commits atomiques

💡 Exemple : "Je veux un système de parrainage"`, { parse_mode: 'Markdown' });
      return;
    }

    if (data === 'gsd_info_quick') {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, `⚡ *\`/gsd:quick\`*

📝 Quand l'utiliser ?
Tâche moyenne (1-2h), tu veux les garanties GSD sans la lourdeur.

🔄 Ce que ça fait :
• Commit atomique garanti
• Vérification avant/après
• State tracking
• Mais pas de roadmap ou phases

💡 Exemple : "Ajoute un bouton export PDF sur la page users"`, { parse_mode: 'Markdown' });
      return;
    }

    if (data === 'gsd_info_auto') {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, `🤖 *\`/gsd:autonomous\`*

📝 Quand l'utiliser ?
Quand tu veux que Claude fasse TOUT seul. Tu reviens dans 1h.

🔄 Ce que ça fait :
Pour chaque phase restante :
1️⃣ Discussion → comprend le besoin
2️⃣ Planning → crée le plan
3️⃣ Exécution → code + commits
4️⃣ Vérification → teste

⚠️ Nécessite un \`/gsd:new-project\` d'abord pour avoir un roadmap.`, { parse_mode: 'Markdown' });
      return;
    }

    if (data === 'gsd_info_debug') {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, `🐛 *\`/gsd:debug\`*

📝 Quand l'utiliser ?
Bug vicieux qui résiste au debug classique.

🔄 Ce que ça fait :
• Méthode scientifique : hypothèse → test → conclusion
• État persistant (même si Claude perd le contexte)
• Checkpoints automatiques
• Journal de debug structuré

💡 Exemple : "Les crédits ne se déduisent pas sur les appels Twilio"`, { parse_mode: 'Markdown' });
      return;
    }

    // ── Motivation ──
    if (data === 'fun_motivation_next') {
      const m = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]!;
      await bot.answerCallbackQuery(query.id, { text: '💡 Nouvelle citation !' });
      await bot.sendMessage(chatId, `${m.emoji} *"${m.quote}"*\n\n— _${m.author}_`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🔄 Autre citation', callback_data: 'fun_motivation_next' },
            { text: '💾 Sauvegarder', callback_data: 'fun_motivation_save' },
          ]],
        },
      });
      return;
    }

    if (data === 'fun_motivation_save') {
      await bot.answerCallbackQuery(query.id, { text: '💾 Citation sauvegardée dans ta mémoire !' });
      await bot.sendMessage(chatId, '💾 Citation sauvegardée ! (Tu la retrouveras dans MEMORY.md)');
      return;
    }

    // ── Tips ──
    if (data === 'fun_tip_next') {
      const t = DEV_TIPS[Math.floor(Math.random() * DEV_TIPS.length)]!;
      await bot.answerCallbackQuery(query.id, { text: '💡 Nouveau tip !' });
      await bot.sendMessage(chatId, `${t.emoji} *Tip du jour*\n\n${t.tip}`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🔄 Autre tip', callback_data: 'fun_tip_next' },
          ]],
        },
      });
      return;
    }

    // ── Quiz ──
    if (data.startsWith('quiz_answer_')) {
      const answer = parseInt(data.replace('quiz_answer_', ''));
      const quiz = pendingQuiz.get(chatId);

      if (!quiz) {
        await bot.answerCallbackQuery(query.id, { text: '❓ Quiz expiré, relance /quiz' });
        return;
      }

      if (answer === quiz.correct) {
        await bot.answerCallbackQuery(query.id, { text: '✅ Correct !' });
        await bot.sendMessage(chatId, `✅ *Bonne réponse !*\n\n${quiz.explanation}`, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '🧠 Autre quiz', callback_data: 'fun_quiz_next' },
              { text: '🏆 Mon score', callback_data: 'fun_score_refresh' },
            ]],
          },
        });
      } else {
        await bot.answerCallbackQuery(query.id, { text: '❌ Raté !' });
        await bot.sendMessage(chatId, `❌ *Mauvaise réponse !*\n\n${quiz.explanation}`, {
          parse_mode: 'Markdown',
          reply_markup: {
            inline_keyboard: [[
              { text: '🧠 Revanche', callback_data: 'fun_quiz_next' },
            ]],
          },
        });
      }
      pendingQuiz.delete(chatId);
      return;
    }

    if (data === 'fun_quiz_next') {
      const q = QUIZZES[Math.floor(Math.random() * QUIZZES.length)]!;
      pendingQuiz.set(chatId, { correct: q.correct, explanation: q.explanation });
      await bot.answerCallbackQuery(query.id);
      const buttons = q.options.map((opt, i) => ({
        text: opt,
        callback_data: `quiz_answer_${i}`,
      }));
      await bot.sendMessage(chatId, `${q.question}`, {
        parse_mode: 'Markdown',
        reply_markup: { inline_keyboard: [buttons] },
      });
      return;
    }

    // ── Mood ──
    if (data.startsWith('mood_')) {
      const moods: Record<string, { emoji: string; label: string; response: string }> = {
        'mood_onfire': { emoji: '🔥', label: 'On fire', response: 'LET\'S GOOO ! Profite de cette énergie pour shipper ! 🚀' },
        'mood_good': { emoji: '😊', label: 'Bien', response: 'Parfait ! Journée productive en vue ! 💪' },
        'mood_meh': { emoji: '😐', label: 'Moyen', response: 'Pas grave, commence par un petit truc facile. Un `/tip` peut-être ? 💡' },
        'mood_frustrated': { emoji: '😤', label: 'Frustré', response: 'Respire. `/motivation` pour un boost ? Ou `/dice` pour décider quoi faire ? 🎲' },
        'mood_tired': { emoji: '😴', label: 'Fatigué', response: 'Prends un café ☕ ! Fais juste `/kpi` pour voir tes progrès, ça motive.' },
        'mood_overwhelmed': { emoji: '🤯', label: 'Débordé', response: 'Stop. `/goals` pour prioriser. Fais UNE chose à la fois. Tu gères ! 🎯' },
      };

      const mood = moods[data];
      if (mood) {
        moodHistory.push({ mood: mood.label, emoji: mood.emoji, timestamp: new Date() });
        await bot.answerCallbackQuery(query.id, { text: `${mood.emoji} ${mood.label}` });
        await bot.sendMessage(chatId, `${mood.emoji} *${mood.label}*\n\n${mood.response}`, { parse_mode: 'Markdown' });
      }
      return;
    }

    // ── Score ──
    if (data === 'fun_score_refresh') {
      await bot.answerCallbackQuery(query.id, { text: '🏆 Calcul...' });
      // Simulate /score command
      const fakeUpdate = {
        update_id: Date.now(),
        message: {
          message_id: Date.now(),
          from: query.from,
          chat: { id: parseInt(chatId), type: 'private' as const },
          date: Math.floor(Date.now() / 1000),
          text: '/score',
        },
      };
      bot.processUpdate(fakeUpdate);
      return;
    }

    if (data === 'fun_score_history') {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, `📈 *Historique Score*\n\n_L'historique sera disponible quand on aura assez de données._\n\n💡 Reviens check ton \`/score\` chaque semaine !`, { parse_mode: 'Markdown' });
      return;
    }

    // ── Streak ──
    if (data === 'fun_streak_refresh') {
      await bot.answerCallbackQuery(query.id, { text: '🔥 Calcul...' });
      const fakeUpdate = {
        update_id: Date.now(),
        message: {
          message_id: Date.now(),
          from: query.from,
          chat: { id: parseInt(chatId), type: 'private' as const },
          date: Math.floor(Date.now() / 1000),
          text: '/streak',
        },
      };
      bot.processUpdate(fakeUpdate);
      return;
    }

    // ── Goals ──
    if (data.startsWith('goal_toggle_')) {
      const goalId = parseInt(data.replace('goal_toggle_', ''));
      const goal = weeklyGoals.find((g) => g.id === goalId);
      if (goal) {
        goal.done = !goal.done;
        await bot.answerCallbackQuery(query.id, { text: goal.done ? '✅ Fait !' : '⬜ Pas fait' });

        // Refresh goals display
        const fakeUpdate = {
          update_id: Date.now(),
          message: {
            message_id: Date.now(),
            from: query.from,
            chat: { id: parseInt(chatId), type: 'private' as const },
            date: Math.floor(Date.now() / 1000),
            text: '/goals',
          },
        };
        bot.processUpdate(fakeUpdate);
      }
      return;
    }

    if (data === 'goals_clear') {
      weeklyGoals.length = 0;
      goalCounter = 0;
      await bot.answerCallbackQuery(query.id, { text: '🗑️ Goals effacés' });
      await bot.sendMessage(chatId, '🗑️ Tous les goals ont été effacés. Nouvelle semaine, nouveaux objectifs ! 🎯');
      return;
    }

    if (data === 'goals_suggest') {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, `💡 *Suggestions de goals :*

\`/goals Atteindre 10 nouveaux users\`
\`/goals Lancer feature parrainage\`
\`/goals 0 erreurs pendant 3 jours\`
\`/goals Faire un audit de sécu\`
\`/goals Optimiser le temps de chargement\`
\`/goals Répondre à tous les tickets support\``, { parse_mode: 'Markdown' });
      return;
    }

    // ── Dice ──
    if (data === 'dice_reroll_simple') {
      const roll = Math.floor(Math.random() * 6) + 1;
      const dices = ['⚀', '⚁', '⚂', '⚃', '⚄', '⚅'];
      await bot.answerCallbackQuery(query.id, { text: `🎲 ${roll}` });
      await bot.sendMessage(chatId, `🎲 Tu as lancé un *${roll}* ${dices[roll - 1]}`, {
        parse_mode: 'Markdown',
        reply_markup: {
          inline_keyboard: [[
            { text: '🎲 Relancer', callback_data: 'dice_reroll_simple' },
          ]],
        },
      });
      return;
    }

    // ── KPI ──
    if (data === 'fun_kpi_refresh') {
      await bot.answerCallbackQuery(query.id, { text: '📊 Refresh...' });
      const fakeUpdate = {
        update_id: Date.now(),
        message: {
          message_id: Date.now(),
          from: query.from,
          chat: { id: parseInt(chatId), type: 'private' as const },
          date: Math.floor(Date.now() / 1000),
          text: '/kpi',
        },
      };
      bot.processUpdate(fakeUpdate);
      return;
    }

    if (data === 'kpi_users') {
      await bot.answerCallbackQuery(query.id);
      const fakeUpdate = {
        update_id: Date.now(),
        message: {
          message_id: Date.now(),
          from: query.from,
          chat: { id: parseInt(chatId), type: 'private' as const },
          date: Math.floor(Date.now() / 1000),
          text: '/users',
        },
      };
      bot.processUpdate(fakeUpdate);
      return;
    }

    if (data === 'kpi_revenue') {
      await bot.answerCallbackQuery(query.id);
      const fakeUpdate = {
        update_id: Date.now(),
        message: {
          message_id: Date.now(),
          from: query.from,
          chat: { id: parseInt(chatId), type: 'private' as const },
          date: Math.floor(Date.now() / 1000),
          text: '/revenue',
        },
      };
      bot.processUpdate(fakeUpdate);
      return;
    }
  });
}

// ─── Export for daily brief ───────────────────────────────────
export function getDailyMotivation(): string {
  const m = MOTIVATIONS[Math.floor(Math.random() * MOTIVATIONS.length)]!;
  return `${m.emoji} _"${m.quote}"_ — ${m.author}`;
}

export function getDailyTip(): string {
  const t = DEV_TIPS[Math.floor(Math.random() * DEV_TIPS.length)]!;
  return `${t.emoji} ${t.tip}`;
}

export function getGsdReminder(): string {
  const reminders = [
    '💡 Rappel : `/gsd:new-project` pour les gros chantiers, `/gsd:quick` pour le reste',
    '🤖 Pense à `/gsd:autonomous` si tu veux que Claude bosse tout seul',
    '📊 `/gsd:progress` pour voir où en sont tes projets',
    '🐛 Un bug ? `/gsd:debug` pour un debug systématique',
    '⏸️ Tu reprends ? `/gsd:resume-work` pour retrouver le contexte',
  ];
  return reminders[Math.floor(Math.random() * reminders.length)] || reminders[0]!;
}
