import { NextRequest } from 'next/server';
import { describe, it, expect, vi } from 'vitest';

import { isProtectedRoute, isAuthPage, createRedirectUrl } from '@/lib/middleware/middlewares/withAuth';

// Mock better-fetch
vi.mock('@better-fetch/fetch', () => ({
  betterFetch: vi.fn(),
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
      expect(isProtectedRoute('/users/123')).toBe(false);
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

    it('should create dashboard redirect', () => {
      const request = new NextRequest('http://localhost:3000/sign-in');
      const url = createRedirectUrl(request, '/dashboard');

      expect(url.toString()).toBe('http://localhost:3000/dashboard');
    });
  });
});