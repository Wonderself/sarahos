import { ChasseurAgent, CHASSEUR_AGENT_CONFIG } from './chasseur.agent';
import { getMissions, createMission, updateMissionStatus, getPipelineStats } from './chasseur.tools';
import {
  CHASSEUR_SYSTEM_PROMPT,
  SEARCH_PROMPT,
  PROPOSAL_PROMPT,
  buildSearchPrompt,
  buildProposalPrompt,
  buildOptimizePrompt,
} from './chasseur.prompts';
import type { AgentTask } from '../../../base/agent.types';
import type { ChasseurTaskType, FreelancePlatform } from './chasseur.types';
import { MISSION_STATUS_FLOW, PLATFORM_INFO } from './chasseur.types';

// ── Mocks ──

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: JSON.stringify({
        suggestions: [{ title: 'Dev TypeScript', platform: 'malt', estimatedTjm: '550 EUR', matchScore: 85, reasoning: 'Bon match' }],
        searchStrategy: 'Recherche multi-plateforme',
        keywords: ['typescript', 'node.js'],
      }),
      model: 'claude-sonnet',
      inputTokens: 300,
      outputTokens: 200,
      totalTokens: 500,
      stopReason: 'end_turn',
      latencyMs: 900,
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
    id: 'task-chasseur-1',
    title: 'Chasseur Task',
    description: 'Test chasseur task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-chasseur-1',
    ...overrides,
  };
}

function makeMockMissionRow(overrides: Record<string, unknown> = {}): Record<string, unknown> {
  return {
    id: 'mission-1',
    user_id: 'user-1',
    title: 'Dev TypeScript Senior',
    client_name: 'TechCorp',
    platform: 'malt',
    url: 'https://malt.fr/mission/123',
    tjm_cents: 55000,
    duration_days: 60,
    status: 'discovered',
    notes: 'Bonne opportunite',
    applied_at: null,
    next_action: 'Postuler',
    next_action_date: null,
    tags: ['typescript', 'node'],
    remote_policy: 'full_remote',
    location: 'Paris',
    contact_name: 'Marie Martin',
    contact_email: 'marie@techcorp.com',
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    ...overrides,
  };
}

// ── Agent Configuration Tests ──

describe('ChasseurAgent', () => {
  let agent: ChasseurAgent;

  beforeEach(() => {
    agent = new ChasseurAgent();
    jest.clearAllMocks();
  });

  describe('Configuration', () => {
    it('has correct agent config', () => {
      expect(CHASSEUR_AGENT_CONFIG.id).toBe('chasseur-agent');
      expect(CHASSEUR_AGENT_CONFIG.name).toBe('Chasseur Agent');
      expect(CHASSEUR_AGENT_CONFIG.level).toBe(1);
      expect(CHASSEUR_AGENT_CONFIG.modelTier).toBe('standard');
    });

    it('has required capabilities', () => {
      expect(CHASSEUR_AGENT_CONFIG.capabilities).toContain('mission-search');
      expect(CHASSEUR_AGENT_CONFIG.capabilities).toContain('proposal-writing');
      expect(CHASSEUR_AGENT_CONFIG.capabilities).toContain('pipeline-management');
      expect(CHASSEUR_AGENT_CONFIG.capabilities).toContain('profile-optimization');
    });

    it('has 4 capabilities', () => {
      expect(CHASSEUR_AGENT_CONFIG.capabilities).toHaveLength(4);
    });

    it('initializes with correct properties', () => {
      expect(agent.name).toBe('Chasseur Agent');
      expect(agent.level).toBe(1);
      expect(agent.modelTier).toBe('standard');
    });
  });

  describe('Lifecycle', () => {
    it('subscribes to events on initialize', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { subscribe: jest.Mock };
      };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith('MissionStatusChanged', expect.any(Function), agent.id);
      expect(eventBus.subscribe).toHaveBeenCalledWith('FreelanceReminderDue', expect.any(Function), agent.id);
    });

    it('unsubscribes from events on shutdown', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { unsubscribe: jest.Mock };
      };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('MissionStatusChanged', agent.id);
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('FreelanceReminderDue', agent.id);
    });

    it('status is IDLE after initialization', async () => {
      await agent.initialize();
      expect(agent.status).toBe('IDLE');
    });

    it('status is DISABLED after shutdown', async () => {
      await agent.initialize();
      await agent.shutdown();
      expect(agent.status).toBe('DISABLED');
    });
  });

  describe('Search Task', () => {
    it('handles search with valid query', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'search',
          userId: 'user-1',
          query: 'Developpeur TypeScript senior, Node.js, AWS',
          platforms: ['malt', 'comet'],
          minTjm: 500,
          remoteOnly: true,
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('tokensUsed');
    });

    it('returns error when query is missing', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'search', userId: 'user-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });
  });

  describe('Proposal Task', () => {
    it('writes a proposal for a mission', async () => {
      const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as {
        LLMRouter: { route: jest.Mock };
      };
      LLMRouter.route.mockResolvedValueOnce({
        content: JSON.stringify({
          proposal: 'Bonjour, je suis interesse par votre mission...',
          subjectLine: 'Candidature Dev TypeScript Senior',
          keyPoints: ['10 ans XP', 'Expert Node.js'],
          tone: 'professionnel_engageant',
          estimatedWordCount: 350,
        }),
        totalTokens: 600,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'proposal',
          userId: 'user-1',
          missionDescription: 'Recherche dev TypeScript senior pour refonte API',
          clientName: 'TechCorp',
          platform: 'malt',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('tokensUsed', 600);
    });

    it('returns error when mission description is missing', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'proposal', userId: 'user-1' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('updates mission status when missionId provided', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as {
        eventBus: { publish: jest.Mock; subscribe: jest.Mock; unsubscribe: jest.Mock };
      };

      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockMissionRow({ status: 'applied' })],
        rowCount: 1,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'proposal',
          userId: 'user-1',
          missionId: 'mission-1',
          missionDescription: 'Dev TypeScript',
        },
      }));
      expect(result.success).toBe(true);
      expect(eventBus.publish).toHaveBeenCalledWith(
        'MissionStatusChanged', expect.any(String),
        expect.objectContaining({ missionId: 'mission-1', newStatus: 'applied' }),
      );
    });
  });

  describe('Pipeline Task', () => {
    it('lists missions', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockMissionRow()],
        rowCount: 1,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'pipeline', userId: 'user-1', action: 'list' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('missions');
      expect(result.output).toHaveProperty('total', 1);
    });

    it('gets pipeline stats', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      dbClient.query.mockResolvedValueOnce({
        rows: [
          { status: 'discovered', count: '3' },
          { status: 'applied', count: '2' },
          { status: 'won', count: '1' },
        ],
        rowCount: 3,
      });
      dbClient.query.mockResolvedValueOnce({
        rows: [{ avg_tjm: 55000, potential_revenue: 3300000 }],
        rowCount: 1,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'pipeline', userId: 'user-1', action: 'stats' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('stats');
    });

    it('updates mission status', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { query: jest.Mock; isConnected: jest.Mock };
      };
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockMissionRow({ status: 'interview' })],
        rowCount: 1,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'pipeline', userId: 'user-1', action: 'update_status',
          missionId: 'mission-1', newStatus: 'interview',
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('updated', true);
    });

    it('returns error for missing missionId on update', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'pipeline', userId: 'user-1', action: 'update_status' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });

    it('returns error for unknown pipeline action', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'pipeline', userId: 'user-1', action: 'unknown' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });
  });

  describe('Optimize Task', () => {
    it('optimizes freelance profile', async () => {
      const { LLMRouter } = jest.requireMock('../../../../core/llm/llm-router') as {
        LLMRouter: { route: jest.Mock };
      };
      LLMRouter.route.mockResolvedValueOnce({
        content: JSON.stringify({
          profileScore: 72,
          strengths: ['Expertise TypeScript'],
          weaknesses: ['Portfolio pas assez fourni'],
          recommendations: [{ platform: 'malt', actions: ['Ajouter des cas clients'], priority: 'haute' }],
          tagSuggestions: ['typescript', 'node.js', 'aws'],
        }),
        totalTokens: 550,
      });

      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: {
          type: 'optimize',
          userId: 'user-1',
          profileDescription: 'Dev senior 10 ans, TypeScript, Node.js, AWS',
          targetPlatforms: ['malt', 'comet'],
        },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('profileScore', 72);
      expect(result.output).toHaveProperty('tokensUsed', 550);
    });
  });

  describe('Unknown Task Type', () => {
    it('returns error for unknown task type', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
    });
  });
});

// ── Tools Tests ──

describe('Chasseur Tools', () => {
  describe('getMissions', () => {
    it('returns empty array when DB not connected', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValueOnce(false);
      const result = await getMissions('user-1');
      expect(result).toEqual([]);
    });

    it('returns missions for user', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockMissionRow()],
        rowCount: 1,
      });
      const result = await getMissions('user-1');
      expect(result).toHaveLength(1);
      expect(result[0]!.title).toBe('Dev TypeScript Senior');
    });

    it('filters by status', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      await getMissions('user-1', 'applied');
      expect(dbClient.query).toHaveBeenCalledWith(
        expect.stringContaining('status = $2'),
        ['user-1', 'applied'],
      );
    });

    it('handles query errors gracefully', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockRejectedValueOnce(new Error('DB error'));
      const result = await getMissions('user-1');
      expect(result).toEqual([]);
    });
  });

  describe('createMission', () => {
    it('returns null when DB not connected', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValueOnce(false);
      const result = await createMission('user-1', { title: 'Test' });
      expect(result).toBeNull();
    });

    it('creates a new mission', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockMissionRow()],
        rowCount: 1,
      });
      const result = await createMission('user-1', {
        title: 'Dev TypeScript Senior',
        clientName: 'TechCorp',
        platform: 'malt',
        tjmCents: 55000,
      });
      expect(result).not.toBeNull();
      expect(result!.title).toBe('Dev TypeScript Senior');
    });
  });

  describe('updateMissionStatus', () => {
    it('returns null when DB not connected', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValueOnce(false);
      const result = await updateMissionStatus('mission-1', 'user-1', 'applied');
      expect(result).toBeNull();
    });

    it('updates status successfully', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({
        rows: [makeMockMissionRow({ status: 'applied', applied_at: new Date().toISOString() })],
        rowCount: 1,
      });
      const result = await updateMissionStatus('mission-1', 'user-1', 'applied');
      expect(result).not.toBeNull();
      expect(result!.status).toBe('applied');
    });

    it('returns null when mission not found', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({ rows: [], rowCount: 0 });
      const result = await updateMissionStatus('nonexistent', 'user-1', 'applied');
      expect(result).toBeNull();
    });
  });

  describe('getPipelineStats', () => {
    it('returns default stats when DB not connected', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValueOnce(false);
      const stats = await getPipelineStats('user-1');
      expect(stats.total).toBe(0);
      expect(stats.conversionRate).toBe(0);
    });

    it('calculates pipeline stats correctly', async () => {
      const { dbClient } = jest.requireMock('../../../../infra') as {
        dbClient: { isConnected: jest.Mock; query: jest.Mock };
      };
      dbClient.isConnected.mockReturnValue(true);
      dbClient.query.mockResolvedValueOnce({
        rows: [
          { status: 'discovered', count: '5' },
          { status: 'applied', count: '3' },
          { status: 'interview', count: '1' },
          { status: 'won', count: '1' },
        ],
        rowCount: 4,
      });
      dbClient.query.mockResolvedValueOnce({
        rows: [{ avg_tjm: 55000, potential_revenue: 16500000 }],
        rowCount: 1,
      });

      const stats = await getPipelineStats('user-1');
      expect(stats.total).toBe(10);
      expect(stats.byStatus.discovered).toBe(5);
      expect(stats.byStatus.applied).toBe(3);
      expect(stats.byStatus.won).toBe(1);
      expect(stats.avgTjmCents).toBe(55000);
      expect(stats.conversionRate).toBeGreaterThan(0);
    });
  });
});

// ── Prompts Tests ──

describe('Chasseur Prompts', () => {
  describe('System Prompt', () => {
    it('is defined and substantial', () => {
      expect(CHASSEUR_SYSTEM_PROMPT).toBeDefined();
      expect(CHASSEUR_SYSTEM_PROMPT.length).toBeGreaterThan(200);
    });

    it('mentions freelance platforms', () => {
      expect(CHASSEUR_SYSTEM_PROMPT).toContain('Malt');
      expect(CHASSEUR_SYSTEM_PROMPT).toContain('Comet');
      expect(CHASSEUR_SYSTEM_PROMPT).toContain('Upwork');
    });

    it('mentions the four modes', () => {
      expect(CHASSEUR_SYSTEM_PROMPT).toContain('SEARCH');
      expect(CHASSEUR_SYSTEM_PROMPT).toContain('PROPOSAL');
      expect(CHASSEUR_SYSTEM_PROMPT).toContain('PIPELINE');
      expect(CHASSEUR_SYSTEM_PROMPT).toContain('OPTIMIZE');
    });
  });

  describe('Search Prompt', () => {
    it('contains template variables', () => {
      expect(SEARCH_PROMPT).toContain('{query}');
      expect(SEARCH_PROMPT).toContain('{platforms}');
      expect(SEARCH_PROMPT).toContain('{minTjm}');
    });
  });

  describe('Proposal Prompt', () => {
    it('contains template variables', () => {
      expect(PROPOSAL_PROMPT).toContain('{missionDescription}');
      expect(PROPOSAL_PROMPT).toContain('{clientName}');
      expect(PROPOSAL_PROMPT).toContain('{platform}');
    });
  });

  describe('Prompt Builders', () => {
    it('buildSearchPrompt replaces all placeholders', () => {
      const result = buildSearchPrompt('dev typescript', ['malt'], 500, 800, true, ['typescript']);
      expect(result).toContain('dev typescript');
      expect(result).toContain('malt');
      expect(result).toContain('500');
      expect(result).toContain('800');
      expect(result).toContain('Oui');
      expect(result).toContain('typescript');
    });

    it('buildProposalPrompt replaces all placeholders', () => {
      const result = buildProposalPrompt('Mission dev', 'TechCorp', 'malt');
      expect(result).toContain('Mission dev');
      expect(result).toContain('TechCorp');
      expect(result).toContain('Malt');
    });

    it('buildOptimizePrompt replaces all placeholders', () => {
      const result = buildOptimizePrompt('Mon profil dev', ['malt', 'comet']);
      expect(result).toContain('Mon profil dev');
      expect(result).toContain('Malt');
      expect(result).toContain('Comet');
    });
  });
});

// ── Types Coverage ──

describe('Chasseur Types', () => {
  it('has 7 mission statuses in correct flow', () => {
    expect(MISSION_STATUS_FLOW).toHaveLength(7);
    expect(MISSION_STATUS_FLOW[0]).toBe('discovered');
    expect(MISSION_STATUS_FLOW).toContain('won');
    expect(MISSION_STATUS_FLOW).toContain('lost');
  });

  it('has platform info for all platforms', () => {
    const platforms: FreelancePlatform[] = [
      'malt', 'comet', 'freelance_com', 'upwork',
      'creme_de_la_creme', 'talent_io', 'toptal', 'direct', 'autre',
    ];
    for (const p of platforms) {
      expect(PLATFORM_INFO[p]).toBeDefined();
      expect(PLATFORM_INFO[p].name).toBeTruthy();
    }
    expect(Object.keys(PLATFORM_INFO)).toHaveLength(9);
  });

  it('validates ChasseurTaskType values', () => {
    const types: ChasseurTaskType[] = ['search', 'proposal', 'pipeline', 'optimize'];
    expect(types).toHaveLength(4);
  });
});
