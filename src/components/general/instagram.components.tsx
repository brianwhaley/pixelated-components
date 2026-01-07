'use client';

import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { getInstagramTiles } from '../general/instagram.functions';
import { Tiles } from './tiles';
import type { CarouselCardType } from './carousel';

InstagramTiles.propTypes = {
	accessToken: PropTypes.string,
	userId: PropTypes.string,
	limit: PropTypes.number,
	rowCount: PropTypes.number,
	useThumbnails: PropTypes.bool,
	includeVideos: PropTypes.bool,
	includeCaptions: PropTypes.bool,
};
export type InstagramTilesType = InferProps<typeof InstagramTiles.propTypes>;
export function InstagramTiles(props: InstagramTilesType) {
	const [tiles, setTiles] = useState<CarouselCardType[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const result = await getInstagramTiles({
					accessToken: props.accessToken ?? undefined,
					userId: props.userId ?? undefined,
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
	}, [props.accessToken, props.userId, props.limit, props.useThumbnails, props.includeVideos, props.includeCaptions]);

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
