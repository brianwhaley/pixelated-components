import { readFileSync } from 'fs';
import { resolve } from 'path';
import { describe, it, expect } from 'vitest';

describe('Storybook static docgen', () => {
  it('includes ShoppingCart.payPalClientID description in built docs', () => {
    const filePath = resolve(process.cwd(), 'storybook-static', 'components', 'shoppingcart', 'shoppingcart.components.tsx');
    const contents = readFileSync(filePath, 'utf8');
    expect(contents).toContain('Optional PayPal client ID to enable the PayPal checkout button.');
  });
});
