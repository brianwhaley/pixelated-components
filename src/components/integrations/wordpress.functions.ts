
import PropTypes, { InferProps } from "prop-types";

// const wpSite = "pixelatedviews.wordpress.com";
// const wpSite = "19824045";
// const wpSite = "blog.pixelated.tech";
const wpApiURL = "https://public-api.wordpress.com/rest/v1/sites/";
const wpCategoriesPath = "/categories";




export type BlogPostType = {
    ID: string;
    title: string;
    date: string;
    modified?: string;
    author?: {
		"ID": number;
		"login": string;
		"email": string | boolean;
		"name": string;
		"first_name": string;
		"last_name": string;
		"nice_name": string;
		"URL": string;
		"avatar_URL": string;
		"profile_URL": string;
		"ip_address": string | false;
	};
    excerpt: string;
    content?: string;
    URL: string;
    categories: string[];
	featured_image?: string;
	post_thumbnail?: {
		URL: string;
	}
	attachments?: Record<string, any>;
};
/**
 * getWordPressItems — Fetch posts from the WordPress REST API for a given site.
 *
 * @param {string} [props.site] - WordPress site identifier (site slug or domain).
 * @param {number} [props.count] - Optional number of posts to fetch (omit to fetch all available).
 * @param {string} [props.baseURL] - Optional base URL for the WordPress API (defaults to public WordPress API URL).
 */
getWordPressItems.propTypes = {
/** WordPress site identifier (slug or domain) */
	site: PropTypes.string.isRequired,
	/** Number of posts to fetch (optional) */
	count: PropTypes.number,
	/** Base URL for WordPress API (optional) */
	baseURL: PropTypes.string,
};
export type getWordPressItemsType = InferProps<typeof getWordPressItems.propTypes>;
export async function getWordPressItems(props: { site: string; count?: number; baseURL?: string }){
	const { baseURL = wpApiURL } = props;
	const requested = props.count; // undefined means fetch all available
	const tag = `wp-posts-${props.site}`; // unique per site so we can invalidate fetch cache separately
	const posts: BlogPostType[] = [];
	let page = 1;
	while (true) {
		const remaining = requested ? Math.max(requested - posts.length, 0) : 100;
		const number = Math.min(remaining || 100, 100);
		const wpPostsURL = `${baseURL}${props.site}/posts?number=${number}&page=${page}`;
		try {
			// const response = await fetch(wpPostsURL);
			const response = await fetch(wpPostsURL, {
				// cache the HTTP response and mark it with a tag so it can be
				// invalidated independently of the page cache.
				cache: 'force-cache',
				next: { revalidate: 60 * 60 * 24 * 7, tags: [tag] }, // revalidate once per week
			});
			// -> "HIT" or "MISS" (or "REVALIDATED" etc.)
			const data = await response.json();
			const batch: BlogPostType[] = Array.isArray(data.posts) ? data.posts : [];
			if (batch.length === 0) {
				break; // no more posts
			}
			
			// Process WordPress Photon URLs in featured images
			const processedBatch = batch.map(post => ({
				...post,
				featured_image: post.featured_image ? photonToOriginalUrl(post.featured_image) : post.featured_image
			}));
			
			posts.push(...processedBatch);
			if (requested && posts.length >= requested) {
				break; // collected enough
			}
			page++;
		} catch (error) {
			console.error("Error fetching WP posts:", error);
			return;
		}
	}
	
	// once we've fetched the posts we can also compare the "modified" date from
	// the first post (which is the most recent) with a fresh timestamp obtained
	// via getWordPressLastModified.  if the lastModified indicates a newer update than
	// what we just fetched, bust the cache so future callers get the latest data.
	if (posts && posts.length > 0 && posts[0].modified) {
		const lastModified = await getWordPressLastModified({ site: props.site, baseURL });
		if (lastModified && lastModified !== posts[0].modified) {
			// our cached response is stale relative to origin
			import('next/cache').then(({ revalidateTag }) => {
				revalidateTag(`wp-posts-${props.site}`, {});
			});
		}
	}
	
	
	return posts;
}





/*
 * Retrieve the modified timestamp of the most recent post on a WP site.
 * WordPress doesn’t support HEAD on the posts endpoint, so we fetch a single
 * post and pull the `modified` field from the JSON payload.  This is still
 * very light-weight compared to fetching the whole collection.
 *
 * @param props.site - WordPress site slug or domain
 * @param props.baseURL - Optional API base URL (defaults to WordPress public API)
 * @returns the ISO modified string or null if unavailable/error.
 */
export async function getWordPressLastModified(props: { site: string; baseURL?: string }) {
	const { baseURL = wpApiURL } = props;
	const url = `${baseURL}${props.site}/posts?number=1&fields=modified`;
	try {
		const res = await fetch(url);
		if (!res.ok) return null;
		const data = await res.json();
		const modified = Array.isArray(data.posts) && data.posts[0]?.modified;
		return modified || null;
	} catch (e) {
		console.error('Error fetching WP last-modified value', e);
		return null;
	}
}





export type WordPressSitemapImage = {
	url: string;
	title?: string;
	caption?: string;
	thumbnail_loc?: string;
};
/**
 * getWordPressItemImages — Extract image objects from a WordPress post for use in sitemaps and galleries.
 *
 * @param {object} [props.item] - WordPress post object to extract image URLs from.
 */
getWordPressItemImages.propTypes = {
/** WordPress post object */
	item: PropTypes.object.isRequired,
};
export type getWordPressItemImagesType = InferProps<typeof getWordPressItemImages.propTypes>;
export function getWordPressItemImages(item: BlogPostType): WordPressSitemapImage[] {
	const images: WordPressSitemapImage[] = [];
	const seen = new Set<string>();
	// Helper to swap image origin with post origin
	const swapOrigin = (url: string) => {
		try {
			const postOrigin = new URL(item.URL).origin;
			const urlObj = new URL(url);
			return `${postOrigin}${urlObj.pathname}`;
		} catch (error) {
			console.log("Error: ", error);
			return url;
		}
	};
	// Featured image
	if (item.featured_image && !seen.has(item.featured_image)) {
		seen.add(item.featured_image);
		images.push({
			url: swapOrigin(item.featured_image),
			title: item.title,
			caption: item.excerpt,
			thumbnail_loc: item.post_thumbnail?.URL,
		});
	}
	// Attachments
	if (item.attachments) {
		for (const key in item.attachments) {
			const att = item.attachments[key];
			if (att.URL && !seen.has(att.URL)) {
				seen.add(att.URL);
				images.push({
					url: swapOrigin(att.URL),
					title: att.title,
					caption: att.caption || att.description,
				});
			}
		}
	}
	return images;
}






export type BlogPostCategoryType = {
	id: number;
	name: string;
	slug: string;
	description: string;
	post_count: number;
	feed_url: string;
};
/**
 * getWordPressCategories — Retrieve categories for a WordPress site.
 *
 * @param {string} [props.site] - WordPress site identifier (slug or domain).
 * @param {string} [props.baseURL] - Optional base URL for the WordPress API.
 */
getWordPressCategories.propTypes = {
/** WordPress site identifier (slug or domain) */
	site: PropTypes.string.isRequired,
	/** Base URL for WordPress API (optional) */
	baseURL: PropTypes.string,
};
export type getWordPressCategoriesType = InferProps<typeof getWordPressCategories.propTypes>;
export async function getWordPressCategories(props: { site: string; baseURL?: string }){
	const { baseURL = wpApiURL } = props;
	const wpCategoriesURL = baseURL + props.site + wpCategoriesPath ;
	const categories = [];
	try {
		const response = await fetch(wpCategoriesURL);
		const data = await response.json();
		// Check for total pages on the first page
		const myCategories = data.categories.map((category: BlogPostCategoryType) => ( category.name ));
		categories.push(...myCategories);
	} catch (error) {
		console.error("Error fetching WP categories:", error);
		return;
	}
	return categories; // Return the complete list of categories
}

/**
 * Convert a WordPress Photon CDN URL to the original direct image URL
 * @param photonUrl - The Photon CDN URL (e.g., https://i0.wp.com/domain.com/path)
 * @returns The original direct image URL (e.g., https://domain.com/path)
 */
export function photonToOriginalUrl(photonUrl: string): string {
	if (typeof photonUrl !== 'string' || !photonUrl.includes('i0.wp.com/')) {
		return photonUrl; // Return unchanged if not a Photon URL
	}

	try {
		// Photon URL format: https://i0.wp.com/domain.com/path/to/image.jpg?params
		// Extract original: https://domain.com/path/to/image.jpg
		const photonUrlObj = new URL(photonUrl);
		const pathWithoutLeadingSlash = photonUrlObj.pathname.slice(1); // Remove leading /
		const firstSlashIndex = pathWithoutLeadingSlash.indexOf('/');
		const domain = pathWithoutLeadingSlash.slice(0, firstSlashIndex);
		const path = pathWithoutLeadingSlash.slice(firstSlashIndex);
		return `https://${domain}${path}`;
	} catch (e) {
		console.warn('Failed to parse Photon URL:', photonUrl, e);
		return photonUrl; // Return original on error
	}
}
