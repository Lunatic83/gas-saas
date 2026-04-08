import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';

export type MiddlewareFactory = (
  request: NextRequest,
  next: () => Promise<Response>,
) => Promise<Response>;

export async function reduceRight(
  middlewares: MiddlewareFactory[],
  request: NextRequest,
  routeHandler: () => Response | Promise<Response> = () => NextResponse.next(),
): Promise<Response> {
  if (middlewares.length === 0) {
    return routeHandler();
  }

  const [middleware, ...rest] = middlewares;

  return middleware(request, async () => reduceRight(rest, request, routeHandler));
}
