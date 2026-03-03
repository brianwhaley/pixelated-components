'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';

/**
 * ReviewSchema — embeds a review as JSON-LD for SEO (schema.org/Review).
 *
 * @param {shape} [props.review] - Review object conforming to schema.org/Review; will be serialized as JSON-LD.
 * @param {string} [props.review.name] - The headline or title of the review.
 * @param {string} [props.review.reviewBody] - The body of the review content.
 * @param {string} [props.review.datePublished] - ISO date the review was published.
 * @param {shape} [props.review.author] - Author information (name and @type).
 * @param {shape} [props.review.itemReviewed] - The item being reviewed (product, service, etc.).
 * @param {shape} [props.review.reviewRating] - Rating information including ratingValue, bestRating, worstRating.
 * @param {shape} [props.review.publisher] - Organization publishing the review.
 */
ReviewSchema.propTypes = {
	/** Review information object to be serialized as JSON-LD. */
	review: PropTypes.shape({
		'@context': PropTypes.string.isRequired,
		'@type': PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		reviewBody: PropTypes.string,
		datePublished: PropTypes.string,
		author: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		}),
		itemReviewed: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
		reviewRating: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			ratingValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			bestRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			worstRating: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		}),
		publisher: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string,
		}),
	}).isRequired,
};
export type ReviewSchemaType = InferProps<typeof ReviewSchema.propTypes>;
export function ReviewSchema(props: ReviewSchemaType) {
	const { review } = props;
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(review) }}
		/>
	);
}
