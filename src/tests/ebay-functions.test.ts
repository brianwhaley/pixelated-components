import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest';
import { 
	getEbayAppToken, 
	getEbayBrowseSearch, 
	getEbayBrowseItem, 
	getEbayRateLimits,
	getShoppingCartItem,
	getEbayItems,
	getEbayItem,
	getEbayItemsSearch
} from '../components/shoppingcart/ebay.functions';

import * as configModule from '../components/config/config';
import { mockConfig } from '../test/config.mock';
import { buildUrl } from '../components/general/urlbuilder';

// Mock smartFetch since that's what the functions use
vi.mock('../components/general/smartfetch', () => ({
	smartFetch: vi.fn()
}));

const { smartFetch } = await import('../components/general/smartfetch');

describe('ebay.functions logic', () => {
	const apiProps = mockConfig.ebay;
	let getFullConfigSpy: any;

	beforeEach(() => {
		vi.clearAllMocks();
		getFullConfigSpy = vi.spyOn(configModule, 'getFullPixelatedConfig').mockReturnValue(mockConfig as any);
	});

	afterEach(() => {
		vi.clearAllMocks();
		getFullConfigSpy?.mockRestore();
	});

	describe('getEbayAppToken', () => {
		it('should fetch and return access token', async () => {
			vi.mocked(smartFetch).mockResolvedValueOnce({
				access_token: 'test-token-123'
			} as any);

			const token = await getEbayAppToken({ apiProps: apiProps as any });
			expect(token).toBe('test-token-123');
		});

		it('should handle fetch errors', async () => {
			vi.mocked(smartFetch).mockRejectedValue(new Error('Network error'));

			const token = await getEbayAppToken({ apiProps: apiProps as any });
			expect(token).toBeUndefined();
		});
	});

	describe('getShoppingCartItem', () => {
		it('should format ebay items into shopping cart items', () => {
			const ebayItem = {
				itemId: 'v1|123|0',
				title: 'Test Item',
				price: { value: '10.00', currency: 'USD' },
				image: { imageUrl: 'test.jpg' },
				itemWebUrl: 'https://ebay.com/123',
				categories: [{ categoryId: '123' }]
			};
			const cartItem = getShoppingCartItem({ thisItem: ebayItem });
			expect(cartItem.itemID).toBe(undefined); // legacyItemId is used in code
			expect(cartItem.itemCost).toBe('10.00');
		});

		it('should use default qty for other categories', () => {
			const ebayItem = {
				itemId: '456',
				image: { imageUrl: 'test.jpg' },
				categories: [{ categoryId: '999' }],
				price: { value: '20.00' }
			};
			const cartItem = getShoppingCartItem({ thisItem: ebayItem });
			expect(cartItem.itemQuantity).toBe(10);
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

		describe('getShoppingCartItem', () => {
			it('should convert eBay item with all properties', () => {
				const ebayItem = {
					categoryId: '12345',
					title: 'Test Product',
					legacyItemId: 'ebay-123',
					itemWebUrl: 'https://ebay.com/item/123',
					price: { value: '99.99' },
					thumbnailImages: [{ imageUrl: 'https://image.url/img.jpg' }]
				};

				const result = getShoppingCartItem({
					thisItem: ebayItem,
					apiProps: { itemCategory: '12345' }
				});

				expect(result.itemTitle).toBe('Test Product');
				expect(result.itemQuantity).toBe(1);
				expect(result.itemCost).toBe('99.99');
			});

			it('should set quantity to 10 for non-matching categories', () => {
				const ebayItem = {
					categoryId: '12345',
					title: 'Test Product',
					legacyItemId: 'ebay-123',
					itemWebUrl: 'https://ebay.com/item/123',
					price: { value: '99.99' }
				};

				const result = getShoppingCartItem({
					thisItem: ebayItem,
					apiProps: { itemCategory: 'different' }
				});

				expect(result.itemQuantity).toBe(10);
			});

			it('should handle categories array', () => {
				const ebayItem = {
					categories: [{ categoryId: '99999' }],
					title: 'Array Category Item',
					legacyItemId: 'ebay-456',
					itemWebUrl: 'https://ebay.com/item/456',
					price: { value: '49.99' }
				};

				const result = getShoppingCartItem({
					thisItem: ebayItem,
					apiProps: { itemCategory: '99999' }
				});

				expect(result.itemQuantity).toBe(1);
			});

			it('should handle image URLs correctly', () => {
				const ebayItem = {
					title: 'Image Test',
					legacyItemId: 'ebay-789',
					itemWebUrl: 'https://ebay.com/item/789',
					price: { value: '29.99' },
					thumbnailImages: [{ imageUrl: 'https://thumb.url/img.jpg' }]
				};

				const result = getShoppingCartItem({ thisItem: ebayItem, apiProps: {} });
				expect(result.itemImageURL).toContain('thumb.url');
			});
		});
	});
});
