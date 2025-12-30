import { desc, eq } from 'drizzle-orm';
import { DataBase } from '@/db';
import { replays, results } from '@/db/schema';

export class ResultService {
	constructor(private db: DataBase) {}

	async getResultById(id: number) {
		const result = await this.db.source
			.select()
			.from(results)
			.where(eq(results.id, id))
			.execute();
		return result[0];
	}

	async getUserResults(userId: number) {
		return await this.db.source
			.select()
			.from(results)
			.where(eq(results.userId, userId))
			.orderBy(desc(results.createdAt))
			.execute();
	}

	async saveResult(
		userId: number | null,
		presetId: number | null,
		wpm: number,
		raw: number,
		accuracy: number,
		consistency: number,
		replayData: { key: string; timestamp: number }[],
	) {
		// If user is not authenticated, do not save result
		if (!userId) {
			return null;
		}

		// Save result
		const result = await this.db.source
			.insert(results)
			.values({
				userId,
				presetId,
				wpm,
				raw,
				accuracy,
				consistency,
			})
			.returning()
			.execute();

		if (replayData && replayData.length > 0) {
			if (result[0] != undefined) {
				await this.db.source
					.insert(replays)
					.values({
						resultId: result[0].id,
						data: replayData,
					})
					.execute();
			}
		}

		return result[0];
	}
}
