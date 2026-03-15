/**
 * Improvement Engine — Analyzes metrics and proposes product improvements
 */
import { spawn } from 'child_process';
import { MetricsCollector, type DailyMetrics } from './MetricsCollector';

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY || '';

async function dbQuery(sql: string): Promise<string> {
  return new Promise((resolve) => {
    const proc = spawn('psql', ['-U', 'freenzy', '-d', 'freenzy', '-t', '-A', '-c', sql], {
      env: { ...process.env, PGPASSWORD: process.env.DB_PASSWORD || '' },
    });
    let out = '';
    proc.stdout.on('data', (d: Buffer) => { out += d.toString(); });
    proc.on('close', () => resolve(out.trim()));
  });
}

async function notifyEmmanuel(message: string, buttons?: object): Promise<void> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_ADMIN_CHAT_ID || '6238804698';
  if (!token) return;
  try {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'Markdown',
        reply_markup: buttons ? JSON.stringify(buttons) : undefined,
      }),
    });
  } catch { /* silent */ }
}

export interface ProductImprovement {
  id: string;
  title: string;
  observation: string;
  hypothesis: string;
  solution: string;
  effort: 'xs' | 's' | 'm' | 'l' | 'xl';
  impact: 'faible' | 'moyen' | 'fort' | 'critique';
  priority_score: number;
  is_quick_win: boolean;
  category: 'quick_win' | 'weekly' | 'backlog';
  created_at: string;
}

const IMPACT_SCORES: Record<string, number> = { critique: 4, fort: 3, moyen: 2, faible: 1 };
const EFFORT_SCORES: Record<string, number> = { xs: 1, s: 2, m: 3, l: 4, xl: 5 };

export class ImprovementEngine {
  /**
   * Analyze daily metrics and propose improvements
   */
  static async analyze(): Promise<ProductImprovement[]> {
    const metrics = await MetricsCollector.collectDailyMetrics();

    if (!ANTHROPIC_API_KEY) {
      console.log('[ImprovementEngine] No ANTHROPIC_API_KEY, using rule-based analysis');
      return this.ruleBasedAnalysis(metrics);
    }

    try {
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
          system: `Tu es le Chief Product Officer de Freenzy.io, un SaaS B2B d'agents IA pour PME françaises/belges.
Analyse les métriques quotidiennes et propose des améliorations concrètes.
Réponds UNIQUEMENT en JSON valide, un tableau d'objets avec ces champs:
title, observation, hypothesis, solution, effort (xs/s/m/l/xl), impact (faible/moyen/fort/critique), category (quick_win/weekly/backlog)`,
          messages: [{
            role: 'user',
            content: `Métriques du ${metrics.date}:\n${JSON.stringify(metrics, null, 2)}\n\nPropose 3-5 améliorations. 1 quick win (effort xs, impact fort+), 1 amélioration semaine, 1+ backlog.`,
          }],
        }),
      });

      if (!response.ok) throw new Error(`API ${response.status}`);

      const data = await response.json() as { content: { type: string; text: string }[] };
      const text = data.content.find(b => b.type === 'text')?.text || '[]';

      // Extract JSON from response
      const jsonMatch = text.match(/\[[\s\S]*\]/);
      if (!jsonMatch) return this.ruleBasedAnalysis(metrics);

      const improvements: ProductImprovement[] = JSON.parse(jsonMatch[0]).map((item: Record<string, string>, idx: number) => {
        const effort = (item.effort || 'm') as ProductImprovement['effort'];
        const impact = (item.impact || 'moyen') as ProductImprovement['impact'];
        const impactScore = IMPACT_SCORES[impact] || 2;
        const effortScore = EFFORT_SCORES[effort] || 3;
        const priorityScore = Math.round((impactScore * 10) / effortScore);
        const isQuickWin = effort === 'xs' && impactScore >= 3;

        return {
          id: `imp_${Date.now().toString(36)}_${idx}`,
          title: item.title || 'Amélioration',
          observation: item.observation || '',
          hypothesis: item.hypothesis || '',
          solution: item.solution || '',
          effort,
          impact,
          priority_score: priorityScore,
          is_quick_win: isQuickWin,
          category: item.category || (isQuickWin ? 'quick_win' : 'backlog'),
          created_at: new Date().toISOString(),
        };
      });

      // Save to DB
      for (const imp of improvements) {
        await dbQuery(`
          INSERT INTO product_improvements (id, title, observation, hypothesis, solution, effort, impact, priority_score, is_quick_win, status, created_at)
          VALUES ('${imp.id}', '${imp.title.replace(/'/g, "''")}', '${imp.observation.replace(/'/g, "''")}', '${imp.hypothesis.replace(/'/g, "''")}', '${imp.solution.replace(/'/g, "''")}', '${imp.effort}', '${imp.impact}', ${imp.priority_score}, ${imp.is_quick_win}, 'proposed', NOW())
        `).catch(() => {});
      }

      return improvements;
    } catch (err) {
      console.error('[ImprovementEngine] AI analysis failed:', err instanceof Error ? err.message : err);
      return this.ruleBasedAnalysis(metrics);
    }
  }

  /**
   * Generate and send daily report to Emmanuel
   */
  static async generateAndSendReport(): Promise<void> {
    const improvements = await dbQuery(`
      SELECT title, effort, impact, is_quick_win, category FROM product_improvements
      WHERE created_at::date = CURRENT_DATE
      ORDER BY priority_score DESC LIMIT 5
    `);

    const metrics = await MetricsCollector.collectDailyMetrics();
    const quickWin = improvements.split('\n').find(l => l.includes('t')) || '';
    const [qwTitle] = quickWin.split('|');

    const report = [
      `🔧 *Amélioration Produit* — ${new Date().toLocaleDateString('fr-FR')}`,
      '',
      `📊 Hier : ${metrics.users.active24h} users actifs | ${metrics.agents.totalUsages24h} agents | ${metrics.onboarding.completionRate}% onboarding`,
      `👥 Équipes : ${metrics.teams.activeOrgs} orgas actives | ${metrics.teams.totalMembers} membres`,
      '',
      qwTitle ? `⚡ *QUICK WIN* :\n${qwTitle}` : '⚡ Pas de quick win aujourd\'hui',
      '',
      improvements ? `🎯 *PRIORITÉS* :\n${improvements.split('\n').slice(0, 3).map(l => `• ${l.split('|')[0]}`).join('\n')}` : '',
    ].filter(Boolean).join('\n');

    await notifyEmmanuel(report, {
      inline_keyboard: [[
        { text: '✅ Implémenter', callback_data: 'implement_quickwin' },
        { text: '📋 Voir tout', callback_data: 'full_report' },
        { text: '⏸️ Reporter', callback_data: 'postpone_improvements' },
      ]],
    });
  }

  /**
   * Weekly deep analysis using Opus
   */
  static async generateWeeklyDeepAnalysis(): Promise<void> {
    if (!ANTHROPIC_API_KEY) return;

    const weekMetrics = await dbQuery(`
      SELECT date_trunc('day', created_at)::date as day, COUNT(*) as actions
      FROM agent_usage_logs WHERE created_at > NOW() - INTERVAL '7 days'
      GROUP BY day ORDER BY day
    `);

    try {
      const response = await fetch('https://api.anthropic.com/v1/messages', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'x-api-key': ANTHROPIC_API_KEY,
          'anthropic-version': '2023-06-01',
        },
        body: JSON.stringify({
          model: 'claude-opus-4-6',
          max_tokens: 4096,
          messages: [{
            role: 'user',
            content: `Analyse hebdo Freenzy.io. Métriques 7 jours:\n${weekMetrics}\n\nIdentifie: patterns, corrélations, prédictions, 3 recommandations stratégiques. Sois concis et actionnable.`,
          }],
        }),
      });

      if (response.ok) {
        const data = await response.json() as { content: { text: string }[] };
        const analysis = data.content[0]?.text || '';
        await notifyEmmanuel(`🧠 *Analyse Hebdo Opus*\n\n${analysis.slice(0, 3000)}`);
      }
    } catch { /* silent */ }
  }

  /**
   * Rule-based fallback analysis (no API needed)
   */
  private static ruleBasedAnalysis(metrics: DailyMetrics): ProductImprovement[] {
    const improvements: ProductImprovement[] = [];
    const ts = Date.now().toString(36);

    // Low onboarding completion
    if (metrics.onboarding.completionRate < 50 && metrics.onboarding.started > 0) {
      improvements.push({
        id: `imp_${ts}_onb`, title: 'Taux complétion onboarding bas',
        observation: `${metrics.onboarding.completionRate}% de complétion`, hypothesis: 'Quiz trop long ou questions confuses',
        solution: 'Réduire à 5 questions max, ajouter skip option', effort: 's', impact: 'fort',
        priority_score: 15, is_quick_win: false, category: 'weekly', created_at: new Date().toISOString(),
      });
    }

    // High error rate
    if (metrics.errors.total24h > 10) {
      improvements.push({
        id: `imp_${ts}_err`, title: 'Erreurs cron élevées',
        observation: `${metrics.errors.total24h} erreurs en 24h`, hypothesis: 'Service instable ou config incorrecte',
        solution: 'Investiguer les crons les plus fréquents en erreur', effort: 'xs', impact: 'critique',
        priority_score: 40, is_quick_win: true, category: 'quick_win', created_at: new Date().toISOString(),
      });
    }

    // Low team adoption
    if (metrics.teams.activeOrgs > 0 && metrics.teams.avgMembersPerOrg < 2) {
      improvements.push({
        id: `imp_${ts}_team`, title: 'Adoption équipe faible',
        observation: `${metrics.teams.avgMembersPerOrg} membres/orga en moyenne`, hypothesis: 'Invitation pas assez simple ou valeur équipe pas claire',
        solution: 'Email d\'invitation plus attractif + guide "inviter votre équipe"', effort: 's', impact: 'moyen',
        priority_score: 5, is_quick_win: false, category: 'backlog', created_at: new Date().toISOString(),
      });
    }

    return improvements;
  }
}
