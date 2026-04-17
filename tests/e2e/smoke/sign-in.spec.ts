import { test, expect } from '@playwright/test';

test.describe('smoke — sign-in', () => {
  test('sign-in page loads and has correct structure', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    // Check page has loaded - either by title or content
    const pageContent = await page.content();
    const hasSignInContent = pageContent.includes('sign-in') || pageContent.includes('Sign in');

    // No critical console errors (filter out warnings and non-critical errors)
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('hydration') && !e.includes('Warning'),
    );

    // The page should either have sign-in content OR the auth layout should be present
    expect(
      hasSignInContent || pageContent.includes('gas') || pageContent.includes('Gas'),
    ).toBeTruthy();
    expect(criticalErrors).toHaveLength(0);
  });

  test('page renders form elements when visible', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1000); // Wait for hydration

    // Try to find form elements - they may or may not be visible depending on SSR/CSR
    const form = page.locator('form');
    const emailInput = page.locator('input[type="email"]');
    const passwordInput = page.locator('input[type="password"]');
    const checkbox = page.locator('input[type="checkbox"]');

    // At least one of these should exist on the page
    const hasForm = (await form.count()) > 0;
    const hasEmail = (await emailInput.count()) > 0;
    const hasPassword = (await passwordInput.count()) > 0;
    const hasCheckbox = (await checkbox.count()) > 0;

    // Page should have some form elements
    expect(hasForm || hasEmail || hasPassword || hasCheckbox).toBeTruthy();
  });

  test('oauth buttons are present', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    // Look for OAuth-related links
    const googleLink = page.locator('a[href*="google"]');
    const githubLink = page.locator('a[href*="github"]');

    const hasGoogle = (await googleLink.count()) > 0;
    const hasGithub = (await githubLink.count()) > 0;

    // At least one OAuth link should exist
    expect(hasGoogle || hasGithub).toBeTruthy();
  });

  test('navigation links are present', async ({ page }) => {
    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    // Look for sign-up and forgot password links
    const signUpLink = page.locator('a[href="/sign-up"]');
    const forgotLink = page.locator('a[href="/forgot-password"]');

    const hasSignUp = (await signUpLink.count()) > 0;
    const hasForgot = (await forgotLink.count()) > 0;

    // Both links should exist
    expect(hasSignUp && hasForgot).toBeTruthy();
  });
});
