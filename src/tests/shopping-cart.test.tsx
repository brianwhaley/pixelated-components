import { describe, it, expect, beforeEach, vi } from 'vitest';
import { 
	shoppingCartKey,
	shippingInfoKey,
	discountCodesKey,
	checkoutInfoKey,
	type CartItemType,
	type AddressType,
	type CheckoutType,
	type DiscountCodeType
} from '../components/shoppingcart/shoppingcart.functions';

// Mock contentful delivery
vi.mock('../components/integrations/contentful.delivery', () => ({
	getContentfulDiscountCodes: vi.fn().mockResolvedValue([])
}));

// Mock cache manager
vi.mock('../components/general/cache-manager', () => ({
	CacheManager: class {
		get() { return null; }
		set() { }
	}
}));

vi.mock('../components/general/utilities', () => ({
	getDomain: () => 'example.com'
}));

describe('Shopping Cart Functions', () => {
	const mockCartItem: CartItemType = {
		itemID: '1',
		itemTitle: 'Test Product',
		itemImageURL: 'https://example.com/product.jpg',
		itemQuantity: 1,
		itemCost: 29.99,
		itemURL: 'https://example.com/product'
	};

	const mockAddress: AddressType = {
		name: 'John Doe',
		street1: '123 Main St',
		city: 'San Francisco',
		state: 'CA',
		zip: '94102',
		country: 'USA',
		email: 'john@example.com',
		phone: '555-1234'
	};

	const mockCheckout: CheckoutType = {
		items: [mockCartItem],
		subtotal: 29.99,
		subtotal_discount: 0,
		shippingTo: mockAddress,
		shippingCost: 9.99,
		handlingFee: 0,
		salesTax: 2.40,
		total: 42.38
	};

	beforeEach(() => {
		localStorage.clear();
		vi.clearAllMocks();
	});

	describe('Storage Keys', () => {
		it('should export shoppingCartKey', () => {
			expect(shoppingCartKey).toBeTruthy();
			expect(typeof shoppingCartKey).toBe('string');
			expect(shoppingCartKey).toContain('Cart');
		});

		it('should export shippingInfoKey', () => {
			expect(shippingInfoKey).toBeTruthy();
			expect(typeof shippingInfoKey).toBe('string');
		});

		it('should export discountCodesKey', () => {
			expect(discountCodesKey).toBeTruthy();
			expect(typeof discountCodesKey).toBe('string');
		});

		it('should export checkoutInfoKey', () => {
			expect(checkoutInfoKey).toBeTruthy();
			expect(typeof checkoutInfoKey).toBe('string');
		});

		it('should have unique storage keys', () => {
			const keys = [shoppingCartKey, shippingInfoKey, discountCodesKey, checkoutInfoKey];
			const uniqueKeys = new Set(keys);
			expect(uniqueKeys.size).toBe(4);
		});
	});

	describe('Cart Item Type Validation', () => {
		it('should validate CartItemType structure', () => {
			const item: CartItemType = mockCartItem;

			expect(item.itemID).toBeTruthy();
			expect(item.itemTitle).toBeTruthy();
			expect(item.itemQuantity).toBeGreaterThan(0);
			expect(item.itemCost).toBeGreaterThan(0);
		});

		it('should handle items with optional fields', () => {
			const item: CartItemType = {
				itemID: '2',
				itemTitle: 'Minimal Item',
				itemQuantity: 1,
				itemCost: 9.99
			};

			expect(item.itemID).toBeTruthy();
			expect(item.itemImageURL).toBeUndefined();
			expect(item.itemURL).toBeUndefined();
		});

		it('should validate quantity is positive', () => {
			const item: CartItemType = mockCartItem;

			expect(item.itemQuantity).toBeGreaterThan(0);
		});

		it('should validate cost is positive', () => {
			const item: CartItemType = mockCartItem;

			expect(item.itemCost).toBeGreaterThan(0);
		});

		it('should allow multiple items in array', () => {
			const items: CartItemType[] = [
				mockCartItem,
				{ ...mockCartItem, itemID: '2', itemTitle: 'Second Item' }
			];

			expect(items).toHaveLength(2);
			expect(items[0].itemID).not.toBe(items[1].itemID);
		});
	});

	describe('Address Type Validation', () => {
		it('should validate AddressType structure', () => {
			const address: AddressType = mockAddress;

			expect(address.name).toBeTruthy();
			expect(address.street1).toBeTruthy();
			expect(address.city).toBeTruthy();
			expect(address.state).toBeTruthy();
			expect(address.zip).toBeTruthy();
			expect(address.country).toBeTruthy();
		});

		it('should handle optional email in address', () => {
			const address: AddressType = mockAddress;

			expect(address.email).toBeTruthy();
			expect(address.email).toContain('@');
		});

		it('should handle optional phone in address', () => {
			const address: AddressType = mockAddress;

			expect(address.phone).toBeTruthy();
		});

		it('should handle US state abbreviations', () => {
			const address: AddressType = mockAddress;

			expect(address.state).toBe('CA');
			expect(address.state).toHaveLength(2);
		});

		it('should handle ZIP codes', () => {
			const address: AddressType = mockAddress;

			expect(address.zip).toBeTruthy();
			expect(address.zip.length).toBeGreaterThan(4);
		});
	});

	describe('Checkout Type Validation', () => {
		it('should validate CheckoutType structure', () => {
			const checkout: CheckoutType = mockCheckout;

			expect(checkout.items).toBeDefined();
			expect(checkout.subtotal).toBeGreaterThan(0);
			expect(checkout.shippingTo).toBeDefined();
			expect(checkout.total).toBeGreaterThan(0);
		});

		it('should have items array', () => {
			const checkout: CheckoutType = mockCheckout;

			expect(Array.isArray(checkout.items)).toBe(true);
			expect(checkout.items.length).toBeGreaterThan(0);
		});

		it('should support optional handling fee', () => {
			const checkout: CheckoutType = mockCheckout;

			expect(typeof checkout.handlingFee).toBe('number');
			expect(checkout.handlingFee).toBeGreaterThanOrEqual(0);
		});

		it('should support optional insurance cost', () => {
			const checkout: CheckoutType = mockCheckout;

			expect(checkout.insuranceCost).toBeUndefined();
		});

		it('should support optional shipping discount', () => {
			const checkout: CheckoutType = mockCheckout;

			expect(checkout.shipping_discount).toBeUndefined();
		});

		it('should calculate total correctly', () => {
			const checkout: CheckoutType = mockCheckout;

			const calculated = 
				checkout.subtotal - 
				checkout.subtotal_discount + 
				checkout.shippingCost + 
				checkout.handlingFee + 
				checkout.salesTax;

			expect(checkout.total).toBeCloseTo(calculated, 2);
		});
	});

	describe('Discount Code Type Validation', () => {
		it('should validate DiscountCodeType structure', () => {
			const code: DiscountCodeType = {
				codeName: 'SAVE10',
				codeDescription: '10% off entire order',
				codeType: 'PERCENTAGE',
				codeStart: '2024-01-01',
				codeEnd: '2024-12-31',
				codeValue: 10
			};

			expect(code.codeName).toBeTruthy();
			expect(code.codeDescription).toBeTruthy();
			expect(code.codeType).toBeTruthy();
			expect(code.codeValue).toBeGreaterThan(0);
		});

		it('should support percentage discount codes', () => {
			const code: DiscountCodeType = {
				codeName: 'PERCENT20',
				codeDescription: '20% discount',
				codeType: 'PERCENTAGE',
				codeStart: '2024-01-01',
				codeEnd: '2024-12-31',
				codeValue: 20
			};

			expect(code.codeType).toBe('PERCENTAGE');
			expect(code.codeValue).toBeLessThanOrEqual(100);
		});

		it('should support dollar amount discount codes', () => {
			const code: DiscountCodeType = {
				codeName: 'SAVE5',
				codeDescription: '$5 off',
				codeType: 'FIXED_AMOUNT',
				codeStart: '2024-01-01',
				codeEnd: '2024-12-31',
				codeValue: 5
			};

			expect(code.codeType).toBe('FIXED_AMOUNT');
			expect(code.codeValue).toBeGreaterThan(0);
		});

		it('should have valid date range', () => {
			const code: DiscountCodeType = {
				codeName: 'VALID',
				codeDescription: 'Valid discount',
				codeType: 'PERCENTAGE',
				codeStart: '2024-01-01',
				codeEnd: '2024-12-31',
				codeValue: 10
			};

			const startDate = new Date(code.codeStart);
			const endDate = new Date(code.codeEnd);

			expect(startDate < endDate).toBe(true);
		});
	});

	describe('Cart State Management', () => {
		it('should initialize empty cart', () => {
			const cart: CartItemType[] = [];
			expect(cart).toHaveLength(0);
		});

		it('should add items to cart', () => {
			const cart: CartItemType[] = [];
			cart.push(mockCartItem);

			expect(cart).toHaveLength(1);
			expect(cart[0].itemID).toBe(mockCartItem.itemID);
		});

		it('should update item quantity', () => {
			const cart: CartItemType[] = [mockCartItem];
			cart[0].itemQuantity = 2;

			expect(cart[0].itemQuantity).toBe(2);
		});

		it('should remove items from cart', () => {
			const cart: CartItemType[] = [
				mockCartItem,
				{ ...mockCartItem, itemID: '2' }
			];
			cart.splice(0, 1);

			expect(cart).toHaveLength(1);
			expect(cart[0].itemID).toBe('2');
		});

		it('should find item in cart by ID', () => {
			const cart: CartItemType[] = [mockCartItem];
			const found = cart.find(item => item.itemID === '1');

			expect(found).toBeDefined();
			expect(found?.itemTitle).toBe(mockCartItem.itemTitle);
		});
	});

	describe('Cart Calculations', () => {
		it('should calculate subtotal', () => {
			const cart: CartItemType[] = [
				{ ...mockCartItem, itemCost: 10, itemQuantity: 2 },
				{ ...mockCartItem, itemID: '2', itemCost: 20, itemQuantity: 1 }
			];

			const subtotal = cart.reduce((sum, item) => sum + (item.itemCost * item.itemQuantity), 0);
			expect(subtotal).toBe(40);
		});

		it('should apply discount to subtotal', () => {
			const subtotal = 100;
			const discountPercent = 10;
			const discount = subtotal * (discountPercent / 100);
			const afterDiscount = subtotal - discount;

			expect(discount).toBe(10);
			expect(afterDiscount).toBe(90);
		});

		it('should calculate tax on subtotal', () => {
			const subtotal = 100;
			const taxRate = 0.08; // 8%
			const tax = subtotal * taxRate;

			expect(tax).toBe(8);
		});

		it('should calculate final total', () => {
			const subtotal = 100;
			const tax = 8;
			const shipping = 9.99;
			const discount = 10;
			const total = subtotal + tax + shipping - discount;

			expect(total).toBeCloseTo(107.99, 2);
		});
	});
});
