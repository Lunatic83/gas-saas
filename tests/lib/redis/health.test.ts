import { describe, it, expect, vi, beforeEach } from 'vitest';

vi.mock('@/lib/redis/client', () => {
  const mockPing = vi.fn();
  return {
    clientPromise: Promise.resolve({
      ping: mockPing,
    }),
  };
});

import { ping } from '@/lib/redis/health';

describe('Redis health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return ok true when ping succeeds', async () => {
    // Access the mocked module to get the ping mock
    const { clientPromise } = await import('@/lib/redis/client');
    const client = await clientPromise;
    vi.mocked(client.ping).mockResolvedValue('PONG');

    const result = await ping();

    expect(result).toHaveProperty('ok', true);
    expect(result).toHaveProperty('latencyMs');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('should return ok false when ping fails', async () => {
    const { clientPromise } = await import('@/lib/redis/client');
    const client = await clientPromise;
    vi.mocked(client.ping).mockRejectedValue(new Error('Connection refused'));

    const result = await ping();

    expect(result).toHaveProperty('ok', false);
    expect(result).toHaveProperty('latencyMs');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('should return correct shape', async () => {
    const { clientPromise } = await import('@/lib/redis/client');
    const client = await clientPromise;
    vi.mocked(client.ping).mockResolvedValue('PONG');

    const result = await ping();

    expect(result).toEqual(
      expect.objectContaining({
        ok: expect.any(Boolean),
        latencyMs: expect.any(Number),
      }),
    );
  });
});
