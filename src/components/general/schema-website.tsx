'use client';

import React from 'react';
import PropTypes, { InferProps } from "prop-types";
import type { SiteInfo } from '../config/config.types';

/**
 * Website Schema Component
 * Generates JSON-LD structured data for websites
 * https://schema.org/WebSite
 */

/**
 * WebsiteSchema — Inject a JSON-LD <script> tag containing a WebSite schema object, using provided props or siteInfo from config.
 *
 * @param {object} [props.siteInfo] - Optional site information object containing business details to populate the schema.
 * @param {string} [props.name] - Name of the website (overrides siteInfo.name).
 * @param {string} [props.url] - URL of the website (overrides siteInfo.url).
 * @param {string} [props.description] - Description of the website (overrides siteInfo.description).
 * @param {string} [props.keywords] - Comma-separated keywords for the website (overrides siteInfo.keywords).
 * @param {string} [props.inLanguage] - Language of the website content (overrides siteInfo.default_locale).
 * @param {array} [props.sameAs] - Array of URLs representing social profiles or related sites (overrides siteInfo.sameAs).
 * @param {object} [props.potentialAction] - Object defining a potentialAction for the website, such as a SearchAction (overrides siteInfo.potentialAction).
 * @param {object} [props.publisher] - Object defining the publisher of the website, including name, url, and logo (overrides siteInfo).
 * @param {number} [props.copyrightYear] - Year of copyright for the website (overrides siteInfo.copyrightYear).
 * @param {object} [props.copyrightHolder] - Object defining the copyright holder, including name and url (overrides siteInfo).
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
export type WebsiteSchemaType = InferProps<typeof WebsiteSchema.propTypes>;
export function WebsiteSchema (props: WebsiteSchemaType) {
	const siteInfo = props.siteInfo as SiteInfo | undefined;
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
