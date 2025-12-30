import {
	boolean,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
} from 'drizzle-orm/pg-core';

export const users = pgTable('users', {
	id: serial('id').primaryKey(),
	username: text('username').notNull(),
	email: text('email').notNull().unique(),
	role: text('role').default('user').notNull(), // 'admin', 'user'
	passwordHash: text('password_hash').notNull(), // For local auth
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const presets = pgTable('presets', {
	id: serial('id').primaryKey(),
	name: text('name').notNull(),
	config: jsonb('config').notNull(), // RoomConfig
	isCustom: boolean('is_custom').default(false).notNull(),
	createdBy: integer('created_by').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const results = pgTable('results', {
	id: serial('id').primaryKey(),
	userId: integer('user_id').references(() => users.id),
	presetId: integer('preset_id').references(() => presets.id),
	wpm: integer('wpm').notNull(),
	raw: integer('raw').notNull(),
	accuracy: integer('accuracy').notNull(),
	consistency: integer('consistency').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});

export const replays = pgTable('replays', {
	id: serial('id').primaryKey(),
	resultId: integer('result_id')
		.references(() => results.id)
		.notNull(),
	data: jsonb('data').notNull(), // Array of keystroke events
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
