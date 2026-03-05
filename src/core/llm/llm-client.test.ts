jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

jest.mock('../../utils/retry', () => ({
  withRetry: jest.fn(async (fn: () => Promise<unknown>) => fn()),
}));

const mockCreate = jest.fn();
jest.mock('@anthropic-ai/sdk', () => {
  return jest.fn().mockImplementation(() => ({
    messages: { create: mockCreate },
  }));
});

jest.mock('../guardrails/fallback-manager', () => ({
  isProviderDown: jest.fn().mockResolvedValue(false),
  recordProviderFailure: jest.fn().mockResolvedValue(undefined),
  recordProviderSuccess: jest.fn().mockResolvedValue(undefined),
}));

// Must import after mocks
import { callLLM } from './llm-client';
import { llmCircuitBreaker } from './circuit-breaker';
import type { LLMRequest } from './llm.types';

describe('callLLM', () => {
  const baseRequest: LLMRequest = {
    agentId: 'test-agent-001',
    agentName: 'Test Agent',
    modelTier: 'standard',
    systemPrompt: 'You are a test assistant.',
    userMessage: 'Hello',
  };

  beforeEach(() => {
    jest.clearAllMocks();
    process.env['ANTHROPIC_API_KEY'] = 'test-key';
    llmCircuitBreaker.reset();
  });

  afterEach(() => {
    delete process.env['ANTHROPIC_API_KEY'];
  });

  it('should call Anthropic SDK with correct params', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Hello back!' }],
      usage: { input_tokens: 10, output_tokens: 5 },
      stop_reason: 'end_turn',
    });

    const result = await callLLM(baseRequest);

    expect(result.content).toBe('Hello back!');
    expect(result.inputTokens).toBe(10);
    expect(result.outputTokens).toBe(5);
    expect(result.totalTokens).toBe(15);
    expect(result.stopReason).toBe('end_turn');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        model: expect.any(String),
        max_tokens: 4096,
        system: [{ type: 'text', text: 'You are a test assistant.', cache_control: { type: 'ephemeral' } }],
        messages: [{ role: 'user', content: 'Hello' }],
      }),
    );
  });

  it('should include conversation history', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Response' }],
      usage: { input_tokens: 20, output_tokens: 10 },
      stop_reason: 'end_turn',
    });

    await callLLM({
      ...baseRequest,
      conversationHistory: [
        { role: 'user', content: 'First message' },
        { role: 'assistant', content: 'First reply' },
      ],
    });

    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        messages: [
          { role: 'user', content: 'First message' },
          { role: 'assistant', content: 'First reply' },
          { role: 'user', content: 'Hello' },
        ],
      }),
    );
  });

  it('should handle tool use responses', async () => {
    mockCreate.mockResolvedValue({
      content: [
        { type: 'text', text: 'Let me look that up.' },
        { type: 'tool_use', id: 'tool-1', name: 'search', input: { query: 'test' } },
      ],
      usage: { input_tokens: 15, output_tokens: 20 },
      stop_reason: 'tool_use',
    });

    const result = await callLLM({
      ...baseRequest,
      tools: [{ name: 'search', description: 'Search tool', input_schema: { type: 'object' } }],
    });

    expect(result.toolCalls).toHaveLength(1);
    expect(result.toolCalls![0]).toEqual({
      id: 'tool-1',
      name: 'search',
      input: { query: 'test' },
    });
    expect(result.stopReason).toBe('tool_use');
  });

  it('should handle thinking blocks for extended thinking', async () => {
    mockCreate.mockResolvedValue({
      content: [
        { type: 'thinking', thinking: 'Let me think about this carefully...' },
        { type: 'text', text: 'Here is my answer.' },
      ],
      usage: { input_tokens: 10, output_tokens: 50 },
      stop_reason: 'end_turn',
    });

    const result = await callLLM({
      ...baseRequest,
      modelTier: 'advanced',
      enableThinking: true,
      thinkingBudgetTokens: 4096,
    });

    expect(result.thinking).toBe('Let me think about this carefully...');
    expect(result.content).toBe('Here is my answer.');

    // Verify thinking params were passed
    expect(mockCreate).toHaveBeenCalledWith(
      expect.objectContaining({
        thinking: { type: 'enabled', budget_tokens: 4096 },
      }),
    );
  });

  it('should remove temperature when thinking is enabled', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Response' }],
      usage: { input_tokens: 5, output_tokens: 5 },
      stop_reason: 'end_turn',
    });

    await callLLM({
      ...baseRequest,
      enableThinking: true,
      temperature: 0.7,
    });

    const callArgs = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
    expect(callArgs['temperature']).toBeUndefined();
    expect(callArgs['thinking']).toBeDefined();
  });

  it('should set temperature when no thinking', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'Response' }],
      usage: { input_tokens: 5, output_tokens: 5 },
      stop_reason: 'end_turn',
    });

    await callLLM({
      ...baseRequest,
      temperature: 0.5,
    });

    const callArgs = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
    expect(callArgs['temperature']).toBe(0.5);
  });

  it('should throw LLMError on API failure', async () => {
    mockCreate.mockRejectedValue(new Error('API Error'));

    await expect(callLLM(baseRequest)).rejects.toThrow('LLM call failed for Test Agent');
  });

  it('should block when circuit breaker is OPEN', async () => {
    // Trip the circuit breaker
    for (let i = 0; i < 5; i++) {
      llmCircuitBreaker.recordFailure();
    }

    await expect(callLLM(baseRequest)).rejects.toThrow('circuit breaker is OPEN');
    expect(mockCreate).not.toHaveBeenCalled();
  });

  it('should record circuit breaker success on successful call', async () => {
    llmCircuitBreaker.recordFailure(); // partial failure
    expect(llmCircuitBreaker.getState().failures).toBe(1);

    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'OK' }],
      usage: { input_tokens: 5, output_tokens: 5 },
      stop_reason: 'end_turn',
    });

    await callLLM(baseRequest);
    expect(llmCircuitBreaker.getState().failures).toBe(0);
  });

  it('should record circuit breaker failure on API error', async () => {
    mockCreate.mockRejectedValue(new Error('Server error'));

    try { await callLLM(baseRequest); } catch { /* expected */ }
    expect(llmCircuitBreaker.getState().failures).toBe(1);
  });

  it('should ensure maxTokens > thinkingBudget when thinking enabled', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'OK' }],
      usage: { input_tokens: 5, output_tokens: 5 },
      stop_reason: 'end_turn',
    });

    await callLLM({
      ...baseRequest,
      enableThinking: true,
      thinkingBudgetTokens: 8000,
      maxTokens: 1000, // way too low for thinking budget
    });

    const callArgs = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
    expect(callArgs['max_tokens']).toBeGreaterThan(8000);
  });

  it('should map model tiers correctly', async () => {
    mockCreate.mockResolvedValue({
      content: [{ type: 'text', text: 'OK' }],
      usage: { input_tokens: 5, output_tokens: 5 },
      stop_reason: 'end_turn',
    });

    // Fast tier
    await callLLM({ ...baseRequest, modelTier: 'fast' });
    const fastCall = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
    expect(fastCall['model']).toContain('sonnet');

    mockCreate.mockClear();

    // Advanced tier
    await callLLM({ ...baseRequest, modelTier: 'advanced' });
    const advancedCall = mockCreate.mock.calls[0]![0] as Record<string, unknown>;
    expect(advancedCall['model']).toContain('opus');
  });
});
