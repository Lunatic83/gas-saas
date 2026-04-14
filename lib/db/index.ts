import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
  let drizzleDb: ReturnType<typeof drizzle> | undefined;
}

const globalForDrizzle = globalThis as unknown as {
  drizzleDb: ReturnType<typeof drizzle> | undefined;
};

export const db =
  globalForDrizzle.drizzleDb ??
  drizzle(
    postgres(process.env.DATABASE_URL ?? '', {
      max: 10,
      onnotice: () => null,
      transform: undefined,
    }),
  );

if (process.env.NODE_ENV !== 'production') {
  globalForDrizzle.drizzleDb = db;
}
