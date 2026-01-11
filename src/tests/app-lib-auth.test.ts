import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Helper to mock the config module before importing auth module
const fakeConfig = {
	nextAuth: { secret: 'test-secret' },
	google: { client_id: 'g-id', client_secret: 'g-secret' },
};

describe('NextAuth config (server)', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.doMock('@pixelated-tech/components/server', () => ({
			getFullPixelatedConfig: () => fakeConfig,
		}));
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('exposes authOptions with values from pixelated config', async () => {
		const mod = await import('@/lib/auth');
		const { authOptions } = mod as any;
		expect(authOptions.secret).toBe('test-secret');
		expect(authOptions.providers[0].clientId).toBe('g-id');
		expect(authOptions.providers[0].clientSecret).toBe('g-secret');
	});

	it('throws when required values are missing', async () => {
		vi.resetModules();
		vi.doMock('@pixelated-tech/components/server', () => ({ getFullPixelatedConfig: () => ({}) }));
		await expect(async () => {
			await import('@/lib/auth');
		}).rejects.toThrow('nextAuth.secret not configured');
	});
});