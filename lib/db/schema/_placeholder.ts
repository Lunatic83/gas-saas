import { pgTable, uuid, timestamp } from 'drizzle-orm/pg-core';

export const __placeholder__ = pgTable('__placeholder__', {
  id: uuid('id').primaryKey().defaultRandom(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
});
