import { ComptableAgent, COMPTABLE_AGENT_CONFIG } from './comptable.agent';
import {
  COMPTABLE_SYSTEM_PROMPT,
  COMPTABLE_DISCLAIMER,
  INVOICE_PROMPT,
  EXPENSE_PROMPT,
  QUARTERLY_PROMPT,
  URSSAF_PROMPT,
} from './comptable.prompts';
import {
  formatInvoice,
  computeInvoiceTotals,
  COMPTABLE_DISCLAIMER as TOOLS_DISCLAIMER,
} from './comptable.tools';
import type { AgentTask } from '../../../base/agent.types';
import type {
  ComptableTaskType,
  FreelanceRecordType,
  PaymentStatus,
  ExpenseCategory,
  ReminderType,
  InvoiceData,
  InvoiceLineItem,
} from './comptable.types';

// ── Mocks ──

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        response: 'Analyse comptable effectuee.',
        disclaimer: 'Consultez un expert-comptable.',
        alerts: [],
      }),
      model: 'claude-sonnet',
      inputTokens: 150,
      outputTokens: 80,
      totalTokens: 230,
      stopReason: 'end_turn',
      latencyMs: 400,
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

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-comptable-1',
    title: 'Comptable Task',
    description: 'Test comptable task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

// ── Agent Configuration Tests ──

describe('ComptableAgent', () => {
  let agent: ComptableAgent;

  beforeEach(() => {
    agent = new ComptableAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('has correct agent id', () => {
      expect(COMPTABLE_AGENT_CONFIG.id).toBe('comptable-agent');
    });

    it('has correct agent name', () => {
      expect(COMPTABLE_AGENT_CONFIG.name).toBe('Comptable Agent');
    });

    it('is level 1 agent', () => {
      expect(COMPTABLE_AGENT_CONFIG.level).toBe(1);
    });

    it('uses fast model tier', () => {
      expect(COMPTABLE_AGENT_CONFIG.modelTier).toBe('fast');
    });

    it('has invoice-generation capability', () => {
      expect(COMPTABLE_AGENT_CONFIG.capabilities).toContain('invoice-generation');
    });

    it('has expense-tracking capability', () => {
      expect(COMPTABLE_AGENT_CONFIG.capabilities).toContain('expense-tracking');
    });

    it('has quarterly-report capability', () => {
      expect(COMPTABLE_AGENT_CONFIG.capabilities).toContain('quarterly-report');
    });

    it('has urssaf-reminders capability', () => {
      expect(COMPTABLE_AGENT_CONFIG.capabilities).toContain('urssaf-reminders');
    });

    it('initializes with correct properties', () => {
      expect(agent.name).toBe('Comptable Agent');
      expect(agent.level).toBe(1);
      expect(agent.modelTier).toBe('fast');
    });
  });

  describe('Lifecycle', () => {
    it('subscribes to FreelanceReminderDue on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith(
        'FreelanceReminderDue',
        expect.any(Function),
        agent.id,
      );
    });

    it('unsubscribes from FreelanceReminderDue on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('FreelanceReminderDue', agent.id);
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

  describe('Task Execution — Invoice', () => {
    it('handles invoice task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'invoice',
          userId: 'user-1',
          clientName: 'Acme Corp',
          lineItems: [
            { description: 'Dev web', quantity: 1, unitPriceCents: 500000, tvaRate: 20 },
          ],
          notes: 'Projet X',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('disclaimer', COMPTABLE_DISCLAIMER);
    });

    it('generates invoice with formatted text', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'invoice',
          userId: 'user-1',
          clientName: 'Test Client',
          lineItems: [],
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('formattedInvoice');
    });

    it('includes LLM analysis in invoice result', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'invoice',
          userId: 'user-1',
          clientName: 'Client LLM',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('llmAnalysis');
    });
  });

  describe('Task Execution — Expense', () => {
    it('handles expense task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'expense',
          userId: 'user-1',
          amountCents: 5000,
          description: 'Abonnement logiciel',
          category: 'logiciel',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('disclaimer', COMPTABLE_DISCLAIMER);
    });

    it('includes record in expense result', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'expense',
          userId: 'user-1',
          amountCents: 2000,
          description: 'Metro',
          category: 'deplacement',
          tvaRate: 10,
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('llmAnalysis');
    });
  });

  describe('Task Execution — Quarterly', () => {
    it('handles quarterly task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'quarterly',
          userId: 'user-1',
          quarter: 'Q1',
          year: 2026,
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('summary');
      expect(result.output).toHaveProperty('disclaimer', COMPTABLE_DISCLAIMER);
    });

    it('returns empty summary when no records', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'quarterly',
          userId: 'user-1',
          quarter: 'Q1',
          year: 2026,
        },
      }));
      const summary = result.output['summary'] as Record<string, unknown>;
      expect(summary).toHaveProperty('totalRevenueCents', 0);
      expect(summary).toHaveProperty('totalExpenseCents', 0);
    });
  });

  describe('Task Execution — URSSAF', () => {
    it('handles urssaf check task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'urssaf',
          userId: 'user-1',
          action: 'check',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('reminders');
      expect(result.output).toHaveProperty('disclaimer', COMPTABLE_DISCLAIMER);
    });

    it('handles urssaf calculate task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'urssaf',
          userId: 'user-1',
          action: 'calculate',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('llmAnalysis');
    });

    it('handles urssaf reminders task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'urssaf',
          userId: 'user-1',
          action: 'reminders',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('upcomingReminders');
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
      expect(result.output).toHaveProperty('disclaimer', COMPTABLE_DISCLAIMER);
    });
  });
});

// ── Prompts Tests ──

describe('Comptable Prompts', () => {
  it('system prompt is defined and long', () => {
    expect(COMPTABLE_SYSTEM_PROMPT).toBeDefined();
    expect(COMPTABLE_SYSTEM_PROMPT.length).toBeGreaterThan(200);
  });

  it('system prompt contains disclaimer', () => {
    expect(COMPTABLE_SYSTEM_PROMPT).toContain(COMPTABLE_DISCLAIMER);
  });

  it('system prompt mentions micro-entrepreneur', () => {
    expect(COMPTABLE_SYSTEM_PROMPT.toLowerCase()).toContain('micro-entrepreneur');
  });

  it('system prompt mentions URSSAF', () => {
    expect(COMPTABLE_SYSTEM_PROMPT).toContain('URSSAF');
  });

  it('system prompt mentions TVA', () => {
    expect(COMPTABLE_SYSTEM_PROMPT).toContain('TVA');
  });

  it('system prompt mentions CFE', () => {
    expect(COMPTABLE_SYSTEM_PROMPT).toContain('CFE');
  });

  it('invoice prompt contains template variables', () => {
    expect(INVOICE_PROMPT).toContain('{clientInfo}');
    expect(INVOICE_PROMPT).toContain('{lineItems}');
  });

  it('expense prompt contains template variables', () => {
    expect(EXPENSE_PROMPT).toContain('{description}');
    expect(EXPENSE_PROMPT).toContain('{amount}');
    expect(EXPENSE_PROMPT).toContain('{category}');
  });

  it('quarterly prompt contains template variables', () => {
    expect(QUARTERLY_PROMPT).toContain('{quarter}');
    expect(QUARTERLY_PROMPT).toContain('{year}');
    expect(QUARTERLY_PROMPT).toContain('{data}');
  });

  it('urssaf prompt contains template variables', () => {
    expect(URSSAF_PROMPT).toContain('{action}');
    expect(URSSAF_PROMPT).toContain('{userData}');
  });

  it('disclaimer is not empty', () => {
    expect(COMPTABLE_DISCLAIMER.length).toBeGreaterThan(10);
  });

  it('disclaimer contains warning about expert-comptable', () => {
    expect(COMPTABLE_DISCLAIMER).toContain('expert-comptable');
  });
});

// ── Tools Tests ──

describe('Comptable Tools', () => {
  describe('COMPTABLE_DISCLAIMER re-export', () => {
    it('tools re-exports disclaimer', () => {
      expect(TOOLS_DISCLAIMER).toBe(COMPTABLE_DISCLAIMER);
    });
  });

  describe('formatInvoice', () => {
    const baseInvoice: InvoiceData = {
      invoiceNumber: 'FAC-2026-0001',
      invoiceDate: '2026-03-01',
      dueDate: '2026-03-31',
      clientName: 'Acme Corp',
      clientAddress: '123 Rue du Test',
      clientSiret: '12345678901234',
      freelanceName: 'Jean Dupont',
      freelanceAddress: '456 Avenue du Dev',
      freelanceSiret: '98765432109876',
      lineItems: [
        { description: 'Developpement web', quantity: 10, unitPriceCents: 50000, tvaRate: 20 },
      ],
      totalHtCents: 500000,
      totalTvaCents: 100000,
      totalTtcCents: 600000,
      paymentTerms: 'Paiement a 30 jours',
      notes: 'Projet Alpha',
    };

    it('returns a non-empty string', () => {
      const result = formatInvoice(baseInvoice);
      expect(result.length).toBeGreaterThan(0);
    });

    it('contains invoice number', () => {
      const result = formatInvoice(baseInvoice);
      expect(result).toContain('FAC-2026-0001');
    });

    it('contains client name', () => {
      const result = formatInvoice(baseInvoice);
      expect(result).toContain('Acme Corp');
    });

    it('contains freelance name', () => {
      const result = formatInvoice(baseInvoice);
      expect(result).toContain('Jean Dupont');
    });

    it('contains FACTURE header', () => {
      const result = formatInvoice(baseInvoice);
      expect(result).toContain('F A C T U R E');
    });

    it('contains disclaimer', () => {
      const result = formatInvoice(baseInvoice);
      expect(result).toContain(COMPTABLE_DISCLAIMER);
    });

    it('contains payment terms', () => {
      const result = formatInvoice(baseInvoice);
      expect(result).toContain('Paiement a 30 jours');
    });

    it('contains notes', () => {
      const result = formatInvoice(baseInvoice);
      expect(result).toContain('Projet Alpha');
    });

    it('contains mentions legales', () => {
      const result = formatInvoice(baseInvoice);
      expect(result).toContain('art. 293 B du CGI');
    });
  });

  describe('computeInvoiceTotals', () => {
    it('computes totals for single item with no TVA', () => {
      const items: InvoiceLineItem[] = [
        { description: 'Service', quantity: 1, unitPriceCents: 10000, tvaRate: 0 },
      ];
      const totals = computeInvoiceTotals(items);
      expect(totals.totalHtCents).toBe(10000);
      expect(totals.totalTvaCents).toBe(0);
      expect(totals.totalTtcCents).toBe(10000);
    });

    it('computes totals for single item with 20% TVA', () => {
      const items: InvoiceLineItem[] = [
        { description: 'Service', quantity: 1, unitPriceCents: 10000, tvaRate: 20 },
      ];
      const totals = computeInvoiceTotals(items);
      expect(totals.totalHtCents).toBe(10000);
      expect(totals.totalTvaCents).toBe(2000);
      expect(totals.totalTtcCents).toBe(12000);
    });

    it('computes totals for multiple items', () => {
      const items: InvoiceLineItem[] = [
        { description: 'Dev', quantity: 2, unitPriceCents: 50000, tvaRate: 20 },
        { description: 'Design', quantity: 1, unitPriceCents: 30000, tvaRate: 20 },
      ];
      const totals = computeInvoiceTotals(items);
      expect(totals.totalHtCents).toBe(130000);
      expect(totals.totalTvaCents).toBe(26000);
      expect(totals.totalTtcCents).toBe(156000);
    });

    it('returns zero for empty items', () => {
      const totals = computeInvoiceTotals([]);
      expect(totals.totalHtCents).toBe(0);
      expect(totals.totalTvaCents).toBe(0);
      expect(totals.totalTtcCents).toBe(0);
    });

    it('handles quantity greater than 1', () => {
      const items: InvoiceLineItem[] = [
        { description: 'Widget', quantity: 5, unitPriceCents: 1000, tvaRate: 10 },
      ];
      const totals = computeInvoiceTotals(items);
      expect(totals.totalHtCents).toBe(5000);
      expect(totals.totalTvaCents).toBe(500);
      expect(totals.totalTtcCents).toBe(5500);
    });
  });
});

// ── Types Tests ──

describe('Comptable Types', () => {
  it('validates task types', () => {
    const types: ComptableTaskType[] = ['invoice', 'expense', 'quarterly', 'urssaf'];
    expect(types).toHaveLength(4);
  });

  it('validates record types', () => {
    const types: FreelanceRecordType[] = ['revenue', 'expense'];
    expect(types).toHaveLength(2);
  });

  it('validates payment statuses', () => {
    const statuses: PaymentStatus[] = ['pending', 'paid', 'overdue', 'cancelled'];
    expect(statuses).toHaveLength(4);
  });

  it('validates expense categories', () => {
    const categories: ExpenseCategory[] = [
      'materiel', 'logiciel', 'deplacement', 'repas', 'formation',
      'assurance', 'loyer', 'telephone', 'internet', 'comptabilite',
      'bancaire', 'autre',
    ];
    expect(categories).toHaveLength(12);
  });

  it('validates reminder types', () => {
    const types: ReminderType[] = [
      'urssaf_declaration', 'tva_declaration', 'cfe',
      'impot_revenu', 'facture_relance', 'custom',
    ];
    expect(types).toHaveLength(6);
  });
});
