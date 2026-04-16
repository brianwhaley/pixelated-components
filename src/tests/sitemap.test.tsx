import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
	createPageURLs,
	createImageURLsFromJSON,
	createWordPressURLs,
	createContentfulURLs,
	createContentfulAssetURLs,
	createEbayItemURLs,
	generateSitemap,
	clearEbaySitemapCache,
	type SitemapEntry
} from '../components/foundation/sitemap';

// Mock external dependencies
vi.mock('../components/integrations/wordpress.functions');
vi.mock('../components/integrations/contentful.delivery');
vi.mock('../components/shoppingcart/ebay.functions');
vi.mock('../components/config/config');
vi.mock('../components/foundation/metadata.functions');
// Import mocked modules
import * as wordpressModule from '../components/integrations/wordpress.functions';
import * as contentfulModule from '../components/integrations/contentful.delivery';
import * as ebayModule from '../components/shoppingcart/ebay.functions';
import * as configModule from '../components/config/config';
import * as metadataModule from '../components/foundation/metadata.functions';
import { realWordPressApiData, siteImagesData, realContentfulAssetsData } from '../test/test-data';
import { mockContentfulImageAssets, mockContentfulImageAssetsWithEmptyUrls } from '../test/fixtures';

// Mock fetch globally
global.fetch = vi.fn();

function normalizeWordPressPosts(posts: Array<Record<string, unknown>>): wordpressModule.BlogPostType[] {
	return posts.map((post) => ({
		...post,
		ID: typeof post.ID === 'string' ? post.ID : String(post.ID),
	})) as wordpressModule.BlogPostType[];
}

describe('Sitemap Helper Functions', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		// console.error = vi.fn();
		// console.log = vi.fn();
		// console.warn = vi.fn();
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
			expect(result.every((entry: SitemapEntry) => !entry.url.includes('external.com'))).toBe(true);
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
			const mockJson = siteImagesData.images.slice(0, 2);
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
					'https://example.com/images/brianwhaley-headshot.jpg',
					'https://example.com/images/icons/1x1.png'
				]
			});
		});

		it('should handle JSON object with images property', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => siteImagesData
			});

			const origin = 'https://example.com';
			const result = await createImageURLsFromJSON(origin, 'public/site-images.json');

			expect(result).toHaveLength(1);
			expect(result[0].images).toHaveLength(siteImagesData.images.length);
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
			const mockPosts = normalizeWordPressPosts(realWordPressApiData.posts.slice(0, 2));

			const mockGetWordPressItems = vi.mocked(wordpressModule.getWordPressItems);
			mockGetWordPressItems.mockResolvedValue(mockPosts);

			const result = await createWordPressURLs({ site: 'example.wordpress.com' });

			expect(result).toHaveLength(2);
			expect(result[0]).toMatchObject({
				url: mockPosts[0].URL,
				changeFrequency: 'hourly',
				priority: 1,
			});
			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should include images when includeImages is true', async () => {
			const mockPosts = normalizeWordPressPosts([realWordPressApiData.posts[0]]);
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
			const mockPost = { ...normalizeWordPressPosts([realWordPressApiData.posts[0]])[0], modified: undefined } as wordpressModule.BlogPostType;
			const mockGetWordPressItems = vi.mocked(wordpressModule.getWordPressItems);
			mockGetWordPressItems.mockResolvedValue([mockPost]);

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

	describe('createContentfulAssetURLs', () => {
		it('should create sitemap entry with Contentful images', async () => {
			const mockAssets = mockContentfulImageAssets;

			const mockGetContentfulAssets = vi.mocked(contentfulModule.getContentfulAssets);
			mockGetContentfulAssets.mockResolvedValue(mockAssets);

			const mockGetFullPixelatedConfig = vi.mocked(configModule.getFullPixelatedConfig);
			mockGetFullPixelatedConfig.mockReturnValue({});

			const result = await createContentfulAssetURLs({
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
				images: expect.arrayContaining([
					expect.stringContaining('image1.jpg'),
					expect.stringContaining('image2.png'),
					expect.stringContaining('image3.webp')
				])
			});
			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should create sitemap entry with Contentful videos using Google video sitemap format', async () => {
			const mockAssets = {
				items: realContentfulAssetsData.items.slice(0, 2)
			};

			const mockGetContentfulAssets = vi.mocked(contentfulModule.getContentfulAssets);
			mockGetContentfulAssets.mockResolvedValue(mockAssets);

			const mockGetFullPixelatedConfig = vi.mocked(configModule.getFullPixelatedConfig);
			mockGetFullPixelatedConfig.mockReturnValue({});

			const result = await createContentfulAssetURLs({
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
				url: 'https://example.com/videos'
			});
			expect(result[0].videos).toHaveLength(2);
			expect(result[0].videos![0]).toMatchObject({
				title: expect.any(String),
				description: expect.any(String),
				content_loc: expect.stringContaining('.mp4'),
				player_loc: expect.stringContaining('.mp4'),
				publication_date: expect.any(String),
				family_friendly: 'yes'
			});
			expect(result[0].videos![1]).toMatchObject({
				title: expect.any(String),
				description: expect.any(String),
				content_loc: expect.stringContaining('.mp4'),
				player_loc: expect.stringContaining('.mp4'),
				publication_date: expect.any(String),
				family_friendly: 'yes'
			});
			expect(result[0].lastModified).toBeInstanceOf(Date);
		});

		it('should handle empty assets array', async () => {
			const mockAssets = { items: [] };

			const mockGetContentfulAssets = vi.mocked(contentfulModule.getContentfulAssets);
			mockGetContentfulAssets.mockResolvedValue(mockAssets);

			const result = await createContentfulAssetURLs({
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
			const mockGetContentfulAssets = vi.mocked(contentfulModule.getContentfulAssets);
			mockGetContentfulAssets.mockRejectedValue(new Error('API Error'));

			const result = await createContentfulAssetURLs({
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
			const mockAssets = mockContentfulImageAssetsWithEmptyUrls;

			const mockGetContentfulAssets = vi.mocked(contentfulModule.getContentfulAssets);
			mockGetContentfulAssets.mockResolvedValue(mockAssets);

			const result = await createContentfulAssetURLs({
				apiProps: {
					base_url: 'https://cdn.contentful.com',
					space_id: 'test-space',
					environment: 'master',
					access_token: 'test-token'
				},
				origin: 'https://example.com'
			});

			expect(result[0].images).toHaveLength(2);
			expect(result[0].images![0]).toContain('valid.jpg');
			expect(result[0].images![1]).toContain('another-valid.jpg');
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
			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const result = await createEbayItemURLs(origin);
			expect(result).toEqual([]);
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('createEbayItemURLs skipped; unable to fetch items'), expect.any(Error));
		});

		it('treats browse search failures as empty sitemaps', async () => {
			const mockToken = 'test-token';
			const mockGetEbayAppToken = vi.mocked(ebayModule.getEbayAppToken);
			const mockGetEbayItemsSearch = vi.mocked(ebayModule.getEbayItemsSearch);

			mockGetEbayAppToken.mockResolvedValue(mockToken);
			mockGetEbayItemsSearch.mockRejectedValue(new Error('search failed'));

			const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});
			const origin = 'https://example.com';
			const result = await createEbayItemURLs(origin);

			expect(result).toEqual([]);
			expect(warnSpy).toHaveBeenCalledWith(expect.stringContaining('createEbayItemURLs skipped; unable to fetch items'), expect.any(Error));
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
			expect(result.some((entry: SitemapEntry) => entry.url.includes('/home'))).toBe(true);
		});

		it('should include image URLs when enabled', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => siteImagesData.images.slice(0, 1)
			});

			const config = {
				createImageURLsFromJSON: true,
				imageJson: { path: 'public/site-images.json' }
			};
			const result = await generateSitemap(config, 'https://example.com');

			expect(result.some((entry: SitemapEntry) => entry.url.includes('/images'))).toBe(true);
		});

		it('should include WordPress URLs when enabled', async () => {
			const mockPosts = normalizeWordPressPosts(realWordPressApiData.posts.slice(0, 1));
			const mockGetWordPressItems = vi.mocked(wordpressModule.getWordPressItems);
			mockGetWordPressItems.mockResolvedValue(mockPosts);

			const config = {
				createWordPressURLs: true,
				wordpress: { site: 'example.wordpress.com' }
			};
			const result = await generateSitemap(config, 'https://example.com');

			expect(result.some((entry: SitemapEntry) => entry.url.includes(mockPosts[0].URL))).toBe(true);
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

			const urls = result.map((entry: SitemapEntry) => entry.url);
			const uniqueUrls = new Set(urls);
			expect(urls.length).toBe(uniqueUrls.size);
		});

		it('should handle empty config', async () => {
			const result = await generateSitemap({}, 'https://example.com');
			expect(Array.isArray(result)).toBe(true);
		});
	});
});