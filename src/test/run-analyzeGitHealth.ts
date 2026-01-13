import fs from 'fs';
import path from 'path';
import { getFullPixelatedConfig } from '../components/config/config';
import { analyzeGitHealth } from '../components/admin/site-health/site-health-github.integration';

// Usage:
// 1) With a siteName: `tsx src/tests/harness/run-analyzeGitHealth.ts <siteName> [startDate] [endDate]`
//    - Uses sites.json to find site and performs real GitHub fetches (requires token in pixelated.config.json)
// 2) Without args: runs a quick stubbed run that can reproduce pagination behavior locally

async function runWithSite(siteName: string, startDate?: string, endDate?: string) {
	const cfg = getFullPixelatedConfig();
	const token = cfg?.github?.token;
	if (!token) {
		console.error('No github token available in config. Add github.token to pixelated.config.json or run without args to do a stub run.');
		process.exit(1);
	}

	const sitesPath = path.join(process.cwd(), 'src', 'app', 'data', 'sites.json');
	const sitesData = fs.readFileSync(sitesPath, 'utf8');
	const sites = JSON.parse(sitesData);
	const site = sites.find((s: any) => s.name === siteName);
	if (!site) {
		console.error('Site not found in sites.json');
		process.exit(1);
	}

	// Use real fetch for this run
	const res = await analyzeGitHealth(site, startDate, endDate);
	console.log('Result:', JSON.stringify(res, null, 2));
}

async function runStubbed() {
	// Provide a global fetch that simulates commits only (no tag pagination)
	(globalThis as any).fetch = async (input: RequestInfo, init?: RequestInit) => {
		const url = typeof input === 'string' ? input : (input as Request).url;
		if (url.includes('/commits')) return { ok: true, json: async () => [] } as any;
		return { ok: false, status: 404, statusText: 'Not Found', text: async () => 'not found' } as any;
	};

	const res = await analyzeGitHealth({ name: 'foo', remote: 'owner/repo' });
	console.log('Result (stubbed):', JSON.stringify(res, null, 2));
}

(async () => {
	const [,, siteName, startDate, endDate] = process.argv;
	if (siteName) {
		await runWithSite(siteName, startDate, endDate);
	} else {
		await runStubbed();
	}
})().catch(err => {
	console.error('Error running analyze:', err);
	process.exit(1);
});
