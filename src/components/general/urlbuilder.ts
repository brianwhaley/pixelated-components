/**
 * buildUrl - Unified URL builder supporting multiple patterns from the codebase
 *
 * Handles:
 * - Simple query parameters (Google Places, Instagram style)
 * - Path segments + query params (Contentful style)
 * - Proxy wrapping with encoding
 * - Proper URL encoding of parameter values
 *
 * @example
 * // Simple query params
 * buildUrl({
 *   baseUrl: 'https://api.example.com/search',
 *   params: { q: 'test', limit: 10 }
 * });
 * // → 'https://api.example.com/search?q=test&limit=10'
 *
 * @example
 * // With path segments (Contentful style)
 * buildUrl({
 *   baseUrl: 'https://api.contentful.com',
 *   pathSegments: ['spaces', 'abc123', 'environments', 'master', 'entries'],
 *   params: { access_token: 'xxx' }
 * });
 * // → 'https://api.contentful.com/spaces/abc123/environments/master/entries?access_token=xxx'
 *
 * @example
 * // With proxy wrapping (Flickr style)
 * buildUrl({
 *   baseUrl: 'https://www.flickr.com/services/rest',
 *   params: { method: 'flickr.photos.search', api_key: 'xxx' },
 *   proxyUrl: 'https://proxy.pixelated.tech/'
 * });
 * // → 'https://proxy.pixelated.tech/https%3A%2F%2Fwww.flickr.com%2Fservices%2Frest%3Fmethod%3Dflickr.photos.search%26api_key%3Dxxx'
 */

export interface BuildUrlOptions {
	/**
	 * Base URL (e.g., 'https://api.example.com')
	 */
	baseUrl: string;

	/**
	 * Path segments to append to baseUrl
	 * e.g., ['spaces', 'abc', 'entries'] → /spaces/abc/entries
	 * Segments are NOT encoded - they should be clean identifiers
	 */
	pathSegments?: (string | number)[];

	/**
	 * Query parameters to append as query string
	 * Values ARE encoded automatically
	 * null/undefined values are filtered out
	 */
	params?: Record<string, string | number | boolean | null | undefined>;

	/**
	 * Optional proxy URL to wrap the built URL
	 * If provided, the full URL is encoded and appended to proxy
	 * e.g., 'https://proxy.pixelated.tech/'
	 */
	proxyUrl?: string;
}

/**
 * Build a URL with optional path segments and query parameters
 */
export function buildUrl(options: BuildUrlOptions): string {
	const { baseUrl, pathSegments, params, proxyUrl } = options;

	// Step 1: Start with base URL
	let url = baseUrl;

	// Step 2: Append path segments (no encoding needed - they're IDs/identifiers)
	if (pathSegments && pathSegments.length > 0) {
		const segmentPath = pathSegments
			.map(segment => String(segment).replace(/^\/+|\/+$/g, '')) // Remove leading/trailing slashes
			.filter(Boolean) // Remove empty strings
			.join('/');

		// Ensure single slash between base and path
		if (!url.endsWith('/')) {
			url += '/';
		}
		url += segmentPath;
	}

	// Step 3: Append query parameters (values ARE encoded)
	if (params && Object.keys(params).length > 0) {
		const searchParams = new URLSearchParams();

		Object.entries(params).forEach(([key, value]) => {
			// Skip null/undefined values
			if (value !== null && value !== undefined) {
				searchParams.append(key, String(value));
			}
		});

		const queryString = searchParams.toString();
		if (queryString) {
			url += (url.includes('?') ? '&' : '?') + queryString;
		}
	}

	// Step 4: Wrap with proxy if provided
	if (proxyUrl) {
		return proxyUrl + encodeURIComponent(url);
	}

	return url;
}
