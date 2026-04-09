'use client';

import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { getInstagramTiles } from './instagram.functions';
import { usePixelatedConfig } from "../config/config.client";
import { Tiles } from '../general/tiles';
import type { CarouselCardType } from '../general/carousel';

/**
 * InstagramTiles — Fetch Instagram media and render as tiles.
 *
 * @param {string} [props.accessToken] - Instagram user access token with required permissions.
 * @param {string} [props.userId] - Instagram user ID to fetch media from.
 * @param {number} [props.limit] - Maximum number of media items to fetch (default: 12).
 * @param {number} [props.rowCount] - Number of columns/rows to use in the tiles layout.
 * @param {boolean} [props.useThumbnails] - Whether to prefer thumbnail images over full-size media.
 * @param {boolean} [props.includeVideos] - Include video posts in results when true.
 * @param {boolean} [props.includeCaptions] - Include captions in the returned tile metadata.
 */
InstagramTiles.propTypes = {
/** Instagram access token */
	accessToken: PropTypes.string,
	/** Instagram user ID */
	userId: PropTypes.string,
	/** Max number of media items to fetch */
	limit: PropTypes.number,
	/** Number of columns/rows used by Tiles layout */
	rowCount: PropTypes.number,
	/** Prefer thumbnails when available */
	useThumbnails: PropTypes.bool,
	/** Include video posts */
	includeVideos: PropTypes.bool,
	/** Include captions in tile metadata */
	includeCaptions: PropTypes.bool,
};
export type InstagramTilesType = InferProps<typeof InstagramTiles.propTypes>;
export function InstagramTiles(props: InstagramTilesType) {
	const config = usePixelatedConfig();
	const [tiles, setTiles] = useState<CarouselCardType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	const accessToken = props.accessToken ?? config?.instagram?.accessToken;
	const userId = props.userId ?? config?.instagram?.userId;

	useEffect(() => {
		(async () => {
			try {
				const result = await getInstagramTiles({
					accessToken: accessToken ?? undefined,
					userId: userId ?? undefined,
					limit: props.limit ?? 12,
					useThumbnails: props.useThumbnails ?? undefined,
					includeVideos: props.includeVideos ?? undefined,
					includeCaptions: props.includeCaptions ?? undefined,
				});
				setTiles(result);
				setLoading(false);
			} catch (e: any) {
				setError(e?.message || 'Failed to fetch Instagram media');
				setLoading(false);
			}
		})();
	}, [accessToken, userId, props.limit, props.useThumbnails, props.includeVideos, props.includeCaptions]);

	if (loading) {
		return (
			<div style={{ padding: 16 }}>
				<p>Loading Instagram posts...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div style={{ padding: 16 }}>
				<p style={{ color: 'tomato' }}>Error: {error}</p>
				<p style={{ fontSize: '0.9em', marginTop: 8 }}>
					Make sure you have a valid Instagram user access token with instagram_basic permissions.
				</p>
			</div>
		);
	}

	if (tiles.length === 0) {
		return (
			<div style={{ padding: 16 }}>
				<p>No Instagram posts found.</p>
			</div>
		);
	}

	return <Tiles cards={tiles} rowCount={props.rowCount} />;
}
