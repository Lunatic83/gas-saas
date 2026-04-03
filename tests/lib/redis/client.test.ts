import { describe, it, expect, vi } from 'vitest';

import { clientPromise } from '@/lib/redis/client';

vi.mock('redis', () => ({
  createClient: vi.fn().mockReturnValue({
    ping: vi.fn().mockResolvedValue('PONG'),
    connect: vi.fn().mockResolvedValue(undefined),
    on: vi.fn(),
  }),
}));

describe('Redis client', () => {
  it('should export a client promise', async () => {
    expect(clientPromise).toBeInstanceOf(Promise);
    const client = await clientPromise;
    expect(client).toBeDefined();
    expect(typeof client.ping).toBe('function');
  });
});
