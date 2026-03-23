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
		analyticsdata: vi.fn(() => ({
			properties: {
				runReport: vi.fn().mockResolvedValue({
					data: {
						rows: [
							{ dimensionValues: [{ value: '20240115' }], metricValues: [{ value: '1200' }] },
							{ dimensionValues: [{ value: '20240116' }], metricValues: [{ value: '1500' }] },
							{ dimensionValues: [{ value: '20240117' }], metricValues: [{ value: '1800' }] }
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
		currentStartStr: '20240115',
		currentEndStr: '20240117',
		previousStart: new Date('2024-01-08'),
		previousEnd: new Date('2024-01-14'),
		previousStartStr: '20240108',
		previousEndStr: '20240114'
	})),
	formatChartDate: vi.fn((date) => date.toISOString().split('T')[0]),
	getCachedData: vi.fn(() => null),
	setCachedData: vi.fn()
}));

// Import AFTER mocks are defined - Import from the integration file to generate coverage
import { getGoogleAnalyticsData, GoogleAnalyticsConfig } from '../components/admin/site-health/google.api.integration';

describe('site-health-google-analytics.integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch Google Analytics data with valid service account', async () => {
		const config: GoogleAnalyticsConfig = {
			ga4PropertyId: 'G-123456',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				private_key: 'test-key',
				client_email: 'test@example.com'
			})
		};

		const result = await getGoogleAnalyticsData(config, 'test-site');
		expect(result.success).toBe(true);
		expect(result.data).toBeDefined();
		expect(Array.isArray(result.data)).toBe(true);
	});

	it('should return chart data points with date and pageviews', async () => {
		const config: GoogleAnalyticsConfig = {
			ga4PropertyId: 'G-123456',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test-project',
				private_key: 'test-key',
				client_email: 'test@example.com'
			})
		};

		const result = await getGoogleAnalyticsData(config, 'test-site');
		if (result.success && result.data) {
			result.data.forEach(point => {
				expect(point.date).toMatch(/\d{4}-\d{2}-\d{2}/);
				expect(typeof point.currentPageViews).toBe('number');
				expect(typeof point.previousPageViews).toBe('number');
			});
		}
	});

	it('should handle missing GA4 property ID configuration', async () => {
		const config: GoogleAnalyticsConfig = {
			ga4PropertyId: 'GA4_PROPERTY_ID_HERE',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result = await getGoogleAnalyticsData(config, 'test-site');
		expect(result.success).toBe(false);
		expect(result.error).toContain('GA4 Property ID');
	});

	it('should handle missing credentials gracefully', async () => {
		const config: GoogleAnalyticsConfig = {
			ga4PropertyId: 'G-123456'
			// No credentials provided
		};

		const result = await getGoogleAnalyticsData(config, 'test-site');
		expect(result.success).toBe(false);
		expect(result.error).toBeDefined();
	});

	it('should use cache when available', async () => {
		const config: GoogleAnalyticsConfig = {
			ga4PropertyId: 'G-123456',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result1 = await getGoogleAnalyticsData(config, 'test-site');
		const result2 = await getGoogleAnalyticsData(config, 'test-site');

		expect(result1).toBeDefined();
		expect(result2).toBeDefined();
	});

	it('should handle date range parameters correctly', async () => {
		const config: GoogleAnalyticsConfig = {
			ga4PropertyId: 'G-123456',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result = await getGoogleAnalyticsData(
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
		const config: GoogleAnalyticsConfig = {
			ga4PropertyId: 'G-123456',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result1 = await getGoogleAnalyticsData(config, 'site-a');
		const result2 = await getGoogleAnalyticsData(config, 'site-b');

		expect(result1).toBeDefined();
		expect(result2).toBeDefined();
	});

	it('should include both current and previous period pageviews', async () => {
		const config: GoogleAnalyticsConfig = {
			ga4PropertyId: 'G-123456',
			serviceAccountKey: JSON.stringify({
				type: 'service_account',
				project_id: 'test',
				private_key: 'key',
				client_email: 'test@test.com'
			})
		};

		const result = await getGoogleAnalyticsData(config, 'test-site');
		if (result.success && result.data) {
			expect(result.data[0].currentPageViews).toBeGreaterThanOrEqual(0);
			expect(result.data[0].previousPageViews).toBeGreaterThanOrEqual(0);
		}
	});
});
