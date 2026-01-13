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

		// Mock config to supply a deterministic puppeteer executable path
		// Import the real config module and spy on getFullPixelatedConfig so we avoid relative path mismatches
		const configModule = await import('../components/config/config');
		vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ puppeteer: { executable_path: './puppeteer-binary/chrome' } } as any);
	});

	afterEach(() => {
		vi.restoreAllMocks();
		vi.clearAllMocks();
		vi.resetModules();
	});

	it('falls back to local inline injection when CDN is blocked and reports injectionSource "local-inline"', async () => {
		const { performAxeCoreAnalysis } = await import('../components/admin/site-health/site-health-axe-core.integration');
		const url = 'http://example.local';
		const res = await performAxeCoreAnalysis(url);

		expect(res).toBeDefined();
		expect(res.status).toBe('success');
		expect(res.injectionSource).toBe('local-inline');
	});

	it('uses executable_path from config when present (prod runtime)', async () => {
		// Spy on puppeteer.launch to capture received options
		const launchSpy = vi.fn().mockImplementation(() => Promise.resolve({ newPage: () => Promise.resolve({ setViewport: () => Promise.resolve() }), close: () => Promise.resolve() } as any));
		vi.doMock('puppeteer', async () => ({
			default: { launch: launchSpy },
			launch: launchSpy
		}));

		const { performAxeCoreAnalysis } = await import('../components/admin/site-health/site-health-axe-core.integration');
		await performAxeCoreAnalysis('http://example.local', 'prod');

		expect(launchSpy).toHaveBeenCalled();
		const calledWith = launchSpy.mock.calls[0][0];
		expect(calledWith.executablePath).toBe('./puppeteer-binary/chrome');
		expect(calledWith.args).toContain('--no-sandbox');
		expect(calledWith.args).toContain('--disable-dev-shm-usage');
	});

	it('does not use config executable_path when runtime_env is local', async () => {
		// Spy on puppeteer.launch to capture received options
		const launchSpy = vi.fn().mockImplementation(() => Promise.resolve({ newPage: () => Promise.resolve({ setViewport: () => Promise.resolve() }), close: () => Promise.resolve() } as any));
		vi.doMock('puppeteer', async () => ({
			default: { launch: launchSpy },
			launch: launchSpy
		}));

		const { performAxeCoreAnalysis } = await import('../components/admin/site-health/site-health-axe-core.integration');
		await performAxeCoreAnalysis('http://example.local', 'local');

		expect(launchSpy).toHaveBeenCalled();
		const calledWithLocal = launchSpy.mock.calls[0][0];
		expect(calledWithLocal.executablePath).toBeUndefined();
		expect(calledWithLocal.args).not.toContain('--no-sandbox');
		expect(calledWithLocal.args).toContain('--disable-accelerated-2d-canvas');
	});
});
