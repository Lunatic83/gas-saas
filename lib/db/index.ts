import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
  let drizzleDb: ReturnType<typeof drizzle> | undefined;
}

const globalForDrizzle = globalThis as unknown as {
  drizzleDb: ReturnType<typeof drizzle> | undefined;
};

let _db: ReturnType<typeof drizzle> | undefined;
let _dbInitError: Error | undefined;

function getDb() {
  if (_db) return _db;
  if (_dbInitError) throw _dbInitError;
  if (_db === undefined) {
    try {
      const DATABASE_URL = process.env.DATABASE_URL;
      if (!DATABASE_URL) {
        throw new Error('DATABASE_URL environment variable is not set');
      }
      _db = drizzle(postgres(DATABASE_URL, { max: 10 }));
      if (process.env.NODE_ENV !== 'production') {
        globalForDrizzle.drizzleDb = _db;
      }
    } catch (e) {
      _dbInitError = e as Error;
      throw _dbInitError;
    }
  }
  return _db;
}

export const db = new Proxy({} as ReturnType<typeof drizzle>, {
  get(_target, prop) {
    if (prop === 'then' || prop === 'constructor') return undefined;
    return (getDb() as unknown as Record<string, unknown>)[prop as string];
  },
});
