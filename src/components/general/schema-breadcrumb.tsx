'use client';

import React from 'react';
import PropTypes, { InferProps } from 'prop-types';
import type { Route } from './metadata.functions';

interface BreadcrumbListItem {
	'@type': string;
	'position': number;
	'name': string;
	'item': string;
}

interface BreadcrumbListJsonLD {
	'@context': string;
	'@type': string;
	'itemListElement': BreadcrumbListItem[];
}

/**
 * Build breadcrumb trail from root to current path.
 * e.g., "/store/item-slug" produces ["/", "/store", "/store/item-slug"]
 */
function buildPathSegments(currentPath: string): string[] {
	const segments = ['/'];
	if (currentPath === '/') return segments;

	const parts = currentPath.split('/').filter(Boolean);
	let accumulated = '';

	for (const part of parts) {
		accumulated += '/' + part;
		segments.push(accumulated);
	}

	return segments;
}

/**
 * Determine breadcrumb name for a path segment.
 * Uses route name if exact match found, otherwise uses humanized path segment.
 */
function getSegmentName(routes: Route[], path: string, segment: string): string {
	if (path === '/') return 'Home';

	// Only use exact route matches with valid paths to avoid duplicating parent breadcrumb names
	const route = routes.find((r) => r.path && r.path === path);
	if (route) return route.name || segment;

	// Fallback: humanize the path segment
	return segment
		.split('-')
		.map((word) => word.charAt(0).toUpperCase() + word.slice(1))
		.join(' ');
}

/**
 * BreadcrumbListSchema — auto-generates a breadcrumb list as JSON-LD from routes.json data.
 * Parses the current path, builds breadcrumb trail by matching path segments to routes array,
 * and embeds as schema.org/BreadcrumbList for SEO rich snippets.
 * Accepts flexible route objects from routes.json with any additional properties.
 *
 * @param {array} [props.routes] - Routes array from routes.json with name and optional path properties.
 * @param {string} [props.currentPath] - Current page path (e.g. "/store/vintage-oakley"). Defaults to "/" if not provided.
 * @param {string} [props.siteUrl] - Full domain URL from siteInfo.url. Defaults to https://example.com.
 */
BreadcrumbListSchema.propTypes = {
	/** Routes array from routes.json. Accepts routes with any properties; only uses name and path. */
	routes: PropTypes.arrayOf(PropTypes.object).isRequired,
	/** Current page path to generate breadcrumbs for (e.g. "/store/item-slug"). Defaults to "/". */
	currentPath: PropTypes.string,
	/** Site domain URL for constructing full breadcrumb URLs. Defaults to https://example.com. */
	siteUrl: PropTypes.string,
};
export type BreadcrumbListSchemaType = InferProps<typeof BreadcrumbListSchema.propTypes>;
export function BreadcrumbListSchema({
	routes,
	currentPath = '/',
	siteUrl = 'https://example.com',
}: BreadcrumbListSchemaType) {
	// Type-safe conversion: routes prop is now flexible (accepts any object)
	// Filter to ensure only valid Route objects with 'name' property
	const validRoutes: Route[] = (Array.isArray(routes)
		? routes.filter((r): r is Route => !!(r && typeof r === 'object' && 'name' in r))
		: []) as Route[];

	const pathSegments = buildPathSegments(currentPath || '/');
	const finalSiteUrl = siteUrl || 'https://example.com';

	const itemListElement: BreadcrumbListItem[] = pathSegments.map(
		(path, index) => {
			const segment = path.split('/').filter(Boolean).pop() || 'Home';
			return {
				'@type': 'ListItem',
				'position': index + 1,
				'name': getSegmentName(validRoutes, path, segment),
				'item': `${finalSiteUrl.replace(/\/$/, '')}${path}`,
			};
		}
	);

	const jsonLD: BreadcrumbListJsonLD = {
		'@context': 'https://schema.org',
		'@type': 'BreadcrumbList',
		'itemListElement': itemListElement,
	};

	return (
		<script
			type="application/ld+json"
			dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLD) }}
		/>
	);
}
