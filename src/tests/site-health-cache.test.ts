/// <reference types="vitest/globals" />
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { CacheManager } from '../components/general/cache-manager';

describe('CacheManager (site-health compatibility)', () => {
  let cache: any;
  const testData = { test: 'data', value: 123 };
  const testKey = 'test-key';

  beforeEach(() => {
    cache = new CacheManager({ prefix: 'test-sitehealth-' });
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('constructor', () => {
    it('should create cache with default duration (1 hour)', () => {
      const defaultCache = new CacheManager({ prefix: 'test-sitehealth-default-' });
      expect(defaultCache).toBeInstanceOf(CacheManager);
    });

    it('should create cache with custom duration', () => {
      const customCache = new CacheManager({ ttl: 30 * 60 * 1000, prefix: 'test-sitehealth-custom-' }); // 30 minutes
      expect(customCache).toBeInstanceOf(CacheManager);
    });
  });

  describe('set and get', () => {
    it('should store and retrieve data', () => {
      cache.set(testKey, testData);
      const result = cache.get(testKey);
      expect(result).toEqual(testData);
    });

    it('should return null for non-existent key', () => {
      const result = cache.get('non-existent');
      expect(result).toBeNull();
    });

    it('should handle different data types', () => {
      cache.set('string', 'test string');
      cache.set('number', 42);
      cache.set('boolean', true);
      cache.set('array', [1, 2, 3]);
      cache.set('object', { nested: 'value' });

      expect(cache.get('string')).toBe('test string');
      expect(cache.get('number')).toBe(42);
      expect(cache.get('boolean')).toBe(true);
      expect(cache.get('array')).toEqual([1, 2, 3]);
      expect(cache.get('object')).toEqual({ nested: 'value' });
    });
  });

  describe('cache expiration', () => {
    it('should return data within duration', () => {
      cache.set(testKey, testData);

      // Advance time by 30 minutes (less than default 1 hour)
      vi.advanceTimersByTime(30 * 60 * 1000);

      const result = cache.get(testKey);
      expect(result).toEqual(testData);
    });

    it('should return null after expiration', () => {
      cache.set(testKey, testData);

      // Advance time by 1 hour and 1 minute (past default duration)
      vi.advanceTimersByTime(61 * 60 * 1000);

      const result = cache.get(testKey);
      expect(result).toBeNull();
    });

    it('should respect custom duration', () => {
      const shortCache = new CacheManager({ ttl: 10 * 60 * 1000, prefix: 'test-sitehealth-short-' }); // 10 minutes
      shortCache.set(testKey, testData);

      // Advance time by 5 minutes (still valid)
      vi.advanceTimersByTime(5 * 60 * 1000);
      expect(shortCache.get(testKey)).toEqual(testData);

      // Advance time by another 6 minutes (now expired)
      vi.advanceTimersByTime(6 * 60 * 1000);
      expect(shortCache.get(testKey)).toBeNull();
    });
  });

  describe('clear', () => {
    it('should clear all cached data', () => {
      cache.set('key1', 'value1');
      cache.set('key2', 'value2');
      cache.set('key3', 'value3');

      expect(cache.get('key1')).toBe('value1');
      expect(cache.get('key2')).toBe('value2');
      expect(cache.get('key3')).toBe('value3');

      cache.clear();

      expect(cache.get('key1')).toBeNull();
      expect(cache.get('key2')).toBeNull();
      expect(cache.get('key3')).toBeNull();
    });
  });

  describe('cache isolation', () => {
    it('should maintain separate cache instances', () => {
      const cache1 = new CacheManager({ prefix: 'test-sitehealth-1-' });
      const cache2 = new CacheManager({ prefix: 'test-sitehealth-2-' });

      cache1.set('shared', 'cache1-data');
      cache2.set('shared', 'cache2-data');

      expect(cache1.get('shared')).toBe('cache1-data');
      expect(cache2.get('shared')).toBe('cache2-data');
    });
  });
});