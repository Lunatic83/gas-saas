import { pgTable, varchar, timestamp, text, boolean, uuid, index, uniqueIndex } from 'drizzle-orm/pg-core';
import { relations } from 'drizzle-orm';

export const bauthUsers = pgTable('bauth_users', {
	id: uuid('id').primaryKey().defaultRandom(),
	email: varchar('email', { length: 255 }).notNull(),
	emailVerified: boolean('email_verified').default(false),
	name: varchar('name', { length: 255 }),
	image: varchar('image', { length: 500 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index('bauth_users_email_idx').on(table.email),
	uniqueIndex('bauth_users_email_unique_idx').on(table.email),
]);

export const bauthSessions = pgTable('bauth_sessions', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
	method: varchar('method', { length: 50 }),
	ipAddress: varchar('ip_address', { length: 100 }),
	userAgent: text('user_agent'),
}, (table) => [
	index('bauth_sessions_user_id_idx').on(table.userId),
	index('bauth_sessions_expires_at_idx').on(table.expiresAt),
]);

export const bauthAccounts = pgTable('bauth_accounts', {
	id: varchar('id', { length: 255 }).primaryKey(),
	userId: varchar('user_id', { length: 255 }).notNull(),
	accountId: varchar('account_id', { length: 255 }).notNull(),
	providerId: varchar('provider_id', { length: 255 }).notNull(),
	accessToken: varchar('access_token', { length: 500 }),
	refreshToken: varchar('refresh_token', { length: 500 }),
	idToken: text('id_token'),
	accessTokenExpiresAt: timestamp('access_token_expires_at', { withTimezone: true }),
	refreshTokenExpiresAt: timestamp('refresh_token_expires_at', { withTimezone: true }),
	scope: text('scope'),
	password: varchar('password', { length: 255 }),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
	updatedAt: timestamp('updated_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	index('bauth_accounts_user_id_idx').on(table.userId),
	index('bauth_accounts_provider_id_idx').on(table.providerId),
]);

export const bauthVerificationTokens = pgTable('bauth_verification_tokens', {
	identifier: varchar('identifier', { length: 255 }).notNull(),
	token: varchar('token', { length: 255 }).notNull(),
	expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
	createdAt: timestamp('created_at', { withTimezone: true }).defaultNow().notNull(),
}, (table) => [
	uniqueIndex('bauth_verification_tokens_token_unique_idx').on(table.token),
	index('bauth_verification_tokens_identifier_idx').on(table.identifier),
]);

// Relations
export const bauthUsersRelations = relations(bauthUsers, ({ many }) => ({
	sessions: many(bauthSessions),
	accounts: many(bauthAccounts),
}));

export const bauthSessionsRelations = relations(bauthSessions, ({ one }) => ({
	user: one(bauthUsers, {
		fields: [bauthSessions.userId],
		references: [bauthUsers.id],
	}),
}));

export const bauthAccountsRelations = relations(bauthAccounts, ({ one }) => ({
	user: one(bauthUsers, {
		fields: [bauthAccounts.userId],
		references: [bauthUsers.id],
	}),
}));
