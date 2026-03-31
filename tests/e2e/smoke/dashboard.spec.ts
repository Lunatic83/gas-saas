import { test, expect } from '@playwright/test';

test.describe('smoke — dashboard', () => {
  test.skip('dashboard loads without console errors', async ({ page }) => {
    // TODO(E11): Implement real dashboard test
    // Expected: /app/dashboard renders with user-specific content
    await page.goto('/dashboard');
    await expect(page).toHaveTitle(/.*/);
  });

  test.skip('account settings page loads', async ({ page }) => {
    // TODO(E11): Implement account settings test
    await page.goto('/account');
    await expect(page).toHaveTitle(/.*/);
  });
});
