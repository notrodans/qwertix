/**
 * Checks if the solo session should finish in WORDS mode.
 */
export function isSoloWordsModeFinished(typed: string, targetText: string): boolean {
	return typed.length === targetText.length && targetText.length > 0;
}

/**
 * Calculates the current progress percentage for solo mode.
 */
export function calculateSoloProgress(typedLength: number, totalLength: number): number {
	if (totalLength === 0) return 0;
	return Math.min(100, Math.round((typedLength / totalLength) * 100));
}
