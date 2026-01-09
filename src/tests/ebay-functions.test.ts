import { vi, describe, it, expect, beforeEach } from 'vitest';
import { 
	getEbayAppToken, 
	getEbayBrowseSearch, 
	getEbayBrowseItem, 
	getEbayAllRateLimits,
	getShoppingCartItem,
	getEbayItems,
	getEbayItem,
	getEbayItemsSearch
} from '../components/shoppingcart/ebay.functions';

import { getFullPixelatedConfig } from '../components/config/config';

describe('ebay.functions logic', () => {
	const config = getFullPixelatedConfig();
	const apiProps = config.ebay;

	beforeEach(() => {
		vi.resetAllMocks();
		vi.stubGlobal('fetch', vi.fn());
	});

	describe('getEbayAppToken', () => {
		it('should fetch and return access token', async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ access_token: 'test-token-123' })
			} as Response);

			const token = await getEbayAppToken({ apiProps: apiProps as any });
			expect(token).toBe('test-token-123');
			expect(global.fetch).toHaveBeenCalledWith(
				expect.stringContaining('api.ebay.com/identity/v1/oauth2/token'),
				expect.objectContaining({ method: 'POST' })
			);
		});

		it('should handle fetch errors', async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: false,
				statusText: 'Internal Server Error',
				status: 500
			} as Response);

			const token = await getEbayAppToken({ apiProps: apiProps as any });
			expect(token).toBeUndefined();
		});
	});

	describe('getEbayBrowseSearch', () => {
		it('should fetch search data and use cache', async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ total: 1 })
			} as Response);

			const res1 = await getEbayBrowseSearch({ token: 'tok', apiProps: apiProps as any });
			expect(res1).toEqual({ total: 1 });
			
			// Second call should come from cache (fetch only called once)
			const res2 = await getEbayBrowseSearch({ token: 'tok', apiProps: apiProps as any });
			expect(res2).toEqual({ total: 1 });
			expect(global.fetch).toHaveBeenCalledTimes(1);
		});
	});

	describe('getEbayBrowseItem', () => {
		it('should fetch item data', async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ itemId: '123' })
			} as Response);

			const res = await getEbayBrowseItem({ token: 'tok', apiProps: apiProps as any });
			expect(res).toEqual({ itemId: '123' });
		});
	});

	describe('getEbayAllRateLimits', () => {
		it('should fetch and combine rate limits', async () => {
			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ rate_limit: 'global-data' })
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ rate_limit: 'user-data' })
				} as Response);

			const res = await getEbayAllRateLimits({ token: 'tok', apiProps: apiProps as any });
			expect(res?.rate_limit).toEqual({ rate_limit: 'global-data' });
			expect(res?.user_rate_limit).toEqual({ rate_limit: 'user-data' });
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

	describe('Exported Helper Functions', () => {
		it('getEbayItems should chain token and search', async () => {
			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ access_token: 'tok-abc' })
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ total: 1 })
				} as Response);

			const res = await getEbayItems({ apiProps: apiProps as any });
			expect(res).toEqual({ total: 1 });
		});

		it('getEbayItem should chain token and getItem', async () => {
			vi.mocked(global.fetch)
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ access_token: 'tok-abc' })
				} as Response)
				.mockResolvedValueOnce({
					ok: true,
					json: () => Promise.resolve({ itemId: '123' })
				} as Response);

			const res = await getEbayItem({ apiProps: apiProps as any });
			expect(res).toEqual({ itemId: '123' });
		});

		it('getEbayItemsSearch should work similar to browse search', async () => {
			vi.mocked(global.fetch).mockResolvedValueOnce({
				ok: true,
				json: () => Promise.resolve({ total: 5 })
			} as Response);
			// Use slightly different props to avoid cache hit from previous tests
			const searchProps = { ...apiProps, qsSearchURL: '?q=camera' };
			const res = await getEbayItemsSearch({ token: 't', apiProps: searchProps as any });
			expect(res).toEqual({ total: 5 });
		});
	});
});
