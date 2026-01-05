import type { ReplayResponse, Result } from '../model/types';

export const resultApi = {
	getUserResults: async (userId: string): Promise<Result[]> => {
		const response = await fetch(`/api/results/user/${userId}`);
		if (!response.ok) throw new Error('Failed to fetch results');
		return response.json();
	},

	getResultById: async (id: string): Promise<Result> => {
		const response = await fetch(`/api/results/${id}`);
		if (!response.ok) throw new Error('Failed to fetch result');
		return response.json();
	},

	getReplayByResultId: async (id: string): Promise<ReplayResponse> => {
		const response = await fetch(`/api/results/${id}/replay`);
		if (!response.ok) throw new Error('Failed to fetch replay');
		return response.json();
	},
};
