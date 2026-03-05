import { CoachAgent, COACH_AGENT_CONFIG } from './coach.agent';
import { calculateStreak, formatGoalProgress, generateCelebration, MILESTONE_MESSAGES } from './coach.tools';
import {
  COACH_SYSTEM_PROMPT,
  GOALS_TEMPLATE,
  CHECKIN_TEMPLATE,
  REVIEW_TEMPLATE,
  CELEBRATE_TEMPLATE,
} from './coach.prompts';
import type { AgentTask } from '../../../base/agent.types';
import type { CoachStreak, CoachGoal } from './coach.types';

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"feedback":"Bravo !","micro_actions":["Lire 10 pages"],"deadlines_proches":[]}',
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
    id: 'task-coach-1',
    title: 'Coach Task',
    description: 'Test coach task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

describe('CoachAgent', () => {
  let agent: CoachAgent;

  beforeEach(() => {
    agent = new CoachAgent();
    jest.clearAllMocks();
  });

  // --- Config tests ---

  it('initializes with correct config', () => {
    expect(agent.name).toBe('Coach Agent');
    expect(agent.level).toBe(1);
    expect(agent.modelTier).toBe('fast');
  });

  it('has correct id', () => {
    expect(agent.id).toBe('coach-agent');
  });

  it('has all required capabilities', () => {
    expect(agent.capabilities).toContain('goal-setting');
    expect(agent.capabilities).toContain('daily-checkin');
    expect(agent.capabilities).toContain('weekly-review');
    expect(agent.capabilities).toContain('celebration');
  });

  it('has 4 capabilities', () => {
    expect(agent.capabilities).toHaveLength(4);
  });

  it('allows 20 requests per minute', () => {
    expect(COACH_AGENT_CONFIG.rateLimitPerMinute).toBe(20);
  });

  // --- Lifecycle tests ---

  it('initializes and subscribes to events', async () => {
    const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('TaskCompleted', expect.any(Function), agent.id);
  });

  it('shuts down and unsubscribes', async () => {
    const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('TaskCompleted', agent.id);
  });

  // --- Goals task ---

  it('executes goals tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        objectifs: [{ titre: 'Apprendre TypeScript', deadline: '2026-06-01' }],
        jalons: [{ jalon: 'Finir le tuto', deadline: '2026-04-01' }],
        obstacles: ['Manque de temps'],
        strategies: ['30 min par jour'],
      }),
      model: 'claude-sonnet', inputTokens: 100, outputTokens: 80, totalTokens: 180, stopReason: 'end_turn', latencyMs: 500,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'goals', goals: 'Apprendre TypeScript en 3 mois' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('objectifs');
  });

  it('stores goals in memory', async () => {
    const { memoryManager } = jest.requireMock('../../../../core/memory/memory-manager') as { memoryManager: { store: jest.Mock } };
    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'goals', goals: 'Perdre 5kg' },
    }));
    expect(memoryManager.store).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ type: 'goals_defined' }) }),
    );
  });

  // --- Checkin task ---

  it('executes checkin tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'checkin', accomplishments: 'J\'ai lu 30 pages', currentStreak: 5 },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('streak');
    expect(result.output).toHaveProperty('badge');
  });

  it('publishes CoachStreakUpdated event on checkin', async () => {
    const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'checkin', accomplishments: 'Code review' },
    }));
    expect(eventBus.publish).toHaveBeenCalledWith(
      'CoachStreakUpdated',
      agent.id,
      expect.objectContaining({ streak: expect.any(Number) }),
    );
  });

  it('stores checkin in memory', async () => {
    const { memoryManager } = jest.requireMock('../../../../core/memory/memory-manager') as { memoryManager: { store: jest.Mock } };
    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'checkin', accomplishments: 'Tests unitaires' },
    }));
    expect(memoryManager.store).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ type: 'daily_checkin' }) }),
    );
  });

  // --- Review task ---

  it('executes review tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        progres_semaine: { taux_completion: 80, jours_actifs: 5 },
        patterns: ['Productif le matin'],
        ajustements: ['Ajouter une pause apres-midi'],
        score_semaine: 8,
      }),
      model: 'claude-sonnet', inputTokens: 120, outputTokens: 80, totalTokens: 200, stopReason: 'end_turn', latencyMs: 600,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'review', weekCheckins: '5/7 jours', currentStreak: 12 },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('score_semaine');
  });

  it('stores review in memory', async () => {
    const { memoryManager } = jest.requireMock('../../../../core/memory/memory-manager') as { memoryManager: { store: jest.Mock } };
    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'review', weekCheckins: '3/7 jours' },
    }));
    expect(memoryManager.store).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ type: 'weekly_review' }) }),
    );
  });

  // --- Celebrate task ---

  it('executes celebrate tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        message: 'Bravo champion !',
        accomplissements: ['Objectif atteint'],
        prochain_defi: 'Viser le niveau suivant',
        statistiques: { streak: 30, objectifs_atteints: 3 },
      }),
      model: 'claude-sonnet', inputTokens: 100, outputTokens: 60, totalTokens: 160, stopReason: 'end_turn', latencyMs: 450,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'celebrate', achievement: 'Premier mois de streak', currentStreak: 30 },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('localCelebration');
    expect(result.output).toHaveProperty('message');
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

  // --- Non-JSON LLM response ---

  it('handles non-JSON LLM response', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: 'Texte libre non-JSON',
      model: 'claude-sonnet', inputTokens: 50, outputTokens: 20, totalTokens: 70, stopReason: 'end_turn', latencyMs: 300,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'goals', goals: 'Test' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('rawAnalysis');
  });

  it('defaults to checkin when no type specified', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: {} }));
    expect(result.success).toBe(true);
  });
});

describe('Coach Tools — calculateStreak', () => {
  it('starts streak at 1 on first checkin', () => {
    const streak: CoachStreak = { current: 0, best: 0, lastCheckinDate: null, totalCheckins: 0, badge: 'none' };
    const result = calculateStreak(streak, '2026-03-01T10:00:00Z');
    expect(result.current).toBe(1);
    expect(result.best).toBe(1);
    expect(result.totalCheckins).toBe(1);
  });

  it('increments streak on consecutive day', () => {
    const streak: CoachStreak = { current: 5, best: 10, lastCheckinDate: '2026-03-01T10:00:00Z', totalCheckins: 5, badge: 'none' };
    const result = calculateStreak(streak, '2026-03-02T10:00:00Z');
    expect(result.current).toBe(6);
    expect(result.totalCheckins).toBe(6);
  });

  it('resets streak on missed day', () => {
    const streak: CoachStreak = { current: 5, best: 10, lastCheckinDate: '2026-03-01T10:00:00Z', totalCheckins: 5, badge: 'none' };
    const result = calculateStreak(streak, '2026-03-04T10:00:00Z');
    expect(result.current).toBe(1);
    expect(result.best).toBe(10); // Best preserved
  });

  it('does not change on same-day checkin', () => {
    const streak: CoachStreak = { current: 5, best: 10, lastCheckinDate: '2026-03-01T10:00:00Z', totalCheckins: 5, badge: 'none' };
    const result = calculateStreak(streak, '2026-03-01T18:00:00Z');
    expect(result.current).toBe(5);
    expect(result.totalCheckins).toBe(5);
  });

  it('awards bronze badge at 7 days', () => {
    const streak: CoachStreak = { current: 6, best: 6, lastCheckinDate: '2026-03-06T10:00:00Z', totalCheckins: 6, badge: 'none' };
    const result = calculateStreak(streak, '2026-03-07T10:00:00Z');
    expect(result.current).toBe(7);
    expect(result.badge).toBe('bronze');
  });

  it('awards argent badge at 30 days', () => {
    const streak: CoachStreak = { current: 29, best: 29, lastCheckinDate: '2026-03-29T10:00:00Z', totalCheckins: 29, badge: 'bronze' };
    const result = calculateStreak(streak, '2026-03-30T10:00:00Z');
    expect(result.current).toBe(30);
    expect(result.badge).toBe('argent');
  });

  it('awards or badge at 100 days', () => {
    const streak: CoachStreak = { current: 99, best: 99, lastCheckinDate: '2026-06-08T10:00:00Z', totalCheckins: 99, badge: 'argent' };
    const result = calculateStreak(streak, '2026-06-09T10:00:00Z');
    expect(result.current).toBe(100);
    expect(result.badge).toBe('or');
  });

  it('preserves best streak when current resets', () => {
    const streak: CoachStreak = { current: 50, best: 50, lastCheckinDate: '2026-03-01T10:00:00Z', totalCheckins: 50, badge: 'argent' };
    const result = calculateStreak(streak, '2026-03-05T10:00:00Z');
    expect(result.current).toBe(1);
    expect(result.best).toBe(50);
  });
});

describe('Coach Tools — formatGoalProgress', () => {
  it('handles empty goals', () => {
    const output = formatGoalProgress([]);
    expect(output).toContain('Aucun objectif');
  });

  it('formats active goals with progress bar', () => {
    const goals: CoachGoal[] = [{
      id: 'g1', title: 'Apprendre TS', description: 'TypeScript en 3 mois',
      deadline: '2026-06-01', mesure_succes: 'Projet complet', progress: 60,
      status: 'active', createdAt: '2026-03-01',
    }];
    const output = formatGoalProgress(goals);
    expect(output).toContain('Apprendre TS');
    expect(output).toContain('60%');
    expect(output).toContain('######');
  });

  it('formats completed goals with OK icon', () => {
    const goals: CoachGoal[] = [{
      id: 'g1', title: 'Lire 12 livres', description: 'Un livre par mois',
      deadline: '2026-12-31', mesure_succes: '12 fiches de lecture', progress: 100,
      status: 'completed', createdAt: '2026-01-01',
    }];
    const output = formatGoalProgress(goals);
    expect(output).toContain('[OK]');
  });

  it('shows summary with active and completed counts', () => {
    const goals: CoachGoal[] = [
      { id: 'g1', title: 'A', description: '', deadline: '', mesure_succes: '', progress: 50, status: 'active', createdAt: '' },
      { id: 'g2', title: 'B', description: '', deadline: '', mesure_succes: '', progress: 100, status: 'completed', createdAt: '' },
    ];
    const output = formatGoalProgress(goals);
    expect(output).toContain('1 actif(s)');
    expect(output).toContain('1 termine(s)');
  });
});

describe('Coach Tools — generateCelebration', () => {
  it('generates 365-day celebration', () => {
    expect(generateCelebration(365)).toContain('UN AN');
  });

  it('generates 100-day celebration', () => {
    expect(generateCelebration(100)).toContain('100 JOURS');
  });

  it('generates 30-day celebration', () => {
    expect(generateCelebration(30)).toContain('30 JOURS');
  });

  it('generates 7-day celebration', () => {
    expect(generateCelebration(7)).toContain('7 JOURS');
  });

  it('generates custom celebration with achievement', () => {
    expect(generateCelebration(3, 'Premier commit')).toContain('Premier commit');
  });

  it('generates default message for low streak', () => {
    expect(generateCelebration(2)).toContain('chaque jour compte');
  });
});

describe('Coach Tools — MILESTONE_MESSAGES', () => {
  it('has messages for all badges', () => {
    expect(MILESTONE_MESSAGES['bronze']).toBeDefined();
    expect(MILESTONE_MESSAGES['argent']).toBeDefined();
    expect(MILESTONE_MESSAGES['or']).toBeDefined();
    expect(MILESTONE_MESSAGES['diamant']).toBeDefined();
  });

  it('has message for first checkin', () => {
    expect(MILESTONE_MESSAGES['first_checkin']).toBeDefined();
  });

  it('has message for streak lost', () => {
    expect(MILESTONE_MESSAGES['streak_lost']).toBeDefined();
  });

  it('has message for goal completed', () => {
    expect(MILESTONE_MESSAGES['goal_completed']).toBeDefined();
  });

  it('has message for perfect week', () => {
    expect(MILESTONE_MESSAGES['week_perfect']).toBeDefined();
  });
});

describe('Coach Prompts', () => {
  it('system prompt mentions all 4 modes', () => {
    expect(COACH_SYSTEM_PROMPT).toContain('GOALS');
    expect(COACH_SYSTEM_PROMPT).toContain('CHECKIN');
    expect(COACH_SYSTEM_PROMPT).toContain('REVIEW');
    expect(COACH_SYSTEM_PROMPT).toContain('CELEBRATE');
  });

  it('system prompt describes streak system', () => {
    expect(COACH_SYSTEM_PROMPT).toContain('streak');
    expect(COACH_SYSTEM_PROMPT).toContain('Bronze');
    expect(COACH_SYSTEM_PROMPT).toContain('Diamant');
  });

  it('goals template has goals placeholder', () => {
    expect(GOALS_TEMPLATE).toContain('{goals}');
  });

  it('checkin template has accomplishments and streak placeholders', () => {
    expect(CHECKIN_TEMPLATE).toContain('{accomplishments}');
    expect(CHECKIN_TEMPLATE).toContain('{currentStreak}');
  });

  it('review template has weekCheckins placeholder', () => {
    expect(REVIEW_TEMPLATE).toContain('{weekCheckins}');
  });

  it('celebrate template has achievement placeholder', () => {
    expect(CELEBRATE_TEMPLATE).toContain('{achievement}');
  });
});
