import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { CacheManager } from '@/components/general/cache-manager';
import { google } from 'googleapis';

// Hoisted mock for the `googleapis` package. Exposes a configurable query mock at
// `globalThis.__GSC_QUERY` so tests can set responses per-case without touching
// internal module bindings.
vi.mock('googleapis', () => {
	const query = vi.fn();
	// make the mock accessible to tests
	;(globalThis as any).__GSC_QUERY = query;
	return {
		google: {
			auth: {
				GoogleAuth: class {
					constructor(_opts: any) { /* accept any credentials */ }
					async getClient() { return {}; }
				},
				OAuth2: class { constructor(_id: any, _secret: any) {} ; setCredentials() { /* noop */ } }
			},
			searchconsole: () => ({ searchanalytics: { query } })
		}
	};
});

// Note: these tests import the integration module after installing spies on the real utils
// so the module picks up the spied helpers at evaluation time.

// Reuse the canonical `googleapis` mocking strategy used in `src/tests/google.api.integration.test.ts`.
// That pattern exercises the real auth/client code paths while providing deterministic,
// mocked Google client implementations wired to the same `serviceAccountKey` fixtures.
vi.mock('googleapis', () => ({
	google: {
		auth: {
			GoogleAuth: vi.fn(),
			OAuth2: vi.fn(),
		},
		analyticsdata: vi.fn(),
		searchconsole: vi.fn(),
	},
}));

// These tests assert the *consumer-visible* behavior of the Site Health cache
// - first call should invoke upstream fetch
// - immediate second call should be served from the cache (no upstream fetch)
// - after TTL expiry the upstream should be called again

describe('Site-Health RouteCache (consumer contract)', () => {
	let cache: any;

	beforeEach(async () => {
		// ensure a fresh cache instance per-test
		cache = new CacheManager({ ttl: 100, prefix: 'test-sitehealth-' }); // short TTL for tests
		vi.restoreAllMocks();

		// --- canonical googleapi mocks (reuse pattern from google.api.integration.test.ts) ---
		const mockGoogleAuth = {
			type: 'service_account',
			project_id: 'test-project',
			private_key_id: 'test-key-id',
			private_key: '-----BEGIN PRIVATE KEY-----\ntest-key\n-----END PRIVATE KEY-----\n',
			client_email: 'test@test-project.iam.gserviceaccount.com',
		};
		const mockOAuth2 = { setCredentials: vi.fn(), generateAuthUrl: vi.fn(), getToken: vi.fn() };
		const mockSearchConsole = { searchanalytics: { query: vi.fn() }, sites: { list: vi.fn() } };
		const mockAnalyticsData = { properties: { runReport: vi.fn() } };

		// attach for debugging/inspection if needed
		(globalThis as any).__mockGoogleAuth = mockGoogleAuth;
		(globalThis as any).__mockOAuth2 = mockOAuth2;
		(globalThis as any).__mockSearchConsole = mockSearchConsole;
		(globalThis as any).__mockAnalyticsData = mockAnalyticsData;

		// wire implementations onto the mocked constructors (module-level mock exists above)
		(google as any).auth.GoogleAuth.mockImplementation(function () { return mockGoogleAuth; });
		(google as any).auth.OAuth2.mockImplementation(function () { return mockOAuth2; });
		(google as any).searchconsole.mockImplementation(function () { return mockSearchConsole; });
		(google as any).analyticsdata.mockImplementation(function () { return mockAnalyticsData; });

		// make date ranges deterministic (matches other google API integration tests)
		const utils = await vi.importActual('@/components/admin/site-health/google.api.utils');
		vi.spyOn(utils as any, 'calculateDateRanges').mockReturnValue({
			currentStart: new Date('2024-01-01'),
			currentEnd: new Date('2024-01-15'),
			previousStart: new Date('2023-12-18'),
			previousEnd: new Date('2023-12-31'),
			currentStartStr: '2024-01-01',
			currentEndStr: '2024-01-15',
			previousStartStr: '2023-12-18',
			previousEndStr: '2023-12-31',
		});
		// align mock signature with TS expectations
		vi.spyOn(utils as any, 'formatChartDate').mockImplementation((...args: any[]) => (args[0] as Date).toISOString().split('T')[0]);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});


	it('should call upstream on first request and return cached value on immediate retry', async () => {

		// import the real utils module and spy on its public helpers
		const utils = await vi.importActual('@/components/admin/site-health/google.api.utils');
		const getCachedSpy = vi.spyOn(utils as any, 'getCachedData').mockImplementation(() => null);
		const setCachedSpy = vi.spyOn(utils as any, 'setCachedData').mockImplementation(() => undefined);

		// import the integration module and configure the canonical mocked Search Console client
		const googleIntegration = await import('@/components/admin/site-health/google.api.integration');
		const mockedSearchConsole = (globalThis as any).__mockSearchConsole;
		// instrument the mock so we can observe invocation and return a date-keyed row
		mockedSearchConsole.searchanalytics.query.mockImplementation(async (args: any) => {
			console.error('QUERY_INVOKED current args ->', JSON.stringify(args));
			return { data: { rows: [{ keys: ['2024-01-01'], clicks: 1, impressions: 10 }] } };
		});

		// first consumer call — should call upstream (observed via setCachedData)
		const cfg = { siteUrl: 'https://example.com', serviceAccountKey: JSON.stringify({ type: 'service_account', client_email: 'test@example.com', private_key: 'fake' }) };
		// verify auth/client wiring uses the test-data path (sanity check)
		const authCheck = await (googleIntegration as any).createSearchConsoleClient(cfg as any);
		expect(authCheck.success).toBe(true);
		expect(typeof authCheck.client?.searchanalytics?.query).toBe('function');
		// sanity: ensure the client instance the auth factory returned is the same mock we control
		console.error('DIAG identity ->', authCheck.client.searchanalytics.query === mockedSearchConsole.searchanalytics.query, 'mockCalls', mockedSearchConsole.searchanalytics.query.mock.calls.length);
		const first = await googleIntegration.getSearchConsoleData(cfg as any, 'test-site');
		expect(getCachedSpy).toHaveBeenCalled();
		expect(first.success).toBe(true);
		expect(setCachedSpy).toHaveBeenCalledTimes(1);

		// simulate that the module cache now contains the previously returned data
		getCachedSpy.mockImplementation(() => first.data);

		// immediate second call — should NOT call upstream, should be served from cache
		const second = await googleIntegration.getSearchConsoleData(cfg as any, 'example.com');
		expect(setCachedSpy).toHaveBeenCalledTimes(1);
		expect(second).toEqual(first);
	});

	it('should re-call upstream after simulated cache expiry', async () => {

		// import the real utils module and spy on its public helpers
		const utils = await vi.importActual('@/components/admin/site-health/google.api.utils');
		const getCachedSpy = vi.spyOn(utils as any, 'getCachedData').mockImplementation(() => null);
		const setCachedSpy = vi.spyOn(utils as any, 'setCachedData').mockImplementation(() => undefined);

		// import the integration module and configure the canonical mocked Search Console client
		const googleIntegration = await import('@/components/admin/site-health/google.api.integration');
		const mockedSearchConsole = (globalThis as any).__mockSearchConsole;
		// instrument and return date-keyed rows for current + previous period
		mockedSearchConsole.searchanalytics.query
			.mockImplementationOnce(async (args: any) => { console.error('QUERY_INVOKED first args ->', JSON.stringify(args)); return { data: { rows: [{ keys: ['2024-01-01'], clicks: 1 }] } }; })
            .mockImplementationOnce(async (args: any) => { console.error('QUERY_INVOKED previous args ->', JSON.stringify(args)); return { data: { rows: [{ keys: ['2023-12-19'], clicks: 8 }] } }; })
            // responses for expiry path (new upstream call after cache miss)
            .mockImplementationOnce(async (args: any) => { console.error('QUERY_INVOKED expiry current args ->', JSON.stringify(args)); return { data: { rows: [{ keys: ['2024-01-01'], clicks: 2 }] } }; })
            .mockImplementationOnce(async (args: any) => { console.error('QUERY_INVOKED expiry previous args ->', JSON.stringify(args)); return { data: { rows: [{ keys: ['2023-12-19'], clicks: 9 }] } }; });

        // initial upstream call for this test (populate cache)
        const cfg = { siteUrl: 'https://example.com', serviceAccountKey: JSON.stringify({ type: 'service_account' }) };
        const first = await googleIntegration.getSearchConsoleData(cfg as any, 'test-site');
        expect(first.success).toBe(true);
        expect(setCachedSpy).toHaveBeenCalledTimes(1);

        // now simulate that cache contains the first response
        getCachedSpy.mockImplementation(() => first.data);
        const second = await googleIntegration.getSearchConsoleData(cfg as any, 'example.com');
        expect(setCachedSpy).toHaveBeenCalledTimes(1);
        expect(second).toEqual(first);

		// simulate expiry and ensure upstream called again (observed via setCachedData)
		getCachedSpy.mockImplementation(() => null);
		const third = await googleIntegration.getSearchConsoleData(cfg as any, 'example.com');
		expect(setCachedSpy).toHaveBeenCalledTimes(2);
		expect(third).toBeTruthy();
	});
});
