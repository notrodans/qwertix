import { v4 as uuid } from 'uuid';
import type { Result } from '../../src/db/schema';
import type { ResultRepository } from '../../src/repositories/interfaces/ResultRepository';

export class FakeResultRepository implements ResultRepository {
	private results = new Map<string, Result>();
	private replays = new Map<
		string,
		{ data: { key: string; timestamp: number }[]; targetText: string }
	>();

	async findById(id: string): Promise<Result | undefined> {
		return this.results.get(id);
	}

	async findByUserId(userId: string): Promise<Result[]> {
		return Array.from(this.results.values())
			.filter((r) => r.userId === userId)
			.sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
	}

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
		const result: Result = {
			id: uuid(),
			userId: data.userId,
			presetId: data.presetId,
			wpm: data.wpm,
			raw: data.raw,
			accuracy: data.accuracy,
			consistency: data.consistency,
			hash: data.hash ?? null,
			createdAt: new Date(),
		};
		this.results.set(result.id, result);

		if (replayData && targetText) {
			this.replays.set(result.id, { data: replayData, targetText });
		}

		return result;
	}

	async findReplayByResultId(
		resultId: string,
	): Promise<
		| { data: { key: string; timestamp: number }[]; targetText: string }
		| undefined
	> {
		return this.replays.get(resultId);
	}
}
