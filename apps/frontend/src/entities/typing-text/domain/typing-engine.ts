/**
 * Calculates the new typed string after a Backspace event.
 */
export function calculateBackspace(
	current: string,
	confirmedIndex: number,
	isCtrlKey: boolean,
): string {
	if (current.length <= confirmedIndex) return current;

	if (isCtrlKey) {
		const textAfterConfirmed = current.slice(confirmedIndex);
		const trimmed = textAfterConfirmed.trimEnd();
		const diff = textAfterConfirmed.length - trimmed.length;

		// If end of word or middle
		if (diff === 0) {
			const lastSpace = trimmed.lastIndexOf(' ');
			if (lastSpace === -1) {
				return current.slice(0, confirmedIndex);
			}
			return current.slice(0, confirmedIndex + lastSpace + 1);
		}

		// Trailing spaces: delete spaces AND previous word
		const content = trimmed;
		const lastSpace = content.lastIndexOf(' ');
		if (lastSpace === -1) {
			return current.slice(0, confirmedIndex);
		}
		return current.slice(0, confirmedIndex + lastSpace + 1);
	}

	return current.slice(0, -1);
}

/**
 * Validates and appends a new character to the typed string.
 */
export function appendCharacter(current: string, char: string): string {
	if (char === ' ') {
		// Prevent space if at start
		if (current.length === 0) return current;
		// Prevent double spaces
		if (current.endsWith(' ')) return current;
	}

	return current + char;
}

/**
 * Checks if the current word is completed correctly and returns the new confirmed index.
 * Returns null if the word is not completed or incorrect.
 */
export function checkWordCompletion(
	typed: string,
	targetText: string,
): number | null {
	// We only check on space
	if (!typed.endsWith(' ')) return null;

	// Calculate which word index we are on based on spaces in 'typed'
	// 'typed' has just been updated with a space at the end.
	// So "word " has 1 space -> word index 0.
	// "word1 word2 " has 2 spaces -> word index 1.

	// The space count in 'typed' includes the one just typed.
	const spaceCount = (typed.match(/ /g) || []).length;
	const wordIndex = spaceCount - 1; // 0-based index of the word just finished

	const targetWords = targetText.split(' ');

	if (wordIndex < targetWords.length) {
		const targetWord = targetWords[wordIndex];

		// We need to extract the LAST typed word to check correctness.
		// `typed` contains everything.
		// If we split by space, we get all words.
		// The last one is empty because `typed` ends with space.
		// The one before that is the word we just finished.

		const userWords = typed.split(' ');
		// userWords = ["word1", "word2", ""]
		const lastTypedWord = userWords[wordIndex];

		if (lastTypedWord === targetWord) {
			return typed.length;
		}
	}

	return null;
}

/**
 * Calculates the visual cursor index based on target text and user input.
 * Handles skipping incomplete words (jumps).
 */
export function calculateCursorIndex(
	targetText: string,
	userTyped: string,
): number {
	const targetWords = targetText.split(' ');
	const userWords = userTyped.split(' ');
	const activeWordIndex = userWords.length - 1;
	const activeWordChars = userWords[activeWordIndex]?.length ?? 0;

	let calculatedIndex = 0;
	// Iterate over previous words to calculate their visual length
	for (let i = 0; i < activeWordIndex; i++) {
		if (i >= targetWords.length) break;

		const targetWord = targetWords[i];
		// Safety check if targetWord is undefined (though logic shouldn't reach here if loop is correct)
		if (typeof targetWord === 'undefined') break;

		const userWord = userWords[i] || '';

		// The visual length of a word is determined by the max length
		// between target and user input (to account for extra chars)
		const maxLength = Math.max(targetWord.length, userWord.length);
		calculatedIndex += maxLength;

		// Add space if it exists in layout
		if (i < targetWords.length - 1) {
			calculatedIndex++;
		}
	}

	// Add progress in current word
	calculatedIndex += activeWordChars;

	return calculatedIndex;
}
