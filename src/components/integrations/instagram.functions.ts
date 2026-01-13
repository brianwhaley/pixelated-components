// Server-side: Fetch Instagram media from Instagram Graph API
// Requires: Instagram Business/Creator account, Facebook Page, OAuth access token
// Returns: Array compatible with Tiles/Carousel components

import type { CarouselCardType } from '../general/carousel';

export type InstagramMedia = {
	id: string;
	media_type: 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
	media_url: string;
	thumbnail_url?: string; // for videos
	permalink: string;
	caption?: string;
	timestamp: string;
	username?: string;
};

export type InstagramMediaResponse = {
	data: InstagramMedia[];
	paging?: {
		cursors?: {
			before: string;
			after: string;
		};
		next?: string;
	};
};

/**
 * Fetch Instagram media for a user/page using Graph API
 * @param accessToken - Long-lived user access token (refresh every 60 days)
 * @param userId - Instagram Business Account ID (get via /me/accounts endpoint)
 * @param limit - Number of posts to fetch (default 25, max 100)
 * @param fields - Comma-separated fields to retrieve
 * @returns Promise of media items
 */
export async function getInstagramMedia(params: {
	accessToken?: string;
	userId?: string; // defaults to 'me'
	limit?: number;
	fields?: string;
}): Promise<InstagramMedia[]> {
	// TEMP: Hard-coded token for testing
	const accessToken = params.accessToken || 'EAAtmg2zNJnABQCcGOWOUt7tR03RAF3dBZC2HFk9T0XZCvRaTddrUos8qV0UGSswVdc5d2N0o3ZAir5sEjyiglCkoffzvTwn068WTJUgSAdaRzfqRhE6Pb8D9u9wgjJuqIpDqQRIdFTlgsIVbKZBLBP2qPx72yjO3k6IuK2ksQZB4SqkyCr7ZBy7NaVXh9x2AZDZD';
	const { userId = 'me', limit = 25, fields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,username' } = params;
	
	const url = `https://graph.instagram.com/${userId}/media?fields=${encodeURIComponent(fields)}&limit=${limit}&access_token=${accessToken}`;
	
	const response = await fetch(url, { cache: 'no-store' });
	const data: InstagramMediaResponse = await response.json();
	
	if (!response.ok || !data.data) {
		throw new Error(`Instagram API error: ${JSON.stringify(data)}`);
	}
	
	return data.data;
}

/**
 * Convert Instagram media to Tiles/Carousel compatible format
 * @param media - Array of Instagram media items
 * @param options - Transformation options
 * @returns Array of CarouselCardType for use in Tiles or Carousel
 */
export function instagramMediaToTiles(
	media: InstagramMedia[],
	options?: {
		useThumbnails?: boolean; // Use thumbnail_url for videos instead of media_url
		includeVideos?: boolean; // Include VIDEO type items (default true)
		includeCaptions?: boolean; // Use caption as bodyText (default true)
	}
): CarouselCardType[] {
	const { useThumbnails = true, includeVideos = true, includeCaptions = true } = options ?? {};
	
	return media
		.filter((item) => {
			if (!includeVideos && item.media_type === 'VIDEO') return false;
			return true;
		})
		.map((item, index) => {
			let imageUrl = item.media_url;
			if (item.media_type === 'VIDEO' && useThumbnails && item.thumbnail_url) {
				imageUrl = item.thumbnail_url;
			}
			
			return {
				index,
				cardIndex: index,
				cardLength: media.length,
				link: item.permalink,
				linkTarget: '_blank',
				image: imageUrl,
				imageAlt: item.username ? `@${item.username} on Instagram` : 'Instagram post',
				bodyText: includeCaptions ? item.caption : undefined,
			};
		});
}

/**
 * Convenience: Fetch Instagram media and convert to Tiles format in one call
 * @param accessToken - Instagram Graph API access token
 * @param userId - Instagram Business Account ID
 * @param limit - Number of posts (default 12)
 * @param options - Transformation options
 * @returns Promise of CarouselCardType array ready for Tiles/Carousel
 */
export async function getInstagramTiles(params?: {
	accessToken?: string;
	userId?: string;
	limit?: number;
	useThumbnails?: boolean;
	includeVideos?: boolean;
	includeCaptions?: boolean;
}): Promise<CarouselCardType[]> {
	const { accessToken, userId, limit = 12, useThumbnails, includeVideos, includeCaptions } = params ?? {};
	
	const media = await getInstagramMedia({ accessToken, userId, limit });
	return instagramMediaToTiles(media, { useThumbnails, includeVideos, includeCaptions });
}
