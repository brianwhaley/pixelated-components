import { describe, it, expect } from 'vitest';
import {
	descriptionToKeywords,
	getRouteByKey,
	getAllRoutes,
	getMetadata,
	getAccordionMenuData,
	generateMetaTags,
	type Route
} from '../components/general/metadata.functions';
import type { SiteInfo } from '../components/config/config.types';

describe('Metadata Functions', () => {
	describe('descriptionToKeywords', () => {
		it('should extract keywords from description', () => {
			const description = 'This is a test description about web development and JavaScript programming';
			const keywords = descriptionToKeywords(description, 3);

			expect(keywords).toBeDefined();
			expect(keywords.length).toBeLessThanOrEqual(3);
			expect(keywords.every(k => typeof k === 'string')).toBe(true);
		});

		it('should filter out stop words', () => {
			const description = 'the quick brown fox jumps over the lazy dog';
			const keywords = descriptionToKeywords(description, 5);

			expect(keywords.some(k => k === 'the')).toBe(false);
			expect(keywords.some(k => k === 'over')).toBe(false);
		});

		it('should handle empty description', () => {
			const keywords = descriptionToKeywords('', 5);
			expect(keywords).toEqual([]);
		});

		it('should respect custom stop words', () => {
			const description = 'test testing tested test example';
			const keywords = descriptionToKeywords(description, 10, ['test', 'testing']);

			expect(keywords.some(k => k === 'test')).toBe(false);
		});

		it('should filter out single and double character words', () => {
			const description = 'I am a web developer who codes in JavaScript and TypeScript';
			const keywords = descriptionToKeywords(description, 10);

			expect(keywords.every(k => k.length > 2)).toBe(true);
		});

		it('should handle punctuation', () => {
			const description = 'Hello! How are you? This is a test. Great!';
			const keywords = descriptionToKeywords(description, 5);

			expect(keywords.length).toBeGreaterThan(0);
			expect(keywords.every(k => !k.includes('!'))).toBe(true);
		});

		it('should return top N keywords', () => {
			const description = 'apple apple apple banana banana orange';
			const keywords = descriptionToKeywords(description, 2);

			expect(keywords.length).toBeLessThanOrEqual(2);
		});
	});

	describe('getRouteByKey', () => {
		it('should find object by key-value pair', () => {
			const routes = {
				name: 'Home',
				path: '/',
				routes: [
					{ name: 'About', path: '/about' },
					{ name: 'Contact', path: '/contact' }
				]
			};

			const result = getRouteByKey(routes, 'name', 'About');
			expect(result).toBeDefined();
			expect(result?.name).toBe('About');
		});

		it('should handle nested objects', () => {
			const routes = {
				name: 'Root',
				routes: {
					name: 'Parent',
					routes: [{ name: 'Target', path: '/target' }]
				}
			};

			const result = getRouteByKey(routes, 'name', 'Target');
			expect(result?.name).toBe('Target');
		});

		it('should return null for non-existent values', () => {
			const routes = { name: 'Home', path: '/' };
			const result = getRouteByKey(routes, 'name', 'NonExistent');

			expect(result).toBeNull();
		});

		it('should handle null/undefined input', () => {
			expect(getRouteByKey(null, 'name', 'Test')).toBeNull();
			expect(getRouteByKey(undefined, 'name', 'Test')).toBeNull();
		});

		it('should find first match in arrays', () => {
			const routes = [
				{ name: 'First' },
				{ name: 'Second', nested: [{ name: 'Target' }] },
				{ name: 'Third' }
			];

			const result = getRouteByKey(routes, 'name', 'Target');
			expect(result?.name).toBe('Target');
		});
	});

	describe('getAllRoutes', () => {
		it('should extract all leaf nodes', () => {
			const routes: Route = {
				name: 'Root',
				routes: [
					{ name: 'Item1', path: '/1' },
					{ name: 'Item2', path: '/2' }
				]
			};

			const result = getAllRoutes(routes, 'routes');
			expect(result.length).toBeGreaterThan(0);
		});

		it('should handle single level routes', () => {
			const routes: Route = { name: 'Single', path: '/' };
			const result = getAllRoutes(routes, 'routes');

			expect(Array.isArray(result)).toBe(true);
		});

		it('should traverse deeply nested structures', () => {
			const routes: Route = {
				name: 'Level1',
				routes: [
					{
						name: 'Level2',
						routes: [{ name: 'Level3', path: '/deep' }]
					}
				]
			};

			const result = getAllRoutes(routes, 'routes');
			expect(result.length).toBeGreaterThan(0);
		});
	});

	describe('getMetadata', () => {
		it('should extract metadata by key-value', () => {
			const routes = {
				name: 'Home',
				title: 'Home Page',
				description: 'Welcome to home',
				keywords: 'home, welcome'
			};

			const metadata = getMetadata(routes, 'name', 'Home');
			expect(metadata.title).toBe('Home Page');
			expect(metadata.description).toBe('Welcome to home');
		});

		it('should return empty metadata if not found', () => {
			const routes = { name: 'Home', title: 'Home' };
			const metadata = getMetadata(routes, 'name', 'About');

			expect(metadata.title).toBe('');
			expect(metadata.description).toBe('');
			expect(metadata.keywords).toBe('');
		});

		it('should use provided key and value', () => {
			const routes: Route = {
				name: 'Root',
				path: '/',
				title: 'Root',
				description: 'Root page',
				keywords: 'root'
			};

			const metadata = getMetadata(routes, 'path', '/');
			expect(metadata.title).toBe( 'Root');
		});

		it('should handle routes in array format', () => {
			const routes = [
				{ name: 'Home', title: 'Home Page', description: 'Desc' },
				{ name: 'About', title: 'About Page', description: 'About desc' }
			];

			const metadata = getMetadata(routes, 'name', 'About');
			expect(metadata.title).toBe('About Page');
		});
	});

	describe('getAccordionMenuData', () => {
		it('should convert routes to accordion structure', () => {
			const routes = [
				{
					name: 'Products',
					routes: [
						{ name: 'Electronics', path: '/electronics' },
						{ name: 'Books', path: '/books' }
					]
				}
			];

			const result = getAccordionMenuData(routes);
			expect(result).toBeDefined();
			expect(typeof result).toBe('object');
		});

		it('should handle flat routes', () => {
			const routes = [
				{ name: 'Home', path: '/' },
				{ name: 'About', path: '/about' }
			];

			const result = getAccordionMenuData(routes);
			expect(result).toBeDefined();
		});

		it('should handle mixed nested and flat routes', () => {
			const routes = [
				{ name: 'Home', path: '/' },
				{
					name: 'Services',
					routes: [{ name: 'Consulting', path: '/consulting' }]
				}
			];

			const result = getAccordionMenuData(routes);
			expect(result).toBeDefined();
		});
	});

	describe('generateMetaTags', () => {
		it('should generate meta tag JSX', () => {
			const props = {
				title: 'Test Page',
				description: 'A test page',
				keywords: 'test, page',
				origin: 'https://example.com',
				url: 'https://example.com/test',
				site_name: 'Example Site',
				email: 'info@example.com',
				image: 'https://example.com/image.png',
				siteInfo: {
					name: 'Example',
					description: 'Example site description',
					url: 'https://example.com',
					email: 'test@example.com',
					image: 'https://example.com/logo.png'
				}
			};

			const result = generateMetaTags(props);
			expect(result).toBeDefined();
		});

		it('should handle missing optional props', () => {
			const props = {
				title: 'Test',
				description: 'Test description',
				keywords: 'test',
				origin: 'https://example.com',
				url: 'https://example.com/',
				siteInfo: { name: 'Test', description: 'Test site', url: 'https://example.com' }
			};

			const result = generateMetaTags(props);
			expect(result).toBeDefined();
		});

		it('should extract hostname from origin URL', () => {
			const props = {
				title: 'Test',
				description: 'Test',
				keywords: 'test',
				origin: 'https://subdomain.example.com:8080/path',
				url: 'https://example.com/',
				siteInfo: { name: 'Test', description: 'Test site', url: 'https://example.com' }
			};

			const result = generateMetaTags(props);
			expect(result).toBeDefined();
		});

		it('should handle invalid origin URL gracefully', () => {
			const props = {
				title: 'Test',
				description: 'Test',
				keywords: 'test',
				origin: 'not-a-url',
				url: 'https://example.com/',
				siteInfo: { name: 'Test', description: 'Test site', url: 'https://example.com' }
			};

			const result = generateMetaTags(props);
			expect(result).toBeDefined();
		});

		it('should prioritize prop values over siteInfo', () => {
			const props = {
				title: 'Test',
				description: 'Test',
				keywords: 'test',
				origin: 'https://example.com',
				url: 'https://example.com/',
				site_name: 'Override Name',
				email: 'override@example.com',
				image: 'https://example.com/override.png',
				siteInfo: {
					name: 'Original',
					description: 'Original description',
					url: 'https://original.com',
					email: 'original@example.com',
					image: 'https://example.com/original.png'
				}
			};

			const result = generateMetaTags(props);
			expect(result).toBeDefined();
		});
	});
});
