import type { Result } from '../../src/db/schema';
import type { ResultRepository } from '../../src/repositories/interfaces/ResultRepository';

export class FakeResultRepository implements ResultRepository {
	private results = new Map<number, Result>();
	private replays = new Map<number, { key: string; timestamp: number }[]>();
	private nextId = 1;

	async findById(id: number): Promise<Result | undefined> {
		return this.results.get(id);
	}

	async findByUserId(userId: number): Promise<Result[]> {
		return Array.from(this.results.values())
			.filter((r) => r.userId === userId)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

	async create(
		data: {
			userId: number;
			presetId: number | null;
			wpm: number;
			raw: number;
			accuracy: number;
			consistency: number;
		},
		replayData?: { key: string; timestamp: number }[],
	): Promise<Result> {
		const result: Result = {
			id: this.nextId++,
			userId: data.userId,
			presetId: data.presetId,
			wpm: data.wpm,
			raw: data.raw,
			accuracy: data.accuracy,
			consistency: data.consistency,
			createdAt: new Date(),
		};
		this.results.set(result.id, result);

		if (replayData) {
			this.replays.set(result.id, replayData);
		}

		return result;
	}

	// Helper for testing
	getReplay(resultId: number) {
		return this.replays.get(resultId);
	}
}
