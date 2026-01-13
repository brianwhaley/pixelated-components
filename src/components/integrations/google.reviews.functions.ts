// Server-side: Fetch Google reviews by place_id
// Requires: GOOGLE_MAPS_API_KEY or hard-coded key
// Flow: Place Details (reviews)

export type GoogleReview = {
  author_name: string;
  profile_photo_url?: string;
  rating: number; // 1..5
  relative_time_description?: string;
  text?: string;
  time?: number; // unix seconds
  author_url?: string;
  language?: string;
};

export type GooglePlaceSummary = {
  name: string;
  place_id: string;
  formatted_address?: string;
};

export async function getGoogleReviewsByPlaceId(params: {
	placeId: string;
	language?: string;
	maxReviews?: number;
	proxyBase?: string; // e.g. 'https://proxy.pixelated.tech/prod/proxy?url='
	apiKey: string;
}): Promise<{ place?: GooglePlaceSummary; reviews: GoogleReview[] }> {
	const { placeId, language, maxReviews, proxyBase, apiKey } = params;

	const detailsBase = 'https://maps.googleapis.com/maps/api/place/details/json';
	const fields = encodeURIComponent('reviews,name,place_id,formatted_address');
	const detailsUrl = `${detailsBase}?place_id=${encodeURIComponent(placeId)}&fields=${fields}${language ? `&language=${encodeURIComponent(language)}` : ''}&key=${apiKey}`;
	
	const detResp = await fetch(proxyBase ? `${proxyBase}${encodeURIComponent(detailsUrl)}` : detailsUrl, { cache: 'no-store' });
	const detData = await detResp.json();
	
	if (detData.status !== 'OK' || !detData.result) {
		return { reviews: [] };
	}
	
	const place: GooglePlaceSummary = {
		name: detData.result.name,
		place_id: detData.result.place_id,
		formatted_address: detData.result.formatted_address,
	};
	const reviews: GoogleReview[] = Array.isArray(detData.result.reviews) ? detData.result.reviews : [];
	const limited = typeof maxReviews === 'number' ? reviews.slice(0, maxReviews) : reviews;
	
	return { place, reviews: limited };
}
