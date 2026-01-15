import { describe, it, expect } from 'vitest';

describe('pixelated-eslint-plugin', () => {
	it('exports rules and configs', async () => {
		const mod = await import('../../src/scripts/pixelated-eslint-plugin.js');
		expect(mod.default).toBeDefined();
		expect(mod.default.rules).toBeDefined();
		expect(mod.default.configs).toBeDefined();
	});
});
