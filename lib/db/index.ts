import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

declare global {
	let drizzleDb: ReturnType<typeof drizzle> | undefined;
}

const globalForDrizzle = globalThis as unknown as {
	drizzleDb: ReturnType<typeof drizzle> | undefined;
};

let dbInstance: ReturnType<typeof drizzle> | undefined;

function getDatabaseUrl(): string {
	const DATABASE_URL = process.env.DATABASE_URL;
	if (!DATABASE_URL) {
		throw new Error('DATABASE_URL environment variable is not set');
	}
	return DATABASE_URL;
}

export function getDb(): ReturnType<typeof drizzle> {
	if (!dbInstance) {
		dbInstance = drizzle(postgres(getDatabaseUrl(), { max: 10 }));
		if (process.env.NODE_ENV !== 'production') {
			globalForDrizzle.drizzleDb = dbInstance;
		}
	}
	return dbInstance;
}

// For backwards compatibility
export const db = new Proxy({} as ReturnType<typeof drizzle>, {
	get(_target, prop) {
		return getDb()[prop as keyof ReturnType<typeof drizzle>];
	},
});
