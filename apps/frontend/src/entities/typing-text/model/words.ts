import { action, withAsyncData, withConnectHook, wrap } from '@reatom/core';

export const fetchWords = action(async (count = 50) => {
	const response = await wrap(fetch(`/api/words?count=${count}`));
	if (!response.ok) throw new Error('Failed to fetch words');
	return await wrap(response.json());
}, 'words.fetch').extend(withAsyncData({ initState: [] as string[] }));

// Auto-fetch on connect
fetchWords.data.extend(
	withConnectHook(() => {
		fetchWords();
	}),
);
