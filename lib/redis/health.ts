import { clientPromise } from './client';

const PING_TIMEOUT_MS = 5000;

async function withTimeout<T>(promise: Promise<T>, timeoutMs: number): Promise<T> {
  const timeout = new Promise<never>((_, reject) =>
    setTimeout(() => reject(new Error(`Timed out after ${timeoutMs}ms`)), timeoutMs),
  );
  return Promise.race([promise, timeout]);
}

export async function ping(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const client = await clientPromise;
    await withTimeout(client.ping(), PING_TIMEOUT_MS);
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
