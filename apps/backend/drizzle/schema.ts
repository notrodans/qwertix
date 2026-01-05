import {
	boolean,
	foreignKey,
	integer,
	jsonb,
	pgTable,
	serial,
	text,
	timestamp,
	unique,
} from 'drizzle-orm/pg-core';

export const presets = pgTable(
	'presets',
	{
		id: serial().primaryKey().notNull(),
		name: text().notNull(),
		config: jsonb().notNull(),
		isCustom: boolean('is_custom').default(false).notNull(),
		createdBy: integer('created_by'),
		createdAt: timestamp('created_at', { mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.createdBy],
			foreignColumns: [users.id],
			name: 'presets_created_by_users_id_fk',
		}),
	],
);

export const users = pgTable(
	'users',
	{
		id: serial().primaryKey().notNull(),
		username: text().notNull(),
		email: text().notNull(),
		passwordHash: text('password_hash').notNull(),
		createdAt: timestamp('created_at', { mode: 'string' })
			.defaultNow()
			.notNull(),
		role: text().default('user').notNull(),
	},
	(table) => [unique('users_email_unique').on(table.email)],
);

export const results = pgTable(
	'results',
	{
		id: serial().primaryKey().notNull(),
		userId: integer('user_id'),
		presetId: integer('preset_id'),
		wpm: integer().notNull(),
		raw: integer().notNull(),
		accuracy: integer().notNull(),
		consistency: integer().notNull(),
		createdAt: timestamp('created_at', { mode: 'string' })
			.defaultNow()
			.notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.userId],
			foreignColumns: [users.id],
			name: 'results_user_id_users_id_fk',
		}),
		foreignKey({
			columns: [table.presetId],
			foreignColumns: [presets.id],
			name: 'results_preset_id_presets_id_fk',
		}),
	],
);

export const replays = pgTable(
	'replays',
	{
		id: serial().primaryKey().notNull(),
		data: jsonb().notNull(),
		createdAt: timestamp('created_at', { mode: 'string' })
			.defaultNow()
			.notNull(),
		targetText: text('target_text').notNull(),
		resultId: integer('result_id').notNull(),
	},
	(table) => [
		foreignKey({
			columns: [table.resultId],
			foreignColumns: [results.id],
			name: 'replays_result_id_results_id_fk',
		}).onDelete('cascade'),
	],
);
