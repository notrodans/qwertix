import { relations } from 'drizzle-orm/relations';
import { presets, replays, results, users } from './schema';

export const presetsRelations = relations(presets, ({ one, many }) => ({
	user: one(users, {
		fields: [presets.createdBy],
		references: [users.id],
	}),
	results: many(results),
}));

export const usersRelations = relations(users, ({ many }) => ({
	presets: many(presets),
	results: many(results),
}));

export const resultsRelations = relations(results, ({ one, many }) => ({
	user: one(users, {
		fields: [results.userId],
		references: [users.id],
	}),
	preset: one(presets, {
		fields: [results.presetId],
		references: [presets.id],
	}),
	replays: many(replays),
}));

export const replaysRelations = relations(replays, ({ one }) => ({
	result: one(results, {
		fields: [replays.resultId],
		references: [results.id],
	}),
}));
