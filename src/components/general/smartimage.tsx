'use client';

import React, { useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import Image from 'next/image';
import { buildCloudinaryUrl } from '../integrations/cloudinary';
import { usePixelatedConfig } from '../config/config.client';

const CLOUDINARY_DOMAIN = 'https://res.cloudinary.com/';
const CLOUDINARY_TRANSFORMS = 'f_auto,c_limit,q_auto,dpr_auto';

function parseNumber(v?: string | number): number | undefined {
	if (typeof v === 'number') return v > 0 ? v : undefined;
	if (typeof v === 'string') {
		const n = parseInt(v, 10);
		return Number.isFinite(n) && n > 0 ? n : undefined;
	}
	return undefined;
}

function safeString(str: any) {
	return (str === undefined || str === null) 
		? undefined 
		: String(str);
}

function sanitizeString(str: any) {
	return (str === undefined || str === null) 
		? undefined 
		: String(str).toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
}

function generateSrcSet(
	src: string, 
	productEnv: string | null | undefined, 
	widths: number[], 
	opts: { 
		quality?: number | null; 
		transforms?: string | null; 
		cloudinaryDomain?: string 
	}) {
	if (!productEnv) return '';
	return widths.map(w => `${buildCloudinaryUrl({ 
		src, productEnv, 
		width: w, 
		quality: opts.quality ?? 75, 
		transforms: opts.transforms ?? undefined, 
		cloudinaryDomain: opts.cloudinaryDomain })} ${w}w`).join(', ');
}

type smartImageVariant = 'cloudinary' | 'nextjs' | 'img';

/**
 * SmartImage — unified image component that picks the best delivery variant (Cloudinary, Next.js Image, or plain <img>), generates srcset, and manages loading behavior.
 *
 * @param {string} [props.cloudinaryEnv] - Cloudinary environment key for constructing CDN URLs (product env).
 * @param {string} [props.cloudinaryDomain] - Optional Cloudinary domain override.
 * @param {string} [props.cloudinaryTransforms] - Optional transform presets for Cloudinary.
 * @param {string} [props.src] - Source URL or path for the image (required).
 * @param {string} [props.alt] - Alt text for the image (required for accessibility).
 * @param {number|string} [props.width] - Preferred width in pixels or CSS value; used to build srcset when possible.
 * @param {number|string} [props.height] - Preferred height in pixels or CSS value.
 * @param {boolean} [props.aboveFold] - Hint that the image is above the fold and should be prioritized (eager loading / high fetch priority).
 * @param {oneOf} [props.loading] - Loading strategy: 'lazy' or 'eager'.
 * @param {boolean} [props.preload] - If true, suggests the image should be preloaded (best-effort).
 * @param {oneOf} [props.decoding] - Decoding hint: 'async', 'auto' or 'sync'.
 * @param {oneOf} [props.fetchPriority] - Fetch priority: 'high', 'low', or 'auto'.
 * @param {string} [props.sizes] - Sizes attribute override for responsive images.
 * @param {string} [props.srcSet] - Srcset override (if you want to supply your own). 
 * @param {string} [props.className] - Additional CSS classes for the rendered element.
 * @param {object} [props.style] - Inline style object for the image element.
 * @param {string} [props.id] - DOM id to set on the image element.
 * @param {string} [props.name] - Name used to derive a stable id when none is provided.
 * @param {string} [props.title] - Optional title attribute for the image.
 * @param {number} [props.quality] - Quality hint used by Cloudinary when generating URLs (0-100).
 * @param {oneOf} [props.placeholder] - Placeholder behavior: 'blur' to use blur placeholder, 'empty' to use none.
 * @param {oneOf} [props.variant] - Force variant: 'cloudinary' | 'nextjs' | 'img'.
 */
SmartImage.propTypes = {
/** Cloudinary environment key (product environment) for URL generation. */
	cloudinaryEnv: PropTypes.string,
	/** Cloudinary domain override. */
	cloudinaryDomain: PropTypes.string,
	/** Optional Cloudinary transform presets. */
	cloudinaryTransforms: PropTypes.string,
	// shared props
	/** Image source URL or path. */
	src: PropTypes.string.isRequired,
	/** Accessible alt text for the image. */
	alt: PropTypes.string.isRequired,
	/** Preferred width in pixels (used to build srcset when available). */
	width: PropTypes.number,
	/** Preferred height in pixels. */
	height: PropTypes.number,
	/** Hint that the image is above the fold and should be prioritized for loading. */
	aboveFold: PropTypes.bool,
	/** Loading hint: 'lazy' or 'eager'. */
	loading: PropTypes.oneOf(['lazy', 'eager']),
	/** When true suggests the image should be preloaded. */
	preload: PropTypes.bool,
	/** Decoding hint for the browser. */
	decoding: PropTypes.oneOf(['async', 'auto', 'sync']),
	/** Fetch priority hint for modern browsers. */
	fetchPriority: PropTypes.oneOf(['high', 'low', 'auto']),
	/** Sizes attribute override for responsive images. */
	sizes: PropTypes.string,
	/** Srcset override to pass explicit srcset values. */
	srcSet: PropTypes.string,
	/** Additional CSS class names for the image element. */
	className: PropTypes.string,
	/** Inline style object for the image element. */
	style: PropTypes.object,
	/** DOM id for the image. */
	id: PropTypes.string,
	/** Name used to derive a stable id or identification. */
	name: PropTypes.string,
	/** Optional title attribute for the image. */
	title: PropTypes.string,
	/** Quality hint (0-100) used for Cloudinary URL generation. */
	quality: PropTypes.number,
	/** Placeholder behavior for Next.js Image ('blur' for blurred placeholder). */
	placeholder: PropTypes.oneOf(['blur', 'empty']),
	/** Variant to force: 'cloudinary' | 'nextjs' | 'img'. */
	variant: PropTypes.oneOf(['cloudinary', 'nextjs', 'img']),
};
export type SmartImageType = InferProps<typeof SmartImage.propTypes> & React.ImgHTMLAttributes<HTMLImageElement>;
export function SmartImage(props: SmartImageType) {
	const config = usePixelatedConfig();
	const cloudCfg = config?.cloudinary;
	
	// State to track current variant - only changes on actual errors (rare)
	const [currentVariant, setCurrentVariant] = useState<smartImageVariant>(
		(props.variant as smartImageVariant) || 'cloudinary'
	);
	
	const handleError = (error?: any) => {
		if (currentVariant === 'cloudinary') {
			console.warn(`SmartImage: Cloudinary variant failed for "${props.src}", falling back to Next.js Image`, error);
			setCurrentVariant('nextjs');
		} else if (currentVariant === 'nextjs') {
			console.warn(`SmartImage: Next.js Image variant failed for "${props.src}", falling back to HTML img`, error);
			setCurrentVariant('img');
		}
		// No more fallbacks after 'img'
	};
	
	// Reset variant if props change (different image)
	React.useEffect(() => {
		setCurrentVariant((props.variant as smartImageVariant) || 'cloudinary');
	}, [props.src, props.variant]);
	
	const variant = currentVariant;
	const newProps = { ...props };
	
	// Always create ref to maintain consistent hook count across re-renders
	const imgRef = React.useRef<HTMLImageElement | null>(null);
	newProps.cloudinaryEnv = safeString(props.cloudinaryEnv ?? cloudCfg?.product_env);
	newProps.cloudinaryDomain = safeString(cloudCfg?.baseUrl ?? CLOUDINARY_DOMAIN);
	newProps.cloudinaryTransforms = safeString(CLOUDINARY_TRANSFORMS ?? cloudCfg?.transforms);
	newProps.fetchPriority = props.aboveFold ? 'high' : 'auto';
	newProps.loading = props.aboveFold ? 'eager' : 'lazy';
	newProps.decoding = props.aboveFold ? 'sync' : 'async';
	newProps.preload = props.aboveFold ? true : props.preload || false;
	newProps.src = safeString(props.src) ?? (props.src as any) ?? undefined;
	newProps.id = safeString(props.id);
	newProps.name = safeString(props.name);
	newProps.title = safeString(props.title);
	newProps.alt = safeString(props.alt) ?? '';
	newProps.width = parseNumber(props.width ?? 500);
	newProps.height = parseNumber(props.height ?? 500);
	newProps.quality = parseNumber(props.quality ?? 75);

	const filename = (String(newProps.src || '')).split('/').pop()?.split('?')[0] || '';
	const imageName = filename.replace(/\.[^.]+$/, '');
	newProps.id = newProps.id || newProps.name || sanitizeString(newProps.title) || sanitizeString(newProps.alt) || sanitizeString(imageName);
	newProps.name = newProps.name || newProps.id || sanitizeString(newProps.title) || sanitizeString(newProps.alt) || sanitizeString(imageName);
	newProps.title = newProps.title || newProps.alt || sanitizeString(imageName);

	newProps.src = String(newProps.src);

	// Normalize protocol-relative URLs ("//domain/...") to absolute https:// URLs so Next.js Image can accept them.
	// Keep other forms (relative paths, data URIs, http/https) unchanged.
	if (/^\/\//.test(newProps.src)) {
		newProps.src = `https:${newProps.src}`;
	}

	/* ===== CLOUDINARY VARIANT ===== */

	if (variant === 'cloudinary' && newProps.cloudinaryEnv) {

		newProps.src = buildCloudinaryUrl({ 
			src: newProps.src, 
			productEnv: newProps.cloudinaryEnv, 
			cloudinaryDomain: newProps.cloudinaryDomain, 
			quality: newProps.quality,
			width: newProps.width ?? undefined, 
			transforms: newProps.cloudinaryTransforms ?? undefined });

		if (newProps.width) {
			const widths = [Math.ceil(newProps.width * 0.5), newProps.width, Math.ceil(newProps.width * 1.5), Math.ceil(newProps.width * 2)];
			newProps.srcSet = generateSrcSet(
				newProps.src, 
				newProps.cloudinaryEnv, 
				widths, { 
					quality: newProps.quality, 
					transforms: newProps.cloudinaryTransforms ?? undefined, 
					cloudinaryDomain: newProps.cloudinaryDomain 
				});
			// newProps.sizes = `${newProps.width}px`;
			if (!(newProps.sizes)) newProps.sizes = `${newProps.width}px`;
		} else {
			const breakpoints = [320, 640, 768, 1024, 1280, 1536];
			newProps.srcSet = generateSrcSet(
				newProps.src, 
				newProps.cloudinaryEnv, 
				breakpoints, { 
					quality: newProps.quality, 
					transforms: newProps.cloudinaryTransforms ?? undefined, 
					cloudinaryDomain: newProps.cloudinaryDomain 
				});
			newProps.sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw';
		}
	} 

	/* ===== NEXTJS VARIANT ===== */
	/* variant is not cloudinary and not img (ie nextjs)
	or variant is cloudinary and no cloudinaryEnv */

	if (newProps.alt === '') {
		newProps['aria-hidden'] = true;
		newProps.role = 'presentation';
	};

	/* clean up props */
	delete newProps.variant;
	delete newProps.aboveFold;
	delete newProps.cloudinaryEnv;
	delete newProps.cloudinaryDomain;
	delete newProps.cloudinaryTransforms;

	if (variant !== 'img') {
		try {
			return (
				<Image 
					{ ...(newProps as any) }
					src={newProps.src} // required
					alt={newProps.alt} // required
					onError={handleError}
				/>
			);
		} catch (e) {
			console.warn(`SmartImage: Next.js Image threw exception for "${props.src}", falling back to plain img`, e);
			// Force fallback to img variant
			setCurrentVariant('img');
		}
	}

	/* ===== IMG VARIANT ===== */
	return (
		/* eslint-disable-next-line pixelated/no-raw-img */
		<img 
			{...newProps as any} 
			ref={imgRef}
			alt={newProps.alt} />
	);

}
