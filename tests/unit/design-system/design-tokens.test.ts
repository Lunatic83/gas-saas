import { readFileSync } from 'fs';
import { resolve } from 'path';

import { test, expect, describe } from 'vitest';

const root = resolve(__dirname, '../../..');

// Tokens that shadcn base-nova actually defines in :root and .dark
const REQUIRED_TOKENS = [
  '--background',
  '--foreground',
  '--card',
  '--card-foreground',
  '--popover',
  '--popover-foreground',
  '--primary',
  '--primary-foreground',
  '--secondary',
  '--secondary-foreground',
  '--muted',
  '--muted-foreground',
  '--accent',
  '--accent-foreground',
  '--destructive', // note: no separate destructive-foreground in base-nova
  '--border',
  '--input',
  '--ring',
  '--chart-1',
  '--chart-2',
  '--chart-3',
  '--chart-4',
  '--chart-5',
  '--radius',
  '--sidebar',
  '--sidebar-foreground',
  '--sidebar-primary',
  '--sidebar-primary-foreground',
  '--sidebar-accent',
  '--sidebar-accent-foreground',
  '--sidebar-border',
  '--sidebar-ring',
];

describe('design tokens', () => {
  test('globals.css has :root selector', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    expect(css).toMatch(/:root\s*\{/);
  });

  test('globals.css has .dark selector', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    expect(css).toMatch(/\.dark\s*\{/);
  });

  test('globals.css defines all required CSS variables in :root', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    const rootSection = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    for (const token of REQUIRED_TOKENS) {
      expect(rootSection).toMatch(new RegExp(token.replace('-', '\\-')));
    }
  });

  test('globals.css defines all required CSS variables in .dark', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    const darkSection = css.match(/\.dark\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    // --radius and --chart-* are not redefined in .dark (same values as :root)
    const darkSpecificTokens = REQUIRED_TOKENS.filter(
      (t) =>
        !['--radius', '--chart-1', '--chart-2', '--chart-3', '--chart-4', '--chart-5'].includes(t),
    );
    for (const token of darkSpecificTokens) {
      expect(darkSection).toMatch(new RegExp(token.replace('-', '\\-')));
    }
  });

  test('globals.css has @theme inline block', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    expect(css).toMatch(/@theme\s+inline\s*\{/);
  });

  test('@theme inline exposes all base tokens as --color-* utilities', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    const themeBlock = css.match(/@theme\s+inline\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    // Check key tokens are exposed — destructive-foreground not required for base-nova
    const exposedTokens = [
      '--background',
      '--foreground',
      '--primary',
      '--primary-foreground',
      '--secondary',
      '--secondary-foreground',
      '--muted',
      '--muted-foreground',
      '--accent',
      '--accent-foreground',
      '--destructive',
      '--border',
      '--input',
      '--ring',
      '--card',
      '--card-foreground',
      '--popover',
      '--popover-foreground',
      '--chart-1',
      '--chart-2',
      '--chart-3',
      '--chart-4',
      '--chart-5',
    ];
    for (const token of exposedTokens) {
      const colorName = token.replace('--', '--color-');
      expect(themeBlock).toMatch(new RegExp(`${colorName}:\\s*var\\(${token}\\)`));
    }
  });

  test('globals.css does not have tailwind.config.ts-style file', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    expect(css).not.toMatch(/module\.exports/);
  });

  test('globals.css uses OKLCH color values', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    const rootSection = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    expect(rootSection).toMatch(/oklch\(/);
  });

  test('dark mode tokens differ from light mode', () => {
    const css = readFileSync(resolve(root, 'app/globals.css'), 'utf-8');
    const rootSection = css.match(/:root\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    const darkSection = css.match(/\.dark\s*\{([\s\S]*?)\}/)?.[1] ?? '';
    // background and foreground should have different values
    const rootBg = rootSection.match(/--background:\s*([^;]+)/)?.[1];
    const darkBg = darkSection.match(/--background:\s*([^;]+)/)?.[1];
    expect(rootBg).toBeTruthy();
    expect(darkBg).toBeTruthy();
    expect(rootBg).not.toBe(darkBg);
  });
});
