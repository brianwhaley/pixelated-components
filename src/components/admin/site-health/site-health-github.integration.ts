"use server";

import { getFullPixelatedConfig } from '../../config/config';
import path from 'path';
// Version extraction: we derive a version from commit messages (e.g., v1.2.3) instead of fetching tags and fuzzy-matching.

// Debug logging is off by default. Set to true/false here (do not use env vars).
const debug = false;

// Version extraction removed: we no longer infer versions from commit messages.


export interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author: string;
}

export interface GitHealthResult {
  commits: GitCommit[];
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

export interface SiteConfig {
  name: string;
  /** Optional: explicit repository identifier (e.g., "owner/repo" or just "repo") */
  repo?: string;
  /** Optional: remote name (legacy) */
  remote?: string;
  /** Optional explicit repo owner */
  owner?: string;
  /** Optional local path used to derive repo name if needed */
  localPath?: string;
} 

/**
 * Analyze git repository health for a site using the GitHub REST API.
 * Expects a GitHub token to be present in the master config under `github.token`.
 */
export async function analyzeGitHealth(siteConfig: SiteConfig, startDate?: string, endDate?: string, httpFetch?: (input: RequestInfo, init?: RequestInit) => Promise<any>): Promise<GitHealthResult> {
	try {
		const cfg = getFullPixelatedConfig();
		const token = cfg?.github?.token;
		const defaultOwner = cfg?.github?.defaultOwner;

		if (!token) {
			throw new Error('GitHub token not configured in pixelated.config.json under "github.token"');
		}

		// Determine owner and repo
		let owner: string | undefined;
		let repo: string | undefined;

		// Priority: explicit `repo` field (supports "owner/repo" or just "repo"), then remote (if owner/repo),
		// then remote/name fallback, then derive from localPath basename.
		if (siteConfig.repo) {
			if (siteConfig.repo.includes('/')) {
				[owner, repo] = siteConfig.repo.split('/', 2);
			} else {
				repo = siteConfig.repo;
				owner = siteConfig.owner || defaultOwner;
			}
		} else if (siteConfig.remote && siteConfig.remote.includes('/')) {
			[owner, repo] = siteConfig.remote.split('/', 2);
		} else {
			repo = siteConfig.remote || (siteConfig.localPath ? path.basename(siteConfig.localPath) : siteConfig.name);
			owner = siteConfig.owner || defaultOwner;
			if (!repo || !owner) {
				throw new Error('Repository owner or name not provided. Set site.remote to "owner/repo" or configure github.defaultOwner in pixelated.config.json');
			}
		}

		// Build query params
		let since: string | undefined;
		let until: string | undefined;
		if (startDate) since = new Date(startDate).toISOString();
		if (endDate) {
			// include full end day by adding one day and using until
			const d = new Date(endDate);
			d.setDate(d.getDate() + 1);
			until = d.toISOString();
		}

		// Default to last 30 days if not specified
		if (!since && !until) {
			const end = new Date();
			const start = new Date(end.getTime() - (30 * 24 * 60 * 60 * 1000));
			since = start.toISOString();
			until = end.toISOString();
		}

		const headers: Record<string, string> = {
			'Accept': 'application/vnd.github+json',
			'Authorization': `token ${token}`
		};

		const params = new URLSearchParams();
		if (since) params.set('since', since);
		if (until) params.set('until', until);

		const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`;
		const fetcher = httpFetch || (globalThis as any).fetch;
		const commitsRes = await fetcher(commitsUrl, { headers });

		if (!commitsRes.ok) {
			const text = await commitsRes.text().catch(() => '');
			throw new Error(`GitHub API returned ${commitsRes.status}: ${commitsRes.statusText} ${text}`);
		}

		const commitsJson = await commitsRes.json();

		if (debug) {
			const totalCommits = Array.isArray(commitsJson) ? commitsJson.length : 0;
			console.info(`Commits fetched: ${totalCommits}`);
		}





		const commits: GitCommit[] = (Array.isArray(commitsJson) ? commitsJson : [])
			.map((c: any) => {
				const sha = c.sha;
				const commitObj = c.commit || {};
				const author = (commitObj.author && commitObj.author.name) || (c.author && c.author.login) || 'unknown';
				const date = (commitObj.author && commitObj.author.date) || new Date().toISOString();
				const message = commitObj.message || '';

				return {
					hash: sha,
					date,
					message,
					author,
				} as GitCommit;
			})
			.filter(Boolean);

		return {
			commits,
			timestamp: new Date().toISOString(),
			status: 'success'
		};

	} catch (error) {
		return {
			commits: [],
			timestamp: new Date().toISOString(),
			status: 'error',
			error: error instanceof Error ? `${error.message}${error.stack ? '\n' + error.stack : ''}` : String(error)
		};
	}
}
