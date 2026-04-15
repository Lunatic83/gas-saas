import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { createAuthClient } from 'better-auth/client';

import { getDb } from './db';
import {
  bauthUsers,
  bauthSessions,
  bauthAccounts,
  bauthVerificationTokens,
} from './db/schema/auth';

const SESSION_MAX_AGE = parseInt(process.env.SESSION_MAX_AGE ?? '2592000'); // 30 days in seconds
const SESSION_UPDATE_AGE = 3600; // 1 hour in seconds

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyAuth = any;

let authInstance: AnyAuth | undefined;

export function getAuth(): AnyAuth {
  if (!authInstance) {
    authInstance = betterAuth({
      database: drizzleAdapter(getDb(), {
        provider: 'pg',
        schema: {
          users: bauthUsers,
          sessions: bauthSessions,
          accounts: bauthAccounts,
          verificationTokens: bauthVerificationTokens,
        },
        camelCase: true,
      }),
      emailAndPassword: {
        enabled: true,
        requireEmailVerification: true,
        minPasswordLength: 8,
      },
      emailMagicLink: {
        enabled: true,
        requireEmailVerification: true,
      },
      socialProviders: {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID ?? '',
          clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? '',
        },
        github: {
          clientId: process.env.GITHUB_CLIENT_ID ?? '',
          clientSecret: process.env.GITHUB_CLIENT_SECRET ?? '',
        },
      },
      session: {
        maxAge: SESSION_MAX_AGE,
        updateAge: SESSION_UPDATE_AGE,
      },
      advanced: {
        useSecureCookies: true,
        cookiePrefix: 'gas-saas',
        allowAccountLinking: false,
        checkOrigin: true,
      },
    });
  }
  return authInstance;
}

// Client-side auth instance
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
});
