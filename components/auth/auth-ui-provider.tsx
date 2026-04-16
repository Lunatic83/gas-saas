'use client';

// AuthUIProvider wraps the app with Better-Auth client context
// and provides session-aware navigation via onSessionChange

import type { AuthClient } from 'better-auth/client';
import { useRouter } from 'next/navigation';
import { createContext, useContext, useEffect } from 'react';

import type { AuthUIProviderProps } from './auth-ui-provider-types';

// Context for AuthUIProvider
const AuthUIContext = createContext<{
  authClient: AuthClient<object>;
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
 * - Provides authClient to children via context
 * - Supports custom onSessionChange callback
 */
export function AuthUIProvider({ authClient, onSessionChange, children }: AuthUIProviderProps) {
  const router = useRouter();

  // Better-Auth's useSession is an atom property on the auth client
  // The atom has a .value property with the session data
  const sessionAtom = authClient.useSession;

  // Effect: call onSessionChange and refresh on session changes
  useEffect(() => {
    const session = sessionAtom.value;
    const sessionData = session?.data ?? null;

    if (onSessionChange) {
      onSessionChange(sessionData);
    }

    // Refresh server components on session change to update auth state
    router.refresh();
  }, [sessionAtom.value, onSessionChange, router]);

  return <AuthUIContext.Provider value={{ authClient }}>{children}</AuthUIContext.Provider>;
}

// Re-export types for convenience
export type { AuthUIProviderProps } from './auth-ui-provider-types';
