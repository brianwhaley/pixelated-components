import React from 'react';
import PropTypes from "prop-types";
import type { SiteInfo } from '../config/config.types';

export interface WebsiteSchemaProps {
	siteInfo?: SiteInfo;
	name?: string;
	url?: string;
	description?: string;
	keywords?: string;
	inLanguage?: string;
	sameAs?: string[];
	potentialAction?: {
		'@type'?: string;
		target: {
			'@type': string;
			urlTemplate: string;
		};
		'query-input'?: string;
	};
	publisher?: {
		'@type'?: string;
		name: string;
		url?: string;
		logo?: {
			'@type'?: string;
			url: string;
			width?: number;
			height?: number;
		};
	};
	copyrightYear?: number;
	copyrightHolder?: {
		'@type'?: string;
		name: string;
		url?: string;
	};
}

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
	keywords: PropTypes.string,
	inLanguage: PropTypes.string,
	sameAs: PropTypes.arrayOf(PropTypes.string),
	potentialAction: PropTypes.shape({
		'@type': PropTypes.string,
		target: PropTypes.shape({
			'@type': PropTypes.string,
			urlTemplate: PropTypes.string
		}).isRequired,
		'query-input': PropTypes.string
	}),
	publisher: PropTypes.shape({
		'@type': PropTypes.string,
		name: PropTypes.string.isRequired,
		url: PropTypes.string,
		logo: PropTypes.shape({
			'@type': PropTypes.string,
			url: PropTypes.string.isRequired,
			width: PropTypes.number,
			height: PropTypes.number
		})
	}),
	copyrightYear: PropTypes.number,
	copyrightHolder: PropTypes.shape({
		'@type': PropTypes.string,
		name: PropTypes.string.isRequired,
		url: PropTypes.string
	}),
	siteInfo: PropTypes.object
};

export type WebsiteSchemaType = WebsiteSchemaProps;

export function WebsiteSchema (props: WebsiteSchemaProps) {
	const siteInfo = props.siteInfo;
	const name = props.name || siteInfo?.name;
	const url = props.url || siteInfo?.url;
	if (!name || !url) {
		return null;
	}

	const description = props.description || siteInfo?.description;
	const keywords = props.keywords || siteInfo?.keywords;
	const inLanguage = props.inLanguage || siteInfo?.default_locale;
	const sameAs = props.sameAs || siteInfo?.sameAs;
	const publisher = props.publisher || buildPublisher(siteInfo);
	const potentialAction = props.potentialAction || buildPotentialAction(siteInfo?.potentialAction);
	const copyrightYear = props.copyrightYear ?? siteInfo?.copyrightYear;
	const copyrightHolder = props.copyrightHolder || buildCopyrightHolder(siteInfo);

	const schemaData = {
		'@context': 'https://schema.org',
		'@type': 'WebSite',
		name,
		url,
		...(description && { description }),
		...(keywords && { keywords }),
		...(inLanguage && { inLanguage }),
		...(sameAs && sameAs.length ? { sameAs } : {}),
		...(publisher && { publisher }),
		...(potentialAction && { potentialAction }),
		...(copyrightYear != null && { copyrightYear }),
		...(copyrightHolder && { copyrightHolder })
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
		/>
	);
}

function buildPublisher(siteInfo?: SiteInfo) {
	if (!siteInfo) {
		return undefined;
	}
	if (!siteInfo.name) {
		return undefined;
	}
	const logoUrl = siteInfo.image;
	const logoWidth = parseDimension(siteInfo.image_width);
	const logoHeight = parseDimension(siteInfo.image_height);
	const logo = logoUrl
		? {
			'@type': 'ImageObject',
			url: logoUrl,
			...(logoWidth !== undefined && { width: logoWidth }),
			...(logoHeight !== undefined && { height: logoHeight })
		}
		: undefined;
	return {
		'@type': siteInfo.publisherType || 'Organization',
		name: siteInfo.name,
		...(siteInfo.url && { url: siteInfo.url }),
		...(logo && { logo })
	};
}

function buildCopyrightHolder(siteInfo?: SiteInfo) {
	if (!siteInfo?.name) {
		return undefined;
	}
	const holderType = siteInfo.publisherType || 'Organization';
	return {
		'@type': holderType,
		name: siteInfo.name,
		...(siteInfo.url && { url: siteInfo.url })
	};
}

function buildPotentialAction(action?: SiteInfo['potentialAction']) {
	if (!action || !action.target) {
		return undefined;
	}
	const queryInput = action['query-input'] ?? action.queryInput;
	return {
		'@type': action['@type'] ?? 'SearchAction',
		target: {
			'@type': 'EntryPoint',
			urlTemplate: action.target
		},
		...(queryInput && { 'query-input': queryInput })
	};
}

function parseDimension(value?: string | number) {
	if (typeof value === 'number') {
		return value;
	}
	if (!value) {
		return undefined;
	}
	const parsed = Number(value);
	return Number.isNaN(parsed) ? undefined : parsed;
}
