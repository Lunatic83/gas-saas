import { drizzleAdapter } from '@better-auth/drizzle-adapter';
import { betterAuth } from 'better-auth';
import { createAuthClient } from 'better-auth/client';
import { magicLink } from 'better-auth/plugins';

import { db } from '@/lib/db';
import {
  bauthUsers,
  bauthSessions,
  bauthAccounts,
  bauthVerificationTokens,
} from '@/lib/db/schema/auth';

const _parsedMaxAge = parseInt(process.env.SESSION_MAX_AGE ?? '2592000', 10);
if (isNaN(_parsedMaxAge) || _parsedMaxAge <= 0) {
  throw new Error('SESSION_MAX_AGE must be a positive integer');
}
const SESSION_MAX_AGE = _parsedMaxAge;

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: 'pg',
    schema: {
      users: bauthUsers,
      sessions: bauthSessions,
      accounts: bauthAccounts,
      verificationTokens: bauthVerificationTokens,
    },
  }),
  session: {
    expiresIn: SESSION_MAX_AGE,
    updateAge: 3600,
  },
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },
  plugins: [
    magicLink({
      sendMagicLink: async ({ email, url }) => {
        const host = process.env.SMTP_HOST ?? 'localhost';
        const port = process.env.SMTP_PORT ?? '1025';
        const user = process.env.SMTP_USER ?? '';
        const pass = process.env.SMTP_PASS ?? '';
        const from = process.env.EMAIL_FROM ?? 'noreply@localhost';

        const nodemailer = await import('nodemailer');
        const transporter = nodemailer.createTransport({
          host,
          port: parseInt(port, 10),
          auth: user ? { user, pass } : undefined,
        });

        try {
          await transporter.sendMail({
            to: email,
            from,
            subject: 'Verify your email — magic link',
            html: `<p>Click to verify: <a href="${url.replace(/"/g, '&quot;')}">Verify your email</a></p>`,
          });
        } catch (error) {
          console.error('[Auth] Failed to send magic link email:', error);
          throw new Error('Failed to send verification email');
        }
      },
    }),
  ],
  socialProviders: {
    ...(process.env.GOOGLE_CLIENT_ID &&
      process.env.GOOGLE_CLIENT_SECRET && {
        google: {
          clientId: process.env.GOOGLE_CLIENT_ID,
          clientSecret: process.env.GOOGLE_CLIENT_SECRET,
        },
      }),
    ...(process.env.GITHUB_CLIENT_ID &&
      process.env.GITHUB_CLIENT_SECRET && {
        github: {
          clientId: process.env.GITHUB_CLIENT_ID,
          clientSecret: process.env.GITHUB_CLIENT_SECRET,
        },
      }),
  },
  account: {
    accountLinking: {
      enabled: false,
    },
  },
  advanced: {
    useSecureCookies: process.env.NODE_ENV === 'production',
    cookiePrefix: 'gas-saas',
  },
});

export const authClient = createAuthClient({
  fetchFn: fetch,
  baseURL: process.env.BETTER_AUTH_URL ?? 'http://localhost:3000',
});
