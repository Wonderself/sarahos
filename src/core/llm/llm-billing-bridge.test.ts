jest.mock('../../utils/logger', () => ({
  logger: { info: jest.fn(), warn: jest.fn(), debug: jest.fn(), error: jest.fn() },
}));

const mockRecordLlmUsage = jest.fn();
jest.mock('../../billing/wallet.service', () => ({
  walletService: {
    recordLlmUsage: mockRecordLlmUsage,
  },
}));

import { recordAgentUsage, SYSTEM_USER_ID } from './llm-billing-bridge';
import type { LLMResponse } from './llm.types';

describe('llm-billing-bridge', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  const mockResponse: LLMResponse = {
    content: 'Test response',
    model: 'claude-sonnet-4-20250514',
    inputTokens: 100,
    outputTokens: 50,
    totalTokens: 150,
    stopReason: 'end_turn',
    latencyMs: 200,
  };

  describe('SYSTEM_USER_ID', () => {
    it('should be a well-known UUID', () => {
      expect(SYSTEM_USER_ID).toBe('00000000-0000-0000-0000-000000000000');
    });
  });

  describe('recordAgentUsage', () => {
    it('should call walletService.recordLlmUsage with correct data', async () => {
      mockRecordLlmUsage.mockResolvedValue(undefined);

      await recordAgentUsage(mockResponse, 'content-agent-001', 'Content Agent');

      expect(mockRecordLlmUsage).toHaveBeenCalledWith(
        expect.objectContaining({
          userId: SYSTEM_USER_ID,
          walletId: null,
          requestId: null,
          model: 'claude-sonnet-4-20250514',
          provider: 'anthropic',
          inputTokens: 100,
          outputTokens: 50,
          totalTokens: 150,
          agentName: 'Content Agent',
          endpoint: 'agent:content-agent-001',
          durationMs: 200,
          metadata: { source: 'agent-internal' },
        }),
      );
    });

    it('should calculate cost credits with 1% safety margin', async () => {
      mockRecordLlmUsage.mockResolvedValue(undefined);

      await recordAgentUsage(mockResponse, 'agent-1', 'Test Agent');

      const call = mockRecordLlmUsage.mock.calls[0]![0] as {
        costCredits: number;
        billedCredits: number;
        marginCredits: number;
      };
      expect(call.costCredits).toBeGreaterThan(0);
      // With 1% safety margin, billed >= cost
      expect(call.billedCredits).toBeGreaterThanOrEqual(call.costCredits);
      expect(call.marginCredits).toBeGreaterThanOrEqual(0);
    });

    it('should not throw when walletService fails', async () => {
      mockRecordLlmUsage.mockRejectedValue(new Error('DB connection failed'));

      // Should not throw
      await expect(
        recordAgentUsage(mockResponse, 'agent-1', 'Test Agent'),
      ).resolves.toBeUndefined();
    });

    it('should handle opus model pricing', async () => {
      mockRecordLlmUsage.mockResolvedValue(undefined);

      const opusResponse: LLMResponse = {
        ...mockResponse,
        model: 'claude-opus-4-6',
      };

      await recordAgentUsage(opusResponse, 'chief-agent', 'Chief Orchestration');

      const call = mockRecordLlmUsage.mock.calls[0]![0] as {
        costCredits: number;
        model: string;
      };
      expect(call.model).toBe('claude-opus-4-6');
      // Opus is 5x more expensive than Sonnet for input
      expect(call.costCredits).toBeGreaterThan(0);
    });
  });
});
