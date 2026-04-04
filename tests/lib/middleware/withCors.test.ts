import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

function createMockNext(status = 200) {
  return vi.fn().mockResolvedValue(
    new Response('OK', {
      status,
      headers: { 'Content-Type': 'text/plain' },
    }),
  );
}

describe('withCors middleware', () => {
  // Store original env
  const originalEnv = process.env;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    process.env = originalEnv;
    vi.restoreAllMocks();
  });

  describe('OPTIONS preflight requests', () => {
    it('should return 204 status for OPTIONS preflight', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.status).toBe(204);
    });

    it('should include Allow-Methods header in preflight response', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS',
      );
    });

    it('should include Allow-Headers header in preflight response', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization',
      );
    });

    it('should not call next() for OPTIONS preflight', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      await withCors(request as never, next);

      expect(next).not.toHaveBeenCalled();
    });

    it('should include Access-Control-Allow-Origin for allowed origin', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    });

    it('should not include Access-Control-Allow-Origin for disallowed origin', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { origin: 'http://evil.com' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
    });

    it('should not include Access-Control-Allow-Origin when origin header is missing', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: {},
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
    });

    it('should return null body for preflight', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'OPTIONS',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.body).toBeNull();
    });
  });

  describe('non-OPTIONS requests', () => {
    it('should call next() for non-OPTIONS requests', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      await withCors(request as never, next);

      expect(next).toHaveBeenCalledTimes(1);
    });

    it('should attach CORS headers to response for allowed origin', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS',
      );
      expect(response.headers.get('Access-Control-Allow-Headers')).toBe(
        'Content-Type, Authorization',
      );
    });

    it('should not attach Access-Control-Allow-Origin for disallowed origin', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://evil.com' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe(
        'GET, POST, PUT, DELETE, OPTIONS',
      );
    });

    it('should preserve response status from next()', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.status).toBe(200);
    });

    it('should preserve response body from next()', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);
      const body = await response.text();

      expect(body).toBe('OK');
    });
  });

  describe('origin parsing', () => {
    it('should handle multiple origins with spaces', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000, http://localhost:3001';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://localhost:3001' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    });

    it('should handle origins without spaces after comma', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000,http://localhost:3001';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://localhost:3001' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3001');
    });

    it('should handle empty ALLOWED_ORIGINS', async () => {
      process.env.ALLOWED_ORIGINS = '';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
    });

    it('should handle origins with ports', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'http://localhost:3000' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('http://localhost:3000');
    });

    it('should handle https origins', async () => {
      process.env.ALLOWED_ORIGINS = 'https://api.example.com';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'https://api.example.com' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://api.example.com');
    });

    it('should handle subdomain origins', async () => {
      process.env.ALLOWED_ORIGINS = 'https://app.example.com';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'https://app.example.com' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://app.example.com');
    });

    it('should not match subdomain as allowed if not exact match', async () => {
      process.env.ALLOWED_ORIGINS = 'https://example.com';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
        headers: { origin: 'https://app.example.com' },
      });
      const next = createMockNext();

      const response = await withCors(request as never, next);

      expect(response.headers.has('Access-Control-Allow-Origin')).toBe(false);
    });
  });

  describe('middleware factory signature', () => {
    it('should be a function', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      expect(typeof withCors).toBe('function');
    });

    it('should return a Promise', async () => {
      process.env.ALLOWED_ORIGINS = 'http://localhost:3000';

      const { withCors } = await import('@/lib/middleware/middlewares/withCors');

      const request = new Request('http://localhost:3000/test', {
        method: 'GET',
      });
      const next = createMockNext();

      const result = withCors(request as never, next);

      expect(result).toBeInstanceOf(Promise);
    });
  });
});
