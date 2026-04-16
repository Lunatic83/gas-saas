import { test, expect } from '@playwright/test';

test.describe('smoke — sign-in', () => {
  test('sign-in page loads without console errors at mobile viewport', async ({ page }) => {
    // Mobile: centered column, no image
    await page.setViewportSize({ width: 375, height: 812 });
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/sign-in');
    await expect(page).toHaveTitle(/.*sign.?in.*|.*gas.*saas.*|.*create next app.*/i);
    await page.waitForLoadState('domcontentloaded');

    // No console errors
    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('sign-in page loads without console errors at desktop viewport', async ({ page }) => {
    // Desktop: split layout, image left
    await page.setViewportSize({ width: 1280, height: 800 });
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/sign-in');
    await expect(page).toHaveTitle(/.*sign.?in.*|.*gas.*saas.*|.*create next app.*/i);
    await page.waitForLoadState('domcontentloaded');

    // No console errors
    expect(errors.filter((e) => !e.includes('favicon'))).toHaveLength(0);
  });

  test('mobile: form is centered with no image', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Form is present
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // No hero image on mobile
    const images = page.locator('img');
    await expect(images).toHaveCount(0);

    // Email input is visible
    const emailInput = page
      .locator('input[name="email"], input[type="email"], input[placeholder*="email" i]')
      .first();
    await expect(emailInput).toBeVisible();
  });

  test('desktop: split layout with image left and form right', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Image visible on desktop
    const images = page.locator('img');
    await expect(images).toHaveCount(1);

    // Form is present
    const form = page.locator('form');
    await expect(form).toBeVisible();

    // Email input visible
    const emailInput = page
      .locator('input[name="email"], input[type="email"], input[placeholder*="email" i]')
      .first();
    await expect(emailInput).toBeVisible();
  });

  test('forgot password link navigates to /forgot-password', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    const forgotLink = page
      .locator('a[href="/forgot-password"], a:has-text("Forgot password")')
      .first();
    await expect(forgotLink).toBeVisible();
    await forgotLink.click();
    await expect(page).toHaveURL(/.*forgot-password.*/);
  });

  test('sign up link navigates to /sign-up', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    const signUpLink = page.locator('a[href="/sign-up"], a:has-text("Sign up")').first();
    await expect(signUpLink).toBeVisible();
    await signUpLink.click();
    await expect(page).toHaveURL(/.*sign-up.*/);
  });

  test('page has email and password fields', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // Email field
    const emailInput = page.locator('input[name="email"], input[type="email"]').first();
    await expect(emailInput).toBeVisible();

    // Password field
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();
    await expect(passwordInput).toBeVisible();
  });

  test('page has OAuth buttons visible', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    // At least one OAuth button (Google or GitHub)
    const oauthButton = page
      .locator(
        'button:has-text("Google"), button:has-text("GitHub"), a:has-text("Google"), a:has-text("GitHub")',
      )
      .first();
    await expect(oauthButton).toBeVisible();
  });

  test('remember me checkbox is present', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('domcontentloaded');

    const rememberMe = page
      .locator('input[type="checkbox"], :checkbox, text="Remember me"')
      .first();
    await expect(rememberMe).toBeVisible();
  });
});
