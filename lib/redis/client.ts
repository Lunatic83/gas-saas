import { createClient, type RedisClientType } from 'redis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

declare global {
  var __redis: RedisClientType | undefined;
}

let client: RedisClientType;

if (process.env.NODE_ENV === 'test') {
  client = createClient({ url: REDIS_URL });
} else {
  if (!globalThis.__redis) {
    globalThis.__redis = createClient({ url: REDIS_URL });
  }
  client = globalThis.__redis;
}

export { client };
