jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockStream = {
  on: jest.fn(),
  finalMessage: jest.fn(),
};

jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: {
      stream: jest.fn().mockReturnValue(mockStream),
    },
  }));
});

import { streamLLM } from './llm-stream';
import { llmCircuitBreaker } from './circuit-breaker';
import type { LLMRequest } from './llm.types';

describe('streamLLM', () => {
  const baseRequest: LLMRequest = {
    agentId: 'test-agent',
    agentName: 'Test Agent',
    modelTier: 'standard',
    systemPrompt: 'You are helpful.',
    userMessage: 'Hello',
  };

  let sseEvents: Array<{ event: string; data: string }>;
  const sseWriter = (event: string, data: string) => {
    sseEvents.push({ event, data });
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env['ANTHROPIC_API_KEY'] = 'test-key';
    llmCircuitBreaker.reset();
    sseEvents = [];

    // Setup stream mock to capture and invoke text handler
    mockStream.on.mockImplementation((event: string, handler: (text: string) => void) => {
      if (event === 'text') {
        // Simulate streaming chunks
        handler('Hello');
        handler(' world');
        handler('!');
      }
      return mockStream;
    });

    mockStream.finalMessage.mockResolvedValue({
      usage: { input_tokens: 10, output_tokens: 8 },
      stop_reason: 'end_turn',
    });
  });

  afterEach(() => {
    delete process.env['ANTHROPIC_API_KEY'];
  });

  it('should stream content deltas via SSE writer', async () => {
    const result = await streamLLM(baseRequest, sseWriter);

    // Check content_delta events
    const deltas = sseEvents.filter((e) => e.event === 'content_delta');
    expect(deltas).toHaveLength(3);
    expect(JSON.parse(deltas[0]!.data)).toEqual({ text: 'Hello' });
    expect(JSON.parse(deltas[1]!.data)).toEqual({ text: ' world' });
    expect(JSON.parse(deltas[2]!.data)).toEqual({ text: '!' });

    // Check message_complete event
    const complete = sseEvents.find((e) => e.event === 'message_complete');
    expect(complete).toBeDefined();
    const completeData = JSON.parse(complete!.data);
    expect(completeData.inputTokens).toBe(10);
    expect(completeData.outputTokens).toBe(8);
    expect(completeData.totalTokens).toBe(18);

    // Check done event
    const done = sseEvents.find((e) => e.event === 'done');
    expect(done).toBeDefined();
    expect(done!.data).toBe('[DONE]');

    // Check return value
    expect(result.content).toBe('Hello world!');
    expect(result.inputTokens).toBe(10);
    expect(result.outputTokens).toBe(8);
    expect(result.totalTokens).toBe(18);
  });

  it('should block when circuit breaker is OPEN', async () => {
    for (let i = 0; i < 5; i++) {
      llmCircuitBreaker.recordFailure();
    }

    await expect(streamLLM(baseRequest, sseWriter)).rejects.toThrow('circuit breaker is OPEN');
    expect(sseEvents).toHaveLength(0);
  });

  it('should send error event on failure', async () => {
    mockStream.on.mockImplementation(() => mockStream);
    mockStream.finalMessage.mockRejectedValue(new Error('Stream error'));

    await expect(streamLLM(baseRequest, sseWriter)).rejects.toThrow('LLM stream failed');

    const errorEvent = sseEvents.find((e) => e.event === 'error');
    expect(errorEvent).toBeDefined();
    expect(JSON.parse(errorEvent!.data).error).toContain('Stream error');
  });

  it('should return correct model for tier', async () => {
    const result = await streamLLM(
      { ...baseRequest, modelTier: 'fast' },
      sseWriter,
    );

    expect(result.model).toContain('sonnet');
  });

  it('should record circuit breaker success on completion', async () => {
    llmCircuitBreaker.recordFailure();
    expect(llmCircuitBreaker.getState().failures).toBe(1);

    await streamLLM(baseRequest, sseWriter);
    expect(llmCircuitBreaker.getState().failures).toBe(0);
  });
});
