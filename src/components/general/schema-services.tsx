import React from 'react';
import PropTypes, { InferProps } from 'prop-types';

/**
 * Services Schema Component
 * Generates JSON-LD structured data for services
 * https://schema.org/Service
 */

export interface ServiceItem {
	name: string;
	description: string;
	url?: string;
	image?: string;
	areaServed?: string | string[];
}

const servicesSchemaPropTypes = {
	siteInfo: PropTypes.object,
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

export interface ServicesSchemaProps {
	siteInfo?: {
		name?: string;
		url?: string;
		image?: string;
		telephone?: string;
		email?: string;
		services?: ServiceItem[];
		[key: string]: any;
	};
	provider?: {
		name: string;
		url: string;
		logo?: string;
		telephone?: string;
		email?: string;
	};
	services?: ServiceItem[];
}

export function ServicesSchema(props: ServicesSchemaProps) {
	const siteInfo = props.siteInfo;
	const services = (siteInfo?.services || props.services || []) as ServiceItem[];
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

	const serviceObjects = services.map((service) => ({
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

ServicesSchema.propTypes = servicesSchemaPropTypes;

export default ServicesSchema;
