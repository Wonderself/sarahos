jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockWalletService = {
  hold: jest.fn(),
  releaseHold: jest.fn(),
  hasBalance: jest.fn(),
  withdraw: jest.fn(),
  getWalletByUserId: jest.fn(),
  recordLlmUsage: jest.fn(),
  getAutoTopupSettings: jest.fn(),
  getUsageSummary: jest.fn(),
};

jest.mock('./wallet.service', () => ({
  walletService: mockWalletService,
}));

jest.mock('../users/user.repository', () => ({
  userRepository: {
    findById: jest.fn().mockResolvedValue(null),
  },
}));

const mockCallLLM = jest.fn();
jest.mock('../core/llm/llm-client', () => ({
  callLLM: mockCallLLM,
}));

// Mock guardrails modules
jest.mock('../core/guardrails/token-budget-manager', () => ({
  beforeClaudeCall: jest.fn().mockResolvedValue({ allowed: true, maxTokensAllowed: 8000, consumed: { today: 0, thisHour: 0, thisMinute: 0 } }),
  afterClaudeCall: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../core/guardrails/circuit-breaker-enhanced', () => ({
  checkAgentCircuitBreaker: jest.fn().mockResolvedValue({ allowed: true }),
  recordAgentTokens: jest.fn().mockResolvedValue(undefined),
  recordGlobalTokens: jest.fn().mockResolvedValue(undefined),
}));
jest.mock('../core/guardrails/user-mode', () => ({
  getUserMode: jest.fn().mockResolvedValue('pro'),
}));
const mockSelectModel = jest.fn().mockResolvedValue('claude-sonnet-4-20250514');
jest.mock('../core/guardrails/model-router', () => ({
  selectModel: mockSelectModel,
}));
jest.mock('../core/guardrails/memory-optimizer', () => ({
  optimizeConversationContext: jest.fn().mockRejectedValue(new Error('mock')),
}));
jest.mock('../core/guardrails/security-hardening', () => ({
  getSecuritySystemPromptSuffix: jest.fn().mockReturnValue(''),
}));
jest.mock('../core/guardrails/loop-detector', () => ({
  startChain: jest.fn().mockReturnValue({ chainId: 'test-chain', initiatorUserId: 'u1', callStack: [], depth: 0, totalTokens: 0, totalCost: 0, startedAt: Date.now(), maxDepth: 5, maxTokens: 100000, maxDurationMs: 120000 }),
  recordChainTokens: jest.fn(),
  endChain: jest.fn(),
}));

import { LlmProxyService } from './llm-proxy.service';

describe('LlmProxyService', () => {
  let service: LlmProxyService;

  const defaultLLMResponse = {
    content: 'Hello! How can I help you?',
    model: 'claude-sonnet-4-20250514',
    inputTokens: 12,
    outputTokens: 8,
    totalTokens: 20,
    stopReason: 'end_turn',
    latencyMs: 150,
  };

  beforeEach(() => {
    service = new LlmProxyService();
    jest.clearAllMocks();
    mockCallLLM.mockResolvedValue(defaultLLMResponse);
    // Default: daily budget check passes
    mockWalletService.getUsageSummary.mockResolvedValue({ totalBilledCredits: 0 });
  });

  describe('processRequest', () => {
    const baseRequest = {
      userId: 'u1',
      model: 'claude-sonnet-4-20250514',
      messages: [{ role: 'user', content: 'Hello world' }],
    };

    it('should return error if insufficient balance (hold fails)', async () => {
      mockWalletService.hold.mockResolvedValue(null);
      mockWalletService.getAutoTopupSettings.mockResolvedValue(null);

      const result = await service.processRequest(baseRequest);
      expect(result).toEqual({ error: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE' });
      expect(mockCallLLM).not.toHaveBeenCalled();
    });

    it('should process request with billing when balance available', async () => {
      mockWalletService.hold.mockResolvedValue('hold-1');
      mockWalletService.releaseHold.mockResolvedValue(undefined);
      mockWalletService.getWalletByUserId.mockResolvedValue({ id: 'w1' });
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      const result = await service.processRequest(baseRequest);
      expect('error' in result).toBe(false);
      if (!('error' in result)) {
        expect(result.content).toBe('Hello! How can I help you?');
        expect(result.model).toBe('claude-sonnet-4-20250514');
        expect(result.inputTokens).toBe(12);
        expect(result.outputTokens).toBe(8);
        expect(result.billedCredits).toBeGreaterThan(0);
        expect(result.costCredits).toBeGreaterThan(0);
        expect(result.durationMs).toBeGreaterThanOrEqual(0);
      }
    });

    it('should call callLLM with correctly mapped request', async () => {
      mockWalletService.hold.mockResolvedValue('hold-1');
      mockWalletService.releaseHold.mockResolvedValue(undefined);
      mockWalletService.getWalletByUserId.mockResolvedValue({ id: 'w1' });
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      await service.processRequest({
        ...baseRequest,
        messages: [
          { role: 'system', content: 'You are Sarah.' },
          { role: 'user', content: 'Bonjour' },
        ],
        agentName: 'content-agent',
        maxTokens: 2048,
        temperature: 0.7,
      });

      expect(mockCallLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          agentId: 'content-agent',
          agentName: 'content-agent',
          modelTier: 'standard',
          systemPrompt: 'You are Sarah.',
          userMessage: 'Bonjour',
          maxTokens: 2048,
          temperature: 0.7,
        }),
      );
    });

    it('should map opus model to advanced tier when model router selects opus', async () => {
      mockWalletService.hold.mockResolvedValue('hold-1');
      mockWalletService.releaseHold.mockResolvedValue(undefined);
      mockWalletService.getWalletByUserId.mockResolvedValue({ id: 'w1' });
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);
      mockSelectModel.mockResolvedValueOnce('claude-opus-4-6');

      await service.processRequest({
        ...baseRequest,
        model: 'claude-opus-4-6',
      });

      expect(mockCallLLM).toHaveBeenCalledWith(
        expect.objectContaining({ modelTier: 'advanced' }),
      );
    });

    it('should map conversation history correctly', async () => {
      mockWalletService.hold.mockResolvedValue('hold-1');
      mockWalletService.releaseHold.mockResolvedValue(undefined);
      mockWalletService.getWalletByUserId.mockResolvedValue({ id: 'w1' });
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      await service.processRequest({
        ...baseRequest,
        messages: [
          { role: 'user', content: 'First question' },
          { role: 'assistant', content: 'First answer' },
          { role: 'user', content: 'Follow-up' },
        ],
      });

      expect(mockCallLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          userMessage: 'Follow-up',
          conversationHistory: [
            { role: 'user', content: 'First question' },
            { role: 'assistant', content: 'First answer' },
          ],
        }),
      );
    });

    it('should still return result even when wallet lookup returns null', async () => {
      mockWalletService.hold.mockResolvedValue('hold-1');
      mockWalletService.releaseHold.mockResolvedValue(undefined);
      mockWalletService.getWalletByUserId.mockResolvedValue(null);
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      const result = await service.processRequest(baseRequest);
      expect('content' in result).toBe(true);
      if (!('error' in result)) {
        expect(result.content).toBe('Hello! How can I help you?');
      }
    });

    it('should record LLM usage after request', async () => {
      mockWalletService.hold.mockResolvedValue('hold-1');
      mockWalletService.releaseHold.mockResolvedValue(undefined);
      mockWalletService.getWalletByUserId.mockResolvedValue({ id: 'w1' });
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      await service.processRequest({
        ...baseRequest,
        agentName: 'test-agent',
        requestId: 'req-1',
      });

      expect(mockWalletService.recordLlmUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: 'u1',
          model: 'claude-sonnet-4-20250514',
          provider: 'anthropic',
          agentName: 'test-agent',
          requestId: 'req-1',
          inputTokens: 12,
          outputTokens: 8,
          totalTokens: 20,
        }),
      );
    });

    it('should use default system prompt when no system message provided', async () => {
      mockWalletService.hold.mockResolvedValue('hold-1');
      mockWalletService.releaseHold.mockResolvedValue(undefined);
      mockWalletService.getWalletByUserId.mockResolvedValue({ id: 'w1' });
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      await service.processRequest(baseRequest);

      expect(mockCallLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: 'You are a helpful AI assistant.',
        }),
      );
    });

    it('should propagate LLM errors and release hold with full refund', async () => {
      mockWalletService.hold.mockResolvedValue('hold-1');
      mockWalletService.releaseHold.mockResolvedValue(undefined);
      mockCallLLM.mockRejectedValue(new Error('Anthropic API error'));

      await expect(service.processRequest(baseRequest)).rejects.toThrow('Anthropic API error');
      expect(mockWalletService.releaseHold).toHaveBeenCalledWith(
        'u1', 'hold-1', expect.any(Number), 0,
      );
    });
  });
});
