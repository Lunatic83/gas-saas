import { test, expect } from '@playwright/test';

/**
 * Auth smoke tests — validates login/signup flows exist and render
 *
 * TODO(E10): Replace stubs with real auth flow tests once Auth UI is built
 * TODO(E6):  Remove test.skip() once Better-Auth backend is integrated
 */

test.describe('smoke', () => {
  test.skip('login page renders without errors', async ({ page }) => {
    // TODO(E10): Replace with real login page URL once app routing is set up
    // await page.goto('/auth/login')
    // await expect(page.getByRole('heading', { name: /sign in/i })).toBeVisible()
  });

  test.skip('signup page renders without errors', async ({ page }) => {
    // TODO(E10): Replace with real signup page URL
    // await page.goto('/auth/signup')
    // await expect(page.getByRole('heading', { name: /sign up/i })).toBeVisible()
  });

  test.skip('magic link login flow', async ({ page }) => {
    // TODO(E10): Test magic link email field + submit
    // TODO(E6):  Requires email service (Mailhog in e2e)
  });

  test.skip('oauth login with GitHub button exists', async ({ page }) => {
    // TODO(E10): Verify GitHub OAuth button is present on login page
    // await page.goto('/auth/login')
    // await expect(page.getByRole('button', { name: /github/i })).toBeVisible()
  });
});
