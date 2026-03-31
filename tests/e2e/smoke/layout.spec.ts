import { test, expect } from '@playwright/test';

test.describe('smoke — layout', () => {
  test.skip('home page loads without console errors', async ({ page }) => {
    // TODO(E4+): Implement home page test
    // Expected: / renders the landing/marketing page
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
  });

  test.skip('app shell renders navigation', async ({ page }) => {
    // TODO(E9): Implement app shell test
    // Expected: App layout with header nav is visible
    await page.goto('/app');
    await expect(page.locator('nav')).toBeAttached();
  });

  test.skip('responsive layout on mobile', async ({ page }) => {
    // TODO(E9): Test responsive design
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page).toHaveTitle(/.*/);
  });
});
