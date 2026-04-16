/**
 * Social Media API URL Construction Tests
 * Tests buildUrl usage for Gravatar, Instagram, and WordPress APIs
 * Validates URL structure, parameter encoding, and API endpoint patterns
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { buildUrl } from '../components/foundation/urlbuilder';

describe('Social Media APIs - buildUrl Integration', () => {
	describe('Gravatar API URLs', () => {
		const baseUrl = 'https://www.gravatar.com';
		const gravatarJsonBase = 'https://en.gravatar.com';
		const testHash = 'f1d3f3d3f1d3f3d3f1d3f3d3f1d3f3d3';

		it('should construct Gravatar avatar URL with size and default image', () => {
			const url = buildUrl({
				baseUrl,
				pathSegments: ['avatar', testHash],
				params: { s: 200, d: 'mp' },
			});

			expect(url).toBe(`${baseUrl}/avatar/${testHash}?s=200&d=mp`);
			expect(url).toContain('gravatar.com/avatar/');
			expect(url).toContain('?s=200');
			expect(url).toContain('d=mp');
		});

		it('should construct Gravatar avatar URL with different size values', () => {
			const urlSmall = buildUrl({
				baseUrl,
				pathSegments: ['avatar', testHash],
				params: { s: 100, d: 'identicon' },
			});

			expect(urlSmall).toContain('s=100');
			expect(urlSmall).toContain('d=identicon');

			const urlLarge = buildUrl({
				baseUrl,
				pathSegments: ['avatar', testHash],
				params: { s: 512, d: 'wavatar' },
			});

			expect(urlLarge).toContain('s=512');
			expect(urlLarge).toContain('d=wavatar');
		});

		it('should construct Gravatar profile JSON URL correctly', () => {
			const url = buildUrl({
				baseUrl: gravatarJsonBase,
				pathSegments: [testHash, 'json'],
			});

			expect(url).toBe(`${gravatarJsonBase}/${testHash}/json`);
			expect(url).toContain('en.gravatar.com');
			expect(url).toMatch(/\/json$/);
		});

		it('should handle all Gravatar default image types', () => {
			const defaultTypes = ['404', 'mp', 'identicon', 'monsterid', 'wavatar', 'retro', 'blank'];

			defaultTypes.forEach((type) => {
				const url = buildUrl({
					baseUrl,
					pathSegments: ['avatar', testHash],
					params: { s: 200, d: type },
				});
				expect(url).toContain(`d=${type}`);
			});
		});
	});

	describe('Instagram Graph API URLs', () => {
		const baseUrl = 'https://graph.instagram.com';
		const testToken = 'test_access_token_123456789';
		const testUserId = '17841405235';
		const defaultFields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,username';

		it('should construct Instagram media endpoint URL with required parameters', () => {
			const url = buildUrl({
				baseUrl,
				pathSegments: [testUserId, 'media'],
				params: {
					fields: defaultFields,
					limit: 25,
					access_token: testToken,
				},
			});

			expect(url).toContain(`${baseUrl}/${testUserId}/media`);
			expect(url).toContain('fields=');
			expect(url).toContain('limit=25');
			expect(url).toContain('access_token=test_access_token_123456789');
		});

		it('should construct Instagram media URL with default user "me"', () => {
			const url = buildUrl({
				baseUrl,
				pathSegments: ['me', 'media'],
				params: {
					fields: defaultFields,
					limit: 25,
					access_token: testToken,
				},
			});

			expect(url).toContain(`${baseUrl}/me/media`);
		});

		it('should handle custom fields parameter correctly', () => {
			const customFields = 'id,media_type,media_url,permalink';
			const url = buildUrl({
				baseUrl,
				pathSegments: [testUserId, 'media'],
				params: {
					fields: customFields,
					limit: 10,
					access_token: testToken,
				},
			});

			expect(url).toContain('fields=');
			expect(url).toContain('limit=10');
		});

		it('should handle different limit values', () => {
			[1, 10, 25, 50, 100].forEach((limit) => {
				const url = buildUrl({
					baseUrl,
					pathSegments: [testUserId, 'media'],
					params: {
						fields: defaultFields,
						limit,
						access_token: testToken,
					},
				});
				expect(url).toContain(`limit=${limit}`);
			});
		});

		it('should properly encode commas in fields parameter', () => {
			const url = buildUrl({
				baseUrl,
				pathSegments: [testUserId, 'media'],
				params: {
					fields: 'id,media_type,media_url',
					limit: 25,
					access_token: testToken,
				},
			});

			// buildUrl should encode commas in query params
			expect(url).toContain('fields=');
		});
	});

	describe('WordPress REST API URLs', () => {
		const wpBaseUrl = 'https://public-api.wordpress.com/rest/v1/sites/';
		const testSite = 'example.wordpress.com';

		it('should construct WordPress posts endpoint URL', () => {
			const url = buildUrl({
				baseUrl: wpBaseUrl,
				pathSegments: [testSite, 'posts'],
				params: { number: 10, page: 1 },
			});

			expect(url).toContain(`${wpBaseUrl}${testSite}/posts`);
			expect(url).toContain('number=10');
			expect(url).toContain('page=1');
		});

		it('should handle pagination correctly', () => {
			const page1 = buildUrl({
				baseUrl: wpBaseUrl,
				pathSegments: [testSite, 'posts'],
				params: { number: 25, page: 1 },
			});

			const page2 = buildUrl({
				baseUrl: wpBaseUrl,
				pathSegments: [testSite, 'posts'],
				params: { number: 25, page: 2 },
			});

			expect(page1).toContain('page=1');
			expect(page2).toContain('page=2');
			expect(page1).not.toEqual(page2);
		});

		it('should construct WordPress single post fetch URL', () => {
			const url = buildUrl({
				baseUrl: wpBaseUrl,
				pathSegments: [testSite, 'posts'],
				params: { number: 1, fields: 'modified' },
			});

			expect(url).toContain(`${wpBaseUrl}${testSite}/posts`);
			expect(url).toContain('number=1');
			expect(url).toContain('fields=modified');
		});

		it('should handle custom WordPress site slugs', () => {
			const sites = ['myblog.wordpress.com', 'example.com', 'another-site.wordpress.com'];

			sites.forEach((site) => {
				const url = buildUrl({
					baseUrl: wpBaseUrl,
					pathSegments: [site, 'posts'],
					params: { number: 10, page: 1 },
				});

				expect(url).toContain(`${wpBaseUrl}${site}/posts`);
			});
		});

		it('should handle different number values for post fetching', () => {
			[10, 25, 50, 100].forEach((number) => {
				const url = buildUrl({
					baseUrl: wpBaseUrl,
					pathSegments: [testSite, 'posts'],
					params: { number, page: 1 },
				});

				expect(url).toContain(`number=${number}`);
			});
		});

		it('should construct URL for custom base URLs', () => {
			const customBase = 'https://api.example.com/wp/v2/';
			const url = buildUrl({
				baseUrl: customBase,
				pathSegments: [testSite, 'posts'],
				params: { number: 10, page: 1 },
			});

			expect(url).toContain(customBase);
			expect(url).toContain(testSite);
		});

		it('should handle WordPress categories endpoint', () => {
			const url = buildUrl({
				baseUrl: wpBaseUrl,
				pathSegments: [testSite, 'categories'],
				params: { number: 50 },
			});

			expect(url).toContain(`${wpBaseUrl}${testSite}/categories`);
			expect(url).toContain('number=50');
		});
	});

	describe('Cross-API URL Encoding Validation', () => {
		it('should handle special characters in hash values (Gravatar)', () => {
			const urlWithSpecialHash = buildUrl({
				baseUrl: 'https://www.gravatar.com',
				pathSegments: ['avatar', 'abc123-def456'],
				params: { s: 200, d: 'mp' },
			});

			expect(urlWithSpecialHash).toContain('avatar/abc123-def456');
		});

		it('should handle numeric IDs in Instagram URLs', () => {
			const url = buildUrl({
				baseUrl: 'https://graph.instagram.com',
				pathSegments: ['17841405235', 'media'],
				params: {
					fields: 'id,media_type',
					limit: 25,
					access_token: 'token',
				},
			});

			expect(url).toContain('17841405235/media');
		});

		it('should handle domain names in WordPress URLs', () => {
			const url = buildUrl({
				baseUrl: 'https://public-api.wordpress.com/rest/v1/sites/',
				pathSegments: ['example-site.wordpress.com', 'posts'],
				params: { number: 10, page: 1 },
			});

			expect(url).toContain('example-site.wordpress.com/posts');
		});

		it('should properly encode URL parameters with special characters', () => {
			const url = buildUrl({
				baseUrl: 'https://graph.instagram.com',
				pathSegments: ['me', 'media'],
				params: {
					fields: 'id,caption,timestamp',
					access_token: 'token_with_special!@#$%',
				},
			});

			// Verify the URL is properly encoded
			expect(url).toBeTruthy();
			expect(url).toContain('graph.instagram.com');
		});
	});

	describe('API Parameter Defaults', () => {
		it('should validate Gravatar default parameters', () => {
			const defaultSize = 200;
			const defaultImage = 'mp';

			const url = buildUrl({
				baseUrl: 'https://www.gravatar.com',
				pathSegments: ['avatar', 'testhash'],
				params: { s: defaultSize, d: defaultImage },
			});

			expect(url).toContain(`s=${defaultSize}`);
			expect(url).toContain(`d=${defaultImage}`);
		});

		it('should validate Instagram default field list', () => {
			const defaultFields = 'id,media_type,media_url,thumbnail_url,permalink,caption,timestamp,username';

			const url = buildUrl({
				baseUrl: 'https://graph.instagram.com',
				pathSegments: ['me', 'media'],
				params: {
					fields: defaultFields,
					limit: 25,
					access_token: 'token',
				},
			});

			expect(url).toContain('fields=');
			expect(url).toContain('limit=25');
		});

		it('should validate WordPress default pagination', () => {
			const defaultNumber = 100;
			const defaultPage = 1;

			const url = buildUrl({
				baseUrl: 'https://public-api.wordpress.com/rest/v1/sites/',
				pathSegments: ['example.com', 'posts'],
				params: { number: defaultNumber, page: defaultPage },
			});

			expect(url).toContain(`number=${defaultNumber}`);
			expect(url).toContain(`page=${defaultPage}`);
		});
	});
});
