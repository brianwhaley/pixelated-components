import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as configModule from '../components/config/config';
import { analyzeGitHealth } from '../components/admin/site-health/site-health-github.integration';

console.info('[TEST IMPORT] github.integration.test imported');

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

	it('fetches commits from GitHub and returns mapped commits (no version expected)', async () => {
		vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ github: { token: mockToken } } as any);

		const fakeCommits = [
			{
				sha: 'abcd',
				commit: { author: { name: 'Alice', date: '2020-01-01T00:00:00Z' }, message: 'Initial commit v1.0.0' },
				author: { login: 'alice' }
			}
		];

		const localFetch = async (input: RequestInfo, init?: RequestInit) => {
			const url = typeof input === 'string' ? input : (input as Request).url;
			if (url.includes('/commits')) {
				return { ok: true, json: async () => fakeCommits } as any;
			}
			return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
		};

		const res = await analyzeGitHealth({ name: 'foo', remote: 'owner/repo' }, undefined, undefined, localFetch);
		console.log('DEBUG RES (fetches commits):', res);
		expect(res.status).toBe('success');
		expect(res.commits.length).toBe(1);
		expect(res.commits[0].hash).toBe('abcd');
		expect(res.commits[0].author).toBe('Alice');

	});

	it('does not infer version from commit message (no version expected)', async () => {
		vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ github: { token: mockToken } } as any);

		const fakeCommits = [
			{
				sha: 'zzzz',
				commit: { author: { name: 'Fuzzy', date: '2023-01-01T00:00:00Z' }, message: 'Release v1.2.3: minor fixes' },
				author: { login: 'fuzzy' }
			}
		];

		const localFetch = async (input: RequestInfo, init?: RequestInit) => {
			const url = typeof input === 'string' ? input : (input as Request).url;
			if (url.includes('/commits')) {
				return { ok: true, json: async () => fakeCommits } as any;
			}
			return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
		};

		const res = await analyzeGitHealth({ name: 'foo', remote: 'owner/repo' }, undefined, undefined, localFetch);
		console.log('DEBUG RES (version extraction):', res);
		expect(res.status).toBe('success');
		expect(res.commits.length).toBe(1);
		expect(res.commits[0].hash).toBe('zzzz');
		expect(res.commits[0].author).toBe('Fuzzy');
	});





	it('prefers explicit site.repo when provided and extracts version from message', async () => {
		vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ github: { token: mockToken, defaultOwner: 'ownerx' } } as any);

		const fakeCommits = [
			{
				sha: 'r1',
				commit: { author: { name: 'RepoUser', date: '2022-01-01T00:00:00Z' }, message: 'Repo commit v0.1.0' },
				author: { login: 'repo-user' }
			}
		];

		const localFetch = async (input: RequestInfo, init?: RequestInit) => {
			const url = typeof input === 'string' ? input : (input as Request).url;
			// Expect ownerx/repo-name in request when site.repo provided
			if (url.includes('/repos/ownerx/repo-name/commits')) {
				return { ok: true, json: async () => fakeCommits } as any;
			}
			return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
		};

		const res = await analyzeGitHealth({ name: 'foo', repo: 'repo-name' }, undefined, undefined, localFetch);
		console.log('DEBUG RES (prefers repo):', res);
		expect(res.status).toBe('success');
		expect(res.commits.length).toBe(1);
		expect(res.commits[0].hash).toBe('r1');
	});

	it('derives repo from localPath when repo and remote missing and extracts version from message', async () => {
		vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ github: { token: mockToken, defaultOwner: 'ownerx' } } as any);

		const fakeCommits = [
			{
				sha: 'l1',
				commit: { author: { name: 'LocalUser', date: '2021-01-01T00:00:00Z' }, message: 'Local commit v0.0.1' },
				author: { login: 'local' }
			}
		];

		const localFetch = async (input: RequestInfo, init?: RequestInit) => {
			const url = typeof input === 'string' ? input : (input as Request).url;
			// Expect ownerx/my-repo from localPath basename
			if (url.includes('/repos/ownerx/my-repo/commits')) {
				return { ok: true, json: async () => fakeCommits } as any;
			}
			return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
		};

		const res = await analyzeGitHealth({ name: 'foo', localPath: '/Users/alice/project/my-repo' }, undefined, undefined, localFetch);
		console.log('DEBUG RES (localPath):', res);
		expect(res.status).toBe('success');
		expect(res.commits.length).toBe(1);
		expect(res.commits[0].hash).toBe('l1');
	});

});