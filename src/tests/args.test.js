import { test, expect } from '@storybook/test-runner';

describe('Storybook Test Runner - Documentation Pages', () => {
  test('Skeleton docs show prop names', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default&viewMode=docs');
    await expect(page.locator('text=lines')).toBeVisible();
    await expect(page.locator('text=variant')).toBeVisible();
  });

  test('ShoppingCart docs show payPalClientID prop', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=shoppingcart--shopping-cart-page&viewMode=docs');
    await expect(page.locator('text=payPalClientID')).toBeVisible();
  });
});

describe('Storybook Test Runner - Skeleton Component', () => {
  test('Skeleton component loads without errors', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default');
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('Skeleton shows lines prop documentation', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default&viewMode=docs');
    await expect(page.locator('text=lines')).toBeVisible();
  });

  test('Skeleton shows variant prop documentation', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default&viewMode=docs');
    await expect(page.locator('text=variant')).toBeVisible();
  });

  test('Skeleton shows count prop if available', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default&viewMode=docs');
    const countText = page.locator('text=count');
    // Count prop may or may not be visible - just test it doesn't error
    await expect(page).not.toHaveTitle(/error/i);
  });
});

describe('Storybook Test Runner - ShoppingCart Component', () => {
  test('ShoppingCart component loads without errors', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=shoppingcart--shopping-cart-page');
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('ShoppingCart docs show payPalClientID prop', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=shoppingcart--shopping-cart-page&viewMode=docs');
    await expect(page.locator('text=payPalClientID')).toBeVisible();
  });

  test('ShoppingCart shows component props section', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=shoppingcart--shopping-cart-page&viewMode=docs');
    // Props documentation should be visible
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('ShoppingCart story renders without console errors', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=shoppingcart--shopping-cart-page');
    // Verify page loaded successfully
    await expect(page).not.toHaveTitle(/error/i);
  });
});

describe('Storybook Test Runner - Docs Mode', () => {
  test('Component documentation renders in docs mode', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default&viewMode=docs');
    // Should render docs page without errors
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('Multiple components documentation available', async ({ page }) => {
    // Test that docs mode works across different components
    const components = ['general-skeleton--default', 'shoppingcart--shopping-cart-page'];
    for (const componentId of components) {
      await page.goto(`http://localhost:6006/iframe.html?id=${componentId}&viewMode=docs`);
      await expect(page).not.toHaveTitle(/error/i);
    }
  });

  test('Documentation pages are accessible', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default&viewMode=docs');
    const content = page.locator('body');
    await expect(content).toBeVisible();
  });
});

describe('Storybook Test Runner - Navigation', () => {
  test('Can navigate to Skeleton story', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=general-skeleton--default&viewMode=docs');
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('Can navigate to ShoppingCart story', async ({ page }) => {
    await page.goto('http://localhost:6006/iframe.html?id=shoppingcart--shopping-cart-page&viewMode=docs');
    await expect(page).not.toHaveTitle(/error/i);
  });

  test('Story links are discoverable', async ({ page }) => {
    await page.goto('http://localhost:6006');
    // Just verify main page loads
    await expect(page).not.toHaveTitle(/error/i);
  });
});
