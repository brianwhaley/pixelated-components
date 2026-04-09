/**
 * smartFetch - Intelligent fetch wrapper with caching, retries, proxy, and timeout support
 *
 * Features:
 * - Multiple response types (json, text, blob)
 * - Automatic proxy fallback on CORS errors
 * - Retry with exponential backoff
 * - Request timeout handling
 * - Dual caching: Next.js fetch cache + CacheManager
 * - Enhanced error messages with domain info
 * - Optional callbacks (onSuccess, onError, onComplete)
 * - Debug logging
 *
 * @example
 * // Simple JSON fetch with caching
 * const data = await smartFetch('https://api.example.com/user/123', {
 *   responseType: 'json',
 *   cache: cacheManager,
 *   cacheKey: 'user:123'
 * });
 *
 * @example
 * // With proxy fallback on CORS
 * const data = await smartFetch('https://api.external.com/data', {
 *   responseType: 'json',
 *   proxy: {
 *     url: 'https://proxy.pixelated.tech/',
 *     fallbackOnCors: true
 *   },
 *   retries: 2
 * });
 *
 * @example
 * // Server-side with Next.js caching
 * const data = await smartFetch(url, {
 *   cacheStrategy: 'next',
 *   nextCache: { revalidate: 3600 } // 1 hour
 * });
 */

import type { CacheManager } from './cache-manager';

export type ResponseType = 'json' | 'text' | 'blob' | 'ok' | 'status';
export type CacheStrategy = 'none' | 'next' | 'local' | 'both';

export interface SmartFetchProxyOptions {
	/** Proxy URL to use */
	url: string;

	/** If true, skip direct attempt and go straight to proxy. Default: false (try direct first) */
	forceProxy?: boolean;

	/** If true, fall back to proxy on CORS error. Default: true */
	fallbackOnCors?: boolean;
}

export interface SmartFetchOptions {
	/** Response parsing type. Default: 'json'. Use 'ok' or 'status' to return the raw Response object */
	responseType?: ResponseType;

	/** Optional proxy configuration */
	proxy?: SmartFetchProxyOptions;

	/** Cache strategy. Default: 'next' for server, 'local' for client */
	cacheStrategy?: CacheStrategy;

	/** Next.js fetch cache options (server-side) */
	nextCache?: { revalidate: number | false };

	/** CacheManager instance for persistent caching */
	cache?: CacheManager;

	/** Cache key for CacheManager */
	cacheKey?: string;

	/** Number of retries on failure. Default: 1 */
	retries?: number;

	/** Request timeout in milliseconds. Default: 10000 */
	timeout?: number;

	/** Custom fetch RequestInit options (method, headers, body, etc.) merged into the fetch call */
	requestInit?: RequestInit;

	/** Enable debug logging. Default: false */
	debug?: boolean;

	/** Callback invoked on successful response */
	onSuccess?: (data: any) => void;

	/** Callback invoked on error */
	onError?: (error: Error) => void;

	/** Callback invoked after fetch completes (success or failure) */
	onComplete?: () => void;
}

/**
 * Extract domain from URL for enhanced error messages
 */
function getDomain(url: string): string {
	try {
		return new URL(url).hostname;
	} catch {
		return 'unknown';
	}
}

/**
 * Check if error is CORS-related
 */
function isCorsError(error: Error): boolean {
	const message = error.message.toLowerCase();
	return (
		message.includes('cors') ||
		message.includes('cross-origin') ||
		message.includes('network') ||
		message.includes('failed to fetch')
	);
}

/**
 * Intelligent fetch with caching, retries, proxy fallback, and timeout
 */
export async function smartFetch(
	url: string,
	options: SmartFetchOptions = {}
): Promise<any> {
	const {
		responseType = 'json',
		proxy,
		cacheStrategy = typeof window === 'undefined' ? 'next' : 'local',
		nextCache,
		cache,
		cacheKey,
		retries = 1,
		timeout = 10000,
		requestInit = {},
		debug = false,
		onSuccess,
		onError,
		onComplete,
	} = options;

	const domain = getDomain(url);

	try {
		// Step 1: Check CacheManager first (fastest, cross-request)
		if ((cacheStrategy === 'local' || cacheStrategy === 'both') && cache && cacheKey) {
			const cached = cache.get(cacheKey);
			if (cached) {
				if (debug) console.log(`[smartFetch] ${domain}: Cache hit (${cacheKey})`);
				onSuccess?.(cached);
				onComplete?.();
				return cached;
			}
		}

		// Step 2: Determine fetch URL (direct or via proxy)
		let fetchUrl = url;
		let tryDirect = !proxy?.forceProxy;

		if (proxy?.forceProxy) {
			fetchUrl = proxy.url + encodeURIComponent(url);
			tryDirect = false;
			if (debug) console.log(`[smartFetch] ${domain}: Using proxy (force)`);
		}

		// Step 3: Fetch with retry loop
		let lastError: Error | undefined;

		for (let attempt = 0; attempt <= retries; attempt++) {
			try {
				if (debug && attempt > 0) {
					console.log(`[smartFetch] ${domain}: Retry attempt ${attempt + 1}/${retries + 1}`);
				}

				// Attempt direct fetch
				if (tryDirect) {
					try {
						if (debug) console.log(`[smartFetch] ${domain}: Fetching (direct)`);

						// Set up timeout for this fetch attempt
						const controller = new AbortController();
						const timeoutId = setTimeout(() => controller.abort(), timeout);

						// eslint-disable-next-line pixelated/no-direct-fetch
						const response = await fetch(url, {
							signal: controller.signal,
							...requestInit,
							...(cacheStrategy === 'next' || cacheStrategy === 'both'
								? { next: nextCache }
								: {}),
						});

						clearTimeout(timeoutId);

						if (!response.ok) {
							throw new Error(`HTTP ${response.status} ${response.statusText}`);
						}
						// If responseType is 'ok' or 'status', return the raw Response object
						if (responseType === 'ok' || responseType === 'status') {
							if (debug) console.log(`[smartFetch] ${domain}: Success (returning Response object)`);
							onSuccess?.(response);
							onComplete?.();
							return response;
						}
						const data = await response[responseType]();

						// Cache in CacheManager
						if ((cacheStrategy === 'local' || cacheStrategy === 'both') && cache && cacheKey) {
							cache.set(cacheKey, data);
						}

						if (debug) console.log(`[smartFetch] ${domain}: Success`);
						onSuccess?.(data);
						onComplete?.();
						return data;
					} catch (error) {
						// On CORS error, try proxy if available
						if (proxy?.fallbackOnCors && isCorsError(error as Error)) {
							if (debug) console.log(`[smartFetch] ${domain}: CORS error, falling back to proxy`);
							tryDirect = false;
							fetchUrl = proxy.url + encodeURIComponent(url);
							// Fall through to proxy attempt below
						} else {
							throw error;
						}
					}
				}

				// Attempt via proxy (if set or after direct CORS failure)
				if (!tryDirect) {
					if (debug) console.log(`[smartFetch] ${domain}: Fetching (proxy)`);

					// Set up timeout for this fetch attempt
					const controller = new AbortController();
					const timeoutId = setTimeout(() => controller.abort(), timeout);

					// eslint-disable-next-line pixelated/no-direct-fetch
					const response = await fetch(fetchUrl, {
						signal: controller.signal,
						...requestInit,
						...(cacheStrategy === 'next' || cacheStrategy === 'both'
							? { next: nextCache }
							: {}),
					});

					clearTimeout(timeoutId);

					if (!response.ok) {
						throw new Error(`HTTP ${response.status} ${response.statusText}`);
					}

					// If responseType is 'ok' or 'status', return the raw Response object
					if (responseType === 'ok' || responseType === 'status') {
						if (debug) console.log(`[smartFetch] ${domain}: Success (via proxy, returning Response object)`);
						onSuccess?.(response);
						onComplete?.();
						return response;
					}

					const data = await response[responseType]();

					// Cache in CacheManager
					if ((cacheStrategy === 'local' || cacheStrategy === 'both') && cache && cacheKey) {
						cache.set(cacheKey, data);
					}

					if (debug) console.log(`[smartFetch] ${domain}: Success (via proxy)`);
					onSuccess?.(data);
					onComplete?.();
					return data;
				}
			} catch (error) {
				lastError = error as Error;

				// If we have retries left, wait before retrying
				if (attempt < retries) {
					const delay = Math.pow(2, attempt) * 100; // Exponential backoff: 100ms, 200ms, 400ms...
					if (debug) console.log(`[smartFetch] ${domain}: Waiting ${delay}ms before retry`);
					await new Promise(resolve => setTimeout(resolve, delay));
				}
			}
		}

		// If we got here, all attempts failed
		const errorMessage = `[smartFetch] ${domain}: ${lastError?.message || 'Unknown error'}`;
		const error = new Error(errorMessage);

		if (debug) console.error(errorMessage);
		onError?.(error);
		onComplete?.();

		throw error;
	} catch (error) {
		const err = error as Error;
		onError?.(err);
		onComplete?.();
		throw err;
	}
}
