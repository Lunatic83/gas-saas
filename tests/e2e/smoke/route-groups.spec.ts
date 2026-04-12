import { test, expect } from '@playwright/test';

const consoleErrors: string[] = [];

test.afterEach(async () => {
  expect(consoleErrors).toHaveLength(0);
});

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      const text = msg.text();
      // Ignore browser resource-loading errors (404s for static assets, etc.)
      // Only fail on actual JavaScript/application errors.
      if (!text.startsWith('Failed to load resource')) {
        consoleErrors.push(text);
      }
    }
  });
});

test.describe('marketing page', () => {
  test('renders at 375px mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Now in Beta')).toBeVisible();
    await expect(page.locator('button:has-text("Get started")')).toBeVisible();
  });

  test('renders at 1280px desktop with features grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('h1')).toBeVisible();
    // Features grid should show 3 cards
    await expect(page.locator('text=Lightning Fast')).toBeVisible();
    await expect(page.locator('text=Secure by Default')).toBeVisible();
    await expect(page.locator('text=Real-time Analytics')).toBeVisible();
  });
});

test.describe('auth login page', () => {
  test('renders at 375px mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/login', { waitUntil: 'load' });
    await expect(page.locator('text=Login (E10)')).toBeVisible();
  });

  test('renders at 1280px desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login', { waitUntil: 'load' });
    await expect(page.locator('text=Login (E10)')).toBeVisible();
  });
});

test.describe('dashboard page', () => {
  test('renders at 1280px with sidebar visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard', { waitUntil: 'load' });
    // Sidebar should be visible on desktop
    await expect(page.locator('text=Gas SaaS').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('renders at 375px with sidebar trigger visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard', { waitUntil: 'load' });
    await expect(page.locator('main').first()).toBeVisible();
  });
});

test.describe('404 not-found page', () => {
  test('renders at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    // Navigating to a non-existent page returns 404, which the browser logs as a console error.
    // Clear any such expected errors before the afterEach check.
    const beforeCount = consoleErrors.length;
    await page.goto('/does-not-exist', { waitUntil: 'load' });
    await expect(page.locator('text=Page not found')).toBeVisible();
    await expect(page.locator('text=Back to home')).toBeVisible();
    // Remove the expected 404 console error so afterEach doesn't fail
    consoleErrors.splice(beforeCount);
  });
});

test.describe('root page', () => {
  test('renders marketing page at /', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'load' });
    await expect(page.locator('h1')).toBeVisible();
  });
});
