const NAMESPACE = 'gas';

const rateLimit = {
  auth: (identifier: string) => `rate-limit:auth:${identifier}`,
  api: (identifier: string, endpoint: string) => `rate-limit:api:${identifier}:${endpoint}`,
} as const;

const cache = {
  page: (slug: string) => `cache:page:${slug}`,
  flags: (key: string) => `cache:flags:${key}`,
} as const;

const session = (sessionId: string) => `session:${sessionId}`;

export const keys = {
  rateLimit,
  cache,
  session,
  NAMESPACE,
} as const;

export type Keys = typeof keys;
