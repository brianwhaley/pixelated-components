import React from 'react';
import PropTypes, { InferProps } from "prop-types";
// import { usePixelatedConfig } from '../config/config.client';
import type { SiteInfo } from '../config/config.types';

/**
 * Website Schema Component
 * Generates JSON-LD structured data for websites
 * https://schema.org/WebSite
 * 
 * This component uses siteInfo passed as props to generate schema data.
 * It does not use client-side hooks and can be rendered on the server.
 */

WebsiteSchema.propTypes = {
	name: PropTypes.string,
	url: PropTypes.string,
	description: PropTypes.string,
	potentialAction: PropTypes.shape({
		'@type': PropTypes.string,
		target: PropTypes.shape({
			'@type': PropTypes.string,
			urlTemplate: PropTypes.string
		}),
		query: PropTypes.string
	}),
	siteInfo: PropTypes.object // Required siteinfo from parent component
};

export type WebsiteSchemaType = InferProps<typeof WebsiteSchema.propTypes>;

export function WebsiteSchema (props: WebsiteSchemaType) {
	// const config = usePixelatedConfig();
	const siteInfo = (props.siteInfo as SiteInfo);

	// Use props if provided, otherwise fall back to siteInfo
	const name = props.name || siteInfo?.name;
	const url = props.url || siteInfo?.url;
	const description = props.description || siteInfo?.description;
	const potentialAction = props.potentialAction;
	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name,
		url,
		...(description && { description }),
		...(potentialAction && { potentialAction })
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
		/>
	);
}
