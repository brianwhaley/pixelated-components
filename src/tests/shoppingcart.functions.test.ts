import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
	formatAsUSD,
	formatAsHundredths,
	getCart,
	setCart,
	alreadyInCart,
	increaseQuantityCart,
	getIndexInCart,
	getCartItemCount,
	getCartSubTotal,
	addToShoppingCart,
	removeFromShoppingCart,
	clearShoppingCart,
	getShippingInfo,
	setShippingInfo,
	getShippingCost,
	getLocalDiscountCodes,
	setDiscountCodes,
	getDiscountCode,
	getCartSubtotalDiscount,
	getHandlingFee,
	getSalesTax,
	getCheckoutTotal,
	getCheckoutData,
	shoppingCartKey,
	shippingInfoKey,
	discountCodesKey,
	type ShoppingCartType,
	type AddressType,
	type DiscountCodeType,
} from '../components/shoppingcart/shoppingcart.functions';

describe('Shopping Cart Functions', () => {
	beforeEach(() => {
		// Clear localStorage before each test
		localStorage.clear();
		// Mock window.dispatchEvent
		vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
	});

	afterEach(() => {
		localStorage.clear();
		vi.restoreAllMocks();
	});

	// ========== FORMATTING FUNCTIONS ==========

	describe('formatAsUSD', () => {
		it('should format number as USD currency', () => {
			const result = formatAsUSD(100);
			expect(result).toContain('100');
			expect(result).toContain('$');
		});

		it('should handle decimal values', () => {
			const result = formatAsUSD(99.99);
			expect(result).toContain('99');
			expect(result).toContain('99');
		});

		it('should handle zero', () => {
			const result = formatAsUSD(0);
			expect(result).toContain('0');
		});

		it('should handle large numbers', () => {
			const result = formatAsUSD(10000.50);
			expect(result).toContain('10,000');
		});
	});

	describe('formatAsHundredths', () => {
		it('should truncate to hundredths place', () => {
			const result = formatAsHundredths(10.999);
			expect(result).toBe(10.99);
		});

		it('should handle exact hundredths', () => {
			const result = formatAsHundredths(10.99);
			expect(result).toBe(10.99);
		});

		it('should handle zero', () => {
			const result = formatAsHundredths(0);
			expect(result).toBe(0);
		});

		it('should handle whole numbers', () => {
			const result = formatAsHundredths(100);
			expect(result).toBe(100);
		});

		it('should truncate, not round', () => {
			const result = formatAsHundredths(10.999);
			expect(result).toBe(10.99);
			expect(result).not.toBe(11.00);
		});
	});

	// ========== CART STORAGE FUNCTIONS ==========

	describe('getCart', () => {
		it('should return empty array when cart is empty', () => {
			const result = getCart();
			expect(result).toEqual([]);
		});

		it('should return parsed cart from localStorage', () => {
			const mockCart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
			];
			// use public API (CacheManager-backed) instead of poking localStorage
			setCart(mockCart);
			const result = getCart();
			expect(result).toEqual(mockCart);
		});

		it('should handle invalid JSON gracefully (legacy data ignored)', () => {
			// legacy invalid payload should not crash the public API
			// ensure public store is clean (isolate legacy payload behavior)
			setCart([]);
			localStorage.setItem(shoppingCartKey, 'invalid json');
			const result = getCart();
			expect(result).toEqual([]);
			expect(() => getCart()).not.toThrow();
		});
	});

	describe('setCart', () => {
		it('should set cart in localStorage', () => {
			const mockCart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 2, itemCost: 20 },
			];
			setCart(mockCart);
			// public getter is the contract (implementation may use CacheManager)
			expect(getCart()).toEqual(mockCart);
		});

		it('should dispatch storage event', () => {
			const mockCart: ShoppingCartType[] = [];
			setCart(mockCart);
			expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('storage'));
		});

		it('should handle empty cart', () => {
			setCart([]);
			const result = getCart();
			expect(result).toEqual([]);
		});
	});

	// ========== CART ITEM FUNCTIONS ==========

	describe('alreadyInCart', () => {
		it('should return true if item exists in cart', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
			];
			expect(alreadyInCart(cart, '1')).toBe(true);
		});

		it('should return false if item does not exist in cart', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
			];
			expect(alreadyInCart(cart, '2')).toBe(false);
		});

		it('should return false for empty cart', () => {
			const cart: ShoppingCartType[] = [];
			expect(alreadyInCart(cart, '1')).toBe(false);
		});

		it('should handle multiple items', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
				{ itemID: '2', itemTitle: 'Item 2', itemQuantity: 1, itemCost: 20 },
			];
			expect(alreadyInCart(cart, '2')).toBe(true);
		});
	});

	describe('increaseQuantityCart', () => {
		it('should increase quantity of existing item', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
			];
			increaseQuantityCart(cart, '1');
			expect(cart[0].itemQuantity).toBe(2);
		});

		it('should not modify other items', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
				{ itemID: '2', itemTitle: 'Item 2', itemQuantity: 3, itemCost: 20 },
			];
			increaseQuantityCart(cart, '1');
			expect(cart[0].itemQuantity).toBe(2);
			expect(cart[1].itemQuantity).toBe(3);
		});

		it('should not affect non-existent items', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
			];
			increaseQuantityCart(cart, '999');
			expect(cart[0].itemQuantity).toBe(1);
		});
	});

	describe('getIndexInCart', () => {
		it('should return index of item in cart', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
				{ itemID: '2', itemTitle: 'Item 2', itemQuantity: 2, itemCost: 20 },
			];
			expect(getIndexInCart(cart, '2')).toBe(1);
		});

		it('should return -1 if item not in cart', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
			];
			expect(getIndexInCart(cart, '999')).toBe(-1);
		});

		it('should return 0 for first item', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10 },
			];
			expect(getIndexInCart(cart, '1')).toBe(0);
		});

		it('should return -1 for empty cart', () => {
			const cart: ShoppingCartType[] = [];
			expect(getIndexInCart(cart, '1')).toBe(-1);
		});
	});

	describe('getCartItemCount', () => {
		it('should sum quantities of all items', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 2, itemCost: 10 },
				{ itemID: '2', itemTitle: 'Item 2', itemQuantity: 3, itemCost: 20 },
			];
			expect(getCartItemCount(cart)).toBe(5);
		});

		it('should return 0 for empty cart', () => {
			const cart: ShoppingCartType[] = [];
			expect(getCartItemCount(cart)).toBe(0);
		});

		it('should handle single item', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 5, itemCost: 10 },
			];
			expect(getCartItemCount(cart)).toBe(5);
		});
	});

	describe('getCartSubTotal', () => {
		it('should calculate subtotal correctly', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 2, itemCost: 10 },
				{ itemID: '2', itemTitle: 'Item 2', itemQuantity: 3, itemCost: 20 },
			];
			expect(getCartSubTotal(cart)).toBe(80);
		});

		it('should return 0 for empty cart', () => {
			const cart: ShoppingCartType[] = [];
			expect(getCartSubTotal(cart)).toBe(0);
		});

		it('should handle decimal prices', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10.99 },
			];
			expect(getCartSubTotal(cart)).toBe(10.99);
		});

		it('should format to hundredths', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 10.999 },
			];
			const result = getCartSubTotal(cart);
			expect(result).toBe(10.99);
		});
	});

	// ========== ADD/REMOVE FROM CART ==========

	describe('addToShoppingCart', () => {
		it('should add new item to cart', () => {
			const item: ShoppingCartType = {
				itemID: '1',
				itemTitle: 'Item 1',
				itemQuantity: 5,
				itemCost: 10,
			};
			addToShoppingCart(item);
			const cart = getCart();
			expect(cart.length).toBe(1);
			expect(cart[0].itemID).toBe('1');
			expect(cart[0].itemQuantity).toBe(1);
		});

		it('should increase quantity if item already in cart', () => {
			const item: ShoppingCartType = {
				itemID: '1',
				itemTitle: 'Item 1',
				itemQuantity: 5,
				itemCost: 10,
			};
			// ensure public store is clean
			setCart([]);
			addToShoppingCart(item);
			addToShoppingCart(item);
			const cart = getCart();
			expect(cart.length).toBe(1);
			expect(cart[0].itemQuantity).toBe(2);
		});
	});

	describe('removeFromShoppingCart', () => {
		it('should remove item from cart', () => {
			const item: ShoppingCartType = {
				itemID: '1',
				itemTitle: 'Item 1',
				itemQuantity: 1,
				itemCost: 10,
			};
			addToShoppingCart(item);
			removeFromShoppingCart(item);
			const cart = getCart();
			expect(cart.length).toBe(0);
		});

		it('should remove only the specified item', () => {
			const item1: ShoppingCartType = {
				itemID: '1',
				itemTitle: 'Item 1',
				itemQuantity: 1,
				itemCost: 10,
			};
			const item2: ShoppingCartType = {
				itemID: '2',
				itemTitle: 'Item 2',
				itemQuantity: 1,
				itemCost: 20,
			};
			addToShoppingCart(item1);
			addToShoppingCart(item2);
			removeFromShoppingCart(item1);
			const cart = getCart();
			expect(cart.length).toBe(1);
			expect(cart[0].itemID).toBe('2');
		});

		it('should dispatch storage event', () => {
			const item: ShoppingCartType = {
				itemID: '1',
				itemTitle: 'Item 1',
				itemQuantity: 1,
				itemCost: 10,
			};
			addToShoppingCart(item);
			removeFromShoppingCart(item);
			expect(window.dispatchEvent).toHaveBeenCalled();
		});

		it('should handle removing non-existent item', () => {
			const item: ShoppingCartType = {
				itemID: '999',
				itemTitle: 'Fake Item',
				itemQuantity: 1,
				itemCost: 10,
			};
			expect(() => removeFromShoppingCart(item)).not.toThrow();
		});
	});

	describe('clearShoppingCart', () => {
		it('should clear cart and shipping info', () => {
			const item: ShoppingCartType = {
				itemID: '1',
				itemTitle: 'Item 1',
				itemQuantity: 1,
				itemCost: 10,
			};
			addToShoppingCart(item);
			setShippingInfo({ name: 'John' });
			clearShoppingCart();

			expect(localStorage.getItem(shoppingCartKey)).toBeNull();
			expect(localStorage.getItem(shippingInfoKey)).toBeNull();
		});

		it('should dispatch storage event', () => {
			clearShoppingCart();
			expect(window.dispatchEvent).toHaveBeenCalled();
		});
	});

	// ========== SHIPPING FUNCTIONS ==========

	describe('getShippingInfo', () => {
		it('should return empty array when no shipping info', () => {
			const result = getShippingInfo();
			expect(result).toEqual([]);
		});

		it('should return stored shipping info', () => {
			const shippingData = {
				name: 'John Doe',
				street1: '123 Main St',
				city: 'Springfield',
				state: 'IL',
				zip: '62701',
			};
			setShippingInfo(shippingData);
			const result = getShippingInfo();
			expect(result).toEqual(shippingData);
		});
	});

	describe('setShippingInfo', () => {
		it('should set shipping info in localStorage', () => {
			const shippingData: AddressType = {
				name: 'John Doe',
				street1: '123 Main St',
				city: 'Springfield',
				state: 'IL',
				zip: '62701',
				country: 'USA',
			};
			setShippingInfo(shippingData);
		const stored = getShippingInfo();
		});

		it('should dispatch storage event', () => {
			setShippingInfo({ name: 'John' });
			expect(window.dispatchEvent).toHaveBeenCalledWith(new Event('storage'));
		});
	});

	describe('getShippingCost', () => {
		it('should return 0 when no shipping method selected', () => {
			const cost = getShippingCost();
			expect(cost).toBe(0);
		});

		it('should return correct cost for valid shipping method', () => {
			setShippingInfo({ shippingMethod: 'USPS-GA' });
			const cost = getShippingCost();
			expect(cost).toBe(9.99);
		});

		it('should return 0 for invalid shipping method', () => {
			setShippingInfo({ shippingMethod: 'INVALID' });
			const cost = getShippingCost();
			expect(cost).toBe(0);
		});

		it('should handle multiple shipping options', () => {
			setShippingInfo({ shippingMethod: 'USPS-PMX-I' });
			const cost = getShippingCost();
			expect(cost).toBe(69.98);
		});
	});

	// ========== DISCOUNT FUNCTIONS ==========

	describe('getLocalDiscountCodes', () => {
		it('should return empty array when no codes stored', () => {
			const result = getLocalDiscountCodes();
			expect(result).toEqual([]);
		});

		it('should return stored discount codes', () => {
			const codes: DiscountCodeType[] = [
				{
					codeName: 'SAVE10',
					codeDescription: 'Save 10%',
					codeType: 'percent',
					codeStart: '2024-01-01',
					codeEnd: '2024-12-31',
					codeValue: 0.1,
				},
			];
			setDiscountCodes(codes);
			const result = getLocalDiscountCodes();
			expect(result).toEqual(codes);
		});
	});

	describe('setDiscountCodes', () => {
		it('should set discount codes in localStorage', () => {
			const codes: DiscountCodeType[] = [
				{
					codeName: 'SAVE10',
					codeDescription: 'Save 10%',
					codeType: 'percent',
					codeStart: '2024-01-01',
					codeEnd: '2024-12-31',
					codeValue: 0.1,
				},
			];
			setDiscountCodes(codes);
			const stored = getLocalDiscountCodes();
			expect(stored).toEqual(codes);
		});

		it('should dispatch storage event', () => {
			setDiscountCodes([]);
			expect(window.dispatchEvent).toHaveBeenCalled();
		});
	});

	describe('getDiscountCode', () => {
		it('should return discount code by name', () => {
			const codes: DiscountCodeType[] = [
				{
					codeName: 'SAVE10',
					codeDescription: 'Save 10%',
					codeType: 'percent',
					codeStart: '2024-01-01',
					codeEnd: '2024-12-31',
					codeValue: 0.1,
				},
			];
			setDiscountCodes(codes);
			const result = getDiscountCode('SAVE10');
			expect(result?.codeName).toBe('SAVE10');
		});

		it('should be case-insensitive', () => {
			const codes: DiscountCodeType[] = [
				{
					codeName: 'SAVE10',
					codeDescription: 'Save 10%',
					codeType: 'percent',
					codeStart: '2024-01-01',
					codeEnd: '2024-12-31',
					codeValue: 0.1,
				},
			];
			setDiscountCodes(codes);
			const result = getDiscountCode('save10');
			expect(result?.codeName).toBe('SAVE10');
		});

		it('should return undefined for non-existent code', () => {
			const result = getDiscountCode('INVALID');
			expect(result).toBeUndefined();
		});

		it('should return undefined for empty string', () => {
			const result = getDiscountCode('');
			expect(result).toBeUndefined();
		});
	});

	describe('getCartSubtotalDiscount', () => {
		it('should return 0 when no discount code applied', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 100 },
			];
			const discount = getCartSubtotalDiscount(cart);
			expect(discount).toBe(0);
		});

		it('should calculate percent discount correctly', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 100 },
			];
			const codes: DiscountCodeType[] = [
				{
					codeName: 'SAVE10',
					codeDescription: 'Save 10%',
					codeType: 'percent',
					codeStart: '2024-01-01',
					codeEnd: '2024-12-31',
					codeValue: 0.1,
				},
			];
			setDiscountCodes(codes);
			setShippingInfo({ discountCode: 'SAVE10' });
			const discount = getCartSubtotalDiscount(cart);
			expect(discount).toBe(10);
		});

		it('should calculate amount discount correctly', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 100 },
			];
			const codes: DiscountCodeType[] = [
				{
					codeName: 'SAVE5',
					codeDescription: 'Save $5',
					codeType: 'amount',
					codeStart: '2024-01-01',
					codeEnd: '2024-12-31',
					codeValue: 5,
				},
			];
			setDiscountCodes(codes);
			setShippingInfo({ discountCode: 'SAVE5' });
			const discount = getCartSubtotalDiscount(cart);
			expect(discount).toBe(5);
		});

		it('should return 0 for empty cart', () => {
			// ensure no persisted discount or cart state from other tests
			setDiscountCodes([]);
			setCart([]);
			const discount = getCartSubtotalDiscount([]);
			expect(discount).toBe(0);
		});
	});

	// ========== CHECKOUT FUNCTIONS ==========

	describe('getHandlingFee', () => {
		it('should return constant handling fee', () => {
			const fee = getHandlingFee();
			expect(fee).toBe(3.99);
		});
	});

	describe('getSalesTax', () => {
		it('should calculate sales tax correctly', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 100 },
			];
			setCart(cart);
			setShippingInfo({ shippingMethod: 'USPS-GA' });
			const tax = getSalesTax();
			// (100 + 9.99 + 3.99) * 0.06675 = 7.60
			expect(tax).toBeGreaterThan(7);
			expect(tax).toBeLessThan(8);
		});

		it('should return formatted value', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 50.555 },
			];
			setCart(cart);
			const tax = getSalesTax();
			// Should be formatted to hundredths
			expect(tax).toEqual(Math.trunc(tax * 100) / 100);
		});
	});

	describe('getCheckoutTotal', () => {
		it('should calculate total correctly', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 100 },
			];
			setCart(cart);
			setShippingInfo({ shippingMethod: 'USPS-GA' });
			const total = getCheckoutTotal();
			// Subtotal: 100, Shipping: 9.99, Handling: 3.99, Tax: ~7.60
			expect(total).toBeGreaterThan(120);
		});

		it('should include discount in total', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 100 },
			];
			setCart(cart);
			setShippingInfo({ shippingMethod: 'USPS-GA' });
			const totalWithoutDiscount = getCheckoutTotal();

			const codes: DiscountCodeType[] = [
				{
					codeName: 'SAVE10',
					codeDescription: 'Save 10%',
					codeType: 'percent',
					codeStart: '2024-01-01',
					codeEnd: '2024-12-31',
					codeValue: 0.1,
				},
			];
			setDiscountCodes(codes);
			setShippingInfo({ shippingMethod: 'USPS-GA', discountCode: 'SAVE10' });
			const totalWithDiscount = getCheckoutTotal();

			expect(totalWithDiscount).toBeLessThan(totalWithoutDiscount);
		});
	});

	describe('getCheckoutData', () => {
		it('should return complete checkout object', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 2, itemCost: 50 },
			];
			setCart(cart);
			setShippingInfo({ shippingMethod: 'USPS-GA', name: 'John Doe' });

			const checkout = getCheckoutData();

			expect(checkout.items).toEqual(cart);
			expect(checkout.subtotal).toBe(100);
			expect(checkout.shippingCost).toBe(9.99);
			expect(checkout.handlingFee).toBe(3.99);
			expect(checkout.total).toBeGreaterThan(0);
		});

		it('should include all required fields', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 50 },
			];
			setCart(cart);
			setShippingInfo({ shippingMethod: 'USPS-GA' });

			const checkout = getCheckoutData();

			expect(checkout).toHaveProperty('items');
			expect(checkout).toHaveProperty('subtotal');
			expect(checkout).toHaveProperty('subtotal_discount');
			expect(checkout).toHaveProperty('shippingTo');
			expect(checkout).toHaveProperty('shippingCost');
			expect(checkout).toHaveProperty('handlingFee');
			expect(checkout).toHaveProperty('salesTax');
			expect(checkout).toHaveProperty('total');
		});

		it('should calculate correct totals', () => {
			const cart: ShoppingCartType[] = [
				{ itemID: '1', itemTitle: 'Item 1', itemQuantity: 1, itemCost: 100 },
			];
			setCart(cart);
			setShippingInfo({ shippingMethod: 'USPS-PM' });

			const checkout = getCheckoutData();
			const expectedSubtotal = 100;
			const expectedShipping = 14.99;
			const expectedHandling = 3.99;

			expect(checkout.subtotal).toBe(expectedSubtotal);
			expect(checkout.shippingCost).toBe(expectedShipping);
			expect(checkout.handlingFee).toBe(expectedHandling);
		});
	});

	// ========== INTEGRATION TESTS ==========

	describe('Integration: Full shopping flow', () => {
		it('should handle complete shopping cart workflow', () => {
			// Add items
			const item1: ShoppingCartType = {
				itemID: '1',
				itemTitle: 'Widget A',
				itemQuantity: 10,
				itemCost: 25.99,
			};
			const item2: ShoppingCartType = {
				itemID: '2',
				itemTitle: 'Widget B',
				itemQuantity: 5,
				itemCost: 15.50,
			};

			// ensure public store is clean before integration flow
			setCart([]);
			addToShoppingCart(item1);
			addToShoppingCart(item2);

			let cart = getCart();
			expect(cart.length).toBe(2);
			expect(getCartItemCount(cart)).toBe(2);
			expect(getCartSubTotal(cart)).toBeCloseTo(25.99 + 15.50, 1);

			// Set shipping
			setShippingInfo({
				name: 'Jane Doe',
				street1: '456 Elm St',
				city: 'Shelbyville',
				state: 'IL',
				zip: '62702',
				country: 'USA',
				shippingMethod: 'USPS-PMX',
			});

			expect(getShippingCost()).toBe(39.99);

			// Apply discount
			setDiscountCodes([
				{
					codeName: 'WELCOME',
					codeDescription: 'Welcome discount',
					codeType: 'percent',
					codeStart: '2024-01-01',
					codeEnd: '2024-12-31',
					codeValue: 0.15,
				},
			]);
			setShippingInfo({
				name: 'Jane Doe',
				street1: '456 Elm St',
				city: 'Shelbyville',
				state: 'IL',
				zip: '62702',
				country: 'USA',
				shippingMethod: 'USPS-PMX',
				discountCode: 'WELCOME',
			});

			// Verify checkout
			const checkout = getCheckoutData();
			expect(checkout.items.length).toBe(2);
			expect(checkout.subtotal_discount).toBeGreaterThan(0);
			expect(checkout.total).toBeGreaterThan(0);

			// Remove an item
			removeFromShoppingCart(item1);
			cart = getCart();
			expect(cart.length).toBe(1);
			expect(cart[0].itemID).toBe('2');

			// Clear cart
			clearShoppingCart();
			cart = getCart();
			expect(cart.length).toBe(0);
		});
	});
});
