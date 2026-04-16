
"use client";

import React, { useState, useEffect } from "react";
import PropTypes, { InferProps } from 'prop-types';
import { smartFetch } from '../foundation/smartfetch';

/* 
NOTE : development has stopped for this component 
as Yelp Base API Access costs $229 per month.  
Not ok.  
*/


/* 
https://www.yelp.com/developers
https://www.google.com/search?q=yelp+reviews+react+component&oq=yelp+reviews+react+component&gs_lcrp=EgZjaHJvbWUyBggAEEUYOTIHCAEQIRigATIHCAIQIRigATIHCAMQIRigATIHCAQQIRigATIHCAUQIRigATIHCAYQIRirAtIBCDYzOThqMWo3qAIAsAIA&sourceid=chrome&ie=UTF-8
https://www.reddit.com/r/nextjs/comments/16smhqa/next_js_fetching_data_from_yelp_api/
https://helloputnam.medium.com/easiest-way-to-include-business-reviews-on-a-web-app-google-facebook-yelp-etc-de3e243bbe75
*/


/**
 * YelpReviews — Fetch and display Yelp reviews for a given business ID (note: Yelp API access may require paid plan).
 *
 * @param {string} [props.businessID] - Yelp business ID used to fetch reviews (required).
 * @param {string} [props.key] - Optional API key (not used by the demo placeholder implementation).
 */
YelpReviews.propTypes = {
/** Yelp business identifier */
	businessID: PropTypes.string.isRequired,
	/** Optional Yelp API key */
	key: PropTypes.string,
};
export type YelpReviewsType = InferProps<typeof YelpReviews.propTypes>;
export function YelpReviews(props: YelpReviewsType) {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error>();

	const safeSetState = (setter: React.Dispatch<React.SetStateAction<any>>, value: any) => {
		if (typeof window !== 'undefined') {
			setter(value);
		}
	};

	useEffect(() => {
		let isMounted = true;
		const fetchReviews = async () => {
			if (typeof window === 'undefined' || !isMounted) {
				return;
			}

			const apiKey = 'YOUR_YELP_API_KEY';
			const url = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${props.businessID}/reviews`;

			try {
				const data = await smartFetch(url, {
					requestInit: {
						headers: {
							Authorization: `Bearer ${apiKey}`,
						},
					},
				});

				if (!isMounted) return;
				safeSetState(setReviews, data.reviews);
				safeSetState(setLoading, false);
			} catch (e: any) {
				if (!isMounted) return;
				safeSetState(setError, e);
				safeSetState(setLoading, false);
			}
		};

		fetchReviews();

		return () => {
			isMounted = false;
		};
	}, [props.businessID]);

	if (loading) {
		return <p>Loading reviews...</p>;
	}

	if (error) {
		return <p>Error: {error.message}</p>;
	}

	return (
		<div>
			<h3>Yelp Reviews</h3>
			{reviews.map((review: any) => (
				<div key={review.id} className="review">
					<p className="rating">Rating: {review.rating}</p>
					<p className="text">{review.text}</p>
					<p className="user">
                        - {review.user.name}
					</p>
					<hr />
				</div>
			))}
		</div>
	);
}
