import { ContentAgent } from './content.agent';
import { generateCopy, checkBrand, adaptTone, createVisual } from './content.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"compliant":true,"violations":[],"score":95}',
      model: 'claude-sonnet', inputTokens: 80, outputTokens: 40, totalTokens: 120,
      stopReason: 'end_turn', latencyMs: 600,
    }),
  },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(), unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

jest.mock('../../../core/memory/memory-manager', () => ({
  memoryManager: {
    store: jest.fn().mockResolvedValue({ id: 'mem-1', content: '', metadata: {}, source: '', createdAt: '' }),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-c-1', title: 'Content Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('ContentAgent', () => {
  let agent: ContentAgent;

  beforeEach(() => {
    agent = new ContentAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Content Agent');
    expect(agent.capabilities).toContain('copywriting');
    expect(agent.capabilities).toContain('brand-check');
  });

  it('subscribes to ContentApproved', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('ContentApproved', expect.any(Function), agent.id);
  });

  it('generates content and runs brand check', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'generate', contentType: 'blog_post', topic: 'AI in business', avatar: 'sarah' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('brandCompliant');
    expect(eventBus.publish).toHaveBeenCalledWith('ContentGenerated', agent.id, expect.objectContaining({ contentType: 'blog_post' }));
  });

  it('handles visual generation tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'visual', description: 'Hero banner for homepage', visualType: 'banner' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('visualPrompt');
  });

  it('handles brand check tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'brand-check', content: 'Test marketing copy for Freenzy.io' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('compliant');
  });

  it('handles tone adaptation tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: 'Adapted content in casual tone',
      model: 'claude-sonnet', inputTokens: 40, outputTokens: 20, totalTokens: 60,
      stopReason: 'end_turn', latencyMs: 300,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'adapt-tone', content: 'Original content', targetTone: 'casual' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('adapted');
  });
});

describe('Content Tools', () => {
  it('generateCopy returns result', async () => {
    const result = await generateCopy('blog_post', 'AI trends');
    expect(result.tone).toBe('professionnel');
  });

  it('createVisual returns imageUrl', async () => {
    const result = await createVisual('banner', 'Hero image');
    expect(result.success).toBe(true);
    expect(result.imageUrl).toContain('placeholder');
  });

  it('checkBrand returns compliant', async () => {
    const result = await checkBrand('Test content');
    expect(result.compliant).toBe(true);
    expect(result.score).toBeGreaterThan(0);
  });

  it('adaptTone returns adapted content', async () => {
    const result = await adaptTone('Original', 'casual');
    expect(result.targetTone).toBe('casual');
  });
});
