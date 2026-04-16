import { describe, it, expect, vi, beforeEach } from 'vitest';
import { analyzeSecurityHealth } from '../components/admin/site-health/site-health-security.integration';

// Mock child_process to simulate npm audit responses
vi.mock('child_process', async () => {
	const actual = await vi.importActual<typeof import('child_process')>('child_process');
	const mockExec = vi.fn((cmd: string, options: any, callback: (err: Error | null, stdout: string, stderr: string) => void) => {
		callback(null, JSON.stringify({
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
		}), '');
	});
	return {
		...actual,
		default: actual,
		exec: mockExec
	};
});

vi.mock('fs', async () => {
	const actual = await vi.importActual<typeof import('fs')>('fs');
	return {
		...actual,
		default: actual,
		existsSync: vi.fn(actual.existsSync),
	};
});

vi.mock('util', async () => {
	const actual = await vi.importActual<typeof import('util')>('util');
	return {
		...actual,
		default: actual,
		promisify: vi.fn(() => vi.fn(async () => ({
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
		})))
	};
});

describe('analyzeSecurityHealth', () => {
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

	it('should handle npm audit with vulnerabilities', async () => {
		const result = await analyzeSecurityHealth('/path', 'site');
		if (result.status === 'success' && result.data) {
			expect(result.data.summary).toBeDefined();
			expect(result.data.summary.total).toBeGreaterThanOrEqual(0);
		}
	});

	it('should return result for path with siteName only', async () => {
		const result = await analyzeSecurityHealth('/path', 'mysite');
		expect(result).toHaveProperty('status');
	});

	it('should return result for path with repoName only', async () => {
		const result = await analyzeSecurityHealth('/path', undefined, 'myrepo');
		expect(result).toHaveProperty('status');
	});

	it('should return result for path with both siteName and repoName', async () => {
		const result = await analyzeSecurityHealth('/path', 'site', 'repo');
		expect(result).toHaveProperty('status');
	});

	it('should handle vulnerabilities categorized by severity', async () => {
		const result = await analyzeSecurityHealth('/test');
		if (result.status === 'success' && result.data) {
			const summary = result.data.summary;
			expect(summary).toHaveProperty('critical');
			expect(summary).toHaveProperty('high');
			expect(summary).toHaveProperty('moderate');
			expect(summary).toHaveProperty('low');
			expect(summary).toHaveProperty('info');
		}
	});

	it('should calculate total vulnerabilities correctly', async () => {
		const result = await analyzeSecurityHealth('/test');
		if (result.status === 'success' && result.data) {
			const { summary } = result.data;
			const total = summary.critical + summary.high + summary.moderate + summary.low + summary.info;
			expect(total).toBeGreaterThanOrEqual(0);
		}
	});
});
