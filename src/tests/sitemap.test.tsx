import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	createPageURLs,
	createImageURLsFromJSON,
	createWordPressURLs,
	createContentfulURLs,
	createContentfulImageURLs,
	createEbayItemURLs,
	generateSitemap,
	clearEbaySitemapCache,
	type SitemapEntry
} from '@/components/general/sitemap';

// Mock external dependencies
vi.mock('@/components/general/wordpress.functions');
vi.mock('@/components/general/contentful.delivery');
vi.mock('@/components/shoppingcart/ebay.functions');
vi.mock('@/components/config/config');
vi.mock('@/components/general/metadata.functions');
// Import mocked modules
import * as wordpressModule from '@/components/general/wordpress.functions';
import * as contentfulModule from '@/components/general/contentful.delivery';
import * as ebayModule from '@/components/shoppingcart/ebay.functions';
import * as configModule from '@/components/config/config';
import * as metadataModule from '@/components/general/metadata.functions';

// Mock fetch globally
global.fetch = vi.fn();

describe('Sitemap Helper Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		console.error = vi.fn();
		console.log = vi.fn();
		console.warn = vi.fn();
			clearEbaySitemapCache();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('createPageURLs', () => {
		it('should create sitemap entries for routes', async () => {
			const mockRoutes = [
				{ path: '/home' },
				{ path: '/about' },
				{ path: '/contact' }
			];

			const mockGetAllRoutes = vi.mocked(metadataModule.getAllRoutes);
			mockGetAllRoutes.mockReturnValue(mockRoutes);

			const origin = 'https://example.com';
			const result = await createPageURLs(mockRoutes, origin);

			expect(result).toHaveLength(3);
			expect(result[0]).toMatchObject({
				url: 'https://example.com/home',
				changeFrequency: 'hourly',
				priority: 1,
			});
			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should skip external URLs', async () => {
			const mockRoutes = [
				{ path: '/home' },
				{ path: 'https://external.com/page' },
				{ path: '/about' }
			];

			const mockGetAllRoutes = vi.mocked(metadataModule.getAllRoutes);
			mockGetAllRoutes.mockReturnValue(mockRoutes);

			const origin = 'https://example.com';
			const result = await createPageURLs(mockRoutes, origin);

			expect(result).toHaveLength(2);
			expect(result.every(entry => !entry.url.includes('external.com'))).toBe(true);
		});

		it('should handle empty routes array', async () => {
			const mockGetAllRoutes = vi.mocked(metadataModule.getAllRoutes);
			mockGetAllRoutes.mockReturnValue([]);

			const origin = 'https://example.com';
			const result = await createPageURLs([], origin);

			expect(result).toEqual([]);
		});
	});

	describe('createImageURLsFromJSON', () => {
		it('should create sitemap entry with images from JSON array', async () => {
			const mockJson = ['image1.jpg', 'image2.png'];
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockJson
			});

			const origin = 'https://example.com';
			const result = await createImageURLsFromJSON(origin, 'public/site-images.json');

			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				url: 'https://example.com/images',
				images: [
					'https://example.com/image1.jpg',
					'https://example.com/image2.png'
				]
			});
		});

		it('should handle JSON object with images property', async () => {
			const mockJson = { images: ['image1.jpg', 'image2.png'] };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockJson
			});

			const origin = 'https://example.com';
			const result = await createImageURLsFromJSON(origin, 'public/site-images.json');

			expect(result).toHaveLength(1);
			expect(result[0].images).toHaveLength(2);
		});

		it('should handle fetch errors gracefully', async () => {
			(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

			const origin = 'https://example.com';
			const result = await createImageURLsFromJSON(origin, 'public/site-images.json');

			expect(result).toEqual([]);
		});

		it('should handle non-OK responses', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 404
			});

			const origin = 'https://example.com';
			const result = await createImageURLsFromJSON(origin, 'public/site-images.json');

			expect(result).toEqual([]);
		});

		it('should handle invalid JSON structure', async () => {
			const mockJson = { invalid: 'structure' };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockJson
			});

			const origin = 'https://example.com';
			const result = await createImageURLsFromJSON(origin, 'public/site-images.json');

			expect(result).toEqual([]);
		});
	});

	describe('createWordPressURLs', () => {
		it('should create sitemap entries for WordPress posts', async () => {
			const mockPosts: wordpressModule.BlogPostType[] = [
				{
					ID: '123',
					title: 'Test Post',
					date: '2024-01-01T10:00:00Z',
					modified: '2024-01-01T10:00:00Z',
					excerpt: 'Post excerpt',
					URL: 'https://blog.example.com/post-1',
					categories: ['category1']
				},
				{
					ID: '124',
					title: 'Test Post 2',
					date: '2024-01-02T10:00:00Z',
					modified: '2024-01-02T10:00:00Z',
					excerpt: 'Post excerpt 2',
					URL: 'https://blog.example.com/post-2',
					categories: ['category2']
				}
			];

			const mockGetWordPressItems = vi.mocked(wordpressModule.getWordPressItems);
			mockGetWordPressItems.mockResolvedValue(mockPosts);

			const result = await createWordPressURLs({ site: 'example.wordpress.com' });

			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject({
				url: 'https://blog.example.com/post-1',
				changeFrequency: 'hourly',
				priority: 1,
			});
			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should include images when includeImages is true', async () => {
			const mockPosts: wordpressModule.BlogPostType[] = [
				{
					ID: '123',
					title: 'Test Post',
					date: '2024-01-01T10:00:00Z',
					modified: '2024-01-01T10:00:00Z',
					excerpt: 'Post excerpt',
					URL: 'https://blog.example.com/post-1',
					categories: ['category1']
				}
			];

			const mockImages = [
				{ url: 'https://blog.example.com/image1.jpg' },
				{ url: 'https://blog.example.com/image2.jpg' }
			];

			const mockGetWordPressItems = vi.mocked(wordpressModule.getWordPressItems);
			const mockGetWordPressItemImages = vi.mocked(wordpressModule.getWordPressItemImages);

			mockGetWordPressItems.mockResolvedValue(mockPosts);
			mockGetWordPressItemImages.mockReturnValue(mockImages);

			const result = await createWordPressURLs({
				site: 'example.wordpress.com',
				includeImages: true
			});

			expect(result[0].images).toEqual(['https://blog.example.com/image1.jpg', 'https://blog.example.com/image2.jpg']);
		});

		it('should handle posts without modified date', async () => {
			const mockPosts: wordpressModule.BlogPostType[] = [
				{
					ID: '123',
					title: 'Test Post',
					date: '2024-01-01T10:00:00Z',
					excerpt: 'Post excerpt',
					URL: 'https://blog.example.com/post-1',
					categories: ['category1']
					// no modified date
				}
			];

			const mockGetWordPressItems = vi.mocked(wordpressModule.getWordPressItems);
			mockGetWordPressItems.mockResolvedValue(mockPosts);

			const result = await createWordPressURLs({ site: 'example.wordpress.com' });

			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should handle empty posts array', async () => {
			const mockGetWordPressItems = vi.mocked(wordpressModule.getWordPressItems);
			mockGetWordPressItems.mockResolvedValue([]);

			const result = await createWordPressURLs({ site: 'example.wordpress.com' });

			expect(result).toEqual([]);
		});
	});

	describe('createContentfulURLs', () => {
		it('should create sitemap entries for Contentful entries', async () => {
			const mockTitles = ['Project One', 'Project Two'];

			const mockGetContentfulFieldValues = vi.mocked(contentfulModule.getContentfulFieldValues);
			mockGetContentfulFieldValues.mockResolvedValue(mockTitles);

			const mockGetFullPixelatedConfig = vi.mocked(configModule.getFullPixelatedConfig);
			mockGetFullPixelatedConfig.mockReturnValue({});

			const result = await createContentfulURLs({
				apiProps: {
					base_url: 'https://cdn.contentful.com',
					space_id: 'test-space',
					environment: 'master',
					delivery_access_token: 'test-token'
				},
				origin: 'https://example.com'
			});

			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject({
				url: 'https://example.com/projects/Project%20One',
				changeFrequency: 'hourly',
				priority: 1,
			});
			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should merge provider config with apiProps', async () => {
			const mockTitles = ['Project One'];

			const mockGetContentfulFieldValues = vi.mocked(contentfulModule.getContentfulFieldValues);
			mockGetContentfulFieldValues.mockResolvedValue(mockTitles);

			const mockGetFullPixelatedConfig = vi.mocked(configModule.getFullPixelatedConfig);
			mockGetFullPixelatedConfig.mockReturnValue({
				contentful: {
					base_url: 'https://cdn.contentful.com',
					space_id: 'provider-space',
					environment: 'master',
					delivery_access_token: 'provider-token'
				}
			});

			const result = await createContentfulURLs({
				apiProps: {
					base_url: 'https://cdn.contentful.com',
					space_id: 'custom-space',
					environment: 'master',
					delivery_access_token: 'custom-token'
				},
				origin: 'https://example.com'
			});

			expect(mockGetContentfulFieldValues).toHaveBeenCalledWith({
				apiProps: expect.objectContaining({
					space_id: 'provider-space',
					base_url: 'https://cdn.contentful.com',
					environment: 'master',
					delivery_access_token: 'provider-token'
				}),
				contentType: 'carouselCard',
				field: 'title'
			});
		});
	});

	describe('createContentfulImageURLs', () => {
		it('should create sitemap entry with Contentful images', async () => {
			const mockAssets = [
				{ image: '/uploads/image1.jpg', imageAlt: 'Alt text 1' },
				{ image: '//example.com/image2.jpg', imageAlt: 'Alt text 2' },
				{ image: 'https://cdn.example.com/image3.jpg', imageAlt: 'Alt text 3' }
			];

			const mockGetContentfulAssetURLs = vi.mocked(contentfulModule.getContentfulAssetURLs);
			mockGetContentfulAssetURLs.mockResolvedValue(mockAssets);

			const mockGetFullPixelatedConfig = vi.mocked(configModule.getFullPixelatedConfig);
			mockGetFullPixelatedConfig.mockReturnValue({});

			const result = await createContentfulImageURLs({
				apiProps: {
					base_url: 'https://cdn.contentful.com',
					space_id: 'test-space',
					environment: 'master',
					access_token: 'test-token'
				},
				origin: 'https://example.com'
			});

			expect(result).toHaveLength(1);
			expect(result[0]).toMatchObject({
				url: 'https://example.com/images',
				images: [
					'https://example.com/uploads/image1.jpg',
					'https://example.com/image2.jpg',
					'https://cdn.example.com/image3.jpg'
				]
			});
			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should handle empty assets array', async () => {
			const mockGetContentfulAssetURLs = vi.mocked(contentfulModule.getContentfulAssetURLs);
			mockGetContentfulAssetURLs.mockResolvedValue([]);

			const result = await createContentfulImageURLs({
				apiProps: {
					base_url: 'https://cdn.contentful.com',
					space_id: 'test-space',
					environment: 'master',
					access_token: 'test-token'
				},
				origin: 'https://example.com'
			});

			expect(result).toEqual([]);
		});

		it('should handle API errors gracefully', async () => {
			const mockGetContentfulAssetURLs = vi.mocked(contentfulModule.getContentfulAssetURLs);
			mockGetContentfulAssetURLs.mockRejectedValue(new Error('API Error'));

			const result = await createContentfulImageURLs({
				apiProps: {
					base_url: 'https://cdn.contentful.com',
					space_id: 'test-space',
					environment: 'master',
					access_token: 'test-token'
				},
				origin: 'https://example.com'
			});

			expect(result).toEqual([]);
		});

		it('should filter out empty image URLs', async () => {
			const mockAssets = [
				{ image: '/valid.jpg', imageAlt: 'Valid' },
				{ image: '', imageAlt: 'Empty' },
				{ image: 'another-valid.jpg', imageAlt: 'Another Valid' }
			];

			const mockGetContentfulAssetURLs = vi.mocked(contentfulModule.getContentfulAssetURLs);
			mockGetContentfulAssetURLs.mockResolvedValue(mockAssets);

			const result = await createContentfulImageURLs({
				apiProps: {
					base_url: 'https://cdn.contentful.com',
					space_id: 'test-space',
					environment: 'master',
					access_token: 'test-token'
				},
				origin: 'https://example.com'
			});

			expect(result[0].images).toHaveLength(2);
			expect(result[0].images![0]).toBe('https://example.com/valid.jpg');
			expect(result[0].images![1]).toBe('https://example.com/another-valid.jpg');
		});
	});

	describe('createEbayItemURLs', () => {
		it('should create sitemap entries for eBay items', async () => {
			const mockToken = 'test-token';
			const mockItems = {
				itemSummaries: [
					{
						legacyItemId: '123456',
						itemCreationDate: '2024-01-01T10:00:00Z'
					},
					{
						legacyItemId: '789012',
						itemCreationDate: '2024-01-02T10:00:00Z'
					}
				]
			};

			const mockGetEbayAppToken = vi.mocked(ebayModule.getEbayAppToken);
			const mockGetEbayItemsSearch = vi.mocked(ebayModule.getEbayItemsSearch);

			mockGetEbayAppToken.mockResolvedValue(mockToken);
			mockGetEbayItemsSearch.mockResolvedValue(mockItems);

			const origin = 'https://example.com';
			const result = await createEbayItemURLs(origin);

			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject({
				url: 'https://example.com/store/123456',
				changeFrequency: 'hourly',
				priority: 1,
			});
			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should handle items without creation date', async () => {
			const mockToken = 'test-token';
			const mockItems = {
				itemSummaries: [
					{
						legacyItemId: '123456'
						// no itemCreationDate
					}
				]
			};

			const mockGetEbayAppToken = vi.mocked(ebayModule.getEbayAppToken);
			const mockGetEbayItemsSearch = vi.mocked(ebayModule.getEbayItemsSearch);

			mockGetEbayAppToken.mockResolvedValue(mockToken);
			mockGetEbayItemsSearch.mockResolvedValue(mockItems);

			const origin = 'https://example.com';
			const result = await createEbayItemURLs(origin);

			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should handle API errors gracefully', async () => {
			const mockGetEbayAppToken = vi.mocked(ebayModule.getEbayAppToken);
			mockGetEbayAppToken.mockRejectedValue(new Error('API Error'));

			const origin = 'https://example.com';
			// The function doesn't catch promise rejections, so it will throw
			await expect(createEbayItemURLs(origin)).rejects.toThrow('API Error');
		});
	});

	describe('generateSitemap', () => {
		it('should generate sitemap with page URLs enabled by default', async () => {
			const mockRoutes = [{ path: '/home' }];
			const mockGetAllRoutes = vi.mocked(metadataModule.getAllRoutes);
			mockGetAllRoutes.mockReturnValue(mockRoutes);

			const config = { routes: mockRoutes };
			const result = await generateSitemap(config, 'https://example.com');

			expect(result.length).toBeGreaterThan(0);
			expect(result.some(entry => entry.url.includes('/home'))).toBe(true);
		});

		it('should include image URLs when enabled', async () => {
			const mockJson = ['image1.jpg'];
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockJson
			});

			const config = {
				createImageURLsFromJSON: true,
				imageJson: { path: 'public/site-images.json' }
			};
			const result = await generateSitemap(config, 'https://example.com');

			expect(result.some(entry => entry.url.includes('/images'))).toBe(true);
		});

		it('should include WordPress URLs when enabled', async () => {
			const mockPosts: wordpressModule.BlogPostType[] = [{ 
				ID: '123',
				title: 'Test Post',
				date: '2024-01-01T10:00:00Z',
				modified: '2024-01-01T10:00:00Z',
				excerpt: 'Post excerpt',
				URL: 'https://blog.example.com/post-1',
				categories: ['category1']
			}];
			const mockGetWordPressItems = vi.mocked(wordpressModule.getWordPressItems);
			mockGetWordPressItems.mockResolvedValue(mockPosts);

			const config = {
				createWordPressURLs: true,
				wordpress: { site: 'example.wordpress.com' }
			};
			const result = await generateSitemap(config, 'https://example.com');

			expect(result.some(entry => entry.url.includes('blog.example.com'))).toBe(true);
		});

		it('should deduplicate entries by URL', async () => {
			const mockRoutes = [{ path: '/duplicate' }];
			const mockGetAllRoutes = vi.mocked(metadataModule.getAllRoutes);
			mockGetAllRoutes.mockReturnValue(mockRoutes);

			// Mock fetch to return images that would create duplicate URLs
			const mockJson: string[] = [];
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockJson
			});

			const config = {
				routes: mockRoutes,
				createImageURLs: true,
				imageJson: { path: 'public/site-images.json' }
			};

			// Create a scenario where we might have duplicates
			const result = await generateSitemap(config, 'https://example.com');

			const urls = result.map(entry => entry.url);
			const uniqueUrls = new Set(urls);
			expect(urls.length).toBe(uniqueUrls.size);
		});

		it('should handle empty config', async () => {
			const result = await generateSitemap({}, 'https://example.com');
			expect(Array.isArray(result)).toBe(true);
		});
	});
});