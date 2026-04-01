import postgres from 'postgres';
import { drizzle } from 'drizzle-orm/postgres-js';

const testDb = drizzle(postgres(process.env.DATABASE_URL_TEST!, { max: 20 }));

export async function withTransaction<T>(fn: () => Promise<T>): Promise<T> {
  return testDb.transaction(async (tx) => {
    try {
      const result = await fn();
      await tx.rollback();
      return result;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  });
}

export { testDb };
