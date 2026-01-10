import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import * as configModule from '../../config/config';
import { fetchPSIData } from './site-health-core-web-vitals.integration';
import { mockConfig } from '../../../test/config.mock';

// Use the test harness mock config derived from src/config/pixelated.config.json

describe('fetchPSIData', () => {
	let originalFetch: any;
	let getFullConfigSpy: any;

	beforeEach(() => {
		originalFetch = globalThis.fetch;
		globalThis.fetch = vi.fn().mockResolvedValue({ ok: true, json: async () => ({ lighthouseResult: { audits: { someAudit: {} }, categories: {} } }) });
		// Ensure server-side code sees the standard test harness config by default
		getFullConfigSpy = vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue(mockConfig as any);
	});

	afterEach(() => {
		globalThis.fetch = originalFetch;
		getFullConfigSpy?.mockRestore();
		vi.restoreAllMocks();
	});

	it('uses API key from pixelated.config.json', async () => {
		const apiKey = mockConfig?.google?.api_key;
		expect(apiKey).toBeDefined();
		const url = 'https://example.com';
		await fetchPSIData(url);
		expect(globalThis.fetch).toHaveBeenCalled();
		const calledUrl = (globalThis.fetch as any).mock.calls[0][0] as string;
		expect(calledUrl).toContain(`key=${apiKey}`);
	});

	it('throws when api key is missing from config', async () => {
		getFullConfigSpy.mockReturnValue({} as any);
		await expect(fetchPSIData('https://example.com')).rejects.toThrow('Google API key is not set');
	});
});