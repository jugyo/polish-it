import { describe, it, expect } from 'vitest';
import { getCostPer1MTokens, calculateCost } from './pricing';

describe('pricing', () => {
  describe('getCostPer1MTokens', () => {
    it('should return correct pricing for gpt-4o-mini', () => {
      const cost = getCostPer1MTokens('gpt-4o-mini');
      expect(cost).toEqual({ input: 0.15, output: 0.6 });
    });

    it('should return correct pricing for gpt-4o-mini (case insensitive)', () => {
      const cost = getCostPer1MTokens('GPT-4O-MINI');
      expect(cost).toEqual({ input: 0.15, output: 0.6 });
    });

    it('should return correct pricing for gpt-4o', () => {
      const cost = getCostPer1MTokens('gpt-4o');
      expect(cost).toEqual({ input: 2.5, output: 10.0 });
    });

    it('should return correct pricing for gpt-4o-2024-08-06', () => {
      const cost = getCostPer1MTokens('gpt-4o-2024-08-06');
      expect(cost).toEqual({ input: 2.5, output: 10.0 });
    });

    it('should return correct pricing for gpt-4-turbo', () => {
      const cost = getCostPer1MTokens('gpt-4-turbo');
      expect(cost).toEqual({ input: 10.0, output: 30.0 });
    });

    it('should return correct pricing for gpt-4-turbo-preview', () => {
      const cost = getCostPer1MTokens('gpt-4-turbo-preview');
      expect(cost).toEqual({ input: 10.0, output: 30.0 });
    });

    it('should return correct pricing for gpt-4', () => {
      const cost = getCostPer1MTokens('gpt-4');
      expect(cost).toEqual({ input: 30.0, output: 60.0 });
    });

    it('should return correct pricing for gpt-4-0613', () => {
      const cost = getCostPer1MTokens('gpt-4-0613');
      expect(cost).toEqual({ input: 30.0, output: 60.0 });
    });

    it('should return correct pricing for gpt-3.5-turbo', () => {
      const cost = getCostPer1MTokens('gpt-3.5-turbo');
      expect(cost).toEqual({ input: 0.5, output: 1.5 });
    });

    it('should return correct pricing for gpt-3.5-turbo-0125', () => {
      const cost = getCostPer1MTokens('gpt-3.5-turbo-0125');
      expect(cost).toEqual({ input: 0.5, output: 1.5 });
    });

    it('should return default pricing for unknown model', () => {
      const cost = getCostPer1MTokens('unknown-model');
      expect(cost).toEqual({ input: 2.5, output: 10.0 });
    });

    it('should prioritize gpt-4o-mini over gpt-4o', () => {
      // This test ensures the order of checks is correct
      const miniCost = getCostPer1MTokens('gpt-4o-mini');
      const regularCost = getCostPer1MTokens('gpt-4o');
      expect(miniCost.input).toBeLessThan(regularCost.input);
    });
  });

  describe('calculateCost', () => {
    it('should calculate cost correctly for gpt-4o', () => {
      // 1000 input tokens, 500 output tokens
      const cost = calculateCost('gpt-4o', 1000, 500);
      // Expected: (1000/1M * 2.5) + (500/1M * 10.0) = 0.0025 + 0.005 = 0.0075
      expect(cost).toBeCloseTo(0.0075, 6);
    });

    it('should calculate cost correctly for gpt-4o-mini', () => {
      // 1000 input tokens, 500 output tokens
      const cost = calculateCost('gpt-4o-mini', 1000, 500);
      // Expected: (1000/1M * 0.15) + (500/1M * 0.6) = 0.00015 + 0.0003 = 0.00045
      expect(cost).toBeCloseTo(0.00045, 6);
    });

    it('should calculate cost for large token counts', () => {
      // 1M input tokens, 1M output tokens for gpt-4o
      const cost = calculateCost('gpt-4o', 1_000_000, 1_000_000);
      // Expected: 2.5 + 10.0 = 12.5
      expect(cost).toBeCloseTo(12.5, 2);
    });

    it('should return 0 for 0 tokens', () => {
      const cost = calculateCost('gpt-4o', 0, 0);
      expect(cost).toBe(0);
    });

    it('should handle only input tokens', () => {
      const cost = calculateCost('gpt-4o', 1_000_000, 0);
      // Expected: 2.5 + 0 = 2.5
      expect(cost).toBeCloseTo(2.5, 2);
    });

    it('should handle only output tokens', () => {
      const cost = calculateCost('gpt-4o', 0, 1_000_000);
      // Expected: 0 + 10.0 = 10.0
      expect(cost).toBeCloseTo(10.0, 2);
    });

    it('should calculate realistic usage scenario', () => {
      // Typical improvement task: ~2000 prompt tokens, ~500 completion tokens
      const cost = calculateCost('gpt-4o', 2000, 500);
      // Expected: (2000/1M * 2.5) + (500/1M * 10.0) = 0.005 + 0.005 = 0.01
      expect(cost).toBeCloseTo(0.01, 4);
    });

    describe('edge cases', () => {
      it('should handle negative input tokens gracefully', () => {
        const cost = calculateCost('gpt-4o', -100, 500);
        // Implementation should either throw or treat as 0 or return negative
        // Testing actual behavior
        expect(typeof cost).toBe('number');
      });

      it('should handle negative output tokens gracefully', () => {
        const cost = calculateCost('gpt-4o', 100, -500);
        expect(typeof cost).toBe('number');
      });

      it('should handle very small token counts', () => {
        const cost = calculateCost('gpt-4o', 1, 1);
        // Expected: (1/1M * 2.5) + (1/1M * 10.0) = 0.0000025 + 0.00001 = 0.0000125
        expect(cost).toBeCloseTo(0.0000125, 10);
      });

      it('should handle decimal token counts', () => {
        const cost = calculateCost('gpt-4o', 1.5, 2.5);
        expect(typeof cost).toBe('number');
        expect(cost).toBeGreaterThan(0);
      });
    });
  });

  describe('model name variations', () => {
    it('should handle model name without hyphen (typo)', () => {
      const cost = getCostPer1MTokens('gpt4o');
      // Should return default pricing for unknown model
      expect(cost).toEqual({ input: 2.5, output: 10.0 });
    });

    it('should handle model name with extra spaces', () => {
      const cost = getCostPer1MTokens(' gpt-4o ');
      // Should return default pricing if not trimmed
      expect(cost).toEqual({ input: 2.5, output: 10.0 });
    });

    it('should handle empty model name', () => {
      const cost = getCostPer1MTokens('');
      // Should return default pricing
      expect(cost).toEqual({ input: 2.5, output: 10.0 });
    });

    it('should handle partial model name match', () => {
      // 'gpt-4' should match gpt-4 pricing, not gpt-4o
      const gpt4Cost = getCostPer1MTokens('gpt-4');
      const gpt4oCost = getCostPer1MTokens('gpt-4o');
      expect(gpt4Cost.input).toBeGreaterThan(gpt4oCost.input);
    });
  });
});
