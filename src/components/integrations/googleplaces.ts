/**
 * Google Places API Integration
 * Handles autocomplete predictions and place details for address validation
 */

import { usePixelatedConfig } from '../config/config.client';
import { smartFetch } from '../general/smartfetch';
import { buildUrl } from '../general/urlbuilder';

interface PlacePrediction {
	placeId: string;
	mainText: string;
	secondaryText?: string;
	fullText: string;
}

interface AddressComponent {
	long_name: string;
	short_name: string;
	types: string[];
}

interface PlaceDetails {
	street1?: string;
	city?: string;
	state?: string;
	zip?: string;
	country?: string;
	formattedAddress: string;
	addressComponents: AddressComponent[];
}

/**
 * GooglePlacesService — Thin service for Google Places API interactions using googleapis
 */
export class GooglePlacesService {
	private apiKey: string | null = null;
	private sessionToken: string | null = null;
	private requestCache: Map<string, PlacePrediction[]> = new Map();
	private cacheTTL: number = 3600000; // 1 hour default

	constructor(config?: any) {
		if (config) {
			this.apiKey = config.apiKey || null;
			this.cacheTTL = config.cacheTTL || 3600000;
		}
		this.sessionToken = this.generateSessionToken();
	}

	/**
	 * Generate or return cached session token for Places requests
	 */
	private generateSessionToken(): string {
		return `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
	}

	/**
	 * Get autocomplete predictions for a search input
	 * Uses Google Places Autocomplete API (web service version via googleapis)
	 */
	async getPlacePredictions(input: string, config?: any): Promise<PlacePrediction[]> {
		if (!input || input.length < 2) return [];

		const cacheKey = `predictions_${input}`;
		const cached = this.requestCache.get(cacheKey);
		if (cached) return cached;

		try {
			const apiKey = config?.googlePlaces?.apiKey || this.apiKey;
			
			if (!apiKey) {
				console.error('Google Places API key not configured');
				return [];
			}

			const restrictions = config?.googlePlaces?.countryRestrictions || ['us'];
			const params: Record<string, any> = {
				input: input,
				key: apiKey,
				sessiontoken: this.sessionToken,
			};

			if (restrictions.length > 0) {
				params.components = `country:${restrictions.join('|country:')}`;
			}

			// Use global proxy to avoid CORS issues
			const proxyURL = config?.global?.proxyUrl || '';

			const apiUrl = buildUrl({
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'autocomplete', 'json'],
				params: params,
				proxyUrl: proxyURL || undefined,
			});

			const data = await smartFetch(apiUrl, {
				proxy: proxyURL ? { url: proxyURL, fallbackOnCors: true } : undefined,
			});

			if (!data.predictions) {
				return [];
			}

			const predictions: PlacePrediction[] = data.predictions.map((pred: any) => ({
				placeId: pred.place_id,
				mainText: pred.structured_formatting?.main_text || pred.description,
				secondaryText: pred.structured_formatting?.secondary_text,
				fullText: pred.description,
			}));

			// Cache for TTL
			this.requestCache.set(cacheKey, predictions);
			setTimeout(() => this.requestCache.delete(cacheKey), this.cacheTTL);

			return predictions;
		} catch (error) {
			console.error('Error fetching place predictions:', error);
			return [];
		}
	}

	/**
	 * Get detailed place information including address components
	 */
	async getPlaceDetails(placeId: string, config?: any): Promise<PlaceDetails | null> {
		try {
			const apiKey = config?.googlePlaces?.apiKey || this.apiKey;
			if (!apiKey) {
				console.error('Google Places API key not configured');
				return null;
			}

			// Use global proxy to avoid CORS issues
			const proxyURL = config?.global?.proxyUrl || '';

			const apiUrl = buildUrl({
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'details', 'json'],
				params: {
					place_id: placeId,
					key: apiKey,
					fields: 'address_component,formatted_address',
					sessiontoken: this.sessionToken
				},
				proxyUrl: proxyURL || undefined,
			});

			const data = await smartFetch(apiUrl, {
				proxy: proxyURL ? { url: proxyURL, fallbackOnCors: true } : undefined,
			});

			if (!data.result) return null;

			const result = data.result;
			const addressComponents: AddressComponent[] = result.address_components || [];

			// Parse address components
			const parsed: PlaceDetails = {
				formattedAddress: result.formatted_address || '',
				addressComponents: addressComponents,
			};

			// Extract standard address fields
			for (const component of addressComponents) {
				const types = component.types || [];
				if (types.includes('street_number') || types.includes('route')) {
					parsed.street1 = (parsed.street1 || '') + (component.long_name || '') + ' ';
				} else if (types.includes('locality')) {
					parsed.city = component.long_name;
				} else if (types.includes('administrative_area_level_1')) {
					parsed.state = component.short_name;
				} else if (types.includes('postal_code')) {
					parsed.zip = component.long_name;
				} else if (types.includes('country')) {
					parsed.country = component.short_name;
				}
			}

			if (parsed.street1) {
				parsed.street1 = parsed.street1.trim();
			}

			return parsed;
		} catch (error) {
			console.error('Error fetching place details:', error);
			return null;
		}
	}

	/**
	 * Validate that address is in allowed country
	 */
	isValidCountry(placeDetails: PlaceDetails, allowedCountries: string[] = ['US']): boolean {
		if (!placeDetails.country) return false;
		return allowedCountries.includes(placeDetails.country.toUpperCase());
	}

	/**
	 * Clear cached predictions
	 */
	clearCache(): void {
		this.requestCache.clear();
	}
}

/**
 * Factory function to get configured GooglePlacesService instance
 */
export function getGooglePlacesService(config?: any): GooglePlacesService {
	return new GooglePlacesService(config);
}
