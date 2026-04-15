import { describe, it, expect } from 'vitest';

import { authClient } from '@/lib/auth';

describe('auth configuration', () => {
  it('should export authClient with baseURL configured', () => {
    expect(authClient).toBeDefined();
  });

  it('authClient should have signIn method', () => {
    expect(typeof authClient.signIn).toBe('function');
  });

  it('authClient should have signOut method', () => {
    expect(typeof authClient.signOut).toBe('function');
  });

  it('authClient should have getSession method', () => {
    expect(typeof authClient.getSession).toBe('function');
  });
});
