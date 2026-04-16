import { describe, it, expect } from 'vitest';
import { buildUrl } from '../components/foundation/urlbuilder';

describe('buildUrl', () => {
	describe('simple query parameters', () => {
		it('should build URL with single param', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search',
				params: { q: 'test' },
			});
			expect(result).toBe('https://api.example.com/search?q=test');
		});

		it('should build URL with multiple params', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search',
				params: { q: 'test', limit: 10, offset: 0 },
			});
			expect(result).toContain('q=test');
			expect(result).toContain('limit=10');
			expect(result).toContain('offset=0');
		});

		it('should encode param values with special characters', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search',
				params: { q: 'hello world', email: 'user@example.com' },
			});
			expect(result).toContain('q=hello+world');
			expect(result).toContain('email=user%40example.com');
		});

		it('should filter out null and undefined params', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search',
				params: { q: 'test', limit: null, offset: undefined },
			});
			expect(result).toBe('https://api.example.com/search?q=test');
		});

		it('should handle boolean params', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search',
				params: { active: true, archived: false },
			});
			expect(result).toContain('active=true');
			expect(result).toContain('archived=false');
		});

		it('should handle array params by repeating keys', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search',
				params: { q: 'test', tags: ['red', 'blue'] },
			});

			expect(result).toContain('q=test');
			expect(result).toContain('tags=red');
			expect(result).toContain('tags=blue');
			expect(result.match(/tags=/g)?.length).toBe(2);
		});

		it('should handle numeric params', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search',
				params: { page: 1, limit: 25 },
			});
			expect(result).toContain('page=1');
			expect(result).toContain('limit=25');
		});
	});

	describe('path segments', () => {
		it('should append path segments to base URL', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com',
				pathSegments: ['users', 123, 'posts'],
			});
			expect(result).toBe('https://api.example.com/users/123/posts');
		});

		it('should handle path segments with numbers', () => {
			const result = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', 'abc123', 'environments', 'master', 'entries'],
			});
			expect(result).toBe('https://api.contentful.com/spaces/abc123/environments/master/entries');
		});

		it('should not double-encode path segments', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com',
				pathSegments: ['users', 'john-doe'],
			});
			expect(result).toBe('https://api.example.com/users/john-doe');
		});

		it('should strip leading/trailing slashes from segments', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/',
				pathSegments: ['/users/', '/123/'],
			});
			expect(result).toBe('https://api.example.com/users/123');
		});

		it('should handle empty segments array', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com',
				pathSegments: [],
			});
			expect(result).toBe('https://api.example.com');
		});
	});

	describe('path segments with query params', () => {
		it('should combine path segments and query params', () => {
			const result = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', 'abc123', 'entries'],
				params: { access_token: 'mytoken', limit: 10 },
			});
			expect(result).toContain('/spaces/abc123/entries?');
			expect(result).toContain('access_token=mytoken');
			expect(result).toContain('limit=10');
		});
	});

	describe('proxy wrapping', () => {
		it('should wrap full URL with proxy', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search',
				params: { q: 'test' },
				proxyUrl: 'https://proxy.pixelated.tech/',
			});
			expect(result).toBe(
				'https://proxy.pixelated.tech/https%3A%2F%2Fapi.example.com%2Fsearch%3Fq%3Dtest'
			);
		});

		it('should properly encode URL for proxy', () => {
			const result = buildUrl({
				baseUrl: 'https://www.flickr.com/services/rest',
				params: { method: 'flickr.photos.search', api_key: 'key123' },
				proxyUrl: 'https://proxy.pixelated.tech/',
			});
			// Full URL should be encoded
			expect(result).toContain('https://proxy.pixelated.tech/https%3A%2F%2F');
			expect(result).not.toContain('?'); // ? should be encoded in the proxy URL
		});

		it('should handle proxy URL with/without trailing slash', () => {
			const result1 = buildUrl({
				baseUrl: 'https://api.example.com',
				proxyUrl: 'https://proxy.pixelated.tech/',
			});

			const result2 = buildUrl({
				baseUrl: 'https://api.example.com',
				proxyUrl: 'https://proxy.pixelated.tech',
			});

			// Both should encode the full URL, so they should be different
			expect(result1).toContain('https://proxy.pixelated.tech/');
			expect(result2).toContain('https://proxy.pixelated.tech');
		});
	});

	describe('complex real-world examples', () => {
		it('should build Google Places API URL', () => {
			const result = buildUrl({
				baseUrl: 'https://maps.googleapis.com/maps/api/place/autocomplete/json',
				params: {
					input: 'new york',
					key: 'AIzaSyDummyKey',
				},
			});
			expect(result).toContain('maps.googleapis.com');
			expect(result).toContain('input=new+york');
			expect(result).toContain('key=AIzaSyDummyKey');
		});

		it('should build Contentful API URL with path segments', () => {
			const result = buildUrl({
				baseUrl: 'https://api.contentful.com',
				pathSegments: ['spaces', 'cfexample', 'environments', 'master', 'entries'],
				params: {
					'content_type': 'blogPost',
					'access_token': 'token123',
				},
			});
			expect(result).toContain('https://api.contentful.com/spaces/cfexample/environments/master/entries');
			expect(result).toContain('content_type=blogPost');
			expect(result).toContain('access_token=token123');
		});

		it('should build Flickr API URL with proxy', () => {
			const result = buildUrl({
				baseUrl: 'https://www.flickr.com/services/rest',
				params: {
					method: 'flickr.photos.search',
					api_key: 'flickrkey123',
					tags: 'sunset,landscape',
					format: 'json',
				},
				proxyUrl: 'https://proxy.pixelated.tech/',
			});
			expect(result).toContain('https://proxy.pixelated.tech/');
			expect(result).toContain('%3A'); // : encoded
		});
	});

	describe('edge cases', () => {
		it('should handle empty params object', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com',
				params: {},
			});
			expect(result).toBe('https://api.example.com');
		});

		it('should handle undefined params', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com',
			});
			expect(result).toBe('https://api.example.com');
		});

		it('should handle URL with existing query string', () => {
			const result = buildUrl({
				baseUrl: 'https://api.example.com/search?existing=param',
				params: { q: 'test' },
			});
			// Should append with & since base already has ?
			expect(result).toContain('existing=param');
			expect(result).toContain('q=test');
		});
	});
});
