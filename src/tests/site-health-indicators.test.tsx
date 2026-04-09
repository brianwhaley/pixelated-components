/// <reference types="vitest/globals" />
import { describe, it, expect } from 'vitest';
import {
  getScoreIndicator,
  getImpactIndicator,
  getPassingIndicator,
  getIncompleteIndicator,
  HEALTH_INDICATORS,
  HEALTH_COLORS,
  SCORE_SCALE,
  IMPACT_SCALE
} from '../components/admin/site-health/site-health-indicators';

describe('Health Indicators System', () => {
  describe('Score-based Indicators (PageSpeed, Performance, etc.)', () => {
    describe('getScoreIndicator', () => {
      it('returns excellent indicators for scores >= 0.9', () => {
        const result = getScoreIndicator(0.95);
        expect(result.icon).toBe(HEALTH_INDICATORS.PASSING);
        expect(result.color).toBe(HEALTH_COLORS.PASSING);
      });

      it('returns good indicators for scores >= 0.7 and < 0.9', () => {
        const result = getScoreIndicator(0.85);
        expect(result.icon).toBe(HEALTH_INDICATORS.MODERATE);
        expect(result.color).toBe(HEALTH_COLORS.MODERATE);
      });

      it('returns needs improvement indicators for scores >= 0.5 and < 0.7', () => {
        const result = getScoreIndicator(0.65);
        expect(result.icon).toBe(HEALTH_INDICATORS.SERIOUS);
        expect(result.color).toBe(HEALTH_COLORS.SERIOUS);
      });

      it('returns poor indicators for scores < 0.5', () => {
        const result = getScoreIndicator(0.3);
        expect(result.icon).toBe(HEALTH_INDICATORS.CRITICAL);
        expect(result.color).toBe(HEALTH_COLORS.CRITICAL);
      });

      it('returns unknown indicators for null scores', () => {
        const result = getScoreIndicator(null);
        expect(result.icon).toBe(HEALTH_INDICATORS.UNKNOWN);
        expect(result.color).toBe(HEALTH_COLORS.UNKNOWN);
      });

      it('handles edge cases correctly', () => {
        expect(getScoreIndicator(1.0).icon).toBe(HEALTH_INDICATORS.PASSING);
        expect(getScoreIndicator(0.0).icon).toBe(HEALTH_INDICATORS.CRITICAL);
        expect(getScoreIndicator(0.5).icon).toBe(HEALTH_INDICATORS.SERIOUS);
        expect(getScoreIndicator(0.7).icon).toBe(HEALTH_INDICATORS.MODERATE);
        expect(getScoreIndicator(0.9).icon).toBe(HEALTH_INDICATORS.PASSING);
      });
    });
  });

  describe('Impact-based Indicators (Axe-core)', () => {
    describe('getImpactIndicator', () => {
      it('returns critical indicators for critical impact', () => {
        const result = getImpactIndicator('critical');
        expect(result.icon).toBe(HEALTH_INDICATORS.CRITICAL);
        expect(result.color).toBe(HEALTH_COLORS.CRITICAL);
      });

      it('returns serious indicators for serious impact', () => {
        const result = getImpactIndicator('serious');
        expect(result.icon).toBe(HEALTH_INDICATORS.SERIOUS);
        expect(result.color).toBe(HEALTH_COLORS.SERIOUS);
      });

      it('returns moderate indicators for moderate impact', () => {
        const result = getImpactIndicator('moderate');
        expect(result.icon).toBe(HEALTH_INDICATORS.MODERATE);
        expect(result.color).toBe(HEALTH_COLORS.MODERATE);
      });

      it('returns minor indicators for minor impact', () => {
        const result = getImpactIndicator('minor');
        expect(result.icon).toBe(HEALTH_INDICATORS.MINOR);
        expect(result.color).toBe(HEALTH_COLORS.MINOR);
      });

      it('returns unknown indicators for invalid impact levels', () => {
        const result = getImpactIndicator('invalid');
        expect(result.icon).toBe(HEALTH_INDICATORS.UNKNOWN);
        expect(result.color).toBe(HEALTH_COLORS.UNKNOWN);
      });

      it('handles case insensitive input', () => {
        expect(getImpactIndicator('CRITICAL').icon).toBe(HEALTH_INDICATORS.CRITICAL);
        expect(getImpactIndicator('Serious').icon).toBe(HEALTH_INDICATORS.SERIOUS);
      });
    });
  });

  describe('Special State Indicators', () => {
    describe('getPassingIndicator', () => {
      it('returns passing indicators', () => {
        const result = getPassingIndicator();
        expect(result.icon).toBe(HEALTH_INDICATORS.PASSING);
        expect(result.color).toBe(HEALTH_COLORS.PASSING);
      });
    });

    describe('getIncompleteIndicator', () => {
      it('returns incomplete indicators', () => {
        const result = getIncompleteIndicator();
        expect(result.icon).toBe(HEALTH_INDICATORS.UNKNOWN);
        expect(result.color).toBe(HEALTH_COLORS.UNKNOWN);
      });
    });
  });

  describe('Constants and Scales', () => {
    describe('HEALTH_INDICATORS', () => {
      it('contains all required indicator emojis', () => {
        expect(HEALTH_INDICATORS.CRITICAL).toBe('🔴');
        expect(HEALTH_INDICATORS.SERIOUS).toBe('🟠');
        expect(HEALTH_INDICATORS.MODERATE).toBe('🟡');
        expect(HEALTH_INDICATORS.PASSING).toBe('🟢');
        expect(HEALTH_INDICATORS.UNKNOWN).toBe('⚪');
      });
    });

    describe('SCORE_SCALE', () => {
      it('defines correct thresholds for score ranges', () => {
        expect(SCORE_SCALE.EXCELLENT.min).toBe(0.9);
        expect(SCORE_SCALE.GOOD.min).toBe(0.7);
        expect(SCORE_SCALE.NEEDS_IMPROVEMENT.min).toBe(0.5);
        expect(SCORE_SCALE.POOR.min).toBe(0);
      });

      it('associates correct indicators with score ranges', () => {
        expect(SCORE_SCALE.EXCELLENT.icon).toBe(HEALTH_INDICATORS.PASSING);
        expect(SCORE_SCALE.GOOD.icon).toBe(HEALTH_INDICATORS.MODERATE);
        expect(SCORE_SCALE.NEEDS_IMPROVEMENT.icon).toBe(HEALTH_INDICATORS.SERIOUS);
        expect(SCORE_SCALE.POOR.icon).toBe(HEALTH_INDICATORS.CRITICAL);
      });
    });

    describe('IMPACT_SCALE', () => {
      it('defines correct indicators for impact levels', () => {
        expect(IMPACT_SCALE.CRITICAL.icon).toBe(HEALTH_INDICATORS.CRITICAL);
        expect(IMPACT_SCALE.SERIOUS.icon).toBe(HEALTH_INDICATORS.SERIOUS);
        expect(IMPACT_SCALE.MODERATE.icon).toBe(HEALTH_INDICATORS.MODERATE);
        expect(IMPACT_SCALE.MINOR.icon).toBe(HEALTH_INDICATORS.MINOR);
      });
    });
  });

  describe('Integration Tests', () => {
    it('score and impact indicators use consistent color schemes', () => {
      // Critical/poor should use the same red color
      expect(getScoreIndicator(0.3).color).toBe(getImpactIndicator('critical').color);
      expect(getScoreIndicator(0.3).color).toBe(HEALTH_COLORS.CRITICAL);

      // Passing/excellent should use the same green color
      expect(getScoreIndicator(0.95).color).toBe(getPassingIndicator().color);
      expect(getScoreIndicator(0.95).color).toBe(HEALTH_COLORS.PASSING);
    });

    it('all indicators return valid objects with icon and color', () => {
      const indicators = [
        getScoreIndicator(0.9),
        getScoreIndicator(0.3),
        getImpactIndicator('critical'),
        getImpactIndicator('minor'),
        getPassingIndicator(),
        getIncompleteIndicator()
      ];

      indicators.forEach(indicator => {
        expect(indicator).toHaveProperty('icon');
        expect(indicator).toHaveProperty('color');
        expect(typeof indicator.icon).toBe('string');
        expect(typeof indicator.color).toBe('string');
        expect(indicator.icon.length).toBeGreaterThan(0);
        expect(indicator.color.length).toBeGreaterThan(0);
      });
    });
  });
});