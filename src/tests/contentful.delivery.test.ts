import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import * as contentfulModule from '../components/general/contentful.delivery';

// Mock fetch globally
global.fetch = vi.fn();

describe('Contentful Delivery API', () => {
	beforeEach(() => {
		vi.clearAllMocks();
		console.error = vi.fn();
		console.log = vi.fn();
	});

	afterEach(() => {
		vi.restoreAllMocks();
	});

	describe('callContentfulDeliveryAPI', () => {
		it('should fetch and return JSON data', async () => {
			const mockData = { items: [], total: 0 };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockData
			});

			const result = await contentfulModule.callContentfulDeliveryAPI({
				full_url: 'https://api.example.com/entries'
			});

			expect(result).toEqual(mockData);
		});

		it('should handle API errors', async () => {
			(global.fetch as any).mockRejectedValueOnce(new Error('Network error'));

			const result = await contentfulModule.callContentfulDeliveryAPI({
				full_url: 'https://api.example.com/error'
			});

			expect(result).toBeNull();
		});

		it('should handle non-OK response status', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				status: 404
			});

			const result = await contentfulModule.callContentfulDeliveryAPI({
				full_url: 'https://api.example.com/notfound'
			});

			expect(result).toBeNull();
		});
	});

	describe('getContentfulEntries', () => {
		const mockApiProps = {
			base_url: 'https://api.contentful.com',
			space_id: 'test-space',
			environment: 'master',
			delivery_access_token: 'test-token'
		};

		it('should fetch entries', async () => {
			const mockData = { items: [] };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockData
			});

			const result = await contentfulModule.getContentfulEntries({
				apiProps: mockApiProps
			});

			expect(result).toEqual(mockData);
		});

		it('should include space_id in URL', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: [] })
			});

			await contentfulModule.getContentfulEntries({
				apiProps: mockApiProps
			});

			const callUrl = (global.fetch as any).mock.calls[0][0];
			expect(callUrl).toContain('test-space');
		});

		it('should include delivery token in URL', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: [] })
			});

			await contentfulModule.getContentfulEntries({
				apiProps: mockApiProps
			});

			const callUrl = (global.fetch as any).mock.calls[0][0];
			expect(callUrl).toContain('test-token');
		});
	});

	describe('getContentfulEntriesByType', () => {
		const mockApiProps = {
			base_url: 'https://api.contentful.com',
			space_id: 'test-space',
			environment: 'master',
			delivery_access_token: 'test-token'
		};

		const mockEntries = {
			items: [
				{ sys: { contentType: { sys: { id: 'article' } } }, fields: { title: 'Article 1' } },
				{ sys: { contentType: { sys: { id: 'post' } } }, fields: { title: 'Post 1' } },
				{ sys: { contentType: { sys: { id: 'article' } } }, fields: { title: 'Article 2' } }
			]
		};

		it('should filter entries by content type', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockEntries
			});

			const result = await contentfulModule.getContentfulEntriesByType({
				apiProps: mockApiProps,
				contentType: 'article'
			});

			expect(result.items).toHaveLength(2);
		});

		it('should return empty items if no type matches', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockEntries
			});

			const result = await contentfulModule.getContentfulEntriesByType({
				apiProps: mockApiProps,
				contentType: 'nonexistent'
			});

			expect(result.items).toHaveLength(0);
		});
	});

	describe('getContentfulContentType', () => {
		const mockApiProps = {
			base_url: 'https://api.contentful.com',
			space_id: 'test-space',
			environment: 'master',
			access_token: 'test-token'
		};

		it('should fetch content type definition', async () => {
			const mockContentType = { sys: { id: 'article' }, fields: [] };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockContentType
			});

			const result = await contentfulModule.getContentfulContentType({
				apiProps: mockApiProps,
				contentType: 'article'
			});

			expect(result).toEqual(mockContentType);
		});
	});

	describe('getContentfulEntryByEntryID', () => {
		const mockApiProps = {
			base_url: 'https://api.contentful.com',
			space_id: 'test-space',
			environment: 'master',
			delivery_access_token: 'test-token'
		};

		it('should fetch entry by ID', async () => {
			const mockEntry = { sys: { id: 'entry123' }, fields: { title: 'Test' } };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockEntry
			});

			const result = await contentfulModule.getContentfulEntryByEntryID({
				apiProps: mockApiProps,
				entry_id: 'entry123'
			});

			expect(result).toEqual(mockEntry);
		});

		it('should include entry_id in URL', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({})
			});

			await contentfulModule.getContentfulEntryByEntryID({
				apiProps: mockApiProps,
				entry_id: 'entry456'
			});

			const callUrl = (global.fetch as any).mock.calls[0][0];
			expect(callUrl).toContain('entry456');
		});
	});

	describe('getContentfulEntryByField', () => {
		const mockCards = {
			items: [
				{ fields: { slug: 'article-one', title: 'Article 1' } },
				{ fields: { slug: 'article-two', title: 'Article 2' } },
				{ fields: { slug: 'article-three', title: 'Article 3' } }
			]
		};

		it('should find entry by field value', async () => {
			const result = await contentfulModule.getContentfulEntryByField({
				cards: mockCards,
				searchField: 'slug',
				searchVal: 'article-one'
			});

			expect(result).toEqual(mockCards.items[0]);
		});

		it('should be case-insensitive', async () => {
			const result = await contentfulModule.getContentfulEntryByField({
				cards: mockCards,
				searchField: 'slug',
				searchVal: 'ARTICLE-TWO'
			});

			expect(result).toEqual(mockCards.items[1]);
		});

		it('should return null if not found', async () => {
			const result = await contentfulModule.getContentfulEntryByField({
				cards: mockCards,
				searchField: 'slug',
				searchVal: 'nonexistent'
			});

			expect(result).toBeNull();
		});

		it('should handle URL encoded values', async () => {
			const result = await contentfulModule.getContentfulEntryByField({
				cards: mockCards,
				searchField: 'slug',
				searchVal: 'article%2Done'
			});

			expect(result).toEqual(mockCards.items[0]);
		});

		it('should handle missing field gracefully', async () => {
			const cardsWithMissing = {
				items: [
					{ fields: { title: 'No slug' } },
					{ fields: { slug: 'article-two', title: 'Article 2' } }
				]
			};

			const result = await contentfulModule.getContentfulEntryByField({
				cards: cardsWithMissing,
				searchField: 'slug',
				searchVal: 'article-two'
			});

			expect(result).toEqual(cardsWithMissing.items[1]);
		});
	});

	describe('getContentfulFieldValues', () => {
		const mockApiProps = {
			base_url: 'https://api.contentful.com',
			space_id: 'test-space',
			environment: 'master',
			delivery_access_token: 'test-token'
		};

		const mockEntries = {
			items: [
				{ sys: { contentType: { sys: { id: 'article' } } }, fields: { title: 'Title 1' } },
				{ sys: { contentType: { sys: { id: 'article' } } }, fields: { title: 'Title 2' } }
			]
		};

		it('should extract field values from entries', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockEntries
			});

			const result = await contentfulModule.getContentfulFieldValues({
				apiProps: mockApiProps,
				contentType: 'article',
				field: 'title'
			});

			expect(Array.isArray(result)).toBe(true);
		});
	});

	describe('getContentfulImagesFromEntries', () => {
		const mockImages = [
			{ sys: { id: 'image1' } },
			{ sys: { id: 'image2' } }
		];

		const mockAssets = [
			{
				sys: { id: 'image1' },
				fields: {
					file: { url: 'https://example.com/image1.jpg' },
					description: 'Image 1'
				}
			},
			{
				sys: { id: 'image2' },
				fields: {
					file: { url: 'https://example.com/image2.jpg' },
					description: 'Image 2'
				}
			}
		];

		it('should match images to assets and return URLs', async () => {
			const result = await contentfulModule.getContentfulImagesFromEntries({
				images: mockImages,
				assets: mockAssets
			});

			expect(result).toHaveLength(2);
			expect(result[0].image).toContain('image1.jpg');
			expect(result[0].imageAlt).toBe('Image 1');
		});

		it('should include query parameters in URL', async () => {
			const result = await contentfulModule.getContentfulImagesFromEntries({
				images: mockImages,
				assets: mockAssets
			});

			expect(result[0].image).toContain('fm=webp');
			expect(result[0].image).toContain('q=50');
		});

		it('should return empty array if no matches', async () => {
			const result = await contentfulModule.getContentfulImagesFromEntries({
				images: [{ sys: { id: 'nonexistent' } }],
				assets: mockAssets
			});

			expect(result).toHaveLength(0);
		});
	});

	describe('getContentfulAssets', () => {
		const mockApiProps = {
			base_url: 'https://api.contentful.com',
			space_id: 'test-space',
			environment: 'master',
			access_token: 'test-token'
		};

		it('should fetch assets', async () => {
			const mockAssets = { items: [] };
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await contentfulModule.getContentfulAssets({
				apiProps: mockApiProps
			});

			expect(result).toEqual(mockAssets);
		});

		it('should include assets endpoint in URL', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => ({ items: [] })
			});

			await contentfulModule.getContentfulAssets({
				apiProps: mockApiProps
			});

			const callUrl = (global.fetch as any).mock.calls[0][0];
			expect(callUrl).toContain('/assets');
		});
	});

	describe('getContentfulAssetURLs', () => {
		const mockApiProps = {
			base_url: 'https://api.contentful.com',
			space_id: 'test-space',
			environment: 'master',
			access_token: 'test-token'
		};

		const mockAssets = {
			items: [
				{
					fields: {
						file: { url: 'https://example.com/asset1.jpg' },
						description: 'Asset 1'
					}
				},
				{
					fields: {
						file: { url: 'https://example.com/asset2.png' },
						description: 'Asset 2'
					}
				}
			]
		};

		it('should return array of asset URLs', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await contentfulModule.getContentfulAssetURLs({
				apiProps: mockApiProps
			});

			expect(Array.isArray(result)).toBe(true);
			expect(result).toHaveLength(2);
		});

		it('should include query parameters', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await contentfulModule.getContentfulAssetURLs({
				apiProps: mockApiProps
			});

			expect(result[0].image).toContain('fm=webp');
			expect(result[0].image).toContain('q=50');
		});

		it('should include image alt text', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockAssets
			});

			const result = await contentfulModule.getContentfulAssetURLs({
				apiProps: mockApiProps
			});

			expect(result[0].imageAlt).toBe('Asset 1');
			expect(result[1].imageAlt).toBe('Asset 2');
		});
	});

	describe('getContentfulDiscountCodes', () => {
		const mockApiProps = {
			base_url: 'https://api.contentful.com',
			space_id: 'test-space',
			environment: 'master',
			delivery_access_token: 'test-token'
		};

		it('should return empty array on error', async () => {
			(global.fetch as any).mockRejectedValueOnce(new Error('API Error'));

			const result = await contentfulModule.getContentfulDiscountCodes({
				apiProps: mockApiProps,
				contentType: 'all'
			});

			expect(result).toEqual([]);
		});

		it('should handle missing response items', async () => {
			(global.fetch as any).mockResolvedValueOnce({
				ok: false,
				items: undefined
			});

			const result = await contentfulModule.getContentfulDiscountCodes({
				apiProps: mockApiProps,
				contentType: 'all'
			});

			expect(result).toEqual([]);
		});

		it('should fetch discount codes successfully', async () => {
			const mockResponse = {
				items: [
					{
						sys: { contentType: { sys: { id: 'discountCodes' } } },
						fields: {
							codeName: 'SUMMER2024',
							codeDescription: 'Summer discount',
							codeType: 'percentage',
							codeValue: '20'
						}
					}
				]
			};

			(global.fetch as any).mockResolvedValueOnce({
				ok: true,
				json: async () => mockResponse
			});

			const result = await contentfulModule.getContentfulDiscountCodes({
				apiProps: mockApiProps,
				contentType: 'discountCodes'
			});

			expect(Array.isArray(result)).toBe(true);
		});
	});
});
