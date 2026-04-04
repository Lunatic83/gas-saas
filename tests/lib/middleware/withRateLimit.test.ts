import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Use vi.hoisted to ensure mocks are available when vi.mock runs
const { mockMulti, mockClient, mockKeys } = vi.hoisted(() => {
  const mockMulti = {
    zRemRangeByScore: vi.fn().mockReturnThis(),
    zAdd: vi.fn().mockReturnThis(),
    zCard: vi.fn().mockReturnThis(),
    expire: vi.fn().mockReturnThis(),
    exec: vi.fn(),
  };

  const mockClient = {
    multi: vi.fn().mockReturnValue(mockMulti),
    on: vi.fn(),
  };

  const mockKeys = {
    rateLimit: {
      auth: vi.fn().mockImplementation((ip: string) => `rate-limit:auth:${ip}`),
    },
  };

  return { mockMulti, mockClient, mockKeys };
});

vi.mock('@/lib/redis', () => ({
  clientPromise: Promise.resolve(mockClient),
  keys: mockKeys,
}));

// Import the module after mocking
import { withRateLimit } from '@/lib/middleware/middlewares/withRateLimit';

function createMockRequest(
  init: {
    ip?: string;
    headers?: Record<string, string>;
  } = {},
): Request {
  const headers = new Headers(init.headers ?? {});
  if (init.ip) {
    headers.set('x-forwarded-for', init.ip);
  }
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

describe('withRateLimit middleware', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.useRealTimers();
  });

  describe('IP extraction', () => {
    it('should extract IP from x-forwarded-for header', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);
      mockKeys.rateLimit.auth.mockReturnValue('rate-limit:auth:203.0.113.195');

      const request = createMockRequest({ ip: '203.0.113.195' });
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockKeys.rateLimit.auth).toHaveBeenCalledWith('203.0.113.195');
    });

    it('should use first IP from x-forwarded-for when multiple IPs present', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);
      mockKeys.rateLimit.auth.mockReturnValue('rate-limit:auth:203.0.113.50');

      const request = createMockRequest({ ip: '203.0.113.50, 10.0.0.1, 172.16.0.1' });
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockKeys.rateLimit.auth).toHaveBeenCalledWith('203.0.113.50');
    });

    it('should fall back to 127.0.0.1 when no IP headers present', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);
      mockKeys.rateLimit.auth.mockReturnValue('rate-limit:auth:127.0.0.1');

      const request = createMockRequest({});
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockKeys.rateLimit.auth).toHaveBeenCalledWith('127.0.0.1');
    });

    it('should trim whitespace from x-forwarded-for IP', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);
      mockKeys.rateLimit.auth.mockReturnValue('rate-limit:auth:203.0.113.195');

      const headers = new Headers();
      headers.set('x-forwarded-for', '  203.0.113.195  ,  10.0.0.1  ');
      const request = new Request('http://localhost:3000/test', {
        headers,
      }) as unknown as Request;
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockKeys.rateLimit.auth).toHaveBeenCalledWith('203.0.113.195');
    });
  });

  describe('Redis operations', () => {
    it('should call multi() on the Redis client', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockClient.multi).toHaveBeenCalledTimes(1);
    });

    it('should call zRemRangeByScore with correct window start', async () => {
      const now = Date.now();
      vi.setSystemTime(now);
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      await withRateLimit(request as never, next);

      const windowStart = now - 60_000;
      expect(mockMulti.zRemRangeByScore).toHaveBeenCalledWith(
        expect.any(String),
        '0',
        windowStart.toString(),
      );
    });

    it('should call zAdd with current timestamp', async () => {
      const now = Date.now();
      vi.setSystemTime(now);
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockMulti.zAdd).toHaveBeenCalledWith(expect.any(String), {
        score: now,
        value: expect.stringMatching(/^\d+$/),
      });
    });

    it('should call zCard to get request count', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 5, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockMulti.zCard).toHaveBeenCalledTimes(1);
    });

    it('should set key expiration', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockMulti.expire).toHaveBeenCalledWith(expect.any(String), Math.ceil(60_000 / 1000));
    });

    it('should execute all commands atomically', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      await withRateLimit(request as never, next);

      expect(mockMulti.exec).toHaveBeenCalledTimes(1);
    });
  });

  describe('rate limiting', () => {
    it('should allow request when under rate limit', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 50, 1]); // 50 requests

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should block request with 429 when rate limit exceeded', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 101, 1]); // 101 requests (over 100)

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.status).toBe(429);
      expect(next).not.toHaveBeenCalled();
    });

    it('should allow request when exactly at rate limit', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 100, 1]); // exactly 100

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should return error JSON body when rate limited', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 101, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      const body = await response.json();
      expect(body).toEqual({
        error: 'Too Many Requests',
        retryAfter: 60,
      });
    });

    it('should set Content-Type header on 429 response', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 101, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.headers.get('Content-Type')).toBe('application/json');
    });
  });

  describe('rate limit headers', () => {
    it('should attach X-RateLimit-Limit header', async () => {
      const now = Date.now();
      vi.setSystemTime(now);
      mockMulti.exec.mockResolvedValue([0, 0, 50, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.headers.get('X-RateLimit-Limit')).toBe('100');
    });

    it('should attach X-RateLimit-Remaining header with correct count', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 30, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.headers.get('X-RateLimit-Remaining')).toBe('70');
    });

    it('should set X-RateLimit-Remaining to 0 when limit exceeded', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 101, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should never show negative X-RateLimit-Remaining', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 150, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.headers.get('X-RateLimit-Remaining')).toBe('0');
    });

    it('should attach X-RateLimit-Reset header', async () => {
      const now = Date.now();
      vi.setSystemTime(now);
      mockMulti.exec.mockResolvedValue([0, 0, 50, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      const expectedReset = Math.ceil((now + 60_000) / 1000);
      expect(response.headers.get('X-RateLimit-Reset')).toBe(String(expectedReset));
    });

    it('should include Retry-After header when rate limited', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 101, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.headers.get('Retry-After')).toBe('60');
    });

    it('should attach rate limit headers to successful response', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, 50, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.headers.has('X-RateLimit-Limit')).toBe(true);
      expect(response.headers.has('X-RateLimit-Remaining')).toBe(true);
      expect(response.headers.has('X-RateLimit-Reset')).toBe(true);
    });
  });

  describe('error handling', () => {
    it('should handle null results from exec gracefully', async () => {
      mockMulti.exec.mockResolvedValue(null);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      // Should allow request through with 0 count
      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle undefined results from exec gracefully', async () => {
      mockMulti.exec.mockResolvedValue(undefined);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle non-array results from exec gracefully', async () => {
      mockMulti.exec.mockResolvedValue('unexpected' as never);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalled();
    });

    it('should handle missing zCard result gracefully', async () => {
      mockMulti.exec.mockResolvedValue([0, 0, null, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const response = await withRateLimit(request as never, next);

      // Should treat as 0 requests
      expect(response.status).toBe(200);
      expect(next).toHaveBeenCalled();
    });
  });

  describe('middleware factory signature', () => {
    it('should be a function', () => {
      expect(typeof withRateLimit).toBe('function');
    });

    it('should return a Promise', () => {
      mockMulti.exec.mockResolvedValue([0, 0, 1, 1]);

      const request = createMockRequest({});
      const next = createMockNext();

      const result = withRateLimit(request as never, next);

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
