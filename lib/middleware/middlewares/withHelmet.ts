import type { MiddlewareFactory } from '../chain';

// STUB: Security headers
export const withHelmet: MiddlewareFactory = async (_request, next) => {
  return next();
};
