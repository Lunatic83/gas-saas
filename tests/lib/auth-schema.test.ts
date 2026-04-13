import { describe, it, expect } from 'vitest';

import {
  bauthUsers,
  bauthSessions,
  bauthAccounts,
  bauthVerificationTokens,
} from '@/lib/db/schema/auth';

describe('Auth Schema', () => {
  describe('bauthUsers', () => {
    it('defines id as primary key', () => {
      expect(bauthUsers.id).toBeDefined();
    });

    it('defines email as unique', () => {
      expect(bauthUsers.email).toBeDefined();
    });

    it('defines emailVerified with default false', () => {
      expect(bauthUsers.emailVerified).toBeDefined();
    });

    it('defines createdAt and updatedAt timestamps', () => {
      expect(bauthUsers.createdAt).toBeDefined();
      expect(bauthUsers.updatedAt).toBeDefined();
    });
  });

  describe('bauthSessions', () => {
    it('defines id as primary key', () => {
      expect(bauthSessions.id).toBeDefined();
    });

    it('defines userId as foreign key to bauthUsers', () => {
      expect(bauthSessions.userId).toBeDefined();
    });

    it('defines token as unique', () => {
      expect(bauthSessions.token).toBeDefined();
    });

    it('defines expiresAt timestamp', () => {
      expect(bauthSessions.expiresAt).toBeDefined();
    });
  });

  describe('bauthAccounts', () => {
    it('defines id as primary key', () => {
      expect(bauthAccounts.id).toBeDefined();
    });

    it('defines userId as foreign key to bauthUsers', () => {
      expect(bauthAccounts.userId).toBeDefined();
    });

    it('defines provider and providerAccountId', () => {
      expect(bauthAccounts.provider).toBeDefined();
      expect(bauthAccounts.providerAccountId).toBeDefined();
    });
  });

  describe('bauthVerificationTokens', () => {
    it('defines identifier and token fields', () => {
      expect(bauthVerificationTokens.identifier).toBeDefined();
      expect(bauthVerificationTokens.token).toBeDefined();
    });

    it('defines expiresAt timestamp', () => {
      expect(bauthVerificationTokens.expiresAt).toBeDefined();
    });
  });
});
