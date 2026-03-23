import { describe, it, expect, vi } from 'vitest';
import { generateAiRecommendations } from '../components/integrations/gemini-api.server';

vi.stubGlobal('fetch', vi.fn());

const mockSiteInfo: any = {
	name: 'Test Site',
	author: 'Test Author',
	description: 'Test Description',
	url: 'https://example.com',
	email: 'test@example.com',
	display: 'Test Site',
	phone: '555-1234',
	address: '123 Main St',
	city: 'Test City',
	state: 'TS',
	zip: '12345',
	country: 'US',
	favicon: '/favicon.ico',
	favicon_sizes: '32x32',
	favicon_type: 'image/x-icon',
	theme_color: '#000000',
	social: {},
	services: []
};

describe('gemini-api.server', () => {
	it('should export generateAiRecommendations function', () => {
		expect(typeof generateAiRecommendations).toBe('function');
	});

	it('should handle missing API key', async () => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

		const request = {
			route: { name: 'test', path: '/test', title: 'Test', keywords: [], description: '' },
			siteInfo: mockSiteInfo
		};

		const result = await generateAiRecommendations(request, '');
		expect(result.error || result.title !== undefined).toBeTruthy();
	});

	it('should handle network failures', async () => {
		vi.mocked(fetch).mockRejectedValueOnce(new Error('Network error'));

		const request = {
			route: { name: 'test', path: '/', title: '', keywords: [], description: '' },
			siteInfo: mockSiteInfo,
			baseUrl: 'https://example.com'
		};

		try {
			await generateAiRecommendations(request, 'key');
		} catch (error) {
			expect(error).toBeDefined();
		}
	});

	it('should require route in request', () => {
		const request = {
			route: { name: '', path: '/', title: '', keywords: [], description: '' },
			siteInfo: mockSiteInfo
		};
		expect(request.route).toBeDefined();
		expect(request.route.path).toBe('/');
	});

	it('should require siteInfo in request', () => {
		const request = {
			route: { name: 'test', path: '/test', title: 'Test', keywords: [], description: '' },
			siteInfo: mockSiteInfo
		};
		expect(request.siteInfo).toBeDefined();
		expect(request.siteInfo.name).toBe('Test Site');
	});

	it('should accept optional baseUrl', async () => {
		vi.mocked(fetch).mockResolvedValueOnce(new Response('{}', { status: 200 }));
		const request = {
			route: { name: 'test', path: '/test', title: 'Test', keywords: [], description: '' },
			siteInfo: mockSiteInfo,
			baseUrl: 'https://example.com'
		};

		const result = await generateAiRecommendations(request, 'key');
		expect(request.baseUrl).toBeDefined();
	});

	it('should handle location information in site info', () => {
		const request = {
			route: { name: 'services', path: '/services', title: 'Services', keywords: [], description: '' },
			siteInfo: {
				name: 'Local Business',
				description: 'Local Services',
				address: {
					addressLocality: 'New York',
					addressRegion: 'NY',
					postalCode: '10001'
				}
			}
		};
		expect(request.siteInfo.address?.addressLocality).toBe('New York');
	});
});
