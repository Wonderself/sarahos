import { CommunicationAgent } from './communication.agent';
import { sendEmail, postSlack, translate, parseMessage } from './communication.tools';
import type { AgentTask } from '../../base/agent.types';

jest.mock('../../../utils/logger', () => ({
  logger: { info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() },
  createAgentLogger: () => ({ info: jest.fn(), debug: jest.fn(), warn: jest.fn(), error: jest.fn() }),
}));

jest.mock('../../../core/llm/llm-router', () => ({
  LLMRouter: {
    route: jest.fn().mockResolvedValue({
      content: '{"sender":"test","intent":"inquiry","urgency":"medium","entities":[],"suggestedAction":"reply"}',
      model: 'claude-sonnet',
      inputTokens: 100,
      outputTokens: 50,
      totalTokens: 150,
      stopReason: 'end_turn',
      latencyMs: 500,
    }),
  },
}));

jest.mock('../../../core/event-bus/event-bus', () => ({
  eventBus: {
    subscribe: jest.fn(),
    unsubscribe: jest.fn(),
    publish: jest.fn().mockResolvedValue({ id: 'evt-1', type: 'test', sourceAgent: 'test', payload: {}, timestamp: new Date().toISOString() }),
  },
}));

jest.mock('../../../core/memory/memory-manager', () => ({
  memoryManager: {
    store: jest.fn().mockResolvedValue({ id: 'mem-1', content: '', metadata: {}, source: '', createdAt: '' }),
    search: jest.fn().mockResolvedValue([]),
  },
}));

function makeTask(overrides: Partial<AgentTask> = {}): AgentTask {
  return {
    id: 'task-comm-1',
    title: 'Communication Task',
    description: 'Test communication task',
    priority: 'MEDIUM',
    payload: {},
    assignedBy: 'orchestrator',
    correlationId: 'corr-1',
    ...overrides,
  };
}

describe('CommunicationAgent', () => {
  let agent: CommunicationAgent;

  beforeEach(() => {
    agent = new CommunicationAgent();
    jest.clearAllMocks();
  });

  it('initializes with correct config', () => {
    expect(agent.name).toBe('Communication Agent');
    expect(agent.level).toBe(1);
    expect(agent.modelTier).toBe('fast');
    expect(agent.capabilities).toContain('email');
    expect(agent.capabilities).toContain('translate');
  });

  it('initializes and subscribes to events', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { subscribe: jest.Mock } };
    await agent.initialize();
    expect(eventBus.subscribe).toHaveBeenCalledWith('DirectiveIssued', expect.any(Function), agent.id);
    expect(eventBus.subscribe).toHaveBeenCalledWith('MessageReceived', expect.any(Function), agent.id);
  });

  it('executes email tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'email', to: 'user@example.com', subject: 'Test', context: 'Meeting follow-up' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('messageId');
  });

  it('executes slack tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'slack', channel: '#team', context: 'Daily standup update' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('channel', '#team');
  });

  it('executes translation tasks', async () => {
    const { LLMRouter } = jest.requireMock('../../../core/llm/llm-router') as { LLMRouter: { route: jest.Mock } };
    LLMRouter.route.mockResolvedValueOnce({
      content: 'Bonjour, veuillez préparer le rapport mensuel.',
      model: 'claude-sonnet',
      inputTokens: 80,
      outputTokens: 30,
      totalTokens: 110,
      stopReason: 'end_turn',
      latencyMs: 400,
    });

    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'translate', text: 'Hello, please prepare the monthly report.', from: 'en', to: 'fr' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('translated');
    expect(result.output).toHaveProperty('sourceLanguage', 'en');
    expect(result.output).toHaveProperty('targetLanguage', 'fr');
  });

  it('executes parse tasks', async () => {
    await agent.initialize();
    const result = await agent.execute(makeTask({
      payload: { type: 'parse', message: 'Urgent: Need Q4 financials by EOD' },
    }));
    expect(result.success).toBe(true);
    expect(result.output).toHaveProperty('intent');
  });

  it('shuts down and unsubscribes', async () => {
    const { eventBus } = jest.requireMock('../../../core/event-bus/event-bus') as { eventBus: { unsubscribe: jest.Mock } };
    await agent.initialize();
    await agent.shutdown();
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('DirectiveIssued', agent.id);
    expect(eventBus.unsubscribe).toHaveBeenCalledWith('MessageReceived', agent.id);
  });
});

describe('Communication Tools', () => {
  it('sendEmail returns success', async () => {
    const result = await sendEmail('test@example.com', 'Subject', 'Body');
    expect(result.success).toBe(true);
    expect(result.messageId).toBeDefined();
  });

  it('postSlack returns success', async () => {
    const result = await postSlack('#general', 'Hello');
    expect(result.success).toBe(true);
    expect(result.channel).toBe('#general');
  });

  it('translate returns result', async () => {
    const result = await translate('Hello', 'en', 'fr');
    expect(result.sourceLanguage).toBe('en');
    expect(result.targetLanguage).toBe('fr');
  });

  it('parseMessage returns structured result', async () => {
    const result = await parseMessage('Test message');
    expect(result.urgency).toBeDefined();
    expect(result.intent).toBeDefined();
  });
});
