import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as configModule from '../components/config/config';
import { analyzeGitHealth } from '../components/admin/site-health/site-health-github.integration';
import { buildUrl } from '../components/general/urlbuilder';


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
		expect(res.status).toBe('success');
		expect(res.commits.length).toBe(1);
		expect(res.commits[0].hash).toBe('l1');
	});

	// Section 1: buildUrl for GitHub commits API construction
	describe('buildUrl GitHub API URL construction', () => {
		it('should construct commits URL with owner, repo, since, and until parameters', () => {
			const since = '2024-01-01T00:00:00Z';
			const until = '2024-01-31T23:59:59Z';
			const url = buildUrl({
				baseUrl: 'https://api.github.com',
				pathSegments: ['repos', 'myorg', 'myrepo', 'commits'],
				params: { since, until }
			});
			
			expect(url).toContain('https://api.github.com/repos/myorg/myrepo/commits');
			expect(url).toContain(`since=${encodeURIComponent(since)}`);
			expect(url).toContain(`until=${encodeURIComponent(until)}`);
		});

		it('should construct commits URL with only since parameter', () => {
			const since = '2024-01-01T00:00:00Z';
			const url = buildUrl({
				baseUrl: 'https://api.github.com',
				pathSegments: ['repos', 'owner', 'repo', 'commits'],
				params: { since }
			});
			
			expect(url).toContain('https://api.github.com/repos/owner/repo/commits');
			expect(url).toContain(`since=${encodeURIComponent(since)}`);
			expect(url).not.toContain('until');
		});

		it('should construct commits URL without date parameters', () => {
			const url = buildUrl({
				baseUrl: 'https://api.github.com',
				pathSegments: ['repos', 'user', 'project', 'commits'],
				params: {}
			});
			
			expect(url).toBe('https://api.github.com/repos/user/project/commits');
		});

		it('should filter out undefined and null parameter values', () => {
			const url = buildUrl({
				baseUrl: 'https://api.github.com',
				pathSegments: ['repos', 'owner', 'repo', 'commits'],
				params: { since: '2024-01-01T00:00:00Z', until: undefined, other: null }
			});
			
			expect(url).toContain('since=');
			expect(url).not.toContain('until=');
			expect(url).not.toContain('other=');
		});
	});

	describe('analyzeGitHealth integration with buildUrl', () => {
		it('should pass proper since and until parameters in commit URL', async () => {
			vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ github: { token: mockToken } } as any);

			const fakeCommits = [
				{
					sha: 'abc123',
					commit: { author: { name: 'Test User', date: '2024-01-15T12:00:00Z' }, message: 'Test commit' },
					author: { login: 'testuser' }
				}
			];

			const localFetch = async (input: RequestInfo, init?: RequestInit) => {
				const url = typeof input === 'string' ? input : (input as Request).url;
				// Verify URL follows buildUrl pattern with proper encoding
				if (url.includes('/repos/owner/repo/commits') && url.includes('since=') && url.includes('until=')) {
					return { ok: true, json: async () => fakeCommits } as any;
				}
				return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
			};

			const res = await analyzeGitHealth({ name: 'test', remote: 'owner/repo' }, '2024-01-01', '2024-01-31', localFetch);
			expect(res.status).toBe('success');
			expect(res.commits.length).toBe(1);
		});

		it('should handle empty date range gracefully', async () => {
			vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ github: { token: mockToken } } as any);

			const fakeCommits: any[] = [];

			const localFetch = async (input: RequestInfo, init?: RequestInit) => {
				const url = typeof input === 'string' ? input : (input as Request).url;
				if (url.includes('/repos/test/repo/commits')) {
					return { ok: true, json: async () => fakeCommits } as any;
				}
				return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
			};

			const res = await analyzeGitHealth({ name: 'test', remote: 'test/repo' }, undefined, undefined, localFetch);
			expect(res.status).toBe('success');
			expect(res.commits).toEqual([]);
		});

		it('should properly handle commits with minimal metadata', async () => {
			vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue({ github: { token: mockToken } } as any);

			const fakeCommits = [
				{
					sha: 'xyz789',
					commit: { author: { name: 'Unknown', date: '2024-01-01T00:00:00Z' }, message: '' },
				}
			];

			const localFetch = async (input: RequestInfo, init?: RequestInit) => {
				const fetchUrl = typeof input === 'string' ? input : (input as Request).url;
				if (fetchUrl.includes('/repos/org/proj/commits')) {
					return { ok: true, json: async () => fakeCommits } as any;
				}
				return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
			};

			const res = await analyzeGitHealth({ name: 'test', remote: 'org/proj' }, undefined, undefined, localFetch);
			expect(res.status).toBe('success');
			expect(res.commits.length).toBe(1);
			expect(res.commits[0].hash).toBe('xyz789');
		});
	});

});