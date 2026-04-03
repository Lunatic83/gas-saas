import { describe, it, expect, vi } from 'vitest';

import { client } from '@/lib/redis/client';

// Mock Redis client
vi.mock('redis', () => ({
  createClient: vi.fn().mockReturnValue({
    ping: vi.fn().mockResolvedValue('PONG'),
    connect: vi.fn().mockResolvedValue(undefined),
  }),
}));

describe('Redis client', () => {
  it('should export a client object', () => {
    expect(client).toBeDefined();
    expect(typeof client.ping).toBe('function');
  });
});
