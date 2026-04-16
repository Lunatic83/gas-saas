// Types for AuthUIProvider

import type { AuthClient } from 'better-auth/client';

/** Session data returned from getSession */
export type AuthSession = Awaited<ReturnType<AuthClient<object>['getSession']>>;

// Props for AuthUIProvider
export interface AuthUIProviderProps {
  /** The Better-Auth client instance */
  authClient: AuthClient<object>;
  /** Navigation function for route changes */
  navigate?: (path: string) => void;
  /** Replace current history entry instead of push */
  replace?: (path: string) => void;
  /** Custom Link component (e.g., Next.js Link) */
  LinkComponent?: LinkComponent;
  /** Callback when session changes */
  onSessionChange?: (session: AuthSession) => void;
  /** Child components */
  children?: React.ReactNode;
}

// Type for Link component - allows custom Link implementations
type LinkComponentProps = React.ComponentProps<'a'> & { href: string; children?: React.ReactNode };
export type LinkComponent = (props: LinkComponentProps) => React.ReactElement | null;
