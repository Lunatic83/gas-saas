import { describe, it, expect } from 'vitest';

import { bauthUsers, bauthSessions, bauthAccounts, bauthVerificationTokens } from '@/lib/db/schema';

describe('auth schema exports', () => {
  it('should export all auth tables', () => {
    expect(bauthUsers).toBeDefined();
    expect(bauthSessions).toBeDefined();
    expect(bauthAccounts).toBeDefined();
    expect(bauthVerificationTokens).toBeDefined();
  });

  it('bauthUsers should be a table object', () => {
    expect(bauthUsers).toBeTruthy();
    expect(typeof bauthUsers).toBe('object');
  });

  it('bauthSessions should be a table object', () => {
    expect(bauthSessions).toBeTruthy();
    expect(typeof bauthSessions).toBe('object');
  });

  it('bauthAccounts should be a table object', () => {
    expect(bauthAccounts).toBeTruthy();
    expect(typeof bauthAccounts).toBe('object');
  });

  it('bauthVerificationTokens should be a table object', () => {
    expect(bauthVerificationTokens).toBeTruthy();
    expect(typeof bauthVerificationTokens).toBe('object');
  });
});
