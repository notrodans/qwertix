import { desc, eq } from 'drizzle-orm';
import { DataBase } from '@/db';
import { type Result, replays, results } from '@/db/schema';
import type { ResultRepository } from '../interfaces/ResultRepository';

/**
 * Drizzle implementation of ResultRepository.
 */
export class DrizzleResultRepository implements ResultRepository {
	constructor(private db: DataBase) {}

	/**
	 * Finds a result by its ID.
	 * @param id - The ID of the result.
	 * @returns The result if found, otherwise undefined.
	 */
	async findById(id: string): Promise<Result | undefined> {
		const result = await this.db.source
			.select()
			.from(results)
			.where(eq(results.id, id))
			.execute();
		return result[0];
	}

	/**
	 * Finds all results for a specific user.
	 * @param userId - The ID of the user.
	 * @returns An array of results, ordered by creation date (descending).
	 */
	async findByUserId(userId: string): Promise<Result[]> {
		return await this.db.source
			.select()
			.from(results)
			.where(eq(results.userId, userId))
			.orderBy(desc(results.createdAt))
			.execute();
	}

	/**
	 * Creates a new result and optionally saves replay data.
	 * @param data - The result data.
	 * @param replayData - The replay data (optional).
	 * @param targetText - The target text for the replay (optional).
	 * @returns The created result.
	 */
	async create(
		data: {
			userId: string;
			presetId: string | null;
			wpm: number;
			raw: number;
			accuracy: number;
			consistency: number;
			hash?: string;
		},
		replayData?: { key: string; timestamp: number }[],
		targetText?: string,
	): Promise<Result> {
		return await this.db.source.transaction(async (tx) => {
			const result = await tx
				.insert(results)
				.values({
					userId: data.userId,
					presetId: data.presetId,
					wpm: data.wpm,
					raw: data.raw,
					accuracy: data.accuracy,
					consistency: data.consistency,
					hash: data.hash,
				})
				.returning();

			const savedResult = result[0];
			if (!savedResult) {
				throw new Error('Failed to save result');
			}

			if (replayData && replayData.length > 0 && targetText) {
				await tx.insert(replays).values({
					resultId: savedResult.id,
					data: replayData,
					targetText: targetText,
				});
			}

			return savedResult;
		});
	}

	/**
	 * Finds replay data for a specific result.
	 * @param resultId - The ID of the result.
	 * @returns The replay data if found, otherwise undefined.
	 */
	async findReplayByResultId(
		resultId: string,
	): Promise<
		| { data: { key: string; timestamp: number }[]; targetText: string }
		| undefined
	> {
		const replay = await this.db.source
			.select()
			.from(replays)
			.where(eq(replays.resultId, resultId))
			.execute();

		if (!replay[0]) return undefined;

		return {
			data: replay[0].data as { key: string; timestamp: number }[],
			targetText: replay[0].targetText,
		};
	}
}
