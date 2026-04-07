import { test, expect } from '@playwright/test';

test.describe('smoke — design system', () => {
  test('root layout renders with ThemeProvider and data-theme on html', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme');
  });

  test('themeProvider sets system-default data-theme on mount', async ({ page }) => {
    await page.goto('/');
    const html = page.locator('html');
    const theme = await html.getAttribute('data-theme');
    // Valid values: light, dark, or system (next-themes resolves system to light/dark)
    expect(['light', 'dark']).toContain(theme);
  });
});
