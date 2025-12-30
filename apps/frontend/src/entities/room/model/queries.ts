import { queryOptions } from '@tanstack/react-query';
import { type Room } from './types';

export const roomQueries = {
	all: () => ['rooms'] as const,
	detail: (id: string) => [...roomQueries.all(), id] as const,

	create: async (presetId?: number): Promise<{ roomId: string }> => {
		const response = await fetch('/api/rooms', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json' },
			body: JSON.stringify({ presetId }),
		});
		if (!response.ok) throw new Error('Failed to create room');
		return response.json();
	},

	get: (id: string) =>
		queryOptions({
			queryKey: roomQueries.detail(id),
			queryFn: async () => {
				const response = await fetch(`/api/rooms/${id}`);
				if (!response.ok) throw new Error('Room not found');
				return response.json() as Promise<Room>;
			},
			enabled: !!id,
			retry: false,
		}),
};
