import { DeconnexionAgent, DECONNEXION_AGENT_CONFIG } from './deconnexion.agent';
import { CHALLENGES, OFFLINE_ACTIVITIES, formatMoodTrend, getAllChallengeNames, getActivityCategories } from './deconnexion.tools';
import {
  DECONNEXION_SYSTEM_PROMPT,
  CHALLENGE_TEMPLATE,
  ACTIVITIES_TEMPLATE,
  MOOD_TEMPLATE,
  PROGRESS_TEMPLATE,
} from './deconnexion.prompts';
import type { AgentTask } from '../../../base/agent.types';
import type { MoodEntry } from './deconnexion.types';

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"defi":{"nom":"Test","niveau":"beginner","duree":"1h","regles":[],"tips":[],"activites_suggerees":[]}}',
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
    id: 'task-deconnexion-1',
    title: 'Deconnexion Task',
    description: 'Test deconnexion task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

describe('DeconnexionAgent', () => {
  let agent: DeconnexionAgent;

  beforeEach(() => {
    agent = new DeconnexionAgent();
    jest.clearAllMocks();
  });

  // --- Config tests ---

  it('initializes with correct config', () => {
    expect(agent.name).toBe('Deconnexion Agent');
    expect(agent.level).toBe(1);
    expect(agent.modelTier).toBe('fast');
  });

  it('has correct id', () => {
    expect(agent.id).toBe('deconnexion-agent');
  });

  it('has all required capabilities', () => {
    expect(agent.capabilities).toContain('disconnection-challenges');
    expect(agent.capabilities).toContain('offline-activities');
    expect(agent.capabilities).toContain('mood-tracking');
    expect(agent.capabilities).toContain('progress-tracking');
  });

  it('has 4 capabilities', () => {
    expect(agent.capabilities).toHaveLength(4);
  });

  it('allows 20 requests per minute', () => {
    expect(DECONNEXION_AGENT_CONFIG.rateLimitPerMinute).toBe(20);
  });

  // --- Lifecycle tests ---

  it('initializes and subscribes to events', async () => {
    const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('CoachStreakUpdated', expect.any(Function), agent.id);
  });

  it('shuts down and unsubscribes', async () => {
    const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('CoachStreakUpdated', agent.id);
  });

  // --- Challenge task ---

  it('executes challenge tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'challenge', level: 'beginner' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('defi');
  });

  it('defaults to beginner level', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'challenge' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('availableCount');
  });

  it('stores challenge in memory', async () => {
    const { memoryManager } = jest.requireMock('../../../../core/memory/memory-manager') as { memoryManager: { store: jest.Mock } };
    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'challenge', level: 'intermediate' },
    }));
    expect(memoryManager.store).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ type: 'challenge_proposed' }) }),
    );
  });

  // --- Activities task ---

  it('executes activities tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        activites: [{ nom: 'Randonnee', description: 'Marche en nature', duree_estimee: '2h' }],
      }),
      model: 'claude-sonnet', inputTokens: 100, outputTokens: 60, totalTokens: 160, stopReason: 'end_turn', latencyMs: 500,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'activities', category: 'nature', energy: 'medium' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('catalogCategories');
  });

  // --- Mood task ---

  it('executes mood tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        entry: { mood: 7, stress: 4, sleep: 8 },
        tendance: 'Amelioration progressive',
        conseil: 'Continuez les pauses regulieres',
      }),
      model: 'claude-sonnet', inputTokens: 120, outputTokens: 70, totalTokens: 190, stopReason: 'end_turn', latencyMs: 550,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'mood', mood: 7, stress: 4, sleep: 8, entryType: 'after_disconnect' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('tendance');
  });

  it('stores mood entry in memory', async () => {
    const { memoryManager } = jest.requireMock('../../../../core/memory/memory-manager') as { memoryManager: { store: jest.Mock } };
    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'mood', mood: 6, stress: 5, sleep: 7 },
    }));
    expect(memoryManager.store).toHaveBeenCalledWith(
      expect.objectContaining({ metadata: expect.objectContaining({ type: 'mood_entry' }) }),
    );
  });

  // --- Progress task ---

  it('executes progress tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: JSON.stringify({
        statistiques: { defis: 5, heures_offline: 20 },
        badges: ['Premier defi'],
        prochaine_etape: 'Passer au niveau intermediaire',
      }),
      model: 'claude-sonnet', inputTokens: 100, outputTokens: 60, totalTokens: 160, stopReason: 'end_turn', latencyMs: 480,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'progress', challengesCompleted: 5, totalTimeOffline: '20 heures', averageMood: 7.5 },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('prochaine_etape');
  });

  it('publishes DeconnexionChallengeCompleted event when challenges completed > 0', async () => {
    const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: '{"statistiques":{},"badges":[],"prochaine_etape":""}',
      model: 'claude-sonnet', inputTokens: 50, outputTokens: 30, totalTokens: 80, stopReason: 'end_turn', latencyMs: 300,
    });

    await agent.initialize();
    await agent.execute(makeTask({
      payload: { type: 'progress', challengesCompleted: 3 },
    }));
    expect(eventBus.publish).toHaveBeenCalledWith(
      'DeconnexionChallengeCompleted',
      agent.id,
      expect.objectContaining({ challengesCompleted: 3 }),
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

  // --- Non-JSON LLM response ---

  it('handles non-JSON LLM response', async () => {
    const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: 'Texte libre non-JSON',
      model: 'claude-sonnet', inputTokens: 50, outputTokens: 20, totalTokens: 70, stopReason: 'end_turn', latencyMs: 300,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'challenge' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('rawAnalysis');
  });

  it('defaults to challenge when no type specified', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({ payload: {} }));
    expect(result.success).toBe(true);
  });
});

describe('Deconnexion Tools — CHALLENGES catalog', () => {
  it('has beginner challenges', () => {
    expect(CHALLENGES.beginner.length).toBeGreaterThanOrEqual(3);
  });

  it('has intermediate challenges', () => {
    expect(CHALLENGES.intermediate.length).toBeGreaterThanOrEqual(2);
  });

  it('has advanced challenges', () => {
    expect(CHALLENGES.advanced.length).toBeGreaterThanOrEqual(2);
  });

  it('each challenge has required fields', () => {
    for (const level of ['beginner', 'intermediate', 'advanced'] as const) {
      for (const challenge of CHALLENGES[level]) {
        expect(challenge.nom).toBeTruthy();
        expect(challenge.niveau).toBe(level);
        expect(challenge.duree).toBeTruthy();
        expect(challenge.regles.length).toBeGreaterThan(0);
        expect(challenge.tips.length).toBeGreaterThan(0);
        expect(challenge.activites_suggerees.length).toBeGreaterThan(0);
      }
    }
  });

  it('getAllChallengeNames returns all challenge names', () => {
    const names = getAllChallengeNames();
    const totalExpected = CHALLENGES.beginner.length + CHALLENGES.intermediate.length + CHALLENGES.advanced.length;
    expect(names).toHaveLength(totalExpected);
  });
});

describe('Deconnexion Tools — OFFLINE_ACTIVITIES catalog', () => {
  it('has multiple categories', () => {
    const categories = getActivityCategories();
    expect(categories.length).toBeGreaterThanOrEqual(5);
  });

  it('has sport activities', () => {
    expect(OFFLINE_ACTIVITIES['sport']!.length).toBeGreaterThanOrEqual(2);
  });

  it('has creativity activities', () => {
    expect(OFFLINE_ACTIVITIES['creativite']!.length).toBeGreaterThanOrEqual(2);
  });

  it('has nature activities', () => {
    expect(OFFLINE_ACTIVITIES['nature']!.length).toBeGreaterThanOrEqual(2);
  });

  it('each activity has required fields', () => {
    for (const category of Object.keys(OFFLINE_ACTIVITIES)) {
      for (const activity of OFFLINE_ACTIVITIES[category]!) {
        expect(activity.nom).toBeTruthy();
        expect(activity.description).toBeTruthy();
        expect(activity.duree_estimee).toBeTruthy();
        expect(activity.niveau_energie_requis).toBeTruthy();
        expect(activity.categorie).toBe(category);
      }
    }
  });
});

describe('Deconnexion Tools — formatMoodTrend', () => {
  it('handles empty entries', () => {
    const output = formatMoodTrend([]);
    expect(output).toContain('Aucune entree');
  });

  it('formats mood entries with averages', () => {
    const entries: MoodEntry[] = [
      { id: 'm1', timestamp: '2026-03-01T10:00:00Z', type: 'general', mood: 7, stress: 3, sleep: 8, notes: '' },
      { id: 'm2', timestamp: '2026-03-02T10:00:00Z', type: 'general', mood: 6, stress: 5, sleep: 7, notes: 'Fatigue' },
    ];
    const output = formatMoodTrend(entries);
    expect(output).toContain('TENDANCE HUMEUR');
    expect(output).toContain('2 entrees');
    expect(output).toContain('Moyennes globales');
  });

  it('shows before/after comparison when available', () => {
    const entries: MoodEntry[] = [
      { id: 'm1', timestamp: '2026-03-01T08:00:00Z', type: 'before_disconnect', mood: 5, stress: 7, sleep: 6, notes: '' },
      { id: 'm2', timestamp: '2026-03-01T18:00:00Z', type: 'after_disconnect', mood: 8, stress: 3, sleep: 8, notes: '' },
    ];
    const output = formatMoodTrend(entries);
    expect(output).toContain('avant/apres');
    expect(output).toContain('amelioration');
  });

  it('shows notes when present', () => {
    const entries: MoodEntry[] = [
      { id: 'm1', timestamp: '2026-03-01T10:00:00Z', type: 'general', mood: 7, stress: 3, sleep: 8, notes: 'Bonne journee' },
    ];
    const output = formatMoodTrend(entries);
    expect(output).toContain('Bonne journee');
  });
});

describe('Deconnexion Prompts', () => {
  it('system prompt mentions all 4 modes', () => {
    expect(DECONNEXION_SYSTEM_PROMPT).toContain('CHALLENGE');
    expect(DECONNEXION_SYSTEM_PROMPT).toContain('ACTIVITIES');
    expect(DECONNEXION_SYSTEM_PROMPT).toContain('MOOD');
    expect(DECONNEXION_SYSTEM_PROMPT).toContain('PROGRESS');
  });

  it('system prompt emphasizes non-judgmental approach', () => {
    expect(DECONNEXION_SYSTEM_PROMPT).toContain('JAMAIS culpabilisant');
  });

  it('challenge template has level placeholder', () => {
    expect(CHALLENGE_TEMPLATE).toContain('{level}');
  });

  it('activities template has category and energy placeholders', () => {
    expect(ACTIVITIES_TEMPLATE).toContain('{category}');
    expect(ACTIVITIES_TEMPLATE).toContain('{energy}');
  });

  it('mood template has mood, stress, sleep placeholders', () => {
    expect(MOOD_TEMPLATE).toContain('{mood}');
    expect(MOOD_TEMPLATE).toContain('{stress}');
    expect(MOOD_TEMPLATE).toContain('{sleep}');
  });

  it('progress template has challengesCompleted placeholder', () => {
    expect(PROGRESS_TEMPLATE).toContain('{challengesCompleted}');
  });
});
