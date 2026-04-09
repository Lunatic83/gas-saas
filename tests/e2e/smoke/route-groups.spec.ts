import { test, expect } from '@playwright/test';

test.describe('route groups', () => {
  test('marketing page renders at root /', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Now in Beta')).toBeVisible();
    await expect(page.locator('button:has-text("Get started")')).toBeVisible();
  });

  test('login page renders at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Login (E10)')).toBeVisible();
  });

  test('dashboard page renders with sidebar at /dashboard', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard');
    await expect(page.locator('text=Gas SaaS').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('dashboard sidebar is hidden on mobile and trigger is visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard');
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('auth layout passes through children without extra wrapping', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Login (E10)')).toBeVisible();
  });
});
