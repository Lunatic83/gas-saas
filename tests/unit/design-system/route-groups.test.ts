import { readFileSync } from 'fs';
import { resolve } from 'path';

import { describe, expect, it } from 'vitest';

const root = resolve(__dirname, '../../..');

function getFile(path: string) {
  return readFileSync(resolve(root, path), 'utf-8');
}

describe('E9-2 route groups', () => {
  describe('auth route group', () => {
    it('app/(auth)/layout.tsx exists and exports default', () => {
      const content = getFile('app/(auth)/layout.tsx');
      expect(content).toMatch(/export\s+default\s+function/);
    });

    it('app/(auth)/login/page.tsx exists and exports default', () => {
      const content = getFile('app/(auth)/login/page.tsx');
      expect(content).toMatch(/export\s+default\s+function/);
    });
  });

  describe('dashboard route group', () => {
    it('app/(dashboard)/layout.tsx exists and exports default', () => {
      const content = getFile('app/(dashboard)/layout.tsx');
      expect(content).toMatch(/export\s+default\s+function/);
    });

    it('app/(dashboard)/page.tsx exists and exports default', () => {
      const content = getFile('app/(dashboard)/page.tsx');
      expect(content).toMatch(/export\s+default\s+function/);
    });
  });

  describe('root app/page.tsx', () => {
    it('app/page.tsx exists and exports default (null page)', () => {
      const content = getFile('app/page.tsx');
      expect(content).toMatch(/export\s+default\s+function/);
      expect(content).toMatch(/return\s+null/);
    });
  });
});
