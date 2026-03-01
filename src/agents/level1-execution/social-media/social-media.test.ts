import { SocialMediaAgent } from './social-media.agent';
import { postLinkedIn, postX, trackEngagement, schedulePost, isViral } from './social-media.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: 'Generated social post content #Innovation #IA', model: 'claude-sonnet',
      inputTokens: 60, outputTokens: 30, totalTokens: 90, stopReason: 'end_turn', latencyMs: 400,
    }),
  },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(), unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: '' }),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-sm-1', title: 'Social Task', description: 'Test', priority: 'MEDIUM',
    payload: {}, assignedBy: 'orchestrator', correlationId: 'corr-1', ...overrides,
  };
}

describe('SocialMediaAgent', () => {
  let agent: SocialMediaAgent;

  beforeEach(() => {
    agent = new SocialMediaAgent();
    jest.clearAllMocks();
  });

  it('has correct config', () => {
    expect(agent.name).toBe('Social Media Agent');
    expect(agent.capabilities).toContain('post-linkedin');
    expect(agent.capabilities).toContain('track-engagement');
  });

  it('subscribes to ContentGenerated', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('ContentGenerated', expect.any(Function), agent.id);
  });

  it('posts to LinkedIn and publishes PostPublished', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'post', platform: 'linkedin', content: 'Test post #IA' },
    }));
    expect(result.success).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith('PostPublished', agent.id, expect.objectContaining({ platform: 'linkedin' }));
  });

  it('posts to X', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'post', platform: 'x', content: 'Short tweet' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('platform', 'x');
  });

  it('schedules posts', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'schedule', platform: 'linkedin', content: 'Scheduled', scheduledAt: '2026-03-01T09:00:00Z' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('scheduledId');
  });

  it('tracks engagement and publishes report', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { publish: jest.Mock } };
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'track', postId: 'li_123', platform: 'linkedin' },
    }));
    expect(result.success).toBe(true);
    expect(eventBus.publish).toHaveBeenCalledWith('EngagementReport', agent.id, expect.any(Object));
  });

  it('generates content for a platform via LLM', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { taskType: 'generate', platform: 'linkedin', topic: 'AI trends', avatar: 'sarah' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('generatedContent');
    expect(result.output).toHaveProperty('avatar', 'sarah');
  });
});

describe('Social Media Tools', () => {
  it('postLinkedIn returns success', async () => {
    const result = await postLinkedIn('Post content');
    expect(result.success).toBe(true);
    expect(result.postUrl).toContain('linkedin');
  });

  it('postX returns success', async () => {
    const result = await postX('Tweet');
    expect(result.success).toBe(true);
  });

  it('trackEngagement returns metrics', async () => {
    const result = await trackEngagement('post_1', 'linkedin');
    expect(result).toHaveProperty('likes');
    expect(result).toHaveProperty('engagementRate');
  });

  it('schedulePost returns scheduledId', async () => {
    const result = await schedulePost('linkedin', 'content', '2026-03-01');
    expect(result.success).toBe(true);
  });

  it('isViral detects high engagement', () => {
    expect(isViral({ likes: 500, shares: 100, comments: 50, impressions: 10000, engagementRate: 0.065 })).toBe(true);
    expect(isViral({ likes: 5, shares: 0, comments: 1, impressions: 1000, engagementRate: 0.006 })).toBe(false);
  });
});
