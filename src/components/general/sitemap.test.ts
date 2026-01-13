import { describe, it, expect } from 'vitest';
import { getRuntimeEnvFromHeaders } from './sitemap';

describe('getRuntimeEnvFromHeaders', () => {
	it('returns "local" for localhost host header', () => {
		const hdrs = { get: (k: string) => (k === 'host' ? 'localhost:3000' : null) } as any;
		expect(getRuntimeEnvFromHeaders(hdrs)).toBe('local');
	});

	it('returns "local" for 127.0.0.1 host header', () => {
		const hdrs = { get: (k: string) => (k === 'host' ? '127.0.0.1:3000' : null) } as any;
		expect(getRuntimeEnvFromHeaders(hdrs)).toBe('local');
	});

	it('returns "prod" for production host', () => {
		const hdrs = { get: (k: string) => (k === 'host' ? 'example.com' : null) } as any;
		expect(getRuntimeEnvFromHeaders(hdrs)).toBe('prod');
	});

	it('returns "auto" when headers not present', () => {
		expect(getRuntimeEnvFromHeaders(undefined)).toBe('auto');
	});
});