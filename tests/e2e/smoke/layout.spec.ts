import { test, expect } from '@playwright/test';

/**
 * Layout smoke tests — validates app shell, navigation, and global elements
 *
 * TODO(E9):  Replace stubs with real layout tests once Design System is built
 */

test.describe('smoke', () => {
  test.skip('app shell renders without errors', async ({ page }) => {
    // TODO(E9): App shell (header, sidebar, footer) rendered on all pages
    // await page.goto('/')
    // await expect(page.getByRole('banner')).toBeVisible()
  });

  test.skip('top navigation bar is visible', async ({ page }) => {
    // TODO(E9): Header with app logo, user menu
    // await page.goto('/')
    // await expect(page.getByRole('navigation')).toBeVisible()
  });

  test.skip('user menu opens and shows logout option', async ({ page }) => {
    // TODO(E9/E10): User avatar → dropdown with settings + logout
    // TODO(E6): Requires authenticated session
    // await page.goto('/dashboard')
    // await page.getByRole('button', { name: /user menu/i }).click()
    // await expect(page.getByRole('menuitem', { name: /logout/i })).toBeVisible()
  });

  test.skip('404 page renders correctly', async ({ page }) => {
    // TODO(E9): Custom 404 page
    // await page.goto('/this-does-not-exist')
    // await expect(page.getByText(/404/i)).toBeVisible()
  });
});
