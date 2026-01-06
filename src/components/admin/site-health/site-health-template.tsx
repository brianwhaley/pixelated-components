'use client';

import React, { useEffect, useState, useCallback } from 'react';
import PropTypes, { InferProps } from 'prop-types';
import { PageGridItem } from '../../general/semantic';
import "./site-health.css";

interface EndpointConfig {
	endpoint: string;
	method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
	headers?: Record<string, string>;
	params?: Record<string, string>;
	body?: any;
	responseTransformer?: (response: any) => any;
}

SiteHealthTemplate.propTypes = {
	siteName: PropTypes.string.isRequired,
	title: PropTypes.string,
	children: PropTypes.func.isRequired,
	fetchData: PropTypes.func,
	endpoint: PropTypes.shape({
		endpoint: PropTypes.string.isRequired,
		method: PropTypes.oneOf(['GET', 'POST', 'PUT', 'DELETE']),
		headers: PropTypes.object,
		params: PropTypes.object,
		body: PropTypes.any,
		responseTransformer: PropTypes.func,
	}),
	enableCacheControl: PropTypes.bool,
	columnSpan: PropTypes.number,
};
export type SiteHealthTemplateType = InferProps<typeof SiteHealthTemplate.propTypes>;
export function SiteHealthTemplate<T>(
	props: SiteHealthTemplateType
) {
	const typedProps = props as SiteHealthTemplateType & {
		children: (data: T | null) => React.ReactNode;
		fetchData?: (siteName: string, cache?: boolean) => Promise<T>;
		endpoint?: EndpointConfig;
	};

	const [data, setData] = useState<T | null>(null);
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);

	// Default fetch function for endpoint-based requests
	const fetchFromEndpoint = useCallback(async (useCache: boolean = true): Promise<T> => {
		if (!typedProps.endpoint) {
			throw new Error('Endpoint configuration is required when not using custom fetchData');
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
			const useCache = typedProps.enableCacheControl ?? true ? (cacheParam !== 'false') : true;

			// Use custom fetchData if provided, otherwise use endpoint configuration
			let result: T;
			if (typedProps.fetchData) {
				result = await typedProps.fetchData(typedProps.siteName, useCache);
			} else {
				result = await fetchFromEndpoint(useCache);
			}

			setData(result);
			setError(null);
		} catch (err) {
			setError(err instanceof Error ? err.message : 'Failed to load data');
			setData(null);
		} finally {
			setLoading(false);
		}
	}, [typedProps.siteName, typedProps.fetchData, fetchFromEndpoint, typedProps.enableCacheControl]);

	useEffect(() => {
		loadData();
	}, [loadData]);

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