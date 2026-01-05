import { useQuery } from '@tanstack/react-query';
import { resultApi } from '../api/result.api';

export const resultKeys = {
	all: ['results'] as const,
	user: (userId: string) => [...resultKeys.all, 'user', userId] as const,
	detail: (id: string) => [...resultKeys.all, 'detail', id] as const,
	replay: (id: string) => [...resultKeys.all, 'replay', id] as const,
};

export const useUserResults = (userId: string = '') => {
	return useQuery({
		queryKey: resultKeys.user(userId),
		queryFn: () => resultApi.getUserResults(userId),
		enabled: !!userId,
	});
};

export const useResult = (id: string = '') => {
	return useQuery({
		queryKey: resultKeys.detail(id),
		queryFn: () => resultApi.getResultById(id),
		enabled: !!id,
	});
};

export const useReplay = (id: string = '') => {
	return useQuery({
		queryKey: resultKeys.replay(id),
		queryFn: () => resultApi.getReplayByResultId(id),
		enabled: !!id,
	});
};
