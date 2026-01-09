import { atom, computed, withAsyncData, wrap } from '@reatom/core';
import { resultApi } from '@/entities/result';

export const resultIdAtom = atom<string | null>(null, 'resultView.id');

export const resultDataAtom = computed(async () => {
	const resultId = resultIdAtom();
	if (!resultId) return null;

	const [result, replay] = await Promise.all([
		wrap(resultApi.getResultById(resultId)),
		wrap(resultApi.getReplayByResultId(resultId)),
	]);

	return { result, replay };
}, 'resultView.data').extend(withAsyncData());
