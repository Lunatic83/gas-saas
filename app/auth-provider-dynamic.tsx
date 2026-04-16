'use client';

import dynamic from 'next/dynamic';

import { NavBar } from '@/components/nav-bar';

// Client wrapper for auth - dynamically imported to prevent SSR fetch issues
const AuthProviderInner = dynamic(
  () => import('@/components/auth/auth-provider-client').then((mod) => mod.AuthProviderWrapper),
  {
    ssr: false,
    loading: () => (
      <div className="min-h-screen">
        <NavBar />
        {null}
      </div>
    ),
  },
);

interface AuthProviderProps {
  children: React.ReactNode;
}

export function AuthProvider({ children }: AuthProviderProps) {
  return <AuthProviderInner>{children}</AuthProviderInner>;
}
