import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getSearchConsoleData, SearchConsoleConfig } from '@pixelated-tech/components/adminserver';
import { getFullPixelatedConfig } from '@pixelated-tech/components/server';

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const siteName = searchParams.get('siteName');
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');

		if (!siteName) {
			return NextResponse.json({ success: false, error: 'siteName required' }, { status: 400 });
		}

		// Load sites configuration
		const sitesPath = path.join(process.cwd(), 'src/app/data/sites.json');
		const sitesData = JSON.parse(fs.readFileSync(sitesPath, 'utf8'));
		const site = sitesData.find((s: any) => s.name === siteName);

		if (!site) {
			return NextResponse.json({ success: false, error: 'Site not found' }, { status: 404 });
		}

		// Build Search Console config from unified pixelated.config.json (no env fallback)
		const fullConfig = getFullPixelatedConfig();
		const googleCfg = (fullConfig.google || {}) as any;
		const gscCfg = (fullConfig.googleSearchConsole || {}) as any;

		const config: SearchConsoleConfig = {
			siteUrl: site.gscSiteUrl,
			serviceAccountKey: (gscCfg as any).serviceAccountKey || (googleCfg as any).serviceAccountKey,
			clientId: googleCfg.client_id,
			clientSecret: googleCfg.client_secret,
			refreshToken: googleCfg.refresh_token,
		};

		if (!config.serviceAccountKey && !(config.clientId && config.clientSecret && config.refreshToken)) {
			return NextResponse.json({ success: false, error: 'Google credentials not configured in pixelated.config.json' }, { status: 500 });
		}

		// Call the integration
		const result = await getSearchConsoleData(config, siteName, startDate || undefined, endDate || undefined);

		if (!result.success) {
			return NextResponse.json({ success: false, error: result.error }, { status: 500 });
		}

		return NextResponse.json({ success: true, data: result.data });

	} catch (error) {
		console.error('Google Search Console API error:', error);
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : 'Failed to fetch search console data'
		}, { status: 500 });
	}
}