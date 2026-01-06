import type { InferSelectModel } from 'drizzle-orm';
import {
	boolean,
	integer,
	jsonb,
	pgEnum,
	pgTable,
	text,
	timestamp,
	uuid,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('role', ['admin', 'user']);

export const users = pgTable('users', {
	id: uuid('id').unique().primaryKey().defaultRandom(),
	username: text('username').notNull(),
	email: text('email').notNull().unique(),
	role: userRoleEnum('role').default('user').notNull(),
	passwordHash: text('password_hash').notNull(), // For local auth
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
export type User = InferSelectModel<typeof users>;

export const presets = pgTable('presets', {
	id: uuid('id').unique().primaryKey().defaultRandom(),
	name: text('name').notNull(),
	config: jsonb('config').notNull(), // RoomConfig
	isCustom: boolean('is_custom').default(false).notNull(),
	createdBy: uuid('created_by').references(() => users.id),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
export type Preset = InferSelectModel<typeof presets>;

export const results = pgTable('results', {
	id: uuid('id').unique().primaryKey().defaultRandom(),
	userId: uuid('user_id').references(() => users.id),
	presetId: uuid('preset_id').references(() => presets.id),
	wpm: integer('wpm').notNull(),
	raw: integer('raw').notNull(),
	accuracy: integer('accuracy').notNull(),
	consistency: integer('consistency').notNull(),
	hash: text('hash'),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
export type Result = InferSelectModel<typeof results>;

export const replays = pgTable('replays', {
	id: uuid('id').primaryKey().defaultRandom().defaultRandom(),
	resultId: uuid('result_id')
		.references(() => results.id, { onDelete: 'cascade' })
		.notNull(),
	data: jsonb('data').notNull(), // Array of keystroke events
	targetText: text('target_text').notNull(),
	createdAt: timestamp('created_at').defaultNow().notNull(),
});
export type Replay = InferSelectModel<typeof replays>;
