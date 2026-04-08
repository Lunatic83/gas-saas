import { test, expect } from '@playwright/test';

test.describe('smoke — design system', () => {
  test('root layout renders with ThemeProvider and theme on html', async ({ page }) => {
    // Wait for the page to be fully loaded and hydrated
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // Wait for the html element to have a theme class applied by next-themes
    // next-themes adds 'light' or 'dark' as a class on <html> after hydration
    await page.waitForFunction(
      () => {
        const html = document.documentElement;
        return html.classList.contains('light') || html.classList.contains('dark');
      },
      { timeout: 15_000 },
    );

    const theme = await page.evaluate(() => {
      const html = document.documentElement;
      return html.classList.contains('light')
        ? 'light'
        : html.classList.contains('dark')
          ? 'dark'
          : null;
    });
    expect(theme).toMatch(/^(light|dark)$/);
  });

  test('themeProvider sets system-default theme on mount', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });

    // System-default means next-themes applies the OS preference (light or dark)
    await page.waitForFunction(
      () => {
        const html = document.documentElement;
        return html.classList.contains('light') || html.classList.contains('dark');
      },
      { timeout: 15_000 },
    );

    // Verify the theme class is present (light or dark based on system preference)
    const hasThemeClass = await page.evaluate(() => {
      const html = document.documentElement;
      return html.classList.contains('light') || html.classList.contains('dark');
    });
    expect(hasThemeClass).toBe(true);
  });
});
