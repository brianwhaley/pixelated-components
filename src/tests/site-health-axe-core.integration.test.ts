import { vi, describe, it, expect, beforeEach } from 'vitest';

// Mock setTimeout to resolve instantly for tests
const originalSetTimeout = global.setTimeout;
global.setTimeout = vi.fn((callback: any) => {
	callback();
	return {} as any;
}) as any;

// Mock puppeteer at module level
vi.mock('puppeteer', () => ({
	default: {
		launch: vi.fn().mockResolvedValue({
			newPage: vi.fn().mockResolvedValue({
				setViewport: vi.fn().mockResolvedValue(undefined),
				on: vi.fn().mockReturnValue(undefined),
				setUserAgent: vi.fn().mockResolvedValue(undefined),
				goto: vi.fn().mockResolvedValue(undefined),
				addScriptTag: vi.fn().mockResolvedValue(undefined),
				frames: vi.fn().mockReturnValue([{
					evaluate: vi.fn().mockResolvedValue({
						violations: [],
						passes: [],
						incomplete: [],
						inapplicable: [],
						testEngine: { name: 'axe-core', version: '4.0.0' },
						testRunner: { name: 'mock' },
						testEnvironment: { userAgent: 'test', windowWidth: 1280, windowHeight: 720 },
						timestamp: new Date().toISOString(),
						url: 'http://example.com'
					})
				}]),
				close: vi.fn().mockResolvedValue(undefined)
			}),
			close: vi.fn().mockResolvedValue(undefined)
		})
	}
}));

// Mock fs at module level
vi.mock('fs', () => ({
	default: {
		existsSync: vi.fn().mockReturnValue(true),
		readFileSync: vi.fn().mockReturnValue('/* axe */')
	},
	existsSync: vi.fn().mockReturnValue(true),
	readFileSync: vi.fn().mockReturnValue('/* axe */')
}));

// Mock getFullPixelatedConfig
vi.mock('../components/config/config', () => ({
	getFullPixelatedConfig: vi.fn().mockReturnValue({ puppeteer: { executable_path: './chrome' } })
}));

// Import module once to avoid repeated slow imports
let performAxeCoreAnalysis: any;

describe('site-health-axe-core.integration', () => {
	beforeEach(async () => {
		// Only import once per test suite
		if (!performAxeCoreAnalysis) {
			const module = await import('../components/admin/site-health/site-health-axe-core.integration');
			performAxeCoreAnalysis = module.performAxeCoreAnalysis;
		}
	});

	describe('performAxeCoreAnalysis', () => {
		it('should export performAxeCoreAnalysis function', () => {
			expect(typeof performAxeCoreAnalysis).toBe('function');
		});

		it('should accept URL parameter', async () => {
			const result = await performAxeCoreAnalysis('https://example.com');
			
			expect(result).toBeDefined();
			expect(result.url).toBe('https://example.com');
		});

		it('should accept runtime_env parameter with "auto" default', async () => {
			const result1 = await performAxeCoreAnalysis('http://example.com');
			expect(result1).toBeDefined();
			
			const result2 = await performAxeCoreAnalysis('http://example.com', 'local');
			expect(result2).toBeDefined();
			
			const result3 = await performAxeCoreAnalysis('http://example.com', 'prod');
			expect(result3).toBeDefined();
		}, 15000);

		it('should calculate summary with violation counts', async () => {
			// For this test, we need to override the puppeteer mock to return violations
			const puppeteerModule = await import('puppeteer');
			vi.mocked(puppeteerModule.default.launch as any).mockResolvedValueOnce({
				newPage: vi.fn().mockResolvedValue({
					setViewport: vi.fn().mockResolvedValue(undefined),
					on: vi.fn().mockReturnValue(undefined),
					setUserAgent: vi.fn().mockResolvedValue(undefined),
					goto: vi.fn().mockResolvedValue(undefined),
					addScriptTag: vi.fn().mockResolvedValue(undefined),
					frames: vi.fn().mockReturnValue([{ 
						evaluate: vi.fn().mockResolvedValue({ 
							violations: [
								{ id: 'alt-text', impact: 'critical', description: 'Images without alt text', help: '', helpUrl: '', nodes: [], tags: [] }
							],
							passes: [
								{ id: 'color-contrast', impact: 'serious', description: 'Sufficient color contrast', help: '', helpUrl: '', nodes: [], tags: [] }
							],
							incomplete: [],
							inapplicable: [],
							testEngine: { name: 'axe-core', version: '4.0.0' },
							testRunner: { name: 'mock' },
							testEnvironment: { userAgent: 'test', windowWidth: 1280, windowHeight: 720 },
							timestamp: new Date().toISOString(),
							url: 'http://example.com'
						}) 
					}]),
					close: vi.fn().mockResolvedValue(undefined)
				}),
				close: vi.fn().mockResolvedValue(undefined)
			} as any);

			const result = await performAxeCoreAnalysis('http://example.com');

			expect(result.summary.violations).toBeGreaterThanOrEqual(1);
			expect(result.summary.passes).toBeGreaterThanOrEqual(1);
			expect(result.summary.critical).toBeGreaterThanOrEqual(1);
		});

		it('should handle errors and return error status', async () => {
			const puppeteerModule = await import('puppeteer');
			vi.mocked(puppeteerModule.default.launch as any).mockRejectedValueOnce(new Error('Browser launch failed'));

			const result = await performAxeCoreAnalysis('http://example.com');

			expect(result.status).toBe('error');
			expect(result.error).toBeDefined();
			expect(result.summary.violations).toBe(0);
		});

		it('should return proper result structure on success', async () => {
			const result = await performAxeCoreAnalysis('http://example.com');

			expect(result).toHaveProperty('site');
			expect(result).toHaveProperty('url');
			expect(result).toHaveProperty('result');
			expect(result).toHaveProperty('summary');
			expect(result).toHaveProperty('timestamp');
			expect(result).toHaveProperty('status');
		});

		it('should handle different URL formats', async () => {
			const urls = [
				'http://example.com',
				'https://example.com',
				'https://example.com/',
				'https://example.com/page'
			];

			for (const url of urls) {
				const result = await performAxeCoreAnalysis(url);
				expect(result).toBeDefined();
				expect(result.url).toBe(url);
			}
		}, 20000);
	});
});
