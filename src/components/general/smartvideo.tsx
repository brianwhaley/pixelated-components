'use client';

import React, { useEffect, useState } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { buildCloudinaryUrl } from '../integrations/cloudinary';
import { usePixelatedConfig } from '../config/config.client';
import {
	parseNumber,
	safeString,
	sanitizeMediaString,
	normalizeProtocolRelativeUrl,
	deriveMediaId,
	SmartMediaUtilsPropTypes,
} from './smartmediautils';

export type SmartVideoVariant = 'cloudinary' | 'html';
/**
 * SmartVideo — renders a video optimized for Cloudinary or browser HTML fallback.
 *
 * @param {string} [props.cloudinaryEnv] - Cloudinary environment key for URL generation.
 * @param {string} [props.cloudinaryDomain] - Cloudinary domain override.
 * @param {string} [props.cloudinaryTransforms] - Optional Cloudinary transform presets.
 * @param {string} props.src - Source URL or path for the video.
 * @param {string} [props.poster] - Poster image URL shown before playback starts.
 * @param {boolean} [props.autoPlay] - Whether the video should autoplay.
 * @param {boolean} [props.muted] - Whether the video should start muted.
 * @param {boolean} [props.loop] - Whether the video should loop playback.
 * @param {boolean} [props.controls] - Whether playback controls should be visible.
 * @param {boolean} [props.playsInline] - Whether the video should play inline on mobile.
 * @param {oneOf} [props.preload] - The preload option: 'auto', 'metadata', or 'none'.
 * @param {string} [props.captionsSrc] - Optional captions track source URL.
 * @param {string} [props.className] - Optional CSS class name for the rendered video element.
 */
SmartVideo.propTypes = {
	...SmartMediaUtilsPropTypes,
	poster: PropTypes.string,
	autoPlay: PropTypes.bool,
	muted: PropTypes.bool,
	loop: PropTypes.bool,
	controls: PropTypes.bool,
	playsInline: PropTypes.bool,
	preload: PropTypes.oneOf(['auto', 'metadata', 'none']),
	captionsSrc: PropTypes.string,
	className: PropTypes.string,
};
export type SmartVideoType = InferProps<typeof SmartVideo.propTypes> & React.VideoHTMLAttributes<HTMLVideoElement>;
export function SmartVideo(props: SmartVideoType) {
	const config = usePixelatedConfig();
	const cloudCfg = config?.cloudinary;
	const [currentVariant, setCurrentVariant] = useState<SmartVideoVariant>(
		(props.variant as SmartVideoVariant) || 'cloudinary'
	);

	useEffect(() => {
		setCurrentVariant((props.variant as SmartVideoVariant) || 'cloudinary');
	}, [props.src, props.variant]);

	const normalizedSrc = normalizeProtocolRelativeUrl(safeString(props.src) ?? '');
	const normalizedPoster = props.poster ? normalizeProtocolRelativeUrl(safeString(props.poster) ?? '') : undefined;
	const cloudinaryEnv = safeString(props.cloudinaryEnv ?? cloudCfg?.product_env);
	const cloudinaryDomain = safeString(props.cloudinaryDomain ?? cloudCfg?.baseUrl) ?? 'https://res.cloudinary.com/';
	const width = parseNumber(props.width ?? 1280);
	const height = parseNumber(props.height ?? 720);
	const quality = parseNumber(props.quality ?? 75);
	const transforms = safeString(props.cloudinaryTransforms) || 'f_auto,c_limit,q_auto,dpr_auto';
	const preload = safeString(props.preload) as 'auto' | 'metadata' | 'none' | undefined;
	const id = deriveMediaId({ id: props.id, name: safeString(props.name), title: props.title, alt: undefined, src: normalizedSrc });
	const posterSrc = normalizedPoster;
	const title = safeString(props.title) || undefined;
	const isCloudinaryAvailable = !!cloudinaryEnv;
	const effectiveVariant = currentVariant === 'cloudinary' ? 'cloudinary' : 'html';

	useEffect(() => {
		if (effectiveVariant === 'cloudinary' && !isCloudinaryAvailable) {
			setCurrentVariant('html');
		}
	}, [effectiveVariant, isCloudinaryAvailable]);

	const buildUrl = (src: string) => {
		return buildCloudinaryUrl({
			src,
			productEnv: cloudinaryEnv,
			cloudinaryDomain,
			quality,
			width,
			transforms,
		});
	};

	const cloudinarySource = isCloudinaryAvailable
		? buildUrl(normalizedSrc)
		: normalizedSrc;
	const cloudinaryPoster = posterSrc && isCloudinaryAvailable ? buildUrl(posterSrc) : posterSrc;

	const videoSrc = currentVariant === 'cloudinary' && isCloudinaryAvailable ? cloudinarySource : normalizedSrc;
	const posterUrl = currentVariant === 'cloudinary' && cloudinaryPoster ? cloudinaryPoster : posterSrc;

	const videoProps: React.VideoHTMLAttributes<HTMLVideoElement> = {
		id: id || undefined,
		className: safeString(props.className) || 'smart-video',
		style: props.style,
		title,
		src: videoSrc,
		poster: posterUrl,
		autoPlay: props.autoPlay ?? false,
		muted: props.muted ?? false,
		loop: props.loop ?? false,
		controls: props.controls ?? true,
		playsInline: props.playsInline ?? true,
		preload: preload || (props.aboveFold ? 'auto' : 'metadata'),
		width: width,
		height: height,
		onError: (event) => {
			if (currentVariant === 'cloudinary') {
				console.warn(
					`SmartVideo: Cloudinary video failed for "${normalizedSrc}", falling back to HTML video`,
					event
				);
				setCurrentVariant('html');
			}
			if (props.onError) props.onError(event);
		},
	};

	return (
		<video {...videoProps}>
			<track
				kind="captions"
				src={props.captionsSrc || undefined}
				srcLang="en"
				label="English captions"
				default
			/>
			Your browser does not support the HTML5 Video element.
		</video>
	);
}
