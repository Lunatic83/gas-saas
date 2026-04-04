import type { NextRequest } from 'next/server';

import type { MiddlewareFactory } from '../chain';

const ALLOWED_ORIGINS = (process.env.ALLOWED_ORIGINS ?? '')
  .split(',')
  .map((origin) => origin.trim())
  .filter(Boolean);

function getCorsHeaders(request: NextRequest): Record<string, string> {
  const origin = request.headers.get('origin');
  const isAllowedOrigin = origin && ALLOWED_ORIGINS.includes(origin);

  const headers: Record<string, string> = {
    'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };

  if (isAllowedOrigin) {
    headers['Access-Control-Allow-Origin'] = origin;
  }

  return headers;
}

export const withCors: MiddlewareFactory = async (request, next) => {
  if (request.method === 'OPTIONS') {
    const headers = getCorsHeaders(request);
    return new Response(null, { status: 204, headers });
  }

  const response = await next();
  const corsHeaders = getCorsHeaders(request);

  for (const [key, value] of Object.entries(corsHeaders)) {
    response.headers.set(key, value);
  }

  return response;
};
