import { betterFetch } from '@better-fetch/fetch';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

import { reduceRight, type MiddlewareFactory } from '@/lib/middleware/chain';
import { withCors, withRateLimit } from '@/lib/middleware/middlewares';
import {
  isAuthPage,
  isProtectedRoute,
  createRedirectUrl,
} from '@/lib/middleware/middlewares/withAuth';

// Auth check middleware factory using Better-Auth session
const withBetterAuth: MiddlewareFactory = async (request, next) => {
  const { pathname } = request.nextUrl;

  // Fetch session using betterFetch (Edge Runtime compatible)
  const { data: sessionResponse } = await betterFetch<{ session: unknown | null }>(
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
    return NextResponse.redirect(createRedirectUrl(request, '/dashboard'));
  }

  // Case 2: Unauthenticated user accessing protected routes → redirect to sign-in
  if (!session && isProtectedRoute(pathname)) {
    const signInUrl = createRedirectUrl(request, '/sign-in', pathname);
    return NextResponse.redirect(signInUrl);
  }

  return next();
};

const chain: MiddlewareFactory[] = [withCors, withRateLimit, withBetterAuth];

export { chain };

export function proxy(request: NextRequest): Promise<Response> {
  return reduceRight(chain, request);
}

// Match all paths except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
