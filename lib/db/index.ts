import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
  let drizzleDb: ReturnType<typeof drizzle> | undefined;
}

const globalForDrizzle = globalThis as unknown as {
  drizzleDb: ReturnType<typeof drizzle> | undefined;
};

function createDb() {
  const DATABASE_URL = process.env.DATABASE_URL;
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return drizzle(postgres(DATABASE_URL, { max: 10 }));
}

export function getDb() {
  if (process.env.NODE_ENV !== 'production') {
    if (!globalForDrizzle.drizzleDb) {
      globalForDrizzle.drizzleDb = createDb();
    }
    return globalForDrizzle.drizzleDb;
  }
  return createDb();
}

// Lazy db instance — throws only when first accessed (runtime), not at import time
let _db: ReturnType<typeof drizzle> | undefined;

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (prop === 'then' || prop === 'constructor') return undefined;
    if (!_db) {
      _db = getDb();
    }
    return (_db as unknown as Record<string, unknown>)[prop as string];
  },
});
