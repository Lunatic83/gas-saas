'use client';

// Client wrapper for AuthUIProvider - this is the entry point for auth context

import { AuthUIProvider as BaseAuthUIProvider } from './auth-ui-provider';
import type { AuthUIProviderProps } from './auth-ui-provider-types';

export function AuthUIProvider(props: AuthUIProviderProps) {
  return <BaseAuthUIProvider {...props} />;
}

export { useAuthUI } from './auth-ui-provider';
export type { AuthUIProviderProps } from './auth-ui-provider-types';
