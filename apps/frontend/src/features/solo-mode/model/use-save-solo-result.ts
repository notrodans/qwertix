import { env } from '@env';
import {
	calculateAccuracy,
	calculateCorrectCharacters,
	calculateResultHash,
	calculateWPM,
	type ReplayEvent,
	reconstructText,
} from '@qwertix/room-contracts';
import { useMutation } from '@tanstack/react-query';

interface SaveSoloResultVariables {
	userId?: string;
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
	// 1. Calculate Stats Locally
	const reconstructed = reconstructText(data.replayData);
	const correctChars = calculateCorrectCharacters(
		reconstructed,
		data.targetText,
	);
	const wpm = Math.round(
		calculateWPM(correctChars, data.startTime, data.endTime),
	);
	const raw = Math.round(
		calculateWPM(reconstructed.length, data.startTime, data.endTime),
	);
	const accuracy = calculateAccuracy(reconstructed, data.targetText);

	// 2. Generate Hash
	const hash = await calculateResultHash(
		wpm,
		raw,
		accuracy,
		data.consistency,
		data.startTime,
		data.endTime,
		data.targetText,
		env.VITE_RESULT_HASH_SALT,
	);

	const payload = {
		...data,
		wpm,
		raw,
		accuracy,
		hash,
	};

	const response = await fetch('/api/results', {
		method: 'POST',
		headers: { 'Content-Type': 'application/json' },
		body: JSON.stringify(payload),
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
