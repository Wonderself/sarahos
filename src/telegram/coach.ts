/**
 * FEATURE 13 — Coach proactif IA
 * Un copilote qui connaît tout du projet, prend l'initiative 5x/jour,
 * pousse Emmanuel à utiliser Freenzy depuis Freenzy, propose des idées,
 * pose des questions, et fait avancer le business à tous les niveaux.
 *
 * Personnalité : direct, drôle, stratégique, bienveillant mais challengeant.
 * Parle en langage naturel, comme un associé qui connaît le dossier par cœur.
 */
import TelegramBot from 'node-telegram-bot-api';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { Memory } from './memory';

// ─── Config ───────────────────────────────────────────────────
const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';
const PROJECT_ROOT = process.env.PROJECT_ROOT || '/root/projects/freenzy/sarahos';
const PG_CONTAINER = process.env.PG_CONTAINER || 'freenzy-postgres-ewcwwk0wocw0cw0kccsw4kcw-024742433003';

let bot: TelegramBot;
let adminChatId: string;
let coachIntervals: ReturnType<typeof setInterval>[] = [];

// ─── DB Helper ────────────────────────────────────────────────
async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('docker', ['exec', PG_CONTAINER, 'psql', '-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql]);
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('error', (e: Error) => { resolve(`Error: ${e.message}`); });
    proc.on('close', () => resolve(out.trim() || '0'));
  });
}

// ─── Context gathering ───────────────────────────────────────
async function gatherLiveContext(): Promise<string> {
  const [
    totalUsers,
    newUsersToday,
    activeUsers24h,
    revenueToday,
    revenueWeek,
    errorsToday,
    pendingActions,
    topAgent,
    lastUserProfession,
    ticketCount,
    onboardingRate,
    agentUses7d,
  ] = await Promise.all([
    dbQuery('SELECT COUNT(*) FROM users'),
    dbQuery("SELECT COUNT(*) FROM users WHERE created_at::date = CURRENT_DATE"),
    dbQuery("SELECT COUNT(*) FROM users WHERE last_login_at > NOW() - INTERVAL '24 hours'"),
    dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at::date = CURRENT_DATE AND status = 'completed'"),
    dbQuery("SELECT COALESCE(SUM(amount), 0) FROM transactions WHERE created_at > NOW() - INTERVAL '7 days' AND status = 'completed'"),
    dbQuery("SELECT COUNT(*) FROM cron_logs WHERE status = 'error' AND created_at > NOW() - INTERVAL '24 hours'"),
    dbQuery("SELECT COUNT(*) FROM agent_proposals WHERE status = 'pending'"),
    dbQuery("SELECT agent_id || ' (' || COUNT(*) || ')' FROM agent_usage_logs WHERE created_at > NOW() - INTERVAL '24 hours' GROUP BY agent_id ORDER BY COUNT(*) DESC LIMIT 1"),
    dbQuery("SELECT up.profession FROM users u JOIN user_profiles up ON u.id = up.user_id ORDER BY u.created_at DESC LIMIT 1"),
    dbQuery("SELECT COUNT(*) FROM support_tickets WHERE status != 'closed'"),
    dbQuery("SELECT ROUND(COUNT(CASE WHEN onboarding_completed THEN 1 END)::numeric / NULLIF(COUNT(*), 0) * 100, 1) FROM users"),
    dbQuery("SELECT COUNT(*) FROM agent_usage_logs WHERE created_at > NOW() - INTERVAL '7 days'"),
  ]);

  return `DONNÉES LIVE FREENZY (${new Date().toLocaleString('fr-FR', { timeZone: 'Asia/Jerusalem' })}):
- Users total: ${totalUsers}
- Nouveaux aujourd'hui: ${newUsersToday}
- Actifs 24h: ${activeUsers24h}
- Revenue aujourd'hui: ${revenueToday}€
- Revenue semaine: ${revenueWeek}€
- Erreurs 24h: ${errorsToday}
- Actions en attente: ${pendingActions}
- Agent star 24h: ${topAgent}
- Dernier user inscrit (profession): ${lastUserProfession}
- Tickets ouverts: ${ticketCount}
- Taux onboarding: ${onboardingRate}%
- Utilisations agents 7j: ${agentUses7d}`;
}

function loadProjectContext(): string {
  try {
    const claudeMdPath = path.join(PROJECT_ROOT, 'CLAUDE.md');
    if (fs.existsSync(claudeMdPath)) {
      return fs.readFileSync(claudeMdPath, 'utf-8').slice(0, 6000);
    }
  } catch { /* */ }
  return '';
}

// ─── Coach personality & system prompt ────────────────────────

const COACH_SYSTEM_PROMPT = `Tu es le COPILOTE d'Emmanuel Smadja, fondateur de Freenzy.io.

🧠 QUI TU ES :
- Tu es comme un associé technique et stratégique qui connaît TOUT du projet
- Tu parles en langage naturel, décontracté mais pro. Tutoiement.
- Tu as de l'humour, tu es direct, parfois provocateur (gentiment)
- Tu n'es PAS un assistant soumis. Tu challenges, tu pousses, tu proposes
- Tu appelles Emmanuel par son prénom ou "manu" de temps en temps
- Tu utilises des emojis naturellement (sans abuser)

🎯 TA MISSION :
1. FAIRE AVANCER le business Freenzy à tous les niveaux
2. POUSSER Emmanuel à être son propre premier client ("eat your own dogfood")
   - "Tu utilises Freenzy pour gérer Freenzy ?" → l'encourager à utiliser ses propres agents
   - "Tu as testé l'agent commercial pour prospecter pour Freenzy ?"
   - "Tu devrais utiliser l'agent SEO pour le blog de Freenzy"
3. PROPOSER des améliorations concrètes (pas vagues)
4. POSER des questions qui font réfléchir
5. CÉLÉBRER les victoires (même petites)
6. ALERTER sur les risques et urgences

💡 TYPES DE MESSAGES QUE TU ENVOIES :
- Idées produit : "Et si on ajoutait X ? Ça résoudrait Y pour les users"
- Questions business : "Tu vises quoi comme MRR ce mois ? On est à X€"
- Dogfooding : "Tu as essayé d'utiliser l'agent email pour envoyer ta newsletter Freenzy ?"
- Quick wins : "Y'a un truc rapide à faire qui aurait un gros impact : ..."
- Alertes : "Attention, 0 nouveaux users aujourd'hui. Qu'est-ce qu'on fait ?"
- Motivation : quand les chiffres montent, celebrate !
- Provocations bienveillantes : "Manu, ça fait 3 jours que t'as pas checké les tickets support..."

🚫 CE QUE TU NE FAIS PAS :
- Pas de messages longs (max 5-8 lignes)
- Pas de listes à rallonge
- Pas de "En tant qu'assistant IA..."
- Pas de politesse excessive
- Pas de propositions vagues — toujours concret et actionnable
- Tu ne proposes JAMAIS de modifier du code (c'est le rôle de /claude)

📊 STYLE DE COMMUNICATION :
Court. Percutant. Un message = une idée ou une question.
Comme un message WhatsApp d'un pote qui bosse avec toi.`;

// ─── Check-in types with time slots ──────────────────────────

interface CheckIn {
  id: string;
  name: string;
  hourUTC: number;      // UTC hour
  minuteUTC: number;
  prompt: string;       // What to ask Claude to generate
  buttons?: Array<{ text: string; callback_data: string }>;
}

const CHECK_INS: CheckIn[] = [
  {
    id: 'morning_kickoff',
    name: '☀️ Morning Kickoff',
    hourUTC: 5,   // 8h Netanya
    minuteUTC: 30, // 8h30 (30 min après le brief data)
    prompt: `C'est le matin (8h30 Netanya). Emmanuel vient de recevoir son brief chiffré.
Maintenant TU lui parles comme son associé.
- Réagis aux données du jour (si un truc est notable, dis-le)
- Propose UNE chose concrète à faire aujourd'hui
- Pose UNE question stratégique
- Si 0 nouveaux users hier, challenge-le (gentiment)
- Termine par un truc motivant ou drôle
IMPORTANT: Sois bref (5-6 lignes max). C'est un message WhatsApp, pas un email.`,
    buttons: [
      { text: '💪 Let\'s go', callback_data: 'coach_ack' },
      { text: '📊 Détails', callback_data: 'coach_details' },
      { text: '💬 Répondre', callback_data: 'coach_reply' },
    ],
  },
  {
    id: 'midmorning_dogfood',
    name: '🐕 Dogfood Check',
    hourUTC: 8,   // 11h Netanya
    minuteUTC: 0,
    prompt: `C'est 11h du matin. Check de dogfooding.
Ton rôle : pousser Emmanuel à utiliser Freenzy pour gérer Freenzy.
Choisis UN angle parmi :
- "Tu as utilisé l'agent [X] pour [tâche Freenzy] aujourd'hui ?"
- "Pour ta prochaine newsletter, utilise l'agent email de Freenzy au lieu de faire à la main"
- "L'agent SEO pourrait analyser le blog freenzy.io, tu l'as testé ?"
- "Tu devrais être ton user le plus actif sur Freenzy. Tu l'es ?"
- "Utilise l'agent commercial pour cold-emailer des prospects pour Freenzy"
- "L'agent social media pourrait poster pour le compte Freenzy, essaie"
Sois concret, donne UN exemple précis. 3-4 lignes max.`,
    buttons: [
      { text: '✅ Je teste', callback_data: 'coach_ack' },
      { text: '🤔 Comment ?', callback_data: 'coach_howto' },
      { text: '⏭️ Plus tard', callback_data: 'coach_later' },
    ],
  },
  {
    id: 'lunch_idea',
    name: '💡 Lunch Idea',
    hourUTC: 10,  // 13h Netanya
    minuteUTC: 0,
    prompt: `C'est la pause déj (13h). Moment parfait pour une idée produit.
Propose UNE idée d'amélioration pour Freenzy. Sois créatif mais réaliste.
L'idée doit être :
- Concrète (pas "améliorer l'UX" mais "ajouter un onboarding wizard avec 3 étapes")
- Impactante pour les users
- Faisable en moins d'une semaine
- Basée sur ce que tu sais du produit
Explique en 2 phrases pourquoi c'est une bonne idée.
Termine par "Tu en penses quoi ?" ou "On fait ça ?"
3-5 lignes max.`,
    buttons: [
      { text: '🔥 Bonne idée !', callback_data: 'coach_idea_yes' },
      { text: '🤔 Pas sûr', callback_data: 'coach_idea_meh' },
      { text: '❌ Next', callback_data: 'coach_idea_no' },
      { text: '💬 Discuter', callback_data: 'coach_reply' },
    ],
  },
  {
    id: 'afternoon_push',
    name: '⚡ Afternoon Push',
    hourUTC: 13,  // 16h Netanya
    minuteUTC: 0,
    prompt: `C'est 16h. L'après-midi avance.
Fais UN check rapide basé sur les données :
- Si des actions sont en attente : "Manu, t'as ${'{pending}'} trucs en attente, tu valides ?"
- Si des erreurs : "Y'a eu des erreurs aujourd'hui, tu veux que je regarde ?"
- Si revenue > 0 : "Beau ! ${'{revenue}'}€ aujourd'hui 💰"
- Si 0 activité : "C'est calme aujourd'hui... une idée pour booster ?"
- Pose une question sur les priorités de la semaine
2-4 lignes max. Direct et percutant.`,
    buttons: [
      { text: '✅ Je m\'en occupe', callback_data: 'coach_ack' },
      { text: '📋 Validations', callback_data: 'handle_pending' },
      { text: '💬 Répondre', callback_data: 'coach_reply' },
    ],
  },
  {
    id: 'evening_recap',
    name: '🌙 Evening Recap',
    hourUTC: 17,  // 20h Netanya
    minuteUTC: 0,
    prompt: `C'est 20h, fin de journée.
Fais un MINI bilan de la journée en mode décontracté :
- Ce qui s'est passé (users, revenue, activité)
- Un truc positif (même petit)
- Un truc à améliorer demain
- UN conseil perso (pas que business : santé, mindset, équilibre)
Termine par un mot sympa / drôle pour la soirée.
4-5 lignes max. Ton de pote qui ferme le bureau avec toi.`,
    buttons: [
      { text: '🙏 Merci', callback_data: 'coach_ack' },
      { text: '💬 Répondre', callback_data: 'coach_reply' },
    ],
  },
];

// Track which check-ins already fired today
const firedToday = new Set<string>();
let lastResetDay = -1;

// ─── Coach message generation via Claude ─────────────────────

async function generateCoachMessage(checkIn: CheckIn): Promise<string> {
  if (!ANTHROPIC_API_KEY) return '';

  const [liveContext, memory] = await Promise.all([
    gatherLiveContext(),
    Memory.read(),
  ]);
  const projectContext = loadProjectContext();

  const fullPrompt = `${checkIn.prompt}

${liveContext}

CONTEXTE PROJET (extrait) :
${projectContext.slice(0, 3000)}

MÉMOIRE :
${memory.slice(0, 2000)}`;

  try {
    const response = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
      },
      body: JSON.stringify({
        model: 'claude-sonnet-4-20250514',
        max_tokens: 500,
        system: COACH_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: fullPrompt }],
      }),
    });

    if (!response.ok) return '';

    const data = await response.json() as { content: { type: string; text: string }[] };
    return data.content
      .filter((b: { type: string }) => b.type === 'text')
      .map((b: { text: string }) => b.text)
      .join('');
  } catch {
    return '';
  }
}

// ─── Send coach message ──────────────────────────────────────

async function sendCoachMessage(checkIn: CheckIn): Promise<void> {
  const message = await generateCoachMessage(checkIn);
  if (!message) return;

  try {
    const buttons = checkIn.buttons || [
      { text: '💬 Répondre', callback_data: 'coach_reply' },
    ];

    await bot.sendMessage(adminChatId, message, {
      parse_mode: 'Markdown',
      reply_markup: {
        inline_keyboard: [buttons],
      },
    }).catch(async () => {
      // Markdown failed, try plain text
      await bot.sendMessage(adminChatId, message, {
        reply_markup: {
          inline_keyboard: [buttons],
        },
      });
    });
  } catch (err) {
    console.error(`[Coach] Error sending ${checkIn.id}:`, err instanceof Error ? err.message : err);
  }
}

// ─── Schedule engine ─────────────────────────────────────────

function checkSchedule(): void {
  const now = new Date();
  const currentDay = now.getUTCDate();

  // Reset fired check-ins at midnight UTC
  if (currentDay !== lastResetDay) {
    firedToday.clear();
    lastResetDay = currentDay;
  }

  const currentHour = now.getUTCHours();
  const currentMinute = now.getUTCMinutes();

  for (const checkIn of CHECK_INS) {
    if (firedToday.has(checkIn.id)) continue;

    if (currentHour === checkIn.hourUTC && currentMinute === checkIn.minuteUTC) {
      firedToday.add(checkIn.id);
      // Fire async, don't block
      sendCoachMessage(checkIn).catch((err) => {
        console.error(`[Coach] Failed to send ${checkIn.id}:`, err);
      });
    }
  }
}

// ─── Enhanced chat system prompt ─────────────────────────────
// This replaces the default chat personality when coach mode is active

export function getCoachSystemPrompt(memory: string, liveContext: string): string {
  const projectCtx = loadProjectContext();

  return `${COACH_SYSTEM_PROMPT}

CONTEXTE PROJET :
${projectCtx.slice(0, 4000)}

DONNÉES LIVE :
${liveContext}

MÉMOIRE :
${memory.slice(0, 3000)}

INSTRUCTIONS CONVERSATION :
- Tu es en mode conversation libre avec Emmanuel
- Réponds de manière naturelle, comme par message
- Si il demande un truc technique, sois précis
- Si il hésite, pousse-le (gentiment)
- N'hésite pas à proposer des trucs même s'il n'a pas demandé
- Rappelle-lui d'utiliser Freenzy pour Freenzy quand c'est pertinent
- Si il parle de fatigue/stress, sois humain et empathique
- Tu peux faire des blagues
- JAMAIS de messages de plus de 10 lignes`;
}

// ─── Coach callbacks ─────────────────────────────────────────

export function registerCoachCallbacks(bot: TelegramBot, adminChatId: string): void {
  bot.on('callback_query', async (query) => {
    if (query.from.id.toString() !== adminChatId) return;
    const data = query.data || '';
    const chatId = query.message?.chat.id.toString() || adminChatId;

    if (data === 'coach_ack') {
      const acks = ['👊', '💪 Let\'s go !', '🔥', '👍 Top !', '✌️', '🚀'];
      const ack = acks[Math.floor(Math.random() * acks.length)]!;
      await bot.answerCallbackQuery(query.id, { text: ack });
      return;
    }

    if (data === 'coach_later') {
      await bot.answerCallbackQuery(query.id, { text: '⏰ Ok, je reviens !' });
      await bot.sendMessage(chatId, '⏰ Pas de souci, je repasse plus tard. Mais oublie pas hein 😏');
      return;
    }

    if (data === 'coach_reply') {
      await bot.answerCallbackQuery(query.id, { text: '💬 Écris-moi !' });
      await bot.sendMessage(chatId, '💬 Je t\'écoute ! Écris-moi directement, pas besoin de /chat.');
      return;
    }

    if (data === 'coach_details') {
      await bot.answerCallbackQuery(query.id, { text: '📊 Chargement...' });
      // Trigger /kpi
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

    if (data === 'coach_howto') {
      await bot.answerCallbackQuery(query.id);
      const howtoMsg = await generateCoachMessage({
        id: 'howto',
        name: 'How to',
        hourUTC: 0,
        minuteUTC: 0,
        prompt: `Emmanuel a cliqué "Comment ?" sur un conseil de dogfooding.
Donne-lui les étapes concrètes pour utiliser un agent Freenzy pour une tâche Freenzy.
- Quel agent utiliser
- Comment y accéder (dashboard app.freenzy.io)
- Quoi lui demander exactement
3-5 lignes, très concret.`,
      });
      if (howtoMsg) {
        await bot.sendMessage(chatId, howtoMsg).catch(() => {});
      }
      return;
    }

    if (data === 'coach_idea_yes') {
      await bot.answerCallbackQuery(query.id, { text: '🔥 Noté !' });
      await bot.sendMessage(chatId, '🔥 Noté ! Lance `/gsd:new-project` dans Claude Code pour planifier ça, ou `/gsd:quick` si c\'est rapide.\n\nOu dis-moi "fais-le" et je te guide.', { parse_mode: 'Markdown' });
      return;
    }

    if (data === 'coach_idea_meh') {
      await bot.answerCallbackQuery(query.id);
      await bot.sendMessage(chatId, '🤔 Ok, je comprends. Dis-moi ce qui te bloque, on peut ajuster l\'idée ou j\'en propose une autre.');
      return;
    }

    if (data === 'coach_idea_no') {
      await bot.answerCallbackQuery(query.id, { text: '👌 Next !' });
      await bot.sendMessage(chatId, '👌 Pas grave, j\'ai plein d\'autres idées. Je reviens avec une meilleure au prochain check-in 😉');
      return;
    }

    if (data === 'coach_poke_again') {
      await bot.answerCallbackQuery(query.id, { text: '🧠 Je réfléchis...' });
      const fakeUpdate = {
        update_id: Date.now(),
        message: {
          message_id: Date.now(),
          from: query.from,
          chat: { id: parseInt(chatId), type: 'private' as const },
          date: Math.floor(Date.now() / 1000),
          text: '/poke',
        },
      };
      bot.processUpdate(fakeUpdate);
      return;
    }
  });
}

// ─── Manual trigger ──────────────────────────────────────────

export function registerCoachCommand(bot: TelegramBot, adminChatId: string): void {
  // /coach — trigger a coach message on demand
  bot.onText(/\/coach/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const now = new Date();
    const hour = now.getUTCHours();

    // Pick the most relevant check-in based on time
    let bestCheckIn = CHECK_INS[0]!;
    for (const ci of CHECK_INS) {
      if (hour >= ci.hourUTC) bestCheckIn = ci;
    }

    await bot.sendMessage(msg.chat.id, '🧠 Je réfléchis...');
    await sendCoachMessage(bestCheckIn);
  });

  // /poke — Emmanuel can ask the coach to be more proactive
  bot.onText(/\/poke/, async (msg) => {
    if (msg.chat.id.toString() !== adminChatId) return;

    const pokeCheckIn: CheckIn = {
      id: 'poke',
      name: '👋 Poke',
      hourUTC: 0,
      minuteUTC: 0,
      prompt: `Emmanuel t'a poké ! Il veut que tu lui parles.
Propose quelque chose d'utile basé sur les données actuelles.
Ça peut être :
- Une observation sur les metrics
- Un challenge pour la journée
- Un rappel de dogfooding
- Une idée produit
- Une question provocante
Sois spontané et naturel. 3-5 lignes.`,
      buttons: [
        { text: '💬 Répondre', callback_data: 'coach_reply' },
        { text: '🔥 Encore', callback_data: 'coach_poke_again' },
      ],
    };

    await sendCoachMessage(pokeCheckIn);
  });
}

// ─── Init & cleanup ──────────────────────────────────────────

export function initCoach(botInstance: TelegramBot, chatId: string): void {
  bot = botInstance;
  adminChatId = chatId;

  // Check schedule every 60 seconds
  const interval = setInterval(checkSchedule, 60000);
  coachIntervals.push(interval);

  console.log('🧠 Coach proactif activé — 5 check-ins/jour');
  console.log('   ☀️ 8h30 Morning Kickoff');
  console.log('   🐕 11h00 Dogfood Check');
  console.log('   💡 13h00 Lunch Idea');
  console.log('   ⚡ 16h00 Afternoon Push');
  console.log('   🌙 20h00 Evening Recap');
}

export function stopCoach(): void {
  for (const interval of coachIntervals) {
    clearInterval(interval);
  }
  coachIntervals = [];
}

// ─── Export for enhanced chat ────────────────────────────────
export { gatherLiveContext };
