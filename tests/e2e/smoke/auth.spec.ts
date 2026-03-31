import { test, expect } from '@playwright/test';

test.describe('smoke — auth', () => {
  test.skip('login page loads without console errors', async ({ page }) => {
    // TODO(E4+): Implement real login test
    // Expected: /app/login or /login renders without errors
    await page.goto('/login');
    await expect(page).toHaveTitle(/.*/);
  });

  test.skip('signup page loads without console errors', async ({ page }) => {
    // TODO(E4+): Implement real signup test
    // Expected: /app/signup or /signup renders without errors
    await page.goto('/signup');
    await expect(page).toHaveTitle(/.*/);
  });

  test.skip('magic link request renders', async ({ page }) => {
    // TODO(E10): Implement magic link test
    await page.goto('/login/magic');
    await expect(page.locator('input[name="email"]')).toBeAttached();
  });
});
