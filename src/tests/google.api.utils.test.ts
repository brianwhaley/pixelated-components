/**
 * Tests for Google API Integration Utilities
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import {
  calculateDateRanges,
  formatChartDate,
  getCachedData,
  setCachedData
} from '../components/admin/site-health/google.api.utils';

// Mock the RouteCache class
class MockRouteCache {
  private cache = new Map();

  get(key: string) {
    return this.cache.get(key); // Returns undefined for non-existent keys
  }

  set(key: string, value: any) {
    this.cache.set(key, value);
  }

  clear() {
    this.cache.clear();
  }
}

describe('Google API Utils', () => {
  describe('calculateDateRanges', () => {
    it('should calculate default 30-day ranges when no dates provided', () => {
      const result = calculateDateRanges();

      const now = new Date();
      const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      expect(result.currentEnd.toDateString()).toBe(now.toDateString());
      expect(result.currentStart.toDateString()).toBe(thirtyDaysAgo.toDateString());

      // Previous period should be the 30 days before the current period, with a 1-day gap
      const expectedPreviousStart = new Date(thirtyDaysAgo.getTime() - 30 * 24 * 60 * 60 * 1000 - 24 * 60 * 60 * 1000);
      const expectedPreviousEnd = new Date(thirtyDaysAgo.getTime() - 24 * 60 * 60 * 1000);

      expect(result.previousStart.toDateString()).toBe(expectedPreviousStart.toDateString());
      expect(result.previousEnd.toDateString()).toBe(expectedPreviousEnd.toDateString());
    });

    it('should calculate custom date ranges', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-15';
      const result = calculateDateRanges(startDate, endDate);

      expect(result.currentStartStr).toBe('2024-01-01');
      expect(result.currentEndStr).toBe('2024-01-15');

      // Previous period should be 14 days before (same duration) with 1-day gap
      expect(result.previousStartStr).toBe('2023-12-17');
      expect(result.previousEndStr).toBe('2023-12-31');
    });

    it('should handle single day ranges', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-01';
      const result = calculateDateRanges(startDate, endDate);

      expect(result.currentStartStr).toBe('2024-01-01');
      expect(result.currentEndStr).toBe('2024-01-01');

      // Previous period should be the day before
      expect(result.previousStartStr).toBe('2023-12-31');
      expect(result.previousEndStr).toBe('2023-12-31');
    });

    it('should return correct date objects', () => {
      const result = calculateDateRanges('2024-01-01', '2024-01-15');

      expect(result.currentStart).toBeInstanceOf(Date);
      expect(result.currentEnd).toBeInstanceOf(Date);
      expect(result.previousStart).toBeInstanceOf(Date);
      expect(result.previousEnd).toBeInstanceOf(Date);

      // Check string representations instead of getFullYear to avoid timezone issues
      expect(result.currentStartStr).toBe('2024-01-01');
      expect(result.currentEndStr).toBe('2024-01-15');
    });
  });

  describe('formatChartDate', () => {
    it('should format date for chart display', () => {
      const date = new Date('2024-01-15T12:00:00Z'); // Use UTC to avoid timezone issues
      const result = formatChartDate(date);

      expect(result).toBe('Jan 15');
    });

    it('should handle different months', () => {
      expect(formatChartDate(new Date('2024-02-01T12:00:00Z'))).toBe('Feb 1');
      expect(formatChartDate(new Date('2024-03-31T12:00:00Z'))).toBe('Mar 31');
      expect(formatChartDate(new Date('2024-12-25T12:00:00Z'))).toBe('Dec 25');
    });

    it('should handle single digit days', () => {
      expect(formatChartDate(new Date('2024-01-01T12:00:00Z'))).toBe('Jan 1');
      expect(formatChartDate(new Date('2024-01-09T12:00:00Z'))).toBe('Jan 9');
    });
  });

  describe('getCachedData and setCachedData', () => {
    let mockCache: MockRouteCache;

    beforeEach(() => {
      mockCache = new MockRouteCache();
    });

    afterEach(() => {
      mockCache.clear();
    });

    it('should return null for non-existent cache key', () => {
      const result = getCachedData(mockCache, 'non-existent-key');
      expect(result).toBeUndefined();
    });

    it('should set and get cached data', () => {
      const testData = { test: 'value', number: 42 };
      const cacheKey = 'test-key';

      setCachedData(mockCache, cacheKey, testData);
      const result = getCachedData(mockCache, cacheKey);

      expect(result).toEqual(testData);
    });

    it('should handle different data types', () => {
      // String
      setCachedData(mockCache, 'string-key', 'test string');
      expect(getCachedData(mockCache, 'string-key')).toBe('test string');

      // Number
      setCachedData(mockCache, 'number-key', 12345);
      expect(getCachedData(mockCache, 'number-key')).toBe(12345);

      // Array
      const arrayData = [1, 2, 3, 'test'];
      setCachedData(mockCache, 'array-key', arrayData);
      expect(getCachedData(mockCache, 'array-key')).toEqual(arrayData);

      // Object
      const objectData = { nested: { value: true } };
      setCachedData(mockCache, 'object-key', objectData);
      expect(getCachedData(mockCache, 'object-key')).toEqual(objectData);
    });

    it('should overwrite existing cache entries', () => {
      const cacheKey = 'overwrite-key';

      setCachedData(mockCache, cacheKey, 'first value');
      expect(getCachedData(mockCache, cacheKey)).toBe('first value');

      setCachedData(mockCache, cacheKey, 'second value');
      expect(getCachedData(mockCache, cacheKey)).toBe('second value');
    });

    it('should handle null and undefined values', () => {
      setCachedData(mockCache, 'null-key', null);
      expect(getCachedData(mockCache, 'null-key')).toBeNull();

      setCachedData(mockCache, 'undefined-key', undefined);
      expect(getCachedData(mockCache, 'undefined-key')).toBeUndefined();
    });
  });
});