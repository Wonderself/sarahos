// ═══════════════════════════════════════════════════════
// ImpotsAgent — Test Suite
// ═══════════════════════════════════════════════════════

import { ImpotsAgent, IMPOTS_AGENT_CONFIG } from './impots.agent';
import {
  FISCAL_DISCLAIMER,
  getCurrentFiscalYear,
  getKeyDates,
  getTaxBrackets,
  getMarginalTaxRate,
} from './impots.tools';
import { IMPOTS_SYSTEM_PROMPT, FISCAL_DISCLAIMER as PROMPT_DISCLAIMER } from './impots.prompts';
import type { AgentTask } from '../../../base/agent.types';
import type { ImpotsTaskType } from './impots.types';

// ── Mocks ──

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        topic: 'Impot sur le revenu',
        explanation: 'L\'IR est calcule selon un bareme progressif...',
        references: ['Art. 1 A du CGI'],
        tips: ['Declarez en ligne pour un delai supplementaire'],
        disclaimer: 'Guide informatif uniquement.',
      }),
      model: 'claude-sonnet',
      inputTokens: 250,
      outputTokens: 200,
      totalTokens: 450,
      stopReason: 'end_turn',
      latencyMs: 700,
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

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-impots-1',
    title: 'Tax Task',
    description: 'Test tax task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

// ── Agent Configuration Tests ──

describe('ImpotsAgent', () => {
  let agent: ImpotsAgent;

  beforeEach(() => {
    agent = new ImpotsAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should have correct agent id', () => {
      expect(agent.id).toBe('impots-agent');
    });

    it('should have correct agent name', () => {
      expect(agent.name).toBe('Impots Agent');
    });

    it('should be level 1', () => {
      expect(agent.level).toBe(1);
    });

    it('should use fast model tier', () => {
      expect(agent.modelTier).toBe('fast');
    });

    it('should have tax-guide capability', () => {
      expect(agent.capabilities).toContain('tax-guide');
    });

    it('should have deductions capability', () => {
      expect(agent.capabilities).toContain('deductions');
    });

    it('should have fiscal-calendar capability', () => {
      expect(agent.capabilities).toContain('fiscal-calendar');
    });

    it('should have tax-simulation capability', () => {
      expect(agent.capabilities).toContain('tax-simulation');
    });

    it('should have exactly 4 capabilities', () => {
      expect(IMPOTS_AGENT_CONFIG.capabilities).toHaveLength(4);
    });
  });

  describe('Lifecycle', () => {
    it('should subscribe to events on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith('TaxQuestionAsked', expect.any(Function), agent.id);
      expect(eventBus.subscribe).toHaveBeenCalledWith('FiscalCalendarRequested', expect.any(Function), agent.id);
    });

    it('should unsubscribe from events on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('TaxQuestionAsked', agent.id);
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('FiscalCalendarRequested', agent.id);
    });
  });

  describe('Task Execution', () => {
    it('should handle guide task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'guide',
          topic: 'Impot sur le revenu',
          taxpayerProfile: 'salarie',
          situation: 'Premiere declaration',
          fiscalYear: '2025',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('taskType', 'guide');
      expect(result.output).toHaveProperty('advice');
      expect(result.output).toHaveProperty('disclaimer');
      expect(result.output['disclaimer']).toContain('guide informatif');
    });

    it('should handle deductions task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'deductions',
          income: '50000',
          familySituation: 'marie',
          taxParts: '2',
          eligibleExpenses: 'Dons aux associations, emploi a domicile',
          fiscalYear: '2025',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('taskType', 'deductions');
      expect(result.output).toHaveProperty('advice');
      expect(result.output).toHaveProperty('disclaimer');
    });

    it('should handle calendar task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'calendar',
          fiscalYear: '2026',
          taxpayerType: 'salarie',
          department: '75',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('taskType', 'calendar');
      expect(result.output).toHaveProperty('keyDates');
      expect(result.output).toHaveProperty('disclaimer');
      expect(Array.isArray(result.output['keyDates'])).toBe(true);
    });

    it('should handle simulate task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'simulate',
          taxableIncome: '45000',
          familySituation: 'celibataire',
          taxParts: '1',
          fiscalYear: '2025',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('taskType', 'simulate');
      expect(result.output).toHaveProperty('advice');
      expect(result.output).toHaveProperty('disclaimer');
    });

    it('should return error for unknown task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(String(result.output['error'])).toContain('Unknown impots task type');
      expect(result.output).toHaveProperty('disclaimer');
    });

    it('should default to guide when no type specified', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { topic: 'Question fiscale generale' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('taskType', 'guide');
    });

    it('should always include fiscal disclaimer in response', async () => {
      await agent.initialize();

      const types: ImpotsTaskType[] = ['guide', 'deductions', 'calendar', 'simulate'];
      for (const type of types) {
        const result = await agent.execute(makeTask({ payload: { type } }));
        expect(result.output).toHaveProperty('disclaimer');
        expect(String(result.output['disclaimer'])).toContain('guide informatif');
      }
    });
  });
});

// ── System Prompt Tests ──

describe('Impots Prompts', () => {
  it('should have a defined and non-empty system prompt', () => {
    expect(IMPOTS_SYSTEM_PROMPT).toBeDefined();
    expect(IMPOTS_SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it('should contain the mandatory disclaimer in the system prompt', () => {
    expect(IMPOTS_SYSTEM_PROMPT).toContain('Consultez un expert-comptable');
    expect(IMPOTS_SYSTEM_PROMPT).toContain('impots.gouv.fr');
  });

  it('should describe all 4 capabilities', () => {
    expect(IMPOTS_SYSTEM_PROMPT).toContain('GUIDE');
    expect(IMPOTS_SYSTEM_PROMPT).toContain('DEDUCTIONS');
    expect(IMPOTS_SYSTEM_PROMPT).toContain('CALENDAR');
    expect(IMPOTS_SYSTEM_PROMPT).toContain('SIMULATE');
  });

  it('should require JSON responses', () => {
    expect(IMPOTS_SYSTEM_PROMPT).toContain('JSON valide');
  });

  it('should mandate the disclaimer in every response', () => {
    expect(IMPOTS_SYSTEM_PROMPT).toContain('disclaimer');
  });

  it('should export FISCAL_DISCLAIMER from prompts', () => {
    expect(PROMPT_DISCLAIMER).toBeDefined();
    expect(PROMPT_DISCLAIMER).toContain('guide informatif uniquement');
  });
});

// ── Tool Tests ──

describe('Impots Tools', () => {
  it('FISCAL_DISCLAIMER is defined and contains the required text', () => {
    expect(FISCAL_DISCLAIMER).toBeDefined();
    expect(FISCAL_DISCLAIMER).toContain('guide informatif uniquement');
    expect(FISCAL_DISCLAIMER).toContain('expert-comptable');
    expect(FISCAL_DISCLAIMER).toContain('impots.gouv.fr');
  });

  it('getCurrentFiscalYear returns correct years', () => {
    const result = getCurrentFiscalYear();
    expect(result.declarationYear).toBe(new Date().getFullYear());
    expect(result.incomeYear).toBe(new Date().getFullYear() - 1);
  });

  it('getKeyDates returns dates for the given year', () => {
    const dates = getKeyDates(2026);
    expect(dates.length).toBeGreaterThan(0);
    expect(dates[0]!.date).toContain('2026');
  });

  it('getKeyDates includes declaration dates', () => {
    const dates = getKeyDates(2026);
    const declarations = dates.filter(d => d.category === 'declaration');
    expect(declarations.length).toBeGreaterThan(0);
  });

  it('getKeyDates includes payment dates', () => {
    const dates = getKeyDates(2026);
    const payments = dates.filter(d => d.category === 'payment');
    expect(payments.length).toBeGreaterThan(0);
  });

  it('getTaxBrackets returns 5 brackets', () => {
    const brackets = getTaxBrackets(2025);
    expect(brackets).toHaveLength(5);
  });

  it('getTaxBrackets starts at 0% rate', () => {
    const brackets = getTaxBrackets(2025);
    expect(brackets[0]!.rate).toBe(0);
  });

  it('getTaxBrackets ends at 45% rate', () => {
    const brackets = getTaxBrackets(2025);
    expect(brackets[brackets.length - 1]!.rate).toBe(45);
    expect(brackets[brackets.length - 1]!.max).toBeNull();
  });

  it('getMarginalTaxRate returns 0% for low income', () => {
    expect(getMarginalTaxRate(8000, 2025)).toBe(0);
  });

  it('getMarginalTaxRate returns 30% for middle income', () => {
    expect(getMarginalTaxRate(50000, 2025)).toBe(30);
  });

  it('getMarginalTaxRate returns 45% for high income', () => {
    expect(getMarginalTaxRate(200000, 2025)).toBe(45);
  });
});

// ── Types Coverage ──

describe('Impots Types', () => {
  it('validates task type union', () => {
    const types: ImpotsTaskType[] = ['guide', 'deductions', 'calendar', 'simulate'];
    expect(types).toHaveLength(4);
  });
});
