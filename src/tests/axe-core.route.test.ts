import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { GET } from '@/app/api/site-health/axe-core/route';
import * as integrationModule from '@pixelated-tech/components/adminserver';

// Note: Using a simple object for the NextRequest (only url is read in the handler).

describe('axe-core route purge behavior', () => {
	let performSpy: any;

	beforeEach(async () => {
		// Ensure cache is cleared between tests and provide a predictable minimal success result so route will cache it
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

		// Purge any previous cached entries for this site so tests run deterministically
		const purgeReq: any = { url: 'http://localhost/api/site-health/axe-core?siteName=brianwhaley&purge=true&purgeOnly=true' };
		await GET(purgeReq as any);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	it('passes runtime_env local when origin is localhost', async () => {
		const req: any = { url: 'http://localhost/api/site-health/axe-core?siteName=brianwhaley' };
		await GET(req as any);
		expect(performSpy).toHaveBeenCalled();
		// check second argument passed to performAxeCoreAnalysis was 'local' (check last call)
		const calledWith = performSpy.mock.calls[performSpy.mock.calls.length - 1];
		expect(calledWith[1]).toBe('local');
	});

	it('passes runtime_env prod when origin is a production host', async () => {
		const req: any = { url: 'https://example.com/api/site-health/axe-core?siteName=brianwhaley' };
		await GET(req as any);
		expect(performSpy).toHaveBeenCalled();
		const calledWith = performSpy.mock.calls[performSpy.mock.calls.length - 1];
		expect(calledWith[1]).toBe('prod');
	});
});
