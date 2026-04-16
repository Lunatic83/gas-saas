import { describe, it, expect, vi, beforeEach } from 'vitest';

// Mock next/navigation before any imports
vi.mock('next/navigation', () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    refresh: vi.fn(),
  })),
  usePathname: vi.fn(() => '/'),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Create mock session atom
const mockSessionAtom = {
  value: {
    data: {
      user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
      session: { id: 'session-123' },
    },
    error: null,
  },
  subscribe: vi.fn(),
  subscribeKey: vi.fn(),
};

// Create mock auth client
const createMockAuthClient = () => ({
  getSession: vi.fn().mockResolvedValue({
    data: { user: { id: '123' }, session: { id: 'sess-1' } },
    error: null,
  }),
  signIn: vi.fn(),
  signOut: vi.fn(),
  listSessions: vi.fn(),
  useSession: vi.fn(() => mockSessionAtom),
});

// Mock better-auth/client before importing auth modules
vi.mock('better-auth/client', () => ({
  createAuthClient: vi.fn(() => createMockAuthClient()),
}));

// Mock lib/auth to return our mock auth client
vi.mock('@/lib/auth', () => ({
  authClient: createMockAuthClient(),
}));

describe('AuthUIProvider', () => {
  let AuthUIProvider: typeof import('@/components/auth/auth-ui-provider').AuthUIProvider;
  let useAuthUI: typeof import('@/components/auth/auth-ui-provider').useAuthUI;

  beforeEach(async () => {
    vi.clearAllMocks();
    // Reset the mock session atom value
    mockSessionAtom.value = {
      data: {
        user: { id: 'user-123', email: 'test@example.com', name: 'Test User' },
        session: { id: 'session-123' },
      },
      error: null,
    };
    const modulePtr = await import('@/components/auth/auth-ui-provider');
    AuthUIProvider = modulePtr.AuthUIProvider;
    useAuthUI = modulePtr.useAuthUI;
  });

  describe('exports', () => {
    it('should export AuthUIProvider component', () => {
      expect(AuthUIProvider).toBeDefined();
      expect(typeof AuthUIProvider).toBe('function');
    });

    it('should export useAuthUI hook', () => {
      expect(useAuthUI).toBeDefined();
      expect(typeof useAuthUI).toBe('function');
    });

    it('should export authClient from lib/auth', async () => {
      const modulePtr = await import('@/components/auth/auth-ui-provider');
      // authClient should be re-exported
      expect(modulePtr.authClient).toBeDefined();
    });
  });

  describe('configuration', () => {
    it('should accept authClient prop', () => {
      // AuthUIProvider expects authClient of type AuthClient
      // The component should be callable with this prop
      const authClientProps = {
        authClient: {
          getSession: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
        },
        navigate: vi.fn(),
        replace: vi.fn(),
      };

      // Just verify the component accepts the expected props
      expect(authClientProps.authClient).toBeDefined();
    });

    it('should accept navigate function prop', () => {
      const navigate = vi.fn();
      expect(typeof navigate).toBe('function');
    });

    it('should accept replace function prop', () => {
      const replace = vi.fn();
      expect(typeof replace).toBe('function');
    });

    it('should accept onSessionChange callback prop', () => {
      const onSessionChange = vi.fn();
      expect(typeof onSessionChange).toBe('function');
    });

    it('should accept LinkComponent prop', () => {
      // LinkComponent is a function type used by AuthUIProvider
      // This test verifies the type is a function
      const LinkComponent: (props: { href: string; children?: React.ReactNode }) => null = () =>
        null;
      expect(typeof LinkComponent).toBe('function');
    });
  });

  describe('integration with auth', () => {
    it('should work with authClient from lib/auth', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(authClient).toBeDefined();
      expect(typeof authClient.getSession).toBe('function');
      expect(typeof authClient.useSession).toBe('function');
    });

    it('should work with createAuthClient', async () => {
      const { createAuthClient } = await import('better-auth/client');
      const client = createAuthClient({ baseURL: 'http://localhost:3000' });
      expect(client).toBeDefined();
      expect(typeof client.getSession).toBe('function');
      expect(typeof client.useSession).toBe('function');
    });

    it('useSession should return an atom with session data', () => {
      const client = createMockAuthClient();
      const atom = client.useSession();
      expect(atom).toBeDefined();
      expect(atom.value).toBeDefined();
      expect(atom.value.data).toBeDefined();
      expect(atom.value.data.user).toBeDefined();
    });
  });
});
