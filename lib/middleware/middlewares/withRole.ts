import type { MiddlewareFactory } from '../chain';

// STUB: E8 fills with RBAC guard
export const withRole: MiddlewareFactory = async (_request, next) => {
  return next();
};
