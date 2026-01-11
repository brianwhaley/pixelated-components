import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/site-health/axe-core/route';
import * as integrationModule from '@pixelated-tech/components/adminserver';

// Note: Using a simple object for the NextRequest (only url is read in the handler).

describe('axe-core route purge behavior', () => {
	let performSpy: any;
	let consoleInfoSpy: any;

	beforeEach(() => {
		// Provide a predictable minimal success result so route will cache it
		performSpy = vi.spyOn(integrationModule as any, 'performAxeCoreAnalysis').mockResolvedValue({
			site: 'brianwhaley',
			url: 'https://www.brianwhaley.com',
			result: {
				violations: [],
				passes: [],
				incomplete: [],
				inapplicable: [],
				testEngine: { name: 'axe-core', version: 'test' },
				testRunner: { name: 'mock' },
				testEnvironment: { userAgent: 'mock', windowWidth: 1280, windowHeight: 720 },
				timestamp: new Date().toISOString(),
				url: 'https://www.brianwhaley.com'
			},
			summary: { violations: 0, passes: 0, incomplete: 0, inapplicable: 0, critical: 0, serious: 0, moderate: 0, minor: 0 },
			timestamp: new Date().toISOString(),
			status: 'success'
		} as any);

		consoleInfoSpy = vi.spyOn(console, 'info').mockImplementation(() => {});
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('returns x-axe-purged header when purge=true and a cache entry existed', async () => {
		// First call: populate cache
		const req1: any = { url: 'http://localhost/api/site-health/axe-core?siteName=brianwhaley' };
		const res1: any = await GET(req1 as any);
		expect(res1.headers.get('x-axe-use-cache')).toBe('true');
		// ensure the mocked performAxeCoreAnalysis was actually invoked on cache population
		expect(performSpy).toHaveBeenCalled();

		// Second call: ask for purge
		const req2: any = { url: 'http://localhost/api/site-health/axe-core?siteName=brianwhaley&purge=true' };
		const res2: any = await GET(req2 as any);

		const purgedHeader = res2.headers.get('x-axe-purged');
		expect(purgedHeader).toBeTruthy();
		expect(purgedHeader).toContain('brianwhaley:https://www.brianwhaley.com');
		expect(consoleInfoSpy).toHaveBeenCalled();
	});
});
