'use client';

import React, { useEffect, useState, useCallback } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { PageGridItem } from '../../general/semantic';
import "./site-health.css";
import { useSiteHealthMockData } from './site-health-mock-context';

interface EndpointConfig {
	endpoint: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers?: Record<string, string>;
	params?: Record<string, string>;
	body?: any;
	responseTransformer?: (response: any) => any;
}

/**
 * SiteHealthTemplate — Generic data-fetching and rendering wrapper used by site-health panels.
 *
 * @param {string} [props.siteName] - Site identifier used to query health endpoints.
 * @param {string} [props.title] - Optional title rendered in the panel header.
 * @param {function} [props.children] - Render prop that receives fetched data and returns JSX.
 * @param {shape} [props.endpoint] - Endpoint configuration object including `endpoint`, optional `params`, and a `responseTransformer`.
 * @param {oneOf} [props.method] - HTTP method used to call the endpoint (default: 'GET').
 * @param {object} [props.headers] - Optional headers to include in the request.
 * @param {object} [props.params] - Optional query params to include in the request.
 * @param {any} [props.body] - Optional request body for non-GET requests.
 * @param {function} [props.responseTransformer] - Function to transform the API response into the shape consumed by the children render prop.
 * @param {boolean} [props.enableCacheControl] - When true, respects the `cache` query param to bypass or enable caching.
 * @param {number} [props.columnSpan] - Optional grid column span when rendering as a card.
 * @param {any} [props.data] - Optional pre-fetched data to render instead of calling the endpoint.
 */
SiteHealthTemplate.propTypes = {
/** Site identifier used to query health endpoints */
	siteName: PropTypes.string.isRequired,
	/** Optional title for the panel */
	title: PropTypes.string,
	/** Render prop receiving the fetched data */
	children: PropTypes.func.isRequired,
	/** Endpoint configuration */
	endpoint: PropTypes.shape({
		endpoint: PropTypes.string.isRequired,
		/** HTTP method (GET/POST/PUT/DELETE) */
		method: PropTypes.oneOf(['GET', 'POST', 'PUT', 'DELETE']),
		/** Optional request headers */
		headers: PropTypes.object,
		/** Optional query parameters */
		params: PropTypes.object,
		/** Optional request body (for POST/PUT) */
		body: PropTypes.any,
		/** Optional response transformer function */
		responseTransformer: PropTypes.func,
	}),
	/** Respect cache control query param when true */
	enableCacheControl: PropTypes.bool,
	/** Grid column span for card rendering */
	columnSpan: PropTypes.number,
	/** Optional pre-fetched data to render */
	data: PropTypes.any,
};
export type SiteHealthTemplateType = InferProps<typeof SiteHealthTemplate.propTypes>;
export function SiteHealthTemplate<T>(
	props: SiteHealthTemplateType
) {
	const typedProps = props as SiteHealthTemplateType & {
		children: (data: T | null) => React.ReactNode;
		endpoint?: EndpointConfig;
		data?: T;
	};

	const mockDataMap = useSiteHealthMockData();
	const storyMockData = typedProps.title ? (mockDataMap?.[typedProps.title] as T | undefined) : undefined;
	const [data, setData] = useState<T | null>(typedProps.data ?? storyMockData ?? null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Default fetch function for endpoint-based requests
	const fetchFromEndpoint = useCallback(async (useCache: boolean = true): Promise<T> => {
		if (!typedProps.endpoint) {
			throw new Error('Endpoint is not configured for SiteHealthTemplate');
		}
		const { endpoint: endpointUrl, method = 'GET', headers = {}, params = {}, body, responseTransformer } = typedProps.endpoint;

		// Build URL with siteName parameter
		const url = new URL(endpointUrl, window.location.origin);
		url.searchParams.set('siteName', encodeURIComponent(typedProps.siteName));

		// Add additional params
		Object.entries(params).forEach(([key, value]) => {
			url.searchParams.set(key, value);
		});

		// Add cache control if not using cache
		if (!useCache) {
			url.searchParams.set('cache', 'false');
		}


		const response = await fetch(url.toString(), {
			method,
			headers: {
				'Content-Type': 'application/json',
				...headers,
			},
			body: body ? JSON.stringify(body) : undefined,
		});

		if (!response.ok) {
			throw new Error(`HTTP ${response.status}: ${response.statusText}`);
		}

		const result = await response.json();

		if (!result.success) {
			throw new Error(result.error || 'API request failed');
		}

		// Apply response transformer if provided
		return responseTransformer ? responseTransformer(result) : result;
	}, [typedProps.endpoint, typedProps.siteName]);

	const loadData = useCallback(async () => {
		if (!typedProps.siteName) {
			setData(null);
			setLoading(false);
			setError(null);
			return;
		}

		setLoading(true);
		setError(null);

		try {
			// Check for cache control from URL query parameters
			const urlParams = new URLSearchParams(window.location.search);
			const cacheParam = urlParams.get('cache');
			// Correctly compute useCache: if enableCacheControl is enabled (default true), honor cacheParam; if disabled, caching is off
			const enableCacheControl = (typeof typedProps.enableCacheControl === 'boolean') ? typedProps.enableCacheControl : true;
			const useCache = enableCacheControl ? (String(cacheParam).toLowerCase() !== 'false') : false;
			const result = await fetchFromEndpoint(useCache);

			setData(result);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load data');
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [typedProps.siteName, fetchFromEndpoint, typedProps.enableCacheControl]);

	useEffect(() => {
		if (!typedProps.siteName) {
			return;
		}

		if (storyMockData || typeof typedProps.data !== 'undefined') {
			return;
		}

		loadData();
	}, [loadData, typedProps.siteName, typedProps.data, storyMockData]);

	useEffect(() => {
		if (!typedProps.siteName) {
			setData(null);
			setLoading(false);
			setError(null);
			return;
		}

		if (storyMockData) {
			setData(storyMockData as T);
			setLoading(false);
			setError(null);
			return;
		}

		if (typeof typedProps.data !== 'undefined') {
			setData(typedProps.data as T);
			setLoading(false);
			setError(null);
			return;
		}
	}, [typedProps.siteName, typedProps.data, storyMockData]);

	// If no site selected, show nothing
	if (!typedProps.siteName) {
		return null;
	}

	// If title is provided, render the complete card structure
	if (typedProps.title) {
		return (
			<PageGridItem className="health-card" columnSpan={typedProps.columnSpan}>
				<h2 className="health-card-title">{typedProps.title}</h2>
				<div className="health-card-content">
					{loading ? (
						<div className="health-loading">
							<div className="health-loading-spinner"></div>
							<p className="health-loading-text">Loading...</p>
						</div>
					) : error ? (
						<div className="health-error">
							<p className="health-error-text">Error: {error}</p>
						</div>
					) : (
						typedProps.children(data)
					)}
				</div>
			</PageGridItem>
		);
	}

	// Legacy mode: render content directly without wrapper
	return (
		<>
			{loading ? (
				<div className="health-loading">
					<div className="health-loading-spinner"></div>
					<p className="health-loading-text">Loading...</p>
				</div>
			) : error ? (
				<div className="health-error">
					<p className="health-error-text">Error: {error}</p>
				</div>
			) : (
				typedProps.children(data)
			)}
		</>
	);
}