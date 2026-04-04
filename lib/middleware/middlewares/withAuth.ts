import type { MiddlewareFactory } from '../chain';

// STUB: E6 fills with Better-Auth session
export const withAuth: MiddlewareFactory = async (_request, next) => {
  return next();
};
