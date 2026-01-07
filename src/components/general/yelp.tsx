
"use client";

import React, { useState, useEffect } from "react";
import PropTypes, { InferProps } from 'prop-types';

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


YelpReviews.propTypes = {
	businessID: PropTypes.string.isRequired,
	key: PropTypes.string,
};
export type YelpReviewsType = InferProps<typeof YelpReviews.propTypes>;
export function YelpReviews(props: YelpReviewsType) {
	const [reviews, setReviews] = useState([]);
	const [loading, setLoading] = useState(true);
	const [error, setError] = useState<Error>();

	useEffect(() => {
		const fetchReviews = async () => {
			const apiKey = 'YOUR_YELP_API_KEY';
			const url = `https://cors-anywhere.herokuapp.com/https://api.yelp.com/v3/businesses/${props.businessID}/reviews`;

			try {
				const response = await fetch(url, {
					headers: {
						Authorization: `Bearer ${apiKey}`,
					},
				});

				if (!response.ok) {
					throw new Error(`HTTP error! status: ${response.status}`);
				}

				const data = await response.json();
				setReviews(data.reviews);
				setLoading(false);
			} catch (e: any) {
				setError(e);
				setLoading(false);
			}
		};

		fetchReviews();
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
