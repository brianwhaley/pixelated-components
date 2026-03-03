'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';

/**
 * ProductSchema — embeds a product/offer as JSON-LD for SEO (schema.org/Product).
 *
 * @param {shape} [props.product] - Product object conforming to schema.org/Product; will be serialized as JSON-LD.
 * @param {string} [props.product.name] - The product name.
 * @param {string} [props.product.description] - Product description.
 * @param {shape} [props.product.brand] - Brand information (name and @type).
 * @param {shape} [props.product.offers] - Offer information including price, currency, URL, and availability.
 */
ProductSchema.propTypes = {
	/** Product information object to be serialized as JSON-LD. */
	product: PropTypes.shape({
		'@context': PropTypes.string.isRequired,
		'@type': PropTypes.string.isRequired,
		name: PropTypes.string.isRequired,
		description: PropTypes.string,
		image: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
		brand: PropTypes.shape({
			'@type': PropTypes.string.isRequired,
			name: PropTypes.string.isRequired,
		}),
		offers: PropTypes.oneOfType([
			PropTypes.shape({
				'@type': PropTypes.string.isRequired,
				url: PropTypes.string,
				priceCurrency: PropTypes.string,
				price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
				availability: PropTypes.string,
			}),
			PropTypes.arrayOf(
				PropTypes.shape({
					'@type': PropTypes.string.isRequired,
					url: PropTypes.string,
					priceCurrency: PropTypes.string,
					price: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
					availability: PropTypes.string,
				})
			)
		]),
		aggregateRating: PropTypes.shape({
			'@type': PropTypes.string,
			ratingValue: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
			reviewCount: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
		}),
	}).isRequired,
};
export type ProductSchemaType = InferProps<typeof ProductSchema.propTypes>;
export function ProductSchema(props: ProductSchemaType) {
	const { product } = props;
	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(product) }}
		/>
	);
}
