jest.mock('../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockWalletService = {
  hasBalance: jest.fn(),
  withdraw: jest.fn(),
  getWalletByUserId: jest.fn(),
  recordLlmUsage: jest.fn(),
};

jest.mock('./wallet.service', () => ({
  walletService: mockWalletService,
}));

const mockCallLLM = jest.fn();
jest.mock('../core/llm/llm-client', () => ({
  callLLM: mockCallLLM,
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
  });

  describe('processRequest', () => {
    const baseRequest = {
      userId: 'u1',
      model: 'claude-sonnet-4-20250514',
      messages: [{ role: 'user', content: 'Hello world' }],
    };

    it('should return error if insufficient balance', async () => {
      mockWalletService.hasBalance.mockResolvedValue(false);

      const result = await service.processRequest(baseRequest);
      expect(result).toEqual({ error: 'Insufficient balance', code: 'INSUFFICIENT_BALANCE' });
      expect(mockCallLLM).not.toHaveBeenCalled();
    });

    it('should process request with billing when balance available', async () => {
      mockWalletService.hasBalance.mockResolvedValue(true);
      mockWalletService.withdraw.mockResolvedValue({ id: 'tx1' });
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
      mockWalletService.hasBalance.mockResolvedValue(true);
      mockWalletService.withdraw.mockResolvedValue({ id: 'tx1' });
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

    it('should map opus model to advanced tier', async () => {
      mockWalletService.hasBalance.mockResolvedValue(true);
      mockWalletService.withdraw.mockResolvedValue({ id: 'tx1' });
      mockWalletService.getWalletByUserId.mockResolvedValue({ id: 'w1' });
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      await service.processRequest({
        ...baseRequest,
        model: 'claude-opus-4-6',
      });

      expect(mockCallLLM).toHaveBeenCalledWith(
        expect.objectContaining({ modelTier: 'advanced' }),
      );
    });

    it('should map conversation history correctly', async () => {
      mockWalletService.hasBalance.mockResolvedValue(true);
      mockWalletService.withdraw.mockResolvedValue({ id: 'tx1' });
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

    it('should still return result if withdrawal fails', async () => {
      mockWalletService.hasBalance.mockResolvedValue(true);
      mockWalletService.withdraw.mockResolvedValue(null);
      mockWalletService.getWalletByUserId.mockResolvedValue(null);
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      const result = await service.processRequest(baseRequest);
      expect('content' in result).toBe(true);
      if (!('error' in result)) {
        expect(result.content).toBe('Hello! How can I help you?');
      }
    });

    it('should record LLM usage after request', async () => {
      mockWalletService.hasBalance.mockResolvedValue(true);
      mockWalletService.withdraw.mockResolvedValue({ id: 'tx1' });
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
      mockWalletService.hasBalance.mockResolvedValue(true);
      mockWalletService.withdraw.mockResolvedValue({ id: 'tx1' });
      mockWalletService.getWalletByUserId.mockResolvedValue({ id: 'w1' });
      mockWalletService.recordLlmUsage.mockResolvedValue(undefined);

      await service.processRequest(baseRequest);

      expect(mockCallLLM).toHaveBeenCalledWith(
        expect.objectContaining({
          systemPrompt: 'You are a helpful AI assistant.',
        }),
      );
    });

    it('should propagate LLM errors', async () => {
      mockWalletService.hasBalance.mockResolvedValue(true);
      mockCallLLM.mockRejectedValue(new Error('Anthropic API error'));

      await expect(service.processRequest(baseRequest)).rejects.toThrow('Anthropic API error');
      expect(mockWalletService.withdraw).not.toHaveBeenCalled();
    });
  });
});
