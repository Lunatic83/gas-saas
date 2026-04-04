import type { NextRequest } from 'next/server';

export type MiddlewareFactory = (
  request: NextRequest,
  next: () => Promise<Response>,
) => Promise<Response>;

export async function reduceRight(
  middlewares: MiddlewareFactory[],
  request: NextRequest,
): Promise<Response> {
  if (middlewares.length === 0) {
    return new Response('Not Found', { status: 404 });
  }

  const [middleware, ...rest] = middlewares;

  return middleware(request, async () => reduceRight(rest, request));
}
