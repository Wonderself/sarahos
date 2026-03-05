import { CineasteAgent } from './cineaste.agent';
import {
  AI_TOOLS_CATALOG,
  getToolsByCategory,
  getToolsByPricing,
  getToolsForPhase,
  formatToolCatalogForPrompt,
} from './cineaste.tools';
import {
  CINEASTE_SYSTEM_PROMPT,
  SCRIPT_TEMPLATE,
  STORYBOARD_TEMPLATE,
  PRODUCTION_TEMPLATE,
  POST_PRODUCTION_TEMPLATE,
  DISTRIBUTE_TEMPLATE,
} from './cineaste.prompts';
import type { AgentTask } from '../../../base/agent.types';

jest.mock('../../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"title":"Test Film","logline":"A test story","genre":"drame","duration":"5min","acts":[],"characters":[],"tool":"Runway ML","steps":[],"editingPipeline":[],"platforms":[]}',
      model: 'claude-sonnet',
      inputTokens: 300,
      outputTokens: 150,
      totalTokens: 450,
      stopReason: 'end_turn',
      latencyMs: 800,
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
    id: 'task-cineaste-1',
    title: 'Cineaste Task',
    description: 'Test cineaste task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

describe('CineasteAgent', () => {
  let agent: CineasteAgent;

  beforeEach(() => {
    jest.clearAllMocks();
    agent = new CineasteAgent();
  });

  describe('configuration', () => {
    it('should have correct id', () => {
      expect(agent.id).toBe('cineaste-agent');
    });

    it('should have correct name', () => {
      expect(agent.name).toBe('Cineaste Agent');
    });

    it('should have correct level', () => {
      expect(agent.level).toBe(1);
    });

    it('should be L1 fast tier', () => {
      expect(agent.modelTier).toBe('fast');
    });

    it('should have all required capabilities', () => {
      expect(agent.capabilities).toContain('script-writing');
      expect(agent.capabilities).toContain('ai-storyboard');
      expect(agent.capabilities).toContain('ai-video-production');
      expect(agent.capabilities).toContain('post-production');
      expect(agent.capabilities).toContain('distribution');
      expect(agent.capabilities).toHaveLength(5);
    });
  });

  describe('lifecycle', () => {
    it('should initialize and subscribe to events', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
      await agent.initialize();
      expect(eventBus.subscribe).toHaveBeenCalledWith('FilmProjectCreated', expect.any(Function), agent.id);
      expect(eventBus.subscribe).toHaveBeenCalledWith('ProductionRequested', expect.any(Function), agent.id);
    });

    it('should shut down and unsubscribe from events', async () => {
      const { eventBus } = jest.requireMock('../../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
      await agent.initialize();
      await agent.shutdown();
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('FilmProjectCreated', agent.id);
      expect(eventBus.unsubscribe).toHaveBeenCalledWith('ProductionRequested', agent.id);
    });
  });

  describe('task execution', () => {
    it('should execute script writing tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'script', theme: 'IA et humanite', genre: 'sci-fi', duration: '10 minutes' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('title');
    });

    it('should execute storyboard tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'storyboard', synopsis: 'Un robot qui reve', visualStyle: 'neo-noir', primaryTool: 'Midjourney' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('recommendedTools');
    });

    it('should execute production tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'production', sceneDescription: 'Plan large ville futuriste', tool: 'Runway ML', duration: '6 secondes' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('availableTools');
    });

    it('should execute post-production tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'post', projectType: 'clip musical', editStyle: 'dynamique', audioNeeds: 'musique Suno + voix ElevenLabs' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('availableTools');
    });

    it('should execute distribution tasks', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'distribute', title: 'Mon Court-Metrage IA', platforms: 'YouTube, festivals', audience: 'cinephiles' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('distributionTools');
    });

    it('should handle unknown task types gracefully', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { type: 'unknown_type' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('error');
      expect(result.output['error']).toContain('Unknown cineaste task type');
    });

    it('should default to script type when no type specified', async () => {
      await agent.initialize();
      const result = await agent.execute(makeTask({
        payload: { theme: 'Test theme' },
      }));
      expect(result.success).toBe(true);
      expect(result.output).toHaveProperty('title');
    });
  });

  describe('prompts', () => {
    it('should have a comprehensive system prompt', () => {
      expect(CINEASTE_SYSTEM_PROMPT.length).toBeGreaterThan(500);
      expect(CINEASTE_SYSTEM_PROMPT).toContain('Runway');
      expect(CINEASTE_SYSTEM_PROMPT).toContain('Suno');
      expect(CINEASTE_SYSTEM_PROMPT).toContain('DaVinci');
    });

    it('should have script template with placeholders', () => {
      expect(SCRIPT_TEMPLATE).toContain('{projectType}');
      expect(SCRIPT_TEMPLATE).toContain('{genre}');
      expect(SCRIPT_TEMPLATE).toContain('{theme}');
    });

    it('should have storyboard template with placeholders', () => {
      expect(STORYBOARD_TEMPLATE).toContain('{synopsis}');
      expect(STORYBOARD_TEMPLATE).toContain('{visualStyle}');
      expect(STORYBOARD_TEMPLATE).toContain('{primaryTool}');
    });

    it('should have production template with placeholders', () => {
      expect(PRODUCTION_TEMPLATE).toContain('{sceneDescription}');
      expect(PRODUCTION_TEMPLATE).toContain('{tool}');
      expect(PRODUCTION_TEMPLATE).toContain('{resolution}');
    });

    it('should have post-production template with placeholders', () => {
      expect(POST_PRODUCTION_TEMPLATE).toContain('{editStyle}');
      expect(POST_PRODUCTION_TEMPLATE).toContain('{audioNeeds}');
      expect(POST_PRODUCTION_TEMPLATE).toContain('{vfxNeeds}');
    });

    it('should have distribution template with placeholders', () => {
      expect(DISTRIBUTE_TEMPLATE).toContain('{title}');
      expect(DISTRIBUTE_TEMPLATE).toContain('{platforms}');
      expect(DISTRIBUTE_TEMPLATE).toContain('{budget}');
    });
  });
});

describe('AI Tools Catalog', () => {
  it('should contain at least 15 tools', () => {
    expect(AI_TOOLS_CATALOG.length).toBeGreaterThanOrEqual(15);
  });

  it('should have tools in all required categories', () => {
    const categories = new Set(AI_TOOLS_CATALOG.map((t) => t.category));
    expect(categories.has('image')).toBe(true);
    expect(categories.has('video')).toBe(true);
    expect(categories.has('voiceover')).toBe(true);
    expect(categories.has('music')).toBe(true);
    expect(categories.has('editing')).toBe(true);
  });

  it('should include key tools by name', () => {
    const names = AI_TOOLS_CATALOG.map((t) => t.name);
    expect(names).toContain('Midjourney');
    expect(names).toContain('Runway ML Gen-3 Alpha');
    expect(names).toContain('Suno AI');
    expect(names).toContain('ElevenLabs');
    expect(names).toContain('DaVinci Resolve');
  });

  it('should have valid URLs for all tools', () => {
    for (const tool of AI_TOOLS_CATALOG) {
      expect(tool.url).toMatch(/^https?:\/\//);
    }
  });

  it('should have non-empty descriptions for all tools', () => {
    for (const tool of AI_TOOLS_CATALOG) {
      expect(tool.description.length).toBeGreaterThan(10);
      expect(tool.bestFor.length).toBeGreaterThan(5);
    }
  });

  describe('getToolsByCategory', () => {
    it('should return only video tools when filtering by video', () => {
      const videoTools = getToolsByCategory('video');
      expect(videoTools.length).toBeGreaterThanOrEqual(4);
      expect(videoTools.every((t) => t.category === 'video')).toBe(true);
    });

    it('should return only image tools when filtering by image', () => {
      const imageTools = getToolsByCategory('image');
      expect(imageTools.length).toBeGreaterThanOrEqual(2);
      expect(imageTools.every((t) => t.category === 'image')).toBe(true);
    });
  });

  describe('getToolsByPricing', () => {
    it('should return free tools', () => {
      const freeTools = getToolsByPricing('free');
      expect(freeTools.length).toBeGreaterThanOrEqual(2);
      expect(freeTools.every((t) => t.pricing === 'free')).toBe(true);
    });

    it('should return freemium tools', () => {
      const freemiumTools = getToolsByPricing('freemium');
      expect(freemiumTools.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('getToolsForPhase', () => {
    it('should return image tools for storyboard phase', () => {
      const tools = getToolsForPhase('storyboard');
      expect(tools.length).toBeGreaterThanOrEqual(2);
      expect(tools.every((t) => t.category === 'image')).toBe(true);
    });

    it('should return video tools for production phase', () => {
      const tools = getToolsForPhase('production');
      expect(tools.length).toBeGreaterThanOrEqual(4);
      expect(tools.every((t) => t.category === 'video')).toBe(true);
    });

    it('should return editing and audio tools for post phase', () => {
      const tools = getToolsForPhase('post');
      expect(tools.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe('formatToolCatalogForPrompt', () => {
    it('should return a formatted string with all tools', () => {
      const formatted = formatToolCatalogForPrompt();
      expect(formatted).toContain('CATALOGUE DES OUTILS IA');
      expect(formatted).toContain('Midjourney');
      expect(formatted).toContain('Runway ML');
    });

    it('should format a subset of tools', () => {
      const videoTools = getToolsByCategory('video');
      const formatted = formatToolCatalogForPrompt(videoTools);
      expect(formatted).toContain('Runway ML');
      expect(formatted).not.toContain('Midjourney'); // Midjourney is image, not video
    });
  });
});
