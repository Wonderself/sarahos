import { ContradicteurAgent, CONTRADICTEUR_AGENT_CONFIG } from './contradicteur.agent';
import { COGNITIVE_BIASES, formatDecisionMatrix, formatProsCons } from './contradicteur.tools';
import {
  CONTRADICTEUR_SYSTEM_PROMPT,
  DEBATE_TEMPLATE,
  MATRIX_TEMPLATE,
  BIAS_TEMPLATE,
  REVIEW_TEMPLATE,
} from './contradicteur.prompts';
import type { AgentTask } from '../../../base/agent.types';
import type { DecisionMatrix, DecisionArgument } from './contradicteur.types';

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"pour":[],"contre":[],"hypotheses_implicites":[],"synthese":"Analyse neutre"}',
      model: 'claude-sonnet',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      stopReason: 'end_turn',
      latencyMs: 500,
    }),
  },
}));

jest.mock('../../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: new Date().toISOString() }),
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
    id: 'task-contra-1',
    title: 'Contradicteur Task',
    description: 'Test contradicteur task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

describe('ContradicteurAgent', () => {
  let agent: ContradicteurAgent;

  beforeEach(() => {
    agent = new ContradicteurAgent();
    jest.clearAllMocks();
  });

  // --- Config tests ---

  it('initializes with correct config', () => {
    expect(agent.name).toBe('Contradicteur Agent');
    expect(agent.level).toBe(1);
    expect(agent.modelTier).toBe('standard');
  });

  it('has correct id', () => {
    expect(agent.id).toBe('contradicteur-agent');
  });

  it('has all required capabilities', () => {
    expect(agent.capabilities).toContain('debate');
    expect(agent.capabilities).toContain('decision-matrix');
    expect(agent.capabilities).toContain('bias-detection');
    expect(agent.capabilities).toContain('decision-review');
  });

  it('has 4 capabilities', () => {
    expect(agent.capabilities).toHaveLength(4);
  });

  it('uses standard model tier for deeper analysis', () => {
    expect(CONTRADICTEUR_AGENT_CONFIG.modelTier).toBe('standard');
  });

  it('allows 20 requests per minute', () => {
    expect(CONTRADICTEUR_AGENT_CONFIG.rateLimitPerMinute).toBe(20);
  });

  // --- Lifecycle tests ---

  it('initializes and subscribes to events', async () => {
    const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('ApprovalRequested', expect.any(Function), agent.id);
  });

  it('shuts down and unsubscribes', async () => {
    const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('ApprovalRequested', agent.id);
  });

  // --- Debate task ---

  it('executes debate tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'debate', decision: 'Embaucher un CTO externe', context: 'Startup early-stage' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('synthese');
  });

  it('handles debate with minimal payload', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'debate' },
      description: 'Dois-je changer de stack technique ?',
    }));
    expect(result.success).toBe(true);
  });

  // --- Matrix task ---

  it('executes matrix tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        criteres: [{ name: 'Cout', weight: 0.4, justification: 'Budget limite' }],
        options: ['Option A', 'Option B'],
        scores: { 'Option A': { 'Cout': 8 }, 'Option B': { 'Cout': 5 } },
        classement: [{ option: 'Option A', score_pondere: 3.2 }, { option: 'Option B', score_pondere: 2.0 }],
        analyse: 'Option A domine',
      }),
      model: 'claude-sonnet',
      inputTokens: 150,
      outputTokens: 100,
      totalTokens: 250,
      stopReason: 'end_turn',
      latencyMs: 600,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'matrix', decision: 'Choix du prestataire', options: ['Option A', 'Option B'] },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('classement');
    expect(result.output).toHaveProperty('formatted');
  });

  it('handles matrix without explicit options', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'matrix', decision: 'Quel CRM choisir ?' },
    }));
    expect(result.success).toBe(true);
  });

  // --- Bias task ---

  it('executes bias detection tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        biais_detectes: [{ name: 'Biais de confirmation', description: 'Test', extrait_texte: '...', impact: 'high', contre_mesure: 'Chercher des contre-exemples' }],
        impact_global: 'Risque de decision biaisee',
        recommandations: ['Consulter un avis externe'],
      }),
      model: 'claude-sonnet',
      inputTokens: 200,
      outputTokens: 100,
      totalTokens: 300,
      stopReason: 'end_turn',
      latencyMs: 700,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'bias', reasoning: 'Ce projet va forcement reussir car on y croit' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('biais_detectes');
    expect(result.output).toHaveProperty('biasesCatalogSize');
  });

  it('stores bias analysis in memory', async () => {
    const { memoryManager } = jest.requireMock('../../../../core/memory/memory-manager') as { memoryManager: { store: jest.Mock } };
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({ biais_detectes: [], impact_global: 'Aucun', recommandations: [] }),
      model: 'claude-sonnet', inputTokens: 100, outputTokens: 50, totalTokens: 150, stopReason: 'end_turn', latencyMs: 500,
    });

    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'bias', reasoning: 'Mon raisonnement' },
    }));
    expect(memoryManager.store).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ type: 'bias_analysis' }) }),
    );
  });

  // --- Review task ---

  it('executes review tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        forces: ['Equipe motivee'],
        risques: [{ description: 'Marche incertain', probabilite: 'moyenne', impact: 'eleve' }],
        plan_b: 'Pivoter vers le B2B',
        plan_c: 'Licencier et reduire les couts',
        signaux_alerte: ['Perte de 2 clients cles'],
      }),
      model: 'claude-sonnet',
      inputTokens: 150,
      outputTokens: 120,
      totalTokens: 270,
      stopReason: 'end_turn',
      latencyMs: 550,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'review', decision: 'Lancer le produit en beta', reasons: 'Time-to-market' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('plan_b');
    expect(result.output).toHaveProperty('plan_c');
    expect(result.output).toHaveProperty('signaux_alerte');
  });

  it('stores review in memory', async () => {
    const { memoryManager } = jest.requireMock('../../../../core/memory/memory-manager') as { memoryManager: { store: jest.Mock } };

    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'review', decision: 'Investir dans l\'IA' },
    }));
    expect(memoryManager.store).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ type: 'decision_review' }) }),
    );
  });

  // --- Unknown task type ---

  it('handles unknown task type gracefully', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'unknown_type' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('error');
  });

  // --- LLM parse error ---

  it('handles non-JSON LLM response in debate', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: 'This is not JSON',
      model: 'claude-sonnet', inputTokens: 100, outputTokens: 50, totalTokens: 150, stopReason: 'end_turn', latencyMs: 400,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'debate', decision: 'Test' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('rawAnalysis');
  });

  it('defaults to debate when no type specified', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: {} }));
    expect(result.success).toBe(true);
    expect(LLMRouter.route).toHaveBeenCalled();
  });
});

describe('Contradicteur Tools', () => {
  it('COGNITIVE_BIASES catalog has at least 15 biases', () => {
    expect(COGNITIVE_BIASES.length).toBeGreaterThanOrEqual(15);
  });

  it('each bias has name, description, and example', () => {
    for (const bias of COGNITIVE_BIASES) {
      expect(bias.name).toBeTruthy();
      expect(bias.description).toBeTruthy();
      expect(bias.example).toBeTruthy();
    }
  });

  it('catalog includes confirmation bias', () => {
    const found = COGNITIVE_BIASES.find((b) => b.name.toLowerCase().includes('confirmation'));
    expect(found).toBeDefined();
  });

  it('catalog includes sunk cost fallacy', () => {
    const found = COGNITIVE_BIASES.find((b) => b.name.toLowerCase().includes('irrecuperable') || b.name.toLowerCase().includes('sunk'));
    expect(found).toBeDefined();
  });

  it('catalog includes anchoring bias', () => {
    const found = COGNITIVE_BIASES.find((b) => b.name.toLowerCase().includes('ancrage') || b.name.toLowerCase().includes('anchor'));
    expect(found).toBeDefined();
  });

  it('catalog includes status quo bias', () => {
    const found = COGNITIVE_BIASES.find((b) => b.name.toLowerCase().includes('statu quo'));
    expect(found).toBeDefined();
  });

  it('formatDecisionMatrix produces readable output', () => {
    const matrix: DecisionMatrix = {
      criteres: [{ name: 'Cout', weight: 0.5, justification: 'Budget serre' }],
      options: ['A', 'B'],
      scores: { A: { Cout: 8 }, B: { Cout: 4 } },
      classement: [{ option: 'A', score_pondere: 4.0 }, { option: 'B', score_pondere: 2.0 }],
      analyse: 'A est meilleur',
    };
    const output = formatDecisionMatrix(matrix);
    expect(output).toContain('MATRICE DE DECISION');
    expect(output).toContain('Cout');
    expect(output).toContain('A');
    expect(output).toContain('B');
    expect(output).toContain('4.00');
  });

  it('formatProsCons produces readable output', () => {
    const pour: DecisionArgument[] = [{ title: 'Rapide', explanation: 'Gain de temps', strength: 'strong' }];
    const contre: DecisionArgument[] = [{ title: 'Cher', explanation: 'Budget depasse', strength: 'moderate' }];
    const output = formatProsCons(pour, contre);
    expect(output).toContain('ARGUMENTS POUR');
    expect(output).toContain('ARGUMENTS CONTRE');
    expect(output).toContain('Rapide');
    expect(output).toContain('[+++]');
    expect(output).toContain('[--]');
  });
});

describe('Contradicteur Prompts', () => {
  it('system prompt mentions all 4 modes', () => {
    expect(CONTRADICTEUR_SYSTEM_PROMPT).toContain('DEBATE');
    expect(CONTRADICTEUR_SYSTEM_PROMPT).toContain('MATRIX');
    expect(CONTRADICTEUR_SYSTEM_PROMPT).toContain('BIAS');
    expect(CONTRADICTEUR_SYSTEM_PROMPT).toContain('REVIEW');
  });

  it('debate template has decision and context placeholders', () => {
    expect(DEBATE_TEMPLATE).toContain('{decision}');
    expect(DEBATE_TEMPLATE).toContain('{context}');
  });

  it('matrix template has options placeholder', () => {
    expect(MATRIX_TEMPLATE).toContain('{options}');
  });

  it('bias template has reasoning placeholder', () => {
    expect(BIAS_TEMPLATE).toContain('{reasoning}');
  });

  it('review template has reasons placeholder', () => {
    expect(REVIEW_TEMPLATE).toContain('{reasons}');
  });
});
