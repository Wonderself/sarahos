import { calculateTokenCost, getPricingForModel, TOKEN_PRICING } from './pricing';
import { creditsToMicroCredits, microCreditsToCredits } from './billing.types';

describe('Token Pricing', () => {
  describe('getPricingForModel', () => {
    it('should return pricing for Sonnet', () => {
      const pricing = getPricingForModel('claude-sonnet-4-20250514');
      expect(pricing.provider).toBe('anthropic');
      expect(pricing.marginPercent).toBe(0); // Margin captured at credit pack level
    });

    it('should return pricing for Opus', () => {
      const pricing = getPricingForModel('claude-opus-4-6');
      expect(pricing.provider).toBe('anthropic');
      expect(pricing.inputCostPerMillion).toBeGreaterThan(0);
    });

    it('should return default pricing for unknown model', () => {
      const pricing = getPricingForModel('unknown-model');
      expect(pricing.model).toBe('default');
      expect(pricing.marginPercent).toBe(0); // Margin captured at credit pack level
    });
  });

  describe('calculateTokenCost', () => {
    it('should calculate cost with 0% margin (margin at pack level)', () => {
      const result = calculateTokenCost('claude-sonnet-4-20250514', 1000, 500);
      expect(result.costCredits).toBeGreaterThan(0);
      // With 0% margin, billed equals cost
      expect(result.billedCredits).toBe(result.costCredits);
      expect(result.marginCredits).toBe(0);
    });

    it('should calculate higher cost for Opus vs Sonnet', () => {
      const sonnet = calculateTokenCost('claude-sonnet-4-20250514', 1000, 500);
      const opus = calculateTokenCost('claude-opus-4-6', 1000, 500);
      expect(opus.billedCredits).toBeGreaterThan(sonnet.billedCredits);
    });

    it('should return zero cost for zero tokens', () => {
      const result = calculateTokenCost('claude-sonnet-4-20250514', 0, 0);
      expect(result.costCredits).toBe(0);
      expect(result.billedCredits).toBe(0);
      expect(result.marginCredits).toBe(0);
    });

    it('margin should be 0% (margin captured at credit pack purchase)', () => {
      const result = calculateTokenCost('claude-sonnet-4-20250514', 1000000, 500000);
      expect(result.marginCredits).toBe(0);
      expect(result.billedCredits).toBe(result.costCredits);
    });
  });

  describe('credit conversions', () => {
    it('should convert credits to micro-credits and back', () => {
      expect(creditsToMicroCredits(10)).toBe(10_000_000);
      expect(microCreditsToCredits(10_000_000)).toBe(10);
    });

    it('should round micro-credits', () => {
      expect(creditsToMicroCredits(0.5)).toBe(500_000);
    });
  });

  describe('TOKEN_PRICING configuration', () => {
    it('should have at least 2 models configured', () => {
      expect(TOKEN_PRICING.length).toBeGreaterThanOrEqual(2);
    });

    it('all pricing should have positive cost values', () => {
      for (const p of TOKEN_PRICING) {
        expect(p.inputCostPerMillion).toBeGreaterThan(0);
        expect(p.outputCostPerMillion).toBeGreaterThan(0);
        expect(p.marginPercent).toBeGreaterThanOrEqual(0); // 0 is valid (margin at pack level)
      }
    });

    it('output should cost more than input for all models', () => {
      for (const p of TOKEN_PRICING) {
        expect(p.outputCostPerMillion).toBeGreaterThan(p.inputCostPerMillion);
      }
    });
  });
});
