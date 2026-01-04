import { NextRequest, NextResponse } from 'next/server';
import { checkUptimeHealth, RouteCache } from '@pixelated-tech/components/adminserver';
import { getSiteConfig } from '@pixelated-tech/components/server';

// Cache for uptime data (1 hour)
const uptimeCache = new RouteCache();

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
    const cacheKey = `uptime-${siteName}`;
    const cached = uptimeCache.get(cacheKey);
    if (cached) {
      return NextResponse.json(cached);
    }
  }

  try {
    // Find the requested site
    const site = await getSiteConfig(siteName);

    if (!site?.healthCheckId) {
      const noConfigResponseData = {
        success: true,
        status: 'Unknown',
        message: 'No health check configured',
        timestamp: new Date().toISOString()
      };

      // Cache the result if caching is enabled
      if (useCache) {
        const cacheKey = `uptime-${siteName}`;
        uptimeCache.set(cacheKey, noConfigResponseData);
      }

      return NextResponse.json(noConfigResponseData);
    }

    const result = await checkUptimeHealth(site.healthCheckId);

    const responseData = {
      success: true,
      ...result.data,
      timestamp: new Date().toISOString(),
      url: site.url
    };

    // Cache the result if caching is enabled
    if (useCache) {
      const cacheKey = `uptime-${siteName}`;
      uptimeCache.set(cacheKey, responseData);
    }

    return NextResponse.json(responseData);

  } catch (error) {
    console.error('Uptime check failed:', error);

    const errorResponseData = {
      success: true,
      status: 'Unknown',
      message: 'Check failed',
      timestamp: new Date().toISOString()
    };

    // Cache error responses too if caching is enabled
    if (useCache) {
      const cacheKey = `uptime-${siteName}`;
      uptimeCache.set(cacheKey, errorResponseData);
    }

    return NextResponse.json(errorResponseData);
  }
}