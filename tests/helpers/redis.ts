import { createClient } from 'redis';

const REDIS_URL = process.env.REDIS_URL ?? 'redis://localhost:6379';

let clientPromise: ReturnType<typeof createClient> | null = null;

export async function isRedisAvailable(): Promise<boolean> {
  const TIMEOUT_MS = 5000;
  try {
    const client = createClient({ url: REDIS_URL });
    const connectPromise = client.connect();
    const timeout = new Promise<'timeout'>((resolve) =>
      setTimeout(() => resolve('timeout'), TIMEOUT_MS),
    );
    await Promise.race([connectPromise, timeout]);
    if ((await Promise.race([client.ping(), timeout])) === 'timeout') {
      await client.quit().catch(() => {});
      return false;
    }
    await client.quit().catch(() => {});
    return true;
  } catch {
    return false;
  }
}

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
    try {
      await clientPromise.quit();
    } catch {
      // Ignore errors when disconnecting
    }
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
