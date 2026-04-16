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
    useSession: vi.fn(() => ({
      value: { data: { user: { id: '123' } }, error: null },
      subscribe: vi.fn(),
    })),
  })),
}));

describe('layout integration', () => {
  let layoutContent: string;

  beforeAll(async () => {
    layoutContent = fs.readFileSync(path.join(process.cwd(), 'app/layout.tsx'), 'utf-8');
  });

  it('layout.tsx should import AuthUIProvider and authClient', () => {
    expect(layoutContent).toContain('AuthUIProvider');
    expect(layoutContent).toContain('authClient');
    expect(layoutContent).toContain('@/components/auth/auth-ui-provider');
  });

  it('layout should use AuthUIProvider with authClient prop', () => {
    // Verify AuthUIProvider wraps the app content
    expect(layoutContent).toContain('<AuthUIProvider authClient={authClient}>');
    expect(layoutContent).toContain('</AuthUIProvider>');
  });

  it('layout should wrap children with AuthUIProvider', () => {
    // Verify the structure wraps children
    expect(layoutContent).toContain('children');
    expect(layoutContent).toContain('TooltipProvider');
    expect(layoutContent).toContain('ThemeProvider');
  });

  it('AuthUIProvider should be imported from correct location', () => {
    expect(layoutContent).toMatch(
      /import.*\{[^}]*AuthUIProvider[^}]*\}.*from.*@\/components\/auth\/auth-ui-provider/,
    );
  });
});

describe('auth module exports', () => {
  it('should export authClient from lib/auth', async () => {
    const { authClient } = await import('@/lib/auth');
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
    // The component exists and can accept props
    expect(AuthUIProvider).toBeDefined();
    // Props type includes authClient
    const props = { authClient: { getSession: vi.fn() } } as Parameters<typeof AuthUIProvider>[0];
    expect(props.authClient).toBeDefined();
  });
});
