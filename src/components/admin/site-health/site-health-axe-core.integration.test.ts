import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';

// We'll mock puppeteer and fs before importing the module under test to avoid ESM spy limitations

describe('performAxeCoreAnalysis (CDN blocked -> local-inline fallback)', () => {
	beforeEach(async () => {
		vi.resetModules();

		// Mock puppeteer browser and page
		const page: any = {
			setViewport: vi.fn().mockResolvedValue(undefined),
			on: vi.fn().mockReturnValue(undefined),
			setUserAgent: vi.fn().mockResolvedValue(undefined),
			goto: vi.fn().mockResolvedValue(undefined),
			addScriptTag: vi.fn().mockImplementation(async (opts: any) => {
				if (opts && opts.url && opts.url.includes('cdn.jsdelivr')) {
					// Simulate CDN blocked
					throw new Error('CDN blocked');
				}
				// Otherwise pretend inline injection succeeded
				return Promise.resolve(undefined);
			}),
			frames: vi.fn().mockReturnValue([{
				evaluate: vi.fn().mockImplementation(async (fn: any) => {
					const fnStr = fn.toString();
					if (fnStr.includes('typeof (window as any).axe') || fnStr.includes('typeof window.axe')) {
						return true; // axe is present after inline injection
					}
					if (fnStr.includes('axe.run') || fnStr.includes('window.axe.run')) {
						// return a minimal axe result shape
						return {
							violations: [],
							passes: [],
							incomplete: [],
							inapplicable: [],
							testEngine: { name: 'axe-core', version: 'test' },
							testRunner: { name: 'mock' },
							testEnvironment: { userAgent: 'mock', windowWidth: 1280, windowHeight: 720 },
							timestamp: new Date().toISOString(),
							url: 'http://example'
						};
					}
					return null;
				})
			}])
		};

		const browser = {
			newPage: vi.fn().mockResolvedValue(page),
			close: vi.fn().mockResolvedValue(undefined)
		};

		// Mock puppeteer before importing the module to avoid ESM spy issues
		vi.doMock('puppeteer', async (importOriginal) => {
			// Provide a minimal mock that exposes launch as both default and named
			return {
				default: { launch: () => Promise.resolve(browser) },
				launch: () => Promise.resolve(browser)
			};
		});

		// Mock fs before importing the module (provide both default and named exports for interop)
		vi.doMock('fs', () => ({
			existsSync: () => true,
			readFileSync: () => '/* fake axe content */',
			default: {
				existsSync: () => true,
				readFileSync: () => '/* fake axe content */'
			}
		}));
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('falls back to local inline injection when CDN is blocked and reports injectionSource "local-inline"', async () => {
		const { performAxeCoreAnalysis } = await import('./site-health-axe-core.integration');
		const url = 'http://example.local';
		const res = await performAxeCoreAnalysis(url);

		expect(res).toBeDefined();
		expect(res.status).toBe('success');
		expect(res.injectionSource).toBe('local-inline');
	});
});
