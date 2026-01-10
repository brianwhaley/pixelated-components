import { NextRequest, NextResponse } from 'next/server';
import { getSiteConfig } from '@pixelated-tech/components/server';
import { executeDeployment } from '@pixelated-tech/components/adminserver';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

interface SiteConfig {
  name: string;
  localPath: string;
  remote: string;
}

export const maxDuration = 900; // 15 minutes maximum execution time

export async function POST(request: NextRequest) {
	const { site, environments, versionType, commitMessage } = await request.json();

	// Only allow local execution for security
	const host = request.headers.get('host') || '';
	if (!host.includes('localhost') && !host.includes('127.0.0.1')) {
		return NextResponse.json({ error: 'Deployment execution is only allowed when running locally' }, { status: 403 });
	}

	if (!site || !environments || !versionType || !commitMessage) {
		return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
	}

	// Set a longer timeout for deployment operations
	request.signal?.addEventListener('abort', () => {
		console.log('Deployment request aborted');
	});

	const sitesPath = path.join(__dirname, '../../data/sites.json');
	const siteConfig = await getSiteConfig(site, sitesPath);
	if (!siteConfig) {
		return NextResponse.json({ error: `Site '${site}' not found in configuration` }, { status: 404 });
	}

	try {
		const result = await executeDeployment(
			{ site, environments, versionType, commitMessage },
      siteConfig as SiteConfig,
      true // isLocalExecution
		);
		return NextResponse.json({ message: 'Deployment results', ...result });
	} catch (error) {
		console.error('Deployment error:', error);
		return NextResponse.json({ error: `Deployment failed: ${(error as Error).message}` }, { status: 500 });
	}
}