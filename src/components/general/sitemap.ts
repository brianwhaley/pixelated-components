import PropTypes, { InferProps } from "prop-types";
import type { MetadataRoute } from 'next';
import { encode } from 'html-entities';
import { getAllRoutes } from "./metadata.functions";
import { getWordPressItems, getWordPressItemImages } from "../integrations/wordpress.functions";
import { getContentfulFieldValues, getContentfulAssets } from "../integrations/contentful.delivery";
import { getEbayAppToken, getEbayItemsSearch } from "../shoppingcart/ebay.functions";
import { getFullPixelatedConfig } from '../config/config';
import { CacheManager } from '../general/cache-manager';
import { getDomain } from './utilities';
import { smartFetch } from './smartfetch';


export type SitemapEntry = MetadataRoute.Sitemap[number];
/* export type SitemapEntry = {
	url: string;
	lastModified?: string;
	changeFrequency?: "always" | "hourly" | "daily" | "weekly" | "monthly" | "yearly" | "never";
	priority?: number;
	images?: string[];
}; */



export type SitemapConfig = {
	createPageURLs?: boolean;
	createWordPressURLs?: boolean;
	createWordPressImageURLs?: boolean;
	createImageURLs?: boolean;
	createImageURLsFromJSON?: boolean;
	createContentfulURLs?: boolean;
	createContentfulAssetURLs?: boolean;
	createPageBuilderURLs?: boolean;
	createEbayItemURLs?: boolean;
	wordpress?: { site?: string };
	imageJson?: { path?: string };
	contentful?: any; // contentful api props object
	routes?: any; // accept route data like myRoutes
};

/**
 * Builds a SitemapConfig object based on the pixelated.config.json
 * Automatically enables features based on what's configured
 */
export function buildSitemapConfig(
	pixelatedConfig: any,
	routes: any
): SitemapConfig {
	const sitemapConfig: SitemapConfig = {
		routes,
		createPageURLs: true,
		createImageURLsFromJSON: true,
	};

	// WordPress integration
	if (pixelatedConfig.wordpress?.site) {
		sitemapConfig.wordpress = { site: pixelatedConfig.wordpress.site };
		sitemapConfig.createWordPressURLs = true;
		sitemapConfig.createWordPressImageURLs = true;
	}

	// Contentful integration
	if (pixelatedConfig.contentful?.space_id) {
		const hasCompleteContentfulConfig = !!pixelatedConfig.contentful?.delivery_access_token;
		sitemapConfig.contentful = {
			base_url: pixelatedConfig.contentful.base_url ?? '',
			space_id: pixelatedConfig.contentful.space_id ?? '',
			environment: pixelatedConfig.contentful.environment ?? '',
			access_token: pixelatedConfig.contentful.delivery_access_token ?? '',
		};
		sitemapConfig.createContentfulURLs = false;
		sitemapConfig.createContentfulAssetURLs = hasCompleteContentfulConfig;
	}

	// eBay integration
	if (pixelatedConfig.ebay?.appId) {
		sitemapConfig.createEbayItemURLs = true;
	}

	return sitemapConfig;
}




/**
 * Helper to construct an origin string from a Next-like headers() object or plain values.
 * Accepts an object with `get(key)` method, or `undefined` and falls back to localhost origin.
 */
export function getOriginFromHeaders(headersLike?: { get: (k: string) => string | null } | undefined, fallbackOrigin = 'http://localhost:3000') {
	try {
		if (!headersLike) return fallbackOrigin;
		const proto = headersLike.get('x-forwarded-proto') || 'http';
		const host = headersLike.get('host') || 'localhost:3000';
		return `${proto}://${host}`;
	} catch (e) {
		console.log("Error getting origin from headers:", e);
		return fallbackOrigin;
	}
}

export type RuntimeEnv = 'auto' | 'local' | 'prod';

/**
 * Infer a runtime environment from headers/origin.
 * - 'local' when origin indicates localhost/127.0.0.1
 * - 'prod' for any other host
 * - 'auto' when no origin could be determined
 */
export function getRuntimeEnvFromHeaders(headersLike?: { get: (k: string) => string | null } | undefined, fallbackOrigin?: string): RuntimeEnv {
	const origin = getOriginFromHeaders(headersLike, fallbackOrigin ?? '');
	if (!origin) return 'auto';
	if (origin.includes('localhost') || origin.includes('127.0.0.1')) return 'local';
	return 'prod';
}

/**
 * Next-specific async helper: getOriginFromNextHeaders
 * - Convenience wrapper that dynamically imports `next/headers` and calls our `getOriginFromHeaders` function
 * - Falls back to `fallbackOrigin` if `next/headers` not available or on error
 */
export async function getOriginFromNextHeaders(fallbackOrigin = 'http://localhost:3000') {
	try {
		// dynamic import ensures we don't require 'next/headers' in non-Next environments
		const mod = await import('next/headers');
		if (mod && typeof mod.headers === 'function') {
			const hdrs = await mod.headers();
			return getOriginFromHeaders(hdrs, fallbackOrigin);
		}
	} catch (e) {
		console.log("Error getting origin from Next headers:", e);
		// Not in a Next environment or module not found; return fallback
	}
	return fallbackOrigin;
}



export function flattenRoutes(routes: any) {
	// Convenience wrapper for the project-level getAllRoutes helper
	return getAllRoutes(routes, 'routes');
}



export function jsonToSitemapEntries(entries: SitemapEntry[]){
	return entries.map(
		(entry: SitemapEntry) => 
			`<url>
				<loc>${entry.url}</loc>
				<lastmod>${entry.lastModified}</lastmod>
				<changefreq>${entry.changeFrequency}</changefreq>
				<priority>${entry.priority}</priority>
			</url>`
	).join('');
}



/**
 * generateSitemap: compose the individual create* functions based on toggles in SitemapConfig.
 * - Keep this minimal for the MVP: no retries/caching here. Add TODOs for later.
 */
export async function generateSitemap(cfg: SitemapConfig = {}, originInput?: string): Promise<MetadataRoute.Sitemap> {
	const origin = originInput ?? 'http://localhost:3000';
	const sitemapEntries: any[] = [];

	// Defaults: pages true, image json true, others false
	const usePages = cfg.createPageURLs ?? true;
	const useWP = cfg.createWordPressURLs ?? false;
	const useWPImages = cfg.createWordPressImageURLs ?? false;
	const useImageJSON = cfg.createImageURLsFromJSON ?? true;
	const useContentful = cfg.createContentfulURLs ?? false;
	const useContentfulAssets = cfg.createContentfulAssetURLs ?? false;
	const usePageBuilder = cfg.createPageBuilderURLs ?? false;
	const useEbay = cfg.createEbayItemURLs ?? false;

	// Pages
	if (usePages) {
		if (cfg.routes) {
			const flat = flattenRoutes(cfg.routes);
			sitemapEntries.push(...(await createPageURLs(flat, origin)));
		}
	}
	// Image JSON
	if (useImageJSON) {
		sitemapEntries.push(...(await createImageURLsFromJSON(origin, cfg.imageJson?.path ?? 'public/site-images.json')));
	}
	// WordPress
	if (useWP && cfg.wordpress?.site) {
		sitemapEntries.push(...(await createWordPressURLs({ site: cfg.wordpress.site, includeImages: useWPImages })));
	}
	// Contentful (pages)
	if (useContentful && cfg.contentful) {
		sitemapEntries.push(...(await createContentfulURLs({ apiProps: cfg.contentful, origin })));
	}
	// Contentful assets (images and videos)
	if (useContentfulAssets && cfg.contentful) {
		sitemapEntries.push(...(await createContentfulAssetURLs({ apiProps: cfg.contentful, origin })));
	}
	// Page Builder (existing helper in package not always present)
	if (usePageBuilder && cfg.contentful) {
		// TODO: wire createContentfulPageBuilderURLs if needed; skipping for MVP
	}
	// Ebay items
	if (useEbay) {
		sitemapEntries.push(...(await createEbayItemURLs(origin)));
	}
	// Deduplicate by URL and properly merge images arrays if present
	const map = new Map<string, any>();
	for (const entry of sitemapEntries.flat()) {
		if (!entry || !entry.url) continue;
		const key = (entry.url as string).toLowerCase();
		const existing = map.get(key);
		if (!existing) {
			map.set(key, { ...entry });
		} else {
			// Merge images
			if (entry.images && entry.images.length) {
				existing.images = Array.from(new Set([...(existing.images || []), ...entry.images]));
			}
			// Keep the earliest lastModified? Use whichever is present (prefer existing)
			existing.lastModified = existing.lastModified || entry.lastModified;
			existing.priority = existing.priority || entry.priority;
			existing.changeFrequency = existing.changeFrequency || entry.changeFrequency;
			map.set(key, existing);
		}
	}
	const entries = Array.from(map.values()) as SitemapEntry[];
	return entries as unknown as MetadataRoute.Sitemap;
}




export async function createPageURLs(myRoutes: { path: string }[], origin: string) {
	const sitemap: SitemapEntry[] = [];
	// const origin = await getOrigin();
	const allRoutes = getAllRoutes(myRoutes, "routes");
	for ( const route of allRoutes ){
		if(route.path.substring(0, 4).toLowerCase() !== 'http') {
			sitemap.push({
				url: `${origin}${route.path}` ,
				lastModified: new Date(),
				changeFrequency: "hourly",
				priority: 1.0,
			});
		}
	}
	return sitemap;
}





export async function createImageURLsFromJSON(origin: string, jsonPath = 'public/site-images.json'): Promise<SitemapEntry[]>{
	const sitemap: any[] = [];
	try {
		let urlPath = jsonPath;
		if (urlPath.startsWith('public/')) urlPath = urlPath.slice('public/'.length);
		if (!urlPath.startsWith('/')) urlPath = `/${urlPath}`;
		const json = await smartFetch(`${origin}${urlPath}`);
		let imgs: string[] = [];
		if (Array.isArray(json)) {
			imgs = json;
		} else if (json && Array.isArray(json.images)) {
			imgs = json.images;
		} else {
			return sitemap;
		}

		// Use an array of URL strings so the sitemap serializer writes the URL text
		const newImages = imgs.map(i => {
			const rel = i.startsWith('/') ? i : `/${i}`;
			return `${origin}${rel}`;
		});
		sitemap.push({
			url: `${origin}/images`,
			images: newImages,
		});
	} catch /* (e) */ {
		// During build time, fetch will fail - suppress the error to avoid build noise
		// The function returns an empty array, which is acceptable
	}
	return sitemap;
}




export async function createWordPressURLs(props: {site: string, includeImages?: boolean}){
	const sitemap: SitemapEntry[] = [];
	const blogPosts = await getWordPressItems({site: props.site});
	for await (const post of blogPosts ?? []) {
		// Next.js sitemap only supports string URLs for images, so we map to .url
		const images = props.includeImages ? getWordPressItemImages(post).map(img => img.url) : [];
		sitemap.push({
			url: post.URL ,
			lastModified: post.modified ? new Date(post.modified) : new Date(),
			changeFrequency: "hourly" as const,
			priority: 1.0,
			images: images.length > 0 ? images : undefined
		});
	}
	return sitemap;
}




/**
 * createContentfulURLs — Create sitemap entries for Contentful content by fetching a content type field.
 *
 * @param {shape} [props.apiProps] - Contentful API props: { base_url, space_id, environment, delivery_access_token }.
 * @param {string} [props.base_url] - Contentful base API URL.
 * @param {string} [props.space_id] - Contentful space id.
 * @param {string} [props.environment] - Contentful environment (e.g., 'master').
 * @param {string} [props.delivery_access_token] - Delivery API token (read-only) for Contentful.
 * @param {string} [props.origin] - Origin to prefix generated URLs (e.g., 'https://example.com').
 */
createContentfulURLs.propTypes = {
/** Contentful API properties */
	apiProps: PropTypes.shape({
		/** Contentful base URL */
		base_url: PropTypes.string.isRequired,
		/** Contentful space id */
		space_id: PropTypes.string.isRequired,
		/** Contentful environment */
		environment: PropTypes.string.isRequired,
		/** Delivery API token */
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Origin used to build absolute URLs */
	origin: PropTypes.string.isRequired,
};
export type createContentfulURLsType = InferProps<typeof createContentfulURLs.propTypes>;
export async function createContentfulURLs(props: createContentfulURLsType){
	const sitemap: SitemapEntry[] = [];
	// const origin = await getOrigin();
	const contentType = "carouselCard"; 
	const field = "title";

	const providerContentfulApiProps = getFullPixelatedConfig()?.contentful;
	// Changed order: provider config overrides apiProps for security (tokens)
	const mergedApiProps = { ...props.apiProps, ...providerContentfulApiProps };
	// const mergedApiProps = { ...providerContentfulApiProps, ...props.apiProps }; // Old: apiProps overrode provider

	const contentfulTitles = await getContentfulFieldValues({
		apiProps: mergedApiProps, contentType: contentType, field: field
	});
	for ( const title of contentfulTitles ){
		sitemap.push({
			url: `${props.origin}/projects/${encodeURIComponent(title)}` ,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 1.0,
		});
	}
	return sitemap;
}



/**
 * createContentfulPageBuilderURLs — Generate page URLs for Contentful Page Builder pages.
 *
 * @param {shape} [props.apiProps] - Contentful API props (base_url, space_id, environment, delivery_access_token).
 * @param {string} [props.base_url] - Contentful base API URL.
 * @param {string} [props.space_id] - Contentful space id.
 * @param {string} [props.environment] - Contentful environment.
 * @param {string} [props.delivery_access_token] - Delivery API token for read-only access.
 * @param {string} [props.origin] - Origin used to build absolute page URLs.
 */
createContentfulPageBuilderURLs.propTypes = {
/** Contentful API properties */
	apiProps: PropTypes.shape({
		/** Contentful base URL */
		base_url: PropTypes.string.isRequired,
		/** Contentful space id */
		space_id: PropTypes.string.isRequired,
		/** Contentful environment */
		environment: PropTypes.string.isRequired,
		/** Delivery API token */
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Origin used to build absolute URLs */
	origin: PropTypes.string.isRequired,
};
export type createContentfulPageBuilderURLsType = InferProps<typeof createContentfulPageBuilderURLs.propTypes>;
export async function createContentfulPageBuilderURLs(props: createContentfulPageBuilderURLsType){
	const sitemap: SitemapEntry[] = [];
	const contentType = "page"; 
	const field = "pageName";
	const pageNames = await getContentfulFieldValues({
		apiProps: props.apiProps, contentType: contentType, field: field
	});
	for ( const pageName of pageNames ){
		sitemap.push({
			url: `${props.origin}/${encodeURIComponent(pageName)}` ,
			lastModified: new Date(),
			changeFrequency: "hourly",
			priority: 1.0,
		});
	}
	return sitemap;
}





/**
 * createContentfulAssetURLs — Fetch Contentful assets and generate absolute image and video URLs for the sitemap.
 *
 * @param {shape} [props.apiProps] - Contentful API props (proxyURL optional, base_url, space_id, environment, access_token).
 * @param {string} [props.proxyURL] - Optional proxy base URL to route asset requests through.
 * @param {string} [props.base_url] - Contentful base API URL.
 * @param {string} [props.space_id] - Contentful space id.
 * @param {string} [props.environment] - Contentful environment.
 * @param {string} [props.access_token] - Access token to read assets from Contentful.
 * @param {string} [props.origin] - Origin used to convert relative asset paths to absolute URLs.
 */
createContentfulAssetURLs.propTypes = {
/** Contentful API properties */
	apiProps: PropTypes.shape({
		/** Optional proxy URL */
		proxyURL: PropTypes.string,
		/** Contentful base URL */
		base_url: PropTypes.string.isRequired,
		/** Contentful space id */
		space_id: PropTypes.string.isRequired,
		/** Contentful environment */
		environment: PropTypes.string.isRequired,
		/** Access token to read assets */
		access_token: PropTypes.string.isRequired,
	}).isRequired,
	/** Origin used to convert relative URLs to absolute */
	origin: PropTypes.string.isRequired,
};
export type createContentfulAssetURLsType = InferProps<typeof createContentfulAssetURLs.propTypes>;
export async function createContentfulAssetURLs(props: createContentfulAssetURLsType): Promise<SitemapEntry[]> {
	const sitemap: SitemapEntry[] = [];
	const providerContentfulApiProps = getFullPixelatedConfig()?.contentful;
	// Changed order: provider config overrides apiProps for security (tokens)
	const mergedApiProps = { ...props.apiProps, ...providerContentfulApiProps };
	try {
		const rawAssets = await getContentfulAssets({ apiProps: mergedApiProps });
		if (!Array.isArray(rawAssets?.items) || rawAssets.items.length === 0) {
			return sitemap;
		}

		// Process assets into images and videos by content type
		const imageAssets = rawAssets.items.filter((a: any) => 
			a.fields?.file?.contentType?.startsWith('image/')
		);
		// Process image assets
		if (imageAssets.length > 0) {
			const imageURLs = imageAssets.map((a: any) => {
				let url = a.fields?.file?.url || '';
				if (!url) return '';
				if (url.startsWith('//')) url = `https:${url}`;
				else if (url.startsWith('/')) url = `${props.origin}${url}`;
				else if (!url.startsWith('http://') && !url.startsWith('https://')) url = `${props.origin}/${url}`;
				return encode(url);
			}).filter(Boolean);
			if (imageURLs.length > 0) {
				sitemap.push({
					url: `${props.origin}/images`,
					lastModified: new Date(),
					changeFrequency: 'always',
					priority: 1.0,
					images: imageURLs,
				});
			}
		}

		const videoAssets = rawAssets.items.filter((a: any) => 
			a.fields?.file?.contentType?.startsWith('video/')
		);
		// Process video assets
		if (videoAssets.length > 0) {

			console.log("Video Assets", videoAssets);

			sitemap.push({
				url: `${props.origin}/videos`,
				lastModified: new Date(),
				changeFrequency: 'always',
				priority: 1.0,
				// videos: videoURLs,
				videos: videoAssets.map((a: any) => {
					let url = a.fields?.file?.url || '';
					if (!url) return null;
					if (url.startsWith('//')) url = `https:${url}`;
					else if (url.startsWith('/')) url = `${props.origin}${url}`;
					else if (!url.startsWith('http://') && !url.startsWith('https://')) url = `${props.origin}/${url}`;
					return { 
						title: a.fields?.title || 'Untitled Video',
						thumbnail_loc: `${props.origin}/images/placeholder.png`,
						description: a.fields?.description || 'No description available',
						publication_date: a.sys?.createdAt || new Date().toISOString(),
						content_loc: encode(url),
						player_loc: encode(url),
						family_friendly: 'yes',
						// duration: 600,
					};
				})
			});
		}

	} catch(e) {
		if (typeof console !== 'undefined') console.warn('createContentfulAssetURLs failed', e);
	}
	return sitemap as SitemapEntry[];
}



export async function createEbayItemURLs(origin: string) {
	const sitemap: SitemapEntry[] = [];

	// Load configuration
	const config = getFullPixelatedConfig();
	const globalProxy = config.global?.proxyUrl;

	const ebayProps = { 
		...(globalProxy ? { proxyURL: globalProxy } : {}),
		...config.ebay 
	};

	const cacheTTL = getEbayCacheTTL(config.ebay?.cacheTTL);
	let items;
	try {
		items = await fetchCachedEbayItems(ebayProps, cacheTTL);
	} catch (error) {
		if (typeof console !== 'undefined') console.warn('createEbayItemURLs skipped; unable to fetch items', error);
		return sitemap;
	}
	if (!items || !items.length) {
		return sitemap;
	}
	for (const item of items) {
		sitemap.push({
			url: `${origin}/store/${item.legacyItemId}` ,
			lastModified: item.itemCreationDate ? new Date(item.itemCreationDate) : new Date(),
			changeFrequency: "hourly",
			priority: 1.0,
		});
	}
	return sitemap;
}

const SITEMAP_TTL = 24 * 60 * 60 * 1000; // one day
const EBAY_SITE_SITEMAP_KEY = 'ebay_sitemap_items';
const ebaySitemapCache = new CacheManager({ mode: 'memory', domain: getDomain(), namespace: 'ebaySitemap', ttl: SITEMAP_TTL });

function getEbayCacheTTL(configTTL?: number) {
	if (typeof configTTL === 'number' && configTTL > 0) {
		return configTTL;
	}
	return SITEMAP_TTL;
}

async function fetchCachedEbayItems(apiProps: any, cacheTTL: number) {
	const cached = ebaySitemapCache.get<any[]>(EBAY_SITE_SITEMAP_KEY);
	if (cached) {
		return cached;
	}
	try {
		const token = await getEbayAppToken({ apiProps });
		const data = await getEbayItemsSearch({ apiProps, token });
		const items = data?.itemSummaries ?? [];
		if (items.length) {
			ebaySitemapCache.set(EBAY_SITE_SITEMAP_KEY, items, cacheTTL);
		}
		return items;
	} catch (error) {
		console.error('Error fetching eBay items for sitemap:', error);
		throw error;
	}
}

export function clearEbaySitemapCache() {
	ebaySitemapCache.clear();
}

