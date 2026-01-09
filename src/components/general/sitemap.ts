import PropTypes, { InferProps } from "prop-types";
import type { MetadataRoute } from 'next';
import { getAllRoutes } from "./metadata.functions";
import { getWordPressItems, getWordPressItemImages } from "../general/wordpress.functions";
import { getContentfulFieldValues, getContentfulAssetURLs } from "../general/contentful.delivery";
import { getEbayAppToken, getEbayItemsSearch, defaultEbayProps } from "../shoppingcart/ebay.functions";
import { getFullPixelatedConfig } from '../config/config';


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
	createContentfulImageURLs?: boolean;
	createPageBuilderURLs?: boolean;
	createEbayItemURLs?: boolean;
	wordpress?: { site?: string };
	imageJson?: { path?: string };
	contentful?: any; // contentful api props object
	routes?: any; // accept route data like myRoutes
};




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
	const useContentfulImages = cfg.createContentfulImageURLs ?? false;
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
	// Contentful images
	if (useContentfulImages && cfg.contentful) {
		sitemapEntries.push(...(await createContentfulImageURLs({ apiProps: cfg.contentful, origin })));
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
		const resp = await fetch(`${origin}${urlPath}`);
		if (!resp.ok) return sitemap;
		const json = await resp.json();
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




createContentfulURLs.propTypes = {
	apiProps: PropTypes.shape({
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
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



createContentfulPageBuilderURLs.propTypes = {
	apiProps: PropTypes.shape({
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		delivery_access_token: PropTypes.string.isRequired,
	}).isRequired,
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





createContentfulImageURLs.propTypes = {
	apiProps: PropTypes.shape({
		proxyURL: PropTypes.string,
		base_url: PropTypes.string.isRequired,
		space_id: PropTypes.string.isRequired,
		environment: PropTypes.string.isRequired,
		access_token: PropTypes.string.isRequired,
	}).isRequired,
	origin: PropTypes.string.isRequired,
};
export type createContentfulImageURLsType = InferProps<typeof createContentfulImageURLs.propTypes>;
export async function createContentfulImageURLs(props: createContentfulImageURLsType): Promise<SitemapEntry[]> {
	const sitemap: SitemapEntry[] = [];
	const providerContentfulApiProps = getFullPixelatedConfig()?.contentful;
	// Changed order: provider config overrides apiProps for security (tokens)
	const mergedApiProps = { ...props.apiProps, ...providerContentfulApiProps };
	// const mergedApiProps = { ...providerContentfulApiProps, ...props.apiProps }; // Old: apiProps overrode provider
	try {
		const assets = await getContentfulAssetURLs({ apiProps: mergedApiProps });
		if (!Array.isArray(assets) || assets.length === 0) return sitemap;
		const newImages = assets.map((a: any) => {
			let i = a.image || '';
			if (!i) return ''; // Filter out empty images before processing
			if (i.startsWith('//')) i = `https:${i}`;
			else if (i.startsWith('/')) i = `${props.origin}${i}`;
			else if (!i.startsWith('http://') && !i.startsWith('https://')) i = `${props.origin}/${i}`; // Handle relative URLs
			return i;
		}).filter(Boolean);
		sitemap.push({
			url: `${props.origin}/images`,
			images: newImages,
			lastModified: new Date(),
		});
	} catch(e) {
		if (typeof console !== 'undefined') console.warn('createContentfulImageURLs failed', e);
	}
	return sitemap as SitemapEntry[];
}



export async function createEbayItemURLs(origin: string) {
	const sitemap: SitemapEntry[] = [];

	// Load configuration
	const config = getFullPixelatedConfig();
	const globalProxy = config.global?.proxyUrl;

	const ebayProps = { 
		...defaultEbayProps, 
		...(globalProxy ? { proxyURL: globalProxy } : {}),
		...config.ebay 
	};

	await getEbayAppToken({ apiProps: ebayProps })
		.then(async (response: any) => {
			await getEbayItemsSearch({ apiProps: ebayProps, token: response })
				.then( (items: any) => {
					for (const item of items.itemSummaries) {
						sitemap.push({
							url: `${origin}/store/${item.legacyItemId}` ,
							lastModified: item.itemCreationDate ? new Date(item.itemCreationDate) : new Date(),
							changeFrequency: "hourly",
							priority: 1.0,
						});
					}
				});
		});
	return sitemap;
}





