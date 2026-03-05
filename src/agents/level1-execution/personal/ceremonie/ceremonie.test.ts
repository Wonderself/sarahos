import { CeremonieAgent, CEREMONIE_AGENT_CONFIG } from './ceremonie.agent';
import {
  CEREMONIE_SYSTEM_PROMPT,
  PLAN_PROMPT,
  GUESTS_PROMPT,
  TIMELINE_PROMPT,
  BUDGET_PROMPT,
  TIMELINE_TEMPLATES,
  TIMELINE_TEMPLATE,
} from './ceremonie.prompts';
import { TIMELINE_TEMPLATE as TOOLS_TIMELINE_TEMPLATE } from './ceremonie.tools';
import type { AgentTask } from '../../../base/agent.types';
import type {
  CeremonieTaskType,
  EventType,
  EventStatus,
  RSVPStatus,
  RSVPSummary,
  TimelineMilestone,
} from './ceremonie.types';

// ── Mocks ──

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        response: 'Plan evenement genere.',
        suggestions: ['Suggestion 1'],
        nextSteps: ['Etape 1'],
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
    id: 'task-ceremonie-1',
    title: 'Ceremonie Task',
    description: 'Test ceremonie task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

// ── Agent Configuration Tests ──

describe('CeremonieAgent', () => {
  let agent: CeremonieAgent;

  beforeEach(() => {
    agent = new CeremonieAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('has correct agent id', () => {
      expect(CEREMONIE_AGENT_CONFIG.id).toBe('ceremonie-agent');
    });

    it('has correct agent name', () => {
      expect(CEREMONIE_AGENT_CONFIG.name).toBe('Ceremonie Agent');
    });

    it('is level 1 agent', () => {
      expect(CEREMONIE_AGENT_CONFIG.level).toBe(1);
    });

    it('uses fast model tier', () => {
      expect(CEREMONIE_AGENT_CONFIG.modelTier).toBe('fast');
    });

    it('has event-planning capability', () => {
      expect(CEREMONIE_AGENT_CONFIG.capabilities).toContain('event-planning');
    });

    it('has guest-management capability', () => {
      expect(CEREMONIE_AGENT_CONFIG.capabilities).toContain('guest-management');
    });

    it('has timeline-creation capability', () => {
      expect(CEREMONIE_AGENT_CONFIG.capabilities).toContain('timeline-creation');
    });

    it('has event-budgeting capability', () => {
      expect(CEREMONIE_AGENT_CONFIG.capabilities).toContain('event-budgeting');
    });

    it('initializes with correct properties', () => {
      expect(agent.name).toBe('Ceremonie Agent');
      expect(agent.level).toBe(1);
      expect(agent.modelTier).toBe('fast');
    });
  });

  describe('Lifecycle', () => {
    it('subscribes to EventPlannerGuestRSVP on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith(
        'EventPlannerGuestRSVP',
        expect.any(Function),
        agent.id,
      );
    });

    it('unsubscribes from EventPlannerGuestRSVP on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('EventPlannerGuestRSVP', agent.id);
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

  describe('Task Execution — Plan', () => {
    it('handles plan task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'plan',
          userId: 'user-1',
          eventType: 'anniversaire',
          title: 'Anniversaire 30 ans',
          eventDate: '2026-06-15',
          venue: 'Chez moi',
          budgetCents: 50000,
          guestCount: 20,
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('timelineTemplate');
      expect(result.output).toHaveProperty('llmPlan');
    });

    it('creates event with default timeline template', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'plan',
          userId: 'user-1',
          eventType: 'mariage',
          title: 'Mon Mariage',
          eventDate: '2027-09-01',
        },
      }));
      expect(result.success).toBe(true);
      const template = result.output['timelineTemplate'] as TimelineMilestone[];
      expect(template).toBeDefined();
      expect(Array.isArray(template)).toBe(true);
    });
  });

  describe('Task Execution — Guests', () => {
    it('handles guests list action', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'guests',
          userId: 'user-1',
          eventId: 'event-1',
          action: 'list',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('guests');
      expect(result.output).toHaveProperty('rsvpSummary');
    });

    it('handles guests add action with name', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'guests',
          userId: 'user-1',
          eventId: 'event-1',
          action: 'add',
          guestData: { name: 'Marie Dupont', email: 'marie@test.com' },
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('added', true);
    });

    it('rejects guests add without name', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'guests',
          userId: 'user-1',
          eventId: 'event-1',
          action: 'add',
          guestData: {},
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('handles guests update_rsvp action', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'guests',
          userId: 'user-1',
          eventId: 'event-1',
          action: 'update_rsvp',
          guestData: { id: 'guest-1', rsvpStatus: 'confirmed' },
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('rsvpSummary');
    });

    it('rejects update_rsvp without id', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'guests',
          userId: 'user-1',
          eventId: 'event-1',
          action: 'update_rsvp',
          guestData: {},
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('handles guests summary action', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'guests',
          userId: 'user-1',
          eventId: 'event-1',
          action: 'summary',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('llmSummary');
    });
  });

  describe('Task Execution — Timeline', () => {
    it('handles timeline task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'timeline',
          userId: 'user-1',
          eventId: 'event-1',
          eventType: 'noel',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('timeline');
      expect(result.output).toHaveProperty('llmTimeline');
    });

    it('uses default timeline for unknown event type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'timeline',
          userId: 'user-1',
          eventId: 'event-1',
          eventType: 'autre',
        },
      }));
      expect(result.success).toBe(true);
      const timeline = result.output['timeline'] as TimelineMilestone[];
      expect(timeline.length).toBeGreaterThan(0);
    });
  });

  describe('Task Execution — Budget', () => {
    it('handles budget overview action', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'budget',
          userId: 'user-1',
          eventId: 'event-1',
          action: 'overview',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('budgetOverview');
      expect(result.output).toHaveProperty('llmAnalysis');
    });

    it('returns zero budget when no event found', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'budget',
          userId: 'user-1',
          eventId: 'nonexistent',
          action: 'overview',
        },
      }));
      expect(result.success).toBe(true);
      const overview = result.output['budgetOverview'] as Record<string, number>;
      expect(overview['totalBudgetCents']).toBe(0);
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
    });
  });
});

// ── Prompts Tests ──

describe('Ceremonie Prompts', () => {
  it('system prompt is defined and long', () => {
    expect(CEREMONIE_SYSTEM_PROMPT).toBeDefined();
    expect(CEREMONIE_SYSTEM_PROMPT.length).toBeGreaterThan(200);
  });

  it('system prompt mentions Maitre de Ceremonie', () => {
    expect(CEREMONIE_SYSTEM_PROMPT).toContain('Maitre de Ceremonie');
  });

  it('system prompt lists all event types', () => {
    expect(CEREMONIE_SYSTEM_PROMPT).toContain('Anniversaire');
    expect(CEREMONIE_SYSTEM_PROMPT).toContain('Mariage');
    expect(CEREMONIE_SYSTEM_PROMPT).toContain('Baby shower');
    expect(CEREMONIE_SYSTEM_PROMPT).toContain('Noel');
  });

  it('plan prompt contains template variables', () => {
    expect(PLAN_PROMPT).toContain('{eventType}');
    expect(PLAN_PROMPT).toContain('{title}');
    expect(PLAN_PROMPT).toContain('{eventDate}');
  });

  it('guests prompt contains template variables', () => {
    expect(GUESTS_PROMPT).toContain('{action}');
    expect(GUESTS_PROMPT).toContain('{eventId}');
    expect(GUESTS_PROMPT).toContain('{guestData}');
  });

  it('timeline prompt contains template variables', () => {
    expect(TIMELINE_PROMPT).toContain('{eventType}');
    expect(TIMELINE_PROMPT).toContain('{eventDate}');
    expect(TIMELINE_PROMPT).toContain('{eventData}');
  });

  it('budget prompt contains template variables', () => {
    expect(BUDGET_PROMPT).toContain('{action}');
    expect(BUDGET_PROMPT).toContain('{budgetTotal}');
    expect(BUDGET_PROMPT).toContain('{budgetItems}');
  });
});

// ── Timeline Template Tests ──

describe('Timeline Templates', () => {
  const eventTypes: EventType[] = [
    'anniversaire', 'mariage', 'fete', 'reunion_famille',
    'baby_shower', 'pendaison_cremaillere', 'noel', 'autre',
  ];

  it('has templates for all 8 event types', () => {
    expect(Object.keys(TIMELINE_TEMPLATES)).toHaveLength(8);
  });

  for (const eventType of eventTypes) {
    it(`has template for ${eventType}`, () => {
      expect(TIMELINE_TEMPLATES[eventType]).toBeDefined();
      expect(Array.isArray(TIMELINE_TEMPLATES[eventType])).toBe(true);
    });

    it(`${eventType} template has 6 milestones`, () => {
      expect(TIMELINE_TEMPLATES[eventType]).toHaveLength(6);
    });

    it(`${eventType} template includes Jour J milestone`, () => {
      const jourJ = TIMELINE_TEMPLATES[eventType].find((m) => m.label === 'Jour J');
      expect(jourJ).toBeDefined();
      expect(jourJ!.daysBeforeEvent).toBe(0);
    });

    it(`${eventType} template includes J-30 milestone`, () => {
      const j30 = TIMELINE_TEMPLATES[eventType].find((m) => m.label === 'J-30');
      expect(j30).toBeDefined();
      expect(j30!.daysBeforeEvent).toBe(30);
    });

    it(`${eventType} template milestones have tasks`, () => {
      for (const milestone of TIMELINE_TEMPLATES[eventType]) {
        expect(milestone.tasks.length).toBeGreaterThan(0);
      }
    });
  }

  it('TIMELINE_TEMPLATE alias equals TIMELINE_TEMPLATES', () => {
    expect(TIMELINE_TEMPLATE).toBe(TIMELINE_TEMPLATES);
  });

  it('tools re-exports TIMELINE_TEMPLATE', () => {
    expect(TOOLS_TIMELINE_TEMPLATE).toBe(TIMELINE_TEMPLATES);
  });
});

// ── Types Tests ──

describe('Ceremonie Types', () => {
  it('validates task types', () => {
    const types: CeremonieTaskType[] = ['plan', 'guests', 'timeline', 'budget'];
    expect(types).toHaveLength(4);
  });

  it('validates event types', () => {
    const types: EventType[] = [
      'anniversaire', 'mariage', 'fete', 'reunion_famille',
      'baby_shower', 'pendaison_cremaillere', 'noel', 'autre',
    ];
    expect(types).toHaveLength(8);
  });

  it('validates event statuses', () => {
    const statuses: EventStatus[] = [
      'draft', 'planning', 'confirmed', 'in_progress', 'completed', 'cancelled',
    ];
    expect(statuses).toHaveLength(6);
  });

  it('validates RSVP statuses', () => {
    const statuses: RSVPStatus[] = ['pending', 'confirmed', 'declined', 'maybe'];
    expect(statuses).toHaveLength(4);
  });

  it('RSVP summary interface has all fields', () => {
    const summary: RSVPSummary = {
      total: 20,
      confirmed: 10,
      declined: 3,
      maybe: 4,
      pending: 3,
      plusOnes: 5,
    };
    expect(summary.total).toBe(20);
    expect(summary.plusOnes).toBe(5);
  });
});
