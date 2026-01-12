"use server";

const debug = true;

import { CoreWebVitalsData, PSIScores, PSICategory, PSIAudit } from './site-health-types';
import { getFullPixelatedConfig } from '../../config/config';


/**
 * Core Web Vitals Analysis Integration Services
 * Server-side utilities for performing comprehensive Core Web Vitals analysis using Google PageSpeed Insights
 * Note: This makes external HTTP requests and should only be used server-side
 */

interface PSIAuditRef {
  id: string;
}

// Simple in-memory cache for PSI results
interface CacheEntry {
  data: CoreWebVitalsData;
  timestamp: number;
}

const psiCache = new Map<string, CacheEntry>();
const CACHE_TTL_SUCCESS = 60 * 60 * 1000; // 1 hour for successful results
const CACHE_TTL_ERROR = 5 * 60 * 1000; // 5 minutes for error results

// Clean up expired cache entries periodically
setInterval(() => {
	const now = Date.now();
	for (const [key, entry] of psiCache.entries()) {
		const ttl = entry.data.status === 'success' ? CACHE_TTL_SUCCESS : CACHE_TTL_ERROR;
		if (now - entry.timestamp > ttl) {
			psiCache.delete(key);
		}
	}
}, 10 * 60 * 1000); // Clean up every 10 minutes

export async function performCoreWebVitalsAnalysis(
	url: string,
	siteName: string,
	useCache: boolean = true
): Promise<CoreWebVitalsData> {
	try {
		// Check cache first (if caching is enabled)
		const cacheKey = `${siteName}:${url}`;
		if (useCache) {
			const cached = psiCache.get(cacheKey);
			if (cached) {
				const ttl = cached.data.status === 'success' ? CACHE_TTL_SUCCESS : CACHE_TTL_ERROR;
				if ((Date.now() - cached.timestamp) < ttl) {
					return cached.data;
				}
			}
		}

		// Fetch PSI data
		const psiData = await fetchPSIData(url);

		// Process the PSI data
		const resultData = processPSIData(psiData, siteName, url);

		// Cache successful results (if caching is enabled)
		if (useCache) {
			psiCache.set(cacheKey, {
				data: resultData,
				timestamp: Date.now()
			});
		}

		return resultData;
	} catch (error) {
		console.warn(`PSI API failed for ${siteName}:`, error);

		// Return error status instead of mock data
		const errorResult: CoreWebVitalsData = {
			site: siteName,
			url: url,
			metrics: {
				cls: 0,
				fid: 0,
				lcp: 0,
				fcp: 0,
				ttfb: 0,
				speedIndex: 0,
				interactive: 0,
				totalBlockingTime: 0,
				firstMeaningfulPaint: 0,
			},
			scores: {
				performance: 0,
				accessibility: 0,
				'best-practices': 0,
				seo: 0,
				pwa: 0,
			},
			categories: {
				performance: { id: 'performance', title: 'Performance', score: null, audits: [] },
				accessibility: { id: 'accessibility', title: 'Accessibility', score: null, audits: [] },
				'best-practices': { id: 'best-practices', title: 'Best Practices', score: null, audits: [] },
				seo: { id: 'seo', title: 'SEO', score: null, audits: [] },
				pwa: { id: 'pwa', title: 'PWA', score: null, audits: [] },
			},
			timestamp: new Date().toISOString(),
			status: 'error',
			error: error instanceof Error ? error.message : 'PSI API failed',
		};

		// Cache error results with shorter TTL (5 minutes) (if caching is enabled)
		if (useCache) {
			psiCache.set(`${siteName}:${url}`, {
				data: errorResult,
				timestamp: Date.now()
			});
		}

		return errorResult;
	}
}

export async function fetchPSIData(url: string): Promise<any> {
	// Require the API key from the unified pixelated.config.json. No environment fallback.
	const apiKey = getFullPixelatedConfig()?.google?.api_key;
	if (!apiKey) {
		throw new Error('Google API key is not set; set google.api_key in pixelated.config.json');
	}

	const psiUrl = `https://www.googleapis.com/pagespeedonline/v5/runPagespeed?url=${encodeURIComponent(url)}&key=${apiKey}&strategy=mobile&category=performance&category=accessibility&category=best-practices&category=seo`;

	const fetchWithRetry = async (url: string, maxRetries = 2): Promise<Response> => {
		for (let attempt = 0; attempt <= maxRetries; attempt++) {
			try {
				if (debug) console.info(`PSI request attempt=${attempt} url=${url}`);
				const controller = new AbortController();
				const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout

				const start = Date.now();
				const response = await fetch(url, {
					signal: controller.signal,
					headers: {
						'User-Agent': 'Mozilla/5.0 (compatible; SiteHealthMonitor/1.0)'
					}
				});
				const elapsed = Date.now() - start;
				if (debug) console.info(`PSI response: url=${url} status=${response.status} elapsed_ms=${elapsed}`);
				clearTimeout(timeoutId);
				return response;
			} catch (error) {
				if (attempt === maxRetries) {
					const errorMessage = error instanceof Error && error.name === 'AbortError'
						? 'PSI API request timed out after 60 seconds'
						: `PSI API request failed: ${error instanceof Error ? error.message : 'Unknown error'}`;
					if (debug) console.error('PSI request error (final):', { url, error });
					throw new Error(errorMessage);
				}
				// Wait before retry (exponential backoff) - retry on both network errors and timeouts
				if (debug) console.info(`PSI retrying after failure, attempt=${attempt} url=${url}`);
				await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
			}
		}
		throw new Error('Max retries exceeded');
	};

	const psiResponse = await fetchWithRetry(psiUrl);

	if (!psiResponse.ok) {
		// Log the error response for debugging
		const errorText = await psiResponse.text();
		console.error(`PSI API error for ${url}:`, {
			status: psiResponse.status,
			statusText: psiResponse.statusText,
			url: psiUrl,
			response: errorText
		});
		throw new Error(`PSI API returned ${psiResponse.status}: ${psiResponse.statusText}`);
	}

	const psiData = await psiResponse.json();

	// Check if we have valid data
	if (psiData.lighthouseResult?.audits &&
      Object.keys(psiData.lighthouseResult.audits).length > 0) {
		return psiData;
	} else {
		// PSI API returned data but no audits - likely rate limited or invalid response
		throw new Error('Invalid PSI API response or rate limited');
	}
}

function processPSIData(psiData: any, siteName: string, url: string): CoreWebVitalsData {
	const audits = psiData.lighthouseResult.audits;
	const categories = psiData.lighthouseResult.categories;

	// Extract metrics with proper fallbacks
	const realMetrics = {
		cls: audits['cumulative-layout-shift']?.numericValue || audits['cumulative-layout-shift']?.displayValue ? parseFloat(audits['cumulative-layout-shift'].displayValue || audits['cumulative-layout-shift'].numericValue) : 0,
		fid: audits['max-potential-fid']?.numericValue || audits['max-potential-fid']?.displayValue ? parseFloat(audits['max-potential-fid'].displayValue || audits['max-potential-fid'].numericValue) : 0,
		lcp: audits['largest-contentful-paint']?.numericValue || audits['largest-contentful-paint']?.displayValue ? parseFloat(audits['largest-contentful-paint'].displayValue || audits['largest-contentful-paint'].numericValue) : 0,
		fcp: audits['first-contentful-paint']?.numericValue || audits['first-contentful-paint']?.displayValue ? parseFloat(audits['first-contentful-paint'].displayValue || audits['first-contentful-paint'].numericValue) : 0,
		ttfb: audits['server-response-time']?.numericValue ? audits['server-response-time'].numericValue * 1000 : audits['server-response-time']?.displayValue ? parseFloat(audits['server-response-time'].displayValue) * 1000 : 0,
		speedIndex: audits['speed-index']?.numericValue || audits['speed-index']?.displayValue ? parseFloat(audits['speed-index'].displayValue || audits['speed-index'].numericValue) : 0,
		interactive: audits['interactive']?.numericValue || audits['interactive']?.displayValue ? parseFloat(audits['interactive'].displayValue || audits['interactive'].numericValue) : 0,
		totalBlockingTime: audits['total-blocking-time']?.numericValue || audits['total-blocking-time']?.displayValue ? parseFloat(audits['total-blocking-time'].displayValue || audits['total-blocking-time'].numericValue) : 0,
		firstMeaningfulPaint: audits['first-meaningful-paint']?.numericValue || audits['first-meaningful-paint']?.displayValue ? parseFloat(audits['first-meaningful-paint'].displayValue || audits['first-meaningful-paint'].numericValue) : 0,
	};

	// Extract category scores
	const scores: PSIScores = {
		performance: categories?.performance?.score ?? null,
		accessibility: categories?.accessibility?.score ?? null,
		'best-practices': categories?.['best-practices']?.score ?? null,
		seo: categories?.seo?.score ?? null,
		pwa: categories?.pwa?.score ?? null,
	};

	// Extract category details with audits
	const categoryDetails = {
		performance: extractCategoryData(categories?.performance, audits),
		accessibility: extractCategoryData(categories?.accessibility, audits),
		'best-practices': extractCategoryData(categories?.['best-practices'], audits),
		seo: extractCategoryData(categories?.seo, audits),
		pwa: extractCategoryData(categories?.pwa, audits),
	};

	return {
		site: siteName,
		url: url,
		metrics: realMetrics,
		scores: scores,
		categories: categoryDetails,
		timestamp: new Date().toISOString(),
		status: 'success' as const,
	};
}

function extractCategoryData(category: any, audits: any): PSICategory {
	if (!category) {
		return { id: 'unknown', title: 'Unknown', score: null, audits: [] };
	}

	const categoryAudits: PSIAudit[] = category.auditRefs?.map((ref: PSIAuditRef) => {
		const audit = audits[ref.id];
		if (!audit) return null;

		return {
			id: audit.id,
			title: audit.title,
			description: audit.description,
			score: audit.score,
			scoreDisplayMode: audit.scoreDisplayMode,
			displayValue: audit.displayValue,
			numericValue: audit.numericValue,
			details: audit.details,
		};
	}).filter(Boolean) as PSIAudit[] || [];

	return {
		id: category.id,
		title: category.title,
		score: category.score,
		audits: categoryAudits,
	};
}