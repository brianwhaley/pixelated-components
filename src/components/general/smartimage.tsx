'use client';

import React, { useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import Image from 'next/image';
import { buildCloudinaryUrl } from '../general/cloudinary';
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

SmartImage.propTypes = {
	cloudinaryEnv: PropTypes.string,
	cloudinaryDomain: PropTypes.string,
	cloudinaryTransforms: PropTypes.string,
	// shared props
	src: PropTypes.string.isRequired,
	alt: PropTypes.string.isRequired,
	// width: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	// height: PropTypes.oneOfType([PropTypes.number, PropTypes.string]),
	width: PropTypes.number,
	height: PropTypes.number,
	aboveFold: PropTypes.bool,
	loading: PropTypes.oneOf(['lazy', 'eager']),
	preload: PropTypes.bool,
	decoding: PropTypes.oneOf(['async', 'auto', 'sync']),
	fetchPriority: PropTypes.oneOf(['high', 'low', 'auto']),
	sizes: PropTypes.string,
	srcSet: PropTypes.string,
	className: PropTypes.string,
	style: PropTypes.object,
	id: PropTypes.string,
	name: PropTypes.string,
	title: PropTypes.string,
	quality: PropTypes.number,
	placeholder: PropTypes.oneOf(['blur', 'empty']),
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

	const filename = (newProps.src).split('/').pop()?.split('?')[0] || '';
	const imageName = filename.replace(/\.[^.]+$/, '');
	newProps.id = newProps.id || newProps.name || sanitizeString(newProps.title) || sanitizeString(newProps.alt) || sanitizeString(imageName);
	newProps.name = newProps.name || newProps.id || sanitizeString(newProps.title) || sanitizeString(newProps.alt) || sanitizeString(imageName);
	newProps.title = newProps.title || newProps.alt || sanitizeString(imageName);

	newProps.src = String(newProps.src);

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
			newProps.sizes = `${newProps.width}px`;
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
		<img 
			{...newProps as any} 
			ref={imgRef}
			alt={newProps.alt} />
	);

}
