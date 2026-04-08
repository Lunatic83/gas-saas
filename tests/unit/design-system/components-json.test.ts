import { readFileSync } from 'fs';
import { resolve } from 'path';

import { test, expect, describe } from 'vitest';

const root = resolve(__dirname, '../../..');

describe('components.json', () => {
  test('exists and is valid JSON', () => {
    const file = readFileSync(resolve(root, 'components.json'), 'utf-8');
    expect(file).toBeTruthy();
    expect(() => JSON.parse(file)).not.toThrow();
  });

  test('cssVariables is set to true', () => {
    const file = readFileSync(resolve(root, 'components.json'), 'utf-8');
    const parsed = JSON.parse(file);
    expect(parsed.tailwind?.cssVariables).toBe(true);
  });

  test('baseColor is neutral', () => {
    const file = readFileSync(resolve(root, 'components.json'), 'utf-8');
    const parsed = JSON.parse(file);
    expect(parsed.tailwind?.baseColor).toBe('neutral');
  });

  test('rsc is enabled', () => {
    const file = readFileSync(resolve(root, 'components.json'), 'utf-8');
    const parsed = JSON.parse(file);
    expect(parsed.rsc).toBe(true);
  });

  test('css points to app/globals.css', () => {
    const file = readFileSync(resolve(root, 'components.json'), 'utf-8');
    const parsed = JSON.parse(file);
    expect(parsed.tailwind?.css).toBe('app/globals.css');
  });

  test('style is base or radix-based', () => {
    const file = readFileSync(resolve(root, 'components.json'), 'utf-8');
    const parsed = JSON.parse(file);
    const validStyles = ['base-nova', 'radix-nova', 'new-york'];
    expect(validStyles).toContain(parsed.style);
  });
});
