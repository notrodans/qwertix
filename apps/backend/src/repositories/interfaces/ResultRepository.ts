import type { Result } from '@/db/schema';

export interface ResultRepository {
	findById(id: string): Promise<Result | undefined>;
	findByUserId(userId: string): Promise<Result[]>;
	create(
		data: {
			userId: string;
			presetId: string | null;
			wpm: number;
			raw: number;
			accuracy: number;
			consistency: number;
		},
		replayData?: { key: string; timestamp: number }[],
		targetText?: string,
	): Promise<Result>;
	findReplayByResultId(
		resultId: string,
	): Promise<
		| { data: { key: string; timestamp: number }[]; targetText: string }
		| undefined
	>;
}
