import PropTypes, { InferProps } from 'prop-types';

/* 
https://cloudinary.com/blog/transparent_webp_format_cdn_delivery_based_on_visitors_browsers
https://cloudinary.com/blog/delivering_all_your_websites_images_through_a_cdn
*/

const cloudinary_domain = "https://res.cloudinary.com";
// const cloudinary_product_env = "dlbon7tpq";
// const cloudinary_props = "/image/fetch/f_auto,c_limit,q_auto,dpr_auto";
const cloudinary_props = "/image/fetch/f_auto,c_limit,dpr_auto";


function joinWithSlash(a: string, b: string) {
	return `${a.replace(/\/+$/,'')}/${b.replace(/^\/+/, '')}`;
}

export function buildCloudinaryUrl(params: { src: string; productEnv: string | null | undefined; cloudinaryDomain?: string; quality?: number | null; width?: number | null; transforms?: string | null; }) {
	const { src, productEnv, cloudinaryDomain = cloudinary_domain, quality = 75, width, transforms } = params;
	if (typeof window === 'undefined') return src; // SSR - leave as-is
	const origin = window.location.origin;
	// Don't fetch from cloudinary during local dev
	if (origin.includes("localhost") || origin.includes("127.0.0.1") || origin.includes("192.168")) return src;
	// Must have cloudinary product env to build URL
	if (!productEnv) return src;
	// Resolve non-absolute src to absolute URL in client runtime. Leave alone during SSR.
	let url = src;
	if (!/^https?:\/\//i.test(src)) {
		url = src.startsWith('/') ? `${origin}${src}` : `${origin}/${src}`;
	}
	// Don't fetch from cloudinary during local dev
	// if (url.includes('localhost') || url.includes('127.0.0.1') || url.includes('192.168')) return src;
	const q = typeof quality === 'number' ? quality : 75;
	const parts: string[] = ['f_auto', 'c_limit', `q_${q}`, 'dpr_auto'];
	if (typeof width === 'number' && Number.isFinite(width)) parts.push(`w_${width}`);
	// split transforms by comma and clean empty and whitespace
	const transformArray = transforms ? transforms.split(',').map(s => s.trim()).filter(Boolean) : [];
	for (const transform of transformArray) {
		if (!transform) continue;
		// If the exact transform already exists, nothing to do.
		if (parts.includes(transform)) continue;
		// Check for a prefix match (anything before and including the first underscore).
		const underscoreIndex = transform.indexOf('_');
		if (underscoreIndex !== -1) {
			const prefix = transform.slice(0, underscoreIndex + 1); // e.g. 'q_' or 'w_'
			const prefixIdx = parts.findIndex(p => p.startsWith(prefix));
			if (prefixIdx !== -1) {
				// Replace the existing part that shares the same prefix.
				parts[prefixIdx] = transform;
				continue;
			}
		}
		// No exact or prefix match found — append.
		parts.push(transform);
	}
	const t = parts.length ? parts.join(',') : '';
	const domainAndCloud = productEnv ? joinWithSlash(cloudinaryDomain, productEnv) : cloudinaryDomain;
	const encodedUrl = url.includes("?") ? encodeURIComponent(url) : url;
	return `${domainAndCloud}/image/fetch/${t}/${encodedUrl}`;
}



/**
 * getCloudinaryRemoteFetchURL — Build a Cloudinary remote fetch URL for a provided image path.
 *
 * @param {string} [props.url] - Image URL or path to convert to Cloudinary fetch URL.
 * @param {string} [props.product_env] - Cloudinary product environment (cloud name) to use when building the URL.
 */
getCloudinaryRemoteFetchURL.propTypes = {
/** Image URL or path to transform via Cloudinary */
	url: PropTypes.string.isRequired,
	/** Cloudinary product environment (cloud name) */
	product_env: PropTypes.string.isRequired
};
export type getCloudinaryRemoteFetchURLType = InferProps<typeof getCloudinaryRemoteFetchURL.propTypes>;
export function getCloudinaryRemoteFetchURL(props: getCloudinaryRemoteFetchURLType) {
 	const domainAndCloud = joinWithSlash(cloudinary_domain, props.product_env);
 	const cloudinary_prefix = domainAndCloud + cloudinary_props;
 	const result = cloudinary_prefix + '/' + props.url;
 	return result;
}


export function userIsMobile() {
	let match = false;
	if (typeof window !== 'undefined') {
		const mediaQuery = window.matchMedia('(max-width: 768px)'); // Example breakpoint
		match = mediaQuery.matches;
	}
	return match;
}


/**
 * loadAllImagesFromCloudinary — Replace <img> sources with Cloudinary-built remote fetch URLs for improved delivery in production.
 *
 * @param {string} [props.origin] - Optional origin to validate local development environments (ignored in local dev).
 * @param {string} [props.product_env] - Cloudinary product environment (cloud name) to use when building URLs.
 */
loadAllImagesFromCloudinary.propTypes = {
/** Optional origin string to detect local dev */
	origin: PropTypes.string,
	/** Cloudinary product environment (cloud name) */
	product_env: PropTypes.string.isRequired
};
export type loadAllImagesFromCloudinaryType = InferProps<typeof loadAllImagesFromCloudinary.propTypes>;
export function loadAllImagesFromCloudinary(props: loadAllImagesFromCloudinaryType){
	const origin = document.location.origin;
	if(origin && origin.includes("localhost")) { return; } // do nothing in local dev 
	const images = document.querySelectorAll('img');
	images.forEach(img => {
		const currentSrc = img.getAttribute('src') || '';
		if (!currentSrc) return;

		// Use the shared builder so all Cloudinary URLs are consistent.
		const built = buildCloudinaryUrl({
			src: currentSrc,
			productEnv: props.product_env,
			cloudinaryDomain: cloudinary_domain,
			// keep other options default (quality/width/transforms) for now
		});

		// If builder returned a new URL, update the image src.
		if (built && built !== currentSrc) {
			img.setAttribute('src', built);
		}
	});
}
