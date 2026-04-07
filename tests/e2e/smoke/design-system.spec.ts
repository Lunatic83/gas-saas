import { test, expect } from '@playwright/test';

test.describe('smoke — design system', () => {
  test('root layout renders with ThemeProvider and theme class on html', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    // next-themes runs client-side — wait for class to be applied
    await page.waitForFunction(
      () =>
        document.documentElement.classList.contains('light') ||
        document.documentElement.classList.contains('dark'),
    );
    const html = page.locator('html');
    await expect(html).toHaveClass(/^(light|dark)$/);
  });

  test('themeProvider sets system-default theme class on mount', async ({ page }) => {
    await page.goto('/', { waitUntil: 'networkidle' });
    await page.waitForFunction(
      () =>
        document.documentElement.classList.contains('light') ||
        document.documentElement.classList.contains('dark'),
    );
    const html = page.locator('html');
    const cls = await html.getAttribute('class');
    expect(cls).toMatch(/^(light|dark)$/);
  });
});
