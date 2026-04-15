// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { betterFetch } from '@better-fetch/fetch';
import { NextRequest, NextResponse } from 'next/server';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  isAuthPage,
  isProtectedRoute,
  createRedirectUrl,
} from '@/lib/middleware/middlewares/withAuth';
import { withBetterAuth } from '@/proxy';

const betterFetchMock = vi.hoisted(() => vi.fn());

vi.mock('@better-fetch/fetch', () => ({
  betterFetch: betterFetchMock,
}));

describe('Auth middleware helpers', () => {
  describe('isProtectedRoute', () => {
    it('should return true for /dashboard routes', () => {
      expect(isProtectedRoute('/dashboard')).toBe(true);
      expect(isProtectedRoute('/dashboard/settings')).toBe(true);
      expect(isProtectedRoute('/dashboard/nested/deep/path')).toBe(true);
    });

    it('should return true for /admin routes', () => {
      expect(isProtectedRoute('/admin')).toBe(true);
      expect(isProtectedRoute('/admin/users')).toBe(true);
    });

    it('should return false for public routes', () => {
      expect(isProtectedRoute('/')).toBe(false);
      expect(isProtectedRoute('/marketing')).toBe(false);
      expect(isProtectedRoute('/sign-in')).toBe(false);
      expect(isProtectedRoute('/api/health')).toBe(false);
    });

    it('should return false for unrelated routes', () => {
      expect(isProtectedRoute('/about')).toBe(false);
      expect(isProtectedRoute('/blog')).toBe(false);
    });
  });

  describe('isAuthPage', () => {
    it('should return true for auth pages', () => {
      expect(isAuthPage('/sign-in')).toBe(true);
      expect(isAuthPage('/login')).toBe(true);
      expect(isAuthPage('/sign-up')).toBe(true);
      expect(isAuthPage('/signup')).toBe(true);
    });

    it('should return false for non-auth pages', () => {
      expect(isAuthPage('/dashboard')).toBe(false);
      expect(isAuthPage('/admin')).toBe(false);
      expect(isAuthPage('/')).toBe(false);
    });
  });

  describe('createRedirectUrl', () => {
    it('should create sign-in redirect with callbackUrl', () => {
      const request = new NextRequest('http://localhost:3000/dashboard');
      const url = createRedirectUrl(request, '/sign-in', '/dashboard');

      expect(url.toString()).toContain('/sign-in');
      expect(url.toString()).toContain('callbackUrl=%2Fdashboard');
    });

    it('should create dashboard redirect without callbackUrl', () => {
      const request = new NextRequest('http://localhost:3000/sign-in');
      const url = createRedirectUrl(request, '/dashboard');

      expect(url.toString()).toBe('http://localhost:3000/dashboard');
    });
  });
});

describe('Auth middleware behavior', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    betterFetchMock.mockReset();
    vi.stubEnv('NODE_ENV', 'production');
    vi.stubEnv('E2E_TEST_MODE', 'false');
  });

  afterEach(() => {
    vi.restoreAllMocks();
    vi.unstubAllEnvs();
  });

  const next = () => Promise.resolve(NextResponse.next());

  describe('E2E test bypass', () => {
    it('should skip auth when E2E_TEST_MODE=true', async () => {
      vi.stubEnv('E2E_TEST_MODE', 'true');

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await withBetterAuth(request, next);

      expect(response).toBeInstanceOf(Response);
      expect((response as NextResponse).status).toBe(200);
    });

    it('should skip auth in NODE_ENV=test', async () => {
      vi.stubEnv('NODE_ENV', 'test');

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await withBetterAuth(request, next);

      expect(response).toBeInstanceOf(Response);
      expect((response as NextResponse).status).toBe(200);
    });
  });

  describe('redirect behavior', () => {
    it('should redirect unauthenticated user from protected route to sign-in', async () => {
      betterFetchMock.mockResolvedValueOnce({
        data: { session: null },
      });

      const request = new NextRequest('http://localhost:3000/dashboard/settings');
      const response = await withBetterAuth(request, next);

      expect((response as NextResponse).status).toBe(307);
      const location = (response as NextResponse).headers.get('location');
      expect(location).toContain('/sign-in');
      expect(location).toContain('callbackUrl=%2Fdashboard%2Fsettings');
    });

    it('should redirect authenticated user from auth page to dashboard', async () => {
      betterFetchMock.mockResolvedValueOnce({
        data: { session: { userId: 'user-123' } },
      });

      const request = new NextRequest('http://localhost:3000/sign-in');
      const response = await withBetterAuth(request, next);

      expect((response as NextResponse).status).toBe(307);
      expect((response as NextResponse).headers.get('location')).toContain('/dashboard');
    });

    it('should allow authenticated user to access protected route', async () => {
      betterFetchMock.mockResolvedValueOnce({
        data: { session: { userId: 'user-123' } },
      });

      const request = new NextRequest('http://localhost:3000/dashboard');
      const response = await withBetterAuth(request, next);

      expect((response as NextResponse).status).toBe(200);
    });

    it('should allow unauthenticated user to access public route', async () => {
      betterFetchMock.mockResolvedValueOnce({
        data: { session: null },
      });

      const request = new NextRequest('http://localhost:3000/marketing');
      const response = await withBetterAuth(request, next);

      expect((response as NextResponse).status).toBe(200);
    });
  });
});
