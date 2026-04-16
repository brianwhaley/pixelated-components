import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { buildUrl } from '../components/foundation/urlbuilder';
import { getGoogleReviewsByPlaceId } from '../components/integrations/google.reviews.functions';
import { GooglePlacesService } from '../components/integrations/googleplaces';

// Mock smartFetch for all tests
vi.mock('../components/foundation/smartfetch', () => ({
	smartFetch: vi.fn()
}));

describe('Google APIs - URL Building with buildUrl', () => {
	describe('Google Places Autocomplete API', () => {
		it('should construct autocomplete URL with buildUrl pattern', () => {
			const input = 'New York';
			const apiKey = 'test-key-123';
			const sessionToken = 'session-456';

			const url = buildUrl({
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'autocomplete', 'json'],
				params: {
					input: input,
					key: apiKey,
					sessiontoken: sessionToken,
					components: 'country:us'
				}
			});

			expect(url).toContain('https://maps.googleapis.com');
			expect(url).toContain('maps/api/place/autocomplete/json');
			expect(url).toContain('input=New+York');
			expect(url).toContain('key=test-key-123');
			expect(url).toContain('sessiontoken=session-456');
			expect(url).toContain('components=country%3Aus');
		});

		it('should handle multiple country restrictions', () => {
			const params = {
				input: 'address',
				key: 'key-123',
				sessiontoken: 'token',
				components: 'country:us|country:ca|country:mx'
			};

			const url = buildUrl({
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'autocomplete', 'json'],
				params: params
			});

			expect(url).toContain('components=country%3Aus%7Ccountry%3Aca%7Ccountry%3Amx');
		});
	});

	describe('Google Places Details API', () => {
		it('should construct details URL with buildUrl pattern', () => {
			const placeId = 'ChIJ1234567890';
			const apiKey = 'test-key-123';
			const sessionToken = 'session-456';

			const url = buildUrl({
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'details', 'json'],
				params: {
					place_id: placeId,
					key: apiKey,
					fields: 'address_component,formatted_address',
					sessiontoken: sessionToken
				}
			});

			expect(url).toContain('https://maps.googleapis.com');
			expect(url).toContain('maps/api/place/details/json');
			expect(url).toContain('place_id=ChIJ1234567890');
			expect(url).toContain('key=test-key-123');
			expect(url).toContain('fields=address_component%2Cformatted_address');
		});
	});

	describe('Google Places Reviews API', () => {
		it('should construct reviews URL with buildUrl pattern', () => {
			const placeId = 'ChIJ1234567890';
			const apiKey = 'test-key-123';

			const url = buildUrl({
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'details', 'json'],
				params: {
					place_id: placeId,
					fields: 'reviews,name,place_id,formatted_address',
					key: apiKey,
					language: 'en'
				}
			});

			expect(url).toContain('https://maps.googleapis.com');
			expect(url).toContain('maps/api/place/details/json');
			expect(url).toContain('place_id=ChIJ1234567890');
			expect(url).toContain('fields=reviews%2Cname%2Cplace_id%2Cformatted_address');
			expect(url).toContain('language=en');
		});

		it('should construct reviews URL without language param', () => {
			const placeId = 'ChIJ1234567890';
			const apiKey = 'test-key-123';

			const url = buildUrl({
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'details', 'json'],
				params: {
					place_id: placeId,
					fields: 'reviews,name,place_id,formatted_address',
					key: apiKey
				}
			});

			expect(url).toContain('fields=reviews%2Cname%2Cplace_id%2Cformatted_address');
			expect(url).not.toContain('language=');
		});
	});

	describe('Google Places v1 API', () => {
		it('should construct places v1 text search URL with buildUrl', () => {
			const apiKey = 'test-key-123';

			const url = buildUrl({
				baseUrl: 'https://places.googleapis.com',
				pathSegments: ['v1', 'places:searchText'],
				params: { key: apiKey }
			});

			expect(url).toContain('https://places.googleapis.com');
			expect(url).toContain('v1/places:searchText');
			expect(url).toContain('key=test-key-123');
		});

		it('should construct places v1 text search URL with pagination token', () => {
			const apiKey = 'test-key-123';
			const pageToken = 'AAAAAA_token_123';

			const url = buildUrl({
				baseUrl: 'https://places.googleapis.com',
				pathSegments: ['v1', 'places:searchText'],
				params: {
					key: apiKey,
					pageToken: pageToken
				}
			});

			expect(url).toContain('v1/places:searchText');
			expect(url).toContain('key=test-key-123');
			expect(url).toContain('pageToken=AAAAAA_token_123');
		});
	});

	describe('GooglePlacesService with buildUrl', () => {
		it('should have correct API structure', () => {
			const service = new GooglePlacesService({
				apiKey: 'test-key'
			});

			expect(service).toBeDefined();
			expect(typeof service.getPlacePredictions).toBe('function');
			expect(typeof service.getPlaceDetails).toBe('function');
		});

		it('should validate country restrictions', () => {
			const service = new GooglePlacesService();
			const placeDetails = {
				formattedAddress: '123 Main St',
				addressComponents: [
					{
						long_name: 'USA',
						short_name: 'US',
						types: ['country']
					}
				],
				country: 'US'
			};

			expect(service.isValidCountry(placeDetails, ['US', 'CA'])).toBe(true);
			expect(service.isValidCountry(placeDetails, ['MX'])).toBe(false);
		});
	});

	describe('Configuration validation', () => {
		it('should handle default API parameters correctly', () => {
			const params = {
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'autocomplete', 'json'],
				params: {
					input: 'test',
					key: 'key-123',
					sessiontoken: 'token-456'
				}
			};

			const url = buildUrl(params);

			expect(url).toContain('maps/api/place/autocomplete/json');
			expect(url).toContain('sessiontoken=token-456');
		});

		it('should handle special characters in input', () => {
			const url = buildUrl({
				baseUrl: 'https://maps.googleapis.com',
				pathSegments: ['maps', 'api', 'place', 'autocomplete', 'json'],
				params: {
					input: '123 Main St, New York, NY 10001',
					key: 'key'
				}
			});

			expect(url).toContain('input=');
			// URL encoding will handle the special characters
			expect(typeof url).toBe('string');
		});
	});
});
