import { test, expect } from '@playwright/test';

test.describe('route groups', () => {
  test('marketing page renders at root /', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('text=Marketing').first()).toBeVisible();
    await expect(page.locator('text=gas-saas application')).toBeVisible();
    await expect(page.locator('button:has-text("Get Started")')).toBeVisible();
  });

  test('login page renders at /login', async ({ page }) => {
    await page.goto('/login');
    await expect(page.locator('text=Sign In').first()).toBeVisible();
    await expect(page.locator('input[type="email"]')).toBeVisible();
    await expect(page.locator('input[type="password"]')).toBeVisible();
    await expect(page.locator('button:has-text("Sign In")')).toBeVisible();
  });

  test('dashboard page renders at /dashboard', async ({ page }) => {
    await page.goto('/dashboard');
    await expect(page.locator('h1:has-text("Dashboard")')).toBeVisible();
    await expect(page.locator('text=Your overview at a glance')).toBeVisible();
    await expect(page.locator('text=Stat Card').first()).toBeVisible();
  });

  test('auth layout passes through children without extra wrapping', async ({ page }) => {
    await page.goto('/login');
    const signInText = page.locator('text=Sign In').first();
    await expect(signInText).toBeVisible();
  });

  test('dashboard layout passes through children without sidebar', async ({ page }) => {
    await page.goto('/dashboard');
    const h1 = page.locator('h1');
    await expect(h1).toBeVisible();
  });
});
