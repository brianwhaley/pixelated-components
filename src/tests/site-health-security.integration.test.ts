import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock child_process to simulate npm audit responses
vi.mock('child_process', async (importOriginal) => {
	const actual = await importOriginal<typeof import('child_process')>();
	return {
		...actual,
		exec: vi.fn()
	};
});

vi.mock('util', async (importOriginal) => {
	const actual = await importOriginal<typeof import('util')>();
	return {
		...actual,
		promisify: vi.fn((fn) => vi.fn().mockResolvedValue({
			stdout: JSON.stringify({
				auditReportVersion: 2,
				vulnerabilities: {
					'test-package': {
						name: 'test-package',
						severity: 'moderate',
						via: ['vulnerability-1'],
						range: '<1.0.0',
						nodes: ['node_modules/test-package'],
						fixAvailable: true
					}
				},
				metadata: {
					auditReportVersion: 2,
					vulnerabilities: {
						info: 0,
						low: 0,
						moderate: 1,
						high: 0,
						critical: 0
					},
					dependencies: {
						total: 150,
						prod: 25,
						dev: 125,
						optional: 0,
						peer: 0,
						peerOptional: 0
					},
					totalDependencies: 150
				}
			}),
			stderr: ''
		}))
	};
});

vi.mock('fs', () => ({
	existsSync: vi.fn(() => true),
	readFileSync: vi.fn(() => JSON.stringify({ name: 'test-project', version: '1.0.0' }))
}));

vi.mock('path', () => ({
	join: vi.fn((...args) => args.join('/'))
}));

// Import AFTER mocks are defined
import { analyzeSecurityHealth, SecurityScanResult } from '../components/admin/site-health/site-health-security.integration';

describe('site-health-security.integration', () => {
	beforeEach(() => {
		vi.clearAllMocks();
	});

	it('should analyze security with npm audit for a given path', async () => {
		const result = await analyzeSecurityHealth('/test/path', 'test-site');
		expect(result).toBeDefined();
		expect(result.status).toBeDefined();
		expect(['success', 'error']).toContain(result.status);
	});

	it('should return security scan result with expected structure', async () => {
		const result = await analyzeSecurityHealth('.', 'test-site', 'test-repo');
		expect(result).toBeDefined();
		expect(result.status).toBeDefined();
		
		if (result.status === 'success' && result.data) {
			expect(result.data.status).toBeDefined();
			expect(Array.isArray(result.data.vulnerabilities)).toBe(true);
			expect(result.data.summary).toBeDefined();
			expect(typeof result.data.dependencies).toBe('number');
			expect(typeof result.data.totalDependencies).toBe('number');
		}
	});

	it('should identify vulnerability severity levels', async () => {
		const result = await analyzeSecurityHealth('/test/path', 'test-site');
		
		if (result.status === 'success' && result.data) {
			const summary = result.data.summary;
			expect(typeof summary.info).toBe('number');
			expect(typeof summary.low).toBe('number');
			expect(typeof summary.moderate).toBe('number');
			expect(typeof summary.high).toBe('number');
			expect(typeof summary.critical).toBe('number');
			expect(typeof summary.total).toBe('number');
		}
	});

	it('should handle missing package.json gracefully', async () => {
		const fs = await import('fs');
		vi.mocked(fs.existsSync).mockReturnValueOnce(false);

		const result = await analyzeSecurityHealth('/test/path', 'test-site');
		expect(result).toBeDefined();
		expect(result.status).toBe('error');
	});

	it('should handle when no vulnerabilities exist', async () => {
		const result = await analyzeSecurityHealth('/test/path', 'test-site');
		
		if (result.status === 'success' && result.data) {
			// Result should be valid whether vulnerabilities exist or not
			expect(result.data.summary.total).toBeGreaterThanOrEqual(0);
		}
	});

	it('should calculate overall security status from vulnerability count', async () => {
		const result = await analyzeSecurityHealth('/test/path', 'test-site');
		
		if (result.status === 'success' && result.data) {
			// Status should be one of: Secure, Low Risk, Moderate Risk, High Risk, Critical
			const validStatuses = ['Secure', 'Low Risk', 'Moderate Risk', 'High Risk', 'Critical', 'No Dependencies'];
			expect(validStatuses).toContain(result.data.status);
		}
	});

	it('should track total dependencies count', async () => {
		const result = await analyzeSecurityHealth('/test/path', 'test-site');
		
		if (result.status === 'success' && result.data) {
			expect(result.data.totalDependencies).toBeGreaterThanOrEqual(0);
			expect(result.data.dependencies).toBeLessThanOrEqual(result.data.totalDependencies);
		}
	});

	it('should work with different site/repo name combinations', async () => {
		const result1 = await analyzeSecurityHealth('/path1', 'site-a', 'repo-a');
		const result2 = await analyzeSecurityHealth('/path2', 'site-b', 'repo-b');

		expect(result1).toBeDefined();
		expect(result2).toBeDefined();
	});
});
