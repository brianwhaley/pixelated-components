'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { siteInfo } from '@/test/test-data';

/**
 * Services Schema Component
 * Generates JSON-LD structured data for services
 * https://schema.org/Service
 */

/**
 * ServicesSchema — Inject JSON-LD <script> tags for each service offered by the business, using schema.org/Service format.
 *
 * @param {object} [props.siteInfo] - Optional site information object containing business details and services array.
 * @param {object} [props.provider] - Optional provider information object to override siteInfo for the service provider.
 * @param {array} [props.services] - Optional array of service objects to override siteInfo.services.
 */
ServicesSchema.propTypes = {
	siteInfo: PropTypes.shape({
		name: PropTypes.string,
		url: PropTypes.string,
		image: PropTypes.string,
		telephone: PropTypes.string,
		email: PropTypes.string,
		services: PropTypes.arrayOf(PropTypes.shape({
			name: PropTypes.string.isRequired,
			description: PropTypes.string.isRequired,
			url: PropTypes.string,
			image: PropTypes.string,
			areaServed: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
		}))
	}),
	provider: PropTypes.shape({
		name: PropTypes.string.isRequired,
		url: PropTypes.string.isRequired,
		logo: PropTypes.string,
		telephone: PropTypes.string,
		email: PropTypes.string,
	}),
	services: PropTypes.arrayOf(PropTypes.shape({
		name: PropTypes.string.isRequired,
		description: PropTypes.string.isRequired,
		url: PropTypes.string,
		image: PropTypes.string,
		areaServed: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
	})),
};
export type ServicesSchemaType = InferProps<typeof ServicesSchema.propTypes>;
export function ServicesSchema(props: ServicesSchemaType) {
	const siteInfo = props.siteInfo; 
	const services = (siteInfo?.services || props.services || []);
	const provider = props.provider || {
		name: siteInfo?.name || '',
		url: siteInfo?.url || '',
		logo: siteInfo?.image,
		telephone: siteInfo?.telephone,
		email: siteInfo?.email
	};

	if (!services.length || !provider.name) {
		return null;
	}

	const serviceObjects = services.filter((service): service is NonNullable<typeof service> => service != null).map((service) => ({
		'@type': 'Service',
		name: service.name,
		description: service.description,
		...(service.url && { url: service.url }),
		...(service.image && { image: service.image }),
		...(service.areaServed && { areaServed: service.areaServed }),
		provider: {
			'@type': 'LocalBusiness',
			name: provider.name,
			url: provider.url,
			...(provider.logo && { logo: provider.logo }),
			...(provider.telephone && { telephone: provider.telephone }),
			...(provider.email && { email: provider.email })
		}
	}));

	return (
		<>
			{serviceObjects.map((service, idx) => (
				<script
					key={idx}
					type="application/ld+json"
					dangerouslySetInnerHTML={{ __html: JSON.stringify({
						'@context': 'https://schema.org',
						...service
					}) }}
				/>
			))}
		</>
	);
}
