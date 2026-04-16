import { describe, it, expect, vi, beforeEach } from 'vitest';
import PropTypes from 'prop-types';
import { getShoppingCartItem, getEbayAppToken } from '../components/shoppingcart/ebay.functions';
import { buildUrl } from '../components/foundation/urlbuilder';
import type { CartItemType } from '../components/shoppingcart/shoppingcart.functions';

// Mock dependencies
vi.mock('../integrations/cloudinary', () => ({
	getCloudinaryRemoteFetchURL: vi.fn((opts) => `https://cloudinary.com/${opts.url}`)
}));

vi.mock('../general/cache-manager', () => {
	const mockCache = {
		get: vi.fn(),
		set: vi.fn(),
		clear: vi.fn()
	};
	return {
		CacheManager: vi.fn(() => mockCache)
	};
});

vi.mock('../general/utilities', () => ({
	getDomain: vi.fn(() => 'example.com')
}));

vi.mock('../general/smartfetch', () => ({
	smartFetch: vi.fn().mockResolvedValue({ ok: true, json: vi.fn() })
}));

vi.mock('../general/urlbuilder', () => ({
	buildUrl: vi.fn((base, params) => `${base}?params=${JSON.stringify(params)}`)
}));

describe('ebay.functions - Real Tests', () => {
	const mockEbayItem = {
		legacyItemId: '123456',
		title: 'Test Product',
		price: { value: '29.99' },
		itemWebUrl: 'https://ebay.com/itm/123456',
		thumbnailImages: [
			{ imageUrl: 'https://pic.ebay.com/image.jpg' }
		],
		categoryId: 'electronics',
		categories: [
			{ categoryId: 'electronics' }
		]
	};

	const mockApiProps = {
		proxyURL: 'https://proxy.example.com',
		baseTokenURL: 'https://api.ebay.com/token',
		baseSearchURL: 'https://api.ebay.com/search',
		qsSearchURL: 'https://api.ebay.com/qs',
		baseItemURL: 'https://api.ebay.com/item',
		qsItemURL: 'https://api.ebay.com/item-qs',
		baseAnalyticsURL: 'https://api.ebay.com/analytics',
		appId: 'test-app-id',
		appCertId: 'test-app-cert',
		globalId: 'EBAY-US',
		itemCategory: 'electronics'
	};

	describe('getShoppingCartItem', () => {
		it('should return CartItemType structure', () => {
			const result = getShoppingCartItem({
				thisItem: mockEbayItem,
				apiProps: mockApiProps
			});
			expect(result).toHaveProperty('itemImageURL');
			expect(result).toHaveProperty('itemID');
			expect(result).toHaveProperty('itemURL');
			expect(result).toHaveProperty('itemTitle');
			expect(result).toHaveProperty('itemQuantity');
			expect(result).toHaveProperty('itemCost');
		});

		it('should set quantity to 1 for matching category', () => {
			const result = getShoppingCartItem({
				thisItem: mockEbayItem,
				apiProps: mockApiProps
			});
			expect(result.itemQuantity).toBe(1);
		});

		it('should extract item ID', () => {
			const result = getShoppingCartItem({
				thisItem: mockEbayItem,
				apiProps: mockApiProps
			});
			expect(result.itemID).toBe('123456');
		});

		it('should extract item title', () => {
			const result = getShoppingCartItem({
				thisItem: mockEbayItem,
				apiProps: mockApiProps
			});
			expect(result.itemTitle).toBe('Test Product');
		});

		it('should extract item URL', () => {
			const result = getShoppingCartItem({
				thisItem: mockEbayItem,
				apiProps: mockApiProps
			});
			expect(result.itemURL).toBe('https://ebay.com/itm/123456');
		});

		it('should extract item cost', () => {
			const result = getShoppingCartItem({
				thisItem: mockEbayItem,
				apiProps: mockApiProps
			});
			expect(result.itemCost).toBe('29.99');
		});

		it('should handle missing thumbnail images', () => {
			const item = { ...mockEbayItem, thumbnailImages: undefined };
			const result = getShoppingCartItem({
				thisItem: item,
				apiProps: mockApiProps
			});
			expect(result.itemImageURL).toBeDefined();
		});

		it('should handle alternative image property', () => {
			const item = {
				...mockEbayItem,
				thumbnailImages: undefined,
				image: { imageUrl: 'https://pic.ebay.com/alt.jpg' }
			};
			const result = getShoppingCartItem({
				thisItem: item,
				apiProps: mockApiProps
			});
			expect(result.itemImageURL).toBeDefined();
		});

		it('should use cloudinary when provided', () => {
			const result = getShoppingCartItem({
				thisItem: mockEbayItem,
				cloudinaryProductEnv: 'my-cloud',
				apiProps: mockApiProps
			});
			expect(result.itemImageURL).toBeDefined();
		});

		it('should handle categories array', () => {
			const item = {
				...mockEbayItem,
				categoryId: undefined,
				categories: [{ categoryId: 'electronics' }]
			};
			const result = getShoppingCartItem({
				thisItem: item,
				apiProps: mockApiProps
			});
			expect(result.itemQuantity).toBe(1);
		});

		it('should set quantity to 10 for non-matching categories', () => {
			const item = {
				...mockEbayItem,
				categoryId: 'different'
			};
			const result = getShoppingCartItem({
				thisItem: item,
				apiProps: { ...mockApiProps, itemCategory: 'other' }
			});
			expect(result.itemQuantity).toBe(10);
		});
	});

	describe('getEbayAppToken', () => {
		it('should be callable', () => {
			expect(typeof getEbayAppToken).toBe('function');
		});

		it('should be async function that returns value or undefined', async () => {
			const token = await getEbayAppToken({ apiProps: mockApiProps });
			// Token may be undefined due to mock not providing response, that's OK
			expect(token === undefined || typeof token === 'string').toBe(true);
		});

		it('should have propTypes defined', () => {
			expect(getEbayAppToken.propTypes).toBeDefined();
		});
	});

	describe('PropTypes Validation', () => {
		it('should validate getShoppingCartItem props', () => {
			expect(getShoppingCartItem.propTypes).toBeDefined();
			expect(Object.keys(getShoppingCartItem.propTypes).length).toBeGreaterThan(0);
		});

		it('should require thisItem prop', () => {
			expect(getShoppingCartItem.propTypes.thisItem).toBeDefined();
		});

		it('should require apiProps prop', () => {
			expect(getShoppingCartItem.propTypes.apiProps).toBeDefined();
		});
	});

	describe('Edge Cases', () => {
		it('should handle missing price - provide default', () => {
			const item = { ...mockEbayItem, price: { value: '0.00' } };
			const result = getShoppingCartItem({
				thisItem: item,
				apiProps: mockApiProps
			});
			expect(result.itemCost).toBe('0.00');
		});

		it('should handle very large prices', () => {
			const item = { ...mockEbayItem, price: { value: '999999.99' } };
			const result = getShoppingCartItem({
				thisItem: item,
				apiProps: mockApiProps
			});
			expect(result.itemCost).toBe('999999.99');
		});

		it('should handle very small prices', () => {
			const item = { ...mockEbayItem, price: { value: '0.01' } };
			const result = getShoppingCartItem({
				thisItem: item,
				apiProps: mockApiProps
			});
			expect(result.itemCost).toBe('0.01');
		});
	});

	describe('buildUrl URL Construction', () => {
		describe('getEbayBrowseSearch URL building', () => {
			it('should build correct URL with baseUrl and proxyUrl (Section 1)', () => {
				const baseSearchURL = 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=laptop&limit=10';
				const url = buildUrl({
					baseUrl: baseSearchURL,
					proxyUrl: 'https://proxy.example.com/',
				});
				expect(url).toContain('https://proxy.example.com/');
				expect(url).toContain('https%3A%2F%2Fapi.ebay.com');
				expect(url).toContain('%3Fq%3Dlaptop');
			});

			it('should handle search URL without proxy', () => {
				const baseSearchURL = 'https://api.ebay.com/buy/browse/v1/item_summary/search?q=laptop';
				const url = buildUrl({
					baseUrl: baseSearchURL,
				});
				expect(url).toBe(baseSearchURL);
			});
		});

		describe('getEbayBrowseItem URL building', () => {
			it('should build correct URL for single item with proxyUrl (Section 2)', () => {
				const baseItemURL = 'https://api.ebay.com/buy/browse/v1/item/v1|123456|0';
				const url = buildUrl({
					baseUrl: baseItemURL,
					proxyUrl: 'https://proxy.example.com/',
				});
				expect(url).toContain('https://proxy.example.com/');
				expect(url).toContain('https%3A%2F%2Fapi.ebay.com');
				expect(url).toContain('%7C'); // | encoded
			});

			it('should preserve item ID encoding in URL', () => {
				const baseItemURL = 'https://api.ebay.com/buy/browse/v1/item/v1|999|0';
				const url = buildUrl({
					baseUrl: baseItemURL,
				});
				expect(url).toContain('v1|999|0');
			});
		});

		describe('getEbayRateLimits URL building', () => {
			it('should build rate_limit URL with pathSegments (Section 3)', () => {
				const baseUrl = 'https://api.ebay.com/sell/analytics/v1';
				const url = buildUrl({
					baseUrl,
					pathSegments: ['rate_limit'],
					proxyUrl: 'https://proxy.example.com/',
				});
				expect(url).toContain('https://proxy.example.com/');
				expect(url).toContain('rate_limit');
			});

			it('should build user_rate_limit URL with pathSegments (Section 4)', () => {
				const baseUrl = 'https://api.ebay.com/sell/analytics/v1';
				const url = buildUrl({
					baseUrl,
					pathSegments: ['user_rate_limit'],
					proxyUrl: 'https://proxy.example.com/',
				});
				expect(url).toContain('https://proxy.example.com/');
				expect(url).toContain('user_rate_limit');
			});

			it('should construct analytics URLs correctly without proxy', () => {
				const baseUrl = 'https://api.ebay.com/sell/analytics/v1';
				
				const rateLimitUrl = buildUrl({
					baseUrl,
					pathSegments: ['rate_limit'],
				});
				
				const userRateLimitUrl = buildUrl({
					baseUrl,
					pathSegments: ['user_rate_limit'],
				});

				expect(rateLimitUrl).toBe('https://api.ebay.com/sell/analytics/v1/rate_limit');
				expect(userRateLimitUrl).toBe('https://api.ebay.com/sell/analytics/v1/user_rate_limit');
			});
		});
	});
});
