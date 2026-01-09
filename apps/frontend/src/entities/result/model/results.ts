import { action, withAsyncData, wrap } from '@reatom/core';
import { resultApi } from '../api/result.api';
import type { Result } from './types';

export const fetchUserResults = action(async (userId: string) => {
	return await wrap(resultApi.getUserResults(userId));
}, 'results.fetchUser').extend(withAsyncData({ initState: [] as Result[] }));
