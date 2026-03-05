import { PortfolioAgent } from './portfolio.agent';
import { formatLinkedInPost, generateEditorialCalendar, validateHeadline, estimateEngagement } from './portfolio.tools';
import {
  PORTFOLIO_SYSTEM_PROMPT,
  LINKEDIN_OPTIMIZE_TEMPLATE,
  CONTENT_GENERATE_TEMPLATE,
  CALENDAR_TEMPLATE,
  BRAND_STRATEGY_TEMPLATE,
} from './portfolio.prompts';
import type { AgentTask } from '../../../base/agent.types';

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"headline":"Expert IA","summary":"Resume optimise","experience":[],"skills":[],"recommendations":[],"hook":"Decouvrez","body":"Corps du post","callToAction":"Commentez","hashtags":["#IA"],"estimatedReach":"5000"}',
      model: 'claude-sonnet',
      inputTokens: 200,
      outputTokens: 100,
      totalTokens: 300,
      stopReason: 'end_turn',
      latencyMs: 600,
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
    id: 'task-portfolio-1',
    title: 'Portfolio Task',
    description: 'Test portfolio task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

describe('PortfolioAgent', () => {
  let agent: PortfolioAgent;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new PortfolioAgent();
  });

  describe('configuration', () => {
    it('should have correct id', () => {
      expect(agent.id).toBe('portfolio-agent');
    });

    it('should have correct name', () => {
      expect(agent.name).toBe('Portfolio Agent');
    });

    it('should have correct level', () => {
      expect(agent.level).toBe(1);
    });

    it('should be L1 fast tier', () => {
      expect(agent.modelTier).toBe('fast');
    });

    it('should have all required capabilities', () => {
      expect(agent.capabilities).toContain('linkedin-optimization');
      expect(agent.capabilities).toContain('content-generation');
      expect(agent.capabilities).toContain('editorial-calendar');
      expect(agent.capabilities).toContain('personal-branding');
      expect(agent.capabilities).toHaveLength(4);
    });
  });

  describe('lifecycle', () => {
    it('should initialize and subscribe to events', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith('BrandingRequested', expect.any(Function), agent.id);
      expect(eventBus.subscribe).toHaveBeenCalledWith('ContentRequested', expect.any(Function), agent.id);
    });

    it('should shut down and unsubscribe from events', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('BrandingRequested', agent.id);
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('ContentRequested', agent.id);
    });
  });

  describe('task execution', () => {
    it('should execute linkedin optimization tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'linkedin', name: 'Jean Dupont', currentRole: 'CTO', industry: 'Tech', goal: 'Thought leadership' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('headline');
    });

    it('should execute content generation tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'content', topic: 'IA en entreprise', tone: 'expert', audience: 'dirigeants' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('hook');
    });

    it('should execute editorial calendar tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'calendar', month: 'Mars 2026', industry: 'SaaS', goals: 'lead generation' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('skeleton');
    });

    it('should execute brand strategy tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'brand', profile: 'CEO startup IA', industry: 'Intelligence Artificielle', goals: 'lever des fonds' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('headline');
    });

    it('should handle unknown task types gracefully', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(result.output['error']).toContain('Unknown portfolio task type');
    });

    it('should default to content type when no type specified', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { topic: 'Test topic' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('hook');
    });
  });

  describe('prompts', () => {
    it('should have a non-empty system prompt', () => {
      expect(PORTFOLIO_SYSTEM_PROMPT.length).toBeGreaterThan(100);
    });

    it('should have LinkedIn optimization template with placeholders', () => {
      expect(LINKEDIN_OPTIMIZE_TEMPLATE).toContain('{name}');
      expect(LINKEDIN_OPTIMIZE_TEMPLATE).toContain('{currentRole}');
      expect(LINKEDIN_OPTIMIZE_TEMPLATE).toContain('{industry}');
    });

    it('should have content generation template with placeholders', () => {
      expect(CONTENT_GENERATE_TEMPLATE).toContain('{topic}');
      expect(CONTENT_GENERATE_TEMPLATE).toContain('{tone}');
      expect(CONTENT_GENERATE_TEMPLATE).toContain('{audience}');
    });

    it('should have calendar template with placeholders', () => {
      expect(CALENDAR_TEMPLATE).toContain('{month}');
      expect(CALENDAR_TEMPLATE).toContain('{frequency}');
    });

    it('should have brand strategy template with placeholders', () => {
      expect(BRAND_STRATEGY_TEMPLATE).toContain('{profile}');
      expect(BRAND_STRATEGY_TEMPLATE).toContain('{values}');
      expect(BRAND_STRATEGY_TEMPLATE).toContain('{strengths}');
    });
  });
});

describe('Portfolio Tools', () => {
  describe('formatLinkedInPost', () => {
    it('should format a post with hook, body, CTA, and hashtags', () => {
      const post = {
        hook: 'Saviez-vous que 80% des recruteurs utilisent LinkedIn ?',
        body: 'Votre profil est votre vitrine.\nOptimisez-le pour attirer les bonnes opportunites.',
        callToAction: 'Et vous, quel est votre meilleur conseil LinkedIn ?',
        hashtags: ['#LinkedIn', '#PersonalBranding', '#Carriere'],
        estimatedReach: '5000',
      };
      const formatted = formatLinkedInPost(post);
      expect(formatted).toContain(post.hook);
      expect(formatted).toContain(post.callToAction);
      expect(formatted).toContain('#LinkedIn');
    });

    it('should add # prefix to hashtags without it', () => {
      const post = {
        hook: 'Test hook',
        body: 'Test body',
        callToAction: 'Test CTA',
        hashtags: ['LinkedIn', '#PersonalBranding'],
        estimatedReach: '1000',
      };
      const formatted = formatLinkedInPost(post);
      expect(formatted).toContain('#LinkedIn');
      expect(formatted).toContain('#PersonalBranding');
    });
  });

  describe('generateEditorialCalendar', () => {
    it('should generate a calendar with correct number of entries', () => {
      const calendar = generateEditorialCalendar('Mars 2026', 'IA et Innovation', 4, 3);
      expect(calendar.month).toBe('Mars 2026');
      expect(calendar.theme).toBe('IA et Innovation');
      expect(calendar.entries).toHaveLength(12); // 4 weeks * 3 posts
    });

    it('should use default values when not provided', () => {
      const calendar = generateEditorialCalendar('Avril 2026', 'Tech');
      expect(calendar.entries).toHaveLength(12); // default 4 weeks * 3 posts
    });

    it('should assign varied formats and platforms', () => {
      const calendar = generateEditorialCalendar('Mai 2026', 'Marketing', 2, 4);
      const formats = new Set(calendar.entries.map((e) => e.format));
      expect(formats.size).toBeGreaterThan(1);
    });
  });

  describe('validateHeadline', () => {
    it('should validate a correct headline', () => {
      const result = validateHeadline('CTO | Expert IA | Speaker');
      expect(result.valid).toBe(true);
    });

    it('should reject a headline exceeding 220 characters', () => {
      const longHeadline = 'A'.repeat(221);
      const result = validateHeadline(longHeadline);
      expect(result.valid).toBe(false);
      expect(result.message).toContain('trop long');
    });

    it('should reject an empty headline', () => {
      const result = validateHeadline('');
      expect(result.valid).toBe(false);
      expect(result.message).toContain('vide');
    });
  });

  describe('estimateEngagement', () => {
    it('should give a higher score for well-structured posts', () => {
      const goodPost = {
        hook: 'Great hook under 150 chars',
        body: 'A'.repeat(900) + '\n\n\n\nMore content',
        callToAction: 'Comment below!',
        hashtags: ['#a', '#b', '#c', '#d'],
        estimatedReach: '5000',
      };
      const result = estimateEngagement(goodPost);
      expect(result.score).toBeGreaterThanOrEqual(80);
      expect(result.factors.length).toBeGreaterThan(3);
    });

    it('should give a lower score for minimal posts', () => {
      const minimalPost = {
        hook: '',
        body: 'Short',
        callToAction: '',
        hashtags: [],
        estimatedReach: '100',
      };
      const result = estimateEngagement(minimalPost);
      expect(result.score).toBeLessThan(60);
    });
  });
});
