import { betterFetch } from '@better-fetch/fetch';
import { NextRequest, NextResponse } from 'next/server';

import { getAuth } from '@/lib/auth';

type Session = Awaited<ReturnType<ReturnType<typeof getAuth>['getSession']>>['session'];

// Protected route prefixes that require authentication
const PROTECTED_PREFIXES = ['/dashboard', '/admin'];

// Auth pages that authenticated users should be redirected away from
const AUTH_PAGES = ['/sign-in', '/login', '/sign-up', '/signup'];

function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_PREFIXES.some((prefix) => pathname.startsWith(prefix));
}

function isAuthPage(pathname: string): boolean {
  return AUTH_PAGES.some((page) => pathname.startsWith(page));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Fetch session using betterFetch (Edge Runtime compatible)
  const { data: sessionResponse } = await betterFetch<{ session: Session | null }>(
    '/api/auth/get-session',
    {
      baseURL: request.nextUrl.origin,
      headers: {
        cookie: request.headers.get('cookie') || '',
      },
    },
  );

  const session = sessionResponse?.session ?? null;

  // Case 1: Authenticated user accessing auth pages → redirect to dashboard
  if (session && isAuthPage(pathname)) {
    const dashboardUrl = new URL('/dashboard', request.url);
    return NextResponse.redirect(dashboardUrl);
  }

  // Case 2: Unauthenticated user accessing protected routes → redirect to sign-in
  if (!session && isProtectedRoute(pathname)) {
    const signInUrl = new URL('/sign-in', request.url);
    signInUrl.searchParams.set('callbackUrl', pathname);
    return NextResponse.redirect(signInUrl);
  }

  // Allow request to continue
  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - api routes (API endpoints)
     * - _next/static (static files)
     * - _next/image (image optimization)
     * - favicon.ico, robots.txt, etc.
     */
    '/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
};