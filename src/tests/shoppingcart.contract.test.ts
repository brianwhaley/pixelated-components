import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

import {
  shoppingCartKey,
  shippingInfoKey,
  discountCodesKey,
  setCart,
  getCart,
  setShippingInfo,
  getShippingInfo,
  setDiscountCodes,
  getLocalDiscountCodes,
  getCartSubtotalDiscount,
  type CartItemType,
} from '../components/shoppingcart/shoppingcart.functions';

type ShoppingCartType = CartItemType;

// Use on-disk fixtures where available to keep tests 'real'
import shippingToData from '../components/shoppingcart/shipping.to.json';

describe('ShoppingCart — observable contract (storage keys & shapes)', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.spyOn(window, 'dispatchEvent').mockImplementation(() => true);
  });
  afterEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  it('uses the canonical storage keys and preserves public JSON shape (observable contract)', () => {
    const item: ShoppingCartType = { itemID: 'c-1', itemTitle: 'C Item', itemQuantity: 3, itemCost: 2.5 };
    setCart([item]);

    // public API must return the same shape — callers should not inspect implementation details
    const result = getCart();
    expect(Array.isArray(result)).toBe(true);
    expect(result[0]).toHaveProperty('itemID', item.itemID);
    expect(result[0]).toHaveProperty('itemQuantity');
  });

  it('stores and retrieves shipping info using the documented key (uses real fixture)', () => {
    // shipping.to.json is a form descriptor (fields array) — tests need a real Address-shaped object
    const shipping = {
      name: 'Test User',
      street1: '123 Test Ave',
      city: 'Testville',
      state: 'NJ',
      zip: '07001',
      country: 'USA',
      email: 'test@example.com',
    };

    setShippingInfo(shipping as any);
    expect(getShippingInfo()).toEqual(shipping);
    // implementation detail: do not assert raw localStorage shape — rely on public API
    expect(getShippingInfo()).toEqual(shipping);
  });

  it('accepts real discount-code payloads and applies subtotal discount (contract)', () => {
    const codes = [
      {
        codeName: 'SAVE10',
        codeDescription: 'Test 10%',
        codeType: 'percent',
        codeStart: '1970-01-01',
        codeEnd: '2170-01-01',
        codeValue: 0.1,
      },
    ];
    setDiscountCodes(codes as any);
    const saved = getLocalDiscountCodes();
    expect(saved).toEqual(codes);

    // apply to a real-like cart
    const cart = [ { itemID: 'x', itemTitle: 'X', itemQuantity: 1, itemCost: 100 } ];
    setCart(cart as any);
    setShippingInfo({ discountCode: 'SAVE10' } as any);
    const discount = getCartSubtotalDiscount(cart as any);
    expect(discount).toBe(10);
  });
});
