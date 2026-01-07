import React from 'react';
import PropTypes, { InferProps } from "prop-types";
// import { usePixelatedConfig } from '../config/config.client';
import type { SiteInfo } from '../config/config.types';

/**
 * LocalBusiness Schema Component
 * Generates JSON-LD structured data for SEO
 * https://schema.org/LocalBusiness
 * 
 * This component uses siteInfo passed as props to generate schema data.
 * It does not use client-side hooks and can be rendered on the server.
 */

LocalBusinessSchema.propTypes = {
	name: PropTypes.string,
	streetAddress: PropTypes.string,
	addressLocality: PropTypes.string,
	addressRegion: PropTypes.string,
	postalCode: PropTypes.string,
	addressCountry: PropTypes.string,
	telephone: PropTypes.string,
	url: PropTypes.string,
	logo: PropTypes.string,
	image: PropTypes.string,
	openingHours: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
	description: PropTypes.string,
	email: PropTypes.string,
	priceRange: PropTypes.string,
	sameAs: PropTypes.arrayOf(PropTypes.string), // Social media profiles
	siteInfo: PropTypes.object // Required siteinfo from parent component
};

export type LocalBusinessSchemaType = InferProps<typeof LocalBusinessSchema.propTypes>;

export function LocalBusinessSchema (props: LocalBusinessSchemaType) {
	// const config = usePixelatedConfig();
	const siteInfo = (props.siteInfo as SiteInfo);

	// Use props if provided, otherwise fall back to siteInfo
	const name = props.name || siteInfo?.name;
	const streetAddress = props.streetAddress || siteInfo?.address?.streetAddress;
	const addressLocality = props.addressLocality || siteInfo?.address?.addressLocality;
	const addressRegion = props.addressRegion || siteInfo?.address?.addressRegion;
	const postalCode = props.postalCode || siteInfo?.address?.postalCode;
	const addressCountry = props.addressCountry || siteInfo?.address?.addressCountry || 'United States';
	const telephone = props.telephone || siteInfo?.telephone;
	const url = props.url || siteInfo?.url;
	const logo = props.logo || siteInfo?.image;
	const image = props.image || siteInfo?.image;
	const openingHours = props.openingHours;
	const description = props.description || siteInfo?.description;
	const email = props.email || siteInfo?.email;
	const priceRange = props.priceRange || siteInfo?.priceRange;
	const sameAs = props.sameAs || siteInfo?.sameAs;
	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'LocalBusiness',
		name,
		address: {
			'@type': 'PostalAddress',
			streetAddress,
			addressLocality,
			addressRegion,
			postalCode,
			addressCountry
		},
		telephone,
		url,
		...(logo && { logo }),
		...(image && { image }),
		...(openingHours && { openingHours }),
		...(description && { description }),
		...(email && { email }),
		...(priceRange && { priceRange }),
		...(sameAs && sameAs.length > 0 && { sameAs })
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
		/>
	);
}
