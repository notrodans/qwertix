import { type ReplayEvent } from '@qwertix/room-contracts';
import { useMutation } from '@tanstack/react-query';

interface SaveSoloResultVariables {
	userId?: number;
	targetText: string;
	replayData: ReplayEvent[];
	startTime: number;
	endTime: number;
	consistency: number;
}

interface SaveSoloResultResponse {
	wpm: number;
	raw: number;
	accuracy: number;
	consistency: number;
}

async function saveSoloResult(
	data: SaveSoloResultVariables,
): Promise<SaveSoloResultResponse | null> {
	const response = await fetch('/api/results', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(data),
	});

	if (!response.ok) {
		throw new Error('Failed to save result');
	}

	return response.json();
}

export function useSaveSoloResult() {
	return useMutation({
		mutationFn: saveSoloResult,
	});
}
