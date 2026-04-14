import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
  let drizzleDb: ReturnType<typeof drizzle> | undefined;
}

const globalForDrizzle = globalThis as unknown as {
  drizzleDb: ReturnType<typeof drizzle> | undefined;
};

function createDb() {
  const DATABASE_URL = process.env.DATABASE_URL ?? '';
  if (!DATABASE_URL) {
    throw new Error('DATABASE_URL environment variable is not set');
  }
  return drizzle(postgres(DATABASE_URL, { max: 10 }));
}

export const db = globalForDrizzle.drizzleDb ?? createDb();

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.drizzleDb = db;
}
