'use client';

import React, { useState, useEffect } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { getGoogleReviewsByPlaceId, GoogleReview, GooglePlaceSummary } from './google.reviews.functions';
import './google.reviews.css';

const GOOGLE_MAPS_API_KEY = 'AIzaSyBtknq7LHzN0xb0lIN3K0CXXf0swVp6ReA';

GoogleReviewsCard.propTypes = {
	placeId: PropTypes.string.isRequired,
	language: PropTypes.string,
	maxReviews: PropTypes.number,
	proxyBase: PropTypes.string,
	apiKey: PropTypes.string,
};
export type GoogleReviewsCardType = InferProps<typeof GoogleReviewsCard.propTypes>;
export function GoogleReviewsCard(props: GoogleReviewsCardType) {
	const [place, setPlace] = useState<GooglePlaceSummary | undefined>();
	const [reviews, setReviews] = useState<GoogleReview[]>([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<string | null>(null);

	useEffect(() => {
		(async () => {
			try {
				const result = await getGoogleReviewsByPlaceId({
					placeId: props.placeId,
					language: props.language ?? undefined,
					maxReviews: props.maxReviews ?? undefined,
					proxyBase: props.proxyBase ?? undefined,
					apiKey: props.apiKey || GOOGLE_MAPS_API_KEY,
				});
				setPlace(result.place);
				setReviews(result.reviews);
				setLoading(false);
			} catch (e: any) {
				const errorMessage = e?.message || 'Failed to fetch reviews';
				// Check for common CORS/network issues
				if (errorMessage.includes('Failed to fetch') || errorMessage.includes('CORS')) {
					setError('Unable to load reviews. This may be due to CORS restrictions in the browser. Try using a proxy server or server-side rendering.');
				} else {
					setError(errorMessage);
				}
				setLoading(false);
			}
		})();
	}, [props.placeId, props.language, props.maxReviews, props.proxyBase]);

	if (loading) {
		return (
			<div className="google-reviews-card">
				<p className="loading">Loading reviews...</p>
			</div>
		);
	}

	if (error) {
		return (
			<div className="google-reviews-card">
				<p className="error">Error: {error}</p>
			</div>
		);
	}

	return (
		<div className="google-reviews-card">
			<h3>{place?.name || 'Reviews'}</h3>
			{place?.formatted_address && (
				<p className="address">
					{place.formatted_address}
				</p>
			)}
			{reviews.length === 0 ? (
				<p className="no-reviews">No reviews found.</p>
			) : (
				<ul>
					{reviews.map((r, i) => (
						<li key={i}>
							<div className="review-header">
								{r.profile_photo_url && (
									<div className="profile-photo-container">
										<img
											src={r.profile_photo_url}
											alt={r.author_name}
											className="profile-photo"
										/>
									</div>
								)}
								<div>
									<div className="author-name">{r.author_name}</div>
									<div className="rating">
										{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)} {r.rating}/5
										{r.relative_time_description && <span> · {r.relative_time_description}</span>}
									</div>
								</div>
							</div>
							{r.text && <div className="review-text">{r.text}</div>}
						</li>
					))}
				</ul>
			)}
			{place && (
				<a
					href={`https://search.google.com/local/writereview?placeid=${place.place_id}`}
					target="_blank"
					rel="noopener noreferrer"
					className="write-review"
				>
					Write a review on Google →
				</a>
			)}
		</div>
	);
}
