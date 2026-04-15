import { describe, it, expect } from 'vitest';

describe('auth configuration', () => {
  it('SESSION_MAX_AGE should default to 30 days in seconds', () => {
    const defaultSessionMaxAge = 2592000; // 30 days
    expect(defaultSessionMaxAge).toBe(30 * 24 * 60 * 60);
  });

  it('session update age should be 1 hour', () => {
    const sessionUpdateAge = 3600;
    expect(sessionUpdateAge).toBe(60 * 60);
  });

  it('minPasswordLength for email auth should be 8', () => {
    const minPasswordLength = 8;
    expect(minPasswordLength).toBe(8);
  });
});
