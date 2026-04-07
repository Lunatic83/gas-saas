import { test, expect } from '@playwright/test';

test.describe('smoke — design system', () => {
  test('root layout renders with ThemeProvider and theme class on html', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const html = page.locator('html');
    // next-themes with attribute="class" adds 'light' or 'dark' class to <html>
    await expect(html).toHaveClass(/^(light|dark)$/);
  });

  test('themeProvider sets system-default theme class on mount', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    const html = page.locator('html');
    const cls = await html.getAttribute('class');
    expect(cls).toMatch(/^(light|dark)$/);
  });
});
