import { queryOptions } from '@tanstack/react-query';

export const wordQueries = {
	all: () => ['words'] as const,
	list: () =>
		queryOptions({
			queryKey: wordQueries.all(),
			queryFn: async () => {
				const response = await fetch('/api/words');
				if (!response.ok) {
					throw new Error('Failed to fetch words');
				}
				return response.json() as Promise<string[]>;
			},
			refetchOnWindowFocus: false,
		}),
};
