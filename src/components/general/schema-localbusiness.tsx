'use client';

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

/**
 * LocalBusinessSchema — generates JSON-LD for a LocalBusiness using provided props or a fallback `siteInfo`.
 *
 * @param {string} [props.name] - Business name (overrides siteInfo.name).
 * @param {object} [props.address] - Address object containing streetAddress, addressLocality, addressRegion, postalCode, and addressCountry.
 * @param {string} [props.streetAddress] - Street address line.
 * @param {string} [props.addressLocality] - City or locality.
 * @param {string} [props.addressRegion] - State, region or province.
 * @param {string} [props.postalCode] - Postal/ZIP code.
 * @param {string} [props.addressCountry] - Country (defaults to 'United States' when missing).
 * @param {string} [props.telephone] - Contact phone number.
 * @param {string} [props.url] - Canonical website URL.
 * @param {string} [props.logo] - Logo image URL.
 * @param {string} [props.image] - Representative image URL.
 * @param {oneOfType} [props.openingHours] - Opening hours string or array in schema.org format.
 * @param {string} [props.description] - Short business description.
 * @param {string} [props.email] - Contact email address.
 * @param {string} [props.priceRange] - Price range (e.g. '$$', optional).
 * @param {arrayOf} [props.sameAs] - Array of social/profile URLs for schema 'sameAs'.
 * @param {object} [props.siteInfo] - Site-level fallback information object.
 */
LocalBusinessSchema.propTypes = {
/** Business name to include in schema (falls back to siteInfo.name). */
	name: PropTypes.string,
	/** Address object for the business */
	address: PropTypes.shape({
		/** Street address for the business. */
		streetAddress: PropTypes.string,
		/** City or locality for the business address. */
		addressLocality: PropTypes.string,
		/** State/region for the business address. */
		addressRegion: PropTypes.string,
		/** Postal or ZIP code for the address. */
		postalCode: PropTypes.string,
		/** Country for the address (defaults to United States when absent). */
		addressCountry: PropTypes.string,
	}),
	/** Street address for the business. */
	streetAddress: PropTypes.string,
	/** City or locality for the business address. */
	addressLocality: PropTypes.string,
	/** State/region for the business address. */
	addressRegion: PropTypes.string,
	/** Postal or ZIP code for the address. */
	postalCode: PropTypes.string,
	/** Country for the address (defaults to United States when absent). */
	addressCountry: PropTypes.string,
	/** Contact telephone number. */
	telephone: PropTypes.string,
	/** Canonical website URL. */
	url: PropTypes.string,
	/** Logo image URL for schema/logo property. */
	logo: PropTypes.string,
	/** Representative image URL. */
	image: PropTypes.string,
	/** Opening hours as a string or array in schema.org format (e.g., "Mo-Fr 09:00-17:00"). */
	openingHours: PropTypes.oneOfType([PropTypes.string, PropTypes.arrayOf(PropTypes.string)]),
	/** Short description for schema. */
	description: PropTypes.string,
	/** Contact email address. */
	email: PropTypes.string,
	/** Price range string (e.g. '$$'). */
	priceRange: PropTypes.string,
	/** Array of profile/URL strings for sameAs (social links). */
	sameAs: PropTypes.arrayOf(PropTypes.string), // Social media profiles
	/** Site-level fallback information object (used when props omitted). */
	siteInfo: PropTypes.object // Required siteinfo from parent component
};
export type LocalBusinessSchemaType = InferProps<typeof LocalBusinessSchema.propTypes>;
export function LocalBusinessSchema (props: LocalBusinessSchemaType) {
	// const config = usePixelatedConfig();
	const siteInfo = props.siteInfo as SiteInfo | undefined;

	// Use props if provided, otherwise fall back to siteInfo
	const name = props.name || siteInfo?.name;
	const address = props.address || siteInfo?.address;
	const streetAddress = props.streetAddress || siteInfo?.address?.streetAddress;
	const addressLocality = props.addressLocality || siteInfo?.address?.addressLocality;
	const addressRegion = props.addressRegion || siteInfo?.address?.addressRegion;
	const postalCode = props.postalCode || siteInfo?.address?.postalCode;
	const addressCountry = props.addressCountry || siteInfo?.address?.addressCountry || 'United States';
	const telephone = props.telephone || siteInfo?.telephone;
	const url = props.url || siteInfo?.url;
	const logo = props.logo || siteInfo?.image;
	const image = props.image || siteInfo?.image || logo;
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
			...( address || {
				streetAddress,
				addressLocality,
				addressRegion,
				postalCode,
				addressCountry
			})
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
