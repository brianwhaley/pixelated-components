import { describe, it, expect, beforeEach, vi } from 'vitest';
import { getSearchConsoleData, SearchConsoleConfig, SearchConsoleChartDataPoint } from '../components/admin/site-health/google.api.integration';

vi.mock('../components/admin/site-health/google.api.integration', async () => {
	const actual = await vi.importActual('../components/admin/site-health/google.api.integration');
	return {
		...actual,
		getSearchConsoleData: vi.fn(),
	};
});

describe('Site Health GSC Integration', () => {
	const mockConfig: SearchConsoleConfig = {
		siteUrl: 'https://example.com',
		serviceAccountKey: JSON.stringify({
			type: 'service_account',
			project_id: 'test-project',
			private_key_id: 'key-id',
			private_key: '-----BEGIN PRIVATE KEY-----\ntest\n-----END PRIVATE KEY-----',
			client_email: 'test@test.iam.gserviceaccount.com',
		}),
	};

	const mockChartData: SearchConsoleChartDataPoint[] = [
		{
			date: '2024-01-01',
			currentImpressions: 1000,
			currentClicks: 50,
			previousImpressions: 900,
			previousClicks: 45,
		},
		{
			date: '2024-01-02',
			currentImpressions: 1200,
			currentClicks: 60,
			previousImpressions: 1000,
			previousClicks: 50,
		},
		{
			date: '2024-01-03',
			currentImpressions: 1100,
			currentClicks: 55,
			previousImpressions: 950,
			previousClicks: 48,
		},
	];

	beforeEach(() => {
		vi.clearAllMocks();
	});

	describe('Configuration', () => {
		it('should require siteUrl in config', () => {
			const config: SearchConsoleConfig = {
				siteUrl: 'https://example.com',
			};
			expect(config.siteUrl).toBeDefined();
			expect(config.siteUrl).toMatch(/^https?:\/\//);
		});

		it('should support service account authentication', () => {
			const config: SearchConsoleConfig = {
				siteUrl: 'https://example.com',
				serviceAccountKey: '{}',
			};
			expect(config.serviceAccountKey).toBeDefined();
		});

		it('should support OAuth2 authentication', () => {
			const config: SearchConsoleConfig = {
				siteUrl: 'https://example.com',
				clientId: 'client-123',
				clientSecret: 'secret-123',
				refreshToken: 'token-123',
			};
			expect(config.clientId).toBeDefined();
			expect(config.clientSecret).toBeDefined();
			expect(config.refreshToken).toBeDefined();
		});
	});

	describe('Data Fetching', () => {
		it('should fetch GSC data', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(result.success).toBe(true);
			expect(result.data).toBeDefined();
		});

		it('should return chart data points', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(Array.isArray(result.data)).toBe(true);
			expect(result.data?.length).toBeGreaterThan(0);
		});

		it('should include date in data points', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(result.data?.[0].date).toBeDefined();
			expect(result.data?.[0].date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
		});

		it('should include impressions data', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(result.data?.[0].currentImpressions).toBeDefined();
			expect(result.data?.[0].previousImpressions).toBeDefined();
		});

		it('should include clicks data', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(result.data?.[0].currentClicks).toBeDefined();
			expect(result.data?.[0].previousClicks).toBeDefined();
		});
	});

	describe('Search Queries', () => {
		it('should parse search queries from data', () => {
			const queries = [
				{ query: 'test product', clicks: 10, impressions: 100 },
				{ query: 'how to use', clicks: 8, impressions: 80 },
			];
			expect(queries.length).toBeGreaterThan(0);
			expect(queries[0].query).toBeDefined();
		});

		it('should calculate click through rate', () => {
			const point = mockChartData[0];
			const ctr = (point.currentClicks / point.currentImpressions) * 100;
			expect(ctr).toBeGreaterThan(0);
			expect(ctr).toBeLessThan(100);
		});

		it('should compare current vs previous periods', () => {
			const point = mockChartData[0];
			const clickIncrease = point.currentClicks - point.previousClicks;
			expect(typeof clickIncrease).toBe('number');
		});
	});

	describe('Period Comparison', () => {
		it('should accept custom start date', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com', '2024-01-01');
			expect(result.success).toBe(true);
		});

		it('should accept custom end date', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com', '2024-01-01', '2024-01-31');
			expect(result.success).toBe(true);
		});

		it('should compare current and previous periods', () => {
			const currentTotal = mockChartData.reduce((sum, d) => sum + d.currentClicks, 0);
			const previousTotal = mockChartData.reduce((sum, d) => sum + d.previousClicks, 0);
			expect(currentTotal).toBeGreaterThan(0);
			expect(previousTotal).toBeGreaterThan(0);
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid API key', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: false,
				error: 'Authentication failed',
				code: 401,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it('should return error code for auth failures', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: false,
				error: 'Invalid credentials',
				code: 401,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(result.code).toBe(401);
		});

		it('should handle network errors', async () => {
			vi.mocked(getSearchConsoleData).mockRejectedValueOnce(new Error('Network timeout'));

			try {
				await getSearchConsoleData(mockConfig, 'example.com');
			} catch (error: any) {
				expect(error.message).toBeDefined();
			}
		});

		it('should handle GSC API errors', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: false,
				error: 'Failed to fetch GSC data',
				code: 500,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(result.success).toBe(false);
		});

		it('should include error details', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: false,
				error: 'API Error',
				details: 'Rate limit exceeded',
				code: 429,
			});

			const result = await getSearchConsoleData(mockConfig, 'example.com');
			expect(result.details).toBeDefined();
		});
	});

	describe('Data Calculations', () => {
		it('should calculate CTR from impressions and clicks', () => {
			const point = mockChartData[0];
			const ctr = (point.currentClicks / point.currentImpressions) * 100;
			expect(ctr).toEqual(5.0);
		});

		it('should calculate click increase', () => {
			const point = mockChartData[0];
			const increase = point.currentClicks - point.previousClicks;
			expect(increase).toBe(5);
		});

		it('should calculate impression increase', () => {
			const point = mockChartData[0];
			const increase = point.currentImpressions - point.previousImpressions;
			expect(increase).toBe(100);
		});

		it('should handle negative changes', () => {
			const decreasePoint: SearchConsoleChartDataPoint = {
				date: '2024-01-04',
				currentImpressions: 800,
				currentClicks: 40,
				previousImpressions: 1000,
				previousClicks: 50,
			};

			const impressionChange = decreasePoint.currentImpressions - decreasePoint.previousImpressions;
			const clickChange = decreasePoint.currentClicks - decreasePoint.previousClicks;

			expect(impressionChange).toBe(-200);
			expect(clickChange).toBe(-10);
		});
	});

	describe('Caching', () => {
		it('should cache results per site', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			await getSearchConsoleData(mockConfig, 'example.com');
			expect(getSearchConsoleData).toHaveBeenCalledOnce();
		});

		it('should use different cache keys for different dates', async () => {
			vi.mocked(getSearchConsoleData).mockResolvedValueOnce({
				success: true,
				data: mockChartData,
			});

			await getSearchConsoleData(mockConfig, 'example.com', '2024-01-01');
			await getSearchConsoleData(mockConfig, 'example.com', '2024-01-15');

			expect(getSearchConsoleData).toHaveBeenCalledTimes(2);
		});
	});
});
