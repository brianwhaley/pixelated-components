import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Helper to mock the config module before importing auth module
const fakeConfig = {
	nextAuth: { secret: 'test-secret' },
	google: { client_id: 'g-id', client_secret: 'g-secret' },
};

describe('NextAuth config (legacy)', () => {
	beforeEach(() => {
		vi.resetModules();
		vi.doMock('@pixelated-tech/components/server', () => ({
			getFullPixelatedConfig: () => fakeConfig,
		}));
	});

	afterEach(() => {
		vi.clearAllMocks();
	});

	it('exposes authOptions with Google values from pixelated config', async () => {
		const mod = await import('@/lib/auth');
		const { authOptions } = mod as any;
		expect(authOptions.providers[0].clientId).toBe('g-id');
		expect(authOptions.providers[0].clientSecret).toBe('g-secret');
	});

	it('throws when google config is missing', async () => {
		vi.resetModules();
		// Provide nextAuth.secret but omit google settings
		vi.doMock('@pixelated-tech/components/server', () => ({ getFullPixelatedConfig: () => ({ nextAuth: { secret: 'test-secret' } }) }));
		await expect(async () => {
			await import('@/lib/auth');
		}).rejects.toThrow('Google OAuth credentials not configured');
	});
});