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
 * Handles offsets caused by extra characters by comparing word-by-word.
 * @param typedText - The text typed by the user.
 * @param targetText - The target text to match.
 * @returns The accuracy as a percentage (0-100).
 */
export function calculateAccuracy(
	typedText: string,
	targetText: string,
): number {
	if (typedText.length === 0) return 100;

	const typedWords = typedText.split(' ');
	const targetWords = targetText.split(' ');
	let correct = 0;

	let targetIdx = 0;
	for (let typedIdx = 0; typedIdx < typedWords.length; typedIdx++) {
		const typedWord = typedWords[typedIdx]!;

		// If user typed an extra space, it will result in an empty word.
		// We skip it to keep alignment with targetWords, but it's still an error
		// because 'correct' won't be incremented, while typedText.length is the denominator.
		if (typedWord === '' && targetIdx < targetWords.length) {
			continue;
		}

		if (targetIdx >= targetWords.length) break;

		const targetWord = targetWords[targetIdx]!;

		const charLimit = Math.min(typedWord.length, targetWord.length);
		for (let j = 0; j < charLimit; j++) {
			if (typedWord[j] === targetWord[j]) {
				correct++;
			}
		}

		// Count correct space between words
		// We count a space if there's another word in target AND another word was typed
		if (
			targetIdx < targetWords.length - 1 &&
			typedIdx < typedWords.length - 1
		) {
			// Check if the NEXT typed thing wasn't just another space
			// This is simplified: we assume if we are moving to next target word, a space was consumed.
			correct++;
		}

		targetIdx++;
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
	let text = '';

	for (const event of replayData) {
		const { key, ctrlKey, confirmedIndex = 0 } = event;

		// 1. Handle regular character input
		if (key.length === 1) {
			text += key;
			continue;
		}

		// 2. Handle Backspace deletion
		if (key === 'Backspace' && text.length > confirmedIndex) {
			if (ctrlKey) {
				// Handle Ctrl+Backspace (delete word)
				// Slice text after the confirmed boundary and trim trailing whitespace
				const deletablePart = text.slice(confirmedIndex).trimEnd();
				const lastSpaceIndex = deletablePart.lastIndexOf(' ');

				if (lastSpaceIndex === -1) {
					// No space found: delete everything back to the boundary
					text = text.slice(0, confirmedIndex);
				} else {
					// Space found: delete until the last space (keeping the space itself)
					text = text.slice(0, confirmedIndex + lastSpaceIndex + 1);
				}
			} else {
				// Handle regular Backspace (delete single character)
				text = text.slice(0, -1);
			}
		}
	}

	return text;
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
 * @param afkDuration - Time spent AFK in milliseconds.
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
	afkDuration: number,
	targetText: string,
	salt: string,
): Promise<string> {
	const data = `${wpm}-${raw}-${accuracy}-${consistency}-${startTime}-${endTime}-${afkDuration}-${targetText.length}-${salt}`;
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

	// Non-secure context fallback (for development/testing)
	console.warn(
		'Crypto API not available, using fallback hash. This is insecure for production.',
	);
	let hash = 0;
	for (let i = 0; i < data.length; i++) {
		const char = data.charCodeAt(i);
		hash = (hash << 5) - hash + char;
		hash |= 0; // Convert to 32bit integer
	}
	return `fallback-${Math.abs(hash).toString(16)}`;
}
