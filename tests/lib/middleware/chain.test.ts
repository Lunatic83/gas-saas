import { describe, it, expect } from 'vitest';

import { reduceRight, type MiddlewareFactory } from '@/lib/middleware/chain';

// Helper to create a simple middleware that adds a header
function withHeader(name: string, value: string): MiddlewareFactory {
  return async (_request, next) => {
    const response = await next();
    response.headers.set(name, value);
    return response;
  };
}

// Helper to create a middleware that modifies response body
function withBodyPrefix(prefix: string): MiddlewareFactory {
  return async (_request, next) => {
    const response = await next();
    const originalBody = await response.text();
    return new Response(prefix + originalBody, {
      status: response.status,
      headers: response.headers,
    });
  };
}

// Helper to create a blocking middleware
function withBlock(status: number, body: string): MiddlewareFactory {
  return async () => {
    return new Response(body, { status });
  };
}

describe('reduceRight middleware chain', () => {
  describe('basic execution', () => {
    it('should execute single middleware and return its response', async () => {
      // Single middleware that produces response directly
      const chain: MiddlewareFactory[] = [withHeader('X-Middleware', '1')];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      expect(response.headers.get('X-Middleware')).toBe('1');
    });

    it('should execute multiple middlewares in chain', async () => {
      // Last middleware produces response
      const chain: MiddlewareFactory[] = [
        withHeader('X-Outer', '1'),
        async (_request, next) => {
          const response = await next();
          response.headers.set('X-Inner', '2');
          return response;
        },
      ];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      expect(response.headers.get('X-Outer')).toBe('1');
      expect(response.headers.get('X-Inner')).toBe('2');
    });

    it('should return 404 when chain is empty', async () => {
      const chain: MiddlewareFactory[] = [];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      expect(response.status).toBe(404);
      const body = await response.text();
      expect(body).toBe('Not Found');
    });
  });

  describe('execution order (reduceRight)', () => {
    it('should execute middlewares from right to left (outermost first)', async () => {
      const order: string[] = [];

      const chain: MiddlewareFactory[] = [
        async (_request, next) => {
          order.push('first-start');
          const response = await next();
          order.push('first-end');
          return response;
        },
        async (_request, next) => {
          order.push('second-start');
          const response = await next();
          order.push('second-end');
          return response;
        },
        async () => {
          order.push('terminal');
          return new Response('OK');
        },
      ];

      const request = new Request('http://localhost:3000/test');

      await reduceRight(chain, request as never);

      expect(order).toEqual(['first-start', 'second-start', 'terminal', 'second-end', 'first-end']);
    });

    it('should wrap response through chain', async () => {
      // Inner wraps the terminal response, outer wraps inner
      const chain: MiddlewareFactory[] = [
        withBodyPrefix('[outer]'), // runs first (outer)
        withBodyPrefix('[inner]'), // runs second (inner)
      ];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      const body = await response.text();
      // inner wraps 404: "[inner]Not Found"
      // outer wraps that: "[outer][inner]Not Found"
      expect(body).toBe('[outer][inner]Not Found');
    });
  });

  describe('response modification', () => {
    it('should allow middleware to modify response from next()', async () => {
      const chain: MiddlewareFactory[] = [
        async (_request, next) => {
          const response = await next();
          return new Response('modified', { status: response.status });
        },
      ];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      const body = await response.text();
      expect(body).toBe('modified');
    });

    it('should allow middleware to completely replace response', async () => {
      const chain: MiddlewareFactory[] = [withBlock(403, 'Forbidden')];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      expect(response.status).toBe(403);
      const body = await response.text();
      expect(body).toBe('Forbidden');
    });

    it('should allow early return without calling next', async () => {
      const chain: MiddlewareFactory[] = [
        async () => {
          return new Response('Early return', { status: 200 });
        },
        withHeader('X-Never-Set', '1'),
      ];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('Early return');
    });
  });

  describe('error handling', () => {
    it('should propagate errors from middleware', async () => {
      const chain: MiddlewareFactory[] = [
        async () => {
          throw new Error('Middleware error');
        },
      ];

      const request = new Request('http://localhost:3000/test');

      await expect(reduceRight(chain, request as never)).rejects.toThrow('Middleware error');
    });

    it('should propagate errors when calling next()', async () => {
      const chain: MiddlewareFactory[] = [
        async (_request, next) => {
          return next();
        },
        async () => {
          throw new Error('Inner error');
        },
      ];

      const request = new Request('http://localhost:3000/test');

      await expect(reduceRight(chain, request as never)).rejects.toThrow('Inner error');
    });
  });

  describe('request object', () => {
    it('should pass same request to all middlewares', async () => {
      const requests: Request[] = [];

      const chain: MiddlewareFactory[] = [
        async (request, next) => {
          requests.push(request as Request);
          return next();
        },
        async (request, next) => {
          requests.push(request as Request);
          return next();
        },
        async (request) => {
          requests.push(request as Request);
          return new Response('OK');
        },
      ];

      const request = new Request('http://localhost:3000/test');

      await reduceRight(chain, request as never);

      expect(requests.length).toBe(3);
      requests.forEach((r) => {
        expect(r.url).toBe('http://localhost:3000/test');
      });
    });
  });

  describe('async behavior', () => {
    it('should handle async middleware', async () => {
      const chain: MiddlewareFactory[] = [
        async (_request, next) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return next();
        },
        async (_request, next) => {
          await new Promise((resolve) => setTimeout(resolve, 10));
          return next();
        },
        async () => {
          return new Response('OK');
        },
      ];

      const request = new Request('http://localhost:3000/test');
      const start = Date.now();

      await reduceRight(chain, request as never);

      const duration = Date.now() - start;
      expect(duration).toBeGreaterThanOrEqual(20);
    });
  });

  describe('edge cases', () => {
    it('should maintain response headers through chain', async () => {
      const chain: MiddlewareFactory[] = [
        withHeader('X-1', 'a'),
        withHeader('X-2', 'b'),
        withHeader('X-3', 'c'),
      ];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      expect(response.headers.get('X-1')).toBe('a');
      expect(response.headers.get('X-2')).toBe('b');
      expect(response.headers.get('X-3')).toBe('c');
    });

    it('should handle single middleware that calls next', async () => {
      const chain: MiddlewareFactory[] = [
        async (_request, next) => {
          const response = await next();
          return response;
        },
      ];

      const request = new Request('http://localhost:3000/test');

      const response = await reduceRight(chain, request as never);

      // Single middleware calling next gets 404
      expect(response.status).toBe(404);
    });
  });

  describe('type safety', () => {
    it('should export MiddlewareFactory type', () => {
      const factory: MiddlewareFactory = async (_request, next) => {
        return next();
      };
      expect(typeof factory).toBe('function');
    });

    it('should accept MiddlewareFactory array in chain', () => {
      const chain: MiddlewareFactory[] = [];
      expect(Array.isArray(chain)).toBe(true);
    });
  });
});
