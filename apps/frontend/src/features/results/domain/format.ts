export function formatWPM(wpm: number): string {
	return Math.round(wpm).toString();
}

export function formatAccuracy(accuracy: number): string {
	return `${accuracy}%`;
}

export function formatConsistency(consistency: number): string {
	return `${consistency}%`;
}
