import { describe, expect, test } from 'vitest';

import {
  bauth_users,
  bauth_sessions,
  bauth_accounts,
  bauth_verification_tokens,
} from '@/lib/db/schema/auth';

describe('auth schema exports', () => {
  test('bauth_users table is defined', () => {
    expect(bauth_users).toBeTruthy();
    expect(typeof bauth_users).toBe('object');
  });

  test('bauth_sessions table is defined', () => {
    expect(bauth_sessions).toBeTruthy();
    expect(typeof bauth_sessions).toBe('object');
  });

  test('bauth_accounts table is defined', () => {
    expect(bauth_accounts).toBeTruthy();
    expect(typeof bauth_accounts).toBe('object');
  });

  test('bauth_verification_tokens table is defined', () => {
    expect(bauth_verification_tokens).toBeTruthy();
    expect(typeof bauth_verification_tokens).toBe('object');
  });
});
