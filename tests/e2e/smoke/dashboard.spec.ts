import { test, expect } from '@playwright/test';

/**
 * Dashboard smoke tests — validates dashboard shell and key sections
 *
 * TODO(E11): Replace stubs with real dashboard tests once Dashboard UI is built
 */

test.describe('smoke', () => {
  test.skip('dashboard page loads for authenticated user', async ({ page }) => {
    // TODO(E11): Replace with real dashboard URL
    // TODO(E6):  Requires authenticated session (cookie or localStorage)
    // await page.goto('/dashboard')
    // await expect(page.getByRole('heading', { name: /dashboard/i })).toBeVisible()
  });

  test.skip('account settings page is accessible', async ({ page }) => {
    // TODO(E11): Account settings sub-page
    // await page.goto('/dashboard/account')
    // await expect(page.getByRole('heading', { name: /account settings/i })).toBeVisible()
  });

  test.skip('subscription section shows current plan', async ({ page }) => {
    // TODO(E13): Stripe subscription UI
    // await page.goto('/dashboard/account')
    // await expect(page.getByText(/current plan/i)).toBeVisible()
  });
});
