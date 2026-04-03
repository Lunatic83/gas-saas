import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

type RedisClient = ReturnType<typeof createClient>;

declare global {
  var __redisPromise: Promise<RedisClient> | undefined;
}

async function createRedisClient(): Promise<RedisClient> {
  const client = createClient({ url: REDIS_URL });

  client.on('error', (err) => {
    console.error('Redis Client Error', err);
  });

  await client.connect();
  return client;
}

const clientPromise =
  process.env.NODE_ENV === 'test'
    ? createRedisClient()
    : (globalThis.__redisPromise ??= createRedisClient());

async function disconnect() {
  const client = await clientPromise;
  await client.quit();
}

export { clientPromise, disconnect };
