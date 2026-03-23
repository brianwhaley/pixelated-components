import { describe, it, expect, beforeEach } from 'vitest';
import { assertSiteInfo, assertRoutes, assertVisualDesign } from '../components/config/config.validators';

describe('config.validators', () => {
	describe('assertSiteInfo', () => {
		it('accepts valid siteInfo with all required fields', () => {
			expect(() => assertSiteInfo({ name: 'A', url: 'https://a', description: 'desc' })).not.toThrow();
		});

		it('accepts siteInfo with different valid names', () => {
			const names = ['My Site', 'Site-name', 'site_123', 'A'];
			names.forEach(name => {
				expect(() => assertSiteInfo({ name, url: 'https://example.com', description: 'desc' })).not.toThrow();
			});
		});

		it('accepts siteInfo with different valid URLs', () => {
			const urls = ['https://example.com', 'http://localhost:3000', 'https://sub.domain.com'];
			urls.forEach(url => {
				expect(() => assertSiteInfo({ name: 'Site', url, description: 'desc' })).not.toThrow();
			});
		});

		it('accepts siteInfo with different descriptions', () => {
			const descriptions = ['Short', 'A longer description here', 'Multi-word description with punctuation!'];
			descriptions.forEach(desc => {
				expect(() => assertSiteInfo({ name: 'Site', url: 'https://example.com', description: desc })).not.toThrow();
			});
		});

		it('throws when missing name field', () => {
			expect(() => assertSiteInfo({ url: 'https://a', description: 'desc' } as any)).toThrow(/siteInfo missing required fields/);
		});

		it('throws when missing url field', () => {
			expect(() => assertSiteInfo({ name: 'A', description: 'desc' } as any)).toThrow(/siteInfo missing required fields/);
		});

		it('throws when missing description field', () => {
			expect(() => assertSiteInfo({ name: 'A', url: 'https://a' } as any)).toThrow(/siteInfo missing required fields/);
		});

		it('throws when passed null', () => {
			expect(() => assertSiteInfo(null as any)).toThrow();
		});

		it('throws when passed undefined', () => {
			expect(() => assertSiteInfo(undefined as any)).toThrow();
		});
	});

	describe('assertRoutes', () => {
		it('accepts route array with valid structure', () => {
			expect(() => assertRoutes([{ name: 'Home', path: '/' }])).not.toThrow();
		});

		it('accepts multiple routes', () => {
			const routes = [
				{ name: 'Home', path: '/' },
				{ name: 'About', path: '/about' },
				{ name: 'Contact', path: '/contact' }
			];
			expect(() => assertRoutes(routes)).not.toThrow();
		});

		it('accepts routes with nested paths', () => {
			const routes = [
				{ name: 'Admin', path: '/admin' },
				{ name: 'Users', path: '/admin/users' },
				{ name: 'Settings', path: '/admin/settings' }
			];
			expect(() => assertRoutes(routes)).not.toThrow();
		});

		it('accepts route blobs with names as object', () => {
			expect(() => assertRoutes({ home: { name: 'Home', path: '/' } } as any)).not.toThrow();
		});

		it('throws when routes is undefined', () => {
			expect(() => assertRoutes(undefined)).toThrow(/routes is missing/);
		});

		it('throws when routes is null', () => {
			expect(() => assertRoutes(null as any)).toThrow(/routes is missing/);
		});

		it('throws when routes is empty array', () => {
			expect(() => assertRoutes([])).toThrow();
		});

		it('throws when routes object has no named entries', () => {
			expect(() => assertRoutes({ foo: { bar: {} } } as any)).toThrow(/expected at least one route entry/);
		});

		it('throws when routes object is empty', () => {
			expect(() => assertRoutes({})).toThrow();
		});

		it('accepts different route path formats', () => {
			const routes = [
				{ name: 'Home', path: '/' },
				{ name: 'Dynamic', path: '/items/:id' },
				{ name: 'Query', path: '/search?q=term' }
			];
			expect(() => assertRoutes(routes)).not.toThrow();
		});
	});

	describe('assertVisualDesign', () => {
		it('accepts simple visualdesign objects with string values', () => {
			expect(() => assertVisualDesign({ 'primary-color': '#fff' })).not.toThrow();
		});

		it('accepts multiple color tokens', () => {
			const design = {
				'primary-color': '#000',
				'secondary-color': '#fff',
				'accent-color': '#ff0000'
			};
			expect(() => assertVisualDesign(design)).not.toThrow();
		});

		it('accepts font tokens', () => {
			const design = {
				'header-font': 'Arial, sans-serif',
				'body-font': 'Georgia, serif'
			};
			expect(() => assertVisualDesign(design)).not.toThrow();
		});

		it('accepts HEX color values', () => {
			const design = { 'color': '#f0f0f0' };
			expect(() => assertVisualDesign(design)).not.toThrow();
		});

		it('accepts RGB color values', () => {
			const design = { 'color': 'rgb(255, 0, 0)' };
			expect(() => assertVisualDesign(design)).not.toThrow();
		});

		it('accepts named color values', () => {
			const design = { 'color': 'red' };
			expect(() => assertVisualDesign(design)).not.toThrow();
		});

		it('accepts tokens with design token object format', () => {
			const design = {
				'primary-color': { value: '#fff' },
				'header-font': 'Montserrat'
			};
			expect(() => assertVisualDesign(design as any)).not.toThrow();
		});

		it('accepts mixed token formats', () => {
			const design = {
				'primary-color': { value: '#fff' },
				'header-font': 'Montserrat',
				'border-radius': '4px'
			};
			expect(() => assertVisualDesign(design as any)).not.toThrow();
		});

		it('throws when visualdesign is null', () => {
			expect(() => assertVisualDesign(null)).toThrow(/visualdesign is missing/);
		});

		it('throws when visualdesign is undefined', () => {
			expect(() => assertVisualDesign(undefined)).toThrow(/visualdesign is missing/);
		});

		it('throws when visualdesign is a string', () => {
			expect(() => assertVisualDesign('string' as any)).toThrow(/visualdesign must be an object/);
		});

		it('throws when visualdesign is a number', () => {
			expect(() => assertVisualDesign(123 as any)).toThrow(/visualdesign must be an object/);
		});

		it('throws when visualdesign is an array', () => {
			expect(() => assertVisualDesign([] as any)).toThrow(/visualdesign must be an object/);
		});

		it('throws when object has no tokens', () => {
			expect(() => assertVisualDesign({} as any)).toThrow(/visualdesign must contain at least one token/);
		});

		it('throws when token value is a number', () => {
			expect(() => assertVisualDesign({ 'primary-color': 123 as any })).toThrow(/visualdesign token 'primary-color' has an invalid value/);
		});

		it('throws when token value is an array', () => {
			expect(() => assertVisualDesign({ 'primary-color': [] as any })).toThrow();
		});

		it('throws when token object has invalid structure', () => {
			expect(() => assertVisualDesign({ 'primary-color': { type: 'string' } as any })).toThrow(/visualdesign token 'primary-color' has an invalid value/);
		});

		it('throws when token value is null', () => {
			expect(() => assertVisualDesign({ 'primary-color': null })).toThrow();
		});

		it('accepts multiple empty-string token names', () => {
			const design = { 'token-1': '#fff', 'token-2': '#000' };
			expect(() => assertVisualDesign(design)).not.toThrow();
		});

		it('handles design tokens correctly', () => {
			const design =  {
				'--primary': '#000',
				'--secondary': '#fff',
				'--spacing-unit': '8px'
			};
			expect(Object.keys(design).length).toBeGreaterThan(0);
			expect(() => assertVisualDesign(design)).not.toThrow();
		});
	});

	describe('Configuration Validation Integration', () => {
		it('validates complete config with all three validators', () => {
			const siteInfo = { name: 'My Site', url: 'https://example.com', description: 'Test site' };
			const routes = [{ name: 'Home', path: '/' }];
			const design = { 'primary-color': '#000' };

			expect(() => assertSiteInfo(siteInfo)).not.toThrow();
			expect(() => assertRoutes(routes)).not.toThrow();
			expect(() => assertVisualDesign(design)).not.toThrow();
		});

		it('handles multiple validation errors gracefully', () => {
			expect(() => assertSiteInfo({} as any)).toThrow();
			expect(() => assertRoutes(undefined)).toThrow();
			expect(() => assertVisualDesign(null)).toThrow();
		});
	});
});
