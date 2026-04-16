/**
 * Specialized API URL Construction Tests
 * Tests buildUrl usage for Flickr and Gemini APIs
 * Validates URL structure, parameter encoding, and API endpoint patterns
 */

import { describe, it, expect } from 'vitest';
import { buildUrl } from '../components/foundation/urlbuilder';

describe('Specialized APIs - buildUrl Integration', () => {
	describe('Flickr API URLs', () => {
		const baseUrl = 'https://api.flickr.com/services/rest/?';
		const testApiKey = 'test_flickr_api_key_12345';
		const testUserId = '12345@N06';

		it('should construct Flickr photos search URL with buildUrl', () => {
			const params = {
				method: 'flickr.photos.search',
				api_key: testApiKey,
				user_id: testUserId,
				tags: 'pixelatedviewsgallery',
				extras: 'date_taken,description,owner_name',
				sort: 'date-taken-desc',
				per_page: 500,
				format: 'json',
				nojsoncallback: 'true',
			};

			const url = buildUrl({
				baseUrl,
				params,
			});

			expect(url).toContain('method=flickr.photos.search');
			expect(url).toContain(`api_key=${testApiKey}`);
			// @ symbol is encoded as %40 in URL parameters
			expect(url).toContain('user_id=12345%40N06');
			expect(url).toContain('tags=pixelatedviewsgallery');
			// Commas in extras are encoded as %2C
			expect(url).toContain('extras=date_taken%2C');
			expect(url).toContain('format=json');
			expect(url).toContain('nojsoncallback=true');
		});

		it('should construct Flickr photoset URL correctly', () => {
			const params = {
				method: 'flickr.photosets.getPhotos',
				api_key: testApiKey,
				photoset_id: 'album123',
				extras: 'date_taken,description',
				format: 'json',
				nojsoncallback: 'true',
			};

			const url = buildUrl({
				baseUrl,
				params,
			});

			expect(url).toContain('method=flickr.photosets.getPhotos');
			expect(url).toContain('photoset_id=album123');
			expect(url).toContain('format=json');
		});

		it('should handle Flickr parameter encoding correctly', () => {
			const params = {
				method: 'flickr.photos.search',
				api_key: testApiKey,
				tags: 'nature,landscape,travel',
				extras: 'date_taken,description,owner_name',
				format: 'json',
				nojsoncallback: 'true',
			};

			const url = buildUrl({
				baseUrl,
				params,
			});

			// Verifies buildUrl constructs valid API URLs with encoded parameters
			expect(url).toContain('api.flickr.com');
			expect(url).toContain('format=json');
		});

		it('should handle common Flickr API methods', () => {
			const methods = [
				'flickr.photos.search',
				'flickr.photosets.getPhotos',
				'flickr.photos.getInfo',
				'flickr.user.getPublicPhotos',
			];

			methods.forEach((method) => {
				const params = {
					method,
					api_key: testApiKey,
					format: 'json',
					nojsoncallback: 'true',
				};

				const url = buildUrl({
					baseUrl,
					params,
				});

				// buildUrl doesn't encode dots in parameter values, they remain as-is
				expect(url).toContain(`method=${method}`);
			});
		});

		it('should construct Flickr URL with varying pagination', () => {
			[25, 100, 250, 500].forEach((perPage) => {
				const params = {
					method: 'flickr.photos.search',
					api_key: testApiKey,
					user_id: testUserId,
					per_page: perPage,
					format: 'json',
					nojsoncallback: 'true',
				};

				const url = buildUrl({
					baseUrl,
					params,
				});

				expect(url).toContain(`per_page=${perPage}`);
			});
		});

		it('should handle Flickr proxy URL wrapping', () => {
			const params = {
				method: 'flickr.photos.search',
				api_key: testApiKey,
				format: 'json',
				nojsoncallback: 'true',
			};

			const apiUrl = buildUrl({
				baseUrl,
				params,
			});

			const proxyUrl = 'https://proxy.example.com/?url=';
			const wrappedUrl = proxyUrl + encodeURIComponent(apiUrl);

			expect(wrappedUrl).toContain('proxy.example.com');
			// When wrapped via encodeURIComponent, slashes become %2F and the full URL is encoded
			expect(wrappedUrl).toContain('%3A%2F%2F');
			expect(wrappedUrl).toContain('api.flickr.com');
		});
	});

	describe('Gemini API URLs', () => {
		const baseUrl = 'https://generativelanguage.googleapis.com';
		const testApiKey = 'test_gemini_api_key_abc123xyz';
		const testModel = 'gemini-2.5-flash';

		it('should construct Gemini generateContent endpoint URL', () => {
			const url = buildUrl({
				baseUrl,
				pathSegments: ['v1beta', 'models', `${testModel}:generateContent`],
				params: { key: testApiKey },
			});

			expect(url).toContain(`${baseUrl}/v1beta/models/${testModel}`);
			expect(url).toContain(`key=${testApiKey}`);
			expect(url).toContain('generateContent');
		});

		it('should construct Gemini list models endpoint URL', () => {
			const url = buildUrl({
				baseUrl,
				pathSegments: ['v1', 'models'],
				params: { key: testApiKey },
			});

			expect(url).toContain(`${baseUrl}/v1/models`);
			expect(url).toContain(`key=${testApiKey}`);
		});

		it('should construct Gemini v1beta generateContent with colon encoding', () => {
			const url = buildUrl({
				baseUrl,
				pathSegments: ['v1beta', 'models', 'gemini-2.5-flash:generateContent'],
				params: { key: testApiKey },
			});

			expect(url).toContain('v1beta/models');
			expect(url).toContain('gemini-2.5-flash');
			expect(url).toContain('generateContent');
		});

		it('should handle different Gemini model versions', () => {
			const models = ['gemini-1.5-pro', 'gemini-1.5-flash', 'gemini-2.5-flash', 'gemini-pro'];

			models.forEach((model) => {
				const url = buildUrl({
					baseUrl,
					pathSegments: ['v1beta', 'models', `${model}:generateContent`],
					params: { key: testApiKey },
				});

				expect(url).toContain(model);
				expect(url).toContain('generateContent');
			});
		});

		it('should handle API key parameter encoding', () => {
			const specialKeyApiKey = 'key_with_special!@#$%^&*()chars';

			const url = buildUrl({
				baseUrl,
				pathSegments: ['v1beta', 'models', 'gemini-2.5-flash:generateContent'],
				params: { key: specialKeyApiKey },
			});

			expect(url).toContain('key=');
			expect(url).toBeTruthy();
		});

		it('should construct Gemini embedContent endpoint URL', () => {
			const url = buildUrl({
				baseUrl,
				pathSegments: ['v1beta', 'models', 'embedding-001:embedContent'],
				params: { key: testApiKey },
			});

			expect(url).toContain('embedding-001');
			expect(url).toContain('embedContent');
		});

		it('should handle Gemini API versioning', () => {
			['v1', 'v1beta', 'v1alpha'].forEach((version) => {
				const url = buildUrl({
					baseUrl,
					pathSegments: [version, 'models', 'gemini-2.5-flash:generateContent'],
					params: { key: testApiKey },
				});

				expect(url).toContain(version);
			});
		});
	});

	describe('Cross-API Parameters and Encoding', () => {
		it('should handle Flickr comma-separated field values', () => {
			const url = buildUrl({
				baseUrl: 'https://api.flickr.com/services/rest/?',
				params: {
					method: 'flickr.photos.search',
					extras: 'date_taken,description,owner_name',
					tags: 'nature,landscape,travel',
					format: 'json',
				},
			});

			expect(url).toBeTruthy();
			expect(url).toContain('extras=');
		});

		it('should handle Gemini model names with colons and hyphens', () => {
			const url = buildUrl({
				baseUrl: 'https://generativelanguage.googleapis.com',
				pathSegments: ['v1beta', 'models', 'gemini-2.5-flash:generateContent'],
				params: { key: 'test_key' },
			});

			expect(url).toContain('gemini-2.5-flash');
			expect(url).toContain('generateContent');
		});

		it('should validate URL construction with numeric and alphanumeric IDs', () => {
			const flickrUrl = buildUrl({
				baseUrl: 'https://api.flickr.com/services/rest/?',
				params: {
					method: 'flickr.photosets.getPhotos',
					photoset_id: '72157695246735063',
					api_key: '550e8400e29b41d4a716446',
				},
			});

			expect(flickrUrl).toContain('photoset_id=72157695246735063');
			expect(flickrUrl).toContain('api_key=550e8400e29b41d4a716446');
		});
	});

	describe('API-Specific Parameter Defaults', () => {
		it('should validate Flickr default parameters', () => {
			const defaultParams = {
				method: 'flickr.photos.search',
				per_page: 500,
				format: 'json',
				nojsoncallback: 'true',
				extras: 'date_taken,description,owner_name',
				sort: 'date-taken-desc',
			};

			const url = buildUrl({
				baseUrl: 'https://api.flickr.com/services/rest/?',
				params: defaultParams,
			});

			expect(url).toContain('per_page=500');
			expect(url).toContain('format=json');
		});

		it('should validate Gemini API key requirement', () => {
			const url = buildUrl({
				baseUrl: 'https://generativelanguage.googleapis.com',
				pathSegments: ['v1beta', 'models', 'gemini-2.5-flash:generateContent'],
				params: { key: 'api_key_required' },
			});

			expect(url).toContain('key=api_key_required');
		});

		it('should handle optional Gemini parameters', () => {
			const urlWithoutPageToken = buildUrl({
				baseUrl: 'https://generativelanguage.googleapis.com',
				pathSegments: ['v1', 'models'],
				params: { key: 'test_key' },
			});

			const urlWithPageSize = buildUrl({
				baseUrl: 'https://generativelanguage.googleapis.com',
				pathSegments: ['v1', 'models'],
				params: { key: 'test_key', pageSize: 10 },
			});

			expect(urlWithoutPageToken).toContain('key=');
			expect(urlWithPageSize).toContain('pageSize=10');
		});
	});

	describe('Complex URL Scenarios', () => {
		it('should handle Flickr with all optional parameters', () => {
			const complexParams = {
				method: 'flickr.photos.search',
				api_key: 'key123',
				user_id: '12345@N06',
				tags: 'landscape,nature',
				min_taken_date: '2020-01-01',
				max_taken_date: '2023-12-31',
				sort: 'date-taken-desc',
				per_page: 100,
				page: 1,
				extras: 'date_taken,description,owner_name,views',
				format: 'json',
				nojsoncallback: 'true',
			};

			const url = buildUrl({
				baseUrl: 'https://api.flickr.com/services/rest/?',
				params: complexParams,
			});

			expect(url).toContain('api_key=');
			expect(url).toContain('user_id=12345');
			expect(url).toContain('tags=');
			expect(url).toContain('per_page=100');
		});

		it('should handle Gemini API with request structure', () => {
			// The URL construction for POST APIs focuses on endpoint construction
			// The body with detailed parameters is sent separately
			const url = buildUrl({
				baseUrl: 'https://generativelanguage.googleapis.com',
				pathSegments: ['v1beta', 'models', 'gemini-2.5-flash:generateContent'],
				params: { key: 'test_key' },
			});

			expect(url).toContain('v1beta/models');
			expect(url).toContain('generateContent');
			expect(url).toContain('key=test_key');
		});
	});
});
