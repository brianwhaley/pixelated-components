import { describe, it, expect, beforeEach } from 'vitest';
import {
  calculateDateRanges,
  formatChartDate,
  getCachedData,
  setCachedData,
  type DateRange,
} from '../components/admin/site-health/google.api.utils';

describe('google.api.utils - Extended Coverage', () => {
  let mockCache: Map<string, any>;

  beforeEach(() => {
    mockCache = new Map();
  });

  describe('calculateDateRanges', () => {
    it('should calculate date ranges with default (30 day) period', () => {
      const result = calculateDateRanges();
      expect(result).toBeDefined();
      expect(result.currentStart).toBeInstanceOf(Date);
      expect(result.currentEnd).toBeInstanceOf(Date);
      expect(result.previousStart).toBeInstanceOf(Date);
      expect(result.previousEnd).toBeInstanceOf(Date);
    });

    it('should return DateRange with string properties', () => {
      const result = calculateDateRanges();
      expect(typeof result.currentStartStr).toBe('string');
      expect(typeof result.currentEndStr).toBe('string');
      expect(typeof result.previousStartStr).toBe('string');
      expect(typeof result.previousEndStr).toBe('string');
    });

    it('should parse ISO date strings correctly', () => {
      const startDate = '2024-01-01';
      const endDate = '2024-01-31';
      const result = calculateDateRanges(startDate, endDate);
      
      expect(result.currentStart).toBeInstanceOf(Date);
      expect(result.currentEnd).toBeInstanceOf(Date);
      expect(result.currentStartStr).toBe(startDate);
    });

    it('should calculate previous period correctly', () => {
      const result = calculateDateRanges();
      const currentDuration = result.currentEnd.getTime() - result.currentStart.getTime();
      const previousDuration = result.previousEnd.getTime() - result.previousStart.getTime();
      
      expect(Math.abs(currentDuration - previousDuration)).toBeLessThan(1000); // Allow 1 second tolerance
    });

    it('should handle custom date ranges', () => {
      const result = calculateDateRanges('2024-02-01', '2024-02-29');
      expect(result.currentStartStr).toBe('2024-02-01');
      expect(result.currentEndStr).toBe('2024-02-29');
    });

    it('should have previous end date before current start date', () => {
      const result = calculateDateRanges();
      expect(result.previousEnd.getTime()).toBeLessThan(result.currentStart.getTime());
    });

    it('should return consistent ISO date format', () => {
      const result = calculateDateRanges();
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
      
      expect(result.currentStartStr).toMatch(dateRegex);
      expect(result.currentEndStr).toMatch(dateRegex);
      expect(result.previousStartStr).toMatch(dateRegex);
      expect(result.previousEndStr).toMatch(dateRegex);
    });

    it('should handle leap year dates', () => {
      const result = calculateDateRanges('2024-02-28', '2024-03-01');
      expect(result).toBeDefined();
      expect(result.currentStart).toBeInstanceOf(Date);
    });

    it('should handle year boundary dates', () => {
      const result = calculateDateRanges('2023-12-31', '2024-01-31');
      expect(result).toBeDefined();
      expect(result.currentStart.getFullYear()).toBe(2023);
      expect(result.currentEnd.getFullYear()).toBe(2024);
    });
  });

  describe('formatChartDate', () => {
    it('should format Date object to readable string', () => {
      const date = new Date(2024, 0, 15); // January 15, 2024
      const result = formatChartDate(date);
      expect(typeof result).toBe('string');
      expect(result.length).toBeGreaterThan(0);
    });

    it('should display month and day', () => {
      const date = new Date(2024, 0, 15);
      const result = formatChartDate(date);
      expect(result).toContain('15');
    });

    it('should format different months', () => {
      const dates = [
        new Date(2024, 0, 1),   // January
        new Date(2024, 6, 15),  // July
        new Date(2024, 11, 31), // December
      ];
      
      dates.forEach(date => {
        const result = formatChartDate(date);
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });

    it('should format leap year date', () => {
      const date = new Date(2024, 1, 29); // February 29, 2024 (leap year)
      const result = formatChartDate(date);
      expect(typeof result).toBe('string');
    });

    it('should use US locale format', () => {
      const date = new Date(2024, 0, 15);
      const result = formatChartDate(date);
      // US format should show month like "Jan", not numbers
      expect(result).toMatch(/[A-Za-z]/);
    });

    it('should format consistently across dates', () => {
      const results: string[] = [];
      for (let i = 1; i <= 5; i++) {
        const date = new Date(2024, 0, i);
        results.push(formatChartDate(date));
      }
      
      results.forEach(result => {
        expect(typeof result).toBe('string');
        expect(result.length).toBeGreaterThan(0);
      });
    });
  });

  describe('getCachedData', () => {
    it('should retrieve cached data by key', () => {
      const key = 'test-data';
      const value = { metrics: [1, 2, 3] };
      mockCache.set(key, value);
      
      const result = getCachedData(mockCache, key);
      expect(result).toEqual(value);
    });

    it('should return undefined for missing keys', () => {
      const result = getCachedData(mockCache, 'non-existent');
      expect(result).toBeUndefined();
    });

    it('should handle various data types', () => {
      const testCases = [
        { key: 'string', value: 'test string' },
        { key: 'number', value: 42 },
        { key: 'array', value: [1, 2, 3] },
        { key: 'object', value: { nested: { data: true } } },
        { key: 'null', value: null },
      ];
      
      testCases.forEach(({ key, value }) => {
        mockCache.set(key, value);
        const result = getCachedData(mockCache, key);
        expect(result).toEqual(value);
      });
    });

    it('should retrieve data with different keys', () => {
      mockCache.set('key1', 'value1');
      mockCache.set('key2', 'value2');
      mockCache.set('key3', 'value3');
      
      expect(getCachedData(mockCache, 'key1')).toBe('value1');
      expect(getCachedData(mockCache, 'key2')).toBe('value2');
      expect(getCachedData(mockCache, 'key3')).toBe('value3');
    });
  });

  describe('setCachedData', () => {
    it('should set cache with string data', () => {
      const key = 'string-cache';
      const data = 'test string';
      setCachedData(mockCache, key, data);
      
      expect(mockCache.get(key)).toBe(data);
    });

    it('should set cache with object data', () => {
      const key = 'object-cache';
      const data = { key: 'value', nested: { prop: 'data' } };
      setCachedData(mockCache, key, data);
      
      expect(mockCache.get(key)).toEqual(data);
    });

    it('should set cache with null data', () => {
      const key = 'null-cache';
      setCachedData(mockCache, key, null);
      
      expect(mockCache.get(key)).toBeNull();
    });

    it('should overwrite existing cache', () => {
      const key = 'overwrite-cache';
      setCachedData(mockCache, key, 'first');
      expect(mockCache.get(key)).toBe('first');
      
      setCachedData(mockCache, key, 'second');
      expect(mockCache.get(key)).toBe('second');
    });

    it('should handle multiple cache items', () => {
      const items = [
        { key: 'item1', data: 'data1' },
        { key: 'item2', data: 'data2' },
        { key: 'item3', data: 'data3' },
      ];
      
      items.forEach(item => {
        setCachedData(mockCache, item.key, item.data);
      });
      
      items.forEach(item => {
        expect(mockCache.get(item.key)).toBe(item.data);
      });
    });

    it('should handle various data types', () => {
      const dataTypes = [
        'string',
        123,
        true,
        { obj: 'ect' },
        ['array', 'items'],
      ];
      
      dataTypes.forEach((data, index) => {
        setCachedData(mockCache, `cache-${index}`, data);
        expect(mockCache.get(`cache-${index}`)).toEqual(data);
      });
    });

    it('should handle DateRange objects', () => {
      const dateRange = calculateDateRanges();
      setCachedData(mockCache, 'date-range', dateRange);
      
      const retrieved = getCachedData(mockCache, 'date-range');
      expect(retrieved).toEqual(dateRange);
    });
  });

  describe('Integration Tests', () => {
    it('should set and retrieve cached data', () => {
      const key = 'integration-test';
      const data = { test: 'data' };
      setCachedData(mockCache, key, data);
      const retrieved = getCachedData(mockCache, key);
      
      expect(retrieved).toEqual(data);
    });

    it('should cache date range results', () => {
      const cacheKey = 'date-range-30d';
      const range = calculateDateRanges();
      setCachedData(mockCache, cacheKey, range);
      const retrieved = getCachedData(mockCache, cacheKey);
      
      expect(retrieved).toEqual(range);
    });

    it('should format and cache dates', () => {
      const dateRange = calculateDateRanges();
      const formattedStart = formatChartDate(dateRange.currentStart);
      const formattedEnd = formatChartDate(dateRange.currentEnd);
      
      const cacheData = { start: formattedStart, end: formattedEnd };
      setCachedData(mockCache, 'formatted-dates', cacheData);
      
      const retrieved = getCachedData(mockCache, 'formatted-dates');
      expect(retrieved).toEqual(cacheData);
    });
  });

  describe('Edge Cases', () => {
    it('should handle date range spanning multiple years', () => {
      const result = calculateDateRanges('2023-06-01', '2024-06-01');
      expect(result).toBeDefined();
      expect(result.currentStart.getFullYear()).toBe(2023);
      expect(result.currentEnd.getFullYear()).toBe(2024);
    });

    it('should calculate appropriate previous period', () => {
      const result = calculateDateRanges('2024-06-01', '2024-06-30');
      expect(result.previousEnd).toBeInstanceOf(Date);
      expect(result.previousStart).toBeInstanceOf(Date);
    });

    it('should handle very recent dates', () => {
      const today = new Date();
      const todayStr = today.toISOString().split('T')[0];
      const result = calculateDateRanges(todayStr, todayStr);
      
      expect(result).toBeDefined();
      expect(result.currentStartStr).toBe(todayStr);
    });

    it('should maintain cache across multiple operations', () => {
      const range1 = calculateDateRanges('2024-01-01', '2024-01-31');
      const range2 = calculateDateRanges('2024-02-01', '2024-02-29');
      
      setCachedData(mockCache, 'range1', range1);
      setCachedData(mockCache, 'range2', range2);
      
      expect(getCachedData(mockCache, 'range1')).toEqual(range1);
      expect(getCachedData(mockCache, 'range2')).toEqual(range2);
    });
  });
});
