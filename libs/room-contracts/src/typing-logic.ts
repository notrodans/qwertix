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
					reconstructedTypedText = reconstructedTypedText.slice(0, -1);
				}
			}
		} else if (event.key.length === 1) {
			reconstructedTypedText += event.key;
		}
	}
	return reconstructedTypedText;
}

/**
 * Calculates the number of correct characters based on correctly typed words.
 * A character is counted as correct only if it's part of a fully correct word.
 * @param typedText - The text typed by the user.
 * @param targetText - The target text to match.
 * @returns The number of correct characters.
 */
export function calculateCorrectCharacters(
	typedText: string,
	targetText: string,
): number {
	const typedWords = typedText.split(' ');
	const targetWords = targetText.split(' ');
	let correctChars = 0;

	const wordsToCheck = Math.min(typedWords.length, targetWords.length);

	for (let i = 0; i < wordsToCheck; i++) {
		const targetWord = targetWords[i];
		if (targetWord && typedWords[i] === targetWord) {
			correctChars += targetWord.length;
			// Add space if it's not the last target word and was correctly typed as a separator
			if (i < targetWords.length - 1 && i < typedWords.length - 1) {
				correctChars += 1;
			}
		}
	}

	return correctChars;
}

/**
 * Calculates a SHA-256 hash of the result payload.
 * @param wpm - Words Per Minute.
 * @param raw - Raw WPM.
 * @param accuracy - Accuracy percentage.
 * @param consistency - Consistency score.
 * @param startTime - Start timestamp.
 * @param endTime - End timestamp.
 * @param targetText - The target text (or its length if text is too long).
 * @param salt - The secret salt (should be same on client and server).
 * @returns The hex string of the hash.
 */
export async function calculateResultHash(
	wpm: number,
	raw: number,
	accuracy: number,
	consistency: number,
	startTime: number,
	endTime: number,
	targetText: string,
	salt: string,
): Promise<string> {
	const data = `${wpm}-${raw}-${accuracy}-${consistency}-${startTime}-${endTime}-${targetText.length}-${salt}`;
	const encoder = new TextEncoder();
	const dataBuffer = encoder.encode(data);

	// Check if crypto.subtle is available (Browser/Node 19+/Bun)
	if (typeof crypto !== 'undefined' && crypto.subtle) {
		const hashBuffer = await crypto.subtle.digest('SHA-256', dataBuffer);
		const hashArray = Array.from(new Uint8Array(hashBuffer));
		const hashHex = hashArray
			.map((b) => b.toString(16).padStart(2, '0'))
			.join('');
		return hashHex;
	}

	// Fallback for older Node environments if needed (though we use Bun)
	// In Bun/Modern Node, crypto.subtle is available.
	// If not, we might need 'crypto' module import, but that breaks browser compatibility without polyfill.
	// Assuming Bun environment for this project.
	throw new Error('Crypto API not available');
}
