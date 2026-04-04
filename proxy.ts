import type { NextRequest } from 'next/server';

import { reduceRight, type MiddlewareFactory } from '@/lib/middleware/chain';
import { withAuth, withCors, withRateLimit } from '@/lib/middleware/middlewares';

const chain: MiddlewareFactory[] = [withCors, withRateLimit, withAuth];

export { chain };

export function proxy(request: NextRequest): Promise<Response> {
  return reduceRight(chain, request);
}

// Match all paths except static files
export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)'],
};
