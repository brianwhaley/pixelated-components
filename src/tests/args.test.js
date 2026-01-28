import { test, expect } from '@storybook/test-runner';

test('Skeleton docs show prop names', async ({ page }) => {
  await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default&viewMode=docs');
  await expect(page.locator('text=lines')).toBeVisible();
  await expect(page.locator('text=variant')).toBeVisible();
});

test('ShoppingCart docs show payPalClientID prop', async ({ page }) => {
  await page.goto('http://localhost:6006/iframe.html?id=shoppingcart--shopping-cart-page&viewMode=docs');
  await expect(page.locator('text=payPalClientID')).toBeVisible();
});
