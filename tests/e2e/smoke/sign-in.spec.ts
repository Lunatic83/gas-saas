import { test, expect } from '@playwright/test';

test.describe('smoke — sign-in', () => {
  test('sign-in page loads without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await page.goto('/sign-in');
    await page.waitForLoadState('networkidle');

    // Check page has loaded
    const pageContent = await page.content();
    const hasContent = pageContent.includes('gas') || pageContent.includes('Gas');

    // No critical console errors
    const criticalErrors = errors.filter(
      (e) => !e.includes('favicon') && !e.includes('Warning') && !e.includes('hydration'),
    );

    // Page should have content
    expect(hasContent).toBeTruthy();
    expect(criticalErrors).toHaveLength(0);
  });
});
