import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as configModule from '../components/config/config';
import { analyzeGitHealth } from '../components/admin/site-health/site-health-github.integration';

const mockToken = 'test-token-123';

describe('analyzeGitHealth (GitHub)', () => {
	beforeEach(() => {
		vi.restoreAllMocks();
	});

	it('returns an error when github token is missing from config', async () => {
		vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({} as any);
		const res = await analyzeGitHealth({ name: 'foo', remote: 'owner/repo' });
		expect(res.status).toBe('error');
		expect(res.error).toMatch(/GitHub token not configured/);
	});

	it('fetches commits from GitHub and returns mapped commits', async () => {
		vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ github: { token: mockToken } } as any);

		const fakeCommits = [
			{
				sha: 'abcd',
				commit: { author: { name: 'Alice', date: '2020-01-01T00:00:00Z' }, message: 'Initial commit' },
				author: { login: 'alice' }
			}
		];

		const fakeTags = [
			{ name: 'v1.0.0', commit: { sha: 'abcd' } }
		];

		// Mock global fetch
		vi.stubGlobal('fetch', vi.fn(async (url: string) => {
			if (url.includes('/commits')) {
				return { ok: true, json: async () => fakeCommits } as any;
			}
			if (url.includes('/tags')) {
				return { ok: true, json: async () => fakeTags } as any;
			}
			return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
		}));

		const res = await analyzeGitHealth({ name: 'foo', remote: 'owner/repo' });
		expect(res.status).toBe('success');
		expect(res.commits.length).toBe(1);
		expect(res.commits[0].hash).toBe('abcd');
		expect(res.commits[0].author).toBe('Alice');
		expect(res.commits[0].version).toBe('v1.0.0');
	});
});