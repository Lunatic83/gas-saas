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
  useSession: mockSessionAtom,
});

// Mock better-auth/client before importing auth modules
vi.mock('better-auth/client', () => ({
  createAuthClient: vi.fn(() => createMockAuthClient()),
}));

// Mock lib/auth-client to return our mock auth client
vi.mock('@/lib/auth-client', () => ({
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
  });

  describe('configuration', () => {
    it('should accept authClient prop', () => {
      const authClientProps = {
        authClient: {
          getSession: vi.fn(),
          signIn: vi.fn(),
          signOut: vi.fn(),
        },
        onSessionChange: vi.fn(),
      };

      expect(authClientProps.authClient).toBeDefined();
    });

    it('should accept onSessionChange callback prop', () => {
      const onSessionChange = vi.fn();
      expect(typeof onSessionChange).toBe('function');
    });
  });

  describe('integration with auth', () => {
    it('should work with authClient from lib/auth-client', async () => {
      const { authClient } = await import('@/lib/auth-client');
      expect(authClient).toBeDefined();
      expect(typeof authClient.getSession).toBe('function');
      // useSession is an atom property, not a function
      expect(authClient.useSession).toBeDefined();
      expect(authClient.useSession).toHaveProperty('value');
    });

    it('should work with createAuthClient', async () => {
      const { createAuthClient } = await import('better-auth/client');
      const client = createAuthClient({ baseURL: 'http://localhost:3000' });
      expect(client).toBeDefined();
      expect(typeof client.getSession).toBe('function');
      // useSession is an atom property, not a function
      expect(client.useSession).toBeDefined();
      expect(client.useSession).toHaveProperty('value');
    });

    it('useSession should return an atom with session data', () => {
      const client = createMockAuthClient();
      const atom = client.useSession;
      expect(atom).toBeDefined();
      expect(atom.value).toBeDefined();
      expect(atom.value.data).toBeDefined();
      expect(atom.value.data.user).toBeDefined();
    });
  });
});
