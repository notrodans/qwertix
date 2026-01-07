import type { ReplayEvent } from '@qwertix/room-contracts';

export interface ResultPayload {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	replayData: ReplayEvent[];
	startTime: number;
	endTime: number;
	afkDuration: number;
	hash: string;
}
