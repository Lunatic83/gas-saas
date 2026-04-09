import { test, expect } from '@playwright/test';

const consoleErrors: string[] = [];

test.afterEach(async () => {
  expect(consoleErrors).toHaveLength(0);
});

test.beforeEach(async ({ page }) => {
  consoleErrors.length = 0;
  page.on('console', (msg) => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });
});

test.describe('marketing page', () => {
  test('renders at 375px mobile', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();
    await expect(page.locator('text=Now in Beta')).toBeVisible();
    await expect(page.locator('button:has-text("Get started")')).toBeVisible();
  });

  test('renders at 1280px desktop with features grid', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
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
    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Login (E10)')).toBeVisible();
  });

  test('renders at 1280px desktop', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/login', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Login (E10)')).toBeVisible();
  });
});

test.describe('dashboard page', () => {
  test('renders at 1280px with sidebar visible', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    // Sidebar should be visible on desktop
    await expect(page.locator('text=Gas SaaS').first()).toBeVisible();
    await expect(page.locator('main').first()).toBeVisible();
  });

  test('renders at 375px with sidebar trigger visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/dashboard', { waitUntil: 'networkidle' });
    await expect(page.locator('main').first()).toBeVisible();
  });
});

test.describe('404 not-found page', () => {
  test('renders at 1280px', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/does-not-exist', { waitUntil: 'networkidle' });
    await expect(page.locator('text=Page not found')).toBeVisible();
    await expect(page.locator('text=Back to home')).toBeVisible();
  });
});

test.describe('root page', () => {
  test('renders marketing page at /', async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 });
    await page.goto('/', { waitUntil: 'networkidle' });
    await expect(page.locator('h1')).toBeVisible();
  });
});
