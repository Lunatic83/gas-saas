'use client';

import type { AnyAuthClient } from 'better-auth-ui';
import { AuthUIProvider as BetterAuthUIProvider } from 'better-auth-ui';

import { authClient } from '@/lib/auth-client';

interface AuthProviderWrapperProps {
  children: React.ReactNode;
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return (
    <BetterAuthUIProvider
      // Cast to AnyAuthClient to satisfy better-auth-ui's type requirements
      // The actual client is compatible but TypeScript sees a version mismatch
      authClient={authClient as unknown as AnyAuthClient}
      basePath="/auth"
      redirectTo="/dashboard"
      credentials={{
        forgotPassword: true,
        rememberMe: true,
      }}
    >
      {children}
    </BetterAuthUIProvider>
  );
}
