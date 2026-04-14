import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
  let drizzleDb: ReturnType<typeof drizzle> | undefined;
}

const globalForDrizzle = globalThis as unknown as {
  drizzleDb: ReturnType<typeof drizzle> | undefined;
};

function createDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error('DATABASE_URL environment variable is not set');
    }
    // eslint-disable-next-line no-console
    console.warn('[DEV] DATABASE_URL not set, using localhost. Set DATABASE_URL to connect to a different database.');
  }
  return drizzle(postgres(url ?? 'postgres://localhost:5432', { max: 10 }));
}

export const db = globalForDrizzle.drizzleDb ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.drizzleDb = db;
}
