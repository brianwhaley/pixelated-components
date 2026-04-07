import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { GeminiApiService, createGeminiApiService } from '../components/integrations/gemini-api.client';

// Mock smartFetch
vi.mock('../components/general/smartfetch', () => ({
	smartFetch: vi.fn()
}));

import { smartFetch } from '../components/general/smartfetch';

// Complete SiteInfo fixture with all required fields
const completeSiteInfo = {
	name: 'Test Site',
	author: 'Test Author',
	description: 'Test site description',
	url: 'https://testsite.com',
	email: 'test@example.com',
	favicon: '/favicon.ico',
	favicon_sizes: '32x32',
	favicon_type: 'image/x-icon',
	theme_color: '#000000',
	background_color: '#ffffff',
	default_locale: 'en-US',
	display: 'standalone',
	image: 'https://example.com/image.png',
	image_height: '200',
	image_width: '200',
	telephone: '+1-800-123-4567'
};

describe('GeminiApiService', () => {
	let service: GeminiApiService;
	const testApiKey = 'test-api-key-12345';

	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(smartFetch).mockClear();
		service = new GeminiApiService(testApiKey);
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('constructor', () => {
		it('should create instance with API key', () => {
			expect(service).toBeDefined();
			expect(service['apiKey']).toBe(testApiKey);
		});

		it('should use default baseUrl', () => {
			expect(service['baseUrl']).toBe('https://generativelanguage.googleapis.com');
		});

		it('should accept custom baseUrl', () => {
			const customUrl = 'https://custom.api.com';
			const customService = new GeminiApiService(testApiKey, customUrl);
			expect(customService['baseUrl']).toBe(customUrl);
		});
	});

	describe('generateRouteRecommendations', () => {
		it('should make successful API call', async () => {
			const mockResponse = {
				success: true,
				data: {
					title: 'Test Title',
					keywords: ['test', 'keywords'],
					description: 'Test description'
				}
			};

			vi.mocked(smartFetch).mockResolvedValueOnce(mockResponse);

			const request = {
				route: { name: 'test', path: '/test' },
				siteInfo: completeSiteInfo,
				baseUrl: 'https://example.com'
			};

			const result = await service.generateRouteRecommendations(request);

			expect(result.success).toBe(true);
			expect(result.data?.title).toBe('Test Title');
			expect(result.data?.keywords).toEqual(['test', 'keywords']);
		});

		it('should handle API error responses', async () => {
			vi.mocked(smartFetch).mockRejectedValueOnce(new Error('Internal Server Error'));

			const request = {
				route: { name: 'test', path: '/test' },
				siteInfo: completeSiteInfo
			};

			const result = await service.generateRouteRecommendations(request);

			expect(result.success).toBe(false);
			expect(result.error).toBeDefined();
		});

		it('should handle fetch network errors', async () => {
			const error = new Error('Network error');
			vi.mocked(smartFetch).mockRejectedValueOnce(error);

			const request = {
				route: { name: 'test', path: '/test' },
				siteInfo: completeSiteInfo
			};

			const result = await service.generateRouteRecommendations(request);

			expect(result.success).toBe(false);
			expect(result.error).toContain('Network');
		});

		it('should handle API response with error field', async () => {
			const mockResponse = {
				success: false,
				error: 'API error occurred'
			};

			vi.mocked(smartFetch).mockResolvedValueOnce(mockResponse);

			const request = {
				route: { name: 'test', path: '/test' },
				siteInfo: completeSiteInfo
			};

			const result = await service.generateRouteRecommendations(request);

			expect(result.success).toBe(false);
			expect(result.error).toBe('API error occurred');
		});

		it('should send correct request headers and body', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce({ success: true, data: {} });

			const request = {
				route: { name: 'test', path: '/test' },
				siteInfo: completeSiteInfo
			};

			await service.generateRouteRecommendations(request);

			expect(smartFetch).toHaveBeenCalledWith(
				'/api/ai/recommendations',
				expect.objectContaining({
					requestInit: expect.objectContaining({
						method: 'POST'
					})
				})
			);
		});
	});

	describe('listModels', () => {
		it('should fetch available models', async () => {
			const mockModels = {
				models: [
					{ name: 'gemini-pro', displayName: 'Gemini Pro' },
					{ name: 'gemini-pro-vision', displayName: 'Gemini Pro Vision' }
				]
			};

			vi.mocked(smartFetch).mockResolvedValueOnce(mockModels);

			const result = await service.listModels();

			expect(result).toEqual(mockModels);
			expect(smartFetch).toHaveBeenCalledWith(
				expect.stringContaining('models'),
				expect.objectContaining({
					requestInit: expect.objectContaining({ method: 'GET' })
				})
			);
		});

		it('should handle model list errors', async () => {
			vi.mocked(smartFetch).mockRejectedValueOnce(new Error('Unauthorized'));

			const result = await service.listModels();

			expect(result).toBeNull();
		});

		it('should handle network errors in listModels', async () => {
			vi.mocked(smartFetch).mockRejectedValueOnce(new Error('Network failed'));

			const result = await service.listModels();

			expect(result).toBeNull();
		});
	});

	describe('createGeminiApiService', () => {
		it('should create service instance', () => {
			const service = createGeminiApiService('test-key');

			expect(service).toBeInstanceOf(GeminiApiService);
		});

		it('should pass API key to service', () => {
			const apiKey = 'my-test-key';
			const service = createGeminiApiService(apiKey);

			expect(service['apiKey']).toBe(apiKey);
		});
	});
});
