import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
  let drizzleDb: ReturnType<typeof drizzle> | undefined;
}

const globalForDrizzle = globalThis as unknown as {
  drizzleDb: ReturnType<typeof drizzle> | undefined;
};

function createDb() {
  const url = process.env.DATABASE_URL ?? 'postgres://localhost:5432';
  if (!process.env.DATABASE_URL && process.env.NODE_ENV !== 'production') {
    // eslint-disable-next-line no-console
    console.warn(
      '[DEV] DATABASE_URL not set, using localhost. Set DATABASE_URL to connect to a different database.',
    );
  }
  return drizzle(postgres(url, { max: 10 }));
}

export const db = globalForDrizzle.drizzleDb ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.drizzleDb = db;
}
