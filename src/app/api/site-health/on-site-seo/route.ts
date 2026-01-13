import { NextRequest, NextResponse } from 'next/server';
import { performOnSiteSEOAnalysis, RouteCache } from '@pixelated-tech/components/adminserver';
import { getSiteConfig } from '@pixelated-tech/components/server';
import { createErrorResponse } from '../../../lib/route-utils';

// Cache for on-site SEO data (1 hour)
const onSiteSEOCache = new RouteCache();

export async function GET(request: NextRequest) {
	let requestedSiteName: string | null = null;

	try {
		// Check if a specific site was requested
		const { searchParams } = new URL(request.url);
		requestedSiteName = searchParams.get('siteName');
		const cacheParam = searchParams.get('cache');
		const useCache = cacheParam !== 'false'; // Default to true, only false when explicitly set

		if (!requestedSiteName) {
			return NextResponse.json({ success: false, error: 'siteName required' }, { status: 400 });
		}

		// Check cache first if caching is enabled
		if (useCache) {
			const cacheKey = `on-site-seo-${requestedSiteName}`;
			const cached = onSiteSEOCache.get(cacheKey);
			if (cached) {
				return NextResponse.json(cached);
			}
		}

		// Find the requested site
		const site = await getSiteConfig(requestedSiteName);

		if (!site || !site.url) {
			const noSiteResponseData = createErrorResponse(
				requestedSiteName,
				'Site not found or no URL configured'
			);

			// Cache the result if caching is enabled
			if (useCache) {
				const cacheKey = `on-site-seo-${requestedSiteName}`;
				onSiteSEOCache.set(cacheKey, noSiteResponseData);
			}

			return NextResponse.json(noSiteResponseData);
		}

		// Perform on-site SEO analysis using the integration
		console.debug(`[on-site-seo] Starting analysis for site ${site.url}`);
		const result = await performOnSiteSEOAnalysis(site.url);
		console.debug('[on-site-seo] Analysis result:', result);

		if (result.status === 'error') {
			console.warn(`[on-site-seo] Analysis error for ${requestedSiteName}:`, result.error);
			return NextResponse.json({
				success: false,
				error: result.error,
				timestamp: new Date().toISOString()
			}, { status: 500 });
		}

		// Fix the site field to use site name instead of URL
		const correctedResult = {
			...result,
			site: requestedSiteName
		};

		// Cache the result if caching is enabled
		if (useCache) {
			const cacheKey = `on-site-seo-${requestedSiteName}`;
			onSiteSEOCache.set(cacheKey, { success: true, data: correctedResult });
		}

		return NextResponse.json({ success: true, data: correctedResult });

	} catch (error) {
		console.error('Error performing on-site SEO analysis:', error);

		const errorResponseData = createErrorResponse(
			requestedSiteName || '',
			error instanceof Error ? error.message : 'Unknown error'
		);

		// Cache error responses too if caching is enabled
		const useCache = new URL(request.url).searchParams.get('cache') !== 'false';
		if (useCache && requestedSiteName) {
			const cacheKey = `on-site-seo-${requestedSiteName}`;
			onSiteSEOCache.set(cacheKey, errorResponseData);
		}

		return NextResponse.json(errorResponseData);
	}
}