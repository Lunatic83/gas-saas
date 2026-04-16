// Client-side auth client - safe for browser use
// This creates only the client-side Better-Auth client without server dependencies

import { createAuthClient } from 'better-auth/client';

export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
});
