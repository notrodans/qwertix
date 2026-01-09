import { wrap } from '@reatom/core';
import type { ReplayResponse, Result } from '../model/types';

export const resultApi = {
	getUserResults: async (userId: string): Promise<Result[]> => {
		const response = await wrap(fetch(`/api/results/user/${userId}`));
		if (!response.ok) throw new Error('Failed to fetch results');
		return wrap(response.json());
	},

	getResultById: async (id: string): Promise<Result> => {
		const response = await wrap(fetch(`/api/results/${id}`));
		if (!response.ok) throw new Error('Failed to fetch result');
		return wrap(response.json());
	},

	getReplayByResultId: async (id: string): Promise<ReplayResponse> => {
		const response = await wrap(fetch(`/api/results/${id}/replay`));
		if (!response.ok) throw new Error('Failed to fetch replay');
		return wrap(response.json());
	},
};
