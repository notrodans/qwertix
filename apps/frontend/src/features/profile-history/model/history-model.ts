import { atom, effect } from '@reatom/core';
import { fetchUserResults } from '@/entities/result';

export const historyUserIdAtom = atom<string | null>(null, 'historyUserId');

effect(() => {
	const id = historyUserIdAtom();
	if (id) fetchUserResults(id);
});
