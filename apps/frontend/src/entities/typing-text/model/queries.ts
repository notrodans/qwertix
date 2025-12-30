import { queryOptions } from '@tanstack/react-query';

export const wordQueries = {
	all: () => ['words'] as const,
	list: (count = 30) =>
		queryOptions({
			queryKey: [...wordQueries.all(), count],
			queryFn: async () => {
				const response = await fetch(`/api/words?count=${count}`);
				if (!response.ok) {
					throw new Error('Failed to fetch words');
				}
				return response.json() as Promise<string[]>;
			},
			refetchOnWindowFocus: false,
		}),
};
