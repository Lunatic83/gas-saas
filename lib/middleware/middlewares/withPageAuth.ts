import type { MiddlewareFactory } from '../chain';

// STUB: E6 fills with protected page redirect
export const withPageAuth: MiddlewareFactory = async (_request, next) => {
  return next();
};
