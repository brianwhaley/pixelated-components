import React from 'react';
import { screen, fireEvent, waitFor } from '@testing-library/react';
import { render } from '../test/test-utils';
import { act } from 'react';
import { describe, it, beforeEach, afterEach, expect, vi } from 'vitest';

import { ShoppingCart, CartButton, AddToCartButton, CheckoutItems } from '../components/shoppingcart/shoppingcart.components';
import {
  shoppingCartKey,
  setCart,
  getCart,
  addToShoppingCart,
  setShippingInfo,
  clearShoppingCart,
  getLocalDiscountCodes,
  type ShoppingCartType,
} from '../components/shoppingcart/shoppingcart.functions';

// Use an on-disk fixture where possible (shipping / discount fixtures live with the component)
import shippingToData from '../components/shoppingcart/shipping.to.json';

describe('ShoppingCart — integration (component + localStorage)', () => {
  beforeEach(() => {
    // clear both legacy storage and the CacheManager-backed entries
    clearShoppingCart();
    localStorage.clear();
    // keep a spy so we can assert it was called, but do NOT replace implementation —
    // the component relies on the real dispatchEvent to trigger its storage handler
    vi.spyOn(window, 'dispatchEvent');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    clearShoppingCart();
    localStorage.clear();
  });

  it('mounts and reads existing cart from localStorage (shows item and remove button)', async () => {
    const item: ShoppingCartType = {
      itemID: 'int-1',
      itemTitle: 'Integration Item',
      itemQuantity: 2,
      itemCost: 9.99,
    };
    setCart([item]);

    render(<ShoppingCart />);

    // ensure the component rendered the item title
    expect(await screen.findByText(/Integration Item/)).toBeInTheDocument();

    // remove button should be present and remove the item from storage + UI
    const removeBtn = screen.getByText('Remove Item From Cart');
    fireEvent.click(removeBtn);

    await waitFor(() => {
      expect(getCart()).toEqual([]);
      expect(screen.queryByText(/Integration Item/)).not.toBeInTheDocument();
    });

    // ensure storage event was dispatched (observable contract)
    expect(window.dispatchEvent).toHaveBeenCalled();
  });

  it('shows ShippingInfo when cart exists but no shipping info', async () => {
    const item: ShoppingCartType = { itemID: 's-1', itemTitle: 'Ship Item', itemQuantity: 1, itemCost: 5 };
    setCart([item]);

    render(<ShoppingCart />);

    // should show the shipping form section
    expect(await screen.findByText(/Shipping To :/)).toBeInTheDocument();
    // cart item should still be visible
    expect(screen.getByText(/Ship Item/)).toBeInTheDocument();
  });



  it('CheckoutItems renders table rows and formats values', () => {
    // pass `items` as a renderable array (strings/React nodes) — Table cannot render raw objects directly
    const checkoutProps = {
      items: [{ itemID: 'i1', itemTitle: 'X', itemQuantity: 1, itemCost: 100 }],
      shippingTo: { name: 'A', street1: 'S', city: 'C', state: 'NJ', zip: '07001' },
      subtotal_discount: 10,
      subtotal: 100,
      shippingCost: 9.99,
      handlingFee: 3.99,
      salesTax: 7.6,
      total: 110.58,
    } as any;

    const { container } = render(<CheckoutItems {...checkoutProps} />);
    expect(container.querySelector('#pixCheckout')).toBeInTheDocument();
    expect(screen.getByText(/TOTAL :/)).toBeInTheDocument();
    expect(screen.getByText(/\$110\.58/)).toBeInTheDocument();
  });

  it('CartButton updates its count when storage changes (cross-instance storage event) — wrapped in act', async () => {
    const item: ShoppingCartType = {
      itemID: 'btn-1',
      itemTitle: 'Button Item',
      itemQuantity: 1,
      itemCost: 1,
    };

    render(<CartButton href="/cart" />);

    // initially zero
    expect(screen.getByText(/\(0\)/)).toBeInTheDocument();

    // simulate another tab adding an item (wrap in act to avoid warnings)
    await act(async () => {
      setCart([item]);
      window.dispatchEvent(new Event('storage'));
    });

    await waitFor(() => expect(screen.getByText(/\(1\)/)).toBeInTheDocument());
  });

  it('AddToCartButton calls provided handler and modal opens (DOM-level interaction)', async () => {
    const item: ShoppingCartType = {
      itemID: 'add-1',
      itemTitle: 'Add Item',
      itemQuantity: 5,
      itemCost: 4.5,
    };
    const handler = vi.fn((i) => addToShoppingCart(i));

    render(<AddToCartButton handler={handler} item={item} itemID={item.itemID} />);

    const addBtn = screen.getByText('Add to Shopping Cart');
    fireEvent.click(addBtn);

    expect(handler).toHaveBeenCalledWith(item);

    // modal content should be rendered (confirmation message uses itemID)
    expect(await screen.findByText(new RegExp(`Item ${item.itemID} has been added`))).toBeInTheDocument();

    // and storage should reflect the new cart
    expect(getCart().length).toBeGreaterThanOrEqual(1);
  });
});
