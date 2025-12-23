import { pgTable, serial, text, timestamp } from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: text('username').notNull(),
	email: text('email').notNull().unique(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
