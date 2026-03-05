// ===============================================================
// Budget Agent — "Mon Budget" (Personal Budget Manager, persona: Sophie)
// ===============================================================

import { BaseAgent } from '../../../base/base-agent';
import { LLMRouter } from '../../../../core/llm/llm-router';
import { eventBus } from '../../../../core/event-bus/event-bus';
import { memoryManager } from '../../../../core/memory/memory-manager';
import {
  BUDGET_SYSTEM_PROMPT,
  BUDGET_HAIKU_CATEGORIZE_SYSTEM_PROMPT,
  BUDGET_DISCLAIMER,
  CATEGORIZE_PROMPT,
  PROJECT_PROMPT,
  GOALS_PROMPT,
  SUMMARY_PROMPT,
} from './budget.prompts';
import {
  getTransactions,
  createTransaction,
  getGoals,
  createGoal,
  updateGoal,
  getMonthlySummary,
  formatBudgetSummary,
} from './budget.tools';
import type { AgentTask, AgentConfig } from '../../../base/agent.types';
import type { SystemEvent } from '../../../../core/event-bus/event.types';
import type {
  BudgetTaskType,
  CategorizePayload,
  ProjectPayload,
  GoalsPayload,
  SummaryPayload,
  BudgetTransaction,
  BudgetCategory,
  TransactionType,
} from './budget.types';

export const BUDGET_AGENT_CONFIG: AgentConfig = {
  id: 'budget-agent',
  name: 'Budget Agent',
  level: 1,
  modelTier: 'fast',
  capabilities: [
    'budget-categorize',
    'budget-project',
    'budget-goals',
    'budget-summary',
  ],
  systemPrompt: BUDGET_SYSTEM_PROMPT,
  maxRetries: 2,
  timeoutMs: 30_000,
  rateLimitPerMinute: 30,
};

export class BudgetAgent extends BaseAgent {
  constructor(config: AgentConfig = BUDGET_AGENT_CONFIG) {
    super(config);
  }

  protected async onInitialize(): Promise<void> {
    eventBus.subscribe('BudgetTransactionCreated', async (event) => {
      await this.handleTransactionCreated(event);
    }, this.id);

    eventBus.subscribe('BudgetGoalReached', async (event) => {
      await this.handleGoalReached(event);
    }, this.id);

    this.logger.info('Budget Agent (Sophie) initialized — pret pour la gestion de budget');
  }

  protected async onExecute(task: AgentTask): Promise<Record<string, unknown>> {
    const taskType = (task.payload['type'] as BudgetTaskType | undefined) ?? 'summary';

    switch (taskType) {
      case 'categorize':
        return this.handleCategorize(task);
      case 'project':
        return this.handleProject(task);
      case 'goals':
        return this.handleGoals(task);
      case 'summary':
        return this.handleSummary(task);
      default:
        return {
          error: `Type de tache budget inconnu: ${String(taskType)}`,
          disclaimer: BUDGET_DISCLAIMER,
        };
    }
  }

  protected async onEvent(event: SystemEvent): Promise<void> {
    switch (event.type) {
      case 'BudgetTransactionCreated':
        await this.handleTransactionCreated(event);
        break;
      case 'BudgetGoalReached':
        await this.handleGoalReached(event);
        break;
    }
  }

  protected async onShutdown(): Promise<void> {
    eventBus.unsubscribe('BudgetTransactionCreated', this.id);
    eventBus.unsubscribe('BudgetGoalReached', this.id);
    this.logger.info('Budget Agent shut down');
  }

  // ── Categorize Mode ──

  private async handleCategorize(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as CategorizePayload;
    const userId = payload.userId;

    // Construire le texte des transactions
    let transactionsText = 'Aucune transaction structuree';
    if (payload.transactions && payload.transactions.length > 0) {
      transactionsText = payload.transactions.map((t) =>
        `${t.description} | ${t.amountCents / 100} EUR | ${t.type} | ${t.date ?? 'aujourd\'hui'}`,
      ).join('\n');
    }

    const rawText = payload.rawText ?? 'Aucun texte brut';

    const prompt = CATEGORIZE_PROMPT
      .replace('{transactions}', transactionsText)
      .replace('{rawText}', rawText);

    // Use Haiku (ultra-fast) for categorization — simple classification, no complex reasoning needed
    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: 'ultra-fast',
      systemPrompt: BUDGET_HAIKU_CATEGORIZE_SYSTEM_PROMPT,
      userMessage: prompt,
      maxTokens: 1024,
      enableMemoization: true,
      memoizationTtlSeconds: 300, // 5 min — same bank statement submitted twice
    });

    let categorizeResult: Record<string, unknown>;
    try {
      categorizeResult = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      categorizeResult = { categorized: [], uncategorized: [], summary: llmResponse.content };
    }

    // Sauvegarder les transactions categoriees en DB
    const categorized = (categorizeResult['categorized'] as Array<Record<string, unknown>>) ?? [];
    const savedIds: string[] = [];

    for (const tx of categorized) {
      const saved = await createTransaction(userId, {
        description: tx['description'] as string,
        amountCents: tx['amountCents'] as number,
        type: tx['type'] as TransactionType,
        category: tx['category'] as BudgetCategory,
        date: tx['date'] ? new Date(tx['date'] as string) : new Date(),
      });

      if (saved) {
        savedIds.push(saved.id);
        await eventBus.publish('BudgetTransactionCreated', this.id, {
          userId,
          transactionId: saved.id,
          category: saved.category,
          amountCents: saved.amountCents,
          type: saved.type,
        });
      }
    }

    await memoryManager.store({
      content: `Categorise ${categorized.length} transactions pour l'utilisateur ${userId}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'budget_categorization', userId, count: categorized.length },
    });

    return {
      ...categorizeResult,
      savedTransactionIds: savedIds,
      disclaimer: BUDGET_DISCLAIMER,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Project Mode ──

  private async handleProject(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as ProjectPayload;
    const userId = payload.userId;
    const monthsAhead = payload.monthsAhead ?? 3;
    const scenario = payload.scenario ?? 'realiste';

    // Recuperer l'historique recent (3 derniers mois)
    const now = new Date();
    const threeMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 3, 1);
    const transactions = await getTransactions(userId, {
      startDate: threeMonthsAgo.toISOString().slice(0, 10),
    });

    const recentData = transactions.length > 0
      ? this.formatTransactionsForLLM(transactions)
      : 'Aucune transaction recente';

    const prompt = PROJECT_PROMPT
      .replace('{monthsAhead}', String(monthsAhead))
      .replace('{scenario}', scenario)
      .replace('{recentData}', recentData);

    const llmResponse = await LLMRouter.route({
      agentId: this.id,
      agentName: this.name,
      modelTier: this.modelTier,
      systemPrompt: BUDGET_SYSTEM_PROMPT,
      userMessage: prompt,
    });

    let projectionResult: Record<string, unknown>;
    try {
      projectionResult = JSON.parse(llmResponse.content) as Record<string, unknown>;
    } catch {
      projectionResult = {
        projections: [],
        scenario,
        assumptions: [],
        risks: [],
        recommendations: [llmResponse.content],
      };
    }

    await memoryManager.store({
      content: `Projection budget (${scenario}, ${monthsAhead}m) pour ${userId}`,
      source: this.name,
      agentId: this.id,
      metadata: { type: 'budget_projection', userId, scenario, monthsAhead },
    });

    return {
      ...projectionResult,
      disclaimer: BUDGET_DISCLAIMER,
      tokensUsed: llmResponse.totalTokens,
    };
  }

  // ── Goals Mode ──

  private async handleGoals(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as GoalsPayload;
    const userId = payload.userId;
    const action = payload.action ?? 'list';

    switch (action) {
      case 'list': {
        const goals = await getGoals(userId);
        return {
          goals: goals.map(g => ({
            id: g.id,
            name: g.name,
            targetCents: g.targetCents,
            currentCents: g.currentCents,
            progressPct: g.targetCents > 0
              ? Math.round((g.currentCents / g.targetCents) * 100)
              : 0,
            status: g.status,
            deadline: g.deadline,
            category: g.category,
          })),
          total: goals.length,
          activeCount: goals.filter(g => g.status === 'active').length,
          reachedCount: goals.filter(g => g.status === 'reached').length,
          disclaimer: BUDGET_DISCLAIMER,
        };
      }

      case 'create': {
        if (!payload.goalData?.name || !payload.goalData?.targetCents) {
          return {
            error: 'Le nom et le montant cible sont requis pour creer un objectif.',
            disclaimer: BUDGET_DISCLAIMER,
          };
        }

        const goal = await createGoal(userId, {
          name: payload.goalData.name,
          targetCents: payload.goalData.targetCents,
          deadline: payload.goalData.deadline,
          category: payload.goalData.category,
          notes: payload.goalData.notes,
        });

        if (!goal) {
          return {
            error: 'Impossible de creer l\'objectif. Base de donnees indisponible.',
            disclaimer: BUDGET_DISCLAIMER,
          };
        }

        return { created: true, goal, disclaimer: BUDGET_DISCLAIMER };
      }

      case 'update': {
        if (!payload.goalId) {
          return {
            error: 'goalId est requis pour mettre a jour un objectif.',
            disclaimer: BUDGET_DISCLAIMER,
          };
        }

        const updates: Record<string, unknown> = {};
        if (payload.currentCents !== undefined) updates['currentCents'] = payload.currentCents;
        if (payload.goalData?.status) updates['status'] = payload.goalData.status;
        if (payload.goalData?.name) updates['name'] = payload.goalData.name;
        if (payload.goalData?.notes !== undefined) updates['notes'] = payload.goalData.notes;

        const updated = await updateGoal(payload.goalId, userId, updates);
        if (!updated) {
          return {
            error: 'Objectif non trouve ou mise a jour impossible.',
            disclaimer: BUDGET_DISCLAIMER,
          };
        }

        // Verifier si l'objectif est atteint
        if (updated.status === 'reached') {
          await eventBus.publish('BudgetGoalReached', this.id, {
            userId,
            goalId: updated.id,
            goalName: updated.name,
            targetCents: updated.targetCents,
          });
        }

        return {
          updated: true,
          goal: {
            id: updated.id,
            name: updated.name,
            currentCents: updated.currentCents,
            targetCents: updated.targetCents,
            progressPct: Math.round((updated.currentCents / updated.targetCents) * 100),
            status: updated.status,
          },
          disclaimer: BUDGET_DISCLAIMER,
        };
      }

      case 'suggest': {
        // Recuperer le profil financier pour les suggestions
        const now = new Date();
        const summary = await getMonthlySummary(userId, now.getMonth() + 1, now.getFullYear());
        const existingGoals = await getGoals(userId);

        const goalsText = existingGoals.length > 0
          ? existingGoals.map(g => `${g.name}: ${g.currentCents}/${g.targetCents} cents (${g.status})`).join('\n')
          : 'Aucun objectif existant';

        const currentBudget = JSON.stringify({
          monthlyIncome: summary.totalIncomeCents,
          monthlyExpense: summary.totalExpenseCents,
          savingsRate: summary.savingsRatePct,
          topCategories: summary.topExpenseCategories,
        });

        const prompt = GOALS_PROMPT
          .replace('{action}', 'suggest')
          .replace('{goals}', goalsText)
          .replace('{currentBudget}', currentBudget);

        const llmResponse = await LLMRouter.route({
          agentId: this.id,
          agentName: this.name,
          modelTier: this.modelTier,
          systemPrompt: BUDGET_SYSTEM_PROMPT,
          userMessage: prompt,
        });

        let suggestions: Record<string, unknown>;
        try {
          suggestions = JSON.parse(llmResponse.content) as Record<string, unknown>;
        } catch {
          suggestions = { suggestions: [], advice: llmResponse.content };
        }

        return {
          ...suggestions,
          disclaimer: BUDGET_DISCLAIMER,
          tokensUsed: llmResponse.totalTokens,
        };
      }

      default:
        return {
          error: `Action objectif inconnue: ${String(action)}`,
          disclaimer: BUDGET_DISCLAIMER,
        };
    }
  }

  // ── Summary Mode ──

  private async handleSummary(task: AgentTask): Promise<Record<string, unknown>> {
    const payload = task.payload as unknown as SummaryPayload;
    const userId = payload.userId;
    const now = new Date();
    const month = payload.month ?? (now.getMonth() + 1);
    const year = payload.year ?? now.getFullYear();

    const summary = await getMonthlySummary(userId, month, year);
    const formattedSummary = formatBudgetSummary(summary);

    if (summary.transactionCount === 0) {
      return {
        summary,
        formattedSummary,
        message: 'Aucune transaction trouvee pour ce mois.',
        disclaimer: BUDGET_DISCLAIMER,
      };
    }

    if (payload.includeAdvice) {
      const prompt = SUMMARY_PROMPT
        .replace('{month}', String(month))
        .replace('{year}', String(year))
        .replace('{data}', JSON.stringify(summary));

      const llmResponse = await LLMRouter.route({
        agentId: this.id,
        agentName: this.name,
        modelTier: this.modelTier,
        systemPrompt: BUDGET_SYSTEM_PROMPT,
        userMessage: prompt,
      });

      let advice: Record<string, unknown>;
      try {
        advice = JSON.parse(llmResponse.content) as Record<string, unknown>;
      } catch {
        advice = { overview: llmResponse.content };
      }

      await memoryManager.store({
        content: `Bilan budget ${month}/${year} pour ${userId}: ${summary.savingsRatePct}% epargne`,
        source: this.name,
        agentId: this.id,
        metadata: { type: 'budget_summary', userId, month, year },
      });

      return {
        summary,
        formattedSummary,
        advice,
        disclaimer: BUDGET_DISCLAIMER,
        tokensUsed: llmResponse.totalTokens,
      };
    }

    return {
      summary,
      formattedSummary,
      disclaimer: BUDGET_DISCLAIMER,
    };
  }

  // ── Helpers ──

  private formatTransactionsForLLM(transactions: BudgetTransaction[]): string {
    return transactions.map(t =>
      `${t.date.toISOString().slice(0, 10)} | ${t.type === 'income' ? '+' : '-'}${t.amountCents / 100} EUR | ${t.category} | ${t.description}`,
    ).join('\n');
  }

  // ── Event Handlers ──

  private async handleTransactionCreated(event: SystemEvent): Promise<void> {
    this.logger.debug('Transaction budget creee', {
      transactionId: event.payload['transactionId'],
      category: event.payload['category'],
      amountCents: event.payload['amountCents'],
    });
  }

  private async handleGoalReached(event: SystemEvent): Promise<void> {
    this.logger.info('Objectif budget atteint !', {
      goalId: event.payload['goalId'],
      goalName: event.payload['goalName'],
      targetCents: event.payload['targetCents'],
    });
  }
}
