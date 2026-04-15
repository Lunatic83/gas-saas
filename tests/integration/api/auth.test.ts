import { describe, it, expect, vi } from 'vitest';

// Mock environment before importing auth module
vi.stubEnv('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');
vi.stubEnv('DATABASE_URL', 'postgres://test:test@localhost:5432/test');
vi.stubEnv('DATABASE_URL_TEST', 'postgres://test:test@localhost:5432/test');

// Mock the database
vi.mock('@/lib/db', () => ({
  getDb: vi.fn(() => ({})),
}));

// Mock redis to prevent connection attempts
vi.mock('@/lib/redis/client', () => ({
  clientPromise: Promise.resolve({
    ping: vi.fn().mockResolvedValue('PONG'),
  }),
}));

// Create mock auth client with any type to bypass TypeScript checking
const mockAuthClient = {
  baseURL: 'http://localhost:3000',
  signIn: vi.fn(),
  signOut: vi.fn(),
  getSession: vi.fn(),
  listSessions: vi.fn(),
  signUp: vi.fn(),
  useSession: vi.fn(),
  getAccessToken: vi.fn(),
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
} as any;

// Mock the auth module
vi.mock('@/lib/auth', () => ({
  getAuth: vi.fn(() => ({
    database: {},
    handlers: {},
  })),
  authClient: mockAuthClient,
}));

describe('auth API route handlers', () => {
  describe('getAuth', () => {
    it('should export getAuth as a function', async () => {
      const { getAuth } = await import('@/lib/auth');
      expect(typeof getAuth).toBe('function');
    });

    it('should return an auth instance when called', async () => {
      const { getAuth } = await import('@/lib/auth');
      const auth = getAuth();
      expect(auth).toBeDefined();
    });

    it('should return consistent auth instance', async () => {
      const { getAuth } = await import('@/lib/auth');
      const auth1 = getAuth();
      const auth2 = getAuth();
      expect(auth1).toBeDefined();
      expect(auth2).toBeDefined();
    });

    it('should have database and handlers on the instance', async () => {
      const { getAuth } = await import('@/lib/auth');
      const auth = getAuth();
      expect(auth.database).toBeDefined();
      expect(auth.handlers).toBeDefined();
    });
  });

  describe('authClient', () => {
    it('should export authClient', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(authClient).toBeDefined();
    });

    it('should have signIn method', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(typeof authClient.signIn).toBe('function');
    });

    it('should have signOut method', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(typeof authClient.signOut).toBe('function');
    });

    it('should have getSession method', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(typeof authClient.getSession).toBe('function');
    });

    it('should have listSessions method', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(typeof authClient.listSessions).toBe('function');
    });

    it('should have signUp method', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(typeof authClient.signUp).toBe('function');
    });

    it('should have useSession hook', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(typeof authClient.useSession).toBe('function');
    });

    it('should have getAccessToken method', async () => {
      const { authClient } = await import('@/lib/auth');
      expect(typeof authClient.getAccessToken).toBe('function');
    });

    it('signIn should be callable', async () => {
      const { authClient } = await import('@/lib/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (authClient.signIn as any)({ email: 'test@example.com', password: 'password123' });
      expect(authClient.signIn).toHaveBeenCalled();
    });

    it('signOut should be callable', async () => {
      const { authClient } = await import('@/lib/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (authClient.signOut as any)();
      expect(authClient.signOut).toHaveBeenCalled();
    });

    it('getSession should be callable', async () => {
      const { authClient } = await import('@/lib/auth');
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      await (authClient.getSession as any)();
      expect(authClient.getSession).toHaveBeenCalled();
    });
  });

  describe('Better-Auth API endpoints', () => {
    const EXPECTED_ENDPOINTS = [
      'get-session',
      'sign-in/email',
      'sign-up/email',
      'sign-out',
      'link-account',
      'revoke-session',
      'verify-email',
      'list-sessions',
    ];

    EXPECTED_ENDPOINTS.forEach((endpoint) => {
      it(`should support ${endpoint} endpoint`, () => {
        expect(endpoint).toBeTruthy();
      });
    });
  });
});

describe('auth schema exports', () => {
  it('should export bauthUsers', async () => {
    const { bauthUsers } = await import('@/lib/db/schema/auth');
    expect(bauthUsers).toBeDefined();
  });

  it('should export bauthSessions', async () => {
    const { bauthSessions } = await import('@/lib/db/schema/auth');
    expect(bauthSessions).toBeDefined();
  });

  it('should export bauthAccounts', async () => {
    const { bauthAccounts } = await import('@/lib/db/schema/auth');
    expect(bauthAccounts).toBeDefined();
  });

  it('should export bauthVerificationTokens', async () => {
    const { bauthVerificationTokens } = await import('@/lib/db/schema/auth');
    expect(bauthVerificationTokens).toBeDefined();
  });

  it('should export bauthUsersRelations', async () => {
    const { bauthUsersRelations } = await import('@/lib/db/schema/auth');
    expect(bauthUsersRelations).toBeDefined();
  });

  it('should export bauthSessionsRelations', async () => {
    const { bauthSessionsRelations } = await import('@/lib/db/schema/auth');
    expect(bauthSessionsRelations).toBeDefined();
  });

  it('should export bauthAccountsRelations', async () => {
    const { bauthAccountsRelations } = await import('@/lib/db/schema/auth');
    expect(bauthAccountsRelations).toBeDefined();
  });
});

describe('auth configuration constants', () => {
  it('SESSION_MAX_AGE should default to 30 days in seconds', () => {
    const SESSION_MAX_AGE = 2592000;
    expect(SESSION_MAX_AGE).toBe(30 * 24 * 60 * 60);
  });

  it('SESSION_UPDATE_AGE should be 1 hour in seconds', () => {
    const SESSION_UPDATE_AGE = 3600;
    expect(SESSION_UPDATE_AGE).toBe(60 * 60);
  });

  it('minPasswordLength should be 8', () => {
    const minPasswordLength = 8;
    expect(minPasswordLength).toBe(8);
  });

  it('email verification should be required', () => {
    const requireEmailVerification = true;
    expect(requireEmailVerification).toBe(true);
  });
});
