import { NextRequest, NextResponse } from 'next/server';
import { getCloudwatchHealthCheckData, CloudwatchHealthCheckConfig } from '@pixelated-tech/components/adminserver';
import { getSiteConfig } from '@pixelated-tech/components/server';

// Cache for cloudwatch data (15 minutes)
const cloudwatchCache = new Map();

export async function GET(request: NextRequest) {
	try {
		const { searchParams } = new URL(request.url);
		const siteName = searchParams.get('siteName');
		const startDate = searchParams.get('startDate');
		const endDate = searchParams.get('endDate');
		const useCache = searchParams.get('cache') !== 'false';

		if (!siteName) {
			return NextResponse.json({ success: false, error: 'siteName required' }, { status: 400 });
		}

		// Check cache first if caching is enabled
		const cacheKey = `cloudwatch-${siteName}-${startDate || 'default'}-${endDate || 'default'}`;
		if (useCache) {
			const cached = cloudwatchCache.get(cacheKey);
			if (cached && (Date.now() - cached.timestamp) < 15 * 60 * 1000) { // 15 minutes
				return NextResponse.json(cached.data);
			}
		}

		// Find the requested site
		const site = await getSiteConfig(siteName);

		if (!site?.healthCheckId) {
			const noConfigResponseData = {
				success: false,
				error: 'Health Check ID not configured for this site',
				timestamp: new Date().toISOString()
			};

			// Cache the result if caching is enabled
			if (useCache) {
				cloudwatchCache.set(cacheKey, {
					data: noConfigResponseData,
					timestamp: Date.now()
				});
			}

			return NextResponse.json(noConfigResponseData);
		}

		const config: CloudwatchHealthCheckConfig = {
			healthCheckId: site.healthCheckId,
			region: site.region || 'us-east-1'
		};

		const result = await getCloudwatchHealthCheckData(config, siteName, startDate ?? undefined, endDate ?? undefined);

		// Cache the result if caching is enabled
		if (useCache) {
			cloudwatchCache.set(cacheKey, {
				data: result,
				timestamp: Date.now()
			});
		}

		return NextResponse.json(result);

	} catch (error) {
		console.error('CloudWatch analysis failed:', error);
		const errorResponse = {
			success: false,
			error: error instanceof Error ? error.message : 'Analysis failed',
			timestamp: new Date().toISOString()
		};

		return NextResponse.json(errorResponse, { status: 500 });
	}
}