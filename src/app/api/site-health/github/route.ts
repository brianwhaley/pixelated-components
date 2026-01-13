import { NextRequest, NextResponse } from 'next/server';
import { analyzeGitHealth } from '@pixelated-tech/components/adminserver';
import fs from 'fs';
import path from 'path';

// Temporary debug flag for manual local debugging
const debug = true;

interface Site {
  name: string;
  localPath: string;
  url: string;
}

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const siteName = searchParams.get('siteName');
		const startDate = searchParams.get('startDate') || undefined;
		const endDate = searchParams.get('endDate') || undefined;

		if (!siteName) {
			return NextResponse.json({ success: false, error: 'siteName required' }, { status: 400 });
		}

		// Load sites configuration
		const sitesPath = path.join(process.cwd(), 'src/app/data/sites.json');
		const sites: Site[] = JSON.parse(fs.readFileSync(sitesPath, 'utf-8'));
		const site = sites.find(s => s.name === siteName);

		if (!site) {
			return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
		}

		if (debug) console.info('GitHub API request', { siteName, startDate, endDate });
		const result = await analyzeGitHealth(site, startDate, endDate);
		if (debug) console.info('GitHub API result counts:', { commits: result.commits.length });

		return NextResponse.json({
			success: true,
			...result
		});

	} catch (error) {
		console.error('GitHub analysis failed:', error);
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : 'Analysis failed'
		}, { status: 500 });
	}
}