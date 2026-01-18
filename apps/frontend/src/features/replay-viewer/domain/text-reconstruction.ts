import type { ReplayEvent } from '@/entities/result';
import { calculateBackspace } from '@/entities/typing-text';

export function reconstructTextAtTime(
	replayData: ReplayEvent[],
	targetTimestamp: number,
): string {
	let reconstructedTypedText = '';
	for (const event of replayData) {
		if (event.timestamp > targetTimestamp) break;

		if (event.key.length === 1) {
			reconstructedTypedText += event.key;
			continue;
		}

		if (event.key === 'Backspace') {
			const isCtrl = !!event.ctrlKey;
			const confirmedIndex = event.confirmedIndex ?? 0;

			reconstructedTypedText = calculateBackspace(
				reconstructedTypedText,
				confirmedIndex,
				isCtrl,
			);
		}
	}
	return reconstructedTypedText;
}
