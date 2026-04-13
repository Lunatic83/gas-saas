import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";

import { db } from "./db";
import {
  bauth_users,
  bauth_sessions,
  bauth_accounts,
  bauth_verification_tokens,
} from "./db/schema/auth";

export const auth = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: {
      user: bauth_users,
      session: bauth_sessions,
      account: bauth_accounts,
      verification: bauth_verification_tokens,
    },
  }),
  emailAndPassword: {
    enabled: true,
    requireEmailVerification: true,
    minPasswordLength: 8,
  },
  advanced: {
    useSecureCookies: true,
    cookiePrefix: "gas-saas",
  },
  session: {
    expiresIn: parseInt(process.env.SESSION_MAX_AGE ?? "2592000"),
    updateAge: 3600,
  },
});
