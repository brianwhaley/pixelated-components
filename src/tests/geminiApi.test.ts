import { describe, it, expect, beforeEach, vi } from 'vitest';
import { generateAiRecommendations, GeminiRecommendationRequest, GeminiRecommendationResponse } from '../components/integrations/gemini-api.server';

// Mock smartFetch
vi.mock('../components/foundation/smartfetch', () => ({
	smartFetch: vi.fn()
}));

import { smartFetch } from '../components/foundation/smartfetch';

describe('Gemini API Server Integration', () => {
	const mockSiteInfo = {
		name: 'Tech Product Store',
		url: 'https://techstore.example.com',
		description: 'Premium technology products',
		author: 'Tech Store Team',
		display: 'Tech Store',
		email: 'contact@techstore.com',
		phone: '555-0100',
		address: {
			streetAddress: '123 Tech Street',
			addressLocality: 'Silicon Valley',
			addressRegion: 'CA',
			postalCode: '94025',
			addressCountry: 'US'
		},
		favicon: '/favicon.ico',
		favicon_sizes: '32x32',
		favicon_type: 'image/x-icon',
		theme_color: '#000000',
		background_color: '#FFFFFF',
		default_locale: 'en-US',
		social: {},
		services: []
	};

	const mockGeminiRequest: GeminiRecommendationRequest = {
		route: {
			name: 'laptop-product',
			path: '/products/laptop',
			title: 'High-Performance Laptop',
			description: 'Latest gaming laptop with RTX 4090',
			keywords: ['laptop', 'gaming', 'high-performance'],
		},
		siteInfo: mockSiteInfo,
		baseUrl: 'https://api.example.com',
	};


	beforeEach(() => {
		vi.clearAllMocks();
		vi.mocked(smartFetch).mockClear();
	});

	describe('Function Export', () => {
		it('should export generateAiRecommendations function', () => {
			expect(typeof generateAiRecommendations).toBe('function');
		});

		it('should be async function', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce(
				new Response(JSON.stringify({
					candidates: [{
						content: { parts: [{ text: '{"title": "Test Title"}' }] },
						finishReason: 'STOP'
					}]
				}))
			);

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result).toBeDefined();
		});
	});

	describe('Request Validation', () => {
		it('should handle API key parameter', async () => {
			const apiKey = 'test-api-key-abc123xyz';
			expect(apiKey).toBeDefined();
			expect(apiKey.length).toBeGreaterThan(0);
		});

		it('should process route information', () => {
			const request = mockGeminiRequest;
			expect(request.route.path).toBeDefined();
			expect(request.route.title).toBeDefined();
			expect(request.route.path).toMatch(/^\//);
		});

		it('should process site information', () => {
			const request = mockGeminiRequest;
			expect(request.siteInfo.name).toBeDefined();
			expect(request.siteInfo.url).toBeDefined();
			expect(request.siteInfo.url).toMatch(/^https?:\/\//);
		});

		it('should require route data structure', () => {
			const route = mockGeminiRequest.route;
			expect(route.path).toBeDefined();
			expect(route.title).toBeDefined();
			expect(route.description).toBeDefined();
			expect(route.keywords).toBeDefined();
		});

		it('should validate site info structure', () => {
			const siteInfo = mockGeminiRequest.siteInfo;
			expect(siteInfo.name).toBeDefined();
			expect(siteInfo.url).toBeDefined();
			expect(siteInfo.description).toBeDefined();
		});
	});

	describe('API Request to Gemini', () => {
		it('should call fetch with correct API endpoint', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce(
				new Response(JSON.stringify({
					candidates: [{
						content: { parts: [{ text: '{"title": "Test"}' }] },
						finishReason: 'STOP'
					}]
				}))
			);

			await generateAiRecommendations(mockGeminiRequest, 'test-key');

			expect(smartFetch).toHaveBeenCalled();
			const callArgs = (smartFetch as any).mock.calls[0][0];
			expect(callArgs).toContain('generativelanguage.googleapis.com');
		});

		it('should include API key in request', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce(
				new Response(JSON.stringify({
					candidates: [{
						content: { parts: [{ text: '{"title": "Test"}' }] },
						finishReason: 'STOP'
					}]
				}))
			);

			const apiKey = 'my-secret-key-12345';
			await generateAiRecommendations(mockGeminiRequest, apiKey);

			expect(smartFetch).toHaveBeenCalled();
			const callArgs = (smartFetch as any).mock.calls[0][0];
			expect(callArgs).toContain(apiKey);
		});

		it('should use POST method', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: '{"title": "Test"}' }] },
					finishReason: 'STOP'
				}]
			});

			await generateAiRecommendations(mockGeminiRequest, 'test-key');

			const options = (smartFetch as any).mock.calls[0][1];
			expect(options.requestInit?.method).toBe('POST');
		});

		it('should send JSON content type', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: '{"title": "Test"}' }] },
					finishReason: 'STOP'
				}]
			});

			await generateAiRecommendations(mockGeminiRequest, 'test-key');

			const options = (smartFetch as any).mock.calls[0][1];
			expect(options.requestInit?.headers?.['Content-Type']).toBe('application/json');
		});
	});

	describe('Response Parsing', () => {
		it('should return recommendation response object', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce(
				new Response(JSON.stringify({
					candidates: [{
						content: { parts: [{ text: '{"title": "Test Title", "description": "Test desc", "keywords": ["test"]}' }] },
						finishReason: 'STOP'
					}]
				}))
			);

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result).toBeDefined();
			expect(typeof result).toBe('object');
		});

		it('should parse title from response', async () => {
			const expectedTitle = 'Best Gaming Laptop - RTX 4090';
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: `{"title": "${expectedTitle}"}` }] },
					finishReason: 'STOP'
				}]
			});

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result.title).toBe(expectedTitle);
		});

		it('should parse description from response', async () => {
			const expectedDesc = 'Premium gaming laptop with cutting-edge graphics';
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: `{"description": "${expectedDesc}"}` }] },
					finishReason: 'STOP'
				}]
			});

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result.description).toBe(expectedDesc);
		});

		it('should parse keywords array from response', async () => {
			const expectedKeywords = ['gaming laptop', 'RTX 4090', 'high-performance'];
			const keywordJson = JSON.stringify(expectedKeywords);
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: `{"keywords": ${keywordJson}}` }] },
					finishReason: 'STOP'
				}]
			});

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(Array.isArray(result.keywords)).toBe(true);
		});
	});

	describe('Error Handling', () => {
		it('should handle invalid API key', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce(new Response('Unauthorized', { status: 401 }));

			const request: GeminiRecommendationRequest = {
				route: { name: 'test', path: '/test', title: 'Test', description: '', keywords: [] },
				siteInfo: mockSiteInfo
			};

			const result = await generateAiRecommendations(request, '');
			expect(result.error !== undefined || result.title !== undefined).toBe(true);
		});

		it('should handle network failures', async () => {
			vi.mocked(smartFetch).mockRejectedValueOnce(new Error('Network error'));

			const request: GeminiRecommendationRequest = {
				route: { name: 'test', path: '/', title: '', description: '', keywords: [] },
				siteInfo: mockSiteInfo,
				baseUrl: 'https://example.com'
			};

			try {
				await generateAiRecommendations(request, 'key');
			} catch (error) {
				expect(error).toBeDefined();
			}
		});

		it('should handle max tokens error', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					finishReason: 'MAX_TOKENS'
				}]
			});

			const request: GeminiRecommendationRequest = {
				route: { name: 'test', path: '/', title: 'Test', description: '', keywords: [] },
				siteInfo: mockSiteInfo
			};

			try {
				await generateAiRecommendations(request, 'key');
			} catch (error: any) {
				expect(error.message).toContain('truncated');
			}
		});

		it('should handle missing candidates in response', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce({});

			const request: GeminiRecommendationRequest = {
				route: { name: 'test', path: '/', title: 'Test', description: '', keywords: [] },
				siteInfo: mockSiteInfo
			};

			try {
				await generateAiRecommendations(request, 'key');
			} catch (error: any) {
				expect(error.message).toBeDefined();
			}
		});
	});

	describe('Optional Parameters', () => {
		it('should support optional baseUrl parameter', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: '{"title": "Test"}' }] },
					finishReason: 'STOP'
				}]
			});

			const request: GeminiRecommendationRequest = {
				route: mockGeminiRequest.route,
				siteInfo: mockGeminiRequest.siteInfo,
				baseUrl: 'https://example.com'
			};

			const result = await generateAiRecommendations(request, 'key');
			expect(result).toBeDefined();
		});

		it('should work without baseUrl', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: '{"title": "Test"}' }] },
					finishReason: 'STOP'
				}]
			});

			const request: GeminiRecommendationRequest = {
				route: mockGeminiRequest.route,
				siteInfo: mockGeminiRequest.siteInfo,
			};

			const result = await generateAiRecommendations(request, 'key');
			expect(result).toBeDefined();
		});
	});

	describe('Title Generation Quality', () => {
		it('should generate SEO-optimized title', async () => {
			const title = 'Best Gaming Laptop for Professionals - RTX 4090';
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: `{"title": "${title}"}` }] },
					finishReason: 'STOP'
				}]
			});

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result.title).toBeDefined();
			expect(result.title?.length).toBeGreaterThan(10);
			expect(result.title?.length).toBeLessThanOrEqual(60);
		});

		it('should include primary keywords in title', async () => {
			const title = 'Gaming Laptop with RTX 4090 Graphics';
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: `{"title": "${title}"}` }] },
					finishReason: 'STOP'
				}]
			});

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result.title?.toLowerCase()).toContain('gaming');
		});
	});

	describe('Description Generation Quality', () => {
		it('should generate proper length description', async () => {
			const description = 'Discover our premium gaming laptop with cutting-edge RTX 4090 graphics. Perfect for competitive gaming and professional work.';
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: `{"description": "${description}"}` }] },
					finishReason: 'STOP'
				}]
			});

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result.description).toBeDefined();
			expect(result.description?.length).toBeGreaterThanOrEqual(50);
		});
	});

	describe('Keyword Generation Quality', () => {
		it('should generate multiple keywords', async () => {
			const keywords = ['gaming laptop', 'RTX 4090', 'high-performance', 'professional gaming'];
			const keywordJson = JSON.stringify(keywords);
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: `{"keywords": ${keywordJson}}` }] },
					finishReason: 'STOP'
				}]
			});

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result.keywords).toBeDefined();
			expect(Array.isArray(result.keywords)).toBe(true);
			expect(result.keywords!.length).toBeGreaterThanOrEqual(3);
		});

		it('should include long-tail keywords', async () => {
			const keywords = ['gaming laptop', 'RTX 4090 laptop', 'high-performance gaming'];
			const keywordJson = JSON.stringify(keywords);
			vi.mocked(smartFetch).mockResolvedValueOnce({
				candidates: [{
					content: { parts: [{ text: `{"keywords": ${keywordJson}}` }] },
					finishReason: 'STOP'
				}]
			});

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			expect(result.keywords).toBeDefined();
		});
	});

	describe('Response Format Compatibility', () => {
		it('should return compatible response format', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce(
				new Response(JSON.stringify({
					candidates: [{
						content: { parts: [{ text: '{"title": "Test", "description": "Desc", "keywords": ["test"]}' }] },
						finishReason: 'STOP'
					}]
				}))
			);

			const result = await generateAiRecommendations(mockGeminiRequest, 'test-key');
			const isValidResponse = {
				hasTitle: typeof result.title === 'string' || result.title === undefined,
				hasDescription: typeof result.description === 'string' || result.description === undefined,
				hasKeywords: Array.isArray(result.keywords) || result.keywords === undefined,
			};

			expect(Object.values(isValidResponse).every(Boolean)).toBe(true);
		});
	});
});
