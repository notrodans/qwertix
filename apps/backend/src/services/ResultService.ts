import type { Result } from '@/db/schema';
import type { ResultRepository } from '@/repositories/interfaces/ResultRepository';

/**
 * Service for managing race results.
 */
export class ResultService {
	constructor(private resultRepo: ResultRepository) {}

	/**
	 * Retrieves a result by its ID.
	 * @param id - The ID of the result.
	 * @returns The result if found, otherwise undefined.
	 */
	async getResultById(id: string) {
		return await this.resultRepo.findById(id);
	}

	/**
	 * Retrieves all results for a specific user.
	 * @param userId - The ID of the user.
	 * @returns An array of results for the user.
	 */
	async getUserResults(userId: string) {
		return await this.resultRepo.findByUserId(userId);
	}

	/**
	 * Retrieves replay data for a result.
	 * @param resultId - The ID of the result.
	 * @returns The replay data if found, otherwise undefined.
	 */
	async getReplayByResultId(resultId: string) {
		return await this.resultRepo.findReplayByResultId(resultId);
	}

	/**
	 * Saves a new race result.
	 * @param userId - The ID of the user (or null if guest).
	 * @param presetId - The ID of the preset used (or null).
	 * @param wpm - The calculated Words Per Minute.
	 * @param raw - The raw WPM.
	 * @param accuracy - The accuracy percentage.
	 * @param consistency - The consistency score.
	 * @param replayData - The replay data (keystrokes).
	 * @returns The saved result, or null if the user is not authenticated.
	 */
	async saveResult(
		userId: string | null,
		presetId: string | null,
		wpm: number,
		raw: number,
		accuracy: number,
		consistency: number,
		afkDuration: number,
		replayData: {
			key: string;
			timestamp: number;
			ctrlKey?: boolean;
			confirmedIndex?: number;
		}[],
		targetText: string,
		hash?: string,
	): Promise<Result | undefined> {
		// If user is not authenticated, do not save result
		if (!userId) {
			return undefined;
		}

		return await this.resultRepo.create(
			{
				userId,
				presetId,
				wpm,
				raw,
				accuracy,
				consistency,
				afkDuration,
				hash,
			},
			replayData,
			targetText,
		);
	}
}
