import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

let clientPromise: ReturnType<typeof createClient> | null = null;

export async function getTestRedisClient() {
  if (!clientPromise) {
    const client = createClient({ url: REDIS_URL });
    client.on('error', (err) => {
      console.error('Test Redis Client Error', err);
    });
    await client.connect();
    clientPromise = client;
  }
  return clientPromise;
}

export async function disconnectTestRedisClient() {
  if (clientPromise) {
    await clientPromise.quit();
    clientPromise = null;
  }
}

export async function flushTestRedis() {
  const client = await getTestRedisClient();
  await client.flushDb();
}

// Generate a unique test key prefix to avoid collisions
export function testKeyPrefix(): string {
  return `test:${process.pid}:${Date.now()}:`;
}
