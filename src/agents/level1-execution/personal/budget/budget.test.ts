import { BudgetAgent, BUDGET_AGENT_CONFIG } from './budget.agent';
import {
  BUDGET_SYSTEM_PROMPT,
  BUDGET_DISCLAIMER,
  CATEGORIZE_PROMPT,
  PROJECT_PROMPT,
  GOALS_PROMPT,
  SUMMARY_PROMPT,
} from './budget.prompts';
import {
  deleteTransaction,
  getMonthlySummary,
  formatBudgetSummary,
} from './budget.tools';
import type { AgentTask } from '../../../base/agent.types';
import type {
  BudgetTaskType,
  BudgetCategory,
  TransactionType,
  GoalStatus,
  BudgetSummary,
} from './budget.types';

// ── Mocks ──

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        categorized: [
          { description: 'Carrefour', amountCents: 5200, type: 'expense', category: 'alimentation', confidence: 95, date: '2026-03-01' },
        ],
        uncategorized: [],
        summary: '1 transaction categorisee',
      }),
      model: 'claude-sonnet',
      inputTokens: 200,
      outputTokens: 150,
      totalTokens: 350,
      stopReason: 'end_turn',
      latencyMs: 500,
    }),
  },
}));

jest.mock('../../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({
      id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: new Date().toISOString(),
    }),
  },
}));

jest.mock('../../../../core/memory/memory-manager', () => ({
  memoryManager: {
    store: jest.fn().mockResolvedValue({ id: 'mem-1', content: '', metadata: {}, source: '', createdAt: '' }),
    search: jest.fn().mockResolvedValue([]),
  },
}));

jest.mock('../../../../infra', () => ({
  dbClient: {
    isConnected: jest.fn().mockReturnValue(true),
    query: jest.fn().mockResolvedValue({ rows: [], rowCount: 0 }),
  },
}));

// ── Helpers ──

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-budget-1',
    title: 'Budget Task',
    description: 'Test budget task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-budget-1',
    ...overrides,
  };
}

function makeMockTransactionRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'tx-1',
    user_id: 'user-1',
    amount_cents: 5200,
    type: 'expense',
    category: 'alimentation',
    description: 'Courses Carrefour',
    date: '2026-03-01',
    recurring: false,
    recurring_frequency: null,
    tags: ['courses'],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

function makeMockGoalRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'goal-1',
    user_id: 'user-1',
    name: 'Fonds d\'urgence',
    target_cents: 300000,
    current_cents: 150000,
    deadline: '2026-12-31',
    status: 'active',
    category: 'epargne',
    notes: 'Objectif 3 mois de depenses',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// ── Agent Configuration Tests ──

describe('BudgetAgent', () => {
  let agent: BudgetAgent;

  beforeEach(() => {
    agent = new BudgetAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('has correct agent id', () => {
      expect(BUDGET_AGENT_CONFIG.id).toBe('budget-agent');
    });

    it('has correct agent name', () => {
      expect(BUDGET_AGENT_CONFIG.name).toBe('Budget Agent');
    });

    it('is level 1 agent', () => {
      expect(BUDGET_AGENT_CONFIG.level).toBe(1);
    });

    it('uses fast model tier', () => {
      expect(BUDGET_AGENT_CONFIG.modelTier).toBe('fast');
    });

    it('has budget-categorize capability', () => {
      expect(BUDGET_AGENT_CONFIG.capabilities).toContain('budget-categorize');
    });

    it('has budget-project capability', () => {
      expect(BUDGET_AGENT_CONFIG.capabilities).toContain('budget-project');
    });

    it('has budget-goals capability', () => {
      expect(BUDGET_AGENT_CONFIG.capabilities).toContain('budget-goals');
    });

    it('has budget-summary capability', () => {
      expect(BUDGET_AGENT_CONFIG.capabilities).toContain('budget-summary');
    });

    it('has system prompt set', () => {
      expect(BUDGET_AGENT_CONFIG.systemPrompt).toBe(BUDGET_SYSTEM_PROMPT);
    });

    it('initializes with correct properties', () => {
      expect(agent.name).toBe('Budget Agent');
      expect(agent.level).toBe(1);
      expect(agent.modelTier).toBe('fast');
    });
  });

  describe('Lifecycle', () => {
    it('subscribes to BudgetTransactionCreated on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith(
        'BudgetTransactionCreated',
        expect.any(Function),
        agent.id,
      );
    });

    it('subscribes to BudgetGoalReached on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith(
        'BudgetGoalReached',
        expect.any(Function),
        agent.id,
      );
    });

    it('unsubscribes from events on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('BudgetTransactionCreated', agent.id);
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('BudgetGoalReached', agent.id);
    });

    it('sets status to IDLE after initialize', async () => {
      await agent.initialize();
      expect(agent.status).toBe('IDLE');
    });

    it('sets status to DISABLED after shutdown', async () => {
      await agent.initialize();
      await agent.shutdown();
      expect(agent.status).toBe('DISABLED');
    });
  });

  describe('Task Execution — Categorize', () => {
    it('handles categorize task with structured transactions', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockTransactionRow()],
        rowCount: 1,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'categorize',
          userId: 'user-1',
          transactions: [
            { description: 'Carrefour', amountCents: 5200, type: 'expense', date: '2026-03-01' },
          ],
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('tokensUsed');
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });

    it('handles categorize task with raw text', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'categorize',
          userId: 'user-1',
          rawText: 'Carrefour 52 EUR, Netflix 13.99 EUR, Loyer 950 EUR',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });

    it('publishes BudgetTransactionCreated for saved transactions', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { publish: jest.Mock; subscribe: jest.Mock; unsubscribe: jest.Mock };
      };

      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockTransactionRow()],
        rowCount: 1,
      });

      await agent.initialize();
      await agent.execute(makeTask({
        payload: {
          type: 'categorize',
          userId: 'user-1',
          transactions: [{ description: 'Test', amountCents: 1000, type: 'expense' }],
        },
      }));

      expect(eventBus.publish).toHaveBeenCalledWith(
        'BudgetTransactionCreated',
        expect.any(String),
        expect.objectContaining({ userId: 'user-1' }),
      );
    });
  });

  describe('Task Execution — Project', () => {
    it('generates projections when transactions exist', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as {
        LLMRouter: { route: jest.Mock };
      };

      dbClient.query.mockResolvedValueOnce({
        rows: [
          makeMockTransactionRow(),
          makeMockTransactionRow({ id: 'tx-2', amount_cents: 95000, category: 'logement', description: 'Loyer' }),
        ],
        rowCount: 2,
      });

      LLMRouter.route.mockResolvedValueOnce({
        content: JSON.stringify({
          projections: [
            { month: '2026-04', incomeCents: 350000, expenseCents: 280000, balanceCents: 70000, savingsCents: 70000 },
          ],
          scenario: 'realiste',
          assumptions: ['Revenus stables'],
          risks: ['Hausse du loyer'],
          recommendations: ['Reduire restaurants'],
        }),
        totalTokens: 500,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'project', userId: 'user-1', monthsAhead: 3, scenario: 'realiste' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('projections');
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
      expect(result.output).toHaveProperty('tokensUsed', 500);
    });

    it('returns projection data when no transactions found', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'project', userId: 'user-1' },
      }));
      expect(result.success).toBe(true);
      // Still returns a result (LLM is still called with "Aucune transaction recente")
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });
  });

  describe('Task Execution — Goals', () => {
    it('lists goals', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockGoalRow()],
        rowCount: 1,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'goals', userId: 'user-1', action: 'list' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('goals');
      expect(result.output).toHaveProperty('total', 1);
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });

    it('creates a new goal', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockGoalRow()],
        rowCount: 1,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'goals', userId: 'user-1', action: 'create',
          goalData: { name: 'Vacances', targetCents: 200000 },
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('created', true);
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });

    it('returns error when creating goal without required fields', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'goals', userId: 'user-1', action: 'create', goalData: {} },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });

    it('publishes BudgetGoalReached when goal is met', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { publish: jest.Mock; subscribe: jest.Mock; unsubscribe: jest.Mock };
      };

      // updateGoal: auto-detect check
      dbClient.query.mockResolvedValueOnce({
        rows: [{ target_cents: 300000 }],
        rowCount: 1,
      });
      // updateGoal: update result
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockGoalRow({ current_cents: 300000, status: 'reached' })],
        rowCount: 1,
      });

      await agent.initialize();
      await agent.execute(makeTask({
        payload: {
          type: 'goals', userId: 'user-1', action: 'update',
          goalId: 'goal-1', currentCents: 300000,
        },
      }));

      expect(eventBus.publish).toHaveBeenCalledWith(
        'BudgetGoalReached',
        expect.any(String),
        expect.objectContaining({ goalId: 'goal-1' }),
      );
    });

    it('returns error for missing goalId on update', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'goals', userId: 'user-1', action: 'update' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });
  });

  describe('Task Execution — Summary', () => {
    it('returns empty month message when no transactions', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'summary', userId: 'user-1', month: 3, year: 2026 },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('message');
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });

    it('returns summary with advice when requested', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as {
        LLMRouter: { route: jest.Mock };
      };

      dbClient.query.mockResolvedValueOnce({
        rows: [{ total_income: 350000, total_expense: 280000, tx_count: 30 }],
        rowCount: 1,
      });
      dbClient.query.mockResolvedValueOnce({
        rows: [
          { category: 'logement', total: 95000 },
          { category: 'alimentation', total: 45000 },
        ],
        rowCount: 2,
      });

      LLMRouter.route.mockResolvedValueOnce({
        content: JSON.stringify({
          overview: 'Bon mois, 20% epargne',
          highlights: ['Taux d\'epargne de 20%'],
          warnings: ['Restaurants en hausse'],
          advice: ['Reduire les Uber Eats'],
          score: 78,
        }),
        totalTokens: 450,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'summary', userId: 'user-1', month: 3, year: 2026, includeAdvice: true },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('summary');
      expect(result.output).toHaveProperty('advice');
      expect(result.output).toHaveProperty('formattedSummary');
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
      expect(result.output).toHaveProperty('tokensUsed', 450);
    });

    it('returns summary without advice when not requested', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };

      dbClient.query.mockResolvedValueOnce({
        rows: [{ total_income: 350000, total_expense: 280000, tx_count: 25 }],
        rowCount: 1,
      });
      dbClient.query.mockResolvedValueOnce({
        rows: [{ category: 'logement', total: 95000 }],
        rowCount: 1,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'summary', userId: 'user-1', month: 3, year: 2026 },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('summary');
      expect(result.output).toHaveProperty('formattedSummary');
      expect(result.output).not.toHaveProperty('advice');
    });
  });

  describe('Task Execution — Unknown', () => {
    it('handles unknown task type gracefully', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(result.output).toHaveProperty('disclaimer', BUDGET_DISCLAIMER);
    });
  });
});

// ── Prompts Tests ──

describe('Budget Prompts', () => {
  it('system prompt is defined and substantial', () => {
    expect(BUDGET_SYSTEM_PROMPT).toBeDefined();
    expect(BUDGET_SYSTEM_PROMPT.length).toBeGreaterThan(200);
  });

  it('system prompt contains disclaimer', () => {
    expect(BUDGET_SYSTEM_PROMPT).toContain(BUDGET_DISCLAIMER);
  });

  it('system prompt mentions Sophie persona', () => {
    expect(BUDGET_SYSTEM_PROMPT).toContain('Sophie');
  });

  it('system prompt mentions the four modes', () => {
    expect(BUDGET_SYSTEM_PROMPT).toContain('CATEGORIZE');
    expect(BUDGET_SYSTEM_PROMPT).toContain('PROJECT');
    expect(BUDGET_SYSTEM_PROMPT).toContain('GOALS');
    expect(BUDGET_SYSTEM_PROMPT).toContain('SUMMARY');
  });

  it('system prompt mentions budget categories', () => {
    expect(BUDGET_SYSTEM_PROMPT).toContain('alimentation');
    expect(BUDGET_SYSTEM_PROMPT).toContain('logement');
    expect(BUDGET_SYSTEM_PROMPT).toContain('transport');
  });

  it('categorize prompt contains template variables', () => {
    expect(CATEGORIZE_PROMPT).toContain('{transactions}');
    expect(CATEGORIZE_PROMPT).toContain('{rawText}');
  });

  it('project prompt contains template variables', () => {
    expect(PROJECT_PROMPT).toContain('{monthsAhead}');
    expect(PROJECT_PROMPT).toContain('{scenario}');
    expect(PROJECT_PROMPT).toContain('{recentData}');
  });

  it('goals prompt contains template variables', () => {
    expect(GOALS_PROMPT).toContain('{action}');
    expect(GOALS_PROMPT).toContain('{goals}');
    expect(GOALS_PROMPT).toContain('{currentBudget}');
  });

  it('summary prompt contains template variables', () => {
    expect(SUMMARY_PROMPT).toContain('{month}');
    expect(SUMMARY_PROMPT).toContain('{year}');
    expect(SUMMARY_PROMPT).toContain('{data}');
  });

  it('disclaimer is not empty', () => {
    expect(BUDGET_DISCLAIMER.length).toBeGreaterThan(10);
  });

  it('disclaimer contains warning about conseiller financier', () => {
    expect(BUDGET_DISCLAIMER).toContain('conseiller financier');
  });
});

// ── Tools Tests ──

describe('Budget Tools', () => {
  describe('formatBudgetSummary', () => {
    const baseSummary: BudgetSummary = {
      month: 3,
      year: 2026,
      totalIncomeCents: 350000,
      totalExpenseCents: 280000,
      balanceCents: 70000,
      byCategory: { logement: 95000, alimentation: 45000, transport: 20000 },
      transactionCount: 30,
      topExpenseCategories: [
        { category: 'logement', amountCents: 95000, percentage: 34 },
        { category: 'alimentation', amountCents: 45000, percentage: 16 },
        { category: 'transport', amountCents: 20000, percentage: 7 },
      ],
      savingsRatePct: 20,
    };

    it('returns a non-empty string', () => {
      const result = formatBudgetSummary(baseSummary);
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains BILAN BUDGET header', () => {
      const result = formatBudgetSummary(baseSummary);
      expect(result).toContain('B I L A N   B U D G E T');
    });

    it('contains the month and year', () => {
      const result = formatBudgetSummary(baseSummary);
      expect(result).toContain('03/2026');
    });

    it('contains income amount', () => {
      const result = formatBudgetSummary(baseSummary);
      expect(result).toContain('3500.00 EUR');
    });

    it('contains expense amount', () => {
      const result = formatBudgetSummary(baseSummary);
      expect(result).toContain('2800.00 EUR');
    });

    it('contains savings rate', () => {
      const result = formatBudgetSummary(baseSummary);
      expect(result).toContain('20%');
    });

    it('contains top expense categories', () => {
      const result = formatBudgetSummary(baseSummary);
      expect(result).toContain('logement');
      expect(result).toContain('alimentation');
    });

    it('handles empty summary gracefully', () => {
      const emptySummary: BudgetSummary = {
        month: 1,
        year: 2026,
        totalIncomeCents: 0,
        totalExpenseCents: 0,
        balanceCents: 0,
        byCategory: {},
        transactionCount: 0,
        topExpenseCategories: [],
        savingsRatePct: 0,
      };
      const result = formatBudgetSummary(emptySummary);
      expect(result).toContain('B I L A N   B U D G E T');
      expect(result).toContain('0.00 EUR');
    });
  });

  describe('deleteTransaction', () => {
    it('returns false when DB not connected', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValueOnce(false);
      const result = await deleteTransaction('tx-1', 'user-1');
      expect(result).toBe(false);
    });

    it('returns true when transaction deleted', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 1 });
      const result = await deleteTransaction('tx-1', 'user-1');
      expect(result).toBe(true);
    });

    it('returns false when transaction not found', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const result = await deleteTransaction('nonexistent', 'user-1');
      expect(result).toBe(false);
    });
  });

  describe('getMonthlySummary', () => {
    it('returns default summary when DB not connected', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValueOnce(false);
      const summary = await getMonthlySummary('user-1', 3, 2026);
      expect(summary.totalIncomeCents).toBe(0);
      expect(summary.totalExpenseCents).toBe(0);
      expect(summary.transactionCount).toBe(0);
    });

    it('calculates savings rate correctly', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({
        rows: [{ total_income: 350000, total_expense: 280000, tx_count: 30 }],
        rowCount: 1,
      });
      dbClient.query.mockResolvedValueOnce({
        rows: [{ category: 'logement', total: 95000 }],
        rowCount: 1,
      });

      const summary = await getMonthlySummary('user-1', 3, 2026);
      expect(summary.savingsRatePct).toBe(20);
      expect(summary.balanceCents).toBe(70000);
    });
  });
});

// ── Types Tests ──

describe('Budget Types', () => {
  it('validates BudgetTaskType values', () => {
    const types: BudgetTaskType[] = ['categorize', 'project', 'goals', 'summary'];
    expect(types).toHaveLength(4);
  });

  it('validates BudgetCategory values', () => {
    const categories: BudgetCategory[] = [
      'alimentation', 'logement', 'transport', 'loisirs', 'sante',
      'vetements', 'abonnements', 'education', 'epargne', 'impots',
      'assurance', 'cadeaux', 'restaurant', 'voyage', 'electronique',
      'animaux', 'enfants', 'salaire', 'freelance', 'investissement',
      'remboursement', 'autre',
    ];
    expect(categories).toHaveLength(22);
  });

  it('validates TransactionType values', () => {
    const types: TransactionType[] = ['income', 'expense'];
    expect(types).toHaveLength(2);
  });

  it('validates GoalStatus values', () => {
    const statuses: GoalStatus[] = ['active', 'reached', 'abandoned', 'paused'];
    expect(statuses).toHaveLength(4);
  });
});
