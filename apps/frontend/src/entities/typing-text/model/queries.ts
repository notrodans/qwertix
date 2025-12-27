import { useQuery } from '@tanstack/react-query';

export function useGetWords() {
	return useQuery({
		queryKey: ['words'],
		queryFn: async () => {
			const res = await fetch('/api/words');
			if (!res.ok) {
				throw new Error('Network response was not ok');
			}
			return res.json() as Promise<string[]>;
		},
		select: (data) => data.join(' '), // Flatten array to single string for now
	});
}
