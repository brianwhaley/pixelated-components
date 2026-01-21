import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '@/components/general/cache-manager';

describe('CacheManager — site‑health compatibility (unit tests)', () => {
	beforeEach(() => {
		vi.useRealTimers();
	});

	afterEach(() => {
		vi.useRealTimers();
		vi.restoreAllMocks();
	});

	it('returns null when key missing', () => {
		const c = new CacheManager({ ttl: 1000, prefix: 'test-sitehealth-' });
		expect(c.get('no-such-key')).toBeNull();
	});

	it('set then get returns the same value (synchronous semantics)', () => {
		const c = new CacheManager({ ttl: 1000, prefix: 'test-sitehealth-' });
		const payload = { a: 1 };
		c.set('k1', payload);
		expect(c.get('k1')).toBe(payload); // same reference
	});

	it('respects TTL (expires after duration)', () => {
		vi.useFakeTimers({ now: Date.now() });
		const c = new CacheManager({ ttl: 1000, prefix: 'test-sitehealth-' }); // 1s TTL
		c.set('k1', 'v1');
		expect(c.get('k1')).toBe('v1');

		// advance just under TTL -> still present
		vi.advanceTimersByTime(900);
		expect(c.get('k1')).toBe('v1');

		// advance past TTL -> expired
		vi.advanceTimersByTime(200);
		expect(c.get('k1')).toBeNull();
	});

	it('clear removes entries', () => {
		const c = new CacheManager({ ttl: 1000, prefix: 'test-sitehealth-' });
		c.set('k1', 1);
		c.set('k2', 2);
		expect(c.get('k1')).toBe(1);
		c.clear();
		expect(c.get('k1')).toBeNull();
		expect(c.get('k2')).toBeNull();
	});

	it('set overwrites existing entry and updates timestamp', () => {
		vi.useFakeTimers({ now: Date.now() });
		const c = new CacheManager({ ttl: 1000, prefix: 'test-sitehealth-' });
		c.set('k', 'first');
		vi.advanceTimersByTime(900);
		c.set('k', 'second');
		// because we reset timestamp, should still be present after another 900ms
		vi.advanceTimersByTime(900);
		expect(c.get('k')).toBe('second');
	});
});
