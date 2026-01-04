export interface Result {
	id: number;
	userId: number | null;
	presetId: number | null;
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
	createdAt: string;
}

export interface ReplayEvent {
	key: string;
	timestamp: number;
	ctrlKey?: boolean;
	confirmedIndex?: number;
}

export interface ReplayResponse {
	data: ReplayEvent[];
	targetText: string;
}

export type ReplayData = ReplayEvent[]; // Keep for backward compat if needed, or remove.

