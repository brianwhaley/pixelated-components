import { NextRequest, NextResponse } from 'next/server';
import { promises as fs } from 'fs';
import path from 'path';
import { AxeCoreData } from '@pixelated-tech/components/adminserver';
import * as integrationModule from '@pixelated-tech/components/adminserver';
import { getRuntimeEnvFromHeaders } from '@pixelated-tech/components/server';

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
		const purgeOnlyParam = searchParams.get('purgeOnly');
		const useCache = String(cacheParam).toLowerCase() !== 'false'; // Default to true, only false when explicitly set (case-insensitive)
		const doPurge = String(purgeParam).toLowerCase() === 'true';
		const purgeOnly = String(purgeOnlyParam).toLowerCase() === 'true';
		console.info('Axe-core request params:', { requestedSiteName, cacheParam, purgeParam, useCache, doPurge });
		if (!requestedSiteName) {
			return NextResponse.json({ success: false, error: 'siteName required' }, { status: 400 });
		}

		// Filter sites if a specific site was requested - only sites with URLs are processed
		const sitesToProcess = sites.filter(site => site.name === requestedSiteName && site.url);
		console.info('Axe-core route requestedSiteName=', requestedSiteName, 'sitesToProcess.length=', sitesToProcess.length);
		const results: AxeCoreData[] = [];
		let respondedFromCache = false; // diagnostic flag
		const purgedKeys: string[] = [];

		// Process sites sequentially to avoid overwhelming the system
		for (const site of sitesToProcess) {
			let runtime_env: 'auto' | 'local' | 'prod' = 'auto';
			try {			const url = site.url!;
				console.info('Axe-core processing site:', site.name, 'url:', url);
				// Check cache first if caching is enabled
				const cacheKey = `${site.name}:${url}`;
				if (doPurge) {
					const existed = axeCache.delete(cacheKey);
					console.info(`Axe cache purge requested for site="${site.name}", cacheKey="${cacheKey}", purge=true, existed=${existed}`);
					// collect purged keys for diagnostic header later
					if (existed) {
						purgedKeys.push(cacheKey);
					}
					// If caller requested purge-only, skip running the analysis this cycle
					if (purgeOnly) {
						continue;
					}
				}
				if (!useCache) {
					// Cache disabled by client
				} else {
					const cached = axeCache.get(cacheKey);
					console.info('Axe-core cache check:', { cacheKey, cachedExists: Boolean(cached) });
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

				// Run axe-core analysis (determine runtime_env before invoking so it's available to catch blocks)

				try {
					const fallbackOrigin = request.url ? new URL(request.url).origin : undefined;
					runtime_env = getRuntimeEnvFromHeaders(request.headers as any, fallbackOrigin);
					if (debug) console.info(`Axe-core route detected runtime_env=${runtime_env}`);
				} catch {
				// Fallback: derive from request.url when the central helper isn't available (e.g., mocked in tests)
					try {
						const fb = request.url ? new URL(request.url).origin : undefined;
						if (fb && (fb.includes('localhost') || fb.includes('127.0.0.1'))) {
							runtime_env = 'local';
						} else if (fb) {
							runtime_env = 'prod';
						} else {
							runtime_env = 'auto';
						}
					} catch {
						runtime_env = 'auto';
					}
				}

				// Run axe-core analysis
				const result = await integrationModule.performAxeCoreAnalysis(url, runtime_env);
				result.site = site.name;

				// Cache the result if caching is enabled
				if (useCache) {
					axeCache.set(cacheKey, { data: result, timestamp: Date.now() });
				}
				results.push(result);
			} catch (error) {
				if (debug) console.error(`Axe-core analysis failed for ${site.name}:`, error);

				// Attempt to produce an error result object for consistency
				const errorResult = await integrationModule.performAxeCoreAnalysis(site.url!, runtime_env);
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

