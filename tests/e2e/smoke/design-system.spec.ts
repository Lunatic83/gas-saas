import { test, expect } from '@playwright/test';

test.describe('smoke — design system', () => {
  test('root layout renders with ThemeProvider and data-theme on html', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme');
  });

  test('themeProvider sets system-default data-theme on mount', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const html = page.locator('html');
    await expect(html).toHaveAttribute('data-theme', /^(light|dark)$/);
  });
});
