import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { getGoogleAnalyticsData, GoogleAnalyticsConfig } from '@pixelated-tech/components/adminserver';

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

    // Build Google Analytics config from site data and environment variables
    const config: GoogleAnalyticsConfig = {
      ga4PropertyId: site.ga4PropertyId,
      serviceAccountKey: process.env.GOOGLE_SERVICE_ACCOUNT_KEY,
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      refreshToken: process.env.GOOGLE_REFRESH_TOKEN,
    };

    // Call the integration
    const result = await getGoogleAnalyticsData(config, siteName, startDate || undefined, endDate || undefined);

    if (!result.success) {
      return NextResponse.json({ success: false, error: result.error }, { status: 500 });
    }

    return NextResponse.json({ success: true, data: result.data });

  } catch (error) {
    console.error('Google Analytics API error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch analytics data'
    }, { status: 500 });
  }
}