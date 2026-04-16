// Types for AuthUIProvider

import type { AuthClient } from 'better-auth/client';

/** Session data returned from getSession */
export type AuthSession = Awaited<ReturnType<AuthClient<object>['getSession']>>;

// Props for AuthUIProvider
export interface AuthUIProviderProps {
  /** The Better-Auth client instance */
  authClient: AuthClient<object>;
  /** Callback when session changes */
  onSessionChange?: (session: AuthSession) => void;
  /** Child components */
  children?: React.ReactNode;
}
