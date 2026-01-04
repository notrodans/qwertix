/**
 * Calculates the number of remaining words based on the target text and valid length.
 */
export function calculateRemainingWords(
	text: string,
	validLength: number,
): number {
	if (!text) return 0;
	if (validLength >= text.length) return 0;

	const remainingText = text.slice(validLength);
	// We want to count how many words are left.
	// If we are in the middle of a word, that word counts as 1.
	// If we are at a space, the next word counts as 1.
	// Simply splitting by space works for standard text.
	// "hello world" -> "o world" -> ["o", "world"] -> 2
	// "hello world" -> " world" -> ["", "world"] -> 2 (because split(' ') on " " gives ["", ""])
	// Wait, ' world'.split(' ') -> ['', 'world']. Length 2.
	// 'world'.split(' ') -> ['world']. Length 1.
	
	// We should trim the start to handle the space after a finished word?
	// If validLength includes the space after "hello ", remaining is "world".
	// If validLength is just "hello", remaining is " world".
	
	// If we are at "hello", validLength=5. Remaining=" world". Words=2. Correct (we haven't typed space yet).
	// If we are at "hello ", validLength=6. Remaining="world". Words=1. Correct.
	
	return remainingText.split(' ').length;
}

/**
 * Formats time in seconds into a human-readable string or just returns the number.
 * Can be extended for more complex formatting.
 */
export function formatTimeLeft(seconds: number | null): string | null {
	if (seconds === null) return null;
	return `${seconds}s`;
}
