/**
 * Calculates Words Per Minute (WPM).
 * @param typedLength - The total number of characters typed.
 * @param startTime - The timestamp when typing started.
 * @param now - The current timestamp.
 * @returns The calculated WPM.
 */
export function calculateWPM(
	typedLength: number,
	startTime: number,
	now: number,
): number {
	const timeMinutes = (now - startTime) / 60000;
	if (timeMinutes <= 0) return 0;
	const charactersPerWord = 5;
	const words = typedLength / charactersPerWord;
	return words / timeMinutes;
}

/**
 * Calculates accuracy percentage.
 * @param typedText - The text typed by the user.
 * @param targetText - The target text to match.
 * @returns The accuracy as a percentage (0-100).
 */
export function calculateAccuracy(
	typedText: string,
	targetText: string,
): number {
	if (typedText.length === 0) return 100;
	let correct = 0;
	const minLength = Math.min(typedText.length, targetText.length);
	for (let i = 0; i < minLength; i++) {
		if (typedText[i] === targetText[i]) {
			correct++;
		}
	}
	return Math.round((correct / typedText.length) * 100);
}

/**
 * Reconstructs the typed text from a list of replay events, handling Backspace and Ctrl+Backspace logic.
 * @param replayData - The list of key events.
 * @returns The final reconstructed string.
 */
export function reconstructText(
	replayData: {
		key: string;
		timestamp: number;
		ctrlKey?: boolean;
		confirmedIndex?: number;
	}[],
): string {
	let reconstructedTypedText = '';
	for (const event of replayData) {
		if (event.key === 'Backspace') {
			const isCtrl = !!event.ctrlKey;
			const confirmedIndex = event.confirmedIndex ?? 0;

			if (reconstructedTypedText.length > confirmedIndex) {
				if (isCtrl) {
					const textAfterConfirmed =
						reconstructedTypedText.slice(confirmedIndex);
					const trimmed = textAfterConfirmed.trimEnd();
					const diff = textAfterConfirmed.length - trimmed.length;

					if (diff === 0) {
						const lastSpace = trimmed.lastIndexOf(' ');
						if (lastSpace === -1) {
							reconstructedTypedText = reconstructedTypedText.slice(
								0,
								confirmedIndex,
							);
						} else {
							reconstructedTypedText = reconstructedTypedText.slice(
								0,
								confirmedIndex + lastSpace + 1,
							);
						}
					} else {
						const lastSpace = trimmed.lastIndexOf(' ');
						if (lastSpace === -1) {
							reconstructedTypedText = reconstructedTypedText.slice(
								0,
								confirmedIndex,
							);
						} else {
							reconstructedTypedText = reconstructedTypedText.slice(
								0,
								confirmedIndex + lastSpace + 1,
							);
						}
					}
				} else {
					reconstructedTypedText = reconstructedTypedText.slice(0, -1);
				}
			}
		} else if (event.key.length === 1) {
			reconstructedTypedText += event.key;
		}
	}
	return reconstructedTypedText;
}
