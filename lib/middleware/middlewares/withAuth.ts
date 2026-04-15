import type { NextRequest } from 'next/server';

import type { MiddlewareFactory } from '../chain';

// Protected route prefixes that require authentication
export const PROTECTED_PREFIXES = ['/dashboard', '/admin'];

// Auth pages that authenticated users should be redirected away from
export const AUTH_PAGES = ['/sign-in', '/login', '/sign-up', '/signup'];

export function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

export function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname.startsWith(page));
}

export function createRedirectUrl(
  request: NextRequest,
  redirectPath: string,
  callbackPath?: string,
): URL {
  const url = new URL(redirectPath, request.url);
  if (callbackPath) {
    url.searchParams.set('callbackUrl', callbackPath);
  }
  return url;
}

// STUB: E6 fills with Better-Auth session
export const withAuth: MiddlewareFactory = async (_request, next) => {
  return next();
};
