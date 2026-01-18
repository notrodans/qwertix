import { computed, withAsyncData, wrap } from '@reatom/core';
import { type ReplayResponse, type Result, resultApi } from '@/entities/result';
import { resultRoute } from '@/shared/model';

export const resultResource = computed(async () => {
	const id = resultRoute()?.resultId;
	if (!id) {
		return {
			result: {
				id: 0,
				presetId: 0,
				userId: 0,
				raw: 0,
				wpm: 0,
				accuracy: 0,
				consistency: 0,
				afkDuration: 0,
				createdAt: new Date().toDateString(),
			},
			replay: {
				data: [],
				targetText: '',
			},
		} satisfies { result: Result; replay: ReplayResponse };
	}

	const [result, replay] = await Promise.all([
		wrap(resultApi.getResultById(id)),
		wrap(resultApi.getReplayByResultId(id)),
	]);

	return { result, replay };
}, 'resultResource').extend(withAsyncData());

export const isResultLoading = computed(
	() => !resultResource.ready(),
	'isResultLoading',
);
