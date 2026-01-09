import { describe, it, expect, beforeEach, vi, afterEach } from 'vitest';
import { CacheManager } from '../components/general/cache-manager';

describe('CacheManager', () => {
	beforeEach(() => {
		// Clear storages before each test
		window.localStorage.clear();
		window.sessionStorage.clear();
		vi.useFakeTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
	});

	describe('Memory Mode', () => {
		it('should store and retrieve values in memory', () => {
			const cache = new CacheManager({ mode: 'memory' });
			cache.set('testKey', { foo: 'bar' });
			expect(cache.get('testKey')).toEqual({ foo: 'bar' });
		});

		it('should return null for missing keys', () => {
			const cache = new CacheManager({ mode: 'memory' });
			expect(cache.get('nonExistent')).toBeNull();
		});

		it('should remove items correctly', () => {
			const cache = new CacheManager({ mode: 'memory' });
			cache.set('testKey', 'value');
			cache.remove('testKey');
			expect(cache.get('testKey')).toBeNull();
		});

		it('should clear all items with its prefix', () => {
			const cache = new CacheManager({ mode: 'memory', prefix: 'test_' });
			cache.set('a', 1);
			cache.set('b', 2);
			cache.clear();
			expect(cache.get('a')).toBeNull();
			expect(cache.get('b')).toBeNull();
		});
	});

	describe('Session/Local Storage Modes', () => {
		it('should persist to sessionStorage in session mode', () => {
			const cache = new CacheManager({ mode: 'session', prefix: 'sess_' });
			cache.set('myKey', 'myValue');
			
			// Verify it's in sessionStorage
			const raw = window.sessionStorage.getItem('sess_myKey');
			expect(raw).toBeDefined();
			expect(JSON.parse(raw!).data).toBe('myValue');
			
			// Verify retrieval
			expect(cache.get('myKey')).toBe('myValue');
		});

		it('should persist to localStorage in local mode', () => {
			const cache = new CacheManager({ mode: 'local', prefix: 'loc_' });
			cache.set('myKey', 'myValue');
			
			const raw = window.localStorage.getItem('loc_myKey');
			expect(raw).toBeDefined();
			expect(JSON.parse(raw!).data).toBe('myValue');
		});

		it('should recover from storage if memory cache is lost (simulated)', () => {
			const cache1 = new CacheManager({ mode: 'local', prefix: 'persist_' });
			cache1.set('shared', 'data');

			// Create a new instance with same config, it should find the data in localStorage
			const cache2 = new CacheManager({ mode: 'local', prefix: 'persist_' });
			expect(cache2.get('shared')).toBe('data');
		});
	});

	describe('TTL and Expiration', () => {
		it('should expire items after default TTL (1 hour)', () => {
			const cache = new CacheManager({ mode: 'memory' });
			cache.set('expiring', 'val');
			
			// Advance time by 1 hour + 1 second
			vi.advanceTimersByTime(60 * 60 * 1000 + 1000);
			
			expect(cache.get('expiring')).toBeNull();
		});

		it('should support custom TTL on a per-item basis', () => {
			const cache = new CacheManager({ mode: 'memory', ttl: 10000 }); // Default 10s
			cache.set('short', 'val', 500); // Override to 500ms
			
			vi.advanceTimersByTime(600);
			expect(cache.get('short')).toBeNull();
		});

		it('should not expire items before time is up', () => {
			const cache = new CacheManager({ mode: 'memory' });
			cache.set('steady', 'val');
			
			vi.advanceTimersByTime(30 * 60 * 1000); // 30 mins
			expect(cache.get('steady')).toBe('val');
		});
	});

	describe('Advanced Behavior', () => {
		it('should not store or retrieve anything in "none" mode', () => {
			const cache = new CacheManager({ mode: 'none' });
			cache.set('any', 'thing');
			expect(cache.get('any')).toBeNull();
		});

		it('should handle complex nested objects', () => {
			const cache = new CacheManager({ mode: 'session' });
			const complex = {
				id: 1,
				tags: ['a', 'b'],
				meta: { author: 'admin' }
			};
			cache.set('complex', complex);
			expect(cache.get('complex')).toEqual(complex);
		});

		it('should only clear items with the manager prefix', () => {
			const cacheA = new CacheManager({ mode: 'local', prefix: 'a_' });
			const cacheB = new CacheManager({ mode: 'local', prefix: 'b_' });

			cacheA.set('key', 'valA');
			cacheB.set('key', 'valB');

			cacheA.clear();

			expect(cacheA.get('key')).toBeNull();
			expect(cacheB.get('key')).toBe('valB');
		});
	});
});
