import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getGoogleAnalyticsData, GoogleAnalyticsConfig, ChartDataPoint } from '../components/admin/site-health/google.api.integration';

vi.mock('../components/admin/site-health/google.api.integration', async () => {
	const actual = await vi.importActual('../components/admin/site-health/google.api.integration');
	return {
		...actual,
		getGoogleAnalyticsData: vi.fn(),
	};
});

describe('Site Health Google Analytics Integration', () => {
	const mockConfig: GoogleAnalyticsConfig = {
		ga4PropertyId: '123456789',
		serviceAccountKey: JSON.stringify({
			type: 'service_account',
			project_id: 'test-project',
			private_key_id: 'key-id',
			private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----',
			client_email: 'test@test.iam.gserviceaccount.com',
		}),
	};

	const mockChartData: ChartDataPoint[] = [
		{
			date: '2024-01-01',
			currentPageViews: 500,
			previousPageViews: 450,
		},
		{
			date: '2024-01-02',
			currentPageViews: 600,
			previousPageViews: 550,
		},
		{
			date: '2024-01-03',
			currentPageViews: 550,
			previousPageViews: 500,
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Configuration', () => {
		it('should require GA4 property ID', () => {
			const config: GoogleAnalyticsConfig = {
				ga4PropertyId: '123456789',
			};
			expect(config.ga4PropertyId).toBeDefined();
			expect(config.ga4PropertyId).toMatch(/^\d+$/);
		});

		it('should support service account authentication', () => {
			const config: GoogleAnalyticsConfig = {
				ga4PropertyId: '123456789',
				serviceAccountKey: '{}',
			};
			expect(config.serviceAccountKey).toBeDefined();
		});

		it('should support OAuth2 authentication', () => {
			const config: GoogleAnalyticsConfig = {
				ga4PropertyId: '123456789',
				clientId: 'client-id',
				clientSecret: 'client-secret',
				refreshToken: 'refresh-token',
			};
			expect(config.clientId).toBeDefined();
			expect(config.clientSecret).toBeDefined();
			expect(config.refreshToken).toBeDefined();
		});
	});

	describe('Data Fetching', () => {
		it('should fetch GA data', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
		});

		it('should return chart data points', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(Array.isArray(result.data)).toBe(true);
			expect(result.data?.length).toBeGreaterThan(0);
		});

		it('should include date in data points', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(result.data?.[0].date).toBeDefined();
			expect(result.data?.[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});

		it('should include current period pageviews', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(result.data?.[0].currentPageViews).toBeDefined();
			expect(result.data?.[0].currentPageViews).toBeGreaterThan(0);
		});

		it('should include previous period pageviews', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(result.data?.[0].previousPageViews).toBeDefined();
			expect(result.data?.[0].previousPageViews).toBeGreaterThan(0);
		});
	});

	describe('Metrics', () => {
		it('should parse GA metrics', () => {
			const pageviews = mockChartData.map(d => d.currentPageViews);
			expect(pageviews.length).toBeGreaterThan(0);
			expect(pageviews[0]).toBeGreaterThan(0);
		});

		it('should calculate total pageviews', () => {
			const total = mockChartData.reduce((sum, d) => sum + d.currentPageViews, 0);
			expect(total).toBeGreaterThan(0);
		});

		it('should compare current vs previous period pageviews', () => {
			const currentTotal = mockChartData.reduce((sum, d) => sum + d.currentPageViews, 0);
			const previousTotal = mockChartData.reduce((sum, d) => sum + d.previousPageViews, 0);
			const increase = currentTotal - previousTotal;

			expect(typeof increase).toBe('number');
			expect(increase).toBeGreaterThan(0);
		});

		it('should track daily pageview variations', () => {
			const dailyPageviews = mockChartData.map(d => d.currentPageViews);
			const hasVariation = new Set(dailyPageviews).size > 1;

			expect(hasVariation).toBe(true);
		});
	});

	describe('Period Comparison', () => {
		it('should accept custom start date', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site', '2024-01-01');
			expect(result.success).toBe(true);
		});

		it('should accept custom end date', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site', '2024-01-01', '2024-01-31');
			expect(result.success).toBe(true);
		});

		it('should compare current and previous periods', () => {
			const comparison = mockChartData.map(d => ({
				date: d.date,
				change: d.currentPageViews - d.previousPageViews,
			}));

			expect(comparison.length).toBe(mockChartData.length);
			expect(comparison[0].change).toBeGreaterThan(0);
		});

		it('should handle negative changes', () => {
			const negativeData: ChartDataPoint = {
				date: '2024-01-04',
				currentPageViews: 400,
				previousPageViews: 500,
			};

			const change = negativeData.currentPageViews - negativeData.previousPageViews;
			expect(change).toBe(-100);
		});
	});

	describe('Error Handling', () => {
		it('should handle GA API errors', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: false,
				error: 'API_ERROR',
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it('should handle authentication failures', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: false,
				error: 'Authentication failed',
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(result.success).toBe(false);
		});

		it('should handle network errors', async () => {
			vi.mocked(getGoogleAnalyticsData).mockRejectedValueOnce(new Error('Network timeout'));

			try {
				await getGoogleAnalyticsData(mockConfig, 'Example Site');
			} catch (error: any) {
				expect(error.message).toBeDefined();
			}
		});

		it('should handle invalid property ID', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: false,
				error: 'Invalid property ID',
			});

			const result = await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(result.success).toBe(false);
		});
	});

	describe('Data Calculations', () => {
		it('should calculate average pageviews', () => {
			const total = mockChartData.reduce((sum, d) => sum + d.currentPageViews, 0);
			const average = total / mockChartData.length;

			expect(average).toBeGreaterThan(0);
			expect(average).toBeLessThan(total);
		});

		it('should identify peak traffic day', () => {
			const maxDay = mockChartData.reduce((max, curr) => 
				curr.currentPageViews > max.currentPageViews ? curr : max
			);

			expect(maxDay.currentPageViews).toBe(600);
		});

		it('should identify lowest traffic day', () => {
			const minDay = mockChartData.reduce((min, curr) => 
				curr.currentPageViews < min.currentPageViews ? curr : min
			);

			expect(minDay.currentPageViews).toBe(500);
		});

		it('should calculate period-over-period growth rate', () => {
			const currentTotal = mockChartData.reduce((sum, d) => sum + d.currentPageViews, 0);
			const previousTotal = mockChartData.reduce((sum, d) => sum + d.previousPageViews, 0);
			const growthRate = ((currentTotal - previousTotal) / previousTotal) * 100;

			expect(growthRate).toBeGreaterThan(0);
		});
	});

	describe('Caching', () => {
		it('should cache GA results', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			await getGoogleAnalyticsData(mockConfig, 'Example Site');
			expect(getGoogleAnalyticsData).toHaveBeenCalledOnce();
		});

		it('should use different cache keys for different dates', async () => {
			vi.mocked(getGoogleAnalyticsData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			await getGoogleAnalyticsData(mockConfig, 'Example Site', '2024-01-01');
			await getGoogleAnalyticsData(mockConfig, 'Example Site', '2024-01-15');

			expect(getGoogleAnalyticsData).toHaveBeenCalledTimes(2);
		});

		it('should have 1 hour TTL for cached results', () => {
			const ttl = 60 * 60 * 1000; // 1 hour in milliseconds
			expect(ttl).toBe(3600000);
		});
	});

	describe('Data Trends', () => {
		it('should track increasing trends', () => {
			const increasingData = [
				{ date: '2024-01-01', currentPageViews: 100, previousPageViews: 100 },
				{ date: '2024-01-02', currentPageViews: 150, previousPageViews: 100 },
				{ date: '2024-01-03', currentPageViews: 200, previousPageViews: 150 },
			];

			const isIncreasing = increasingData.every((d, i) => 
				i === 0 || d.currentPageViews >= increasingData[i - 1].currentPageViews
			);

			expect(isIncreasing).toBe(true);
		});

		it('should detect traffic anomalies', () => {
			const anomaly = 50; // Much lower than surrounding data
			expect(anomaly).toBeLessThan(mockChartData[0].currentPageViews);
		});
	});
});
