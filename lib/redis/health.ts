import { clientPromise } from './client';

export async function ping(): Promise<{ ok: boolean; latencyMs: number }> {
  const start = Date.now();
  try {
    const client = await clientPromise;
    await client.ping();
    return { ok: true, latencyMs: Date.now() - start };
  } catch {
    return { ok: false, latencyMs: Date.now() - start };
  }
}
