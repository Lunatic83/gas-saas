import { relations, sql } from 'drizzle-orm';
import { pgTable, text, timestamp, boolean, uuid, index } from 'drizzle-orm/pg-core';

export const bauth_users = pgTable(
  'bauth_users',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    name: text('name', { length: 255 }).notNull(),
    email: text('email').notNull().unique(),
    emailVerified: boolean('email_verified').default(false).notNull(),
    image: text('image'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [index('bauth_users_email_idx').on(table.email)],
);

export const bauth_sessions = pgTable(
  'bauth_sessions',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    expiresAt: timestamp('expires_at').notNull(),
    token: text('token').notNull().unique(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
    ipAddress: text('ip_address'),
    userAgent: text('user_agent'),
    userId: uuid('user_id')
      .notNull()
      .references(() => bauth_users.id, { onDelete: 'cascade' }),
  },
  (table) => [
    index('bauth_sessions_userId_idx').on(table.userId),
    index('bauth_sessions_token_idx').on(table.token),
  ],
);

export const bauth_accounts = pgTable(
  'bauth_accounts',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    userId: uuid('user_id')
      .notNull()
      .references(() => bauth_users.id, { onDelete: 'cascade' }),
    accountId: text('account_id').notNull(),
    providerId: text('provider_id').notNull(),
    accessToken: text('access_token'),
    refreshToken: text('refresh_token'),
    idToken: text('id_token'),
    accessTokenExpiresAt: timestamp('access_token_expires_at'),
    refreshTokenExpiresAt: timestamp('refresh_token_expires_at'),
    scope: text('scope'),
    password: text('password'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('bauth_accounts_userId_idx').on(table.userId),
    index('bauth_accounts_providerId_idx').on(table.providerId),
  ],
);

export const bauth_verification_tokens = pgTable(
  'bauth_verification_tokens',
  {
    id: uuid('id')
      .default(sql`pg_catalog.gen_random_uuid()`)
      .primaryKey(),
    identifier: text('identifier').notNull(),
    value: text('value').notNull(),
    expiresAt: timestamp('expires_at').notNull(),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at')
      .defaultNow()
      .$onUpdate(() => /* @__PURE__ */ new Date())
      .notNull(),
  },
  (table) => [
    index('bauth_verification_tokens_identifier_idx').on(table.identifier),
    index('bauth_verification_tokens_value_idx').on(table.value),
  ],
);

// Relations
export const bauth_users_relations = relations(bauth_users, ({ many }) => ({
  sessions: many(bauth_sessions),
  accounts: many(bauth_accounts),
}));

export const bauth_sessions_relations = relations(bauth_sessions, ({ one }) => ({
  user: one(bauth_users, {
    fields: [bauth_sessions.userId],
    references: [bauth_users.id],
  }),
}));

export const bauth_accounts_relations = relations(bauth_accounts, ({ one }) => ({
  user: one(bauth_users, {
    fields: [bauth_accounts.userId],
    references: [bauth_users.id],
  }),
}));
