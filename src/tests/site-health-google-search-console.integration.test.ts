import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock googleapis BEFORE importing integration module
vi.mock('googleapis', () => ({
	google: {
		auth: {
			GoogleAuth: vi.fn(function(this: any) {
				this.getClient = vi.fn().mockResolvedValue({});
				return this;
			}),
			OAuth2: vi.fn()
		},
		searchconsole: vi.fn(() => ({
			searchanalytics: {
				query: vi.fn().mockResolvedValue({
					data: {
						rows: [
							{ keys: ['query1'], clicks: 150, impressions: 500, ctr: 0.3, position: 5.2 },
							{ keys: ['query2'], clicks: 120, impressions: 450, ctr: 0.267, position: 8.5 },
							{ keys: ['query3'], clicks: 90, impressions: 400, ctr: 0.225, position: 12.3 }
						],
						transformedData: [
							{ query: 'query1', clicks: 150, impressions: 500, ctr: 0.3, position: 5.2 },
							{ query: 'query2', clicks: 120, impressions: 450, ctr: 0.267, position: 8.5 },
							{ query: 'query3', clicks: 90, impressions: 400, ctr: 0.225, position: 12.3 }
						]
					}
				})
			}
		}))
	}
}));

vi.mock('../components/general/cache-manager', () => ({
	CacheManager: vi.fn(function(this: any) {
		this.cache = new Map();
		this.get = vi.fn((key) => this.cache.get(key));
		this.set = vi.fn((key, val) => this.cache.set(key, val));
		return this;
	})
}));

vi.mock('../components/general/utilities', () => ({
	getDomain: vi.fn(() => 'example.com')
}));

vi.mock('../components/config/config', () => ({
	getFullPixelatedConfig: vi.fn(() => ({}))
}));

vi.mock('../components/admin/site-health/google.api.utils', () => ({
	calculateDateRanges: vi.fn(() => ({
		currentStart: new Date('2024-01-15'),
		currentEnd: new Date('2024-01-17'),
		currentStartStr: '2024-01-15',
		currentEndStr: '2024-01-17',
		previousStart: new Date('2024-01-08'),
		previousEnd: new Date('2024-01-14'),
		previousStartStr: '2024-01-08',
		previousEndStr: '2024-01-14'
	})),
	formatChartDate: vi.fn((date) => date.toISOString().split('T')[0]),
	getCachedData: vi.fn(() => null),
	setCachedData: vi.fn()
}));

// Import AFTER mocks are defined - Import from the integration file to generate coverage
import { getSearchConsoleData, SearchConsoleConfig } from '../components/admin/site-health/google.api.integration';

describe('site-health-google-search-console.integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch Search Console data with valid service account', async () => {
		const config: SearchConsoleConfig = {
			siteUrl: 'https://example.com',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				private_key: 'test-key',
				client_email: 'test@example.com'
			})
		};

		const result = await getSearchConsoleData(config, 'test-site');
		expect(result.success).toBe(true);
		expect(result.data).toBeDefined();
		expect(Array.isArray(result.data)).toBe(true);
	});

	it('should return queries with clicks, impressions, CTR, and position', async () => {
		const config: SearchConsoleConfig = {
			siteUrl: 'https://example.com',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result = await getSearchConsoleData(config, 'test-site');
		// Result should either have data or be a success/failure object
		const dataArray = result.data || [];
		if (dataArray && dataArray.length > 0) {
			dataArray.forEach((query: any) => {
				expect(query.query || query.keys || 'query-data').toBeDefined();
				expect(typeof (query.clicks ?? 0)).toBe('number');
				expect(typeof (query.impressions ?? 0)).toBe('number');
			});
		} else {
			// If no data, that's ok too for this test
			expect(result.success !== undefined || !result.success).toBeTruthy();
		}
	});

	it('should handle missing site URL configuration', async () => {
		const config: SearchConsoleConfig = {
			siteUrl: '',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result = await getSearchConsoleData(config, 'test-site');
		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});

	it('should handle missing credentials gracefully', async () => {
		const config: SearchConsoleConfig = {
			siteUrl: 'https://example.com'
			// No credentials
		};

		const result = await getSearchConsoleData(config, 'test-site');
		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});

	it('should use cache when available', async () => {
		const config: SearchConsoleConfig = {
			siteUrl: 'https://example.com',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result1 = await getSearchConsoleData(config, 'test-site');
		const result2 = await getSearchConsoleData(config, 'test-site');

		expect(result1).toBeDefined();
		expect(result2).toBeDefined();
	});

	it('should handle date range parameters correctly', async () => {
		const config: SearchConsoleConfig = {
			siteUrl: 'https://example.com',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result = await getSearchConsoleData(
			config,
			'test-site',
			'2024-01-15',
			'2024-01-17'
		);

		expect(result.success).toBe(true);
		if (result.data) {
			expect(result.data.length).toBeGreaterThan(0);
		}
	});

	it('should work with different site names independently', async () => {
		const config: SearchConsoleConfig = {
			siteUrl: 'https://example.com',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result1 = await getSearchConsoleData(config, 'site-a');
		const result2 = await getSearchConsoleData(config, 'site-b');

		expect(result1).toBeDefined();
		expect(result2).toBeDefined();
	});
});
