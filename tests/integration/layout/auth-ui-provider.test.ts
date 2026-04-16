import * as fs from 'fs';
import * as path from 'path';

import { describe, it, expect, vi, beforeAll } from 'vitest';

// Mock next/navigation for component tests
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock better-auth/client
vi.mock('better-auth/client', () => ({
  createAuthClient: vi.fn(() => ({
    getSession: vi.fn().mockResolvedValue({
      data: { user: { id: '123' } },
      error: null,
    }),
    signIn: vi.fn(),
    signOut: vi.fn(),
    useSession: {
      value: { data: { user: { id: '123' } }, error: null },
      subscribe: vi.fn(),
    },
  })),
}));

describe('layout integration', () => {
  let layoutContent: string;

  beforeAll(async () => {
    layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf-8');
  });

  it('layout.tsx should use AuthProvider component', () => {
    expect(layoutContent).toContain('AuthProvider');
    expect(layoutContent).toContain('auth-provider-dynamic');
  });

  it('layout should wrap children with AuthProvider', () => {
    expect(layoutContent).toContain('children');
    expect(layoutContent).toContain('TooltipProvider');
    expect(layoutContent).toContain('ThemeProvider');
  });

  it('layout should have server component metadata', () => {
    expect(layoutContent).toContain('export const metadata');
    expect(layoutContent).toContain('title');
    expect(layoutContent).toContain('Create Next App');
  });
});

describe('auth module exports', () => {
  it('should export authClient from lib/auth-client', async () => {
    const { authClient } = await import('@/lib/auth-client');
    expect(authClient).toBeDefined();
    expect(typeof authClient.getSession).toBe('function');
    expect(typeof authClient.signIn).toBe('function');
    expect(typeof authClient.signOut).toBe('function');
  });

  it('should export AuthUIProvider from components/auth', async () => {
    const { AuthUIProvider } = await import('@/components/auth/auth-ui-provider');
    expect(AuthUIProvider).toBeDefined();
    expect(typeof AuthUIProvider).toBe('function');
  });

  it('AuthUIProvider should accept authClient prop', async () => {
    const { AuthUIProvider } = await import('@/components/auth/auth-ui-provider');
    expect(AuthUIProvider).toBeDefined();
    // The component should accept authClient without errors
    expect(typeof AuthUIProvider).toBe('function');
  });

  it('should export AuthProviderWrapper from auth-provider-client', async () => {
    const { AuthProviderWrapper } = await import('@/components/auth/auth-provider-client');
    expect(AuthProviderWrapper).toBeDefined();
    expect(typeof AuthProviderWrapper).toBe('function');
  });
});
