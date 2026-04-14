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
    if (process.env.NODE_ENV !== 'production') {
      console.warn('[DEV] DATABASE_URL not set, using localhost');
    }
  }
  return drizzle(postgres(url ?? 'postgres://localhost:5432', { max: 10 }));
}

export const db = globalForDrizzle.drizzleDb ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.drizzleDb = db;
}
