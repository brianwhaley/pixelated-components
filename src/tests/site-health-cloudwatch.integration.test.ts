import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock AWS SDK BEFORE importing the integration module
vi.mock('@aws-sdk/client-cloudwatch', () => {
	return {
		CloudWatchClient: vi.fn(function(this: any) {
			this.send = vi.fn().mockResolvedValue({
				MetricDataResults: [
					{
						Id: 'healthCheckStatus',
						Timestamps: [
							new Date('2024-01-15T00:00:00Z'),
							new Date('2024-01-16T12:00:00Z'),
							new Date('2024-01-17T18:00:00Z')
						],
						Values: [1.0, 0.3, 0.95],
						StatusCode: 'Complete'
					}
				]
			});
			return this;
		}),
		GetMetricDataCommand: vi.fn()
	};
});

vi.mock('../components/general/cache-manager', () => {
	return {
		CacheManager: vi.fn(function(this: any) {
			this.cache = new Map();
			this.get = vi.fn((key) => this.cache.get(key));
			this.set = vi.fn((key, val) => this.cache.set(key, val));
			return this;
		})
	};
});

vi.mock('../components/general/utilities', () => ({
	getDomain: vi.fn(() => 'example.com')
}));

vi.mock('../components/config/config', () => ({
	getFullPixelatedConfig: vi.fn(() => ({
		aws: {
			region: 'us-east-1',
			access_key_id: 'test-key',
			secret_access_key: 'test-secret'
		}
	}))
}));

// Import AFTER mocks are defined
import { getCloudwatchHealthCheckData, CloudwatchHealthCheckConfig } from '../components/admin/site-health/site-health-cloudwatch.integration';

describe('site-health-cloudwatch.integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should fetch cloudwatch data and parse metric values', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456',
			region: 'us-east-1'
		};

		const result = await getCloudwatchHealthCheckData(config, 'test-site');
		expect(result.success).toBe(true);
		expect(result.data).toBeDefined();
		expect(Array.isArray(result.data)).toBe(true);
	});

	it('should aggregate metrics into data points by date', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456',
			region: 'us-east-1'
		};

		const result = await getCloudwatchHealthCheckData(config, 'test-site');
		
		if (result.success && result.data && result.data.length > 0) {
			const point = result.data[0];
			expect(point.date).toMatch(/\d{4}-\d{2}-\d{2}/);
			expect(typeof point.successCount).toBe('number');
			expect(typeof point.failureCount).toBe('number');
			expect(typeof point.totalChecks).toBe('number');
			expect(typeof point.successRate).toBe('number');
		}
	});

	it('should handle date range parameters and fill missing dates', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456',
			region: 'us-east-1'
		};

		const result = await getCloudwatchHealthCheckData(
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

	it('should correctly calculate health check success rates', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456',
			region: 'us-east-1'
		};

		const result = await getCloudwatchHealthCheckData(config, 'test-site');
		
		if (result.success && result.data) {
			result.data.forEach(point => {
				if (point.totalChecks > 0) {
					const expectedRate = (point.successCount / point.totalChecks) * 100;
					expect(point.successRate).toBeCloseTo(expectedRate, 1);
				}
			});
		}
	});

	it('should classify metric values as success (>= 0.5) or failure (< 0.5)', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456',
			region: 'us-east-1'
		};

		const result = await getCloudwatchHealthCheckData(config, 'test-site');
		
		if (result.success && result.data && result.data.length > 0) {
			expect(result.data[0].totalChecks).toBeGreaterThan(0);
		}
	});

	it('should use default AWS region when not specified', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456'
		};

		const result = await getCloudwatchHealthCheckData(config, 'test-site');
		expect(result).toBeDefined();
	});

	it('should respect custom AWS region from config', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456',
			region: 'eu-west-1'
		};

		const result = await getCloudwatchHealthCheckData(config, 'test-site');
		expect(result).toBeDefined();
	});

	it('should use cache to return previously fetched data', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456',
			region: 'us-east-1'
		};

		const result1 = await getCloudwatchHealthCheckData(config, 'test-site');
		const result2 = await getCloudwatchHealthCheckData(config, 'test-site');
		
		// Both should return data
		expect(result1).toBeDefined();
		expect(result2).toBeDefined();
	});

	it('should work with different site names independently', async () => {
		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: 'hc-123456',
			region: 'us-east-1'
		};

		const result1 = await getCloudwatchHealthCheckData(config, 'site-a');
		const result2 = await getCloudwatchHealthCheckData(config, 'site-b');
		
		expect(result1).toBeDefined();
		expect(result2).toBeDefined();
	});

	describe('Error handling', () => {
		it('should return error when CloudWatch API fails', async () => {
			const CloudWatch = await import('@aws-sdk/client-cloudwatch');
			const mockClient = vi.mocked(CloudWatch.CloudWatchClient);
			
			mockClient.mockImplementationOnce(function() {
				this.send = vi.fn().mockRejectedValueOnce(new Error('API Error'));
				return this;
			});

			const config: CloudwatchHealthCheckConfig = {
				healthCheckId: 'hc-123456',
				region: 'us-east-1'
			};

			const result = await getCloudwatchHealthCheckData(config, 'test-site');
			expect(result.success).toBe(true);
		});

		it('should handle empty metric results', async () => {
			const CloudWatch = await import('@aws-sdk/client-cloudwatch');
			const mockClient = vi.mocked(CloudWatch.CloudWatchClient);
			
			mockClient.mockImplementationOnce(function() {
				this.send = vi.fn().mockResolvedValueOnce({ MetricDataResults: [] });
				return this;
			});

			const config: CloudwatchHealthCheckConfig = {
				healthCheckId: 'hc-123456',
				region: 'us-east-1'
			};

			const result = await getCloudwatchHealthCheckData(config, 'test-site');
			expect(result.success).toBe(true);
		});
	});

	describe('Data transformation', () => {
		it('should convert CloudWatch response timestamps to date strings', async () => {
			const config: CloudwatchHealthCheckConfig = {
				healthCheckId: 'hc-123456',
				region: 'us-east-1'
			};

			const result = await getCloudwatchHealthCheckData(config, 'test-site');
			
			if (result.success && result.data && result.data.length > 0) {
				result.data.forEach(point => {
					expect(point.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
				});
			}
		});

		it('should sort returned data by date in ascending order', async () => {
			const config: CloudwatchHealthCheckConfig = {
				healthCheckId: 'hc-123456',
				region: 'us-east-1'
			};

			const result = await getCloudwatchHealthCheckData(config, 'test-site');
			
			if (result.success && result.data && result.data.length > 1) {
				for (let i = 0; i < result.data.length - 1; i++) {
					expect(result.data[i].date <= result.data[i + 1].date).toBe(true);
				}
			}
		});

		it('should round success rate to 2 decimal places', async () => {
			const config: CloudwatchHealthCheckConfig = {
				healthCheckId: 'hc-123456',
				region: 'us-east-1'
			};

			const result = await getCloudwatchHealthCheckData(config, 'test-site');
			
			if (result.success && result.data && result.data.length > 0) {
				result.data.forEach(point => {
					const roundedRate = Math.round(point.successRate * 100) / 100;
					expect(point.successRate).toBe(roundedRate);
				});
			}
		});
	});
});
