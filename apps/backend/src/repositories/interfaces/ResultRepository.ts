import type { Result } from '@/db/schema';

export interface ResultRepository {
	findById(id: number): Promise<Result | undefined>;
	findByUserId(userId: number): Promise<Result[]>;
	create(
		data: {
			userId: number;
			presetId: number | null;
			wpm: number;
			raw: number;
			accuracy: number;
			consistency: number;
		},
		replayData?: { key: string; timestamp: number }[],
		targetText?: string,
	): Promise<Result>;
	findReplayByResultId(
		resultId: number,
	): Promise<
		| { data: { key: string; timestamp: number }[]; targetText: string }
		| undefined
	>;
}
