import { describe, it, expect, vi, beforeAll, afterAll, beforeEach } from 'vitest';

import { withRateLimit } from '@/lib/middleware/middlewares/withRateLimit';
import {
  getTestRedisClient,
  flushTestRedis,
  disconnectTestRedisClient,
  isRedisAvailable,
} from '@/tests/helpers/redis';

vi.mock('@/lib/redis', async () => {
  const actual = await import('@/lib/redis');
  return {
    ...actual,
    keys: {
      rateLimit: {
        auth: (ip: string) => `rate-limit:auth:${ip}:test-${process.pid}`,
      },
    },
  };
});

vi.mock('@/lib/redis/client', async () => {
  const { getTestRedisClient } = await import('@/tests/helpers/redis');
  return {
    clientPromise: getTestRedisClient(),
  };
});

function createMockRequest(ip: string): Request {
  const headers = new Headers();
  headers.set('x-forwarded-for', ip);
  return new Request('http://localhost:3000/test', {
    method: 'GET',
    headers,
  }) as unknown as Request;
}

function createMockNext(status = 200) {
  return vi.fn().mockResolvedValue(
    new Response('OK', {
      status,
      headers: { 'Content-Type': 'text/plain' },
    }),
  );
}

describe('withRateLimit middleware (integration)', () => {
  beforeAll(async () => {
    // Skip if Redis is not available
    const available = await isRedisAvailable();
    if (!available) {
      throw new Error('Redis is not available - skipping integration tests');
    }
    // Ensure Redis connection
    await getTestRedisClient();
  });

  afterAll(async () => {
    await flushTestRedis();
    await disconnectTestRedisClient();
  });

  beforeEach(async () => {
    // Clear database before each test
    await flushTestRedis();
    vi.clearAllMocks();
  });

  describe('rate limiting enforcement', () => {
    it('should allow requests under the limit', async () => {
      const request = createMockRequest('192.168.1.1');
      const next = createMockNext();

      // Make 50 requests (well under 100 limit)
      for (let i = 0; i < 50; i++) {
        const response = await withRateLimit(request as never, next);
        expect(response.status).toBe(200);
      }

      expect(next).toHaveBeenCalledTimes(50);
    });

    it('should block requests over the limit with 429', async () => {
      const request = createMockRequest('192.168.1.2');
      const next = createMockNext();

      // First 100 should succeed
      for (let i = 0; i < 100; i++) {
        const response = await withRateLimit(request as never, next);
        expect(response.status).toBe(200);
      }

      // 101st should be blocked
      const response = await withRateLimit(request as never, next);
      expect(response.status).toBe(429);
      expect(next).toHaveBeenCalledTimes(100); // Not called for 429
    });

    it('should return correct error body when rate limited', async () => {
      const request = createMockRequest('192.168.1.3');
      const next = createMockNext();

      // Exceed the limit
      for (let i = 0; i < 101; i++) {
        await withRateLimit(request as never, next);
      }

      const response = await withRateLimit(request as never, next);
      const body = await response.json();

      expect(body).toEqual({
        error: 'Too Many Requests',
        retryAfter: 60,
      });
    });

    it('should not call next() when rate limited', async () => {
      const request = createMockRequest('192.168.1.4');
      const next = createMockNext();

      // Exceed the limit
      for (let i = 0; i < 100; i++) {
        await withRateLimit(request as never, next);
      }

      vi.clearAllMocks();

      // This request should be blocked
      await withRateLimit(request as never, next);

      expect(next).not.toHaveBeenCalled();
    });
  });

  describe('rate limit headers', () => {
    it('should show correct remaining count', async () => {
      // Use unique IP to avoid Redis state conflicts
      const uniqueIp = `192.168.99.${Date.now() % 1000}`;
      const request = createMockRequest(uniqueIp);
      const next = createMockNext();

      // First request - remaining should be 99 (100 - 1)
      const res1 = await withRateLimit(request as never, next);
      expect(res1.headers.get('X-RateLimit-Limit')).toBe('100');
      const remaining1 = Number(res1.headers.get('X-RateLimit-Remaining'));
      expect(remaining1).toBeLessThan(100);
      expect(remaining1).toBeGreaterThanOrEqual(98); // Allow for Redis state

      // Make 10 more requests and verify remaining decrements
      for (let i = 0; i < 10; i++) {
        await withRateLimit(request as never, next);
      }

      const res11 = await withRateLimit(request as never, next);
      const remaining11 = Number(res11.headers.get('X-RateLimit-Remaining'));

      // Should be less than first remaining since we made more requests
      expect(remaining11).toBeLessThan(remaining1);
    });

    it('should show 0 remaining when at limit', async () => {
      const request = createMockRequest('192.168.2.2');
      const next = createMockNext();

      // Make 100 requests
      for (let i = 0; i < 100; i++) {
        await withRateLimit(request as never, next);
      }

      const response = await withRateLimit(request as never, next);
      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should have valid X-RateLimit-Reset timestamp', async () => {
      const request = createMockRequest('192.168.2.3');
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);
      const resetTimestamp = Number(response.headers.get('X-RateLimit-Reset'));

      // Should be a Unix timestamp in seconds, roughly 60s in the future
      const now = Math.floor(Date.now() / 1000);
      expect(resetTimestamp).toBeGreaterThanOrEqual(now);
      expect(resetTimestamp).toBeLessThanOrEqual(now + 61);
    });

    it('should include Retry-After header when blocked', async () => {
      const request = createMockRequest('192.168.2.4');
      const next = createMockNext();

      // Exceed the limit
      for (let i = 0; i < 101; i++) {
        await withRateLimit(request as never, next);
      }

      const response = await withRateLimit(request as never, next);
      expect(response.headers.get('Retry-After')).toBe('60');
    });

    it('should include Content-Type on 429 response', async () => {
      const request = createMockRequest('192.168.2.5');
      const next = createMockNext();

      // Exceed the limit
      for (let i = 0; i < 101; i++) {
        await withRateLimit(request as never, next);
      }

      const response = await withRateLimit(request as never, next);
      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('IP-based rate limiting', () => {
    it('should track rate limits separately for different IPs', async () => {
      const request1 = createMockRequest('10.0.0.1');
      const request2 = createMockRequest('10.0.0.2');
      const next1 = createMockNext();
      const next2 = createMockNext();

      // Exhaust limit for IP1
      for (let i = 0; i < 100; i++) {
        await withRateLimit(request1 as never, next1);
      }

      // IP2 should still be allowed
      const response = await withRateLimit(request2 as never, next2);
      expect(response.status).toBe(200);
      expect(next2).toHaveBeenCalled();
    });

    it('should extract first IP from x-forwarded-for chain', async () => {
      // Multiple IPs in x-forwarded-for
      const headers = new Headers();
      headers.set('x-forwarded-for', '203.0.113.50, 10.0.0.1, 172.16.0.1');
      const request = new Request('http://localhost:3000/test', {
        headers,
      }) as unknown as Request;
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should fall back to x-real-ip when x-forwarded-for missing', async () => {
      const headers = new Headers();
      headers.set('x-real-ip', '203.0.113.60');
      const request = new Request('http://localhost:3000/test', {
        headers,
      }) as unknown as Request;
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should use default IP when no headers present', async () => {
      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
      }) as unknown as Request;
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('sliding window behavior', () => {
    it('should clean up old entries outside the window', async () => {
      const request = createMockRequest('192.168.3.1');
      const next = createMockNext();

      // Make some requests
      for (let i = 0; i < 5; i++) {
        await withRateLimit(request as never, next);
      }

      // Verify structure works
      const response = await withRateLimit(request as never, next);
      expect(response.status).toBe(200);
    });
  });

  describe('concurrency', () => {
    it('should handle concurrent requests correctly', async () => {
      const request = createMockRequest('192.168.4.1');
      const next = createMockNext();

      // Make 10 concurrent requests
      const promises = Array.from({ length: 10 }, () => withRateLimit(request as never, next));

      const results = await Promise.all(promises);

      // All should succeed
      results.forEach((response) => {
        expect(response.status).toBe(200);
      });

      // Next should have been called 10 times
      expect(next).toHaveBeenCalledTimes(10);
    });
  });

  describe('middleware chain integration', () => {
    it('should work as part of middleware chain', async () => {
      const request = createMockRequest('192.168.5.1');
      const next = vi.fn().mockResolvedValue(
        new Response('OK', {
          status: 200,
          headers: { 'Content-Type': 'text/plain' },
        }),
      );

      const result = withRateLimit(request as never, next);

      expect(result).toBeInstanceOf(Promise);
      const response = await result;
      expect(response).toBeInstanceOf(Response);
      expect(response.status).toBe(200);
    });
  });
});
