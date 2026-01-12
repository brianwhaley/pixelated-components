"use server";

import { getFullPixelatedConfig } from '../../config/config';

export interface GitCommit {
  hash: string;
  date: string;
  message: string;
  author: string;
  version?: string;
}

export interface GitHealthResult {
  commits: GitCommit[];
  timestamp: string;
  status: 'success' | 'error';
  error?: string;
}

export interface SiteConfig {
  name: string;
  /** Optional: repo name or owner/repo */
  remote?: string;
  /** Optional explicit repo owner */
  owner?: string;
}

/**
 * Analyze git repository health for a site using the GitHub REST API.
 * Expects a GitHub token to be present in the master config under `github.token`.
 */
export async function analyzeGitHealth(siteConfig: SiteConfig, startDate?: string, endDate?: string): Promise<GitHealthResult> {
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

		if (siteConfig.remote && siteConfig.remote.includes('/')) {
			[owner, repo] = siteConfig.remote.split('/', 2);
		} else {
			repo = siteConfig.remote || siteConfig.name;
			owner = siteConfig.owner || defaultOwner;
		}

		if (!owner || !repo) {
			throw new Error('Repository owner or name not provided. Set site.remote to "owner/repo" or configure github.defaultOwner in pixelated.config.json');
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
		params.set('per_page', '100');

		const commitsUrl = `https://api.github.com/repos/${owner}/${repo}/commits?${params.toString()}`;
		const commitsRes = await fetch(commitsUrl, { headers });

		if (!commitsRes.ok) {
			const text = await commitsRes.text().catch(() => '');
			throw new Error(`GitHub API returned ${commitsRes.status}: ${commitsRes.statusText} ${text}`);
		}

		const commitsJson = await commitsRes.json();

		// Fetch tags to try to match commit -> tag (best-effort, only exact matches)
		const tagsUrl = `https://api.github.com/repos/${owner}/${repo}/tags?per_page=100`;
		const tagsRes = await fetch(tagsUrl, { headers });
		let tagMap = new Map<string, string>();
		if (tagsRes.ok) {
			const tags = await tagsRes.json().catch(() => []);
			for (const t of tags || []) {
				if (t && t.commit && t.commit.sha && t.name) {
					tagMap.set(t.commit.sha, t.name);
				}
			}
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
					version: tagMap.get(sha) // may be undefined
				} as GitCommit;
			})
			.filter(Boolean)
		// Filter out trivial version-only commits if necessary
			.filter(commit => !/^\d+\.\d+\.\d+$/.test(commit.message.trim()))
			.slice(0, (startDate && endDate) ? 100 : 20);

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
			error: error instanceof Error ? error.message : String(error)
		};
	}
}
