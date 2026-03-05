// ═══════════════════════════════════════════════════════
// NegociateurAgent — Test Suite
// ═══════════════════════════════════════════════════════

import { NegociateurAgent, NEGOCIATEUR_AGENT_CONFIG } from './negociateur.agent';
import {
  formatNegotiationScript,
  buildCounterArguments,
  calculateSalaryAnchor,
  formatAmount,
  getRecommendedTechniques,
} from './negociateur.tools';
import { NEGOCIATEUR_SYSTEM_PROMPT } from './negociateur.prompts';
import type { AgentTask } from '../../../base/agent.types';
import type { NegociateurTaskType } from './negociateur.types';

// ── Mocks ──

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        analysis: 'Position forte',
        strategy: 'Ancrage haut',
        script: 'Bonjour, je souhaite discuter de...',
        counterArguments: [],
        batna: 'Offre concurrente',
        tips: ['Rester calme', 'Ecouter activement'],
      }),
      model: 'claude-sonnet',
      inputTokens: 200,
      outputTokens: 150,
      totalTokens: 350,
      stopReason: 'end_turn',
      latencyMs: 600,
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
    id: 'task-nego-1',
    title: 'Negotiation Task',
    description: 'Test negotiation task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

// ── Agent Configuration Tests ──

describe('NegociateurAgent', () => {
  let agent: NegociateurAgent;

  beforeEach(() => {
    agent = new NegociateurAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('should have correct agent id', () => {
      expect(agent.id).toBe('negociateur-agent');
    });

    it('should have correct agent name', () => {
      expect(agent.name).toBe('Negociateur Agent');
    });

    it('should be level 1', () => {
      expect(agent.level).toBe(1);
    });

    it('should use fast model tier', () => {
      expect(agent.modelTier).toBe('fast');
    });

    it('should have salary-negotiation capability', () => {
      expect(agent.capabilities).toContain('salary-negotiation');
    });

    it('should have rent-negotiation capability', () => {
      expect(agent.capabilities).toContain('rent-negotiation');
    });

    it('should have contract-negotiation capability', () => {
      expect(agent.capabilities).toContain('contract-negotiation');
    });

    it('should have roleplay capability', () => {
      expect(agent.capabilities).toContain('roleplay');
    });

    it('should have exactly 4 capabilities', () => {
      expect(NEGOCIATEUR_AGENT_CONFIG.capabilities).toHaveLength(4);
    });
  });

  describe('Lifecycle', () => {
    it('should subscribe to events on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith('NegotiationRequested', expect.any(Function), agent.id);
      expect(eventBus.subscribe).toHaveBeenCalledWith('RoleplayRequested', expect.any(Function), agent.id);
    });

    it('should unsubscribe from events on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('NegotiationRequested', agent.id);
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('RoleplayRequested', agent.id);
    });
  });

  describe('Task Execution', () => {
    it('should handle salary negotiation task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'salary',
          position: 'Senior Developer',
          currentSalary: '55000 EUR',
          targetSalary: '65000 EUR',
          seniority: '5 ans',
          sector: 'Tech',
          context: 'Entretien annuel',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('negotiationType', 'salary');
      expect(result.output).toHaveProperty('advice');
      expect(result.output).toHaveProperty('recommendedTechniques');
      expect(result.output).toHaveProperty('tokensUsed');
    });

    it('should handle rent negotiation task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'rent',
          negotiationType: 'reduction',
          currentRent: '1200 EUR',
          targetRent: '1050 EUR',
          location: 'Paris 11e',
          leaseDuration: '3 ans',
          context: 'Renouvellement de bail',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('negotiationType', 'rent');
      expect(result.output).toHaveProperty('advice');
      expect(result.output).toHaveProperty('recommendedTechniques');
    });

    it('should handle contract negotiation task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'contract',
          contractType: 'Fournisseur SaaS',
          counterparty: 'Acme Corp',
          mainStake: 'Tarif annuel',
          amount: '24000 EUR/an',
          context: 'Renouvellement contrat logiciel',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('negotiationType', 'contract');
      expect(result.output).toHaveProperty('advice');
    });

    it('should handle roleplay task', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'roleplay',
          scenario: 'Negociation salariale avec DRH',
          counterpartRole: 'DRH exigeant',
          difficulty: 'hard',
          userObjective: 'Obtenir +15% d\'augmentation',
          context: 'Entreprise en croissance',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('negotiationType', 'roleplay');
      expect(result.output).toHaveProperty('simulation');
      expect(result.output).toHaveProperty('recommendedTechniques');
    });

    it('should return error for unknown task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(String(result.output['error'])).toContain('Unknown negotiation task type');
    });

    it('should default to contract when no type specified', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { context: 'General negotiation question' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('negotiationType', 'contract');
    });
  });
});

// ── System Prompt Tests ──

describe('Negociateur Prompts', () => {
  it('should have a defined and non-empty system prompt', () => {
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toBeDefined();
    expect(NEGOCIATEUR_SYSTEM_PROMPT.length).toBeGreaterThan(100);
  });

  it('should mention negotiation methodologies', () => {
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toContain('BATNA');
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toContain('ZOPA');
  });

  it('should describe all 4 capabilities', () => {
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toContain('SALAIRE');
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toContain('LOYER');
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toContain('CONTRAT');
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toContain('ROLEPLAY');
  });

  it('should require JSON responses', () => {
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toContain('JSON valide');
  });

  it('should instruct to respond in French', () => {
    expect(NEGOCIATEUR_SYSTEM_PROMPT).toContain('francais');
  });
});

// ── Tool Tests ──

describe('Negociateur Tools', () => {
  it('formatNegotiationScript returns structured script', () => {
    const script = formatNegotiationScript(
      'Bonjour, je souhaite discuter de ma remuneration.',
      ['Argument 1: Performance', 'Argument 2: Marche', ''],
      'Je vous propose donc...',
      'Je comprends, mais...',
    );
    expect(script.opening).toBe('Bonjour, je souhaite discuter de ma remuneration.');
    expect(script.arguments).toHaveLength(2); // empty string filtered
    expect(script.closingPhrase).toContain('propose');
    expect(script.fallbackPhrase).toContain('comprends');
  });

  it('buildCounterArguments returns structured list', () => {
    const args = buildCounterArguments([
      { objection: 'Budget serre', response: 'Je comprends, cependant...', technique: 'empathy' },
      { objection: 'Pas le bon moment', response: 'Justement, c\'est le moment ideal car...' },
    ]);
    expect(args).toHaveLength(2);
    expect(args[0]!.technique).toBe('empathy');
    expect(args[1]!.technique).toBe('reframe'); // default
  });

  it('calculateSalaryAnchor computes correct values', () => {
    const result = calculateSalaryAnchor(60000, 15);
    expect(result.anchor).toBe(69000);
    expect(result.target).toBe(60000);
    expect(result.floor).toBe(57000);
  });

  it('formatAmount formats in French locale', () => {
    const formatted = formatAmount(45000, 'EUR');
    expect(formatted).toContain('EUR');
    expect(formatted).toContain('45');
  });

  it('getRecommendedTechniques returns techniques for each type', () => {
    const types: NegociateurTaskType[] = ['salary', 'rent', 'contract', 'roleplay'];
    for (const type of types) {
      const techniques = getRecommendedTechniques(type);
      expect(techniques.length).toBeGreaterThan(0);
    }
  });

  it('getRecommendedTechniques returns salary-specific techniques', () => {
    const techniques = getRecommendedTechniques('salary');
    expect(techniques.some(t => t.toLowerCase().includes('ancrage'))).toBe(true);
  });
});

// ── Types Coverage ──

describe('Negociateur Types', () => {
  it('validates task type union', () => {
    const types: NegociateurTaskType[] = ['salary', 'rent', 'contract', 'roleplay'];
    expect(types).toHaveLength(4);
  });
});
