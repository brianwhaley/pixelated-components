import { NextRequest, NextResponse } from 'next/server';
import { analyzeSecurityHealth, RouteCache } from '@pixelated-tech/components/adminserver';
import { getSiteConfig } from '@pixelated-tech/components/server';

// Cache for security/dependency data (1 hour)
const securityCache = new RouteCache();

export async function GET(request: NextRequest) {
	const { searchParams } = new URL(request.url);
	const siteName = searchParams.get('siteName');
	const cacheParam = searchParams.get('cache');
	const useCache = cacheParam !== 'false'; // Default to true, only false when explicitly set

	if (!siteName) {
		return NextResponse.json({ success: false, error: 'siteName required' }, { status: 400 });
	}

	// Check cache first if caching is enabled
	if (useCache) {
		const cacheKey = `security-${siteName}`;
		const cached = securityCache.get(cacheKey);
		if (cached) {
			return NextResponse.json(cached);
		}
	}

	try {
		// Find the requested site
		const site = await getSiteConfig(siteName);

		if (!site?.localPath) {
			const noConfigResponseData = {
				success: true,
				status: 'Unknown',
				message: 'No local path configured for dependency scanning',
				timestamp: new Date().toISOString(),
				vulnerabilities: [],
				summary: { info: 0, low: 0, moderate: 0, high: 0, critical: 0, total: 0 }
			};

			// Cache the result if caching is enabled
			if (useCache) {
				const cacheKey = `security-${siteName}`;
				securityCache.set(cacheKey, noConfigResponseData);
			}

			return NextResponse.json(noConfigResponseData);
		}

		const result = await analyzeSecurityHealth(site.localPath);

		if (result.status === 'error') {
			return NextResponse.json({
				success: false,
				error: result.error,
				timestamp: new Date().toISOString()
			}, { status: 500 });
		}

		const responseData = {
			success: true,
			...result.data,
			timestamp: new Date().toISOString(),
			url: site.url
		};

		// Cache the result if caching is enabled
		if (useCache) {
			const cacheKey = `security-${siteName}`;
			securityCache.set(cacheKey, responseData);
		}

		return NextResponse.json(responseData);

	} catch (error) {
		console.error('Error running security scan:', error);

		const errorResponseData = {
			success: false,
			error: 'Failed to run dependency security scan',
			details: error instanceof Error ? error.message : 'Unknown error',
			timestamp: new Date().toISOString()
		};

		// Cache error responses too if caching is enabled
		if (useCache) {
			const cacheKey = `security-${siteName}`;
			securityCache.set(cacheKey, errorResponseData);
		}

		return NextResponse.json(errorResponseData, { status: 500 });
	}
}