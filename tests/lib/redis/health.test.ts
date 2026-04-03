import { describe, it, expect, vi, beforeEach } from 'vitest';

import { client } from '@/lib/redis/client';
import { ping } from '@/lib/redis/health';

// Mock the redis client
vi.mock('@/lib/redis/client', () => ({
  client: {
    ping: vi.fn(),
  },
}));

describe('Redis health', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return ok true when ping succeeds', async () => {
    vi.mocked(client.ping).mockResolvedValue('PONG');

    const result = await ping();

    expect(result).toHaveProperty('ok', true);
    expect(result).toHaveProperty('latencyMs');
    expect(typeof result.latencyMs).toBe('number');
    expect(result.latencyMs).toBeGreaterThanOrEqual(0);
  });

  it('should return ok false when ping fails', async () => {
    vi.mocked(client.ping).mockRejectedValue(new Error('Connection refused'));

    const result = await ping();

    expect(result).toHaveProperty('ok', false);
    expect(result).toHaveProperty('latencyMs');
    expect(typeof result.latencyMs).toBe('number');
  });

  it('should return correct shape', async () => {
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
