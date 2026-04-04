import { describe, it, expect } from 'vitest';

import { keys } from '@/lib/redis/keys';

describe('Redis keys', () => {
  describe('rateLimit', () => {
    it('should return correct auth key format', () => {
      expect(keys.rateLimit.auth('user-123')).toBe('rate-limit:auth:user-123');
    });

    it('should return correct api key format', () => {
      expect(keys.rateLimit.api('user-123', '/api/users')).toBe(
        'rate-limit:api:user-123:/api/users',
      );
    });
  });

  describe('cache', () => {
    it('should return correct page cache key format', () => {
      expect(keys.cache.page('home')).toBe('cache:page:home');
    });

    it('should return correct flags cache key format', () => {
      expect(keys.cache.flags('dark-mode')).toBe('cache:flags:dark-mode');
    });
  });

  describe('session', () => {
    it('should return correct session key format', () => {
      expect(keys.session('sess-abc123')).toBe('session:sess-abc123');
    });
  });
});
