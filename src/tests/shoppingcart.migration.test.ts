import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';
import { CacheManager } from '@/components/general/cache-manager';
import {
  setCart,
  getCart,
  addToShoppingCart,
  removeFromShoppingCart,
  clearShoppingCart,
  setShippingInfo,
  getShippingInfo,
  setDiscountCodes,
  getLocalDiscountCodes,
  shoppingCartKey,
  shippingInfoKey,
  discountCodesKey,
  type ShoppingCartType,
} from '@/components/shoppingcart/shoppingcart.functions';

describe('ShoppingCart — migration: internal use of CacheManager (tests-first)', () => {
  let setSpy: any;
  let getSpy: any;
  let removeSpy: any;

  beforeEach(() => {
    // spies on the prototype so we catch internal usage
    setSpy = vi.spyOn(CacheManager.prototype, 'set');
    getSpy = vi.spyOn(CacheManager.prototype, 'get');
    removeSpy = vi.spyOn(CacheManager.prototype, 'remove');
    localStorage.clear();
    vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    localStorage.clear();
  });

  it('setCart/getCart delegate to CacheManager', () => {
    const cartItem: ShoppingCartType = { itemID: 'm-1', itemTitle: 'M', itemQuantity: 1, itemCost: 1 };
    setCart([cartItem]);
    expect(setSpy).toHaveBeenCalled();

    const cart = getCart();
    expect(getSpy).toHaveBeenCalled();
    expect(cart[0].itemID).toBe('m-1');
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('add/remove/clear use CacheManager and preserve observable contract', () => {
    const item: ShoppingCartType = { itemID: 'm-2', itemTitle: 'M2', itemQuantity: 1, itemCost: 2 };
    addToShoppingCart(item);
    expect(setSpy).toHaveBeenCalled();
    expect(getCart().length).toBeGreaterThanOrEqual(1);

    removeFromShoppingCart(item);
    expect(setSpy).toHaveBeenCalled();

    clearShoppingCart();
    expect(removeSpy).toHaveBeenCalled();
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('shipping info & discount codes use CacheManager', async () => {
    setShippingInfo({ name: 'M' } as any);
    expect(setSpy).toHaveBeenCalledWith(shippingInfoKey, { name: 'M' });
    expect(getShippingInfo()).toEqual({ name: 'M' });

    setDiscountCodes([{ codeName: 'X', codeStart: '1970-01-01', codeEnd: '2170-01-01', codeType: 'amount', codeValue: 1 } as any]);
    expect(setSpy).toHaveBeenCalledWith(discountCodesKey, expect.any(Array));
    expect(getLocalDiscountCodes().length).toBeGreaterThanOrEqual(1);
  });
});
