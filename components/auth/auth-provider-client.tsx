'use client';

import { authClient } from '@/lib/auth-client';

import { AuthUIProvider } from './auth-ui-provider';

interface AuthProviderWrapperProps {
  children: React.ReactNode;
}

export function AuthProviderWrapper({ children }: AuthProviderWrapperProps) {
  return <AuthUIProvider authClient={authClient}>{children}</AuthUIProvider>;
}
