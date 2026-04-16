import { describe, it, expect, vi } from 'vitest';
import { generateGoogleFontsUrl, generateGoogleFontsLink } from '../components/sitebuilder/config/google-fonts';
import { buildUrl } from '../components/foundation/urlbuilder';

const mockApiKey = 'test-api-key-123';

describe('google-fonts', () => {

	// Section 1: buildUrl for Google Fonts API list fetch
	describe('buildUrl Google Fonts API URL construction', () => {
		it('should construct Google Fonts API URL with api key and sort parameter', () => {
			const url = buildUrl({
				baseUrl: 'https://www.googleapis.com',
				pathSegments: ['webfonts', 'v1', 'webfonts'],
				params: { key: mockApiKey, sort: 'popularity' }
			});

			expect(url).toContain('https://www.googleapis.com/webfonts/v1/webfonts');
			expect(url).toContain(`key=${mockApiKey}`);
			expect(url).toContain('sort=popularity');
		});

		it('should construct correct path segments for Google Fonts endpoint', () => {
			const url = buildUrl({
				baseUrl: 'https://www.googleapis.com',
				pathSegments: ['webfonts', 'v1', 'webfonts'],
				params: { key: 'xyz', sort: 'popularity' }
			});

			expect(url).toMatch(/\/webfonts\/v1\/webfonts\?/);
		});
	});

	// Section 2: buildUrl for Google Fonts CSS import URL construction
	describe('buildUrl Google Fonts CSS URL construction', () => {
		it('should construct CSS URL with single font family', () => {
			const url = buildUrl({
				baseUrl: 'https://fonts.googleapis.com',
				pathSegments: ['css2'],
				params: { family: 'Roboto', display: 'swap' }
			});

			expect(url).toContain('https://fonts.googleapis.com/css2');
			expect(url).toContain('family=Roboto');
			expect(url).toContain('display=swap');
		});

		it('should construct CSS URL with multiple font families (pipe-separated)', () => {
			const fontFamily = 'Roboto|Lato|Poppins';
			const url = buildUrl({
				baseUrl: 'https://fonts.googleapis.com',
				pathSegments: ['css2'],
				params: { family: fontFamily, display: 'swap' }
			});

			expect(url).toContain('https://fonts.googleapis.com/css2');
			// buildUrl properly encodes pipe as %7C
			expect(url).toContain('family=Roboto%7CLato%7CPoppins');
			expect(url).toContain('display=swap');
		});

		it('should construct CSS URL with font families with weight variants', () => {
			const fontFamily = 'Roboto:400;700|Lato:300;400;700';
			const url = buildUrl({
				baseUrl: 'https://fonts.googleapis.com',
				pathSegments: ['css2'],
				params: { family: fontFamily, display: 'swap' }
			});

			expect(url).toContain('https://fonts.googleapis.com/css2');
			expect(url).toContain('family=');
		});
	});

	// Section 3: generateGoogleFontsUrl function tests
	describe('generateGoogleFontsUrl', () => {
		it('should return empty string for empty fonts array', () => {
			const url = generateGoogleFontsUrl([]);
			expect(url).toBe('');
		});

		it('should generate CSS URL for single font', () => {
			const url = generateGoogleFontsUrl(['Roboto']);
			expect(url).toContain('https://fonts.googleapis.com/css2');
			expect(url).toContain('family=Roboto');
			expect(url).toContain('display=swap');
		});

		it('should replace spaces with plus signs in font names', () => {
			const url = generateGoogleFontsUrl(['Playfair Display', 'Libre Baskerville']);
			// buildUrl properly encodes + as %2B
			expect(url).toContain('Playfair%2BDisplay');
			expect(url).toContain('Libre%2BBaskerville');
		});

		it('should join multiple fonts with pipe separator', () => {
			const url = generateGoogleFontsUrl(['Roboto', 'Lato', 'Poppins']);
			// buildUrl properly encodes pipe | as %7C
			expect(url).toContain('Roboto%7CLato%7CPoppins');
		});

		it('should handle fonts with special characters', () => {
			const url = generateGoogleFontsUrl(['"Roboto"', "'Lato'"]);
			expect(url).toContain('Roboto');
			expect(url).toContain('Lato');
			expect(url).not.toContain('"');
		});

		it('should filter out empty font names', () => {
			const url = generateGoogleFontsUrl(['Roboto', '', '  ', 'Lato']);
			expect(url).not.toBe('');
			expect(url).toContain('Roboto');
			expect(url).toContain('Lato');
		});
	});

	// Section 4: generateGoogleFontsLink function tests
	describe('generateGoogleFontsLink', () => {
		it('should return empty string for empty fonts array', () => {
			const link = generateGoogleFontsLink([]);
			expect(link).toBe('');
		});

		it('should generate HTML link tags for font', () => {
			const link = generateGoogleFontsLink(['Roboto']);
			expect(link).toContain('<link');
			expect(link).toContain('rel="preconnect"');
			expect(link).toContain('https://fonts.googleapis.com');
			expect(link).toContain('https://fonts.gstatic.com');
		});

		it('should include fetchPriority high attribute', () => {
			const link = generateGoogleFontsLink(['Roboto']);
			expect(link).toContain('fetchPriority="high"');
		});

		it('should construct CSS URL within the link tag', () => {
			const link = generateGoogleFontsLink(['Roboto', 'Lato']);
			// buildUrl encodes pipes as %7C
			expect(link).toContain('Roboto%7CLato');
			expect(link).toContain('display=swap');
		});
	});
});
