import { readFileSync, existsSync } from 'fs';
import { resolve } from 'path';

import { test, expect, describe } from 'vitest';

const root = resolve(__dirname, '../../..');

describe('theme-provider', () => {
  test('theme-provider.tsx exists', () => {
    expect(existsSync(resolve(root, 'components/theme-provider.tsx'))).toBe(true);
  });

  test('theme-provider.tsx has "use client" directive', () => {
    const file = readFileSync(resolve(root, 'components/theme-provider.tsx'), 'utf-8');
    expect(file).toMatch(/['"]use client['"]/);
  });

  test('theme-provider.tsx wraps NextThemesProvider', () => {
    const file = readFileSync(resolve(root, 'components/theme-provider.tsx'), 'utf-8');
    expect(file).toMatch(/NextThemesProvider/);
  });

  test('theme-provider.tsx uses attribute="class"', () => {
    const file = readFileSync(resolve(root, 'components/theme-provider.tsx'), 'utf-8');
    expect(file).toMatch(/attribute\s*=\s*["']class["']/);
  });

  test('theme-provider.tsx defaults to system theme', () => {
    const file = readFileSync(resolve(root, 'components/theme-provider.tsx'), 'utf-8');
    expect(file).toMatch(/defaultTheme\s*=\s*["']system["']/);
  });

  test('theme-provider.tsx exports a ThemeProvider component', () => {
    const file = readFileSync(resolve(root, 'components/theme-provider.tsx'), 'utf-8');
    expect(file).toMatch(/export\s+(?:default\s+)?(?:function|const)\s+ThemeProvider/);
  });

  test('app/layout.tsx imports ThemeProvider', () => {
    const file = readFileSync(resolve(root, 'app/layout.tsx'), 'utf-8');
    expect(file).toMatch(/ThemeProvider/);
  });

  test('app/layout.tsx has html with suppressHydrationWarning', () => {
    const file = readFileSync(resolve(root, 'app/layout.tsx'), 'utf-8');
    expect(file).toMatch(/suppressHydrationWarning/);
  });

  test('next-themes is installed as a dependency', () => {
    const pkg = readFileSync(resolve(root, 'package.json'), 'utf-8');
    const parsed = JSON.parse(pkg);
    const deps = { ...parsed.dependencies, ...parsed.devDependencies };
    expect(deps['next-themes']).toBeTruthy();
  });
});
