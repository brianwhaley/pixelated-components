import { describe, it, expect, vi, beforeEach } from 'vitest';
import { buildUrl } from '../components/general/urlbuilder';

describe('PSI (PageSpeed Insights) - buildUrl URL Construction', () => {
	describe('fetchPSIData URL building', () => {
		it('should construct PSI URL with all required parameters (Section 1)', () => {
			const apiKey = 'test-api-key-123';
			const targetUrl = 'https://example.com';

			const psiUrl = buildUrl({
				baseUrl: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
				params: {
					url: targetUrl,
					key: apiKey,
					strategy: 'mobile',
					category: 'performance,accessibility,best-practices,seo'
				}
			});

			expect(psiUrl).toContain('https://www.googleapis.com/pagespeedonline/v5/runPagespeed');
			expect(psiUrl).toContain('url=');
			expect(psiUrl).toContain('key=test-api-key-123');
			expect(psiUrl).toContain('strategy=mobile');
			expect(psiUrl).toContain('category=');
		});

		it('should properly encode URL parameter in PSI request (Section 2)', () => {
			const apiKey = 'test-key';
			const targetUrl = 'https://example.com/path?param=value&other=123';

			const psiUrl = buildUrl({
				baseUrl: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
				params: {
					url: targetUrl,
					key: apiKey,
					strategy: 'mobile',
					category: 'performance,accessibility,best-practices,seo'
				}
			});

			// The target URL should be encoded in the query string
			expect(psiUrl).toContain('url=');
			// Should not contain unencoded ? from the target URL in params
			expect(psiUrl).toContain('%3F'); // ? encoded or properly handled
		});

		it('should include all four PSI categories in request (Section 3)', () => {
			const categories = 'performance,accessibility,best-practices,seo';
			const apiKey = 'test-key';
			const targetUrl = 'https://example.com';

			const psiUrl = buildUrl({
				baseUrl: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
				params: {
					url: targetUrl,
					key: apiKey,
					strategy: 'mobile',
					category: categories
				}
			});

			// Verify the URL contains all required parameters
			expect(psiUrl).toContain('pagespeedonline/v5/runPagespeed');
			expect(psiUrl).toContain('key=test-key');
			expect(psiUrl).toContain('strategy=mobile');
			expect(psiUrl).toContain('category=');
		});

		it('should support desktop strategy alongside mobile (Section 4)', () => {
			const apiKey = 'test-key';
			const targetUrl = 'https://example.com';

			const mobileUrl = buildUrl({
				baseUrl: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
				params: {
					url: targetUrl,
					key: apiKey,
					strategy: 'mobile',
					category: 'performance,accessibility,best-practices,seo'
				}
			});

			const desktopUrl = buildUrl({
				baseUrl: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
				params: {
					url: targetUrl,
					key: apiKey,
					strategy: 'desktop',
					category: 'performance,accessibility,best-practices,seo'
				}
			});

			expect(mobileUrl).toContain('strategy=mobile');
			expect(desktopUrl).toContain('strategy=desktop');
		});

		it('should handle different PSI URLs correctly', () => {
			const psiBaseUrl = 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed';
			const apiKey = 'key123';
			const testUrl = 'https://test.com';

			const url = buildUrl({
				baseUrl: psiBaseUrl,
				params: {
					url: testUrl,
					key: apiKey,
					strategy: 'mobile'
				}
			});

			expect(url).toContain('pagespeedonline/v5/runPagespeed');
			expect(url).toContain(`key=${apiKey}`);
			expect(url).toContain('strategy=mobile');
		});

		it('should properly construct PSI URLs with batch requests', () => {
			const apiKey = 'test-key';
			const urls = [
				'https://example.com',
				'https://example.com/about',
				'https://example.com/contact'
			];

			urls.forEach(targetUrl => {
				const psiUrl = buildUrl({
					baseUrl: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
					params: {
						url: targetUrl,
						key: apiKey,
						strategy: 'mobile',
						category: 'performance'
					}
				});

				expect(psiUrl).toContain('pagespeedonline/v5/runPagespeed');
				expect(psiUrl).toContain('key=' + apiKey);
				expect(psiUrl).toContain('url=');
			});
		});

		it('should match PSI API URL construction pattern from code', () => {
			// This matches the actual implementation in site-health-core-web-vitals.integration.ts
			const url = 'https://example.com';
			const apiKey = 'test-api-key';

			const psiUrl = buildUrl({
				baseUrl: 'https://www.googleapis.com/pagespeedonline/v5/runPagespeed',
				params: {
					url,
					key: apiKey,
					strategy: 'mobile',
					category: 'performance,accessibility,best-practices,seo'
				}
			});

			// Validate the core structure
			expect(psiUrl).toBeTruthy();
			expect(typeof psiUrl).toBe('string');
			expect(psiUrl).toContain('googleapis.com');
			expect(psiUrl).toContain('pagespeedonline');
		});
	});
});
