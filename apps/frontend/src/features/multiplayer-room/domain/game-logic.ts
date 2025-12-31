/**
 * Calculates the number of remaining words based on the target text and user input.
 */
export function calculateRemainingWords(text: string, userTyped: string): number {
	if (!text) return 0;
	const targetCount = text.split(' ').length;
	const typedCount = userTyped.split(' ').length;
	return Math.max(0, targetCount - typedCount + 1);
}

/**
 * Formats time in seconds into a human-readable string or just returns the number.
 * Can be extended for more complex formatting.
 */
export function formatTimeLeft(seconds: number | null): string | null {
	if (seconds === null) return null;
	return `${seconds}s`;
}
