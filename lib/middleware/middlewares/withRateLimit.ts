import type { NextRequest } from 'next/server';

import { clientPromise, keys } from '@/lib/redis';

import type { MiddlewareFactory } from '../chain';

const RATE_LIMIT_WINDOW_MS = 60_000; // 1 minute
const RATE_LIMIT_MAX_REQUESTS = 100;

function getClientIp(request: NextRequest): string {
  const forwardedFor = request.headers.get('x-forwarded-for');
  if (forwardedFor) {
    return forwardedFor.split(',')[0].trim();
  }
  return request.headers.get('x-real-ip') ?? '127.0.0.1';
}

export const withRateLimit: MiddlewareFactory = async (request, next) => {
  const ip = getClientIp(request);
  const key = keys.rateLimit.auth(ip);

  const client = await clientPromise;
  const now = Date.now();
  const windowStart = now - RATE_LIMIT_WINDOW_MS;

  // Use Redis MULTI for atomic operations
  const multi = client.multi();
  multi.zRemRangeByScore(key, '0', windowStart.toString());
  multi.zAdd(key, { score: now, value: `${now}` });
  multi.zCard(key);
  multi.expire(key, Math.ceil(RATE_LIMIT_WINDOW_MS / 1000));

  const results = await multi.exec();
  const requestCount = Number(results?.[2] ?? 0);

  const headers: Record<string, string> = {
    'X-RateLimit-Limit': String(RATE_LIMIT_MAX_REQUESTS),
    'X-RateLimit-Remaining': String(Math.max(0, RATE_LIMIT_MAX_REQUESTS - requestCount)),
    'X-RateLimit-Reset': String(Math.ceil((now + RATE_LIMIT_WINDOW_MS) / 1000)),
  };

  if (requestCount > RATE_LIMIT_MAX_REQUESTS) {
    const retryAfter = Math.ceil(RATE_LIMIT_WINDOW_MS / 1000);
    return new Response(JSON.stringify({ error: 'Too Many Requests', retryAfter }), {
      status: 429,
      headers: {
        ...headers,
        'Retry-After': String(retryAfter),
        'Content-Type': 'application/json',
      },
    });
  }

  const response = await next();
  for (const [k, value] of Object.entries(headers)) {
    response.headers.set(k, value);
  }

  return response;
};
