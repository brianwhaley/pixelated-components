import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { performAxeCoreAnalysis, AxeCoreData } from '@pixelated-tech/components/adminserver';

const debug = false;

// Simple in-memory cache for axe-core results
interface CacheEntry {
  data: AxeCoreData;
  timestamp: number;
}

interface Site {
  name: string;
  localPath?: string;
  remote?: string;
  healthCheckId?: string;
  url?: string;
}

const axeCache = new Map<string, CacheEntry>();
const CACHE_TTL_SUCCESS = 60 * 60 * 1000; // 1 hour for successful results
const CACHE_TTL_ERROR = 5 * 60 * 1000; // 5 minutes for error results

// Clean up expired cache entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of axeCache.entries()) {
		const ttl = entry.data.status === 'success' ? CACHE_TTL_SUCCESS : CACHE_TTL_ERROR;
		if (now - entry.timestamp > ttl) {
			axeCache.delete(key);
		}
	}
}, 10 * 60 * 1000); // Clean up every 10 minutes



export async function GET(request: NextRequest) {
	try {
		// Read sites configuration
		const sitesPath = path.join(process.cwd(), 'src/app/data/sites.json');
		const sitesData = await fs.readFile(sitesPath, 'utf-8');
		const sites: Site[] = JSON.parse(sitesData);

		// Check if a specific site was requested
		const { searchParams } = new URL(request.url);
		const requestedSiteName = searchParams.get('siteName');
		const cacheParam = searchParams.get('cache');
		const purgeParam = searchParams.get('purge');
		const useCache = String(cacheParam).toLowerCase() !== 'false'; // Default to true, only false when explicitly set (case-insensitive)
		const doPurge = String(purgeParam).toLowerCase() === 'true';

		if (!requestedSiteName) {
			return NextResponse.json({ success: false, error: 'siteName required' }, { status: 400 });
		}

		// Filter sites if a specific site was requested - only sites with URLs are processed
		const sitesToProcess = sites.filter(site => site.name === requestedSiteName && site.url);

		const results: AxeCoreData[] = [];
		let respondedFromCache = false; // diagnostic flag
		const purgedKeys: string[] = [];

		// Process sites sequentially to avoid overwhelming the system
		for (const site of sitesToProcess) {
			try {
				// Use the URL from the site configuration
				const url = site.url!;

				// Check cache first if caching is enabled
				const cacheKey = `${site.name}:${url}`;
				if (doPurge) {
					const existed = axeCache.delete(cacheKey);
					console.info(`Axe cache purge requested for site="${site.name}", cacheKey="${cacheKey}", purge=true, existed=${existed}`);
					// collect purged keys for diagnostic header later
					if (existed) {
						purgedKeys.push(cacheKey);
					}
				}
				if (!useCache) {
					// Cache disabled by client
				} else {
					const cached = axeCache.get(cacheKey);
					if (cached) {
						const ttl = cached.data.status === 'success' ? CACHE_TTL_SUCCESS : CACHE_TTL_ERROR;
						if ((Date.now() - cached.timestamp) < ttl) {
							respondedFromCache = true;
							// Return cached result as-is
							results.push(cached.data);
							continue;
						}
						// expired: remove it
						axeCache.delete(cacheKey);
					}
				}

				// Run axe-core analysis
				const result = await performAxeCoreAnalysis(url);
				result.site = site.name;

				// Cache the result if caching is enabled
				if (useCache) {
					axeCache.set(cacheKey, { data: result, timestamp: Date.now() });
				}
				results.push(result);

			} catch (error) {
				if (debug) console.error(`Axe-core analysis failed for ${site.name}:`, error);

				// Attempt to produce an error result object for consistency
				const errorResult = await performAxeCoreAnalysis(site.url!);
				errorResult.site = site.name;

				// Cache error result with shorter TTL if caching is enabled
				if (useCache) {
					const cacheKey = `${site.name}:${site.url}`;
					axeCache.set(cacheKey, { data: errorResult, timestamp: Date.now() });
				}
				results.push(errorResult);
			}
		}

		// Include diagnostic headers so clients can see whether a cached value was returned and whether caching was honored
		const headers = new Headers();
		headers.set('x-axe-cache-hit', respondedFromCache ? '1' : '0');
		headers.set('x-axe-use-cache', String(useCache));
		if (purgedKeys.length) {
			headers.set('x-axe-purged', purgedKeys.join(','));
		}
		return NextResponse.json({
			success: true,
			data: results,
		}, { headers });

	} catch (error) {
		if (debug) console.error('Axe-core API error:', error);
		return NextResponse.json({
			success: false,
			error: error instanceof Error ? error.message : 'Unknown error',
		}, { status: 500 });
	}
}

