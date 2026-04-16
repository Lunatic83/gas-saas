// AuthUIProvider wraps the app with Better-Auth client context
// and provides session-aware navigation via onSessionChange

import type { AuthClient } from 'better-auth/client';
import { useRouter } from 'next/navigation';
import type { ComponentProps, ReactNode } from 'react';
import { createContext, useContext, useEffect } from 'react';

import type { AuthUIProviderProps } from './auth-ui-provider-types';

// Type for Link component - allows custom Link implementations
type LinkComponentProps = ComponentProps<'a'> & { href: string; children?: ReactNode };
type LinkComponent = (props: LinkComponentProps) => React.ReactElement | null;

// Context for AuthUIProvider
const AuthUIContext = createContext<{
  authClient: AuthClient<object>;
  LinkComponent?: LinkComponent;
} | null>(null);

/**
 * Access the AuthUI context from child components
 */
export function useAuthUI() {
  const context = useContext(AuthUIContext);
  if (!context) {
    throw new Error('useAuthUI must be used within AuthUIProvider');
  }
  return context;
}

/**
 * AuthUIProvider wraps the application with Better-Auth context.
 * It:
 * - Manages session state via Better-Auth's useSession atom
 * - Calls router.refresh() on session changes to update server components
 * - Provides authClient and LinkComponent to children via context
 * - Supports custom navigation and Link implementations
 */
export function AuthUIProvider({ authClient, onSessionChange, children }: AuthUIProviderProps) {
  const router = useRouter();

  // Use Better-Auth's useSession atom for reactive session state
  // useSession is a method on the auth client that returns an atom
  const sessionAtom = authClient.useSession();

  // Effect: call onSessionChange and refresh on session changes
  useEffect(() => {
    const session = sessionAtom.value;

    if (onSessionChange) {
      onSessionChange(session.data);
    }

    // Refresh server components on session change to update auth state
    router.refresh();
  }, [sessionAtom.value, onSessionChange, router]);

  return (
    <AuthUIContext.Provider value={{ authClient, LinkComponent: undefined }}>
      {children}
    </AuthUIContext.Provider>
  );
}

// Re-export types and authClient
export { authClient } from '@/lib/auth';
export type { AuthUIProviderProps } from './auth-ui-provider-types';
